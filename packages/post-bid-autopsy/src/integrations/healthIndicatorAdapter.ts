import type { IAutopsyRecordSnapshot } from '../types/index.js';

export interface IAutopsyHealthIndicatorTelemetryProjection {
  readonly timeToReadinessMs: number | null;
  readonly blockerResolutionLatencyMs: number | null;
  readonly readyToBidRate: number | null;
  readonly submissionErrorRateReduction: number | null;
  readonly checklistCes: number | null;
  readonly emittedAt: string;
}

export const projectAutopsyToHealthIndicatorTelemetry = (
  record: IAutopsyRecordSnapshot,
  emittedAt = record.auditTrail.at(-1)?.occurredAt ?? record.sla.startedAt
): IAutopsyHealthIndicatorTelemetryProjection => ({
  timeToReadinessMs:
    record.autopsy.telemetry.autopsyCompletionLatency === null
      ? null
      : record.autopsy.telemetry.autopsyCompletionLatency * 86_400_000,
  blockerResolutionLatencyMs:
    record.autopsy.telemetry.revalidationLatency === null
      ? null
      : record.autopsy.telemetry.revalidationLatency * 86_400_000,
  readyToBidRate: record.autopsy.telemetry.corroborationRate,
  submissionErrorRateReduction: record.autopsy.telemetry.benchmarkAccuracyLift,
  checklistCes: record.autopsy.telemetry.autopsyCes,
  emittedAt,
});
