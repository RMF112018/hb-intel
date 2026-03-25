/**
 * P3-E9-T06 reports section-sources enumerations.
 * Source modules, rollup formulas, scorecard sections, lesson categories, impact magnitudes.
 */

// -- Section Source Modules ---------------------------------------------------

/** Modules that provide source data for report sections. */
export type SectionSourceModule =
  | 'PROJECT_IDENTITY'
  | 'FINANCIAL'
  | 'SCHEDULE'
  | 'SAFETY'
  | 'QC'
  | 'CONSTRAINTS'
  | 'WORK_QUEUE'
  | 'CLOSEOUT';

// -- Rollup Formula Types -----------------------------------------------------

/** Formula types used to compute rollup sections. */
export type RollupFormulaType =
  | 'FINANCIAL_SUMMARY'
  | 'SCHEDULE_SUMMARY'
  | 'SAFETY_SUMMARY'
  | 'BUDGET_STATUS'
  | 'MILESTONE_PROGRESS';

// -- Sub Scorecard Sections ---------------------------------------------------

/** Sections within the subcontractor scorecard. */
export type SubScorecardSection =
  | 'SAFETY'
  | 'QUALITY'
  | 'SCHEDULE'
  | 'COST_MGMT'
  | 'COMMUNICATION'
  | 'WORKFORCE';

// -- Performance Rating Bands -------------------------------------------------

/** Performance rating bands for subcontractor scorecards. */
export type PerformanceRatingBand =
  | 'EXCEPTIONAL'
  | 'ABOVE_AVERAGE'
  | 'SATISFACTORY'
  | 'BELOW_AVERAGE'
  | 'UNSATISFACTORY';

// -- Lesson Categories --------------------------------------------------------

/** Categories for lessons learned entries. */
export type ReportLessonCategory =
  | 'PRE_CONSTRUCTION'
  | 'SITE_LOGISTICS'
  | 'SAFETY_ENV'
  | 'QUALITY_CONTROL'
  | 'SCHEDULE_MGMT'
  | 'COST_MGMT'
  | 'SUBCONTRACTOR_MGMT'
  | 'OWNER_RELATIONS'
  | 'DESIGN_COORDINATION'
  | 'PROCUREMENT'
  | 'TECHNOLOGY'
  | 'COMMISSIONING'
  | 'CLOSEOUT'
  | 'LEGAL_COMPLIANCE'
  | 'COMMUNITY_RELATIONS'
  | 'OTHER';

// -- Impact Magnitudes --------------------------------------------------------

/** Impact magnitude levels for lessons learned. */
export type ReportImpactMagnitude = 'MINOR' | 'MODERATE' | 'SIGNIFICANT' | 'CRITICAL';
