/**
 * formatRelativeTime — P2-B3 §6.2 relative time labels.
 * Converts an ISO timestamp to a human-readable relative string.
 */

export function formatRelativeTime(isoTimestamp: string): string {
  const then = new Date(isoTimestamp).getTime();
  const now = Date.now();
  const diffMs = now - then;

  if (diffMs < 0) return 'just now';

  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 5) return `${hours} hr ago`;
  return 'More than 4 hours ago';
}
