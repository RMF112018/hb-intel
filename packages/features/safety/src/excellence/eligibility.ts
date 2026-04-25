/**
 * Eligibility evaluation and publish-recommendation mapping for Safety
 * Field Excellence.
 *
 * Encodes the mandatory low-activity perfect-score suppression rule and
 * the multi-signal narrative gate. A weak single-score candidate must
 * never become a primary homepage highlight.
 */

import type { SafetyActivityEvidence, SafetyExcellenceCandidateInput } from './types.js';
import {
  EXCELLENCE_REASON_CODES,
  type ExcellenceReasonCode,
  type SafetyExcellenceEligibilityStatus,
  type SafetyExcellencePublishRecommendation,
} from './types.js';
import type { FindingSummary } from './correctiveActions.js';
import type { DataQualityResult } from './dataQuality.js';
import type { InspectionPartition } from './inspectionFiltering.js';

export interface EligibilityInputs {
  readonly input: SafetyExcellenceCandidateInput;
  readonly partition: InspectionPartition;
  readonly summary: FindingSummary;
  readonly evidence: SafetyActivityEvidence;
  readonly dataQuality: DataQualityResult;
  readonly composite: number;
  readonly inspectionCountWindow: number;
  readonly averageInspectionScoreWindow: number | null;
  readonly totalNoAcrossAccepted: number;
  readonly hasMultiSignal: boolean;
}

export interface EligibilityResult {
  readonly status: SafetyExcellenceEligibilityStatus;
  readonly recommendation: SafetyExcellencePublishRecommendation;
  readonly exclusionReasons: ReadonlyArray<ExcellenceReasonCode>;
}

const PRIMARY_COMPOSITE_FLOOR = 80;
const SECONDARY_COMPOSITE_FLOOR = 70;
const DATA_QUALITY_FLOOR = 60;

export function evaluateEligibility(inputs: EligibilityInputs): EligibilityResult {
  const reasons = new Set<ExcellenceReasonCode>();
  const { projectWeek } = inputs.input;

  const projectUnresolved =
    projectWeek.projectSourceClassification === 'unresolved' || !projectWeek.projectNumber;
  if (projectUnresolved) {
    reasons.add(EXCELLENCE_REASON_CODES.PROJECT_NOT_RESOLVED);
  }

  if (inputs.inspectionCountWindow === 0) {
    reasons.add(EXCELLENCE_REASON_CODES.NO_CURRENT_INSPECTIONS);
  }

  if (inputs.summary.highSeverityOpenCount > 0) {
    reasons.add(EXCELLENCE_REASON_CODES.UNRESOLVED_HIGH_SEVERITY_FINDING);
  }

  if (inputs.summary.agedOpenFindingCount > 0) {
    reasons.add(EXCELLENCE_REASON_CODES.AGED_OPEN_FINDINGS);
  }

  if (inputs.summary.repeatFindingCount >= 2) {
    reasons.add(EXCELLENCE_REASON_CODES.REPEAT_FINDING_PRESSURE);
  }

  if (inputs.dataQuality.score < DATA_QUALITY_FLOOR) {
    reasons.add(EXCELLENCE_REASON_CODES.DATA_QUALITY_LOW);
  }

  if (inputs.dataQuality.hasReviewRequired) {
    reasons.add(EXCELLENCE_REASON_CODES.REVIEW_REQUIRED_INSPECTIONS);
  }

  if (inputs.evidence.status === 'missing') {
    reasons.add(EXCELLENCE_REASON_CODES.ACTIVITY_EVIDENCE_MISSING);
  } else if (inputs.evidence.status === 'inferred') {
    reasons.add(EXCELLENCE_REASON_CODES.ACTIVITY_EVIDENCE_INFERRED_ONLY);
  }

  // Mandatory low-activity perfect-score suppression — primary rule.
  const perfectWindow = inputs.averageInspectionScoreWindow === 100;
  if (
    perfectWindow &&
    inputs.inspectionCountWindow <= 1 &&
    inputs.evidence.status !== 'proven'
  ) {
    reasons.add(EXCELLENCE_REASON_CODES.PERFECT_SCORE_INSUFFICIENT_ACTIVITY);
  }

  // Mandatory low-activity perfect-score suppression — secondary guard.
  if (
    perfectWindow &&
    inputs.totalNoAcrossAccepted === 0 &&
    inputs.summary.highSeverityFindingCount === 0 &&
    inputs.evidence.status === 'missing'
  ) {
    reasons.add(EXCELLENCE_REASON_CODES.PERFECT_SCORE_INSUFFICIENT_ACTIVITY);
  }

  if (!inputs.hasMultiSignal && inputs.inspectionCountWindow > 0) {
    reasons.add(EXCELLENCE_REASON_CODES.SINGLE_SIGNAL_NARRATIVE);
  }

  return mapToEligibilityAndRecommendation(reasons, inputs);
}

function mapToEligibilityAndRecommendation(
  reasons: Set<ExcellenceReasonCode>,
  inputs: EligibilityInputs,
): EligibilityResult {
  const exclusionReasons = Array.from(reasons);

  // Hard ineligibility — disqualifying conditions for any homepage role.
  const hardIneligibilityReasons: ExcellenceReasonCode[] = [
    EXCELLENCE_REASON_CODES.PROJECT_NOT_RESOLVED,
    EXCELLENCE_REASON_CODES.NO_CURRENT_INSPECTIONS,
    EXCELLENCE_REASON_CODES.UNRESOLVED_HIGH_SEVERITY_FINDING,
    EXCELLENCE_REASON_CODES.PERFECT_SCORE_INSUFFICIENT_ACTIVITY,
  ];
  if (hardIneligibilityReasons.some((reason) => reasons.has(reason))) {
    return {
      status: 'ineligible',
      recommendation: 'do-not-publish',
      exclusionReasons,
    };
  }

  // Review-blocking conditions — flagged for leadership before publication.
  if (reasons.has(EXCELLENCE_REASON_CODES.REVIEW_REQUIRED_INSPECTIONS)) {
    return {
      status: 'needs-review',
      recommendation: 'monitor',
      exclusionReasons,
    };
  }

  // Low-confidence conditions — eligible to monitor but not to elevate.
  const lowConfidenceReasons: ExcellenceReasonCode[] = [
    EXCELLENCE_REASON_CODES.DATA_QUALITY_LOW,
    EXCELLENCE_REASON_CODES.SINGLE_SIGNAL_NARRATIVE,
    EXCELLENCE_REASON_CODES.AGED_OPEN_FINDINGS,
    EXCELLENCE_REASON_CODES.REPEAT_FINDING_PRESSURE,
  ];
  if (lowConfidenceReasons.some((reason) => reasons.has(reason))) {
    return {
      status: 'low-confidence',
      recommendation: 'monitor',
      exclusionReasons,
    };
  }

  // Inferred or missing activity evidence may still pass eligibility but
  // must not be promoted to primary.
  const inferredOrMissing =
    reasons.has(EXCELLENCE_REASON_CODES.ACTIVITY_EVIDENCE_INFERRED_ONLY) ||
    reasons.has(EXCELLENCE_REASON_CODES.ACTIVITY_EVIDENCE_MISSING);

  if (inputs.composite >= PRIMARY_COMPOSITE_FLOOR && !inferredOrMissing) {
    return {
      status: 'eligible',
      recommendation: 'primary',
      exclusionReasons,
    };
  }

  if (inputs.composite >= SECONDARY_COMPOSITE_FLOOR) {
    return {
      status: 'eligible',
      recommendation: 'secondary',
      exclusionReasons,
    };
  }

  return {
    status: 'eligible',
    recommendation: 'monitor',
    exclusionReasons,
  };
}
