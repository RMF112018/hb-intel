/**
 * W0-G3-T03: Pure return-flow helpers for clarification-return mode.
 *
 * These functions compute wizard re-entry state from clarification items
 * and assemble resubmission payloads. No React hooks, no async — pure
 * functions for testability and surface-agnosticism.
 *
 * @see docs/architecture/plans/MVP/G3/W0-G3-T03-Clarification-Loop-and-Return-to-Flow-Behavior.md
 */
import type { IRequestClarification } from '@hbc/models';
import type {
  ProjectSetupStepId,
  IClarificationReturnState,
  IClarificationResponse,
  IClarificationResubmission,
} from '../types/index.js';
import { PROJECT_SETUP_STEP_IDS, buildClarificationDraftKey } from '../types/index.js';

/**
 * Filters clarification items to only those with `status === 'open'`.
 */
export function getOpenClarifications(
  items: readonly IRequestClarification[],
): IRequestClarification[] {
  return items.filter((item) => item.status === 'open');
}

/**
 * Builds the computed return state for clarification-return mode.
 *
 * Given a request's clarification items, determines which steps are flagged
 * (have open clarifications), which are complete, and which step should be
 * active on re-entry (first flagged step in wizard order).
 */
export function buildClarificationReturnState(
  clarifications: readonly IRequestClarification[],
): IClarificationReturnState {
  const openItems = getOpenClarifications(clarifications);

  // Extract unique flagged step IDs, ordered by wizard sequence
  const flaggedSet = new Set<ProjectSetupStepId>();
  for (const item of openItems) {
    if (PROJECT_SETUP_STEP_IDS.includes(item.stepId as ProjectSetupStepId)) {
      flaggedSet.add(item.stepId as ProjectSetupStepId);
    }
  }

  const flaggedStepIds = PROJECT_SETUP_STEP_IDS.filter((s) => flaggedSet.has(s));
  const completedStepIds = PROJECT_SETUP_STEP_IDS.filter((s) => !flaggedSet.has(s));
  const activeStepId = flaggedStepIds.length > 0 ? flaggedStepIds[0] : null;

  return {
    flaggedStepIds,
    completedStepIds,
    activeStepId,
    openClarifications: openItems,
    mode: 'clarification-return',
  };
}

/**
 * Assembles the resubmission payload for a clarification response.
 *
 * Includes the updated field values, individual clarification responses,
 * and the draft key that should be cleared upon successful submission.
 */
export function buildClarificationResponsePayload(
  requestId: string,
  updatedFields: Record<string, unknown>,
  responses: readonly IClarificationResponse[],
): IClarificationResubmission {
  return {
    requestId,
    updatedFields,
    responses,
    draftKeyToClear: buildClarificationDraftKey(requestId),
  };
}
