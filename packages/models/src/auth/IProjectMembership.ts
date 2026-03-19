/**
 * An internal user's membership record for a specific project.
 * Used by the Project Hub member management surface.
 */
export interface IProjectMember {
  userId: string;
  projectId: string;
  displayName: string;
  email: string;
  /** Project-level role override (if different from system role). */
  projectRoleId?: string;
  addedAt: string;
  addedBy: string;
}

/**
 * An external user's membership record for a specific project.
 * External users have time-bounded, project-scoped access only.
 */
export interface IExternalMember {
  /** Local user table ID (not an Entra OID). */
  id: string;
  projectId: string;
  displayName: string;
  email: string;
  /** Specific grants for this project context. */
  grants: string[];
  invitedBy: string;
  invitedAt: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'revoked';
}
