/**
 * P3-E10-T06 Subcontractor Scorecard Model enumerations.
 * Section keys, performance ratings, score values.
 */

// -- Scorecard Section Key (§2.2) -------------------------------------------

/** 6 scorecard evaluation sections per T06 §2.2. */
export type ScorecardSectionKey =
  | 'Safety'
  | 'Quality'
  | 'Schedule'
  | 'CostMgmt'
  | 'Communication'
  | 'Workforce';

// -- Performance Rating (§3.3) ----------------------------------------------

/** System-derived performance rating per T06 §3.3. Not user-selectable. */
export type PerformanceRating =
  | 'Exceptional'
  | 'AboveAverage'
  | 'Satisfactory'
  | 'BelowAverage'
  | 'Unsatisfactory';

// -- Score Value (§2.1) -----------------------------------------------------

/** Universal 5-point scale plus NA per T06 §2.1. */
export type ScorecardScoreValue = 1 | 2 | 3 | 4 | 5 | 'NA';
