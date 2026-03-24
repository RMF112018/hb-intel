/**
 * P3-E13-T08 Stage 4 Subcontract Execution Readiness Module exception-governance business rules.
 * Immutability enforcement, slot validation, delegation, precedent publication.
 */

import type {
  ApprovalSlotStatus,
  ExceptionIterationStatus,
} from './enums.js';
import type {
  IExceptionApprovalAction,
  IExceptionApprovalSlot,
} from './types.js';
import {
  TERMINAL_ITERATION_STATUSES,
  TERMINAL_SLOT_STATUSES,
} from './constants.js';

// -- Iteration Immutability (T04 §2.1) ----------------------------------------

/**
 * Returns true if the iteration is immutable per T04 §2.1.
 * All non-DRAFT iterations are immutable — submitted content must never be edited.
 */
export const isIterationImmutable = (
  status: ExceptionIterationStatus,
): boolean =>
  (TERMINAL_ITERATION_STATUSES as readonly string[]).includes(status);

/**
 * Returns true if the iteration can be edited per T04 §2.1.
 * Only DRAFT iterations may be edited.
 */
export const canEditIteration = (
  status: ExceptionIterationStatus,
): boolean =>
  status === 'DRAFT';

// -- Approval Slot Validation (T04 §3.1) --------------------------------------

/**
 * Returns true if the slot is required per T04 §3.1.
 */
export const isSlotRequired = (
  slot: IExceptionApprovalSlot,
): boolean =>
  slot.slotRequired;

/**
 * Returns true if the slot action is in a terminal state per T04 §3.
 */
export const isSlotActionComplete = (
  status: ApprovalSlotStatus,
): boolean =>
  (TERMINAL_SLOT_STATUSES as readonly string[]).includes(status);

/**
 * Returns true if all required approval slots have been resolved per T04 §5.
 */
export const isApprovalSequenceComplete = (
  slots: readonly IExceptionApprovalSlot[],
): boolean =>
  slots
    .filter((s) => s.slotRequired)
    .every((s) => isSlotActionComplete(s.slotStatus));

// -- Delegation Validation (T04 §4.2) -----------------------------------------

/**
 * Returns true if delegation is valid per T04 §4.2.
 * The original slot role remains constant — delegation only changes the assignee.
 * The delegator must be the current assignee.
 */
export const isDelegationValid = (
  slot: IExceptionApprovalSlot,
  delegatorUserId: string,
): boolean =>
  slot.assignedUserId === delegatorUserId && slot.slotStatus === 'PENDING';

/**
 * Returns true if delegation preserves the original slot per T04 §4.2.
 * Delegation must not create a new slot type or erase the original assignee.
 * This always returns true when used correctly — it's a guard assertion.
 */
export const doesDelegationPreserveSlot = (
  originalSlotRole: string,
  afterSlotRole: string,
): boolean =>
  originalSlotRole === afterSlotRole;

// -- Precedent Publication (T04 §6) -------------------------------------------

/**
 * Returns true if the exception outcome allows precedent publication per T04 §6.1.
 * Only approved exceptions may be published.
 */
export const canPublishAsPrecedent = (
  allRequiredSlotsApproved: boolean,
): boolean =>
  allRequiredSlotsApproved;

/**
 * Precedent publication never auto-approves future cases per T04 §6.2.
 * Always returns false.
 */
export const doesPrecedentAutoApprove = (): false => false;

/**
 * Precedent publication never auto-satisfies future readiness items per T04 §6.2.
 * Always returns false.
 */
export const doesPrecedentAutoSatisfy = (): false => false;

/**
 * Precedent publication never bypasses local specialist evaluation per T04 §6.2.
 * Always returns false.
 */
export const doesPrecedentBypassLocalEvaluation = (): false => false;

// -- Action Lookup (T04 §3.2) ------------------------------------------------

/**
 * Returns the approval action for a specific slot and iteration per T04 §3.2.
 */
export const getSlotActionForIteration = (
  actions: readonly IExceptionApprovalAction[],
  slotId: string,
  iterationId: string,
): IExceptionApprovalAction | undefined =>
  actions.find(
    (a) => a.approvalSlotId === slotId && a.exceptionSubmissionIterationId === iterationId,
  );
