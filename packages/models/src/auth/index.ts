/**
 * Auth domain models — users, roles, permissions, and authentication.
 *
 * @module auth
 */

export {
  type ICurrentUser,
  type IInternalUser,
  type IExternalUser,
  type IExternalProjectAccess,
  type IRole,
  type IUserRole,
  type IPermissionTemplate,
} from './IAuth.js';

export {
  type IJobTitleMapping,
} from './IJobTitleMapping.js';

export {
  type IProjectMember,
  type IExternalMember,
} from './IProjectMembership.js';

export { type ILoginFormData, type IRoleAssignmentFormData } from './IAuthFormData.js';
export { SystemRole, type AuthMode } from './AuthEnums.js';
export { type UserId, type RoleId, type PermissionAction } from './types.js';
export { SYSTEM_ROLE_LABELS, SYSTEM_ROLE_LEVELS } from './constants.js';
export type { ProjectRole, ProjectRoleTier } from './ProjectRoles.js';
export {
  PROJECT_ROLE_PRECEDENCE,
  PROJECT_ROLE_TIER,
  PROJECT_ROLE_LABELS,
  PROJECT_ROLE_IS_MEMBER,
} from './ProjectRoles.js';
