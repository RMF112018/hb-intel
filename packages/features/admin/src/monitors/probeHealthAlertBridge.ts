import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { IInfrastructureProbeResult } from '../types/IInfrastructureProbeResult.js';
import type { IProbeSnapshot } from '../types/IProbeSnapshot.js';

/**
 * Converts degraded or errored probe results into alerts.
 *
 * This bridge ensures that infrastructure health problems detected by probes
 * are surfaced in the alert dashboard alongside monitor-generated alerts.
 *
 * Only probe results with status 'degraded' or 'error' produce alerts.
 * Healthy and unknown results are ignored.
 *
 * @design P12-06
 */

const PROBE_SEVERITY_MAP: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
  error: 'critical',
  degraded: 'high',
};

/**
 * Generate alerts from unhealthy probe results in a snapshot.
 */
export function generateProbeHealthAlerts(
  snapshot: IProbeSnapshot,
  nowIso: string,
): IAdminAlert[] {
  const alerts: IAdminAlert[] = [];

  for (const result of snapshot.results) {
    if (result.status === 'healthy' || result.status === 'unknown') continue;

    alerts.push(mapProbeResultToAlert(result, nowIso));
  }

  return alerts;
}

function mapProbeResultToAlert(
  result: IInfrastructureProbeResult,
  nowIso: string,
): IAdminAlert {
  const severity = PROBE_SEVERITY_MAP[result.status] ?? 'medium';
  const anomalyText = result.anomalies.length > 0
    ? ` Anomalies: ${result.anomalies.join('; ')}`
    : '';

  return {
    alertId: `probe-${result.probeKey}-${result.probeId}`,
    category: 'stale-record', // Reuse stale-record category for infra health (closest semantic match)
    severity,
    title: `Probe ${result.status}: ${result.probeKey}`,
    description: `${result.summary}${anomalyText}`,
    affectedEntityType: 'system',
    affectedEntityId: result.probeKey,
    occurredAt: nowIso,
    ctaLabel: 'View Health',
    ctaHref: '/admin/health',
  };
}
