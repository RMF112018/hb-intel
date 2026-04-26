import type { IFoleonMountConfig } from './embeddedRuntimeContract.js';

export type PlatformConfigSource =
  | 'override'
  | 'registry'
  | 'default'
  | 'missing'
  | 'blocked'
  | 'invalid'
  | 'expired'
  | 'duplicate';

export interface PlatformConfigRegistryBootstrap {
  readonly siteUrl: string;
  readonly listTitle?: string;
  readonly listGuid?: string;
  readonly environmentKey: string;
  readonly scopeFallbacks?: Readonly<Record<string, ReadonlyArray<string>>>;
}

export interface PlatformConfigRegistryRecord {
  readonly applicationKey: string;
  readonly environmentKey: string;
  readonly scopeKey?: string;
  readonly configKey: string;
  readonly valueType: string;
  readonly isActive: boolean;
  readonly validationStatus: string;
  readonly isSecretReference: boolean;
  readonly secretReferenceName?: string;
  readonly configValue?: string;
  readonly configValueJson?: string;
  readonly listGuid?: string;
  readonly apiBaseUrl?: string;
  readonly apiResource?: string;
  readonly acceptedOrigins?: string;
  readonly expectedPackageVersion?: string;
  readonly effectiveFrom?: string;
  readonly effectiveThrough?: string;
}

export interface PlatformConfigResolution<T = unknown> {
  readonly key: string;
  readonly source: PlatformConfigSource;
  readonly value?: T;
  readonly diagnostics: ReadonlyArray<string>;
  readonly record?: PlatformConfigRegistryRecord;
}

export type FoleonRegistryConfigKey =
  | 'FoleonContentRegistryListGuid'
  | 'FoleonHomepagePlacementsListGuid'
  | 'FoleonInteractionEventsListGuid'
  | 'FoleonSyncRunsListGuid'
  | 'FoleonApiBaseUrl'
  | 'FoleonApiResource'
  | 'AcceptedFoleonOrigins'
  | 'AllowPreview'
  | 'ExpectedManifestId'
  | 'FoleonExpectedPackageVersion'
  | 'HomepageExpectedPackageVersion'
  | 'MarketingNewHostPageUrl'
  | 'HBCentralHubSiteUrl'
  | 'BackendFunctionAppUrl';

export type FoleonRegistryReadinessState =
  | 'registry-unavailable'
  | 'registry-invalid'
  | 'registry-partial'
  | 'list-bindings-ready'
  | 'backend-url-ready'
  | 'auth-resource-missing'
  | 'token-provider-unavailable'
  | 'write-path-ready';

export interface FoleonRegistryBootstrapConfig {
  readonly bootstrap: PlatformConfigRegistryBootstrap;
  readonly records?: ReadonlyArray<PlatformConfigRegistryRecord>;
}

export interface FoleonRegistryRuntimeSummary {
  readonly registryResolved: boolean;
  readonly registryListPresent: boolean;
  readonly registryValuesResolvedCount: number;
  readonly registryValuesMissing: ReadonlyArray<FoleonRegistryConfigKey>;
  readonly registryValuesBlocked: ReadonlyArray<FoleonRegistryConfigKey>;
  readonly registryValuesInvalid: ReadonlyArray<FoleonRegistryConfigKey>;
  readonly registryValuesExpired: ReadonlyArray<FoleonRegistryConfigKey>;
  readonly configSourceByKey: Readonly<Record<FoleonRegistryConfigKey, PlatformConfigSource>>;
  readonly configStatusByKey: Readonly<Record<FoleonRegistryConfigKey, PlatformConfigSource>>;
  readonly registryDuplicateActiveKeysDetected: boolean;
  readonly registrySecretHygieneStatus: 'pass' | 'fail' | 'unknown';
  readonly registryReadinessState: FoleonRegistryReadinessState;
  readonly syncSupportConfigured: boolean;
  readonly foleonReadiness: {
    readonly listBindingsReady: boolean;
    readonly backendUrlReady: boolean;
    readonly authResourceReady: boolean;
    readonly tokenProviderReady: boolean;
    readonly writePathReady: boolean;
  };
  readonly fingerprints: Readonly<Record<string, string>>;
}

export interface ResolvedFoleonRegistryRuntimeConfig {
  readonly config: IFoleonMountConfig;
  readonly summary: FoleonRegistryRuntimeSummary;
}

export interface ResolveFoleonRegistryRuntimeConfigOptions {
  readonly overrides?: IFoleonMountConfig;
  readonly registry?: FoleonRegistryBootstrapConfig;
  readonly defaultConfig?: Partial<IFoleonMountConfig>;
  readonly tokenProviderReady?: boolean;
  readonly backendSafeConfigReady?: boolean;
}

const FOLEON_KEYS: ReadonlyArray<FoleonRegistryConfigKey> = [
  'FoleonContentRegistryListGuid',
  'FoleonHomepagePlacementsListGuid',
  'FoleonInteractionEventsListGuid',
  'FoleonSyncRunsListGuid',
  'FoleonApiBaseUrl',
  'FoleonApiResource',
  'AcceptedFoleonOrigins',
  'AllowPreview',
  'ExpectedManifestId',
  'FoleonExpectedPackageVersion',
  'HomepageExpectedPackageVersion',
  'MarketingNewHostPageUrl',
  'HBCentralHubSiteUrl',
  'BackendFunctionAppUrl',
];

const KEY_SCOPES: Readonly<Record<FoleonRegistryConfigKey, { applicationKey: string; scopeKey: string }>> = {
  FoleonContentRegistryListGuid: { applicationKey: 'Foleon', scopeKey: 'HBCentral' },
  FoleonHomepagePlacementsListGuid: { applicationKey: 'Foleon', scopeKey: 'HBCentral' },
  FoleonInteractionEventsListGuid: { applicationKey: 'Foleon', scopeKey: 'HBCentral' },
  FoleonSyncRunsListGuid: { applicationKey: 'Foleon', scopeKey: 'HBCentral' },
  FoleonApiBaseUrl: { applicationKey: 'Foleon', scopeKey: 'Backend' },
  FoleonApiResource: { applicationKey: 'Foleon', scopeKey: 'Backend' },
  AcceptedFoleonOrigins: { applicationKey: 'Foleon', scopeKey: 'SPFx' },
  AllowPreview: { applicationKey: 'Foleon', scopeKey: 'SPFx' },
  ExpectedManifestId: { applicationKey: 'Foleon', scopeKey: 'SPFx' },
  FoleonExpectedPackageVersion: { applicationKey: 'Foleon', scopeKey: 'SPFx' },
  HomepageExpectedPackageVersion: { applicationKey: 'Homepage', scopeKey: 'SPFx' },
  MarketingNewHostPageUrl: { applicationKey: 'Foleon', scopeKey: 'Marketing-New' },
  HBCentralHubSiteUrl: { applicationKey: 'Foleon', scopeKey: 'HBCentral' },
  BackendFunctionAppUrl: { applicationKey: 'FunctionApp', scopeKey: 'Backend' },
};

export function resolveFoleonRegistryRuntimeConfig(
  options: ResolveFoleonRegistryRuntimeConfigOptions,
): ResolvedFoleonRegistryRuntimeConfig {
  const overrides = options.overrides ?? {};
  const records = options.registry?.records ?? [];
  const environmentKey = options.registry?.bootstrap.environmentKey ?? 'Production';
  const resolutions = resolveFoleonRegistryValues(records, environmentKey, options.registry?.bootstrap.scopeFallbacks);
  const configSourceByKey = createSourceMap('missing');
  const configStatusByKey = createSourceMap('missing');
  const fingerprints: Record<string, string> = {};

  for (const key of FOLEON_KEYS) {
    const resolution = resolutions[key];
    configStatusByKey[key] = resolution.source;
    if (resolution.source === 'registry' && typeof resolution.value === 'string') {
      fingerprints[key] = fingerprintText(resolution.value);
    }
  }

  const config: IFoleonMountConfig = {
    ...overrides,
  };

  applyStringField(config, 'contentRegistryListId', overrides.contentRegistryListId, resolutions.FoleonContentRegistryListGuid, configSourceByKey, 'FoleonContentRegistryListGuid', options.defaultConfig?.contentRegistryListId);
  applyStringField(config, 'placementsListId', overrides.placementsListId, resolutions.FoleonHomepagePlacementsListGuid, configSourceByKey, 'FoleonHomepagePlacementsListGuid', options.defaultConfig?.placementsListId);
  applyStringField(config, 'eventsListId', overrides.eventsListId, resolutions.FoleonInteractionEventsListGuid, configSourceByKey, 'FoleonInteractionEventsListGuid', options.defaultConfig?.eventsListId);
  applyOriginField(config, overrides.acceptedFoleonOrigins, resolutions.AcceptedFoleonOrigins, configSourceByKey, options.defaultConfig?.acceptedFoleonOrigins);
  applyBooleanField(config, overrides.allowPreview, resolutions.AllowPreview, configSourceByKey, options.defaultConfig?.allowPreview);
  applyStringField(config, 'expectedManifestId', overrides.expectedManifestId, resolutions.ExpectedManifestId, configSourceByKey, 'ExpectedManifestId', options.defaultConfig?.expectedManifestId);
  applyStringField(config, 'expectedPackageVersion', overrides.expectedPackageVersion, resolutions.FoleonExpectedPackageVersion, configSourceByKey, 'FoleonExpectedPackageVersion', options.defaultConfig?.expectedPackageVersion);
  applyApiBaseUrl(config, overrides.foleonApiBaseUrl, resolutions, configSourceByKey, options.defaultConfig?.foleonApiBaseUrl);
  applyStringField(config, 'foleonApiResource', overrides.foleonApiResource, resolutions.FoleonApiResource, configSourceByKey, 'FoleonApiResource', options.defaultConfig?.foleonApiResource);

  const listBindingsReady = isGuid(config.contentRegistryListId) && isGuid(config.placementsListId) && isGuid(config.eventsListId);
  const backendUrlReady = isBackendUrl(config.foleonApiBaseUrl);
  const authResourceReady = Boolean(normalizeText(config.foleonApiResource));
  const tokenProviderReady = Boolean(options.tokenProviderReady && authResourceReady);
  const writePathReady = Boolean(backendUrlReady && authResourceReady && tokenProviderReady && options.backendSafeConfigReady);
  const registryResolved = records.length > 0;
  const duplicateActiveKeys = FOLEON_KEYS.some((key) => configStatusByKey[key] === 'duplicate');
  const registrySecretHygieneStatus = records.length === 0 ? 'unknown' : records.some(hasSecretHygieneIssue) ? 'fail' : 'pass';

  return {
    config,
    summary: {
      registryResolved,
      registryListPresent: Boolean(options.registry?.bootstrap.listTitle || options.registry?.bootstrap.listGuid),
      registryValuesResolvedCount: FOLEON_KEYS.filter((key) => configStatusByKey[key] === 'registry').length,
      registryValuesMissing: keysWithSource(configStatusByKey, 'missing'),
      registryValuesBlocked: keysWithSource(configStatusByKey, 'blocked'),
      registryValuesInvalid: keysWithSource(configStatusByKey, 'invalid'),
      registryValuesExpired: keysWithSource(configStatusByKey, 'expired'),
      configSourceByKey,
      configStatusByKey,
      registryDuplicateActiveKeysDetected: duplicateActiveKeys,
      registrySecretHygieneStatus,
      registryReadinessState: resolveReadinessState({
        registryResolved,
        duplicateActiveKeys,
        registrySecretHygieneStatus,
        listBindingsReady,
        backendUrlReady,
        authResourceReady,
        tokenProviderReady,
        writePathReady,
      }),
      syncSupportConfigured: resolutions.FoleonSyncRunsListGuid.source === 'registry',
      foleonReadiness: {
        listBindingsReady,
        backendUrlReady,
        authResourceReady,
        tokenProviderReady,
        writePathReady,
      },
      fingerprints,
    },
  };
}

export function resolveFoleonRegistryValues(
  records: ReadonlyArray<PlatformConfigRegistryRecord>,
  environmentKey: string,
  fallbackRules: PlatformConfigRegistryBootstrap['scopeFallbacks'] = {},
): Readonly<Record<FoleonRegistryConfigKey, PlatformConfigResolution>> {
  const entries = FOLEON_KEYS.map((key) => {
    const target = KEY_SCOPES[key];
    return [
      key,
      resolvePlatformConfigValue(records, {
        applicationKey: target.applicationKey,
        environmentKey,
        scopeKey: target.scopeKey,
        configKey: key,
        scopeFallbacks: fallbackRules?.[key],
      }),
    ] as const;
  });
  return Object.fromEntries(entries) as Readonly<Record<FoleonRegistryConfigKey, PlatformConfigResolution>>;
}

function resolvePlatformConfigValue(
  records: ReadonlyArray<PlatformConfigRegistryRecord>,
  request: {
    readonly applicationKey: string;
    readonly environmentKey: string;
    readonly scopeKey: string;
    readonly configKey: string;
    readonly scopeFallbacks?: ReadonlyArray<string>;
  },
): PlatformConfigResolution {
  const scopes = [request.scopeKey, ...request.scopeFallbacks ?? []];
  for (const scopeKey of scopes) {
    const matches = records.filter((record) =>
      record.applicationKey === request.applicationKey &&
      record.environmentKey === request.environmentKey &&
      record.configKey === request.configKey &&
      record.scopeKey === scopeKey &&
      record.isActive,
    );
    if (matches.length > 1) {
      return { key: request.configKey, source: 'duplicate', diagnostics: ['Duplicate active registry records.'] };
    }
    if (matches.length === 1) {
      return normalizeRecord(matches[0]);
    }
  }
  return { key: request.configKey, source: 'missing', diagnostics: ['Missing active registry record.'] };
}

function normalizeRecord(record: PlatformConfigRegistryRecord): PlatformConfigResolution {
  const temporalStatus = getTemporalStatus(record);
  if (temporalStatus) {
    return { key: record.configKey, source: temporalStatus, diagnostics: [`Record is ${temporalStatus}.`], record };
  }
  const validationStatus = record.validationStatus.trim().toLowerCase();
  if (!['not validated', 'valid', 'warning'].includes(validationStatus)) {
    return {
      key: record.configKey,
      source: validationStatus === 'expired' ? 'expired' : 'blocked',
      diagnostics: [`Record status is ${record.validationStatus}.`],
      record,
    };
  }
  if (record.isSecretReference || record.valueType === 'SecretReference') {
    return {
      key: record.configKey,
      source: record.isSecretReference && record.secretReferenceName ? 'registry' : 'invalid',
      value: { secretReferencePresent: record.isSecretReference },
      diagnostics: [],
      record,
    };
  }
  try {
    return {
      key: record.configKey,
      source: 'registry',
      value: normalizeRecordValue(record),
      diagnostics: [],
      record,
    };
  } catch (error) {
    return {
      key: record.configKey,
      source: 'invalid',
      diagnostics: [error instanceof Error ? error.message : String(error)],
      record,
    };
  }
}

function normalizeRecordValue(record: PlatformConfigRegistryRecord): unknown {
  switch (record.valueType) {
    case 'Guid':
      return normalizeGuid(record.configValue ?? record.listGuid, record.configKey);
    case 'Url':
      if (record.configKey === 'FoleonApiResource') {
        return normalizeApiResource(record.configValue ?? record.apiResource, record.configKey);
      }
      return normalizeBackendUrl(record.configValue ?? record.apiBaseUrl, record.configKey);
    case 'OriginList':
      return normalizeOrigins(record);
    case 'Boolean':
      return normalizeBoolean(record.configValue, record.configKey);
    case 'Version':
      return normalizeVersion(record.configValue ?? record.expectedPackageVersion, record.configKey);
    case 'Json':
      return JSON.parse(requireText(record.configValueJson, record.configKey));
    case 'String':
      return requireText(record.configValue, record.configKey);
    case 'Number': {
      const parsed = Number(requireText(record.configValue, record.configKey));
      if (!Number.isFinite(parsed)) throw new Error(`${record.configKey} is not a valid number.`);
      return parsed;
    }
    default:
      throw new Error(`${record.configKey} has unsupported value type ${record.valueType}.`);
  }
}

function applyStringField<K extends keyof IFoleonMountConfig>(
  config: IFoleonMountConfig,
  field: K,
  overrideValue: IFoleonMountConfig[K],
  resolution: PlatformConfigResolution,
  sourceByKey: Record<FoleonRegistryConfigKey, PlatformConfigSource>,
  key: FoleonRegistryConfigKey,
  defaultValue?: IFoleonMountConfig[K],
): void {
  const override = typeof overrideValue === 'string' ? normalizeText(overrideValue) : undefined;
  if (override) {
    (config as Record<string, unknown>)[field as string] = override;
    sourceByKey[key] = 'override';
    return;
  }
  if (resolution.source === 'registry' && typeof resolution.value === 'string') {
    (config as Record<string, unknown>)[field as string] = resolution.value;
    sourceByKey[key] = 'registry';
    return;
  }
  const defaultText = typeof defaultValue === 'string' ? normalizeText(defaultValue) : undefined;
  if (defaultText) {
    (config as Record<string, unknown>)[field as string] = defaultText;
    sourceByKey[key] = 'default';
    return;
  }
  sourceByKey[key] = resolution.source;
}

function applyOriginField(
  config: IFoleonMountConfig,
  overrideValue: IFoleonMountConfig['acceptedFoleonOrigins'],
  resolution: PlatformConfigResolution,
  sourceByKey: Record<FoleonRegistryConfigKey, PlatformConfigSource>,
  defaultValue?: IFoleonMountConfig['acceptedFoleonOrigins'],
): void {
  if (overrideValue && overrideValue.length > 0) {
    (config as { acceptedFoleonOrigins?: ReadonlyArray<string> }).acceptedFoleonOrigins = overrideValue;
    sourceByKey.AcceptedFoleonOrigins = 'override';
    return;
  }
  if (resolution.source === 'registry' && Array.isArray(resolution.value)) {
    (config as { acceptedFoleonOrigins?: ReadonlyArray<string> }).acceptedFoleonOrigins = resolution.value as ReadonlyArray<string>;
    sourceByKey.AcceptedFoleonOrigins = 'registry';
    return;
  }
  if (defaultValue && defaultValue.length > 0) {
    (config as { acceptedFoleonOrigins?: ReadonlyArray<string> }).acceptedFoleonOrigins = defaultValue;
    sourceByKey.AcceptedFoleonOrigins = 'default';
    return;
  }
  sourceByKey.AcceptedFoleonOrigins = resolution.source;
}

function applyBooleanField(
  config: IFoleonMountConfig,
  overrideValue: boolean | undefined,
  resolution: PlatformConfigResolution,
  sourceByKey: Record<FoleonRegistryConfigKey, PlatformConfigSource>,
  defaultValue?: boolean,
): void {
  if (typeof overrideValue === 'boolean') {
    (config as { allowPreview?: boolean }).allowPreview = overrideValue;
    sourceByKey.AllowPreview = 'override';
    return;
  }
  if (resolution.source === 'registry' && typeof resolution.value === 'boolean') {
    (config as { allowPreview?: boolean }).allowPreview = resolution.value;
    sourceByKey.AllowPreview = 'registry';
    return;
  }
  if (typeof defaultValue === 'boolean') {
    (config as { allowPreview?: boolean }).allowPreview = defaultValue;
    sourceByKey.AllowPreview = 'default';
    return;
  }
  sourceByKey.AllowPreview = resolution.source;
}

function applyApiBaseUrl(
  config: IFoleonMountConfig,
  overrideValue: string | undefined,
  resolutions: Readonly<Record<FoleonRegistryConfigKey, PlatformConfigResolution>>,
  sourceByKey: Record<FoleonRegistryConfigKey, PlatformConfigSource>,
  defaultValue?: string,
): void {
  const override = normalizeText(overrideValue);
  if (override) {
    (config as { foleonApiBaseUrl?: string }).foleonApiBaseUrl = override;
    sourceByKey.FoleonApiBaseUrl = 'override';
    return;
  }
  if (resolutions.FoleonApiBaseUrl.source === 'registry' && typeof resolutions.FoleonApiBaseUrl.value === 'string') {
    (config as { foleonApiBaseUrl?: string }).foleonApiBaseUrl = resolutions.FoleonApiBaseUrl.value;
    sourceByKey.FoleonApiBaseUrl = 'registry';
    return;
  }
  if (resolutions.BackendFunctionAppUrl.source === 'registry' && typeof resolutions.BackendFunctionAppUrl.value === 'string') {
    (config as { foleonApiBaseUrl?: string }).foleonApiBaseUrl = resolutions.BackendFunctionAppUrl.value;
    sourceByKey.FoleonApiBaseUrl = 'registry';
    return;
  }
  const fallback = normalizeText(defaultValue);
  if (fallback) {
    (config as { foleonApiBaseUrl?: string }).foleonApiBaseUrl = fallback;
    sourceByKey.FoleonApiBaseUrl = 'default';
    return;
  }
  sourceByKey.FoleonApiBaseUrl = resolutions.FoleonApiBaseUrl.source;
}

function createSourceMap(source: PlatformConfigSource): Record<FoleonRegistryConfigKey, PlatformConfigSource> {
  return Object.fromEntries(FOLEON_KEYS.map((key) => [key, source])) as Record<FoleonRegistryConfigKey, PlatformConfigSource>;
}

function keysWithSource(
  sourceByKey: Readonly<Record<FoleonRegistryConfigKey, PlatformConfigSource>>,
  source: PlatformConfigSource,
): ReadonlyArray<FoleonRegistryConfigKey> {
  return FOLEON_KEYS.filter((key) => sourceByKey[key] === source);
}

function resolveReadinessState(input: {
  readonly registryResolved: boolean;
  readonly duplicateActiveKeys: boolean;
  readonly registrySecretHygieneStatus: 'pass' | 'fail' | 'unknown';
  readonly listBindingsReady: boolean;
  readonly backendUrlReady: boolean;
  readonly authResourceReady: boolean;
  readonly tokenProviderReady: boolean;
  readonly writePathReady: boolean;
}): FoleonRegistryReadinessState {
  if (!input.registryResolved) return 'registry-unavailable';
  if (input.duplicateActiveKeys || input.registrySecretHygieneStatus === 'fail') return 'registry-invalid';
  if (!input.listBindingsReady) return 'registry-partial';
  if (!input.backendUrlReady) return 'list-bindings-ready';
  if (!input.authResourceReady) return 'auth-resource-missing';
  if (!input.tokenProviderReady) return 'token-provider-unavailable';
  if (input.writePathReady) return 'write-path-ready';
  return 'backend-url-ready';
}

function isGuid(value: string | undefined): boolean {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));
}

function isBackendUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.pathname !== '/api' && !url.pathname.startsWith('/api/');
  } catch {
    return false;
  }
}

function normalizeText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function hasSecretHygieneIssue(record: PlatformConfigRegistryRecord): boolean {
  const secretLike = /secret|password|token|credential|certificate|privatekey/i.test(record.configKey) ||
    record.valueType === 'SecretReference';
  if (!secretLike) return false;
  if (!record.isSecretReference) return true;
  if (record.configValue || record.configValueJson) return true;
  return false;
}

function getTemporalStatus(record: PlatformConfigRegistryRecord): 'expired' | 'invalid' | null {
  const now = Date.now();
  const effectiveFrom = parseDate(record.effectiveFrom);
  if (effectiveFrom && effectiveFrom.getTime() > now) return 'invalid';
  const effectiveThrough = parseDate(record.effectiveThrough);
  if (effectiveThrough && effectiveThrough.getTime() < now) return 'expired';
  return null;
}

function parseDate(value: string | undefined): Date | null {
  const text = normalizeText(value);
  if (!text) return null;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeGuid(value: string | undefined, configKey: string): string {
  const text = requireText(value, configKey).toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(text)) {
    throw new Error(`${configKey} is not a valid GUID.`);
  }
  return text;
}

function normalizeBackendUrl(value: string | undefined, configKey: string): string {
  const text = requireText(value, configKey);
  const parsed = new URL(text);
  if (parsed.protocol !== 'https:') throw new Error(`${configKey} must use https://.`);
  if (parsed.pathname === '/api' || parsed.pathname.startsWith('/api/')) {
    throw new Error(`${configKey} must not include /api.`);
  }
  return parsed.toString().replace(/\/$/, '');
}

function normalizeApiResource(value: string | undefined, configKey: string): string {
  const text = requireText(value, configKey);
  if (!text.startsWith('api://')) throw new Error(`${configKey} must use an api:// Application ID URI.`);
  if (text.includes('/.default')) throw new Error(`${configKey} must not include /.default.`);
  if (/^api:\/\/[^/]+\/.+/.test(text)) throw new Error(`${configKey} must not include a custom scope suffix.`);
  return text;
}

function normalizeOrigins(record: PlatformConfigRegistryRecord): ReadonlyArray<string> {
  const raw = requireText(record.configValueJson ?? record.acceptedOrigins ?? record.configValue, record.configKey);
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) throw new Error(`${record.configKey} must be a JSON array.`);
  return parsed.map((entry) => {
    if (typeof entry !== 'string') throw new Error(`${record.configKey} contains a non-string origin.`);
    if (entry.includes('*')) throw new Error(`${record.configKey} must not contain wildcard origins.`);
    const url = new URL(entry);
    if (url.origin !== entry) throw new Error(`${record.configKey} entries must be exact origins.`);
    return url.origin;
  });
}

function normalizeBoolean(value: string | undefined, configKey: string): boolean {
  const text = requireText(value, configKey).toLowerCase();
  if (['true', '1', 'yes'].includes(text)) return true;
  if (['false', '0', 'no'].includes(text)) return false;
  throw new Error(`${configKey} is not a valid boolean.`);
}

function normalizeVersion(value: string | undefined, configKey: string): string {
  const text = requireText(value, configKey);
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(text)) throw new Error(`${configKey} is not a SharePoint four-part version.`);
  return text;
}

function requireText(value: string | undefined, configKey: string): string {
  const text = normalizeText(value);
  if (!text) throw new Error(`${configKey} is missing a registry value.`);
  return text;
}

function fingerprintText(value: string): string {
  let hash = 0x811c9dc5;
  for (let idx = 0; idx < value.length; idx += 1) {
    hash ^= value.charCodeAt(idx);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
