export const FOLEON_PLATFORM_CONFIG_REGISTRY_SITE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';
export const FOLEON_PLATFORM_CONFIG_REGISTRY_LIST_TITLE = 'HB Platform Configuration Registry';
export const FOLEON_PLATFORM_CONFIG_REGISTRY_ENVIRONMENT_KEY = 'Production';

export interface IShellFoleonRegistryProperties {
  readonly foleonRegistrySiteUrl?: string;
  readonly foleonRegistryListTitle?: string;
  readonly foleonRegistryEnvironmentKey?: string;
}

export interface FoleonRegistryFetchBootstrap {
  readonly siteUrl: string;
  readonly listTitle: string;
  readonly environmentKey: string;
}

export interface SharePointRegistryItem {
  readonly ApplicationKey?: string;
  readonly EnvironmentKey?: string;
  readonly ScopeKey?: string;
  readonly ConfigKey?: string;
  readonly ValueType?: string;
  readonly IsActive?: boolean;
  readonly ValidationStatus?: string;
  readonly IsSecretReference?: boolean;
  readonly SecretReferenceName?: string;
  readonly ConfigValue?: string;
  readonly ConfigValueJson?: string;
  readonly ListGuid?: string;
  readonly ApiBaseUrl?: string;
  readonly ApiResource?: string;
  readonly AcceptedOrigins?: string;
  readonly ExpectedPackageVersion?: string;
  readonly EffectiveFrom?: string;
  readonly EffectiveThrough?: string;
}

export function buildFoleonRegistryBootstrap(
  properties: IShellFoleonRegistryProperties,
): FoleonRegistryFetchBootstrap {
  return {
    siteUrl: normalizeText(properties.foleonRegistrySiteUrl) ?? FOLEON_PLATFORM_CONFIG_REGISTRY_SITE_URL,
    listTitle: normalizeText(properties.foleonRegistryListTitle) ?? FOLEON_PLATFORM_CONFIG_REGISTRY_LIST_TITLE,
    environmentKey: normalizeText(properties.foleonRegistryEnvironmentKey) ?? FOLEON_PLATFORM_CONFIG_REGISTRY_ENVIRONMENT_KEY,
  };
}

export function buildFoleonRegistryItemsUrl(bootstrap: FoleonRegistryFetchBootstrap): string {
  const fields = [
    'ApplicationKey',
    'EnvironmentKey',
    'ScopeKey',
    'ConfigKey',
    'ValueType',
    'IsActive',
    'ValidationStatus',
    'IsSecretReference',
    'SecretReferenceName',
    'ConfigValue',
    'ConfigValueJson',
    'ListGuid',
    'ApiBaseUrl',
    'ApiResource',
    'AcceptedOrigins',
    'ExpectedPackageVersion',
    'EffectiveFrom',
    'EffectiveThrough',
  ];
  const query = new URLSearchParams({
    $select: fields.join(','),
    $filter: `(ApplicationKey eq 'Foleon' or ApplicationKey eq 'FunctionApp') and EnvironmentKey eq '${escapeODataString(bootstrap.environmentKey)}' and IsActive eq 1`,
    $top: '200',
  });
  return `${bootstrap.siteUrl.replace(/\/$/, '')}/_api/web/lists/getByTitle('${escapeODataString(bootstrap.listTitle)}')/items?${query.toString()}`;
}

export function buildFoleonRegistryConfig(
  bootstrap: FoleonRegistryFetchBootstrap,
  items: ReadonlyArray<SharePointRegistryItem>,
): Record<string, unknown> {
  return {
    platformConfigRegistry: {
      bootstrap: {
        siteUrl: bootstrap.siteUrl,
        listTitle: bootstrap.listTitle,
        environmentKey: bootstrap.environmentKey,
      },
      records: items.map(mapRegistryRecord),
    },
    platformConfigRegistryStatus: {
      status: 'available',
    },
  };
}

export function buildFoleonRegistryUnavailableConfig(
  bootstrap: FoleonRegistryFetchBootstrap,
  message = 'Platform configuration registry could not be read.',
): Record<string, unknown> {
  return {
    platformConfigRegistry: {
      bootstrap: {
        siteUrl: bootstrap.siteUrl,
        listTitle: bootstrap.listTitle,
        environmentKey: bootstrap.environmentKey,
      },
      records: [],
    },
    platformConfigRegistryStatus: {
      status: 'unavailable',
      message,
    },
  };
}

function mapRegistryRecord(item: SharePointRegistryItem): Record<string, unknown> {
  return {
    applicationKey: item.ApplicationKey ?? '',
    environmentKey: item.EnvironmentKey ?? '',
    scopeKey: item.ScopeKey,
    configKey: item.ConfigKey ?? '',
    valueType: item.ValueType ?? '',
    isActive: Boolean(item.IsActive),
    validationStatus: item.ValidationStatus ?? 'Not Validated',
    isSecretReference: Boolean(item.IsSecretReference),
    secretReferenceName: item.SecretReferenceName,
    configValue: item.ConfigValue,
    configValueJson: item.ConfigValueJson,
    listGuid: item.ListGuid,
    apiBaseUrl: item.ApiBaseUrl,
    apiResource: item.ApiResource,
    acceptedOrigins: item.AcceptedOrigins,
    expectedPackageVersion: item.ExpectedPackageVersion,
    effectiveFrom: item.EffectiveFrom,
    effectiveThrough: item.EffectiveThrough,
  };
}

function normalizeText(value: string | undefined): string | undefined {
  const text = value?.trim();
  return text ? text : undefined;
}

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}
