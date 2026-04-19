import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { getSpfxContext } from '@hbc/auth/spfx';
import type { IRawProjectSiteItem, ProjectSitesScope } from '../types.js';
import {
  PROJECT_SITES_ALL_SCOPE_LIMIT,
  PROJECT_SITES_FALLBACK_FIELDS,
  PROJECT_SITES_SELECT_FIELDS,
  SP_PROJECTS_FIELDS,
  isValidYear,
} from '../types.js';
import type {
  ILegacyFallbackRegistryCandidate,
  IRawLegacyFallbackRegistryItem,
} from './legacyFallbackRegistryAdapter.js';
import {
  LEGACY_FALLBACK_REGISTRY_LIST_TITLE,
  LEGACY_FALLBACK_REGISTRY_SELECT_FIELDS,
  buildLegacyFallbackLookup,
  buildLegacyFallbackLookupKey,
} from './legacyFallbackRegistryAdapter.js';

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
  fetchProjectSites(scope: ProjectSitesScope): Promise<IRawProjectSiteItem[]>;
}

function trimString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseTitleProjectNumber(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return '';
  const separators = [' — ', ' – ', ' - '];
  for (const sep of separators) {
    const idx = trimmed.indexOf(sep);
    if (idx > 0) {
      return trimmed.substring(0, idx).trim();
    }
  }
  return '';
}

function applyFallbackLookup(
  projectRows: IRawProjectSiteItem[],
  lookup: Map<string, ILegacyFallbackRegistryCandidate>,
): IRawProjectSiteItem[] {
  return projectRows.map((row) => {
    const titleFallback = parseTitleProjectNumber(trimString(row[SP_PROJECTS_FIELDS.TITLE]));
    const projectNumber = trimString(row[SP_PROJECTS_FIELDS.PROJECT_NUMBER] ?? row.ProjectNumber) || titleFallback;
    const yearRaw = row[SP_PROJECTS_FIELDS.YEAR];
    const year = typeof yearRaw === 'number' ? yearRaw : Number.parseInt(String(yearRaw ?? ''), 10);
    const key = buildLegacyFallbackLookupKey(projectNumber, year);
    const fallback = lookup.get(key);

    if (!fallback) {
      return {
        ...row,
        [PROJECT_SITES_FALLBACK_FIELDS.LEGACY_FALLBACK_FOLDER_URL]: '',
        [PROJECT_SITES_FALLBACK_FIELDS.LEGACY_FALLBACK_SOURCE_YEAR]: null,
        [PROJECT_SITES_FALLBACK_FIELDS.LEGACY_FALLBACK_MATCH_STATUS]: '',
      };
    }

    return {
      ...row,
      [PROJECT_SITES_FALLBACK_FIELDS.LEGACY_FALLBACK_FOLDER_URL]: fallback.folderWebUrl,
      [PROJECT_SITES_FALLBACK_FIELDS.LEGACY_FALLBACK_SOURCE_YEAR]: fallback.legacyYear,
      [PROJECT_SITES_FALLBACK_FIELDS.LEGACY_FALLBACK_MATCH_STATUS]: fallback.matchStatus,
    };
  });
}

class SharePointProjectSitesRepository implements IProjectSitesRepository {
  async fetchDistinctYears(): Promise<number[]> {
    const context = getSpfxContext();
    const sp = spfi().using(SPFx(context));

    const items = await sp.web.lists
      .getByTitle(PROJECTS_LIST_TITLE)
      .items.select(SP_PROJECTS_FIELDS.YEAR)
      .top(PROJECT_SITES_ALL_SCOPE_LIMIT)();

    const years = new Set<number>();
    for (const item of items as IRawProjectSiteItem[]) {
      const raw = item[SP_PROJECTS_FIELDS.YEAR];
      if (typeof raw === 'number' && isValidYear(raw)) {
        years.add(raw);
      }
    }

    return Array.from(years).sort((a, b) => b - a);
  }

  async fetchProjectSites(scope: ProjectSitesScope): Promise<IRawProjectSiteItem[]> {
    const context = getSpfxContext();
    const sp = spfi().using(SPFx(context));

    const listItems = sp.web.lists
      .getByTitle(PROJECTS_LIST_TITLE)
      .items
      .select(...PROJECT_SITES_SELECT_FIELDS);

    const projectItems = scope.kind === 'year'
      ? (await listItems
          .filter(`${SP_PROJECTS_FIELDS.YEAR} eq ${scope.year}`)()) as IRawProjectSiteItem[]
      : (await listItems
          .orderBy(SP_PROJECTS_FIELDS.YEAR, false)
          .top(PROJECT_SITES_ALL_SCOPE_LIMIT)()) as IRawProjectSiteItem[];

    if (projectItems.length === 0) {
      return projectItems;
    }

    const years = scope.kind === 'year'
      ? [scope.year]
      : Array.from(
          new Set(
            projectItems
              .map((item) => item[SP_PROJECTS_FIELDS.YEAR])
              .filter((year): year is number => typeof year === 'number' && Number.isInteger(year)),
          ),
        );

    const fallbackRows = await Promise.all(
      years.map(async (year) => {
        const rows = await sp.web.lists
          .getByTitle(LEGACY_FALLBACK_REGISTRY_LIST_TITLE)
          .items
          .select(...LEGACY_FALLBACK_REGISTRY_SELECT_FIELDS)
          .filter(`IsActive eq 1 and MatchStatus eq 'matched' and LegacyYear eq ${year}`)
          .top(PROJECT_SITES_ALL_SCOPE_LIMIT)();
        return rows as IRawLegacyFallbackRegistryItem[];
      }),
    );

    const fallbackLookup = buildLegacyFallbackLookup(fallbackRows.flat());
    return applyFallbackLookup(projectItems, fallbackLookup);
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
