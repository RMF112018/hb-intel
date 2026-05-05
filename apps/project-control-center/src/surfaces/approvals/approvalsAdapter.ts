/**
 * PCC Approvals / Checkpoints read-model adapter (Phase 3 / Wave 14 / Prompt 05).
 *
 * Pure mapping layer. Converts a `PccApprovalsReadModel` envelope into a
 * stable lane view-model. No React, no hooks, no fetch, no client calls,
 * no clock reads.
 *
 * The adapter returns `status: 'ready'` for every envelope variant; the
 * envelope's `sourceStatus` flows through to `cardState` and
 * `sourceStatus`. The hook (`useApprovalsReadModel`) owns `loading` and
 * `error`.
 *
 * Per-request decision history and source-reference rows are intentionally
 * NOT synthesised: the read model excludes `detail` and `decisionHistory`
 * by design (Prompt 03), and rendering them as "decision-history" or
 * "lineage-link" rows would invent records the source contract does not
 * publish. Both surfaces appear as deferred-posture seam objects with
 * fixed copy + composite-derived counts only.
 */

import {
  CHECKPOINT_SOURCE_MODULES,
  type ApprovalRequestState,
  type CheckpointSourceModule,
  type IAdminVerificationQueueEntry,
  type IApprovalQueueEntry,
  type IEscalationQueueEntry,
  type PccApprovalsReadModel,
  type PccReadModelEnvelope,
} from '@hbc/models/pcc';
import { mapPccSourceStatusToPreviewState } from '../../api/pccReadModelStateMapping.js';
import {
  PCC_APPROVALS_DISABLED_ACTION_KEYS,
  type IPccApprovalsAdminVerificationRow,
  type IPccApprovalsAdminVerificationViewModel,
  type IPccApprovalsDecisionHistorySeam,
  type IPccApprovalsDisabledAction,
  type IPccApprovalsEscalationRow,
  type IPccApprovalsEscalationViewModel,
  type IPccApprovalsHbiBoundary,
  type IPccApprovalsHomeViewModel,
  type IPccApprovalsLineageSeam,
  type IPccApprovalsModeCount,
  type IPccApprovalsModuleIntegrationRow,
  type IPccApprovalsModuleIntegrationViewModel,
  type IPccApprovalsMyApprovalsViewModel,
  type IPccApprovalsPolicyRow,
  type IPccApprovalsPolicyViewModel,
  type IPccApprovalsQueueRow,
  type IPccApprovalsQueueViewModel,
  type IPccApprovalsReadyViewModel,
  type IPccApprovalsRegistryDefinitionRow,
  type IPccApprovalsRegistryInstanceRow,
  type IPccApprovalsRegistryViewModel,
  type IPccApprovalsStateCount,
  type PccApprovalsDisabledActionKey,
} from './approvalsViewModel.js';

// ---------------------------------------------------------------------------
// Terminal vs active state vocabulary (closed list — kept local so the
// adapter does not import from `ApprovalCheckpoint.ts` runtime helpers
// and remains a pure data mapper).
// ---------------------------------------------------------------------------

const TERMINAL_STATES: ReadonlySet<ApprovalRequestState> = new Set<ApprovalRequestState>([
  'approved',
  'rejected-returned',
  'waived',
  'overridden',
  'cancelled',
  'superseded',
  'expired',
  'manually-closed',
  'archived',
]);

// ---------------------------------------------------------------------------
// Display helpers (pure)
// ---------------------------------------------------------------------------

function formatRoleLabel(role?: string): string {
  if (!role) return 'Unassigned';
  return role
    .split('-')
    .map((segment) => (segment.length > 0 ? segment[0]!.toUpperCase() + segment.slice(1) : segment))
    .join(' ');
}

function formatPriorityLabel(priority?: 'low' | 'normal' | 'high' | 'urgent'): string {
  switch (priority) {
    case 'urgent':
      return 'Urgent';
    case 'high':
      return 'High';
    case 'normal':
      return 'Normal';
    case 'low':
      return 'Low';
    default:
      return 'Normal';
  }
}

function formatDateDisplay(iso: string): string {
  // ISO 8601 UTC; render as YYYY-MM-DD for stable, locale-free display.
  return iso.length >= 10 ? iso.slice(0, 10) : iso;
}

function entryTitle(entry: IApprovalQueueEntry): string {
  return entry.title ?? `Approval ${String(entry.approvalRequestId)}`;
}

function toQueueRow(entry: IApprovalQueueEntry): IPccApprovalsQueueRow {
  return {
    approvalRequestId: String(entry.approvalRequestId),
    title: entryTitle(entry),
    state: entry.state,
    assignedRoleLabel: formatRoleLabel(entry.assignedRole),
    priorityLabel: formatPriorityLabel(entry.priority),
    createdAtDisplay: formatDateDisplay(entry.createdAtUtc),
  };
}

function toEscalationRow(entry: IEscalationQueueEntry): IPccApprovalsEscalationRow {
  return {
    ...toQueueRow(entry),
    escalationReason: entry.escalationReason,
    escalationTargetRoleLabel: formatRoleLabel(entry.escalationTargetRole),
  };
}

function toAdminVerificationRow(
  entry: IAdminVerificationQueueEntry,
): IPccApprovalsAdminVerificationRow {
  return {
    ...toQueueRow(entry),
    verificationKind: entry.verificationKind,
  };
}

// ---------------------------------------------------------------------------
// Lane builders (pure)
// ---------------------------------------------------------------------------

function buildHome(data: PccApprovalsReadModel): IPccApprovalsHomeViewModel {
  const stateCounts: IPccApprovalsStateCount[] = (
    Object.entries(data.analytics.countsByState) as ReadonlyArray<
      readonly [ApprovalRequestState, number]
    >
  ).map(([state, count]) => ({ state, count }));
  const modeCounts: IPccApprovalsModeCount[] = Object.entries(data.analytics.countsByMode).map(
    ([mode, count]) => ({ mode, count }),
  );
  let pendingActiveCount = 0;
  let terminalCount = 0;
  for (const { state, count } of stateCounts) {
    if (TERMINAL_STATES.has(state)) {
      terminalCount += count;
    } else {
      pendingActiveCount += count;
    }
  }
  const escalatedCount = data.analytics.countsByState.escalated ?? 0;
  return {
    totalRequests: data.analytics.totalRequests,
    stateCounts,
    modeCounts,
    pendingActiveCount,
    terminalCount,
    escalatedCount,
  };
}

function buildQueue(data: PccApprovalsReadModel): IPccApprovalsQueueViewModel {
  return { rows: data.queue.entries.map(toQueueRow) };
}

function buildMyApprovals(data: PccApprovalsReadModel): IPccApprovalsMyApprovalsViewModel {
  return {
    viewerPrincipalKey: data.myApprovals.viewerPrincipalKey,
    viewerRoleLabel: formatRoleLabel(data.myApprovals.viewerRole),
    rows: data.myApprovals.entries.map(toQueueRow),
  };
}

function buildRegistry(data: PccApprovalsReadModel): IPccApprovalsRegistryViewModel {
  const definitionRows: IPccApprovalsRegistryDefinitionRow[] = data.registry.definitions.map(
    (def) => ({
      definitionId: String(def.id),
      sourceModule: def.sourceModule,
      kind: def.kind,
      ownerRole: def.ownerRole,
    }),
  );
  const instanceRows: IPccApprovalsRegistryInstanceRow[] = data.registry.checkpointInstances.map(
    (inst) => ({
      instanceId: String(inst.id),
      definitionId: String(inst.definitionId),
      sourceModule: inst.sourceModule,
      state: inst.state,
      createdAtDisplay: formatDateDisplay(inst.createdAtUtc),
    }),
  );
  return {
    definitionCount: definitionRows.length,
    instanceCount: instanceRows.length,
    definitionRows,
    instanceRows,
  };
}

function buildEscalation(data: PccApprovalsReadModel): IPccApprovalsEscalationViewModel {
  return { rows: data.escalation.entries.map(toEscalationRow) };
}

function buildAdminVerification(
  data: PccApprovalsReadModel,
): IPccApprovalsAdminVerificationViewModel {
  return { rows: data.adminVerification.entries.map(toAdminVerificationRow) };
}

function buildPolicy(data: PccApprovalsReadModel): IPccApprovalsPolicyViewModel {
  const rows: IPccApprovalsPolicyRow[] = data.policy.policies.map((policy) => ({
    policyId: String(policy.id),
    displayName: policy.name,
    versionCount: data.policy.versions.filter((v) => v.policyId === policy.id).length,
  }));
  return {
    policyCount: data.policy.policies.length,
    versionCount: data.policy.versions.length,
    rows,
  };
}

// Wave 14 / Prompt 06 — per-source-module ownership posture caption. Wave
// 13G entry asserts feature/UX authority; other entries cite source-module
// ownership boundaries. Local constant — no shared label registry edits.
const CHECKPOINT_SOURCE_MODULE_OWNERSHIP_POSTURE: Readonly<Record<CheckpointSourceModule, string>> = {
  'team-and-access':
    'Team and Access owns role/principal records. Wave 14 owns access/security checkpoint queue, routing, decision, and audit semantics.',
  'document-control':
    'Document Control owns the document/file content. Wave 14 owns evidence-sufficiency checkpoint routing and decision audit.',
  'project-lifecycle-readiness-center':
    'Project Lifecycle Readiness Center owns lifecycle items and gates. Wave 14 owns readiness gate checkpoint routing and authority decision.',
  'permit-and-inspection-control-center':
    'Permit and Inspection Control Center owns permit and inspection records. Wave 14 owns waiver/exception checkpoint routing.',
  'responsibility-matrix':
    'Responsibility Matrix owns RACI assignments. Wave 14 owns exception and escalation checkpoint routing.',
  'constraints-log':
    'Constraints Log owns constraint and risk records. Wave 14 owns deferral, waiver, and override checkpoint routing.',
  'buyout-log':
    'Buyout Log owns procurement records. Wave 14 owns handoff, freeze, and checkpoint routing for buyout decisions.',
  'estimating-workbench-wave-13g':
    'Wave 13G owns estimating feature contracts and UX. Wave 14 owns queue, routing, decision, and audit semantics for checkpointed estimating prompts.',
  'external-systems':
    'External Systems owns the catalog and mapping references. Wave 14 owns mapping-correction checkpoint routing.',
  'site-health':
    'Site Health owns drift findings. Wave 14 owns repair-request review and admin-verification checkpoint routing.',
  'priority-actions':
    'Priority Actions owns the rail and rendering. Wave 14 owns the dedupe and resolve/suppress contract for approval-derived candidates.',
  'project-readiness':
    'Project Readiness owns the readiness rollup. Wave 14 owns the read-only reference rows for active approval items.',
  'executive-oversight':
    'Executive Oversight owns the executive view. Wave 14 owns escalation checkpoint visibility and executive decision audit.',
  'admin-review-surfaces':
    'Admin Review Surfaces own admin control surfaces. Wave 14 owns admin-verification and technical-governance checkpoint routing.',
};

function buildModuleIntegration(
  data: PccApprovalsReadModel,
): IPccApprovalsModuleIntegrationViewModel {
  const rows: IPccApprovalsModuleIntegrationRow[] = CHECKPOINT_SOURCE_MODULES.map(
    (sourceModule: CheckpointSourceModule) => ({
      sourceModule,
      count: data.analytics.countsBySourceModule[sourceModule] ?? 0,
      ownershipPosture: CHECKPOINT_SOURCE_MODULE_OWNERSHIP_POSTURE[sourceModule],
    }),
  );
  return { rows };
}

function buildDecisionHistorySeam(): IPccApprovalsDecisionHistorySeam {
  return {
    title: 'Decision history',
    description:
      'Per-request decision history is not part of this composite read model. Request-level decisions, audit events, and timestamps are surfaced through a future per-request approvals route.',
    deferredReason:
      'Wave 14 / Prompt 03 intentionally excluded request-scoped decision history from the composite. Decision rows here would have to be synthesised from queue and registry data, which would misrepresent the source contract.',
  };
}

function buildLineageSeam(
  data: PccApprovalsReadModel,
  moduleIntegration: IPccApprovalsModuleIntegrationViewModel,
): IPccApprovalsLineageSeam {
  return {
    title: 'Source / evidence lineage',
    description:
      'Composite read-model summary only. No evidence link rows, no source-reference records, and no document links are surfaced from this seam.',
    deferredReason:
      'Per-request evidence and source references are part of the deferred per-request approvals route. The composite exposes registry counts and a source-module summary; nothing else is invented here.',
    registryDefinitionCount: data.registry.definitions.length,
    registryInstanceCount: data.registry.checkpointInstances.length,
    sourceModuleSummaryRows: moduleIntegration.rows,
  };
}

function buildHbiBoundary(): IPccApprovalsHbiBoundary {
  return {
    title: 'HBI boundary — no decision authority',
    summary:
      'HBI may summarise visible evidence and explain policy requirements only. HBI never approves, rejects, waives, overrides, defers, cancels, supersedes, manually closes, prices, or recommends award as authority.',
    may: [
      'Summarise visible queue and registry contents.',
      'Cite policy requirements that apply to a given checkpoint kind.',
      'Surface deferred-posture notices for sections this read model excludes.',
    ],
    mayNot: [
      'Approve, reject, waive, override, defer, cancel, supersede, or manually close any approval request.',
      'Price, post accounting entries, or recommend an award as authority.',
      'Mutate any source system (Procore, Sage, Graph, SharePoint, AHJ, Adobe Sign, DocuSign).',
      'Open external links that imply source-system writeback or document handling.',
    ],
  };
}

const DISABLED_ACTION_LABELS: Readonly<Record<PccApprovalsDisabledActionKey, string>> = {
  approve: 'Approve',
  reject: 'Reject / return',
  waive: 'Waive',
  override: 'Override',
  defer: 'Defer',
  cancel: 'Cancel',
  supersede: 'Supersede',
  'manual-close': 'Manual close',
  escalate: 'Escalate',
  'open-detail': 'Open detail',
};

const DISABLED_ACTION_REASONS: Readonly<Record<PccApprovalsDisabledActionKey, string>> = {
  approve: 'Read-only — approve execution is not enabled in this preview surface.',
  reject: 'Read-only — reject/return execution is not enabled in this preview surface.',
  waive: 'Read-only — waive execution is not enabled in this preview surface.',
  override: 'Read-only — override execution is not enabled in this preview surface.',
  defer: 'Read-only — defer execution is not enabled in this preview surface.',
  cancel: 'Read-only — cancel execution is not enabled in this preview surface.',
  supersede: 'Read-only — supersede execution is not enabled in this preview surface.',
  'manual-close': 'Read-only — manual-close execution is not enabled in this preview surface.',
  escalate: 'Read-only — escalation execution is not enabled in this preview surface.',
  'open-detail':
    'Per-request approval detail is part of a future per-request approvals route and is not opened from this preview surface.',
};

function buildDisabledActions(): readonly IPccApprovalsDisabledAction[] {
  return PCC_APPROVALS_DISABLED_ACTION_KEYS.map((key) => ({
    key,
    label: DISABLED_ACTION_LABELS[key],
    reason: DISABLED_ACTION_REASONS[key],
  }));
}

// ---------------------------------------------------------------------------
// Public adapter
// ---------------------------------------------------------------------------

export function buildPccApprovalsViewModel(
  envelope: PccReadModelEnvelope<PccApprovalsReadModel>,
): IPccApprovalsReadyViewModel {
  const moduleIntegration = buildModuleIntegration(envelope.data);
  return {
    status: 'ready',
    sourceStatus: envelope.sourceStatus,
    cardState: mapPccSourceStatusToPreviewState(envelope.sourceStatus),
    viewerPersona: envelope.viewerPersona,
    home: buildHome(envelope.data),
    queue: buildQueue(envelope.data),
    myApprovals: buildMyApprovals(envelope.data),
    registry: buildRegistry(envelope.data),
    escalation: buildEscalation(envelope.data),
    adminVerification: buildAdminVerification(envelope.data),
    policy: buildPolicy(envelope.data),
    moduleIntegration,
    decisionHistorySeam: buildDecisionHistorySeam(),
    lineageSeam: buildLineageSeam(envelope.data, moduleIntegration),
    hbiBoundary: buildHbiBoundary(),
    disabledActions: buildDisabledActions(),
  };
}
