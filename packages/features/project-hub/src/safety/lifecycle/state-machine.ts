/**
 * P3-E8-T03 SSSP lifecycle state machine validation.
 * Pure functions for SSSP and addendum status transitions.
 */

import type { SSSPStatus, SSSPAddendumStatus } from '../records/enums.js';
import {
  VALID_SSSP_TRANSITIONS,
  VALID_SSSP_ADDENDUM_TRANSITIONS,
  TERMINAL_SSSP_STATUSES,
  TERMINAL_SSSP_ADDENDUM_STATUSES,
} from '../records/constants.js';
import type { ISSSPTransitionResult, ISSSPAddendumTransitionResult } from './types.js';

// -- SSSP Base Plan State Machine -------------------------------------------

/** Returns true if the SSSP status is terminal (no further transitions). */
export const isTerminalSSSPStatus = (status: SSSPStatus): boolean =>
  (TERMINAL_SSSP_STATUSES as readonly string[]).includes(status);

/** Returns true if the transition from → to is valid per VALID_SSSP_TRANSITIONS. */
export const isValidSSSPTransition = (from: SSSPStatus, to: SSSPStatus): boolean => {
  const allowed = VALID_SSSP_TRANSITIONS[from];
  return allowed.includes(to);
};

/** Validate and return result for SSSP base plan status transition. */
export const transitionSSSPStatus = (
  currentStatus: SSSPStatus,
  newStatus: SSSPStatus,
): ISSSPTransitionResult => {
  const errors: string[] = [];

  if (isTerminalSSSPStatus(currentStatus)) {
    errors.push(`Cannot transition from terminal SSSP status '${currentStatus}'.`);
    return { valid: false, errors };
  }

  if (!isValidSSSPTransition(currentStatus, newStatus)) {
    errors.push(`Invalid SSSP transition from '${currentStatus}' to '${newStatus}'.`);
  }

  return { valid: errors.length === 0, errors };
};

// -- SSSP Addendum State Machine -------------------------------------------

/** Returns true if the addendum status is terminal. */
export const isTerminalAddendumStatus = (status: SSSPAddendumStatus): boolean =>
  (TERMINAL_SSSP_ADDENDUM_STATUSES as readonly string[]).includes(status);

/** Returns true if the addendum transition from → to is valid. */
export const isValidAddendumTransition = (from: SSSPAddendumStatus, to: SSSPAddendumStatus): boolean => {
  const allowed = VALID_SSSP_ADDENDUM_TRANSITIONS[from];
  return allowed.includes(to);
};

/** Validate and return result for SSSP addendum status transition. */
export const transitionAddendumStatus = (
  currentStatus: SSSPAddendumStatus,
  newStatus: SSSPAddendumStatus,
): ISSSPAddendumTransitionResult => {
  const errors: string[] = [];

  if (isTerminalAddendumStatus(currentStatus)) {
    errors.push(`Cannot transition from terminal addendum status '${currentStatus}'.`);
    return { valid: false, errors };
  }

  if (!isValidAddendumTransition(currentStatus, newStatus)) {
    errors.push(`Invalid addendum transition from '${currentStatus}' to '${newStatus}'.`);
  }

  return { valid: errors.length === 0, errors };
};
