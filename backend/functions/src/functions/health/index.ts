/**
 * P1-C3 §2.2.1: Health probe endpoint.
 * Unauthenticated — used by Azure App Service health checks and deployment smoke tests.
 *
 * Returns HTTP 200 always (health probes must not fail on missing config).
 * The response body includes config state diagnostics for operators.
 */

import { app, type HttpResponseInit } from '@azure/functions';

/** Check if a setting is present and non-empty. */
function hasEnv(name: string): boolean {
  const v = process.env[name];
  return v !== undefined && v !== '';
}

app.http('health', {
  route: 'health',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (): Promise<HttpResponseInit> => {
    const adapterMode = process.env.HBC_ADAPTER_MODE ?? 'not-set';

    // Core boot settings (7 required)
    const corePresent = [
      'AZURE_TENANT_ID', 'AZURE_CLIENT_ID', 'AZURE_TABLE_ENDPOINT',
      'APPLICATIONINSIGHTS_CONNECTION_STRING', 'HBC_ADAPTER_MODE',
      'SHAREPOINT_TENANT_URL', 'SHAREPOINT_PROJECTS_SITE_URL',
    ].every(hasEnv);

    // Optional integrations
    const integrations: Record<string, 'ready' | 'not-configured'> = {
      signalR: hasEnv('AzureSignalRConnectionString') ? 'ready' : 'not-configured',
      email: hasEnv('EMAIL_DELIVERY_API_KEY') && hasEnv('EMAIL_FROM_ADDRESS') ? 'ready' : 'not-configured',
      notifications: hasEnv('NOTIFICATION_API_BASE_URL') ? 'ready' : 'not-configured',
      provisioning: hasEnv('SHAREPOINT_HUB_SITE_ID') && hasEnv('OPEX_MANAGER_UPN') ? 'ready' : 'not-configured',
      graphPermissions: hasEnv('GRAPH_GROUP_PERMISSION_CONFIRMED') ? 'ready' : 'not-configured',
    };

    // Role config (degraded without)
    const roleConfig: Record<string, 'configured' | 'degraded'> = {
      controllers: hasEnv('CONTROLLER_UPNS') ? 'configured' : 'degraded',
      admins: hasEnv('ADMIN_UPNS') ? 'configured' : 'degraded',
    };

    return {
      status: 200,
      jsonBody: {
        status: 'healthy',
        environment: process.env.AZURE_FUNCTIONS_ENVIRONMENT ?? 'unknown',
        adapterMode,
        coreConfigReady: corePresent,
        integrations,
        roleConfig,
        timestamp: new Date().toISOString(),
      },
    };
  },
});
