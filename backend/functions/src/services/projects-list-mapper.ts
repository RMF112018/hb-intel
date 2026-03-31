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
import type { ILogger } from '../utils/logger.js';

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
// Runtime validation — schema drift and type-mismatch diagnostics
// ─────────────────────────────────────────────────────────────────────────────

/** Fields that must be present for a valid Projects list item. */
const CRITICAL_FIELDS: readonly string[] = ['field_1', 'field_3', 'field_9'];

/**
 * Validate a raw SP item and log structured warnings for schema issues.
 * Never throws — returns a list of diagnostic messages for testability.
 * Never logs PII — only field names, expected types, and actual types.
 */
export function validateSpItem(
  item: Record<string, unknown>,
  logger?: ILogger,
): string[] {
  const warnings: string[] = [];

  // Critical missing fields
  for (const field of CRITICAL_FIELDS) {
    if (item[field] === undefined || item[field] === null || item[field] === '') {
      const msg = `[field-contract] Critical field '${field}' is missing or empty`;
      warnings.push(msg);
      logger?.warn(msg, { domain: 'projects-list-mapper', field, issue: 'missing-critical-field' });
    }
  }

  // Type mismatches for Number-typed columns that should contain numbers
  const numberFields = ['field_13', 'field_24', 'Year'] as const;
  for (const field of numberFields) {
    const val = item[field];
    if (val !== undefined && val !== null && typeof val !== 'number') {
      const msg = `[field-contract] Field '${field}' expected number, got ${typeof val}`;
      warnings.push(msg);
      logger?.warn(msg, { domain: 'projects-list-mapper', field, expectedType: 'number', actualType: typeof val, issue: 'type-mismatch' });
    }
  }

  return warnings;
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
 *
 * Pass an `ILogger` to enable structured diagnostics for schema drift.
 * Without a logger, validation still runs but warnings are discarded.
 */
export function toDomain(item: Record<string, unknown>, logger?: ILogger): IProjectSetupRequest {
  validateSpItem(item, logger);
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
    groupMembers: safeParseJsonArray(item.field_10, 'field_10', logger),
    groupLeaders: safeParseJsonArray(item.field_11, 'field_11', logger) as string[] | undefined,
    department: readOptionalString(item, 'field_12') as IProjectSetupRequest['department'],
    estimatedValue: readOptionalNumber(item, 'field_13'),
    clientName: readOptionalString(item, 'field_14'),
    startDate: readOptionalStringFromNumber(item, 'field_15'),
    contractType: readOptionalString(item, 'field_16'),
    projectLeadId: readOptionalString(item, 'field_17'),
    viewerUPNs: safeParseJsonArray(item.field_18, 'field_18', logger) as string[] | undefined,
    addOns: safeParseJsonArray(item.field_19, 'field_19', logger) as string[] | undefined,
    clarificationNote: readOptionalStringFromNumber(item, 'field_20'),
    completedBy: readOptionalStringFromNumber(item, 'field_21'),
    completedAt: readOptionalStringFromNumber(item, 'field_22'),
    siteUrl: readOptionalString(item, 'field_23'),
    retryCount: typeof item.field_24 === 'number' ? item.field_24 : 0,
    year: readOptionalNumber(item, 'Year'),

    // ── Phase 2 gap fields (P2-07) ──────────────────────────────────────
    // Safe defaults for legacy rows that predate these columns.
    projectStreetAddress: readOptionalString(item, 'projectStreetAddress'),
    projectCity: readOptionalString(item, 'projectCity'),
    projectCounty: readOptionalString(item, 'projectCounty'),
    projectState: readOptionalString(item, 'projectState'),
    projectZip: readOptionalZipFromNumber(item, 'projectZip'),
    officeDivision: readOptionalString(item, 'officeDivision'),
    procoreProject: readOptionalString(item, 'procoreProject') as IProjectSetupRequest['procoreProject'],
    projectExecutiveUpn: readOptionalString(item, 'projectExecutiveUpn'),
    projectManagerUpn: readOptionalString(item, 'projectManagerUpn'),
    leadEstimatorUpn: readOptionalString(item, 'leadEstimatorUpn'),
    supportingEstimatorUpns: safeParseJsonArray(item.supportingEstimatorUpns, 'supportingEstimatorUpns', logger) as string[] | undefined,
    additionalTeamMemberUpns: safeParseJsonArray(item.additionalTeamMemberUpns, 'additionalTeamMemberUpns', logger) as string[] | undefined,
    timberscanApproverUpn: readOptionalString(item, 'timberscanApproverUpn'),
    sageAccessUpns: safeParseJsonArray(item.sageAccessUpns, 'sageAccessUpns', logger) as string[] | undefined,
    clarificationRequestedAt: readOptionalString(item, 'clarificationRequestedAt'),
    requesterRetryUsed: item.requesterRetryUsed === 'true',
    clarificationItems: safeParseJsonObjects(item.clarificationItems, 'clarificationItems', logger) as unknown as IProjectSetupRequest['clarificationItems'],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Domain → SharePoint (write path)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert an `IProjectSetupRequest` domain object to a SharePoint list item payload.
 *
 * All canonical domain properties are mapped. Phase 2 gap fields use domain
 * property names as SP internal names (P2-07).
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

    // ── Phase 2 gap fields (P2-07) ──────────────────────────────────────
    projectStreetAddress: request.projectStreetAddress ?? '',
    projectCity: request.projectCity ?? '',
    projectCounty: request.projectCounty ?? '',
    projectState: request.projectState ?? '',
    projectZip: request.projectZip ? Number(request.projectZip) : null,
    officeDivision: request.officeDivision ?? '',
    procoreProject: request.procoreProject ?? '',
    projectExecutiveUpn: request.projectExecutiveUpn ?? '',
    projectManagerUpn: request.projectManagerUpn ?? '',
    leadEstimatorUpn: request.leadEstimatorUpn ?? '',
    supportingEstimatorUpns: JSON.stringify(request.supportingEstimatorUpns ?? []),
    additionalTeamMemberUpns: JSON.stringify(request.additionalTeamMemberUpns ?? []),
    timberscanApproverUpn: request.timberscanApproverUpn ?? '',
    sageAccessUpns: JSON.stringify(request.sageAccessUpns ?? []),
    clarificationRequestedAt: request.clarificationRequestedAt ?? '',
    requesterRetryUsed: request.requesterRetryUsed ? 'true' : 'false',
    clarificationItems: JSON.stringify(request.clarificationItems ?? []),
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

/**
 * P2-07: Read a ZIP code from an SP Number column as a string.
 * SP stores projectZip as Number; domain uses string (e.g. "33401").
 * Filters `0`, `NaN`, and missing values to `undefined`.
 */
function readOptionalZipFromNumber(item: Record<string, unknown>, field: string): string | undefined {
  const raw = item[field];
  if (raw === null || raw === undefined || raw === 0) return undefined;
  const num = typeof raw === 'number' ? raw : Number(raw);
  if (isNaN(num) || num === 0) return undefined;
  return String(num);
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON array helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safely parse a JSON-serialized string array from a SharePoint MultiLineText field.
 * Returns `[]` on parse failure; filters out non-string elements.
 * Pass `fieldName` and `logger` for structured diagnostics on parse failure.
 */
/**
 * P2-07: Parse a JSON-serialized array of objects from a SharePoint Text field.
 * Like safeParseJsonArray but preserves object elements (for clarificationItems).
 * Returns `[]` on parse failure.
 */
export function safeParseJsonObjects(json: unknown, fieldName?: string, logger?: ILogger): Record<string, unknown>[] {
  try {
    const parsed = JSON.parse((json as string) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'object' && value !== null) : [];
  } catch {
    if (fieldName && logger) {
      logger.warn(`[field-contract] Failed to parse JSON objects from '${fieldName}'`, {
        domain: 'projects-list-mapper',
        field: fieldName,
        valueType: typeof json,
        issue: 'json-parse-failure',
      });
    }
    return [];
  }
}

export function safeParseJsonArray(json: unknown, fieldName?: string, logger?: ILogger): string[] {
  try {
    const parsed = JSON.parse((json as string) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
  } catch {
    if (fieldName && logger) {
      logger.warn(`[field-contract] Failed to parse JSON array from '${fieldName}'`, {
        domain: 'projects-list-mapper',
        field: fieldName,
        valueType: typeof json,
        issue: 'json-parse-failure',
      });
    }
    return [];
  }
}
