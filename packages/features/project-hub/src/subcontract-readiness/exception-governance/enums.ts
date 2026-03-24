/**
 * P3-E13-T08 Stage 4 Subcontract Execution Readiness Module exception-governance enumerations.
 * Exception packets, approvals, delegation, global precedent.
 */

// -- Exception Iteration Status (T04 §2) --------------------------------------

/** Immutable submission iteration status per T04 §2. */
export type ExceptionIterationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REJECTED'
  | 'WITHDRAWN';

// -- Approval Slot Status (T04 §3.1) -----------------------------------------

/** Preserved approval slot status per T04 §3.1. */
export type ApprovalSlotStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'DELEGATED';

// -- Approval Action Outcome (T04 §3.2) --------------------------------------

/** Typed action outcome per T04 §3.2. */
export type ApprovalActionOutcome =
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'DEFERRED';

// -- Approval Slot Role (T04 §5.2) -------------------------------------------

/** Required approval authority roles per T04 §5.2. */
export type ApprovalSlotRole =
  | 'PX'
  | 'CFO'
  | 'COMPLIANCE_MANAGER'
  | 'SPECIALIST';

// -- Approval Sequencing Mode (T04 §5.1) -------------------------------------

/** Routing mode per T04 §5.1. Parallel by default unless policy requires ordered. */
export type ApprovalSequencingMode =
  | 'PARALLEL'
  | 'ORDERED';

// -- Precedent Publication Status (T04 §6) ------------------------------------

/** Global precedent publication status per T04 §6. */
export type PrecedentPublicationStatus =
  | 'NOT_PUBLISHED'
  | 'PUBLISHED'
  | 'REVOKED';

// -- Delegation Reason (T04 §4.1) --------------------------------------------

/** Delegation reason per T04 §4.1. */
export type DelegationReason =
  | 'UNAVAILABLE'
  | 'AUTHORITY_TRANSFER'
  | 'SPECIALIST_REDIRECT'
  | 'OTHER';
