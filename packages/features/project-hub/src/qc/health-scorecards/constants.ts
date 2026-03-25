/**
 * P3-E15-T10 Stage 8 Project QC Module health-scorecards constants.
 */

import type {
  QualityStatusBand,
  ScorecardDomain,
  ConfidenceTier,
  RollupBand,
  LearningCandidateState,
  LearningTargetType,
  AnalysisMandatoryReason,
  WeightingPhilosophy,
  DrilldownDimension,
  ManualReviewPressureLevel,
} from './enums.js';
import type { IScorecardWeightDefinition, IDrilldownDescriptor } from './types.js';

// -- Enum Arrays ---------------------------------------------------------------

export const QC_QUALITY_STATUS_BANDS = [
  'HEALTHY',
  'WATCH',
  'AT_RISK',
  'CRITICAL',
  'DATA_PENDING',
] as const satisfies ReadonlyArray<QualityStatusBand>;

export const QC_SCORECARD_DOMAINS = [
  'PLAN_GATE_READINESS',
  'ISSUE_ACTION_PERFORMANCE',
  'EXCEPTION_DEPENDENCY_PRESSURE',
  'EVIDENCE_VERIFICATION_QUALITY',
  'RECURRENCE_LEARNING_POSTURE',
] as const satisfies ReadonlyArray<ScorecardDomain>;

export const QC_CONFIDENCE_TIERS = [
  'HIGH',
  'MODERATE',
  'LOW',
  'INSUFFICIENT_DATA',
] as const satisfies ReadonlyArray<ConfidenceTier>;

export const QC_ROLLUP_BANDS = [
  'STRONG',
  'ACCEPTABLE',
  'WATCH',
  'CONCERN',
  'CRITICAL',
] as const satisfies ReadonlyArray<RollupBand>;

export const QC_LEARNING_CANDIDATE_STATES = [
  'DRAFT',
  'CONFIRMED',
  'SUBMITTED_FOR_REVIEW',
  'MOE_APPROVED',
  'MOE_REJECTED',
  'PUBLISHED_AS_UPDATE',
] as const satisfies ReadonlyArray<LearningCandidateState>;

export const QC_LEARNING_TARGET_TYPES = [
  'STANDARD',
  'BEST_PRACTICE_PACKET',
  'TAXONOMY',
  'COVERAGE_SET',
  'ADVISORY_RULE',
  'SCORECARD_REFINEMENT',
  'ROOT_CAUSE_MODEL_REFINEMENT',
] as const satisfies ReadonlyArray<LearningTargetType>;

export const QC_ANALYSIS_MANDATORY_REASONS = [
  'ISSUE_REOPENED',
  'RECURRENCE_DETECTED',
  'HIGH_SEVERITY',
  'REPEATED_ORG_PATTERN',
  'LEARNING_QUALIFIED',
] as const satisfies ReadonlyArray<AnalysisMandatoryReason>;

export const QC_WEIGHTING_PHILOSOPHIES = [
  'LEADING_DOMINANT',
  'LAGGING_BALANCED',
] as const satisfies ReadonlyArray<WeightingPhilosophy>;

export const QC_DRILLDOWN_DIMENSIONS = [
  'WORK_PACKAGE',
  'RECORD_FAMILY',
  'RESPONSIBLE_ORG',
  'CAUSE_CATEGORY',
  'AGING_BUCKET',
  'VERIFIER_STATUS',
  'READINESS_IMPACT',
  'SNAPSHOT_VERSION',
] as const satisfies ReadonlyArray<DrilldownDimension>;

export const QC_MANUAL_REVIEW_PRESSURE_LEVELS = [
  'NONE',
  'LOW',
  'MODERATE',
  'HIGH',
  'CRITICAL',
] as const satisfies ReadonlyArray<ManualReviewPressureLevel>;

// -- Label Maps ----------------------------------------------------------------

export const QC_QUALITY_STATUS_BAND_LABELS: Readonly<Record<QualityStatusBand, string>> = {
  HEALTHY: 'Healthy',
  WATCH: 'Watch',
  AT_RISK: 'At risk',
  CRITICAL: 'Critical',
  DATA_PENDING: 'Data pending',
};

export const QC_SCORECARD_DOMAIN_LABELS: Readonly<Record<ScorecardDomain, string>> = {
  PLAN_GATE_READINESS: 'Plan gate readiness',
  ISSUE_ACTION_PERFORMANCE: 'Issue action performance',
  EXCEPTION_DEPENDENCY_PRESSURE: 'Exception dependency pressure',
  EVIDENCE_VERIFICATION_QUALITY: 'Evidence verification quality',
  RECURRENCE_LEARNING_POSTURE: 'Recurrence learning posture',
};

export const QC_CONFIDENCE_TIER_LABELS: Readonly<Record<ConfidenceTier, string>> = {
  HIGH: 'High',
  MODERATE: 'Moderate',
  LOW: 'Low',
  INSUFFICIENT_DATA: 'Insufficient data',
};

export const QC_ROLLUP_BAND_LABELS: Readonly<Record<RollupBand, string>> = {
  STRONG: 'Strong',
  ACCEPTABLE: 'Acceptable',
  WATCH: 'Watch',
  CONCERN: 'Concern',
  CRITICAL: 'Critical',
};

export const QC_LEARNING_CANDIDATE_STATE_LABELS: Readonly<Record<LearningCandidateState, string>> = {
  DRAFT: 'Draft',
  CONFIRMED: 'Confirmed',
  SUBMITTED_FOR_REVIEW: 'Submitted for review',
  MOE_APPROVED: 'MOE approved',
  MOE_REJECTED: 'MOE rejected',
  PUBLISHED_AS_UPDATE: 'Published as update',
};

export const QC_ANALYSIS_MANDATORY_REASON_LABELS: Readonly<Record<AnalysisMandatoryReason, string>> = {
  ISSUE_REOPENED: 'Issue reopened',
  RECURRENCE_DETECTED: 'Recurrence detected',
  HIGH_SEVERITY: 'High severity',
  REPEATED_ORG_PATTERN: 'Repeated org pattern',
  LEARNING_QUALIFIED: 'Learning qualified',
};

// -- Scorecard Weight Definitions -----------------------------------------------

export const SCORECARD_WEIGHT_DEFINITIONS: ReadonlyArray<IScorecardWeightDefinition> = [
  {
    domain: 'PLAN_GATE_READINESS',
    weight: 0.25,
    isLeadingIndicator: true,
    isMoeGoverned: true,
    adjustmentConstraint: 'MOE approval required for weight change',
  },
  {
    domain: 'ISSUE_ACTION_PERFORMANCE',
    weight: 0.25,
    isLeadingIndicator: false,
    isMoeGoverned: true,
    adjustmentConstraint: 'MOE approval required for weight change',
  },
  {
    domain: 'EXCEPTION_DEPENDENCY_PRESSURE',
    weight: 0.20,
    isLeadingIndicator: true,
    isMoeGoverned: true,
    adjustmentConstraint: 'MOE approval required for weight change',
  },
  {
    domain: 'EVIDENCE_VERIFICATION_QUALITY',
    weight: 0.15,
    isLeadingIndicator: true,
    isMoeGoverned: true,
    adjustmentConstraint: 'MOE approval required for weight change',
  },
  {
    domain: 'RECURRENCE_LEARNING_POSTURE',
    weight: 0.15,
    isLeadingIndicator: false,
    isMoeGoverned: true,
    adjustmentConstraint: 'MOE approval required for weight change',
  },
];

// -- Drilldown Dimension Definitions -------------------------------------------

export const DRILLDOWN_DIMENSION_DEFINITIONS: ReadonlyArray<IDrilldownDescriptor> = [
  {
    dimension: 'WORK_PACKAGE',
    isAvailable: true,
    sourceRecordFamily: 'WorkPackageQualityPlan',
    navigationHint: 'Navigate to work package quality plan detail',
  },
  {
    dimension: 'RECORD_FAMILY',
    isAvailable: true,
    sourceRecordFamily: 'QcIssue',
    navigationHint: 'Navigate to record family issue list',
  },
  {
    dimension: 'RESPONSIBLE_ORG',
    isAvailable: true,
    sourceRecordFamily: 'ResponsibleOrgPerformanceRollupInput',
    navigationHint: 'Navigate to responsible org performance detail',
  },
  {
    dimension: 'CAUSE_CATEGORY',
    isAvailable: true,
    sourceRecordFamily: 'RootCauseAndRecurrenceRecord',
    navigationHint: 'Navigate to root cause analysis by category',
  },
  {
    dimension: 'AGING_BUCKET',
    isAvailable: true,
    sourceRecordFamily: 'QcIssue',
    navigationHint: 'Navigate to issue aging breakdown',
  },
  {
    dimension: 'VERIFIER_STATUS',
    isAvailable: true,
    sourceRecordFamily: 'EvidenceReference',
    navigationHint: 'Navigate to evidence verification status detail',
  },
  {
    dimension: 'READINESS_IMPACT',
    isAvailable: true,
    sourceRecordFamily: 'QcIssue',
    navigationHint: 'Navigate to readiness impact breakdown',
  },
  {
    dimension: 'SNAPSHOT_VERSION',
    isAvailable: true,
    sourceRecordFamily: 'ProjectQcSnapshot',
    navigationHint: 'Navigate to snapshot version comparison',
  },
];

// -- Learning Pipeline Valid Transitions ----------------------------------------

export const LEARNING_PIPELINE_VALID_TRANSITIONS: ReadonlyArray<{
  readonly from: LearningCandidateState;
  readonly to: LearningCandidateState;
}> = [
  { from: 'DRAFT', to: 'CONFIRMED' },
  { from: 'CONFIRMED', to: 'SUBMITTED_FOR_REVIEW' },
  { from: 'SUBMITTED_FOR_REVIEW', to: 'MOE_APPROVED' },
  { from: 'SUBMITTED_FOR_REVIEW', to: 'MOE_REJECTED' },
  { from: 'MOE_REJECTED', to: 'CONFIRMED' },
  { from: 'MOE_APPROVED', to: 'PUBLISHED_AS_UPDATE' },
];

// -- Analysis Mandatory Conditions ----------------------------------------------

export const ANALYSIS_MANDATORY_CONDITIONS: ReadonlyArray<{
  readonly reason: AnalysisMandatoryReason;
  readonly description: string;
}> = [
  { reason: 'ISSUE_REOPENED', description: 'Issue was reopened after previous closure' },
  { reason: 'RECURRENCE_DETECTED', description: 'Recurrence detected for same root cause' },
  { reason: 'HIGH_SEVERITY', description: 'Issue severity is critical or high' },
  { reason: 'REPEATED_ORG_PATTERN', description: 'Repeated pattern detected for responsible org' },
  { reason: 'LEARNING_QUALIFIED', description: 'Issue qualifies for enterprise learning pipeline' },
];

// -- Learning Target Definitions ------------------------------------------------

export const LEARNING_TARGET_DEFINITIONS: ReadonlyArray<{
  readonly targetType: LearningTargetType;
  readonly description: string;
}> = [
  { targetType: 'STANDARD', description: 'Governed quality standard update' },
  { targetType: 'BEST_PRACTICE_PACKET', description: 'Best practice packet addition or revision' },
  { targetType: 'TAXONOMY', description: 'Taxonomy refinement for classification' },
  { targetType: 'COVERAGE_SET', description: 'Coverage set expansion or adjustment' },
  { targetType: 'ADVISORY_RULE', description: 'Advisory rule creation or modification' },
  { targetType: 'SCORECARD_REFINEMENT', description: 'Scorecard formula or threshold refinement' },
  { targetType: 'ROOT_CAUSE_MODEL_REFINEMENT', description: 'Root cause model category or pattern refinement' },
];

// -- Status Band Thresholds -----------------------------------------------------

export const STATUS_BAND_THRESHOLDS: ReadonlyArray<{
  readonly band: QualityStatusBand;
  readonly minScore: number;
  readonly maxScore: number;
}> = [
  { band: 'CRITICAL', minScore: 0, maxScore: 20 },
  { band: 'AT_RISK', minScore: 21, maxScore: 40 },
  { band: 'WATCH', minScore: 41, maxScore: 60 },
  { band: 'HEALTHY', minScore: 61, maxScore: 100 },
  { band: 'DATA_PENDING', minScore: -1, maxScore: -1 },
];
