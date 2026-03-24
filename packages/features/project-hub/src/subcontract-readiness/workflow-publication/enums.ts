/**
 * P3-E13-T08 Stage 5 Subcontract Execution Readiness Module workflow-publication enumerations.
 * Workflow stages, timers, routed outputs, publication outputs, shared package use.
 */

// -- Workflow Stages (T05 §1) -------------------------------------------------

/** Minimum workflow stages per T05 §1. */
export type ReadinessWorkflowStage =
  | 'CASE_ASSEMBLED'
  | 'SUBMITTED_FOR_REVIEW'
  | 'EVALUATION_IN_PROGRESS'
  | 'DEFICIENCY_RESPONSE_PENDING'
  | 'EXCEPTION_HANDLING_IN_PROGRESS'
  | 'DECISION_ELIGIBLE'
  | 'DECISION_ISSUED'
  | 'RENEWAL_IN_CASE'
  | 'SUPERSEDE_VOID_SUCCESSOR';

// -- Timer Types (T05 §2.1) ---------------------------------------------------

/** Typed timer policies per T05 §2.1. */
export type ReadinessTimerType =
  | 'MISSING_PACKAGE_ITEM'
  | 'PENDING_EVALUATOR_REVIEW'
  | 'PENDING_EXCEPTION_APPROVAL'
  | 'UPCOMING_EXPIRATION_OR_RENEWAL'
  | 'STALE_DECISION_NEAR_EXECUTION';

// -- Work Item Types (T05 §3.1) -----------------------------------------------

/** Routed work items per T05 §3.1. */
export type ReadinessWorkItemType =
  | 'PACKAGE_ASSEMBLY_MISSING'
  | 'EVALUATOR_REVIEW_DUE'
  | 'EVALUATOR_REVIEW_OVERDUE'
  | 'EXCEPTION_APPROVAL_PENDING'
  | 'EXCEPTION_APPROVAL_OVERDUE'
  | 'RENEWAL_DUE'
  | 'BLOCKED_EXECUTION';

// -- Notification Types (T05 §3.2) --------------------------------------------

/** Notification types per T05 §3.2. */
export type ReadinessNotificationType =
  | 'APPROACHING_TIMER_THRESHOLD'
  | 'OVERDUE_SPECIALIST_REVIEW'
  | 'OVERDUE_REQUIRED_APPROVAL'
  | 'UPCOMING_RENEWAL_EXPIRATION'
  | 'ISSUED_BLOCKED_DECISION'
  | 'ISSUED_READY_DECISION';

// -- Escalation Types (T05 §3.3) ----------------------------------------------

/** Typed escalation types per T05 §3.3. */
export type ReadinessEscalationType =
  | 'OVERDUE_EVALUATOR_REVIEW'
  | 'OVERDUE_REQUIRED_APPROVAL'
  | 'STALE_READINESS_NEAR_EXECUTION';

// -- Activity Event Types (T05 §4.1) ------------------------------------------

/** Activity spine events per T05 §4.1. */
export type ReadinessActivityEventType =
  | 'CASE_CREATED'
  | 'CASE_SUBMITTED'
  | 'DEFICIENCY_ISSUED'
  | 'DEFICIENCY_RESOLVED'
  | 'EXCEPTION_ITERATION_SUBMITTED'
  | 'EXCEPTION_ACTION_TAKEN'
  | 'READINESS_DECISION_ISSUED'
  | 'CASE_RENEWED'
  | 'CASE_SUPERSEDED'
  | 'CASE_VOIDED';

// -- Work Queue Projection Types (T05 §4.2) -----------------------------------

/** Work queue projections per T05 §4.2. */
export type ReadinessWorkQueueType =
  | 'PACKAGE_ASSEMBLY_ACTION'
  | 'EVALUATOR_REVIEW_ACTION'
  | 'EXCEPTION_APPROVAL_ACTION'
  | 'RENEWAL_ACTION'
  | 'BLOCKED_EXECUTION_ACTION';

// -- Health Metric Types (T05 §4.3) -------------------------------------------

/** Health publications per T05 §4.3. */
export type ReadinessHealthMetricType =
  | 'BLOCKED_READINESS_COUNT'
  | 'OVERDUE_REVIEW_COUNT'
  | 'OVERDUE_APPROVAL_COUNT'
  | 'RENEWAL_DUE_COUNT'
  | 'READY_FOR_EXECUTION_COUNT';

// -- Related Item Types (T05 §4.4) --------------------------------------------

/** Related item projections per T05 §4.4. */
export type ReadinessRelatedItemType =
  | 'BUYOUT_LINE_LINKAGE'
  | 'ACTIVE_DECISION_LINKAGE'
  | 'APPROVED_PRECEDENT_LINKAGE';

// -- Required Shared Packages (T05 §5) ----------------------------------------

/** Shared packages required by this module per T05 §5. */
export type RequiredSharedPackage =
  | '@hbc/workflow-handoff'
  | '@hbc/field-annotations'
  | '@hbc/related-items'
  | '@hbc/acknowledgment'
  | '@hbc/my-work-feed'
  | '@hbc/notification-intelligence'
  | '@hbc/bic-next-move'
  | '@hbc/publish-workflow'
  | '@hbc/versioned-record'
  | '@hbc/session-state';

// -- Prohibited Local Substitutes (T05 §5.1) ---------------------------------

/** Local substitutes explicitly prohibited per T05 §5.1. */
export type ProhibitedLocalSubstitute =
  | 'LOCAL_REMINDER_TABLE'
  | 'LOCAL_NOTIFICATION_SYSTEM'
  | 'LOCAL_NEXT_MOVE_PROMPT'
  | 'BESPOKE_APPROVAL_ROUTING'
  | 'LOCAL_ANNOTATION_STORE'
  | 'LOCAL_HISTORY_SYSTEM';
