/**
 * density.ts — Density tier detection & persistence
 * PH4.16 §Step 6 | Blueprint §1d
 *
 * Provides automatic density detection based on input device
 * and localStorage persistence for user overrides.
 */

/** Available density tiers for UI spacing and sizing */
export type DensityTier = 'compact' | 'comfortable' | 'touch';

/** Row height (px) per density tier */
export const DENSITY_BREAKPOINTS: Record<DensityTier, number> = {
  compact: 32,
  comfortable: 40,
  touch: 56,
} as const;

const DENSITY_STORAGE_KEY = 'hbc-density-override';

/**
 * Detect the appropriate density tier from the device's input capabilities.
 * - `pointer: coarse` (touch) → 'touch'
 * - `pointer: fine` (mouse) → 'compact'
 * - Fallback → 'comfortable'
 */
export function detectDensityTier(): DensityTier {
  if (typeof window === 'undefined') return 'comfortable';

  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const isFine = window.matchMedia('(pointer: fine)').matches;

  if (isCoarse && !isFine) return 'touch';
  if (isFine) return 'compact';
  return 'comfortable';
}

/** Persist a user-selected density override to localStorage. */
export function persistDensityOverride(tier: DensityTier): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DENSITY_STORAGE_KEY, tier);
}

/** Retrieve a previously persisted density override, or null if none set. */
export function getDensityOverride(): DensityTier | null {
  if (typeof localStorage === 'undefined') return null;
  const stored = localStorage.getItem(DENSITY_STORAGE_KEY);
  if (stored === 'compact' || stored === 'comfortable' || stored === 'touch') {
    return stored;
  }
  return null;
}

/** Clear any persisted density override (revert to auto-detection). */
export function clearDensityOverride(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(DENSITY_STORAGE_KEY);
}
