/**
 * Shell-extension mount/unmount seam.
 *
 * This is the Lane B equivalent of the Lane A mount.tsx in hb-webparts.
 * It renders shell-extension content into SharePoint placeholder regions
 * (Top and Bottom) via the SPFx Application Customizer lifecycle.
 *
 * The SPFx shell will call:
 *   mountTop(el)    — to render the top placeholder (ribbon + alert band)
 *   mountBottom(el) — to render the bottom placeholder (footer + support)
 *   unmountTop()    — to clean up the top placeholder
 *   unmountBottom() — to clean up the bottom placeholder
 *
 * Safe failure: if a placeholder is unavailable, the mount functions
 * render nothing and return cleanly.
 *
 * @see docs/reference/sharepoint-homepage-shell-boundaries.md — Lane B definition
 */

import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { TopPlaceholder } from './placeholders/TopPlaceholder.js';
import { BottomPlaceholder } from './placeholders/BottomPlaceholder.js';

let topRoot: Root | undefined;
let bottomRoot: Root | undefined;

/**
 * Mount the top placeholder content into the provided DOM element.
 * If el is null/undefined, the placeholder is unavailable — safe no-op.
 */
export function mountTop(el: HTMLElement | null | undefined): void {
  if (!el) {
    console.debug('[HB-Intel ShellExtension] Top placeholder not available — skipping.');
    return;
  }
  const props = { available: true } as const;
  console.debug('[HB-Intel ShellExtension] mountTop called — props:', props);
  topRoot = createRoot(el);
  topRoot.render(createElement(TopPlaceholder, props));
}

/**
 * Mount the bottom placeholder content into the provided DOM element.
 * If el is null/undefined, the placeholder is unavailable — safe no-op.
 */
export function mountBottom(el: HTMLElement | null | undefined): void {
  if (!el) {
    console.debug('[HB-Intel ShellExtension] Bottom placeholder not available — skipping.');
    return;
  }
  const props = { available: true } as const;
  console.debug('[HB-Intel ShellExtension] mountBottom called — props:', props);
  bottomRoot = createRoot(el);
  bottomRoot.render(createElement(BottomPlaceholder, props));
}

/** Unmount top placeholder content. */
export function unmountTop(): void {
  topRoot?.unmount();
  topRoot = undefined;
}

/** Unmount bottom placeholder content. */
export function unmountBottom(): void {
  bottomRoot?.unmount();
  bottomRoot = undefined;
}

// Publish the shell-extension API on both globalThis and window for the SPFx
// loader. In SPFx's runtime environment, globalThis and window can be separate
// objects — ShellExtensionCustomizer.ts resolves via globalThis ?? window.
const api = { mountTop, mountBottom, unmountTop, unmountBottom };
(globalThis as { __hbIntel_hbShellExtension?: typeof api }).__hbIntel_hbShellExtension = api;
if (typeof window !== 'undefined') {
  (window as { __hbIntel_hbShellExtension?: typeof api }).__hbIntel_hbShellExtension = api;
}
