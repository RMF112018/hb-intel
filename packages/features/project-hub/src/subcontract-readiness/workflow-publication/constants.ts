/**
 * P3-E13-T08 Stage 5 Subcontract Execution Readiness Module workflow-publication constants.
 * Workflow stages, timers, routed outputs, publications, shared packages.
 */

import type {
  ProhibitedLocalSubstitute,
  ReadinessActivityEventType,
  ReadinessEscalationType,
  ReadinessHealthMetricType,
  ReadinessNotificationType,
  ReadinessRelatedItemType,
  ReadinessTimerType,
  ReadinessWorkflowStage,
  ReadinessWorkItemType,
  ReadinessWorkQueueType,
  RequiredSharedPackage,
} from './enums.js';
import type {
  IProhibitedLocalSubstituteDef,
  IReadinessActivityEventDef,
  IReadinessEscalationDef,
  IReadinessHealthMetricDef,
  IReadinessNotificationDef,
  IReadinessRelatedItemDef,
  IReadinessTimerDef,
  IReadinessWorkItemDef,
  IReadinessWorkQueueDef,
  ISharedPackageRequirement,
} from './types.js';

// -- Enum Arrays ----------------------------------------------------------------

export const READINESS_WORKFLOW_STAGES = [
  'CASE_ASSEMBLED', 'SUBMITTED_FOR_REVIEW', 'EVALUATION_IN_PROGRESS',
  'DEFICIENCY_RESPONSE_PENDING', 'EXCEPTION_HANDLING_IN_PROGRESS',
  'DECISION_ELIGIBLE', 'DECISION_ISSUED', 'RENEWAL_IN_CASE', 'SUPERSEDE_VOID_SUCCESSOR',
] as const satisfies ReadonlyArray<ReadinessWorkflowStage>;

export const READINESS_TIMER_TYPES = [
  'MISSING_PACKAGE_ITEM', 'PENDING_EVALUATOR_REVIEW', 'PENDING_EXCEPTION_APPROVAL',
  'UPCOMING_EXPIRATION_OR_RENEWAL', 'STALE_DECISION_NEAR_EXECUTION',
] as const satisfies ReadonlyArray<ReadinessTimerType>;

export const READINESS_WORK_ITEM_TYPES = [
  'PACKAGE_ASSEMBLY_MISSING', 'EVALUATOR_REVIEW_DUE', 'EVALUATOR_REVIEW_OVERDUE',
  'EXCEPTION_APPROVAL_PENDING', 'EXCEPTION_APPROVAL_OVERDUE',
  'RENEWAL_DUE', 'BLOCKED_EXECUTION',
] as const satisfies ReadonlyArray<ReadinessWorkItemType>;

export const READINESS_NOTIFICATION_TYPES = [
  'APPROACHING_TIMER_THRESHOLD', 'OVERDUE_SPECIALIST_REVIEW',
  'OVERDUE_REQUIRED_APPROVAL', 'UPCOMING_RENEWAL_EXPIRATION',
  'ISSUED_BLOCKED_DECISION', 'ISSUED_READY_DECISION',
] as const satisfies ReadonlyArray<ReadinessNotificationType>;

export const READINESS_ESCALATION_TYPES = [
  'OVERDUE_EVALUATOR_REVIEW', 'OVERDUE_REQUIRED_APPROVAL', 'STALE_READINESS_NEAR_EXECUTION',
] as const satisfies ReadonlyArray<ReadinessEscalationType>;

export const READINESS_ACTIVITY_EVENT_TYPES = [
  'CASE_CREATED', 'CASE_SUBMITTED', 'DEFICIENCY_ISSUED', 'DEFICIENCY_RESOLVED',
  'EXCEPTION_ITERATION_SUBMITTED', 'EXCEPTION_ACTION_TAKEN',
  'READINESS_DECISION_ISSUED', 'CASE_RENEWED', 'CASE_SUPERSEDED', 'CASE_VOIDED',
] as const satisfies ReadonlyArray<ReadinessActivityEventType>;

export const READINESS_WORK_QUEUE_TYPES = [
  'PACKAGE_ASSEMBLY_ACTION', 'EVALUATOR_REVIEW_ACTION',
  'EXCEPTION_APPROVAL_ACTION', 'RENEWAL_ACTION', 'BLOCKED_EXECUTION_ACTION',
] as const satisfies ReadonlyArray<ReadinessWorkQueueType>;

export const READINESS_HEALTH_METRIC_TYPES = [
  'BLOCKED_READINESS_COUNT', 'OVERDUE_REVIEW_COUNT', 'OVERDUE_APPROVAL_COUNT',
  'RENEWAL_DUE_COUNT', 'READY_FOR_EXECUTION_COUNT',
] as const satisfies ReadonlyArray<ReadinessHealthMetricType>;

export const READINESS_RELATED_ITEM_TYPES = [
  'BUYOUT_LINE_LINKAGE', 'ACTIVE_DECISION_LINKAGE', 'APPROVED_PRECEDENT_LINKAGE',
] as const satisfies ReadonlyArray<ReadinessRelatedItemType>;

export const REQUIRED_SHARED_PACKAGES = [
  '@hbc/workflow-handoff', '@hbc/field-annotations', '@hbc/related-items',
  '@hbc/acknowledgment', '@hbc/my-work-feed', '@hbc/notification-intelligence',
  '@hbc/bic-next-move', '@hbc/publish-workflow', '@hbc/versioned-record', '@hbc/session-state',
] as const satisfies ReadonlyArray<RequiredSharedPackage>;

export const PROHIBITED_LOCAL_SUBSTITUTES = [
  'LOCAL_REMINDER_TABLE', 'LOCAL_NOTIFICATION_SYSTEM', 'LOCAL_NEXT_MOVE_PROMPT',
  'BESPOKE_APPROVAL_ROUTING', 'LOCAL_ANNOTATION_STORE', 'LOCAL_HISTORY_SYSTEM',
] as const satisfies ReadonlyArray<ProhibitedLocalSubstitute>;

// -- Label Maps -----------------------------------------------------------------

export const READINESS_WORKFLOW_STAGE_LABELS: Readonly<Record<ReadinessWorkflowStage, string>> = {
  CASE_ASSEMBLED: 'Case assembled',
  SUBMITTED_FOR_REVIEW: 'Case submitted for specialist review',
  EVALUATION_IN_PROGRESS: 'Specialist evaluation in progress',
  DEFICIENCY_RESPONSE_PENDING: 'Deficiency response or renewal response pending',
  EXCEPTION_HANDLING_IN_PROGRESS: 'Exception handling in progress',
  DECISION_ELIGIBLE: 'Readiness decision eligible for issuance',
  DECISION_ISSUED: 'Readiness decision issued',
  RENEWAL_IN_CASE: 'Renewal / re-review in-case',
  SUPERSEDE_VOID_SUCCESSOR: 'Supersede / void and successor creation',
};

export const READINESS_TIMER_TYPE_LABELS: Readonly<Record<ReadinessTimerType, string>> = {
  MISSING_PACKAGE_ITEM: 'Missing Package Item',
  PENDING_EVALUATOR_REVIEW: 'Pending Evaluator Review',
  PENDING_EXCEPTION_APPROVAL: 'Pending Exception Approval',
  UPCOMING_EXPIRATION_OR_RENEWAL: 'Upcoming Expiration or Renewal',
  STALE_DECISION_NEAR_EXECUTION: 'Stale Decision Near Execution',
};

export const READINESS_ACTIVITY_EVENT_TYPE_LABELS: Readonly<Record<ReadinessActivityEventType, string>> = {
  CASE_CREATED: 'Case Created',
  CASE_SUBMITTED: 'Case Submitted',
  DEFICIENCY_ISSUED: 'Deficiency Issued',
  DEFICIENCY_RESOLVED: 'Deficiency Resolved',
  EXCEPTION_ITERATION_SUBMITTED: 'Exception Iteration Submitted',
  EXCEPTION_ACTION_TAKEN: 'Exception Action Taken',
  READINESS_DECISION_ISSUED: 'Readiness Decision Issued',
  CASE_RENEWED: 'Case Renewed',
  CASE_SUPERSEDED: 'Case Superseded',
  CASE_VOIDED: 'Case Voided',
};

export const READINESS_HEALTH_METRIC_TYPE_LABELS: Readonly<Record<ReadinessHealthMetricType, string>> = {
  BLOCKED_READINESS_COUNT: 'Blocked Readiness Count',
  OVERDUE_REVIEW_COUNT: 'Overdue Review Count',
  OVERDUE_APPROVAL_COUNT: 'Overdue Approval Count',
  RENEWAL_DUE_COUNT: 'Renewal Due Count',
  READY_FOR_EXECUTION_COUNT: 'Ready for Execution Count',
};

// -- Timer Definitions (T05 §2.1) ----------------------------------------------

export const READINESS_TIMER_DEFINITIONS: ReadonlyArray<IReadinessTimerDef> = [
  { timerType: 'MISSING_PACKAGE_ITEM', anchor: 'Case submitted or deficiency issued', primaryOutput: 'Routed reminder to PM / APM / PA' },
  { timerType: 'PENDING_EVALUATOR_REVIEW', anchor: 'Submission timestamp', primaryOutput: 'Evaluator review work item and escalation' },
  { timerType: 'PENDING_EXCEPTION_APPROVAL', anchor: 'Iteration submission timestamp', primaryOutput: 'Slot-owner work item and escalation' },
  { timerType: 'UPCOMING_EXPIRATION_OR_RENEWAL', anchor: 'Item expiration date', primaryOutput: 'Renewal work item and notification' },
  { timerType: 'STALE_DECISION_NEAR_EXECUTION', anchor: 'Planned execution date', primaryOutput: 'Risk / PM escalation where decision is not ready or not current' },
];

// -- Work Item Definitions (T05 §3.1) ------------------------------------------

export const READINESS_WORK_ITEM_DEFINITIONS: ReadonlyArray<IReadinessWorkItemDef> = [
  { workItemType: 'PACKAGE_ASSEMBLY_MISSING', description: 'Package assembly missing items' },
  { workItemType: 'EVALUATOR_REVIEW_DUE', description: 'Evaluator review due' },
  { workItemType: 'EVALUATOR_REVIEW_OVERDUE', description: 'Evaluator review overdue' },
  { workItemType: 'EXCEPTION_APPROVAL_PENDING', description: 'Exception approval pending' },
  { workItemType: 'EXCEPTION_APPROVAL_OVERDUE', description: 'Exception approval overdue' },
  { workItemType: 'RENEWAL_DUE', description: 'Renewal due' },
  { workItemType: 'BLOCKED_EXECUTION', description: 'Blocked execution' },
];

// -- Notification Definitions (T05 §3.2) ----------------------------------------

export const READINESS_NOTIFICATION_DEFINITIONS: ReadonlyArray<IReadinessNotificationDef> = [
  { notificationType: 'APPROACHING_TIMER_THRESHOLD', description: 'Approaching timer thresholds' },
  { notificationType: 'OVERDUE_SPECIALIST_REVIEW', description: 'Overdue specialist review' },
  { notificationType: 'OVERDUE_REQUIRED_APPROVAL', description: 'Overdue required approvals' },
  { notificationType: 'UPCOMING_RENEWAL_EXPIRATION', description: 'Upcoming renewals or expirations' },
  { notificationType: 'ISSUED_BLOCKED_DECISION', description: 'Issued blocked decisions' },
  { notificationType: 'ISSUED_READY_DECISION', description: 'Issued ready decisions where downstream teams need to act' },
];

// -- Escalation Definitions (T05 §3.3) -----------------------------------------

export const READINESS_ESCALATION_DEFINITIONS: ReadonlyArray<IReadinessEscalationDef> = [
  { escalationType: 'OVERDUE_EVALUATOR_REVIEW', target: 'Specialist owner / lead', description: 'Overdue evaluator review escalates to the specialist owner / lead' },
  { escalationType: 'OVERDUE_REQUIRED_APPROVAL', target: 'Preserved slot owner and policy-defined oversight role', description: 'Overdue required approval escalates to the preserved slot owner and policy-defined oversight role' },
  { escalationType: 'STALE_READINESS_NEAR_EXECUTION', target: 'PM / APM / PA and risk / compliance owners', description: 'Stale readiness near planned execution escalates to PM / APM / PA and risk / compliance owners' },
];

// -- Activity Event Definitions (T05 §4.1) --------------------------------------

export const READINESS_ACTIVITY_EVENT_DEFINITIONS: ReadonlyArray<IReadinessActivityEventDef> = [
  { eventType: 'CASE_CREATED', description: 'Readiness case created' },
  { eventType: 'CASE_SUBMITTED', description: 'Case submitted for specialist review' },
  { eventType: 'DEFICIENCY_ISSUED', description: 'Deficiency issued on a requirement item' },
  { eventType: 'DEFICIENCY_RESOLVED', description: 'Deficiency resolved on a requirement item' },
  { eventType: 'EXCEPTION_ITERATION_SUBMITTED', description: 'Exception iteration submitted' },
  { eventType: 'EXCEPTION_ACTION_TAKEN', description: 'Exception approval action taken' },
  { eventType: 'READINESS_DECISION_ISSUED', description: 'Readiness decision formally issued' },
  { eventType: 'CASE_RENEWED', description: 'Readiness case renewed in-case' },
  { eventType: 'CASE_SUPERSEDED', description: 'Readiness case superseded' },
  { eventType: 'CASE_VOIDED', description: 'Readiness case voided' },
];

// -- Work Queue Definitions (T05 §4.2) -----------------------------------------

export const READINESS_WORK_QUEUE_DEFINITIONS: ReadonlyArray<IReadinessWorkQueueDef> = [
  { workQueueType: 'PACKAGE_ASSEMBLY_ACTION', description: 'Package assembly action' },
  { workQueueType: 'EVALUATOR_REVIEW_ACTION', description: 'Evaluator review action' },
  { workQueueType: 'EXCEPTION_APPROVAL_ACTION', description: 'Exception approval action' },
  { workQueueType: 'RENEWAL_ACTION', description: 'Renewal action' },
  { workQueueType: 'BLOCKED_EXECUTION_ACTION', description: 'Blocked execution action' },
];

// -- Health Metric Definitions (T05 §4.3) ---------------------------------------

export const READINESS_HEALTH_METRIC_DEFINITIONS: ReadonlyArray<IReadinessHealthMetricDef> = [
  { metricType: 'BLOCKED_READINESS_COUNT', description: 'Blocked readiness count' },
  { metricType: 'OVERDUE_REVIEW_COUNT', description: 'Overdue review count' },
  { metricType: 'OVERDUE_APPROVAL_COUNT', description: 'Overdue approval count' },
  { metricType: 'RENEWAL_DUE_COUNT', description: 'Renewal-due count' },
  { metricType: 'READY_FOR_EXECUTION_COUNT', description: 'Ready-for-execution count' },
];

// -- Related Item Definitions (T05 §4.4) ----------------------------------------

export const READINESS_RELATED_ITEM_DEFINITIONS: ReadonlyArray<IReadinessRelatedItemDef> = [
  { relatedItemType: 'BUYOUT_LINE_LINKAGE', description: 'Linkage to the governing buyout line' },
  { relatedItemType: 'ACTIVE_DECISION_LINKAGE', description: 'Linkage to the active readiness decision' },
  { relatedItemType: 'APPROVED_PRECEDENT_LINKAGE', description: 'Linkage to approved exception precedent where published' },
];

// -- Shared Package Requirements (T05 §5) ---------------------------------------

export const SHARED_PACKAGE_REQUIREMENTS: ReadonlyArray<ISharedPackageRequirement> = [
  { packageName: '@hbc/workflow-handoff', requiredUse: 'Approval routing, reassignment workflow, and resolution callbacks for exception iterations' },
  { packageName: '@hbc/field-annotations', requiredUse: 'Review-only annotations on supported surfaces' },
  { packageName: '@hbc/related-items', requiredUse: 'Financial linkage and downstream related-item publication' },
  { packageName: '@hbc/acknowledgment', requiredUse: 'Explicit acknowledgment only where policy requires acknowledgment distinct from approval' },
  { packageName: '@hbc/my-work-feed', requiredUse: 'Routed operational actions and escalations' },
  { packageName: '@hbc/notification-intelligence', requiredUse: 'Timer-driven reminder, overdue-review, overdue-approval, renewal, and escalation notifications' },
  { packageName: '@hbc/bic-next-move', requiredUse: 'Blocked-execution and overdue-action prompts tied to the active case and routed work' },
  { packageName: '@hbc/publish-workflow', requiredUse: 'Governed GlobalPrecedentReference publication flow where publication is enabled' },
  { packageName: '@hbc/versioned-record', requiredUse: 'Immutable history for case, item, decision, iteration, slot, and delegation changes' },
  { packageName: '@hbc/session-state', requiredUse: 'Draft and offline-safe authoring where allowed; never authoritative for approval actions or issued decisions' },
];

// -- Prohibited Local Substitutes (T05 §5.1) -----------------------------------

export const PROHIBITED_LOCAL_SUBSTITUTE_DEFINITIONS: ReadonlyArray<IProhibitedLocalSubstituteDef> = [
  { substitute: 'LOCAL_REMINDER_TABLE', description: 'Local reminder tables instead of routed work' },
  { substitute: 'LOCAL_NOTIFICATION_SYSTEM', description: 'Local notification or reminder systems outside shared notification primitives' },
  { substitute: 'LOCAL_NEXT_MOVE_PROMPT', description: 'Local next-move prompt systems outside @hbc/bic-next-move' },
  { substitute: 'BESPOKE_APPROVAL_ROUTING', description: 'Bespoke approval-routing state outside @hbc/workflow-handoff' },
  { substitute: 'LOCAL_ANNOTATION_STORE', description: 'Local annotation stores' },
  { substitute: 'LOCAL_HISTORY_SYSTEM', description: 'Local history systems that bypass @hbc/versioned-record' },
];
