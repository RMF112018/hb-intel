/**
 * PCC project lifecycle vocabulary.
 *
 * Values are taken verbatim from
 * `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`:
 *   - §3.2 / §4B.0 — `ProjectStage` (frozen for MVP, six values)
 *   - §3.2       — `ProjectStatus` (four values)
 *   - §4B.1      — `ProjectType` (frozen for MVP, five values)
 *
 * The legacy `ProjectStatus` enum in `../project/ProjectEnums.ts` is intentionally
 * left untouched (Wave 1 scope lock W1-ODR-011). PCC consumers must use these
 * PCC-namespaced types for PCC surfaces.
 */

export const PCC_PROJECT_STAGES = [
  'lead',
  'estimating',
  'preconstruction',
  'active_construction',
  'closeout',
  'warranty',
] as const;

export type PccProjectStage = (typeof PCC_PROJECT_STAGES)[number];

export const PCC_PROJECT_STATUSES = [
  'Active',
  'On Hold',
  'Closed',
  'Archived',
] as const;

export type PccProjectStatus = (typeof PCC_PROJECT_STATUSES)[number];

export const PCC_PROJECT_TYPES = [
  'commercial',
  'multifamily',
  'municipal',
  'luxury_residential',
  'environmental',
] as const;

export type PccProjectType = (typeof PCC_PROJECT_TYPES)[number];
