/**
 * kudosFeatured — shared selection helpers for the public surface.
 *
 * Extracted from HbKudos.tsx so the featured-selection gate and the
 * sort-by-recency helper are available to the orchestration hooks
 * without dragging the top-level runtime module back in.
 */
import type { KudosEntry } from '../../../homepage/webparts/kudosContracts.js';

/**
 * Sort approved kudos by most recent submission date so the spotlight
 * surfaces the freshest live recognition.
 */
export function sortByRecency(entries: KudosEntry[]): KudosEntry[] {
  return [...entries].sort((a, b) => {
    const aTs = Date.parse(a.submittedDate) || 0;
    const bTs = Date.parse(b.submittedDate) || 0;
    return bTs - aTs;
  });
}

/**
 * Content-quality gate for the featured spotlight slot. Requires BOTH
 * at least one recipient AND textual body content (excerpt or details)
 * so the premium spotlight never renders as a hollow shell.
 */
export function isFeaturedWorthy(entry: KudosEntry): boolean {
  const hasRecipients = (entry.recipients ?? []).length > 0;
  const hasText = !!(entry.excerpt?.trim() || entry.details?.trim());
  return hasRecipients && hasText;
}

export interface FeaturedSelection {
  featured?: KudosEntry;
  recent: KudosEntry[];
}

/**
 * Select a featured entry and up to `recentLimit` recent rows from a
 * recency-sorted public list. First entry that passes the quality gate
 * is featured; remaining entries (minus the featured one) flow to the
 * recent rail.
 */
export function selectFeaturedAndRecent(
  sorted: KudosEntry[],
  recentLimit = 7,
): FeaturedSelection {
  const featuredIdx = sorted.findIndex(isFeaturedWorthy);
  const featured = featuredIdx >= 0 ? sorted[featuredIdx] : undefined;
  const recent = sorted.filter((_, i) => i !== featuredIdx).slice(0, recentLimit);
  return { featured, recent };
}
