/**
 * Production entry point for the Admin SPFx surface.
 *
 * Vite compiles this into an IIFE bundle that exposes mount/unmount on a global.
 * The SPFx shell webpart loads this bundle and calls mount(domElement, spfxContext, config).
 *
 * This file is NOT used during local Vite dev — main.tsx handles that path.
 *
 * @see tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
 */
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { App } from './App.js';
import { bootstrapSpfxAuth, resolveSpfxPermissions, createSpfxApiTokenProvider } from '@hbc/auth/spfx';
import { setRuntimeConfig, getApiAudience } from './config/runtimeConfig.js';

/** Shell-injected runtime configuration. */
export interface IMountConfig {
  /** Azure Function App base URL (e.g. https://hb-intel-functions.azurewebsites.net) */
  functionAppUrl?: string;
  /** API audience URI for SPFx token acquisition (e.g. `api://<client-id>`). */
  apiAudience?: string;
}

let root: Root | undefined;

/**
 * Mount the Admin app into the given DOM element.
 * Called by the SPFx shell webpart's render() method.
 *
 * @param el - DOM element provided by SharePoint (webpart.domElement)
 * @param spfxContext - SharePoint page context from BaseClientSideWebPart.context
 * @param config - Runtime configuration injected by the shell webpart
 */
export async function mount(el: HTMLElement, spfxContext?: WebPartContext, config?: IMountConfig): Promise<void> {
  if (config) {
    setRuntimeConfig(config);
  }

  let getApiToken: (() => Promise<string>) | undefined;

  if (spfxContext) {
    const permissionKeys = await resolveSpfxPermissions(spfxContext);
    await bootstrapSpfxAuth(spfxContext, permissionKeys);

    const apiAudience = getApiAudience();
    if (apiAudience) {
      getApiToken = createSpfxApiTokenProvider(spfxContext, apiAudience);
    }
  }

  root = createRoot(el);
  root.render(<App spfxContext={spfxContext} getApiToken={getApiToken} />);
}

/**
 * Unmount the React tree. Called by the SPFx shell webpart's onDispose().
 */
export function unmount(): void {
  root?.unmount();
  root = undefined;
}

// Explicitly publish the app API to the global object so the SPFx shell
// can always resolve it, regardless of how the IIFE wrapper assigns the
// return value.
const api = { mount, unmount };
(globalThis as any).__hbIntel_admin = api;
// Defensive: also assign to window explicitly, as SPFx contexts may have
// globalThis !== window.
if (typeof window !== 'undefined' && globalThis !== window) {
  (window as any).__hbIntel_admin = api;
}
