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
 *
 * Phase 3 / Wave 1 / Prompt 03 extends this file with:
 *   - four additional personas required by Prompt 03;
 *   - `PccPersonaTier` (operational tier) and `PccPersonaCategory` (Prompt 03
 *     primary / support-admin / secondary grouping) classifications.
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
  'estimating-coordinator',
  'lead-estimator',
  'manager-of-operational-excellence',
  'safety-qaqc',
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
  'estimating-coordinator': 'Estimating Coordinator',
  'lead-estimator': 'Lead Estimator',
  'manager-of-operational-excellence': 'Manager of Operational Excellence',
  'safety-qaqc': 'Safety / QAQC',
};

/**
 * Operational tier classification for PCC personas. Independent of
 * `ProjectRoleTier` in `../auth/ProjectRoles.ts`; PCC tiers reflect product
 * grouping rather than authorization precedence.
 */
export type PccPersonaTier =
  | 'platform'
  | 'leadership'
  | 'operations'
  | 'field'
  | 'estimating'
  | 'finance'
  | 'external'
  | 'governance';

export const PCC_PERSONA_TIER: Record<PccPersona, PccPersonaTier> = {
  'pcc-admin': 'platform',
  'it-admin': 'platform',
  'executive-oversight': 'leadership',
  'project-executive': 'leadership',
  'project-manager': 'operations',
  'superintendent': 'field',
  'project-accounting': 'finance',
  'project-team-member': 'operations',
  'external-contributor': 'external',
  'viewer': 'operations',
  'estimating-coordinator': 'estimating',
  'lead-estimator': 'estimating',
  'manager-of-operational-excellence': 'governance',
  'safety-qaqc': 'field',
};

/**
 * Prompt 03 grouping: primary MVP personas, support/admin personas, and
 * secondary personas. Read-model only; not used for authorization.
 */
export type PccPersonaCategory = 'primary-mvp' | 'support-admin' | 'secondary';

export const PCC_PERSONA_CATEGORY: Record<PccPersona, PccPersonaCategory> = {
  'pcc-admin': 'support-admin',
  'it-admin': 'support-admin',
  'executive-oversight': 'primary-mvp',
  'project-executive': 'primary-mvp',
  'project-manager': 'primary-mvp',
  'superintendent': 'primary-mvp',
  'project-accounting': 'primary-mvp',
  'project-team-member': 'secondary',
  'external-contributor': 'secondary',
  'viewer': 'secondary',
  'estimating-coordinator': 'primary-mvp',
  'lead-estimator': 'primary-mvp',
  'manager-of-operational-excellence': 'support-admin',
  'safety-qaqc': 'secondary',
};

/**
 * Best-effort mapping from PCC persona to the existing `ProjectRole` taxonomy.
 * `null` indicates no clean equivalent (e.g., IT/tenant admin, estimating
 * personas, and the Manager of Operational Excellence have no project-scoped
 * role counterpart in the existing model).
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
  'estimating-coordinator': null,
  'lead-estimator': null,
  'manager-of-operational-excellence': null,
  'safety-qaqc': 'project-team-member',
};

export function mapPccPersonaToProjectRole(persona: PccPersona): ProjectRole | null {
  return PCC_PERSONA_TO_PROJECT_ROLE[persona];
}
