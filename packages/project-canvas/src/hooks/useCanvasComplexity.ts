/**
 * Phase 3 Stage 5.3 — Canvas complexity tier bridge.
 *
 * Normalizes a complexity tier value for canvas tile variant selection.
 * The caller provides the tier (typically from `useComplexity()` in
 * `@hbc/complexity`); this hook normalizes and provides convenience flags.
 *
 * Governing: P3-C3 (Adaptive composition)
 */

import { useMemo } from 'react';
import type { ComplexityTier } from '../types/index.js';

export interface CanvasComplexityResult {
  /** The active complexity tier (normalized) */
  tier: ComplexityTier;
  /** True when tier is 'essential' (coaching-heavy, simplified) */
  isEssential: boolean;
  /** True when tier is 'expert' (full features, dense) */
  isExpert: boolean;
}

/**
 * Normalize a complexity tier for canvas rendering.
 *
 * Accepts a tier string from any source (e.g., `useComplexity().tier`)
 * and returns a normalized canvas-compatible result. Falls back to
 * 'standard' for unknown values.
 *
 * @param tier - The raw tier value from complexity context
 *
 * @example
 * const { tier: rawTier } = useComplexity();
 * const { tier, isEssential } = useCanvasComplexity(rawTier);
 * <HbcProjectCanvas complexityTier={tier} ... />
 */
export function useCanvasComplexity(tier?: string): CanvasComplexityResult {
  return useMemo(() => {
    const normalizedTier: ComplexityTier =
      tier === 'essential' || tier === 'standard' || tier === 'expert'
        ? tier
        : 'standard';

    return {
      tier: normalizedTier,
      isEssential: normalizedTier === 'essential',
      isExpert: normalizedTier === 'expert',
    };
  }, [tier]);
}
