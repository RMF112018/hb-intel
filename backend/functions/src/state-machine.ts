import type { ProjectSetupRequestState } from '@hbc/models';

/**
 * D-PH6-08 backend state-transition rules mirrored from package-level lifecycle engine.
 * Traceability: docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md §6.8.2
 */
export const STATE_TRANSITIONS: Record<ProjectSetupRequestState, ProjectSetupRequestState[]> = {
  Submitted: ['UnderReview'],
  UnderReview: ['NeedsClarification', 'AwaitingExternalSetup', 'ReadyToProvision'],
  NeedsClarification: ['UnderReview'], // Coordinator resubmits and request returns to review.
  AwaitingExternalSetup: ['ReadyToProvision'],
  ReadyToProvision: ['Provisioning'], // projectNumber must be validated before this transition.
  Provisioning: ['Completed', 'Failed'],
  Completed: [], // Terminal.
  Failed: ['UnderReview'], // Controller can reopen after remediation.
};

/**
 * D-PH6-08 transition guard used by request lifecycle APIs.
 */
export function isValidTransition(from: ProjectSetupRequestState, to: ProjectSetupRequestState): boolean {
  return STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * D-PH6-08 notification targets by destination state.
 */
export const STATE_NOTIFICATION_TARGETS: Partial<
  Record<ProjectSetupRequestState, ('submitter' | 'controller' | 'group')[]>
> = {
  NeedsClarification: ['submitter'],
  ReadyToProvision: ['controller'],
  Provisioning: ['group'],
  Completed: ['group'],
  Failed: ['controller', 'submitter'],
};
