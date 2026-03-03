import type { ICurrentUser, IRole, IPermissionTemplate } from '@hbc/models';

/**
 * Port interface for the Auth (users, roles, permissions) domain.
 *
 * @example
 * ```ts
 * const repo = createAuthRepository();
 * const user = await repo.getCurrentUser();
 * const roles = await repo.getRoles();
 * ```
 */
export interface IAuthRepository {
  /**
   * Retrieve the currently authenticated user.
   * @returns The current user with their assigned roles.
   */
  getCurrentUser(): Promise<ICurrentUser>;

  /**
   * Retrieve all available roles.
   * @returns Array of roles with their permissions.
   */
  getRoles(): Promise<IRole[]>;

  /**
   * Retrieve a single role by its string ID.
   * @param id - The role ID.
   * @returns The role, or `null` if not found.
   */
  getRoleById(id: string): Promise<IRole | null>;

  /**
   * Retrieve all permission templates.
   * @returns Array of templates defining standard permission sets.
   */
  getPermissionTemplates(): Promise<IPermissionTemplate[]>;

  /**
   * Assign a role to a user.
   * @param userId - The user ID.
   * @param roleId - The role ID to assign.
   * @throws {NotFoundError} If the role does not exist.
   */
  assignRole(userId: string, roleId: string): Promise<void>;

  /**
   * Remove a role from a user.
   * @param userId - The user ID.
   * @param roleId - The role ID to remove.
   */
  removeRole(userId: string, roleId: string): Promise<void>;
}
