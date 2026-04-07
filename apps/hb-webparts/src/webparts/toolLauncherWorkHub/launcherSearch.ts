/**
 * Search contract and discovery model for Tool Launcher.
 *
 * Phase 08-01: Stable search preparation and matching logic for the
 * launcher domain. Consumed by the all-platforms overlay and (in later
 * prompts) the command band search.
 *
 * Search fields (case-insensitive substring matching):
 *   - platform name
 *   - aliases / keywords (each alias checked independently)
 *   - short descriptor
 *   - category
 *   - workflow shelf
 *   - support owner name (for "who supports X?" queries)
 *
 * All fields come from LauncherPlatformRecord — no raw SharePoint
 * field access. Missing optional fields are safely skipped.
 */
import type {
  LauncherPlatformRecord,
  LauncherPlatformIndex,
} from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Searchable record ───────────────────────────────────────────── */

/**
 * Pre-computed searchable text for a single platform.
 * Computed once per platform per data refresh — not per keystroke.
 */
export interface SearchablePlatform {
  record: LauncherPlatformRecord;
  /** Lowercased concatenation of all searchable text, space-separated. */
  searchText: string;
}

/**
 * Prepare a platform record for search by pre-computing the
 * searchable text. This should be called once per data refresh,
 * not on every keystroke.
 */
export function prepareForSearch(record: LauncherPlatformRecord): SearchablePlatform {
  const parts: string[] = [
    record.name,
    ...record.aliases,
    record.descriptor ?? '',
    record.category ?? '',
    record.workflowShelf ?? '',
    record.support.supportOwnerName ?? '',
  ];
  return {
    record,
    searchText: parts.join(' ').toLowerCase(),
  };
}

/**
 * Prepare an array of platform records for search.
 */
export function prepareAllForSearch(records: LauncherPlatformRecord[]): SearchablePlatform[] {
  return records.map(prepareForSearch);
}

/* ── Matching ────────────────────────────────────────────────────── */

/**
 * Test whether a searchable platform matches a query.
 * Case-insensitive substring match against the pre-computed searchText.
 */
export function matchesQuery(platform: SearchablePlatform, query: string): boolean {
  if (!query.trim()) return true;
  return platform.searchText.includes(query.toLowerCase());
}

/* ── Index filtering ─────────────────────────────────────────────── */

/**
 * Filter a platform index by search query, returning only groups
 * with matching platforms. Empty groups are suppressed.
 */
export function filterIndexByQuery(
  index: LauncherPlatformIndex,
  searchable: SearchablePlatform[],
  query: string,
): LauncherPlatformIndex {
  if (!query.trim()) return index;

  const q = query.toLowerCase();

  // Build a set of matching platform keys for fast lookup
  const matchingKeys = new Set<string>();
  for (const sp of searchable) {
    if (sp.searchText.includes(q)) {
      matchingKeys.add(sp.record.platformKey);
    }
  }

  const filtered = index.groups
    .map((group) => ({
      category: group.category,
      platforms: group.platforms.filter((p) => matchingKeys.has(p.platformKey)),
    }))
    .filter((group) => group.platforms.length > 0);

  return { groups: filtered };
}

/**
 * Count total platforms across all groups in an index.
 */
export function countIndexPlatforms(index: LauncherPlatformIndex): number {
  return index.groups.reduce((sum, g) => sum + g.platforms.length, 0);
}
