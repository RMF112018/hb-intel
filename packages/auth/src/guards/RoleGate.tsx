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
  const session = useAuthStore((s) => s.session);
  if (!session) return fallback;

  // Phase 5.4: role checks consume centralized mapped app roles, not raw
  // provider semantics that may have produced the source identity.
  const hasRole = session.resolvedRoles.includes(requiredRole);
  return hasRole ? children : fallback;
}
