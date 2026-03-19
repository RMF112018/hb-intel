import type {
  ICurrentUser,
  IInternalUser,
  IRole,
  IPermissionTemplate,
  IJobTitleMapping,
} from '@hbc/models';
import type { IAuthRepository } from '../../ports/IAuthRepository.js';
import type { IdempotencyContext } from '../../retry/idempotency.js';
import { BaseRepository } from '../base.js';
import { SEED_CURRENT_USER, SEED_ROLES } from './seedData.js';

export class MockAuthRepository extends BaseRepository<ICurrentUser> implements IAuthRepository {
  private currentUser: IInternalUser = { ...SEED_CURRENT_USER, roles: [...SEED_CURRENT_USER.roles] };
  private roles: IRole[] = [...SEED_ROLES];

  private permissionTemplates: IPermissionTemplate[] = [
    {
      id: 'tpl-admin',
      name: 'Full Admin',
      description: 'Full system access for administrators',
      grants: ['project:*', 'user:*', 'audit:*', 'settings:*'],
    },
    {
      id: 'tpl-pm',
      name: 'Project Manager',
      description: 'Standard project management permissions',
      grants: ['project:read', 'project:write', 'document:*', 'reports:read'],
    },
  ];

  private jobTitleMappings: IJobTitleMapping[] = [];

  // ── Session ─────────────────────────────────────────────────────────────

  async getCurrentUser(): Promise<ICurrentUser> {
    return { ...this.currentUser, roles: [...this.currentUser.roles] };
  }

  // ── Role definitions ─────────────────────────────────────────────────────

  async getRoles(): Promise<IRole[]> {
    return [...this.roles];
  }

  async getRoleById(id: string): Promise<IRole | null> {
    this.validateId(id, 'Role');
    return this.roles.find((r) => r.id === id) ?? null;
  }

  async createRole(role: Omit<IRole, 'id'>, _idempotencyContext?: IdempotencyContext): Promise<IRole> {
    const created: IRole = { id: crypto.randomUUID(), ...role };
    this.roles.push(created);
    return { ...created };
  }

  async updateRole(id: string, updates: Partial<Omit<IRole, 'id'>>, _idempotencyContext?: IdempotencyContext): Promise<IRole> {
    this.validateId(id, 'Role');
    const index = this.roles.findIndex((r) => r.id === id);
    if (index === -1) this.throwNotFound('Role', id);
    this.roles[index] = { ...this.roles[index], ...updates };
    return { ...this.roles[index] };
  }

  async deleteRole(id: string): Promise<void> {
    this.roles = this.roles.filter((r) => r.id !== id);
  }

  // ── Role assignment ───────────────────────────────────────────────────────

  async assignRole(userId: string, roleId: string, _idempotencyContext?: IdempotencyContext): Promise<void> {
    this.validateId(userId, 'User');
    this.validateId(roleId, 'Role');
    const role = this.roles.find((r) => r.id === roleId);
    if (!role) this.throwNotFound('Role', roleId);
    if (this.currentUser.id === userId) {
      const hasRole = this.currentUser.roles.some((r) => r.id === roleId);
      if (!hasRole) {
        this.currentUser.roles.push({
          id: role.id,
          name: role.name,
          grants: [...role.grants],
          source: 'manual',
        });
      }
    }
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    this.validateId(userId, 'User');
    this.validateId(roleId, 'Role');
    if (this.currentUser.id === userId) {
      this.currentUser.roles = this.currentUser.roles.filter((r) => r.id !== roleId);
    }
  }

  // ── Permission templates ──────────────────────────────────────────────────

  async getPermissionTemplates(): Promise<IPermissionTemplate[]> {
    return [...this.permissionTemplates];
  }

  async createPermissionTemplate(
    template: Omit<IPermissionTemplate, 'id'>,
    _idempotencyContext?: IdempotencyContext,
  ): Promise<IPermissionTemplate> {
    const created: IPermissionTemplate = { id: crypto.randomUUID(), ...template };
    this.permissionTemplates.push(created);
    return { ...created };
  }

  async updatePermissionTemplate(
    id: string,
    updates: Partial<Omit<IPermissionTemplate, 'id'>>,
    _idempotencyContext?: IdempotencyContext,
  ): Promise<IPermissionTemplate> {
    this.validateId(id, 'PermissionTemplate');
    const index = this.permissionTemplates.findIndex((t) => t.id === id);
    if (index === -1) this.throwNotFound('PermissionTemplate', id);
    this.permissionTemplates[index] = { ...this.permissionTemplates[index], ...updates };
    return { ...this.permissionTemplates[index] };
  }

  async deletePermissionTemplate(id: string): Promise<void> {
    this.permissionTemplates = this.permissionTemplates.filter((t) => t.id !== id);
  }

  // ── Job Title mappings ────────────────────────────────────────────────────

  async getJobTitleMappings(): Promise<IJobTitleMapping[]> {
    return [...this.jobTitleMappings];
  }

  async createJobTitleMapping(
    mapping: Omit<IJobTitleMapping, 'id'>,
    _idempotencyContext?: IdempotencyContext,
  ): Promise<IJobTitleMapping> {
    const created: IJobTitleMapping = { id: crypto.randomUUID(), ...mapping };
    this.jobTitleMappings.push(created);
    return { ...created };
  }

  async updateJobTitleMapping(
    id: string,
    updates: Partial<Omit<IJobTitleMapping, 'id'>>,
    _idempotencyContext?: IdempotencyContext,
  ): Promise<IJobTitleMapping> {
    this.validateId(id, 'JobTitleMapping');
    const index = this.jobTitleMappings.findIndex((m) => m.id === id);
    if (index === -1) this.throwNotFound('JobTitleMapping', id);
    this.jobTitleMappings[index] = { ...this.jobTitleMappings[index], ...updates };
    return { ...this.jobTitleMappings[index] };
  }

  async deleteJobTitleMapping(id: string): Promise<void> {
    this.jobTitleMappings = this.jobTitleMappings.filter((m) => m.id !== id);
  }
}
