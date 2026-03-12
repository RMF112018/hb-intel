/**
 * SF18-T03 bid readiness KPI projection and emitter helpers.
 *
 * Contract-level telemetry utilities keep KPI snapshots deterministic and typed
 * without introducing sidecar runtime pipelines in this phase.
 *
 * @design D-SF18-T03, L-06
 */

export type BidReadinessComplexity = 'Essential' | 'Standard' | 'Expert';
export type BidReadinessTelemetryAudience = 'canvas' | 'governance' | 'admin';

export interface IBidReadinessTelemetrySnapshot {
  readonly timeToReadinessMs: number | null;
  readonly blockerResolutionLatencyMs: number | null;
  readonly readyToBidRate: number | null;
  readonly submissionErrorRateReduction: number | null;
  readonly checklistCes: number | null;
  readonly emittedAt: string;
}

function normalizeMetric(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  return Number(value.toFixed(4));
}

/**
 * Creates a deterministic KPI snapshot with null-safe normalization.
 *
 * @design D-SF18-T03
 */
export function createBidReadinessKpiSnapshot(
  metrics: Partial<Omit<IBidReadinessTelemetrySnapshot, 'emittedAt'>>,
  emittedAt = new Date().toISOString(),
): IBidReadinessTelemetrySnapshot {
  return {
    timeToReadinessMs: normalizeMetric(metrics.timeToReadinessMs),
    blockerResolutionLatencyMs: normalizeMetric(metrics.blockerResolutionLatencyMs),
    readyToBidRate: normalizeMetric(metrics.readyToBidRate),
    submissionErrorRateReduction: normalizeMetric(metrics.submissionErrorRateReduction),
    checklistCes: normalizeMetric(metrics.checklistCes),
    emittedAt,
  };
}

/**
 * Filters KPI visibility by complexity and audience.
 *
 * @design D-SF18-T03
 */
export function getTelemetryView(
  snapshot: IBidReadinessTelemetrySnapshot,
  params: {
    complexity: BidReadinessComplexity;
    audience: BidReadinessTelemetryAudience;
  },
): IBidReadinessTelemetrySnapshot {
  if (params.complexity === 'Expert' || params.audience === 'admin') {
    return snapshot;
  }

  if (params.complexity === 'Standard') {
    return {
      ...snapshot,
      checklistCes: snapshot.checklistCes,
    };
  }

  // Essential/canvas view keeps only the topline readiness-rate metric.
  return {
    ...snapshot,
    timeToReadinessMs: null,
    blockerResolutionLatencyMs: null,
    submissionErrorRateReduction: null,
    checklistCes: null,
  };
}

let latestSnapshot: IBidReadinessTelemetrySnapshot = createBidReadinessKpiSnapshot({});

/**
 * In-memory deterministic KPI emitter used by T03/T04 adapter boundaries.
 *
 * @design D-SF18-T03
 */
export const bidReadinessKpiEmitter = {
  emit(snapshot: Partial<Omit<IBidReadinessTelemetrySnapshot, 'emittedAt'>>): IBidReadinessTelemetrySnapshot {
    latestSnapshot = createBidReadinessKpiSnapshot(snapshot);
    return latestSnapshot;
  },

  getLatest(): IBidReadinessTelemetrySnapshot {
    return latestSnapshot;
  },

  getView(params: {
    complexity: BidReadinessComplexity;
    audience: BidReadinessTelemetryAudience;
  }): IBidReadinessTelemetrySnapshot {
    return getTelemetryView(latestSnapshot, params);
  },

  reset(): void {
    latestSnapshot = createBidReadinessKpiSnapshot({});
  },
};
