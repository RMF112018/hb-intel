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
