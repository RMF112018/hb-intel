import { SystemRole } from './AuthEnums.js';

/**
 * Auth-specific constants.
 *
 * @module auth/constants
 */

/** Human-readable labels for system roles. */
export const SYSTEM_ROLE_LABELS: Record<SystemRole, string> = {
  [SystemRole.Admin]: 'Administrator',
  [SystemRole.CSuite]: 'C-Suite',
  [SystemRole.ProjectExecutive]: 'Project Executive',
  [SystemRole.ProjectManager]: 'Project Manager',
  [SystemRole.OperationsStaff]: 'Operations Staff',
};

/** Ordered privilege levels — higher number = more access. */
export const SYSTEM_ROLE_LEVELS: Record<SystemRole, number> = {
  [SystemRole.Admin]: 50,
  [SystemRole.CSuite]: 40,
  [SystemRole.ProjectExecutive]: 30,
  [SystemRole.ProjectManager]: 20,
  [SystemRole.OperationsStaff]: 10,
};
