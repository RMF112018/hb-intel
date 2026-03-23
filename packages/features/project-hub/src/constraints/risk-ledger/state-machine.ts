/**
 * P3-E6-T01 Risk Ledger lifecycle state machine.
 * Enforces valid transitions per §1.3 and terminal state rules.
 */

import type { RiskStatus } from './enums.js';
import type { IRiskRecord, IRiskTransitionContext, IRiskTransitionResult } from './types.js';
import { TERMINAL_RISK_STATUSES, VALID_RISK_TRANSITIONS } from './constants.js';

/** Returns true if the given status is terminal (Closed, Void, Cancelled). */
export const isTerminalRiskStatus = (status: RiskStatus): boolean =>
  (TERMINAL_RISK_STATUSES as readonly string[]).includes(status);

/** Returns true if transitioning from `from` to `to` is a valid lifecycle move. */
export const isValidRiskTransition = (from: RiskStatus, to: RiskStatus): boolean =>
  VALID_RISK_TRANSITIONS[from].includes(to);

/**
 * Validates a proposed status transition for a risk record.
 *
 * Checks:
 * - Current status is not terminal (no transitions from terminal states).
 * - The proposed transition is in the valid transitions map.
 * - Terminal target states require a closureReason in context.
 *
 * Returns a validation result — does not mutate the record.
 */
export const transitionRiskStatus = (
  record: Pick<IRiskRecord, 'status'>,
  newStatus: RiskStatus,
  context: IRiskTransitionContext,
): IRiskTransitionResult => {
  const errors: string[] = [];

  if (isTerminalRiskStatus(record.status)) {
    errors.push(
      `Cannot transition from terminal status '${record.status}'. Terminal states do not allow further transitions.`,
    );
    return { valid: false, errors };
  }

  if (!isValidRiskTransition(record.status, newStatus)) {
    errors.push(
      `Invalid transition from '${record.status}' to '${newStatus}'. Valid targets: ${VALID_RISK_TRANSITIONS[record.status].join(', ') || 'none'}.`,
    );
  }

  if (isTerminalRiskStatus(newStatus) && !context.closureReason) {
    errors.push(
      `Transition to terminal status '${newStatus}' requires a closureReason.`,
    );
  }

  return { valid: errors.length === 0, errors };
};
