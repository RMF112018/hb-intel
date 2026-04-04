/**
 * P9.1-05: Microsoft readiness probes for white-glove preflight.
 *
 * Runs connector health and platform readiness checks for Microsoft
 * device management dependencies (Intune, Autopilot, Graph identity).
 *
 * @module device-management/microsoft
 */

import type { IWhiteGloveReadinessCheck } from '@hbc/models/admin-control-plane';
import type { IConnectionRegistryService } from '../../connection-registry-service.js';

/**
 * Run all Microsoft preflight checks for a white-glove package launch.
 *
 * Checks:
 * 1. Intune connector configured and healthy
 * 2. Autopilot connector configured and healthy
 * 3. Graph identity connector configured and healthy
 * 4. Graph permissions sufficient for device operations
 */
export async function runMicrosoftPreflightChecks(
  connectionRegistry: IConnectionRegistryService,
): Promise<readonly IWhiteGloveReadinessCheck[]> {
  const checks: IWhiteGloveReadinessCheck[] = [];

  // Intune connector
  const intuneConn = await connectionRegistry.getConnectionByClass('microsoft-intune');
  checks.push({
    checkId: 'ms-intune-connector',
    label: 'Microsoft Intune connector',
    passed: !!intuneConn && intuneConn.healthStatus === 'healthy',
    message: !intuneConn
      ? 'Intune connector is not configured'
      : intuneConn.healthStatus === 'healthy'
        ? 'Intune connector is configured and healthy'
        : `Intune connector health: ${intuneConn.healthStatus}`,
    blocking: true,
    platform: 'windows-desktop' as never,
    category: 'connector',
  });

  // Autopilot connector
  const autopilotConn = await connectionRegistry.getConnectionByClass('microsoft-autopilot');
  checks.push({
    checkId: 'ms-autopilot-connector',
    label: 'Windows Autopilot connector',
    passed: !!autopilotConn && autopilotConn.healthStatus === 'healthy',
    message: !autopilotConn
      ? 'Autopilot connector is not configured'
      : autopilotConn.healthStatus === 'healthy'
        ? 'Autopilot connector is configured and healthy'
        : `Autopilot connector health: ${autopilotConn.healthStatus}`,
    blocking: true,
    platform: 'windows-desktop' as never,
    category: 'connector',
  });

  // Graph identity connector
  const graphConn = await connectionRegistry.getConnectionByClass('graph-identity');
  checks.push({
    checkId: 'ms-graph-identity-connector',
    label: 'Microsoft Graph identity connector',
    passed: !!graphConn && graphConn.healthStatus === 'healthy',
    message: !graphConn
      ? 'Graph identity connector is not configured'
      : graphConn.healthStatus === 'healthy'
        ? 'Graph identity connector is configured and healthy'
        : `Graph identity connector health: ${graphConn.healthStatus}`,
    blocking: true,
    platform: null,
    category: 'connector',
  });

  // Graph permissions (check env var — same pattern as preflight-service.ts)
  const graphPermissionsConfirmed = process.env.GRAPH_GROUP_PERMISSION_CONFIRMED === 'true';
  checks.push({
    checkId: 'ms-graph-permissions',
    label: 'Microsoft Graph device management permissions',
    passed: graphPermissionsConfirmed,
    message: graphPermissionsConfirmed
      ? 'Graph permissions confirmed for device management operations'
      : 'Graph device management permissions not confirmed (GRAPH_GROUP_PERMISSION_CONFIRMED)',
    blocking: true,
    platform: null,
    category: 'enrollment-config',
  });

  return checks;
}
