/**
 * useResponsiveTier — homepage-local responsive tier hook.
 *
 * Returns 'mobile' | 'tablet' | 'desktop' based on viewport width.
 * Thresholds align with canonical breakpoints in
 * packages/ui-kit/src/theme/breakpoints.ts (HBC_BREAKPOINT_MOBILE,
 * HBC_BREAKPOINT_DESKTOP).
 *
 * Kept local to apps/hb-webparts — promotion to @hbc/ui-kit requires
 * proven reuse by 2+ non-homepage consumers.
 */
import { useState, useEffect } from 'react';

export type ResponsiveTier = 'mobile' | 'tablet' | 'desktop';

/** ≤767 px — aligned with HBC_BREAKPOINT_MOBILE */
const MOBILE_MAX = 767;
/** ≥1200 px — aligned with HBC_BREAKPOINT_DESKTOP */
const DESKTOP_MIN = 1200;

function detectTier(): ResponsiveTier {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w <= MOBILE_MAX) return 'mobile';
  if (w >= DESKTOP_MIN) return 'desktop';
  return 'tablet';
}

export function useResponsiveTier(): ResponsiveTier {
  const [tier, setTier] = useState<ResponsiveTier>(detectTier);

  useEffect(() => {
    function onResize(): void {
      setTier(detectTier());
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return tier;
}
