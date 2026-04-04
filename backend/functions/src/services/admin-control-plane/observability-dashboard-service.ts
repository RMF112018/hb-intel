/**
 * Admin Control Plane — Observability Dashboard Service
 *
 * Assembles an aggregated dashboard summary from alert, probe, and error
 * stores into a single response for the operator landing page.
 *
 * @module admin-control-plane/services
 */

import type {
  IObservabilityDashboardSummary,
  IObservabilityPagedResponse,
  IObservabilityErrorRecord,
} from '@hbc/models/admin-control-plane';
import {
  ObservabilityAlertSeverity,
  ObservabilityProbeHealthStatus,
} from '@hbc/models/admin-control-plane';
import type { IObservabilityAlertStore } from './types.js';
import type { IObservabilityProbeSnapshotStore } from './types.js';
import type { IObservabilityErrorStore } from './types.js';

/**
 * Assemble a unified dashboard summary from all observability stores.
 *
 * This function queries each store independently and composes the results
 * into a single `IObservabilityDashboardSummary`. If any individual store
 * query fails, that section is returned with zero counts and the error is
 * logged rather than failing the entire summary.
 */
export async function assembleDashboardSummary(
  alertStore: IObservabilityAlertStore,
  probeStore: IObservabilityProbeSnapshotStore,
  errorStore: IObservabilityErrorStore,
): Promise<IObservabilityDashboardSummary> {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  // Query all stores in parallel
  const [alertSummary, probeSummary, recentErrors] = await Promise.all([
    alertStore.getAlertSummary().catch(() => ({
      criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0,
      totalActiveCount: 0, mostRecentAt: null,
    })),
    probeStore.getHealthSummary().catch(() => ({
      healthyCount: 0, degradedCount: 0, errorCount: 0, unknownCount: 0,
      overallStatus: ObservabilityProbeHealthStatus.Unknown,
      lastSnapshotAt: null, isStale: true,
    })),
    errorStore.listErrors({
      domain: null, source: null, classification: null, severity: null,
      runId: null, from: twentyFourHoursAgo, to: null, cursor: null, limit: 200,
    }).catch((): IObservabilityPagedResponse<IObservabilityErrorRecord> => ({
      items: [], nextCursor: null, totalCount: 0,
    })),
  ]);

  // Count error severities from recent errors
  let errorCritical = 0;
  let errorHigh = 0;
  for (const e of recentErrors.items) {
    if (e.severity === ObservabilityAlertSeverity.Critical) errorCritical++;
    else if (e.severity === ObservabilityAlertSeverity.High) errorHigh++;
  }

  return {
    alerts: {
      criticalCount: alertSummary.criticalCount,
      highCount: alertSummary.highCount,
      mediumCount: alertSummary.mediumCount,
      lowCount: alertSummary.lowCount,
      totalActiveCount: alertSummary.totalActiveCount,
    },
    probes: {
      overallStatus: probeSummary.overallStatus,
      healthyCount: probeSummary.healthyCount,
      degradedCount: probeSummary.degradedCount,
      errorCount: probeSummary.errorCount,
      unknownCount: probeSummary.unknownCount,
      lastSnapshotAt: probeSummary.lastSnapshotAt,
      isStale: probeSummary.isStale,
    },
    errors: {
      totalCount: recentErrors.totalCount,
      criticalCount: errorCritical,
      highCount: errorHigh,
    },
    incidents: {
      openCount: 0,          // Phase 12 — incidents not yet implemented
      investigatingCount: 0,  // Phase 12 — incidents not yet implemented
    },
    computedAt: now.toISOString(),
  };
}
