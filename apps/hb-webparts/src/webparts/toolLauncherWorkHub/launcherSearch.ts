/**
 * Search contract and discovery model for Tool Launcher.
 *
 * Phase 08-01: Original stable search preparation and matching logic.
 * Phase 11E: Search and discovery upgrade.
 *   - Weighted multi-field scoring replaces flat substring matching
 *   - Exact name match, prefix match, alias match, and field-specific
 *     scoring produce ranked results instead of insertion-order filtering
 *   - Featured and support-coverage platforms receive ranking boosts
 *   - All existing public API shapes preserved (additive changes only)
 *
 * Search fields (case-insensitive, scored by relevance):
 *   - platform name (highest weight — exact > prefix > substring)
 *   - aliases / keywords (high weight — exact > prefix > substring)
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
 * Pre-computed searchable fields for a single platform.
 * Computed once per platform per data refresh — not per keystroke.
 */
export interface SearchablePlatform {
  record: LauncherPlatformRecord;
  /** Lowercased concatenation of all searchable text, space-separated. */
  searchText: string;
  /** Pre-lowercased individual fields for weighted scoring. */
  fields: SearchableFields;
}

/** Pre-lowercased individual fields for per-field scoring. */
interface SearchableFields {
  name: string;
  aliases: string[];
  descriptor: string;
  category: string;
  workflowShelf: string;
  supportOwner: string;
}

/**
 * Prepare a platform record for search by pre-computing the
 * searchable text and individual fields. Called once per data refresh.
 */
export function prepareForSearch(record: LauncherPlatformRecord): SearchablePlatform {
  const fields: SearchableFields = {
    name: record.name.toLowerCase(),
    aliases: record.aliases.map((a) => a.toLowerCase()),
    descriptor: (record.descriptor ?? '').toLowerCase(),
    category: (record.category ?? '').toLowerCase(),
    workflowShelf: (record.workflowShelf ?? '').toLowerCase(),
    supportOwner: (record.support.supportOwnerName ?? '').toLowerCase(),
  };

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
    fields,
  };
}

/**
 * Prepare an array of platform records for search.
 */
export function prepareAllForSearch(records: LauncherPlatformRecord[]): SearchablePlatform[] {
  return records.map(prepareForSearch);
}

/* ── Matching (backward-compatible) ─────────────────────────────── */

/**
 * Test whether a searchable platform matches a query.
 * Case-insensitive substring match against the pre-computed searchText.
 */
export function matchesQuery(platform: SearchablePlatform, query: string): boolean {
  if (!query.trim()) return true;
  return platform.searchText.includes(query.toLowerCase());
}

/* ── Scored search ──────────────────────────────────────────────── */

/** A search result with its relevance score. */
export interface ScoredResult {
  platform: SearchablePlatform;
  score: number;
  /** Which field produced the best match — for UI hints. */
  matchField: 'name' | 'alias' | 'descriptor' | 'category' | 'workflow' | 'support';
}

/*
 * Scoring weights — higher is more relevant.
 *
 * Exact matches score highest, followed by prefix, then substring.
 * Name matches outweigh alias matches, which outweigh other fields.
 * Featured and support-covered platforms get a small boost to
 * surface curated content before uncurated entries.
 */
const SCORE_NAME_EXACT = 100;
const SCORE_NAME_PREFIX = 80;
const SCORE_NAME_SUBSTRING = 50;
const SCORE_ALIAS_EXACT = 70;
const SCORE_ALIAS_PREFIX = 55;
const SCORE_ALIAS_SUBSTRING = 35;
const SCORE_CATEGORY_EXACT = 30;
const SCORE_CATEGORY_PREFIX = 20;
const SCORE_CATEGORY_SUBSTRING = 12;
const SCORE_WORKFLOW_EXACT = 28;
const SCORE_WORKFLOW_PREFIX = 18;
const SCORE_WORKFLOW_SUBSTRING = 10;
const SCORE_DESCRIPTOR_SUBSTRING = 8;
const SCORE_SUPPORT_SUBSTRING = 6;
const BOOST_FEATURED = 5;
const BOOST_SUPPORT_COVERAGE = 2;

/**
 * Score a string field against a query using exact > prefix > substring.
 * Returns 0 if no match.
 */
function scoreField(field: string, query: string, exactW: number, prefixW: number, subW: number): number {
  if (!field) return 0;
  if (field === query) return exactW;
  if (field.startsWith(query)) return prefixW;
  if (field.includes(query)) return subW;
  return 0;
}

/**
 * Score a searchable platform against a query.
 * Returns null if no match at all.
 */
function scorePlatform(sp: SearchablePlatform, query: string): ScoredResult | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  let bestScore = 0;
  let bestField: ScoredResult['matchField'] = 'name';

  // Name
  const nameScore = scoreField(sp.fields.name, q, SCORE_NAME_EXACT, SCORE_NAME_PREFIX, SCORE_NAME_SUBSTRING);
  if (nameScore > bestScore) {
    bestScore = nameScore;
    bestField = 'name';
  }

  // Aliases
  for (const alias of sp.fields.aliases) {
    const aliasScore = scoreField(alias, q, SCORE_ALIAS_EXACT, SCORE_ALIAS_PREFIX, SCORE_ALIAS_SUBSTRING);
    if (aliasScore > bestScore) {
      bestScore = aliasScore;
      bestField = 'alias';
    }
  }

  // Category
  const catScore = scoreField(sp.fields.category, q, SCORE_CATEGORY_EXACT, SCORE_CATEGORY_PREFIX, SCORE_CATEGORY_SUBSTRING);
  if (catScore > bestScore) {
    bestScore = catScore;
    bestField = 'category';
  }

  // Workflow shelf
  const wfScore = scoreField(sp.fields.workflowShelf, q, SCORE_WORKFLOW_EXACT, SCORE_WORKFLOW_PREFIX, SCORE_WORKFLOW_SUBSTRING);
  if (wfScore > bestScore) {
    bestScore = wfScore;
    bestField = 'workflow';
  }

  // Descriptor (substring only — too noisy for prefix/exact)
  if (sp.fields.descriptor && sp.fields.descriptor.includes(q)) {
    if (SCORE_DESCRIPTOR_SUBSTRING > bestScore) {
      bestScore = SCORE_DESCRIPTOR_SUBSTRING;
      bestField = 'descriptor';
    }
  }

  // Support owner (substring only)
  if (sp.fields.supportOwner && sp.fields.supportOwner.includes(q)) {
    if (SCORE_SUPPORT_SUBSTRING > bestScore) {
      bestScore = SCORE_SUPPORT_SUBSTRING;
      bestField = 'support';
    }
  }

  if (bestScore === 0) return null;

  // Apply boosts
  let finalScore = bestScore;
  if (sp.record.isFeatured) finalScore += BOOST_FEATURED;
  if (sp.record.hasSupportCoverage) finalScore += BOOST_SUPPORT_COVERAGE;

  return { platform: sp, score: finalScore, matchField: bestField };
}

/**
 * Score and rank all platforms against a query.
 * Returns results sorted by score (descending), then alphabetically.
 */
export function scoreAndRank(searchable: SearchablePlatform[], query: string): ScoredResult[] {
  if (!query.trim()) return [];

  const results: ScoredResult[] = [];
  for (const sp of searchable) {
    const result = scorePlatform(sp, query);
    if (result) results.push(result);
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.platform.record.name.localeCompare(b.platform.record.name);
  });

  return results;
}

/* ── Index filtering ─────────────────────────────────────────────── */

/**
 * Filter a platform index by search query, returning only groups
 * with matching platforms. Empty groups are suppressed.
 *
 * When a query is present, platforms within each group are re-ordered
 * by relevance score. Groups are ordered by their best match score.
 */
export function filterIndexByQuery(
  index: LauncherPlatformIndex,
  searchable: SearchablePlatform[],
  query: string,
): LauncherPlatformIndex {
  if (!query.trim()) return index;

  // Score all platforms
  const scored = scoreAndRank(searchable, query);
  const scoreMap = new Map<string, number>();
  for (const r of scored) {
    scoreMap.set(r.platform.record.platformKey, r.score);
  }

  // Filter and re-order within each group
  const filtered = index.groups
    .map((group) => {
      const matching = group.platforms
        .filter((p) => scoreMap.has(p.platformKey))
        .sort((a, b) => {
          const sa = scoreMap.get(a.platformKey) ?? 0;
          const sb = scoreMap.get(b.platformKey) ?? 0;
          if (sb !== sa) return sb - sa;
          return a.name.localeCompare(b.name);
        });
      return { category: group.category, platforms: matching, bestScore: Math.max(0, ...matching.map((p) => scoreMap.get(p.platformKey) ?? 0)) };
    })
    .filter((group) => group.platforms.length > 0)
    .sort((a, b) => b.bestScore - a.bestScore);

  return { groups: filtered.map(({ category, platforms }) => ({ category, platforms })) };
}

/**
 * Count total platforms across all groups in an index.
 */
export function countIndexPlatforms(index: LauncherPlatformIndex): number {
  return index.groups.reduce((sum, g) => sum + g.platforms.length, 0);
}
