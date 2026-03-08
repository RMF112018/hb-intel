# SF03-T02 — TypeScript Contracts

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 (storage key), D-02 (role map type), D-06 (lock fields), D-07 (showCoaching), D-08 (complexityMinTier props)
**Estimated Effort:** 0.25 sprint-weeks
**Depends On:** T01

---

## Objective

Define and export every TypeScript interface, type, and constant that the package and all consumers depend on. No runtime logic — only the contract layer.

---

## 3-Line Plan

1. Write `IComplexity.ts` — all context, prop, and tier types including lock and coaching fields.
2. Write `IComplexityPreference.ts` — the API payload shape and storage schema.
3. Write role map config type in preparation for T06 implementation.

---

## `src/types/IComplexity.ts`

```typescript
// ─────────────────────────────────────────────────────────────────────────────
// Core tier type
// ─────────────────────────────────────────────────────────────────────────────

export type ComplexityTier = 'essential' | 'standard' | 'expert';

/** Ordered array for tier comparison — index = rank */
export const TIER_ORDER: ComplexityTier[] = ['essential', 'standard', 'expert'];

/**
 * Returns the numeric rank of a tier (essential=0, standard=1, expert=2).
 * Used by atLeast() and is() helpers.
 */
export function tierRank(tier: ComplexityTier): number {
  return TIER_ORDER.indexOf(tier);
}

// ─────────────────────────────────────────────────────────────────────────────
// Lock types (D-06)
// ─────────────────────────────────────────────────────────────────────────────

export type ComplexityLockSource = 'admin' | 'onboarding';

// ─────────────────────────────────────────────────────────────────────────────
// Full context shape — returned by useComplexity()
// ─────────────────────────────────────────────────────────────────────────────

export interface IComplexityContext {
  /** Current active tier for this user */
  tier: ComplexityTier;

  /**
   * Whether coaching prompts should be shown (D-07).
   * Independent of tier — user may enable on Standard, disable on Essential.
   * Defaults true when initial tier is Essential; false otherwise.
   */
  showCoaching: boolean;

  /**
   * Lock source if the tier is currently locked by admin or onboarding (D-06).
   * Undefined when not locked.
   */
  lockedBy: ComplexityLockSource | undefined;

  /**
   * ISO 8601 expiry for the current lock (D-06).
   * Undefined for permanent locks (lockedBy set, lockedUntil absent).
   */
  lockedUntil: string | undefined;

  /**
   * True when the tier is currently locked (lockedBy is set and lock has not expired).
   * Computed from lockedBy + lockedUntil; provided as a convenience.
   */
  isLocked: boolean;

  /**
   * Returns true when the current tier is at or above the threshold.
   * atLeast('standard') → true for standard and expert, false for essential.
   *
   * @example
   * const showAuditTrail = atLeast('expert');
   */
  atLeast: (threshold: ComplexityTier) => boolean;

  /**
   * Returns true when the current tier exactly matches.
   *
   * @example
   * const showOnboarding = is('essential');
   */
  is: (tier: ComplexityTier) => boolean;

  /**
   * Updates the user's tier. Persists to storage + PATCH /api/users/me/preferences.
   * No-op when isLocked is true.
   */
  setTier: (tier: ComplexityTier) => void;

  /**
   * Updates the showCoaching preference independently of tier (D-07).
   * Persists to storage + PATCH /api/users/me/preferences.
   */
  setShowCoaching: (show: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default context value (used when no provider is present — warns in dev)
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_COMPLEXITY_CONTEXT: IComplexityContext = {
  tier: 'standard',
  showCoaching: false,
  lockedBy: undefined,
  lockedUntil: undefined,
  isLocked: false,
  atLeast: (threshold) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[complexity] useComplexity() called outside of ComplexityProvider. Using default "standard" tier.');
    }
    return tierRank('standard') >= tierRank(threshold);
  },
  is: (tier) => tier === 'standard',
  setTier: () => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[complexity] setTier() called outside of ComplexityProvider — no-op.');
    }
  },
  setShowCoaching: () => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[complexity] setShowCoaching() called outside of ComplexityProvider — no-op.');
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Gate props — used by HbcComplexityGate and useComplexityGate (D-04)
// ─────────────────────────────────────────────────────────────────────────────

export interface IComplexityGateCondition {
  /**
   * Minimum tier required (inclusive). Content renders when tier >= minTier.
   * When absent, no lower bound.
   */
  minTier?: ComplexityTier;
  /**
   * Maximum tier allowed (inclusive). Content renders when tier <= maxTier.
   * When absent, no upper bound.
   * Use maxTier="standard" to show coaching prompts only up to Standard.
   */
  maxTier?: ComplexityTier;
}

// ─────────────────────────────────────────────────────────────────────────────
// Complexity-aware component props — added to @hbc/ui-kit components (D-08)
// ─────────────────────────────────────────────────────────────────────────────

export interface IComplexityAwareProps {
  /**
   * Minimum complexity tier at which this component renders (D-08).
   * When absent, component uses its own internal default.
   * Consuming modules pass this to override the component's default gate.
   *
   * @example — Override component's default Expert gate to show at Standard
   * <HbcAuditTrailPanel complexityMinTier="standard" />
   */
  complexityMinTier?: ComplexityTier;

  /**
   * Maximum complexity tier at which this component renders (D-08).
   * When absent, component uses its own internal default (usually no upper bound).
   */
  complexityMaxTier?: ComplexityTier;
}

// ─────────────────────────────────────────────────────────────────────────────
// Role complexity map type (D-02)
// ─────────────────────────────────────────────────────────────────────────────

export interface IRoleComplexityMapEntry {
  /** Azure AD group display name or security group ID */
  adGroup: string;
  /** Initial tier assigned to members of this group on first login */
  initialTier: ComplexityTier;
  /** Human-readable description of the group for maintainers */
  description: string;
}

export interface IRoleComplexityConfig {
  /** Ordered list of group mappings — first match wins */
  mappings: IRoleComplexityMapEntry[];
  /** Tier assigned when no AD group matches */
  fallbackTier: ComplexityTier;
}
```

---

## `src/types/IComplexityPreference.ts`

```typescript
import type { ComplexityTier, ComplexityLockSource } from './IComplexity';

/**
 * Shape of the complexity preference stored in the API and in client storage (D-01, D-06, D-07).
 *
 * Storage key: "hbc::complexity::v1"
 * API endpoint: GET/PATCH /api/users/me/preferences (complexity fields only)
 */
export interface IComplexityPreference {
  tier: ComplexityTier;

  /** Independent coaching toggle (D-07) */
  showCoaching: boolean;

  /**
   * Set by admin or onboarding system to lock the user's tier (D-06).
   * When present, HbcComplexityDial renders as disabled.
   */
  lockedBy?: ComplexityLockSource;

  /**
   * ISO 8601 expiry date for the lock (D-06).
   * When absent and lockedBy is set, lock is permanent until admin clears it.
   * When Date.now() > new Date(lockedUntil), lock is treated as expired and cleared.
   */
  lockedUntil?: string;
}

/**
 * Versioned storage key for the client-side preference cache (D-01).
 * Versioned to allow future migrations without stale-cache collision.
 */
export const COMPLEXITY_STORAGE_KEY = 'hbc::complexity::v1' as const;

/**
 * Default preference applied optimistically on first load with no cache (D-03).
 * Always Essential — tier upgrades additively when role-derived value arrives.
 */
export const COMPLEXITY_OPTIMISTIC_DEFAULT: IComplexityPreference = {
  tier: 'essential',
  showCoaching: true,
  lockedBy: undefined,
  lockedUntil: undefined,
};

/**
 * Returns true if the preference has an active (non-expired) lock (D-06).
 */
export function isPreferenceLocked(pref: IComplexityPreference): boolean {
  if (!pref.lockedBy) return false;
  if (!pref.lockedUntil) return true; // permanent lock
  return new Date(pref.lockedUntil) > new Date();
}
```

---

## Verification Commands

```bash
# Typecheck with zero errors
pnpm --filter @hbc/complexity typecheck

# Confirm TIER_ORDER export
node -e "
  import('@hbc/complexity').then(m => {
    console.log('TIER_ORDER:', m.TIER_ORDER);
    console.log('tierRank essential:', m.tierRank('essential'));
    console.log('tierRank expert:', m.tierRank('expert'));
    console.log('COMPLEXITY_STORAGE_KEY:', m.COMPLEXITY_STORAGE_KEY);
  });
"
# Expected: TIER_ORDER: ['essential','standard','expert'], ranks: 0, 2
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF03-T02 completed: 2026-03-08
- IComplexity.ts: ComplexityTier, TIER_ORDER, tierRank(), ComplexityLockSource, IComplexityContext,
  DEFAULT_COMPLEXITY_CONTEXT, IComplexityGateCondition, IComplexityAwareProps,
  IRoleComplexityMapEntry, IRoleComplexityConfig
- IComplexityPreference.ts: IComplexityPreference, COMPLEXITY_STORAGE_KEY,
  COMPLEXITY_OPTIMISTIC_DEFAULT, isPreferenceLocked()
- Existing barrel re-exports pick up all new named exports automatically
- Typecheck: zero errors
- Build: zero errors
- Tests: still pass (no test changes in T02)
Next: SF03-T03 (Context and Provider)
-->
