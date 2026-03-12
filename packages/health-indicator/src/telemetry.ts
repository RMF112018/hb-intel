/**
 * Canonical health-indicator telemetry projection helpers.
 *
 * @design D-SF18-T06
 */

export type HealthIndicatorComplexity = 'Essential' | 'Standard' | 'Expert';
export type HealthIndicatorTelemetryAudience = 'canvas' | 'governance' | 'admin';

export interface IHealthIndicatorTelemetrySnapshot {
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

export function createHealthIndicatorKpiSnapshot(
  metrics: Partial<Omit<IHealthIndicatorTelemetrySnapshot, 'emittedAt'>>,
  emittedAt = new Date().toISOString(),
): IHealthIndicatorTelemetrySnapshot {
  return {
    timeToReadinessMs: normalizeMetric(metrics.timeToReadinessMs),
    blockerResolutionLatencyMs: normalizeMetric(metrics.blockerResolutionLatencyMs),
    readyToBidRate: normalizeMetric(metrics.readyToBidRate),
    submissionErrorRateReduction: normalizeMetric(metrics.submissionErrorRateReduction),
    checklistCes: normalizeMetric(metrics.checklistCes),
    emittedAt,
  };
}

export function getHealthIndicatorTelemetryView(
  snapshot: IHealthIndicatorTelemetrySnapshot,
  params: {
    complexity: HealthIndicatorComplexity;
    audience: HealthIndicatorTelemetryAudience;
  },
): IHealthIndicatorTelemetrySnapshot {
  if (params.complexity === 'Expert' || params.audience === 'admin') {
    return snapshot;
  }

  if (params.complexity === 'Standard') {
    return {
      ...snapshot,
      checklistCes: snapshot.checklistCes,
    };
  }

  return {
    ...snapshot,
    timeToReadinessMs: null,
    blockerResolutionLatencyMs: null,
    submissionErrorRateReduction: null,
    checklistCes: null,
  };
}

let latestSnapshot: IHealthIndicatorTelemetrySnapshot = createHealthIndicatorKpiSnapshot({});

export const healthIndicatorKpiEmitter = {
  emit(snapshot: Partial<Omit<IHealthIndicatorTelemetrySnapshot, 'emittedAt'>>): IHealthIndicatorTelemetrySnapshot {
    latestSnapshot = createHealthIndicatorKpiSnapshot(snapshot);
    return latestSnapshot;
  },

  getLatest(): IHealthIndicatorTelemetrySnapshot {
    return latestSnapshot;
  },

  getView(params: {
    complexity: HealthIndicatorComplexity;
    audience: HealthIndicatorTelemetryAudience;
  }): IHealthIndicatorTelemetrySnapshot {
    return getHealthIndicatorTelemetryView(latestSnapshot, params);
  },

  reset(): void {
    latestSnapshot = createHealthIndicatorKpiSnapshot({});
  },
};
