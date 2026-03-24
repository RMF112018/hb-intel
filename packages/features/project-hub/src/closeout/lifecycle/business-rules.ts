/**
 * P3-E10-T04 Closeout Lifecycle State Machine business rules.
 * State transitions, milestone rules, archive-ready gate, work queue triggers.
 */

import type { CloseoutFullMilestoneKey, CloseoutLifecycleState } from './enums.js';
import type { IArchiveReadyContext, IArchiveReadyCriterionResult, ICloseoutStateTransition, IWorkQueueTrigger } from './types.js';
import {
  CLOSEOUT_STATE_TRANSITIONS,
  CLOSEOUT_MILESTONE_DEFINITIONS,
  CLOSEOUT_ARCHIVE_READY_CRITERIA,
  CLOSEOUT_WORK_QUEUE_TRIGGERS,
} from './constants.js';

// -- State Machine Rules (§2) -----------------------------------------------

/**
 * Returns true if transitioning from `from` to `to` is valid per T04 §2.2.
 * States cannot be skipped; only defined transitions are permitted.
 */
export const canTransitionState = (
  from: CloseoutLifecycleState,
  to: CloseoutLifecycleState,
): boolean => CLOSEOUT_STATE_TRANSITIONS.some((t) => t.from === from && t.to === to);

/**
 * Returns the transition definition for a from→to pair, or undefined if invalid.
 */
export const getTransitionForStates = (
  from: CloseoutLifecycleState,
  to: CloseoutLifecycleState,
): ICloseoutStateTransition | undefined =>
  CLOSEOUT_STATE_TRANSITIONS.find((t) => t.from === from && t.to === to);

/**
 * Returns true if PE approval is required for the given state transition.
 * Per T04 §2.2: TURNOVER→OWNER_ACCEPTANCE, FINAL_COMPLETION→ARCHIVE_READY,
 * ARCHIVE_READY→ARCHIVED require PE approval.
 */
export const requiresPEApprovalForTransition = (
  from: CloseoutLifecycleState,
  to: CloseoutLifecycleState,
): boolean => {
  const transition = getTransitionForStates(from, to);
  return transition?.peApprovalRequired ?? false;
};

/**
 * Returns true if the state is the terminal lifecycle state per T04 §2.2.
 * Only ARCHIVED is terminal.
 */
export const isTerminalLifecycleState = (state: CloseoutLifecycleState): boolean =>
  state === 'ARCHIVED';

/** States from which no rollback is permitted per T04 §2.2. */
const NO_ROLLBACK_STATES: readonly CloseoutLifecycleState[] = [
  'FINAL_COMPLETION',
  'ARCHIVE_READY',
  'ARCHIVED',
];

/**
 * Returns true if the state does not permit rollback per T04 §2.2.
 * No rollback after FINAL_COMPLETION; PE must annotate and PM correct
 * underlying records.
 */
export const isNoRollbackState = (state: CloseoutLifecycleState): boolean =>
  NO_ROLLBACK_STATES.includes(state);

// -- Milestone Rules (§4) ---------------------------------------------------

/**
 * Returns the milestone key that advances to the given state, or undefined
 * if no milestone directly advances to that state.
 */
export const getMilestoneForState = (
  state: CloseoutLifecycleState,
): CloseoutFullMilestoneKey | undefined => {
  const milestone = CLOSEOUT_MILESTONE_DEFINITIONS.find((m) => m.advancesTo === state);
  return milestone?.key;
};

/**
 * Returns true if the milestone has an external dependency (Owner/AHJ)
 * per T04 §4.2 and §6.
 */
export const isExternalDependency = (key: CloseoutFullMilestoneKey): boolean => {
  const milestone = CLOSEOUT_MILESTONE_DEFINITIONS.find((m) => m.key === key);
  return milestone?.externalDependency ?? false;
};

/**
 * Returns true if PE approval is required for the given milestone per T04 §4.2.
 */
export const requiresPEApprovalForMilestone = (key: CloseoutFullMilestoneKey): boolean => {
  const milestone = CLOSEOUT_MILESTONE_DEFINITIONS.find((m) => m.key === key);
  return milestone?.peApprovalRequired ?? false;
};

// -- Archive-Ready Gate (§4.3) ----------------------------------------------

/**
 * Evaluates all 8 archive-ready criteria per T04 §4.3.
 * Returns pass/fail for each criterion.
 */
export const evaluateArchiveReadyCriteria = (
  context: IArchiveReadyContext,
): ReadonlyArray<IArchiveReadyCriterionResult> => {
  const checks: boolean[] = [
    // Criterion 1: completion >= 100% or all non-Yes have NA+justification
    context.completionPercentage >= 100 || context.allNonYesItemsHaveNaJustification,
    // Criterion 2: Section 6 all 5 items = Yes
    context.section6CompletionPercentage >= 100,
    // Criterion 3: C.O. obtained
    context.item311YesWithDate,
    // Criterion 4: All liens released
    context.item415Yes,
    // Criterion 5: All subs PE-approved
    context.scorecardsCompleteMilestoneApproved,
    // Criterion 6: Lessons PE-approved
    context.lessonsApprovedMilestoneApproved,
    // Criterion 7: Autopsy PE-approved
    context.autopsyCompleteMilestoneApproved,
    // Criterion 8: Financial final payment confirmed
    context.financialFinalPaymentConfirmed,
  ];

  return checks.map((passed, i) => ({
    criterionNumber: i + 1,
    passed,
  }));
};

/**
 * Returns true if all 8 archive-ready criteria are met per T04 §4.3.
 */
export const areAllArchiveReadyCriteriaMet = (context: IArchiveReadyContext): boolean =>
  evaluateArchiveReadyCriteria(context).every((r) => r.passed);

// -- Work Queue Triggers (§7) -----------------------------------------------

/**
 * Returns work queue triggers applicable to a given lifecycle state.
 * This is a simplified mapping; runtime would check full conditions.
 */
export const getWorkQueueTriggersForState = (
  state: CloseoutLifecycleState,
): ReadonlyArray<IWorkQueueTrigger> => {
  const stateTriggersMap: Readonly<Record<string, readonly number[]>> = {
    IN_PROGRESS: [0],
    FINAL_COMPLETION: [1, 2, 3, 4],
    ARCHIVE_READY: [5],
    TURNOVER_COMPLETE: [6],
  };

  const indices = stateTriggersMap[state];
  if (!indices) return [];
  return indices
    .filter((i) => i < CLOSEOUT_WORK_QUEUE_TRIGGERS.length)
    .map((i) => CLOSEOUT_WORK_QUEUE_TRIGGERS[i]);
};
