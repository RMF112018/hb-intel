/**
 * Destructive remediation utility for the 13 wrong-type role-array fields on
 * the HBCentral `Projects` list.
 *
 * Scope is intentionally narrow: this script ONLY targets the 13 internal
 * names listed in `PROJECTS_WRONG_TYPE_REMEDIATION_INTERNAL_NAMES`. It is the
 * bounded delete-and-recreate utility that the source-list provisioner
 * intentionally refuses to perform.
 *
 * Operator usage:
 *
 *   pnpm tsx scripts/remediate-my-projects-projects-role-field-types.ts \
 *     --json --site-url https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
 *
 *   pnpm tsx scripts/remediate-my-projects-projects-role-field-types.ts \
 *     --apply --json --site-url https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
 *
 * Refer to the in-tree provisioner (`provision-my-projects-source-list-schema.ts`)
 * for the established REST transport lane; this script reuses the same
 * `ManagedIdentityTokenService`, error-body redaction, HBCentral site-URL
 * lock pattern, and `withTimeout` posture.
 */

import { ManagedIdentityTokenService } from '../backend/functions/src/services/managed-identity-token-service.js';
import { PROJECTS_LIST_NAME } from '../backend/functions/src/services/projects-list-contract.js';
import type { IFieldDefinition } from '../backend/functions/src/services/sharepoint-service.js';
import { MY_PROJECTS_SOURCE_LIST_ROLE_FIELDS } from '../backend/functions/src/services/my-projects/my-projects-source-list-schema.js';

// -------------------------------------------------------------------------
// Approved destructive remediation manifest
// -------------------------------------------------------------------------

/**
 * Explicit, hand-curated 13-field destructive remediation set. Stable scope:
 * does NOT derive from `MY_PROJECTS_SOURCE_LIST_ROLE_FIELDS`, so later
 * changes to the canonical descriptor cannot silently widen the destructive
 * set. `warrantyManagerUpns` is intentionally excluded — it is currently
 * missing on Projects and is the source-list provisioner's responsibility.
 */
export const PROJECTS_WRONG_TYPE_REMEDIATION_INTERNAL_NAMES = Object.freeze([
  'leadEstimatorUpns',
  'estimatorUpns',
  'idsManagerUpns',
  'projectAccountantUpns',
  'projectAdministratorUpns',
  'projectCoordinatorUpns',
  'superintendentUpns',
  'leadSuperintendentUpns',
  'projectManagerUpns',
  'leadProjectManagerUpns',
  'projectExecutiveUpns',
  'safetyCoordinatorUpns',
  'qcManagerUpns',
] as const);

export type ProjectsRemediationInternalName =
  (typeof PROJECTS_WRONG_TYPE_REMEDIATION_INTERNAL_NAMES)[number];

export const PROJECTS_REMEDIATION_FIELD_COUNT = 13;

/**
 * Cross-checked destructive remediation manifest. Resolves `displayName` and
 * confirms `MultiLineText` posture from the canonical descriptor so the
 * recreated fields match the existing role-field contract. Throws at module
 * load if the canonical descriptor drifts (missing entry, downgraded type).
 */
export const PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST: readonly IFieldDefinition[] = Object.freeze(
  PROJECTS_WRONG_TYPE_REMEDIATION_INTERNAL_NAMES.map((internalName) => {
    const canonical = MY_PROJECTS_SOURCE_LIST_ROLE_FIELDS.find(
      (f) => f.internalName === internalName,
    );
    if (!canonical) {
      throw new Error(
        `remediate-my-projects-projects-role-field-types: internalName '${internalName}' ` +
          `not found in MY_PROJECTS_SOURCE_LIST_ROLE_FIELDS — canonical descriptor drift.`,
      );
    }
    if (canonical.type !== 'MultiLineText') {
      throw new Error(
        `remediate-my-projects-projects-role-field-types: canonical type for ` +
          `'${internalName}' is '${canonical.type}', expected 'MultiLineText' — ` +
          `refusing to load remediation script.`,
      );
    }
    return Object.freeze({
      internalName,
      displayName: canonical.displayName,
      type: 'MultiLineText' as const,
      required: false,
      indexed: false,
    });
  }),
);

if (PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST.length !== PROJECTS_REMEDIATION_FIELD_COUNT) {
  throw new Error(
    `remediate-my-projects-projects-role-field-types: manifest length ` +
      `${PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST.length} !== expected ` +
      `${PROJECTS_REMEDIATION_FIELD_COUNT}`,
  );
}

// -------------------------------------------------------------------------
// CLI argument parsing
// -------------------------------------------------------------------------

export interface IRemediationArgs {
  readonly apply: boolean;
  readonly json: boolean;
  readonly siteUrl?: string;
}

export function parseArgs(argv: readonly string[]): IRemediationArgs {
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

export function resolveSiteUrl(args: IRemediationArgs, env: NodeJS.ProcessEnv): string {
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

// -------------------------------------------------------------------------
// Adapter seam (decouples planner/executor from REST transport)
// -------------------------------------------------------------------------

export interface ILiveFieldSnapshot {
  readonly InternalName: string;
  readonly Title: string;
  readonly TypeAsString: string;
}

export interface IRemediationListRef {
  readonly title: string;
  listFields(): Promise<readonly ILiveFieldSnapshot[]>;
  deleteField(internalName: string): Promise<void>;
  createField(field: IFieldDefinition): Promise<void>;
}

export interface IRemediationListAdapter {
  getList(listTitle: string): Promise<IRemediationListRef | null>;
}

// -------------------------------------------------------------------------
// Planner — pure
// -------------------------------------------------------------------------

export type IRemediationBlocker =
  | { readonly kind: 'list-missing'; readonly listTitle: string }
  | { readonly kind: 'missing'; readonly internalName: string }
  | { readonly kind: 'already-note'; readonly internalName: string }
  | { readonly kind: 'unexpected-type'; readonly internalName: string; readonly observedType: string }
  | { readonly kind: 'duplicate-match'; readonly internalName: string; readonly matchCount: number }
  | { readonly kind: 'count-mismatch'; readonly expected: number; readonly observed: number };

export interface IRemediationPlan {
  readonly plannedDeletes: readonly string[];
  readonly plannedCreates: readonly string[];
  readonly blockers: readonly IRemediationBlocker[];
  readonly safeToApply: boolean;
}

export function buildRemediationPlan(
  approved: readonly IFieldDefinition[],
  liveFields: readonly ILiveFieldSnapshot[],
): IRemediationPlan {
  const blockers: IRemediationBlocker[] = [];
  const approvedNames = approved.map((f) => f.internalName);
  const approvedNameSet = new Set(approvedNames);

  const liveMatching = new Map<string, ILiveFieldSnapshot[]>();
  for (const live of liveFields) {
    if (approvedNameSet.has(live.InternalName)) {
      const bucket = liveMatching.get(live.InternalName) ?? [];
      bucket.push(live);
      liveMatching.set(live.InternalName, bucket);
    }
  }

  for (const name of approvedNames) {
    const matches = liveMatching.get(name) ?? [];
    if (matches.length === 0) {
      blockers.push({ kind: 'missing', internalName: name });
      continue;
    }
    if (matches.length > 1) {
      blockers.push({ kind: 'duplicate-match', internalName: name, matchCount: matches.length });
      continue;
    }
    const live = matches[0]!;
    if (live.TypeAsString === 'Note') {
      blockers.push({ kind: 'already-note', internalName: name });
      continue;
    }
    if (live.TypeAsString !== 'Text') {
      blockers.push({
        kind: 'unexpected-type',
        internalName: name,
        observedType: live.TypeAsString,
      });
      continue;
    }
  }

  // Defense-in-depth: total matching live rows must equal approved count.
  // (Per-name guards above already cover missing/duplicate, but this
  // explicit count guard satisfies the prompt's "fewer or more target
  // field matches than expected" refusal condition unambiguously.)
  const totalMatches = Array.from(liveMatching.values()).reduce(
    (acc, bucket) => acc + bucket.length,
    0,
  );
  if (blockers.length === 0 && totalMatches !== approvedNames.length) {
    blockers.push({
      kind: 'count-mismatch',
      expected: approvedNames.length,
      observed: totalMatches,
    });
  }

  const safeToApply = blockers.length === 0;
  return {
    plannedDeletes: safeToApply ? approvedNames : [],
    plannedCreates: safeToApply ? approvedNames : [],
    blockers,
    safeToApply,
  };
}

// -------------------------------------------------------------------------
// Executor — destructive
// -------------------------------------------------------------------------

export interface IPostVerificationEntry {
  readonly internalName: string;
  readonly typeAsString: string;
  readonly verified: boolean;
}

export interface IApplyFailure {
  readonly stage: 'delete' | 'create' | 'post-verify';
  readonly internalName?: string;
  readonly message: string;
}

export interface IApplyOutcome {
  readonly appliedDeletes: readonly string[];
  readonly appliedCreates: readonly string[];
  readonly postVerification: readonly IPostVerificationEntry[] | null;
  readonly failure: IApplyFailure | null;
}

function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export async function executeRemediation(
  list: IRemediationListRef,
  approved: readonly IFieldDefinition[],
): Promise<IApplyOutcome> {
  const appliedDeletes: string[] = [];
  const appliedCreates: string[] = [];

  for (const field of approved) {
    try {
      await list.deleteField(field.internalName);
      appliedDeletes.push(field.internalName);
    } catch (err) {
      return {
        appliedDeletes,
        appliedCreates,
        postVerification: null,
        failure: { stage: 'delete', internalName: field.internalName, message: errMessage(err) },
      };
    }
  }

  for (const field of approved) {
    try {
      await list.createField(field);
      appliedCreates.push(field.internalName);
    } catch (err) {
      return {
        appliedDeletes,
        appliedCreates,
        postVerification: null,
        failure: { stage: 'create', internalName: field.internalName, message: errMessage(err) },
      };
    }
  }

  let postSnapshot: readonly ILiveFieldSnapshot[];
  try {
    postSnapshot = await list.listFields();
  } catch (err) {
    return {
      appliedDeletes,
      appliedCreates,
      postVerification: null,
      failure: { stage: 'post-verify', message: errMessage(err) },
    };
  }

  const postVerification: IPostVerificationEntry[] = approved.map((field) => {
    const live = postSnapshot.find((row) => row.InternalName === field.internalName);
    return {
      internalName: field.internalName,
      typeAsString: live?.TypeAsString ?? '(absent)',
      verified: live?.TypeAsString === 'Note',
    };
  });

  const unverified = postVerification.filter((p) => !p.verified);
  if (unverified.length > 0) {
    return {
      appliedDeletes,
      appliedCreates,
      postVerification,
      failure: {
        stage: 'post-verify',
        message:
          `Post-verification failed for ${unverified.length} field(s): ` +
          unverified.map((u) => `${u.internalName}=${u.typeAsString}`).join(', '),
      },
    };
  }

  return {
    appliedDeletes,
    appliedCreates,
    postVerification,
    failure: null,
  };
}

// -------------------------------------------------------------------------
// Report shape + main
// -------------------------------------------------------------------------

export interface IRemediationReport {
  readonly siteUrl: string;
  readonly listTitle: string;
  readonly apply: boolean;
  readonly safeToApply: boolean;
  readonly plannedDeletes: readonly string[];
  readonly plannedCreates: readonly string[];
  readonly blockers: readonly IRemediationBlocker[];
  readonly appliedDeletes: readonly string[];
  readonly appliedCreates: readonly string[];
  readonly postVerification: readonly IPostVerificationEntry[] | null;
  readonly failure: IApplyFailure | null;
  readonly startedAtUtc: string;
  readonly completedAtUtc: string;
  readonly success: boolean;
}

export function selectExitCode(report: IRemediationReport): 0 | 1 {
  return report.success ? 0 : 1;
}

function formatReport(report: IRemediationReport, asJson: boolean): string {
  if (asJson) {
    return JSON.stringify(report, null, 2);
  }
  const lines: string[] = [];
  lines.push('[remediate-my-projects-projects-role-field-types]');
  lines.push(`  siteUrl: ${report.siteUrl}`);
  lines.push(`  listTitle: ${report.listTitle}`);
  lines.push(`  apply: ${report.apply}`);
  lines.push(`  safeToApply: ${report.safeToApply}`);
  lines.push(`  success: ${report.success}`);
  lines.push(`  plannedDeletes: ${report.plannedDeletes.length}`);
  lines.push(`  plannedCreates: ${report.plannedCreates.length}`);
  lines.push(`  appliedDeletes: ${report.appliedDeletes.length}`);
  lines.push(`  appliedCreates: ${report.appliedCreates.length}`);
  lines.push(`  blockers: ${report.blockers.length}`);
  for (const b of report.blockers) {
    lines.push(`    - ${JSON.stringify(b)}`);
  }
  if (report.postVerification) {
    lines.push('  postVerification:');
    for (const p of report.postVerification) {
      lines.push(`    - ${p.internalName}=${p.typeAsString} (verified=${p.verified})`);
    }
  }
  if (report.failure) {
    const tail = report.failure.internalName
      ? ` internalName=${report.failure.internalName}`
      : '';
    lines.push(`  failure: stage=${report.failure.stage}${tail}`);
    lines.push(`    message: ${report.failure.message}`);
  }
  return lines.join('\n');
}

export interface IMainDeps {
  readonly listAdapter: IRemediationListAdapter;
  readonly now: () => string;
  readonly stdout: (line: string) => void;
}

export async function main(
  args: IRemediationArgs,
  deps: IMainDeps,
  siteUrl: string,
): Promise<0 | 1> {
  const startedAtUtc = deps.now();
  const listTitle = PROJECTS_LIST_NAME;

  const list = await deps.listAdapter.getList(listTitle);
  if (!list) {
    const report: IRemediationReport = {
      siteUrl,
      listTitle,
      apply: args.apply,
      safeToApply: false,
      plannedDeletes: [],
      plannedCreates: [],
      blockers: [{ kind: 'list-missing', listTitle }],
      appliedDeletes: [],
      appliedCreates: [],
      postVerification: null,
      failure: null,
      startedAtUtc,
      completedAtUtc: deps.now(),
      success: false,
    };
    deps.stdout(formatReport(report, args.json));
    return 1;
  }

  const liveFields = await list.listFields();
  const plan = buildRemediationPlan(PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST, liveFields);

  if (!args.apply || !plan.safeToApply) {
    const report: IRemediationReport = {
      siteUrl,
      listTitle,
      apply: args.apply,
      safeToApply: plan.safeToApply,
      plannedDeletes: plan.plannedDeletes,
      plannedCreates: plan.plannedCreates,
      blockers: plan.blockers,
      appliedDeletes: [],
      appliedCreates: [],
      postVerification: null,
      failure: null,
      startedAtUtc,
      completedAtUtc: deps.now(),
      success: !args.apply ? plan.safeToApply : false,
    };
    deps.stdout(formatReport(report, args.json));
    return selectExitCode(report);
  }

  const outcome = await executeRemediation(list, PROJECTS_WRONG_TYPE_REMEDIATION_MANIFEST);
  const success = outcome.failure === null;
  const report: IRemediationReport = {
    siteUrl,
    listTitle,
    apply: true,
    safeToApply: true,
    plannedDeletes: plan.plannedDeletes,
    plannedCreates: plan.plannedCreates,
    blockers: [],
    appliedDeletes: outcome.appliedDeletes,
    appliedCreates: outcome.appliedCreates,
    postVerification: outcome.postVerification,
    failure: outcome.failure,
    startedAtUtc,
    completedAtUtc: deps.now(),
    success,
  };
  deps.stdout(formatReport(report, args.json));
  return selectExitCode(report);
}

// -------------------------------------------------------------------------
// REST adapter
// -------------------------------------------------------------------------

export interface IRestRemediationAdapterDeps {
  readonly siteUrl: string;
  readonly tokenService: { getSharePointToken: (siteUrl: string) => Promise<string> };
  readonly fetchImpl?: typeof fetch;
}

async function readErrorBody(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.length > 400 ? `${text.slice(0, 400)}…` : text;
  } catch {
    return '<no body>';
  }
}

export function createRestRemediationAdapter(
  deps: IRestRemediationAdapterDeps,
): IRemediationListAdapter {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const listEndpoint = (listTitle: string): string =>
    `${deps.siteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(listTitle)}')`;

  return {
    async getList(listTitle: string): Promise<IRemediationListRef | null> {
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
          `remediate-my-projects-projects-role-field-types: list lookup failed for '${listTitle}' — HTTP ${probe.status}: ${body}`,
        );
      }

      return {
        title: listTitle,
        async listFields(): Promise<readonly ILiveFieldSnapshot[]> {
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
              `remediate-my-projects-projects-role-field-types: field metadata query failed for list '${listTitle}' — HTTP ${response.status}: ${body}`,
            );
          }
          const payload = (await response.json()) as { value?: ReadonlyArray<unknown> };
          const rows = Array.isArray(payload.value) ? payload.value : [];
          const snapshots: ILiveFieldSnapshot[] = [];
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
            });
          }
          return snapshots;
        },
        async deleteField(internalName: string): Promise<void> {
          const innerToken = await deps.tokenService.getSharePointToken(deps.siteUrl);
          // POST-tunneled DELETE is the safest envelope under SharePoint REST
          // app-only OAuth — some tenants reject the bare DELETE verb on field
          // endpoints. `IF-MATCH: *` matches any ETag.
          const url = `${listEndpoint(listTitle)}/fields/getByInternalNameOrTitle('${encodeURIComponent(internalName)}')`;
          const response = await fetchImpl(url, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${innerToken}`,
              Accept: 'application/json;odata=nometadata',
              'X-HTTP-Method': 'DELETE',
              'IF-MATCH': '*',
            },
          });
          if (!response.ok) {
            const body = await readErrorBody(response);
            throw new Error(
              `remediate-my-projects-projects-role-field-types: field delete failed for '${listTitle}'.'${internalName}' — HTTP ${response.status}: ${body}`,
            );
          }
        },
        async createField(field): Promise<void> {
          if (field.type !== 'MultiLineText') {
            throw new Error(
              `remediate-my-projects-projects-role-field-types: REST adapter only recreates MultiLineText; received '${field.type}'.`,
            );
          }
          const innerToken = await deps.tokenService.getSharePointToken(deps.siteUrl);
          const url = `${listEndpoint(listTitle)}/fields/add`;
          const body = JSON.stringify({
            parameters: {
              __metadata: { type: 'SP.FieldCreationInformation' },
              FieldTypeKind: 3,
              Title: field.displayName,
              InternalName: field.internalName,
              Required: field.required ?? false,
              RichText: false,
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
              `remediate-my-projects-projects-role-field-types: field create failed for '${listTitle}'.'${field.internalName}' — HTTP ${response.status}: ${errBody}`,
            );
          }
        },
      };
    },
  };
}

// -------------------------------------------------------------------------
// CLI bootstrap
// -------------------------------------------------------------------------

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
      `remediate-my-projects-projects-role-field-types: SharePoint connectivity probe failed — HTTP ${response.status} at ${siteUrl}/_api/web: ${body}`,
    );
  }
}

async function runFromCli(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const siteUrl = validateHBCentralSiteUrl(resolveSiteUrl(args, process.env));

  const tokenService = new ManagedIdentityTokenService();
  await probeConnectivity(siteUrl, tokenService);

  const code = await withTimeout(
    main(
      args,
      {
        listAdapter: createRestRemediationAdapter({ siteUrl, tokenService }),
        now: () => new Date().toISOString(),
        stdout: (line) => console.log(line),
      },
      siteUrl,
    ),
    60_000,
    'main remediation pass',
  );
  process.exit(code);
}

const invokedDirectly =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  process.argv[1].endsWith('remediate-my-projects-projects-role-field-types.ts');

if (invokedDirectly) {
  process.on('unhandledRejection', (err) => {
    console.error(
      `remediate-my-projects-projects-role-field-types: unhandled rejection — ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(1);
  });
  process.on('uncaughtException', (err) => {
    console.error(
      `remediate-my-projects-projects-role-field-types: uncaught exception — ${err instanceof Error ? err.message : String(err)}`,
    );
    process.exit(1);
  });
  runFromCli().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
