/**
 * A named security role containing a set of permission grants.
 */
export interface IRole {
  /** Unique role identifier. */
  id: string;
  /** Human-readable role name (e.g. "Project Manager"). */
  name: string;
  /** Permission action strings granted by this role. */
  grants: string[];
}

/**
 * A reusable template for assigning a pre-defined set of permissions.
 */
export interface IPermissionTemplate {
  /** Unique template identifier. */
  id: string;
  /** Template name. */
  name: string;
  /** Description of the template's intended use. */
  description: string;
  /** Permission action strings included in this template. */
  grants: string[];
}

/**
 * A role as assigned to a specific user, carrying source provenance.
 *
 * Distinct from IRole (role definition) — IUserRole is the per-user
 * assignment record and tracks whether the role was auto-assigned from
 * a Job Title lookup or manually assigned by an administrator.
 */
export interface IUserRole {
  /** Role definition ID. */
  id: string;
  /** Human-readable role name. */
  name: string;
  /** Permission action strings granted by this role. */
  grants: string[];
  /**
   * Assignment provenance.
   * - `job-title`: auto-assigned at login via Job Title → SystemRole mapping
   * - `manual`: explicitly assigned by an administrator
   */
  source: 'job-title' | 'manual';
}

/**
 * Project-scoped access record for external (non-Entra) users.
 */
export interface IExternalProjectAccess {
  projectId: string;
  /** Specific grants applied to this project context. */
  grants: string[];
  invitedAt: string;
  expiresAt?: string;
}

/**
 * Internal user authenticated via Entra ID.
 * Receives system-level role assignment (manual or Job Title-based).
 */
export interface IInternalUser {
  type: 'internal';
  /** Entra Object ID (OID). */
  id: string;
  displayName: string;
  email: string;
  /**
   * Entra ID Job Title value.
   * Populated from JWT optional claim or Graph API supplementation.
   * May be undefined if IT has not configured optional claims and
   * Graph supplementation is not yet in place (SPFx surface always undefined).
   */
  jobTitle?: string;
  /** Roles assigned to this user with assignment provenance. */
  roles: IUserRole[];
}

/**
 * External user authenticated outside Entra ID (e.g. Azure AD B2B guest).
 * Receives only project-scoped access — no system roles.
 */
export interface IExternalUser {
  type: 'external';
  id: string;
  displayName: string;
  email: string;
  projectAccess: IExternalProjectAccess[];
}

/**
 * The currently authenticated user within HB Intel.
 *
 * Use the `type` discriminant to narrow to IInternalUser or IExternalUser
 * before accessing role or project-access fields.
 *
 * @example
 * ```ts
 * import type { ICurrentUser } from '@hbc/models';
 *
 * function getRoles(user: ICurrentUser) {
 *   if (user.type === 'internal') {
 *     return user.roles;
 *   }
 *   return user.projectAccess;
 * }
 * ```
 */
export type ICurrentUser = IInternalUser | IExternalUser;
