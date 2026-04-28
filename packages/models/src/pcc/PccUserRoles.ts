/**
 * PCC personas and roles.
 *
 * Defines PCC-scoped persona vocabulary for module visibility, primary-user
 * tagging, and approval-routing read models. PCC personas are intentionally
 * decoupled from `ProjectRole` (`../auth/ProjectRoles.ts`); a thin mapping
 * helper documents the relationship without mutating the existing role model.
 *
 * Wave 1 scope lock W1-ODR-012: define PCC personas; do not mutate
 * `ProjectRole`.
 */

import type { ProjectRole } from '../auth/ProjectRoles.js';

export const PCC_PERSONAS = [
  'pcc-admin',
  'it-admin',
  'executive-oversight',
  'project-executive',
  'project-manager',
  'superintendent',
  'project-accounting',
  'project-team-member',
  'external-contributor',
  'viewer',
] as const;

export type PccPersona = (typeof PCC_PERSONAS)[number];

/**
 * `PccUserRole` is an alias for `PccPersona` retained for vocabulary alignment
 * with the contract and the Wave 1 prompt package. It is not a separate model.
 */
export type PccUserRole = PccPersona;

export const PCC_PERSONA_LABELS: Record<PccPersona, string> = {
  'pcc-admin': 'PCC Admin',
  'it-admin': 'IT / Tenant Admin',
  'executive-oversight': 'Executive Oversight',
  'project-executive': 'Project Executive',
  'project-manager': 'Project Manager',
  'superintendent': 'Superintendent',
  'project-accounting': 'Project Accounting',
  'project-team-member': 'Project Team Member',
  'external-contributor': 'External Contributor',
  'viewer': 'Viewer',
};

/**
 * Best-effort mapping from PCC persona to the existing `ProjectRole` taxonomy.
 * `null` indicates no clean equivalent (e.g., IT/tenant admin is not a
 * project-scoped role).
 */
export const PCC_PERSONA_TO_PROJECT_ROLE: Record<PccPersona, ProjectRole | null> = {
  'pcc-admin': 'project-administrator',
  'it-admin': null,
  'executive-oversight': 'portfolio-executive-reviewer',
  'project-executive': 'project-executive',
  'project-manager': 'project-manager',
  'superintendent': 'superintendent',
  'project-accounting': 'project-team-member',
  'project-team-member': 'project-team-member',
  'external-contributor': 'external-contributor',
  'viewer': 'project-viewer',
};

export function mapPccPersonaToProjectRole(persona: PccPersona): ProjectRole | null {
  return PCC_PERSONA_TO_PROJECT_ROLE[persona];
}
