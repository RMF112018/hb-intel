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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      is: (t) => preference.tier === t,
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
