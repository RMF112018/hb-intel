/**
 * useMinDisplayTime — Phase 4.9 Messaging & Feedback System
 *
 * Returns a debounced boolean that stays `true` for at least `minMs`
 * after `isLoading` was last true. Prevents flash-of-spinner.
 *
 * Usage: const showSpinner = useMinDisplayTime(isLoading, 300);
 */
import { useState, useEffect, useRef } from 'react';

export function useMinDisplayTime(isLoading: boolean, minMs = 300): boolean {
  const [visible, setVisible] = useState(false);
  const startRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading) {
      startRef.current = Date.now();
      setVisible(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } else if (visible) {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, minMs - elapsed);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        timerRef.current = null;
      }, remaining);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoading, minMs, visible]);

  return visible;
}
