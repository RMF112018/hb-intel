/**
 * useIsTablet — Tablet breakpoint detection hook
 * PH4.14.5 — Bottom nav appears at <1024px (separate from useIsMobile at 767px)
 * Traceability: D-PH4C-24, D-PH4C-25
 */
import * as React from 'react';
import { HBC_BREAKPOINT_TABLET } from '../theme/breakpoints.js';

export function useIsTablet(): boolean {
  const [isTablet, setIsTablet] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth <= HBC_BREAKPOINT_TABLET : false,
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    // PH4C.12: tablet detection is pinned to canonical shared constant.
    const handler = () => setIsTablet(window.innerWidth <= HBC_BREAKPOINT_TABLET);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isTablet;
}
