import {
  normalizeUpn,
  normalizeUpnArray,
  parseUpnArrayStorage,
  serializeUpnArrayStorage,
} from '@hbc/models/myWork';
import type { IProjectsListItem } from './projects-list-contract.js';

export type ProjectsRoleArrayBackfillStatus = 'changed' | 'unchanged' | 'skipped' | 'warning';

export type ProjectsRoleArrayBackfillWarningCode =
  | 'legacy-empty'
  | 'legacy-invalid-token'
  | 'legacy-parse-salvaged';

export interface IProjectsRoleArrayBackfillWarning {
  code: ProjectsRoleArrayBackfillWarningCode;
  message: string;
  legacyField:
    | 'leadEstimatorUpn'
    | 'supportingEstimatorUpns'
    | 'projectManagerUpn'
    | 'projectExecutiveUpn';
  canonicalField:
    | 'leadEstimatorUpns'
    | 'estimatorUpns'
    | 'projectManagerUpns'
    | 'projectExecutiveUpns';
}

export interface IProjectsRoleArrayPatchResult {
  patch: Partial<
    Pick<
      IProjectsListItem,
      'leadEstimatorUpns' | 'estimatorUpns' | 'projectManagerUpns' | 'projectExecutiveUpns'
    >
  >;
  status: ProjectsRoleArrayBackfillStatus;
  migratableLegacyValueCount: number;
  warnings: IProjectsRoleArrayBackfillWarning[];
}

type LegacyField =
  | 'leadEstimatorUpn'
  | 'supportingEstimatorUpns'
  | 'projectManagerUpn'
  | 'projectExecutiveUpn';

type CanonicalField = 'leadEstimatorUpns' | 'estimatorUpns' | 'projectManagerUpns' | 'projectExecutiveUpns';

interface IBackfillFieldMapping {
  legacyField: LegacyField;
  canonicalField: CanonicalField;
}

const FIELD_MAPPINGS: readonly IBackfillFieldMapping[] = [
  { legacyField: 'leadEstimatorUpn', canonicalField: 'leadEstimatorUpns' },
  { legacyField: 'supportingEstimatorUpns', canonicalField: 'estimatorUpns' },
  { legacyField: 'projectManagerUpn', canonicalField: 'projectManagerUpns' },
  { legacyField: 'projectExecutiveUpn', canonicalField: 'projectExecutiveUpns' },
] as const;

const LEGACY_BOOLEAN_SENTINELS = new Set(['yes', 'no']);

export type IProjectsBackfillInputRecord = Partial<
  Pick<
    IProjectsListItem,
    | 'leadEstimatorUpn'
    | 'supportingEstimatorUpns'
    | 'projectManagerUpn'
    | 'projectExecutiveUpn'
    | 'leadEstimatorUpns'
    | 'estimatorUpns'
    | 'projectManagerUpns'
    | 'projectExecutiveUpns'
  >
>;

function parseLegacyTokens(value: unknown, legacyField: LegacyField): { tokens: string[]; warnings: IProjectsRoleArrayBackfillWarning[] } {
  const warnings: IProjectsRoleArrayBackfillWarning[] = [];

  if (legacyField === 'supportingEstimatorUpns') {
    const parsed = parseUpnArrayStorage(value);
    const rawString = typeof value === 'string' ? value.trim() : '';
    if (rawString.startsWith('[') && rawString.endsWith(']') && parsed.length > 0) {
      warnings.push({
        code: 'legacy-parse-salvaged',
        message: `Legacy field '${legacyField}' required salvage parsing.`,
        legacyField,
        canonicalField: 'estimatorUpns',
      });
    }
    return { tokens: parsed, warnings };
  }

  const normalized = normalizeUpn(value);
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    if (trimmed && LEGACY_BOOLEAN_SENTINELS.has(trimmed)) {
      warnings.push({
        code: 'legacy-invalid-token',
        message: `Legacy field '${legacyField}' contains '${value}' which is not a valid UPN token.`,
        legacyField,
        canonicalField:
          legacyField === 'leadEstimatorUpn'
            ? 'leadEstimatorUpns'
            : legacyField === 'projectManagerUpn'
              ? 'projectManagerUpns'
              : 'projectExecutiveUpns',
      });
      return { tokens: [], warnings };
    }
  }

  return { tokens: normalized ? [normalized] : [], warnings };
}

export function buildProjectsRoleArrayPatch(record: IProjectsBackfillInputRecord): IProjectsRoleArrayPatchResult {
  const patch: IProjectsRoleArrayPatchResult['patch'] = {};
  const warnings: IProjectsRoleArrayBackfillWarning[] = [];
  let changedFields = 0;
  let migratableLegacyValueCount = 0;
  let hasLegacySourceValues = false;

  for (const mapping of FIELD_MAPPINGS) {
    const legacyValue = record[mapping.legacyField];
    const canonicalValue = record[mapping.canonicalField];

    const canonicalExisting = parseUpnArrayStorage(canonicalValue ?? '');
    const parsedLegacy = parseLegacyTokens(legacyValue, mapping.legacyField);
    warnings.push(...parsedLegacy.warnings);

    if (parsedLegacy.tokens.length > 0) {
      hasLegacySourceValues = true;
      migratableLegacyValueCount += parsedLegacy.tokens.length;
    } else if (typeof legacyValue === 'string' && legacyValue.trim()) {
      hasLegacySourceValues = true;
      warnings.push({
        code: 'legacy-empty',
        message: `Legacy field '${mapping.legacyField}' did not yield migratable UPN values.`,
        legacyField: mapping.legacyField,
        canonicalField: mapping.canonicalField,
      });
    }

    const merged = normalizeUpnArray([...canonicalExisting, ...parsedLegacy.tokens]);
    const nextSerialized = serializeUpnArrayStorage(merged);
    const currentSerialized = serializeUpnArrayStorage(canonicalExisting);

    if (nextSerialized !== currentSerialized) {
      patch[mapping.canonicalField] = nextSerialized;
      changedFields += 1;
    }
  }

  let status: ProjectsRoleArrayBackfillStatus;
  if (changedFields > 0) {
    status = 'changed';
  } else if (warnings.length > 0) {
    status = 'warning';
  } else if (hasLegacySourceValues) {
    status = 'skipped';
  } else {
    status = 'unchanged';
  }

  return {
    patch,
    status,
    migratableLegacyValueCount,
    warnings,
  };
}

export function migrateProjectsRoleArrays(record: IProjectsBackfillInputRecord): IProjectsRoleArrayPatchResult {
  return buildProjectsRoleArrayPatch(record);
}

export function resolveCanonicalRoleArrayWithLegacyFallback(
  record: IProjectsBackfillInputRecord,
  canonicalField: CanonicalField,
): string[] {
  const canonicalValues = parseUpnArrayStorage(record[canonicalField] ?? '');
  if (canonicalValues.length > 0) {
    return canonicalValues;
  }

  const mapping = FIELD_MAPPINGS.find((entry) => entry.canonicalField === canonicalField);
  if (!mapping) {
    return [];
  }

  return parseLegacyTokens(record[mapping.legacyField], mapping.legacyField).tokens;
}
