/**
 * P3-E11-T10 Stage 6 Project Startup Responsibility Matrix constants.
 * Role columns, task categories, critical categories, spine publication.
 */

import type {
  AssignmentValue,
  FieldRoleCode,
  FieldTaskCategory,
  MatrixSheet,
  PMRoleCode,
  PMTaskCategory,
  Stage6ActivityEvent,
  Stage6HealthMetric,
  Stage6WorkQueueItem,
} from './enums.js';
import type {
  IFieldTaskCategoryDefinition,
  IPMTaskCategoryDefinition,
  IStage6ActivityEventDef,
  IStage6HealthMetricDef,
  IStage6WorkQueueItemDef,
} from './types.js';

// -- Module Scope -----------------------------------------------------------

export const RESPONSIBILITY_MATRIX_SCOPE = 'startup/responsibility-matrix' as const;

// -- Enum Arrays ------------------------------------------------------------

export const MATRIX_SHEETS = [
  'PM', 'Field',
] as const satisfies ReadonlyArray<MatrixSheet>;

export const PM_ROLE_CODES = [
  'PX', 'SrPM', 'PM2', 'PM1', 'PA', 'QAQC', 'ProjAcct',
] as const satisfies ReadonlyArray<PMRoleCode>;

export const FIELD_ROLE_CODES = [
  'LeadSuper', 'MEPSuper', 'IntSuper', 'AsstSuper', 'QAQC_Field',
] as const satisfies ReadonlyArray<FieldRoleCode>;

export const ASSIGNMENT_VALUES = [
  'Primary', 'Support', 'SignOff', 'Review',
] as const satisfies ReadonlyArray<AssignmentValue>;

export const PM_TASK_CATEGORIES = [
  'PX', 'SPM', 'PM2', 'PM1', 'PA', 'QAQC', 'ProjAcct',
] as const satisfies ReadonlyArray<PMTaskCategory>;

export const FIELD_TASK_CATEGORIES = [
  'LeadSuper', 'MEPSuper', 'InteriorEnvelope', 'QAQC_Field',
] as const satisfies ReadonlyArray<FieldTaskCategory>;

export const STAGE6_ACTIVITY_EVENTS = [
  'ResponsibilityAssignmentUpdated', 'ResponsibilityAssignmentAcknowledged',
] as const satisfies ReadonlyArray<Stage6ActivityEvent>;

export const STAGE6_HEALTH_METRICS = [
  'responsibilityMatrixReadiness',
] as const satisfies ReadonlyArray<Stage6HealthMetric>;

export const STAGE6_WORK_QUEUE_ITEMS = [
  'MatrixUnassignedCategory', 'MatrixAcknowledgmentPending',
] as const satisfies ReadonlyArray<Stage6WorkQueueItem>;

// -- PM Task Category Definitions (T05 §8) -----------------------------------

export const PM_TASK_CATEGORY_DEFINITIONS: ReadonlyArray<IPMTaskCategoryDefinition> = [
  { category: 'PX', label: 'Project Executive', assignmentBearingRowCount: 4, reminderOnlyRowCount: 0, isCritical: true },
  { category: 'SPM', label: 'Senior Project Manager', assignmentBearingRowCount: 12, reminderOnlyRowCount: 2, isCritical: false },
  { category: 'PM2', label: 'Project Manager 2', assignmentBearingRowCount: 11, reminderOnlyRowCount: 0, isCritical: false },
  { category: 'PM1', label: 'Project Manager 1', assignmentBearingRowCount: 11, reminderOnlyRowCount: 0, isCritical: false },
  { category: 'PA', label: 'Project Administrator', assignmentBearingRowCount: 17, reminderOnlyRowCount: 0, isCritical: false },
  { category: 'QAQC', label: 'QA/QC Manager', assignmentBearingRowCount: 5, reminderOnlyRowCount: 0, isCritical: true },
  { category: 'ProjAcct', label: 'Project Accountant', assignmentBearingRowCount: 11, reminderOnlyRowCount: 2, isCritical: true },
];

// -- Field Task Category Definitions (T05 §10) --------------------------------

export const FIELD_TASK_CATEGORY_DEFINITIONS: ReadonlyArray<IFieldTaskCategoryDefinition> = [
  { category: 'LeadSuper', label: 'Lead Superintendent', assignmentBearingRowCount: 10, isCritical: true },
  { category: 'MEPSuper', label: 'MEP Superintendent', assignmentBearingRowCount: 5, isCritical: false },
  { category: 'InteriorEnvelope', label: 'Interior/Envelope Superintendent', assignmentBearingRowCount: 11, isCritical: false },
  { category: 'QAQC_Field', label: 'QA/QC (Field)', assignmentBearingRowCount: 1, isCritical: true },
];

// -- Critical Categories (T05 §9.2) ------------------------------------------

export const PM_CRITICAL_CATEGORIES: ReadonlyArray<PMTaskCategory> = ['PX', 'QAQC', 'ProjAcct'];
export const FIELD_CRITICAL_CATEGORIES: ReadonlyArray<FieldTaskCategory> = ['LeadSuper', 'QAQC_Field'];

// -- Shared Reminder-Only Row Categories (T05 §8) ----------------------------

/** Total reminder-only rows in PM sheet: SPM(2) + ProjAcct(2) + shared(7) = 11 */
export const PM_TOTAL_REMINDER_ONLY_ROWS = 11;

// -- Row Count Totals --------------------------------------------------------

export const PM_ASSIGNMENT_BEARING_ROW_COUNT = 71;
export const PM_REMINDER_ONLY_ROW_COUNT = 11;
export const PM_TOTAL_GOVERNED_ROW_COUNT = 82;
export const FIELD_ASSIGNMENT_BEARING_ROW_COUNT = 27;
export const FIELD_TOTAL_GOVERNED_ROW_COUNT = 27;

// -- Immutable Governed Row Fields (T05 §4) -----------------------------------

export const GOVERNED_ROW_IMMUTABLE_FIELDS: ReadonlyArray<string> = [
  'taskDescription', 'taskCategory', 'sheet',
];

// -- PM Role Column Labels (T05 §6) ------------------------------------------

export const PM_ROLE_CODE_LABELS: Readonly<Record<PMRoleCode, string>> = {
  PX: 'Project Executive',
  SrPM: 'Senior Project Manager',
  PM2: 'Project Manager 2',
  PM1: 'Project Manager 1',
  PA: 'Project Administrator',
  QAQC: 'QA/QC Manager',
  ProjAcct: 'Project Accountant',
};

// -- Field Role Column Labels (T05 §7) ---------------------------------------

export const FIELD_ROLE_CODE_LABELS: Readonly<Record<FieldRoleCode, string>> = {
  LeadSuper: 'Lead Superintendent',
  MEPSuper: 'MEP Superintendent',
  IntSuper: 'Interior/Envelope Superintendent',
  AsstSuper: 'Assistant Superintendent',
  QAQC_Field: 'QA/QC (Field)',
};

// -- Assignment Value Labels (T05 §8) ----------------------------------------

export const ASSIGNMENT_VALUE_LABELS: Readonly<Record<AssignmentValue, string>> = {
  Primary: 'Primary — Accountable Owner',
  Support: 'Support — Active Contributor',
  SignOff: 'Sign-Off — Approval Gate',
  Review: 'Review — Non-Blocking Input',
};

// -- Sheet Labels -------------------------------------------------------------

export const MATRIX_SHEET_LABELS: Readonly<Record<MatrixSheet, string>> = {
  PM: 'PM Sheet',
  Field: 'Field Sheet',
};

// -- Stage 6 Spine Publication Definitions -----------------------------------

export const STAGE6_ACTIVITY_EVENT_DEFINITIONS: ReadonlyArray<IStage6ActivityEventDef> = [
  { event: 'ResponsibilityAssignmentUpdated', description: 'Assignment value or named person changed on a matrix row' },
  { event: 'ResponsibilityAssignmentAcknowledged', description: 'Named Primary assignee acknowledged their critical-category assignment' },
];

export const STAGE6_HEALTH_METRIC_DEFINITIONS: ReadonlyArray<IStage6HealthMetricDef> = [
  { metric: 'responsibilityMatrixReadiness', description: 'Composite readiness: all PM and Field categories have named Primary, all critical primaries acknowledged' },
];

export const STAGE6_WORK_QUEUE_ITEM_DEFINITIONS: ReadonlyArray<IStage6WorkQueueItemDef> = [
  { item: 'MatrixUnassignedCategory', description: 'Task category missing a named Primary assignee', assignedTo: 'PM' },
  { item: 'MatrixAcknowledgmentPending', description: 'Critical-category Primary assignment with no acknowledgedAt after 3 days', assignedTo: 'Named assignee (PM if no userId)' },
];
