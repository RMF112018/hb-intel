/**
 * P3-E13-T08 Stage 4 Subcontract Execution Readiness Module exception-governance TypeScript contracts.
 * Parent exception case, immutable iterations, approval slots, actions, delegation, precedent.
 */

import type {
  ApprovalActionOutcome,
  ApprovalSequencingMode,
  ApprovalSlotRole,
  ApprovalSlotStatus,
  DelegationReason,
  ExceptionIterationStatus,
  PrecedentPublicationStatus,
} from './enums.js';

// -- ExceptionCase T04-enhanced (T04 §1) --------------------------------------

/** Parent governed exception aggregate per T04 §1. */
export interface IExceptionCaseT04 {
  readonly exceptionCaseId: string;
  readonly readinessCaseId: string;
  readonly linkedRequirementItemIds: readonly string[];
  readonly currentIterationId: string | null;
  readonly iterationCount: number;
  readonly sequencingMode: ApprovalSequencingMode;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastModifiedAt: string;
  readonly lastModifiedBy: string | null;
}

// -- ExceptionSubmissionIteration (T04 §2) ------------------------------------

/** Immutable submission snapshot per T04 §2.2. Content never edited in place. */
export interface IExceptionSubmissionIteration {
  readonly exceptionSubmissionIterationId: string;
  readonly exceptionCaseId: string;
  readonly iterationNumber: number;
  readonly submittedAt: string;
  readonly submittedByUserId: string;
  readonly iterationSnapshot: string;
  readonly iterationStatus: ExceptionIterationStatus;
  readonly supersedesIterationId: string | null;
}

// -- ExceptionApprovalSlot (T04 §3.1) ----------------------------------------

/** Preserved approval slot per T04 §3.1. Represents authority, not assignee. */
export interface IExceptionApprovalSlot {
  readonly approvalSlotId: string;
  readonly exceptionCaseId: string;
  readonly slotRole: ApprovalSlotRole;
  readonly slotSequence: number;
  readonly assignedUserId: string;
  readonly slotRequired: boolean;
  readonly slotStatus: ApprovalSlotStatus;
}

// -- ExceptionApprovalAction (T04 §3.2) ---------------------------------------

/** Approval action tied to one slot + one iteration per T04 §3.2. */
export interface IExceptionApprovalAction {
  readonly approvalActionId: string;
  readonly approvalSlotId: string;
  readonly exceptionSubmissionIterationId: string;
  readonly actorUserId: string;
  readonly actionOutcome: ApprovalActionOutcome;
  readonly actionNotes: string | null;
  readonly actionTimestamp: string;
}

// -- ExceptionDelegationEvent (T04 §4.1) --------------------------------------

/** Delegation / reassignment audit per T04 §4.1. */
export interface IExceptionDelegationEvent {
  readonly delegationEventId: string;
  readonly approvalSlotId: string;
  readonly delegatorUserId: string;
  readonly delegateUserId: string;
  readonly reason: DelegationReason;
  readonly reasonNotes: string | null;
  readonly delegatedAt: string;
  readonly resultingAssigneeUserId: string;
}

// -- GlobalPrecedentReference (T04 §6) ----------------------------------------

/** Published cross-project reference artifact per T04 §6. */
export interface IGlobalPrecedentReference {
  readonly precedentReferenceId: string;
  readonly exceptionCaseId: string;
  readonly sourceReadinessCaseId: string;
  readonly sourceProjectId: string;
  readonly publicationStatus: PrecedentPublicationStatus;
  readonly publishedAt: string | null;
  readonly publishedBy: string | null;
  readonly precedentSummary: string;
  readonly precedentOutcome: string;
  readonly revokedAt: string | null;
  readonly revokedBy: string | null;
  readonly revocationReason: string | null;
}

// -- Supporting Types ---------------------------------------------------------

/** Approval slot role definition per T04 §5.2. */
export interface IApprovalSlotRoleDef {
  readonly role: ApprovalSlotRole;
  readonly description: string;
  readonly requiredByDefault: boolean;
}

/** What precedent publication does NOT mean per T04 §6.2. */
export interface IPrecedentProhibition {
  readonly prohibition: string;
  readonly description: string;
}

/** Audit preservation requirement per T04 §7. */
export interface IAuditPreservationRequirement {
  readonly requirement: string;
}
