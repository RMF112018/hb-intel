import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { PccApp } from './PccApp';
import { createPccReadModelClient } from './api/pccReadModelClientFactory.js';
import type { IPccReadModelConfig } from './api/pccReadModelClientFactory.js';

interface IPccMountedInstance {
  root: Root | null;
  hostElement: HTMLElement | null;
}

// Packaging runtime marker used by the SPFx package-truth verifier.
const PCC_RUNTIME_MARKER_WEBPART_ID = '6f5f3be4-6ec8-4b3f-8fd5-0f97d7612d27';

const mountedInstance: IPccMountedInstance = {
  root: null,
  hostElement: null,
};

function teardownMountedInstance(): void {
  mountedInstance.root?.unmount();
  mountedInstance.root = null;
  mountedInstance.hostElement = null;
}

export interface IPccMountConfig {
  readonly previewLabel?: string;
  /**
   * Wave 4 / Prompt 02: read-model config carried forward to the API
   * factory. Not consumed by `mount` or any surface in Prompt 02; UI
   * wiring is owned by Prompt 05.
   */
  readonly readModel?: IPccReadModelConfig;
}

/**
 * Mount the PCC scaffold into a DOM element.
 *
 * Wave 2 scope: preview/scaffold only. The optional `spfxContext` is reserved
 * for forward compatibility with future SPFx host wiring; this scaffold does
 * not call SPFx auth, permissions, Graph/PnP, or any live runtime.
 */
export async function mount(
  el: HTMLElement,
  _spfxContext?: unknown,
  _config?: IPccMountConfig,
): Promise<void> {
  if (mountedInstance.hostElement && mountedInstance.hostElement !== el) {
    teardownMountedInstance();
  }
  if (!mountedInstance.hostElement) {
    mountedInstance.hostElement = el;
  }
  if (!mountedInstance.root) {
    mountedInstance.root = createRoot(el);
  }
  const readModelClient = _config?.readModel
    ? createPccReadModelClient(_config.readModel)
    : undefined;
  mountedInstance.root.render(createElement(PccApp, { readModelClient }));
}

export function unmount(): void {
  teardownMountedInstance();
}

const api = {
  mount,
  unmount,
  runtimeMarkerId: PCC_RUNTIME_MARKER_WEBPART_ID,
};
(globalThis as unknown as { __hbIntel_projectControlCenter?: typeof api }).__hbIntel_projectControlCenter = api;
if (typeof window !== 'undefined' && globalThis !== window) {
  (window as unknown as { __hbIntel_projectControlCenter?: typeof api }).__hbIntel_projectControlCenter = api;
}
