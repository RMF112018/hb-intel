import { ManagedIdentityTokenService } from '../backend/functions/src/services/managed-identity-token-service.js';
import {
  buildMyProjectsProjectionStorageReadinessReport,
  type IStorageLiveListSnapshot,
  type IStorageSchemaReadinessReport,
} from '../backend/functions/src/services/my-projects-projection/storage-schema-readiness.js';
import {
  MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR,
  getMyProjectsProjectionStorageHostSiteUrl,
} from '../backend/functions/src/services/my-projects-projection/storage-list-descriptor.js';

export interface IVerifyArgs {
  readonly json: boolean;
  readonly siteUrl?: string;
}

export interface IStorageReadAdapter {
  listFields(listTitle: string): Promise<IStorageLiveListSnapshot['fields']>;
  listFieldUniqueness(listTitle: string): Promise<Record<string, boolean>>;
}

export interface IRunDeps {
  readonly listAdapter: IStorageReadAdapter;
  readonly now: () => string;
  readonly stdout: (line: string) => void;
}

export function parseArgs(argv: readonly string[]): IVerifyArgs {
  let json = false;
  let siteUrl: string | undefined;
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--json') {
      json = true;
      continue;
    }
    if (token === '--apply') {
      throw new Error(
        'verify-my-projects-projection-storage is read-only; --apply is not supported. Run the provision script for remediation.',
      );
    }
    if (token === '--site-url') {
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        throw new Error('Missing value for --site-url. Usage: --site-url <url>');
      }
      siteUrl = next;
      i += 1;
      continue;
    }
    if (token === '--help' || token === '-h') {
      throw new Error('Usage: verify-my-projects-projection-storage [--json] [--site-url <url>]');
    }
    throw new Error(`Unknown argument '${token}'. Usage: [--json] [--site-url <url>]`);
  }
  return { json, siteUrl };
}

export function resolveSiteUrl(args: IVerifyArgs): string {
  return (
    args.siteUrl ??
    process.env.SHAREPOINT_MYDASHBOARD_SITE_URL ??
    getMyProjectsProjectionStorageHostSiteUrl()
  );
}

export function validateMyDashboardSiteUrl(siteUrl: string): string {
  let parsed: URL;
  try {
    parsed = new URL(siteUrl);
  } catch {
    throw new Error(`Invalid site URL: ${siteUrl}`);
  }
  const hostOk = parsed.hostname.toLowerCase() === 'hedrickbrotherscom.sharepoint.com';
  const pathOk = parsed.pathname.toLowerCase().replace(/\/+$/, '') === '/sites/mydashboard';
  if (!hostOk || !pathOk) {
    throw new Error(
      `Site URL must be MyDashboard: https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard (received: ${siteUrl})`,
    );
  }
  return `https://${parsed.hostname}/sites/MyDashboard`;
}

export function selectExitCode(report: IStorageSchemaReadinessReport): 0 | 1 {
  return report.ready ? 0 : 1;
}

export function formatReport(report: IStorageSchemaReadinessReport, asJson: boolean): string {
  if (asJson) return JSON.stringify(report, null, 2);
  const lines: string[] = [];
  lines.push('[verify-my-projects-projection-storage] schema readiness');
  lines.push(`  generatedAtUtc: ${report.generatedAtUtc}`);
  lines.push(`  ready: ${report.ready}`);
  for (const list of report.listReports) {
    lines.push(`  - list: ${list.listTitle} ready=${list.ready}`);
    for (const entry of list.entries) {
      lines.push(
        `    * ${entry.internalName}: state=${entry.state} expected=${entry.expectedTypeAsString} observed=${entry.observedTypeAsString ?? '(absent)'}`,
      );
    }
  }
  return lines.join('\n');
}

export async function main(args: IVerifyArgs, deps: IRunDeps): Promise<0 | 1> {
  const liveLists: IStorageLiveListSnapshot[] = [];
  for (const descriptor of MY_PROJECTS_PROJECTION_STORAGE_DESCRIPTOR) {
    liveLists.push({
      listTitle: descriptor.title,
      fields: await deps.listAdapter.listFields(descriptor.title),
      enforceUniqueValues: await deps.listAdapter.listFieldUniqueness(descriptor.title),
    });
  }

  const report = buildMyProjectsProjectionStorageReadinessReport({
    generatedAtUtc: deps.now(),
    liveLists,
  });
  deps.stdout(formatReport(report, args.json));
  return selectExitCode(report);
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race<T>([
    p,
    new Promise<T>((_resolve, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}

function createPnPReadAdapter(siteUrl: string): IStorageReadAdapter {
  const tokenService = new ManagedIdentityTokenService();
  return {
    async listFields(listTitle: string) {
      const token = await tokenService.getSharePointToken(siteUrl);
      const encoded = encodeURIComponent(listTitle);
      const response = await fetch(
        `${siteUrl}/_api/web/lists/getByTitle('${encoded}')/fields?$select=InternalName,Title,TypeAsString,Required,Indexed,DefaultValue,Choices&$top=5000`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json;odata=nometadata',
          },
        },
      );
      if (!response.ok) {
        throw new Error(
          `verify-my-projects-projection-storage: fields query failed for '${listTitle}' with status ${response.status}`,
        );
      }
      const body = (await response.json()) as { value?: ReadonlyArray<unknown> };
      const value = Array.isArray(body.value) ? body.value : [];
      return value
        .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
        .map((row) => ({
          InternalName: String(row.InternalName ?? ''),
          Title: String(row.Title ?? ''),
          TypeAsString: String(row.TypeAsString ?? ''),
          Required: typeof row.Required === 'boolean' ? row.Required : undefined,
          Indexed: typeof row.Indexed === 'boolean' ? row.Indexed : undefined,
          DefaultValue: typeof row.DefaultValue === 'string' ? row.DefaultValue : undefined,
          Choices: Array.isArray(row.Choices)
            ? (row.Choices.filter((c): c is string => typeof c === 'string') as string[])
            : undefined,
        }));
    },
    async listFieldUniqueness(listTitle: string) {
      const token = await tokenService.getSharePointToken(siteUrl);
      const encoded = encodeURIComponent(listTitle);
      const response = await fetch(
        `${siteUrl}/_api/web/lists/getByTitle('${encoded}')/fields?$select=InternalName,EnforceUniqueValues&$top=5000`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json;odata=nometadata',
          },
        },
      );
      if (!response.ok) {
        throw new Error(
          `verify-my-projects-projection-storage: uniqueness query failed for '${listTitle}' with status ${response.status}`,
        );
      }
      const body = (await response.json()) as { value?: ReadonlyArray<unknown> };
      const value = Array.isArray(body.value) ? body.value : [];
      const out: Record<string, boolean> = {};
      for (const raw of value) {
        if (typeof raw !== 'object' || raw === null) continue;
        const row = raw as Record<string, unknown>;
        if (typeof row.InternalName !== 'string') continue;
        out[row.InternalName] = row.EnforceUniqueValues === true;
      }
      return out;
    },
  };
}

export async function runVerifyCli(
  argv: readonly string[] = process.argv.slice(2),
): Promise<void> {
  const args = parseArgs(argv);
  const siteUrl = validateMyDashboardSiteUrl(resolveSiteUrl(args));
  const code = await withTimeout(
    main(args, {
      listAdapter: createPnPReadAdapter(siteUrl),
      now: () => new Date().toISOString(),
      stdout: (line) => console.log(line),
    }),
    180_000,
    'verify-my-projects-projection-storage',
  );
  process.exit(code);
}
