/**
 * useAdaptiveDensity — Adaptive density tier detection for HbcDataTable
 * PH4.7 §7.1 | Blueprint §1d
 *
 * Tiers:
 *  - touch:    pointer: coarse + width < 1024 → 64px row, 16px font, 56px target
 *  - compact:  pointer: fine + width >= 1440  → 36px row, 13px font, 36px target
 *  - standard: else                           → 48px row, 14px font, 44px target
 *
 * Re-evaluates on resize and orientation change.
 * localStorage persistence key: `hbc-density-{toolId}`
 * Manual override takes precedence when set.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { DensityTier } from '../../HbcCommandBar/types.js';

export interface DensityConfig {
  rowHeight: number;
  fontSize: string;
  cellPaddingY: string;
  cellPaddingX: string;
  targetSize: number;
}

export const DENSITY_CONFIGS: Record<DensityTier, DensityConfig> = {
  touch: {
    rowHeight: 64,
    fontSize: '1rem',
    cellPaddingY: '16px',
    cellPaddingX: '16px',
    targetSize: 56,
  },
  standard: {
    rowHeight: 48,
    fontSize: '0.875rem',
    cellPaddingY: '8px',
    cellPaddingX: '12px',
    targetSize: 44,
  },
  compact: {
    rowHeight: 36,
    fontSize: '0.8125rem',
    cellPaddingY: '4px',
    cellPaddingX: '8px',
    targetSize: 36,
  },
};

function getStorageKey(toolId?: string): string | null {
  return toolId ? `hbc-density-${toolId}` : null;
}

function readStoredOverride(toolId?: string): DensityTier | null {
  if (typeof window === 'undefined') return null;
  const key = getStorageKey(toolId);
  if (!key) return null;
  const stored = localStorage.getItem(key);
  if (stored === 'compact' || stored === 'standard' || stored === 'touch') {
    return stored;
  }
  return null;
}

function detectTier(): DensityTier {
  if (typeof window === 'undefined') return 'standard';
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const width = window.innerWidth;
  if (coarse && width < 1024) return 'touch';
  if (!coarse && width >= 1440) return 'compact';
  return 'standard';
}

export interface UseAdaptiveDensityOptions {
  toolId?: string;
  densityOverride?: DensityTier;
  isFieldMode?: boolean;
}

export interface UseAdaptiveDensityReturn {
  tier: DensityTier;
  config: DensityConfig;
  setManualOverride: (tier: DensityTier | null) => void;
}

export function useAdaptiveDensity({
  toolId,
  densityOverride,
  isFieldMode = false,
}: UseAdaptiveDensityOptions = {}): UseAdaptiveDensityReturn {
  const storedOverride = readStoredOverride(toolId);
  const [autoTier, setAutoTier] = useState<DensityTier>(detectTier);
  const [manualOverride, setManualOverrideState] = useState<DensityTier | null>(
    densityOverride ?? storedOverride,
  );

  // Sync external override prop
  useEffect(() => {
    if (densityOverride !== undefined) {
      setManualOverrideState(densityOverride);
    }
  }, [densityOverride]);

  // Auto-detect on resize + orientation change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detect = () => setAutoTier(detectTier());
    detect();

    window.addEventListener('resize', detect);
    window.addEventListener('orientationchange', detect);
    const mq = window.matchMedia('(pointer: coarse)');
    mq.addEventListener('change', detect);

    return () => {
      window.removeEventListener('resize', detect);
      window.removeEventListener('orientationchange', detect);
      mq.removeEventListener('change', detect);
    };
  }, []);

  const setManualOverride = useCallback(
    (tier: DensityTier | null) => {
      setManualOverrideState(tier);
      const key = getStorageKey(toolId);
      if (key) {
        if (tier) {
          localStorage.setItem(key, tier);
        } else {
          localStorage.removeItem(key);
        }
      }
    },
    [toolId],
  );

  // Field Mode defaults to touch tier
  const effectiveTier = useMemo(() => {
    if (manualOverride) return manualOverride;
    if (isFieldMode) return 'touch';
    return autoTier;
  }, [manualOverride, isFieldMode, autoTier]);

  return {
    tier: effectiveTier,
    config: DENSITY_CONFIGS[effectiveTier],
    setManualOverride,
  };
}
