/**
 * P3-E10-T04 Closeout Lifecycle State Machine constants.
 * States, transitions, milestones, archive-ready gate, approvals, work queue.
 */

import type {
  CloseoutFullMilestoneKey,
  CloseoutLifecycleLayer,
  CloseoutLifecycleState,
  CloseoutMilestoneEvidenceType,
  CloseoutMilestoneStatus,
  CloseoutTransitionTriggerType,
} from './enums.js';
import type {
  IArchiveReadyCriterion,
  ICloseoutLifecycleStateDefinition,
  ICloseoutMilestoneDefinition,
  ICloseoutStateTransition,
  IPEApprovalAction,
  IWorkQueueTrigger,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------

export const CLOSEOUT_LIFECYCLE_STATES = [
  'NOT_STARTED', 'ACTIVATED', 'IN_PROGRESS', 'INSPECTIONS_CLEARED',
  'TURNOVER_COMPLETE', 'OWNER_ACCEPTANCE', 'FINAL_COMPLETION',
  'ARCHIVE_READY', 'ARCHIVED',
] as const satisfies ReadonlyArray<CloseoutLifecycleState>;

export const CLOSEOUT_MILESTONE_STATUSES = [
  'PENDING', 'EVIDENCE_PENDING', 'READY_FOR_APPROVAL', 'APPROVED', 'BYPASSED',
] as const satisfies ReadonlyArray<CloseoutMilestoneStatus>;

export const CLOSEOUT_MILESTONE_EVIDENCE_TYPES = [
  'System', 'ChecklistItem', 'ChecklistSection',
  'DocumentAttachment', 'CrossModuleSignal', 'SubsurfaceApproved',
] as const satisfies ReadonlyArray<CloseoutMilestoneEvidenceType>;

export const CLOSEOUT_FULL_MILESTONE_KEYS = [
  'CHECKLIST_ACTIVATED', 'TASKS_COMPLETE', 'DOCUMENTS_COMPLETE', 'CO_OBTAINED',
  'TURNOVER_COMPLETE', 'OWNER_ACCEPTANCE', 'LIENS_RELEASED', 'FILES_RETURNED',
  'FINAL_COMPLETION', 'SCORECARDS_COMPLETE', 'LESSONS_APPROVED',
  'AUTOPSY_COMPLETE', 'ARCHIVE_READY',
] as const satisfies ReadonlyArray<CloseoutFullMilestoneKey>;

export const CLOSEOUT_LIFECYCLE_LAYERS = [
  'ProjectLevel', 'ItemLevel',
] as const satisfies ReadonlyArray<CloseoutLifecycleLayer>;

export const CLOSEOUT_TRANSITION_TRIGGER_TYPES = [
  'System', 'PMAction', 'PEAction',
] as const satisfies ReadonlyArray<CloseoutTransitionTriggerType>;

// -- Lifecycle State Definitions (§2.1) -------------------------------------

export const CLOSEOUT_LIFECYCLE_STATE_DEFINITIONS: ReadonlyArray<ICloseoutLifecycleStateDefinition> = [
  { state: 'NOT_STARTED', code: 'NOT_STARTED', description: 'Checklist not instantiated; no work started' },
  { state: 'ACTIVATED', code: 'ACTIVATED', description: 'Checklist instantiated; work may begin; no items resolved' },
  { state: 'IN_PROGRESS', code: 'IN_PROGRESS', description: 'At least one item resolved Yes/No/NA' },
  { state: 'INSPECTIONS_CLEARED', code: 'INSPECTIONS_CLEARED', description: 'All final inspections done; C.O. obtained; item 3.11 = Yes' },
  { state: 'TURNOVER_COMPLETE', code: 'TURNOVER_COMPLETE', description: 'Section 4 complete; owner turnover package delivered' },
  { state: 'OWNER_ACCEPTANCE', code: 'OWNER_ACCEPTANCE', description: 'Owner formally accepted; evidence required; PE approval required' },
  { state: 'FINAL_COMPLETION', code: 'FINAL_COMPLETION', description: 'All contractual obligations met; final payment received; liens released' },
  { state: 'ARCHIVE_READY', code: 'ARCHIVE_READY', description: 'All Closeout sub-surfaces PE-approved; all gates met; PE approval required' },
  { state: 'ARCHIVED', code: 'ARCHIVED', description: 'Project fully archived; intelligence published; records immutable' },
];

// -- State Transitions (§2.2) -----------------------------------------------

export const CLOSEOUT_STATE_TRANSITIONS: ReadonlyArray<ICloseoutStateTransition> = [
  { from: 'NOT_STARTED', to: 'ACTIVATED', triggerType: 'System', triggerCondition: 'Closeout phase activated on project', peApprovalRequired: false },
  { from: 'ACTIVATED', to: 'IN_PROGRESS', triggerType: 'System', triggerCondition: 'First item result changes to Yes/No/NA', peApprovalRequired: false },
  { from: 'IN_PROGRESS', to: 'INSPECTIONS_CLEARED', triggerType: 'System', triggerCondition: 'Item 3.11 = Yes with itemDate present', peApprovalRequired: false },
  { from: 'INSPECTIONS_CLEARED', to: 'TURNOVER_COMPLETE', triggerType: 'System', triggerCondition: 'Section 4 sectionCompletionPercentage = 100%', peApprovalRequired: false },
  { from: 'TURNOVER_COMPLETE', to: 'OWNER_ACCEPTANCE', triggerType: 'PMAction', triggerCondition: 'PM submits Owner acceptance evidence; PE approves', peApprovalRequired: true },
  { from: 'OWNER_ACCEPTANCE', to: 'FINAL_COMPLETION', triggerType: 'System', triggerCondition: 'Item 4.15 = Yes AND Financial module final payment signal received', peApprovalRequired: false },
  { from: 'FINAL_COMPLETION', to: 'ARCHIVE_READY', triggerType: 'PMAction', triggerCondition: 'PM requests; all 8 archive-ready criteria met; PE approves', peApprovalRequired: true },
  { from: 'ARCHIVE_READY', to: 'ARCHIVED', triggerType: 'PEAction', triggerCondition: 'PE triggers archive; all publication events fire', peApprovalRequired: true },
];

// -- Milestone Definitions (§4.2) -------------------------------------------

export const CLOSEOUT_MILESTONE_DEFINITIONS: ReadonlyArray<ICloseoutMilestoneDefinition> = [
  { key: 'CHECKLIST_ACTIVATED', label: 'Checklist Activated', advancesTo: 'ACTIVATED', evidenceType: 'System', externalDependency: false, peApprovalRequired: false },
  { key: 'TASKS_COMPLETE', label: 'All Tasks Complete', advancesTo: null, evidenceType: 'ChecklistSection', externalDependency: false, peApprovalRequired: false },
  { key: 'DOCUMENTS_COMPLETE', label: 'Key Documents Complete', advancesTo: null, evidenceType: 'ChecklistItem', externalDependency: false, peApprovalRequired: false },
  { key: 'CO_OBTAINED', label: 'Certificate of Occupancy Obtained', advancesTo: 'INSPECTIONS_CLEARED', evidenceType: 'ChecklistItem', externalDependency: true, peApprovalRequired: false },
  { key: 'TURNOVER_COMPLETE', label: 'Owner Turnover Complete', advancesTo: 'TURNOVER_COMPLETE', evidenceType: 'ChecklistSection', externalDependency: false, peApprovalRequired: false },
  { key: 'OWNER_ACCEPTANCE', label: 'Owner Formal Acceptance', advancesTo: 'OWNER_ACCEPTANCE', evidenceType: 'DocumentAttachment', externalDependency: true, peApprovalRequired: true },
  { key: 'LIENS_RELEASED', label: 'All Liens Released', advancesTo: null, evidenceType: 'ChecklistItem', externalDependency: false, peApprovalRequired: false },
  { key: 'FILES_RETURNED', label: 'Files Returned to Estimator', advancesTo: null, evidenceType: 'ChecklistItem', externalDependency: false, peApprovalRequired: false },
  { key: 'FINAL_COMPLETION', label: 'Final Completion', advancesTo: 'FINAL_COMPLETION', evidenceType: 'CrossModuleSignal', externalDependency: false, peApprovalRequired: false },
  { key: 'SCORECARDS_COMPLETE', label: 'All Sub Scorecards PE-Approved', advancesTo: null, evidenceType: 'SubsurfaceApproved', externalDependency: false, peApprovalRequired: false },
  { key: 'LESSONS_APPROVED', label: 'Lessons Report PE-Approved', advancesTo: null, evidenceType: 'SubsurfaceApproved', externalDependency: false, peApprovalRequired: false },
  { key: 'AUTOPSY_COMPLETE', label: 'Autopsy PE-Approved', advancesTo: null, evidenceType: 'SubsurfaceApproved', externalDependency: false, peApprovalRequired: false },
  { key: 'ARCHIVE_READY', label: 'Archive Ready', advancesTo: 'ARCHIVE_READY', evidenceType: 'System', externalDependency: false, peApprovalRequired: true },
];

// -- Archive-Ready Gate (§4.3) — 8 Criteria ---------------------------------

export const CLOSEOUT_ARCHIVE_READY_CRITERIA: ReadonlyArray<IArchiveReadyCriterion> = [
  { criterionNumber: 1, description: 'Overall checklist completion >= 100% (or all remaining items = NA with justification)', checkMechanism: 'completionPercentage = 100 OR all non-Yes items have result = NA AND naJustification present' },
  { criterionNumber: 2, description: 'Section 6 all 5 items = Yes (including integration-driven items 6.3, 6.4, 6.5)', checkMechanism: 'Section 6 sectionCompletionPercentage = 100' },
  { criterionNumber: 3, description: 'C.O. obtained', checkMechanism: 'Item 3.11 = Yes with itemDate' },
  { criterionNumber: 4, description: 'All liens released', checkMechanism: 'Item 4.15 = Yes' },
  { criterionNumber: 5, description: 'All registered subs have PE-approved FinalCloseout scorecard', checkMechanism: 'SCORECARDS_COMPLETE milestone = APPROVED' },
  { criterionNumber: 6, description: 'LessonsLearningReport PE-approved', checkMechanism: 'LESSONS_APPROVED milestone = APPROVED' },
  { criterionNumber: 7, description: 'AutopsyRecord PE-approved', checkMechanism: 'AUTOPSY_COMPLETE milestone = APPROVED' },
  { criterionNumber: 8, description: 'Financial module final payment signal received', checkMechanism: 'Cross-module signal present: financialFinalPaymentConfirmed = true' },
];

// -- PE Approval Authority Matrix (§5) — 12 rows ----------------------------

export const CLOSEOUT_PE_APPROVAL_MATRIX: ReadonlyArray<IPEApprovalAction> = [
  { action: 'Mark checklist items Yes/No/NA', pmAuthority: 'Yes', suptAuthority: 'Yes (within scope)', peAuthority: 'Annotate only' },
  { action: 'Add overlay items', pmAuthority: 'Yes', suptAuthority: 'No', peAuthority: 'No' },
  { action: 'Advance to INSPECTIONS_CLEARED', pmAuthority: 'Automatic', suptAuthority: '—', peAuthority: 'Alerted' },
  { action: 'Advance to TURNOVER_COMPLETE', pmAuthority: 'Automatic', suptAuthority: '—', peAuthority: '—' },
  { action: 'Advance to OWNER_ACCEPTANCE', pmAuthority: 'Submit evidence', suptAuthority: '—', peAuthority: 'Approve' },
  { action: 'Approve FinalCloseout scorecard for publication', pmAuthority: 'No', suptAuthority: 'No', peAuthority: 'Yes' },
  { action: 'Approve LessonsLearningReport for publication', pmAuthority: 'No', suptAuthority: 'No', peAuthority: 'Yes' },
  { action: 'Approve AutopsyRecord', pmAuthority: 'No', suptAuthority: 'No', peAuthority: 'Yes' },
  { action: 'Approve individual LearningLegacyOutput', pmAuthority: 'No', suptAuthority: 'No', peAuthority: 'Yes' },
  { action: 'Approve ARCHIVE_READY', pmAuthority: 'No', suptAuthority: 'No', peAuthority: 'Yes' },
  { action: 'Trigger ARCHIVED', pmAuthority: 'No', suptAuthority: 'No', peAuthority: 'Yes' },
  { action: 'Request revision on any submitted record', pmAuthority: 'No', suptAuthority: 'No', peAuthority: 'Yes' },
];

// -- Work Queue Triggers (§7) — 8 rules ------------------------------------

export const CLOSEOUT_WORK_QUEUE_TRIGGERS: ReadonlyArray<IWorkQueueTrigger> = [
  { trigger: 'Item 3.11 not Yes and project in IN_PROGRESS for > 60 days', workQueueItem: 'C.O. not yet obtained', assignee: 'PM', priority: 'High', autoCloseWhen: 'Item 3.11 = Yes' },
  { trigger: 'Item 4.14 calculatedDate within 14 days and item 4.15 ≠ Yes', workQueueItem: 'Lien deadline approaching', assignee: 'PM', priority: 'Critical', autoCloseWhen: 'Item 4.15 = Yes' },
  { trigger: 'Item 4.14 calculatedDate passed and item 4.15 ≠ Yes', workQueueItem: 'Lien deadline missed', assignee: 'PM', priority: 'Critical', autoCloseWhen: 'Item 4.15 = Yes' },
  { trigger: '30+ days in FINAL_COMPLETION with no scorecard PE_APPROVED', workQueueItem: 'Subcontractor evaluations overdue', assignee: 'PM', priority: 'Medium', autoCloseWhen: 'All subs PE_APPROVED' },
  { trigger: '45+ days in FINAL_COMPLETION with LessonsLearningReport = Draft', workQueueItem: 'Lessons not submitted', assignee: 'PM', priority: 'Medium', autoCloseWhen: 'Report submitted' },
  { trigger: 'All 8 Archive-Ready criteria pass', workQueueItem: 'Archive Ready — PE approval needed', assignee: 'PE', priority: 'High', autoCloseWhen: 'Milestone approved or declined' },
  { trigger: 'OWNER_ACCEPTANCE evidence submitted', workQueueItem: 'Owner Acceptance evidence — PE review needed', assignee: 'PE', priority: 'High', autoCloseWhen: 'Milestone approved or declined' },
  { trigger: 'Any submitted scorecard awaiting PE review', workQueueItem: 'Scorecard needs PE review', assignee: 'PE', priority: 'Medium', autoCloseWhen: 'Scorecard approved or revision requested' },
];

// -- Label Maps -------------------------------------------------------------

export const CLOSEOUT_LIFECYCLE_STATE_LABELS: Readonly<Record<CloseoutLifecycleState, string>> = {
  NOT_STARTED: 'Not Started',
  ACTIVATED: 'Activated',
  IN_PROGRESS: 'In Progress',
  INSPECTIONS_CLEARED: 'Inspections Cleared',
  TURNOVER_COMPLETE: 'Turnover Complete',
  OWNER_ACCEPTANCE: 'Owner Acceptance',
  FINAL_COMPLETION: 'Final Completion',
  ARCHIVE_READY: 'Archive Ready',
  ARCHIVED: 'Archived',
};

export const CLOSEOUT_MILESTONE_STATUS_LABELS: Readonly<Record<CloseoutMilestoneStatus, string>> = {
  PENDING: 'Pending',
  EVIDENCE_PENDING: 'Evidence Pending',
  READY_FOR_APPROVAL: 'Ready for Approval',
  APPROVED: 'Approved',
  BYPASSED: 'Bypassed',
};

export const CLOSEOUT_FULL_MILESTONE_KEY_LABELS: Readonly<Record<CloseoutFullMilestoneKey, string>> = {
  CHECKLIST_ACTIVATED: 'Checklist Activated',
  TASKS_COMPLETE: 'All Tasks Complete',
  DOCUMENTS_COMPLETE: 'Key Documents Complete',
  CO_OBTAINED: 'Certificate of Occupancy Obtained',
  TURNOVER_COMPLETE: 'Owner Turnover Complete',
  OWNER_ACCEPTANCE: 'Owner Formal Acceptance',
  LIENS_RELEASED: 'All Liens Released',
  FILES_RETURNED: 'Files Returned to Estimator',
  FINAL_COMPLETION: 'Final Completion',
  SCORECARDS_COMPLETE: 'All Sub Scorecards PE-Approved',
  LESSONS_APPROVED: 'Lessons Report PE-Approved',
  AUTOPSY_COMPLETE: 'Autopsy PE-Approved',
  ARCHIVE_READY: 'Archive Ready',
};
