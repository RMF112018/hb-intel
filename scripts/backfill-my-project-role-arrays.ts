import { ManagedIdentityTokenService } from '../backend/functions/src/services/managed-identity-token-service.js';
import { PROJECTS_LIST_NAME } from '../backend/functions/src/services/projects-list-contract.js';
import {
  buildProjectsRoleArrayPatch,
  type IProjectsRoleArrayBackfillWarning,
} from '../backend/functions/src/services/projects-role-array-backfill.js';
import { getPnPContext } from '../backend/functions/src/services/sharepoint-common.js';

interface IBackfillArgs {
  apply: boolean;
  json: boolean;
  limit: number | null;
}

interface IBackfillSummary {
  mode: 'dry-run' | 'apply';
  siteUrl: string;
  listName: string;
  rowsScanned: number;
  rowsWithMigratableLegacyValues: number;
  rowsChanged: number;
  rowsUnchanged: number;
  rowsSkippedAlreadyMatched: number;
  parseValidationWarnings: number;
  warningSamples: Array<{ rowId: number; code: string; message: string }>;
  startedAtUtc: string;
  completedAtUtc: string;
}

interface IProjectsRow {
  Id: number;
  leadEstimatorUpn?: string;
  supportingEstimatorUpns?: string;
  projectManagerUpn?: string;
  projectExecutiveUpn?: string;
  leadEstimatorUpns?: string;
  estimatorUpns?: string;
  projectManagerUpns?: string;
  projectExecutiveUpns?: string;
}

export function parseArgs(argv: readonly string[]): IBackfillArgs {
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

export function resolveProjectsSiteUrl(): string {
  const url = process.env.SHAREPOINT_PROJECTS_SITE_URL ?? process.env.SHAREPOINT_TENANT_URL ?? '';
  if (!url) {
    throw new Error('SHAREPOINT_PROJECTS_SITE_URL or SHAREPOINT_TENANT_URL is required.');
  }
  return url;
}

export function addWarningSamples(
  warnings: IProjectsRoleArrayBackfillWarning[],
  rowId: number,
  samples: IBackfillSummary['warningSamples'],
  maxSamples = 25,
): void {
  if (samples.length >= maxSamples) {
    return;
  }
  for (const warning of warnings) {
    if (samples.length >= maxSamples) {
      return;
    }
    samples.push({
      rowId,
      code: warning.code,
      message: warning.message,
    });
  }
}

export function printSummary(summary: IBackfillSummary, asJson: boolean): void {
  if (asJson) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log('[my-projects-backfill] summary');
  console.log(`  mode: ${summary.mode}`);
  console.log(`  siteUrl: ${summary.siteUrl}`);
  console.log(`  listName: ${summary.listName}`);
  console.log(`  rowsScanned: ${summary.rowsScanned}`);
  console.log(`  rowsWithMigratableLegacyValues: ${summary.rowsWithMigratableLegacyValues}`);
  console.log(`  rowsChanged: ${summary.rowsChanged}`);
  console.log(`  rowsUnchanged: ${summary.rowsUnchanged}`);
  console.log(`  rowsSkippedAlreadyMatched: ${summary.rowsSkippedAlreadyMatched}`);
  console.log(`  parseValidationWarnings: ${summary.parseValidationWarnings}`);
  console.log(`  warningSamplesCaptured: ${summary.warningSamples.length}`);
}

async function runBackfill(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const siteUrl = resolveProjectsSiteUrl();
  const startedAtUtc = new Date().toISOString();

  const sp = await getPnPContext(siteUrl, new ManagedIdentityTokenService());
  const list = sp.web.lists.getByTitle(PROJECTS_LIST_NAME);

  const rows = (await list.items
    .select(
      'Id',
      'leadEstimatorUpn',
      'supportingEstimatorUpns',
      'projectManagerUpn',
      'projectExecutiveUpn',
      'leadEstimatorUpns',
      'estimatorUpns',
      'projectManagerUpns',
      'projectExecutiveUpns',
    )
    .top(5000)()) as IProjectsRow[];

  const scopedRows = args.limit ? rows.slice(0, args.limit) : rows;

  const summary: IBackfillSummary = {
    mode: args.apply ? 'apply' : 'dry-run',
    siteUrl,
    listName: PROJECTS_LIST_NAME,
    rowsScanned: 0,
    rowsWithMigratableLegacyValues: 0,
    rowsChanged: 0,
    rowsUnchanged: 0,
    rowsSkippedAlreadyMatched: 0,
    parseValidationWarnings: 0,
    warningSamples: [],
    startedAtUtc,
    completedAtUtc: '',
  };

  for (const row of scopedRows) {
    summary.rowsScanned += 1;
    const result = buildProjectsRoleArrayPatch(row);

    if (result.migratableLegacyValueCount > 0) {
      summary.rowsWithMigratableLegacyValues += 1;
    }
    if (result.warnings.length > 0) {
      summary.parseValidationWarnings += result.warnings.length;
      addWarningSamples(result.warnings, row.Id, summary.warningSamples);
    }

    const hasPatch = Object.keys(result.patch).length > 0;
    if (!hasPatch) {
      if (result.migratableLegacyValueCount > 0) {
        summary.rowsSkippedAlreadyMatched += 1;
      } else {
        summary.rowsUnchanged += 1;
      }
      continue;
    }

    summary.rowsChanged += 1;
    if (args.apply) {
      await list.items.getById(row.Id).update(result.patch);
    }
  }

  summary.completedAtUtc = new Date().toISOString();
  printSummary(summary, args.json);

  if (!args.apply) {
    console.log('[my-projects-backfill] dry-run complete. Re-run with --apply to persist changes.');
  }
}

if (process.argv[1] && process.argv[1].includes('backfill-my-project-role-arrays')) {
  const keepAlive = setInterval(() => {}, 1000);
  runBackfill()
    .catch((error) => {
      console.error('[my-projects-backfill] failed');
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    })
    .finally(() => {
      clearInterval(keepAlive);
    });
}
