/**
 * P9.1-07: NinjaOne readiness probes for white-glove preflight.
 *
 * @module device-management/ninjaone
 */

import type { IWhiteGloveReadinessCheck } from '@hbc/models/admin-control-plane';
import type { IConnectionRegistryService } from '../../connection-registry-service.js';

/**
 * Run NinjaOne preflight checks for a white-glove package launch.
 *
 * Checks:
 * 1. NinjaOne API connector configured and healthy
 */
export async function runNinjaOnePreflightChecks(
  connectionRegistry: IConnectionRegistryService,
): Promise<readonly IWhiteGloveReadinessCheck[]> {
  const checks: IWhiteGloveReadinessCheck[] = [];

  const conn = await connectionRegistry.getConnectionByClass('ninjaone-api');
  checks.push({
    checkId: 'ninjaone-api-connector',
    label: 'NinjaOne API connector',
    passed: !!conn && conn.healthStatus === 'healthy',
    message: !conn
      ? 'NinjaOne connector is not configured'
      : conn.healthStatus === 'healthy'
        ? 'NinjaOne connector is configured and healthy'
        : `NinjaOne connector health: ${conn.healthStatus}`,
    blocking: true,
    platform: null,
    category: 'connector',
  });

  return checks;
}
