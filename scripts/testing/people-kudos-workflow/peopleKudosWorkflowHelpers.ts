/**
 * Preliminary People & Culture + HB Kudos workflow test harness — helpers.
 *
 * Zero-dependency implementation: uses Node's built-in `fetch` plus a
 * pluggable bearer-token source. The companion design doc
 * (`docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/
 * people-kudos-preliminary-workflow-test-harness.md`) explains WHY this
 * harness does not depend on `@pnp/sp` / `@azure/identity`:
 *
 *   1. Those packages are installed under `backend/functions/` and do not
 *      resolve from the repo root, where `tsx` runs from.
 *   2. Interactive Azure CLI cannot mint a SharePoint-authorized token in
 *      this tenant (`AADSTS65002` preauthorization). So the established
 *      `scripts/create-*-list.ts` pattern that uses `DefaultAzureCredential`
 *      is viable only in non-interactive contexts (service principal /
 *      managed identity).
 *
 * This harness therefore accepts a bearer token from whichever caller can
 * produce one — a preauthorized service principal, a managed identity, or a
 * local PnP.PowerShell interactive session passing the token via env var —
 * and keeps the harness itself fully portable and auditable.
 *
 * Harness scope:
 *   - People Culture Kudos (schema proven; full lifecycle)
 *   - Kudos Audit Events  (schema proven; audit journal parity)
 *   - People Culture Announcements (schema UNPROVEN; --discover only)
 *   - People Culture Celebrations  (schema UNPROVEN; --discover only)
 *
 * Safety invariant: every synthetic row has
 *   `KudosId  = TEST-HBI-{runId}-{seq}`
 *   `Headline = [TEST][HBI] {runId} {seq} {label}`
 * Cleanup queries by exact `KudosId startswith 'TEST-HBI-{runId}-'` and
 * cannot ever touch rows it did not create.
 */

import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';

/* ─── Types ───────────────────────────────────────────────────────────── */

export type WorkflowStatus =
  | 'pending'
  | 'revisionRequested'
  | 'approved'
  | 'approvedScheduled'
  | 'rejected'
  | 'withdrawn'
  | 'removedUnpublished';

export type ProminenceIntent = 'standard' | 'pinned' | 'featured';

export type VisibilityMode = 'public' | 'associatedOnly' | 'internalOnly';

export type KudosEventType =
  | 'submit'
  | 'approve'
  | 'reject'
  | 'revisionRequested'
  | 'reopen'
  | 'remove'
  | 'restore'
  | 'flagAdminReview'
  | 'clearAdminReview'
  | 'claim'
  | 'reassign'
  | 'schedule'
  | 'unschedule'
  | 'feature'
  | 'unfeature'
  | 'pin'
  | 'unpin'
  | 'celebrate';

export interface HarnessConfig {
  /** Absolute tenant-scoped site URL, e.g. https://hedrickbrotherscom.sharepoint.com/sites/HBCentral */
  siteUrl: string;
  /** List titles (match live SharePoint display names exactly). */
  lists: {
    peopleCultureKudos: string;
    kudosAuditEvents: string;
    peopleCultureAnnouncements: string;
    peopleCultureCelebrations: string;
  };
  /** Deterministic test-data marker. Must remain stable across runs for cleanup. */
  testPrefix: string;
  /** When true, perform a final cleanup pass over synthetic rows. */
  cleanup: boolean;
  /** When true, also verify audit-journal parity for each Kudos transition. */
  auditParity: boolean;
  /** Phase-14 docs directory for --discover output. */
  docsDir: string;
}

export interface RunContext {
  config: HarnessConfig;
  runId: string;
  dryRun: boolean;
  verbose: boolean;
  /** Lazy token accessor — never called in dry-run mode. */
  getToken(): Promise<string>;
  currentUserId?: number;
  /** Collected synthetic item ids for cleanup. */
  createdKudosItemIds: number[];
  createdAuditItemIds: number[];
  /** Structured step results. */
  results: StepResult[];
}

export type StepStatus = 'pass' | 'fail' | 'warn' | 'skip' | 'dry';

export interface StepResult {
  step: string;
  status: StepStatus;
  detail?: string;
  evidence?: Record<string, unknown>;
}

export interface KudosDraftInput {
  kudosId: string;
  headline: string;
  excerpt: string;
  details: string;
  submittedByUserId?: number;
  publishStartIso: string;
  publishEndIso: string;
}

/* ─── Run identity + prefix helpers ───────────────────────────────────── */

export function generateRunId(): string {
  const iso = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const tag = randomBytes(3).toString('hex');
  return `hbi-${iso}-${tag}`;
}

export function buildSyntheticKudosId(runId: string, seq: number): string {
  return `TEST-HBI-${runId}-${String(seq).padStart(3, '0')}`;
}

export function buildSyntheticHeadline(runId: string, seq: number, label: string): string {
  return `[TEST][HBI] ${runId} ${String(seq).padStart(3, '0')} ${label}`;
}

export function buildSyntheticPrefix(runId: string): string {
  return `TEST-HBI-${runId}-`;
}

/* ─── Token sources ───────────────────────────────────────────────────── */

/**
 * Resolve a SharePoint-scoped bearer token from one of three sources in
 * priority order:
 *
 *   1. `SHAREPOINT_BEARER_TOKEN` env var (already-minted token; trust the
 *      caller completely).
 *   2. `--token <...>` CLI argument passed through env forwarder.
 *   3. `az account get-access-token --resource <site-origin>` fallback
 *      (works only in environments where the CLI client is preauthorized
 *      on SharePoint — in this tenant it is currently not, which is why
 *      the other two paths are the supported ones).
 *
 * The harness lazily invokes this function only when a live SharePoint
 * call is about to happen. In `--dry-run` mode it is never invoked and
 * consequently never fails.
 */
export function createTokenSource(ctx: {
  siteUrl: string;
  explicitToken?: string;
}): () => Promise<string> {
  let cached: string | undefined;
  return async () => {
    if (cached) return cached;

    const fromArg = ctx.explicitToken?.trim();
    if (fromArg) {
      cached = fromArg;
      return cached;
    }

    const fromEnv = process.env.SHAREPOINT_BEARER_TOKEN?.trim();
    if (fromEnv) {
      cached = fromEnv;
      return cached;
    }

    try {
      const origin = new URL(ctx.siteUrl).origin;
      const out = execSync(
        `az account get-access-token --resource ${origin} --query accessToken -o tsv`,
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
      );
      cached = out.trim();
      return cached;
    } catch (err) {
      throw new Error(
        'No SharePoint bearer token available. Provide one via ' +
          '`SHAREPOINT_BEARER_TOKEN=...` env var or `--token <...>`, or ensure ' +
          '`az account get-access-token` can resolve a preauthorized token for ' +
          `${ctx.siteUrl}. Underlying error: ${(err as Error).message}`,
      );
    }
  };
}

/* ─── Low-level fetch helpers ─────────────────────────────────────────── */

interface SpRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'MERGE';
  body?: unknown;
  /** Custom headers, merged over defaults. */
  headers?: Record<string, string>;
  /** Accept-header override (defaults to nometadata JSON). */
  accept?: string;
}

async function spFetch<T = unknown>(
  ctx: RunContext,
  path: string,
  opts: SpRequestOptions = {},
): Promise<T> {
  const { config } = ctx;
  const url = path.startsWith('http') ? path : `${config.siteUrl}/_api/${path.replace(/^\/+/, '')}`;
  const token = await ctx.getToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: opts.accept ?? 'application/json;odata=nometadata',
    ...(opts.body ? { 'Content-Type': 'application/json;odata=nometadata' } : {}),
    ...opts.headers,
  };

  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `${opts.method ?? 'GET'} ${url} → ${res.status} ${res.statusText}\n${text.slice(0, 1500)}`,
    );
  }

  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('json')) return undefined as T;
  return (await res.json()) as T;
}

/* ─── Primitive SharePoint REST operations ────────────────────────────── */

function escapeOdataString(value: string): string {
  return value.replace(/'/g, "''");
}

function listEndpoint(listTitle: string): string {
  return `web/lists/getbytitle('${encodeURIComponent(escapeOdataString(listTitle))}')`;
}

export async function ensureCurrentUserId(ctx: RunContext): Promise<number> {
  if (ctx.currentUserId !== undefined) return ctx.currentUserId;
  interface UserResp {
    Id: number;
  }
  const resp = await spFetch<UserResp>(ctx, 'web/currentuser');
  ctx.currentUserId = resp.Id;
  return resp.Id;
}

export interface CreateKudosItemPayload {
  Title?: string;
  KudosId: string;
  Headline: string;
  Excerpt: string;
  Details?: string;
  WorkflowStatus: WorkflowStatus;
  HomepageEnabled: boolean;
  IsPinned: boolean;
  WasEverPublished: boolean;
  CelebrateCount: number;
  PublishStartDate?: string;
  PublishEndDate?: string;
  SubmittedDateTime?: string;
  SubmittedById?: number;
  IndividualRecipientsId?: { results: number[] };
}

/** Build the PATCH body for a Kudos item, translating to SharePoint REST shapes. */
export function buildSpFieldBody(patch: Record<string, unknown>): Record<string, unknown> {
  // Translate UserMulti: `IndividualRecipientsId: { results: [userId] }`.
  // Translate User: `SubmittedById: userId` (note `Id` suffix for lookup resolution).
  return { ...patch };
}

export async function createKudosItem(
  ctx: RunContext,
  payload: CreateKudosItemPayload,
): Promise<{ Id: number } & Record<string, unknown>> {
  const body = buildSpFieldBody(payload as unknown as Record<string, unknown>);
  const endpoint = `${listEndpoint(ctx.config.lists.peopleCultureKudos)}/items`;
  if (ctx.dryRun) {
    const fakeId = Math.floor(Math.random() * 1_000_000) + 1;
    logDry(ctx, `POST ${endpoint}`, body);
    return { Id: fakeId, ...body } as { Id: number } & Record<string, unknown>;
  }
  const result = await spFetch<{ Id: number } & Record<string, unknown>>(ctx, endpoint, {
    method: 'POST',
    body,
  });
  ctx.createdKudosItemIds.push(result.Id);
  return result;
}

export async function patchKudosItem(
  ctx: RunContext,
  itemId: number,
  patch: Record<string, unknown>,
): Promise<void> {
  const body = buildSpFieldBody(patch);
  const endpoint = `${listEndpoint(ctx.config.lists.peopleCultureKudos)}/items(${itemId})`;
  if (ctx.dryRun) {
    logDry(ctx, `PATCH ${endpoint}`, body);
    return;
  }
  await spFetch(ctx, endpoint, {
    method: 'PATCH',
    body,
    headers: { 'If-Match': '*', 'X-HTTP-Method': 'MERGE' },
  });
}

export async function getKudosItem<T = Record<string, unknown>>(
  ctx: RunContext,
  itemId: number,
  selectFields: string[] = [],
): Promise<T> {
  const sel = selectFields.length ? `?$select=${selectFields.join(',')}` : '';
  const endpoint = `${listEndpoint(ctx.config.lists.peopleCultureKudos)}/items(${itemId})${sel}`;
  if (ctx.dryRun) {
    logDry(ctx, `GET ${endpoint}`);
    // Echo back a synthetic record so downstream assertions can still run.
    return { Id: itemId, __dryRun: true } as unknown as T;
  }
  return spFetch<T>(ctx, endpoint);
}

export async function queryKudosByPrefix(
  ctx: RunContext,
  prefix: string,
  selectFields: string[] = ['Id', 'KudosId', 'Headline', 'WorkflowStatus'],
): Promise<Array<{ Id: number } & Record<string, unknown>>> {
  const filter = `startswith(KudosId,'${escapeOdataString(prefix)}')`;
  const sel = `?$select=${selectFields.join(',')}&$filter=${encodeURIComponent(filter)}&$top=500`;
  const endpoint = `${listEndpoint(ctx.config.lists.peopleCultureKudos)}/items${sel}`;
  if (ctx.dryRun) {
    logDry(ctx, `GET ${endpoint}`);
    return [];
  }
  const resp = await spFetch<{ value: Array<{ Id: number } & Record<string, unknown>> }>(
    ctx,
    endpoint,
  );
  return resp.value ?? [];
}

export async function deleteKudosItem(ctx: RunContext, itemId: number): Promise<void> {
  const endpoint = `${listEndpoint(ctx.config.lists.peopleCultureKudos)}/items(${itemId})`;
  if (ctx.dryRun) {
    logDry(ctx, `DELETE ${endpoint}`);
    return;
  }
  await spFetch(ctx, endpoint, {
    method: 'DELETE',
    headers: { 'If-Match': '*' },
  });
}

/* ─── Audit list operations ───────────────────────────────────────────── */

export interface CreateAuditEventInput {
  kudosId: string;
  eventType: KudosEventType;
  actorId?: number;
  eventAtIso?: string;
  oldValue?: unknown;
  newValue?: unknown;
  publicNote?: string;
  internalNote?: string;
  /** Optional synthetic Title override; defaults to `[TEST][HBI] {eventType} {kudosId}`. */
  title?: string;
}

export async function createAuditEvent(
  ctx: RunContext,
  input: CreateAuditEventInput,
): Promise<{ Id: number }> {
  const nowIso = input.eventAtIso ?? new Date().toISOString();
  const body: Record<string, unknown> = {
    Title: input.title ?? `[TEST][HBI] ${input.eventType} ${input.kudosId}`,
    KudosId: input.kudosId,
    EventType: input.eventType,
    EventAt: nowIso,
    OldValue: input.oldValue !== undefined ? JSON.stringify(input.oldValue) : null,
    NewValue: input.newValue !== undefined ? JSON.stringify(input.newValue) : null,
    PublicNote: input.publicNote ?? null,
    InternalNote:
      input.internalNote ?? `runId=${ctx.runId} synthetic audit event (${input.eventType})`,
  };
  if (input.actorId !== undefined) {
    body.ActorId = input.actorId;
  }

  const endpoint = `${listEndpoint(ctx.config.lists.kudosAuditEvents)}/items`;
  if (ctx.dryRun) {
    const fakeId = Math.floor(Math.random() * 1_000_000) + 1;
    logDry(ctx, `POST ${endpoint}`, body);
    return { Id: fakeId };
  }
  const result = await spFetch<{ Id: number }>(ctx, endpoint, { method: 'POST', body });
  ctx.createdAuditItemIds.push(result.Id);
  return result;
}

export async function queryAuditByKudosId(
  ctx: RunContext,
  kudosId: string,
): Promise<Array<{ Id: number; EventType: string; EventAt: string }>> {
  const filter = `KudosId eq '${escapeOdataString(kudosId)}'`;
  const sel =
    `?$select=Id,KudosId,EventType,EventAt,OldValue,NewValue` +
    `&$filter=${encodeURIComponent(filter)}&$top=500`;
  const endpoint = `${listEndpoint(ctx.config.lists.kudosAuditEvents)}/items${sel}`;
  if (ctx.dryRun) {
    logDry(ctx, `GET ${endpoint}`);
    return [];
  }
  const resp = await spFetch<{ value: Array<{ Id: number; EventType: string; EventAt: string }> }>(
    ctx,
    endpoint,
  );
  return resp.value ?? [];
}

export async function deleteAuditItem(ctx: RunContext, itemId: number): Promise<void> {
  const endpoint = `${listEndpoint(ctx.config.lists.kudosAuditEvents)}/items(${itemId})`;
  if (ctx.dryRun) {
    logDry(ctx, `DELETE ${endpoint}`);
    return;
  }
  await spFetch(ctx, endpoint, { method: 'DELETE', headers: { 'If-Match': '*' } });
}

/* ─── Field-builder helpers for HB Kudos lifecycle steps ──────────────── */

export function buildKudosDraftFields(
  runId: string,
  seq: number,
  overrides: Partial<KudosDraftInput> = {},
): CreateKudosItemPayload {
  const kudosId = overrides.kudosId ?? buildSyntheticKudosId(runId, seq);
  const headline = overrides.headline ?? buildSyntheticHeadline(runId, seq, 'lifecycle-happy-path');
  const now = new Date();
  const publishStart = overrides.publishStartIso ?? new Date(now.getTime() - 60_000).toISOString();
  const publishEnd =
    overrides.publishEndIso ?? new Date(now.getTime() + 14 * 24 * 3_600_000).toISOString();

  return {
    Title: headline,
    KudosId: kudosId,
    Headline: headline,
    Excerpt:
      overrides.excerpt ??
      `Synthetic kudos submitted by the People + Culture workflow test harness. runId=${runId} seq=${seq}.`,
    Details:
      overrides.details ??
      'This row was created by scripts/testing/people-kudos-workflow and will be removed by the cleanup phase unless --no-cleanup is passed.',
    WorkflowStatus: 'pending',
    HomepageEnabled: false,
    IsPinned: false,
    WasEverPublished: false,
    CelebrateCount: 0,
    PublishStartDate: publishStart,
    PublishEndDate: publishEnd,
    SubmittedDateTime: now.toISOString(),
    SubmittedById: overrides.submittedByUserId,
  };
}

export function buildKudosApprovalPatch(approverUserId: number): Record<string, unknown> {
  return {
    WorkflowStatus: 'approved' as WorkflowStatus,
    ApprovedById: approverUserId,
    ApprovedDate: new Date().toISOString(),
  };
}

export function buildKudosSchedulePatch(
  scheduledAtIso: string,
  schedulerUserId: number,
): Record<string, unknown> {
  return {
    WorkflowStatus: 'approvedScheduled' as WorkflowStatus,
    IsScheduled: true,
    ScheduledPublishAt: scheduledAtIso,
    ScheduledById: schedulerUserId,
  };
}

export function buildKudosPinPatch(pinOrder: number): Record<string, unknown> {
  return {
    IsPinned: true,
    PinOrder: pinOrder,
    ProminenceIntent: 'pinned' as ProminenceIntent,
  };
}

export function buildKudosFeaturePatch(expiresAtIso: string): Record<string, unknown> {
  return {
    IsFeatured: true,
    FeaturedExpiresAt: expiresAtIso,
    ProminenceIntent: 'featured' as ProminenceIntent,
  };
}

export function buildKudosRevisionRequestedPatch(
  requesterUserId: number,
  guidance: string,
): Record<string, unknown> {
  return {
    WorkflowStatus: 'revisionRequested' as WorkflowStatus,
    RevisionRequestedById: requesterUserId,
    RevisionRequestedAt: new Date().toISOString(),
    RevisionGuidance: guidance,
  };
}

export function buildKudosRejectPatch(
  rejectorUserId: number,
  reason: string,
): Record<string, unknown> {
  return {
    WorkflowStatus: 'rejected' as WorkflowStatus,
    RejectionReason: reason,
    ReviewedById: rejectorUserId,
    ReviewedAt: new Date().toISOString(),
  };
}

export function buildKudosWithdrawPatch(withdrawerUserId: number): Record<string, unknown> {
  return {
    WorkflowStatus: 'withdrawn' as WorkflowStatus,
    WithdrawnById: withdrawerUserId,
    WithdrawnAt: new Date().toISOString(),
  };
}

export function buildKudosRemovePatch(
  removerUserId: number,
  reason: string,
): Record<string, unknown> {
  return {
    WorkflowStatus: 'removedUnpublished' as WorkflowStatus,
    IsRemovedFromPublicView: true,
    RemovedById: removerUserId,
    RemovedAt: new Date().toISOString(),
    RemovedReason: reason,
  };
}

export function buildKudosRestorePatch(restorerUserId: number): Record<string, unknown> {
  return {
    WorkflowStatus: 'approved' as WorkflowStatus,
    IsRemovedFromPublicView: false,
    RestoredById: restorerUserId,
    RestoredAt: new Date().toISOString(),
  };
}

export function buildKudosCelebratePatch(nextCount: number): Record<string, unknown> {
  return { CelebrateCount: nextCount };
}

export function buildKudosVisibilityPatch(mode: VisibilityMode): Record<string, unknown> {
  return { CurrentVisibilityMode: mode };
}

/* ─── Assertion + result recording ────────────────────────────────────── */

export function recordResult(ctx: RunContext, result: StepResult): StepResult {
  ctx.results.push(result);
  logResult(ctx, result);
  return result;
}

export function assertFieldEquals<T>(
  ctx: RunContext,
  step: string,
  fieldName: string,
  actual: T,
  expected: T,
): StepResult {
  if (ctx.dryRun) {
    return recordResult(ctx, {
      step,
      status: 'dry',
      detail: `dry-run: would assert ${fieldName} === ${JSON.stringify(expected)}`,
    });
  }
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  return recordResult(ctx, {
    step,
    status: pass ? 'pass' : 'fail',
    detail: `${fieldName}: expected ${JSON.stringify(expected)}, actual ${JSON.stringify(actual)}`,
    evidence: { fieldName, actual, expected },
  });
}

/* ─── --discover subcommand ───────────────────────────────────────────── */

export interface DiscoveredListSchema {
  fetchedAt: string;
  listTitle: string;
  fields: unknown;
  views: unknown;
  contentTypes: unknown;
}

export async function discoverListSchema(
  ctx: RunContext,
  listTitle: string,
  slug: string,
): Promise<string | null> {
  if (ctx.dryRun) {
    logDry(ctx, `discover(${listTitle}) — would query fields/views/contentTypes and write to ${ctx.config.docsDir}/${slug}-list-schema.raw.json`);
    return null;
  }
  const base = listEndpoint(listTitle);
  const [fields, views, contentTypes] = await Promise.all([
    spFetch<{ value: unknown[] }>(ctx, `${base}/fields?$top=500`),
    spFetch<{ value: unknown[] }>(ctx, `${base}/views?$expand=ViewFields&$top=500`),
    spFetch<{ value: unknown[] }>(ctx, `${base}/contenttypes?$top=500`).catch(() => ({
      value: [],
    })),
  ]);

  const payload: DiscoveredListSchema = {
    fetchedAt: new Date().toISOString(),
    listTitle,
    fields: fields.value ?? [],
    views: views.value ?? [],
    contentTypes: contentTypes.value ?? [],
  };

  mkdirSync(ctx.config.docsDir, { recursive: true });
  const rawPath = join(ctx.config.docsDir, `${slug}-list-schema.raw.json`);
  writeFileSync(rawPath, JSON.stringify(payload, null, 2));
  return rawPath;
}

/* ─── Cleanup ─────────────────────────────────────────────────────────── */

export async function cleanupTestItems(ctx: RunContext): Promise<StepResult[]> {
  const results: StepResult[] = [];
  if (!ctx.config.cleanup) {
    results.push(
      recordResult(ctx, {
        step: 'cleanup',
        status: 'skip',
        detail: '--no-cleanup: skipped',
      }),
    );
    return results;
  }
  const prefix = buildSyntheticPrefix(ctx.runId);

  // 1. Kudos rows.
  try {
    const kudosRows = await queryKudosByPrefix(ctx, prefix, ['Id', 'KudosId']);
    for (const row of kudosRows) {
      await deleteKudosItem(ctx, row.Id);
    }
    results.push(
      recordResult(ctx, {
        step: 'cleanup.kudos',
        status: ctx.dryRun ? 'dry' : 'pass',
        detail: `${ctx.dryRun ? 'would delete' : 'deleted'} ${kudosRows.length} kudos row(s)`,
      }),
    );
  } catch (err) {
    results.push(
      recordResult(ctx, {
        step: 'cleanup.kudos',
        status: 'warn',
        detail: `cleanup query/delete failed: ${(err as Error).message}`,
      }),
    );
  }

  // 2. Audit rows — query by exact KudosId for each prefix match, then delete.
  try {
    let deleted = 0;
    for (const seq of Array.from({ length: 32 }, (_, i) => i + 1)) {
      const kudosId = buildSyntheticKudosId(ctx.runId, seq);
      const auditRows = await queryAuditByKudosId(ctx, kudosId);
      for (const row of auditRows) {
        await deleteAuditItem(ctx, row.Id);
        deleted++;
      }
    }
    results.push(
      recordResult(ctx, {
        step: 'cleanup.audit',
        status: ctx.dryRun ? 'dry' : 'pass',
        detail: `${ctx.dryRun ? 'would delete' : 'deleted'} ${deleted} audit row(s)`,
      }),
    );
  } catch (err) {
    results.push(
      recordResult(ctx, {
        step: 'cleanup.audit',
        status: 'warn',
        detail: `audit cleanup failed: ${(err as Error).message}`,
      }),
    );
  }

  return results;
}

/* ─── Logging ─────────────────────────────────────────────────────────── */

function iconFor(status: StepStatus): string {
  switch (status) {
    case 'pass':
      return '✓';
    case 'fail':
      return '✗';
    case 'warn':
      return '!';
    case 'skip':
      return '-';
    case 'dry':
      return '·';
  }
}

export function logResult(ctx: RunContext, result: StepResult): void {
  const prefix = `[${iconFor(result.status)}] ${result.step.padEnd(42)}`;
  const detail = result.detail ? `  ${result.detail}` : '';
  const line = `${prefix}${detail}`;
  if (result.status === 'fail') {
    console.error(line);
  } else {
    console.log(line);
  }
}

export function logDry(ctx: RunContext, intent: string, body?: unknown): void {
  if (!ctx.verbose) return;
  const bodyStr = body ? ` ${JSON.stringify(body).slice(0, 200)}` : '';
  console.log(`  [dry] ${intent}${bodyStr}`);
}

export function summarizeResults(ctx: RunContext): {
  total: number;
  pass: number;
  fail: number;
  warn: number;
  skip: number;
  dry: number;
} {
  const summary = { total: 0, pass: 0, fail: 0, warn: 0, skip: 0, dry: 0 };
  for (const r of ctx.results) {
    summary.total++;
    summary[r.status]++;
  }
  return summary;
}

export function printSummary(ctx: RunContext): void {
  const s = summarizeResults(ctx);
  console.log('');
  console.log('================= SUMMARY =================');
  console.log(`runId:    ${ctx.runId}`);
  console.log(`dry-run:  ${ctx.dryRun}`);
  console.log(
    `results:  total=${s.total} pass=${s.pass} fail=${s.fail} warn=${s.warn} skip=${s.skip} dry=${s.dry}`,
  );
  console.log(`created:  kudos=${ctx.createdKudosItemIds.length} audit=${ctx.createdAuditItemIds.length}`);
  console.log('===========================================');
}
