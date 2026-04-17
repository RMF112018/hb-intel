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

let root: Root | undefined;
let queryClient: QueryClient | undefined;

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
  if (spfxContext) {
    const permissionKeys = await resolveSpfxPermissions(spfxContext);
    await bootstrapSpfxAuth(spfxContext, permissionKeys);
  }

  queryClient = new QueryClient({
    defaultOptions: {
      queries: { refetchOnWindowFocus: false },
    },
  });

  root = createRoot(el);
  // SPFx-hosted surfaces run inside SharePoint's always-light chrome.
  // Force light theme to prevent OS dark-mode from creating visual incoherence.
  const appTree = createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(ProjectSitesRoot, {
      runtimeContext: normalizeProjectSitesRuntimeConfig(config),
    }),
  );
  root.render(
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
  root?.unmount();
  root = undefined;
  queryClient?.clear();
  queryClient = undefined;
}

// ── Global publication (belt-and-suspenders) ──────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
const api = { mount, unmount };
(globalThis as any).__hbIntel_projectSites = api;
if (typeof window !== 'undefined' && globalThis !== window) {
  (window as any).__hbIntel_projectSites = api;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
