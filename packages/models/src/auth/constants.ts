import { SystemRole } from './AuthEnums.js';

/**
 * Auth-specific constants.
 *
 * @module auth/constants
 */

/** Human-readable labels for system roles. */
export const SYSTEM_ROLE_LABELS: Record<SystemRole, string> = {
  [SystemRole.SystemAdmin]: 'System Administrator',
  [SystemRole.Executive]: 'Executive',
  [SystemRole.ProjectExecutive]: 'Project Executive',
  [SystemRole.ProjectManager]: 'Project Manager',
  [SystemRole.Superintendent]: 'Superintendent',
  [SystemRole.Preconstruction]: 'Preconstruction',
  [SystemRole.ProjectSupport]: 'Project Support',
  [SystemRole.OfficeStaff]: 'Office Staff',
  [SystemRole.FieldStaff]: 'Field Staff',
};

/** Ordered privilege levels — higher number = more access. */
export const SYSTEM_ROLE_LEVELS: Record<SystemRole, number> = {
  [SystemRole.SystemAdmin]: 90,
  [SystemRole.Executive]: 80,
  [SystemRole.ProjectExecutive]: 70,
  [SystemRole.ProjectManager]: 60,
  [SystemRole.Superintendent]: 50,
  [SystemRole.Preconstruction]: 40,
  [SystemRole.ProjectSupport]: 30,
  [SystemRole.OfficeStaff]: 20,
  [SystemRole.FieldStaff]: 10,
};
