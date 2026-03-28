/**
 * Production entry point for the Estimating app.
 *
 * Vite compiles this into an IIFE bundle that exposes mount/unmount on a global.
 * The SPFx shell webpart loads this bundle and calls mount(domElement, spfxContext).
 *
 * This file is NOT used during local Vite dev — main.tsx handles that path.
 *
 * @see tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
 * @see docs/architecture/reviews/estimating-spfx-packaging-remediation.md
 */
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { App } from './App.js';
import { bootstrapSpfxAuth, resolveSpfxPermissions } from '@hbc/auth/spfx';

let root: Root | undefined;

/**
 * Mount the Estimating React app into the given DOM element.
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
