/**
 * P3-E9-T06 reports section-sources constants.
 * Section maps, rollups, ingestion contracts, prohibitions.
 */

import type {
  ReportImpactMagnitude,
  ReportLessonCategory,
  PerformanceRatingBand,
  RollupFormulaType,
  SectionSourceModule,
  SubScorecardSection,
} from './enums.js';
import type {
  IContentTypeProhibition,
  IReportImpactMagnitudeThreshold,
  ILessonsLearnedIngestionContract,
  IOwnerReportSectionMap,
  IPerformanceRatingThreshold,
  IPxReviewSectionMap,
  IRollupFormulaDefinition,
  ISubScorecardIngestionContract,
  ISubScorecardSectionWeight,
} from './types.js';

// -- Enum Arrays --------------------------------------------------------------

export const SECTION_SOURCE_MODULES = [
  'PROJECT_IDENTITY',
  'FINANCIAL',
  'SCHEDULE',
  'SAFETY',
  'QC',
  'CONSTRAINTS',
  'WORK_QUEUE',
  'CLOSEOUT',
] as const satisfies ReadonlyArray<SectionSourceModule>;

export const ROLLUP_FORMULA_TYPES = [
  'FINANCIAL_SUMMARY',
  'SCHEDULE_SUMMARY',
  'SAFETY_SUMMARY',
  'BUDGET_STATUS',
  'MILESTONE_PROGRESS',
] as const satisfies ReadonlyArray<RollupFormulaType>;

export const SUB_SCORECARD_SECTIONS = [
  'SAFETY',
  'QUALITY',
  'SCHEDULE',
  'COST_MGMT',
  'COMMUNICATION',
  'WORKFORCE',
] as const satisfies ReadonlyArray<SubScorecardSection>;

export const PERFORMANCE_RATING_BANDS = [
  'EXCEPTIONAL',
  'ABOVE_AVERAGE',
  'SATISFACTORY',
  'BELOW_AVERAGE',
  'UNSATISFACTORY',
] as const satisfies ReadonlyArray<PerformanceRatingBand>;

export const REPORT_LESSON_CATEGORIES = [
  'PRE_CONSTRUCTION',
  'SITE_LOGISTICS',
  'SAFETY_ENV',
  'QUALITY_CONTROL',
  'SCHEDULE_MGMT',
  'COST_MGMT',
  'SUBCONTRACTOR_MGMT',
  'OWNER_RELATIONS',
  'DESIGN_COORDINATION',
  'PROCUREMENT',
  'TECHNOLOGY',
  'COMMISSIONING',
  'CLOSEOUT',
  'LEGAL_COMPLIANCE',
  'COMMUNITY_RELATIONS',
  'OTHER',
] as const satisfies ReadonlyArray<ReportLessonCategory>;

export const REPORT_IMPACT_MAGNITUDES = [
  'MINOR',
  'MODERATE',
  'SIGNIFICANT',
  'CRITICAL',
] as const satisfies ReadonlyArray<ReportImpactMagnitude>;

// -- Label Maps ---------------------------------------------------------------

export const SECTION_SOURCE_MODULE_LABELS: Readonly<Record<SectionSourceModule, string>> = {
  PROJECT_IDENTITY: 'Project Identity',
  FINANCIAL: 'Financial',
  SCHEDULE: 'Schedule',
  SAFETY: 'Safety',
  QC: 'Quality Control',
  CONSTRAINTS: 'Constraints',
  WORK_QUEUE: 'Work Queue',
  CLOSEOUT: 'Closeout',
};

export const ROLLUP_FORMULA_TYPE_LABELS: Readonly<Record<RollupFormulaType, string>> = {
  FINANCIAL_SUMMARY: 'Financial Summary',
  SCHEDULE_SUMMARY: 'Schedule Summary',
  SAFETY_SUMMARY: 'Safety Summary',
  BUDGET_STATUS: 'Budget Status',
  MILESTONE_PROGRESS: 'Milestone Progress',
};

export const PERFORMANCE_RATING_BAND_LABELS: Readonly<Record<PerformanceRatingBand, string>> = {
  EXCEPTIONAL: 'Exceptional',
  ABOVE_AVERAGE: 'Above Average',
  SATISFACTORY: 'Satisfactory',
  BELOW_AVERAGE: 'Below Average',
  UNSATISFACTORY: 'Unsatisfactory',
};

export const REPORT_IMPACT_MAGNITUDE_LABELS: Readonly<Record<ReportImpactMagnitude, string>> = {
  MINOR: 'Minor',
  MODERATE: 'Moderate',
  SIGNIFICANT: 'Significant',
  CRITICAL: 'Critical',
};

// -- PX Review Section Map ----------------------------------------------------

export const PX_REVIEW_SECTION_MAP: ReadonlyArray<IPxReviewSectionMap> = [
  { sectionKey: 'project-overview', contentType: 'MODULE_SNAPSHOT', sourceBinding: 'P3-A1 Project Identity' },
  { sectionKey: 'financial-summary', contentType: 'CALCULATED_ROLLUP', sourceBinding: 'P3-E4 Financial' },
  { sectionKey: 'schedule-summary', contentType: 'CALCULATED_ROLLUP', sourceBinding: 'P3-E5 Schedule' },
  { sectionKey: 'safety-summary', contentType: 'CALCULATED_ROLLUP', sourceBinding: 'P3-E8 Safety' },
  { sectionKey: 'quality-summary', contentType: 'MODULE_SNAPSHOT', sourceBinding: 'P3-E15 QC (conditional)' },
  { sectionKey: 'constraints-summary', contentType: 'MODULE_SNAPSHOT', sourceBinding: 'P3-E6 Constraints' },
  { sectionKey: 'open-items-summary', contentType: 'CALCULATED_ROLLUP', sourceBinding: 'P3-D3 Work Queue' },
  { sectionKey: 'executive-narrative', contentType: 'NARRATIVE_ONLY', sourceBinding: 'PM-authored' },
  { sectionKey: 'forecast-and-risk', contentType: 'NARRATIVE_ONLY', sourceBinding: 'PM-authored' },
];

// -- Owner Report Section Map -------------------------------------------------

export const OWNER_REPORT_SECTION_MAP: ReadonlyArray<IOwnerReportSectionMap> = [
  { sectionKey: 'project-status-summary', contentType: 'MODULE_SNAPSHOT', sourceBinding: 'Project registry', isProjectConfigurable: false },
  { sectionKey: 'milestone-progress', contentType: 'CALCULATED_ROLLUP', sourceBinding: 'P3-E5 Schedule', isProjectConfigurable: false },
  { sectionKey: 'budget-status', contentType: 'CALCULATED_ROLLUP', sourceBinding: 'P3-E4 Financial', isProjectConfigurable: false },
  { sectionKey: 'safety-highlights', contentType: 'CALCULATED_ROLLUP', sourceBinding: 'P3-E8 Safety', isProjectConfigurable: false },
  { sectionKey: 'open-items', contentType: 'MODULE_SNAPSHOT', sourceBinding: 'P3-D3 Work Queue', isProjectConfigurable: true },
  { sectionKey: 'owner-narrative', contentType: 'NARRATIVE_ONLY', sourceBinding: 'PM-authored', isProjectConfigurable: true },
  { sectionKey: 'upcoming-milestones', contentType: 'NARRATIVE_ONLY', sourceBinding: 'PM-authored', isProjectConfigurable: true },
];

// -- Rollup Formula Definitions -----------------------------------------------

export const ROLLUP_FORMULA_DEFINITIONS: ReadonlyArray<IRollupFormulaDefinition> = [
  { formulaType: 'FINANCIAL_SUMMARY', displayName: 'Financial Summary Rollup', sourceModules: ['FINANCIAL'], isGovernedByMoe: true, formulaDescription: 'CAC, BAC, cost variance, CPI, change order summary' },
  { formulaType: 'SCHEDULE_SUMMARY', displayName: 'Schedule Summary Rollup', sourceModules: ['SCHEDULE'], isGovernedByMoe: true, formulaDescription: 'Percent complete, schedule variance, active critical path count, next milestone' },
  { formulaType: 'SAFETY_SUMMARY', displayName: 'Safety Summary Rollup', sourceModules: ['SAFETY'], isGovernedByMoe: true, formulaDescription: 'Safety posture band, composite score, corrective actions count, incident count, inspection compliance' },
  { formulaType: 'BUDGET_STATUS', displayName: 'Budget Status Rollup', sourceModules: ['FINANCIAL'], isGovernedByMoe: true, formulaDescription: 'Contract value, estimate at completion, percent expended, change order exposure' },
  { formulaType: 'MILESTONE_PROGRESS', displayName: 'Milestone Progress Rollup', sourceModules: ['SCHEDULE'], isGovernedByMoe: true, formulaDescription: 'Percent schedule complete, milestones achieved, next milestone' },
];

// -- Sub Scorecard Section Weights --------------------------------------------

export const SUB_SCORECARD_SECTION_WEIGHTS: ReadonlyArray<ISubScorecardSectionWeight> = [
  { section: 'SAFETY', weight: 0.20, criterionCount: 5 },
  { section: 'QUALITY', weight: 0.20, criterionCount: 5 },
  { section: 'SCHEDULE', weight: 0.20, criterionCount: 5 },
  { section: 'COST_MGMT', weight: 0.15, criterionCount: 5 },
  { section: 'COMMUNICATION', weight: 0.15, criterionCount: 5 },
  { section: 'WORKFORCE', weight: 0.10, criterionCount: 4 },
];

// -- Performance Rating Thresholds --------------------------------------------

export const PERFORMANCE_RATING_THRESHOLDS: ReadonlyArray<IPerformanceRatingThreshold> = [
  { band: 'EXCEPTIONAL', minScore: 4.5, maxScore: 5.0 },
  { band: 'ABOVE_AVERAGE', minScore: 3.5, maxScore: 4.49 },
  { band: 'SATISFACTORY', minScore: 2.5, maxScore: 3.49 },
  { band: 'BELOW_AVERAGE', minScore: 1.5, maxScore: 2.49 },
  { band: 'UNSATISFACTORY', minScore: 1.0, maxScore: 1.49 },
];

// -- Impact Magnitude Thresholds ----------------------------------------------

export const REPORT_IMPACT_MAGNITUDE_THRESHOLDS: ReadonlyArray<IReportImpactMagnitudeThreshold> = [
  { magnitude: 'MINOR', costThreshold: '<$10K', scheduleThreshold: '<1 week', description: 'Minor cost or schedule impact' },
  { magnitude: 'MODERATE', costThreshold: '$10K–$100K', scheduleThreshold: '1–4 weeks', description: 'Moderate cost or schedule impact' },
  { magnitude: 'SIGNIFICANT', costThreshold: '$100K–$1M', scheduleThreshold: '1–3 months', description: 'Significant cost or schedule impact' },
  { magnitude: 'CRITICAL', costThreshold: '>$1M', scheduleThreshold: '>3 months', description: 'Critical cost or schedule impact' },
];

// -- Content Type Prohibitions ------------------------------------------------

export const CONTENT_TYPE_PROHIBITIONS: ReadonlyArray<IContentTypeProhibition> = [
  { prohibitionId: 'no-custom-data-bindings', description: 'Projects may not introduce custom data bindings', governingDecision: 'LD-REP-08' },
  { prohibitionId: 'no-formula-overrides', description: 'Projects may not override MOE-approved rollup formulas', governingDecision: 'LD-REP-08' },
  { prohibitionId: 'no-dynamic-field-refs', description: 'No dynamic field references in narrative or snapshot sections', governingDecision: 'LD-REP-08' },
  { prohibitionId: 'no-pm-cross-section-agg', description: 'PM may not author cross-section aggregations', governingDecision: 'LD-REP-08' },
];

// -- Sub Scorecard Ingestion Contract -----------------------------------------

export const SUB_SCORECARD_INGESTION_CONTRACT: Readonly<ISubScorecardIngestionContract> = {
  familyKey: 'SUB_SCORECARD',
  sourceModule: 'CLOSEOUT',
  scoringOwnedBy: 'P3-E10 (Closeout)',
  formulasAppliedBy: 'P3-E10 at source data entry time',
  reportsComputesScores: false,
  snapshotContentFields: ['header', 'sectionScores', 'criterionDetail', 'performanceRating', 'narrativeFields'],
};

// -- Lessons Learned Ingestion Contract ---------------------------------------

export const LESSONS_LEARNED_INGESTION_CONTRACT: Readonly<ILessonsLearnedIngestionContract> = {
  familyKey: 'LESSONS_LEARNED',
  sourceModule: 'CLOSEOUT',
  dataOwnedBy: 'P3-E10 (Closeout)',
  reportsModifiesData: false,
  snapshotContentFields: ['projectClassification', 'lessonEntries', 'aggregateStats', 'categorySummary'],
};
