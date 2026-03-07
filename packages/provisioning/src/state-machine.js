/**
 * D-PH6-08 valid transitions: from-state -> allowed next states.
 * Inline comments document business intent for non-obvious edges.
 */
export const STATE_TRANSITIONS = {
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
export function isValidTransition(from, to) {
    return STATE_TRANSITIONS[from]?.includes(to) ?? false;
}
/**
 * D-PH6-08 notification routing map by target state.
 * Each target value names recipient groups used by notification handlers.
 */
export const STATE_NOTIFICATION_TARGETS = {
    NeedsClarification: ['submitter'], // Request submitter must provide missing details.
    ReadyToProvision: ['controller'], // Controller gets action-ready signal.
    Provisioning: ['group'], // Project group gets start notification.
    Completed: ['group'], // Project group gets completion notification.
    Failed: ['controller', 'submitter'], // Both controller and submitter are informed of failure.
};
//# sourceMappingURL=state-machine.js.map