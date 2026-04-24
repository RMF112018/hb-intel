/**
 * Admin-gated readiness surface.
 *
 * The anonymous `/api/health` route exposes only liveness + artifact
 * identity. Operators need the fuller readiness picture — config tier
 * state, provisioning prerequisites, Safety permission posture, rollout
 * gate, integration presence, notification recipient config, declared
 * permission inventory — but that is privileged operational data and
 * must not be public.
 *
 * This route is anonymous at the platform layer (Functions `authLevel`),
 * then gated by the same bearer-token + admin app-role contract used by
 * the rest of the admin control plane. No function keys are introduced:
 * there is exactly one auth model for privileged operational surfaces.
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';

import { withAuth } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/authorization.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { resolveBackendArtifactIdentity } from '../../utils/backend-version.js';
import { deriveSafetyRolloutReadiness } from '../../utils/safety-rollout-readiness.js';
import {
  resolveSafetyPermissionPosture,
  validateSafetyPermissionPosture,
} from '../../utils/safety-permission-posture.js';
import { summarizeRolloutPermissionInventory } from '../../utils/rollout-permission-inventory.js';
import { isSignalRAcceptableForOperationalTier } from '../../utils/signalr-operational-readiness.js';

function hasEnv(name: string): boolean {
  const v = process.env[name];
  return v !== undefined && v !== '';
}

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

app.http('healthReady', {
  route: 'health/ready',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: withAuth(async (
    request: HttpRequest,
    _context: InvocationContext,
    auth,
  ): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const adminDenied = requireAdmin(auth.claims, requestId);
    if (adminDenied) return adminDenied;

    const adapterMode = process.env.HBC_ADAPTER_MODE ?? 'not-set';
    const coreAuthPresent = [
      'AZURE_TENANT_ID', 'AZURE_CLIENT_ID', 'API_AUDIENCE',
      'AZURE_TABLE_ENDPOINT', 'APPLICATIONINSIGHTS_CONNECTION_STRING',
      'HBC_ADAPTER_MODE',
    ].every(hasEnv);
    const sharePointPresent = [
      'SHAREPOINT_TENANT_URL', 'SHAREPOINT_PROJECTS_SITE_URL',
    ].every(hasEnv);
    const corePresent = coreAuthPresent && sharePointPresent;

    const provisioningPrereqs = {
      graphPermission: process.env.GRAPH_GROUP_PERMISSION_CONFIRMED === 'true',
      hubSite: hasEnv('SHAREPOINT_HUB_SITE_ID'),
      appCatalog: hasEnv('SHAREPOINT_APP_CATALOG_URL'),
      spfxAppId: hasEnv('HB_INTEL_SPFX_APP_ID'),
      opexManager: hasEnv('OPEX_MANAGER_UPN'),
    };
    const provisioningReady = Object.values(provisioningPrereqs).every(Boolean);

    const safetyPermissionPosture = validateSafetyPermissionPosture();
    const safetyRolloutReadiness = deriveSafetyRolloutReadiness(safetyPermissionPosture);

    const integrations: Record<string, 'ready' | 'not-configured'> = {
      signalR: hasEnv('AzureSignalRConnectionString') ? 'ready' : 'not-configured',
      email: hasEnv('EMAIL_DELIVERY_API_KEY') && hasEnv('EMAIL_FROM_ADDRESS') ? 'ready' : 'not-configured',
      notifications: hasEnv('NOTIFICATION_API_BASE_URL') ? 'ready' : 'not-configured',
    };

    const notificationRecipients: Record<string, 'configured' | 'not-configured'> = {
      controllerNotifications: hasEnv('CONTROLLER_UPNS') ? 'configured' : 'not-configured',
      adminNotifications: hasEnv('ADMIN_UPNS') ? 'configured' : 'not-configured',
    };

    const operationalReadiness = computeReadiness(
      coreAuthPresent,
      sharePointPresent,
      provisioningReady && safetyRolloutReadiness.ready,
      isSignalRAcceptableForOperationalTier(),
    );

    const artifactIdentity = resolveBackendArtifactIdentity();

    // Declared permission inventory is posture-aware. staging-broad posture
    // falls back to the pre-rollout summary for operator-facing readability.
    const posture = resolveSafetyPermissionPosture();
    const inventorySummary = summarizeRolloutPermissionInventory(
      posture === 'steady-state' ? 'steady-state' : 'pre-rollout-tightened',
    );

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
      jsonBody: {
        status: 'healthy',
        operationalReadiness,
        artifact: {
          version: artifactIdentity.version,
          commitSha: artifactIdentity.commitSha,
          buildTimestamp: artifactIdentity.buildTimestamp,
        },
        environment: process.env.AZURE_FUNCTIONS_ENVIRONMENT ?? 'unknown',
        environmentPosture: process.env.ENVIRONMENT_POSTURE ?? 'staging',
        adapterMode,
        coreConfigReady: corePresent,
        configTiers: {
          core: coreAuthPresent ? 'ready' : 'missing',
          sharepoint: sharePointPresent ? 'ready' : 'missing',
          provisioning: provisioningReady ? 'ready' : 'incomplete',
          safetyPermissionPosture: safetyRolloutReadiness.ready ? 'ready' : 'blocked',
          safetyRolloutGate: safetyRolloutReadiness.gateReady ? 'ready' : 'blocked',
        },
        provisioningPrereqs,
        safetyPermissionPosture,
        safetyRolloutReadiness: {
          ready: safetyRolloutReadiness.ready,
          surfaceState: safetyRolloutReadiness.surfaceState,
          posture: safetyRolloutReadiness.posture,
          permissionModel: safetyRolloutReadiness.permissionModel,
          postureReady: safetyRolloutReadiness.postureReady,
          proofReady: safetyRolloutReadiness.proofReady,
          gateReady: safetyRolloutReadiness.gateReady,
          gate: safetyRolloutReadiness.gate,
          issueCodes: safetyRolloutReadiness.issues.map((i) => i.code),
        },
        rolloutPermissionInventory: {
          posture: inventorySummary.posture,
          required: inventorySummary.required,
          conditional: inventorySummary.conditional,
          forbidden: inventorySummary.forbidden,
          inventory: inventorySummary.inventory,
        },
        integrations,
        notificationRecipients,
        requestId,
        timestamp: new Date().toISOString(),
      },
    };
  }),
});
