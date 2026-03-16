/**
 * useFocusTrap — Shared focus trap hook for modal-like overlays
 * PH4.8 §Step 2 — Extracted from HbcPanel for reuse in HbcModal, HbcTearsheet
 *
 * Cycles Tab/Shift+Tab within focusable elements inside the container.
 * Auto-focuses the first focusable element when activated.
 */
import * as React from 'react';

export function useFocusTrap(ref: React.RefObject<HTMLDivElement | null>, active: boolean) {
  React.useEffect(() => {
    if (!active || !ref.current) return;

    const container = ref.current;
    const selector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const focusable = container.querySelectorAll<HTMLElement>(selector);
    if (focusable.length === 0) return;

    let first = focusable[0];
    let last = focusable[focusable.length - 1];

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', handler);
    first.focus();

    // Re-scan focusable elements when container subtree changes (async content)
    const observer = new MutationObserver(() => {
      const updated = container.querySelectorAll<HTMLElement>(selector);
      if (updated.length > 0) {
        first = updated[0];
        last = updated[updated.length - 1];
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      container.removeEventListener('keydown', handler);
      observer.disconnect();
    };
  }, [ref, active]);
}
