/**
 * Composite safety performance and weighted blend for Safety Field
 * Excellence. Weights match the Wave 02 prompt exactly:
 *
 *   composite =
 *     safetyPerformance * 0.30 +
 *     consistencyTrend  * 0.20 +
 *     activityExposure  * 0.20 +
 *     correctiveAction  * 0.20 +
 *     dataQuality       * 0.10
 *
 * Rounding only happens at the public-result boundary in `generate.ts`.
 */

import { averageAcceptedPercent } from './inspectionFiltering.js';
import type { SafetyInspectionEvent } from '../domain/types.js';

export const COMPOSITE_WEIGHTS = {
  safetyPerformance: 0.3,
  consistencyTrend: 0.2,
  activityExposure: 0.2,
  correctiveAction: 0.2,
  dataQuality: 0.1,
} as const;

export function computeSafetyPerformanceScore(
  accepted: ReadonlyArray<SafetyInspectionEvent>,
): number {
  return averageAcceptedPercent(accepted) ?? 0;
}

export interface CompositeInputs {
  readonly safetyPerformance: number;
  readonly consistencyTrend: number;
  readonly activityExposure: number;
  readonly correctiveAction: number;
  readonly dataQuality: number;
}

export function computeCompositeScore(parts: CompositeInputs): number {
  return (
    parts.safetyPerformance * COMPOSITE_WEIGHTS.safetyPerformance +
    parts.consistencyTrend * COMPOSITE_WEIGHTS.consistencyTrend +
    parts.activityExposure * COMPOSITE_WEIGHTS.activityExposure +
    parts.correctiveAction * COMPOSITE_WEIGHTS.correctiveAction +
    parts.dataQuality * COMPOSITE_WEIGHTS.dataQuality
  );
}

export function roundToHundredths(value: number): number {
  return Math.round(value * 100) / 100;
}
