/**
 * Resolves the Foleon mount config into an immutable runtime contract.
 *
 * Governance tightening (1.0.2.0): every blocking condition now
 * produces a typed `FoleonConfigIssue` with a stable error code. The
 * legacy `blockingReasons: string[]` is derived from the issue set
 * for back-compat with earlier tests and in-app admin diagnostics;
 * new consumers should inspect `issues` directly.
 */
import type { IFoleonMountConfig } from '../types/foleon-runtime.types.js';
import {
  createFoleonOriginPolicy,
  DEFAULT_FOLEON_ORIGINS,
  type FoleonOriginPolicy,
} from '../services/FoleonOriginPolicy.js';
import { FOLEON_PACKAGE_VERSION, FOLEON_WEBPART_ID } from '../webparts/foleon/runtimeContract.js';
import {
  makeIssue,
  type FoleonConfigIssue,
} from './foleonConfigIssues.js';

export type FoleonHostMode = 'sharepoint' | 'mock';
export type FoleonRoute =
  | 'highlights'
  | 'reader'
  | 'hub'
  | 'manage'
  | 'projectSpotlight'
  | 'companyPulse'
  | 'leadershipMessage';

export interface IFoleonRuntimeContract {
  readonly hostMode: FoleonHostMode;
  readonly route: FoleonRoute;
  readonly docId: number | null;
  readonly siteUrl: string | null;
  readonly listIds: {
    readonly contentRegistry: string | null;
    readonly placements: string | null;
    readonly events: string | null;
  };
  readonly originPolicy: FoleonOriginPolicy;
  readonly governed: {
    readonly expectedManifestId: string;
    readonly expectedPackageVersion: string;
    readonly manifestIdMatchesExpected: boolean;
    readonly packageVersionMatchesExpected: boolean;
  };
  readonly readerRoutePath: string | null;
  readonly apiBaseUrl: string | null;
  readonly apiResource: string | null;
  readonly getAccessToken?: () => Promise<string>;
  readonly foleonReadiness?: FoleonRuntimeReadiness;
  readonly foleonConfigDiagnostics?: FoleonConfigDiagnostics;
  /**
   * Identity carried on every outbound telemetry envelope.
   * `correlationId` is per-mount; `sessionId` is per-browser-session.
   */
  readonly telemetry: {
    readonly correlationId: string;
    readonly sessionId: string;
  };
  readonly canInitialize: boolean;
  readonly issues: ReadonlyArray<FoleonConfigIssue>;
  /**
   * Derived from `issues` (admin-scope labels). Retained for existing
   * admin diagnostics surfaces and the runtime-contract test. New code
   * should inspect `issues` directly.
   */
  readonly blockingReasons: ReadonlyArray<string>;
}

export type FoleonReadinessIssueCode =
  | 'registry-unavailable'
  | 'registry-duplicate-active-key'
  | 'registry-secret-hygiene-failed'
  | 'list-bindings-missing'
  | 'backend-url-missing'
  | 'auth-resource-missing'
  | 'token-provider-unavailable'
  | 'token-acquisition-failed'
  | 'backend-safe-config-unavailable'
  | 'backend-graph-config-missing'
  | 'backend-route-authorization-unproven'
  | 'backend-route-authorization-failed'
  | 'sync-oauth-config-missing';

export interface FoleonRuntimeReadiness {
  readonly registryReady: boolean;
  readonly listBindingsReady: boolean;
  readonly backendUrlReady: boolean;
  readonly authResourceReady: boolean;
  readonly tokenProviderReady: boolean;
  readonly tokenAcquisitionReady: boolean;
  readonly backendSafeConfigReady: boolean;
  readonly backendRouteAuthorizationReady: boolean;
  readonly readPathReady: boolean;
  readonly writePathReady: boolean;
  readonly syncPathReady: boolean;
}

export interface FoleonConfigDiagnostics {
  readonly registryFetchStatus?: 'not-configured' | 'available' | 'unavailable';
  readonly registryFetchMessage?: string;
  readonly registryDuplicateActiveKeysDetected?: boolean;
  readonly registrySecretHygieneStatus?: 'pass' | 'fail' | 'unknown';
  readonly configSourceByKey?: Readonly<Record<string, string>>;
  readonly configStatusByKey?: Readonly<Record<string, string>>;
  readonly blockers: ReadonlyArray<{
    readonly code: FoleonReadinessIssueCode;
    readonly message: string;
  }>;
}

export interface FoleonTelemetryIdentity {
  readonly correlationId: string;
  readonly sessionId: string;
}

export function resolveFoleonRuntimeContract(params: {
  readonly hasSpfxContext: boolean;
  readonly siteUrl?: string;
  readonly config?: IFoleonMountConfig;
  readonly telemetryIdentity?: FoleonTelemetryIdentity;
}): IFoleonRuntimeContract {
  const hostMode: FoleonHostMode = params.hasSpfxContext ? 'sharepoint' : 'mock';
  const route = normalizeRoute(params.config?.foleonRoute);
  const docId = parseDocId(params.config?.foleonDocId);
  const expectedManifestId = normalizeText(params.config?.expectedManifestId);
  const expectedPackageVersion = normalizeText(params.config?.expectedPackageVersion);
  const originPolicy = createFoleonOriginPolicy(
    params.config?.acceptedFoleonOrigins,
    params.config?.allowPreview,
  );
  const listIds = {
    contentRegistry: normalizeText(params.config?.contentRegistryListId),
    placements: normalizeText(params.config?.placementsListId),
    events: normalizeText(params.config?.eventsListId),
  };
  const readerRoutePath = normalizeText(params.config?.foleonReaderRoutePath);
  const apiBaseUrl = normalizeText(params.config?.foleonApiBaseUrl);
  const apiResource = normalizeText(params.config?.foleonApiResource);
  const listBindingsReady = Boolean(listIds.contentRegistry && (route !== 'highlights' || listIds.placements));
  const readiness: FoleonRuntimeReadiness = {
    registryReady: hostMode === 'mock',
    listBindingsReady,
    backendUrlReady: Boolean(apiBaseUrl),
    authResourceReady: Boolean(apiResource),
    tokenProviderReady: false,
    tokenAcquisitionReady: false,
    backendSafeConfigReady: false,
    backendRouteAuthorizationReady: false,
    readPathReady: hostMode === 'mock',
    writePathReady: false,
    syncPathReady: false,
  };

  const manifestIdMatchesExpected =
    !expectedManifestId || expectedManifestId === FOLEON_WEBPART_ID;
  const packageVersionMatchesExpected =
    !expectedPackageVersion || expectedPackageVersion === FOLEON_PACKAGE_VERSION;

  const issues: FoleonConfigIssue[] = [];
  if (hostMode === 'sharepoint') {
    if (!params.siteUrl) issues.push(makeIssue('missing-site-url'));
    if (!listIds.contentRegistry) issues.push(makeIssue('missing-content-registry-list-id'));
    if (route === 'highlights' && !listIds.placements)
      issues.push(makeIssue('missing-placements-list-id'));
    if (originPolicy.allowedOrigins.length === 0)
      issues.push(makeIssue('no-origins-allowlisted'));
    if (expectedManifestId && !manifestIdMatchesExpected)
      issues.push(makeIssue('manifest-id-mismatch'));
    if (expectedPackageVersion && !packageVersionMatchesExpected)
      issues.push(makeIssue('package-version-mismatch'));
  }
  const blockingReasons = issues.map((issue) => issue.adminLabel);

  return {
    hostMode,
    route,
    docId,
    siteUrl: params.siteUrl ?? null,
    listIds,
    originPolicy,
    governed: {
      expectedManifestId: FOLEON_WEBPART_ID,
      expectedPackageVersion: FOLEON_PACKAGE_VERSION,
      manifestIdMatchesExpected,
      packageVersionMatchesExpected,
    },
    readerRoutePath,
    apiBaseUrl,
    apiResource,
    foleonReadiness: readiness,
    foleonConfigDiagnostics: { blockers: [] },
    telemetry: {
      correlationId: params.telemetryIdentity?.correlationId ?? '',
      sessionId: params.telemetryIdentity?.sessionId ?? '',
    },
    canInitialize: hostMode === 'mock' || issues.length === 0,
    issues,
    blockingReasons,
  };
}

export { DEFAULT_FOLEON_ORIGINS };

function normalizeRoute(value: unknown): FoleonRoute {
  if (
    value === 'reader' ||
    value === 'hub' ||
    value === 'highlights' ||
    value === 'manage' ||
    value === 'projectSpotlight' ||
    value === 'companyPulse' ||
    value === 'leadershipMessage'
  ) {
    return value;
  }
  return 'highlights';
}

function parseDocId(value: number | string | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
