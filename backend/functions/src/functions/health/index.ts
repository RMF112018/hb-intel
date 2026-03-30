/**
 * P1-C3 §2.2.1: Health probe endpoint.
 * Unauthenticated — used by Azure App Service health checks and deployment smoke tests.
 *
 * Returns HTTP 200 always (health probes must not fail on missing config).
 * The response body includes tiered config diagnostics and operational readiness
 * summary for operators.
 *
 * P4-02: Added tiered config status (core/sharepoint).
 * P4-05: Added operationalReadiness summary and provisioning readiness.
 */

import { app, type HttpResponseInit } from '@azure/functions';

/** Check if a setting is present and non-empty. */
function hasEnv(name: string): boolean {
  const v = process.env[name];
  return v !== undefined && v !== '';
}

/**
 * P4-05: Compute overall operational readiness from config tiers and integrations.
 *
 * - `ready` — all core + SharePoint + provisioning prerequisites configured
 * - `degraded` — core operational but some optional integrations missing
 * - `blocked` — core config missing; no authenticated requests can succeed
 */
function computeReadiness(
  coreReady: boolean,
  sharePointReady: boolean,
  provisioningReady: boolean,
  signalRReady: boolean,
): 'ready' | 'degraded' | 'blocked' {
  if (!coreReady) return 'blocked';
  if (!sharePointReady) return 'degraded';
  if (!provisioningReady || !signalRReady) return 'degraded';
  return 'ready';
}

app.http('health', {
  route: 'health',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (): Promise<HttpResponseInit> => {
    const adapterMode = process.env.HBC_ADAPTER_MODE ?? 'not-set';

    // P4-02: Core settings split into tiers matching validate-config.ts
    const coreAuthPresent = [
      'AZURE_TENANT_ID', 'AZURE_CLIENT_ID', 'API_AUDIENCE',
      'AZURE_TABLE_ENDPOINT', 'APPLICATIONINSIGHTS_CONNECTION_STRING',
      'HBC_ADAPTER_MODE',
    ].every(hasEnv);
    const sharePointPresent = [
      'SHAREPOINT_TENANT_URL', 'SHAREPOINT_PROJECTS_SITE_URL',
    ].every(hasEnv);
    const corePresent = coreAuthPresent && sharePointPresent;

    // P4-05: Provisioning-specific readiness
    const provisioningPrereqs = {
      graphPermission: process.env.GRAPH_GROUP_PERMISSION_CONFIRMED === 'true',
      hubSite: hasEnv('SHAREPOINT_HUB_SITE_ID'),
      appCatalog: hasEnv('SHAREPOINT_APP_CATALOG_URL'),
      spfxAppId: hasEnv('HB_INTEL_SPFX_APP_ID'),
      opexManager: hasEnv('OPEX_MANAGER_UPN'),
    };
    const provisioningReady = Object.values(provisioningPrereqs).every(Boolean);

    // Optional integrations
    const integrations: Record<string, 'ready' | 'not-configured'> = {
      signalR: hasEnv('AzureSignalRConnectionString') ? 'ready' : 'not-configured',
      email: hasEnv('EMAIL_DELIVERY_API_KEY') && hasEnv('EMAIL_FROM_ADDRESS') ? 'ready' : 'not-configured',
      notifications: hasEnv('NOTIFICATION_API_BASE_URL') ? 'ready' : 'not-configured',
    };

    // Role config (degraded without)
    const roleConfig: Record<string, 'configured' | 'degraded'> = {
      controllers: hasEnv('CONTROLLER_UPNS') ? 'configured' : 'degraded',
      admins: hasEnv('ADMIN_UPNS') ? 'configured' : 'degraded',
    };

    // P4-05: Compute overall operational readiness
    const operationalReadiness = computeReadiness(
      coreAuthPresent,
      sharePointPresent,
      provisioningReady,
      integrations.signalR === 'ready',
    );

    return {
      status: 200,
      jsonBody: {
        status: 'healthy',
        operationalReadiness,
        environment: process.env.AZURE_FUNCTIONS_ENVIRONMENT ?? 'unknown',
        adapterMode,
        coreConfigReady: corePresent,
        configTiers: {
          core: coreAuthPresent ? 'ready' : 'missing',
          sharepoint: sharePointPresent ? 'ready' : 'missing',
          provisioning: provisioningReady ? 'ready' : 'incomplete',
        },
        provisioningPrereqs,
        integrations,
        roleConfig,
        timestamp: new Date().toISOString(),
      },
    };
  },
});
