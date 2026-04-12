/**
 * HB Kudos dev-harness adapter.
 *
 * Phase-16a/02 — closes the execution blocker for the Playwright Kudos
 * lane. Installs the global surface already assumed by
 * `e2e/webparts/kudos/helpers/`:
 *
 *   window.__hbKudosSeed(payload)
 *   window.__hbKudosProbe.workflowStates
 *   window.__hbKudosCacheProbe.invalidations
 *   window.__hbKudosPeopleSearchMode   // setter-style mutable field
 *   window.__hbKudosHostedFault        // setter-style mutable field
 *
 * Strategy: mount the real `HbKudos` and `HbKudosCompanion` React
 * trees and intercept SharePoint REST calls at the `fetch` boundary
 * against an in-memory seed store. Production runtime is untouched;
 * the interceptor is gated behind the harness `install()` call.
 *
 * Scope: covers the endpoint set actually exercised by the Kudos
 * runtime (contextinfo, kudos + audit list GET/POST/MERGE, ensureuser,
 * ClientPeoplePickerSearchUser). Endpoints outside that set are
 * passed through to the real `fetch` so co-hosted harness tabs are
 * unaffected.
 */
import {
  PEOPLE_CULTURE_LIST_REGISTRY,
} from '../../../hb-webparts/src/homepage/data/peopleCultureSpListRegistry.js';
import {
  storeKudosListHostUrl,
  storeSiteUrl,
} from '../../../hb-webparts/src/homepage/data/spContext.js';
import { invalidatePeopleCultureCache } from '../../../hb-webparts/src/homepage/data/usePeopleCultureData.js';

const HARNESS_SITE_URL = 'https://harness.local/sites/hb';
const KUDOS_GUID = PEOPLE_CULTURE_LIST_REGISTRY.kudos.id;
const AUDIT_GUID = PEOPLE_CULTURE_LIST_REGISTRY.kudosAuditEvents.id;

/* ── Seed payload types (mirror e2e helper shapes) ─────────────── */

export type HarnessRole = 'public' | 'reviewer' | 'admin';
export type PeopleSearchMode =
  | 'exact-match'
  | 'multiple-matches'
  | 'zero-matches'
  | 'malformed-partial'
  | 'photo-unavailable'
  | 'directory-error'
  | 'digest-failure';
export type HostedFault =
  | 'none'
  | 'stale-after-action'
  | 'pin-slot-collision'
  | 'feature-slot-collision'
  | 'role-capability-denied'
  | 'list-item-not-found'
  | 'audit-write-failure'
  | 'patch-rejected-etag';

export interface SeededRecipient {
  id: string;
  kind: 'individual' | 'team' | 'department' | 'project-group';
  displayName: string;
  hasPhoto?: boolean;
}

export interface SeededOverlays {
  flaggedForAdminReview?: boolean;
  claimOwnerId?: string | null;
  assignedOwnerId?: string | null;
  reviewedByCurrentUser?: boolean;
  prominence?: 'standard' | 'pinned' | 'featured';
  celebrateCount?: number;
  publishAtIso?: string | null;
}

export interface SeededKudos {
  id: string;
  listItemId: number;
  etag: string;
  submitterId: string;
  recipients: SeededRecipient[];
  state:
    | 'pending'
    | 'revisionRequested'
    | 'approved'
    | 'approvedScheduled'
    | 'rejected'
    | 'withdrawn'
    | 'removedUnpublished';
  createdIso: string;
  updatedIso: string;
  title: string;
  body: string;
  overlays: SeededOverlays;
}

export interface SeededAudit {
  id: string;
  kudosId: string;
  actorId: string;
  action: string;
  atIso: string;
  outcome: 'ok' | 'denied' | 'error';
  note?: string;
}

export interface SeedPayload {
  items: SeededKudos[];
  audits?: SeededAudit[];
  currentUserId?: string;
  currentUserRole?: HarnessRole;
}

/* ── In-memory seed store ──────────────────────────────────────── */

interface Store {
  items: SeededKudos[];
  audits: SeededAudit[];
  currentUserId: string;
  currentUserRole: HarnessRole;
  nextListItemId: number;
  nextAuditId: number;
}

const store: Store = {
  items: [],
  audits: [],
  currentUserId: 'user-unrelated',
  currentUserRole: 'public',
  nextListItemId: 1,
  nextAuditId: 1,
};

const cacheProbe = { invalidations: 0 };

function bumpInvalidation(): void {
  cacheProbe.invalidations += 1;
}

function emailForUser(userId: string): string {
  return `${userId}@harness.local`;
}

function userIdForEmail(email: string): string {
  return email.replace('@harness.local', '');
}

function hashUserIdToNumber(userId: string): number {
  let h = 0;
  for (let i = 0; i < userId.length; i += 1) h = (h * 31 + userId.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

function seededKudosToListItem(k: SeededKudos): Record<string, unknown> {
  const submitterNumericId = hashUserIdToNumber(k.submitterId);
  const individualIds = k.recipients
    .filter((r) => r.kind === 'individual')
    .map((r) => hashUserIdToNumber(r.id));
  return {
    '@odata.etag': k.etag,
    Id: k.listItemId,
    KudosId: k.id,
    Headline: k.title,
    Excerpt: k.body,
    Details: '',
    SubmittedDate: k.createdIso,
    SubmittedBy: {
      Id: submitterNumericId,
      Title: k.submitterId,
      EMail: emailForUser(k.submitterId),
    },
    WorkflowStatus: k.state,
    WasEverPublished: k.state === 'approved' || k.state === 'removedUnpublished',
    HomepageEnabled: k.state === 'approved',
    IsPinned: k.overlays.prominence === 'pinned',
    IsFeatured: k.overlays.prominence === 'featured',
    IsScheduled: k.state === 'approvedScheduled',
    ScheduledPublishAt: k.overlays.publishAtIso ?? null,
    CelebrateCount: k.overlays.celebrateCount ?? 0,
    IsFlaggedForAdminReview: k.overlays.flaggedForAdminReview ?? false,
    IndividualRecipients: individualIds.map((id) => ({
      Id: id,
      Title: k.recipients.find((r) => hashUserIdToNumber(r.id) === id)?.displayName ?? '',
      EMail: emailForUser(
        k.recipients.find((r) => hashUserIdToNumber(r.id) === id)?.id ?? '',
      ),
    })),
    TeamRecipients: k.recipients
      .filter((r) => r.kind === 'team')
      .map((r) => r.displayName)
      .join('; '),
    DepartmentRecipients: k.recipients
      .filter((r) => r.kind === 'department')
      .map((r) => r.displayName)
      .join('; '),
    ProjectGroupRecipients: k.recipients
      .filter((r) => r.kind === 'project-group')
      .map((r) => r.displayName)
      .join('; '),
    ApprovedDate:
      k.state === 'approved' || k.state === 'approvedScheduled' ? k.updatedIso : null,
    ProminenceIntent: k.overlays.prominence ?? 'standard',
    ClaimOwner: k.overlays.claimOwnerId
      ? {
          Id: hashUserIdToNumber(k.overlays.claimOwnerId),
          Title: k.overlays.claimOwnerId,
          EMail: emailForUser(k.overlays.claimOwnerId),
        }
      : null,
    AssignedOwner: k.overlays.assignedOwnerId
      ? {
          Id: hashUserIdToNumber(k.overlays.assignedOwnerId),
          Title: k.overlays.assignedOwnerId,
          EMail: emailForUser(k.overlays.assignedOwnerId),
        }
      : null,
  };
}

function seededAuditToListItem(a: SeededAudit): Record<string, unknown> {
  return {
    '@odata.etag': '"1"',
    Id: hashUserIdToNumber(a.id),
    KudosId: a.kudosId,
    EventType: a.action,
    EventAt: a.atIso,
    Actor: { Id: hashUserIdToNumber(a.actorId), Title: a.actorId, EMail: emailForUser(a.actorId) },
    PublicNote: '',
    InternalNote: a.note ?? '',
    Outcome: a.outcome,
  };
}

/* ── People-search payload builder ─────────────────────────────── */

function buildPeoplePickerBody(mode: PeopleSearchMode): {
  ok: boolean;
  status?: number;
  body?: string;
  throwOnDigest?: boolean;
} {
  const wrap = (rows: Array<Record<string, unknown>>) => ({
    ok: true,
    body: JSON.stringify({ ClientPeoplePickerSearchUser: JSON.stringify(rows) }),
  });
  switch (mode) {
    case 'exact-match':
      return wrap([
        {
          Key: 'i:0#.f|membership|ren@harness.local',
          DisplayText: 'Ren Recipient',
          EntityData: { Email: 'ren@harness.local', Title: 'Engineer', Department: 'Field Ops' },
        },
      ]);
    case 'multiple-matches':
      return wrap([
        { Key: 'ren', DisplayText: 'Ren Recipient', EntityData: { Email: 'ren@harness.local' } },
        { Key: 'pat', DisplayText: 'Pat Recipient', EntityData: { Email: 'pat@harness.local' } },
        { Key: 'rae', DisplayText: 'Rae Reviewer', EntityData: { Email: 'rae@harness.local' } },
      ]);
    case 'zero-matches':
      return wrap([]);
    case 'malformed-partial':
      return wrap([
        { Key: '', DisplayText: '', EntityData: {} },
        { Key: 'noid', DisplayText: 'No-Email' },
      ]);
    case 'photo-unavailable':
      return wrap([
        {
          Key: 'pat',
          DisplayText: 'Pat Recipient',
          EntityData: { Email: 'pat@harness.local' },
        },
      ]);
    case 'directory-error':
      return { ok: false, status: 500, body: 'directory error' };
    case 'digest-failure':
      return { ok: false, throwOnDigest: true };
    default:
      return wrap([]);
  }
}

/* ── Fetch interceptor ─────────────────────────────────────────── */

function extractFilterParam(url: URL, name: string): string | undefined {
  const raw = url.searchParams.get(`$${name}`);
  return raw ? decodeURIComponent(raw) : undefined;
}

function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json;odata=nometadata', ...extraHeaders },
  });
}

async function handleKudosRequest(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  realFetch: typeof fetch,
): Promise<Response | undefined> {
  const urlString =
    typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  if (!urlString.startsWith(HARNESS_SITE_URL)) return undefined;

  const url = new URL(urlString);
  const method = (init?.method ?? 'GET').toUpperCase();
  const headers = new Headers(init?.headers ?? {});
  const httpMethod = headers.get('X-HTTP-Method')?.toUpperCase();

  // Hosted faults applied before any work
  const fault = getHostedFault();

  // 1. contextinfo
  if (url.pathname.endsWith('/_api/contextinfo')) {
    return jsonResponse({ FormDigestValue: 'harness-digest' });
  }

  // 2. ensureuser
  if (url.pathname.includes('/_api/web/ensureuser')) {
    const m = url.pathname.match(/ensureuser\('([^']+)'\)/);
    const email = m ? decodeURIComponent(m[1]) : '';
    if (!email) return jsonResponse({}, 400);
    return jsonResponse({ Id: hashUserIdToNumber(userIdForEmail(email)) });
  }

  // 3. ClientPeoplePickerSearchUser
  if (url.pathname.endsWith('ClientPeoplePickerSearchUser')) {
    const plan = buildPeoplePickerBody(getPeopleSearchMode());
    if (plan.throwOnDigest) {
      // Handled by contextinfo shim by design — fall through to error response.
      return new Response('digest failure', { status: 500, statusText: 'digest' });
    }
    if (!plan.ok) return new Response(plan.body ?? '', { status: plan.status ?? 500 });
    return new Response(plan.body ?? '{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json;odata=nometadata' },
    });
  }

  // 4. Kudos / Audit list endpoints
  const listMatch = url.pathname.match(/\/_api\/web\/lists\(guid'([^']+)'\)\/items(?:\((\d+)\))?/);
  if (listMatch) {
    const listId = listMatch[1];
    const itemId = listMatch[2] ? Number.parseInt(listMatch[2], 10) : undefined;
    const isKudos = listId === KUDOS_GUID;
    const isAudit = listId === AUDIT_GUID;
    // Unknown PC list (announcements, celebrations, or anything else
    // addressed via the harness site URL) → serve an empty value array
    // so parallel fetchPeopleCultureListData callers don't push binding
    // errors and fail the top-level hook.
    if (!isKudos && !isAudit) {
      if (method === 'GET') return jsonResponse({ value: [] });
      return new Response(null, { status: 204 });
    }

    // Reads
    if (method === 'GET') {
      if (isKudos) {
        const filter = extractFilterParam(url, 'filter');
        let rows = store.items.map(seededKudosToListItem);
        if (filter) rows = applyFilter(rows, filter);
        const top = url.searchParams.get('$top');
        if (top) rows = rows.slice(0, Number.parseInt(top, 10));
        return jsonResponse({ value: rows });
      }
      if (isAudit) {
        const filter = extractFilterParam(url, 'filter');
        let rows = store.audits.map(seededAuditToListItem);
        if (filter) rows = applyFilter(rows, filter);
        return jsonResponse({ value: rows });
      }
    }

    // Writes
    if (method === 'POST' && httpMethod === 'MERGE' && typeof itemId === 'number') {
      if (fault === 'list-item-not-found') return jsonResponse({ error: 'not found' }, 404);
      if (fault === 'patch-rejected-etag') return jsonResponse({ error: 'conflict' }, 412);
      if (fault === 'role-capability-denied') return jsonResponse({ error: 'forbidden' }, 403);
      const body = init?.body ? JSON.parse(String(init.body)) : {};
      if (isKudos) {
        const item = store.items.find((k) => k.listItemId === itemId);
        if (!item) return jsonResponse({ error: 'missing' }, 404);
        mergeKudos(item, body);
      }
      if (fault !== 'stale-after-action') bumpInvalidation();
      if (fault === 'audit-write-failure' && isKudos) {
        // The writer will try to append an audit next; we can't signal
        // from here, so we rely on the dedicated audit POST path below.
      }
      return new Response(null, { status: 204 });
    }

    if (method === 'POST' && !httpMethod) {
      if (fault === 'role-capability-denied') return jsonResponse({ error: 'forbidden' }, 403);
      const body = init?.body ? JSON.parse(String(init.body)) : {};
      if (isKudos) {
        const created = createKudosFromPayload(body);
        bumpInvalidation();
        return jsonResponse({ Id: created.listItemId });
      }
      if (isAudit) {
        if (fault === 'audit-write-failure') return jsonResponse({ error: 'audit fail' }, 500);
        const audit: SeededAudit = {
          id: `a-harness-${store.nextAuditId++}`,
          kudosId: String(body.KudosId ?? body.kudosId ?? ''),
          actorId: String(body.Actor?.Title ?? store.currentUserId),
          action: String(body.EventType ?? body.action ?? 'unknown'),
          atIso: String(body.EventAt ?? new Date().toISOString()),
          outcome: 'ok',
        };
        store.audits.push(audit);
        return jsonResponse({ Id: hashUserIdToNumber(audit.id) });
      }
    }
  }

  // 5. fields metadata (used by runtime guardrails)
  if (url.pathname.includes('/fields')) {
    return jsonResponse({ value: [] });
  }

  // 6. anything else under the harness URL — fall through to 404.
  return jsonResponse({}, 404);
}

function applyFilter(
  rows: Array<Record<string, unknown>>,
  filter: string,
): Array<Record<string, unknown>> {
  // Extremely narrow OData subset used by the Kudos data layer:
  //   KudosId eq '<v>'    → single-item lookup
  //   IsFeatured eq true  → prominence slot state
  //   IsPinned eq true    → prominence slot state
  const kidsMatch = filter.match(/^\s*KudosId\s+eq\s+'([^']+)'\s*$/);
  if (kidsMatch) {
    return rows.filter((r) => r.KudosId === kidsMatch[1]);
  }
  const boolMatch = filter.match(/^\s*(\w+)\s+eq\s+(true|false)\s*$/);
  if (boolMatch) {
    const [, key, val] = boolMatch;
    return rows.filter((r) => String(r[key]) === val);
  }
  return rows;
}

function mergeKudos(item: SeededKudos, body: Record<string, unknown>): void {
  if (body.WorkflowStatus) item.state = body.WorkflowStatus as SeededKudos['state'];
  if (typeof body.IsPinned === 'boolean')
    item.overlays.prominence = body.IsPinned ? 'pinned' : 'standard';
  if (typeof body.IsFeatured === 'boolean')
    item.overlays.prominence = body.IsFeatured ? 'featured' : item.overlays.prominence;
  if (typeof body.CelebrateCount === 'number') item.overlays.celebrateCount = body.CelebrateCount;
  if (typeof body.IsFlaggedForAdminReview === 'boolean')
    item.overlays.flaggedForAdminReview = body.IsFlaggedForAdminReview;
  if (body.ScheduledPublishAt)
    item.overlays.publishAtIso = String(body.ScheduledPublishAt);
  item.updatedIso = new Date().toISOString();
  const etagNum = Number.parseInt(item.etag.replace(/\D/g, ''), 10) + 1;
  item.etag = `"${etagNum}"`;
}

function createKudosFromPayload(body: Record<string, unknown>): SeededKudos {
  const listItemId = store.nextListItemId++;
  const kudos: SeededKudos = {
    id: String(body.KudosId ?? `k-harness-${listItemId}`),
    listItemId,
    etag: '"1"',
    submitterId: store.currentUserId,
    recipients: [],
    state: 'pending',
    createdIso: String(body.SubmittedDate ?? new Date().toISOString()),
    updatedIso: new Date().toISOString(),
    title: String(body.Headline ?? 'Untitled'),
    body: String(body.Excerpt ?? ''),
    overlays: { celebrateCount: 0, prominence: 'standard' },
  };
  store.items.push(kudos);
  return kudos;
}

/* ── Mode + fault state (exposed via globals) ──────────────────── */

function getPeopleSearchMode(): PeopleSearchMode {
  return (globalThis as unknown as { __hbKudosPeopleSearchMode?: PeopleSearchMode })
    .__hbKudosPeopleSearchMode ?? 'exact-match';
}

function getHostedFault(): HostedFault {
  return (globalThis as unknown as { __hbKudosHostedFault?: HostedFault })
    .__hbKudosHostedFault ?? 'none';
}

/* ── Install ───────────────────────────────────────────────────── */

let installed = false;

export function installKudosHarness(): void {
  if (installed) return;
  installed = true;

  storeSiteUrl(HARNESS_SITE_URL);
  storeKudosListHostUrl(HARNESS_SITE_URL);

  const realFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const intercept = await handleKudosRequest(input, init, realFetch);
      if (intercept) return intercept;
    } catch (e) {
      return new Response(String(e), { status: 500 });
    }
    return realFetch(input as RequestInfo, init);
  }) as typeof fetch;

  const g = globalThis as unknown as {
    __hbKudosSeed: (p: SeedPayload) => void;
    __hbKudosProbe: { workflowStates: string[] };
    __hbKudosCacheProbe: { invalidations: number };
    __hbKudosPeopleSearchMode?: PeopleSearchMode;
    __hbKudosHostedFault?: HostedFault;
    __hbKudosReset: () => void;
  };

  g.__hbKudosSeed = (payload: SeedPayload) => {
    store.items = payload.items.map((k) => ({
      ...k,
      overlays: { ...k.overlays },
      recipients: [...k.recipients],
    }));
    store.audits = [...(payload.audits ?? [])];
    store.currentUserId = payload.currentUserId ?? 'user-unrelated';
    store.currentUserRole = payload.currentUserRole ?? 'public';
    store.nextListItemId =
      payload.items.reduce((m, k) => Math.max(m, k.listItemId), 0) + 1;
    store.nextAuditId = (payload.audits?.length ?? 0) + 1;
    invalidatePeopleCultureCache();
    bumpInvalidation();
    // Notify React-aware subscribers (the dev-harness tab wrappers)
    // to remount their Kudos subtree so the hook's initial-fetch
    // error state is replaced by a fresh fetch against the seeded
    // store. A plain cache-invalidation alone cannot force a
    // re-render from outside React's commit loop.
    try {
      window.dispatchEvent(new CustomEvent('hb-kudos-seeded'));
    } catch {
      /* jsdom / non-browser context */
    }
  };

  g.__hbKudosProbe = {
    workflowStates: [
      'pending',
      'revisionRequested',
      'approved',
      'approvedScheduled',
      'rejected',
      'withdrawn',
      'removedUnpublished',
    ],
  };

  g.__hbKudosCacheProbe = cacheProbe;

  g.__hbKudosReset = () => {
    store.items = [];
    store.audits = [];
    store.currentUserId = 'user-unrelated';
    store.currentUserRole = 'public';
    store.nextListItemId = 1;
    store.nextAuditId = 1;
    cacheProbe.invalidations = 0;
    g.__hbKudosPeopleSearchMode = 'exact-match';
    g.__hbKudosHostedFault = 'none';
  };

  // Initialize mode/fault defaults.
  g.__hbKudosPeopleSearchMode = 'exact-match';
  g.__hbKudosHostedFault = 'none';
}

/** Diagnostics — for tests that need to read without window globals. */
export function _harnessStore(): Readonly<Store> {
  return store;
}
