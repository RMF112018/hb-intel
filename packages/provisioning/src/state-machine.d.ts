/**
 * D-PH6-08: Request lifecycle state model for Project Setup Requests.
 * Traceability: docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md §6.8.2
 */
export type ProjectSetupRequestState = 'Submitted' | 'UnderReview' | 'NeedsClarification' | 'AwaitingExternalSetup' | 'ReadyToProvision' | 'Provisioning' | 'Completed' | 'Failed';
/**
 * D-PH6-08 valid transitions: from-state -> allowed next states.
 * Inline comments document business intent for non-obvious edges.
 */
export declare const STATE_TRANSITIONS: Record<ProjectSetupRequestState, ProjectSetupRequestState[]>;
/**
 * D-PH6-08 transition validator used by lifecycle API and UI.
 */
export declare function isValidTransition(from: ProjectSetupRequestState, to: ProjectSetupRequestState): boolean;
/**
 * D-PH6-08 notification routing map by target state.
 * Each target value names recipient groups used by notification handlers.
 */
export declare const STATE_NOTIFICATION_TARGETS: Partial<Record<ProjectSetupRequestState, ('submitter' | 'controller' | 'group')[]>>;
//# sourceMappingURL=state-machine.d.ts.map