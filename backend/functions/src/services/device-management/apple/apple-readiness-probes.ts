/**
 * P9.1-06: Apple readiness probes for white-glove preflight.
 *
 * Runs connector health and platform readiness checks for Apple
 * device management dependencies (ABM, ADE, APNs).
 *
 * @module device-management/apple
 */

import type { IWhiteGloveReadinessCheck } from '@hbc/models/admin-control-plane';
import type { IConnectionRegistryService } from '../../connection-registry-service.js';

/**
 * Run all Apple preflight checks for a white-glove package launch.
 *
 * Checks:
 * 1. ABM connector configured and healthy
 * 2. ADE connector configured and healthy
 * 3. APNs connector configured and healthy
 */
export async function runApplePreflightChecks(
  connectionRegistry: IConnectionRegistryService,
): Promise<readonly IWhiteGloveReadinessCheck[]> {
  const checks: IWhiteGloveReadinessCheck[] = [];

  // ABM connector
  const abmConn = await connectionRegistry.getConnectionByClass('apple-abm');
  checks.push({
    checkId: 'apple-abm-connector',
    label: 'Apple Business Manager connector',
    passed: !!abmConn && abmConn.healthStatus === 'healthy',
    message: !abmConn
      ? 'ABM connector is not configured'
      : abmConn.healthStatus === 'healthy'
        ? 'ABM connector is configured and healthy'
        : `ABM connector health: ${abmConn.healthStatus}`,
    blocking: true,
    platform: 'iphone' as never, // Applies to all Apple devices
    category: 'connector',
  });

  // ADE connector
  const adeConn = await connectionRegistry.getConnectionByClass('apple-ade');
  checks.push({
    checkId: 'apple-ade-connector',
    label: 'Apple Automated Device Enrollment connector',
    passed: !!adeConn && adeConn.healthStatus === 'healthy',
    message: !adeConn
      ? 'ADE connector is not configured'
      : adeConn.healthStatus === 'healthy'
        ? 'ADE connector is configured and healthy'
        : `ADE connector health: ${adeConn.healthStatus}`,
    blocking: true,
    platform: 'iphone' as never,
    category: 'connector',
  });

  // APNs connector
  const apnsConn = await connectionRegistry.getConnectionByClass('apple-apns');
  checks.push({
    checkId: 'apple-apns-connector',
    label: 'Apple Push Notification Service connector',
    passed: !!apnsConn && apnsConn.healthStatus === 'healthy',
    message: !apnsConn
      ? 'APNs connector is not configured'
      : apnsConn.healthStatus === 'healthy'
        ? 'APNs connector is configured and healthy'
        : `APNs connector health: ${apnsConn.healthStatus}`,
    blocking: true,
    platform: 'iphone' as never,
    category: 'connector',
  });

  return checks;
}
