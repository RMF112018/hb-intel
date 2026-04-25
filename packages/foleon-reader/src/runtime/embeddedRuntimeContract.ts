import {
  createFoleonOriginPolicy,
  DEFAULT_FOLEON_ORIGINS,
  type FoleonOriginPolicy,
} from '../services/FoleonOriginPolicy.js';

export type FoleonHostMode = 'sharepoint' | 'mock';

export type FoleonRoute =
  | 'highlights'
  | 'reader'
  | 'hub'
  | 'manage'
  | 'projectSpotlight'
  | 'companyPulse'
  | 'leadershipMessage';

export interface IFoleonMountConfig {
  readonly contentRegistryListId?: string;
  readonly placementsListId?: string;
  readonly eventsListId?: string;
  readonly acceptedFoleonOrigins?: ReadonlyArray<string>;
  readonly allowPreview?: boolean;
  readonly expectedManifestId?: string;
  readonly expectedPackageVersion?: string;
  readonly foleonRoute?: FoleonRoute;
  readonly foleonDocId?: number | string;
  readonly foleonReaderRoutePath?: string;
  readonly foleonApiBaseUrl?: string;
  readonly foleonApiResource?: string;
}

export interface FoleonEmbeddedPackageIdentity {
  readonly manifestId: string;
  readonly packageVersion: string;
}

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
  readonly telemetry: {
    readonly correlationId: string;
    readonly sessionId: string;
  };
  readonly canInitialize: boolean;
  readonly issues: ReadonlyArray<unknown>;
  readonly blockingReasons: ReadonlyArray<string>;
}

export interface FoleonTelemetryIdentity {
  readonly correlationId: string;
  readonly sessionId: string;
}

export function createEmbeddedFoleonRuntimeContract(params: {
  readonly hasSpfxContext: boolean;
  readonly siteUrl?: string;
  readonly config?: IFoleonMountConfig;
  readonly telemetryIdentity?: FoleonTelemetryIdentity;
  readonly packageIdentity: FoleonEmbeddedPackageIdentity;
  readonly getAccessToken?: () => Promise<string>;
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
  const manifestIdMatchesExpected =
    !expectedManifestId || expectedManifestId === params.packageIdentity.manifestId;
  const packageVersionMatchesExpected =
    !expectedPackageVersion || expectedPackageVersion === params.packageIdentity.packageVersion;
  const issues: string[] = [];
  if (hostMode === 'sharepoint') {
    if (!params.siteUrl) issues.push('missing-site-url');
    if (!listIds.contentRegistry) issues.push('missing-content-registry-list-id');
    if (originPolicy.allowedOrigins.length === 0) issues.push('no-origins-allowlisted');
    if (expectedManifestId && !manifestIdMatchesExpected) issues.push('manifest-id-mismatch');
    if (expectedPackageVersion && !packageVersionMatchesExpected) issues.push('package-version-mismatch');
  }

  return {
    hostMode,
    route,
    docId,
    siteUrl: params.siteUrl ?? null,
    listIds,
    originPolicy,
    governed: {
      expectedManifestId: params.packageIdentity.manifestId,
      expectedPackageVersion: params.packageIdentity.packageVersion,
      manifestIdMatchesExpected,
      packageVersionMatchesExpected,
    },
    readerRoutePath: normalizeText(params.config?.foleonReaderRoutePath),
    apiBaseUrl: normalizeText(params.config?.foleonApiBaseUrl),
    apiResource: normalizeText(params.config?.foleonApiResource),
    ...(params.getAccessToken ? { getAccessToken: params.getAccessToken } : {}),
    telemetry: {
      correlationId: params.telemetryIdentity?.correlationId ?? '',
      sessionId: params.telemetryIdentity?.sessionId ?? '',
    },
    canInitialize: hostMode === 'mock' || issues.length === 0,
    issues,
    blockingReasons: issues,
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
