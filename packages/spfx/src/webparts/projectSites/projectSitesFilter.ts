/**
 * Project Sites client-side filter / sort / search pipeline.
 *
 * Pure helpers used by the webpart consumer to compose a final visible
 * entry list from the normalized server result plus the user's current
 * search term, sort key, and advanced filter state.
 *
 * Why client-side: the hybrid strategy keeps server-side query logic
 * minimal (coarse year / all-projects scoping only), fetches a normalized
 * entry set, and then runs search/sort/filter against that set in the
 * browser. This gives us fast-feeling interaction without brittle
 * SharePoint REST query permutations and without blowing the SPFx bundle
 * budget on a server-side full-text layer.
 *
 * Ownership: W01r-P12 (Project Sites search / filter / sort enhancement).
 */
import type {
  IProjectSiteEntry,
  ProjectSitesFilters,
  ProjectSitesSortKey,
} from './types.js';

// ── Search corpus ─────────────────────────────────────────────────────────

/**
 * Build the natural-field search corpus for an entry.
 *
 * Intentionally user-facing: no `ProjectId`, no raw internal field names.
 * The corpus is a single lower-cased string that the multi-token search
 * walker evaluates against.
 */
function buildSearchCorpus(entry: IProjectSiteEntry): string {
  const parts: string[] = [
    entry.projectName,
    entry.projectNumber,
    entry.clientName,
    entry.projectLocation,
    entry.projectStreetAddress,
    entry.projectCity,
    entry.projectCounty,
    entry.projectState,
    entry.projectStage,
    entry.projectType,
    entry.department,
    entry.officeDivision,
    entry.projectExecutiveUpn,
    entry.projectManagerUpn,
    entry.leadEstimatorUpn,
    ...entry.supportingEstimatorUpns,
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
}

/**
 * Tokenize the user's search input into trimmed lower-cased tokens.
 * Empty / whitespace-only input yields an empty array (no search).
 */
function tokenizeSearchTerm(term: string): string[] {
  return term
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * An entry matches the search if EVERY token appears somewhere in its
 * corpus (AND across tokens, partial-match within each token).
 */
function entryMatchesSearch(entry: IProjectSiteEntry, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const corpus = buildSearchCorpus(entry);
  for (const token of tokens) {
    if (!corpus.includes(token)) return false;
  }
  return true;
}

// ── Filter predicates ─────────────────────────────────────────────────────

function inMultiSelect(value: string, selected: string[]): boolean {
  if (selected.length === 0) return true;
  const normalized = value.trim().toLowerCase();
  for (const candidate of selected) {
    if (candidate.trim().toLowerCase() === normalized) return true;
  }
  return false;
}

/**
 * An entry matches the filter state if EVERY active filter field is satisfied.
 * Inside a single filter field, selection is OR; across fields, it is AND.
 */
function entryMatchesFilters(
  entry: IProjectSiteEntry,
  filters: ProjectSitesFilters,
): boolean {
  if (!inMultiSelect(entry.projectStage, filters.stages)) return false;
  if (!inMultiSelect(entry.projectManagerUpn, filters.projectManagerUpns)) return false;
  if (!inMultiSelect(entry.leadEstimatorUpn, filters.leadEstimatorUpns)) return false;
  if (!inMultiSelect(entry.projectExecutiveUpn, filters.projectExecutiveUpns)) return false;
  if (!inMultiSelect(entry.department, filters.departments)) return false;
  if (!inMultiSelect(entry.officeDivision, filters.officeDivisions)) return false;
  if (filters.hasSiteOnly === true && !entry.hasSiteUrl) return false;
  if (filters.hasSiteOnly === false && entry.hasSiteUrl) return false;
  return true;
}

// ── Sort comparators ──────────────────────────────────────────────────────

/**
 * Stable-ish comparator factory for `ProjectSitesSortKey`. Uses
 * `String.prototype.localeCompare` with `sensitivity: 'base'` so the sort
 * ignores case differences but preserves authored strings. Year sorts fall
 * back to project number for deterministic tie-breaking.
 */
function comparatorFor(sortKey: ProjectSitesSortKey) {
  const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });
  return (a: IProjectSiteEntry, b: IProjectSiteEntry): number => {
    switch (sortKey) {
      case 'name-asc':
        return collator.compare(a.projectName, b.projectName) || collator.compare(a.projectNumber, b.projectNumber);
      case 'name-desc':
        return collator.compare(b.projectName, a.projectName) || collator.compare(b.projectNumber, a.projectNumber);
      case 'number-asc':
        return collator.compare(a.projectNumber, b.projectNumber) || collator.compare(a.projectName, b.projectName);
      case 'number-desc':
        return collator.compare(b.projectNumber, a.projectNumber) || collator.compare(b.projectName, a.projectName);
      case 'year-desc': {
        const diff = (b.year || 0) - (a.year || 0);
        return diff !== 0 ? diff : collator.compare(a.projectNumber, b.projectNumber);
      }
      case 'year-asc': {
        const diff = (a.year || 0) - (b.year || 0);
        return diff !== 0 ? diff : collator.compare(a.projectNumber, b.projectNumber);
      }
      default:
        return 0;
    }
  };
}

// ── Public API ────────────────────────────────────────────────────────────

export interface ApplyPipelineArgs {
  entries: IProjectSiteEntry[];
  searchTerm: string;
  sortKey: ProjectSitesSortKey;
  filters: ProjectSitesFilters;
}

/**
 * Apply search → filters → sort in that order. Returns a new array (the
 * source is never mutated). Non-matching entries are dropped before sort
 * so the comparator only runs over the visible set.
 */
export function applyProjectSitesPipeline({
  entries,
  searchTerm,
  sortKey,
  filters,
}: ApplyPipelineArgs): IProjectSiteEntry[] {
  const tokens = tokenizeSearchTerm(searchTerm);
  const visible = entries.filter(
    (e) => entryMatchesSearch(e, tokens) && entryMatchesFilters(e, filters),
  );
  const sorted = visible.slice().sort(comparatorFor(sortKey));
  return sorted;
}

// ── Facet extraction ──────────────────────────────────────────────────────

/**
 * Extract the distinct filter-facet values from a set of entries. Used by
 * the advanced-filter panel to populate its multi-select options. Empty
 * strings are excluded; values are trimmed, de-duplicated (case-insensitive),
 * and sorted alphabetically.
 */
export interface ProjectSitesFacets {
  stages: string[];
  projectManagerUpns: string[];
  leadEstimatorUpns: string[];
  projectExecutiveUpns: string[];
  departments: string[];
  officeDivisions: string[];
}

function dedupSorted(values: string[]): string[] {
  const seen = new Map<string, string>();
  for (const raw of values) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) seen.set(key, trimmed);
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}

export function extractProjectSitesFacets(entries: IProjectSiteEntry[]): ProjectSitesFacets {
  return {
    stages: dedupSorted(entries.map((e) => e.projectStage)),
    projectManagerUpns: dedupSorted(entries.map((e) => e.projectManagerUpn)),
    leadEstimatorUpns: dedupSorted(entries.map((e) => e.leadEstimatorUpn)),
    projectExecutiveUpns: dedupSorted(entries.map((e) => e.projectExecutiveUpn)),
    departments: dedupSorted(entries.map((e) => e.department)),
    officeDivisions: dedupSorted(entries.map((e) => e.officeDivision)),
  };
}

// ── Label helpers ─────────────────────────────────────────────────────────

/**
 * Derive a reasonable user-facing display label from a UPN or email
 * string. Keeps the raw value if it already looks human (contains a space)
 * or cannot be parsed. This is intentionally narrow and conservative —
 * a proper People display-name resolution is a future follow-up.
 */
export function humanizeUpn(upn: string): string {
  if (!upn) return '';
  const trimmed = upn.trim();
  if (!trimmed) return '';
  if (trimmed.includes(' ')) return trimmed;
  const atIdx = trimmed.indexOf('@');
  const local = atIdx > 0 ? trimmed.slice(0, atIdx) : trimmed;
  // Split on common separators and title-case each part
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length === 0) return trimmed;
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}
