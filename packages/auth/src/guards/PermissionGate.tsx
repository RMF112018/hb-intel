import type { ReactNode } from 'react';
import { usePermissionStore } from '../stores/permissionStore.js';

export interface PermissionGateProps {
  /** Permission action string (e.g., "project:create"). */
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the current user has the specified permission.
 * Blueprint §1e — permission-based access guard.
 */
export function PermissionGate({ action, children, fallback = null }: PermissionGateProps): ReactNode {
  const allowed = usePermissionStore((s) => s.hasPermission(action));
  return allowed ? children : fallback;
}
