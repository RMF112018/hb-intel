/**
 * D-PH6-08: Request lifecycle state model for Project Setup Requests.
 * Traceability: docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md §6.8.2
 */
export type ProjectSetupRequestState =
  | 'Submitted'
  | 'UnderReview'
  | 'NeedsClarification'
  | 'AwaitingExternalSetup'
  | 'ReadyToProvision'
  | 'Provisioning'
  | 'Completed'
  | 'Failed';

/**
 * D-PH6-08 valid transitions: from-state -> allowed next states.
 * Inline comments document business intent for non-obvious edges.
 */
export const STATE_TRANSITIONS: Record<ProjectSetupRequestState, ProjectSetupRequestState[]> = {
  Submitted: ['UnderReview'],
  UnderReview: ['NeedsClarification', 'AwaitingExternalSetup', 'ReadyToProvision'],
  NeedsClarification: ['UnderReview'], // Coordinator updates request then review resumes.
  AwaitingExternalSetup: ['ReadyToProvision'],
  ReadyToProvision: ['Provisioning'], // Requires projectNumber validation before transition.
  Provisioning: ['Completed', 'Failed'],
  Completed: [], // Terminal state.
  Failed: ['UnderReview'], // Controller may reopen for correction/retry.
};

/**
 * D-PH6-08 transition validator used by lifecycle API and UI.
 */
export function isValidTransition(from: ProjectSetupRequestState, to: ProjectSetupRequestState): boolean {
  return STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * D-PH6-08 notification routing map by target state.
 * Each target value names recipient groups used by notification handlers.
 */
export const STATE_NOTIFICATION_TARGETS: Partial<
  Record<ProjectSetupRequestState, ('submitter' | 'controller' | 'group' | 'admin')[]>
> = {
  Submitted: ['controller'], // Controller receives new request for review.
  NeedsClarification: ['submitter'], // Request submitter must provide missing details.
  ReadyToProvision: ['controller'], // Controller gets action-ready signal.
  Provisioning: ['group'], // Project group gets start notification.
  Completed: ['group'], // Project group gets completion notification.
  Failed: ['controller', 'submitter'], // Both controller and submitter are informed of failure.
};
