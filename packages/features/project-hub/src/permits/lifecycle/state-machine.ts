/**
 * P3-E7-T03 Permits lifecycle state machines.
 * Application transitions and IssuedPermit lifecycle action validation.
 */

import type { PermitApplicationStatus, IssuedPermitStatus, PermitLifecycleActionType } from '../records/enums.js';
import type { IPermitApplicationTransitionResult, IPermitLifecycleActionValidationResult } from './types.js';
import {
  LIFECYCLE_ACTION_TRANSITION_TABLE,
  TERMINAL_APPLICATION_STATUSES,
  TERMINAL_ISSUED_PERMIT_STATUSES,
  VALID_APPLICATION_TRANSITIONS,
} from './constants.js';

// ── Application Lifecycle ───────────────────────────────────────────

export const isTerminalApplicationStatus = (status: PermitApplicationStatus): boolean =>
  (TERMINAL_APPLICATION_STATUSES as readonly string[]).includes(status);

export const isValidApplicationTransition = (from: PermitApplicationStatus, to: PermitApplicationStatus): boolean => {
  return VALID_APPLICATION_TRANSITIONS.some(
    (rule) => (rule.from === from || rule.from === '*') && rule.to === to,
  );
};

export const transitionApplicationStatus = (
  currentStatus: PermitApplicationStatus,
  newStatus: PermitApplicationStatus,
): IPermitApplicationTransitionResult => {
  const errors: string[] = [];

  if (isTerminalApplicationStatus(currentStatus)) {
    errors.push(`Cannot transition from terminal status '${currentStatus}'.`);
    return { valid: false, errors };
  }

  if (!isValidApplicationTransition(currentStatus, newStatus)) {
    errors.push(`Invalid application transition from '${currentStatus}' to '${newStatus}'.`);
  }

  return { valid: errors.length === 0, errors };
};

// ── Issued Permit Lifecycle (via PermitLifecycleAction) ─────────────

export const isTerminalIssuedPermitStatus = (status: IssuedPermitStatus): boolean =>
  (TERMINAL_ISSUED_PERMIT_STATUSES as readonly string[]).includes(status);

export const isNotesRequiredForAction = (actionType: PermitLifecycleActionType): boolean => {
  const rule = LIFECYCLE_ACTION_TRANSITION_TABLE.find((r) => r.actionType === actionType);
  return rule?.notesRequired ?? false;
};

export const isAcknowledgmentRequiredForAction = (actionType: PermitLifecycleActionType): boolean => {
  const rule = LIFECYCLE_ACTION_TRANSITION_TABLE.find((r) => r.actionType === actionType);
  return rule?.ackRequired ?? false;
};

/**
 * §4.1-4.2: Validate a proposed lifecycle action against the current permit state.
 * Enforces: non-terminal status, previousStatus match, valid transition, notes requirement.
 */
export const validateLifecycleAction = (
  currentPermitStatus: IssuedPermitStatus,
  actionType: PermitLifecycleActionType,
  notes?: string,
): IPermitLifecycleActionValidationResult => {
  const errors: string[] = [];

  // §4.1: Terminal status check
  if (isTerminalIssuedPermitStatus(currentPermitStatus)) {
    errors.push(`Permit is in terminal status '${currentPermitStatus}'. No further lifecycle actions permitted.`);
    return { valid: false, errors };
  }

  // Find matching transition rule
  const rule = LIFECYCLE_ACTION_TRANSITION_TABLE.find(
    (r) => r.actionType === actionType && (r.previousStatus === currentPermitStatus || r.previousStatus === '*'),
  );

  if (!rule) {
    errors.push(
      `Action type '${actionType}' is not valid when permit status is '${currentPermitStatus}'.`,
    );
  }

  // §4.2: Notes validation
  if (isNotesRequiredForAction(actionType) && (!notes || notes.trim().length === 0)) {
    errors.push(`Action type '${actionType}' requires notes to be provided.`);
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Resolve the new status for a permit given an action type and current status.
 * Returns null if the action is invalid.
 */
export const resolveNewStatus = (
  currentStatus: IssuedPermitStatus,
  actionType: PermitLifecycleActionType,
): IssuedPermitStatus | null => {
  const rule = LIFECYCLE_ACTION_TRANSITION_TABLE.find(
    (r) => r.actionType === actionType && (r.previousStatus === currentStatus || r.previousStatus === '*'),
  );
  if (!rule) return null;
  return rule.newStatus === 'SAME' ? currentStatus : rule.newStatus;
};
