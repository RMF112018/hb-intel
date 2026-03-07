import type { EffectivePermissionSet, FeatureAccessEvaluation, FeaturePermissionRegistration, PermissionResolutionInput, PermissionResolutionSnapshot, StandardActionPermission } from '../types.js';
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
export declare function resolveEffectivePermissions(input: PermissionResolutionInput): EffectivePermissionSet;
/**
 * Shared evaluator used by guards/hooks/features to consume centralized
 * permission truth instead of recomputing grants in feature modules.
 */
export declare function isPermissionGranted(effective: EffectivePermissionSet, action: string): boolean;
/**
 * Lightweight helper to wrap flat grant arrays in an EffectivePermissionSet.
 * Useful when evaluating permission store snapshots outside full resolution.
 */
export declare function toEffectivePermissionSet(grants: string[]): EffectivePermissionSet;
/**
 * Evaluate whether a specific action is allowed for a registered feature.
 *
 * Locked Option C behavior:
 * - default deny for missing registration
 * - feature-level and action-level grants both enforced
 */
export declare function isActionAllowed(params: {
    effective: EffectivePermissionSet;
    registration: FeaturePermissionRegistration | null | undefined;
    action: StandardActionPermission;
    runtimeMode?: string | null;
}): boolean;
/**
 * Determine whether a feature should be visible in navigation/shell surfaces.
 */
export declare function isFeatureVisible(params: {
    effective: EffectivePermissionSet;
    registration: FeaturePermissionRegistration | null | undefined;
    runtimeMode?: string | null;
}): boolean;
/**
 * Determine whether a feature can be interacted with for a given action.
 */
export declare function isFeatureAccessible(params: {
    effective: EffectivePermissionSet;
    registration: FeaturePermissionRegistration | null | undefined;
    action?: StandardActionPermission;
    runtimeMode?: string | null;
}): boolean;
/**
 * Centralized access evaluator consumed by guards/hooks/stores.
 */
export declare function evaluateFeatureAccess(params: {
    effective: EffectivePermissionSet;
    registration: FeaturePermissionRegistration | null | undefined;
    action: StandardActionPermission;
    runtimeMode?: string | null;
}): FeatureAccessEvaluation;
/**
 * Practical enforcement helper to verify protected feature registration exists
 * before wiring feature-level access checks.
 */
export declare function isProtectedFeatureRegistered(registration: FeaturePermissionRegistration | null | undefined): registration is FeaturePermissionRegistration;
/**
 * Produce a diagnostics-friendly snapshot for logs/audit and debugging.
 */
export declare function getPermissionResolutionSnapshot(input: PermissionResolutionInput): PermissionResolutionSnapshot;
//# sourceMappingURL=permissionResolution.d.ts.map