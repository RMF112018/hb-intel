/**
 * PCC backend read-model provider interface (Phase 3 / Wave 3 / Prompt 04).
 *
 * Type-only contract for assembling PCC read-model envelopes on the backend.
 * Implementations must be read-only: no mutation verbs, no live runtime calls,
 * no Graph/PnP/SharePoint/Procore/Document Crunch/Adobe Sign behavior.
 *
 * The Wave 3 mock implementation lives at `./pcc-mock-read-model-provider.ts`.
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
  PccDocumentControlReadModel,
  PccExternalLinksReadModel,
  PccPermitInspectionControlCenterReadModel,
  PccPersona,
  PccPriorityActionsReadModel,
  PccProcoreProjectMappingReadModel,
  PccProcoreSyncHealthReadModel,
  PccProjectHomeReadModel,
  PccProjectId,
  PccProjectProfileReadModel,
  PccLifecycleReadinessReadModel,
  PccProjectReadinessFrameworkReadModel,
  PccProjectMemoryReadModel,
  PccProjectLensesReadModel,
  PccProjectTraceabilityReadModel,
  PccUnifiedLifecycleReadModel,
  PccUnifiedSearchAskHbiReadModel,
  PccCrossProjectKnowledgeReadModel,
  PccWarrantyTraceReadModel,
  PccReadModelEnvelope,
  PccResponsibilityMatrixReadModel,
  PccSettingsReadModel,
  PccSiteHealthReadModel,
  PccTeamAccessReadModel,
  PccWorkCenterRegistryReadModel,
} from '@hbc/models/pcc';

export interface IPccReadModelProvider {
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
  getSettings(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccSettingsReadModel>>;
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
  getProcoreProjectMapping(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccProcoreProjectMappingReadModel>>;
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
  getUnifiedSearch(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
    query?: string,
  ): Promise<PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel>>;
  /**
   * Wave 14 / Prompt 03 — composite approvals read-model
   * (queue, my-approvals, registry, escalation, admin-verification,
   * policy, analytics). When `viewerPersona` is provided, the
   * `myApprovals` slice MUST be filtered to entries whose
   * `assignedRole === viewerPersona` and `myApprovals.viewerRole`
   * MUST equal that persona; otherwise `myApprovals` is returned
   * unchanged from the underlying fixture/source.
   */
  getApprovals(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccApprovalsReadModel>>;
  /**
   * Wave 15 / External Systems Launch Pad — composite + per-section
   * read-model getters. All metadata-only; no live external-system calls,
   * no Graph/PnP/SharePoint/Procore/Sage/AHJ/camera writes, no tenant
   * mutation. The Wave 1 `getExternalLinks` method above remains the
   * canonical source for the legacy `external-links` envelope and is
   * untouched.
   *
   * The `viewerPersona` argument is optional and preserved for parity
   * with the rest of the interface; the route layer never derives it
   * from the request.
   */
  getExternalSystemsLaunchPad(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccExternalSystemsLaunchPadReadModel>>;
  getExternalSystemRegistry(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccExternalSystemRegistryReadModel>>;
  getProjectExternalLaunchLinks(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccProjectExternalLaunchLinksReadModel>>;
  getProjectExternalSystemMappings(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccProjectExternalSystemMappingsReadModel>>;
  getExternalObjectReferences(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccExternalObjectReferencesReadModel>>;
  getExternalReviewItems(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccExternalReviewItemsReadModel>>;
  getExternalSystemHealthSnapshots(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccExternalSystemHealthSnapshotsReadModel>>;
  getExternalSystemAuditEvents(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccExternalSystemAuditEventsReadModel>>;
  getHbiSourceLineage(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<IPccHbiSourceLineageReadModel>>;
}

export interface PccMockReadModelProviderOptions {
  readonly simulateBackendUnavailable?: boolean;
  readonly now?: () => string;
}
