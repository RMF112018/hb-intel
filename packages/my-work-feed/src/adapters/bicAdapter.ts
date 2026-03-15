/**
 * BIC Next-Move source adapter.
 *
 * Maps `IBicRegisteredItem[]` from `executeBicFanOut()` into `IMyWorkItem[]`.
 * Highest-weight source (0.9) — primary ownership/action items.
 */

import { executeBicFanOut } from '@hbc/bic-next-move';
import type { IBicRegisteredItem, IBicOwner, BicUrgencyTier } from '@hbc/bic-next-move';
import type {
  IMyWorkSourceAdapter,
  IMyWorkItem,
  MyWorkPriority,
  IMyWorkOwner,
} from '../types/index.js';
import {
  buildWorkItemId,
  buildCanonicalKey,
  buildDedupeKey,
  buildDefaultTimestamps,
  buildSourceMeta,
} from './_mappers.js';

const URGENCY_TO_PRIORITY: Record<BicUrgencyTier, MyWorkPriority> = {
  immediate: 'now',
  watch: 'soon',
  upcoming: 'watch',
};

function mapBicOwner(owner: IBicOwner): IMyWorkOwner {
  return {
    type: 'user',
    id: owner.userId,
    label: owner.displayName,
  };
}

function mapBicItem(item: IBicRegisteredItem): IMyWorkItem {
  const { state } = item;
  const now = new Date().toISOString();

  return {
    workItemId: buildWorkItemId('bic-next-move', item.itemKey),
    canonicalKey: buildCanonicalKey(item.moduleKey, item.itemKey),
    dedupeKey: buildDedupeKey(item.moduleKey, 'bic-item', item.itemKey),
    class: 'owned-action',
    priority: URGENCY_TO_PRIORITY[state.urgencyTier] ?? 'watch',
    state: state.isBlocked ? 'blocked' : 'active',
    lane: state.isBlocked ? 'waiting-blocked' : 'do-now',
    title: item.title,
    summary: `${item.moduleLabel} — ${state.expectedAction}`,
    expectedAction: state.expectedAction,
    dueDateIso: state.dueDate ?? null,
    isOverdue: state.isOverdue,
    isUnread: true,
    isBlocked: state.isBlocked,
    blockedReason: state.blockedReason ?? null,
    changeSummary: null,
    whyThisMatters: null,
    supersededByWorkItemId: null,
    owner: state.currentOwner ? mapBicOwner(state.currentOwner) : { type: 'system', id: 'unassigned', label: 'Unassigned' },
    previousOwner: state.previousOwner ? mapBicOwner(state.previousOwner) : null,
    context: {
      moduleKey: item.moduleKey,
      href: item.href,
    },
    sourceMeta: [buildSourceMeta('bic-next-move', item.itemKey, now)],
    permissionState: { canOpen: true, canAct: true },
    lifecycle: {
      previousStepLabel: null,
      currentStepLabel: null,
      nextStepLabel: null,
      blockedDependencyLabel: state.isBlocked ? state.blockedReason : null,
      impactedRecordLabel: null,
    },
    rankingReason: {
      primaryReason: 'Assigned BIC action item',
      contributingReasons: [],
    },
    availableActions: [
      { key: 'open', label: 'Open' },
    ],
    offlineCapable: false,
    timestamps: buildDefaultTimestamps(now),
    delegatedBy: null,
    delegatedTo: null,
    locationLabel: null,
    userNote: null,
  };
}

export const bicAdapter: IMyWorkSourceAdapter = {
  source: 'bic-next-move',

  isEnabled: () => true,

  load: async (query, context) => {
    const result = await executeBicFanOut(context.currentUserId);
    let items = result.items.map(mapBicItem);

    if (query.moduleKeys?.length) {
      items = items.filter((item) => query.moduleKeys!.includes(item.context.moduleKey));
    }

    return items;
  },
};
