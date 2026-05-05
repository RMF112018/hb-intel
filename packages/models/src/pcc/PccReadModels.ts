/**
 * PCC backend read-model contracts (Wave 3 / Prompt 03).
 *
 * Type-only contracts shared by backend and SPFx boundaries. This module
 * declares read-model envelope semantics and DTO aliases without introducing
 * runtime behavior, service functions, or tenant/external system imports.
 */

import type { IProjectProfile } from './IProjectProfile.js';
import type { IPccSettingsRef } from './PccSettings.js';
import type { IPccMvpSurface, PccMvpSurfaceId } from './PccMvpSurfaces.js';
import type { IPriorityAction } from './PriorityActions.js';
import type {
  IDocumentControlActionCode,
  DocumentControlSourceHealthState,
  DocumentControlWave7Lane,
  DocumentControlRoleCode,
  DocumentControlReviewState,
  DocumentControlReviewType,
  IDocumentControlSource,
  IDocumentControlUniversalHardNoRule,
  IProjectDocumentSourceHealth,
  IProjectDocumentSourceRegistryEntry,
} from './DocumentControl.js';
import type { IExternalSystemLink, IExternalSystemMissingConfig } from './ExternalSystems.js';
import type { ISiteHealthSummary } from './SiteHealth.js';
import type { ITeamAccessPreviewModel } from './TeamAccess.js';
import type { PccPersona } from './PccUserRoles.js';
import type { PccProjectId } from './types.js';
import type { PccProjectReadinessFrameworkReadModel } from './ProjectReadinessFramework.js';
import type { PccLifecycleReadinessReadModel } from './LifecycleReadiness.js';
import type { PccPermitInspectionControlCenterReadModel } from './PermitInspectionControlCenter.js';
import type {
  IResponsibilityAuditEvent,
  IResponsibilityException,
  IResponsibilityMatrixSnapshot,
  IResponsibilityMatrixSourcePosture,
  IResponsibilityProjectInstanceRecord,
  IResponsibilityTemplateLibraryRecord,
  IResponsibilityWorkbookSourceSummary,
  ResponsibilityMatrixHealthScore,
  ResponsibilityMatrixLane,
} from './ResponsibilityMatrix.js';
import type { PccConstraintsLogReadModel } from './ConstraintsLog.js';
import type { PccBuyoutLogReadModel } from './BuyoutLog.js';
import type { PccApprovalsReadModel } from './CheckpointInstance.js';
import type { PccProcoreProjectMappingReadModel } from './PccProcoreProjectMapping.js';
import type { PccProcoreSyncHealthReadModel } from './PccProcoreDataLayer.js';
import type {
  PccCrossProjectKnowledgeReadModel,
  PccProjectLensesReadModel,
  PccProjectMemoryReadModel,
  PccProjectTraceabilityReadModel,
  PccUnifiedLifecycleReadModel,
  PccUnifiedSearchAskHbiReadModel,
  PccWarrantyTraceReadModel,
} from './UnifiedLifecycleReadModels.js';
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
} from './ExternalSystemsLaunchPad.js';

export const PCC_READ_MODEL_MODES = ['fixture', 'mock', 'local'] as const;
export type PccReadModelMode = (typeof PCC_READ_MODEL_MODES)[number];

export const PCC_READ_MODEL_SOURCE_STATUSES = [
  'available',
  'backend-unavailable',
  'source-unavailable',
  'missing-config',
  'stale',
  'unauthorized',
  'forbidden',
] as const;
export type PccReadModelSourceStatus = (typeof PCC_READ_MODEL_SOURCE_STATUSES)[number];

export interface PccReadModelWarning {
  code:
    | 'backend-unavailable'
    | 'source-unavailable'
    | 'missing-config'
    | 'stale'
    | 'unauthorized'
    | 'forbidden';
  message: string;
  source?: string;
}

export interface PccReadModelEnvelope<T> {
  projectId?: PccProjectId;
  mode: PccReadModelMode;
  sourceStatus: PccReadModelSourceStatus;
  readOnly: true;
  viewerPersona?: PccPersona;
  warnings: readonly PccReadModelWarning[];
  generatedAtUtc?: string;
  data: T;
}

export interface PccProjectProfileReadModel {
  profile: IProjectProfile;
}

export interface PccWorkCenterRegistryReadModel {
  surfaces: Readonly<Record<PccMvpSurfaceId, IPccMvpSurface>>;
}

export interface PccProjectHomeReadModel {
  profile: IProjectProfile;
  priorityActions: readonly IPriorityAction[];
  missingConfigurations: readonly IExternalSystemMissingConfig[];
  siteHealth?: ISiteHealthSummary;
}

export interface PccPriorityActionsReadModel {
  actions: readonly IPriorityAction[];
}

export interface PccDocumentControlReadModel {
  sources: readonly IDocumentControlSource[];
  wave7LaneVocabulary?: readonly DocumentControlWave7Lane[];
  sourceRegistry?: readonly IProjectDocumentSourceRegistryEntry[];
  sourceHealth?: readonly IProjectDocumentSourceHealth[];
  sourceHealthStates?: readonly DocumentControlSourceHealthState[];
  reviewStates?: readonly DocumentControlReviewState[];
  reviewTypes?: readonly DocumentControlReviewType[];
  hardNoRules?: readonly IDocumentControlUniversalHardNoRule[];
  roleActionAvailability?: readonly PccDocumentControlRoleActionAvailability[];
  actionCatalog?: readonly IDocumentControlActionCode[];
  reviewQueueSample?: readonly PccDocumentControlReviewQueueItem[];
}

export interface PccDocumentControlRoleActionAvailability {
  roleCode: DocumentControlRoleCode;
  actionCode: string;
  availability: 'Y' | 'A' | 'O' | 'R' | 'C' | 'S' | 'D' | 'N' | 'HARD-NO';
}

export interface PccDocumentControlReviewQueueItem {
  itemId: string;
  fileName: string;
  reviewType: DocumentControlReviewType;
  reviewState: DocumentControlReviewState;
  assignedRoleCode: DocumentControlRoleCode;
}

export interface PccExternalLinksReadModel {
  links: readonly IExternalSystemLink[];
  missingConfigurations: readonly IExternalSystemMissingConfig[];
}

export interface PccSiteHealthReadModel {
  summary: ISiteHealthSummary;
}

export interface PccTeamAccessReadModel {
  preview: ITeamAccessPreviewModel;
}

export interface PccSettingsReadModel {
  settings: readonly IPccSettingsRef[];
}

export interface PccResponsibilityMatrixReadModel {
  templates: readonly IResponsibilityTemplateLibraryRecord[];
  projectInstances: readonly IResponsibilityProjectInstanceRecord[];
  exceptions: readonly IResponsibilityException[];
  healthScore: ResponsibilityMatrixHealthScore;
  workbookSourceSummary: IResponsibilityWorkbookSourceSummary;
  sourcePosture: IResponsibilityMatrixSourcePosture;
  snapshotHistory: readonly IResponsibilityMatrixSnapshot[];
  auditEvents: readonly IResponsibilityAuditEvent[];
  laneVocabulary?: readonly ResponsibilityMatrixLane[];
}

export interface PccReadModelResponseMap {
  profile: PccReadModelEnvelope<PccProjectProfileReadModel>;
  modules: PccReadModelEnvelope<PccWorkCenterRegistryReadModel>;
  home: PccReadModelEnvelope<PccProjectHomeReadModel>;
  'priority-actions': PccReadModelEnvelope<PccPriorityActionsReadModel>;
  'document-control': PccReadModelEnvelope<PccDocumentControlReadModel>;
  'external-links': PccReadModelEnvelope<PccExternalLinksReadModel>;
  'site-health': PccReadModelEnvelope<PccSiteHealthReadModel>;
  'team-access': PccReadModelEnvelope<PccTeamAccessReadModel>;
  settings: PccReadModelEnvelope<PccSettingsReadModel>;
  'project-readiness': PccReadModelEnvelope<PccProjectReadinessFrameworkReadModel>;
  'lifecycle-readiness': PccReadModelEnvelope<PccLifecycleReadinessReadModel>;
  'permit-inspection-control-center': PccReadModelEnvelope<PccPermitInspectionControlCenterReadModel>;
  'responsibility-matrix': PccReadModelEnvelope<PccResponsibilityMatrixReadModel>;
  'constraints-log': PccReadModelEnvelope<PccConstraintsLogReadModel>;
  'buyout-log': PccReadModelEnvelope<PccBuyoutLogReadModel>;
  'procore-project-mapping': PccReadModelEnvelope<PccProcoreProjectMappingReadModel>;
  'procore-sync-health': PccReadModelEnvelope<PccProcoreSyncHealthReadModel>;
  'unified-lifecycle': PccReadModelEnvelope<PccUnifiedLifecycleReadModel>;
  'project-memory': PccReadModelEnvelope<PccProjectMemoryReadModel>;
  'project-lenses': PccReadModelEnvelope<PccProjectLensesReadModel>;
  'project-traceability': PccReadModelEnvelope<PccProjectTraceabilityReadModel>;
  'warranty-trace': PccReadModelEnvelope<PccWarrantyTraceReadModel>;
  'cross-project-knowledge': PccReadModelEnvelope<PccCrossProjectKnowledgeReadModel>;
  'unified-search': PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel>;
  /**
   * Wave 14 / Prompt 03 — composite approvals/checkpoints read-model
   * (queue, my-approvals, registry, escalation, admin-verification,
   * policy, analytics). `detail` and `decisionHistory` are deferred to
   * a future per-request route.
   */
  approvals: PccReadModelEnvelope<PccApprovalsReadModel>;
  /**
   * Wave 15 / External Systems Launch Pad — composite + per-section
   * read-model envelopes. All metadata-only; no live external-system
   * calls, no Graph/PnP writes, no tenant mutation. The Wave 1 legacy
   * `external-links` envelope above remains active for backward compat;
   * Wave 15 keys are additive, never replacements.
   */
  'external-systems-launch-pad': PccReadModelEnvelope<IPccExternalSystemsLaunchPadReadModel>;
  'external-system-registry': PccReadModelEnvelope<IPccExternalSystemRegistryReadModel>;
  'project-external-launch-links': PccReadModelEnvelope<IPccProjectExternalLaunchLinksReadModel>;
  'project-external-system-mappings': PccReadModelEnvelope<IPccProjectExternalSystemMappingsReadModel>;
  'external-object-references': PccReadModelEnvelope<IPccExternalObjectReferencesReadModel>;
  'external-review-items': PccReadModelEnvelope<IPccExternalReviewItemsReadModel>;
  'external-system-health-snapshots': PccReadModelEnvelope<IPccExternalSystemHealthSnapshotsReadModel>;
  'external-system-audit-events': PccReadModelEnvelope<IPccExternalSystemAuditEventsReadModel>;
  'hbi-source-lineage': PccReadModelEnvelope<IPccHbiSourceLineageReadModel>;
}
