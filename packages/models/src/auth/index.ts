/**
 * Auth domain models — users, roles, permissions, and authentication.
 *
 * @module auth
 */

export { type ICurrentUser, type IRole, type IPermissionTemplate } from './IAuth.js';
export { type ILoginFormData, type IRoleAssignmentFormData } from './IAuthFormData.js';
export { SystemRole, type AuthMode } from './AuthEnums.js';
export { type UserId, type RoleId, type PermissionAction } from './types.js';
export { SYSTEM_ROLE_LABELS, SYSTEM_ROLE_LEVELS } from './constants.js';
