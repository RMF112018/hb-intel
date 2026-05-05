/**
 * PCC Approvals → Priority Actions adapter (Phase 3 / Wave 14 / Prompt 06).
 *
 * Pure projection of Wave 14 approvals composite envelope (or test-only
 * explicit `IApprovalPriorityActionLink` overrides) into the existing
 * `IPriorityAction[]` shape consumed by the Priority Actions Rail.
 *
 * Runtime contract:
 *   - When `approvalsEnvelope === undefined` AND no explicit
 *     `priorityActionLinks` test override is supplied, the adapter
 *     returns `{ priorityActions: [], suppressedKeys: [] }`. The runtime
 *     Project Home degraded path (e.g. `client.getApprovals` rejected)
 *     must NOT silently fall back to `SAMPLE_APPROVAL_PRIORITY_ACTION_LINKS`.
 *     Tests may pass `priorityActionLinks` explicitly; runtime call sites
 *     never do.
 *
 * Skip rules:
 *   - Entries without a `currentStepId` are skipped (the dedupe key needs a
 *     real step id; never synthesised).
 *   - Entries whose `state` is terminal/superseded/expired/manual-close/
 *     archived are skipped.
 *   - Explicit links with `state === 'resolved'` or `state === 'suppressed'`
 *     are skipped (suppressed records the dedupe key in `suppressedKeys`;
 *     resolved does not).
 *
 * Dedupe:
 *   - Stable id: `approval:<dedupeKey>`.
 *   - When `existingActions` already contains an action with that id, the
 *     candidate is suppressed and the dedupe key is recorded.
 *
 * No command labels: synthesised titles use neutral reference language
 * (e.g. "Approval pending review"), never command verbs.
 *
 * No React, no fetch, no clock reads.
 */

import {
  type ApprovalRequestState,
  type IAdminVerificationQueueEntry,
  type IApprovalPriorityActionLink,
  type IApprovalQueueEntry,
  type IEscalationQueueEntry,
  type IPriorityAction,
  type PccApprovalRequestId,
  type PccApprovalStepId,
  type PccApprovalsReadModel,
  type PccPersona,
  type PccProjectId,
  type PccReadModelEnvelope,
} from '@hbc/models/pcc';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type ApprovalsDerivedActionType = IApprovalPriorityActionLink['actionType'];

export interface IApprovalsDerivedDedupeKeyInput {
  readonly projectId: PccProjectId;
  readonly approvalRequestId: PccApprovalRequestId;
  readonly currentStepId: PccApprovalStepId;
  readonly actionType: ApprovalsDerivedActionType;
}

export const APPROVALS_DERIVED_PRIORITY_ACTION_DEDUPE_KEY = (
  input: IApprovalsDerivedDedupeKeyInput,
): string =>
  `${String(input.projectId)}|${String(input.approvalRequestId)}|${String(input.currentStepId)}|${input.actionType}`;

export interface IApprovalsPriorityActionsAdapterInput {
  readonly projectId: PccProjectId;
  readonly approvalsEnvelope?: PccReadModelEnvelope<PccApprovalsReadModel>;
  /**
   * Test-only / fixture-only override. Runtime callers (e.g. the Project
   * Home adapter) MUST NOT pass this — they pass `approvalsEnvelope` only
   * and accept zero candidates when the envelope is undefined.
   */
  readonly priorityActionLinks?: readonly IApprovalPriorityActionLink[];
  readonly existingActions?: readonly IPriorityAction[];
}

export interface IApprovalsPriorityActionsAdapterResult {
  readonly priorityActions: readonly IPriorityAction[];
  readonly suppressedKeys: readonly string[];
}

// ---------------------------------------------------------------------------
// Internal vocabulary
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

const ACTIVE_STATE_TO_ACTION_TYPE: Readonly<
  Partial<Record<ApprovalRequestState, ApprovalsDerivedActionType>>
> = {
  draft: 'approval-pending',
  requested: 'approval-pending',
  'pending-review': 'approval-pending',
  'in-review': 'approval-pending',
  'revision-requested': 'revision-required',
  escalated: 'escalation-pending',
  'execution-pending': 'execution-pending',
  deferred: 'approval-pending',
};

const ACTION_TYPE_TITLE: Readonly<Record<ApprovalsDerivedActionType, string>> = {
  'approval-pending': 'Approval pending review',
  'revision-required': 'Revision requested by approver',
  'escalation-pending': 'Approval escalation pending review',
  'execution-pending': 'Approval execution pending downstream confirmation',
  'admin-verify-pending': 'Admin verification pending review',
};

function priorityToSeverity(
  priority?: 'low' | 'normal' | 'high' | 'urgent',
): IPriorityAction['severity'] {
  switch (priority) {
    case 'urgent':
      return 'Blocking';
    case 'high':
      return 'Warning';
    case 'normal':
    case 'low':
    default:
      return 'Info';
  }
}

function entrySummary(entry: IApprovalQueueEntry, sourceLabel: string): string {
  const role = entry.assignedRole ? ` · ${String(entry.assignedRole)}` : '';
  const created = entry.createdAtUtc.length >= 10 ? ` · ${entry.createdAtUtc.slice(0, 10)}` : '';
  return `${sourceLabel} reference${role}${created}`;
}

// ---------------------------------------------------------------------------
// Envelope → provisional links derivation
// ---------------------------------------------------------------------------

interface IDerivedLinkSeed {
  readonly entry: IApprovalQueueEntry;
  readonly actionType: ApprovalsDerivedActionType;
  readonly sourceLabel: 'Queue' | 'Escalation' | 'Admin verification';
}

function seedFromQueueEntry(entry: IApprovalQueueEntry): IDerivedLinkSeed | null {
  if (TERMINAL_STATES.has(entry.state)) return null;
  const actionType = ACTIVE_STATE_TO_ACTION_TYPE[entry.state];
  if (!actionType) return null;
  return { entry, actionType, sourceLabel: 'Queue' };
}

function seedFromEscalationEntry(entry: IEscalationQueueEntry): IDerivedLinkSeed | null {
  if (TERMINAL_STATES.has(entry.state)) return null;
  return { entry, actionType: 'escalation-pending', sourceLabel: 'Escalation' };
}

function seedFromAdminVerificationEntry(
  entry: IAdminVerificationQueueEntry,
): IDerivedLinkSeed | null {
  if (TERMINAL_STATES.has(entry.state)) return null;
  return { entry, actionType: 'admin-verify-pending', sourceLabel: 'Admin verification' };
}

// ---------------------------------------------------------------------------
// Public adapter
// ---------------------------------------------------------------------------

export function buildApprovalsDerivedPriorityActions(
  input: IApprovalsPriorityActionsAdapterInput,
): IApprovalsPriorityActionsAdapterResult {
  const { projectId, approvalsEnvelope, priorityActionLinks, existingActions } = input;
  if (approvalsEnvelope === undefined && priorityActionLinks === undefined) {
    return { priorityActions: [], suppressedKeys: [] };
  }

  const existingIds = new Set<string>(existingActions?.map((a) => a.id) ?? []);
  const seen = new Set<string>();
  const suppressedKeys: string[] = [];
  const priorityActions: IPriorityAction[] = [];

  // Path 1 — explicit test-only links (used by adapter unit tests).
  if (priorityActionLinks !== undefined) {
    for (const link of priorityActionLinks) {
      if (link.state === 'resolved') continue;
      const key = APPROVALS_DERIVED_PRIORITY_ACTION_DEDUPE_KEY({
        projectId: link.projectId,
        approvalRequestId: link.approvalRequestId,
        currentStepId: link.currentStepId,
        actionType: link.actionType,
      });
      if (link.state === 'suppressed') {
        suppressedKeys.push(key);
        continue;
      }
      if (seen.has(key)) {
        suppressedKeys.push(key);
        continue;
      }
      const id = `approval:${key}`;
      if (existingIds.has(id)) {
        suppressedKeys.push(key);
        continue;
      }
      seen.add(key);
      priorityActions.push({
        id,
        category: 'approval',
        title: ACTION_TYPE_TITLE[link.actionType],
        summary: `Reference only — Wave 14 owns approval routing.`,
        severity: 'Info',
      });
    }
    return { priorityActions, suppressedKeys };
  }

  // Path 2 — runtime envelope-driven derivation.
  if (approvalsEnvelope === undefined) {
    return { priorityActions: [], suppressedKeys: [] };
  }
  const data = approvalsEnvelope.data;
  const seeds: IDerivedLinkSeed[] = [];
  for (const entry of data.queue.entries) {
    const seed = seedFromQueueEntry(entry);
    if (seed) seeds.push(seed);
  }
  for (const entry of data.escalation.entries) {
    const seed = seedFromEscalationEntry(entry);
    if (seed) seeds.push(seed);
  }
  for (const entry of data.adminVerification.entries) {
    const seed = seedFromAdminVerificationEntry(entry);
    if (seed) seeds.push(seed);
  }

  for (const seed of seeds) {
    // Skip when currentStepId is missing — the dedupe key requires a real
    // step id; never synthesise a placeholder value.
    const currentStepId = seed.entry.currentStepId;
    if (currentStepId === undefined) continue;

    const key = APPROVALS_DERIVED_PRIORITY_ACTION_DEDUPE_KEY({
      projectId,
      approvalRequestId: seed.entry.approvalRequestId,
      currentStepId,
      actionType: seed.actionType,
    });
    if (seen.has(key)) {
      suppressedKeys.push(key);
      continue;
    }
    const id = `approval:${key}`;
    if (existingIds.has(id)) {
      suppressedKeys.push(key);
      continue;
    }
    seen.add(key);
    priorityActions.push({
      id,
      category: 'approval',
      title: ACTION_TYPE_TITLE[seed.actionType],
      summary: entrySummary(seed.entry, seed.sourceLabel),
      severity: priorityToSeverity(seed.entry.priority),
      assigneePersona: seed.entry.assignedRole as PccPersona | undefined,
    });
  }

  return { priorityActions, suppressedKeys };
}

/**
 * Project a Wave 14 approvals composite envelope into the small Project
 * Home approvals card view-model. Pure helper co-located with the priority
 * actions adapter so the read-model→card-view-model projection lives in
 * one well-tested place. The card never imports the full
 * `IPccApprovalsReadyViewModel`.
 */

import type { IPccApprovalsCheckpointsCardViewModel } from '../surfaces/projectHome/PccApprovalsCheckpointsCard.js';

const CARD_ROW_LIMIT = 5;

function cardRoleLabel(role?: string): string {
  if (!role) return 'Unassigned';
  return role
    .split('-')
    .map((seg) => (seg.length > 0 ? seg[0]!.toUpperCase() + seg.slice(1) : seg))
    .join(' ');
}

function cardPriorityLabel(priority?: 'low' | 'normal' | 'high' | 'urgent'): string {
  switch (priority) {
    case 'urgent':
      return 'Urgent';
    case 'high':
      return 'High';
    case 'low':
      return 'Low';
    case 'normal':
    default:
      return 'Normal';
  }
}

function cardDateDisplay(iso: string): string {
  return iso.length >= 10 ? iso.slice(0, 10) : iso;
}

export function buildPccApprovalsCheckpointsCardViewModel(
  envelope: PccReadModelEnvelope<PccApprovalsReadModel>,
): IPccApprovalsCheckpointsCardViewModel {
  const data = envelope.data;
  let pendingActiveCount = 0;
  let terminalCount = 0;
  for (const entry of data.queue.entries) {
    if (TERMINAL_STATES.has(entry.state)) {
      terminalCount += 1;
    } else {
      pendingActiveCount += 1;
    }
  }
  const rows = data.queue.entries.slice(0, CARD_ROW_LIMIT).map((entry) => ({
    approvalRequestId: String(entry.approvalRequestId),
    title: entry.title ?? `Approval ${String(entry.approvalRequestId)}`,
    state: entry.state,
    assignedRoleLabel: cardRoleLabel(entry.assignedRole),
    priorityLabel: cardPriorityLabel(entry.priority),
    createdAtDisplay: cardDateDisplay(entry.createdAtUtc),
  }));
  return {
    rows,
    pendingActiveCount,
    terminalCount,
    totalRequests: data.analytics.totalRequests,
  };
}
