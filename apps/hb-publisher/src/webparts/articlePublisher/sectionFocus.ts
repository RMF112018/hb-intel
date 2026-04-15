/**
 * Cross-surface keyboard closure helper for the Workspace section
 * index (Phase 13 Prompt 06).
 *
 * Native hash-anchor navigation updates the URL and the scroll
 * position but does not move focus, so keyboard and screen-reader
 * users end up visually at the section while the focus ring stays at
 * the nav. Intercepting the click lets us explicitly `focus()` the
 * target section — each `<section>` in the canvas carries
 * `tabIndex={-1}` so it is focusable but not in the tab sequence —
 * while honouring the native scroll jump and the `scroll-margin-top`
 * offset that keeps the section clear of the sticky nav.
 */
import type * as React from 'react';

export function handleSectionIndexClick(
  event: React.MouseEvent<HTMLElement>,
): void {
  const target = event.target;
  if (!(target instanceof HTMLAnchorElement)) return;
  const hash = target.getAttribute('href');
  if (!hash || !hash.startsWith('#')) return;
  const id = hash.slice(1);
  const section =
    typeof document !== 'undefined' ? document.getElementById(id) : null;
  if (!section) return;
  event.preventDefault();
  if (typeof section.scrollIntoView === 'function') {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  section.focus({ preventScroll: true });
  if (typeof history !== 'undefined' && history.replaceState) {
    history.replaceState(null, '', hash);
  }
}
