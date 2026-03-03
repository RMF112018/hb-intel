import type { ICurrentUser, IRole, IPermissionTemplate } from '@hbc/models';
import type { IAuthRepository } from '../../ports/IAuthRepository.js';
import { BaseRepository } from '../base.js';
import { SEED_CURRENT_USER, SEED_ROLES } from './seedData.js';

export class MockAuthRepository extends BaseRepository<ICurrentUser> implements IAuthRepository {
  private currentUser: ICurrentUser = { ...SEED_CURRENT_USER };
  private roles: IRole[] = [...SEED_ROLES];

  async getCurrentUser(): Promise<ICurrentUser> {
    return { ...this.currentUser };
  }

  async getRoles(): Promise<IRole[]> {
    return [...this.roles];
  }

  async getRoleById(id: string): Promise<IRole | null> {
    this.validateId(id, 'Role');
    return this.roles.find((r) => r.id === id) ?? null;
  }

  async getPermissionTemplates(): Promise<IPermissionTemplate[]> {
    return [
      {
        id: 'tpl-admin',
        name: 'Full Admin',
        description: 'Full system access for administrators',
        permissions: ['project:*', 'user:*', 'audit:*', 'settings:*'],
      },
      {
        id: 'tpl-pm',
        name: 'Project Manager',
        description: 'Standard project management permissions',
        permissions: ['project:read', 'project:write', 'document:*', 'reports:read'],
      },
    ];
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    this.validateId(userId, 'User');
    this.validateId(roleId, 'Role');
    const role = this.roles.find((r) => r.id === roleId);
    if (!role) this.throwNotFound('Role', roleId);
    if (this.currentUser.id === userId) {
      const hasRole = this.currentUser.roles.some((r) => r.id === roleId);
      if (!hasRole) {
        this.currentUser.roles.push(role);
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
}
