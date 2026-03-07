import { useAuthStore } from '../stores/authStore.js';
import { usePermissionStore } from '../stores/permissionStore.js';
/**
 * Returns the current authenticated user from the auth store.
 * Blueprint §1e — dual-mode auth hook.
 */
export function useCurrentUser() {
    return useAuthStore((s) => s.currentUser);
}
/**
 * Returns the normalized current session for centralized guard/hook consumers.
 */
export function useCurrentSession() {
    return useAuthStore((s) => s.session);
}
/**
 * Returns the resolved runtime mode from the central auth store.
 */
export function useResolvedRuntimeMode() {
    return useAuthStore((s) => s.runtimeMode);
}
/**
 * Returns whether the current user has a specific permission action.
 * Blueprint §1e — permission check hook.
 */
export function usePermission(action) {
    return usePermissionStore((s) => s.hasPermission(action));
}
/**
 * Returns centralized feature-access evaluation for a feature/action pair.
 */
export function usePermissionEvaluation(featureId, action = 'view') {
    const runtimeMode = useResolvedRuntimeMode();
    return usePermissionStore((s) => s.getFeatureAccess(featureId, action, runtimeMode));
}
/**
 * Returns whether a specific feature flag is enabled.
 * Blueprint §1e — feature flag hook.
 */
export function useFeatureFlag(feature) {
    return usePermissionStore((s) => s.hasFeatureFlag(feature));
}
//# sourceMappingURL=index.js.map