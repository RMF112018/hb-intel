/**
 * PCC Approvals → Project Readiness blocker reference adapter
 * (Phase 3 / Wave 14 / Prompt 06).
 *
 * Pure projection of Wave 14 approvals composite envelope into read-only
 * blocker reference rows for the Project Readiness Center. Project
 * Readiness owns the readiness source data; these rows are reference-only
 * additive entries that preserve their Wave 14 origin.
 *
 * Vocabulary mapping (`CheckpointSourceModule` → `ProjectReadinessSourceModuleId`)
 * is performed via the explicit pure helper
 * `mapCheckpointSourceModuleToReadinessSourceModuleId`. The original
 * `CheckpointSourceModule` value is preserved on every projected row so
 * the audit trail back to the Wave 14 contract is not lost in the mapping.
 *
 * Skip rules:
 *   - Empty array when `envelope === undefined` (runtime degraded path).
 *   - Empty array when the envelope's queue is empty.
 *   - Skip queue entries whose `state` is terminal/superseded/expired/
 *     manual-close/archived.
 *   - Skip queue entries whose `approvalRequestId` has no matching
 *     checkpoint instance in `envelope.data.registry.checkpointInstances`
 *     (no synthesised source module).
 *
 * No React, no fetch, no clock reads.
 */

import {
  CHECKPOINT_SOURCE_MODULES,
  type ApprovalRequestState,
  type CheckpointSourceModule,
  type ICheckpointInstance,
  type PccApprovalRequestId,
  type PccApprovalsReadModel,
  type PccReadModelEnvelope,
  type ProjectReadinessSourceModuleId,
} from '@hbc/models/pcc';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface IApprovalsReadinessReferenceRow {
  readonly id: string;
  readonly approvalRequestId: PccApprovalRequestId;
  /** Original Wave 14 source module preserved for audit/caption visibility. */
  readonly checkpointSourceModule: CheckpointSourceModule;
  readonly checkpointSourceModuleLabel: string;
  /** Mapped Project Readiness source module — fills `IPccReadinessBlockerItemViewModel.sourceModuleId`. */
  readonly readinessSourceModuleId: ProjectReadinessSourceModuleId;
  readonly title: string;
  readonly state: ApprovalRequestState;
  readonly priorityLabel: string;
  readonly assignedRoleLabel: string;
  /** Fixed reference-only attestation. */
  readonly referenceCaption: string;
}

export const APPROVALS_READINESS_REFERENCE_CAPTION =
  'Reference only — Wave 14 owns approval routing.';

// ---------------------------------------------------------------------------
// Cross-vocabulary mapping (exhaustive — one entry per CheckpointSourceModule)
// ---------------------------------------------------------------------------

const CHECKPOINT_SOURCE_MODULE_TO_READINESS: Readonly<
  Record<CheckpointSourceModule, ProjectReadinessSourceModuleId>
> = {
  'team-and-access': 'team-access',
  'document-control': 'document-control',
  'project-lifecycle-readiness-center': 'project-lifecycle-readiness',
  'permit-and-inspection-control-center': 'permit-log',
  'responsibility-matrix': 'responsibility-matrix',
  'constraints-log': 'constraints-log',
  'buyout-log': 'buyout-log',
  'estimating-workbench-wave-13g': 'approvals-checkpoints',
  'external-systems': 'external-systems',
  'site-health': 'site-health',
  'priority-actions': 'approvals-checkpoints',
  'project-readiness': 'approvals-checkpoints',
  'executive-oversight': 'approvals-checkpoints',
  'admin-review-surfaces': 'approvals-checkpoints',
};

export function mapCheckpointSourceModuleToReadinessSourceModuleId(
  source: CheckpointSourceModule,
): ProjectReadinessSourceModuleId {
  return CHECKPOINT_SOURCE_MODULE_TO_READINESS[source];
}

// ---------------------------------------------------------------------------
// Source-module display labels (local — no shared label registry edits)
// ---------------------------------------------------------------------------

const CHECKPOINT_SOURCE_MODULE_LABELS: Readonly<Record<CheckpointSourceModule, string>> = {
  'team-and-access': 'Team and Access',
  'document-control': 'Document Control',
  'project-lifecycle-readiness-center': 'Project Lifecycle Readiness Center',
  'permit-and-inspection-control-center': 'Permit and Inspection Control Center',
  'responsibility-matrix': 'Responsibility Matrix',
  'constraints-log': 'Constraints Log',
  'buyout-log': 'Buyout Log',
  'estimating-workbench-wave-13g': 'Estimating Workbench (Wave 13G)',
  'external-systems': 'External Platforms',
  'site-health': 'Site Health',
  'priority-actions': 'Priority Actions',
  'project-readiness': 'Project Readiness',
  'executive-oversight': 'Executive Oversight',
  'admin-review-surfaces': 'Admin Review Surfaces',
};

// ---------------------------------------------------------------------------
// Internal helpers
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

function rolesLabel(role?: string): string {
  if (!role) return 'Unassigned';
  return role
    .split('-')
    .map((seg) => (seg.length > 0 ? seg[0]!.toUpperCase() + seg.slice(1) : seg))
    .join(' ');
}

function priorityLabel(priority?: 'low' | 'normal' | 'high' | 'urgent'): string {
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

function buildCheckpointInstanceMap(
  instances: readonly ICheckpointInstance[],
): ReadonlyMap<string, ICheckpointInstance> {
  const map = new Map<string, ICheckpointInstance>();
  for (const inst of instances) {
    if (inst.approvalRequestId !== undefined) {
      map.set(String(inst.approvalRequestId), inst);
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// Public adapter
// ---------------------------------------------------------------------------

export function buildApprovalsReadinessReferences(
  envelope: PccReadModelEnvelope<PccApprovalsReadModel> | undefined,
): readonly IApprovalsReadinessReferenceRow[] {
  if (envelope === undefined) return [];
  const data = envelope.data;
  const instanceByRequestId = buildCheckpointInstanceMap(data.registry.checkpointInstances);
  const rows: IApprovalsReadinessReferenceRow[] = [];

  for (const entry of data.queue.entries) {
    if (TERMINAL_STATES.has(entry.state)) continue;
    const instance = instanceByRequestId.get(String(entry.approvalRequestId));
    if (!instance) continue; // No synthesis when no checkpoint instance exists.
    const checkpointSourceModule = instance.sourceModule;
    rows.push({
      id: `approvals-readiness-ref:${String(entry.approvalRequestId)}`,
      approvalRequestId: entry.approvalRequestId,
      checkpointSourceModule,
      checkpointSourceModuleLabel: CHECKPOINT_SOURCE_MODULE_LABELS[checkpointSourceModule],
      readinessSourceModuleId: CHECKPOINT_SOURCE_MODULE_TO_READINESS[checkpointSourceModule],
      title: entry.title ?? `Approval ${String(entry.approvalRequestId)}`,
      state: entry.state,
      priorityLabel: priorityLabel(entry.priority),
      assignedRoleLabel: rolesLabel(entry.assignedRole),
      referenceCaption: APPROVALS_READINESS_REFERENCE_CAPTION,
    });
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Test surface re-exports (for exhaustive mapping coverage)
// ---------------------------------------------------------------------------

export { CHECKPOINT_SOURCE_MODULES };
