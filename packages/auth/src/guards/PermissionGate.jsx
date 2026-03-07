import { usePermissionStore } from '../stores/permissionStore.js';
import { useAuthStore } from '../stores/authStore.js';
/**
 * Renders children only if the current user has the specified permission.
 * Blueprint §1e — permission-based access guard.
 */
export function PermissionGate({ action, featureId, standardAction = 'view', children, fallback = null, }) {
    const runtimeMode = useAuthStore((s) => s.runtimeMode);
    const result = usePermissionStore((s) => {
        if (featureId) {
            return s.hasFeatureAccess(featureId, standardAction, runtimeMode);
        }
        if (action) {
            return s.hasPermission(action);
        }
        return false;
    });
    return result ? children : fallback;
}
//# sourceMappingURL=PermissionGate.jsx.map