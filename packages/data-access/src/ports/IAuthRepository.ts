import type { ICurrentUser, IRole, IPermissionTemplate } from '@hbc/models';

/** Port interface for Auth domain data operations. */
export interface IAuthRepository {
  getCurrentUser(): Promise<ICurrentUser>;
  getRoles(): Promise<IRole[]>;
  getRoleById(id: string): Promise<IRole | null>;
  getPermissionTemplates(): Promise<IPermissionTemplate[]>;
  assignRole(userId: string, roleId: string): Promise<void>;
  removeRole(userId: string, roleId: string): Promise<void>;
}
