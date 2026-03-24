/**
 * P3-E8-T04 Inspection program enumerations.
 * Template governance, scoring, trend, and score band types.
 */

// -- Applicability Conditions (§2.3) ----------------------------------------

export type ApplicabilityCondition =
  | 'PROJECT_PHASE'
  | 'ACTIVITY_PRESENT'
  | 'ALWAYS_APPLICABLE'
  | 'SAFETY_MANAGER_OVERRIDE';

// -- Inspection Item Response Values (§3.2) ----------------------------------

export type InspectionItemResponseValue = 'PASS' | 'FAIL' | 'N_A';

// -- Score Trend Direction (§5.1) -------------------------------------------

export type InspectionTrendDirection =
  | 'IMPROVING'
  | 'STABLE'
  | 'DECLINING'
  | 'INSUFFICIENT_DATA';

// -- PER Score Band (§5.2) --------------------------------------------------

export type InspectionScoreBand = 'HIGH' | 'MED' | 'LOW';
