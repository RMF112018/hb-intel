/**
 * P3-E6-T03 Delay Ledger health spine metric helpers (§3.11).
 * All functions are pure and operate on arrays of IDelayRecord.
 */

import type { IDelayRecord } from './types.js';
import { DEFAULT_NOTIFICATION_THRESHOLD_DAYS, TERMINAL_DELAY_STATUSES } from './constants.js';
import type { DelayStatus } from './enums.js';

const isOpenDelay = (record: IDelayRecord): boolean =>
  !(TERMINAL_DELAY_STATUSES as readonly DelayStatus[]).includes(record.status);

/** Count of delays where status is not terminal. */
export const calculateOpenDelayCount = (records: readonly IDelayRecord[]): number =>
  records.filter(isOpenDelay).length;

/** Count of open delays where criticalPathImpact = CRITICAL. */
export const calculateCriticalPathDelayCount = (records: readonly IDelayRecord[]): number =>
  records.filter((r) => isOpenDelay(r) && r.criticalPathImpact === 'CRITICAL').length;

/**
 * Sum of timeImpact.estimatedCalendarDays for delays at Quantified or beyond.
 * Only includes delays that have reached Quantified, Dispositioned, or Closed.
 */
export const calculateTotalQuantifiedDelayDays = (records: readonly IDelayRecord[]): number => {
  const quantifiedStatuses: readonly DelayStatus[] = ['Quantified', 'Dispositioned', 'Closed'];
  return records
    .filter((r) => quantifiedStatuses.includes(r.status) && r.timeImpact)
    .reduce((sum, r) => sum + (r.timeImpact?.estimatedCalendarDays ?? 0), 0);
};

/**
 * Count of open delays where notificationDate is not set and
 * delayStartDate is more than threshold days ago.
 */
export const calculatePendingNotificationCount = (
  records: readonly IDelayRecord[],
  today: string,
  thresholdDays: number = DEFAULT_NOTIFICATION_THRESHOLD_DAYS,
): number => {
  const now = new Date(today);
  return records.filter((r) => {
    if (!isOpenDelay(r)) return false;
    if (r.notificationDate) return false;
    const start = new Date(r.delayStartDate);
    const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > thresholdDays;
  }).length;
};

/** Count of open delays grouped by delayEventType. */
export const calculateDelayCountByEventType = (
  records: readonly IDelayRecord[],
): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const record of records) {
    if (isOpenDelay(record)) {
      counts[record.delayEventType] = (counts[record.delayEventType] ?? 0) + 1;
    }
  }
  return counts;
};
