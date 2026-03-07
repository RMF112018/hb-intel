/**
 * The currently authenticated user within HB Intel.
 *
 * Populated by the auth adapter after sign-in and stored in the auth Zustand store.
 *
 * @example
 * ```ts
 * import type { ICurrentUser } from '@hbc/models';
 * ```
 */
export interface ICurrentUser {
    /** Unique user identifier (UUID or Azure OID). */
    id: string;
    /** User's display name. */
    displayName: string;
    /** User's email address. */
    email: string;
    /** Roles assigned to this user with associated permissions. */
    roles: IRole[];
}
/**
 * A named security role containing a set of permission strings.
 */
export interface IRole {
    /** Unique role identifier. */
    id: string;
    /** Human-readable role name (e.g. "Project Manager"). */
    name: string;
    /** Permission action strings granted by this role. */
    permissions: string[];
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
    permissions: string[];
}
//# sourceMappingURL=IAuth.d.ts.map