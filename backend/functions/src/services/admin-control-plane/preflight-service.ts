/**
 * P6-04: Admin Control Plane — preflight validation engine.
 *
 * Replaces StubAdminPreflightService with real environment readiness checks.
 * Validates backend configuration, auth posture, SharePoint, Graph/Entra,
 * persistence, and install-lane compatibility before allowing install launch.
 *
 * Design: reuses the health-probe pattern (hasEnv, tiered config checks) and
 * produces structured IAdminPreflightCheck results with category, severity,
 * and recommended operator actions.
 */

import type {
  IAdminPreflightRequest,
  IAdminPreflightResponse,
  IAdminPreflightCheck,
  PreflightCategory,
  PreflightSeverity,
} from '@hbc/models/admin-control-plane';
import { InstallPreflightCheckId } from '@hbc/models/admin-control-plane';
import type { IAdminPreflightService } from './types.js';
import {
  getPnpActionDescriptor,
  normalizeFilterList,
  normalizePnpActionKey,
} from './pnp-action-catalog.js';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Check if an environment variable is present and non-empty. */
function hasEnv(name: string): boolean {
  const v = process.env[name];
  return v !== undefined && v !== '';
}

/** Build a single preflight check result. */
function check(
  checkId: string,
  label: string,
  passed: boolean,
  message: string,
  opts: {
    category: PreflightCategory;
    severity: PreflightSeverity;
    blocking: boolean;
    recommendedAction?: string;
    resolvableByCheckpoint?: boolean;
  },
): IAdminPreflightCheck {
  return {
    checkId,
    label,
    passed,
    message,
    blocking: opts.blocking,
    category: opts.category,
    severity: opts.severity,
    recommendedAction: opts.recommendedAction,
    resolvableByCheckpoint: opts.resolvableByCheckpoint,
  };
}

// ─── Check Implementations ─────────────────────────────────────────────────────

function checkBackendConfig(): IAdminPreflightCheck[] {
  const results: IAdminPreflightCheck[] = [];

  const coreVars = [
    'AZURE_TENANT_ID', 'AZURE_CLIENT_ID', 'API_AUDIENCE',
    'AZURE_TABLE_ENDPOINT', 'APPLICATIONINSIGHTS_CONNECTION_STRING',
    'HBC_ADAPTER_MODE',
  ];
  const missingCore = coreVars.filter((v) => !hasEnv(v));
  results.push(check(
    InstallPreflightCheckId.EnvironmentConfigComplete,
    'Core environment configuration',
    missingCore.length === 0,
    missingCore.length === 0
      ? 'All core environment variables are configured.'
      : `Missing core config: ${missingCore.join(', ')}`,
    {
      category: 'backend-config',
      severity: 'critical',
      blocking: true,
      recommendedAction: missingCore.length > 0
        ? `Set the following environment variables in the Function App configuration: ${missingCore.join(', ')}`
        : undefined,
    },
  ));

  return results;
}

function checkAuthIdentity(): IAdminPreflightCheck[] {
  const results: IAdminPreflightCheck[] = [];

  const hasTenant = hasEnv('AZURE_TENANT_ID');
  const hasClient = hasEnv('AZURE_CLIENT_ID');
  results.push(check(
    InstallPreflightCheckId.AzureSubscriptionAccessible,
    'Azure managed identity configuration',
    hasTenant && hasClient,
    hasTenant && hasClient
      ? 'Managed identity tenant and client ID are configured.'
      : 'Managed identity configuration is incomplete — AZURE_TENANT_ID and AZURE_CLIENT_ID are required.',
    {
      category: 'auth-identity',
      severity: 'critical',
      blocking: true,
      recommendedAction: 'Configure a user-assigned managed identity with AZURE_TENANT_ID and AZURE_CLIENT_ID.',
    },
  ));

  const graphPermConfirmed = process.env.GRAPH_GROUP_PERMISSION_CONFIRMED === 'true';
  results.push(check(
    InstallPreflightCheckId.GraphApiPermissions,
    'Graph API permissions',
    graphPermConfirmed,
    graphPermConfirmed
      ? 'Graph group permission is confirmed (GRAPH_GROUP_PERMISSION_CONFIRMED=true).'
      : 'Graph group creation permission has not been confirmed.',
    {
      category: 'auth-identity',
      severity: 'critical',
      blocking: true,
      recommendedAction: 'Grant Group.ReadWrite.All application permission to the managed identity in Entra, then set GRAPH_GROUP_PERMISSION_CONFIRMED=true.',
      resolvableByCheckpoint: true,
    },
  ));

  return results;
}

function checkSharePoint(): IAdminPreflightCheck[] {
  const results: IAdminPreflightCheck[] = [];

  const hasTenantUrl = hasEnv('SHAREPOINT_TENANT_URL');
  results.push(check(
    InstallPreflightCheckId.SharePointTenantReachable,
    'SharePoint tenant URL',
    hasTenantUrl,
    hasTenantUrl
      ? `SharePoint tenant URL configured: ${process.env.SHAREPOINT_TENANT_URL}`
      : 'SHAREPOINT_TENANT_URL is not configured.',
    {
      category: 'sharepoint',
      severity: 'critical',
      blocking: true,
      recommendedAction: 'Set SHAREPOINT_TENANT_URL to the root SharePoint Online URL (e.g., https://contoso.sharepoint.com).',
    },
  ));

  const hasAppCatalog = hasEnv('SHAREPOINT_APP_CATALOG_URL');
  results.push(check(
    InstallPreflightCheckId.AppCatalogConfigured,
    'SharePoint app catalog',
    hasAppCatalog,
    hasAppCatalog
      ? `App catalog configured: ${process.env.SHAREPOINT_APP_CATALOG_URL}`
      : 'SHAREPOINT_APP_CATALOG_URL is not configured — SPFx package installation will not be possible.',
    {
      category: 'sharepoint',
      severity: 'critical',
      blocking: true,
      recommendedAction: 'Set SHAREPOINT_APP_CATALOG_URL to the tenant or site-collection app catalog URL.',
    },
  ));

  const hasSpfxAppId = hasEnv('HB_INTEL_SPFX_APP_ID');
  results.push(check(
    InstallPreflightCheckId.SpfxAppPackageAvailable,
    'SPFx app package identifier',
    hasSpfxAppId,
    hasSpfxAppId
      ? `SPFx app ID configured: ${process.env.HB_INTEL_SPFX_APP_ID}`
      : 'HB_INTEL_SPFX_APP_ID is not configured — the SPFx package to install is unknown.',
    {
      category: 'sharepoint',
      severity: 'warning',
      blocking: false,
      recommendedAction: 'Set HB_INTEL_SPFX_APP_ID to the SPFx solution package GUID. The package may be uploaded during install.',
    },
  ));

  return results;
}

function checkGraphEntra(): IAdminPreflightCheck[] {
  const results: IAdminPreflightCheck[] = [];

  const hasTenant = hasEnv('AZURE_TENANT_ID');
  const hasClient = hasEnv('AZURE_CLIENT_ID');
  results.push(check(
    InstallPreflightCheckId.EntraAppRegistrationPrereqs,
    'Entra app registration prerequisites',
    hasTenant && hasClient,
    hasTenant && hasClient
      ? 'Entra tenant and client IDs are configured for app registration operations.'
      : 'Entra configuration incomplete — app registration operations require AZURE_TENANT_ID and AZURE_CLIENT_ID.',
    {
      category: 'graph-entra',
      severity: 'critical',
      blocking: true,
      recommendedAction: 'Ensure the managed identity has Application.ReadWrite.All permission in Entra for app registration management.',
      resolvableByCheckpoint: true,
    },
  ));

  return results;
}

function checkPersistence(): IAdminPreflightCheck[] {
  const results: IAdminPreflightCheck[] = [];

  const hasTableEndpoint = hasEnv('AZURE_TABLE_ENDPOINT');
  results.push(check(
    InstallPreflightCheckId.TableStorageAccessible,
    'Azure Table Storage endpoint',
    hasTableEndpoint,
    hasTableEndpoint
      ? `Table Storage endpoint configured: ${process.env.AZURE_TABLE_ENDPOINT}`
      : 'AZURE_TABLE_ENDPOINT is not configured — run persistence will not function.',
    {
      category: 'persistence',
      severity: 'critical',
      blocking: true,
      recommendedAction: 'Set AZURE_TABLE_ENDPOINT to the Azure Storage account table service endpoint.',
    },
  ));

  return results;
}

function checkInstallCompatibility(): IAdminPreflightCheck[] {
  const results: IAdminPreflightCheck[] = [];

  const adapterMode = process.env.HBC_ADAPTER_MODE ?? 'not-set';
  const isProxy = adapterMode === 'proxy';
  results.push(check(
    InstallPreflightCheckId.ResourceGroupReachable,
    'Adapter mode for install execution',
    isProxy,
    isProxy
      ? 'Adapter mode is "proxy" — install will execute through real adapters.'
      : `Adapter mode is "${adapterMode}" — install execution will use mock adapters (non-production).`,
    {
      category: 'install-compatibility',
      severity: isProxy ? 'info' : 'warning',
      blocking: false,
      recommendedAction: !isProxy
        ? 'Set HBC_ADAPTER_MODE=proxy for production install execution.'
        : undefined,
    },
  ));

  return results;
}

function checkPnpActionInput(request: IAdminPreflightRequest): IAdminPreflightCheck[] {
  const checks: IAdminPreflightCheck[] = [];
  const commandInput = (request.commandInput ?? {}) as Record<string, unknown>;
  const targetSiteUrl = typeof commandInput.targetSiteUrl === 'string' ? commandInput.targetSiteUrl.trim() : '';
  const listFilters = normalizeFilterList(commandInput.listFilters);
  const pageFilters = normalizeFilterList(commandInput.pageFilters);
  const descriptor = getPnpActionDescriptor(request.actionKey);

  checks.push(check(
    'pnp-target-site-url',
    'Target SharePoint site URL',
    /^https:\/\/.+\.sharepoint\.com\/sites\/.+/i.test(targetSiteUrl),
    /^https:\/\/.+\.sharepoint\.com\/sites\/.+/i.test(targetSiteUrl)
      ? `Target site URL accepted: ${targetSiteUrl}`
      : 'targetSiteUrl is missing or not a valid /sites/ SharePoint URL.',
    {
      category: 'sharepoint',
      severity: 'critical',
      blocking: true,
      recommendedAction: 'Provide a targetSiteUrl like https://<tenant>.sharepoint.com/sites/<site>.',
    },
  ));

  checks.push(check(
    'pnp-read-only-intent',
    'Read-only execution intent',
    commandInput.executionIntent !== null && typeof commandInput.executionIntent === 'object',
    commandInput.executionIntent !== null && typeof commandInput.executionIntent === 'object'
      ? 'Execution intent metadata is present.'
      : 'executionIntent metadata is missing.',
    {
      category: 'sharepoint',
      severity: 'warning',
      blocking: false,
      recommendedAction: 'Include executionIntent.mode=read-only-export from the webpart launch payload.',
    },
  ));

  if (descriptor?.requiredInput === 'site-and-list-filter') {
    checks.push(check(
      'pnp-list-filters',
      'List filters provided',
      listFilters.length > 0,
      listFilters.length > 0
        ? `List filters accepted (${listFilters.length}).`
        : 'listFilters is required for this extraction action.',
      {
        category: 'sharepoint',
        severity: 'critical',
        blocking: true,
        recommendedAction: 'Provide one or more list names in listFilters.',
      },
    ));
  }

  if (descriptor?.requiredInput === 'site-and-page-filter') {
    checks.push(check(
      'pnp-page-filters',
      'Page filters provided',
      pageFilters.length > 0,
      pageFilters.length > 0
        ? `Page filters accepted (${pageFilters.length}).`
        : 'pageFilters is required for this extraction action.',
      {
        category: 'sharepoint',
        severity: 'critical',
        blocking: true,
        recommendedAction: 'Provide one or more page filters in pageFilters.',
      },
    ));
  }

  return checks;
}

function checkPnpBackendPrerequisites(): IAdminPreflightCheck[] {
  const mode = process.env.HBC_ADAPTER_MODE ?? '';
  return [
    check(
      'pnp-backend-mode',
      'Backend execution mode',
      mode.length > 0,
      mode.length > 0
        ? `Backend adapter mode is configured (${mode}).`
        : 'HBC_ADAPTER_MODE is not configured.',
      {
        category: 'backend-config',
        severity: 'warning',
        blocking: false,
        recommendedAction: 'Set HBC_ADAPTER_MODE to proxy or mock before production usage.',
      },
    ),
  ];
}

// ─── Service Implementation ────────────────────────────────────────────────────

/**
 * P6-04: Real preflight validation service.
 *
 * Validates environment readiness across 6 categories:
 * 1. Backend configuration presence
 * 2. Managed identity / auth posture
 * 3. SharePoint posture
 * 4. Graph / Entra posture
 * 5. Persistence / run infrastructure
 * 6. Install-lane compatibility
 */
export class AdminPreflightService implements IAdminPreflightService {
  async validate(request: IAdminPreflightRequest): Promise<IAdminPreflightResponse> {
    const normalizedPnpAction = normalizePnpActionKey(request.actionKey);
    const checks: IAdminPreflightCheck[] = normalizedPnpAction
      ? [
          ...checkBackendConfig(),
          ...checkSharePoint(),
          ...checkPnpBackendPrerequisites(),
          ...checkPnpActionInput({
            ...request,
            actionKey: normalizedPnpAction,
          }),
        ]
      : [
      ...checkBackendConfig(),
      ...checkAuthIdentity(),
      ...checkSharePoint(),
      ...checkGraphEntra(),
      ...checkPersistence(),
      ...checkInstallCompatibility(),
        ];

    const ready = checks.filter((c) => c.blocking).every((c) => c.passed);

    console.log(
      `[AdminPreflightService] Validated ${checks.length} checks: ${checks.filter((c) => c.passed).length} passed, ` +
      `${checks.filter((c) => !c.passed && c.blocking).length} blocking failures, ` +
      `${checks.filter((c) => !c.passed && !c.blocking).length} warnings — overall: ${ready ? 'ready' : 'not ready'}`,
    );

    return { ready, checks };
  }
}
