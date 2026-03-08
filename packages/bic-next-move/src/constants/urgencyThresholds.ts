/**
 * Platform-wide default urgency tier thresholds (D-01).
 *
 * These are used by useBicNextMove when no per-config overrides are present.
 * Override via IBicNextMoveConfig.urgencyThresholds for item types with
 * non-standard cadences (e.g. permit items, bid deadlines).
 */

/** Business days before due date at which urgency becomes 'watch' */
export const BIC_DEFAULT_WATCH_THRESHOLD_DAYS = 3;

/**
 * Business days before due date at which urgency becomes 'immediate'
 * via threshold (in addition to the always-on overdue/due-today rule).
 * Null = only overdue/due-today triggers 'immediate' by default.
 */
export const BIC_DEFAULT_IMMEDIATE_THRESHOLD_DAYS: number | null = null;

/**
 * Computes the number of business days between two dates.
 * Excludes weekends. Does not account for holidays.
 */
export function businessDaysBetween(from: Date, to: Date): number {
  let count = 0;
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);

  while (cursor < end) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

/**
 * Computes urgency tier from a due date string and optional threshold overrides.
 * Returns 'immediate' when:
 *  - dueDate is in the past (overdue)
 *  - dueDate is today
 *  - dueDate is within immediateThresholdDays (if set)
 * Returns 'watch' when within watchThresholdDays.
 * Returns 'upcoming' otherwise.
 * Returns 'upcoming' when dueDate is null (no deadline).
 *
 * Note: Caller is responsible for forcing 'immediate' when currentOwner is null (D-04).
 */
export function computeUrgencyTier(
  dueDate: string | null,
  thresholds?: {
    watchThresholdDays?: number;
    immediateThresholdDays?: number;
  }
): 'immediate' | 'watch' | 'upcoming' {
  if (!dueDate) return 'upcoming';

  const now = new Date();
  const due = new Date(dueDate);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const daysUntilDue = businessDaysBetween(today, due);
  const isOverdue = due < today;
  const isDueToday = due.getTime() === today.getTime();

  // Always 'immediate' if overdue or due today
  if (isOverdue || isDueToday) return 'immediate';

  const immediateThreshold =
    thresholds?.immediateThresholdDays ?? BIC_DEFAULT_IMMEDIATE_THRESHOLD_DAYS;
  const watchThreshold =
    thresholds?.watchThresholdDays ?? BIC_DEFAULT_WATCH_THRESHOLD_DAYS;

  if (immediateThreshold !== null && daysUntilDue <= immediateThreshold) {
    return 'immediate';
  }
  if (daysUntilDue <= watchThreshold) return 'watch';
  return 'upcoming';
}

/**
 * Computes isOverdue from a due date string.
 */
export function computeIsOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}
