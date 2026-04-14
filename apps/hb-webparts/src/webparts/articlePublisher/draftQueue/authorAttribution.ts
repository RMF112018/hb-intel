/**
 * Author attribution for the drafts queue row tertiary line.
 * Workstream-g step-02.
 *
 * Returns "you" when the draft belongs to the acting operator;
 * otherwise falls back to a readable display name derived from the
 * email's local-part ("alice.smith" → "Alice Smith"). Pure.
 */

export function authorAttribution(
  authorEmail: string | undefined,
  actorEmail: string | undefined,
): string {
  const author = (authorEmail ?? '').trim().toLowerCase();
  const actor = (actorEmail ?? '').trim().toLowerCase();
  if (author.length === 0) return 'Unknown author';
  if (actor.length > 0 && author === actor) return 'you';
  return displayNameFromEmail(authorEmail!);
}

function displayNameFromEmail(email: string): string {
  const local = email.trim().split('@')[0] ?? '';
  if (local.length === 0) return 'Unknown author';
  return local
    .split(/[.\-_]+/)
    .filter((segment) => segment.length > 0)
    .map((segment) => segment[0]!.toUpperCase() + segment.slice(1))
    .join(' ');
}
