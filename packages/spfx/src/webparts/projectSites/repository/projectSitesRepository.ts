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
 * The explicit `PROJECT_SITES_SELECT_FIELDS` and adapter-owned
 * `LEGACY_FALLBACK_REGISTRY_SELECT_FIELDS` keep the SP-side read surface
 * intentional. The re-exports below preserve import compatibility for
 * callers that historically pulled adapter helpers from this module.
 */
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { getSpfxContext } from '@hbc/auth/spfx';
import type { IRawProjectSiteItem, ProjectSitesScope } from '../types.js';
import {
  PROJECT_SITES_ALL_SCOPE_LIMIT,
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

class SharePointProjectSitesRepository implements IProjectSitesRepository {
  async fetchDistinctYears(): Promise<number[]> {
    const context = getSpfxContext();
    const sp = spfi().using(SPFx(context));

    // Year discovery is fallback-inclusive: the Filter-by-Year dropdown
    // should offer every year that has addressable inventory — Projects
    // list rows *or* approved legacy fallback registry rows. Fetching
    // both in parallel keeps latency off the critical path.
    const [projectRows, registryRows] = await Promise.all([
      sp.web.lists
        .getByTitle(PROJECTS_LIST_TITLE)
        .items.select(SP_PROJECTS_FIELDS.YEAR)
        .top(PROJECT_SITES_ALL_SCOPE_LIMIT)() as Promise<IRawProjectSiteItem[]>,
      sp.web.lists
        .getByTitle(LEGACY_FALLBACK_REGISTRY_LIST_TITLE)
        .items
        .select(LEGACY_FALLBACK_REGISTRY_FIELD.LEGACY_YEAR)
        .filter(`IsActive eq 1 and MatchStatus eq 'matched'`)
        .top(PROJECT_SITES_ALL_SCOPE_LIMIT)() as Promise<Array<Record<string, unknown>>>,
    ]);

    const years = new Set<number>();
    for (const item of projectRows) {
      const raw = item[SP_PROJECTS_FIELDS.YEAR];
      if (typeof raw === 'number' && isValidYear(raw)) years.add(raw);
    }
    for (const item of registryRows) {
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

    const listItems = sp.web.lists
      .getByTitle(PROJECTS_LIST_TITLE)
      .items
      .select(...PROJECT_SITES_SELECT_FIELDS);

    const projectRows = scope.kind === 'year'
      ? (await listItems
          .filter(`${SP_PROJECTS_FIELDS.YEAR} eq ${scope.year}`)()) as IRawProjectSiteItem[]
      : (await listItems
          .orderBy(SP_PROJECTS_FIELDS.YEAR, false)
          .top(PROJECT_SITES_ALL_SCOPE_LIMIT)()) as IRawProjectSiteItem[];

    // The registry-side fetch is keyed on `LegacyYear`, which is how the
    // registry carries the legacy-source year even when no matching
    // project exists. For year-scoped queries we fetch exactly that year;
    // for All-Projects scope we scan the years present in the results
    // plus emit synthetic rows for every registry year we pulled — the
    // resolver handles legacy-only emission.
    const years = scope.kind === 'year'
      ? [scope.year]
      : Array.from(
          new Set(
            projectRows
              .map((item) => item[SP_PROJECTS_FIELDS.YEAR])
              .filter((year): year is number => typeof year === 'number' && Number.isInteger(year)),
          ),
        );

    const fallbackRowGroups = years.length > 0
      ? await Promise.all(
          years.map(async (year) => {
            const rows = await sp.web.lists
              .getByTitle(LEGACY_FALLBACK_REGISTRY_LIST_TITLE)
              .items
              .select(...LEGACY_FALLBACK_REGISTRY_SELECT_FIELDS)
              .filter(`IsActive eq 1 and MatchStatus eq 'matched' and LegacyYear eq ${year}`)
              .top(PROJECT_SITES_ALL_SCOPE_LIMIT)();
            return rows as IRawLegacyFallbackRegistryItem[];
          }),
        )
      : [];

    const fallbackCandidates = toCandidates(fallbackRowGroups.flat());
    return { projectRows, fallbackCandidates };
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
