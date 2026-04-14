/**
 * Human-relative age helper for the drafts queue. Workstream-g step-02.
 *
 * Pure / deterministic. Given an ISO timestamp and a "now" reference,
 * returns a tight string suitable for a queue row: "2m", "3h",
 * "yesterday", "Mar 12", "Feb 3 2025".
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function humaniseAge(iso: string | undefined, now: Date = new Date()): string {
  if (!iso) return '—';
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '—';
  const deltaMs = now.getTime() - then.getTime();
  if (deltaMs < 0) {
    // Clock skew or future-dated: fall through to absolute date.
    return formatAbsolute(then, now);
  }
  if (deltaMs < MINUTE) return 'just now';
  if (deltaMs < HOUR) return `${Math.floor(deltaMs / MINUTE)}m`;
  if (deltaMs < DAY) return `${Math.floor(deltaMs / HOUR)}h`;
  if (deltaMs < 2 * DAY && isSameYesterday(then, now)) return 'yesterday';
  return formatAbsolute(then, now);
}

function isSameYesterday(then: Date, now: Date): boolean {
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  return (
    then.getFullYear() === y.getFullYear() &&
    then.getMonth() === y.getMonth() &&
    then.getDate() === y.getDate()
  );
}

function formatAbsolute(then: Date, now: Date): string {
  const month = then.toLocaleString('en-US', { month: 'short' });
  const day = then.getDate();
  if (then.getFullYear() === now.getFullYear()) return `${month} ${day}`;
  return `${month} ${day} ${then.getFullYear()}`;
}
