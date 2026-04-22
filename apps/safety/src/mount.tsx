/**
 * Production entry point for the Safety SPFx surface.
 *
 * Vite compiles this into an IIFE bundle (`safety-app.js`) exposed on
 * `window.__hbIntel_safety`. The SPFx shell webpart loads the bundle and
 * calls `mount(domElement, spfxContext, config)`.
 *
 * Not used during local Vite dev — `main.tsx` handles that path.
 */
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { App } from './App.js';
import { bootstrapSpfxAuth, resolveSpfxPermissions } from '@hbc/auth/spfx';
import { bindHostedSafetyGuidOverlay } from './runtime/hostedSafetyGuidBinding.js';

/** Shell-injected runtime configuration. Reserved for future wiring. */
export interface IMountConfig {
  functionAppUrl?: string;
  backendMode?: 'production' | 'ui-review';
  allowBackendModeSwitch?: boolean;
  apiAudience?: string;
}

let root: Root | undefined;

export async function mount(
  el: HTMLElement,
  spfxContext?: WebPartContext,
  _config?: IMountConfig,
): Promise<void> {
  if (spfxContext) {
    bindHostedSafetyGuidOverlay();
    const permissionKeys = await resolveSpfxPermissions(spfxContext);
    await bootstrapSpfxAuth(spfxContext, permissionKeys);
  }

  root = createRoot(el);
  root.render(<App spfxContext={spfxContext} />);
}

export function unmount(): void {
  root?.unmount();
  root = undefined;
}

const api = { mount, unmount };
(globalThis as unknown as { __hbIntel_safety: unknown }).__hbIntel_safety = api;
if (typeof window !== 'undefined' && globalThis !== window) {
  (window as unknown as { __hbIntel_safety: unknown }).__hbIntel_safety = api;
}
