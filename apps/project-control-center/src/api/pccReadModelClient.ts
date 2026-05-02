/**
 * PCC SPFx read-model client boundary.
 *
 * Type-only seam describing how the SPFx app requests PCC backend
 * read-model envelopes. The boundary is intentionally dormant for
 * surfaces still rendering pure fixtures: it is not imported by
 * `mount`, `PccApp`, the shell, or any surface that has not opted in.
 * Opted-in surfaces remain fixture-first by default and only use the
 * backend client when explicitly configured.
 *
 * No HTTP execution, base URL resolution, response parsing, or auth
 * behavior is defined here. The backend HTTP implementation lives
 * behind this same interface as an explicit, opt-in mode.
 */

import type {
  PccDocumentControlReadModel,
  PccExternalLinksReadModel,
  PccLifecycleReadinessReadModel,
  PccPermitInspectionControlCenterReadModel,
  PccPersona,
  PccPriorityActionsReadModel,
  PccProjectHomeReadModel,
  PccProjectId,
  PccProjectProfileReadModel,
  PccProjectReadinessFrameworkReadModel,
  PccReadModelEnvelope,
  PccSiteHealthReadModel,
  PccTeamAccessReadModel,
  PccWorkCenterRegistryReadModel,
} from '@hbc/models/pcc';

export const PCC_READ_MODEL_NAMESPACE = 'pcc' as const;

export const PCC_READ_MODEL_ROUTE_IDS = [
  'profile',
  'modules',
  'home',
  'priority-actions',
  'document-control',
  'external-links',
  'site-health',
  'team-access',
  'project-readiness',
  'lifecycle-readiness',
  'permit-inspection-control-center',
] as const;

export type PccReadModelRouteId = (typeof PCC_READ_MODEL_ROUTE_IDS)[number];

/**
 * Static route path templates that mirror the GET-only Functions routes
 * registered under `/api/pcc/projects/{projectId}/...`.
 *
 * These are inert string templates. They do not perform base URL
 * resolution, request execution, response parsing, or auth handling.
 */
export const PCC_READ_MODEL_ROUTE_PATHS: Readonly<Record<PccReadModelRouteId, string>> = {
  profile: 'pcc/projects/{projectId}/profile',
  modules: 'pcc/projects/{projectId}/modules',
  home: 'pcc/projects/{projectId}/home',
  'priority-actions': 'pcc/projects/{projectId}/priority-actions',
  'document-control': 'pcc/projects/{projectId}/document-control',
  'external-links': 'pcc/projects/{projectId}/external-links',
  'site-health': 'pcc/projects/{projectId}/site-health',
  'team-access': 'pcc/projects/{projectId}/team-access',
  'project-readiness': 'pcc/projects/{projectId}/project-readiness',
  'lifecycle-readiness': 'pcc/projects/{projectId}/lifecycle-readiness',
  'permit-inspection-control-center': 'pcc/projects/{projectId}/permit-inspection-control-center',
};

/**
 * Typed read-only client boundary for PCC backend read-model envelopes.
 *
 * Each method returns a `PccReadModelEnvelope<T>` matching the
 * envelope shape produced by the backend mock provider. Implementations
 * must remain read-only: no mutation, no live tenant runtime, no
 * persona derivation, no UI gating. `viewerPersona` is a passthrough
 * parameter only.
 */
export interface IPccReadModelClient {
  getProjectProfile(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccProjectProfileReadModel>>;

  getModuleRegistry(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccWorkCenterRegistryReadModel>>;

  getProjectHome(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccProjectHomeReadModel>>;

  getPriorityActions(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccPriorityActionsReadModel>>;

  getDocumentControl(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccDocumentControlReadModel>>;

  getExternalLinks(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccExternalLinksReadModel>>;

  getSiteHealth(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccSiteHealthReadModel>>;

  getTeamAccess(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccTeamAccessReadModel>>;

  getProjectReadiness(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccProjectReadinessFrameworkReadModel>>;

  getLifecycleReadiness(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccLifecycleReadinessReadModel>>;

  getPermitInspectionControlCenter(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccPermitInspectionControlCenterReadModel>>;
}
