/**
 * companionFilter — queue-filter reducer + pure selector for the HB
 * Kudos Approval Companion workspace.
 *
 * The companion runtime owns the filter model; this module is the
 * single source of truth for the tab gate, search, ownership,
 * toggle chips, aging buckets, and the sorted result list. Pure
 * selector (`applyCompanionFilter`) has no React dependency and
 * is safe to unit-test or reuse from a hook.
 */
import {
  deriveAgingBucket,
  needsAdminReview,
  DEFAULT_KUDOS_QUEUE_FILTER_STATE,
  type KudosAgingBucket,
  type KudosEntry,
  type KudosQueueFilterState,
} from '../../../homepage/webparts/kudosContracts.js';
import { COMPANION_TABS } from './companionTabs.js';

export type FilterAction =
  | { type: 'setTab'; tabId: string }
  | { type: 'setSearch'; value: string }
  | { type: 'setOwnership'; ownership: KudosQueueFilterState['ownership'] }
  | { type: 'toggleAdminReviewOnly' }
  | { type: 'toggleScheduledOnly' }
  | { type: 'toggleAging'; bucket: KudosAgingBucket };

export interface CompanionFilterState extends KudosQueueFilterState {
  tabId: string;
}

export const INITIAL_FILTER_STATE: CompanionFilterState = {
  ...DEFAULT_KUDOS_QUEUE_FILTER_STATE,
  tabId: COMPANION_TABS[0]!.id,
};

export function filterReducer(
  state: CompanionFilterState,
  action: FilterAction,
): CompanionFilterState {
  switch (action.type) {
    case 'setTab': {
      const tab = COMPANION_TABS.find((t) => t.id === action.tabId);
      if (!tab) return state;
      return {
        ...state,
        tabId: action.tabId,
        statuses: tab.statuses,
        adminReviewOnly: tab.id === 'flagged' ? true : false,
      };
    }
    case 'setSearch':
      return { ...state, searchText: action.value };
    case 'setOwnership':
      return { ...state, ownership: action.ownership };
    case 'toggleAdminReviewOnly':
      return { ...state, adminReviewOnly: !state.adminReviewOnly };
    case 'toggleScheduledOnly':
      return { ...state, scheduledOnly: !state.scheduledOnly };
    case 'toggleAging': {
      const has = state.aging.includes(action.bucket);
      return {
        ...state,
        aging: has
          ? state.aging.filter((b) => b !== action.bucket)
          : [...state.aging, action.bucket],
      };
    }
    default:
      return state;
  }
}

/**
 * Pure queue selector. Applies the active tab's workflow-status
 * gate, search, ownership, toggle chips, aging buckets, and per-tab
 * sort direction. No React dependency.
 */
export function applyCompanionFilter(
  entries: KudosEntry[],
  state: CompanionFilterState,
  nowIso: string,
  currentUserId: number | undefined,
): KudosEntry[] {
  const tab = COMPANION_TABS.find((t) => t.id === state.tabId);
  if (!tab) return [];
  const q = state.searchText?.trim().toLowerCase() ?? '';
  const filtered = entries.filter((entry) => {
    // Workflow status gate — fall back to the narrow status for rows
    // that predate the workflow column.
    if (entry.workflowStatus) {
      if (!tab.statuses.includes(entry.workflowStatus)) return false;
    } else if (tab.id === 'pending') {
      if (entry.status !== 'pending') return false;
    } else if (tab.id === 'approved') {
      if (entry.status !== 'approved') return false;
    } else if (tab.id === 'rejected') {
      if (entry.status !== 'rejected') return false;
    } else {
      return false;
    }
    if (tab.extraPredicate && !tab.extraPredicate(entry)) return false;
    if (state.adminReviewOnly && !needsAdminReview(entry)) return false;
    if (state.scheduledOnly && entry.isScheduled !== true) return false;
    // Ownership filter using real claim/assignment data.
    const ownerId = entry.assignedOwnerId ?? entry.claimOwnerId;
    if (state.ownership === 'unassigned') {
      if (ownerId != null) return false;
    }
    if (state.ownership === 'mine' && currentUserId) {
      if (ownerId !== currentUserId) return false;
    }
    if (state.ownership === 'others' && currentUserId) {
      if (ownerId == null || ownerId === currentUserId) return false;
    }
    if (state.aging.length > 0) {
      const bucket = deriveAgingBucket(entry.submittedDate, nowIso);
      if (!state.aging.includes(bucket)) return false;
    }
    if (q) {
      const haystack = [
        entry.headline,
        entry.excerpt,
        entry.submittedBy.displayName,
        ...entry.recipients.map((r) => r.name),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const direction = tab.sortDirection === 'oldest' ? 1 : -1;
  return filtered.sort((a, b) => {
    const aTs = Date.parse(a.submittedDate) || 0;
    const bTs = Date.parse(b.submittedDate) || 0;
    return (aTs - bTs) * direction;
  });
}
