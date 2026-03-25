/**
 * P3-E15-T10 Stage 5 Project QC Module issues-actions enumerations.
 */

// -- Issue Origination Mode (T05 §2) -----------------------------------------

/** Issue origination modes per T05 §2. */
export type IssueOriginationMode =
  | 'FINDING_ORIGIN'
  | 'GATE_ORIGIN'
  | 'AD_HOC_ORIGIN';

// -- Closure Authority Type (T05 §3.3) ---------------------------------------

/** Closure authority types per T05 §3.3. */
export type ClosureAuthorityType =
  | 'VERIFIER_CLOSE'
  | 'SELF_CLOSE_PROHIBITED';

// -- Work Queue Publication State (T05 §8) -----------------------------------

/** Work queue publication states per T05 §8. */
export type WorkQueuePublicationState =
  | 'CREATED'
  | 'ASSIGNED'
  | 'REVIEWER_NEEDED'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLEARED';

// -- Work Queue Source Type (T05 §8) -----------------------------------------

/** Work queue source types per T05 §8. */
export type WorkQueueSourceType =
  | 'QC_ISSUE'
  | 'CORRECTIVE_ACTION';

// -- Root Cause Qualification (T05 §7.1) -------------------------------------

/** Root cause qualification per T05 §7.1. */
export type RootCauseQualification =
  | 'REQUIRED'
  | 'NOT_REQUIRED';

// -- Root Cause Required Reason (T05 §7.2) -----------------------------------

/** Root cause required reasons per T05 §7.2. */
export type RootCauseRequiredReason =
  | 'SEVERITY_EXCEEDS_THRESHOLD'
  | 'ISSUE_REOPENED'
  | 'RECURRENCE_PATTERN'
  | 'MULTI_WORK_PACKAGE'
  | 'MULTI_ORGANIZATION'
  | 'MATERIALLY_AFFECTS_READINESS';

// -- Escalation Trigger (T05 §6) ---------------------------------------------

/** Escalation triggers per T05 §6. */
export type EscalationTrigger =
  | 'OVERDUE'
  | 'READINESS_IMPACT'
  | 'REPEATED_REOPEN'
  | 'VERIFIER_NOT_DESIGNATED'
  | 'EXTERNAL_APPROVAL_GAP'
  | 'RECURRENCE_PATTERN_DETECTED';

// -- Issue Priority Band (T05 §5) --------------------------------------------

/** Issue priority bands per T05 §5. */
export type IssuePriorityBand =
  | 'CRITICAL'
  | 'HIGH'
  | 'STANDARD'
  | 'LOW';

// -- Issue Action Relationship (T05 §4.2) ------------------------------------

/** Issue-action relationship types per T05 §4.2. */
export type IssueActionRelationship =
  | 'PARENT_ISSUE'
  | 'CHILD_ACTION';

// -- Work Queue Publication Event (T05 §8.2) ---------------------------------

/** Work queue publication events per T05 §8.2. */
export type WorkQueuePublicationEvent =
  | 'ISSUE_CREATED'
  | 'ISSUE_ASSIGNED'
  | 'ACTION_ASSIGNED'
  | 'MOVED_TO_READY_FOR_REVIEW'
  | 'VERIFIED_CLOSED'
  | 'ESCALATED'
  | 'REOPENED';
