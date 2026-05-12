/**
 * Production entry point for the My Dashboard SPFx surface.
 *
 * Vite compiles this into an IIFE bundle that exposes mount/unmount on a
 * global. The SPFx shell webpart loads this bundle and calls
 * mount(domElement, spfxContext, config).
 */
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  bootstrapSpfxAuth,
  resolveSpfxPermissions,
  createSpfxApiTokenProvider,
} from '@hbc/auth/spfx';
import { MyDashboardApp } from './MyDashboardApp.js';
import { setRuntimeConfig, getApiAudience } from './config/runtimeConfig.js';

/** Packaging runtime marker — must match MyDashboardWebPart.manifest.json `id`. */
const MY_DASHBOARD_RUNTIME_MARKER_WEBPART_ID = '412eb9fd-2eb2-4f7d-a4f1-7865e339a369';

/** Shell-injected runtime configuration. */
export interface IMountConfig {
  /** Azure Function App base URL (e.g. https://hb-intel-functions.azurewebsites.net) */
  functionAppUrl?: string;
  /** Runtime-selected backend mode for the My Dashboard surface. */
  backendMode?: 'production' | 'ui-review';
  /** Enables the reviewer-only backend mode switch. */
  allowBackendModeSwitch?: boolean;
  /** API audience URI for SPFx token acquisition (e.g. `api://<client-id>`). */
  apiAudience?: string;
}

interface IMyDashboardMountedInstance {
  root: Root | null;
  hostElement: HTMLElement | null;
}

const mountedInstance: IMyDashboardMountedInstance = {
  root: null,
  hostElement: null,
};

function teardownMountedInstance(): void {
  mountedInstance.root?.unmount();
  mountedInstance.root = null;
  mountedInstance.hostElement = null;
}

/**
 * Mount the My Dashboard app into the given DOM element.
 * Called by the SPFx shell webpart's render() method.
 *
 * @param el - DOM element provided by SharePoint (webpart.domElement)
 * @param spfxContext - SharePoint page context from BaseClientSideWebPart.context
 * @param config - Runtime configuration injected by the shell webpart
 */
export async function mount(
  el: HTMLElement,
  spfxContext?: WebPartContext,
  config?: IMountConfig,
): Promise<void> {
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
    //   Both must resolve to the same app registration audience URI.
    const apiAudience = getApiAudience();
    if (apiAudience) {
      getApiToken = createSpfxApiTokenProvider(spfxContext, apiAudience);
    }
  }

  if (mountedInstance.hostElement && mountedInstance.hostElement !== el) {
    teardownMountedInstance();
  }
  if (!mountedInstance.hostElement) {
    mountedInstance.hostElement = el;
  }
  if (!mountedInstance.root) {
    mountedInstance.root = createRoot(el);
  }

  mountedInstance.root.render(
    <MyDashboardApp spfxContext={spfxContext} getApiToken={getApiToken} />,
  );
}

/**
 * Unmount the React tree. Called by the SPFx shell webpart's onDispose().
 */
export function unmount(): void {
  teardownMountedInstance();
}

// Explicitly publish the app API to the global object so the SPFx shell
// can always resolve it, regardless of how the IIFE wrapper assigns the
// return value. Belt-and-suspenders complement to the Vite `lib.name`
// IIFE global assignment.
const api = {
  mount,
  unmount,
  runtimeMarkerId: MY_DASHBOARD_RUNTIME_MARKER_WEBPART_ID,
};

(globalThis as unknown as { __hbIntel_myDashboard?: typeof api }).__hbIntel_myDashboard = api;
// Defensive: also assign to window explicitly, as SPFx contexts may have
// globalThis !== window, and SPComponentLoader may look at window instead.
if (typeof window !== 'undefined' && globalThis !== window) {
  (window as unknown as { __hbIntel_myDashboard?: typeof api }).__hbIntel_myDashboard = api;
}
