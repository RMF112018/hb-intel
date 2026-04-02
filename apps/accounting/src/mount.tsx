/**
 * Production entry point for the Accounting SPFx surface.
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
  /** Runtime-selected backend mode for the Accounting surface. */
  backendMode?: 'production' | 'ui-review';
  /** Enables the reviewer-only backend mode switch. */
  allowBackendModeSwitch?: boolean;
  /** API audience URI for SPFx token acquisition (e.g. `api://<client-id>`). */
  apiAudience?: string;
}

let root: Root | undefined;

/**
 * Mount the Accounting app into the given DOM element.
 * Called by the SPFx shell webpart's render() method.
 *
 * @param el - DOM element provided by SharePoint (webpart.domElement)
 * @param spfxContext - SharePoint page context from BaseClientSideWebPart.context
 * @param config - Runtime configuration injected by the shell webpart
 */
export async function mount(el: HTMLElement, spfxContext?: WebPartContext, config?: IMountConfig): Promise<void> {
  // Store runtime config before rendering so all components can resolve it.
  if (config) {
    setRuntimeConfig(config);
  }

  let getApiToken: (() => Promise<string>) | undefined;

  if (spfxContext) {
    const permissionKeys = await resolveSpfxPermissions(spfxContext);
    await bootstrapSpfxAuth(spfxContext, permissionKeys);

    // Create SPFx API token provider for production-mode auth.
    // The audience is resolved from mount config or env — if absent, the
    // provider is undefined and production readiness will report the gap.
    //
    // Frontend/backend audience contract:
    //   Frontend: apiAudience (from shell config or VITE_API_AUDIENCE)
    //   Backend:  API_AUDIENCE env var (validated by middleware/validateToken.ts)
    //   Both must resolve to the same app registration audience URI (api://<client-id>).
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
(globalThis as any).__hbIntel_accounting = api;
// Defensive: also assign to window explicitly, as SPFx contexts may have
// globalThis !== window.
if (typeof window !== 'undefined' && globalThis !== window) {
  (window as any).__hbIntel_accounting = api;
}
