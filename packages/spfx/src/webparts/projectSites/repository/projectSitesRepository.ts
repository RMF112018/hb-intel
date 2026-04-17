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

const PROJECTS_LIST_TITLE = 'Projects';

export interface IProjectSitesRepository {
  fetchDistinctYears(): Promise<number[]>;
  fetchProjectSites(scope: ProjectSitesScope): Promise<IRawProjectSiteItem[]>;
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

    if (scope.kind === 'year') {
      const items = await listItems
        .filter(`${SP_PROJECTS_FIELDS.YEAR} eq ${scope.year}`)();
      return items as IRawProjectSiteItem[];
    }

    // Bounded and deterministic all-scope read:
    // - explicit field contract via $select
    // - hard cap to avoid unbounded list scans
    // - most recent-year-first ordering for credibility when near the cap
    const items = await listItems
      .orderBy(SP_PROJECTS_FIELDS.YEAR, false)
      .top(PROJECT_SITES_ALL_SCOPE_LIMIT)();
    return items as IRawProjectSiteItem[];
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
