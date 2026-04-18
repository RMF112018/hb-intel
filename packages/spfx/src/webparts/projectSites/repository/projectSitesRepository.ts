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

const PROJECTS_LIST_TITLE = 'Projects';
const LEGACY_FALLBACK_REGISTRY_LIST_TITLE = 'Legacy Project Fallback Registry';
const LEGACY_FALLBACK_SELECT_FIELDS = [
  'Id',
  'ProjectNumber',
  'LegacyYear',
  'FolderWebUrl',
  'LastValidatedUtc',
  'LastSeenUtc',
  'MatchStatus',
] as const;

interface IRawLegacyFallbackRegistryItem {
  Id: number;
  ProjectNumber?: unknown;
  LegacyYear?: unknown;
  FolderWebUrl?: unknown;
  LastValidatedUtc?: unknown;
  LastSeenUtc?: unknown;
  MatchStatus?: unknown;
}

interface ILegacyFallbackRegistryCandidate {
  id: number;
  projectNumber: string;
  legacyYear: number;
  folderWebUrl: string;
  matchStatus: 'matched';
  lastValidatedUtc: string;
  lastSeenUtc: string;
}

export interface IProjectSitesRepository {
  fetchDistinctYears(): Promise<number[]>;
  fetchProjectSites(scope: ProjectSitesScope): Promise<IRawProjectSiteItem[]>;
}

function trimString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function extractUrl(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.Url === 'string') return obj.Url.trim();
    if (typeof obj.url === 'string') return obj.url.trim();
    if (typeof obj.uri === 'string') return obj.uri.trim();
  }
  return '';
}

function isHttpUrl(value: string): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function toEpochMs(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
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

export function toLegacyFallbackCandidate(
  row: IRawLegacyFallbackRegistryItem,
): ILegacyFallbackRegistryCandidate | null {
  const projectNumber = trimString(row.ProjectNumber);
  const matchStatus = trimString(row.MatchStatus);
  const folderWebUrl = extractUrl(row.FolderWebUrl);
  const year = typeof row.LegacyYear === 'number' ? row.LegacyYear : Number.parseInt(String(row.LegacyYear ?? ''), 10);

  if (!projectNumber || !Number.isInteger(year) || matchStatus !== 'matched' || !isHttpUrl(folderWebUrl)) {
    return null;
  }

  return {
    id: typeof row.Id === 'number' ? row.Id : Number.parseInt(String(row.Id ?? ''), 10),
    projectNumber,
    legacyYear: year,
    folderWebUrl,
    matchStatus: 'matched',
    lastValidatedUtc: trimString(row.LastValidatedUtc),
    lastSeenUtc: trimString(row.LastSeenUtc),
  };
}

export function pickBestLegacyFallbackCandidate(
  candidates: readonly ILegacyFallbackRegistryCandidate[],
): ILegacyFallbackRegistryCandidate | null {
  if (candidates.length === 0) return null;

  return [...candidates].sort((a, b) => {
    const validatedDelta = toEpochMs(b.lastValidatedUtc) - toEpochMs(a.lastValidatedUtc);
    if (validatedDelta !== 0) return validatedDelta;
    const seenDelta = toEpochMs(b.lastSeenUtc) - toEpochMs(a.lastSeenUtc);
    if (seenDelta !== 0) return seenDelta;
    return b.id - a.id;
  })[0];
}

function buildFallbackLookupKey(projectNumber: string, legacyYear: number): string {
  return `${projectNumber}::${legacyYear}`;
}

export function buildLegacyFallbackLookup(
  rows: readonly IRawLegacyFallbackRegistryItem[],
): Map<string, ILegacyFallbackRegistryCandidate> {
  const grouped = new Map<string, ILegacyFallbackRegistryCandidate[]>();

  for (const row of rows) {
    const candidate = toLegacyFallbackCandidate(row);
    if (!candidate) continue;

    const key = buildFallbackLookupKey(candidate.projectNumber, candidate.legacyYear);
    const bucket = grouped.get(key);
    if (bucket) {
      bucket.push(candidate);
    } else {
      grouped.set(key, [candidate]);
    }
  }

  const resolved = new Map<string, ILegacyFallbackRegistryCandidate>();
  for (const [key, bucket] of grouped) {
    const winner = pickBestLegacyFallbackCandidate(bucket);
    if (winner) {
      resolved.set(key, winner);
    }
  }

  return resolved;
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
    const key = buildFallbackLookupKey(projectNumber, year);
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
          .select(...LEGACY_FALLBACK_SELECT_FIELDS)
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
