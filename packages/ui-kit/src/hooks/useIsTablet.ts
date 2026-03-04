/**
 * useIsTablet — Tablet breakpoint detection hook
 * PH4.14.5 — Bottom nav appears at <1024px (separate from useIsMobile at 767px)
 */
import * as React from 'react';

const TABLET_BREAKPOINT = 1023;

export function useIsTablet(): boolean {
  const [isTablet, setIsTablet] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth <= TABLET_BREAKPOINT : false,
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setIsTablet(window.innerWidth <= TABLET_BREAKPOINT);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isTablet;
}
