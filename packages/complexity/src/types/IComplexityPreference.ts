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
