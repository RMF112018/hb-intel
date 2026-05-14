import { MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS } from '@hbc/models/myWork';
import { PROJECTS_LIST_NAME } from '../backend/functions/src/services/projects-list-contract.js';
import { ManagedIdentityTokenService } from '../backend/functions/src/services/managed-identity-token-service.js';
import {
  LEGACY_FALLBACK_REGISTRY_LIST_TITLE,
  getLegacyFallbackListHostSiteUrl,
} from '../backend/functions/src/services/legacy-fallback/list-descriptors.js';
import {
  buildLegacyRegistryMirrorPatch,
  buildProjectYearIndexKey,
  type ILegacyRegistryNormalizedRow,
  type IProjectsAuthorityRow,
  type IRegistryBackfillWarning,
} from '../backend/functions/src/services/legacy-fallback/registry-mirror-preservation-backfill.js';
import { getPnPContext } from '../backend/functions/src/services/sharepoint-common.js';

interface IArgs {
  apply: boolean;
  json: boolean;
  limit: number | null;
}

interface ISummary {
  mode: 'dry-run' | 'apply';
  siteUrl: string;
  rowsScanned: number;
  matchedRowsMirrored: number;
  legacyOnlyRowsPreserved: number;
  rowsUnchanged: number;
  rowsSkippedInsufficientLinkage: number;
  warnings: number;
  warningSamples: Array<{ rowId: number; code: string; message: string }>;
  startedAtUtc: string;
  completedAtUtc: string;
}

interface IRegistrySpRow extends Record<string, unknown> {
  Id: number;
}

interface IProjectSpRow extends Record<string, unknown> {
  Id: number;
}

export function parseArgs(argv: readonly string[]): IArgs {
  let apply = false;
  let json = false;
  let limit: number | null = null;

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--apply') {
      apply = true;
      continue;
    }
    if (token === '--json') {
      json = true;
      continue;
    }
    if (token === '--limit') {
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        throw new Error('Missing value for --limit');
      }
      const parsed = Number(next);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error('--limit must be a positive integer');
      }
      limit = parsed;
      i += 1;
      continue;
    }
  }

  return { apply, json, limit };
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function toRegistryRow(row: IRegistrySpRow): ILegacyRegistryNormalizedRow {
  const roleArrays: ILegacyRegistryNormalizedRow['roleArrays'] = {};
  for (const field of MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS) {
    roleArrays[field] = toStringValue(row[field]);
  }

  return {
    id: Number(row.Id ?? 0),
    projectNumber: toStringValue(row.ProjectNumber).trim(),
    legacyYear: toNumberOrNull(row.LegacyYear),
    matchStatus: toStringValue(row.MatchStatus),
    matchedProjectListItemId: toNumberOrNull(row.MatchedProjectListItemId),
    procoreProject: toStringValue(row.procoreProject || row.ProcoreProject),
    roleArrays,
  };
}

function toProjectRow(row: IProjectSpRow): IProjectsAuthorityRow {
  const roleArrays: IProjectsAuthorityRow['roleArrays'] = {};
  for (const field of MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS) {
    roleArrays[field] = toStringValue(row[field]);
  }
  return {
    id: Number(row.Id ?? 0),
    projectNumber: toStringValue(row.field_2).trim(),
    year: toNumberOrNull(row.Year),
    procoreProject: toStringValue(row.procoreProject),
    roleArrays,
  };
}

export function addWarningSamples(
  rowId: number,
  warnings: readonly IRegistryBackfillWarning[],
  samples: ISummary['warningSamples'],
  cap = 25,
): void {
  if (samples.length >= cap) {
    return;
  }
  for (const warning of warnings) {
    if (samples.length >= cap) {
      return;
    }
    samples.push({ rowId, code: warning.code, message: warning.message });
  }
}

export function printSummary(summary: ISummary, asJson: boolean): void {
  if (asJson) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log('[legacy-registry-backfill] summary');
  console.log(`  mode: ${summary.mode}`);
  console.log(`  siteUrl: ${summary.siteUrl}`);
  console.log(`  rowsScanned: ${summary.rowsScanned}`);
  console.log(`  matchedRowsMirrored: ${summary.matchedRowsMirrored}`);
  console.log(`  legacyOnlyRowsPreserved: ${summary.legacyOnlyRowsPreserved}`);
  console.log(`  rowsUnchanged: ${summary.rowsUnchanged}`);
  console.log(`  rowsSkippedInsufficientLinkage: ${summary.rowsSkippedInsufficientLinkage}`);
  console.log(`  warnings: ${summary.warnings}`);
  console.log(`  warningSamplesCaptured: ${summary.warningSamples.length}`);
}

async function run(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const siteUrl = getLegacyFallbackListHostSiteUrl();
  const sp = await getPnPContext(siteUrl, new ManagedIdentityTokenService());
  const startedAtUtc = new Date().toISOString();

  const roleSelect = [...MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS];

  const projectRows = (await sp.web.lists
    .getByTitle(PROJECTS_LIST_NAME)
    .items.select('Id', 'field_2', 'Year', 'procoreProject', ...roleSelect)
    .top(5000)()) as IProjectSpRow[];

  const registryRows = (await sp.web.lists
    .getByTitle(LEGACY_FALLBACK_REGISTRY_LIST_TITLE)
    .items.select('Id', 'ProjectNumber', 'LegacyYear', 'MatchStatus', 'MatchedProjectListItemId', 'procoreProject', ...roleSelect)
    .top(5000)()) as IRegistrySpRow[];

  const projects = projectRows.map(toProjectRow);
  const projectById = new Map<number, IProjectsAuthorityRow>();
  const projectsByProjectYearKey = new Map<string, IProjectsAuthorityRow[]>();
  for (const project of projects) {
    if (project.id > 0) {
      projectById.set(project.id, project);
    }
    const key = buildProjectYearIndexKey(project.projectNumber, project.year);
    const current = projectsByProjectYearKey.get(key) ?? [];
    current.push(project);
    projectsByProjectYearKey.set(key, current);
  }

  const summary: ISummary = {
    mode: args.apply ? 'apply' : 'dry-run',
    siteUrl,
    rowsScanned: 0,
    matchedRowsMirrored: 0,
    legacyOnlyRowsPreserved: 0,
    rowsUnchanged: 0,
    rowsSkippedInsufficientLinkage: 0,
    warnings: 0,
    warningSamples: [],
    startedAtUtc,
    completedAtUtc: '',
  };

  const scopedRows = args.limit ? registryRows.slice(0, args.limit) : registryRows;
  for (const rowRaw of scopedRows) {
    const row = toRegistryRow(rowRaw);
    if (row.id <= 0) continue;
    summary.rowsScanned += 1;

    const result = buildLegacyRegistryMirrorPatch(row, {
      projectById,
      projectsByProjectYearKey,
    });

    if (result.mirroredMatchedRow) summary.matchedRowsMirrored += 1;
    if (result.preservedLegacyOnlyRow) summary.legacyOnlyRowsPreserved += 1;

    if (result.warnings.length > 0) {
      summary.warnings += result.warnings.length;
      addWarningSamples(row.id, result.warnings, summary.warningSamples);
    }

    const hasPatch = Object.keys(result.patch).length > 0;
    if (!hasPatch) {
      if (result.status === 'skipped' || result.status === 'warning') {
        summary.rowsSkippedInsufficientLinkage += 1;
      } else {
        summary.rowsUnchanged += 1;
      }
      continue;
    }

    if (args.apply) {
      await sp.web.lists
        .getByTitle(LEGACY_FALLBACK_REGISTRY_LIST_TITLE)
        .items.getById(row.id)
        .update(result.patch);
    }
  }

  summary.completedAtUtc = new Date().toISOString();
  printSummary(summary, args.json);
  if (!args.apply) {
    console.log('[legacy-registry-backfill] dry-run complete. Re-run with --apply to persist changes.');
  }
}

if (process.argv[1] && process.argv[1].includes('backfill-my-project-legacy-registry-fields')) {
  const keepAlive = setInterval(() => {}, 1000);
  run()
    .catch((error) => {
      console.error('[legacy-registry-backfill] failed');
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    })
    .finally(() => {
      clearInterval(keepAlive);
    });
}
