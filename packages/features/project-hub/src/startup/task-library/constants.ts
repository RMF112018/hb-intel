/**
 * P3-E11-T10 Stage 2 Project Startup Task Library constants.
 * Full 55-task governed template catalog, sections, dependencies, spine publication.
 */

import type {
  Stage2ActivityEvent,
  Stage2HealthMetric,
  Stage2WorkQueueItem,
  StartupTaskCategory,
  StartupTaskDueTrigger,
  StartupTaskEvidenceType,
  StartupTaskGatingImpact,
  StartupTaskOwnerRole,
  StartupTaskResult,
  StartupTaskSectionCode,
  StartupTaskSeverity,
  TaskBlockerStatus,
  TaskBlockerType,
} from './enums.js';
import type {
  IStartupTaskDependency,
  IStartupTaskSectionDefinition,
  IStartupTaskTemplate,
  IStage2ActivityEventDef,
  IStage2HealthMetricDef,
  IStage2WorkQueueItemDef,
} from './types.js';

// -- Module Scope -----------------------------------------------------------

export const STARTUP_TASK_LIBRARY_SCOPE = 'startup/task-library' as const;

// -- Enum Arrays ------------------------------------------------------------

export const STARTUP_TASK_SECTION_CODES = [
  'REVIEW_OWNER_CONTRACT', 'JOB_STARTUP', 'ORDER_SERVICES', 'PERMIT_POSTING',
] as const satisfies ReadonlyArray<StartupTaskSectionCode>;

export const STARTUP_TASK_CATEGORIES = [
  'CONTRACTUAL_OBLIGATION', 'ADMIN_SETUP', 'FINANCIAL_SETUP', 'SUBCONTRACTOR_MANAGEMENT',
  'OWNER_COORDINATION', 'LEGAL_AND_NOTICE', 'SITE_SERVICES', 'SCHEDULE_AND_PLANNING',
  'TEAM_SETUP', 'SAFETY_COORDINATION', 'COMMUNITY_AND_EXTERNAL', 'PERMIT_POSTING',
] as const satisfies ReadonlyArray<StartupTaskCategory>;

export const STARTUP_TASK_SEVERITIES = [
  'CRITICAL', 'HIGH', 'STANDARD',
] as const satisfies ReadonlyArray<StartupTaskSeverity>;

export const STARTUP_TASK_GATING_IMPACTS = [
  'BLOCKS_CERTIFICATION', 'REQUIRES_BLOCKER_IF_OPEN', 'ADVISORY',
] as const satisfies ReadonlyArray<StartupTaskGatingImpact>;

export const STARTUP_TASK_OWNER_ROLES = [
  'PM', 'PA', 'PROJ_ACCT', 'PX', 'SUPERINTENDENT', 'SAFETY_MANAGER',
] as const satisfies ReadonlyArray<StartupTaskOwnerRole>;

export const STARTUP_TASK_DUE_TRIGGERS = [
  'ON_PROJECT_CREATION', 'ON_CONTRACT_EXECUTION', 'ON_NTP_ISSUED',
  'DAYS_BEFORE_MOBILIZATION', 'NONE',
] as const satisfies ReadonlyArray<StartupTaskDueTrigger>;

export const STARTUP_TASK_RESULTS = [
  'YES', 'NO', 'NA',
] as const satisfies ReadonlyArray<StartupTaskResult>;

export const TASK_BLOCKER_TYPES = [
  'PENDING_OWNER_ACTION', 'PENDING_PERMIT', 'PENDING_SUBCONTRACTOR_COI',
  'PENDING_INTERNAL_SETUP', 'PENDING_INFORMATION', 'PENDING_SYSTEM_SETUP',
  'DEPENDENCY_UNSATISFIED', 'OTHER',
] as const satisfies ReadonlyArray<TaskBlockerType>;

export const TASK_BLOCKER_STATUSES = [
  'OPEN', 'RESOLVED', 'WAIVED',
] as const satisfies ReadonlyArray<TaskBlockerStatus>;

export const STARTUP_TASK_EVIDENCE_TYPES = [
  'COI_DOCUMENT', 'EXECUTED_DOCUMENT', 'RECORDED_DOCUMENT', 'SYSTEM_SCREENSHOT',
  'PERMIT_COPY', 'MEETING_MINUTES', 'SCHEDULE_FILE', 'PLAN_OR_DOCUMENT', 'CORRESPONDENCE',
] as const satisfies ReadonlyArray<StartupTaskEvidenceType>;

// -- Section Definitions (T03 §2) -------------------------------------------

export const STARTUP_TASK_SECTIONS: ReadonlyArray<IStartupTaskSectionDefinition> = [
  { sectionCode: 'REVIEW_OWNER_CONTRACT', sectionNumber: 1, label: "Section 1 — Review Owner's Contract", taskCount: 4 },
  { sectionCode: 'JOB_STARTUP', sectionNumber: 2, label: 'Section 2 — Job Start-Up', taskCount: 33 },
  { sectionCode: 'ORDER_SERVICES', sectionNumber: 3, label: 'Section 3 — Order Services and Equipment', taskCount: 6 },
  { sectionCode: 'PERMIT_POSTING', sectionNumber: 4, label: 'Section 4 — Permits Posted on Jobsite', taskCount: 12 },
];

// -- Helper for template shorthand ------------------------------------------

type TemplateEntry = Omit<IStartupTaskTemplate, 'templateId' | 'templateVersion' | 'isActive' | 'createdAt' | 'lastModifiedAt'>;

const t = (
  taskNumber: string, title: string, sectionCode: StartupTaskSectionCode,
  category: StartupTaskCategory, severity: StartupTaskSeverity, gatingImpact: StartupTaskGatingImpact,
  ownerRoleCode: StartupTaskOwnerRole, dueTrigger: StartupTaskDueTrigger,
  dueOffsetDays: number | null, activeDuringStabilization: boolean,
  opts?: { supportingRoleCodes?: readonly string[]; evidenceTypes?: readonly StartupTaskEvidenceType[]; dependsOnTaskNumbers?: readonly string[]; applicabilityNote?: string | null },
): TemplateEntry => ({
  taskNumber, title, sectionCode, category, severity, gatingImpact, ownerRoleCode,
  dueTrigger, dueOffsetDays, activeDuringStabilization,
  supportingRoleCodes: opts?.supportingRoleCodes ?? [],
  evidenceTypes: opts?.evidenceTypes ?? [],
  dependsOnTaskNumbers: opts?.dependsOnTaskNumbers ?? [],
  applicabilityNote: opts?.applicabilityNote ?? null,
});

// -- Section 1 — Review Owner's Contract (4 tasks, T03 §12) ----------------

export const STARTUP_SECTION_1_TEMPLATES: ReadonlyArray<TemplateEntry> = [
  t('1.1', 'Split savings clause if any & Contingency usage', 'REVIEW_OWNER_CONTRACT', 'CONTRACTUAL_OBLIGATION', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'PM', 'ON_CONTRACT_EXECUTION', null, false, { evidenceTypes: ['EXECUTED_DOCUMENT'] }),
  t('1.2', 'Liquidated damages are?', 'REVIEW_OWNER_CONTRACT', 'CONTRACTUAL_OBLIGATION', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'PM', 'ON_CONTRACT_EXECUTION', null, false, { evidenceTypes: ['EXECUTED_DOCUMENT'] }),
  t('1.3', 'Any other special terms?', 'REVIEW_OWNER_CONTRACT', 'CONTRACTUAL_OBLIGATION', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PM', 'ON_CONTRACT_EXECUTION', null, false, { evidenceTypes: ['EXECUTED_DOCUMENT'] }),
  t('1.4', 'Allowances to track — set up change event', 'REVIEW_OWNER_CONTRACT', 'CONTRACTUAL_OBLIGATION', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PM', 'ON_CONTRACT_EXECUTION', null, false),
];

// -- Section 2 — Job Start-Up (33 tasks, T03 §12) --------------------------

export const STARTUP_SECTION_2_TEMPLATES: ReadonlyArray<TemplateEntry> = [
  t('2.1', 'Review Bonding / SDI Requirements', 'JOB_STARTUP', 'CONTRACTUAL_OBLIGATION', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'PX', 'ON_CONTRACT_EXECUTION', null, false, { evidenceTypes: ['EXECUTED_DOCUMENT'] }),
  t('2.2', 'Complete Bond Application(s)', 'JOB_STARTUP', 'CONTRACTUAL_OBLIGATION', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'PX', 'ON_CONTRACT_EXECUTION', null, false, { evidenceTypes: ['EXECUTED_DOCUMENT'] }),
  t('2.3', 'Verify project in Accounting', 'JOB_STARTUP', 'ADMIN_SETUP', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PROJ_ACCT', 'ON_PROJECT_CREATION', null, false, { evidenceTypes: ['SYSTEM_SCREENSHOT'] }),
  t('2.4', 'Verify job in Procore', 'JOB_STARTUP', 'ADMIN_SETUP', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PA', 'ON_PROJECT_CREATION', null, false, { evidenceTypes: ['SYSTEM_SCREENSHOT'] }),
  t('2.5', 'Job Turnover Meeting', 'JOB_STARTUP', 'TEAM_SETUP', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'PM', 'ON_PROJECT_CREATION', null, false, { evidenceTypes: ['MEETING_MINUTES'] }),
  t('2.6', 'Budget rolled Estimating → Accounting', 'JOB_STARTUP', 'FINANCIAL_SETUP', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PROJ_ACCT', 'ON_PROJECT_CREATION', null, false, { dependsOnTaskNumbers: ['2.3'], evidenceTypes: ['SYSTEM_SCREENSHOT'] }),
  t('2.7', 'Budget rolled Accounting → Procore', 'JOB_STARTUP', 'FINANCIAL_SETUP', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PROJ_ACCT', 'ON_PROJECT_CREATION', null, false, { dependsOnTaskNumbers: ['2.4', '2.6'], evidenceTypes: ['SYSTEM_SCREENSHOT'] }),
  t('2.8', 'Order Project Signs', 'JOB_STARTUP', 'COMMUNITY_AND_EXTERNAL', 'STANDARD', 'ADVISORY', 'PA', 'DAYS_BEFORE_MOBILIZATION', -21, true),
  t('2.9', 'Enter Drawings/Specs in Procore', 'JOB_STARTUP', 'ADMIN_SETUP', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PA', 'DAYS_BEFORE_MOBILIZATION', -14, false, { evidenceTypes: ['SYSTEM_SCREENSHOT'] }),
  t('2.10', 'Contract to Owner with SOV / Pay app', 'JOB_STARTUP', 'OWNER_COORDINATION', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'PM', 'ON_CONTRACT_EXECUTION', null, false, { evidenceTypes: ['EXECUTED_DOCUMENT', 'CORRESPONDENCE'] }),
  t('2.11', 'Obtain all Subcontractor COI prior to MOB', 'JOB_STARTUP', 'SUBCONTRACTOR_MANAGEMENT', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'PA', 'DAYS_BEFORE_MOBILIZATION', -3, true, { evidenceTypes: ['COI_DOCUMENT'] }),
  t('2.12', 'Provide Owner COI', 'JOB_STARTUP', 'OWNER_COORDINATION', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'PM', 'ON_CONTRACT_EXECUTION', null, true, { evidenceTypes: ['COI_DOCUMENT'] }),
  t('2.13', 'Complete & Record NOC', 'JOB_STARTUP', 'LEGAL_AND_NOTICE', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'PA', 'ON_CONTRACT_EXECUTION', null, true, { evidenceTypes: ['RECORDED_DOCUMENT'] }),
  t('2.14', 'Set up Job Files', 'JOB_STARTUP', 'ADMIN_SETUP', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PA', 'ON_PROJECT_CREATION', null, false),
  t('2.15', 'Set up Management Plan & Logistics Plan', 'JOB_STARTUP', 'SCHEDULE_AND_PLANNING', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'PM', 'DAYS_BEFORE_MOBILIZATION', -14, false, { evidenceTypes: ['PLAN_OR_DOCUMENT'] }),
  t('2.16', 'Prepare Project Schedule', 'JOB_STARTUP', 'SCHEDULE_AND_PLANNING', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'PM', 'DAYS_BEFORE_MOBILIZATION', -14, false, { evidenceTypes: ['SCHEDULE_FILE'] }),
  t('2.17', 'Complete Submittal Register', 'JOB_STARTUP', 'ADMIN_SETUP', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PA', 'DAYS_BEFORE_MOBILIZATION', -14, false, { dependsOnTaskNumbers: ['2.4'], evidenceTypes: ['SYSTEM_SCREENSHOT'] }),
  t('2.18', 'Enter items in Job Close-out', 'JOB_STARTUP', 'ADMIN_SETUP', 'STANDARD', 'ADVISORY', 'PA', 'DAYS_BEFORE_MOBILIZATION', -14, false),
  t('2.19', 'Pre-Construction meeting City/County', 'JOB_STARTUP', 'OWNER_COORDINATION', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PM', 'DAYS_BEFORE_MOBILIZATION', -7, false, { evidenceTypes: ['MEETING_MINUTES'] }),
  t('2.20', 'Pre-Construction Meeting Owner', 'JOB_STARTUP', 'OWNER_COORDINATION', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PM', 'DAYS_BEFORE_MOBILIZATION', -7, false, { evidenceTypes: ['MEETING_MINUTES'] }),
  t('2.21', 'Verify Owner provided Threshold & Testing company', 'JOB_STARTUP', 'OWNER_COORDINATION', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PM', 'DAYS_BEFORE_MOBILIZATION', -14, true),
  t('2.22', 'Verify need for Photo/Video Surveys', 'JOB_STARTUP', 'LEGAL_AND_NOTICE', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PM', 'DAYS_BEFORE_MOBILIZATION', -14, false),
  t('2.23', 'Verify need for vibration monitoring', 'JOB_STARTUP', 'SITE_SERVICES', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', -14, false),
  t('2.24', 'Write Subcontracts in Procore', 'JOB_STARTUP', 'SUBCONTRACTOR_MANAGEMENT', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PM', 'DAYS_BEFORE_MOBILIZATION', -14, false, { dependsOnTaskNumbers: ['2.4'] }),
  t('2.25', 'Confirm review of estimate & Sub proposals', 'JOB_STARTUP', 'SUBCONTRACTOR_MANAGEMENT', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PM', 'DAYS_BEFORE_MOBILIZATION', -14, false),
  t('2.26', 'Create buyout tracking log', 'JOB_STARTUP', 'FINANCIAL_SETUP', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PM', 'DAYS_BEFORE_MOBILIZATION', -14, false),
  t('2.27', 'Prepare PR announcements', 'JOB_STARTUP', 'COMMUNITY_AND_EXTERNAL', 'STANDARD', 'ADVISORY', 'PA', 'NONE', null, true),
  t('2.28', 'Create, record & track NTO', 'JOB_STARTUP', 'LEGAL_AND_NOTICE', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'PA', 'ON_NTP_ISSUED', null, true, { dependsOnTaskNumbers: ['2.13'], evidenceTypes: ['RECORDED_DOCUMENT'] }),
  t('2.29', 'Mail NTO (Certified Mail)', 'JOB_STARTUP', 'LEGAL_AND_NOTICE', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'PA', 'ON_NTP_ISSUED', null, true, { evidenceTypes: ['CORRESPONDENCE'] }),
  t('2.30', 'Verify Owner Builder\'s Risk Insurance', 'JOB_STARTUP', 'CONTRACTUAL_OBLIGATION', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'PM', 'ON_CONTRACT_EXECUTION', null, true, { evidenceTypes: ['COI_DOCUMENT'] }),
  t('2.31', 'Provide Superintendent Safety Plan & SDS', 'JOB_STARTUP', 'SAFETY_COORDINATION', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'SAFETY_MANAGER', 'DAYS_BEFORE_MOBILIZATION', -3, true, { evidenceTypes: ['PLAN_OR_DOCUMENT'] }),
  t('2.32', 'Contact Utilities', 'JOB_STARTUP', 'SITE_SERVICES', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', -14, false),
  t('2.33', 'Consider community awareness program', 'JOB_STARTUP', 'COMMUNITY_AND_EXTERNAL', 'STANDARD', 'ADVISORY', 'PM', 'NONE', null, true),
];

// -- Section 3 — Order Services and Equipment (6 tasks, T03 §12) -----------

export const STARTUP_SECTION_3_TEMPLATES: ReadonlyArray<TemplateEntry> = [
  t('3.1', 'Telephone/Internet', 'ORDER_SERVICES', 'SITE_SERVICES', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'PA', 'DAYS_BEFORE_MOBILIZATION', -14, true),
  t('3.2', 'Sanitary', 'ORDER_SERVICES', 'SITE_SERVICES', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', -3, true),
  t('3.3', 'Field Office', 'ORDER_SERVICES', 'SITE_SERVICES', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', -14, true),
  t('3.4', 'Job Office Trailer', 'ORDER_SERVICES', 'SITE_SERVICES', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', -14, true),
  t('3.5', 'First Aid Kit & Fire Extinguishers', 'ORDER_SERVICES', 'SAFETY_COORDINATION', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', -3, true),
  t('3.6', 'Other', 'ORDER_SERVICES', 'SITE_SERVICES', 'STANDARD', 'ADVISORY', 'PM', 'NONE', null, true),
];

// -- Section 4 — Permits Posted on Jobsite (12 tasks, T03 §12) -------------

export const STARTUP_SECTION_4_TEMPLATES: ReadonlyArray<TemplateEntry> = [
  t('4.01', 'Master permit', 'PERMIT_POSTING', 'PERMIT_POSTING', 'CRITICAL', 'BLOCKS_CERTIFICATION', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', 0, true, { evidenceTypes: ['PERMIT_COPY'] }),
  t('4.02', 'Roofing permit', 'PERMIT_POSTING', 'PERMIT_POSTING', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', 0, true, { evidenceTypes: ['PERMIT_COPY'], applicabilityNote: 'NA if project scope does not include roofing' }),
  t('4.03', 'Plumbing permit', 'PERMIT_POSTING', 'PERMIT_POSTING', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', 0, true, { evidenceTypes: ['PERMIT_COPY'], applicabilityNote: 'NA if project scope does not include plumbing' }),
  t('4.04', 'HVAC permit', 'PERMIT_POSTING', 'PERMIT_POSTING', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', 0, true, { evidenceTypes: ['PERMIT_COPY'], applicabilityNote: 'NA if project scope does not include HVAC' }),
  t('4.05', 'Electric permit', 'PERMIT_POSTING', 'PERMIT_POSTING', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', 0, true, { evidenceTypes: ['PERMIT_COPY'], applicabilityNote: 'NA if project scope does not include electrical' }),
  t('4.06', 'Fire Alarm permit', 'PERMIT_POSTING', 'PERMIT_POSTING', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', 0, true, { evidenceTypes: ['PERMIT_COPY'], applicabilityNote: 'NA if project scope does not include fire alarm' }),
  t('4.07', 'Fire Sprinklers permit', 'PERMIT_POSTING', 'PERMIT_POSTING', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', 0, true, { evidenceTypes: ['PERMIT_COPY'], applicabilityNote: 'NA if project scope does not include fire sprinklers' }),
  t('4.08', 'Elevator permit', 'PERMIT_POSTING', 'PERMIT_POSTING', 'STANDARD', 'ADVISORY', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', 0, true, { evidenceTypes: ['PERMIT_COPY'], applicabilityNote: 'NA if project scope does not include elevator' }),
  t('4.09', 'Irrigation permit', 'PERMIT_POSTING', 'PERMIT_POSTING', 'STANDARD', 'ADVISORY', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', 0, true, { evidenceTypes: ['PERMIT_COPY'], applicabilityNote: 'NA if project scope does not include irrigation' }),
  t('4.10', 'Low Voltage permit', 'PERMIT_POSTING', 'PERMIT_POSTING', 'STANDARD', 'ADVISORY', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', 0, true, { evidenceTypes: ['PERMIT_COPY'], applicabilityNote: 'NA if project scope does not include low voltage' }),
  t('4.11', 'Site-Utilities permits', 'PERMIT_POSTING', 'PERMIT_POSTING', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', 0, true, { evidenceTypes: ['PERMIT_COPY'] }),
  t('4.12', 'Right of way, FDOT, MOT plans', 'PERMIT_POSTING', 'PERMIT_POSTING', 'HIGH', 'REQUIRES_BLOCKER_IF_OPEN', 'SUPERINTENDENT', 'DAYS_BEFORE_MOBILIZATION', 0, true, { evidenceTypes: ['PERMIT_COPY'], applicabilityNote: 'NA if project does not involve public right of way' }),
];

// -- Combined Template Catalog (55 tasks) -----------------------------------

export const STARTUP_ALL_TASK_TEMPLATES: ReadonlyArray<TemplateEntry> = [
  ...STARTUP_SECTION_1_TEMPLATES,
  ...STARTUP_SECTION_2_TEMPLATES,
  ...STARTUP_SECTION_3_TEMPLATES,
  ...STARTUP_SECTION_4_TEMPLATES,
];

// -- Key Dependency Chains (T03 §5.2) ----------------------------------------

export const STARTUP_TASK_DEPENDENCIES: ReadonlyArray<IStartupTaskDependency> = [
  { taskNumber: '2.6', dependsOn: ['2.3'], rationale: 'Cannot roll budget if project not in Accounting' },
  { taskNumber: '2.7', dependsOn: ['2.4', '2.6'], rationale: 'Cannot roll to Procore if Procore not set up or Accounting budget not ready' },
  { taskNumber: '2.17', dependsOn: ['2.4'], rationale: 'Procore must exist before submittals entered' },
  { taskNumber: '2.24', dependsOn: ['2.4'], rationale: 'Procore must exist before subcontracts entered' },
  { taskNumber: '2.28', dependsOn: ['2.13'], rationale: 'NTO sequence typically follows NOC' },
];

// -- Stage 2 Activity Spine Events (T10 §2 Stage 2) -------------------------

export const STAGE2_ACTIVITY_EVENTS = [
  'StartupTaskLibraryActivated', 'StartupTaskInstanceUpdated',
  'TaskBlockerCreated', 'TaskBlockerResolved',
] as const satisfies ReadonlyArray<Stage2ActivityEvent>;

export const STAGE2_ACTIVITY_EVENT_DEFINITIONS: ReadonlyArray<IStage2ActivityEventDef> = [
  { event: 'StartupTaskLibraryActivated', description: 'Task library instantiated from governed template catalog for project' },
  { event: 'StartupTaskInstanceUpdated', description: 'Task instance result, notes, or evidence changed' },
  { event: 'TaskBlockerCreated', description: 'New task-level blocker raised (auto or manual)' },
  { event: 'TaskBlockerResolved', description: 'Task blocker resolved or waived' },
];

// -- Stage 2 Health Spine Metrics (T10 §2 Stage 2) --------------------------

export const STAGE2_HEALTH_METRICS = [
  'startupTaskCompletionRate', 'startupOpenTaskBlockerCount',
] as const satisfies ReadonlyArray<Stage2HealthMetric>;

export const STAGE2_HEALTH_METRIC_DEFINITIONS: ReadonlyArray<IStage2HealthMetricDef> = [
  { metric: 'startupTaskCompletionRate', description: 'Percentage of task instances with result = YES (NA excluded from denominator)' },
  { metric: 'startupOpenTaskBlockerCount', description: 'Count of TaskBlockers with blockerStatus = OPEN' },
];

// -- Stage 2 Work Queue Items (T10 §2 Stage 2) ------------------------------

export const STAGE2_WORK_QUEUE_ITEMS = [
  'CriticalTaskUnstarted', 'TaskBlockerOpen',
] as const satisfies ReadonlyArray<Stage2WorkQueueItem>;

export const STAGE2_WORK_QUEUE_ITEM_DEFINITIONS: ReadonlyArray<IStage2WorkQueueItemDef> = [
  { item: 'CriticalTaskUnstarted', description: 'Critical task still unstarted during active planning' },
  { item: 'TaskBlockerOpen', description: 'Open blocker assigned to responsible party' },
];

// -- Immutable Template Fields (T03 §2) --------------------------------------

export const IMMUTABLE_TEMPLATE_FIELDS: ReadonlyArray<string> = [
  'taskNumber', 'title', 'sectionCode', 'category', 'severity',
  'gatingImpact', 'ownerRoleCode', 'activeDuringStabilization',
];

// -- Label Maps ---------------------------------------------------------------

export const STARTUP_TASK_SECTION_LABELS: Readonly<Record<StartupTaskSectionCode, string>> = {
  REVIEW_OWNER_CONTRACT: "Section 1 — Review Owner's Contract",
  JOB_STARTUP: 'Section 2 — Job Start-Up',
  ORDER_SERVICES: 'Section 3 — Order Services and Equipment',
  PERMIT_POSTING: 'Section 4 — Permits Posted on Jobsite',
};

export const STARTUP_TASK_CATEGORY_LABELS: Readonly<Record<StartupTaskCategory, string>> = {
  CONTRACTUAL_OBLIGATION: 'Contractual Obligation Review',
  ADMIN_SETUP: 'Administrative Setup',
  FINANCIAL_SETUP: 'Financial Setup',
  SUBCONTRACTOR_MANAGEMENT: 'Subcontractor Management',
  OWNER_COORDINATION: 'Owner Coordination',
  LEGAL_AND_NOTICE: 'Legal and Notice',
  SITE_SERVICES: 'Site Services and Equipment',
  SCHEDULE_AND_PLANNING: 'Schedule and Planning',
  TEAM_SETUP: 'Team Setup',
  SAFETY_COORDINATION: 'Safety Coordination',
  COMMUNITY_AND_EXTERNAL: 'Community and External Relations',
  PERMIT_POSTING: 'Permit Posting Verification',
};

export const STARTUP_TASK_SEVERITY_LABELS: Readonly<Record<StartupTaskSeverity, string>> = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  STANDARD: 'Standard',
};

export const STARTUP_TASK_GATING_IMPACT_LABELS: Readonly<Record<StartupTaskGatingImpact, string>> = {
  BLOCKS_CERTIFICATION: 'Blocks Certification',
  REQUIRES_BLOCKER_IF_OPEN: 'Requires Blocker if Open',
  ADVISORY: 'Advisory',
};

export const STARTUP_TASK_OWNER_ROLE_LABELS: Readonly<Record<StartupTaskOwnerRole, string>> = {
  PM: 'Project Manager',
  PA: 'Project Administrator',
  PROJ_ACCT: 'Project Accountant',
  PX: 'Project Executive',
  SUPERINTENDENT: 'Lead Superintendent',
  SAFETY_MANAGER: 'Safety Manager',
};

export const STARTUP_TASK_DUE_TRIGGER_LABELS: Readonly<Record<StartupTaskDueTrigger, string>> = {
  ON_PROJECT_CREATION: 'On Project Creation',
  ON_CONTRACT_EXECUTION: 'On Contract Execution',
  ON_NTP_ISSUED: 'On NTP Issued',
  DAYS_BEFORE_MOBILIZATION: 'Days Before Mobilization',
  NONE: 'None',
};

export const TASK_BLOCKER_TYPE_LABELS: Readonly<Record<TaskBlockerType, string>> = {
  PENDING_OWNER_ACTION: 'Pending Owner Action',
  PENDING_PERMIT: 'Pending Permit',
  PENDING_SUBCONTRACTOR_COI: 'Pending Subcontractor COI',
  PENDING_INTERNAL_SETUP: 'Pending Internal Setup',
  PENDING_INFORMATION: 'Pending Information',
  PENDING_SYSTEM_SETUP: 'Pending System Setup',
  DEPENDENCY_UNSATISFIED: 'Dependency Unsatisfied',
  OTHER: 'Other',
};

export const STARTUP_TASK_EVIDENCE_TYPE_LABELS: Readonly<Record<StartupTaskEvidenceType, string>> = {
  COI_DOCUMENT: 'Certificate of Insurance',
  EXECUTED_DOCUMENT: 'Executed Document',
  RECORDED_DOCUMENT: 'Recorded Legal Document',
  SYSTEM_SCREENSHOT: 'System Setup Confirmation',
  PERMIT_COPY: 'Permit Copy',
  MEETING_MINUTES: 'Meeting Minutes',
  SCHEDULE_FILE: 'Schedule File',
  PLAN_OR_DOCUMENT: 'Plan or Document',
  CORRESPONDENCE: 'Correspondence',
};
