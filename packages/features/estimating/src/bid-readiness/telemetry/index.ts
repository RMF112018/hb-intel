/**
 * SF18-T06 telemetry projection wrappers.
 *
 * Canonical telemetry runtime is owned by `@hbc/health-indicator`; this module
 * exposes compatibility aliases for SF18 adapter consumers.
 *
 * @design D-SF18-T06, D-SF18-T03
 */
import {
  createHealthIndicatorKpiSnapshot,
  getHealthIndicatorTelemetryView,
  healthIndicatorKpiEmitter,
  type HealthIndicatorComplexity,
  type HealthIndicatorTelemetryAudience,
  type IHealthIndicatorTelemetrySnapshot,
} from '@hbc/health-indicator';

export type BidReadinessComplexity = HealthIndicatorComplexity;
export type BidReadinessTelemetryAudience = HealthIndicatorTelemetryAudience;
export type IBidReadinessTelemetrySnapshot = IHealthIndicatorTelemetrySnapshot;

export function createBidReadinessKpiSnapshot(
  metrics: Partial<Omit<IBidReadinessTelemetrySnapshot, 'emittedAt'>>,
  emittedAt = new Date().toISOString(),
): IBidReadinessTelemetrySnapshot {
  return createHealthIndicatorKpiSnapshot(metrics, emittedAt);
}

export function getTelemetryView(
  snapshot: IBidReadinessTelemetrySnapshot,
  params: {
    complexity: BidReadinessComplexity;
    audience: BidReadinessTelemetryAudience;
  },
): IBidReadinessTelemetrySnapshot {
  return getHealthIndicatorTelemetryView(snapshot, params);
}

export const bidReadinessKpiEmitter = {
  emit(snapshot: Partial<Omit<IBidReadinessTelemetrySnapshot, 'emittedAt'>>): IBidReadinessTelemetrySnapshot {
    return healthIndicatorKpiEmitter.emit(snapshot);
  },

  getLatest(): IBidReadinessTelemetrySnapshot {
    return healthIndicatorKpiEmitter.getLatest();
  },

  getView(params: {
    complexity: BidReadinessComplexity;
    audience: BidReadinessTelemetryAudience;
  }): IBidReadinessTelemetrySnapshot {
    return healthIndicatorKpiEmitter.getView(params);
  },

  reset(): void {
    healthIndicatorKpiEmitter.reset();
  },
};
