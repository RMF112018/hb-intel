const PILOT_SHAREPOINT_CREATOR_APP_ID = '08c399eb-a394-4087-b859-659d493f8dc7';
const ENVIRONMENT_VALUES = ['staging', 'prod'] as const;

export type LegacyFallbackHostingEnvironment = (typeof ENVIRONMENT_VALUES)[number];

export interface ILegacyFallbackHostingConfig {
  readonly environment: LegacyFallbackHostingEnvironment;
  readonly enabled: boolean;
  readonly functionAppName: string;
  readonly functionHostUrl: string;
  readonly hbCentralSiteUrl: string;
  readonly sharePointTenantUrl: string;
  readonly azureTenantId: string;
  readonly azureClientId: string;
  readonly graphScope: string;
  readonly authPosture: 'pilot-interim';
  readonly managedAppClientId: string;
}

export interface ILegacyFallbackHostingValidationIssue {
  readonly key: string;
  readonly message: string;
}

export interface ILegacyFallbackHostingValidationResult {
  readonly ok: boolean;
  readonly issues: readonly ILegacyFallbackHostingValidationIssue[];
}

type EnvReader = (key: string) => string | undefined;

function readTrimmed(env: EnvReader, key: string): string {
  return (env(key) ?? '').trim();
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function parseBoolean(value: string, fallback: boolean): boolean {
  if (value === '') {
    return fallback;
  }
  return value.toLowerCase() === 'true';
}

export function validateLegacyFallbackHostingConfig(
  env: EnvReader = (key) => process.env[key],
): ILegacyFallbackHostingValidationResult {
  const issues: ILegacyFallbackHostingValidationIssue[] = [];
  const environment = readTrimmed(env, 'HBC_LEGACY_FALLBACK_HOSTING_ENV');
  const functionAppName = readTrimmed(env, 'HBC_LEGACY_FALLBACK_FUNCTION_APP_NAME');
  const functionHostUrl = readTrimmed(env, 'HBC_LEGACY_FALLBACK_FUNCTION_HOST_URL');
  const hbCentralSiteUrl = readTrimmed(env, 'HBC_LEGACY_FALLBACK_HBCENTRAL_SITE_URL');
  const sharePointTenantUrl = readTrimmed(env, 'SHAREPOINT_TENANT_URL');
  const azureTenantId = readTrimmed(env, 'AZURE_TENANT_ID');
  const azureClientId = readTrimmed(env, 'AZURE_CLIENT_ID');
  const graphScope = readTrimmed(env, 'HBC_LEGACY_FALLBACK_GRAPH_SCOPE');
  const authPosture = readTrimmed(env, 'HBC_LEGACY_FALLBACK_AUTH_POSTURE');
  const managedAppClientId = readTrimmed(env, 'HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID');

  if (!ENVIRONMENT_VALUES.includes(environment as LegacyFallbackHostingEnvironment)) {
    issues.push({
      key: 'HBC_LEGACY_FALLBACK_HOSTING_ENV',
      message: `Must be one of: ${ENVIRONMENT_VALUES.join(', ')}`,
    });
  }
  if (functionAppName.length === 0) {
    issues.push({
      key: 'HBC_LEGACY_FALLBACK_FUNCTION_APP_NAME',
      message: 'Function app name is required.',
    });
  }
  if (functionHostUrl.length === 0 || !isValidUrl(functionHostUrl)) {
    issues.push({
      key: 'HBC_LEGACY_FALLBACK_FUNCTION_HOST_URL',
      message: 'Must be a valid URL.',
    });
  }
  if (hbCentralSiteUrl.length === 0 || !isValidUrl(hbCentralSiteUrl)) {
    issues.push({
      key: 'HBC_LEGACY_FALLBACK_HBCENTRAL_SITE_URL',
      message: 'Must be a valid URL.',
    });
  }
  if (sharePointTenantUrl.length === 0 || !isValidUrl(sharePointTenantUrl)) {
    issues.push({
      key: 'SHAREPOINT_TENANT_URL',
      message: 'Must be a valid URL.',
    });
  }
  if (azureTenantId.length === 0) {
    issues.push({
      key: 'AZURE_TENANT_ID',
      message: 'Tenant ID is required for app-only access.',
    });
  }
  if (azureClientId.length === 0) {
    issues.push({
      key: 'AZURE_CLIENT_ID',
      message: 'Managed identity client ID is required.',
    });
  }
  if (graphScope.length === 0) {
    issues.push({
      key: 'HBC_LEGACY_FALLBACK_GRAPH_SCOPE',
      message: 'Graph scope is required.',
    });
  }
  if (authPosture !== 'pilot-interim') {
    issues.push({
      key: 'HBC_LEGACY_FALLBACK_AUTH_POSTURE',
      message: 'Auth posture must be "pilot-interim" for this phase.',
    });
  }
  if (managedAppClientId !== PILOT_SHAREPOINT_CREATOR_APP_ID) {
    issues.push({
      key: 'HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID',
      message: `Must equal pilot app registration ${PILOT_SHAREPOINT_CREATOR_APP_ID}.`,
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function getLegacyFallbackHostingConfig(
  env: EnvReader = (key) => process.env[key],
): ILegacyFallbackHostingConfig {
  const result = validateLegacyFallbackHostingConfig(env);
  if (!result.ok) {
    const message = result.issues.map((issue) => `${issue.key}: ${issue.message}`).join('; ');
    throw new Error(`Legacy fallback hosting configuration invalid. ${message}`);
  }

  return {
    environment: readTrimmed(env, 'HBC_LEGACY_FALLBACK_HOSTING_ENV') as LegacyFallbackHostingEnvironment,
    enabled: parseBoolean(readTrimmed(env, 'HBC_LEGACY_FALLBACK_ENABLED'), true),
    functionAppName: readTrimmed(env, 'HBC_LEGACY_FALLBACK_FUNCTION_APP_NAME'),
    functionHostUrl: readTrimmed(env, 'HBC_LEGACY_FALLBACK_FUNCTION_HOST_URL'),
    hbCentralSiteUrl: readTrimmed(env, 'HBC_LEGACY_FALLBACK_HBCENTRAL_SITE_URL'),
    sharePointTenantUrl: readTrimmed(env, 'SHAREPOINT_TENANT_URL'),
    azureTenantId: readTrimmed(env, 'AZURE_TENANT_ID'),
    azureClientId: readTrimmed(env, 'AZURE_CLIENT_ID'),
    graphScope: readTrimmed(env, 'HBC_LEGACY_FALLBACK_GRAPH_SCOPE'),
    authPosture: 'pilot-interim',
    managedAppClientId: PILOT_SHAREPOINT_CREATOR_APP_ID,
  };
}

export const LEGACY_FALLBACK_PILOT_APP_REGISTRATION = Object.freeze({
  displayName: 'HB SharePoint Creator',
  appId: PILOT_SHAREPOINT_CREATOR_APP_ID,
  posture: 'pilot-interim' as const,
  productionReady: false,
});
