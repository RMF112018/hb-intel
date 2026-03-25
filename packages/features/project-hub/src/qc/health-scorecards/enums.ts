/**
 * P3-E15-T10 Stage 8 Project QC Module health-scorecards enumerations.
 */

// -- Quality Status Band -------------------------------------------------------

/** Quality status band for scorecard domains and overall score. */
export type QualityStatusBand =
  | 'HEALTHY'
  | 'WATCH'
  | 'AT_RISK'
  | 'CRITICAL'
  | 'DATA_PENDING';

// -- Scorecard Domain -----------------------------------------------------------

/** Scorecard domain representing a quality health dimension. */
export type ScorecardDomain =
  | 'PLAN_GATE_READINESS'
  | 'ISSUE_ACTION_PERFORMANCE'
  | 'EXCEPTION_DEPENDENCY_PRESSURE'
  | 'EVIDENCE_VERIFICATION_QUALITY'
  | 'RECURRENCE_LEARNING_POSTURE';

// -- Confidence Tier ------------------------------------------------------------

/** Confidence tier reflecting data sufficiency for scoring. */
export type ConfidenceTier =
  | 'HIGH'
  | 'MODERATE'
  | 'LOW'
  | 'INSUFFICIENT_DATA';

// -- Rollup Band ----------------------------------------------------------------

/** Rollup band for responsible-org performance aggregation. */
export type RollupBand =
  | 'STRONG'
  | 'ACCEPTABLE'
  | 'WATCH'
  | 'CONCERN'
  | 'CRITICAL';

// -- Learning Candidate State ---------------------------------------------------

/** Learning candidate lifecycle state. */
export type LearningCandidateState =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'SUBMITTED_FOR_REVIEW'
  | 'MOE_APPROVED'
  | 'MOE_REJECTED'
  | 'PUBLISHED_AS_UPDATE';

// -- Learning Target Type -------------------------------------------------------

/** Learning target types for enterprise improvement candidates. */
export type LearningTargetType =
  | 'STANDARD'
  | 'BEST_PRACTICE_PACKET'
  | 'TAXONOMY'
  | 'COVERAGE_SET'
  | 'ADVISORY_RULE'
  | 'SCORECARD_REFINEMENT'
  | 'ROOT_CAUSE_MODEL_REFINEMENT';

// -- Analysis Mandatory Reason --------------------------------------------------

/** Reasons root cause analysis is mandatory. */
export type AnalysisMandatoryReason =
  | 'ISSUE_REOPENED'
  | 'RECURRENCE_DETECTED'
  | 'HIGH_SEVERITY'
  | 'REPEATED_ORG_PATTERN'
  | 'LEARNING_QUALIFIED';

// -- Weighting Philosophy -------------------------------------------------------

/** Weighting philosophy for scorecard formula composition. */
export type WeightingPhilosophy =
  | 'LEADING_DOMINANT'
  | 'LAGGING_BALANCED';

// -- Drilldown Dimension --------------------------------------------------------

/** Drilldown dimensions available from scorecard views. */
export type DrilldownDimension =
  | 'WORK_PACKAGE'
  | 'RECORD_FAMILY'
  | 'RESPONSIBLE_ORG'
  | 'CAUSE_CATEGORY'
  | 'AGING_BUCKET'
  | 'VERIFIER_STATUS'
  | 'READINESS_IMPACT'
  | 'SNAPSHOT_VERSION';

// -- Manual Review Pressure Level -----------------------------------------------

/** Manual review pressure levels indicating scorecard confidence degradation. */
export type ManualReviewPressureLevel =
  | 'NONE'
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL';
