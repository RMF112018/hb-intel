import {
  MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS,
  parseUpnArrayStorage,
  serializeUpnArrayStorage,
} from '@hbc/models/myWork';

export type RegistryBackfillStatus =
  | 'matched-mirrored'
  | 'legacy-preserved'
  | 'unchanged'
  | 'skipped'
  | 'warning';

export type RegistryBackfillWarningCode =
  | 'missing-linkage'
  | 'invalid-linkage'
  | 'missing-project-authority'
  | 'ambiguous-fallback-linkage'
  | 'parse-normalization-fallback'
  | 'invalid-legacy-token';

export interface IRegistryBackfillWarning {
  code: RegistryBackfillWarningCode;
  message: string;
}

export type RegistryRoleField = (typeof MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS)[number];

export interface ILegacyRegistryNormalizedRow {
  id: number;
  projectNumber: string;
  legacyYear: number | null;
  matchStatus: string;
  matchedProjectListItemId: number | null;
  procoreProject?: string | null;
  roleArrays: Partial<Record<RegistryRoleField, string | null | undefined>>;
}

export interface IProjectsAuthorityRow {
  id: number;
  projectNumber: string;
  year: number | null;
  procoreProject?: string | null;
  roleArrays: Partial<Record<RegistryRoleField, string | null | undefined>>;
}

export interface IRegistryBackfillIndexes {
  projectById: ReadonlyMap<number, IProjectsAuthorityRow>;
  projectsByProjectYearKey: ReadonlyMap<string, readonly IProjectsAuthorityRow[]>;
}

export interface IRegistryLinkResolution {
  kind: 'matched' | 'legacy-only' | 'insufficient';
  project: IProjectsAuthorityRow | null;
  warnings: IRegistryBackfillWarning[];
}

export interface IRegistryBackfillPatchResult {
  status: RegistryBackfillStatus;
  patch: Record<string, unknown>;
  warnings: IRegistryBackfillWarning[];
  mirroredMatchedRow: boolean;
  preservedLegacyOnlyRow: boolean;
}

function normalizeProjectYearKey(projectNumber: string, year: number | null): string {
  return `${projectNumber.trim()}::${year == null ? '' : String(year)}`;
}

function isLegacyOnlyStatus(status: string): boolean {
  const normalized = status.trim().toLowerCase();
  return normalized === 'unmatched' || normalized === 'review-required' || normalized === 'ignored' || normalized === 'disabled';
}

function normalizeProcoreToken(value: unknown): { normalized: string; warning: IRegistryBackfillWarning | null } {
  if (typeof value !== 'string') {
    return { normalized: '', warning: null };
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return { normalized: '', warning: null };
  }
  const lower = trimmed.toLowerCase();
  if (lower === 'yes' || lower === 'no') {
    return {
      normalized: trimmed,
      warning: {
        code: 'invalid-legacy-token',
        message: `Legacy procoreProject value '${trimmed}' is not a valid project token.`,
      },
    };
  }
  return { normalized: trimmed, warning: null };
}

function normalizeRoleArrayPreservingNonDestructive(raw: unknown): { serialized: string; warning: IRegistryBackfillWarning | null } {
  if (typeof raw === 'string' && raw.trim().length > 0) {
    const parsed = parseUpnArrayStorage(raw);
    if (parsed.length === 0) {
      return {
        serialized: raw,
        warning: {
          code: 'parse-normalization-fallback',
          message: 'Role-array value could not be safely normalized; preserving original value.',
        },
      };
    }
  }
  return {
    serialized: serializeUpnArrayStorage(parseUpnArrayStorage(raw)),
    warning: null,
  };
}

export function resolveRegistryAuthorityLinkage(
  row: ILegacyRegistryNormalizedRow,
  indexes: IRegistryBackfillIndexes,
): IRegistryLinkResolution {
  const warnings: IRegistryBackfillWarning[] = [];

  if (row.matchedProjectListItemId != null) {
    if (!Number.isFinite(row.matchedProjectListItemId) || row.matchedProjectListItemId <= 0) {
      warnings.push({
        code: 'invalid-linkage',
        message: `MatchedProjectListItemId '${String(row.matchedProjectListItemId)}' is invalid.`,
      });
      return { kind: 'insufficient', project: null, warnings };
    }
    const strong = indexes.projectById.get(row.matchedProjectListItemId);
    if (strong) {
      return { kind: 'matched', project: strong, warnings };
    }
    warnings.push({
      code: 'missing-project-authority',
      message: `No Projects authority row found for MatchedProjectListItemId=${row.matchedProjectListItemId}.`,
    });
    return { kind: 'insufficient', project: null, warnings };
  }

  const key = normalizeProjectYearKey(row.projectNumber, row.legacyYear);
  const candidates = indexes.projectsByProjectYearKey.get(key) ?? [];
  if (candidates.length === 1) {
    return { kind: 'matched', project: candidates[0], warnings };
  }
  if (candidates.length > 1) {
    warnings.push({
      code: 'ambiguous-fallback-linkage',
      message: `Fallback linkage ambiguous for key '${key}' (candidates=${candidates.length}).`,
    });
    return { kind: 'insufficient', project: null, warnings };
  }

  if (isLegacyOnlyStatus(row.matchStatus)) {
    return { kind: 'legacy-only', project: null, warnings };
  }

  warnings.push({
    code: 'missing-linkage',
    message: `No strong or fallback linkage found for row id=${row.id}.`,
  });
  return { kind: 'insufficient', project: null, warnings };
}

export function buildLegacyRegistryMirrorPatch(
  row: ILegacyRegistryNormalizedRow,
  indexes: IRegistryBackfillIndexes,
): IRegistryBackfillPatchResult {
  const patch: Record<string, unknown> = {};
  const warnings: IRegistryBackfillWarning[] = [];
  const linkage = resolveRegistryAuthorityLinkage(row, indexes);
  warnings.push(...linkage.warnings);

  if (linkage.kind === 'matched' && linkage.project) {
    for (const field of MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS) {
      const next = serializeUpnArrayStorage(parseUpnArrayStorage(linkage.project.roleArrays[field] ?? ''));
      const current = serializeUpnArrayStorage(parseUpnArrayStorage(row.roleArrays[field] ?? ''));
      if (next !== current) {
        patch[field] = next;
      }
    }

    const nextProcore = normalizeProcoreToken(linkage.project.procoreProject ?? '').normalized;
    const currentProcore = normalizeProcoreToken(row.procoreProject ?? '').normalized;
    if (nextProcore !== currentProcore) {
      patch.procoreProject = nextProcore;
    }

    return {
      status: Object.keys(patch).length > 0 ? 'matched-mirrored' : 'unchanged',
      patch,
      warnings,
      mirroredMatchedRow: true,
      preservedLegacyOnlyRow: false,
    };
  }

  if (linkage.kind === 'legacy-only') {
    for (const field of MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS) {
      const { serialized, warning } = normalizeRoleArrayPreservingNonDestructive(row.roleArrays[field] ?? '');
      if (warning) {
        warnings.push({ ...warning, message: `${field}: ${warning.message}` });
      }
      const current = typeof row.roleArrays[field] === 'string' ? String(row.roleArrays[field]) : '';
      if (!warning && serialized !== current) {
        patch[field] = serialized;
      }
    }

    const procore = normalizeProcoreToken(row.procoreProject ?? '');
    if (procore.warning) {
      warnings.push(procore.warning);
    } else {
      const current = typeof row.procoreProject === 'string' ? row.procoreProject.trim() : '';
      if (procore.normalized !== current) {
        patch.procoreProject = procore.normalized;
      }
    }

    const status: RegistryBackfillStatus =
      Object.keys(patch).length > 0 ? 'legacy-preserved' : warnings.length > 0 ? 'warning' : 'unchanged';

    return {
      status,
      patch,
      warnings,
      mirroredMatchedRow: false,
      preservedLegacyOnlyRow: true,
    };
  }

  return {
    status: warnings.length > 0 ? 'warning' : 'skipped',
    patch,
    warnings,
    mirroredMatchedRow: false,
    preservedLegacyOnlyRow: false,
  };
}

export function migrateLegacyRegistryRow(
  row: ILegacyRegistryNormalizedRow,
  indexes: IRegistryBackfillIndexes,
): IRegistryBackfillPatchResult {
  return buildLegacyRegistryMirrorPatch(row, indexes);
}

export function buildProjectYearIndexKey(projectNumber: string, year: number | null): string {
  return normalizeProjectYearKey(projectNumber, year);
}
