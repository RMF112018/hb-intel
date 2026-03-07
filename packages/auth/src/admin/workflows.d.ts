import type { AccessControlAuditEventRecord, AccessControlOverrideRecord, AccessControlRoleAccessRecord, AccessControlWorkflowResult, BaseRoleDefinition, ReviewEmergencyAccessCommand, ReviewOverrideCommand, ResolveRoleChangeReviewCommand, ReviewOverrideDecision, RenewOverrideCommand } from '../types.js';
/**
 * Convert one override record into a normalized queue row model for admin UX.
 */
export declare function toOverrideQueueItem(record: AccessControlOverrideRecord): AccessControlOverrideRecord;
/**
 * Determine whether an override is due for renewal based on expiration metadata.
 */
export declare function isRenewalDue(record: AccessControlOverrideRecord, renewalWindowHours?: number, now?: Date): boolean;
/**
 * Build a role/access lookup projection from base role definitions and overrides.
 */
export declare function buildRoleAccessLookup(roles: BaseRoleDefinition[], overrides: AccessControlOverrideRecord[]): AccessControlRoleAccessRecord[];
/**
 * Apply an approval or rejection decision for a standard override request.
 */
export declare function applyOverrideReviewDecision(record: AccessControlOverrideRecord, command: Omit<ReviewOverrideCommand, 'overrideId'>): AccessControlWorkflowResult;
/**
 * Apply renewal handling for an expiring override.
 */
export declare function applyRenewalRequest(record: AccessControlOverrideRecord, command: Omit<RenewOverrideCommand, 'overrideId'>): AccessControlWorkflowResult;
/**
 * Resolve role-change review queue entries by clearing mandatory review flags.
 */
export declare function resolveRoleChangeReview(record: AccessControlOverrideRecord, command: Omit<ResolveRoleChangeReviewCommand, 'overrideId'>): AccessControlWorkflowResult;
/**
 * Resolve emergency-access review queue entries with explicit reason requirement.
 */
export declare function applyEmergencyReviewDecision(record: AccessControlOverrideRecord, command: Omit<ReviewEmergencyAccessCommand, 'overrideId'>): AccessControlWorkflowResult;
/**
 * Filter overrides by decision state for role-review and emergency queues.
 */
export declare function deriveQueueByDecision(overrides: AccessControlOverrideRecord[], decision: ReviewOverrideDecision): AccessControlOverrideRecord[];
/**
 * Keep audit events newest-first for read-only admin visibility.
 */
export declare function sortAuditEventsDescending(events: AccessControlAuditEventRecord[]): AccessControlAuditEventRecord[];
//# sourceMappingURL=workflows.d.ts.map