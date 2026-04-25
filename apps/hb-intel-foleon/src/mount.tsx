/**
 * Foleon SPFx mount entry.
 *
 * Vite compiles this into an IIFE (`hb-intel-foleon-app.js`) exposed
 * at `window.__hbIntel_foleon`. The SPFx shell webpart loads the
 * bundle and calls `mount(domElement, spfxContext, config)`.
 *
 * Runtime binding proof (1.0.2.0) is published at
 * `window.__hbIntel_foleonRuntimeBindingProof` in a redacted shape:
 * list GUIDs, origin allowlist entries, reader route path, docId,
 * and caller-supplied expected manifest/version values are replaced
 * with presence booleans plus deterministic fingerprints so operators
 * can correlate deploys without the proof carrying sensitive config
 * values. Admin-scope issue detail is additionally exposed via
 * `diagnostics` only when the page URL carries
 * `?foleon-diagnostics=1`; a standard audit-scope proof is always
 * published.
 */
import { createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { storeSiteUrl } from '@hbc/sharepoint-platform';
import { FoleonApp } from './FoleonApp.js';
import { FOLEON_PACKAGE_VERSION, FOLEON_WEBPART_ID } from './webparts/foleon/runtimeContract.js';
import {
  resolveFoleonRuntimeContract,
  type IFoleonRuntimeContract,
} from './runtime/foleonRuntimeContract.js';
import type { IFoleonMountConfig } from './types/foleon-runtime.types.js';
import {
  fingerprintString,
  fingerprintStringSet,
} from './runtime/foleonFingerprint.js';
import {
  adminIssueDetails,
  type FoleonConfigErrorCode,
} from './runtime/foleonConfigIssues.js';
import {
  createFoleonEventId,
  resolveFoleonSessionId,
} from './services/FoleonTelemetryEmitter.js';

let root: Root | undefined;

export type { IFoleonMountConfig };

export const FOLEON_DIAGNOSTICS_QUERY_FLAG = 'foleon-diagnostics';

export async function mount(
  el: HTMLElement,
  spfxContext?: WebPartContext,
  config?: IFoleonMountConfig,
): Promise<void> {
  storeSiteUrl(spfxContext?.pageContext?.web?.absoluteUrl);
  const siteUrl = spfxContext?.pageContext?.web?.absoluteUrl;
  const telemetryIdentity = {
    correlationId: createFoleonEventId(),
    sessionId: resolveFoleonSessionId(),
  };
  const contract = resolveFoleonRuntimeContract({
    hasSpfxContext: !!spfxContext,
    siteUrl,
    config,
    telemetryIdentity,
  });
  const tokenProvider =
    spfxContext && config?.foleonApiResource
      ? await createBackendTokenProvider(spfxContext, config.foleonApiResource)
      : undefined;
  const mountedContract: IFoleonRuntimeContract = tokenProvider
    ? { ...contract, getAccessToken: tokenProvider }
    : contract;
  publishRuntimeBindingProof(mountedContract, config);

  root = createRoot(el);
  root.render(createElement(FoleonApp, { contract: mountedContract }) as ReactNode);
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

export interface IFoleonRuntimeBindingProof {
  readonly generatedAt: string;
  readonly bundleMarker: '__hbIntel_foleon';
  readonly manifestId: string;
  readonly packageVersion: string;
  readonly hostMode: 'sharepoint' | 'mock';
  readonly route: 'highlights' | 'reader' | 'hub' | 'manage' | 'projectSpotlight' | 'companyPulse' | 'leadershipMessage';
  readonly canInitialize: boolean;
  readonly presence: {
    readonly spfxContext: boolean;
    readonly siteUrl: boolean;
    readonly contentRegistryListId: boolean;
    readonly placementsListId: boolean;
    readonly eventsListId: boolean;
    readonly readerRoutePath: boolean;
    readonly apiBaseUrl: boolean;
    readonly apiResource: boolean;
    readonly docId: boolean;
    readonly callerSuppliedExpectedManifestId: boolean;
    readonly callerSuppliedExpectedPackageVersion: boolean;
  };
  readonly fingerprints: {
    readonly contentRegistryListSha: string;
    readonly placementsListSha: string;
    readonly eventsListSha: string;
    readonly readerRoutePathSha: string;
    readonly originAllowlistSha: string;
    readonly originAllowlistCount: number;
  };
  readonly originPolicy: {
    readonly allowPreview: boolean;
    readonly hasAllowlist: boolean;
  };
  readonly governance: {
    readonly manifestIdMatchesExpected: boolean;
    readonly packageVersionMatchesExpected: boolean;
  };
  readonly foleonPropertyBridge: {
    readonly webPartPropertiesPresent: boolean;
    readonly topLevelConfigPresent: FoleonPropertyBridgePresence;
    readonly nestedWebPartPropertiesPresent: FoleonPropertyBridgePresence;
    readonly bridgeAppearsApplied: boolean;
  };
  readonly configSource: {
    readonly contentRegistryListId: FoleonConfigSource;
    readonly placementsListId: FoleonConfigSource;
    readonly eventsListId: FoleonConfigSource;
    readonly foleonRoute: FoleonConfigSource;
  };
  readonly issueCodes: ReadonlyArray<FoleonConfigErrorCode>;
  /**
   * Present only when the page URL carried `?foleon-diagnostics=1`
   * at mount time. Standard tenant pages never emit this field.
   */
  readonly diagnostics?: {
    readonly adminIssues: ReadonlyArray<{
      readonly code: FoleonConfigErrorCode;
      readonly adminLabel: string;
      readonly adminRemediation: string;
    }>;
  };
}

type FoleonConfigSource = 'top-level' | 'nested-only' | 'missing';

interface FoleonPropertyBridgePresence {
  readonly contentRegistryListId: boolean;
  readonly placementsListId: boolean;
  readonly eventsListId: boolean;
  readonly foleonRoute: boolean;
  readonly expectedManifestId: boolean;
  readonly expectedPackageVersion: boolean;
  readonly acceptedFoleonOrigins: boolean;
  readonly allowPreview: boolean;
}

function publishRuntimeBindingProof(
  contract: IFoleonRuntimeContract,
  config: IFoleonMountConfig | undefined,
): void {
  const diagnosticsEnabled = shouldEnableDiagnostics();
  const bridgeDiagnostics = buildFoleonPropertyBridgeDiagnostics(config);
  const proof: IFoleonRuntimeBindingProof = {
    generatedAt: new Date().toISOString(),
    bundleMarker: '__hbIntel_foleon',
    manifestId: FOLEON_WEBPART_ID,
    packageVersion: FOLEON_PACKAGE_VERSION,
    hostMode: contract.hostMode,
    route: contract.route,
    canInitialize: contract.canInitialize,
    presence: {
      spfxContext: contract.hostMode === 'sharepoint',
      siteUrl: !!contract.siteUrl,
      contentRegistryListId: !!contract.listIds.contentRegistry,
      placementsListId: !!contract.listIds.placements,
      eventsListId: !!contract.listIds.events,
      readerRoutePath: !!contract.readerRoutePath,
      apiBaseUrl: !!contract.apiBaseUrl,
      apiResource: !!contract.apiResource,
      docId: contract.docId !== null,
      callerSuppliedExpectedManifestId: !!config?.expectedManifestId,
      callerSuppliedExpectedPackageVersion: !!config?.expectedPackageVersion,
    },
    fingerprints: {
      contentRegistryListSha: contract.listIds.contentRegistry
        ? fingerprintString(contract.listIds.contentRegistry)
        : '00000000',
      placementsListSha: contract.listIds.placements
        ? fingerprintString(contract.listIds.placements)
        : '00000000',
      eventsListSha: contract.listIds.events
        ? fingerprintString(contract.listIds.events)
        : '00000000',
      readerRoutePathSha: contract.readerRoutePath
        ? fingerprintString(contract.readerRoutePath)
        : '00000000',
      originAllowlistSha: fingerprintStringSet(contract.originPolicy.allowedOrigins),
      originAllowlistCount: contract.originPolicy.allowedOrigins.length,
    },
    originPolicy: {
      allowPreview: contract.originPolicy.allowPreview,
      hasAllowlist: contract.originPolicy.allowedOrigins.length > 0,
    },
    governance: {
      manifestIdMatchesExpected: contract.governed.manifestIdMatchesExpected,
      packageVersionMatchesExpected: contract.governed.packageVersionMatchesExpected,
    },
    foleonPropertyBridge: bridgeDiagnostics.foleonPropertyBridge,
    configSource: bridgeDiagnostics.configSource,
    issueCodes: contract.issues.map((issue) => issue.code),
    ...(diagnosticsEnabled
      ? {
          diagnostics: {
            adminIssues: adminIssueDetails(contract.issues),
          },
        }
      : {}),
  };
  (globalThis as { __hbIntel_foleonRuntimeBindingProof?: IFoleonRuntimeBindingProof })
    .__hbIntel_foleonRuntimeBindingProof = proof;
  if (typeof window !== 'undefined' && globalThis !== window) {
    (
      window as unknown as {
        __hbIntel_foleonRuntimeBindingProof?: IFoleonRuntimeBindingProof;
      }
    ).__hbIntel_foleonRuntimeBindingProof = proof;
  }
}

const FOLEON_BRIDGE_KEYS = [
  'contentRegistryListId',
  'placementsListId',
  'eventsListId',
  'foleonRoute',
  'expectedManifestId',
  'expectedPackageVersion',
  'acceptedFoleonOrigins',
  'allowPreview',
] as const;

type FoleonSourceKey = 'contentRegistryListId' | 'placementsListId' | 'eventsListId' | 'foleonRoute';

function buildFoleonPropertyBridgeDiagnostics(config: IFoleonMountConfig | undefined): Pick<
  IFoleonRuntimeBindingProof,
  'foleonPropertyBridge' | 'configSource'
> {
  const topLevelConfig = config as Record<string, unknown> | undefined;
  const nestedProperties = topLevelConfig?.webPartProperties;
  const nestedConfig =
    nestedProperties && typeof nestedProperties === 'object'
      ? nestedProperties as Record<string, unknown>
      : undefined;

  const topLevelConfigPresent = buildBridgePresence(topLevelConfig);
  const nestedWebPartPropertiesPresent = buildBridgePresence(nestedConfig);
  const nestedBridgeKeys = FOLEON_BRIDGE_KEYS.filter((key) => nestedWebPartPropertiesPresent[key]);
  const bridgeAppearsApplied =
    nestedBridgeKeys.length > 0 &&
    nestedBridgeKeys.some((key) => topLevelConfigPresent[key]);

  return {
    foleonPropertyBridge: {
      webPartPropertiesPresent: !!nestedConfig,
      topLevelConfigPresent,
      nestedWebPartPropertiesPresent,
      bridgeAppearsApplied,
    },
    configSource: {
      contentRegistryListId: resolveConfigSource('contentRegistryListId', topLevelConfigPresent, nestedWebPartPropertiesPresent),
      placementsListId: resolveConfigSource('placementsListId', topLevelConfigPresent, nestedWebPartPropertiesPresent),
      eventsListId: resolveConfigSource('eventsListId', topLevelConfigPresent, nestedWebPartPropertiesPresent),
      foleonRoute: resolveConfigSource('foleonRoute', topLevelConfigPresent, nestedWebPartPropertiesPresent),
    },
  };
}

function buildBridgePresence(config: Record<string, unknown> | undefined): FoleonPropertyBridgePresence {
  return {
    contentRegistryListId: hasConfigValue(config?.contentRegistryListId),
    placementsListId: hasConfigValue(config?.placementsListId),
    eventsListId: hasConfigValue(config?.eventsListId),
    foleonRoute: hasConfigValue(config?.foleonRoute),
    expectedManifestId: hasConfigValue(config?.expectedManifestId),
    expectedPackageVersion: hasConfigValue(config?.expectedPackageVersion),
    acceptedFoleonOrigins: hasConfigValue(config?.acceptedFoleonOrigins),
    allowPreview: typeof config?.allowPreview === 'boolean',
  };
}

function hasConfigValue(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null;
}

function resolveConfigSource(
  key: FoleonSourceKey,
  topLevelConfigPresent: FoleonPropertyBridgePresence,
  nestedWebPartPropertiesPresent: FoleonPropertyBridgePresence,
): FoleonConfigSource {
  if (topLevelConfigPresent[key]) return 'top-level';
  if (nestedWebPartPropertiesPresent[key]) return 'nested-only';
  return 'missing';
}

async function createBackendTokenProvider(
  spfxContext: WebPartContext,
  resource: string,
): Promise<(() => Promise<string>) | undefined> {
  try {
    const provider = await spfxContext.aadTokenProviderFactory.getTokenProvider();
    return () => provider.getToken(resource);
  } catch {
    return undefined;
  }
}

function shouldEnableDiagnostics(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(FOLEON_DIAGNOSTICS_QUERY_FLAG) === '1';
  } catch {
    return false;
  }
}
