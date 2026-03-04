/**
 * useFormDensity — Touch target density hook for form inputs
 * PH4.11 §Step 6 | Blueprint §1d
 *
 * Wraps useAdaptiveDensity to provide inputMinHeight per tier:
 *  - touch:    56px (matches WCAG 2.5.8 Target Size)
 *  - standard: 36px
 *  - compact:  28px
 */
import { useAdaptiveDensity } from '../../HbcDataTable/hooks/useAdaptiveDensity.js';
import type { DensityTier } from '../../HbcCommandBar/types.js';

const INPUT_MIN_HEIGHT: Record<DensityTier, number> = {
  touch: 56,
  standard: 36,
  compact: 28,
};

export interface UseFormDensityReturn {
  tier: DensityTier;
  inputMinHeight: number;
}

export function useFormDensity(): UseFormDensityReturn {
  const { tier } = useAdaptiveDensity();
  return {
    tier,
    inputMinHeight: INPUT_MIN_HEIGHT[tier],
  };
}
