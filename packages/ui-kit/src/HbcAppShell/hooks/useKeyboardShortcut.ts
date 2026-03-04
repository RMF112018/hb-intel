/**
 * useKeyboardShortcut — Registers Cmd/Ctrl+key handlers
 * PH4.4 §Step 1
 */
import { useEffect } from 'react';

export function useKeyboardShortcut(key: string, callback: () => void): void {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [key, callback]);
}
