/**
 * useCompanionQueue — derives the filtered queue, overdue map,
 * reminder targets, scope count, and "is refined" flag from the
 * companion's filter state + kudos list.
 *
 * Keeps the orchestration host free of chained `React.useMemo`
 * calls that belong together as one cohesive derivation.
 */
import * as React from 'react';
import { resolveCurrentUserId } from '../../../homepage/data/spContext.js';
import {
  deriveKudosOverdueStatus,
  findKudosReminderTargets,
  DEFAULT_KUDOS_OVERDUE_THRESHOLDS,
  type KudosOverdueStatus,
  type KudosOverdueThresholds,
  type KudosReminderTarget,
} from '../../../homepage/helpers/kudosNotificationBuilder.js';
import type { KudosEntry } from '../../../homepage/webparts/kudosContracts.js';
import {
  applyCompanionFilter,
  type CompanionFilterState,
} from './companionFilter.js';
import { COMPANION_TABS } from './companionTabs.js';

export interface UseCompanionQueueInput {
  allKudos: KudosEntry[];
  filter: CompanionFilterState;
  nowIso: string;
  overdueThresholds: KudosOverdueThresholds;
}

export interface UseCompanionQueueResult {
  currentUserId: number | undefined;
  queue: KudosEntry[];
  overdueMap: Map<string, KudosOverdueStatus>;
  reminderTargets: KudosReminderTarget[];
  scopeCount: number;
  isRefined: boolean;
  /** Per-tab item counts (scope-only — refinement filters ignored). */
  tabCounts: Record<string, number>;
}

export function useCompanionQueue({
  allKudos,
  filter,
  nowIso,
  overdueThresholds,
}: UseCompanionQueueInput): UseCompanionQueueResult {
  const [currentUserId, setCurrentUserId] = React.useState<number | undefined>();
  React.useEffect(() => {
    resolveCurrentUserId().then(setCurrentUserId).catch(() => {});
  }, []);

  const queue = React.useMemo(
    () => applyCompanionFilter(allKudos, filter, nowIso, currentUserId),
    [allKudos, filter, nowIso, currentUserId],
  );

  const overdueMap = React.useMemo(() => {
    const map = new Map<string, KudosOverdueStatus>();
    for (const entry of queue) {
      const ws = entry.workflowStatus;
      if (ws === 'pending' || ws === 'revisionRequested') {
        map.set(
          entry.id,
          deriveKudosOverdueStatus(
            entry.submittedDate,
            nowIso,
            overdueThresholds.pendingOverdueDays,
          ),
        );
      } else if (entry.isFlaggedForAdminReview === true) {
        map.set(
          entry.id,
          deriveKudosOverdueStatus(
            entry.submittedDate,
            nowIso,
            overdueThresholds.adminReviewOverdueDays,
          ),
        );
      } else {
        map.set(entry.id, 'ok');
      }
    }
    return map;
  }, [queue, nowIso, overdueThresholds]);

  const reminderTargets = React.useMemo(
    () => findKudosReminderTargets(allKudos, nowIso, overdueThresholds),
    [allKudos, nowIso, overdueThresholds],
  );

  const scopeCount = React.useMemo(
    () =>
      applyCompanionFilter(
        allKudos,
        {
          ...filter,
          searchText: '',
          ownership: 'all',
          adminReviewOnly: false,
          scheduledOnly: false,
          aging: [],
        },
        nowIso,
        currentUserId,
      ).length,
    [allKudos, filter, nowIso, currentUserId],
  );

  const isRefined = queue.length !== scopeCount;

  // Per-tab scope counts — queue-only (refinement filters stripped) so
  // the tab strip can advertise where the work actually sits. This
  // lets operators pick the next queue by workload instead of
  // clicking through each tab blindly.
  const tabCounts = React.useMemo(() => {
    const out: Record<string, number> = {};
    for (const tab of COMPANION_TABS) {
      out[tab.id] = applyCompanionFilter(
        allKudos,
        {
          ...filter,
          tabId: tab.id,
          statuses: tab.statuses,
          adminReviewOnly: tab.id === 'flagged',
          searchText: '',
          ownership: 'all',
          scheduledOnly: false,
          aging: [],
        },
        nowIso,
        currentUserId,
      ).length;
    }
    return out;
  }, [allKudos, filter, nowIso, currentUserId]);

  return {
    currentUserId,
    queue,
    overdueMap,
    reminderTargets,
    scopeCount,
    isRefined,
    tabCounts,
  };
}

export { DEFAULT_KUDOS_OVERDUE_THRESHOLDS };
export type { KudosOverdueStatus, KudosOverdueThresholds };
