/**
 * useFormDensity — Touch target density hook for form inputs
 * PH4.11 §Step 6 | PH4B.8 §4b.8.5 | Blueprint §1d
 *
 * Delegates to the canonical useDensity() hook from theme/useDensity.ts
 * (replacing the previous useAdaptiveDensity from DataTable).
 *
 * Maps density tiers to input minimum heights:
 *  - touch:       56px (WCAG 2.5.8 Target Size)
 *  - comfortable: 36px (default desktop)
 *  - compact:     28px (dense desktop)
 */
import { useDensity } from '../../theme/useDensity.js';
import { DENSITY_BREAKPOINTS, type DensityTier } from '../../theme/density.js';

const INPUT_MIN_HEIGHT: Record<DensityTier, number> = {
  touch: DENSITY_BREAKPOINTS.touch,
  comfortable: 36,
  compact: 28,
};

export interface UseFormDensityReturn {
  tier: DensityTier;
  inputMinHeight: number;
}

export function useFormDensity(): UseFormDensityReturn {
  const { tier } = useDensity();
  return {
    tier,
    inputMinHeight: INPUT_MIN_HEIGHT[tier],
  };
}
