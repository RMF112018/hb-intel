/**
 * P3-E11-T10 Stage 7 Project Startup Execution Baseline (PM Plan) constants.
 * 11-section model, structured fields, critical certification fields, assumptions, approval flow.
 */

import type {
  AssumptionCategory,
  AssumptionRiskLevel,
  BaselineFieldType,
  BaselineStatus,
  Stage7ActivityEvent,
  Stage7HealthMetric,
  Stage7WorkQueueItem,
} from './enums.js';
import type {
  IAssumptionCategoryDefinition,
  IBaselineSectionDefinition,
  IBaselineStatusTransition,
  ICriticalBaselineField,
  IStage7ActivityEventDef,
  IStage7HealthMetricDef,
  IStage7WorkQueueItemDef,
} from './types.js';

// -- Module Scope -----------------------------------------------------------

export const EXECUTION_BASELINE_SCOPE = 'startup/execution-baseline' as const;

// -- Enum Arrays ------------------------------------------------------------

export const BASELINE_STATUSES = [
  'Draft', 'Submitted', 'Approved', 'Archived',
] as const satisfies ReadonlyArray<BaselineStatus>;

export const BASELINE_FIELD_TYPES = [
  'Text', 'Number', 'Date', 'Currency', 'Boolean', 'LongText',
] as const satisfies ReadonlyArray<BaselineFieldType>;

export const ASSUMPTION_CATEGORIES = [
  'LOGISTICS', 'SAFETY', 'SCHEDULE', 'PROCUREMENT_BUYOUT', 'OWNER_COMMITMENT',
  'RISK', 'CLOSEOUT_PREPARATION', 'OPERATING_HYPOTHESIS', 'SUCCESS_CRITERIA',
] as const satisfies ReadonlyArray<AssumptionCategory>;

export const ASSUMPTION_RISK_LEVELS = [
  'HIGH', 'MEDIUM', 'LOW',
] as const satisfies ReadonlyArray<AssumptionRiskLevel>;

export const STAGE7_ACTIVITY_EVENTS = [
  'PMPlanSubmitted', 'PMPlanApproved', 'ExecutionAssumptionAdded',
] as const satisfies ReadonlyArray<Stage7ActivityEvent>;

export const STAGE7_HEALTH_METRICS = [
  'pmPlanStatus',
] as const satisfies ReadonlyArray<Stage7HealthMetric>;

export const STAGE7_WORK_QUEUE_ITEMS = [
  'PMPlanPendingApproval',
] as const satisfies ReadonlyArray<Stage7WorkQueueItem>;

// -- 11-Section Definitions (T06 §3.1) ----------------------------------------

export const BASELINE_SECTION_DEFINITIONS: ReadonlyArray<IBaselineSectionDefinition> = [
  { sectionNumber: 1, sectionTitle: 'Project Team Philosophy', captureMode: 'Narrative + critical assumptions reference' },
  { sectionNumber: 2, sectionTitle: 'Quality Control', captureMode: 'Narrative + structured (Punch List Manager)' },
  { sectionNumber: 3, sectionTitle: 'Preconstruction Meeting', captureMode: 'Narrative + structured date' },
  { sectionNumber: 4, sectionTitle: 'Safety', captureMode: 'Structured commitment fields + narrative' },
  { sectionNumber: 5, sectionTitle: 'Maintaining Cost Control', captureMode: 'Structured financial fields + procurement strategy' },
  { sectionNumber: 6, sectionTitle: 'Project Schedule', captureMode: 'Structured date fields + critical path notes' },
  { sectionNumber: 7, sectionTitle: 'Project Team Members Responsibilities', captureMode: 'Reference → ResponsibilityMatrix' },
  { sectionNumber: 8, sectionTitle: 'Project Site Management', captureMode: 'Structured logistics fields + narrative' },
  { sectionNumber: 9, sectionTitle: 'Project Administration', captureMode: 'Narrative + operating hypotheses reference' },
  { sectionNumber: 10, sectionTitle: 'Project Closeout', captureMode: 'Narrative reference to Closeout module' },
  { sectionNumber: 11, sectionTitle: 'Attachments to Be Included', captureMode: 'Attachment checklist (boolean flags)' },
];

// -- Approval Flow Transitions (T06 §2.1) ------------------------------------

export const BASELINE_STATUS_TRANSITIONS: ReadonlyArray<IBaselineStatusTransition> = [
  { from: 'Draft', to: 'Submitted', description: 'PM submits plan for PX review' },
  { from: 'Submitted', to: 'Draft', description: 'Revert to Draft for editing (re-submission required)' },
  { from: 'Submitted', to: 'Approved', description: 'PX approves the PM Plan' },
  { from: 'Approved', to: 'Archived', description: 'Manually set if superseded' },
];

// -- 7 Critical Certification Fields (T06 §2.3) ------------------------------

export const CRITICAL_BASELINE_FIELDS: ReadonlyArray<ICriticalBaselineField> = [
  { fieldKey: 'safetyOfficerName', fieldLabel: 'Project Safety Officer Assigned', sectionNumber: 4 },
  { fieldKey: 'safetyOfficerRole', fieldLabel: 'Safety Officer Role / Title', sectionNumber: 4 },
  { fieldKey: 'projectStartDate', fieldLabel: 'Project start date', sectionNumber: 6 },
  { fieldKey: 'substantialCompletionDate', fieldLabel: 'Substantial Completion Date per contract', sectionNumber: 6 },
  { fieldKey: 'noticeToProceedDate', fieldLabel: 'Notice to Proceed issued date', sectionNumber: 6 },
  { fieldKey: 'goalSubstantialCompletionDate', fieldLabel: 'Team goal — Substantial Completion by', sectionNumber: 6 },
  { fieldKey: 'goalFinalCompletionDate', fieldLabel: 'Team goal — Final Completion by', sectionNumber: 6 },
];

// -- Assumption Category Definitions (T06 §8) --------------------------------

export const ASSUMPTION_CATEGORY_DEFINITIONS: ReadonlyArray<IAssumptionCategoryDefinition> = [
  { category: 'LOGISTICS', label: 'Logistics', description: 'Site access, laydown, sequencing, mobilization' },
  { category: 'SAFETY', label: 'Safety', description: 'Safety conditions, subcontractor compliance' },
  { category: 'SCHEDULE', label: 'Schedule', description: 'Lead times, Owner milestone delivery, weather' },
  { category: 'PROCUREMENT_BUYOUT', label: 'Procurement / Buyout', description: 'Vendor availability, buyout targets, markets' },
  { category: 'OWNER_COMMITMENT', label: 'Owner Commitment', description: 'RFI response times, design completion, authority' },
  { category: 'RISK', label: 'Risk', description: 'Financial, scope, geotechnical, regulatory' },
  { category: 'CLOSEOUT_PREPARATION', label: 'Closeout Preparation', description: 'Punchlist velocity, commissioning, warranty' },
  { category: 'OPERATING_HYPOTHESIS', label: 'Operating Hypothesis', description: 'Project-specific conditions at launch' },
  { category: 'SUCCESS_CRITERIA', label: 'Success Criteria', description: 'Measurable outcomes the team commits to' },
];

// -- Stage 7 Spine Publication Definitions -----------------------------------

export const STAGE7_ACTIVITY_EVENT_DEFINITIONS: ReadonlyArray<IStage7ActivityEventDef> = [
  { event: 'PMPlanSubmitted', description: 'PM submitted PM Plan for PX review (Draft → Submitted)' },
  { event: 'PMPlanApproved', description: 'PX approved PM Plan (Submitted → Approved)' },
  { event: 'ExecutionAssumptionAdded', description: 'New execution assumption created' },
];

export const STAGE7_HEALTH_METRIC_DEFINITIONS: ReadonlyArray<IStage7HealthMetricDef> = [
  { metric: 'pmPlanStatus', description: 'Current PM Plan status (Draft/Submitted/Approved/Archived)' },
];

export const STAGE7_WORK_QUEUE_ITEM_DEFINITIONS: ReadonlyArray<IStage7WorkQueueItemDef> = [
  { item: 'PMPlanPendingApproval', description: 'PM Plan submitted and awaiting PX approval', assignedTo: 'PX' },
];

// -- Label Maps ---------------------------------------------------------------

export const BASELINE_STATUS_LABELS: Readonly<Record<BaselineStatus, string>> = {
  Draft: 'Draft',
  Submitted: 'Submitted for Review',
  Approved: 'Approved',
  Archived: 'Archived',
};

export const BASELINE_FIELD_TYPE_LABELS: Readonly<Record<BaselineFieldType, string>> = {
  Text: 'Text',
  Number: 'Number',
  Date: 'Date',
  Currency: 'Currency',
  Boolean: 'Yes/No',
  LongText: 'Long Text',
};

export const ASSUMPTION_CATEGORY_LABELS: Readonly<Record<AssumptionCategory, string>> = {
  LOGISTICS: 'Logistics',
  SAFETY: 'Safety',
  SCHEDULE: 'Schedule',
  PROCUREMENT_BUYOUT: 'Procurement / Buyout',
  OWNER_COMMITMENT: 'Owner Commitment',
  RISK: 'Risk',
  CLOSEOUT_PREPARATION: 'Closeout Preparation',
  OPERATING_HYPOTHESIS: 'Operating Hypothesis',
  SUCCESS_CRITERIA: 'Success Criteria',
};

export const ASSUMPTION_RISK_LEVEL_LABELS: Readonly<Record<AssumptionRiskLevel, string>> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};
