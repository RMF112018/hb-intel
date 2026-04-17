/**
 * Production IIFE entry point for the Project Sites web part.
 *
 * Vite compiles this into an IIFE bundle that exposes mount/unmount on a global.
 * The SPFx shell webpart loads this bundle and calls
 * mount(domElement, spfxContext, runtimeConfig).
 *
 * @see tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
 * @see packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx
 *
 * Import discipline (W01r-P11 Project Sites compliance closure):
 *   - `HbcThemeProvider` comes from `@hbc/ui-kit/app-shell` — the narrow
 *     sanctioned SPFx-safe entry point for theme context and shell chrome.
 *   - `ProjectSitesRoot` comes from `@hbc/spfx/project-sites` — the
 *     package-oriented barrel that replaces the previous relative
 *     source reach into `packages/spfx`.
 */
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HbcThemeProvider } from '@hbc/ui-kit/app-shell';
import { bootstrapSpfxAuth, resolveSpfxPermissions } from '@hbc/auth/spfx';
import {
  ProjectSitesRoot,
  normalizeProjectSitesRuntimeConfig,
  type IProjectSitesMountRuntimeConfig,
} from '@hbc/spfx/project-sites';

interface IMountedProjectSitesInstance {
  root: Root | null;
  queryClient: QueryClient | null;
  hostElement: HTMLElement | null;
  authContext: WebPartContext | null;
  authBootstrapPromise: Promise<void> | null;
  authBootstrapped: boolean;
}

const mountedInstance: IMountedProjectSitesInstance = {
  root: null,
  queryClient: null,
  hostElement: null,
  authContext: null,
  authBootstrapPromise: null,
  authBootstrapped: false,
};

function teardownMountedInstance(): void {
  mountedInstance.root?.unmount();
  mountedInstance.root = null;
  mountedInstance.queryClient?.clear();
  mountedInstance.queryClient = null;
  mountedInstance.hostElement = null;
  mountedInstance.authContext = null;
  mountedInstance.authBootstrapPromise = null;
  mountedInstance.authBootstrapped = false;
}

async function ensureAuthBootstrapped(spfxContext?: WebPartContext): Promise<void> {
  if (!spfxContext) {
    return;
  }
  if (mountedInstance.authBootstrapped && mountedInstance.authContext === spfxContext) {
    return;
  }
  if (!mountedInstance.authBootstrapPromise || mountedInstance.authContext !== spfxContext) {
    mountedInstance.authContext = spfxContext;
    mountedInstance.authBootstrapPromise = (async () => {
      const permissionKeys = await resolveSpfxPermissions(spfxContext);
      await bootstrapSpfxAuth(spfxContext, permissionKeys);
    })();
  }
  await mountedInstance.authBootstrapPromise;
  mountedInstance.authBootstrapped = true;
}

/**
 * Mount the Project Sites web part into the given DOM element.
 * Called by the SPFx shell webpart's render() method.
 *
 * @param el - DOM element provided by SharePoint (webpart.domElement)
 * @param spfxContext - SharePoint page context from BaseClientSideWebPart.context
 * @param config - Runtime configuration injected by the shell webpart
 */
export async function mount(
  el: HTMLElement,
  spfxContext?: WebPartContext,
  config?: IProjectSitesMountRuntimeConfig,
): Promise<void> {
  // Defensive host swap handling: if SharePoint rebinds this app to a
  // different host element without calling unmount first, fully tear down the
  // previous instance before creating the next one.
  if (mountedInstance.hostElement && mountedInstance.hostElement !== el) {
    teardownMountedInstance();
  }
  if (!mountedInstance.hostElement) {
    mountedInstance.hostElement = el;
  }
  if (!mountedInstance.queryClient) {
    mountedInstance.queryClient = new QueryClient({
      defaultOptions: {
        queries: { refetchOnWindowFocus: false },
      },
    });
  }
  if (!mountedInstance.root) {
    mountedInstance.root = createRoot(el);
  }
  await ensureAuthBootstrapped(spfxContext);
  // SPFx-hosted surfaces run inside SharePoint's always-light chrome.
  // Force light theme to prevent OS dark-mode from creating visual incoherence.
  const appTree = createElement(
    QueryClientProvider,
    { client: mountedInstance.queryClient },
    createElement(ProjectSitesRoot, {
      runtimeContext: normalizeProjectSitesRuntimeConfig(config),
    }),
  );
  mountedInstance.root.render(
    createElement(
      HbcThemeProvider,
      { forceTheme: 'light' as const, children: appTree },
    ),
  );
}

/**
 * Unmount the React tree. Called by the SPFx shell webpart's onDispose().
 */
export function unmount(): void {
  teardownMountedInstance();
}

// ── Global publication (belt-and-suspenders) ──────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
const api = { mount, unmount };
(globalThis as any).__hbIntel_projectSites = api;
if (typeof window !== 'undefined' && globalThis !== window) {
  (window as any).__hbIntel_projectSites = api;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
