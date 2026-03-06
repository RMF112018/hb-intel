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
import { useFieldMode } from '../HbcAppShell/hooks/useFieldMode.js';

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
  const { mode } = useFieldMode();

  const [tier, setTier] = useState<DensityTier>(() => {
    const override = getDensityOverride();
    if (override) return override;
    // PH4B.10 §13 (4b.10.4): Field mode defaults to comfortable density
    if (mode === 'field') return 'comfortable';
    return detectDensityTier();
  });

  // Sync tier when mode changes (field → comfortable, office → auto-detect)
  useEffect(() => {
    if (getDensityOverride() !== null) return; // respect user override
    if (mode === 'field') {
      setTier('comfortable');
    } else {
      setTier(detectDensityTier());
    }
  }, [mode]);

  // Listen for pointer capability changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(pointer: coarse)');
    const handler = () => {
      // Only auto-update when no manual override is set and in office mode
      if (getDensityOverride() === null && mode === 'office') {
        setTier(detectDensityTier());
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

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
