/**
 * Read-only schema-readiness verification for My Projects role-array fields.
 *
 * Pure verification — no `--apply`, no mutation, no provisioning. Queries
 * the column metadata of both the `Projects` list and the
 * `Legacy Project Fallback Registry` list, builds a per-field per-list
 * readiness report via `buildProjectsRoleSchemaReadinessReport(...)`, and
 * prints the structured result. Exit code is `0` when both lists are
 * ready and `1` otherwise — operators chain this into downstream backfill
 * gates.
 *
 * Operator usage:
 *
 *   pnpm tsx scripts/verify-my-project-role-fields.ts          # text output
 *   pnpm tsx scripts/verify-my-project-role-fields.ts --json   # JSON output
 *
 * See `docs/reference/spfx-surfaces/my-dashboard/my-projects-schema-readiness.md`
 * for the operator-acceptance and triage flow.
 */

import { ManagedIdentityTokenService } from '../backend/functions/src/services/managed-identity-token-service.js';
import { PROJECTS_LIST_NAME } from '../backend/functions/src/services/projects-list-contract.js';
import {
  LEGACY_FALLBACK_REGISTRY_LIST_TITLE,
  getLegacyFallbackListHostSiteUrl,
} from '../backend/functions/src/services/legacy-fallback/list-descriptors.js';
import {
  buildProjectsRoleSchemaReadinessReport,
  type ListFieldSnapshot,
  type ProjectsRoleSchemaReadinessReport,
} from '../backend/functions/src/services/projects-role-schema-readiness.js';

export interface IVerifyArgs {
  readonly json: boolean;
}

export function parseArgs(argv: readonly string[]): IVerifyArgs {
  let json = false;
  for (const token of argv) {
    if (token === '--json') {
      json = true;
      continue;
    }
    if (token === '--apply') {
      throw new Error(
        'verify-my-project-role-fields is read-only; --apply is not supported. Run the backfill scripts directly when remediation is required.',
      );
    }
  }
  return { json };
}

export function selectExitCode(report: ProjectsRoleSchemaReadinessReport): 0 | 1 {
  return report.ready ? 0 : 1;
}

export function formatReport(report: ProjectsRoleSchemaReadinessReport, asJson: boolean): string {
  if (asJson) {
    return JSON.stringify(report, null, 2);
  }
  const lines: string[] = [];
  lines.push('[verify-my-project-role-fields] schema readiness');
  lines.push(`  generatedAtUtc: ${report.generatedAtUtc}`);
  lines.push(`  ready: ${report.ready}`);
  for (const block of [report.projects, report.legacyRegistry]) {
    lines.push(`  list: ${block.listName}`);
    lines.push(`    ready: ${block.ready}`);
    for (const entry of block.entries) {
      const observed = entry.observedTypeAsString ?? '(absent)';
      lines.push(
        `    - ${entry.internalName}: state=${entry.state} expected=${entry.expectedTypeAsString} observed=${observed}`,
      );
    }
  }
  return lines.join('\n');
}

export interface IListFieldQuery {
  listFields(listTitle: string): Promise<readonly ListFieldSnapshot[]>;
}

function resolveSiteUrl(): string {
  const url =
    process.env.SHAREPOINT_PROJECTS_SITE_URL ??
    process.env.SHAREPOINT_TENANT_URL ??
    getLegacyFallbackListHostSiteUrl();
  if (!url) {
    throw new Error(
      'SHAREPOINT_PROJECTS_SITE_URL or SHAREPOINT_TENANT_URL is required to run the schema-readiness probe.',
    );
  }
  return url;
}

/**
 * Default Graph-backed implementation of `IListFieldQuery`. Queries the
 * SharePoint REST endpoint `/_api/web/lists/getByTitle('<list>')/fields`
 * (filtered to internal-name + TypeAsString) via a bearer token issued by
 * the managed-identity service. No PnPjs dependency — keeps the script
 * pure HTTP + token.
 */
export function createGraphListFieldQuery(options: {
  readonly siteUrl: string;
  readonly tokenService: { getAccessToken: (resource: string) => Promise<string> };
  readonly fetchImpl?: typeof fetch;
}): IListFieldQuery {
  const fetchImpl = options.fetchImpl ?? fetch;
  return {
    async listFields(listTitle: string): Promise<readonly ListFieldSnapshot[]> {
      const resource = new URL(options.siteUrl).origin;
      const token = await options.tokenService.getAccessToken(resource);
      const encoded = encodeURIComponent(listTitle);
      const url = `${options.siteUrl}/_api/web/lists/getByTitle('${encoded}')/fields?$select=InternalName,TypeAsString&$top=500`;
      const response = await fetchImpl(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json;odata=nometadata',
        },
      });
      if (!response.ok) {
        throw new Error(
          `verify-my-project-role-fields: SharePoint fields query failed for list '${listTitle}' with status ${response.status}`,
        );
      }
      const body = (await response.json()) as { value?: ReadonlyArray<unknown> };
      const value = Array.isArray(body.value) ? body.value : [];
      const snapshots: ListFieldSnapshot[] = [];
      for (const raw of value) {
        if (typeof raw !== 'object' || raw === null) continue;
        const internalName = (raw as Record<string, unknown>).InternalName;
        const typeAsString = (raw as Record<string, unknown>).TypeAsString;
        if (typeof internalName !== 'string' || typeof typeAsString !== 'string') continue;
        snapshots.push({ internalName, typeAsString });
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
  const [projectsFields, legacyRegistryFields] = await Promise.all([
    deps.listFieldQuery.listFields(PROJECTS_LIST_NAME),
    deps.listFieldQuery.listFields(LEGACY_FALLBACK_REGISTRY_LIST_TITLE),
  ]);
  const report = buildProjectsRoleSchemaReadinessReport({
    projectsFields,
    legacyRegistryFields,
    generatedAtUtc: deps.now(),
  });
  deps.stdout(formatReport(report, args.json));
  return selectExitCode(report);
}

async function runFromCli(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const siteUrl = resolveSiteUrl();
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
  process.argv[1].endsWith('verify-my-project-role-fields.ts');

if (invokedDirectly) {
  runFromCli().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
