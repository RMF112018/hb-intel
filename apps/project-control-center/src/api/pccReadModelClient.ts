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
  PccBuyoutLogReadModel,
  PccConstraintsLogReadModel,
  PccCrossProjectKnowledgeReadModel,
  PccDocumentControlReadModel,
  PccExternalLinksReadModel,
  PccLifecycleReadinessReadModel,
  PccPermitInspectionControlCenterReadModel,
  PccPersona,
  PccPriorityActionsReadModel,
  PccProjectHomeReadModel,
  PccProjectId,
  PccProjectLensesReadModel,
  PccProjectMemoryReadModel,
  PccProjectProfileReadModel,
  PccProjectReadinessFrameworkReadModel,
  PccProjectTraceabilityReadModel,
  PccReadModelEnvelope,
  PccResponsibilityMatrixReadModel,
  PccSiteHealthReadModel,
  PccTeamAccessReadModel,
  PccUnifiedLifecycleReadModel,
  PccUnifiedSearchAskHbiReadModel,
  PccWarrantyTraceReadModel,
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
  'responsibility-matrix',
  'constraints-log',
  'buyout-log',
  'unified-lifecycle',
  'project-memory',
  'project-lenses',
  'project-traceability',
  'warranty-trace',
  'cross-project-knowledge',
  'unified-search',
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
  'responsibility-matrix': 'pcc/projects/{projectId}/responsibility-matrix',
  'constraints-log': 'pcc/projects/{projectId}/constraints-log',
  'buyout-log': 'pcc/projects/{projectId}/buyout-log',
  'unified-lifecycle': 'pcc/projects/{projectId}/unified-lifecycle',
  'project-memory': 'pcc/projects/{projectId}/project-memory',
  'project-lenses': 'pcc/projects/{projectId}/project-lenses',
  'project-traceability': 'pcc/projects/{projectId}/project-traceability',
  'warranty-trace': 'pcc/projects/{projectId}/warranty-trace',
  'cross-project-knowledge': 'pcc/projects/{projectId}/cross-project-knowledge',
  'unified-search': 'pcc/projects/{projectId}/unified-search',
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

  getResponsibilityMatrix(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccResponsibilityMatrixReadModel>>;

  getConstraintsLog(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccConstraintsLogReadModel>>;

  getBuyoutLog(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccBuyoutLogReadModel>>;

  getUnifiedLifecycle(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccUnifiedLifecycleReadModel>>;

  getProjectMemory(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccProjectMemoryReadModel>>;

  getProjectLenses(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccProjectLensesReadModel>>;

  getProjectTraceability(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccProjectTraceabilityReadModel>>;

  getWarrantyTrace(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccWarrantyTraceReadModel>>;

  getCrossProjectKnowledge(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccCrossProjectKnowledgeReadModel>>;

  /**
   * Mirrors backend route `pcc/projects/{projectId}/unified-search`.
   * `query` maps to URL query parameter `q`. Blank/undefined `query`
   * MUST NOT add `q` to the URL. `viewerPersona` is a passthrough only;
   * it is never serialized to the URL.
   */
  getUnifiedSearch(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
    query?: string,
  ): Promise<PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel>>;
}
