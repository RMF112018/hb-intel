/**
 * P3-E6-T04 Change Ledger lifecycle state machine.
 * Enforces valid transitions per §4.4 and approval gate per CE-03.
 */

import type { ChangeEventStatus } from './enums.js';
import type { IChangeEventRecord, IChangeEventTransitionContext, IChangeEventTransitionResult } from './types.js';
import { TERMINAL_CHANGE_EVENT_STATUSES, VALID_CHANGE_EVENT_TRANSITIONS } from './constants.js';

/** Returns true if the given status is terminal (Closed, Void, Cancelled, Superseded). */
export const isTerminalChangeEventStatus = (status: ChangeEventStatus): boolean =>
  (TERMINAL_CHANGE_EVENT_STATUSES as readonly string[]).includes(status);

/** Returns true if transitioning from `from` to `to` is a valid lifecycle move. */
export const isValidChangeEventTransition = (from: ChangeEventStatus, to: ChangeEventStatus): boolean =>
  VALID_CHANGE_EVENT_TRANSITIONS[from].includes(to);

/**
 * Validates a proposed status transition for a change event record.
 *
 * Checks:
 * - Current status is not terminal.
 * - Transition is in valid transitions map.
 * - CE-03: Approved requires approvedDate, approvedBy, and totalCostImpact set.
 * - Superseded requires successorChangeEventId.
 * - Terminal transitions (Void, Cancelled, Superseded) require closureReason.
 */
export const transitionChangeEventStatus = (
  record: Pick<IChangeEventRecord, 'status' | 'totalCostImpact'>,
  newStatus: ChangeEventStatus,
  context: IChangeEventTransitionContext,
): IChangeEventTransitionResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (isTerminalChangeEventStatus(record.status)) {
    errors.push(
      `Cannot transition from terminal status '${record.status}'. Terminal states do not allow further transitions.`,
    );
    return { valid: false, errors, warnings };
  }

  if (!isValidChangeEventTransition(record.status, newStatus)) {
    errors.push(
      `Invalid transition from '${record.status}' to '${newStatus}'. Valid targets: ${VALID_CHANGE_EVENT_TRANSITIONS[record.status].join(', ') || 'none'}.`,
    );
  }

  // CE-03: Approval gate
  if (newStatus === 'Approved') {
    if (!context.approvedDate) {
      errors.push('Transition to Approved requires approvedDate (CE-03).');
    }
    if (!context.approvedBy) {
      errors.push('Transition to Approved requires approvedBy (CE-03).');
    }
    if (record.totalCostImpact === undefined || record.totalCostImpact === null) {
      errors.push('Transition to Approved requires totalCostImpact to be set (CE-03).');
    }
  }

  // Superseded requires successor reference
  if (newStatus === 'Superseded' && !context.successorChangeEventId) {
    errors.push('Transition to Superseded requires a successorChangeEventId reference.');
  }

  // Terminal states require closureReason
  if (isTerminalChangeEventStatus(newStatus) && newStatus !== 'Closed' && newStatus !== 'Approved' && !context.closureReason) {
    errors.push(`Transition to terminal status '${newStatus}' requires a closureReason.`);
  }

  return { valid: errors.length === 0, errors, warnings };
};
