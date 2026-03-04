/**
 * useIsMobile — Shared mobile breakpoint detection hook
 * PH4.8 §Step 2 — Extracted from HbcPanel for reuse
 */
import * as React from 'react';

const MOBILE_BREAKPOINT = 767;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth <= MOBILE_BREAKPOINT : false,
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isMobile;
}
