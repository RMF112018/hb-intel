import { ManagedIdentityTokenService } from '../backend/functions/src/services/managed-identity-token-service.js';
import {
  buildListFieldPlans,
  type ILiveSharePointFieldSnapshot,
  type IUnresolvedMutation,
} from '../backend/functions/src/services/sharepoint-schema-provisioning/index.js';
import type { IFieldDefinition } from '../backend/functions/src/services/sharepoint-service.js';
import {
  MY_PROJECTS_SOURCE_LIST_SCHEMA_DESCRIPTOR,
  type MyProjectsSourceListTarget,
} from '../backend/functions/src/services/my-projects/my-projects-source-list-schema.js';

export interface IProvisionArgs {
  readonly apply: boolean;
  readonly json: boolean;
  readonly siteUrl?: string;
}

export interface IProvisionTargetReport {
  readonly listTitle: string;
  readonly listFound: boolean;
  readonly plannedCreates: string[];
  readonly liveVerified: string[];
  readonly blockers: IUnresolvedMutation[];
  readonly appliedCreates: string[];
}

export interface IProvisionReport {
  readonly siteUrl: string;
  readonly apply: boolean;
  readonly startedAtUtc: string;
  readonly completedAtUtc: string;
  readonly identityLaneWarning: {
    readonly runtimeLane: string;
    readonly operatorLane: string;
    readonly note: string;
  };
  readonly targets: IProvisionTargetReport[];
  readonly hasBlockingDrift: boolean;
  readonly listsMissing: boolean;
  readonly applied: boolean;
  readonly success: boolean;
  readonly nextCommands: string[];
}

export interface IListRef {
  readonly title: string;
  listFields(): Promise<ILiveSharePointFieldSnapshot[]>;
  createField(field: MyProjectsSourceListTarget['fields'][number]): Promise<void>;
}

export interface IListAdapter {
  getList(listTitle: string): Promise<IListRef | null>;
}

export interface IMainDeps {
  readonly listAdapter: IListAdapter;
  readonly now: () => string;
  readonly stdout: (line: string) => void;
}

export function parseArgs(argv: readonly string[]): IProvisionArgs {
  let apply = false;
  let json = false;
  let siteUrl: string | undefined;

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
    if (token === '--site-url') {
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        throw new Error('Missing value for --site-url. Usage: --site-url <url>');
      }
      siteUrl = next;
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument '${token}'. Usage: [--apply] [--json] [--site-url <url>]`);
  }

  return { apply, json, siteUrl };
}

export function resolveSiteUrl(args: IProvisionArgs, env: NodeJS.ProcessEnv): string {
  const resolved = args.siteUrl ?? env.SHAREPOINT_PROJECTS_SITE_URL ?? env.SHAREPOINT_TENANT_URL;
  if (!resolved) {
    throw new Error(
      'Missing site URL. Provide --site-url or set SHAREPOINT_PROJECTS_SITE_URL / SHAREPOINT_TENANT_URL.',
    );
  }
  return resolved;
}

export function validateHBCentralSiteUrl(siteUrl: string): string {
  let parsed: URL;
  try {
    parsed = new URL(siteUrl);
  } catch {
    throw new Error(`Invalid site URL: ${siteUrl}`);
  }
  const hostOk = parsed.hostname.toLowerCase() === 'hedrickbrotherscom.sharepoint.com';
  const pathOk = parsed.pathname.toLowerCase().replace(/\/+$/, '') === '/sites/hbcentral';
  if (!hostOk || !pathOk) {
    throw new Error(
      `Site URL must be HBCentral: https://hedrickbrotherscom.sharepoint.com/sites/HBCentral (received: ${siteUrl})`,
    );
  }
  return `https://${parsed.hostname}/sites/HBCentral`;
}

function nextCommandsFor(
  report: Pick<IProvisionReport, 'siteUrl' | 'apply' | 'success' | 'hasBlockingDrift'>,
): string[] {
  const siteArg = `--site-url ${report.siteUrl}`;
  if (report.success && !report.apply) {
    return [
      `pnpm tsx scripts/provision-my-projects-source-list-schema.ts --apply ${siteArg} --json`,
      'pnpm tsx scripts/verify-my-project-role-fields.ts --json',
    ];
  }
  if (!report.success && report.hasBlockingDrift) {
    return [
      'Resolve wrong-type fields manually (no delete/recreate is performed by this script).',
      `pnpm tsx scripts/provision-my-projects-source-list-schema.ts ${siteArg} --json`,
    ];
  }
  return [
    `pnpm tsx scripts/provision-my-projects-source-list-schema.ts ${siteArg} --json`,
    'pnpm tsx scripts/verify-my-project-role-fields.ts --json',
  ];
}

export function buildProvisioningReport(input: {
  siteUrl: string;
  apply: boolean;
  startedAtUtc: string;
  completedAtUtc: string;
  targets: IProvisionTargetReport[];
}): IProvisionReport {
  const hasBlockingDrift = input.targets.some((t) => t.blockers.length > 0);
  const listsMissing = input.targets.some((t) => !t.listFound);
  const applied = input.apply && input.targets.some((t) => t.appliedCreates.length > 0);
  const success = !hasBlockingDrift && !listsMissing;

  const base = {
    siteUrl: input.siteUrl,
    apply: input.apply,
    startedAtUtc: input.startedAtUtc,
    completedAtUtc: input.completedAtUtc,
    identityLaneWarning: {
      runtimeLane:
        'Function App UAMI app-only token lane (ManagedIdentityTokenService/getPnPContext).',
      operatorLane:
        'HB SharePoint Creator app registration is a separate operator/deployment identity context.',
      note: 'Ensure app-only SharePoint permissions are granted to the runtime identity before using --apply.',
    },
    targets: input.targets,
    hasBlockingDrift,
    listsMissing,
    applied,
    success,
  };

  return {
    ...base,
    nextCommands: nextCommandsFor(base),
  };
}

export function selectExitCode(report: IProvisionReport): 0 | 1 {
  return report.success ? 0 : 1;
}

function formatReport(report: IProvisionReport, asJson: boolean): string {
  if (asJson) {
    return JSON.stringify(report, null, 2);
  }
  const lines: string[] = [];
  lines.push('[provision-my-projects-source-list-schema]');
  lines.push(`  siteUrl: ${report.siteUrl}`);
  lines.push(`  apply: ${report.apply}`);
  lines.push(`  success: ${report.success}`);
  lines.push(`  hasBlockingDrift: ${report.hasBlockingDrift}`);
  lines.push(`  listsMissing: ${report.listsMissing}`);
  lines.push('  identityLane:');
  lines.push(`    runtime: ${report.identityLaneWarning.runtimeLane}`);
  lines.push(`    operator: ${report.identityLaneWarning.operatorLane}`);
  lines.push('  targets:');
  for (const target of report.targets) {
    lines.push(`    - ${target.listTitle}`);
    lines.push(`      listFound: ${target.listFound}`);
    lines.push(`      plannedCreates: ${target.plannedCreates.join(', ') || '(none)'}`);
    lines.push(`      liveVerified: ${target.liveVerified.join(', ') || '(none)'}`);
    lines.push(`      blockers: ${target.blockers.length}`);
    lines.push(`      appliedCreates: ${target.appliedCreates.join(', ') || '(none)'}`);
  }
  lines.push('  nextCommands:');
  for (const command of report.nextCommands) {
    lines.push(`    - ${command}`);
  }
  return lines.join('\n');
}

async function reconcileTarget(
  target: MyProjectsSourceListTarget,
  apply: boolean,
  listAdapter: IListAdapter,
): Promise<IProvisionTargetReport> {
  const list = await listAdapter.getList(target.listTitle);
  if (!list) {
    return {
      listTitle: target.listTitle,
      listFound: false,
      plannedCreates: [],
      liveVerified: [],
      blockers: [],
      appliedCreates: [],
    };
  }

  const liveFields = await list.listFields();
  const { plans, unresolvedMutations } = buildListFieldPlans(list.title, target.fields, liveFields);

  const plannedCreates = plans
    .filter((plan) => plan.kind === 'create')
    .map((plan) => plan.field.internalName);
  const liveVerified = plans
    .filter((plan) => plan.kind === 'no-op')
    .map((plan) => plan.field.internalName);

  const appliedCreates: string[] = [];
  if (apply && unresolvedMutations.length === 0) {
    for (const plan of plans) {
      if (plan.kind === 'create') {
        await list.createField(plan.field);
        appliedCreates.push(plan.field.internalName);
      }
    }
  }

  return {
    listTitle: target.listTitle,
    listFound: true,
    plannedCreates,
    liveVerified,
    blockers: unresolvedMutations,
    appliedCreates,
  };
}

export async function main(args: IProvisionArgs, deps: IMainDeps, siteUrl: string): Promise<0 | 1> {
  const startedAtUtc = deps.now();
  const targetReports: IProvisionTargetReport[] = [];

  for (const target of MY_PROJECTS_SOURCE_LIST_SCHEMA_DESCRIPTOR.targets) {
    const report = await reconcileTarget(target, args.apply, deps.listAdapter);
    targetReports.push(report);
  }

  const precheckReport = buildProvisioningReport({
    siteUrl,
    apply: args.apply,
    startedAtUtc,
    completedAtUtc: deps.now(),
    targets: targetReports,
  });

  if (args.apply && (precheckReport.hasBlockingDrift || precheckReport.listsMissing)) {
    const refusalReport = {
      ...precheckReport,
      applied: false,
      success: false,
    } satisfies IProvisionReport;
    deps.stdout(formatReport(refusalReport, args.json));
    return 1;
  }

  const finalReport = buildProvisioningReport({
    siteUrl,
    apply: args.apply,
    startedAtUtc,
    completedAtUtc: deps.now(),
    targets: targetReports,
  });

  deps.stdout(formatReport(finalReport, args.json));
  return selectExitCode(finalReport);
}

export interface IRestListAdapterDeps {
  readonly siteUrl: string;
  readonly tokenService: { getSharePointToken: (siteUrl: string) => Promise<string> };
  readonly fetchImpl?: typeof fetch;
}

function fieldTypeKindFor(type: IFieldDefinition['type']): number {
  if (type === 'Text') return 2;
  if (type === 'MultiLineText') return 3;
  throw new Error(
    `provision-my-projects-source-list-schema: REST adapter does not support FieldTypeKind for IFieldDefinition.type='${type}'. ` +
      `Extend fieldTypeKindFor before adding such fields to the descriptor.`,
  );
}

async function readErrorBody(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.length > 400 ? `${text.slice(0, 400)}…` : text;
  } catch {
    return '<no body>';
  }
}

export function createRestListAdapter(deps: IRestListAdapterDeps): IListAdapter {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const listEndpoint = (listTitle: string): string =>
    `${deps.siteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(listTitle)}')`;

  return {
    async getList(listTitle: string): Promise<IListRef | null> {
      const token = await deps.tokenService.getSharePointToken(deps.siteUrl);
      const probe = await fetchImpl(`${listEndpoint(listTitle)}?$select=Title`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json;odata=nometadata',
        },
      });
      if (probe.status === 404) {
        return null;
      }
      if (!probe.ok) {
        const body = await readErrorBody(probe);
        throw new Error(
          `provision-my-projects-source-list-schema: list lookup failed for '${listTitle}' — HTTP ${probe.status}: ${body}`,
        );
      }
      return {
        title: listTitle,
        async listFields(): Promise<ILiveSharePointFieldSnapshot[]> {
          const innerToken = await deps.tokenService.getSharePointToken(deps.siteUrl);
          const url =
            `${listEndpoint(listTitle)}/fields` +
            `?$select=InternalName,Title,TypeAsString,Required,Indexed,DefaultValue,Choices&$top=5000`;
          const response = await fetchImpl(url, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${innerToken}`,
              Accept: 'application/json;odata=nometadata',
            },
          });
          if (!response.ok) {
            const body = await readErrorBody(response);
            throw new Error(
              `provision-my-projects-source-list-schema: field metadata query failed for list '${listTitle}' — HTTP ${response.status}: ${body}`,
            );
          }
          const payload = (await response.json()) as { value?: ReadonlyArray<unknown> };
          const rows = Array.isArray(payload.value) ? payload.value : [];
          const snapshots: ILiveSharePointFieldSnapshot[] = [];
          for (const raw of rows) {
            if (typeof raw !== 'object' || raw === null) continue;
            const row = raw as Record<string, unknown>;
            const internalName = row.InternalName;
            const title = row.Title;
            const typeAsString = row.TypeAsString;
            if (
              typeof internalName !== 'string' ||
              typeof title !== 'string' ||
              typeof typeAsString !== 'string'
            ) {
              continue;
            }
            snapshots.push({
              InternalName: internalName,
              Title: title,
              TypeAsString: typeAsString,
              Required: typeof row.Required === 'boolean' ? row.Required : undefined,
              Indexed: typeof row.Indexed === 'boolean' ? row.Indexed : undefined,
              DefaultValue: typeof row.DefaultValue === 'string' ? row.DefaultValue : undefined,
              Choices: Array.isArray(row.Choices)
                ? (row.Choices as unknown[]).filter((c): c is string => typeof c === 'string')
                : undefined,
            });
          }
          return snapshots;
        },
        async createField(field): Promise<void> {
          const innerToken = await deps.tokenService.getSharePointToken(deps.siteUrl);
          const url = `${listEndpoint(listTitle)}/fields/add`;
          const body = JSON.stringify({
            parameters: {
              __metadata: { type: 'SP.FieldCreationInformation' },
              FieldTypeKind: fieldTypeKindFor(field.type),
              Title: field.displayName,
              InternalName: field.internalName,
              Required: field.required ?? false,
              ...(field.type === 'MultiLineText' ? { RichText: false } : {}),
            },
          });
          const response = await fetchImpl(url, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${innerToken}`,
              Accept: 'application/json;odata=nometadata',
              'Content-Type': 'application/json;odata=verbose',
            },
            body,
          });
          if (!response.ok) {
            const errBody = await readErrorBody(response);
            throw new Error(
              `provision-my-projects-source-list-schema: field create failed for '${listTitle}'.'${field.internalName}' — HTTP ${response.status}: ${errBody}`,
            );
          }
        },
      };
    },
  };
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race<T>([
    p,
    new Promise<T>((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`${label} timed out after ${ms}ms`));
      }, ms);
    }),
  ]);
}

async function probeConnectivity(
  siteUrl: string,
  tokenService: { getSharePointToken: (siteUrl: string) => Promise<string> },
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const token = await tokenService.getSharePointToken(siteUrl);
  const response = await fetchImpl(`${siteUrl}/_api/web?$select=Url`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json;odata=nometadata',
    },
  });
  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new Error(
      `provision-my-projects-source-list-schema: SharePoint connectivity probe failed — HTTP ${response.status} at ${siteUrl}/_api/web: ${body}`,
    );
  }
}

async function runFromCli(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const siteUrl = validateHBCentralSiteUrl(resolveSiteUrl(args, process.env));

  const tokenService = new ManagedIdentityTokenService();

  // REST connectivity probe: a single GET against /_api/web. Fails fast and
  // loudly on any non-2xx (401/403/5xx) before iterating targets. Replaces
  // the prior PnPjs lazy-queryable probe which hung silently under
  // cert-backed app-only credentials.
  await probeConnectivity(siteUrl, tokenService);

  const code = await withTimeout(
    main(
      args,
      {
        listAdapter: createRestListAdapter({ siteUrl, tokenService }),
        now: () => new Date().toISOString(),
        stdout: (line) => console.log(line),
      },
      siteUrl,
    ),
    60_000,
    'main provisioning pass',
  );
  process.exit(code);
}

const invokedDirectly =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  process.argv[1].endsWith('provision-my-projects-source-list-schema.ts');

if (invokedDirectly) {
  process.on('unhandledRejection', (err) => {
    console.error(
      `provision-my-projects-source-list-schema: unhandled rejection — ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(1);
  });
  process.on('uncaughtException', (err) => {
    console.error(
      `provision-my-projects-source-list-schema: uncaught exception — ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(1);
  });
  runFromCli().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
