/**
 * P3-E8-T04 Inspection program constants.
 * Standard template, scoring, trend, work queue.
 */

import type {
  ApplicabilityCondition,
  InspectionItemResponseValue,
  InspectionTrendDirection,
  InspectionScoreBand,
} from './enums.js';
import type {
  IStandardTemplateSection,
  ICorrectiveActionDueDateRule,
  IInspectionWorkQueueTrigger,
  IScoreBandThreshold,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------

export const APPLICABILITY_CONDITIONS = [
  'PROJECT_PHASE', 'ACTIVITY_PRESENT', 'ALWAYS_APPLICABLE', 'SAFETY_MANAGER_OVERRIDE',
] as const satisfies ReadonlyArray<ApplicabilityCondition>;

export const INSPECTION_ITEM_RESPONSE_VALUES = [
  'PASS', 'FAIL', 'N_A',
] as const satisfies ReadonlyArray<InspectionItemResponseValue>;

export const INSPECTION_TREND_DIRECTIONS = [
  'IMPROVING', 'STABLE', 'DECLINING', 'INSUFFICIENT_DATA',
] as const satisfies ReadonlyArray<InspectionTrendDirection>;

export const INSPECTION_SCORE_BANDS = [
  'HIGH', 'MED', 'LOW',
] as const satisfies ReadonlyArray<InspectionScoreBand>;

// -- Standard 12-Section Template (§2.2) ------------------------------------

export const STANDARD_TEMPLATE_SECTIONS: ReadonlyArray<IStandardTemplateSection> = [
  { sectionKey: 'housekeeping', sectionName: 'Housekeeping and General Site Conditions', defaultWeight: 10 },
  { sectionKey: 'ppe', sectionName: 'Personal Protective Equipment', defaultWeight: 10 },
  { sectionKey: 'fall_protection', sectionName: 'Fall Protection', defaultWeight: 12 },
  { sectionKey: 'scaffolding', sectionName: 'Scaffolding and Elevated Work Platforms', defaultWeight: 8 },
  { sectionKey: 'electrical', sectionName: 'Electrical Safety and Temporary Power', defaultWeight: 8 },
  { sectionKey: 'excavation_trenching', sectionName: 'Excavation and Trenching', defaultWeight: 8 },
  { sectionKey: 'fire_prevention', sectionName: 'Fire Prevention and Hot Work', defaultWeight: 7 },
  { sectionKey: 'tools_equipment', sectionName: 'Tools and Equipment', defaultWeight: 7 },
  { sectionKey: 'materials_storage', sectionName: 'Materials Storage and Handling', defaultWeight: 6 },
  { sectionKey: 'cranes_rigging', sectionName: 'Cranes, Rigging, and Heavy Equipment', defaultWeight: 8 },
  { sectionKey: 'hazmat_hazcom', sectionName: 'Hazardous Materials and HazCom', defaultWeight: 8 },
  { sectionKey: 'emergency_access', sectionName: 'Emergency Access, Signage, and First Aid', defaultWeight: 8 },
];

// -- Scoring Configuration (§4.1) -------------------------------------------

/** Precision: normalized score rounded to this many decimal places. */
export const NORMALIZED_SCORE_PRECISION = 1;

// -- Score Band Thresholds (§5.2) -------------------------------------------

export const SCORE_BAND_THRESHOLDS: ReadonlyArray<IScoreBandThreshold> = [
  { band: 'HIGH', minScore: 90 },
  { band: 'MED', minScore: 70 },
  { band: 'LOW', minScore: 0 },
];

// -- Trend Configuration (§5.1) ---------------------------------------------

export const DEFAULT_TREND_WINDOW_WEEKS = 4;

/** Minimum data points required for a non-INSUFFICIENT_DATA trend. */
export const MINIMUM_TREND_DATA_POINTS = 2;

/** ±threshold for IMPROVING/DECLINING vs STABLE. */
export const TREND_DIRECTION_THRESHOLD = 5;

// -- Corrective Action Due Date Rules (§6) ----------------------------------

export const CA_DUE_DATE_RULES: ReadonlyArray<ICorrectiveActionDueDateRule> = [
  { severity: 'CRITICAL', businessDays: 0 },
  { severity: 'MAJOR', businessDays: 3 },
  { severity: 'MINOR', businessDays: 7 },
];

// -- Work Queue Triggers (§7) -----------------------------------------------

export const INSPECTION_WORK_QUEUE_TRIGGERS: ReadonlyArray<IInspectionWorkQueueTrigger> = [
  {
    trigger: 'Current week has no inspection initiated',
    workQueueItem: 'Conduct weekly safety inspection',
    priority: 'HIGH',
    assignee: 'Safety Manager',
  },
  {
    trigger: 'Inspection is IN_PROGRESS for > 48 hours',
    workQueueItem: 'Complete in-progress inspection',
    priority: 'MEDIUM',
    assignee: 'Safety Manager',
  },
  {
    trigger: 'Inspection completed with CRITICAL corrective action',
    workQueueItem: 'Respond to critical safety finding',
    priority: 'CRITICAL',
    assignee: 'PM + Safety Manager',
  },
  {
    trigger: 'Inspection completed with score < 70',
    workQueueItem: 'Review low safety inspection score',
    priority: 'HIGH',
    assignee: 'Safety Manager + PM',
  },
];

// -- Label Maps -------------------------------------------------------------

export const APPLICABILITY_CONDITION_LABELS: Readonly<Record<ApplicabilityCondition, string>> = {
  PROJECT_PHASE: 'Project Phase',
  ACTIVITY_PRESENT: 'Activity Present on Site',
  ALWAYS_APPLICABLE: 'Always Applicable',
  SAFETY_MANAGER_OVERRIDE: 'Safety Manager Override',
};

export const INSPECTION_ITEM_RESPONSE_VALUE_LABELS: Readonly<Record<InspectionItemResponseValue, string>> = {
  PASS: 'Pass',
  FAIL: 'Fail',
  N_A: 'Not Applicable',
};

export const INSPECTION_TREND_DIRECTION_LABELS: Readonly<Record<InspectionTrendDirection, string>> = {
  IMPROVING: 'Improving',
  STABLE: 'Stable',
  DECLINING: 'Declining',
  INSUFFICIENT_DATA: 'Insufficient Data',
};

export const INSPECTION_SCORE_BAND_LABELS: Readonly<Record<InspectionScoreBand, string>> = {
  HIGH: 'High (≥ 90)',
  MED: 'Medium (70–89)',
  LOW: 'Low (< 70)',
};
