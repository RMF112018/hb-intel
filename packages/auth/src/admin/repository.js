import { buildRoleAccessLookup, isRenewalDue, sortAuditEventsDescending, } from './workflows.js';
/**
 * Shared snapshot projection builder for Phase 5.11 admin surfaces.
 */
export function buildAccessControlAdminSnapshot(params) {
    const searchTerm = params.query?.searchTerm?.trim().toLowerCase() ?? '';
    const includes = (candidate) => searchTerm.length === 0 || candidate.toLowerCase().includes(searchTerm);
    const users = params.users.filter((user) => includes(user.userId) || includes(user.displayName) || includes(user.email));
    const overrideMatches = params.overrides.filter((override) => includes(`${override.id} ${override.targetUserId} ${override.baseRoleId} ${override.reason}`));
    const roleAccess = buildRoleAccessLookup(params.roles, overrideMatches).filter((role) => includes(role.roleId) || includes(role.roleName) || role.grants.some((grant) => includes(grant)));
    return {
        generatedAt: new Date().toISOString(),
        users,
        roleAccess,
        overrideReviewQueue: overrideMatches.filter((override) => override.approval.state === 'pending' && !override.emergency),
        renewalQueue: overrideMatches.filter((override) => isRenewalDue(override)),
        roleChangeReviewQueue: overrideMatches.filter((override) => override.review.reviewRequired),
        emergencyReviewQueue: overrideMatches.filter((override) => override.emergency && override.approval.state === 'pending'),
        auditEvents: sortAuditEventsDescending(params.audits),
    };
}
/**
 * Minimal repository helper for consumers that need a one-call snapshot payload.
 */
export async function getAccessControlAdminSnapshot(repository, query) {
    return repository.getSnapshot(query);
}
//# sourceMappingURL=repository.js.map