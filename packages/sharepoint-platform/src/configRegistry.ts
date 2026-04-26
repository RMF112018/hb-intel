export type PlatformConfigValueType =
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'Json'
  | 'Url'
  | 'Guid'
  | 'OriginList'
  | 'Version'
  | 'SecretReference';

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
  readonly valueType: PlatformConfigValueType | string;
  readonly isActive: boolean;
  readonly validationStatus: string;
  readonly isRequired?: boolean;
  readonly isSecretReference: boolean;
  readonly secretReferenceName?: string;
  readonly configValue?: string;
  readonly configValueJson?: string;
  readonly siteUrl?: string;
  readonly listTitle?: string;
  readonly listGuid?: string;
  readonly webId?: string;
  readonly tenantId?: string;
  readonly manifestId?: string;
  readonly expectedPackageVersion?: string;
  readonly apiBaseUrl?: string;
  readonly apiResource?: string;
  readonly acceptedOrigins?: string;
  readonly validationRule?: string;
  readonly adminNotes?: string;
  readonly lastValidatedAt?: string;
  readonly lastUpdatedAt?: string;
  readonly effectiveFrom?: string;
  readonly effectiveThrough?: string;
}

export interface PlatformConfigResolveRequest {
  readonly applicationKey: string;
  readonly environmentKey: string;
  readonly scopeKey?: string;
  readonly configKey: string;
  readonly scopeFallbacks?: ReadonlyArray<string>;
  readonly now?: Date;
}

export interface PlatformConfigResolution<T = unknown> {
  readonly key: string;
  readonly source: PlatformConfigSource;
  readonly value?: T;
  readonly valueType?: PlatformConfigValueType | string;
  readonly diagnostics: ReadonlyArray<string>;
  readonly fingerprint?: string;
  readonly record?: PlatformConfigRegistryRecord;
}

export interface PlatformConfigNormalizationOptions {
  readonly allowHttpForLocal?: boolean;
}

const ACTIVE_VALIDATION_STATUSES = new Set(['not validated', 'valid', 'warning']);

export function resolvePlatformConfigValue<T = unknown>(
  records: ReadonlyArray<PlatformConfigRegistryRecord>,
  request: PlatformConfigResolveRequest,
  options: PlatformConfigNormalizationOptions = {},
): PlatformConfigResolution<T> {
  const scopes = [
    normalizeOptionalText(request.scopeKey),
    ...request.scopeFallbacks?.map(normalizeOptionalText) ?? [],
  ].filter((scope): scope is string => Boolean(scope));
  const scopedCandidates = scopes.length > 0 ? scopes : [undefined];

  for (const scope of scopedCandidates) {
    const matches = records.filter((record) =>
      record.applicationKey === request.applicationKey &&
      record.environmentKey === request.environmentKey &&
      record.configKey === request.configKey &&
      record.isActive &&
      normalizeOptionalText(record.scopeKey) === scope,
    );

    if (matches.length > 1) {
      return {
        key: request.configKey,
        source: 'duplicate',
        diagnostics: [`Duplicate active registry records for ${request.configKey}.`],
      };
    }

    if (matches.length === 1) {
      return normalizeRegistryRecord<T>(matches[0], request.now ?? new Date(), options);
    }
  }

  return {
    key: request.configKey,
    source: 'missing',
    diagnostics: [`Missing active registry record for ${request.configKey}.`],
  };
}

export function normalizeRegistryRecord<T = unknown>(
  record: PlatformConfigRegistryRecord,
  now: Date = new Date(),
  options: PlatformConfigNormalizationOptions = {},
): PlatformConfigResolution<T> {
  const temporalStatus = getTemporalStatus(record, now);
  if (temporalStatus) {
    return {
      key: record.configKey,
      source: temporalStatus,
      valueType: record.valueType,
      diagnostics: [`Registry record ${record.configKey} is ${temporalStatus}.`],
      record,
    };
  }

  const validationStatus = record.validationStatus.trim().toLowerCase();
  if (!ACTIVE_VALIDATION_STATUSES.has(validationStatus)) {
    return {
      key: record.configKey,
      source: validationStatus === 'expired' ? 'expired' : 'blocked',
      valueType: record.valueType,
      diagnostics: [`Registry record ${record.configKey} status is ${record.validationStatus}.`],
      record,
    };
  }

  if (record.isSecretReference || record.valueType === 'SecretReference') {
    return {
      key: record.configKey,
      source: record.isSecretReference && normalizeOptionalText(record.secretReferenceName) ? 'registry' : 'invalid',
      value: { secretReferencePresent: record.isSecretReference } as T,
      valueType: record.valueType,
      diagnostics: record.isSecretReference
        ? []
        : [`Secret reference record ${record.configKey} is missing IsSecretReference=true.`],
      record,
    };
  }

  try {
    const value = normalizeRegistryValue(record, options) as T;
    return {
      key: record.configKey,
      source: 'registry',
      value,
      valueType: record.valueType,
      diagnostics: [],
      fingerprint: typeof value === 'string' ? fingerprintText(value) : undefined,
      record,
    };
  } catch (error) {
    return {
      key: record.configKey,
      source: 'invalid',
      valueType: record.valueType,
      diagnostics: [error instanceof Error ? error.message : String(error)],
      record,
    };
  }
}

export function normalizeRegistryValue(
  record: PlatformConfigRegistryRecord,
  options: PlatformConfigNormalizationOptions = {},
): unknown {
  const valueType = record.valueType;
  switch (valueType) {
    case 'String':
      return requireText(record, 'ConfigValue');
    case 'Number': {
      const parsed = Number(requireText(record, 'ConfigValue'));
      if (!Number.isFinite(parsed)) throw new Error(`${record.configKey} is not a valid number.`);
      return parsed;
    }
    case 'Boolean':
      return parseBoolean(requireText(record, 'ConfigValue'), record.configKey);
    case 'Json':
      return JSON.parse(requireText(record, 'ConfigValueJson', record.configValue));
    case 'Url':
      return normalizeHttpsUrl(requireText(record, 'ConfigValue', record.apiBaseUrl), record.configKey, options);
    case 'Guid':
      return normalizeGuid(requireText(record, 'ConfigValue', record.listGuid), record.configKey);
    case 'OriginList':
      return normalizeOriginList(record);
    case 'Version':
      return normalizeVersion(requireText(record, 'ConfigValue', record.expectedPackageVersion), record.configKey);
    case 'SecretReference':
      return { secretReferencePresent: record.isSecretReference };
    default:
      throw new Error(`${record.configKey} has unsupported value type ${valueType}.`);
  }
}

export function fingerprintText(value: string): string {
  let hash = 0x811c9dc5;
  for (let idx = 0; idx < value.length; idx += 1) {
    hash ^= value.charCodeAt(idx);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function getTemporalStatus(record: PlatformConfigRegistryRecord, now: Date): 'expired' | 'invalid' | null {
  const effectiveFrom = parseDate(record.effectiveFrom);
  if (effectiveFrom && effectiveFrom.getTime() > now.getTime()) return 'invalid';
  const effectiveThrough = parseDate(record.effectiveThrough);
  if (effectiveThrough && effectiveThrough.getTime() < now.getTime()) return 'expired';
  return null;
}

function parseDate(value: string | undefined): Date | null {
  const text = normalizeOptionalText(value);
  if (!text) return null;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function requireText(
  record: PlatformConfigRegistryRecord,
  fieldName: string,
  fallback?: string,
): string {
  const text = normalizeOptionalText(fieldName === 'ConfigValueJson' ? record.configValueJson : record.configValue);
  const fallbackText = normalizeOptionalText(fallback);
  if (text) return text;
  if (fallbackText) return fallbackText;
  throw new Error(`${record.configKey} is missing ${fieldName}.`);
}

function parseBoolean(value: string, configKey: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes'].includes(normalized)) return true;
  if (['false', '0', 'no'].includes(normalized)) return false;
  throw new Error(`${configKey} is not a valid boolean.`);
}

function normalizeHttpsUrl(
  value: string,
  configKey: string,
  options: PlatformConfigNormalizationOptions,
): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${configKey} is not an absolute URL.`);
  }
  const isLocalHttp = options.allowHttpForLocal && parsed.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsed.hostname);
  if (parsed.protocol !== 'https:' && !isLocalHttp) {
    throw new Error(`${configKey} must use https://.`);
  }
  if (parsed.pathname === '/api' || parsed.pathname.startsWith('/api/')) {
    throw new Error(`${configKey} must not include /api.`);
  }
  return parsed.toString().replace(/\/$/, '');
}

function normalizeGuid(value: string, configKey: string): string {
  const normalized = value.trim().toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(normalized)) {
    throw new Error(`${configKey} is not a valid GUID.`);
  }
  return normalized;
}

function normalizeOriginList(record: PlatformConfigRegistryRecord): ReadonlyArray<string> {
  const raw = normalizeOptionalText(record.configValueJson)
    ?? normalizeOptionalText(record.acceptedOrigins)
    ?? normalizeOptionalText(record.configValue);
  if (!raw) throw new Error(`${record.configKey} is missing origin list value.`);
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) throw new Error(`${record.configKey} must be a JSON array of origins.`);
  const origins = parsed.map((entry) => {
    if (typeof entry !== 'string') throw new Error(`${record.configKey} contains a non-string origin.`);
    const origin = entry.trim();
    if (origin.includes('*')) throw new Error(`${record.configKey} must not contain wildcard origins.`);
    const url = new URL(origin);
    if (url.origin !== origin || url.pathname !== '/') {
      throw new Error(`${record.configKey} entries must be exact origins.`);
    }
    return url.origin;
  });
  if (origins.length === 0) throw new Error(`${record.configKey} must contain at least one origin.`);
  return origins;
}

function normalizeVersion(value: string, configKey: string): string {
  const normalized = value.trim();
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(normalized)) {
    throw new Error(`${configKey} is not a SharePoint four-part version.`);
  }
  return normalized;
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
