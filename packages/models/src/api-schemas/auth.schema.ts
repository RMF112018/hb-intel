import { z } from 'zod';
import type {
  IRole,
  IPermissionTemplate,
  IUserRole,
  IExternalProjectAccess,
  IInternalUser,
  IExternalUser,
  ICurrentUser,
} from '../auth/index.js';
import type { IJobTitleMapping } from '../auth/index.js';

// ─── Role & Permission Schemas ───────────────────────────────────────────────

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  grants: z.array(z.string()),
});

export const PermissionTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  grants: z.array(z.string()),
});

export const UserRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  grants: z.array(z.string()),
  source: z.enum(['job-title', 'manual']),
});

// ─── Job Title Mapping Schema ────────────────────────────────────────────────

export const JobTitleMappingSchema = z.object({
  id: z.string(),
  roleId: z.string(),
  roleName: z.string(),
  aliases: z.array(z.string()),
  matchMode: z.enum(['exact', 'contains', 'starts-with']),
  active: z.boolean(),
  updatedAt: z.string(),
  updatedBy: z.string(),
});

// ─── User Schemas (Discriminated Union) ──────────────────────────────────────

export const ExternalProjectAccessSchema = z.object({
  projectId: z.string(),
  grants: z.array(z.string()),
  invitedAt: z.string(),
  expiresAt: z.string().optional(),
});

export const InternalUserSchema = z.object({
  type: z.literal('internal'),
  id: z.string(),
  displayName: z.string(),
  email: z.string(),
  jobTitle: z.string().optional(),
  roles: z.array(UserRoleSchema),
});

export const ExternalUserSchema = z.object({
  type: z.literal('external'),
  id: z.string(),
  displayName: z.string(),
  email: z.string(),
  projectAccess: z.array(ExternalProjectAccessSchema),
});

export const CurrentUserSchema = z.discriminatedUnion('type', [
  InternalUserSchema,
  ExternalUserSchema,
]);

// ─── Type Conformance ────────────────────────────────────────────────────────

type Role = z.infer<typeof RoleSchema>;
type _RoleCheck = IRole extends Role ? (Role extends IRole ? true : never) : never;

type Template = z.infer<typeof PermissionTemplateSchema>;
type _TemplateCheck = IPermissionTemplate extends Template ? (Template extends IPermissionTemplate ? true : never) : never;

type UserRole = z.infer<typeof UserRoleSchema>;
type _UserRoleCheck = IUserRole extends UserRole ? (UserRole extends IUserRole ? true : never) : never;

type Mapping = z.infer<typeof JobTitleMappingSchema>;
type _MappingCheck = IJobTitleMapping extends Mapping ? (Mapping extends IJobTitleMapping ? true : never) : never;

type ExtAccess = z.infer<typeof ExternalProjectAccessSchema>;
type _ExtAccessCheck = IExternalProjectAccess extends ExtAccess ? (ExtAccess extends IExternalProjectAccess ? true : never) : never;

type IntUser = z.infer<typeof InternalUserSchema>;
type _IntUserCheck = IInternalUser extends IntUser ? (IntUser extends IInternalUser ? true : never) : never;

type ExtUser = z.infer<typeof ExternalUserSchema>;
type _ExtUserCheck = IExternalUser extends ExtUser ? (ExtUser extends IExternalUser ? true : never) : never;

type CurrUser = z.infer<typeof CurrentUserSchema>;
type _CurrUserCheck = ICurrentUser extends CurrUser ? (CurrUser extends ICurrentUser ? true : never) : never;
