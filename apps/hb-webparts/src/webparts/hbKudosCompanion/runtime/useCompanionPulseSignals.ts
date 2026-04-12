/**
 * useCompanionPulseSignals — derives the priority-pulse signal array
 * for the companion workspace (Phase-28 Prompt-02 structural redesign).
 *
 * The signals (overdue, approaching, flagged, pending) are computed
 * across the full `allKudos` list (not just the current tab scope)
 * so the pulse strip advertises the true workload even when the
 * operator has narrowed the queue. Each signal's `onScope` handler
 * dispatches the matching companion filter action.
 */
import * as React from 'react';
import {
  deriveKudosOverdueStatus,
  type KudosOverdueThresholds,
} from '../../../homepage/helpers/kudosNotificationBuilder.js';
import type { KudosEntry } from '../../../homepage/webparts/kudosContracts.js';
import type { PulseSignal } from '../components/PriorityPulseStrip.js';
import type { FilterAction } from './companionFilter.js';

export interface UseCompanionPulseSignalsInput {
  allKudos: KudosEntry[];
  nowIso: string;
  overdueThresholds: KudosOverdueThresholds;
  tabCounts: Record<string, number>;
  activeTabId: string;
  adminReviewOnly: boolean;
  dispatch: React.Dispatch<FilterAction>;
}

export interface UseCompanionPulseSignalsResult {
  signals: PulseSignal[];
  overdueCount: number;
  approachingCount: number;
}

export function useCompanionPulseSignals({
  allKudos,
  nowIso,
  overdueThresholds,
  tabCounts,
  activeTabId,
  adminReviewOnly,
  dispatch,
}: UseCompanionPulseSignalsInput): UseCompanionPulseSignalsResult {
  const { overdueCount, approachingCount } = React.useMemo(() => {
    let overdue = 0;
    let approaching = 0;
    for (const entry of allKudos) {
      const ws = entry.workflowStatus;
      if (ws !== 'pending' && ws !== 'revisionRequested') continue;
      const status = deriveKudosOverdueStatus(
        entry.submittedDate,
        nowIso,
        overdueThresholds.pendingOverdueDays,
      );
      if (status === 'overdue') overdue += 1;
      else if (status === 'approaching') approaching += 1;
    }
    return { overdueCount: overdue, approachingCount: approaching };
  }, [allKudos, nowIso, overdueThresholds.pendingOverdueDays]);

  const signals: PulseSignal[] = React.useMemo(
    () => [
      {
        id: 'overdue',
        label: 'Overdue',
        count: overdueCount,
        tone: 'danger',
        active: activeTabId === 'pending' && !adminReviewOnly,
        onScope: () => dispatch({ type: 'setTab', tabId: 'pending' }),
      },
      {
        id: 'approaching',
        label: 'Approaching',
        count: approachingCount,
        tone: 'warning',
        active: false,
        onScope: () => dispatch({ type: 'setTab', tabId: 'pending' }),
      },
      {
        id: 'flagged',
        label: 'Flagged for admin',
        count: tabCounts['flagged'] ?? 0,
        tone: 'warning',
        active: activeTabId === 'flagged',
        onScope: () => dispatch({ type: 'setTab', tabId: 'flagged' }),
      },
      {
        id: 'pending',
        label: 'Pending',
        count: tabCounts['pending'] ?? 0,
        tone: 'info',
        active: activeTabId === 'pending' && !adminReviewOnly,
        onScope: () => dispatch({ type: 'setTab', tabId: 'pending' }),
      },
    ],
    [overdueCount, approachingCount, tabCounts, activeTabId, adminReviewOnly, dispatch],
  );

  return { signals, overdueCount, approachingCount };
}
