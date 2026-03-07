import type { AccessControlOverrideRecord, AccessControlRecordStatus, AccessOverrideRequest, BaseRoleDefinitionVersionDiff } from '../types.js';
/**
 * Create a new explicit override request record.
 *
 * Governance notes:
 * - Roles remain clean defaults; exceptions are modeled as first-class records.
 * - Microsoft/SharePoint identity is treated as input, not authorization source-of-truth.
 */
export declare function createOverrideRequest(request: AccessOverrideRequest): AccessControlOverrideRecord;
/**
 * Transition a pending override request to approved/active.
 */
export declare function approveOverrideRequest(record: AccessControlOverrideRecord, approval: {
    approverId: string;
    approvedAt?: string;
}): AccessControlOverrideRecord;
/**
 * Mark an override as revoked.
 */
export declare function revokeOverrideRecord(record: AccessControlOverrideRecord): AccessControlOverrideRecord;
/**
 * Mark an override as archived.
 */
export declare function archiveOverrideRecord(record: AccessControlOverrideRecord): AccessControlOverrideRecord;
/**
 * Renew an expiring override with a new expiration and explicit re-approval marker.
 */
export declare function renewOverrideRecord(record: AccessControlOverrideRecord, params: {
    expiresAt: string;
}): AccessControlOverrideRecord;
/**
 * Resolve the current lifecycle status considering explicit status + expiration metadata.
 */
export declare function resolveOverrideLifecycleStatus(record: AccessControlOverrideRecord, now?: Date): AccessControlRecordStatus;
/**
 * Flag one override for mandatory review.
 */
export declare function flagOverrideForReview(record: AccessControlOverrideRecord, params: {
    reason: string;
    markedBy: string;
    markedAt?: string;
}): AccessControlOverrideRecord;
/**
 * Mark dependent overrides for review when base-role definitions change.
 *
 * This intentionally does not mutate grants automatically to avoid silent rebasing.
 */
export declare function markDependentOverridesForRoleReview(params: {
    overrides: AccessControlOverrideRecord[];
    changedRoles: BaseRoleDefinitionVersionDiff[];
    markedBy: string;
    markedAt?: string;
}): AccessControlOverrideRecord[];
//# sourceMappingURL=overrideRecord.d.ts.map