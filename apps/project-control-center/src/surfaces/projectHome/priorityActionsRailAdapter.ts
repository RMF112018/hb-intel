/**
 * Wave 5 / Prompt 02 — Priority Actions Rail adapter.
 *
 * Pure, deterministic mapping from `IPriorityAction[]` (the existing
 * `@hbc/models/pcc` shape) into the four closed Wave 5 rail groups
 * (W5-OD-001).
 *
 * Suppresses `documents`, `health`, and `safety` from the user-facing
 * MVP rail (W5-OD-005). Suppressed items are accounted for via
 * `suppressedCount` only — they are never exposed through `groups`.
 *
 * Prompt 02 (this file) provides the adapter only. Prompt 03 may add the
 * PCC-local rail UI component. Prompt 04 owns integration into
 * `PccPriorityActionsCard`. No backend consumption is wired here; that
 * remains deferred to Prompt 05 under explicit opt-in only (W5-OD-002).
 *
 * No `fetch`, no async, no `src/api/` import, no auth seam, no SDK token,
 * no shared-model rewrite. The Wave 4 controlled-consumption guard
 * remains applicable to this file.
 */

import type { IPriorityAction, PriorityActionCategory } from '@hbc/models/pcc';
import { priorityToneForAction, type PccPriorityTone } from './shared.js';
import {
  PCC_PRIORITY_RAIL_GROUP_IDS,
  PCC_PRIORITY_RAIL_GROUP_META,
  type IPccPriorityActionsRailViewModel,
  type IPccPriorityRailGroup,
  type IPccPriorityRailItem,
  type PccPriorityRailGroupId,
} from './priorityActionsRailViewModel.js';

/**
 * Categories suppressed from the user-facing Wave 5 MVP rail. Typed via
 * `satisfies` so misspellings fail at compile time (W5-OD-005).
 */
const SUPPRESSED_CATEGORIES = [
  'documents',
  'health',
  'safety',
] as const satisfies readonly PriorityActionCategory[];

const TONE_RANK: Readonly<Record<PccPriorityTone, number>> = {
  high: 0,
  medium: 1,
  low: 2,
};

function isSuppressed(category: PriorityActionCategory): boolean {
  return (SUPPRESSED_CATEGORIES as readonly PriorityActionCategory[]).includes(category);
}

function classify(action: IPriorityAction): PccPriorityRailGroupId | null {
  if (isSuppressed(action.category)) {
    return null;
  }
  // Category-based rules first, so an approval action carrying a
  // `team-and-access` work-center still routes to approval-checkpoints.
  if (action.category === 'approval') {
    return 'approval-checkpoints';
  }
  if (action.category === 'procore-sync') {
    return 'external-system-mapping';
  }
  if (action.relatedWorkCenter === 'team-and-access') {
    return 'access-requests';
  }
  if (
    action.category === 'workflow' ||
    action.category === 'compliance' ||
    action.category === 'inspection' ||
    action.category === 'permit' ||
    action.category === 'closeout'
  ) {
    return 'readiness-blockers';
  }
  // Defensive fallback — not reachable given the closed mapping and the
  // current 10-category vocabulary, but keeps the adapter total in case
  // a future shared-model addition lands before the mapping is updated.
  return 'readiness-blockers';
}

/**
 * Parse `dueDate` into a comparator value. Missing or malformed dates
 * yield `Number.POSITIVE_INFINITY` so they sort after every valid date,
 * deterministically — never `NaN`.
 */
function dueDateRank(dueDate: string | undefined): number {
  if (typeof dueDate !== 'string' || dueDate.length === 0) {
    return Number.POSITIVE_INFINITY;
  }
  const parsed = Date.parse(dueDate);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function compareItems(a: IPccPriorityRailItem, b: IPccPriorityRailItem): number {
  const toneDelta = TONE_RANK[a.tone] - TONE_RANK[b.tone];
  if (toneDelta !== 0) return toneDelta;
  const dueDelta = dueDateRank(a.dueDate) - dueDateRank(b.dueDate);
  if (dueDelta !== 0) return dueDelta;
  return a.id.localeCompare(b.id);
}

function toRailItem(
  action: IPriorityAction,
  groupId: PccPriorityRailGroupId,
): IPccPriorityRailItem {
  return {
    id: action.id,
    title: action.title,
    summary: action.summary,
    dueDate: action.dueDate,
    assigneePersona: action.assigneePersona,
    relatedWorkCenter: action.relatedWorkCenter,
    relatedWorkflowItemId: action.relatedWorkflowItemId,
    severity: action.severity,
    category: action.category,
    tone: priorityToneForAction(action),
    groupId,
  };
}

/**
 * Build the rail view-model. Pure function: never mutates `actions` or any
 * action object in it. All four groups always appear in canonical order.
 */
export function buildPccPriorityActionsRailViewModel(
  actions: readonly IPriorityAction[],
): IPccPriorityActionsRailViewModel {
  const buckets: Record<PccPriorityRailGroupId, IPccPriorityRailItem[]> = {
    'access-requests': [],
    'readiness-blockers': [],
    'approval-checkpoints': [],
    'external-system-mapping': [],
  };
  let suppressedCount = 0;
  for (const action of actions) {
    const groupId = classify(action);
    if (groupId === null) {
      suppressedCount += 1;
      continue;
    }
    buckets[groupId].push(toRailItem(action, groupId));
  }
  const groups: IPccPriorityRailGroup[] = PCC_PRIORITY_RAIL_GROUP_IDS.map((id) => {
    const items = [...buckets[id]].sort(compareItems);
    return {
      id,
      meta: PCC_PRIORITY_RAIL_GROUP_META[id],
      items,
      count: items.length,
    };
  });
  const visibleCount = groups.reduce((acc, group) => acc + group.count, 0);
  return { groups, visibleCount, suppressedCount };
}
