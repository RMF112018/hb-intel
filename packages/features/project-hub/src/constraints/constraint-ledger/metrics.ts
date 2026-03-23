/**
 * P3-E6-T02 Constraint Ledger health spine metric helpers (§2.8).
 * All functions are pure and operate on arrays of IConstraintRecord.
 */

import type { IConstraintRecord } from './types.js';
import { TERMINAL_CONSTRAINT_STATUSES } from './constants.js';
import type { ConstraintStatus } from './enums.js';
import { calculateDaysOpen } from './business-rules.js';

const isOpenConstraint = (record: IConstraintRecord): boolean =>
  !(TERMINAL_CONSTRAINT_STATUSES as readonly ConstraintStatus[]).includes(record.status);

/** Count of constraints where status is not terminal. */
export const calculateOpenConstraintCount = (records: readonly IConstraintRecord[]): number =>
  records.filter(isOpenConstraint).length;

/** Count of open constraints where dueDate < today. */
export const calculateOverdueConstraintCount = (
  records: readonly IConstraintRecord[],
  today: string,
): number =>
  records.filter((r) => isOpenConstraint(r) && r.dueDate < today).length;

/** Count of open constraints where priority = Critical (1). */
export const calculateCriticalConstraintCount = (records: readonly IConstraintRecord[]): number =>
  records.filter((r) => isOpenConstraint(r) && r.priority === 1).length;

/** Count of open constraints grouped by category. */
export const calculateConstraintCountByCategory = (
  records: readonly IConstraintRecord[],
): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const record of records) {
    if (isOpenConstraint(record)) {
      counts[record.category] = (counts[record.category] ?? 0) + 1;
    }
  }
  return counts;
};

/** Mean daysOpen across open constraints. Returns 0 if no open constraints. */
export const calculateAvgDaysOpen = (
  records: readonly IConstraintRecord[],
  today: string,
): number => {
  const open = records.filter(isOpenConstraint);
  if (open.length === 0) return 0;
  const totalDays = open.reduce((sum, r) => sum + calculateDaysOpen(r.dateIdentified, today), 0);
  return totalDays / open.length;
};

/** Maximum daysOpen across open constraints. Returns 0 if no open constraints. */
export const calculateMaxDaysOpen = (
  records: readonly IConstraintRecord[],
  today: string,
): number => {
  const open = records.filter(isOpenConstraint);
  if (open.length === 0) return 0;
  return Math.max(...open.map((r) => calculateDaysOpen(r.dateIdentified, today)));
};
