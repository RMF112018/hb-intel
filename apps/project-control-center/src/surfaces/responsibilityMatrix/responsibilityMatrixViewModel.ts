/**
 * PCC Responsibility Matrix view-model contract (Phase 3 / Wave 11 / Prompt 05).
 *
 * Authoritative shape returned by `buildPccResponsibilityMatrixViewModel`.
 * The view-model is a discriminated union (`loading` / `error` / `ready`)
 * mirroring `IPccProjectReadinessViewModel`. Each lane carries the data
 * its dedicated card needs without re-walking the read-model.
 *
 * Defines the narrow read-model client interface consumed by the
 * Responsibility Matrix region group inside `PccProjectReadinessSurface`.
 * Lists only `getResponsibilityMatrix` so non-api consumers can type the
 * client prop without crossing the controlled-consumption guard.
 */

import type {
  IResponsibilityAuditEvent,
  IResponsibilityException,
  IResponsibilityHandoff,
  IResponsibilityMatrixSnapshot,
  IResponsibilityProjectInstanceRecord,
  IResponsibilityTemplateLibraryRecord,
  IResponsibilityWorkbookSourceSummary,
  PccPersona,
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  PccResponsibilityMatrixReadModel,
  ResponsibilityAssignmentLifecycleState,
  ResponsibilityContractParty,
  ResponsibilityCriticality,
  ResponsibilityExceptionCode,
  ResponsibilityHealthBand,
  ResponsibilityItemClassification,
  ResponsibilityMatrixHealthScore,
} from '@hbc/models/pcc';
import type { PccCardState } from '../projectHome/shared.js';

export interface IPccResponsibilityMatrixReadModelClient {
  getResponsibilityMatrix(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccResponsibilityMatrixReadModel>>;
}

// ---------------------------------------------------------------------------
// Shared lane fragments
// ---------------------------------------------------------------------------

export interface IPccRmCountPosture {
  readonly defaultItemsTotal: number;
  readonly pmItems: number;
  readonly fieldItems: number;
  readonly strictMarkedRows: number;
  readonly ambiguousItemsTotal: number;
  readonly ownerContractActiveDefaultObligations: number;
  readonly headlineCaption: string;
  readonly explanationCaption: string;
  readonly sourceFiles: readonly string[];
}

export interface IPccRmHealthBadgeViewModel {
  readonly state: ResponsibilityMatrixHealthScore['state'];
  readonly band?: ResponsibilityHealthBand;
  readonly badgeLabel: string;
  readonly summaryCaption: string;
  readonly counts?: {
    readonly openCriticalExceptions: number;
    readonly overdueActions: number;
    readonly missingAccountableOwners: number;
    readonly missingCurrentActionOwners: number;
    readonly pendingEvidence: number;
    readonly unresolvedDecisionRightsGaps: number;
  };
  readonly insufficientReason?: string;
}

export interface IPccRmSourceTraceabilityViewModel {
  readonly sourceStatus: PccReadModelSourceStatus;
  readonly confidenceLabel: string;
  readonly lastIngestedDisplay: string;
  readonly pendingHumanReviewCount: number;
  readonly traceabilityCaption: string;
}

export interface IPccRmSnapshotSummaryViewModel {
  readonly snapshotId: string;
  readonly generatedAtDisplay: string;
  readonly summary: string;
  readonly readOnlyBadge: string;
}

export interface IPccRmWhoOwnsLookupResult {
  readonly key: string;
  readonly instanceId: string;
  readonly sourceTask: string;
  readonly roleCode: string;
  readonly roleLabel: string;
  readonly personId?: string;
  readonly personDisplayName?: string;
  readonly personIsActive?: boolean;
  readonly accountabilityKind: 'accountable' | 'current-action' | 'owner-role';
}

// ---------------------------------------------------------------------------
// Lane: 1 — Overview
// ---------------------------------------------------------------------------

export interface IPccRmOverviewViewModel {
  readonly readOnlyCaption: string;
  readonly noExecutionCaption: string;
  readonly healthBadge: IPccRmHealthBadgeViewModel;
  readonly countPosture: IPccRmCountPosture;
  readonly sourceTraceability: IPccRmSourceTraceabilityViewModel;
  readonly snapshotSummary?: IPccRmSnapshotSummaryViewModel;
  readonly raciVsContractPartyCaption: string;
  readonly evidenceReferenceCaption: string;
  readonly whoOwnsResults: readonly IPccRmWhoOwnsLookupResult[];
}

// ---------------------------------------------------------------------------
// Lane: 2 — Matrix View (per-instance row)
// ---------------------------------------------------------------------------

export interface IPccRmMatrixRowViewModel {
  readonly instanceId: string;
  readonly sourceTask: string;
  readonly classification: ResponsibilityItemClassification;
  readonly classificationLabel: string;
  readonly criticality: ResponsibilityCriticality;
  readonly criticalityLabel: string;
  readonly domainLabel: string;
  readonly accountableOwnerDisplay: string;
  readonly currentActionOwnerDisplay: string;
  readonly ballInCourtCaption: string;
  readonly hasOpenException: boolean;
}

export interface IPccRmMatrixViewViewModel {
  readonly rows: readonly IPccRmMatrixRowViewModel[];
  readonly emptyCaption: string;
  readonly toggleLabelRoleMode: string;
  readonly toggleLabelPersonMode: string;
}

// ---------------------------------------------------------------------------
// Lane: 3 — Item Register
// ---------------------------------------------------------------------------

export interface IPccRmRegisterRowViewModel {
  readonly instanceId: string;
  readonly sourceTask: string;
  readonly classification: ResponsibilityItemClassification;
  readonly classificationLabel: string;
  readonly criticalityLabel: string;
  readonly domainLabel: string;
  readonly currentActionOwnerDisplay: string;
  readonly dueDateDisplay?: string;
  readonly isOverdue: boolean;
  readonly lifecycleState: ResponsibilityAssignmentLifecycleState;
  readonly lifecycleStateLabel: string;
  readonly exceptionCodes: readonly ResponsibilityExceptionCode[];
  readonly evidenceStatusSummary: string;
  readonly templateItemId: string;
  readonly templateVersion: string;
}

export interface IPccRmItemRegisterViewModel {
  readonly rows: readonly IPccRmRegisterRowViewModel[];
  readonly emptyCaption: string;
}

// ---------------------------------------------------------------------------
// Lane: 4 — Owner-Contract Mapping
// ---------------------------------------------------------------------------

export interface IPccRmOwnerContractTemplateRow {
  readonly templateItemId: string;
  readonly sourceTask: string;
  readonly contractParty: ResponsibilityContractParty;
  readonly contractPartyLabel: string;
  readonly mappingNotes?: string;
  readonly requiresUserReview: boolean;
  readonly obligationSummary?: string;
  readonly contractDocumentRef?: string;
  readonly articleSection?: string;
}

export interface IPccRmOwnerContractInstanceRow {
  readonly instanceId: string;
  readonly sourceTask: string;
  readonly classification: ResponsibilityItemClassification;
  readonly sharedExceptionReason: string;
}

export interface IPccRmOwnerContractViewModel {
  readonly placeholderCaption: string;
  readonly placeholderDetailCaption: string;
  readonly raciVsContractPartyCaption: string;
  readonly activeDefaultObligationsCount: number;
  readonly templateRows: readonly IPccRmOwnerContractTemplateRow[];
  readonly instanceRows: readonly IPccRmOwnerContractInstanceRow[];
  readonly droppedNonRegistryPartyCount: number;
}

// ---------------------------------------------------------------------------
// Lane: 5 — My Responsibilities
// ---------------------------------------------------------------------------

export interface IPccRmMyRowViewModel {
  readonly instanceId: string;
  readonly sourceTask: string;
  readonly accountabilityKind: 'accountable' | 'current-action';
  readonly dueDateDisplay?: string;
  readonly isOverdue: boolean;
  readonly pendingHandoffSummary?: string;
  readonly pendingWorkflowStepSummary?: string;
}

export interface IPccRmMyResponsibilitiesViewModel {
  readonly viewerPersona?: PccPersona;
  readonly viewerPersonaCaption: string;
  readonly rows: readonly IPccRmMyRowViewModel[];
  readonly emptyCaption: string;
}

// ---------------------------------------------------------------------------
// Lane: 6 — Gaps & Conflicts
// ---------------------------------------------------------------------------

export interface IPccRmExceptionGroupViewModel {
  readonly code: ResponsibilityExceptionCode;
  readonly codeLabel: string;
  readonly severityHighest: ResponsibilityCriticality;
  readonly count: number;
  readonly entries: readonly {
    readonly summary: string;
    readonly severity: ResponsibilityCriticality;
    readonly relatedItemId?: string;
  }[];
}

export interface IPccRmGapsConflictsViewModel {
  readonly groups: readonly IPccRmExceptionGroupViewModel[];
  readonly unresolvedDecisionRightsGapsCaption: string;
  readonly emptyCaption: string;
}

// ---------------------------------------------------------------------------
// Lane: 7 — Handoffs
// ---------------------------------------------------------------------------

export interface IPccRmHandoffRowViewModel {
  readonly handoffId: string;
  readonly instanceId: string;
  readonly sourceTask: string;
  readonly fromDisplay: string;
  readonly toDisplay: string;
  readonly requestedAtDisplay: string;
  readonly accepted: boolean;
  readonly statusLabel: string;
  readonly reason?: string;
  readonly lifecycleState: ResponsibilityAssignmentLifecycleState;
  readonly lifecycleStateLabel: string;
}

export interface IPccRmHandoffsViewModel {
  readonly rows: readonly IPccRmHandoffRowViewModel[];
  readonly emptyCaption: string;
}

// ---------------------------------------------------------------------------
// Lane: 8 — Template / Source Mapping Admin
// ---------------------------------------------------------------------------

export interface IPccRmTemplateRowViewModel {
  readonly templateItemId: string;
  readonly templateVersion: string;
  readonly status: 'draft' | 'approved' | 'retired';
  readonly statusLabel: string;
  readonly classification: ResponsibilityItemClassification;
  readonly classificationLabel: string;
  readonly domainLabel: string;
  readonly criticalityLabel: string;
  readonly sourceFile: string;
  readonly sourceSheet: string;
  readonly sourceMarksDisplay: string;
  readonly requiresUserReview: boolean;
  readonly mappingNotes?: string;
  readonly effectiveDateDisplay?: string;
}

export interface IPccRmAuditEventRowViewModel {
  readonly eventId: string;
  readonly eventTypeLabel: string;
  readonly occurredAtDisplay: string;
  readonly entityRef: string;
  readonly summary: string;
  readonly actorDisplay?: string;
}

export interface IPccRmTemplateAdminViewModel {
  readonly templates: readonly IPccRmTemplateRowViewModel[];
  readonly auditEvents: readonly IPccRmAuditEventRowViewModel[];
  readonly governanceCaption: string;
  readonly nonExplicitMarkPolicyCaption: string;
}

// ---------------------------------------------------------------------------
// Discriminated union exported as the surface contract
// ---------------------------------------------------------------------------

export type IPccResponsibilityMatrixViewModel =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | {
      readonly status: 'ready';
      readonly cardState: PccCardState;
      readonly sourceStatus: PccReadModelSourceStatus;
      readonly overview: IPccRmOverviewViewModel;
      readonly matrixView: IPccRmMatrixViewViewModel;
      readonly itemRegister: IPccRmItemRegisterViewModel;
      readonly ownerContract: IPccRmOwnerContractViewModel;
      readonly myResponsibilities: IPccRmMyResponsibilitiesViewModel;
      readonly gapsConflicts: IPccRmGapsConflictsViewModel;
      readonly handoffs: IPccRmHandoffsViewModel;
      readonly templateAdmin: IPccRmTemplateAdminViewModel;
    };

// ---------------------------------------------------------------------------
// Re-exported model types for downstream lane card components
// ---------------------------------------------------------------------------

export type {
  IResponsibilityAuditEvent,
  IResponsibilityException,
  IResponsibilityHandoff,
  IResponsibilityMatrixSnapshot,
  IResponsibilityProjectInstanceRecord,
  IResponsibilityTemplateLibraryRecord,
  IResponsibilityWorkbookSourceSummary,
};
