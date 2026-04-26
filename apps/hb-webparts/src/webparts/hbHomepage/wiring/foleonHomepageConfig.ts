import type {
  FoleonEmbeddedReaderLaneKey,
  IFoleonMountConfig,
} from '@hbc/foleon-reader';
import {
  resolveFoleonRegistryRuntimeConfig,
  type FoleonRegistryBootstrapConfig,
} from '@hbc/foleon-reader';

export const HOMEPAGE_EMBEDDED_FOLEON_MANIFEST_ID = '2160edb3-675e-4451-92bb-8345f9d1c71e';
export const HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION = '1.0.23.0';

export interface HomepageFoleonConfig {
  readonly foleonContentRegistryListId?: string;
  readonly foleonPlacementsListId?: string;
  readonly foleonEventsListId?: string;
  readonly foleonAcceptedOrigins?: ReadonlyArray<string>;
  readonly foleonAllowPreview?: boolean;
  readonly foleonExpectedManifestId: string;
  readonly foleonExpectedPackageVersion: string;
  readonly foleonApiBaseUrl?: string;
  readonly foleonApiResource?: string;
}

export function extractHomepageFoleonConfig(
  config: Record<string, unknown> | undefined,
): HomepageFoleonConfig {
  const nested = isRecord(config?.foleon) ? config.foleon : undefined;
  const explicitMountConfig: IFoleonMountConfig = {
    contentRegistryListId: readString(
      config?.foleonContentRegistryListId ?? nested?.foleonContentRegistryListId,
    ),
    placementsListId: readString(
      config?.foleonPlacementsListId ?? nested?.foleonPlacementsListId,
    ),
    eventsListId: readString(
      config?.foleonEventsListId ?? nested?.foleonEventsListId,
    ),
    acceptedFoleonOrigins: readOrigins(
      config?.foleonAcceptedOrigins ?? nested?.foleonAcceptedOrigins,
    ),
    allowPreview: readBoolean(
      config?.foleonAllowPreview ?? nested?.foleonAllowPreview,
    ),
    expectedManifestId: readString(
      config?.foleonExpectedManifestId ?? nested?.foleonExpectedManifestId,
    ),
    expectedPackageVersion: readString(
      config?.foleonExpectedPackageVersion ?? nested?.foleonExpectedPackageVersion,
    ),
    foleonApiBaseUrl: readString(config?.foleonApiBaseUrl ?? nested?.foleonApiBaseUrl),
    foleonApiResource: readString(config?.foleonApiResource ?? nested?.foleonApiResource),
  };
  const registry = readRegistryBootstrap(config?.platformConfigRegistry ?? nested?.platformConfigRegistry);
  const resolved = resolveFoleonRegistryRuntimeConfig({
    overrides: explicitMountConfig,
    registry,
    defaultConfig: {
      expectedManifestId: HOMEPAGE_EMBEDDED_FOLEON_MANIFEST_ID,
      expectedPackageVersion: HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION,
    },
  }).config;

  return {
    foleonContentRegistryListId: resolved.contentRegistryListId,
    foleonPlacementsListId: resolved.placementsListId,
    foleonEventsListId: resolved.eventsListId,
    foleonAcceptedOrigins: resolved.acceptedFoleonOrigins,
    foleonAllowPreview: resolved.allowPreview,
    foleonExpectedManifestId: resolved.expectedManifestId ?? HOMEPAGE_EMBEDDED_FOLEON_MANIFEST_ID,
    foleonExpectedPackageVersion: resolved.expectedPackageVersion ?? HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION,
    foleonApiBaseUrl: resolved.foleonApiBaseUrl,
    foleonApiResource: resolved.foleonApiResource,
  };
}

export function readHomepageFoleonApiResource(
  config: Record<string, unknown> | undefined,
): string | undefined {
  return extractHomepageFoleonConfig(config).foleonApiResource;
}

export function toEmbeddedFoleonMountConfig(
  config: HomepageFoleonConfig,
  lane: FoleonEmbeddedReaderLaneKey,
): IFoleonMountConfig {
  return {
    contentRegistryListId: config.foleonContentRegistryListId,
    placementsListId: config.foleonPlacementsListId,
    eventsListId: config.foleonEventsListId,
    acceptedFoleonOrigins: config.foleonAcceptedOrigins,
    allowPreview: config.foleonAllowPreview,
    expectedManifestId: config.foleonExpectedManifestId,
    expectedPackageVersion: config.foleonExpectedPackageVersion,
    foleonRoute: lane,
    foleonApiBaseUrl: config.foleonApiBaseUrl,
    foleonApiResource: config.foleonApiResource,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRegistryBootstrap(value: unknown): FoleonRegistryBootstrapConfig | undefined {
  return isRecord(value) && isRecord(value.bootstrap) ? value as unknown as FoleonRegistryBootstrapConfig : undefined;
}

function readString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function readOrigins(value: unknown): ReadonlyArray<string> | undefined {
  if (Array.isArray(value)) {
    const origins = value
      .map((entry) => readString(entry))
      .filter((entry): entry is string => Boolean(entry));
    return origins.length > 0 ? origins : undefined;
  }
  if (typeof value === 'string') {
    const origins = value
      .split(/[\n,]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    return origins.length > 0 ? origins : undefined;
  }
  return undefined;
}
