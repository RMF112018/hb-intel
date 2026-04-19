/**
 * Stable merged-record identity for Project Sites entries.
 *
 * The Project Sites UI previously keyed records solely on the Projects list
 * numeric `Id`. That model cannot represent merged or legacy-only synthetic
 * rows. `recordKey` decouples the user-facing identity of a record from any
 * single source's primary key, so the UI, dedup, and filter seams can treat
 * records uniformly regardless of origin.
 *
 * Key formats:
 * - `project:{projectsListId}` — record whose identity is anchored in the
 *   Projects list row (both `project-only` and `merged` classifications).
 * - `legacy:{normalizedProjectNumber}:{year}` — synthetic record derived only
 *   from the legacy fallback registry (no Projects list row exists).
 */
import type { ProjectSiteSourceClassification } from './types.js';

export type ProjectSiteRecordKeySource = 'project' | 'legacy';

export interface IProjectSiteRecordKeyParts {
  projectsListId: number | null;
  projectNumber: string;
  year: number;
}

/**
 * Build a stable merged-record identity string from source refs.
 *
 * `source` selects the keying strategy. `project` keys require a positive
 * integer `projectsListId`; `legacy` keys require a non-empty
 * `projectNumber` and a finite `year`. Returns `''` when the required
 * parts are missing — callers should treat an empty result as a malformed
 * record and fall back to a stable alternate id if they must render it.
 */
export function buildProjectSiteRecordKey(
  source: ProjectSiteRecordKeySource,
  parts: IProjectSiteRecordKeyParts,
): string {
  if (source === 'project') {
    const id = parts.projectsListId;
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) return '';
    return `project:${id}`;
  }
  const number = normalizeLegacyProjectNumber(parts.projectNumber);
  if (!number) return '';
  if (!Number.isFinite(parts.year)) return '';
  return `legacy:${number}:${parts.year}`;
}

/**
 * Build a legacy registry key suitable for `sourceRefs.legacyRegistryKey`.
 * Mirrors the legacy portion of `buildProjectSiteRecordKey` without the
 * `legacy:` prefix so consumers can compare registry entries independently
 * of the merged record key format.
 */
export function buildLegacyRegistryKey(projectNumber: string, year: number | null): string {
  const number = normalizeLegacyProjectNumber(projectNumber);
  if (!number) return '';
  if (year === null || !Number.isFinite(year)) return '';
  return `${number}:${year}`;
}

/**
 * Map a source classification to the record-key source strategy. `merged`
 * and `project-only` both anchor on the Projects list row; `legacy-only`
 * anchors on the registry key.
 */
export function recordKeySourceFor(
  classification: ProjectSiteSourceClassification,
): ProjectSiteRecordKeySource {
  return classification === 'legacy-only' ? 'legacy' : 'project';
}

function normalizeLegacyProjectNumber(value: string): string {
  return value.trim().toLowerCase();
}
