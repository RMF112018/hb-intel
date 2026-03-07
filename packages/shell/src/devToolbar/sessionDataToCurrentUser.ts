// packages/shell/src/devToolbar/sessionDataToCurrentUser.ts
// D-PH6F-01: Conversion utilities for ISessionData -> ICurrentUser + permission extraction

import type { ICurrentUser, IRole } from '@hbc/models';
import type { ISessionData } from '@hbc/auth/dev';

/**
 * Converts an `ISessionData` (dev auth bypass shape) into an `ICurrentUser`
 * (auth store shape) so that persona selection syncs with the global auth state.
 *
 * D-PH6F-01: Bridges the gap between DevAuthBypassAdapter session output and
 * the Zustand auth store expected by feature gates and permission checks.
 *
 * @param session - The dev auth session data containing userId, displayName, email, roles, and permissions.
 * @returns An `ICurrentUser` suitable for `useAuthStore.getState().setUser()`.
 */
export function sessionDataToCurrentUser(session: ISessionData): ICurrentUser {
  const grantedPermissions = extractGrantedPermissions(session.permissions);

  // D-PH6F-01: Collapse role strings into IRole objects, attaching granted permissions
  // to the first role so the auth store has a complete picture.
  const roles: IRole[] = session.roles.map((roleName, index) => ({
    id: `dev-role-${roleName.toLowerCase().replace(/\s+/g, '-')}`,
    name: roleName,
    permissions: index === 0 ? grantedPermissions : [],
  }));

  return {
    id: session.userId,
    displayName: session.displayName,
    email: session.email,
    roles,
  };
}

/**
 * Extracts the granted (truthy) permission keys from a `Record<string, boolean>` map
 * into a flat `string[]` suitable for `usePermissionStore.getState().setPermissions()`.
 *
 * D-PH6F-01: ISessionData stores permissions as `{ 'feature:x': true/false }`.
 * The permission store expects a flat array of granted permission strings.
 *
 * @param permissions - The permission map from ISessionData.
 * @returns An array of permission keys whose values are `true`.
 */
export function extractGrantedPermissions(
  permissions: Record<string, boolean>,
): string[] {
  return Object.entries(permissions)
    .filter(([, granted]) => granted)
    .map(([key]) => key);
}
