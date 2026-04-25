/**
 * Activity / exposure derivation for Safety Field Excellence.
 *
 * Repo truth: today there is no tenant manpower or daily-log data source.
 * `proven` evidence therefore requires a caller-supplied `manual` or
 * `daily-log` source; the domain itself can only infer activity from the
 * project stage snapshot or rolling inspection density.
 *
 * `inferred` evidence may support `secondary` or `monitor` recommendations
 * but must never permit a weak single-score candidate to become `primary`.
 */

import type {
  SafetyActivityEvidence,
  SafetyActivityEvidenceSource,
  SafetyActivityEvidenceStatus,
  SafetyExcellenceCandidateInput,
} from './types.js';

const ACTIVE_STAGE_PATTERN =
  /(active|construction|in[- ]?progress|frame|framing|drywall|finish|roofing|mep|fit[- ]?out)/i;

const INFERRED_INSPECTION_DENSITY_THRESHOLD = 3;

export function deriveActivityEvidence(
  input: SafetyExcellenceCandidateInput,
): SafetyActivityEvidence {
  if (input.activityEvidence) {
    return input.activityEvidence;
  }

  const stage = input.projectWeek.projectStageSnapshot ?? '';
  const stageMatch = ACTIVE_STAGE_PATTERN.test(stage);
  const rollingInspectionCount = input.priorInspections.length;

  let status: SafetyActivityEvidenceStatus = 'missing';
  let source: SafetyActivityEvidenceSource = 'none';

  if (stageMatch) {
    status = 'inferred';
    source = 'project-stage';
  } else if (rollingInspectionCount >= INFERRED_INSPECTION_DENSITY_THRESHOLD) {
    status = 'inferred';
    source = 'inspection-density';
  }

  return {
    status,
    source,
    projectStage: stage || undefined,
  };
}

export interface ActivityExposureResult {
  readonly score: number;
  readonly evidence: SafetyActivityEvidence;
}

/**
 * Activity exposure score on a 0..100 scale.
 *
 * Banded for stability. `proven` evidence with multiple inspections in the
 * window earns the highest band; `missing` evidence sits at the floor.
 */
export function computeActivityExposureScore(
  input: SafetyExcellenceCandidateInput,
  evidence: SafetyActivityEvidence,
  inspectionCountWindow: number,
): ActivityExposureResult {
  let score: number;
  if (evidence.status === 'proven') {
    score = inspectionCountWindow >= 2 ? 90 : 75;
  } else if (evidence.status === 'inferred') {
    score = 55;
  } else {
    score = 20;
  }

  return { score, evidence };
}
