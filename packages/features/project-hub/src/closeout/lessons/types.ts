/**
 * P3-E10-T05 Lessons Learned Operating Model TypeScript contracts.
 * Impact derivation, recommendation validation, workflow, snapshot.
 */

import type {
  DeliveryMethod,
  ImpactMagnitude,
  LessonCategory,
  MarketSector,
  ProjectSizeBand,
} from './enums.js';

// -- Layer Architecture (§1) ------------------------------------------------

/** Lesson layer definition per T05 §1. */
export interface ILessonLayerDefinition {
  readonly layer: string;
  readonly recordType: string;
  readonly whenCreated: string;
  readonly creator: string;
  readonly purpose: string;
}

// -- Impact Magnitude Derivation (§3) ---------------------------------------

/** Impact magnitude threshold per T05 §3.2. */
export interface IImpactMagnitudeThreshold {
  readonly magnitude: ImpactMagnitude;
  readonly costCondition: string;
  readonly scheduleCondition: string;
  readonly costMin: number;
  readonly costMax: number | null;
  readonly scheduleDaysMin: number;
  readonly scheduleDaysMax: number | null;
}

/** Result of impact magnitude derivation per T05 §3. */
export interface IImpactDerivationResult {
  readonly derivedMagnitude: ImpactMagnitude | null;
  readonly costSignal: number | null;
  readonly scheduleSignal: number | null;
  readonly multiSignalApplied: boolean;
}

// -- Recommendation Validation (§4) -----------------------------------------

/** Result of recommendation action verb validation per T05 §4. */
export interface IRecommendationValidationResult {
  readonly valid: boolean;
  readonly errorMessage: string | null;
}

// -- Workflow (§5) ----------------------------------------------------------

/** Lesson workflow step per T05 §5. */
export interface ILessonsWorkflowStep {
  readonly stepNumber: number;
  readonly phase: string;
  readonly description: string;
}

// -- Business Rules (§6) ----------------------------------------------------

/** Lesson business rule per T05 §6. */
export interface ILessonsBusinessRule {
  readonly ruleNumber: number;
  readonly description: string;
}

// -- Reports Snapshot Contract (§7) -----------------------------------------

/** Report header within snapshot per T05 §7. */
export interface ILessonSnapshotReportHeader {
  readonly projectName: string;
  readonly projectNumber: string;
  readonly deliveryMethod: DeliveryMethod;
  readonly marketSector: MarketSector;
  readonly projectSizeBand: ProjectSizeBand;
  readonly complexityRating: number;
  readonly originalContractValue: number;
  readonly finalContractValue: number;
  readonly contractVariance: number;
  readonly scheduledCompletion: string;
  readonly actualCompletion: string;
  readonly daysVariance: number;
  readonly projectManager: string;
  readonly superintendent: string | null;
  readonly projectExecutive: string | null;
  readonly reportDate: string;
}

/** Lesson entry within snapshot per T05 §7. */
export interface ILessonSnapshotEntry {
  readonly lessonNumber: number;
  readonly category: LessonCategory;
  readonly phaseEncountered: string;
  readonly applicability: number;
  readonly keywords: readonly string[];
  readonly situation: string;
  readonly impact: string;
  readonly impactMagnitude: ImpactMagnitude;
  readonly rootCause: string;
  readonly response: string | null;
  readonly recommendation: string;
}

/** Aggregate statistics within snapshot per T05 §7. */
export interface ILessonAggregateStats {
  readonly categoryCounts: Readonly<Record<LessonCategory, number>>;
  readonly magnitudeCounts: Readonly<Record<ImpactMagnitude, number>>;
  readonly highApplicabilityCount: number;
  readonly criticalAndSignificantCount: number;
}

/** Full lessons learned publication snapshot per T05 §7. */
export interface ILessonsLearnedPublicationSnapshot {
  readonly snapshotId: string;
  readonly projectId: string;
  readonly generatedAt: string;
  readonly reportId: string;
  readonly peApprovedBy: string;
  readonly peApprovedAt: string;
  readonly reportHeader: ILessonSnapshotReportHeader;
  readonly entries: ReadonlyArray<ILessonSnapshotEntry>;
  readonly entryCount: number;
  readonly aggregateStats: ILessonAggregateStats;
}

// -- Autopsy Relationship (§8) ----------------------------------------------

/** Lessons-Autopsy relationship comparison per T05 §8. */
export interface ILessonsAutopsyRelationship {
  readonly aspect: string;
  readonly lessonsLearned: string;
  readonly projectAutopsy: string;
}
