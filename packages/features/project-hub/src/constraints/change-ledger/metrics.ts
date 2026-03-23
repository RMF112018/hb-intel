/**
 * P3-E6-T04 Change Ledger health spine metric helpers (§4.10).
 * All functions are pure and operate on arrays of IChangeEventRecord.
 */

import type { IChangeEventRecord } from './types.js';
import { TERMINAL_CHANGE_EVENT_STATUSES } from './constants.js';
import type { ChangeEventStatus } from './enums.js';

const isOpenChangeEvent = (record: IChangeEventRecord): boolean =>
  !(TERMINAL_CHANGE_EVENT_STATUSES as readonly ChangeEventStatus[]).includes(record.status);

/** Count of change events where status is not terminal. */
export const calculateOpenChangeEventCount = (records: readonly IChangeEventRecord[]): number =>
  records.filter(isOpenChangeEvent).length;

/** Count of change events where status = PendingApproval. */
export const calculatePendingApprovalCount = (records: readonly IChangeEventRecord[]): number =>
  records.filter((r) => r.status === 'PendingApproval').length;

/** Sum of totalCostImpact for PendingApproval events. */
export const calculateTotalPendingCostImpact = (records: readonly IChangeEventRecord[]): number =>
  records
    .filter((r) => r.status === 'PendingApproval')
    .reduce((sum, r) => sum + r.totalCostImpact, 0);

/** Sum of totalCostImpact for Approved and Closed events. */
export const calculateTotalApprovedCostImpact = (records: readonly IChangeEventRecord[]): number => {
  const approvedStatuses: readonly ChangeEventStatus[] = ['Approved', 'Closed'];
  return records
    .filter((r) => approvedStatuses.includes(r.status))
    .reduce((sum, r) => sum + r.totalCostImpact, 0);
};

/** Count of open change events grouped by origin. */
export const calculateChangeEventCountByOrigin = (
  records: readonly IChangeEventRecord[],
): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const record of records) {
    if (isOpenChangeEvent(record)) {
      counts[record.origin] = (counts[record.origin] ?? 0) + 1;
    }
  }
  return counts;
};
