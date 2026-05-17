/**
 * Read-only schema-readiness verification for the `My Projects Registry`
 * SharePoint list on the MyDashboard site. Probes column metadata + uniqueness
 * flags, classifies each field against `MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR`,
 * and emits the structured report. Exit 0 when every required column is
 * live-verified, 1 otherwise.
 *
 * No `--apply`, no mutation, no provisioning.
 *
 * Operator usage:
 *
 *   pnpm tsx scripts/verify-my-projects-registry-schema.ts          # text output
 *   pnpm tsx scripts/verify-my-projects-registry-schema.ts --json   # JSON output
 *
 * See `docs/how-to/administrator/provision-my-projects-registry-schema.md`
 * for the operator runbook.
 */

import { ManagedIdentityTokenService } from '../backend/functions/src/services/managed-identity-token-service.js';
import {
  MY_PROJECTS_REGISTRY_LIST_TITLE,
  getMyProjectsRegistryListHostSiteUrl,
} from '../backend/functions/src/services/my-projects-projection/registry-list-descriptor.js';
import {
  buildMyProjectsRegistrySchemaReadinessReport,
  type MyProjectsRegistrySchemaReadinessReport,
  type RegistryListFieldSnapshot,
} from '../backend/functions/src/services/my-projects-projection/registry-schema-readiness.js';

export interface IVerifyArgs {
  readonly json: boolean;
  readonly siteUrl?: string;
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
        'verify-my-projects-registry-schema is read-only; --apply is not supported. Run scripts/provision-my-projects-registry-schema.ts --apply for remediation.',
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
      throw new Error('Usage: verify-my-projects-registry-schema [--json] [--site-url <url>]');
    }
    throw new Error(`Unknown argument '${token}'. Usage: [--json] [--site-url <url>]`);
  }
  return { json, siteUrl };
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

export function selectExitCode(report: MyProjectsRegistrySchemaReadinessReport): 0 | 1 {
  return report.ready ? 0 : 1;
}

export function formatReport(
  report: MyProjectsRegistrySchemaReadinessReport,
  asJson: boolean,
): string {
  if (asJson) {
    return JSON.stringify(report, null, 2);
  }
  const lines: string[] = [];
  lines.push('[verify-my-projects-registry-schema] schema readiness');
  lines.push(`  generatedAtUtc: ${report.generatedAtUtc}`);
  lines.push(`  list: ${report.listName}`);
  lines.push(`  ready: ${report.ready}`);
  for (const entry of report.entries) {
    const observed = entry.observedTypeAsString ?? '(absent)';
    const uniqueExpect = entry.expectedUnique === true ? ' expectedUnique=true' : '';
    const uniqueObserved =
      entry.observedUnique === undefined ? '' : ` observedUnique=${entry.observedUnique}`;
    lines.push(
      `    - ${entry.internalName}: state=${entry.state} expected=${entry.expectedTypeAsString} observed=${observed}${uniqueExpect}${uniqueObserved}`,
    );
  }
  return lines.join('\n');
}

export interface IListFieldQuery {
  listFields(listTitle: string): Promise<readonly RegistryListFieldSnapshot[]>;
}

function resolveSiteUrl(args: IVerifyArgs): string {
  return (
    args.siteUrl ??
    process.env.SHAREPOINT_MYDASHBOARD_SITE_URL ??
    getMyProjectsRegistryListHostSiteUrl()
  );
}

/**
 * SharePoint-REST implementation of `IListFieldQuery`. Queries
 * `/_api/web/lists/getByTitle('<list>')/fields` projecting InternalName +
 * TypeAsString + EnforceUniqueValues using an app-only bearer token from the
 * managed-identity service. Mirrors the custom-links verifier's auth posture.
 */
export function createGraphListFieldQuery(options: {
  readonly siteUrl: string;
  readonly tokenService: { getSharePointToken: (siteUrl: string) => Promise<string> };
  readonly fetchImpl?: typeof fetch;
}): IListFieldQuery {
  const fetchImpl = options.fetchImpl ?? fetch;
  return {
    async listFields(listTitle: string): Promise<readonly RegistryListFieldSnapshot[]> {
      const token = await options.tokenService.getSharePointToken(options.siteUrl);
      const encoded = encodeURIComponent(listTitle);
      const url = `${options.siteUrl}/_api/web/lists/getByTitle('${encoded}')/fields?$select=InternalName,TypeAsString,EnforceUniqueValues&$top=500`;
      const response = await fetchImpl(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json;odata=nometadata',
        },
      });
      if (!response.ok) {
        throw new Error(
          `verify-my-projects-registry-schema: SharePoint fields query failed for list '${listTitle}' with status ${response.status}`,
        );
      }
      const body = (await response.json()) as { value?: ReadonlyArray<unknown> };
      const value = Array.isArray(body.value) ? body.value : [];
      const snapshots: RegistryListFieldSnapshot[] = [];
      for (const raw of value) {
        if (typeof raw !== 'object' || raw === null) continue;
        const internalName = (raw as Record<string, unknown>).InternalName;
        const typeAsString = (raw as Record<string, unknown>).TypeAsString;
        const enforceUniqueValues = (raw as Record<string, unknown>).EnforceUniqueValues;
        if (typeof internalName !== 'string' || typeof typeAsString !== 'string') continue;
        snapshots.push({
          internalName,
          typeAsString,
          enforceUniqueValues:
            typeof enforceUniqueValues === 'boolean' ? enforceUniqueValues : undefined,
        });
      }
      return snapshots;
    },
  };
}

export interface IRunDeps {
  readonly listFieldQuery: IListFieldQuery;
  readonly now: () => string;
  readonly stdout: (line: string) => void;
}

export async function main(args: IVerifyArgs, deps: IRunDeps): Promise<0 | 1> {
  const fields = await deps.listFieldQuery.listFields(MY_PROJECTS_REGISTRY_LIST_TITLE);
  const report = buildMyProjectsRegistrySchemaReadinessReport({
    fields,
    generatedAtUtc: deps.now(),
  });
  deps.stdout(formatReport(report, args.json));
  return selectExitCode(report);
}

async function runFromCli(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const siteUrl = validateMyDashboardSiteUrl(resolveSiteUrl(args));
  const tokenService = new ManagedIdentityTokenService();
  const listFieldQuery = createGraphListFieldQuery({ siteUrl, tokenService });
  const code = await main(args, {
    listFieldQuery,
    now: () => new Date().toISOString(),
    stdout: (line) => console.log(line),
  });
  process.exit(code);
}

const invokedDirectly =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  process.argv[1].endsWith('verify-my-projects-registry-schema.ts');

if (invokedDirectly) {
  process.on('unhandledRejection', (err) => {
    console.error(
      `verify-my-projects-registry-schema: unhandled rejection — ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(1);
  });
  process.on('uncaughtException', (err) => {
    console.error(
      `verify-my-projects-registry-schema: uncaught exception — ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(1);
  });
  runFromCli().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
