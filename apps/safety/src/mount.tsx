/**
 * Production entry point for the Safety SPFx surface.
 *
 * Vite compiles this into an IIFE bundle (`safety-app.js`) exposed on
 * `window.__hbIntel_safety`. The SPFx shell webpart loads the bundle and
 * calls `mount(domElement, spfxContext, config)`.
 *
 * Not used during local Vite dev — `main.tsx` handles that path.
 *
 * CSS delivery: `webpart.css` is imported here (production entry) AND in
 * `main.tsx` (dev entry). In production, `vite-plugin-css-injected-by-js`
 * inlines the imported stylesheet as a runtime <style> tag inside the
 * IIFE bundle, so any SPFx shell that loads `safety-app.js` automatically
 * gets the Safety global stylesheet without additional asset wiring.
 * Missing this import was the root cause of the prior Upload-layout no-op:
 * the stylesheet existed in source and in tests but never reached hosted.
 */
import './webpart.css';
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { App } from './App.js';
import { bootstrapSpfxAuth, resolveSpfxPermissions } from '@hbc/auth/spfx';
import {
  bindHostedSafetyGuidOverlay,
  hostedSafetyGuidOverlayFingerprint,
} from './runtime/hostedSafetyGuidBinding.js';
import {
  resolveSafetyRuntimeContract,
  type ISafetyMountConfig,
} from './runtime/safetyRuntimeContract.js';
import {
  SAFETY_ACCEPTED_BACKEND_ORIGIN,
  SAFETY_BUILD_SHA,
  SAFETY_BUILD_TIMESTAMP,
  SAFETY_EXPECTED_API_AUDIENCE,
  SAFETY_PACKAGE_VERSION,
  SAFETY_WEBPART_MANIFEST_ID,
} from './runtime/governedRuntimeBinding.js';

/** Shell-injected runtime configuration. Reserved for future wiring. */
export type IMountConfig = ISafetyMountConfig;

let root: Root | undefined;

export async function mount(
  el: HTMLElement,
  spfxContext?: WebPartContext,
  config?: IMountConfig,
): Promise<void> {
  if (spfxContext) {
    bindHostedSafetyGuidOverlay();
    const permissionKeys = await resolveSpfxPermissions(spfxContext);
    await bootstrapSpfxAuth(spfxContext, permissionKeys);
  }

  const hostSource =
    spfxContext && isShellHostedMountConfig(config)
      ? 'shell-webpart'
      : spfxContext
        ? 'safety-webpart'
        : 'local-dev';
  const runtimeContract = resolveSafetyRuntimeContract({
    hasSpfxContext: !!spfxContext,
    config,
    hostSource,
  });
  publishRuntimeBindingProof(config, hostSource, runtimeContract);

  root = createRoot(el);
  root.render(
    <App
      spfxContext={spfxContext}
      runtimeContract={runtimeContract}
    />,
  );
}

export function unmount(): void {
  root?.unmount();
  root = undefined;
}

const api = { mount, unmount };
(globalThis as unknown as { __hbIntel_safety: unknown }).__hbIntel_safety = api;
(globalThis as unknown as { __hbIntel_safetyManifestId?: string }).__hbIntel_safetyManifestId =
  SAFETY_WEBPART_MANIFEST_ID;
if (typeof window !== 'undefined' && globalThis !== window) {
  (window as unknown as { __hbIntel_safety: unknown }).__hbIntel_safety = api;
  (window as unknown as { __hbIntel_safetyManifestId?: string }).__hbIntel_safetyManifestId =
    SAFETY_WEBPART_MANIFEST_ID;
}

function publishRuntimeBindingProof(
  config: IMountConfig | undefined,
  hostSource: 'shell-webpart' | 'safety-webpart' | 'local-dev',
  runtimeContract: ReturnType<typeof resolveSafetyRuntimeContract>,
): void {
  const proof = {
    generatedAt: new Date().toISOString(),
    hostSource,
    configured: {
      functionAppUrl: config?.functionAppUrl ?? null,
      apiAudience: config?.apiAudience ?? null,
      acceptedBackendOrigin: config?.acceptedBackendOrigin ?? null,
      expectedManifestId: config?.expectedManifestId ?? null,
      expectedPackageVersion: config?.expectedPackageVersion ?? null,
      expectedApiAudience: config?.expectedApiAudience ?? null,
      expectedHostedGuidOverlayFingerprint: config?.expectedHostedGuidOverlayFingerprint ?? null,
      webPartId: config?.webPartId ?? null,
    },
    governedAuthority: {
      expectedManifestId: SAFETY_WEBPART_MANIFEST_ID,
      expectedPackageVersion: SAFETY_PACKAGE_VERSION,
      expectedAcceptedBackendOrigin: SAFETY_ACCEPTED_BACKEND_ORIGIN,
      expectedApiAudience: SAFETY_EXPECTED_API_AUDIENCE,
      expectedHostedGuidOverlayFingerprint: hostedSafetyGuidOverlayFingerprint(),
      buildSha: SAFETY_BUILD_SHA,
      buildTimestamp: SAFETY_BUILD_TIMESTAMP,
    },
    runtimeContract: {
      canInitializeCommands: runtimeContract.canInitializeCommands,
      blockingReasons: runtimeContract.blockingReasons,
      backend: runtimeContract.backend,
      governed: runtimeContract.governed,
      hostedGuidOverlay: runtimeContract.hostedGuidOverlay,
    },
  };
  (
    globalThis as unknown as {
      __hbIntel_safetyRuntimeBindingProof?: unknown;
    }
  ).__hbIntel_safetyRuntimeBindingProof = proof;
  if (typeof window !== 'undefined' && globalThis !== window) {
    (
      window as unknown as {
        __hbIntel_safetyRuntimeBindingProof?: unknown;
      }
    ).__hbIntel_safetyRuntimeBindingProof = proof;
  }
}

function isShellHostedMountConfig(config: IMountConfig | undefined): boolean {
  if (!config) return false;
  return typeof (config as Record<string, unknown>).webPartId === 'string';
}
