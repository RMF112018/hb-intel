import { approveOverrideRequest } from '../backend/overrideRecord.js';
import { createAccessControlAuditEvent, } from '../backend/accessControlModel.js';
import { createOverrideRequest } from '../backend/overrideRecord.js';
import { toOverrideRequestInput } from './overrideRequest.js';
import { recordStructuredAuditEvent } from '../audit/auditLogger.js';
/**
 * Default approval policy for Phase 5.12 standard override governance.
 *
 * Alignment notes:
 * - PH5 item 4 + 5.12 item 4: default expiration for standard overrides.
 * - PH5 item 3 + 5.12 item 3: permanent access requires explicit justification.
 */
export const DEFAULT_OVERRIDE_APPROVAL_POLICY = {
    defaultExpirationHours: 24 * 30,
    minimumPermanentJustificationLength: 20,
};
/**
 * Create a pending override record from a structured request.
 */
export function createPendingOverrideFromRequest(request) {
    const pending = createOverrideRequest(toOverrideRequestInput(request));
    // PH5.13: override creation is tracked separately from request submission.
    recordStructuredAuditEvent({
        eventType: 'override-created',
        actorId: request.requesterId,
        subjectUserId: request.targetUserId,
        source: 'workflow',
        requestId: request.requestId,
        overrideId: pending.id,
        featureId: request.targetFeatureId,
        action: request.targetAction,
        outcome: 'success',
        details: {
            baseRoleId: request.baseRoleId,
            requestedExpiresAt: request.requestedExpiresAt,
        },
        occurredAt: request.requestedAt,
    });
    return pending;
}
/**
 * Apply approve/reject decisions for standard override workflows.
 */
export function applyOverrideApprovalAction(params) {
    const policy = params.policy ?? DEFAULT_OVERRIDE_APPROVAL_POLICY;
    const pendingRecord = createPendingOverrideFromRequest(params.request);
    if (params.command.decision === 'reject') {
        return rejectOverride(pendingRecord, params.command);
    }
    return approveOverride(pendingRecord, params.command, policy);
}
function approveOverride(record, command, policy) {
    const expiresAt = resolveApprovedExpiration(command, policy, record.approval.requestedAt);
    if (command.markPermanent) {
        const justification = command.permanentJustification?.trim() ?? '';
        if (justification.length < policy.minimumPermanentJustificationLength) {
            return {
                ok: false,
                decision: 'approve',
                message: `Permanent override requires explicit justification (minimum ${policy.minimumPermanentJustificationLength} characters).`,
            };
        }
    }
    const approved = approveOverrideRequest(record, {
        approverId: command.reviewerId,
        approvedAt: command.reviewedAt,
    });
    const updated = {
        ...approved,
        expiration: {
            expiresAt: command.markPermanent ? undefined : expiresAt,
            renewalState: command.markPermanent ? 'not-required' : approved.expiration.renewalState,
        },
        review: {
            ...approved.review,
            reviewRequired: false,
            reviewReason: command.markPermanent ? command.permanentJustification : approved.review.reviewReason,
        },
    };
    return {
        ok: true,
        decision: command.decision,
        message: 'Override approved with governed expiration policy.',
        override: updated,
        audit: createDecisionAudit(updated, command, 'request-approved', {
            expiresAt: updated.expiration.expiresAt,
            permanent: command.markPermanent ?? false,
        }),
    };
}
function rejectOverride(record, command) {
    const reason = command.rejectionReason?.trim();
    if (!reason) {
        return {
            ok: false,
            decision: 'reject',
            message: 'Rejection reason is required.',
        };
    }
    const updated = {
        ...record,
        approval: {
            ...record.approval,
            state: 'rejected',
            approverId: command.reviewerId,
            approvedAt: command.reviewedAt ?? new Date().toISOString(),
        },
        status: 'revoked',
        review: {
            ...record.review,
            reviewRequired: false,
            reviewReason: reason,
            reviewMarkedBy: command.reviewerId,
            reviewMarkedAt: command.reviewedAt ?? new Date().toISOString(),
        },
    };
    return {
        ok: true,
        decision: 'reject',
        message: 'Override rejected.',
        override: updated,
        audit: createDecisionAudit(updated, command, 'request-rejected', { reason }),
    };
}
function resolveApprovedExpiration(command, policy, requestedAt) {
    if (command.expiresAt) {
        return command.expiresAt;
    }
    const requested = new Date(requestedAt);
    requested.setHours(requested.getHours() + policy.defaultExpirationHours);
    return requested.toISOString();
}
function createDecisionAudit(override, command, eventType, details) {
    const outcome = eventType === 'request-approved' ? 'success' : 'denied';
    const event = createAccessControlAuditEvent({
        eventType,
        actorId: command.reviewerId,
        subjectUserId: override.targetUserId,
        overrideId: override.id,
        source: 'workflow',
        outcome,
        details,
        occurredAt: command.reviewedAt,
    });
    recordStructuredAuditEvent({
        eventType,
        actorId: command.reviewerId,
        subjectUserId: override.targetUserId,
        source: 'workflow',
        overrideId: override.id,
        outcome,
        details,
        occurredAt: command.reviewedAt,
    });
    if (eventType === 'request-rejected') {
        recordStructuredAuditEvent({
            eventType: 'override-revoked',
            actorId: command.reviewerId,
            subjectUserId: override.targetUserId,
            source: 'workflow',
            overrideId: override.id,
            outcome: 'success',
            details: {
                reason: details?.reason,
            },
            occurredAt: command.reviewedAt,
        });
    }
    return event;
}
/**
 * Helper for narrowing known approval decision values.
 */
export function isOverrideApprovalDecision(value) {
    return value === 'approve' || value === 'reject';
}
//# sourceMappingURL=overrideApproval.js.map