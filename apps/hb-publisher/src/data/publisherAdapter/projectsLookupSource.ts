/**
 * Read-only lookup adapter for the HBCentral `Projects` SharePoint list.
 *
 * Exposes a debounced-friendly async search function that the Article
 * Publisher authoring UI plugs into its project picker to replace
 * manual `ProjectId` / `ProjectName` text entry with authoritative
 * selections from the tenant projects master list.
 *
 * Identity & field contract. Both the list identity (GUID or
 * title fallback) and the field-name mapping (`field_N` → domain
 * names) are owned by `projectsListContract.ts`. This file composes
 * the picker-specific search semantics (which fields to
 * `substringof()` against, sort order, truthful failure label) on
 * top of that contract; when a Projects list GUID is registered
 * the same call path upgrades to GUID binding automatically.
 */
import { fetchListItemsJson } from '@hbc/sharepoint-platform';
import { escapeODataString } from './odataEscape.js';
import {
  PROJECTS_LIST_FIELDS,
  buildProjectsListItemsUrl,
  projectsListFetchLabel,
  type RawProjectsListItem,
} from './projectsListContract.js';

export type { RawProjectsListItem } from './projectsListContract.js';

/** Maximum number of results returned from a single search query. */
export const DEFAULT_PROJECTS_LOOKUP_LIMIT = 20;

/**
 * Hydration payload for a selected project — only the fields that the
 * Article Publisher contract (`publisherContracts.ts`) models. Sector
 * and status are deliberately omitted from hydration because the
 * Projects list schema does not expose a clean mapping for those
 * semantics; authors can still fill them manually if needed.
 */
export interface ProjectLookupEntry {
  readonly projectId: string;
  readonly projectNumber: string;
  readonly projectName: string;
  readonly projectLocation?: string;
  /** Server-computed `"{projectNumber} — {projectName}"` display label. */
  readonly displayTitle: string;
}

/**
 * Map a raw Projects-list row to a `ProjectLookupEntry`.
 *
 * Returns `null` when the row lacks either the primary identity
 * (`projectId`) or a visible name (`projectName`), so a selection
 * cannot be built that would pass downstream validation. Exported
 * for unit testing of the tenant field contract.
 */
export function mapRawProjectRow(
  row: RawProjectsListItem,
): ProjectLookupEntry | null {
  const projectId = row[PROJECTS_LIST_FIELDS.projectId]?.trim();
  const projectName = row[PROJECTS_LIST_FIELDS.projectName]?.trim();
  if (!projectId || !projectName) return null;
  const projectNumber = row[PROJECTS_LIST_FIELDS.projectNumber]?.trim() ?? '';
  const projectLocation =
    row[PROJECTS_LIST_FIELDS.projectLocation]?.trim() || undefined;
  const displayTitle =
    row[PROJECTS_LIST_FIELDS.displayTitle]?.trim() ||
    (projectNumber ? `${projectNumber} — ${projectName}` : projectName);
  return { projectId, projectNumber, projectName, projectLocation, displayTitle };
}

export interface ProjectsLookupSearchOptions {
  /** HBCentral absolute site URL (e.g. `https://tenant.sharepoint.com/sites/HBCentral`). */
  readonly hostSiteUrl: string;
  /** Upper bound on results returned from a single query. Defaults to 20. */
  readonly maxResults?: number;
  /**
   * Projects list GUID override. When supplied (or when the module-level
   * `PROJECTS_LIST_ID` is set) the lookup binds by GUID; otherwise it
   * falls back to the title-bound REST root.
   */
  readonly listId?: string;
}

/**
 * Async signature expected by the authoring picker. `signal` allows
 * the caller to cancel a stale in-flight request when the query
 * changes or the component unmounts.
 */
export type ProjectLookupSearchFn = (
  query: string,
  signal?: AbortSignal,
) => Promise<ProjectLookupEntry[]>;

/**
 * Build a `ProjectLookupSearchFn` bound to the given host site URL.
 *
 * Matches are case-insensitive substring hits against the project
 * name, project number, or project location — the three identifiers
 * the picker surface promises and that authors actually recognize.
 * Results are sorted by project name for a stable visual order.
 */
export function createProjectsLookupSearch(
  options: ProjectsLookupSearchOptions,
): ProjectLookupSearchFn {
  const maxResults = options.maxResults ?? DEFAULT_PROJECTS_LOOKUP_LIMIT;
  const listIdOverride = options.listId;
  const F = PROJECTS_LIST_FIELDS;

  return async (query, signal) => {
    const trimmed = query.trim();
    if (trimmed.length === 0) return [];

    const escaped = escapeODataString(trimmed);
    const filter =
      `substringof('${escaped}',${F.projectName})` +
      ` or substringof('${escaped}',${F.projectNumber})` +
      ` or substringof('${escaped}',${F.projectLocation})`;

    const binding = buildProjectsListItemsUrl({
      hostSiteUrl: options.hostSiteUrl,
      filter,
      orderBy: F.projectName,
      top: maxResults,
      listId: listIdOverride,
    });

    const rows = await fetchListItemsJson<RawProjectsListItem>(binding.url, {
      signal,
      label: projectsListFetchLabel(binding.kind),
    });

    const entries: ProjectLookupEntry[] = [];
    for (const row of rows) {
      const entry = mapRawProjectRow(row);
      if (entry) entries.push(entry);
    }
    return entries;
  };
}
