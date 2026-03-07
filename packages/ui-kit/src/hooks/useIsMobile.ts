/**
 * useIsMobile — Shared mobile breakpoint detection hook
 * PH4.8 §Step 2 — Extracted from HbcPanel for reuse
 * Traceability: D-PH4C-24, D-PH4C-25
 */
import * as React from 'react';
import { HBC_BREAKPOINT_MOBILE } from '../theme/breakpoints.js';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth <= HBC_BREAKPOINT_MOBILE : false,
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    // PH4C.12: mobile detection is pinned to canonical shared constant.
    const handler = () => setIsMobile(window.innerWidth <= HBC_BREAKPOINT_MOBILE);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isMobile;
}
