/**
 * Foleon SPFx mount entry.
 *
 * Vite compiles this into an IIFE (`foleon-app.js`) exposed at
 * `window.__hbIntel_foleon`. The SPFx shell webpart loads the bundle
 * and calls `mount(domElement, spfxContext, config)`.
 */
import { createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { storeSiteUrl } from '@hbc/sharepoint-platform';
import { FoleonApp } from './FoleonApp.js';
import { FOLEON_WEBPART_ID, FOLEON_PACKAGE_VERSION } from './webparts/foleon/runtimeContract.js';
import {
  resolveFoleonRuntimeContract,
  type IFoleonRuntimeContract,
} from './runtime/foleonRuntimeContract.js';
import type { IFoleonMountConfig } from './types/foleon-runtime.types.js';

let root: Root | undefined;

export type { IFoleonMountConfig };

export async function mount(
  el: HTMLElement,
  spfxContext?: WebPartContext,
  config?: IFoleonMountConfig,
): Promise<void> {
  storeSiteUrl(spfxContext?.pageContext?.web?.absoluteUrl);
  const siteUrl = spfxContext?.pageContext?.web?.absoluteUrl;
  const contract = resolveFoleonRuntimeContract({
    hasSpfxContext: !!spfxContext,
    siteUrl,
    config,
  });
  publishRuntimeBindingProof(contract, config);

  root = createRoot(el);
  root.render(createElement(FoleonApp, { contract }) as ReactNode);
}

export function unmount(): void {
  root?.unmount();
  root = undefined;
}

const api = { mount, unmount };
(globalThis as { __hbIntel_foleon?: typeof api }).__hbIntel_foleon = api;
(globalThis as { __hbIntel_foleonManifestId?: string }).__hbIntel_foleonManifestId =
  FOLEON_WEBPART_ID;
if (typeof window !== 'undefined' && globalThis !== window) {
  (window as unknown as { __hbIntel_foleon?: typeof api }).__hbIntel_foleon = api;
  (window as unknown as { __hbIntel_foleonManifestId?: string }).__hbIntel_foleonManifestId =
    FOLEON_WEBPART_ID;
}

function publishRuntimeBindingProof(
  contract: IFoleonRuntimeContract,
  config: IFoleonMountConfig | undefined,
): void {
  const proof = {
    generatedAt: new Date().toISOString(),
    governedAuthority: {
      expectedManifestId: FOLEON_WEBPART_ID,
      expectedPackageVersion: FOLEON_PACKAGE_VERSION,
    },
    configured: {
      contentRegistryListId: config?.contentRegistryListId ?? null,
      placementsListId: config?.placementsListId ?? null,
      eventsListId: config?.eventsListId ?? null,
      acceptedFoleonOrigins: config?.acceptedFoleonOrigins ?? null,
      allowPreview: config?.allowPreview ?? null,
      foleonReaderRoutePath: config?.foleonReaderRoutePath ?? null,
      foleonRoute: config?.foleonRoute ?? null,
      foleonDocId: config?.foleonDocId ?? null,
      expectedManifestId: config?.expectedManifestId ?? null,
      expectedPackageVersion: config?.expectedPackageVersion ?? null,
    },
    contract: {
      hostMode: contract.hostMode,
      route: contract.route,
      docId: contract.docId,
      siteUrl: contract.siteUrl,
      listIds: contract.listIds,
      originAllowlist: contract.originPolicy.allowedOrigins,
      allowPreview: contract.originPolicy.allowPreview,
      canInitialize: contract.canInitialize,
      blockingReasons: contract.blockingReasons,
      manifestIdMatchesExpected: contract.governed.manifestIdMatchesExpected,
      packageVersionMatchesExpected: contract.governed.packageVersionMatchesExpected,
    },
  };
  (globalThis as { __hbIntel_foleonRuntimeBindingProof?: unknown }).__hbIntel_foleonRuntimeBindingProof =
    proof;
  if (typeof window !== 'undefined' && globalThis !== window) {
    (
      window as unknown as { __hbIntel_foleonRuntimeBindingProof?: unknown }
    ).__hbIntel_foleonRuntimeBindingProof = proof;
  }
}
