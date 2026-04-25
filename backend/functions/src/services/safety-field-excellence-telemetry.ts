/**
 * Thin telemetry wrapper for Safety Field Excellence rollup events.
 *
 * Wraps the existing `emitSafetyIngestionEvent` / `emitSafetyIngestionMetric`
 * sink so the new feature shares the live telemetry pipeline without
 * mutating the ingestion telemetry seam. Sanitizes the same redacted keys
 * (rawChecklistJson, payload, bytes, etc.) by virtue of delegating.
 */

import {
  emitSafetyIngestionEvent,
  emitSafetyIngestionMetric,
  type ISafetyIngestionTelemetryContext,
  type SafetyIngestionTelemetryOperation,
} from './safety-ingestion-telemetry.js';

export type ExcellenceTelemetryOperation = 'excellence-rollup-read' | 'excellence-rollup-generate';

export interface ExcellenceTelemetryContext {
  readonly requestId?: string;
  readonly operation: ExcellenceTelemetryOperation;
  readonly reportingPeriodId?: string;
  readonly generatorVersion?: string;
}

function toIngestionContext(ctx: ExcellenceTelemetryContext): ISafetyIngestionTelemetryContext {
  // The shared telemetry pipeline keys events by `operation`. We reuse the
  // existing union by aliasing excellence operations into a stable label;
  // downstream telemetry consumers see the event name + operation tag.
  const operation: SafetyIngestionTelemetryOperation =
    'reporting-period-probe'; // closest existing label for shared sink; event name distinguishes feature.
  return {
    requestId: ctx.requestId,
    operation,
  };
}

export function emitExcellenceRollupEvent(
  name: string,
  context: ExcellenceTelemetryContext,
  properties: Record<string, unknown> = {},
): void {
  emitSafetyIngestionEvent(name, toIngestionContext(context), {
    excellenceOperation: context.operation,
    reportingPeriodId: context.reportingPeriodId,
    generatorVersion: context.generatorVersion,
    ...properties,
  });
}

export function emitExcellenceRollupMetric(
  name: string,
  value: number,
  context: ExcellenceTelemetryContext,
  properties: Record<string, unknown> = {},
): void {
  emitSafetyIngestionMetric(name, value, toIngestionContext(context), {
    excellenceOperation: context.operation,
    reportingPeriodId: context.reportingPeriodId,
    generatorVersion: context.generatorVersion,
    ...properties,
  });
}
