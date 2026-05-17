/**
 * Provisioner for the `My Projects Custom Links` SharePoint list on HBCentral.
 *
 * Default behavior is dry-run (plan + report only). `--apply` runs the
 * create-list-if-missing path and reconciles columns against
 * `MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR`. Wrong-type drift is reported as
 * a blocker and refuses `--apply` unless `--allow-type-drift` is supplied.
 *
 * Operator usage:
 *
 *   pnpm tsx scripts/provision-my-projects-custom-links.ts                  # dry-run (text)
 *   pnpm tsx scripts/provision-my-projects-custom-links.ts --json           # dry-run (JSON)
 *   pnpm tsx scripts/provision-my-projects-custom-links.ts --apply --json   # create+reconcile
 *
 * Auth: SHAREPOINT_BEARER_TOKEN for local operator runs; otherwise
 * DefaultAzureCredential (in production AZURE_CLIENT_ID must be set to the
 * user-assigned MI client id). See
 * `docs/how-to/administrator/provision-my-projects-custom-links.md`.
 */

import type {
  IFieldDefinition,
  IListDefinition,
} from '../backend/functions/src/services/sharepoint-service.js';
import type {
  ILiveSharePointFieldSnapshot,
  IUnresolvedMutation,
} from '../backend/functions/src/services/sharepoint-schema-provisioning/index.js';
import { buildListFieldPlans } from '../backend/functions/src/services/sharepoint-schema-provisioning/index.js';
import {
  MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR,
  MY_PROJECTS_CUSTOM_LINKS_LIST_TITLE,
  getMyProjectsCustomLinksListHostSiteUrl,
} from '../backend/functions/src/services/my-projects-custom-links/list-descriptor.js';

export interface IProvisionArgs {
  readonly apply: boolean;
  readonly json: boolean;
  readonly allowTypeDrift: boolean;
  readonly siteUrl?: string;
}

export interface IProvisionTargetReport {
  readonly listTitle: string;
  readonly listFound: boolean;
  readonly createdList: boolean;
  readonly plannedCreates: string[];
  readonly liveVerified: string[];
  readonly plannedUpdates: string[];
  readonly blockers: IUnresolvedMutation[];
  readonly appliedCreates: string[];
  readonly appliedUpdates: string[];
}

export interface IProvisionReport {
  readonly siteUrl: string;
  readonly apply: boolean;
  readonly allowTypeDrift: boolean;
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
  createField(field: IFieldDefinition): Promise<void>;
  applyFieldSettingsUpdates(
    fieldInternalName: string,
    updates: {
      required?: boolean;
      indexed?: boolean;
      defaultValue?: string;
      choices?: string[];
    },
  ): Promise<void>;
}

export interface IListAdapter {
  getList(listTitle: string): Promise<IListRef | null>;
  createList(descriptor: IListDefinition): Promise<IListRef>;
}

export interface IMainDeps {
  readonly listAdapter: IListAdapter;
  readonly now: () => string;
  readonly stdout: (line: string) => void;
}

export function parseArgs(argv: readonly string[]): IProvisionArgs {
  let apply = false;
  let json = false;
  let allowTypeDrift = false;
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
    if (token === '--allow-type-drift') {
      allowTypeDrift = true;
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
    throw new Error(
      `Unknown argument '${token}'. Usage: [--apply] [--json] [--allow-type-drift] [--site-url <url>]`,
    );
  }

  return { apply, json, allowTypeDrift, siteUrl };
}

export function resolveSiteUrl(args: IProvisionArgs, env: NodeJS.ProcessEnv): string {
  const resolved =
    args.siteUrl ??
    env.SHAREPOINT_PROJECTS_SITE_URL ??
    env.SHAREPOINT_TENANT_URL ??
    getMyProjectsCustomLinksListHostSiteUrl();
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
      `pnpm tsx scripts/provision-my-projects-custom-links.ts --apply ${siteArg} --json`,
      'pnpm tsx scripts/verify-my-projects-custom-links.ts --json',
    ];
  }
  if (!report.success && report.hasBlockingDrift) {
    return [
      'Resolve wrong-type fields manually (no delete/recreate is performed by this script).',
      `pnpm tsx scripts/provision-my-projects-custom-links.ts ${siteArg} --json`,
    ];
  }
  return [
    `pnpm tsx scripts/provision-my-projects-custom-links.ts ${siteArg} --json`,
    'pnpm tsx scripts/verify-my-projects-custom-links.ts --json',
  ];
}

export function buildProvisioningReport(input: {
  siteUrl: string;
  apply: boolean;
  allowTypeDrift: boolean;
  startedAtUtc: string;
  completedAtUtc: string;
  targets: IProvisionTargetReport[];
}): IProvisionReport {
  const hasBlockingDrift = input.targets.some((t) => t.blockers.length > 0);
  const listsMissing = input.targets.some((t) => !t.listFound);
  const applied =
    input.apply &&
    input.targets.some(
      (t) => t.appliedCreates.length > 0 || t.appliedUpdates.length > 0 || t.createdList,
    );
  const driftIsBlocking = hasBlockingDrift && !input.allowTypeDrift;
  const success = !driftIsBlocking && !listsMissing;

  const base = {
    siteUrl: input.siteUrl,
    apply: input.apply,
    allowTypeDrift: input.allowTypeDrift,
    startedAtUtc: input.startedAtUtc,
    completedAtUtc: input.completedAtUtc,
    identityLaneWarning: {
      runtimeLane:
        'Function App UAMI app-only token lane (ManagedIdentityTokenService/getPnPContext).',
      operatorLane:
        'HB SharePoint Creator app registration is a separate operator/deployment identity context. Local runs may use SHAREPOINT_BEARER_TOKEN.',
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

export function formatReport(report: IProvisionReport, asJson: boolean): string {
  if (asJson) {
    return JSON.stringify(report, null, 2);
  }
  const lines: string[] = [];
  lines.push('[provision-my-projects-custom-links]');
  lines.push(`  siteUrl: ${report.siteUrl}`);
  lines.push(`  apply: ${report.apply}`);
  lines.push(`  allowTypeDrift: ${report.allowTypeDrift}`);
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
    lines.push(`      createdList: ${target.createdList}`);
    lines.push(`      plannedCreates: ${target.plannedCreates.join(', ') || '(none)'}`);
    lines.push(`      plannedUpdates: ${target.plannedUpdates.join(', ') || '(none)'}`);
    lines.push(`      liveVerified: ${target.liveVerified.join(', ') || '(none)'}`);
    lines.push(`      blockers: ${target.blockers.length}`);
    lines.push(`      appliedCreates: ${target.appliedCreates.join(', ') || '(none)'}`);
    lines.push(`      appliedUpdates: ${target.appliedUpdates.join(', ') || '(none)'}`);
  }
  lines.push('  nextCommands:');
  for (const command of report.nextCommands) {
    lines.push(`    - ${command}`);
  }
  return lines.join('\n');
}

async function reconcileTarget(
  descriptor: IListDefinition,
  args: IProvisionArgs,
  listAdapter: IListAdapter,
): Promise<IProvisionTargetReport> {
  let list = await listAdapter.getList(descriptor.title);
  let createdList = false;

  if (!list) {
    if (!args.apply) {
      return {
        listTitle: descriptor.title,
        listFound: false,
        createdList: false,
        plannedCreates: descriptor.fields.map((f) => f.internalName),
        plannedUpdates: [],
        liveVerified: [],
        blockers: [],
        appliedCreates: [],
        appliedUpdates: [],
      };
    }
    list = await listAdapter.createList(descriptor);
    createdList = true;
  }

  const liveFields = await list.listFields();
  const { plans, unresolvedMutations } = buildListFieldPlans(
    list.title,
    descriptor.fields,
    liveFields,
  );

  const plannedCreates = plans
    .filter((plan) => plan.kind === 'create')
    .map((plan) => plan.field.internalName);
  const liveVerified = plans
    .filter((plan) => plan.kind === 'no-op')
    .map((plan) => plan.field.internalName);
  const plannedUpdates = plans
    .filter((plan) => plan.kind === 'update-settings')
    .map((plan) => plan.field.internalName);

  const appliedCreates: string[] = [];
  const appliedUpdates: string[] = [];
  const driftBlocks = unresolvedMutations.length > 0 && !args.allowTypeDrift;
  if (args.apply && !driftBlocks) {
    for (const plan of plans) {
      if (plan.kind === 'create') {
        await list.createField(plan.field);
        appliedCreates.push(plan.field.internalName);
        continue;
      }
      if (plan.kind === 'update-settings') {
        await list.applyFieldSettingsUpdates(plan.field.internalName, plan.updates);
        appliedUpdates.push(plan.field.internalName);
        continue;
      }
    }
  }

  return {
    listTitle: descriptor.title,
    listFound: true,
    createdList,
    plannedCreates,
    plannedUpdates,
    liveVerified,
    blockers: unresolvedMutations,
    appliedCreates,
    appliedUpdates,
  };
}

export async function main(args: IProvisionArgs, deps: IMainDeps, siteUrl: string): Promise<0 | 1> {
  const startedAtUtc = deps.now();
  const target = await reconcileTarget(
    MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR,
    args,
    deps.listAdapter,
  );
  const completedAtUtc = deps.now();
  const report = buildProvisioningReport({
    siteUrl,
    apply: args.apply,
    allowTypeDrift: args.allowTypeDrift,
    startedAtUtc,
    completedAtUtc,
    targets: [target],
  });
  deps.stdout(formatReport(report, args.json));
  return selectExitCode(report);
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

async function runFromCli(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const siteUrl = validateHBCentralSiteUrl(resolveSiteUrl(args, process.env));
  // Dynamic import keeps PnPjs/@azure/identity off the test-time import graph.
  const { createPnPListAdapter, resolveSharePointBearerToken } =
    await import('../backend/functions/src/services/my-projects-custom-links/pnp-list-adapter.js');
  const adapter = createPnPListAdapter({
    hostSiteUrl: siteUrl,
    bearerTokenResolver: () => resolveSharePointBearerToken(siteUrl),
  });
  const code = await withTimeout(
    main(
      args,
      {
        listAdapter: adapter,
        now: () => new Date().toISOString(),
        stdout: (line) => console.log(line),
      },
      siteUrl,
    ),
    180_000,
    `provisioning '${MY_PROJECTS_CUSTOM_LINKS_LIST_TITLE}'`,
  );
  process.exit(code);
}

const invokedDirectly =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  process.argv[1].endsWith('provision-my-projects-custom-links.ts');

if (invokedDirectly) {
  process.on('unhandledRejection', (err) => {
    console.error(
      `provision-my-projects-custom-links: unhandled rejection — ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(1);
  });
  process.on('uncaughtException', (err) => {
    console.error(
      `provision-my-projects-custom-links: uncaught exception — ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(1);
  });
  runFromCli().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
