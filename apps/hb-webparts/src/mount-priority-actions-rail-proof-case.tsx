/**
 * Proof-case entry for PriorityActionsRailWebPart.
 *
 * Isolates the priority actions rail from all other homepage webpart imports
 * so the first-class SPFx loader contract can be validated without
 * contamination from unrelated component trees.
 *
 * This entry preserves the same mount/unmount shell contract used by the
 * shared mount.tsx — ShellWebPart.ts does not need to change.
 */
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { PriorityActionsRail } from './webparts/priorityActionsRail/PriorityActionsRail.js';

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
  root.render(createElement(PriorityActionsRail, { config: webPartProperties }));
}

export function unmount(): void {
  root?.unmount();
  root = undefined;
}

const api = { mount, unmount };
(globalThis as { __hbIntel_hbWebparts?: typeof api }).__hbIntel_hbWebparts = api;
