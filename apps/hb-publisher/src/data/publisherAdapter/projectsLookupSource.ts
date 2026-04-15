/**
 * Read-only lookup adapter for the HBCentral `Projects` SharePoint list.
 *
 * Exposes a debounced-friendly async search function that the Article
 * Publisher authoring UI can plug into its project picker to replace
 * manual `ProjectId` / `ProjectName` text entry with authoritative
 * selections from the tenant projects master list.
 *
 * The Projects list was created via CSV import and uses generic
 * `field_N` internal names. Mapping to domain property names matches
 * `backend/functions/src/services/projects-list-contract.ts`:
 *
 *   - field_1 → ProjectId   (primary lookup key)
 *   - field_2 → ProjectNumber (format `##-###-##`)
 *   - field_3 → ProjectName
 *   - field_4 → ProjectLocation
 *
 * The list is title-bound here because no GUID is registered for it
 * under `@hbc/sharepoint-platform`. Title drift on the tenant list
 * would therefore surface as a read failure — matching the pattern
 * already used by `projectSpotlightListSource.ts`.
 */
import { fetchListItemsJson } from '@hbc/sharepoint-platform';

/** SharePoint list title used by the Projects list on HBCentral. */
export const PROJECTS_LOOKUP_LIST_TITLE = 'Projects';

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

/** Raw SharePoint shape returned from the REST query. */
export interface RawProjectsListItem {
  readonly Title?: string;
  readonly field_1?: string;
  readonly field_2?: string;
  readonly field_3?: string;
  readonly field_4?: string;
}

/**
 * Map a raw Projects-list row to a `ProjectLookupEntry`.
 *
 * Returns `null` when the row lacks either the primary identity
 * (`field_1 → ProjectId`) or a visible name (`field_3 → ProjectName`),
 * so a selection cannot be built that would pass downstream validation.
 * Exported for unit testing of the title-bound list mapping contract.
 */
export function mapRawProjectRow(row: RawProjectsListItem): ProjectLookupEntry | null {
  const projectId = row.field_1?.trim();
  const projectName = row.field_3?.trim();
  if (!projectId || !projectName) return null;
  const projectNumber = row.field_2?.trim() ?? '';
  const projectLocation = row.field_4?.trim() || undefined;
  const displayTitle =
    row.Title?.trim() ||
    (projectNumber ? `${projectNumber} — ${projectName}` : projectName);
  return { projectId, projectNumber, projectName, projectLocation, displayTitle };
}

export interface ProjectsLookupSearchOptions {
  /** HBCentral absolute site URL (e.g. `https://tenant.sharepoint.com/sites/HBCentral`). */
  readonly hostSiteUrl: string;
  /** Upper bound on results returned from a single query. Defaults to 20. */
  readonly maxResults?: number;
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
 * Escape an OData string literal. Single quotes inside `'...'` must be
 * doubled; newlines are collapsed defensively so a paste of multi-line
 * text cannot break the filter expression.
 */
export function escapeODataString(value: string): string {
  return value.replace(/'/g, "''").replace(/[\r\n]+/g, ' ');
}

/**
 * Build a `ProjectLookupSearchFn` bound to the given host site URL.
 *
 * Matches are case-insensitive substring hits against the project
 * name (`field_3`), project number (`field_2`), or project location
 * (`field_4`) — the three identifiers the picker surface promises
 * and that authors actually recognize. Results are sorted by project
 * name for a stable visual order.
 */
export function createProjectsLookupSearch(
  options: ProjectsLookupSearchOptions,
): ProjectLookupSearchFn {
  const maxResults = options.maxResults ?? DEFAULT_PROJECTS_LOOKUP_LIMIT;
  const base = options.hostSiteUrl.replace(/\/$/, '');
  const endpointRoot =
    `${base}/_api/web/lists/getbytitle('${encodeURIComponent(PROJECTS_LOOKUP_LIST_TITLE)}')/items`;
  const select = '$select=Title,field_1,field_2,field_3,field_4';

  return async (query, signal) => {
    const trimmed = query.trim();
    if (trimmed.length === 0) return [];

    const escaped = escapeODataString(trimmed);
    const filter =
      `substringof('${escaped}',field_3)` +
      ` or substringof('${escaped}',field_2)` +
      ` or substringof('${escaped}',field_4)`;
    const url =
      `${endpointRoot}?${select}` +
      `&$filter=${encodeURIComponent(filter)}` +
      `&$orderby=field_3` +
      `&$top=${maxResults}`;

    const rows = await fetchListItemsJson<RawProjectsListItem>(url, {
      signal,
      label: `${PROJECTS_LOOKUP_LIST_TITLE} list`,
    });

    const entries: ProjectLookupEntry[] = [];
    for (const row of rows) {
      const entry = mapRawProjectRow(row);
      if (entry) entries.push(entry);
    }
    return entries;
  };
}
