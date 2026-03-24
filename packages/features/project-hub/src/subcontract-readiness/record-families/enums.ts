/**
 * P3-E13-T08 Stage 2 Subcontract Execution Readiness Module record-families enumerations.
 * Record families, identity rules, lifecycle statuses, readiness decision.
 */

// -- Case Workflow Status (T02 §4.1) ------------------------------------------

/** The 11-state case workflow per T02 §4.1. Describes where in process the case is. */
export type ReadinessWorkflowStatus =
  | 'DRAFT'
  | 'ASSEMBLING'
  | 'SUBMITTED_FOR_REVIEW'
  | 'UNDER_EVALUATION'
  | 'AWAITING_RESPONSE'
  | 'AWAITING_EXCEPTION'
  | 'READY_FOR_ISSUANCE'
  | 'ISSUED'
  | 'RENEWAL_DUE'
  | 'SUPERSEDED'
  | 'VOID';

// -- Execution Readiness Outcome (T02 §4.2) -----------------------------------

/** The 6-value readiness outcome per T02 §4.2. Describes whether execution is allowed. */
export type ExecutionReadinessOutcome =
  | 'NOT_ISSUED'
  | 'READY'
  | 'BLOCKED'
  | 'READY_WITH_APPROVED_EXCEPTION'
  | 'SUPERSEDED'
  | 'VOID';

// -- Record Family Classification (T02 §1) ------------------------------------

/** All 15 record families per T02 §1. */
export type ReadinessRecordFamily =
  // Primary ledger (10)
  | 'SubcontractReadinessCase'
  | 'ReadinessRequirementItem'
  | 'RequirementArtifact'
  | 'RequirementEvaluation'
  | 'ExceptionCase'
  | 'ExceptionSubmissionIteration'
  | 'ExceptionApprovalSlot'
  | 'ExceptionApprovalAction'
  | 'ExceptionDelegationEvent'
  | 'ExecutionReadinessDecision'
  // Publication artifact (1)
  | 'GlobalPrecedentReference'
  // Downstream projections (4)
  | 'ReadinessHealthProjection'
  | 'ReadinessWorkQueueProjection'
  | 'ReadinessRelatedItemProjection'
  | 'ReadinessActivityProjection';

// -- Record Ledger Type (T02 §1) ----------------------------------------------

/** Ledger classification per T02 §1. */
export type ReadinessLedgerType =
  | 'PRIMARY_LEDGER'
  | 'PUBLICATION_ARTIFACT'
  | 'DOWNSTREAM_PROJECTION';

// -- Supersede / Void Triggers (T02 §3.3) ------------------------------------

/** Material identity changes that trigger supersede or void per T02 §3.3. */
export type SupersedeVoidTrigger =
  | 'LEGAL_ENTITY_CHANGE'
  | 'BUYOUT_LINE_REPLACEMENT'
  | 'SCOPE_RISK_POSTURE_CHANGE'
  | 'AWARD_PATH_ABANDONMENT';

// -- In-Case Continuity Reasons (T02 §3.2) ------------------------------------

/** Activities that remain within the same case per T02 §3.2. */
export type InCaseContinuityReason =
  | 'ROUTINE_RESUBMISSION'
  | 'DEFICIENCY_CORRECTION'
  | 'CORRECTED_UPLOAD'
  | 'EXPIRATION_RENEWAL'
  | 'RE_REVIEW_AFTER_REJECTION';

// -- Outcome Reason Codes (T02 §5.1) -----------------------------------------

/** Typed rationale for readiness decisions per T02 §5.1. */
export type OutcomeReasonCode =
  | 'ALL_ITEMS_SATISFIED'
  | 'BLOCKING_ITEMS_REMAIN'
  | 'APPROVED_EXCEPTIONS_COVER_GAPS'
  | 'SUPERSEDED_BY_NEW_CASE'
  | 'CASE_VOIDED';
