/**
 * P3-E11-T10 Stage 3 Project Startup Safety Readiness constants.
 * 32-item governed template catalog, remediation transitions, escalation thresholds,
 * spine publication, work queue items.
 */

import type {
  EscalationLevel,
  RemediationStatus,
  SafetyReadinessResult,
  SafetyReadinessSectionTitle,
  Stage3ActivityEvent,
  Stage3HealthMetric,
  Stage3WorkQueueItem,
} from './enums.js';
import type {
  IEscalationThreshold,
  IRemediationStateTransition,
  ISafetyReadinessItemTemplate,
  ISafetyReadinessSectionDefinition,
  IStage3ActivityEventDef,
  IStage3HealthMetricDef,
  IStage3WorkQueueItemDef,
} from './types.js';

// -- Module Scope -----------------------------------------------------------

export const SAFETY_READINESS_SCOPE = 'startup/safety-readiness' as const;

// -- Enum Arrays ------------------------------------------------------------

export const SAFETY_READINESS_SECTION_TITLES = [
  'AreasOfHighestRisk', 'OtherRisks',
] as const satisfies ReadonlyArray<SafetyReadinessSectionTitle>;

export const SAFETY_READINESS_RESULTS = [
  'Pass', 'Fail', 'NA',
] as const satisfies ReadonlyArray<SafetyReadinessResult>;

export const REMEDIATION_STATUSES = [
  'PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED',
] as const satisfies ReadonlyArray<RemediationStatus>;

export const ESCALATION_LEVELS = [
  'NONE', 'PM', 'PX',
] as const satisfies ReadonlyArray<EscalationLevel>;

export const STAGE3_ACTIVITY_EVENTS = [
  'SafetyReadinessItemUpdated', 'SafetyRemediationCreated',
  'SafetyRemediationEscalated', 'SafetyRemediationResolved',
] as const satisfies ReadonlyArray<Stage3ActivityEvent>;

export const STAGE3_HEALTH_METRICS = [
  'safetyReadinessOpenRemediations', 'safetyReadinessEscalatedRemediations',
] as const satisfies ReadonlyArray<Stage3HealthMetric>;

export const STAGE3_WORK_QUEUE_ITEMS = [
  'SafetyRemediationPending', 'SafetyRemediationUnassigned',
  'SafetyRemediationOverdue', 'SafetyRemediationEscalated',
] as const satisfies ReadonlyArray<Stage3WorkQueueItem>;

// -- Section Definitions (T07 §3) -------------------------------------------

export const SAFETY_READINESS_SECTIONS: ReadonlyArray<ISafetyReadinessSectionDefinition> = [
  { sectionNumber: 1, sectionTitle: 'AreasOfHighestRisk', label: 'Section 1 — Areas of Highest Risk', itemCount: 4 },
  { sectionNumber: 2, sectionTitle: 'OtherRisks', label: 'Section 2 — Other Risks — These caused most injuries', itemCount: 28 },
];

// -- Section 1 — Areas of Highest Risk (4 items, T07 §6) -------------------

export const SAFETY_SECTION_1_ITEMS: ReadonlyArray<ISafetyReadinessItemTemplate> = [
  { itemNumber: '1.1', description: 'Fall Exposures', sectionTitle: 'AreasOfHighestRisk' },
  { itemNumber: '1.2', description: 'Electrical Shocks', sectionTitle: 'AreasOfHighestRisk' },
  { itemNumber: '1.3', description: 'Struck by Risks', sectionTitle: 'AreasOfHighestRisk' },
  { itemNumber: '1.4', description: 'Crushed by Risks', sectionTitle: 'AreasOfHighestRisk' },
];

// -- Section 2 — Other Risks (28 items, T07 §6) ----------------------------

export const SAFETY_SECTION_2_ITEMS: ReadonlyArray<ISafetyReadinessItemTemplate> = [
  { itemNumber: '2.1', description: 'Blasting/Explosives', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.2', description: 'Concrete Construction', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.3', description: 'Cranes & Elevators', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.4', description: 'Demolition', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.5', description: 'Electrical', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.6', description: 'Excavation', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.7', description: 'Fire Protection', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.8', description: 'First Aid', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.9', description: 'Flammables', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.10', description: 'Floor & Wall Openings', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.11', description: 'Gases, Fumes, Dusts', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.12', description: 'General Safety', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.13', description: 'Hazard Communication', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.14', description: 'Housekeeping', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.15', description: 'Illumination', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.16', description: 'Lockout/tagout', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.17', description: 'Maintenance', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.18', description: 'Motor Vehicles', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.19', description: 'Noise Exposure', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.20', description: 'Personal Protection', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.21', description: 'Safety Training', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.22', description: 'Sanitation', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.23', description: 'Scaffolding', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.24', description: 'Signs, Signals, Barricades', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.25', description: 'Stairways & Ladders', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.26', description: 'Steel Erection', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.27', description: 'Tools', sectionTitle: 'OtherRisks' },
  { itemNumber: '2.28', description: 'Welding & Cutting', sectionTitle: 'OtherRisks' },
];

// -- Combined Template Catalog (32 items) -----------------------------------

export const SAFETY_ALL_ITEM_TEMPLATES: ReadonlyArray<ISafetyReadinessItemTemplate> = [
  ...SAFETY_SECTION_1_ITEMS,
  ...SAFETY_SECTION_2_ITEMS,
];

// -- Remediation State Transitions (T07 §5.0) --------------------------------

export const REMEDIATION_STATE_TRANSITIONS: ReadonlyArray<IRemediationStateTransition> = [
  { from: 'PENDING', to: 'IN_PROGRESS', description: 'PM begins corrective action' },
  { from: 'PENDING', to: 'ESCALATED', description: 'Auto-escalation on threshold breach' },
  { from: 'PENDING', to: 'RESOLVED', description: 'Direct resolution from pending' },
  { from: 'IN_PROGRESS', to: 'RESOLVED', description: 'Corrective action completed' },
  { from: 'IN_PROGRESS', to: 'ESCALATED', description: 'Overdue or threshold breach during work' },
  { from: 'ESCALATED', to: 'IN_PROGRESS', description: 'PM/PX acknowledges escalation and resumes work' },
  { from: 'ESCALATED', to: 'RESOLVED', description: 'Direct resolution from escalated state' },
];

// -- Escalation Thresholds (T07 §5.2) ----------------------------------------

export const ESCALATION_THRESHOLDS: ReadonlyArray<IEscalationThreshold> = [
  {
    condition: 'PENDING with no assignedPersonName after 2 business days',
    escalateTo: 'PM',
    createsProgramBlocker: false,
    workQueueItemType: 'SafetyRemediationUnassigned',
  },
  {
    condition: 'PENDING or IN_PROGRESS with dueDate < today',
    escalateTo: 'PM',
    createsProgramBlocker: false,
    workQueueItemType: 'SafetyRemediationOverdue',
  },
  {
    condition: 'PENDING or IN_PROGRESS with dueDate < today - 3 days',
    escalateTo: 'PX',
    createsProgramBlocker: true,
    workQueueItemType: 'SafetyRemediationEscalated',
  },
];

// -- Immutable Item Fields (T07 §4) ------------------------------------------

export const SAFETY_IMMUTABLE_ITEM_FIELDS: ReadonlyArray<string> = [
  'itemNumber', 'description',
];

// -- Stage 3 Spine Publication Definitions -----------------------------------

export const STAGE3_ACTIVITY_EVENT_DEFINITIONS: ReadonlyArray<IStage3ActivityEventDef> = [
  { event: 'SafetyReadinessItemUpdated', description: 'Safety readiness item result changed (Pass/Fail/NA)' },
  { event: 'SafetyRemediationCreated', description: 'Remediation record auto-created on Fail result' },
  { event: 'SafetyRemediationEscalated', description: 'Remediation escalated to PM or PX level' },
  { event: 'SafetyRemediationResolved', description: 'Remediation corrective action completed' },
];

export const STAGE3_HEALTH_METRIC_DEFINITIONS: ReadonlyArray<IStage3HealthMetricDef> = [
  { metric: 'safetyReadinessOpenRemediations', description: 'Count of SafetyRemediationRecords with remediationStatus ≠ RESOLVED' },
  { metric: 'safetyReadinessEscalatedRemediations', description: 'Count of SafetyRemediationRecords with remediationStatus = ESCALATED' },
];

export const STAGE3_WORK_QUEUE_ITEM_DEFINITIONS: ReadonlyArray<IStage3WorkQueueItemDef> = [
  { item: 'SafetyRemediationPending', description: 'Auto-created remediation stub awaiting PM action', assignedTo: 'PM' },
  { item: 'SafetyRemediationUnassigned', description: 'Remediation not assigned after 2 business days', assignedTo: 'PM' },
  { item: 'SafetyRemediationOverdue', description: 'Remediation past due date', assignedTo: 'PM' },
  { item: 'SafetyRemediationEscalated', description: 'Remediation escalated to PX level', assignedTo: 'PE' },
];

// -- Label Maps ---------------------------------------------------------------

export const SAFETY_READINESS_SECTION_TITLE_LABELS: Readonly<Record<SafetyReadinessSectionTitle, string>> = {
  AreasOfHighestRisk: 'Section 1 — Areas of Highest Risk',
  OtherRisks: 'Section 2 — Other Risks',
};

export const SAFETY_READINESS_RESULT_LABELS: Readonly<Record<SafetyReadinessResult, string>> = {
  Pass: 'Pass',
  Fail: 'Fail',
  NA: 'N/A',
};

export const REMEDIATION_STATUS_LABELS: Readonly<Record<RemediationStatus, string>> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  ESCALATED: 'Escalated',
};

export const ESCALATION_LEVEL_LABELS: Readonly<Record<EscalationLevel, string>> = {
  NONE: 'None',
  PM: 'Project Manager',
  PX: 'Project Executive',
};
