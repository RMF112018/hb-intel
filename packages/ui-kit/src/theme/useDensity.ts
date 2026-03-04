/**
 * useDensity — Density tier hook
 * PH4.16 §Step 6 | Blueprint §1d
 *
 * Provides reactive density tier detection with localStorage override support.
 * Auto-detects based on pointer: coarse media query.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  type DensityTier,
  detectDensityTier,
  getDensityOverride,
  persistDensityOverride,
  clearDensityOverride as clearStorage,
} from './density.js';

export interface UseDensityReturn {
  /** Current active density tier */
  tier: DensityTier;
  /** Set a manual density override (persisted to localStorage) */
  setOverride: (tier: DensityTier) => void;
  /** Clear override and revert to auto-detection */
  clearOverride: () => void;
}

/**
 * React hook for responsive density tier management.
 *
 * Automatically detects device input type (`pointer: coarse` → touch,
 * `pointer: fine` → compact) and respects user overrides via localStorage.
 */
export function useDensity(): UseDensityReturn {
  const [tier, setTier] = useState<DensityTier>(() => {
    return getDensityOverride() ?? detectDensityTier();
  });

  // Listen for pointer capability changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(pointer: coarse)');
    const handler = () => {
      // Only auto-update when no manual override is set
      if (getDensityOverride() === null) {
        setTier(detectDensityTier());
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setOverride = useCallback((newTier: DensityTier) => {
    persistDensityOverride(newTier);
    setTier(newTier);
  }, []);

  const clearOverride = useCallback(() => {
    clearStorage();
    setTier(detectDensityTier());
  }, []);

  return { tier, setOverride, clearOverride };
}
