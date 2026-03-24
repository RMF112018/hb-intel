/**
 * P3-E11-T10 Stage 5 Project Startup Contract Obligations Register constants.
 * Lifecycle transitions, categories, monitoring rules, spine publication.
 */

import type {
  ContractType,
  StartupDeliveryMethod,
  MonitoringPriority,
  ObligationCategory,
  ObligationStatus,
  ObligationTriggerBasis,
  Stage5ActivityEvent,
  Stage5HealthMetric,
  Stage5WorkQueueItem,
} from './enums.js';
import type {
  IMonitoringPriorityLeadDays,
  IMonitoringTriggerRule,
  IObligationCategoryDefinition,
  IObligationStateTransition,
  IStage5ActivityEventDef,
  IStage5HealthMetricDef,
  IStage5WorkQueueItemDef,
} from './types.js';

// -- Module Scope -----------------------------------------------------------

export const CONTRACT_OBLIGATIONS_SCOPE = 'startup/contract-obligations' as const;

// -- Enum Arrays ------------------------------------------------------------

export const OBLIGATION_STATUSES = [
  'OPEN', 'IN_PROGRESS', 'SATISFIED', 'WAIVED', 'NOT_APPLICABLE',
] as const satisfies ReadonlyArray<ObligationStatus>;

export const OBLIGATION_CATEGORIES = [
  'SPECIAL_TERMS', 'LIQUIDATED_DAMAGES', 'SPLIT_SAVINGS', 'ALLOWANCES',
  'BONDING_REQUIREMENTS', 'INSURANCE_REQUIREMENTS', 'SCHEDULE_MILESTONES',
  'PAYMENT_TERMS', 'CHANGE_ORDER_AUTHORITY', 'WARRANTIES', 'OWNER_COMMITMENT', 'OTHER',
] as const satisfies ReadonlyArray<ObligationCategory>;

export const OBLIGATION_TRIGGER_BASES = [
  'PROJECT_START', 'NTP_ISSUED', 'CONTRACT_EXECUTION', 'MILESTONE_DATE',
  'RECURRING_MONTHLY', 'RECURRING_QUARTERLY', 'OWNER_NOTICE', 'AS_NEEDED',
  'PROJECT_CLOSE', 'NONE',
] as const satisfies ReadonlyArray<ObligationTriggerBasis>;

export const MONITORING_PRIORITIES = [
  'HIGH', 'MEDIUM', 'LOW',
] as const satisfies ReadonlyArray<MonitoringPriority>;

export const CONTRACT_TYPES = [
  'AIA Docs', 'Consensus Docs', 'Construction Manager', 'Cost Plus with GMP',
  'Cost Plus without GMP', 'Lump Sum', 'Purchase Order', 'Stipulated Sum', 'Time & Material',
] as const satisfies ReadonlyArray<ContractType>;

export const STARTUP_DELIVERY_METHODS = [
  'Construction Manager', 'Design Build', 'Fast Track', 'General Contractor',
  'Owners Representative', 'P3', 'Preconstruction', 'Program Manager',
] as const satisfies ReadonlyArray<StartupDeliveryMethod>;

export const STAGE5_ACTIVITY_EVENTS = [
  'ContractObligationAdded', 'ContractObligationStatusChanged',
] as const satisfies ReadonlyArray<Stage5ActivityEvent>;

export const STAGE5_HEALTH_METRICS = [
  'contractObligationsFlagged', 'contractObligationsOverdue',
] as const satisfies ReadonlyArray<Stage5HealthMetric>;

export const STAGE5_WORK_QUEUE_ITEMS = [
  'ObligationOpenFlagged', 'ObligationDueSoon', 'ObligationOverdue',
] as const satisfies ReadonlyArray<Stage5WorkQueueItem>;

// -- Terminal Statuses ------------------------------------------------------

export const TERMINAL_OBLIGATION_STATUSES: ReadonlyArray<ObligationStatus> = [
  'SATISFIED', 'WAIVED', 'NOT_APPLICABLE',
];

// -- Obligation State Transitions (T04 §4) -----------------------------------

export const OBLIGATION_STATE_TRANSITIONS: ReadonlyArray<IObligationStateTransition> = [
  { from: 'OPEN', to: 'IN_PROGRESS', guard: 'None', requiresPX: false },
  { from: 'OPEN', to: 'NOT_APPLICABLE', guard: 'notes must be populated', requiresPX: false },
  { from: 'OPEN', to: 'WAIVED', guard: 'waiverNote required; PX must be the actor', requiresPX: true },
  { from: 'IN_PROGRESS', to: 'SATISFIED', guard: 'evidenceAttachmentIds ≥ 1 OR notes populated', requiresPX: false },
  { from: 'IN_PROGRESS', to: 'OPEN', guard: 'Regression; documented in notes', requiresPX: false },
  { from: 'IN_PROGRESS', to: 'WAIVED', guard: 'waiverNote required; PX must be the actor', requiresPX: true },
  { from: 'SATISFIED', to: 'OPEN', guard: 'PX must be the actor; notes must document reopening reason', requiresPX: true },
  { from: 'NOT_APPLICABLE', to: 'OPEN', guard: 'PX must be the actor; notes must document reopening reason', requiresPX: true },
  { from: 'WAIVED', to: 'OPEN', guard: 'PX must be the actor; notes must document reopening reason', requiresPX: true },
];

// -- Obligation Categories (T04 §5) ------------------------------------------

export const OBLIGATION_CATEGORY_DEFINITIONS: ReadonlyArray<IObligationCategoryDefinition> = [
  { category: 'SPECIAL_TERMS', label: 'Special Terms', routingImplication: 'Routes to PM and PX; high monitoring priority', autoFlagForMonitoring: false },
  { category: 'LIQUIDATED_DAMAGES', label: 'Liquidated Damages', routingImplication: 'Routes to PX and ProjAcct; auto-flag for monitoring', autoFlagForMonitoring: true },
  { category: 'SPLIT_SAVINGS', label: 'Split Savings', routingImplication: 'Routes to PX and ProjAcct', autoFlagForMonitoring: false },
  { category: 'ALLOWANCES', label: 'Allowances', routingImplication: 'Routes to PM; link to Financial module tracking', autoFlagForMonitoring: false },
  { category: 'BONDING_REQUIREMENTS', label: 'Bonding Requirements', routingImplication: 'Routes to ProjAcct; due dates required', autoFlagForMonitoring: false },
  { category: 'INSURANCE_REQUIREMENTS', label: 'Insurance Requirements', routingImplication: 'Routes to ProjAcct; recurring due dates required', autoFlagForMonitoring: false },
  { category: 'SCHEDULE_MILESTONES', label: 'Schedule Milestones', routingImplication: 'Routes to PM; link to Schedule module', autoFlagForMonitoring: false },
  { category: 'PAYMENT_TERMS', label: 'Payment Terms', routingImplication: 'Routes to ProjAcct', autoFlagForMonitoring: false },
  { category: 'CHANGE_ORDER_AUTHORITY', label: 'Change Order Authority', routingImplication: 'Routes to PX and PM', autoFlagForMonitoring: false },
  { category: 'WARRANTIES', label: 'Warranties', routingImplication: 'Routes to PM; typically PROJECT_CLOSE trigger', autoFlagForMonitoring: false },
  { category: 'OWNER_COMMITMENT', label: 'Owner Commitment', routingImplication: 'Owner-side obligations that HB must track and enforce', autoFlagForMonitoring: false },
  { category: 'OTHER', label: 'Other', routingImplication: 'Routes to PM', autoFlagForMonitoring: false },
];

// -- Monitoring Trigger Rules (T04 §6.1) -------------------------------------

export const MONITORING_TRIGGER_RULES: ReadonlyArray<IMonitoringTriggerRule> = [
  { condition: 'flagForMonitoring = true AND obligationStatus = OPEN', workQueueItemType: 'ObligationOpenFlagged', assignedTo: 'responsibleRoleCode (PM if null)', clearsWhen: 'obligationStatus transitions to IN_PROGRESS, SATISFIED, WAIVED, or NOT_APPLICABLE' },
  { condition: 'flagForMonitoring = true AND obligationStatus = IN_PROGRESS AND no evidenceAttachmentIds after 30 days', workQueueItemType: 'ObligationNoEvidence', assignedTo: 'responsibleRoleCode (PM if null)', clearsWhen: 'Evidence attached or obligation satisfied' },
  { condition: 'dueDate within 14 days AND obligationStatus not terminal', workQueueItemType: 'ObligationDueSoon', assignedTo: 'responsibleRoleCode (PM if null)', clearsWhen: 'obligationStatus transitions to terminal state' },
  { condition: 'dueDate in the past AND obligationStatus not terminal', workQueueItemType: 'ObligationOverdue', assignedTo: 'responsibleRoleCode AND accountableRoleCode', clearsWhen: 'obligationStatus transitions to terminal state' },
  { condition: 'triggerBasis = RECURRING AND dueDate < today AND not terminal for this cycle', workQueueItemType: 'ObligationRecurringDue', assignedTo: 'responsibleRoleCode (PM if null)', clearsWhen: 'PM advances dueDate to next cycle' },
];

// -- Monitoring Priority Lead Days (T04 §6.2) --------------------------------

export const MONITORING_PRIORITY_LEAD_DAYS: ReadonlyArray<IMonitoringPriorityLeadDays> = [
  { priority: 'HIGH', leadDays: 21 },
  { priority: 'MEDIUM', leadDays: 14 },
  { priority: 'LOW', leadDays: 7 },
];

// -- Stage 5 Spine Publication Definitions -----------------------------------

export const STAGE5_ACTIVITY_EVENT_DEFINITIONS: ReadonlyArray<IStage5ActivityEventDef> = [
  { event: 'ContractObligationAdded', description: 'New obligation row created in the register' },
  { event: 'ContractObligationStatusChanged', description: 'Obligation lifecycle status transitioned' },
];

export const STAGE5_HEALTH_METRIC_DEFINITIONS: ReadonlyArray<IStage5HealthMetricDef> = [
  { metric: 'contractObligationsFlagged', description: 'Count of obligations with flagForMonitoring = true and non-terminal status' },
  { metric: 'contractObligationsOverdue', description: 'Count of obligations with dueDate past and non-terminal status' },
];

export const STAGE5_WORK_QUEUE_ITEM_DEFINITIONS: ReadonlyArray<IStage5WorkQueueItemDef> = [
  { item: 'ObligationOpenFlagged', description: 'Flagged obligation in OPEN status requiring attention', assignedTo: 'responsibleRoleCode' },
  { item: 'ObligationDueSoon', description: 'Obligation due within 14 days', assignedTo: 'responsibleRoleCode' },
  { item: 'ObligationOverdue', description: 'Obligation past due date', assignedTo: 'responsibleRoleCode + accountableRoleCode' },
];

// -- Label Maps ---------------------------------------------------------------

export const OBLIGATION_STATUS_LABELS: Readonly<Record<ObligationStatus, string>> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  SATISFIED: 'Satisfied',
  WAIVED: 'Waived',
  NOT_APPLICABLE: 'Not Applicable',
};

export const OBLIGATION_CATEGORY_LABELS: Readonly<Record<ObligationCategory, string>> = {
  SPECIAL_TERMS: 'Special Terms',
  LIQUIDATED_DAMAGES: 'Liquidated Damages',
  SPLIT_SAVINGS: 'Split Savings',
  ALLOWANCES: 'Allowances',
  BONDING_REQUIREMENTS: 'Bonding Requirements',
  INSURANCE_REQUIREMENTS: 'Insurance Requirements',
  SCHEDULE_MILESTONES: 'Schedule Milestones',
  PAYMENT_TERMS: 'Payment Terms',
  CHANGE_ORDER_AUTHORITY: 'Change Order Authority',
  WARRANTIES: 'Warranties',
  OWNER_COMMITMENT: 'Owner Commitment',
  OTHER: 'Other',
};

export const OBLIGATION_TRIGGER_BASIS_LABELS: Readonly<Record<ObligationTriggerBasis, string>> = {
  PROJECT_START: 'Project Start',
  NTP_ISSUED: 'NTP Issued',
  CONTRACT_EXECUTION: 'Contract Execution',
  MILESTONE_DATE: 'Milestone Date',
  RECURRING_MONTHLY: 'Recurring Monthly',
  RECURRING_QUARTERLY: 'Recurring Quarterly',
  OWNER_NOTICE: 'Owner Notice',
  AS_NEEDED: 'As Needed',
  PROJECT_CLOSE: 'Project Close',
  NONE: 'None',
};

export const MONITORING_PRIORITY_LABELS: Readonly<Record<MonitoringPriority, string>> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};
