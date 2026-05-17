/**
 * Read-only schema-readiness verification for the `My Projects Custom Links`
 * SharePoint list on HBCentral. Probes the column metadata, classifies each
 * field against `MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR`, and emits the
 * structured report. Exit 0 when every required column is live-verified, 1
 * otherwise. Operators chain this into downstream readiness gates.
 *
 * No `--apply`, no mutation, no provisioning.
 *
 * Operator usage:
 *
 *   pnpm tsx scripts/verify-my-projects-custom-links.ts          # text output
 *   pnpm tsx scripts/verify-my-projects-custom-links.ts --json   # JSON output
 *
 * See `docs/how-to/administrator/provision-my-projects-custom-links.md` for
 * the operator-acceptance and triage flow.
 */

import { ManagedIdentityTokenService } from '../backend/functions/src/services/managed-identity-token-service.js';
import {
  MY_PROJECTS_CUSTOM_LINKS_LIST_TITLE,
  getMyProjectsCustomLinksListHostSiteUrl,
} from '../backend/functions/src/services/my-projects-custom-links/list-descriptor.js';
import {
  buildMyProjectsCustomLinksSchemaReadinessReport,
  type CustomLinksListFieldSnapshot,
  type MyProjectsCustomLinksSchemaReadinessReport,
} from '../backend/functions/src/services/my-projects-custom-links/custom-links-schema-readiness.js';

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
        'verify-my-projects-custom-links is read-only; --apply is not supported. Run scripts/provision-my-projects-custom-links.ts --apply for remediation.',
      );
    }
  }
  return { json };
}

export function selectExitCode(report: MyProjectsCustomLinksSchemaReadinessReport): 0 | 1 {
  return report.ready ? 0 : 1;
}

export function formatReport(
  report: MyProjectsCustomLinksSchemaReadinessReport,
  asJson: boolean,
): string {
  if (asJson) {
    return JSON.stringify(report, null, 2);
  }
  const lines: string[] = [];
  lines.push('[verify-my-projects-custom-links] schema readiness');
  lines.push(`  generatedAtUtc: ${report.generatedAtUtc}`);
  lines.push(`  list: ${report.listName}`);
  lines.push(`  ready: ${report.ready}`);
  for (const entry of report.entries) {
    const observed = entry.observedTypeAsString ?? '(absent)';
    lines.push(
      `    - ${entry.internalName}: state=${entry.state} expected=${entry.expectedTypeAsString} observed=${observed}`,
    );
  }
  return lines.join('\n');
}

export interface IListFieldQuery {
  listFields(listTitle: string): Promise<readonly CustomLinksListFieldSnapshot[]>;
}

function resolveSiteUrl(): string {
  return (
    process.env.SHAREPOINT_PROJECTS_SITE_URL ??
    process.env.SHAREPOINT_TENANT_URL ??
    getMyProjectsCustomLinksListHostSiteUrl()
  );
}

/**
 * Default SharePoint-REST implementation of `IListFieldQuery`. Queries
 * `/_api/web/lists/getByTitle('<list>')/fields` (filtered to InternalName +
 * TypeAsString) using a SharePoint app-only bearer token issued by the
 * managed-identity service.
 */
export function createGraphListFieldQuery(options: {
  readonly siteUrl: string;
  readonly tokenService: { getSharePointToken: (siteUrl: string) => Promise<string> };
  readonly fetchImpl?: typeof fetch;
}): IListFieldQuery {
  const fetchImpl = options.fetchImpl ?? fetch;
  return {
    async listFields(listTitle: string): Promise<readonly CustomLinksListFieldSnapshot[]> {
      const token = await options.tokenService.getSharePointToken(options.siteUrl);
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
          `verify-my-projects-custom-links: SharePoint fields query failed for list '${listTitle}' with status ${response.status}`,
        );
      }
      const body = (await response.json()) as { value?: ReadonlyArray<unknown> };
      const value = Array.isArray(body.value) ? body.value : [];
      const snapshots: CustomLinksListFieldSnapshot[] = [];
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
  const fields = await deps.listFieldQuery.listFields(MY_PROJECTS_CUSTOM_LINKS_LIST_TITLE);
  const report = buildMyProjectsCustomLinksSchemaReadinessReport({
    fields,
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
  process.argv[1].endsWith('verify-my-projects-custom-links.ts');

if (invokedDirectly) {
  process.on('unhandledRejection', (err) => {
    console.error(
      `verify-my-projects-custom-links: unhandled rejection — ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(1);
  });
  process.on('uncaughtException', (err) => {
    console.error(
      `verify-my-projects-custom-links: uncaught exception — ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(1);
  });
  runFromCli().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
