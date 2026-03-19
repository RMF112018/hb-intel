import type {
  ICurrentUser,
  IRole,
  IPermissionTemplate,
  IJobTitleMapping,
} from '@hbc/models';
import type { IdempotencyContext } from '../retry/idempotency.js';

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
  // ── Session ─────────────────────────────────────────────────────────────
  /**
   * Retrieve the currently authenticated user.
   * For internal users, roles carry IUserRole with source provenance.
   */
  getCurrentUser(): Promise<ICurrentUser>;

  // ── Role definitions ─────────────────────────────────────────────────────
  /** Retrieve all role definitions. */
  getRoles(): Promise<IRole[]>;
  /** Retrieve a role definition by ID. Returns null if not found. */
  getRoleById(id: string): Promise<IRole | null>;
  /** Create a new role definition. */
  createRole(role: Omit<IRole, 'id'>, idempotencyContext?: IdempotencyContext): Promise<IRole>;
  /** Update an existing role definition. */
  updateRole(id: string, updates: Partial<Omit<IRole, 'id'>>, idempotencyContext?: IdempotencyContext): Promise<IRole>;
  /** Delete a role definition. */
  deleteRole(id: string): Promise<void>;

  // ── Role assignment ───────────────────────────────────────────────────────
  /**
   * Assign a role to a user.
   * @throws {NotFoundError} If the role does not exist.
   */
  assignRole(userId: string, roleId: string, idempotencyContext?: IdempotencyContext): Promise<void>;
  /** Remove a role from a user. */
  removeRole(userId: string, roleId: string): Promise<void>;

  // ── Permission templates ──────────────────────────────────────────────────
  /** Retrieve all permission templates. */
  getPermissionTemplates(): Promise<IPermissionTemplate[]>;
  /** Create a new permission template. */
  createPermissionTemplate(
    template: Omit<IPermissionTemplate, 'id'>,
    idempotencyContext?: IdempotencyContext,
  ): Promise<IPermissionTemplate>;
  /** Update an existing permission template. */
  updatePermissionTemplate(
    id: string,
    updates: Partial<Omit<IPermissionTemplate, 'id'>>,
    idempotencyContext?: IdempotencyContext,
  ): Promise<IPermissionTemplate>;
  /** Delete a permission template. */
  deletePermissionTemplate(id: string): Promise<void>;

  // ── Job Title mappings ────────────────────────────────────────────────────
  /** Retrieve all Job Title → SystemRole mapping rules. */
  getJobTitleMappings(): Promise<IJobTitleMapping[]>;
  /** Create a new Job Title mapping rule. */
  createJobTitleMapping(
    mapping: Omit<IJobTitleMapping, 'id'>,
    idempotencyContext?: IdempotencyContext,
  ): Promise<IJobTitleMapping>;
  /** Update an existing Job Title mapping rule. */
  updateJobTitleMapping(
    id: string,
    updates: Partial<Omit<IJobTitleMapping, 'id'>>,
    idempotencyContext?: IdempotencyContext,
  ): Promise<IJobTitleMapping>;
  /** Delete a Job Title mapping rule. */
  deleteJobTitleMapping(id: string): Promise<void>;
}
