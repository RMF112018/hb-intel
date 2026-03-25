/**
 * P3-E9-T06 reports section-sources TypeScript contracts.
 * Section bindings, rollup formulas, scorecard/lessons ingestion, content type prohibitions.
 */

import type {
  ReportImpactMagnitude,
  PerformanceRatingBand,
  RollupFormulaType,
  SectionSourceModule,
  SubScorecardSection,
} from './enums.js';

// -- Section Source Binding ----------------------------------------------------

export interface ISectionSourceBinding {
  readonly sectionKey: string;
  readonly familyKey: string;
  readonly sourceModule: SectionSourceModule | null;
  readonly contentType: string;
  readonly snapshotApiRef: string | null;
  readonly rollupFormulaRef: RollupFormulaType | null;
}

// -- Rollup Formula Definition ------------------------------------------------

export interface IRollupFormulaDefinition {
  readonly formulaType: RollupFormulaType;
  readonly displayName: string;
  readonly sourceModules: readonly SectionSourceModule[];
  readonly isGovernedByMoe: boolean;
  readonly formulaDescription: string;
}

// -- Sub Scorecard Section Weight ---------------------------------------------

export interface ISubScorecardSectionWeight {
  readonly section: SubScorecardSection;
  readonly weight: number;
  readonly criterionCount: number;
}

// -- Sub Scorecard Ingestion Contract -----------------------------------------

export interface ISubScorecardIngestionContract {
  readonly familyKey: 'SUB_SCORECARD';
  readonly sourceModule: 'CLOSEOUT';
  readonly scoringOwnedBy: string;
  readonly formulasAppliedBy: string;
  readonly reportsComputesScores: boolean;
  readonly snapshotContentFields: readonly string[];
}

// -- Performance Rating Threshold ---------------------------------------------

export interface IPerformanceRatingThreshold {
  readonly band: PerformanceRatingBand;
  readonly minScore: number;
  readonly maxScore: number;
}

// -- Lessons Learned Ingestion Contract ---------------------------------------

export interface ILessonsLearnedIngestionContract {
  readonly familyKey: 'LESSONS_LEARNED';
  readonly sourceModule: 'CLOSEOUT';
  readonly dataOwnedBy: string;
  readonly reportsModifiesData: boolean;
  readonly snapshotContentFields: readonly string[];
}

// -- Impact Magnitude Threshold -----------------------------------------------

export interface IReportImpactMagnitudeThreshold {
  readonly magnitude: ReportImpactMagnitude;
  readonly costThreshold: string;
  readonly scheduleThreshold: string;
  readonly description: string;
}

// -- Content Type Prohibition -------------------------------------------------

export interface IContentTypeProhibition {
  readonly prohibitionId: string;
  readonly description: string;
  readonly governingDecision: string;
}

// -- PX Review Section Map ----------------------------------------------------

export interface IPxReviewSectionMap {
  readonly sectionKey: string;
  readonly contentType: string;
  readonly sourceBinding: string;
}

// -- Owner Report Section Map -------------------------------------------------

export interface IOwnerReportSectionMap {
  readonly sectionKey: string;
  readonly contentType: string;
  readonly sourceBinding: string;
  readonly isProjectConfigurable: boolean;
}
