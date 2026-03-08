# SF03-T03 — Context & Provider

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 (storage), D-02 (role map), D-03 (optimistic Essential), D-05 (StorageEvent), D-06 (lock), D-07 (showCoaching)
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01, T02, T06 (storage utilities — implement T06 concurrently or stub first)

---

## Objective

Implement the React context and provider that is the heart of `@hbc/complexity`. The provider manages the full hydration lifecycle: synchronous cache read → optimistic render → background API sync → role derivation for new users → lock enforcement → cross-tab StorageEvent handling.

---

## 3-Line Plan

1. Create `ComplexityContext.ts` with `React.createContext` using the default context value from T02.
2. Implement `ComplexityProvider.tsx` with the full hydration flow, API sync, lock checking, and StorageEvent listener.
3. Verify: provider renders children at Essential on cold start, upgrades to role-derived tier after API response, syncs across tabs.

---

## `src/context/ComplexityContext.ts`

```typescript
import { createContext } from 'react';
import { DEFAULT_COMPLEXITY_CONTEXT, type IComplexityContext } from '../types/IComplexity';

/**
 * The platform-wide complexity context.
 *
 * Consumed via useComplexity() hook — never import this directly in components.
 * The default value (Standard tier, no coaching, no lock) is used when a
 * component is rendered outside of ComplexityProvider — a dev-mode warning fires.
 */
export const ComplexityContext = createContext<IComplexityContext>(
  DEFAULT_COMPLEXITY_CONTEXT
);

ComplexityContext.displayName = 'ComplexityContext';
```

---

## `src/context/ComplexityProvider.tsx`

```typescript
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ComplexityContext } from './ComplexityContext';
import type { ComplexityTier, IComplexityContext } from '../types/IComplexity';
import { tierRank } from '../types/IComplexity';
import type { IComplexityPreference } from '../types/IComplexityPreference';
import {
  COMPLEXITY_OPTIMISTIC_DEFAULT,
  isPreferenceLocked,
} from '../types/IComplexityPreference';
import {
  readPreference,
  writePreference,
  getStorage,
} from '../storage';
import {
  fetchPreference,
  patchPreference,
  deriveInitialTierFromADGroups,
} from '../storage/complexityApiClient';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface ComplexityProviderProps {
  children: React.ReactNode;
  /**
   * Pass the SPFx application customizer context to signal SPFx runtime (D-01).
   * When present, provider uses sessionStorage fallback and skips StorageEvent.
   */
  spfxContext?: { pageContext: { user: { loginName: string } } };
  /**
   * Test override — skips API calls and StorageEvent entirely.
   * Used by ComplexityTestProvider (D-10). Never pass in production code.
   * @internal
   */
  _testPreference?: IComplexityPreference;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function ComplexityProvider({
  children,
  spfxContext,
  _testPreference,
}: ComplexityProviderProps): React.ReactElement {
  const isSpfx = !!spfxContext;

  // ── Step 1: Synchronous cache read (D-01, D-03) ────────────────────────
  // Read from storage immediately — zero flash for returning users.
  // Brand-new users get COMPLEXITY_OPTIMISTIC_DEFAULT (Essential).
  const [preference, setPreferenceState] = useState<IComplexityPreference>(() => {
    if (_testPreference) return _testPreference;
    return readPreference(isSpfx) ?? COMPLEXITY_OPTIMISTIC_DEFAULT;
  });

  // ── Step 2: Background API sync (D-01, D-02, D-03) ────────────────────
  useEffect(() => {
    if (_testPreference) return; // Test mode — skip all API calls

    let cancelled = false;

    async function syncFromApi(): Promise<void> {
      try {
        const serverPref = await fetchPreference();

        if (cancelled) return;

        if (serverPref) {
          // Returning user — server preference is authoritative
          // Check lock expiry and clear if expired (D-06)
          const resolvedPref = resolveExpiredLock(serverPref);
          writePreference(resolvedPref, isSpfx);
          setPreferenceState(resolvedPref);
        } else {
          // New user — derive tier from Azure AD groups (D-02)
          const derivedTier = await deriveInitialTierFromADGroups();
          if (cancelled) return;

          const newPref: IComplexityPreference = {
            tier: derivedTier,
            // D-07: showCoaching defaults true for Essential, false otherwise
            showCoaching: derivedTier === 'essential',
          };

          // D-03: Only upgrade — never downgrade from optimistic Essential
          // (derivedTier is always >= 'essential' by definition, but guard explicitly)
          const currentRank = tierRank(preference.tier);
          const derivedRank = tierRank(derivedTier);
          const resolvedPref = derivedRank >= currentRank ? newPref : preference;

          await patchPreference(resolvedPref);
          writePreference(resolvedPref, isSpfx);
          setPreferenceState(resolvedPref);
        }
      } catch (err) {
        // Silent degradation — cached/optimistic value remains active
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[complexity] Failed to sync preference from API:', err);
        }
      }
    }

    void syncFromApi();
    return () => { cancelled = true; };
  }, []); // Runs once on mount — intentional

  // ── Step 3: StorageEvent cross-tab sync (D-05) ─────────────────────────
  // localStorage fires 'storage' events in all OTHER tabs automatically.
  // Skip in SPFx — sessionStorage does not fire cross-tab events, and
  // the Application Customizer React tree handles propagation internally.
  useEffect(() => {
    if (isSpfx || _testPreference) return;

    function handleStorageEvent(event: StorageEvent): void {
      if (event.key !== 'hbc::complexity::v1') return;
      if (!event.newValue) return;

      try {
        const updated = JSON.parse(event.newValue) as IComplexityPreference;
        setPreferenceState(resolveExpiredLock(updated));
      } catch {
        // Corrupted storage value — ignore
      }
    }

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [isSpfx, _testPreference]);

  // ── Step 4: Lock expiry polling (D-06) ────────────────────────────────
  // Poll every 60 seconds to auto-clear expired locks without requiring a
  // page reload. Acceptable polling frequency for an infrequent feature.
  useEffect(() => {
    if (!preference.lockedUntil || _testPreference) return;

    const interval = setInterval(() => {
      const resolved = resolveExpiredLock(preference);
      if (resolved.lockedBy !== preference.lockedBy) {
        // Lock expired — update storage and context
        writePreference(resolved, isSpfx);
        setPreferenceState(resolved);
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [preference.lockedUntil, preference.lockedBy, isSpfx, _testPreference]);

  // ── Context actions ────────────────────────────────────────────────────

  const setTier = useCallback((tier: ComplexityTier) => {
    if (isPreferenceLocked(preference)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[complexity] setTier("${tier}") ignored — tier is locked by ${preference.lockedBy}.`);
      }
      return;
    }

    // D-07: Auto-set showCoaching false when upgrading from Essential
    const upgradingFromEssential =
      preference.tier === 'essential' && tier !== 'essential';

    const updated: IComplexityPreference = {
      ...preference,
      tier,
      showCoaching: upgradingFromEssential ? false : preference.showCoaching,
    };

    writePreference(updated, isSpfx);
    setPreferenceState(updated);
    void patchPreference(updated); // Fire-and-forget — storage is already updated
  }, [preference, isSpfx]);

  const setShowCoaching = useCallback((show: boolean) => {
    const updated: IComplexityPreference = { ...preference, showCoaching: show };
    writePreference(updated, isSpfx);
    setPreferenceState(updated);
    void patchPreference(updated);
  }, [preference, isSpfx]);

  // ── Computed context value ─────────────────────────────────────────────

  const contextValue = useMemo<IComplexityContext>(() => {
    const locked = isPreferenceLocked(preference);
    return {
      tier: preference.tier,
      showCoaching: preference.showCoaching,
      lockedBy: preference.lockedBy,
      lockedUntil: preference.lockedUntil,
      isLocked: locked,
      atLeast: (threshold) => tierRank(preference.tier) >= tierRank(threshold),
      is: (tier) => preference.tier === tier,
      setTier,
      setShowCoaching,
    };
  }, [preference, setTier, setShowCoaching]);

  return (
    <ComplexityContext.Provider value={contextValue}>
      {children}
    </ComplexityContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: expired lock resolution (D-06)
// ─────────────────────────────────────────────────────────────────────────────

function resolveExpiredLock(pref: IComplexityPreference): IComplexityPreference {
  if (!pref.lockedBy || !pref.lockedUntil) return pref;
  if (new Date(pref.lockedUntil) > new Date()) return pref; // Still locked

  // Lock expired — clear lock fields
  const { lockedBy: _lb, lockedUntil: _lu, ...rest } = pref;
  return rest;
}
```

---

## PWA App Root Integration

```typescript
// apps/pwa/src/App.tsx
import { ComplexityProvider } from '@hbc/complexity';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';

export function App(): React.ReactElement {
  return (
    <ComplexityProvider>
      <RouterProvider router={router} />
    </ComplexityProvider>
  );
}
```

---

## SPFx Application Customizer Integration

```typescript
// apps/spfx/src/extensions/hbcAppCustomizer/HbcAppCustomizerApplicationCustomizer.ts
import { ComplexityProvider } from '@hbc/complexity';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export default class HbcAppCustomizerApplicationCustomizer
  extends BaseApplicationCustomizer<IHbcAppCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;

  public onInit(): Promise<void> {
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceholders);
    return Promise.resolve();
  }

  private _renderPlaceholders(): void {
    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Top
      );
    }
    if (!this._topPlaceholder?.domElement) return;

    ReactDOM.render(
      React.createElement(
        ComplexityProvider,
        { spfxContext: this.context }, // D-01: signals sessionStorage fallback
        React.createElement(AppShell, null)
      ),
      this._topPlaceholder.domElement
    );
  }
}
```

---

## Hydration Sequence Diagram

```
User opens PWA (returning user)
├── ComplexityProvider mounts
├── readPreference(isSpfx=false) → localStorage hit → { tier: 'expert', showCoaching: false }
├── useState initializes to cached value
├── Children render immediately at 'expert' tier (zero flash ✓)
└── Background: fetchPreference() → server returns same value → no-op

User opens PWA (brand-new user, no cache)
├── ComplexityProvider mounts
├── readPreference() → localStorage miss → COMPLEXITY_OPTIMISTIC_DEFAULT = { tier: 'essential', showCoaching: true }
├── useState initializes to Essential
├── Children render at 'essential' (D-03 optimistic ✓)
└── Background: fetchPreference() → 404 (new user)
    └── deriveInitialTierFromADGroups() → user is in HBC-Director → 'expert'
        ├── D-03: tierRank('expert') >= tierRank('essential') → upgrade ✓
        ├── newPref = { tier: 'expert', showCoaching: false }
        ├── patchPreference(newPref) → PATCH /api/users/me/preferences
        ├── writePreference(newPref) → localStorage updated
        └── setPreferenceState(newPref) → React re-render at 'expert' (~300ms later)
```

---

## Verification Commands

```bash
# 1. Typecheck
pnpm --filter @hbc/complexity typecheck

# 2. Provider unit tests (written in T08)
pnpm --filter @hbc/complexity test -- ComplexityProvider

# 3. Verify context default fires dev-mode warning
node -e "
  // Simulate useComplexity outside provider
  import('@hbc/complexity').then(m => {
    m.DEFAULT_COMPLEXITY_CONTEXT.atLeast('expert');
    // Expected: console.warn about missing provider
  });
"
```
