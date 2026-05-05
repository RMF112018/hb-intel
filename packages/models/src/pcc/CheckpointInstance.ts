/**
 * PCC checkpoint instance + Wave 14 read-model envelope shapes.
 *
 * Phase 3 / Wave 14 / Prompt 02. This file is the downstream sibling of
 * `./ApprovalCheckpoint.ts` in a strict one-way dependency
 * (`CheckpointInstance.ts` → `ApprovalCheckpoint.ts`; never the
 * reverse). It owns:
 *
 *   - source-module + checkpoint kind-family vocabulary;
 *   - `ICheckpointDefinition`, `ICheckpointInstance`,
 *     `ICheckpointEvidenceLink`, `ICheckpointSourceReference`,
 *     `ICheckpointAuditEvent`, `IApprovalPriorityActionLink`;
 *   - Wave 14 read-model envelope shapes (queue / my-approvals /
 *     detail / registry / history / escalation / admin-verification /
 *     policy / analytics) — type-only; registration in
 *     `PccReadModelResponseMap` is deferred to Prompt 03/04 when
 *     producers exist;
 *   - `isStaleSourceReference(...)` (owned here because its parameter
 *     `ICheckpointSourceReference` is defined here — placing it in
 *     `ApprovalCheckpoint.ts` would force a back-import and create a
 *     TS module cycle);
 *   - `mapLegacyCheckpointToInstance(...)` bridge from the Wave 1
 *     `IApprovalCheckpoint` shape to the Wave 14 `ICheckpointInstance`
 *     shape, demonstrating non-parallel architecture at the data layer.
 *
 * No backend, SPFx, PnP, Azure, Procore, Sage, Graph, fetch, or
 * Power-Automate runtime imports. Power-Automate is reference
 * architecture only and never an MVP runtime dependency.
 */

import type {
  ApprovalCheckpointType,
  ApprovalRequestState,
  IApprovalCheckpoint,
  IApprovalDecisionApprove,
  IApprovalDecisionRejectReturn,
  IApprovalDecisionRequestRevision,
  IApprovalDecisionAcknowledge,
  IApprovalDecisionDefer,
  IApprovalDecisionWaive,
  IApprovalDecisionOverride,
  IApprovalDecisionEscalate,
  IApprovalDecisionCancel,
  IApprovalDecisionSupersede,
  IApprovalDecisionManualClose,
  IApprovalPolicy,
  IApprovalPolicyVersion,
  IApprovalRequest,
  IApprovalRoute,
  IApprovalStep,
  IApprovalParticipant,
  ApprovalAuditEventType,
  ApprovalRedactionCategory,
} from './ApprovalCheckpoint.js';
import type {
  PccApprovalPolicyId,
  PccApprovalPriorityActionLinkId,
  PccApprovalRequestId,
  PccApprovalStepId,
  PccCheckpointAuditEventId,
  PccCheckpointDefinitionId,
  PccCheckpointEvidenceLinkId,
  PccCheckpointInstanceId,
  PccCheckpointSourceReferenceId,
  PccProjectId,
} from './types.js';
import type { PccPersona } from './PccUserRoles.js';

// ---------------------------------------------------------------------------
// Source-module + kind-family vocabulary
// ---------------------------------------------------------------------------

/**
 * Wave 14 source modules that own checkpoint records.
 *
 * Ownership is preserved by source modules — Wave 14 is the
 * approval/checkpoint control layer, not a record-of-truth substitute.
 */
export const CHECKPOINT_SOURCE_MODULES = [
  'team-and-access',
  'document-control',
  'project-lifecycle-readiness-center',
  'permit-and-inspection-control-center',
  'responsibility-matrix',
  'constraints-log',
  'buyout-log',
  'estimating-workbench-wave-13g',
  'external-systems',
  'site-health',
  'priority-actions',
  'project-readiness',
  'executive-oversight',
  'admin-review-surfaces',
] as const;

export type CheckpointSourceModule = (typeof CHECKPOINT_SOURCE_MODULES)[number];

/** Wave 14 checkpoint kind-family tuple (taxonomy of approval responsibilities). */
export const CHECKPOINT_KIND_FAMILIES = [
  'access-security-approval',
  'technical-admin-checkpoint',
  'workflow-item-review',
  'external-system-mapping-correction',
  'readiness-gate-checkpoint',
  'exception-waiver-override',
  'executive-escalation',
  'handoff-freeze-checkpoint',
  'estimating-workbench-checkpoint',
  'site-health-repair-request-review',
] as const;

export type CheckpointKindFamily = (typeof CHECKPOINT_KIND_FAMILIES)[number];

// ---------------------------------------------------------------------------
// Checkpoint domain interfaces
// ---------------------------------------------------------------------------

/**
 * Definition record for a checkpoint kind. Required `kind` and
 * `ownerRole` are the Wave 14 authoritative posture (legacy
 * `IApprovalCheckpoint.checkpointType` and `authorityType` remain
 * optional for backward compatibility).
 */
export interface ICheckpointDefinition {
  readonly id: PccCheckpointDefinitionId;
  readonly sourceModule: CheckpointSourceModule;
  readonly kind: CheckpointKindFamily;
  /** APR-VAL rules that apply to checkpoints of this kind. */
  readonly validationRuleIds: readonly string[];
  readonly ownerRole: PccPersona;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly defaultApprovalPolicyId?: PccApprovalPolicyId;
}

export interface ICheckpointInstance {
  readonly id: PccCheckpointInstanceId;
  readonly definitionId: PccCheckpointDefinitionId;
  readonly sourceItemId: string;
  readonly sourceModule: CheckpointSourceModule;
  readonly state: ApprovalRequestState;
  /** ISO 8601 UTC. */
  readonly createdAtUtc: string;
  readonly approvalRequestId?: PccApprovalRequestId;
  readonly priority?: 'low' | 'normal' | 'high' | 'urgent';
  /** ISO 8601 UTC. */
  readonly expiresAtUtc?: string;
}

export interface ICheckpointEvidenceLink {
  readonly id: PccCheckpointEvidenceLinkId;
  readonly decisionId: string;
  readonly evidenceType: string;
  readonly evidenceReference: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

/**
 * Source-module reference snapshotted at the time a checkpoint was
 * raised. `sourceItemVersion` is the version observed when the record
 * was captured; staleness detection compares against the current
 * version via `isStaleSourceReference`.
 */
export interface ICheckpointSourceReference {
  readonly id: PccCheckpointSourceReferenceId;
  readonly approvalRequestId: PccApprovalRequestId;
  readonly sourceModule: CheckpointSourceModule;
  readonly sourceItemId: string;
  readonly sourceItemVersion: string;
  readonly sourceItemSnapshot?: Readonly<Record<string, unknown>>;
}

export interface ICheckpointAuditEvent {
  readonly id: PccCheckpointAuditEventId;
  readonly approvalRequestId: PccApprovalRequestId;
  readonly eventType: ApprovalAuditEventType;
  /** ISO 8601 UTC. */
  readonly timestamp: string;
  readonly actorPrincipalKey: string;
  readonly actorRole: PccPersona | null;
  readonly details?: Readonly<Record<string, string>>;
  readonly impactedRecords?: readonly string[];
}

export interface IApprovalPriorityActionLink {
  readonly id: PccApprovalPriorityActionLinkId;
  readonly projectId: PccProjectId;
  readonly approvalRequestId: PccApprovalRequestId;
  readonly currentStepId: PccApprovalStepId;
  readonly actionType:
    | 'approval-pending'
    | 'revision-required'
    | 'escalation-pending'
    | 'execution-pending'
    | 'admin-verify-pending';
  /** ISO 8601 UTC. */
  readonly createdAtUtc: string;
  readonly state?: 'open' | 'resolved' | 'suppressed';
  /** ISO 8601 UTC. */
  readonly resolvedAtUtc?: string;
  readonly suppressionReason?: string;
}

// ---------------------------------------------------------------------------
// Wave 14 read-model envelope shapes
//
// Type-only contracts. Registration in `PccReadModelResponseMap`
// (PccReadModels.ts) is deferred to Prompt 03 (backend route lands)
// and Prompt 04 (SPFx client method lands) so the response-map cascade
// in PccReadModels.test.ts is paid once with real producers.
// ---------------------------------------------------------------------------

/** Decision union assembled here for envelope use (no back-import to ApprovalCheckpoint.ts). */
export type ApprovalDecisionForReadModel =
  | IApprovalDecisionApprove
  | IApprovalDecisionRejectReturn
  | IApprovalDecisionRequestRevision
  | IApprovalDecisionAcknowledge
  | IApprovalDecisionDefer
  | IApprovalDecisionWaive
  | IApprovalDecisionOverride
  | IApprovalDecisionEscalate
  | IApprovalDecisionCancel
  | IApprovalDecisionSupersede
  | IApprovalDecisionManualClose;

/** A queue entry is a snapshot of a request + its current step + assigned role. */
export interface IApprovalQueueEntry {
  readonly approvalRequestId: PccApprovalRequestId;
  readonly projectId: PccProjectId;
  readonly state: ApprovalRequestState;
  readonly currentStepId?: PccApprovalStepId;
  readonly assignedRole?: PccPersona;
  readonly priority?: 'low' | 'normal' | 'high' | 'urgent';
  /** ISO 8601 UTC. */
  readonly createdAtUtc: string;
  /** ISO 8601 UTC. */
  readonly dueAtUtc?: string;
  readonly title?: string;
  readonly redactedFields?: readonly ApprovalRedactionCategory[];
}

export interface ApprovalQueueReadModel {
  readonly entries: readonly IApprovalQueueEntry[];
}

export interface MyApprovalsReadModel {
  readonly viewerPrincipalKey: string;
  readonly viewerRole: PccPersona;
  readonly entries: readonly IApprovalQueueEntry[];
}

export interface ApprovalDetailReadModel {
  readonly request: IApprovalRequest;
  readonly route: IApprovalRoute;
  readonly steps: readonly IApprovalStep[];
  readonly participants: readonly IApprovalParticipant[];
  readonly decisions: readonly ApprovalDecisionForReadModel[];
  readonly evidenceLinks: readonly ICheckpointEvidenceLink[];
  readonly sourceReferences: readonly ICheckpointSourceReference[];
  readonly redactedFields?: readonly ApprovalRedactionCategory[];
}

export interface CheckpointRegistryReadModel {
  readonly definitions: readonly ICheckpointDefinition[];
  readonly checkpointInstances: readonly ICheckpointInstance[];
}

export interface DecisionHistoryReadModel {
  readonly approvalRequestId: PccApprovalRequestId;
  readonly decisions: readonly ApprovalDecisionForReadModel[];
  readonly auditEvents: readonly ICheckpointAuditEvent[];
}

export interface IEscalationQueueEntry extends IApprovalQueueEntry {
  readonly escalationReason: string;
  readonly escalationTargetRole: PccPersona;
}

export interface EscalationQueueReadModel {
  readonly entries: readonly IEscalationQueueEntry[];
}

export interface IAdminVerificationQueueEntry extends IApprovalQueueEntry {
  readonly verificationKind: CheckpointKindFamily;
}

export interface AdminVerificationQueueReadModel {
  readonly entries: readonly IAdminVerificationQueueEntry[];
}

export interface ApprovalPolicyReadModel {
  readonly policies: readonly IApprovalPolicy[];
  readonly versions: readonly IApprovalPolicyVersion[];
}

/** Aggregate counts derived from the rest of the Wave 14 fixture set. */
export interface ApprovalAnalyticsReadModel {
  readonly totalRequests: number;
  readonly countsByState: Readonly<Record<ApprovalRequestState, number>>;
  readonly countsByMode: Readonly<Record<string, number>>;
  readonly countsBySourceModule: Readonly<Record<CheckpointSourceModule, number>>;
}

/**
 * Wave 14 / Prompt 03 composite read-model returned from
 * `pcc/projects/{projectId}/approvals`.
 *
 * Intentionally excludes `detail` (`ApprovalDetailReadModel`) and
 * `decisionHistory` (`DecisionHistoryReadModel`) — those are
 * request-scoped and would require an `approvalRequestId` query param
 * to be meaningful. They are deferred to a future per-request detail
 * route (post-Wave-14) when SPFx surfaces require per-request drilldown.
 * Defining them in the composite would force callers to ignore unused
 * sub-shapes and would pay the response-map cascade twice.
 */
export interface PccApprovalsReadModel {
  readonly queue: ApprovalQueueReadModel;
  readonly myApprovals: MyApprovalsReadModel;
  readonly registry: CheckpointRegistryReadModel;
  readonly escalation: EscalationQueueReadModel;
  readonly adminVerification: AdminVerificationQueueReadModel;
  readonly policy: ApprovalPolicyReadModel;
  readonly analytics: ApprovalAnalyticsReadModel;
}

// ---------------------------------------------------------------------------
// Helpers (parameter types defined in this file)
// ---------------------------------------------------------------------------

/**
 * True if `ref.sourceItemVersion !== currentVersion`. Pure predicate;
 * no I/O. Owned here because `ICheckpointSourceReference` is defined in
 * this file — co-locating the helper with the type prevents a back-import
 * into `ApprovalCheckpoint.ts` and avoids a TS module cycle.
 */
export function isStaleSourceReference(
  ref: ICheckpointSourceReference,
  currentVersion: string,
): boolean {
  return ref.sourceItemVersion !== currentVersion;
}

/**
 * Map a Wave 1 legacy `IApprovalCheckpoint` record into a Wave 14
 * `ICheckpointInstance` shape. Preserves id and timestamps; widens the
 * legacy 4-state tuple to the Wave 14 17-state tuple via a documented
 * mapping (`pending → pending-review`; `approved`/`rejected`/`waived`
 * mapped to their Wave 14 equivalents — `rejected → rejected-returned`,
 * `approved → approved`, `waived → waived`).
 *
 * Pure; no I/O. Used by fixtures and tests to demonstrate the
 * Wave 1 → Wave 14 bridge so the new architecture is connected to the
 * existing data layer rather than parallel.
 */
export function mapLegacyCheckpointToInstance(
  legacy: IApprovalCheckpoint,
  opts: {
    readonly definitionId: PccCheckpointDefinitionId;
    readonly sourceModule: CheckpointSourceModule;
  },
): ICheckpointInstance {
  const stateMap: Readonly<Record<IApprovalCheckpoint['state'], ApprovalRequestState>> = {
    pending: 'pending-review',
    approved: 'approved',
    rejected: 'rejected-returned',
    waived: 'waived',
  };
  // The legacy `id` brand is reused as the Wave 14 instance id so
  // existing fixture identities are preserved end-to-end.
  const instanceId = legacy.id as unknown as PccCheckpointInstanceId;
  return {
    id: instanceId,
    definitionId: opts.definitionId,
    sourceItemId: legacy.workflowItemId as unknown as string,
    sourceModule: opts.sourceModule,
    state: stateMap[legacy.state],
    createdAtUtc: legacy.requestedAtUtc,
  };
}

/**
 * Width-narrowing helper: surface the legacy checkpoint type when the
 * caller wants to show it in a Wave 14 read-model column. Pure; no I/O.
 */
export function legacyCheckpointKind(
  legacy: IApprovalCheckpoint,
): ApprovalCheckpointType | 'generic' {
  return legacy.checkpointType ?? 'generic';
}
