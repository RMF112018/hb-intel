/**
 * Pure filter + highlight helpers for the drafts queue search input.
 * Workstream-g step-02.
 */

import type { PublisherArticleRow } from '../../../homepage/data/publisherAdapter/index.js';

const MATCH_FIELDS: readonly (keyof PublisherArticleRow)[] = [
  'Title',
  'ProjectName',
  'Subhead',
  'SummaryExcerpt',
  'Slug',
  'AuthorEmail',
];

/**
 * Does the article row match the search query? Case-insensitive
 * substring match across Title / ProjectName / Subhead /
 * SummaryExcerpt / Slug / AuthorEmail. An empty or whitespace-only
 * query matches every row.
 */
export function matchesDraftQuery(row: PublisherArticleRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return true;
  for (const key of MATCH_FIELDS) {
    const value = row[key];
    if (typeof value !== 'string') continue;
    if (value.toLowerCase().includes(q)) return true;
  }
  return false;
}

export interface HighlightSegment {
  readonly text: string;
  readonly match: boolean;
}

/**
 * Split `text` into `[non-match, match, non-match, …]` segments so
 * a renderer can wrap matches in `<mark>` without parsing HTML.
 * Returns a single non-match segment when the query is empty or
 * does not occur in the text.
 */
export function highlightMatches(
  text: string | undefined | null,
  query: string,
): HighlightSegment[] {
  if (!text) return [];
  const q = query.trim();
  if (q.length === 0) return [{ text, match: false }];
  const needle = q.toLowerCase();
  const haystack = text.toLowerCase();
  const segments: HighlightSegment[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    const hit = haystack.indexOf(needle, cursor);
    if (hit < 0) {
      segments.push({ text: text.slice(cursor), match: false });
      break;
    }
    if (hit > cursor) {
      segments.push({ text: text.slice(cursor, hit), match: false });
    }
    segments.push({ text: text.slice(hit, hit + q.length), match: true });
    cursor = hit + q.length;
  }
  return segments;
}
