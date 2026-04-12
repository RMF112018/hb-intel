/**
 * Focus trap for the kudos composer flyout. Keeps Tab/Shift+Tab
 * cycling inside the panel while it is open, and moves focus to the
 * first focusable element after the slide-in animation completes.
 */
import * as React from 'react';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(
  ref: React.RefObject<HTMLDivElement | null>,
  active: boolean,
  reducedMotion: boolean,
): void {
  React.useEffect(() => {
    if (!active || !ref.current) return;

    const el = ref.current;

    // Delay initial focus until after the slide-in animation (280ms)
    // so the first focusable element is on-screen when focused.
    // When reduced-motion is active, focus immediately.
    const delay = reducedMotion ? 0 : 300;
    const timer = setTimeout(() => {
      const first = el.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      first?.focus();
    }, delay);

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key !== 'Tab') return;
      const focusable = el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const firstEl = focusable[0]!;
      const lastEl = focusable[focusable.length - 1]!;

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    el.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      el.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, active, reducedMotion]);
}
