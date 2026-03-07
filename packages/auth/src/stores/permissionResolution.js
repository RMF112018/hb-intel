/**
 * Resolve effective permission truth from all required Phase 5.3 sources.
 *
 * Deterministic precedence:
 * 1) base role grants + default feature-action grants
 * 2) explicit per-user overrides (grant/deny)
 * 3) temporary/expiring override filtering
 * 4) emergency access grants (when active and not expired)
 *
 * Alignment notes:
 * - D-10: central shared API prevents direct feature-level authorization logic.
 */
export function resolveEffectivePermissions(input) {
    const now = input.now ?? new Date();
    const grants = new Set([
        ...input.baseRoleGrants,
        ...input.defaultFeatureActionGrants,
    ]);
    const denied = new Set();
    const expiredOverrides = [];
    for (const override of input.explicitOverrides) {
        if (isOverrideExpired(override, now)) {
            expiredOverrides.push(override.action);
            continue;
        }
        if (override.mode === 'grant') {
            grants.add(override.action);
            denied.delete(override.action);
            continue;
        }
        grants.delete(override.action);
        denied.add(override.action);
    }
    const emergencyAccessActive = isEmergencyAccessActive(input.emergencyAccess, now);
    if (emergencyAccessActive && input.emergencyAccess) {
        for (const emergencyGrant of input.emergencyAccess.grants) {
            grants.add(emergencyGrant);
            denied.delete(emergencyGrant);
        }
    }
    return {
        grants: Array.from(grants).sort(),
        denied: Array.from(denied).sort(),
        expiredOverrides: Array.from(new Set(expiredOverrides)).sort(),
        emergencyAccessActive,
    };
}
/**
 * Shared evaluator used by guards/hooks/features to consume centralized
 * permission truth instead of recomputing grants in feature modules.
 */
export function isPermissionGranted(effective, action) {
    if (effective.denied.includes(action)) {
        return false;
    }
    if (effective.grants.includes('*:*')) {
        return true;
    }
    if (effective.grants.includes(action)) {
        return true;
    }
    // Allow domain-wide wildcard grants such as `project:*`.
    const actionSegments = action.split(':');
    if (actionSegments.length === 2) {
        const domainWildcard = `${actionSegments[0]}:*`;
        return effective.grants.includes(domainWildcard);
    }
    return false;
}
/**
 * Lightweight helper to wrap flat grant arrays in an EffectivePermissionSet.
 * Useful when evaluating permission store snapshots outside full resolution.
 */
export function toEffectivePermissionSet(grants) {
    return {
        grants: Array.from(new Set(grants)).sort(),
        denied: [],
        expiredOverrides: [],
        emergencyAccessActive: false,
    };
}
/**
 * Evaluate whether a specific action is allowed for a registered feature.
 *
 * Locked Option C behavior:
 * - default deny for missing registration
 * - feature-level and action-level grants both enforced
 */
export function isActionAllowed(params) {
    const evaluation = evaluateFeatureAccess(params);
    return evaluation.allowed;
}
/**
 * Determine whether a feature should be visible in navigation/shell surfaces.
 */
export function isFeatureVisible(params) {
    const evaluation = evaluateFeatureAccess({
        ...params,
        action: 'view',
    });
    return evaluation.visible;
}
/**
 * Determine whether a feature can be interacted with for a given action.
 */
export function isFeatureAccessible(params) {
    const evaluation = evaluateFeatureAccess({
        ...params,
        action: params.action ?? 'view',
    });
    return evaluation.allowed;
}
/**
 * Centralized access evaluator consumed by guards/hooks/stores.
 */
export function evaluateFeatureAccess(params) {
    const { effective, registration, action, runtimeMode } = params;
    if (!isProtectedFeatureRegistered(registration)) {
        return {
            featureId: 'unregistered',
            action,
            registered: false,
            visible: false,
            allowed: false,
            locked: false,
            denialReason: 'Default-deny policy: protected feature is not registered in authorization contracts.',
        };
    }
    if (!isRuntimeModeCompatible(registration, runtimeMode)) {
        return {
            featureId: registration.featureId,
            action,
            registered: true,
            visible: false,
            allowed: false,
            locked: false,
            denialReason: 'Feature is not compatible with the current runtime mode.',
        };
    }
    const hasFeatureGrants = registration.requiredFeatureGrants.every((grant) => isPermissionGranted(effective, grant));
    const actionGrants = registration.actionGrants[action] ?? [];
    const hasActionGrants = actionGrants.length === 0 || actionGrants.every((grant) => isPermissionGranted(effective, grant));
    const allowed = hasFeatureGrants && hasActionGrants;
    const locked = !allowed && registration.visibility === 'discoverable-locked';
    const visible = allowed || locked;
    return {
        featureId: registration.featureId,
        action,
        registered: true,
        visible,
        allowed,
        locked,
        denialReason: allowed
            ? null
            : registration.lockMessage ??
                'You do not currently have the required role/permission mapping for this feature.',
    };
}
/**
 * Practical enforcement helper to verify protected feature registration exists
 * before wiring feature-level access checks.
 */
export function isProtectedFeatureRegistered(registration) {
    return Boolean(registration && registration.featureId);
}
/**
 * Produce a diagnostics-friendly snapshot for logs/audit and debugging.
 */
export function getPermissionResolutionSnapshot(input) {
    return {
        evaluatedAt: (input.now ?? new Date()).toISOString(),
        inputSummary: {
            baseRoleGrantCount: input.baseRoleGrants.length,
            defaultGrantCount: input.defaultFeatureActionGrants.length,
            overrideCount: input.explicitOverrides.length,
            emergencyConfigured: Boolean(input.emergencyAccess),
        },
        effective: resolveEffectivePermissions(input),
    };
}
function isRuntimeModeCompatible(registration, runtimeMode) {
    if (!registration.compatibleModes || registration.compatibleModes === 'all') {
        return true;
    }
    if (!runtimeMode) {
        return false;
    }
    return registration.compatibleModes.includes(runtimeMode);
}
function isOverrideExpired(override, now) {
    if (!override.expiresAt) {
        return false;
    }
    return new Date(override.expiresAt).getTime() <= now.getTime();
}
function isEmergencyAccessActive(emergencyAccess, now) {
    if (!emergencyAccess || !emergencyAccess.enabled) {
        return false;
    }
    if (!emergencyAccess.expiresAt) {
        return true;
    }
    return new Date(emergencyAccess.expiresAt).getTime() > now.getTime();
}
//# sourceMappingURL=permissionResolution.js.map