import { createAccessControlAuditEvent, createBaseRoleDefinition, createOverrideRequest, markDependentOverridesForRoleReview, } from '../backend/index.js';
import { buildAccessControlAdminSnapshot } from './repository.js';
import { applyEmergencyReviewDecision, applyOverrideReviewDecision, applyRenewalRequest, resolveRoleChangeReview, } from './workflows.js';
/**
 * Build an in-memory repository implementation for Phase 5.11 admin workflows.
 *
 * This adapter intentionally models backend contracts without replacing the
 * richer app-owned backend/rules layer from Phase 5.10.
 */
export function createInMemoryAccessControlAdminRepository(seed) {
    const state = {
        users: seed?.users ?? buildDefaultUsers(),
        roles: seed?.roles ?? buildDefaultRoles(),
        overrides: seed?.overrides ?? buildDefaultOverrides(),
        audits: seed?.audits ?? buildDefaultAudits(),
    };
    return {
        async getSnapshot(query) {
            return buildAccessControlAdminSnapshot({
                query,
                users: state.users,
                roles: state.roles,
                overrides: state.overrides,
                audits: state.audits,
            });
        },
        async reviewOverride(command) {
            const index = findOverrideIndex(state.overrides, command.overrideId);
            if (index < 0) {
                return {
                    ok: false,
                    message: `Override ${command.overrideId} was not found.`,
                };
            }
            const result = applyOverrideReviewDecision(state.overrides[index], {
                reviewerId: command.reviewerId,
                decision: command.decision,
                reason: command.reason,
                reviewedAt: command.reviewedAt,
            });
            return commitWorkflowResult(state, index, result);
        },
        async renewOverride(command) {
            const index = findOverrideIndex(state.overrides, command.overrideId);
            if (index < 0) {
                return {
                    ok: false,
                    message: `Override ${command.overrideId} was not found.`,
                };
            }
            const result = applyRenewalRequest(state.overrides[index], {
                reviewerId: command.reviewerId,
                reason: command.reason,
                expiresAt: command.expiresAt,
                reviewedAt: command.reviewedAt,
            });
            return commitWorkflowResult(state, index, result);
        },
        async resolveRoleChangeReview(command) {
            const index = findOverrideIndex(state.overrides, command.overrideId);
            if (index < 0) {
                return {
                    ok: false,
                    message: `Override ${command.overrideId} was not found.`,
                };
            }
            const result = resolveRoleChangeReview(state.overrides[index], {
                reviewerId: command.reviewerId,
                reason: command.reason,
                reviewedAt: command.reviewedAt,
            });
            return commitWorkflowResult(state, index, result);
        },
        async reviewEmergencyAccess(command) {
            const index = findOverrideIndex(state.overrides, command.overrideId);
            if (index < 0) {
                return {
                    ok: false,
                    message: `Override ${command.overrideId} was not found.`,
                };
            }
            const result = applyEmergencyReviewDecision(state.overrides[index], {
                reviewerId: command.reviewerId,
                decision: command.decision,
                reason: command.reason,
                reviewedAt: command.reviewedAt,
            });
            return commitWorkflowResult(state, index, result);
        },
    };
}
/**
 * Shared singleton repository for app shells that need a ready-to-use adapter.
 */
export const defaultAccessControlAdminRepository = createInMemoryAccessControlAdminRepository();
function commitWorkflowResult(state, index, result) {
    if (result.ok && result.updatedOverride) {
        state.overrides[index] = result.updatedOverride;
    }
    if (result.ok && result.auditEvent) {
        state.audits.unshift(result.auditEvent);
    }
    return result;
}
function findOverrideIndex(overrides, overrideId) {
    return overrides.findIndex((override) => override.id === overrideId);
}
function buildDefaultUsers() {
    return [
        {
            userId: 'user-admin-01',
            displayName: 'Avery Admin',
            email: 'avery.admin@hbintel.local',
            resolvedRoles: ['Administrator'],
            grants: ['*:*'],
        },
        {
            userId: 'user-pm-01',
            displayName: 'Parker Manager',
            email: 'parker.manager@hbintel.local',
            resolvedRoles: ['ProjectManager'],
            grants: ['project-hub:view', 'project-hub:edit', 'estimating:view'],
        },
        {
            userId: 'user-fin-01',
            displayName: 'Finley Finance',
            email: 'finley.finance@hbintel.local',
            resolvedRoles: ['AccountingLead'],
            grants: ['accounting:view', 'accounting:approve'],
        },
    ];
}
function buildDefaultRoles() {
    return [
        createBaseRoleDefinition({
            id: 'administrator',
            name: 'Administrator',
            grants: ['*:*'],
            version: 4,
            updatedBy: 'security-team',
            updatedAt: '2026-03-06T10:00:00.000Z',
        }),
        createBaseRoleDefinition({
            id: 'project-manager',
            name: 'Project Manager',
            grants: ['project-hub:view', 'project-hub:edit', 'estimating:view'],
            version: 2,
            updatedBy: 'security-team',
            updatedAt: '2026-03-06T10:00:00.000Z',
        }),
        createBaseRoleDefinition({
            id: 'accounting-lead',
            name: 'Accounting Lead',
            grants: ['accounting:view', 'accounting:approve'],
            version: 3,
            updatedBy: 'security-team',
            updatedAt: '2026-03-06T10:00:00.000Z',
        }),
    ];
}
function buildDefaultOverrides() {
    const pendingRegular = createOverrideRequest({
        id: 'ovr-1001',
        targetUserId: 'user-pm-01',
        baseRoleId: 'project-manager',
        requestedChange: {
            mode: 'grant',
            grants: ['accounting:view'],
        },
        reason: 'Cross-team forecasting support for closeout reporting.',
        requesterId: 'user-pm-01',
        requestedAt: '2026-03-05T09:00:00.000Z',
        expiresAt: '2026-03-20T00:00:00.000Z',
        emergency: false,
    });
    const emergencyPending = createOverrideRequest({
        id: 'ovr-1002',
        targetUserId: 'user-fin-01',
        baseRoleId: 'accounting-lead',
        requestedChange: {
            mode: 'grant',
            grants: ['project-hub:approve'],
        },
        reason: 'Emergency month-end close dependency for project financial sign-off.',
        requesterId: 'user-fin-01',
        requestedAt: '2026-03-06T12:30:00.000Z',
        expiresAt: '2026-03-07T12:30:00.000Z',
        emergency: true,
    });
    const roleDriftCandidate = createOverrideRequest({
        id: 'ovr-1003',
        targetUserId: 'user-pm-01',
        baseRoleId: 'project-manager',
        requestedChange: {
            mode: 'restriction',
            grants: ['project-hub:edit'],
        },
        reason: 'Temporary separation-of-duties control during audit window.',
        requesterId: 'user-admin-01',
        requestedAt: '2026-03-01T10:00:00.000Z',
        expiresAt: '2026-03-08T00:00:00.000Z',
        emergency: false,
    });
    return markDependentOverridesForRoleReview({
        overrides: [pendingRegular, emergencyPending, roleDriftCandidate],
        changedRoles: [
            {
                roleId: 'project-manager',
                previousVersion: 1,
                nextVersion: 2,
            },
        ],
        markedBy: 'policy-engine',
        markedAt: '2026-03-06T08:00:00.000Z',
    });
}
function buildDefaultAudits() {
    return [
        createAccessControlAuditEvent({
            eventType: 'request-submitted',
            actorId: 'user-pm-01',
            subjectUserId: 'user-pm-01',
            overrideId: 'ovr-1001',
            source: 'admin',
            outcome: 'pending',
            occurredAt: '2026-03-05T09:00:00.000Z',
        }),
        createAccessControlAuditEvent({
            eventType: 'review-flag-generated',
            actorId: 'policy-engine',
            subjectUserId: 'user-pm-01',
            overrideId: 'ovr-1003',
            source: 'admin',
            outcome: 'pending',
            occurredAt: '2026-03-06T08:00:00.000Z',
        }),
    ];
}
//# sourceMappingURL=inMemoryRepository.js.map