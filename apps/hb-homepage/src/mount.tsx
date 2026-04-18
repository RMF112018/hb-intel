/**
 * Production IIFE entry point for the HB Homepage standalone solution.
 *
 * Vite compiles this into an IIFE bundle that exposes mount/unmount on a global.
 * The SPFx shell webpart loads this bundle and calls
 * mount(domElement, spfxContext, runtimeConfig).
 *
 * The homepage runtime source lives in apps/hb-webparts — this mount file
 * re-exports the standalone entry surface without duplicating runtime logic.
 *
 * @see tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
 */
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { HbcThemeProvider } from '@hbc/ui-kit/app-shell';
import { HbHomepage } from '@hb-homepage/runtime';

export const HB_HOMEPAGE_WEBPART_ID = 'e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf';
import { createSharePointUserPhotoResolver } from '@hb-homepage/helpers/peopleCultureProfilePhotoResolver';
import {
  storeSiteUrl,
  storeKudosListHostUrl,
  storePriorityActionsListHostUrl,
} from '@hb-homepage/data/spContext';
import type { HomepageIdentityInput } from '@hb-homepage/helpers/identity';

let root: Root | undefined;

interface MountConfig {
  webPartId?: unknown;
  webPartProperties?: unknown;
  assetBaseUrl?: unknown;
}

export async function mount(
  el: HTMLElement,
  spfxContext?: WebPartContext,
  config?: MountConfig,
): Promise<void> {
  const siteUrl = spfxContext?.pageContext?.web?.absoluteUrl;
  storeSiteUrl(siteUrl);

  const webPartProperties =
    typeof config?.webPartProperties === 'object' && config.webPartProperties !== null
      ? (config.webPartProperties as Record<string, unknown>)
      : undefined;

  if (typeof webPartProperties?.kudosListHostUrl === 'string' && webPartProperties.kudosListHostUrl.trim()) {
    const candidate = webPartProperties.kudosListHostUrl.trim();
    if (/^https?:\/\//i.test(candidate)) {
      storeKudosListHostUrl(candidate);
    }
  }

  if (typeof webPartProperties?.priorityActionsListHostUrl === 'string' && webPartProperties.priorityActionsListHostUrl.trim()) {
    const candidate = webPartProperties.priorityActionsListHostUrl.trim();
    if (/^https?:\/\//i.test(candidate)) {
      storePriorityActionsListHostUrl(candidate);
    }
  }

  const assetBaseUrl = typeof config?.assetBaseUrl === 'string' ? config.assetBaseUrl : undefined;
  const identity: HomepageIdentityInput = {
    displayName: spfxContext?.pageContext?.user?.displayName,
    email: spfxContext?.pageContext?.user?.email,
  };

  const createApiTokenProvider = (audience: string) => {
    if (!spfxContext || !audience) return undefined;
    return async (): Promise<string> => {
      const provider = await spfxContext.aadTokenProviderFactory.getTokenProvider();
      return provider.getToken(audience);
    };
  };

  const getGraphToken = createApiTokenProvider('https://graph.microsoft.com');
  const getApiToken = webPartProperties?.backendAudience
    ? createApiTokenProvider(String(webPartProperties.backendAudience))
    : undefined;

  root = createRoot(el);
  const appTree = createElement(HbHomepage, {
    config: webPartProperties,
    identity,
    assetBaseUrl,
    siteUrl,
    getGraphToken,
    getApiToken,
  });
  root.render(
    createElement(
      HbcThemeProvider,
      { forceTheme: 'light' as const, children: appTree },
    ),
  );
}

export function unmount(): void {
  root?.unmount();
  root = undefined;
}

// ── Global publication (belt-and-suspenders) ──────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
const api = { mount, unmount };
(globalThis as any).__hbIntel_hbHomepage = api;
if (typeof window !== 'undefined' && globalThis !== window) {
  (window as any).__hbIntel_hbHomepage = api;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
