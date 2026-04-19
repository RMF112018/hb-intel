/**
 * Consumer-side adapter for the Legacy Project Fallback Registry list.
 *
 * The backend owns the canonical list descriptor
 * (`backend/functions/src/services/legacy-fallback/list-descriptors.ts`).
 * This module is the SPFx consumer's intentional contract over that list:
 * it declares exactly which fields the Project Sites resolver is allowed to
 * depend on, typed in terms of the narrow shapes the consumer needs rather
 * than the full backend descriptor.
 *
 * Ownership:
 * - The set of selected fields is a deliberate resolver-authority choice,
 *   not an ad hoc subset. Do not broaden it without a resolver-level
 *   justification.
 * - Match-quality fields (`MatchStatus`, `MatchConfidence`, `MatchMethod`,
 *   `MatchedProjectListItemId`) are carried so the resolver can reason
 *   about linkage provenance — not for display.
 * - Nothing here depends on `@hbc/models`; the backend remains the single
 *   source of truth for the registry list definition.
 */

export const LEGACY_FALLBACK_REGISTRY_LIST_TITLE = 'Legacy Project Fallback Registry';

/**
 * Internal-name constants for the registry fields the consumer reads.
 * Mirrors the backend list descriptor's `internalName` values.
 */
export const LEGACY_FALLBACK_REGISTRY_FIELD = {
  ID: 'Id',
  PROJECT_NUMBER: 'ProjectNumber',
  PROJECT_NAME_RAW: 'ProjectNameRaw',
  LEGACY_YEAR: 'LegacyYear',
  FOLDER_WEB_URL: 'FolderWebUrl',
  MATCH_STATUS: 'MatchStatus',
  MATCH_CONFIDENCE: 'MatchConfidence',
  MATCH_METHOD: 'MatchMethod',
  MATCHED_PROJECT_LIST_ITEM_ID: 'MatchedProjectListItemId',
  MATCHED_PROJECT_TITLE: 'MatchedProjectTitle',
  LAST_VALIDATED_UTC: 'LastValidatedUtc',
  LAST_SEEN_UTC: 'LastSeenUtc',
  IS_ACTIVE: 'IsActive',
} as const;

/**
 * The intentional select-field set for registry reads. This is the full
 * set the resolver is permitted to depend on; adding fields here is a
 * contract-widening change, not a casual tweak.
 */
export const LEGACY_FALLBACK_REGISTRY_SELECT_FIELDS = [
  LEGACY_FALLBACK_REGISTRY_FIELD.ID,
  LEGACY_FALLBACK_REGISTRY_FIELD.PROJECT_NUMBER,
  LEGACY_FALLBACK_REGISTRY_FIELD.PROJECT_NAME_RAW,
  LEGACY_FALLBACK_REGISTRY_FIELD.LEGACY_YEAR,
  LEGACY_FALLBACK_REGISTRY_FIELD.FOLDER_WEB_URL,
  LEGACY_FALLBACK_REGISTRY_FIELD.MATCH_STATUS,
  LEGACY_FALLBACK_REGISTRY_FIELD.MATCH_CONFIDENCE,
  LEGACY_FALLBACK_REGISTRY_FIELD.MATCH_METHOD,
  LEGACY_FALLBACK_REGISTRY_FIELD.MATCHED_PROJECT_LIST_ITEM_ID,
  LEGACY_FALLBACK_REGISTRY_FIELD.MATCHED_PROJECT_TITLE,
  LEGACY_FALLBACK_REGISTRY_FIELD.LAST_VALIDATED_UTC,
  LEGACY_FALLBACK_REGISTRY_FIELD.LAST_SEEN_UTC,
] as const;

/**
 * Consumer-local mirror of the backend match-status choice set. Declared
 * here to avoid a cross-package runtime dependency on `@hbc/models`; kept
 * narrow and only expanded when the resolver actually needs a new value.
 */
export type LegacyFallbackMatchStatus =
  | 'matched'
  | 'unmatched'
  | 'review-required'
  | 'ignored'
  | 'disabled';

export type LegacyFallbackMatchConfidence = 'high' | 'medium' | 'low' | 'none';

export type LegacyFallbackMatchMethod =
  | 'project-number-exact'
  | 'normalized-title-year'
  | 'manual-bind'
  | 'manual-override'
  | 'no-match';

const MATCH_STATUS_VALUES: readonly LegacyFallbackMatchStatus[] = [
  'matched',
  'unmatched',
  'review-required',
  'ignored',
  'disabled',
];

const MATCH_CONFIDENCE_VALUES: readonly LegacyFallbackMatchConfidence[] = [
  'high',
  'medium',
  'low',
  'none',
];

const MATCH_METHOD_VALUES: readonly LegacyFallbackMatchMethod[] = [
  'project-number-exact',
  'normalized-title-year',
  'manual-bind',
  'manual-override',
  'no-match',
];

/**
 * Raw, untyped shape of a registry list row as returned by PnPjs.
 * Fields are `unknown` because SharePoint may return strings, objects
 * (for URL/Hyperlink columns), numbers, or null — the adapter narrows
 * these into a resolver-friendly candidate.
 */
export interface IRawLegacyFallbackRegistryItem {
  Id: number;
  ProjectNumber?: unknown;
  ProjectNameRaw?: unknown;
  LegacyYear?: unknown;
  FolderWebUrl?: unknown;
  MatchStatus?: unknown;
  MatchConfidence?: unknown;
  MatchMethod?: unknown;
  MatchedProjectListItemId?: unknown;
  MatchedProjectTitle?: unknown;
  LastValidatedUtc?: unknown;
  LastSeenUtc?: unknown;
}

/**
 * Adapted registry row the resolver consumes. Only `matched` rows are
 * produced by `toLegacyFallbackCandidate` — the resolver does not need to
 * reason about other match states, so they are filtered out at the seam.
 */
export interface ILegacyFallbackRegistryCandidate {
  id: number;
  projectNumber: string;
  /** Raw project name discovered in the legacy folder. Empty when absent. */
  projectNameRaw: string;
  legacyYear: number;
  folderWebUrl: string;
  matchStatus: 'matched';
  /** `null` when the registry row is not linked to a Projects list row. */
  matchedProjectListItemId: number | null;
  /** Title of the linked Projects list row when present, else empty. */
  matchedProjectTitle: string;
  /** `null` when the registry omitted a confidence value. */
  matchConfidence: LegacyFallbackMatchConfidence | null;
  /** `null` when the registry omitted a match-method value. */
  matchMethod: LegacyFallbackMatchMethod | null;
  lastValidatedUtc: string;
  lastSeenUtc: string;
}

function trimString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function extractUrl(value: unknown): string {
  if (typeof value === 'string') return value.trim();
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

function parseOptionalInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!/^-?\d+$/.test(trimmed)) return null;
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isInteger(parsed) ? parsed : null;
  }
  return null;
}

function parseMatchStatus(value: unknown): LegacyFallbackMatchStatus | null {
  const raw = trimString(value);
  return (MATCH_STATUS_VALUES as readonly string[]).includes(raw)
    ? (raw as LegacyFallbackMatchStatus)
    : null;
}

function parseMatchConfidence(value: unknown): LegacyFallbackMatchConfidence | null {
  const raw = trimString(value);
  return (MATCH_CONFIDENCE_VALUES as readonly string[]).includes(raw)
    ? (raw as LegacyFallbackMatchConfidence)
    : null;
}

function parseMatchMethod(value: unknown): LegacyFallbackMatchMethod | null {
  const raw = trimString(value);
  return (MATCH_METHOD_VALUES as readonly string[]).includes(raw)
    ? (raw as LegacyFallbackMatchMethod)
    : null;
}

/**
 * Narrow a raw registry row into a resolver-consumable candidate.
 *
 * Returns `null` when any of the resolver-critical fields fail
 * validation: missing project number, non-integer `LegacyYear`, a match
 * status other than `'matched'`, or a missing/non-HTTP folder URL.
 * Non-critical provenance fields (`MatchConfidence`, `MatchMethod`,
 * `MatchedProjectListItemId`) surface as `null` when absent rather than
 * failing the row.
 */
export function toLegacyFallbackCandidate(
  row: IRawLegacyFallbackRegistryItem,
): ILegacyFallbackRegistryCandidate | null {
  const projectNumber = trimString(row.ProjectNumber);
  const matchStatus = parseMatchStatus(row.MatchStatus);
  const folderWebUrl = extractUrl(row.FolderWebUrl);
  const legacyYear = parseOptionalInteger(row.LegacyYear);

  if (
    !projectNumber ||
    legacyYear === null ||
    matchStatus !== 'matched' ||
    !isHttpUrl(folderWebUrl)
  ) {
    return null;
  }

  return {
    id: parseOptionalInteger(row.Id) ?? 0,
    projectNumber,
    projectNameRaw: trimString(row.ProjectNameRaw),
    legacyYear,
    folderWebUrl,
    matchStatus: 'matched',
    matchedProjectListItemId: parseOptionalInteger(row.MatchedProjectListItemId),
    matchedProjectTitle: trimString(row.MatchedProjectTitle),
    matchConfidence: parseMatchConfidence(row.MatchConfidence),
    matchMethod: parseMatchMethod(row.MatchMethod),
    lastValidatedUtc: trimString(row.LastValidatedUtc),
    lastSeenUtc: trimString(row.LastSeenUtc),
  };
}

function toEpochMs(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Deterministically select the strongest candidate for a given
 * `(projectNumber, legacyYear)` group. Tiebreak order:
 *   1. Most recent `lastValidatedUtc`
 *   2. Most recent `lastSeenUtc`
 *   3. Highest SharePoint `id` (stable final tiebreaker)
 */
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

export function buildLegacyFallbackLookupKey(projectNumber: string, legacyYear: number): string {
  return `${projectNumber}::${legacyYear}`;
}

/**
 * Index registry rows by `(projectNumber, legacyYear)` with one winner per
 * key, applying `pickBestLegacyFallbackCandidate` for dedup.
 */
export function buildLegacyFallbackLookup(
  rows: readonly IRawLegacyFallbackRegistryItem[],
): Map<string, ILegacyFallbackRegistryCandidate> {
  const grouped = new Map<string, ILegacyFallbackRegistryCandidate[]>();

  for (const row of rows) {
    const candidate = toLegacyFallbackCandidate(row);
    if (!candidate) continue;

    const key = buildLegacyFallbackLookupKey(candidate.projectNumber, candidate.legacyYear);
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
    if (winner) resolved.set(key, winner);
  }

  return resolved;
}
