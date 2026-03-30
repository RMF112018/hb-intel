/**
 * Centralized serialization/deserialization for the HBCentral Projects list.
 *
 * All domain ↔ SharePoint translation passes through this module.
 * No other file should reference `field_N` internal names directly.
 *
 * @see projects-list-contract.ts for the persistence DTO and field map
 * @see Phase-2_Normalization-Rules.md for type conversion rules
 */
import type { IProjectSetupRequest, ProjectSetupRequestState } from '@hbc/models';
import type { IProjectsListItem } from './projects-list-contract.js';
import { PROJECTS_LIST_FIELD_MAP } from './projects-list-contract.js';

// ─────────────────────────────────────────────────────────────────────────────
// Field resolution — for filter/query strings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the SharePoint internal name for a domain property.
 * Use this in `.filter()` and `.select()` calls instead of hardcoding `field_N`.
 *
 * @throws if the domain property has no SP mapping
 */
export function resolveSpField(domainProp: keyof typeof PROJECTS_LIST_FIELD_MAP): string {
  const entry = PROJECTS_LIST_FIELD_MAP[domainProp];
  if (!entry) {
    throw new Error(`[projects-list-mapper] No SP field mapping for domain property '${domainProp as string}'`);
  }
  return entry.spInternalName;
}

// ─────────────────────────────────────────────────────────────────────────────
// SharePoint → Domain (read path)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a raw SharePoint list item to an `IProjectSetupRequest` domain object.
 *
 * Applies normalization rules from Phase-2_Normalization-Rules.md:
 * - Numeric `0` in string-typed Number columns → `undefined`
 * - JSON array columns → parsed with `safeParseJsonArray`
 * - Missing optional fields → `undefined`
 * - Missing required fields → documented defaults
 */
export function toDomain(item: Record<string, unknown>): IProjectSetupRequest {
  const projectId = readString(item, 'field_1');
  return {
    requestId: projectId,
    projectId,
    projectName: readString(item, 'field_3'),
    projectLocation: readString(item, 'field_4'),
    projectType: readString(item, 'field_5'),
    projectStage: (readString(item, 'field_6') || 'Pursuit') as IProjectSetupRequest['projectStage'],
    submittedBy: readString(item, 'field_7'),
    submittedAt: readStringFromNumber(item, 'field_8') || new Date().toISOString(),
    state: (readString(item, 'field_9') || 'Submitted') as ProjectSetupRequestState,
    projectNumber: readOptionalString(item, 'field_2'),
    groupMembers: safeParseJsonArray(item.field_10),
    groupLeaders: safeParseJsonArray(item.field_11) as string[] | undefined,
    department: readOptionalString(item, 'field_12') as IProjectSetupRequest['department'],
    estimatedValue: readOptionalNumber(item, 'field_13'),
    clientName: readOptionalString(item, 'field_14'),
    startDate: readOptionalStringFromNumber(item, 'field_15'),
    contractType: readOptionalString(item, 'field_16'),
    projectLeadId: readOptionalString(item, 'field_17'),
    viewerUPNs: safeParseJsonArray(item.field_18) as string[] | undefined,
    addOns: safeParseJsonArray(item.field_19) as string[] | undefined,
    clarificationNote: readOptionalStringFromNumber(item, 'field_20'),
    completedBy: readOptionalStringFromNumber(item, 'field_21'),
    completedAt: readOptionalStringFromNumber(item, 'field_22'),
    siteUrl: readOptionalString(item, 'field_23'),
    retryCount: typeof item.field_24 === 'number' ? item.field_24 : 0,
    year: readOptionalNumber(item, 'Year'),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Domain → SharePoint (write path)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert an `IProjectSetupRequest` domain object to a SharePoint list item payload.
 *
 * Only mapped fields are included. Unmapped domain properties (e.g.
 * `projectStreetAddress`, `projectExecutiveUpn`) are intentionally excluded.
 */
export function toListItem(request: IProjectSetupRequest): IProjectsListItem {
  const projectNumberForTitle = request.projectNumber ?? 'TBD';
  return {
    Title: `${projectNumberForTitle} — ${request.projectName}`,
    field_1: request.requestId,
    field_2: request.projectNumber ?? '',
    field_3: request.projectName,
    field_4: request.projectLocation,
    field_5: request.projectType,
    field_6: request.projectStage,
    field_7: request.submittedBy,
    field_8: request.submittedAt,
    field_9: request.state,
    field_10: JSON.stringify(request.groupMembers),
    field_11: JSON.stringify(request.groupLeaders ?? []),
    field_12: request.department ?? '',
    field_13: request.estimatedValue ?? null,
    field_14: request.clientName ?? '',
    field_15: request.startDate ?? '',
    field_16: request.contractType ?? '',
    field_17: request.projectLeadId ?? '',
    field_18: JSON.stringify(request.viewerUPNs ?? []),
    field_19: JSON.stringify(request.addOns ?? []),
    field_20: request.clarificationNote ?? '',
    field_21: request.completedBy ?? '',
    field_22: request.completedAt ?? '',
    field_23: request.siteUrl ?? '',
    field_24: request.retryCount,
    Year: request.year ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Read helpers — normalization per Phase-2_Normalization-Rules.md
// ─────────────────────────────────────────────────────────────────────────────

/** Read a required string field. Returns `''` if missing. */
function readString(item: Record<string, unknown>, field: string): string {
  return (item[field] as string) ?? '';
}

/** Read an optional string field. Returns `undefined` for falsy values. */
function readOptionalString(item: Record<string, unknown>, field: string): string | undefined {
  return (item[field] as string) || undefined;
}

/**
 * Read a string value from an SP Number column.
 * SP may return a numeric value; `String()` converts it.
 * Returns the raw string — callers handle defaults.
 */
function readStringFromNumber(item: Record<string, unknown>, field: string): string {
  return String(item[field] ?? '');
}

/**
 * Read an optional string value from an SP Number column.
 * Filters numeric `0` → `undefined` (SP returns `0` for empty Number columns).
 */
function readOptionalStringFromNumber(item: Record<string, unknown>, field: string): string | undefined {
  const raw = item[field];
  if (raw === null || raw === undefined || raw === '' || raw === 0) return undefined;
  const str = String(raw);
  return str || undefined;
}

/** Read an optional number field. Returns `undefined` for non-numeric values. */
function readOptionalNumber(item: Record<string, unknown>, field: string): number | undefined {
  return typeof item[field] === 'number' ? (item[field] as number) : undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON array helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safely parse a JSON-serialized string array from a SharePoint MultiLineText field.
 * Returns `[]` on parse failure; filters out non-string elements.
 */
export function safeParseJsonArray(json: unknown): string[] {
  try {
    const parsed = JSON.parse((json as string) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
  } catch {
    return [];
  }
}
