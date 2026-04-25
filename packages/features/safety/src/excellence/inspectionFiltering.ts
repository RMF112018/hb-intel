/**
 * Inspection filtering for Safety Field Excellence scoring.
 *
 * Repo boundary: `SafetyInspectionEvent.inspectionScore` is fractional
 * (0..1) — produced by `scoring/scoringEngine.ts` as a weighted average of
 * `yes / (yes+no)` per section. The excellence domain operates on a
 * 0..100 scale internally, so all inbound scores pass through `toPercent`.
 */

import type { SafetyInspectionEvent } from '../domain/types.js';

export interface InspectionPartition {
  readonly accepted: ReadonlyArray<SafetyInspectionEvent>;
  readonly duplicateSuspected: ReadonlyArray<SafetyInspectionEvent>;
  readonly superseded: ReadonlyArray<SafetyInspectionEvent>;
  readonly reviewRequired: ReadonlyArray<SafetyInspectionEvent>;
  readonly rejected: ReadonlyArray<SafetyInspectionEvent>;
}

export function partitionInspections(
  events: ReadonlyArray<SafetyInspectionEvent>,
): InspectionPartition {
  const accepted: SafetyInspectionEvent[] = [];
  const duplicateSuspected: SafetyInspectionEvent[] = [];
  const superseded: SafetyInspectionEvent[] = [];
  const reviewRequired: SafetyInspectionEvent[] = [];
  const rejected: SafetyInspectionEvent[] = [];

  for (const event of events) {
    switch (event.ingestionStatus) {
      case 'accepted':
        accepted.push(event);
        break;
      case 'duplicate-suspected':
        duplicateSuspected.push(event);
        break;
      case 'superseded':
        superseded.push(event);
        break;
      case 'review-required':
        reviewRequired.push(event);
        break;
      case 'rejected':
        rejected.push(event);
        break;
    }
  }

  return { accepted, duplicateSuspected, superseded, reviewRequired, rejected };
}

/**
 * Convert a fractional inspection score (0..1) to a percent (0..100).
 * Rounding only occurs at the domain boundary in `scoring.ts`; this helper
 * preserves precision.
 */
export function toPercent(fractional: number): number {
  return fractional * 100;
}

/**
 * Average percent score across accepted inspections, or null when empty.
 * Ignores any non-accepted records — duplicate-suspected, review-required,
 * superseded, and rejected events never inflate the score numerator.
 */
export function averageAcceptedPercent(
  accepted: ReadonlyArray<SafetyInspectionEvent>,
): number | null {
  if (accepted.length === 0) return null;
  const sum = accepted.reduce((acc, event) => acc + toPercent(event.inspectionScore), 0);
  return sum / accepted.length;
}

/**
 * Sum of `totalNo` across accepted inspections.
 * Used by the secondary 100% guard: a perfect score with zero "no"
 * answers, no high-severity findings, and missing activity evidence is
 * never a primary highlight.
 */
export function totalNoAcrossAccepted(
  accepted: ReadonlyArray<SafetyInspectionEvent>,
): number {
  return accepted.reduce((sum, event) => sum + event.totalNo, 0);
}
