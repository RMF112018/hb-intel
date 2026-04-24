/**
 * Compute the Monday-based ISO week range that contains the given date.
 *
 * Wave 2 audit remediation (P1-3): drives the week-scoped rollup query.
 * Independent of timezone / locale — operates on UTC date components.
 */

export interface WeekRange {
  readonly weekStartDate: string;
  readonly weekEndDate: string;
}

export function weekRangeForDate(dateYmd: string): WeekRange {
  const d = new Date(`${dateYmd}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) {
    return { weekStartDate: dateYmd, weekEndDate: dateYmd };
  }
  const day = d.getUTCDay();
  const offsetToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setUTCDate(start.getUTCDate() + offsetToMonday);
  const end = new Date(start);
  // Safety reporting-week governance is Monday-Friday.
  end.setUTCDate(end.getUTCDate() + 4);
  return {
    weekStartDate: toYmd(start),
    weekEndDate: toYmd(end),
  };
}

export function isDateInRange(dateYmd: string, range: WeekRange): boolean {
  return dateYmd >= range.weekStartDate && dateYmd <= range.weekEndDate;
}

function toYmd(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
