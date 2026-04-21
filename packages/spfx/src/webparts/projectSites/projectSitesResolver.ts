/**
 * Merged-source resolver for Project Sites.
 *
 * Owns the authoritative join between the Projects list and the Legacy
 * Project Fallback Registry, including source classification, linkage
 * preference, synthetic legacy-only emission, duplicate suppression, and
 * resolved launch-target selection. The repository produces raw inputs;
 * the resolver is the single seam that emits UI-ready `IProjectSiteEntry`
 * records regardless of origin.
 *
 * Precedence rules (applied in order, all deterministic):
 *   1. Strong linkage — a fallback candidate with
 *      `matchedProjectListItemId` equal to a project row's `Id` outranks
 *      any heuristic match for that project.
 *   2. Heuristic linkage — fallback candidate matched to a project row by
 *      `projectNumber::legacyYear`.
 *   3. Synthetic legacy-only — registry candidate not claimed by any
 *      project row, emitted as a `legacy-only` entry.
 *
 * Duplicate suppression: entries are keyed by `recordKey`; on collision
 * the first-seen entry wins. Project-anchored entries are processed
 * before synthetic entries, so a project-anchored record always outranks
 * a synthetic one addressed at the same key.
 *
 * Determinism: when multiple candidates compete for the same linkage key
 * (either strong or heuristic), `pickBestLegacyFallbackCandidate` selects
 * by `lastValidatedUtc`, then `lastSeenUtc`, then registry row id.
 */
import type {
  IProjectSiteEntry,
  IProjectSiteDataQuality,
  IRawProjectSiteItem,
  ProjectSiteDataIssueCode,
} from './types.js';
import {
  SP_PROJECTS_FIELDS,
  isValidYear,
} from './types.js';
import { deriveProjectSiteLaunchStatus } from './projectSiteLaunchState.js';
import { normalizeProjectSiteEntry } from './normalizeProjectSiteEntry.js';
import {
  buildLegacyRegistryKey,
  buildProjectSiteRecordKey,
} from './projectSiteRecordKey.js';
import type { ILegacyFallbackRegistryCandidate } from './repository/legacyFallbackRegistryAdapter.js';
import { pickBestLegacyFallbackCandidate } from './repository/legacyFallbackRegistryAdapter.js';

export interface IProjectSitesQueryResult {
  projectRows: IRawProjectSiteItem[];
  fallbackCandidates: ILegacyFallbackRegistryCandidate[];
  /**
   * True when the repository hit the safety ceiling before exhausting
   * the eligible Projects-list dataset. Distinct from "no results" —
   * `bounded` means the fetch was deliberately stopped, not that the
   * underlying inventory is empty. Optional so legacy merge-only test
   * fixtures continue to compile; the repository always sets it.
   */
  bounded?: boolean;
  /**
   * Number of raw Projects-list rows fetched from SharePoint. Mirrors
   * `projectRows.length` so the field travels with the query result
   * through hooks without re-derivation. Optional in the contract so
   * legacy merge-only test fixtures continue to compile.
   */
  fetchedCount?: number;
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
    if (idx > 0) return trimmed.substring(0, idx).trim();
  }
  return '';
}

function buildHeuristicKey(projectNumber: string, legacyYear: number): string {
  return `${projectNumber}::${legacyYear}`;
}

/**
 * Group candidates by a key, selecting one winner per group via
 * `pickBestLegacyFallbackCandidate`. Null/empty keys are skipped.
 */
function groupBestByKey<K>(
  candidates: readonly ILegacyFallbackRegistryCandidate[],
  keyFor: (c: ILegacyFallbackRegistryCandidate) => K | null,
): Map<K, ILegacyFallbackRegistryCandidate> {
  const buckets = new Map<K, ILegacyFallbackRegistryCandidate[]>();
  for (const c of candidates) {
    const key = keyFor(c);
    if (key === null) continue;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(c);
    else buckets.set(key, [c]);
  }
  const winners = new Map<K, ILegacyFallbackRegistryCandidate>();
  for (const [key, bucket] of buckets) {
    const best = pickBestLegacyFallbackCandidate(bucket);
    if (best) winners.set(key, best);
  }
  return winners;
}

function buildSyntheticLegacyEntry(
  candidate: ILegacyFallbackRegistryCandidate,
): IProjectSiteEntry {
  const discoveredName = candidate.matchedProjectTitle || candidate.projectNameRaw;
  const projectName = discoveredName || `(Legacy Project) ${candidate.projectNumber}`;
  const yearValid = isValidYear(candidate.legacyYear);

  const issues: ProjectSiteDataIssueCode[] = [];
  if (!discoveredName) issues.push('missing-project-name');
  if (!yearValid) issues.push('invalid-year');

  const dataQuality: IProjectSiteDataQuality = {
    classification:
      issues.length === 0 ? 'complete' : (issues.includes('invalid-year') ? 'malformed' : 'partial'),
    issues,
    hasAnyIssue: issues.length > 0,
    hasLaunchCriticalIssue:
      issues.includes('missing-project-name') || issues.includes('invalid-year'),
  };

  const launchStatus = deriveProjectSiteLaunchStatus({
    hasPrimarySiteUrl: false,
    hasLegacyFallbackFolderUrl: true,
    launchTargetKind: 'legacy-fallback',
    projectStage: '',
    dataQuality,
  });

  const registryKey = buildLegacyRegistryKey(candidate.projectNumber, candidate.legacyYear);
  const recordKey =
    buildProjectSiteRecordKey('legacy', {
      projectsListId: null,
      projectNumber: candidate.projectNumber,
      year: candidate.legacyYear,
    }) || `legacy:${candidate.projectNumber}:${candidate.legacyYear}`;

  return {
    recordKey,
    id: 0,
    sourceClassification: 'legacy-only',
    sourceRefs: {
      projectsListId: null,
      legacyRegistryKey: registryKey || null,
      legacyRegistrySourceYear: candidate.legacyYear,
    },
    projectName,
    projectNumber: candidate.projectNumber,
    year: candidate.legacyYear,
    department: '',
    officeDivision: '',
    projectType: '',
    projectStage: '',
    clientName: '',
    projectLocation: '',
    projectStreetAddress: '',
    projectCity: '',
    projectCounty: '',
    projectState: '',
    projectZip: '',
    projectExecutiveUpn: '',
    projectManagerUpn: '',
    leadEstimatorUpn: '',
    supportingEstimatorUpns: [],
    procoreProject: '',
    primarySiteUrl: '',
    legacyFallbackFolderUrl: candidate.folderWebUrl,
    legacyFallbackSourceYear: candidate.legacyYear,
    legacyFallbackMatchStatus: 'matched',
    launchTargetKind: 'legacy-fallback',
    siteUrl: candidate.folderWebUrl,
    hasSiteUrl: true,
    dataQuality,
    launchStatus,
  };
}

function resolveProjectRowIdentity(row: IRawProjectSiteItem): {
  projectsListId: number;
  projectNumber: string;
  year: number;
} {
  const rawId = row.Id;
  const projectsListId = typeof rawId === 'number' ? rawId : 0;
  const title = trimString(row[SP_PROJECTS_FIELDS.TITLE]);
  const titleFallback = parseTitleProjectNumber(title);
  const projectNumber =
    trimString(row[SP_PROJECTS_FIELDS.PROJECT_NUMBER] ?? row.ProjectNumber) || titleFallback;
  const yearRaw = row[SP_PROJECTS_FIELDS.YEAR];
  const year =
    typeof yearRaw === 'number' ? yearRaw : Number.parseInt(String(yearRaw ?? ''), 10);
  return { projectsListId, projectNumber, year };
}

/**
 * Resolve raw Projects list rows and registry candidates into the merged,
 * UI-ready record set. Pure function — safe for unit tests without any
 * SharePoint or React Query environment.
 */
export function resolveProjectSiteEntries(
  input: IProjectSitesQueryResult,
): IProjectSiteEntry[] {
  const { projectRows, fallbackCandidates } = input;

  const strongLinkage = groupBestByKey(fallbackCandidates, (c) =>
    c.matchedProjectListItemId !== null && c.matchedProjectListItemId > 0
      ? c.matchedProjectListItemId
      : null,
  );
  const heuristicLinkage = groupBestByKey(fallbackCandidates, (c) => {
    if (!c.projectNumber || !Number.isInteger(c.legacyYear)) return null;
    return buildHeuristicKey(c.projectNumber, c.legacyYear);
  });

  const consumedCandidateIds = new Set<number>();
  const emitted: IProjectSiteEntry[] = [];
  const seenKeys = new Set<string>();

  for (const row of projectRows) {
    const { projectsListId, projectNumber, year } = resolveProjectRowIdentity(row);

    let chosen: ILegacyFallbackRegistryCandidate | null = null;
    let strongMatch = false;

    if (projectsListId > 0) {
      const strong = strongLinkage.get(projectsListId);
      if (strong) {
        chosen = strong;
        strongMatch = true;
      }
    }
    if (!chosen && projectNumber && Number.isInteger(year)) {
      chosen = heuristicLinkage.get(buildHeuristicKey(projectNumber, year)) ?? null;
    }

    if (chosen) consumedCandidateIds.add(chosen.id);

    // For strong-linkage matches, preserve the registry row's own
    // (projectNumber, legacyYear) in sourceRefs so downstream linkage
    // diagnostics remain accurate even when those differ from the
    // project's own values.
    const registryKeyOverride =
      chosen && strongMatch
        ? buildLegacyRegistryKey(chosen.projectNumber, chosen.legacyYear) || null
        : null;

    const entry = normalizeProjectSiteEntry(row, {
      candidate: chosen,
      registryKeyOverride,
    });

    if (!seenKeys.has(entry.recordKey)) {
      seenKeys.add(entry.recordKey);
      emitted.push(entry);
    }
  }

  for (const candidate of fallbackCandidates) {
    if (consumedCandidateIds.has(candidate.id)) continue;
    const synthetic = buildSyntheticLegacyEntry(candidate);
    if (seenKeys.has(synthetic.recordKey)) continue;
    seenKeys.add(synthetic.recordKey);
    emitted.push(synthetic);
  }

  return emitted;
}
