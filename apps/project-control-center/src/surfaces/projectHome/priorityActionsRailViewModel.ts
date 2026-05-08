/**
 * Wave 5 / Prompt 02 — PCC app-local Priority Actions Rail view-model contract.
 *
 * Closed-decision authority: `Wave_5_Closed_Decisions.md` (W5-OD-001).
 * Group ids and metadata live in the PCC app — the shared
 * `PriorityActionCategory` vocabulary in `@hbc/models/pcc` is NOT mutated
 * (W5-OD-007).
 *
 * Prompt 02 (this prompt) creates the app-local view-model + adapter only.
 * Prompt 03 may build the PCC-local rail UI component that consumes this
 * view-model. Prompt 04 owns integration into `PccPriorityActionsCard`.
 * Backend `priority-actions` consumption remains deferred to Prompt 05 and
 * stays explicit-opt-in only (W5-OD-002).
 */

import type { IPriorityAction } from '@hbc/models/pcc';
import type { PccPriorityTone } from './shared.js';

export type PccPriorityRailGroupId =
  | 'access-requests'
  | 'readiness-blockers'
  | 'approval-checkpoints'
  | 'external-system-mapping';

/**
 * Canonical group order tuple. Iterate this — never `Object.keys` of the
 * meta record — so order is deterministic across consumers.
 */
export const PCC_PRIORITY_RAIL_GROUP_IDS = [
  'access-requests',
  'readiness-blockers',
  'approval-checkpoints',
  'external-system-mapping',
] as const satisfies readonly PccPriorityRailGroupId[];

export interface IPccPriorityRailGroupMeta {
  readonly id: PccPriorityRailGroupId;
  readonly displayName: string;
  readonly description: string;
}

export const PCC_PRIORITY_RAIL_GROUP_META: Readonly<
  Record<PccPriorityRailGroupId, IPccPriorityRailGroupMeta>
> = {
  'access-requests': {
    id: 'access-requests',
    displayName: 'Access Requests',
    description: 'Team & Access requests awaiting review.',
  },
  'readiness-blockers': {
    id: 'readiness-blockers',
    displayName: 'Readiness Blockers',
    description: 'Workflow, compliance, inspection, permit, and closeout items blocking readiness.',
  },
  'approval-checkpoints': {
    id: 'approval-checkpoints',
    displayName: 'Approval / Checkpoint Prompts',
    description: 'Approval checkpoints awaiting decision.',
  },
  'external-system-mapping': {
    id: 'external-system-mapping',
    displayName: 'External-System Mapping Prompts',
    description: 'Procore mapping or external-system sync items needing attention.',
  },
};

/**
 * Per-action rail item. Preserves verbatim record fields from
 * `IPriorityAction` and adds two derived presentation hints (`tone`,
 * `groupId`). No fabricated copy. No record-field invention.
 */
export interface IPccPriorityRailItem {
  readonly id: string;
  readonly title: string;
  readonly summary?: string;
  readonly dueDate?: string;
  readonly assigneePersona?: IPriorityAction['assigneePersona'];
  readonly relatedWorkCenter?: IPriorityAction['relatedWorkCenter'];
  readonly relatedWorkflowItemId?: IPriorityAction['relatedWorkflowItemId'];
  readonly severity?: IPriorityAction['severity'];
  readonly category: IPriorityAction['category'];
  readonly tone: PccPriorityTone;
  readonly groupId: PccPriorityRailGroupId;
}

export interface IPccPriorityRailGroup {
  readonly id: PccPriorityRailGroupId;
  readonly meta: IPccPriorityRailGroupMeta;
  readonly items: readonly IPccPriorityRailItem[];
  readonly count: number;
}

/**
 * Wave 15A wave-b6 Prompt 03 — homepage compact projection.
 *
 * Cap on the homepage rail's compact-default visible row count. The
 * compact projection is computed once by the adapter and consumed by the
 * presentational rail; consumers do not recompute the slice.
 */
export const PCC_PRIORITY_RAIL_COMPACT_MAX_VISIBLE_ITEMS = 5;

export interface IPccPriorityRailHiddenGroupSummary {
  readonly groupId: PccPriorityRailGroupId;
  readonly displayName: string;
  readonly hiddenCount: number;
}

export interface IPccPriorityActionsRailCompactSummary {
  readonly maxVisibleItems: number;
  readonly visibleItems: readonly IPccPriorityRailItem[];
  readonly hiddenCount: number;
  readonly hiddenByGroup: readonly IPccPriorityRailHiddenGroupSummary[];
  readonly suppressedCount: number;
  readonly totalCandidateCount: number;
}

/**
 * Rail view-model. All four groups are always present, in canonical order,
 * even when empty. `visibleCount` and `suppressedCount` are accounting
 * fields; suppressed items are NOT exposed via `groups` (W5-OD-005).
 *
 * `compactSummary` (Wave 15A wave-b6 Prompt 03) is the canonical homepage
 * projection: the global top-N items (by tone → due-date → id) plus a
 * per-group hidden-count breakdown, used to render the compact rail and
 * its overflow summary.
 */
export interface IPccPriorityActionsRailViewModel {
  readonly groups: readonly IPccPriorityRailGroup[];
  readonly visibleCount: number;
  readonly suppressedCount: number;
  readonly compactSummary: IPccPriorityActionsRailCompactSummary;
}
