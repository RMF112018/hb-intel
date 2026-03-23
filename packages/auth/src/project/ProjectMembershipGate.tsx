/**
 * Phase 3 Stage 2.2 — ProjectMembershipGate React component.
 *
 * Project-scoped access enforcement component. Renders children when
 * access is granted, renders fallback or calls callback when denied.
 *
 * Governing: P3-A2 §6 (Project access eligibility rules)
 */

import { useEffect, type ReactNode } from 'react';
import type { ProjectAccessResult, ProjectAccessDenialReason } from './validateProjectAccess.js';

export interface ProjectMembershipGateProps {
  /** Result from validateProjectAccess() */
  accessResult: ProjectAccessResult;
  /** Content to render when access is granted */
  children: ReactNode;
  /** Called when access is denied — use for navigation/redirect */
  onAccessDenied?: (reason: ProjectAccessDenialReason) => void;
  /** Fallback content to render when access is denied (optional) */
  accessDeniedFallback?: ReactNode;
}

/**
 * Project-scoped access gate component.
 *
 * Follows the pattern of existing system-level guards (RoleGate,
 * PermissionGate) but operates on project-scoped access results
 * from validateProjectAccess().
 */
export function ProjectMembershipGate({
  accessResult,
  children,
  onAccessDenied,
  accessDeniedFallback,
}: ProjectMembershipGateProps): ReactNode {
  useEffect(() => {
    if (!accessResult.granted && onAccessDenied) {
      onAccessDenied(accessResult.denialReason);
    }
  }, [accessResult.granted, accessResult.granted ? undefined : accessResult.denialReason, onAccessDenied]);

  if (accessResult.granted) {
    return <>{children}</>;
  }

  return accessDeniedFallback != null ? <>{accessDeniedFallback}</> : null;
}
