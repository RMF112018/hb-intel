import { recordStructuredAuditEvent } from '../audit/auditLogger.js';
/**
 * Default policy for standard override request intake.
 *
 * Alignment notes:
 * - PH5.12 item 4: default expiration required for most overrides.
 * - D-07: deterministic workflow defaults and validation paths.
 */
export const DEFAULT_OVERRIDE_REQUEST_POLICY = {
    defaultExpirationHours: 24 * 30,
    minimumBusinessReasonLength: 12,
};
/**
 * Validate structured override request input before creating persisted records.
 *
 * Alignment notes:
 * - D-10: provider/source identity is not used for authorization decisions.
 * - D-12: UI surfaces consume validated workflow contracts only.
 */
export function validateStructuredOverrideRequest(command, policy = DEFAULT_OVERRIDE_REQUEST_POLICY) {
    const errors = [];
    if (!command.requestId.trim()) {
        errors.push('requestId is required.');
    }
    if (!command.targetUserId.trim()) {
        errors.push('targetUserId is required.');
    }
    if (!command.baseRoleId.trim()) {
        errors.push('baseRoleId is required.');
    }
    if (!command.targetFeatureId.trim()) {
        errors.push('targetFeatureId is required.');
    }
    if (!command.targetAction.trim()) {
        errors.push('targetAction is required.');
    }
    if (!command.requestedChange.grants.length) {
        errors.push('requestedChange.grants must include at least one grant/restriction value.');
    }
    if (command.businessReason.trim().length < policy.minimumBusinessReasonLength) {
        errors.push(`businessReason must be at least ${policy.minimumBusinessReasonLength} characters for governed approval review.`);
    }
    const hasDuration = typeof command.requestedDurationHours === 'number';
    const hasExpiration = typeof command.requestedExpiresAt === 'string';
    if (!hasDuration && !hasExpiration) {
        errors.push('requestedDurationHours or requestedExpiresAt is required.');
    }
    if (hasDuration && command.requestedDurationHours <= 0) {
        errors.push('requestedDurationHours must be greater than zero.');
    }
    if (hasExpiration && Number.isNaN(new Date(command.requestedExpiresAt).getTime())) {
        errors.push('requestedExpiresAt must be a valid ISO timestamp.');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * Create the structured workflow request model used by approval/renewal modules.
 */
export function createStructuredOverrideRequest(command, policy = DEFAULT_OVERRIDE_REQUEST_POLICY) {
    const validation = validateStructuredOverrideRequest(command, policy);
    if (!validation.valid) {
        throw new Error(`Invalid structured override request: ${validation.errors.join(' ')}`);
    }
    const requestedAt = command.requestedAt ?? new Date().toISOString();
    const requestedExpiresAt = resolveRequestedExpiration(command, policy, requestedAt);
    const request = {
        requestId: command.requestId,
        targetUserId: command.targetUserId,
        baseRoleId: command.baseRoleId,
        requestedChange: {
            mode: command.requestedChange.mode,
            grants: normalizeValues(command.requestedChange.grants),
        },
        businessReason: command.businessReason.trim(),
        targetFeatureId: command.targetFeatureId.trim(),
        targetAction: command.targetAction.trim(),
        requesterId: command.requesterId.trim(),
        requestedAt,
        requestedDurationHours: command.requestedDurationHours,
        requestedExpiresAt,
        renewalOfRequestId: command.renewalOfRequestId,
    };
    // PH5.13: every access request submission is captured as structured audit data.
    recordStructuredAuditEvent({
        eventType: 'request-submitted',
        actorId: request.requesterId,
        subjectUserId: request.targetUserId,
        source: 'workflow',
        requestId: request.requestId,
        featureId: request.targetFeatureId,
        action: request.targetAction,
        outcome: 'pending',
        details: {
            baseRoleId: request.baseRoleId,
            requestedChange: request.requestedChange,
            renewalOfRequestId: request.renewalOfRequestId,
            requestedExpiresAt: request.requestedExpiresAt,
        },
        occurredAt: request.requestedAt,
    });
    return request;
}
/**
 * Bridge structured request model into Phase 5.10 override record input contract.
 */
export function toOverrideRequestInput(request) {
    return {
        id: request.requestId,
        targetUserId: request.targetUserId,
        baseRoleId: request.baseRoleId,
        requestedChange: request.requestedChange,
        reason: request.businessReason,
        requesterId: request.requesterId,
        requestedAt: request.requestedAt,
        expiresAt: request.requestedExpiresAt,
        emergency: false,
        reviewRequired: false,
    };
}
function resolveRequestedExpiration(command, policy, requestedAt) {
    if (command.requestedExpiresAt) {
        return command.requestedExpiresAt;
    }
    const durationHours = command.requestedDurationHours ?? policy.defaultExpirationHours;
    const requestedAtTime = new Date(requestedAt).getTime();
    const expirationTime = requestedAtTime + durationHours * 60 * 60 * 1000;
    return new Date(expirationTime).toISOString();
}
function normalizeValues(values) {
    return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort();
}
//# sourceMappingURL=overrideRequest.js.map