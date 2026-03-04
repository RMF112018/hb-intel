/**
 * usePrefersReducedMotion — Respects user motion preferences
 * PH4.12 §Step 1 | Blueprint §1d
 *
 * Returns true when the user has enabled "prefers-reduced-motion: reduce".
 * SSR-safe: defaults to false on the server.
 * Follows the same matchMedia pattern as useTouchSize in HbcButton.
 */
import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(QUERY);
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
