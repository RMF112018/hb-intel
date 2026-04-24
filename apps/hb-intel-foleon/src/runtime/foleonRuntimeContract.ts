/**
 * Resolves the Foleon mount config into an immutable runtime contract.
 *
 * Mirrors the governed-authority proof pattern used by the Safety and
 * HB Publisher apps: consumers (tests, mount surface) get a single
 * object to inspect host/config readiness without poking at mount
 * params imperatively.
 */
import type { IFoleonMountConfig } from '../types/foleon-runtime.types.js';
import {
  createFoleonOriginPolicy,
  DEFAULT_FOLEON_ORIGINS,
  type FoleonOriginPolicy,
} from '../services/FoleonOriginPolicy.js';
import { FOLEON_PACKAGE_VERSION, FOLEON_WEBPART_ID } from '../webparts/foleon/runtimeContract.js';

export type FoleonHostMode = 'sharepoint' | 'mock';
export type FoleonRoute = 'highlights' | 'reader' | 'hub';

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
  readonly canInitialize: boolean;
  readonly blockingReasons: ReadonlyArray<string>;
}

export function resolveFoleonRuntimeContract(params: {
  readonly hasSpfxContext: boolean;
  readonly siteUrl?: string;
  readonly config?: IFoleonMountConfig;
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

  const blockingReasons: string[] = [];
  if (hostMode === 'sharepoint') {
    if (!params.siteUrl) blockingReasons.push('SharePoint site URL is missing.');
    if (!listIds.contentRegistry && route !== 'reader')
      blockingReasons.push('HB_FoleonContentRegistry list GUID is missing.');
    if (!listIds.contentRegistry && route === 'reader')
      blockingReasons.push('HB_FoleonContentRegistry list GUID is missing.');
    if (route === 'highlights' && !listIds.placements)
      blockingReasons.push('HB_FoleonHomepagePlacements list GUID is missing.');
    if (originPolicy.allowedOrigins.length === 0)
      blockingReasons.push('No Foleon origins are allowlisted.');
  }

  const manifestIdMatchesExpected =
    !expectedManifestId || expectedManifestId === FOLEON_WEBPART_ID;
  const packageVersionMatchesExpected =
    !expectedPackageVersion || expectedPackageVersion === FOLEON_PACKAGE_VERSION;
  if (hostMode === 'sharepoint' && expectedManifestId && !manifestIdMatchesExpected) {
    blockingReasons.push('Expected manifest ID does not match Foleon webpart authority.');
  }
  if (hostMode === 'sharepoint' && expectedPackageVersion && !packageVersionMatchesExpected) {
    blockingReasons.push('Expected package version does not match governed Foleon package version.');
  }

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
    canInitialize: hostMode === 'mock' || blockingReasons.length === 0,
    blockingReasons,
  };
}

export { DEFAULT_FOLEON_ORIGINS };

function normalizeRoute(value: unknown): FoleonRoute {
  if (value === 'reader' || value === 'hub' || value === 'highlights') return value;
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
