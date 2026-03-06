import type { ReactNode } from 'react';
import { usePermissionStore } from '../stores/permissionStore.js';
import { useAuthStore } from '../stores/authStore.js';
import type { StandardActionPermission } from '../types.js';

export interface PermissionGateProps {
  /** Permission action string (e.g., "project:create"). */
  action?: string;
  /** Optional protected feature identifier for centralized feature access checks. */
  featureId?: string;
  /** Optional standard action for feature-based checks. */
  standardAction?: StandardActionPermission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the current user has the specified permission.
 * Blueprint §1e — permission-based access guard.
 */
export function PermissionGate({
  action,
  featureId,
  standardAction = 'view',
  children,
  fallback = null,
}: PermissionGateProps): ReactNode {
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
