/**
 * SharePoint I/O seam for the Project Sites surface.
 *
 * This module is the **I/O layer only**: it fetches raw Projects list
 * rows and raw Legacy Project Fallback Registry rows via PnPjs, narrows
 * the registry rows into adapter candidates
 * (`legacyFallbackRegistryAdapter.ts`), and returns the pair as
 * `IProjectSitesQueryResult`. All merge, dedup, source-classification,
 * synthetic legacy-only emission, and launch-target resolution live in
 * `projectSitesResolver.ts` — this file does not join rows, does not
 * decide precedence, and does not construct `IProjectSiteEntry`.
 *
 * Retrieval contract (post-cap):
 *   - Year scope (`{ kind: 'year', year }`) and All-Projects scope
 *     (`{ kind: 'all' }`) both drain the eligible dataset via PnPjs
 *     async iteration with a per-request page size of
 *     `PROJECT_SITES_PAGE_SIZE` (5000 — SharePoint's max `$top`).
 *   - A defense-in-depth ceiling (`PROJECT_SITES_ALL_SCOPE_CEILING`)
 *     prevents runaway fetches; if hit, the result carries
 *     `bounded: true` so the UI can render an honest overflow notice.
 *   - The previous silent `.top(2000)` cap on All-Projects is removed —
 *     `All Projects` search is now truly full-scope within the ceiling.
 */
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
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
 * Drain a PnPjs `_Items` query via async iteration up to `ceiling` rows.
 *
 * PnPjs v4 exposes `[Symbol.asyncIterator]` on `_Items`, yielding one
 * page per iteration. We accumulate rows until either the iterator is
 * exhausted (the natural end of the dataset) or the ceiling is reached.
 * Returns `bounded: true` only when the ceiling actually halts the drain
 * — never as a soft signal.
 */
async function drainPaged<T>(
  source: AsyncIterable<T[]>,
  ceiling: number,
): Promise<{ rows: T[]; bounded: boolean }> {
  const rows: T[] = [];
  for await (const page of source) {
    if (Array.isArray(page) && page.length > 0) {
      rows.push(...page);
    }
    // Overflow (strictly past the ceiling) means the dataset is larger
    // than we're willing to hold client-side: trim and signal bounded.
    // Landing exactly on the ceiling is NOT overflow — if the iterator
    // has nothing else to yield we'll exit the loop naturally with
    // bounded=false, which is the truthful signal.
    if (rows.length > ceiling) {
      rows.length = ceiling;
      return { rows, bounded: true };
    }
  }
  return { rows, bounded: false };
}

class SharePointProjectSitesRepository implements IProjectSitesRepository {
  async fetchDistinctYears(): Promise<number[]> {
    const context = getSpfxContext();
    const sp = spfi().using(SPFx(context));

    // Year discovery is fallback-inclusive: the Filter-by-Year dropdown
    // should offer every year that has addressable inventory — Projects
    // list rows *or* approved legacy fallback registry rows. Both are
    // drained in parallel via paged iteration (year discovery would
    // otherwise miss every year populated by rows beyond the first page).
    const projectsItems = sp.web.lists
      .getByTitle(PROJECTS_LIST_TITLE)
      .items.select(SP_PROJECTS_FIELDS.YEAR)
      .top(PROJECT_SITES_PAGE_SIZE);

    const registryItems = sp.web.lists
      .getByTitle(LEGACY_FALLBACK_REGISTRY_LIST_TITLE)
      .items
      .select(LEGACY_FALLBACK_REGISTRY_FIELD.LEGACY_YEAR)
      .filter(`IsActive eq 1 and MatchStatus eq 'matched'`)
      .top(PROJECT_SITES_PAGE_SIZE);

    const [projectDrain, registryDrain] = await Promise.all([
      drainPaged<IRawProjectSiteItem>(
        projectsItems as unknown as AsyncIterable<IRawProjectSiteItem[]>,
        PROJECT_SITES_ALL_SCOPE_CEILING,
      ),
      drainPaged<Record<string, unknown>>(
        registryItems as unknown as AsyncIterable<Array<Record<string, unknown>>>,
        PROJECT_SITES_ALL_SCOPE_CEILING,
      ),
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
    const context = getSpfxContext();
    const sp = spfi().using(SPFx(context));

    const baseListItems = sp.web.lists
      .getByTitle(PROJECTS_LIST_TITLE)
      .items
      .select(...PROJECT_SITES_SELECT_FIELDS);

    const scopedItems = scope.kind === 'year'
      ? baseListItems.filter(`${SP_PROJECTS_FIELDS.YEAR} eq ${scope.year}`)
      : baseListItems.orderBy(SP_PROJECTS_FIELDS.YEAR, false);

    const projectDrain = await drainPaged<IRawProjectSiteItem>(
      scopedItems.top(PROJECT_SITES_PAGE_SIZE) as unknown as AsyncIterable<IRawProjectSiteItem[]>,
      PROJECT_SITES_ALL_SCOPE_CEILING,
    );

    // The registry-side fetch is keyed on `LegacyYear`. For year-scoped
    // queries we fetch exactly that year; for All-Projects scope we scan
    // every year present in the (now-fully-drained) project rows. The
    // resolver handles synthetic legacy-only emission.
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
            const registryItems = sp.web.lists
              .getByTitle(LEGACY_FALLBACK_REGISTRY_LIST_TITLE)
              .items
              .select(...LEGACY_FALLBACK_REGISTRY_SELECT_FIELDS)
              .filter(`IsActive eq 1 and MatchStatus eq 'matched' and LegacyYear eq ${year}`)
              .top(PROJECT_SITES_PAGE_SIZE);
            const drain = await drainPaged<IRawLegacyFallbackRegistryItem>(
              registryItems as unknown as AsyncIterable<IRawLegacyFallbackRegistryItem[]>,
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

// Exported for unit testing — drains a paged async iterable up to a
// ceiling and reports whether the ceiling was the stop reason.
export const __drainPagedForTests = drainPaged;
