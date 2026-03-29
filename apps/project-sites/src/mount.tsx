/**
 * Production IIFE entry point for the Project Sites web part.
 *
 * Vite compiles this into an IIFE bundle that exposes mount/unmount on a global.
 * The SPFx shell webpart loads this bundle and calls mount(domElement, spfxContext).
 *
 * @see tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
 * @see packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx
 */
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { bootstrapSpfxAuth, resolveSpfxPermissions } from '@hbc/auth/spfx';
// Use relative path — Vite resolves via alias, tsc resolves via filesystem
import { ProjectSitesRoot } from '../../../packages/spfx/src/webparts/projectSites/ProjectSitesRoot.js';

let root: Root | undefined;
let queryClient: QueryClient | undefined;

/**
 * Mount the Project Sites web part into the given DOM element.
 * Called by the SPFx shell webpart's render() method.
 *
 * @param el - DOM element provided by SharePoint (webpart.domElement)
 * @param spfxContext - SharePoint page context from BaseClientSideWebPart.context
 */
export async function mount(el: HTMLElement, spfxContext?: WebPartContext): Promise<void> {
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
  root.render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(ProjectSitesRoot),
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = { mount, unmount };
(globalThis as any).__hbIntel_projectSites = api;
if (typeof window !== 'undefined' && globalThis !== window) {
  (window as any).__hbIntel_projectSites = api;
}
