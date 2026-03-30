/**
 * Production entry point for the Estimating app.
 *
 * Vite compiles this into an IIFE bundle that exposes mount/unmount on a global.
 * The SPFx shell webpart loads this bundle and calls mount(domElement, spfxContext, config).
 *
 * This file is NOT used during local Vite dev — main.tsx handles that path.
 *
 * @see tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
 * @see docs/architecture/reviews/estimating-spfx-runtime-api-config-remediation.md
 */
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { App } from './App.js';
import { bootstrapSpfxAuth, resolveSpfxPermissions } from '@hbc/auth/spfx';
import { setRuntimeConfig } from './config/runtimeConfig.js';

/** Shell-injected runtime configuration. */
export interface IMountConfig {
  /** Azure Function App base URL (e.g. https://hb-intel-functions.azurewebsites.net) */
  functionAppUrl?: string;
  /** Runtime-selected backend mode for the Project Setup surface. */
  backendMode?: 'production' | 'ui-review';
  /** Enables the reviewer-only backend mode switch in the Estimating header. */
  allowBackendModeSwitch?: boolean;
}

let root: Root | undefined;

/**
 * Mount the Estimating React app into the given DOM element.
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

  if (spfxContext) {
    const permissionKeys = await resolveSpfxPermissions(spfxContext);
    await bootstrapSpfxAuth(spfxContext, permissionKeys);
  }
  root = createRoot(el);
  root.render(<App spfxContext={spfxContext} />);
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
// return value.  This is the belt-and-suspenders complement to the Vite
// `lib.name` IIFE global assignment.
const api = { mount, unmount };
(globalThis as any).__hbIntel_estimating = api;
// Defensive: also assign to window explicitly, as SPFx contexts may have
// globalThis !== window, and SPComponentLoader may look at window instead.
if (typeof window !== 'undefined' && globalThis !== window) {
  (window as any).__hbIntel_estimating = api;
}
