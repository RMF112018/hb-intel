import type { ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore.js';

export interface RoleGateProps {
  /** Role name the user must have to see children. */
  requiredRole: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the current user holds the required role.
 * Blueprint §1e — role-based access guard.
 */
export function RoleGate({ requiredRole, children, fallback = null }: RoleGateProps): ReactNode {
  const currentUser = useAuthStore((s) => s.currentUser);
  if (!currentUser) return fallback;

  const hasRole = currentUser.roles.some((r) => r.name === requiredRole);
  return hasRole ? children : fallback;
}
