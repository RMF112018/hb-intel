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
  IPccExternalObjectReferencesReadModel,
  IPccExternalReviewItemsReadModel,
  IPccExternalSystemAuditEventsReadModel,
  IPccExternalSystemHealthSnapshotsReadModel,
  IPccExternalSystemRegistryReadModel,
  IPccExternalSystemsLaunchPadReadModel,
  IPccHbiSourceLineageReadModel,
  IPccProjectExternalLaunchLinksReadModel,
  IPccProjectExternalSystemMappingsReadModel,
  PccApprovalsReadModel,
  PccBuyoutLogReadModel,
  PccConstraintsLogReadModel,
  PccCrossProjectKnowledgeReadModel,
  PccDocumentControlReadModel,
  PccExternalLinksReadModel,
  PccLifecycleReadinessReadModel,
  PccPermitInspectionControlCenterReadModel,
  PccPersona,
  PccPriorityActionsReadModel,
  PccProcoreProjectMappingReadModel,
  PccProcoreSyncHealthReadModel,
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
  'procore-project-mapping',
  'procore-sync-health',
  'unified-lifecycle',
  'project-memory',
  'project-lenses',
  'project-traceability',
  'warranty-trace',
  'cross-project-knowledge',
  'unified-search',
  // Wave 14 / Prompt 04 — composite approvals/checkpoints read-model.
  'approvals',
  // Wave 15 / Prompt 04 — External Systems Launch Pad composite + per-section
  // route ids. Backend route paths registered by Wave 15 / Prompt 03 use the
  // same string slugs verbatim, so the SPFx client → backend handshake is
  // declarative.
  'external-systems-launch-pad',
  'external-system-registry',
  'project-external-launch-links',
  'project-external-system-mappings',
  'external-object-references',
  'external-review-items',
  'external-system-health-snapshots',
  'external-system-audit-events',
  'hbi-source-lineage',
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
  'procore-project-mapping': 'pcc/projects/{projectId}/procore-project-mapping',
  'procore-sync-health': 'pcc/projects/{projectId}/procore-sync-health',
  'unified-lifecycle': 'pcc/projects/{projectId}/unified-lifecycle',
  'project-memory': 'pcc/projects/{projectId}/project-memory',
  'project-lenses': 'pcc/projects/{projectId}/project-lenses',
  'project-traceability': 'pcc/projects/{projectId}/project-traceability',
  'warranty-trace': 'pcc/projects/{projectId}/warranty-trace',
  'cross-project-knowledge': 'pcc/projects/{projectId}/cross-project-knowledge',
  'unified-search': 'pcc/projects/{projectId}/unified-search',
  approvals: 'pcc/projects/{projectId}/approvals',
  'external-systems-launch-pad': 'pcc/projects/{projectId}/external-systems-launch-pad',
  'external-system-registry': 'pcc/projects/{projectId}/external-system-registry',
  'project-external-launch-links': 'pcc/projects/{projectId}/project-external-launch-links',
  'project-external-system-mappings': 'pcc/projects/{projectId}/project-external-system-mappings',
  'external-object-references': 'pcc/projects/{projectId}/external-object-references',
  'external-review-items': 'pcc/projects/{projectId}/external-review-items',
  'external-system-health-snapshots': 'pcc/projects/{projectId}/external-system-health-snapshots',
  'external-system-audit-events': 'pcc/projects/{projectId}/external-system-audit-events',
  'hbi-source-lineage': 'pcc/projects/{projectId}/hbi-source-lineage',
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

  /**
   * Wave 13 Prompt 13E — Procore project-mapping read model. Mirrors
   * backend route `pcc/projects/{projectId}/procore-project-mapping`.
   * Display-only; PCC owns the mapping. `viewerPersona` is a passthrough
   * parameter, never serialized to the URL.
   */
  getProcoreProjectMapping(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccProcoreProjectMappingReadModel>>;

  /**
   * Wave 13 Prompt 13E — Procore sync-health read model. Mirrors backend
   * route `pcc/projects/{projectId}/procore-sync-health`. Display-only;
   * no write-back, no live Procore SDK. `viewerPersona` is a passthrough
   * parameter, never serialized to the URL.
   */
  getProcoreSyncHealth(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccProcoreSyncHealthReadModel>>;

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

  /**
   * Mirrors backend route `pcc/projects/{projectId}/approvals` (Wave 14
   * composite read-model). Returns
   * `PccReadModelEnvelope<PccApprovalsReadModel>` containing queue,
   * myApprovals, registry, escalation, adminVerification, policy, and
   * analytics sub-models. `viewerPersona` is a passthrough only — it is
   * never serialized into the URL, and the live route does NOT pass it
   * to the backend provider, so SPFx receives unfiltered `myApprovals`
   * regardless of the value supplied here.
   */
  getApprovals(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccApprovalsReadModel>>;

  /**
   * Wave 15 / Prompt 04 — External Systems Launch Pad composite. Mirrors
   * backend route `pcc/projects/{projectId}/external-systems-launch-pad`.
   * Metadata-only; no live external-system calls; no iframe/current-image
   * embed behavior. `viewerPersona` is a passthrough only — never
   * serialized into the URL.
   */
  getExternalSystemsLaunchPad(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccExternalSystemsLaunchPadReadModel>>;

  /**
   * Wave 15 / Prompt 04 — Project-independent external system registry.
   * Mirrors backend route `pcc/projects/{projectId}/external-system-registry`.
   * The same canonical registry is returned for known and unknown projects;
   * the envelope `sourceStatus` reflects host posture so consumers can
   * render degraded surrounding context. `viewerPersona` is a passthrough.
   */
  getExternalSystemRegistry(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccExternalSystemRegistryReadModel>>;

  /**
   * Wave 15 / Prompt 04 — Project external launch links. Mirrors backend
   * route `pcc/projects/{projectId}/project-external-launch-links`.
   * `viewerPersona` is a passthrough; never serialized into the URL.
   */
  getProjectExternalLaunchLinks(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccProjectExternalLaunchLinksReadModel>>;

  /**
   * Wave 15 / Prompt 04 — Project external system mappings. Mirrors backend
   * route `pcc/projects/{projectId}/project-external-system-mappings`.
   * `viewerPersona` is a passthrough; never serialized into the URL.
   */
  getProjectExternalSystemMappings(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccProjectExternalSystemMappingsReadModel>>;

  /**
   * Wave 15 / Prompt 04 — External object references. Mirrors backend
   * route `pcc/projects/{projectId}/external-object-references`.
   * `viewerPersona` is a passthrough; never serialized into the URL.
   */
  getExternalObjectReferences(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccExternalObjectReferencesReadModel>>;

  /**
   * Wave 15 / Prompt 04 — External review items. Mirrors backend route
   * `pcc/projects/{projectId}/external-review-items`. Wave 14 retains
   * ownership of approval/checkpoint semantics; review items reference
   * Wave 14 approval requests by ID only. `viewerPersona` is a passthrough.
   */
  getExternalReviewItems(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccExternalReviewItemsReadModel>>;

  /**
   * Wave 15 / Prompt 04 — External system health snapshots. Mirrors
   * backend route `pcc/projects/{projectId}/external-system-health-snapshots`.
   * `viewerPersona` is a passthrough; never serialized into the URL.
   */
  getExternalSystemHealthSnapshots(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccExternalSystemHealthSnapshotsReadModel>>;

  /**
   * Wave 15 / Prompt 04 — External system audit events. Mirrors backend
   * route `pcc/projects/{projectId}/external-system-audit-events`.
   * `viewerPersona` is a passthrough; never serialized into the URL.
   */
  getExternalSystemAuditEvents(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccExternalSystemAuditEventsReadModel>>;

  /**
   * Wave 15 / Prompt 04 — HBI source lineage. Mirrors backend route
   * `pcc/projects/{projectId}/hbi-source-lineage`. HBI no-authority is
   * preserved by the discriminated `state` union — entries are
   * citation-ready, refusal, unauthorized, loading, unavailable, or
   * insufficient-evidence. `viewerPersona` is a passthrough.
   */
  getHbiSourceLineage(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccHbiSourceLineageReadModel>>;
}
