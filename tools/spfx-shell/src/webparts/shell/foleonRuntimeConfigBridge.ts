export interface IShellFoleonRuntimeConfigProperties {
  contentRegistryListId?: string;
  placementsListId?: string;
  eventsListId?: string;
  acceptedFoleonOrigins?: string | string[];
  allowPreview?: boolean;
  expectedManifestId?: string;
  expectedPackageVersion?: string;
  foleonRoute?: 'highlights' | 'reader' | 'hub' | 'manage';
  foleonDocId?: string | number;
  foleonReaderRoutePath?: string;
  foleonApiBaseUrl?: string;
  foleonApiResource?: string;
}

type FoleonConfigKey = Exclude<
  keyof IShellFoleonRuntimeConfigProperties,
  'acceptedFoleonOrigins' | 'allowPreview' | 'foleonDocId'
>;

const FOLEON_TEXT_CONFIG_KEYS: FoleonConfigKey[] = [
  'contentRegistryListId',
  'placementsListId',
  'eventsListId',
  'expectedManifestId',
  'expectedPackageVersion',
  'foleonRoute',
  'foleonReaderRoutePath',
  'foleonApiBaseUrl',
  'foleonApiResource',
];

export function buildFoleonRuntimeConfigBridge(
  properties: IShellFoleonRuntimeConfigProperties,
): Record<string, unknown> {
  const runtimeConfig: Record<string, unknown> = {};

  for (const key of FOLEON_TEXT_CONFIG_KEYS) {
    const value = properties[key];
    if (typeof value === 'string' && value.trim()) {
      runtimeConfig[key] = value.trim();
    }
  }

  if (typeof properties.foleonDocId === 'number') {
    runtimeConfig.foleonDocId = properties.foleonDocId;
  } else if (typeof properties.foleonDocId === 'string' && properties.foleonDocId.trim()) {
    runtimeConfig.foleonDocId = properties.foleonDocId.trim();
  }

  if (typeof properties.allowPreview === 'boolean') {
    runtimeConfig.allowPreview = properties.allowPreview;
  }

  const origins = properties.acceptedFoleonOrigins;
  if (Array.isArray(origins)) {
    runtimeConfig.acceptedFoleonOrigins = origins
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(Boolean);
  } else if (typeof origins === 'string' && origins.trim()) {
    runtimeConfig.acceptedFoleonOrigins = origins
      .split(/[\n,]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return runtimeConfig;
}

export function applyFoleonRuntimeConfigBridge(
  runtimeConfig: Record<string, unknown>,
  webPartId: string | undefined,
  properties: IShellFoleonRuntimeConfigProperties,
  foleonWebPartId: string,
): void {
  if (webPartId !== foleonWebPartId) {
    return;
  }

  Object.assign(runtimeConfig, buildFoleonRuntimeConfigBridge(properties));
}
