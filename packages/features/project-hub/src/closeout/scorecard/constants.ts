/**
 * P3-E10-T06 Subcontractor Scorecard Model constants.
 * Sections, criteria, weights, score definitions, ratings, visibility.
 */

import type { PerformanceRating, ScorecardSectionKey, ScorecardScoreValue } from './enums.js';
import type {
  IOrgAccessRule,
  IPerformanceRatingRange,
  IScorecardCriterionDefinition,
  IScorecardScoreDefinition,
  IScorecardSectionDefinition,
  IScorecardVisibilityRule,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------

export const SCORECARD_SECTION_KEYS = [
  'Safety', 'Quality', 'Schedule', 'CostMgmt', 'Communication', 'Workforce',
] as const satisfies ReadonlyArray<ScorecardSectionKey>;

export const PERFORMANCE_RATINGS = [
  'Exceptional', 'AboveAverage', 'Satisfactory', 'BelowAverage', 'Unsatisfactory',
] as const satisfies ReadonlyArray<PerformanceRating>;

export const SCORECARD_SCORE_VALUES = [
  1, 2, 3, 4, 5, 'NA',
] as const satisfies ReadonlyArray<ScorecardScoreValue>;

// -- Score Definitions (§2.1) -----------------------------------------------

export const SCORECARD_SCORE_DEFINITIONS: ReadonlyArray<IScorecardScoreDefinition> = [
  { score: 5, label: 'Exceptional', definition: 'Significantly exceeded expectations; set a standard for excellence' },
  { score: 4, label: 'Above Average', definition: 'Exceeded expectations; minor issues resolved quickly' },
  { score: 3, label: 'Satisfactory', definition: 'Met expectations; acceptable performance within contract scope' },
  { score: 2, label: 'Below Average', definition: 'Partially met expectations; recurring issues; required GC intervention' },
  { score: 1, label: 'Unsatisfactory', definition: 'Failed to meet expectations; serious deficiencies; would not re-bid' },
  { score: 'NA', label: 'Not Applicable', definition: 'Criterion not applicable to this sub\'s scope; excluded from section average' },
];

// -- Section Definitions (§2.2) ---------------------------------------------

export const SCORECARD_SECTION_DEFINITIONS: ReadonlyArray<IScorecardSectionDefinition> = [
  { key: 'Safety', label: 'Safety & Compliance', weight: 0.20, criteriaCount: 5, perCriterionWeight: 0.20 },
  { key: 'Quality', label: 'Quality of Work', weight: 0.20, criteriaCount: 5, perCriterionWeight: 0.20 },
  { key: 'Schedule', label: 'Schedule Performance', weight: 0.20, criteriaCount: 5, perCriterionWeight: 0.20 },
  { key: 'CostMgmt', label: 'Cost Management', weight: 0.15, criteriaCount: 5, perCriterionWeight: 0.20 },
  { key: 'Communication', label: 'Communication & Management', weight: 0.15, criteriaCount: 5, perCriterionWeight: 0.20 },
  { key: 'Workforce', label: 'Workforce & Labor', weight: 0.10, criteriaCount: 4, perCriterionWeight: 0.25 },
];

// -- Performance Rating Ranges (§3.3) ----------------------------------------

export const SCORECARD_PERFORMANCE_RATING_RANGES: ReadonlyArray<IPerformanceRatingRange> = [
  { rating: 'Exceptional', minScore: 4.50, maxScore: 5.00 },
  { rating: 'AboveAverage', minScore: 3.50, maxScore: 4.49 },
  { rating: 'Satisfactory', minScore: 2.50, maxScore: 3.49 },
  { rating: 'BelowAverage', minScore: 1.50, maxScore: 2.49 },
  { rating: 'Unsatisfactory', minScore: 1.00, maxScore: 1.49 },
];

// -- Label Maps -------------------------------------------------------------

export const SCORECARD_SECTION_KEY_LABELS: Readonly<Record<ScorecardSectionKey, string>> = {
  Safety: 'Safety & Compliance',
  Quality: 'Quality of Work',
  Schedule: 'Schedule Performance',
  CostMgmt: 'Cost Management',
  Communication: 'Communication & Management',
  Workforce: 'Workforce & Labor',
};

export const SCORECARD_PERFORMANCE_RATING_LABELS: Readonly<Record<PerformanceRating, string>> = {
  Exceptional: 'Exceptional',
  AboveAverage: 'Above Average',
  Satisfactory: 'Satisfactory',
  BelowAverage: 'Below Average',
  Unsatisfactory: 'Unsatisfactory',
};

// ============================================================================
// CRITERION CATALOG — 29 Criteria (§2.3)
// ============================================================================

export const SCORECARD_SAFETY_CRITERIA: ReadonlyArray<IScorecardCriterionDefinition> = [
  { sectionKey: 'Safety', number: 'S1', criterion: 'Adherence to site safety plan and OSHA standards', evidenceGuidance: 'Incidents, near-misses, OSHA citations, safety observations' },
  { sectionKey: 'Safety', number: 'S2', criterion: 'PPE compliance and toolbox-talk participation', evidenceGuidance: 'Attendance records, field observations, sign-in sheets' },
  { sectionKey: 'Safety', number: 'S3', criterion: 'Housekeeping and site cleanliness', evidenceGuidance: 'Daily clean standards, lay-down areas, debris removal' },
  { sectionKey: 'Safety', number: 'S4', criterion: 'Incident / injury rate on this project', evidenceGuidance: 'TRIR, recordables, first-aid events' },
  { sectionKey: 'Safety', number: 'S5', criterion: 'Corrective action response to safety issues', evidenceGuidance: 'Days to close NCRs, safety violation response time' },
];

export const SCORECARD_QUALITY_CRITERIA: ReadonlyArray<IScorecardCriterionDefinition> = [
  { sectionKey: 'Quality', number: 'Q1', criterion: 'Workmanship quality and craftsmanship', evidenceGuidance: 'Punch list density, rework areas, GC observations' },
  { sectionKey: 'Quality', number: 'Q2', criterion: 'Compliance with plans, specs, and approved submittals', evidenceGuidance: 'RFI frequency from their scope; revision compliance' },
  { sectionKey: 'Quality', number: 'Q3', criterion: 'First-time inspection pass rate', evidenceGuidance: 'AHJ and third-party inspection results' },
  { sectionKey: 'Quality', number: 'Q4', criterion: 'Materials and equipment quality', evidenceGuidance: 'Substitution requests, as-specified compliance' },
  { sectionKey: 'Quality', number: 'Q5', criterion: 'Closeout documentation completeness', evidenceGuidance: 'O&Ms, warranties, as-builts, attic stock, cert letters' },
];

export const SCORECARD_SCHEDULE_CRITERIA: ReadonlyArray<IScorecardCriterionDefinition> = [
  { sectionKey: 'Schedule', number: 'Sc1', criterion: 'On-time mobilization', evidenceGuidance: 'Actual vs. planned start date' },
  { sectionKey: 'Schedule', number: 'Sc2', criterion: '3-week look-ahead participation and reliability', evidenceGuidance: '% commitments kept (Last Planner or equivalent)' },
  { sectionKey: 'Schedule', number: 'Sc3', criterion: 'Progress relative to baseline schedule', evidenceGuidance: 'Float consumption, milestone compliance' },
  { sectionKey: 'Schedule', number: 'Sc4', criterion: 'Recovery effort when behind schedule', evidenceGuidance: 'Added crew, extended hours, phasing coordination' },
  { sectionKey: 'Schedule', number: 'Sc5', criterion: 'Trade coordination with other subs', evidenceGuidance: 'BIM and pre-construction coordination, field conflicts' },
];

export const SCORECARD_COST_MGMT_CRITERIA: ReadonlyArray<IScorecardCriterionDefinition> = [
  { sectionKey: 'CostMgmt', number: 'C1', criterion: 'Budget adherence — no unwarranted overruns', evidenceGuidance: 'CO volume relative to genuine scope growth' },
  { sectionKey: 'CostMgmt', number: 'C2', criterion: 'Change order pricing accuracy and timeliness', evidenceGuidance: 'Days to submit COs; pricing reasonableness' },
  { sectionKey: 'CostMgmt', number: 'C3', criterion: 'Back-charge exposure created', evidenceGuidance: 'Back-charges assessed by GC' },
  { sectionKey: 'CostMgmt', number: 'C4', criterion: 'Material procurement and financial stability', evidenceGuidance: 'No stoppages from unpaid suppliers' },
  { sectionKey: 'CostMgmt', number: 'C5', criterion: 'Billing accuracy and schedule of values quality', evidenceGuidance: 'Overbilling instances; retainage disputes' },
];

export const SCORECARD_COMMUNICATION_CRITERIA: ReadonlyArray<IScorecardCriterionDefinition> = [
  { sectionKey: 'Communication', number: 'M1', criterion: 'Responsiveness to RFIs, emails, and calls', evidenceGuidance: 'Average response time; dropped items' },
  { sectionKey: 'Communication', number: 'M2', criterion: 'Quality of superintendent / foreman leadership', evidenceGuidance: 'Decision authority; problem ownership; escalation' },
  { sectionKey: 'Communication', number: 'M3', criterion: 'Submittals: accuracy, completeness, timeliness', evidenceGuidance: 'Resubmittal rate; lead times met' },
  { sectionKey: 'Communication', number: 'M4', criterion: 'Participation in OAC and coordination meetings', evidenceGuidance: 'Attendance; action item closure' },
  { sectionKey: 'Communication', number: 'M5', criterion: 'Issue escalation and conflict resolution', evidenceGuidance: 'Transparent communication vs. avoidance' },
];

export const SCORECARD_WORKFORCE_CRITERIA: ReadonlyArray<IScorecardCriterionDefinition> = [
  { sectionKey: 'Workforce', number: 'W1', criterion: 'Adequate and consistent crew staffing', evidenceGuidance: 'Planned vs. actual headcount' },
  { sectionKey: 'Workforce', number: 'W2', criterion: 'Workforce skill level and supervision ratio', evidenceGuidance: 'Journeyman/apprentice mix; field leadership quality' },
  { sectionKey: 'Workforce', number: 'W3', criterion: 'Compliance with labor requirements', evidenceGuidance: 'MBE/DBE, prevailing wage, union requirements if applicable' },
  { sectionKey: 'Workforce', number: 'W4', criterion: 'Sub-tier sub management', evidenceGuidance: 'Sub-tier oversight, insurance, payment verification' },
];

export const SCORECARD_ALL_CRITERIA: ReadonlyArray<IScorecardCriterionDefinition> = [
  ...SCORECARD_SAFETY_CRITERIA,
  ...SCORECARD_QUALITY_CRITERIA,
  ...SCORECARD_SCHEDULE_CRITERIA,
  ...SCORECARD_COST_MGMT_CRITERIA,
  ...SCORECARD_COMMUNICATION_CRITERIA,
  ...SCORECARD_WORKFORCE_CRITERIA,
];

// -- Visibility Rules (§5.1) ------------------------------------------------

export const SCORECARD_VISIBILITY_RULES: ReadonlyArray<IScorecardVisibilityRule> = [
  { action: 'Create Interim scorecard', pmAuthority: 'Yes', suptAuthority: 'Yes', peAuthority: 'No', perAuthority: 'No' },
  { action: 'Create FinalCloseout scorecard', pmAuthority: 'Yes', suptAuthority: 'Yes', peAuthority: 'No', perAuthority: 'No' },
  { action: 'Score criteria', pmAuthority: 'Yes', suptAuthority: 'Yes', peAuthority: 'No', perAuthority: 'No' },
  { action: 'Submit scorecard', pmAuthority: 'Yes', suptAuthority: 'Yes', peAuthority: 'No', perAuthority: 'No' },
  { action: 'Sign off on submission', pmAuthority: 'Yes', suptAuthority: 'Yes', peAuthority: 'No', perAuthority: 'No' },
  { action: 'View project scorecards', pmAuthority: 'Yes', suptAuthority: 'Yes', peAuthority: 'Yes', perAuthority: 'Yes' },
  { action: 'Annotate via @hbc/field-annotations', pmAuthority: 'No', suptAuthority: 'No', peAuthority: 'Yes', perAuthority: 'Yes' },
  { action: 'Approve for org publication', pmAuthority: 'No', suptAuthority: 'No', peAuthority: 'Yes', perAuthority: 'No' },
];

// -- Org Access Rules (§5.3) ------------------------------------------------

export const SCORECARD_ORG_ACCESS_RULES: ReadonlyArray<IOrgAccessRule> = [
  { userType: 'PE, PER, MOE', access: 'Full SubIntelligence index access; all fields including narratives' },
  { userType: 'SUB_INTELLIGENCE_VIEWER grant', access: 'Sub name, trade, scores, rating, reBid recommendation; no narratives, no financial data' },
  { userType: 'All other Project Hub users', access: 'No SubIntelligence access' },
];
