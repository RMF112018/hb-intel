/**
 * P3-E6-T03 Delay Ledger lifecycle state machine.
 * Enforces valid transitions per §3.4 and evidence gates at Quantified/Dispositioned.
 */

import type { DelayStatus } from './enums.js';
import type { IDelayRecord, IDelayTransitionContext, IDelayTransitionResult } from './types.js';
import { TERMINAL_DELAY_STATUSES, VALID_DELAY_TRANSITIONS } from './constants.js';
import { isQuantifiedGateMet, isDispositionedGateMet } from './business-rules.js';

/** Returns true if the given status is terminal (Closed, Void, Cancelled). */
export const isTerminalDelayStatus = (status: DelayStatus): boolean =>
  (TERMINAL_DELAY_STATUSES as readonly string[]).includes(status);

/** Returns true if transitioning from `from` to `to` is a valid lifecycle move. */
export const isValidDelayTransition = (from: DelayStatus, to: DelayStatus): boolean =>
  VALID_DELAY_TRANSITIONS[from].includes(to);

/**
 * Validates a proposed status transition for a delay record.
 *
 * Checks:
 * - Current status is not terminal.
 * - The proposed transition is in the valid transitions map.
 * - Quantified gate: timeImpact populated with required fields, separationConfirmed = true, criticalPathImpact set.
 * - Dispositioned gate: dispositionOutcome set, dispositionNotes non-empty, notificationDate populated.
 * - Terminal transitions (Void, Cancelled) require closureReason.
 *
 * Returns validation result with errors and warnings — does not mutate.
 */
export const transitionDelayStatus = (
  record: IDelayRecord,
  newStatus: DelayStatus,
  context: IDelayTransitionContext,
): IDelayTransitionResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (isTerminalDelayStatus(record.status)) {
    errors.push(
      `Cannot transition from terminal status '${record.status}'. Terminal states do not allow further transitions.`,
    );
    return { valid: false, errors, warnings };
  }

  if (!isValidDelayTransition(record.status, newStatus)) {
    errors.push(
      `Invalid transition from '${record.status}' to '${newStatus}'. Valid targets: ${VALID_DELAY_TRANSITIONS[record.status].join(', ') || 'none'}.`,
    );
  }

  // Evidence gate: Quantified
  if (newStatus === 'Quantified') {
    const gate = isQuantifiedGateMet(record);
    if (!gate.met) {
      for (const condition of gate.unmetConditions) {
        errors.push(`Quantified gate: ${condition}`);
      }
    }
  }

  // Evidence gate: Dispositioned
  if (newStatus === 'Dispositioned') {
    const gate = isDispositionedGateMet(record);
    if (!gate.met) {
      for (const condition of gate.unmetConditions) {
        errors.push(`Dispositioned gate: ${condition}`);
      }
    }
  }

  // Terminal state rules
  if ((newStatus === 'Void' || newStatus === 'Cancelled') && !context.closureReason) {
    errors.push(
      `Transition to terminal status '${newStatus}' requires a closureReason.`,
    );
  }

  return { valid: errors.length === 0, errors, warnings };
};
