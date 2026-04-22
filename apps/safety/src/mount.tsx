/**
 * Production entry point for the Safety SPFx surface.
 *
 * Vite compiles this into an IIFE bundle (`safety-app.js`) exposed on
 * `window.__hbIntel_safety`. The SPFx shell webpart loads the bundle and
 * calls `mount(domElement, spfxContext, config)`.
 *
 * Not used during local Vite dev — `main.tsx` handles that path.
 *
 * CSS delivery: `webpart.css` is imported here (production entry) AND in
 * `main.tsx` (dev entry). In production, `vite-plugin-css-injected-by-js`
 * inlines the imported stylesheet as a runtime <style> tag inside the
 * IIFE bundle, so any SPFx shell that loads `safety-app.js` automatically
 * gets the Safety global stylesheet without additional asset wiring.
 * Missing this import was the root cause of the prior Upload-layout no-op:
 * the stylesheet existed in source and in tests but never reached hosted.
 */
import './webpart.css';
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
  config?: IMountConfig,
): Promise<void> {
  if (spfxContext) {
    bindHostedSafetyGuidOverlay();
    const permissionKeys = await resolveSpfxPermissions(spfxContext);
    await bootstrapSpfxAuth(spfxContext, permissionKeys);
  }

  root = createRoot(el);
  root.render(
    <App
      spfxContext={spfxContext}
      functionAppUrl={config?.functionAppUrl}
      apiAudience={config?.apiAudience}
    />,
  );
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
