/**
 * P3-E15-T10 Stage 8 Project QC Module health-scorecards TypeScript contracts.
 */

import type { RecurrenceClassification } from '../record-families/enums.js';
import type {
  QualityStatusBand,
  ScorecardDomain,
  ConfidenceTier,
  RollupBand,
  LearningCandidateState,
  LearningTargetType,
  AnalysisMandatoryReason,
  DrilldownDimension,
  ManualReviewPressureLevel,
} from './enums.js';

// -- Scorecard Domain Score -----------------------------------------------------

/** Individual domain score within a quality health scorecard. */
export interface IScorecardDomainScore {
  readonly domain: ScorecardDomain;
  readonly numericScore: number;
  readonly statusBand: QualityStatusBand;
  readonly weight: number;
  readonly topDrivers: readonly string[];
  readonly drilldownAvailable: boolean;
}

// -- Enhanced Quality Health Snapshot Fields ------------------------------------

/** Enhanced quality health snapshot fields for scorecard-driven health views. */
export interface IEnhancedQualityHealthSnapshotFields {
  readonly planGateReadinessScore: IScorecardDomainScore;
  readonly issueActionPerformanceScore: IScorecardDomainScore;
  readonly exceptionDependencyScore: IScorecardDomainScore;
  readonly evidenceVerificationScore: IScorecardDomainScore;
  readonly recurrenceLearningScore: IScorecardDomainScore;
  readonly overallQualityScore: number;
  readonly overallQualityStatus: QualityStatusBand;
  readonly confidenceTier: ConfidenceTier;
  readonly manualReviewPressure: ManualReviewPressureLevel;
  readonly governedFormulaVersion: string;
  readonly projectOverlayVersion: string | null;
  readonly sourceProjectQcSnapshotId: string;
  readonly topRecommendedActionRefs: readonly string[];
  readonly drilldownAvailability: readonly DrilldownDimension[];
}

// -- Enhanced Rollup Input Fields -----------------------------------------------

/** Enhanced rollup input fields for responsible-org performance aggregation. */
export interface IEnhancedRollupInputFields {
  readonly organizationDisplayName: string;
  readonly workPackageRefs: readonly string[];
  readonly openIssueCount: number;
  readonly overdueIssueCount: number;
  readonly verifiedClosureRate: number;
  readonly reopenedCount: number;
  readonly recurrenceQualifiedCount: number;
  readonly deviationCount: number;
  readonly approvalLagDays: number;
  readonly advisoryFailureCount: number;
  readonly planGateFailureCount: number;
  readonly evidenceRejectionCount: number;
  readonly rollupBand: RollupBand;
}

// -- Root Cause Analysis Mandatory Check ----------------------------------------

/** Result of a root cause analysis mandatory check. */
export interface IRootCauseAnalysisMandatoryCheck {
  readonly checkId: string;
  readonly qcIssueId: string;
  readonly isMandatory: boolean;
  readonly mandatoryReason: AnalysisMandatoryReason | null;
  readonly checkedAt: string;
}

// -- Learning Candidate ---------------------------------------------------------

/** Learning candidate for enterprise improvement pipeline. */
export interface ILearningCandidate {
  readonly learningCandidateId: string;
  readonly projectId: string;
  readonly rootCauseRecordId: string;
  readonly state: LearningCandidateState;
  readonly targetType: LearningTargetType;
  readonly recommendationSummary: string;
  readonly submittedByUserId: string | null;
  readonly submittedAt: string | null;
  readonly moeReviewOutcome: string | null;
  readonly publishedUpdateNoticeId: string | null;
}

// -- Scorecard Weight Definition ------------------------------------------------

/** Scorecard weight definition for domain weighting governance. */
export interface IScorecardWeightDefinition {
  readonly domain: ScorecardDomain;
  readonly weight: number;
  readonly isLeadingIndicator: boolean;
  readonly isMoeGoverned: boolean;
  readonly adjustmentConstraint: string;
}

// -- Drilldown Descriptor -------------------------------------------------------

/** Drilldown descriptor for scorecard navigation hints. */
export interface IDrilldownDescriptor {
  readonly dimension: DrilldownDimension;
  readonly isAvailable: boolean;
  readonly sourceRecordFamily: string;
  readonly navigationHint: string;
}

// -- Enterprise Rollup Projection -----------------------------------------------

/** Enterprise rollup projection for cross-project org performance. */
export interface IEnterpriseRollupProjection {
  readonly projectionId: string;
  readonly organizationKey: string;
  readonly aggregatedFromProjectIds: readonly string[];
  readonly compositeRollupBand: RollupBand;
  readonly isProjectEditable: boolean;
  readonly computedAt: string;
}
