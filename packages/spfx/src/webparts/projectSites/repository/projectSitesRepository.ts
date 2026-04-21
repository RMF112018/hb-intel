/**
 * SharePoint I/O seam for the Project Sites surface.
 *
 * This module is the **I/O layer only**: it fetches raw Projects list
 * rows and raw Legacy Project Fallback Registry rows, narrows the
 * registry rows into adapter candidates
 * (`legacyFallbackRegistryAdapter.ts`), and returns the pair as
 * `IProjectSitesQueryResult`. All merge, dedup, source-classification,
 * synthetic legacy-only emission, and launch-target resolution live in
 * `projectSitesResolver.ts` — this file does not join rows, does not
 * decide precedence, and does not construct `IProjectSiteEntry`.
 *
 * Retrieval contract (post-cap):
 *   - Year scope (`{ kind: 'year', year }`) and All-Projects scope
 *     (`{ kind: 'all' }`) both drain the eligible dataset by following
 *     SharePoint REST `__next` continuation links explicitly via the
 *     SPFx `spHttpClient`. We deliberately avoid PnPjs v4's
 *     `[Symbol.asyncIterator]` because its second-page fetch reuses an
 *     SPCollection without the response binder, which silently truncates
 *     the drain after the first page.
 *   - Per-request page size is `PROJECT_SITES_PAGE_SIZE` (5000 —
 *     SharePoint REST's documented `$top` maximum).
 *   - A defense-in-depth ceiling (`PROJECT_SITES_ALL_SCOPE_CEILING`)
 *     prevents runaway fetches; if hit, the result carries
 *     `bounded: true` so the UI can render an honest overflow notice.
 *   - The previous silent `.top(2000)` cap on All-Projects is removed —
 *     `All Projects` search is now truly full-scope within the ceiling.
 */
import { getSpfxContext } from '@hbc/auth/spfx';
import type { IRawProjectSiteItem, ProjectSitesScope } from '../types.js';
import {
  PROJECT_SITES_ALL_SCOPE_CEILING,
  PROJECT_SITES_PAGE_SIZE,
  PROJECT_SITES_SELECT_FIELDS,
  SP_PROJECTS_FIELDS,
  isValidYear,
} from '../types.js';
import type {
  ILegacyFallbackRegistryCandidate,
  IRawLegacyFallbackRegistryItem,
} from './legacyFallbackRegistryAdapter.js';
import {
  LEGACY_FALLBACK_REGISTRY_FIELD,
  LEGACY_FALLBACK_REGISTRY_LIST_TITLE,
  LEGACY_FALLBACK_REGISTRY_SELECT_FIELDS,
  toLegacyFallbackCandidate,
} from './legacyFallbackRegistryAdapter.js';
import type { IProjectSitesQueryResult } from '../projectSitesResolver.js';

// Re-export the adapter surface for existing consumers (tests, callers)
// that historically imported these names from the repository module.
export {
  buildLegacyFallbackLookup,
  pickBestLegacyFallbackCandidate,
  toLegacyFallbackCandidate,
} from './legacyFallbackRegistryAdapter.js';
export type {
  ILegacyFallbackRegistryCandidate,
  IRawLegacyFallbackRegistryItem,
  LegacyFallbackMatchConfidence,
  LegacyFallbackMatchMethod,
  LegacyFallbackMatchStatus,
} from './legacyFallbackRegistryAdapter.js';

const PROJECTS_LIST_TITLE = 'Projects';

export interface IProjectSitesRepository {
  fetchDistinctYears(): Promise<number[]>;
  /**
   * Fetch the raw inputs required to resolve the merged project-site
   * entry set for the given scope. The resolver (`projectSitesResolver.ts`)
   * performs the merge; the repository is only responsible for I/O and
   * narrowing registry rows into candidates.
   */
  fetchProjectSites(scope: ProjectSitesScope): Promise<IProjectSitesQueryResult>;
}

function toCandidates(
  rows: readonly IRawLegacyFallbackRegistryItem[],
): ILegacyFallbackRegistryCandidate[] {
  const out: ILegacyFallbackRegistryCandidate[] = [];
  for (const row of rows) {
    const candidate = toLegacyFallbackCandidate(row);
    if (candidate) out.push(candidate);
  }
  return out;
}

/**
 * Minimal HTTP-GET contract used by the drain. Implemented by
 * `window.fetch` in production and by a fake in tests. Kept narrow so
 * the test can avoid faking the whole SPFx context.
 */
type ItemsFetch = (url: string) => Promise<Response>;

interface ISpfxRequester {
  /** Absolute URL of the current SharePoint web. */
  webUrl: string;
  /** HTTP GET callable that returns a Response-like object. */
  fetch: ItemsFetch;
}

/**
 * Read the SPFx context once and return everything the drain needs.
 *
 * We deliberately avoid importing `@microsoft/sp-http` as a value: that
 * package is externalized at bundle time and is not resolvable via
 * SPFx's AMD loader inside the IIFE at runtime, which would cause a
 * "Cannot read properties of undefined (reading 'SPHttpClient')"
 * failure before the first request even leaves the page. Instead we
 * use the browser `fetch` with same-origin credentials — valid for
 * SharePoint REST GETs inside an authenticated SPFx webpart.
 *
 * Fail loudly if the webUrl is missing — that is a bootstrap problem,
 * not an empty-list problem.
 */
function getSpfxRequester(): ISpfxRequester {
  const context = getSpfxContext();
  const webUrl = context.pageContext?.web?.absoluteUrl;
  if (typeof webUrl !== 'string' || webUrl.length === 0) {
    throw new Error('Project Sites repository: SPFx pageContext.web.absoluteUrl is missing.');
  }
  const fetchImpl: ItemsFetch = (url: string) =>
    fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        // nometadata keeps the payload small; both response shapes are
        // handled by `fetchItemsPage`.
        Accept: 'application/json;odata=nometadata',
        'OData-Version': '4.0',
      },
    });
  return { webUrl, fetch: fetchImpl };
}

/**
 * Build the initial REST URL for a list-items query.
 *
 * Composes `$select`, optional `$filter`, optional `$orderby`, and
 * `$top`. The result is an absolute URL ready for `SPHttpClient.get`.
 */
function buildItemsUrl(args: {
  webUrl: string;
  listTitle: string;
  select: readonly string[];
  filter?: string;
  orderBy?: { field: string; ascending: boolean };
  top: number;
}): string {
  const { webUrl, listTitle, select, filter, orderBy, top } = args;
  const params: string[] = [];
  if (select.length > 0) {
    params.push(`$select=${encodeURIComponent(select.join(','))}`);
  }
  if (filter && filter.length > 0) {
    params.push(`$filter=${encodeURIComponent(filter)}`);
  }
  if (orderBy && orderBy.field.length > 0) {
    params.push(
      `$orderby=${encodeURIComponent(`${orderBy.field} ${orderBy.ascending ? 'asc' : 'desc'}`)}`,
    );
  }
  params.push(`$top=${top}`);
  const qs = params.join('&');
  const encodedTitle = encodeURIComponent(listTitle).replace(/'/g, "''");
  return `${webUrl}/_api/web/lists/getByTitle('${encodedTitle}')/items?${qs}`;
}

interface IListItemsPage<T> {
  rows: T[];
  /** Absolute URL of the next page, or null when the dataset is exhausted. */
  nextLink: string | null;
}

/**
 * Fetch a single page of list items via `SPHttpClient`, parsing both
 * the modern (`value` / `odata.nextLink`) and verbose
 * (`d.results` / `d.__next`) response shapes. Returning the raw
 * `nextLink` lets the drain follow continuation tokens explicitly.
 */
async function fetchItemsPage<T>(
  requester: ISpfxRequester,
  url: string,
): Promise<IListItemsPage<T>> {
  const response = await requester.fetch(url);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Project Sites repository: ${response.status} ${response.statusText} fetching ${url}` +
        (body ? ` — ${body.slice(0, 200)}` : ''),
    );
  }
  const json = await response.json();
  const value: T[] = Array.isArray(json?.value)
    ? json.value
    : Array.isArray(json?.d?.results)
    ? json.d.results
    : [];
  const nextLinkRaw =
    typeof json?.['odata.nextLink'] === 'string'
      ? json['odata.nextLink']
      : typeof json?.d?.__next === 'string'
      ? json.d.__next
      : null;
  return {
    rows: value,
    nextLink: nextLinkRaw && nextLinkRaw.length > 0 ? nextLinkRaw : null,
  };
}

/**
 * Drain a list-items query by following SharePoint's `__next`
 * continuation token until either the dataset is exhausted or the
 * defense-in-depth ceiling halts the fetch.
 *
 * Returns `bounded: true` only when the ceiling is the stop reason —
 * landing exactly on the ceiling with no more pages remaining is still
 * `bounded: false` (truthful: we drained the dataset).
 */
async function drainAllItems<T>(
  requester: ISpfxRequester,
  initialUrl: string,
  ceiling: number,
): Promise<{ rows: T[]; bounded: boolean }> {
  const rows: T[] = [];
  let url: string | null = initialUrl;
  // Hard cap on the number of paged requests we'll issue, just in case
  // SharePoint produces a continuation cycle. The floor of 64 keeps
  // legitimate small-ceiling tests and unusual low-item-per-page
  // responses well under the safety net; the per-page computation
  // covers production-sized drains.
  const maxRequests = Math.max(64, Math.ceil(ceiling / PROJECT_SITES_PAGE_SIZE) + 2);
  let requestsMade = 0;
  while (url) {
    if (requestsMade >= maxRequests) {
      // Hit our own request-count safety net before the data ceiling.
      // Treat as a bounded result so the UI surfaces an honest signal.
      return { rows, bounded: true };
    }
    const page: IListItemsPage<T> = await fetchItemsPage<T>(requester, url);
    requestsMade += 1;
    if (page.rows.length > 0) {
      rows.push(...page.rows);
    }
    if (rows.length > ceiling) {
      rows.length = ceiling;
      return { rows, bounded: true };
    }
    url = page.nextLink;
  }
  return { rows, bounded: false };
}

class SharePointProjectSitesRepository implements IProjectSitesRepository {
  async fetchDistinctYears(): Promise<number[]> {
    const requester = getSpfxRequester();

    // Year discovery is fallback-inclusive: the Filter-by-Year dropdown
    // should offer every year that has addressable inventory — Projects
    // list rows *or* approved legacy fallback registry rows. Both are
    // drained in parallel so latency stays off the critical path.
    const projectsUrl = buildItemsUrl({
      webUrl: requester.webUrl,
      listTitle: PROJECTS_LIST_TITLE,
      select: [SP_PROJECTS_FIELDS.YEAR],
      top: PROJECT_SITES_PAGE_SIZE,
    });
    const registryUrl = buildItemsUrl({
      webUrl: requester.webUrl,
      listTitle: LEGACY_FALLBACK_REGISTRY_LIST_TITLE,
      select: [LEGACY_FALLBACK_REGISTRY_FIELD.LEGACY_YEAR],
      filter: `IsActive eq 1 and MatchStatus eq 'matched'`,
      top: PROJECT_SITES_PAGE_SIZE,
    });

    const [projectDrain, registryDrain] = await Promise.all([
      drainAllItems<IRawProjectSiteItem>(requester, projectsUrl, PROJECT_SITES_ALL_SCOPE_CEILING),
      drainAllItems<Record<string, unknown>>(requester, registryUrl, PROJECT_SITES_ALL_SCOPE_CEILING),
    ]);

    const years = new Set<number>();
    for (const item of projectDrain.rows) {
      const raw = item[SP_PROJECTS_FIELDS.YEAR];
      if (typeof raw === 'number' && isValidYear(raw)) years.add(raw);
    }
    for (const item of registryDrain.rows) {
      const raw = item[LEGACY_FALLBACK_REGISTRY_FIELD.LEGACY_YEAR];
      const parsed =
        typeof raw === 'number' ? raw : Number.parseInt(String(raw ?? ''), 10);
      if (Number.isInteger(parsed) && isValidYear(parsed)) years.add(parsed);
    }

    return Array.from(years).sort((a, b) => b - a);
  }

  async fetchProjectSites(scope: ProjectSitesScope): Promise<IProjectSitesQueryResult> {
    const requester = getSpfxRequester();

    const projectsUrl = buildItemsUrl({
      webUrl: requester.webUrl,
      listTitle: PROJECTS_LIST_TITLE,
      select: PROJECT_SITES_SELECT_FIELDS,
      filter: scope.kind === 'year' ? `${SP_PROJECTS_FIELDS.YEAR} eq ${scope.year}` : undefined,
      orderBy: scope.kind === 'all' ? { field: SP_PROJECTS_FIELDS.YEAR, ascending: false } : undefined,
      top: PROJECT_SITES_PAGE_SIZE,
    });

    const projectDrain = await drainAllItems<IRawProjectSiteItem>(
      requester,
      projectsUrl,
      PROJECT_SITES_ALL_SCOPE_CEILING,
    );

    // The registry-side fetch is keyed on `LegacyYear`. For year-scoped
    // queries we fetch exactly that year; for All-Projects scope we
    // fetch one batch per year present in the drained project rows.
    // The resolver handles synthetic legacy-only emission.
    const years = scope.kind === 'year'
      ? [scope.year]
      : Array.from(
          new Set(
            projectDrain.rows
              .map((item) => item[SP_PROJECTS_FIELDS.YEAR])
              .filter((year): year is number => typeof year === 'number' && Number.isInteger(year)),
          ),
        );

    const fallbackRowGroups = years.length > 0
      ? await Promise.all(
          years.map(async (year) => {
            const url = buildItemsUrl({
              webUrl: requester.webUrl,
              listTitle: LEGACY_FALLBACK_REGISTRY_LIST_TITLE,
              select: LEGACY_FALLBACK_REGISTRY_SELECT_FIELDS,
              filter: `IsActive eq 1 and MatchStatus eq 'matched' and LegacyYear eq ${year}`,
              top: PROJECT_SITES_PAGE_SIZE,
            });
            const drain = await drainAllItems<IRawLegacyFallbackRegistryItem>(
              requester,
              url,
              PROJECT_SITES_ALL_SCOPE_CEILING,
            );
            return drain.rows;
          }),
        )
      : [];

    const fallbackCandidates = toCandidates(fallbackRowGroups.flat());
    return {
      projectRows: projectDrain.rows,
      fallbackCandidates,
      bounded: projectDrain.bounded,
      fetchedCount: projectDrain.rows.length,
    };
  }
}

let repositorySingleton: IProjectSitesRepository | null = null;

export function getProjectSitesRepository(): IProjectSitesRepository {
  if (!repositorySingleton) {
    repositorySingleton = new SharePointProjectSitesRepository();
  }
  return repositorySingleton;
}

export function setProjectSitesRepositoryForTests(repo: IProjectSitesRepository | null): void {
  repositorySingleton = repo;
}

// Exported for unit testing — exposes the URL builder and the drain
// helper so tests can assert query composition and pagination behavior
// without a SharePoint context.
export const __buildItemsUrlForTests = buildItemsUrl;
export const __drainAllItemsForTests = drainAllItems;
