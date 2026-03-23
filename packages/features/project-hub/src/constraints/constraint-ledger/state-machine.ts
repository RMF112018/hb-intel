/**
 * P3-E6-T02 Constraint Ledger lifecycle state machine.
 * Enforces valid transitions per §2.3 and terminal state rules.
 */

import type { ConstraintStatus } from './enums.js';
import type { IConstraintRecord, IConstraintTransitionContext, IConstraintTransitionResult } from './types.js';
import { TERMINAL_CONSTRAINT_STATUSES, VALID_CONSTRAINT_TRANSITIONS } from './constants.js';

/** Returns true if the given status is terminal (Resolved, Void, Cancelled, Superseded). */
export const isTerminalConstraintStatus = (status: ConstraintStatus): boolean =>
  (TERMINAL_CONSTRAINT_STATUSES as readonly string[]).includes(status);

/** Returns true if transitioning from `from` to `to` is a valid lifecycle move. */
export const isValidConstraintTransition = (from: ConstraintStatus, to: ConstraintStatus): boolean =>
  VALID_CONSTRAINT_TRANSITIONS[from].includes(to);

/**
 * Validates a proposed status transition for a constraint record.
 *
 * Checks:
 * - Current status is not terminal.
 * - The proposed transition is in the valid transitions map.
 * - Terminal transitions require closureReason (Void, Cancelled, Superseded).
 * - Resolved transition requires dateClosed.
 * - Superseded transition requires successorConstraintId.
 * - Resolved without closureDocumentUri produces a warning (not error per C-06).
 *
 * Returns a validation result with errors and warnings — does not mutate.
 */
export const transitionConstraintStatus = (
  record: Pick<IConstraintRecord, 'status'>,
  newStatus: ConstraintStatus,
  context: IConstraintTransitionContext,
): IConstraintTransitionResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (isTerminalConstraintStatus(record.status)) {
    errors.push(
      `Cannot transition from terminal status '${record.status}'. Terminal states do not allow further transitions.`,
    );
    return { valid: false, errors, warnings };
  }

  if (!isValidConstraintTransition(record.status, newStatus)) {
    errors.push(
      `Invalid transition from '${record.status}' to '${newStatus}'. Valid targets: ${VALID_CONSTRAINT_TRANSITIONS[record.status].join(', ') || 'none'}.`,
    );
  }

  if (isTerminalConstraintStatus(newStatus) && newStatus !== 'Resolved' && !context.closureReason) {
    errors.push(
      `Transition to terminal status '${newStatus}' requires a closureReason.`,
    );
  }

  if (newStatus === 'Resolved' && !context.dateClosed) {
    errors.push(
      `Transition to 'Resolved' requires dateClosed to be provided.`,
    );
  }

  if (newStatus === 'Superseded' && !context.successorConstraintId) {
    errors.push(
      `Transition to 'Superseded' requires a successorConstraintId reference.`,
    );
  }

  // C-06: Closure documentation is recommended but not required
  if (newStatus === 'Resolved' && !context.closureDocumentUri) {
    warnings.push(
      `Resolving without closureDocumentUri. Closure documentation is strongly recommended.`,
    );
  }

  return { valid: errors.length === 0, errors, warnings };
};
