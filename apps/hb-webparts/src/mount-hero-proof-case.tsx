/**
 * Proof-case entry for HbHeroBannerWebPart.
 *
 * Isolates the hero banner from all other homepage webpart imports so the
 * first-class SPFx loader contract can be validated without contamination
 * from unrelated component trees.
 *
 * This entry preserves the same mount/unmount shell contract used by the
 * shared mount.tsx — ShellWebPart.ts does not need to change.
 *
 * Once all webparts are proven in the first-class model, this file can be
 * removed and mount.tsx restored as the single entry point.
 */
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { HbHeroBanner } from './webparts/hbHeroBanner/HbHeroBanner.js';

let root: Root | undefined;

interface MountConfig {
  webPartId?: unknown;
  webPartProperties?: unknown;
}

export async function mount(
  el: HTMLElement,
  spfxContext?: WebPartContext,
  config?: MountConfig,
): Promise<void> {
  void spfxContext;

  const webPartProperties =
    typeof config?.webPartProperties === 'object' && config.webPartProperties !== null
      ? (config.webPartProperties as Record<string, unknown>)
      : undefined;

  root = createRoot(el);
  root.render(createElement(HbHeroBanner, { config: webPartProperties }));
}

export function unmount(): void {
  root?.unmount();
  root = undefined;
}

const api = { mount, unmount };
(globalThis as { __hbIntel_hbWebparts?: typeof api }).__hbIntel_hbWebparts = api;
