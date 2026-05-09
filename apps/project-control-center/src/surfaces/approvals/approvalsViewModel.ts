/**
 * PCC Approvals / Checkpoints view-model contract (Phase 3 / Wave 14 / Prompt 05).
 *
 * Authoritative shape returned by `buildPccApprovalsViewModel`. The view-model
 * is a discriminated union (`loading` / `error` / `ready`) that mirrors the
 * `IPccBuyoutLogViewModel` and `IPccConstraintsLogViewModel` contracts. Each
 * lane carries the data its dedicated card needs without re-walking the
 * read-model.
 *
 * The narrow read-model client interface lists only `getApprovals` so
 * non-api consumers can type the client prop without re-exporting the full
 * `IPccReadModelClient` surface.
 *
 * `decisionHistory` and `detail` are intentionally excluded from
 * `PccApprovalsReadModel` (Wave 14 / Prompt 03). Decision history and source
 * lineage are surfaced as deferred-posture seam objects only — never
 * synthesised from queue/registry rows.
 */

import type {
  AdminVerificationQueueReadModel,
  ApprovalAnalyticsReadModel,
  ApprovalPolicyReadModel,
  ApprovalQueueReadModel,
  ApprovalRequestState,
  CheckpointKindFamily,
  CheckpointRegistryReadModel,
  CheckpointSourceModule,
  EscalationQueueReadModel,
  IAdminVerificationQueueEntry,
  IApprovalPolicy,
  IApprovalPolicyVersion,
  IApprovalQueueEntry,
  ICheckpointDefinition,
  ICheckpointInstance,
  IEscalationQueueEntry,
  MyApprovalsReadModel,
  PccApprovalsReadModel,
  PccPersona,
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import type { PccPreviewStateKind } from '../../ui/PccPreviewState.js';

// ---------------------------------------------------------------------------
// Narrow read-model client interface — single method
// ---------------------------------------------------------------------------

export interface IPccApprovalsReadModelClient {
  getApprovals(
    projectId: PccProjectId,
    viewerPersona?: PccPersona,
  ): Promise<PccReadModelEnvelope<PccApprovalsReadModel>>;
}

// ---------------------------------------------------------------------------
// Lane IDs (tuple drives test scoping; one card per id in the ready path)
//
// Wave 15A wave-b9 Prompt 4B-05 — `home` was removed from the canonical
// ready-path tuple after `HomeCard` was deleted (its metric pills were
// absorbed into `QueueCard`). The `'home'` lane marker still appears on
// the loading and error state cards as a stable test marker for the
// single-card degraded state, but those cards are tested by hardcoded
// assertions (not by iterating this tuple).
// ---------------------------------------------------------------------------

export const PCC_APPROVALS_LANE_IDS = [
  'queue',
  'my-approvals',
  'registry',
  'escalation',
  'admin-verification',
  'policy',
  'module-integration',
  'decision-history',
  'lineage',
  'hbi-boundary',
] as const;
export type PccApprovalsLaneId = (typeof PCC_APPROVALS_LANE_IDS)[number];

// ---------------------------------------------------------------------------
// Disabled-action reason keys (preview-only posture)
// ---------------------------------------------------------------------------

export const PCC_APPROVALS_DISABLED_ACTION_KEYS = [
  'approve',
  'reject',
  'waive',
  'override',
  'defer',
  'cancel',
  'supersede',
  'manual-close',
  'escalate',
  'open-detail',
] as const;
export type PccApprovalsDisabledActionKey = (typeof PCC_APPROVALS_DISABLED_ACTION_KEYS)[number];

export interface IPccApprovalsDisabledAction {
  readonly key: PccApprovalsDisabledActionKey;
  readonly label: string;
  readonly reason: string;
}

// ---------------------------------------------------------------------------
// Lane: 1 — Approvals Home (analytics totals + per-state pills)
// ---------------------------------------------------------------------------

export interface IPccApprovalsStateCount {
  readonly state: ApprovalRequestState;
  readonly count: number;
}

export interface IPccApprovalsModeCount {
  readonly mode: string;
  readonly count: number;
}

export interface IPccApprovalsHomeViewModel {
  readonly totalRequests: number;
  readonly stateCounts: readonly IPccApprovalsStateCount[];
  readonly modeCounts: readonly IPccApprovalsModeCount[];
  readonly pendingActiveCount: number;
  readonly terminalCount: number;
  readonly escalatedCount: number;
}

// ---------------------------------------------------------------------------
// Lane: 2 — Approval Queue rows
// ---------------------------------------------------------------------------

export interface IPccApprovalsQueueRow {
  readonly approvalRequestId: string;
  readonly title: string;
  readonly state: ApprovalRequestState;
  readonly assignedRoleLabel: string;
  readonly priorityLabel: string;
  readonly createdAtDisplay: string;
}

export interface IPccApprovalsQueueViewModel {
  readonly rows: readonly IPccApprovalsQueueRow[];
}

// ---------------------------------------------------------------------------
// Lane: 3 — My Approvals rows
// ---------------------------------------------------------------------------

export interface IPccApprovalsMyApprovalsViewModel {
  readonly viewerPrincipalKey: string;
  readonly viewerRoleLabel: string;
  readonly rows: readonly IPccApprovalsQueueRow[];
}

// ---------------------------------------------------------------------------
// Lane: 4 — Checkpoint Registry rows
// ---------------------------------------------------------------------------

export interface IPccApprovalsRegistryDefinitionRow {
  readonly definitionId: string;
  readonly sourceModule: CheckpointSourceModule;
  readonly kind: CheckpointKindFamily;
  readonly ownerRole: PccPersona;
}

export interface IPccApprovalsRegistryInstanceRow {
  readonly instanceId: string;
  readonly definitionId: string;
  readonly sourceModule: CheckpointSourceModule;
  readonly state: ApprovalRequestState;
  readonly createdAtDisplay: string;
}

export interface IPccApprovalsRegistryViewModel {
  readonly definitionCount: number;
  readonly instanceCount: number;
  readonly definitionRows: readonly IPccApprovalsRegistryDefinitionRow[];
  readonly instanceRows: readonly IPccApprovalsRegistryInstanceRow[];
}

// ---------------------------------------------------------------------------
// Lane: 5 — Escalation Queue rows
// ---------------------------------------------------------------------------

export interface IPccApprovalsEscalationRow extends IPccApprovalsQueueRow {
  readonly escalationReason: string;
  readonly escalationTargetRoleLabel: string;
}

export interface IPccApprovalsEscalationViewModel {
  readonly rows: readonly IPccApprovalsEscalationRow[];
}

// ---------------------------------------------------------------------------
// Lane: 6 — Admin Verification Queue rows
// ---------------------------------------------------------------------------

export interface IPccApprovalsAdminVerificationRow extends IPccApprovalsQueueRow {
  readonly verificationKind: CheckpointKindFamily;
}

export interface IPccApprovalsAdminVerificationViewModel {
  readonly rows: readonly IPccApprovalsAdminVerificationRow[];
}

// ---------------------------------------------------------------------------
// Lane: 7 — Policy Summary
// ---------------------------------------------------------------------------

export interface IPccApprovalsPolicyRow {
  readonly policyId: string;
  readonly displayName: string;
  readonly versionCount: number;
}

export interface IPccApprovalsPolicyViewModel {
  readonly policyCount: number;
  readonly versionCount: number;
  readonly rows: readonly IPccApprovalsPolicyRow[];
}

// ---------------------------------------------------------------------------
// Lane: 8 — Module Integration Panels (analytics.countsBySourceModule rows
//          ordered by canonical CHECKPOINT_SOURCE_MODULES tuple)
// ---------------------------------------------------------------------------

export interface IPccApprovalsModuleIntegrationRow {
  readonly sourceModule: CheckpointSourceModule;
  readonly count: number;
  /**
   * Wave 14 / Prompt 06 — per-source-module ownership-posture caption.
   * For Wave 13G this asserts feature/UX authority; for other modules it
   * cites source-module ownership boundaries.
   */
  readonly ownershipPosture: string;
}

export interface IPccApprovalsModuleIntegrationViewModel {
  readonly rows: readonly IPccApprovalsModuleIntegrationRow[];
}

// ---------------------------------------------------------------------------
// Lane: 9 — Decision History (deferred-posture seam only)
// ---------------------------------------------------------------------------

export interface IPccApprovalsDecisionHistorySeam {
  readonly title: string;
  readonly description: string;
  readonly deferredReason: string;
}

// ---------------------------------------------------------------------------
// Lane: 10 — Source / Evidence Lineage (deferred-posture seam +
//           composite-derived counts only — no link rows, no references)
// ---------------------------------------------------------------------------

export interface IPccApprovalsLineageSeam {
  readonly title: string;
  readonly description: string;
  readonly deferredReason: string;
  readonly registryDefinitionCount: number;
  readonly registryInstanceCount: number;
  readonly sourceModuleSummaryRows: readonly IPccApprovalsModuleIntegrationRow[];
}

// ---------------------------------------------------------------------------
// Lane: 11 — HBI Boundary (no-authority panel copy)
// ---------------------------------------------------------------------------

export interface IPccApprovalsHbiBoundary {
  readonly title: string;
  readonly summary: string;
  readonly may: readonly string[];
  readonly mayNot: readonly string[];
}

// ---------------------------------------------------------------------------
// Combined ready view-model
// ---------------------------------------------------------------------------

export interface IPccApprovalsReadyViewModel {
  readonly status: 'ready';
  readonly sourceStatus: PccReadModelSourceStatus;
  readonly cardState: PccPreviewStateKind;
  readonly viewerPersona?: PccPersona;
  readonly home: IPccApprovalsHomeViewModel;
  readonly queue: IPccApprovalsQueueViewModel;
  readonly myApprovals: IPccApprovalsMyApprovalsViewModel;
  readonly registry: IPccApprovalsRegistryViewModel;
  readonly escalation: IPccApprovalsEscalationViewModel;
  readonly adminVerification: IPccApprovalsAdminVerificationViewModel;
  readonly policy: IPccApprovalsPolicyViewModel;
  readonly moduleIntegration: IPccApprovalsModuleIntegrationViewModel;
  readonly decisionHistorySeam: IPccApprovalsDecisionHistorySeam;
  readonly lineageSeam: IPccApprovalsLineageSeam;
  readonly hbiBoundary: IPccApprovalsHbiBoundary;
  readonly disabledActions: readonly IPccApprovalsDisabledAction[];
}

export type IPccApprovalsViewModel =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | IPccApprovalsReadyViewModel;

// ---------------------------------------------------------------------------
// Local row aliases (for type compatibility in the adapter)
// ---------------------------------------------------------------------------

export type {
  AdminVerificationQueueReadModel,
  ApprovalAnalyticsReadModel,
  ApprovalPolicyReadModel,
  ApprovalQueueReadModel,
  CheckpointRegistryReadModel,
  EscalationQueueReadModel,
  IAdminVerificationQueueEntry,
  IApprovalPolicy,
  IApprovalPolicyVersion,
  IApprovalQueueEntry,
  ICheckpointDefinition,
  ICheckpointInstance,
  IEscalationQueueEntry,
  MyApprovalsReadModel,
};
