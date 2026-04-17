/**
 * Write seams for Article Publisher lists (Wave 6).
 *
 * Follows the same list-title + request-digest pattern established by
 * `pageBindingWriter.ts` and the hero-banner writer. Each writer is
 * injectable so the authoring UI can pass a mock in tests.
 *
 * Authority:
 *   architecture doc 03 §§A,B,C,F — MVP=Yes field sets.
 *   architecture doc 04 — child-row relationships (ArticleId is the parent key).
 *   architecture doc 09 — workflow history semantics.
 *   operating-charter rule 5 — structured lists are the editorial source of truth.
 */

import { ensureUserByEmail, fetchRequestDigest } from '@hbc/sharepoint-platform';
import type {
  PublisherArticleRow,
  PublisherMediaRow,
  PublisherPublishingErrorRow,
  PublisherTeamMemberRow,
  PublisherWorkflowHistoryRow,
} from './publisherContracts';
import type { PublisherListDescriptor } from './publisherListDescriptors';
import { PUBLISHER_LISTS } from './publisherListDescriptors';

type FetchImpl = typeof fetch;
type DigestImpl = typeof fetchRequestDigest;

function listItemsEndpoint(descriptor: PublisherListDescriptor): string {
  return `${descriptor.hostSiteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(descriptor.displayName)}')/items`;
}

function nullIfEmpty<T>(value: T | undefined): T | null {
  if (value === undefined) return null;
  if (typeof value === 'string' && value.trim().length === 0) return null;
  return value;
}

interface LookupRecord {
  readonly Id: number;
}

async function findItemIdByField(
  descriptor: PublisherListDescriptor,
  fieldName: string,
  fieldValue: string,
  fetchImpl: FetchImpl,
): Promise<number | undefined> {
  const url =
    `${listItemsEndpoint(descriptor)}` +
    `?$select=Id&$filter=${encodeURIComponent(`${fieldName} eq '${fieldValue.replace(/'/g, "''")}'`)}&$top=1`;
  const res = await fetchImpl(url, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json;odata=nometadata' },
  });
  if (!res.ok) return undefined;
  const body = (await res.json().catch(() => undefined)) as
    | { value?: LookupRecord[] }
    | undefined;
  const match = body?.value?.[0];
  return match && typeof match.Id === 'number' ? match.Id : undefined;
}

async function listItemIdsByField(
  descriptor: PublisherListDescriptor,
  fieldName: string,
  fieldValue: string,
  fetchImpl: FetchImpl,
): Promise<readonly number[]> {
  const url =
    `${listItemsEndpoint(descriptor)}` +
    `?$select=Id&$filter=${encodeURIComponent(`${fieldName} eq '${fieldValue.replace(/'/g, "''")}'`)}&$top=500`;
  const res = await fetchImpl(url, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json;odata=nometadata' },
  });
  if (!res.ok) return [];
  const body = (await res.json().catch(() => undefined)) as
    | { value?: LookupRecord[] }
    | undefined;
  return (body?.value ?? [])
    .map((r) => r.Id)
    .filter((id): id is number => typeof id === 'number');
}

/**
 * List existing child-list items for one parent article, returning
 * both the SharePoint `Id` and the tenant child-key (`TeamMemberId`
 * or `MediaId`). Powers the non-destructive keyed-sync writer so
 * the caller can MERGE existing rows in place instead of
 * delete-all / recreate-all.
 */
async function listItemsByParentKey(
  descriptor: PublisherListDescriptor,
  parentField: string,
  parentValue: string,
  childKeyField: string,
  fetchImpl: FetchImpl,
): Promise<ReadonlyArray<{ readonly Id: number; readonly childKey: string }>> {
  const url =
    `${listItemsEndpoint(descriptor)}` +
    `?$select=${encodeURIComponent(`Id,${childKeyField}`)}` +
    `&$filter=${encodeURIComponent(`${parentField} eq '${parentValue.replace(/'/g, "''")}'`)}` +
    `&$top=500`;
  const res = await fetchImpl(url, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json;odata=nometadata' },
  });
  if (!res.ok) return [];
  const body = (await res.json().catch(() => undefined)) as
    | { value?: ReadonlyArray<Record<string, unknown>> }
    | undefined;
  return (body?.value ?? [])
    .map((r) => {
      const Id = r['Id'];
      const childKey = r[childKeyField];
      if (typeof Id !== 'number') return undefined;
      if (typeof childKey !== 'string' || childKey.length === 0) return undefined;
      return { Id, childKey };
    })
    .filter((r): r is { Id: number; childKey: string } => r !== undefined);
}

async function deleteItem(
  descriptor: PublisherListDescriptor,
  itemId: number,
  digest: string,
  fetchImpl: FetchImpl,
): Promise<void> {
  const url = `${listItemsEndpoint(descriptor)}(${itemId})`;
  const res = await fetchImpl(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json;odata=nometadata',
      'X-RequestDigest': digest,
      'If-Match': '*',
      'X-HTTP-Method': 'DELETE',
    },
  });
  if (!res.ok) {
    throw new Error(`Delete item ${itemId} failed (status ${res.status}).`);
  }
}

async function postItem(
  descriptor: PublisherListDescriptor,
  body: Record<string, unknown>,
  digest: string,
  fetchImpl: FetchImpl,
): Promise<number> {
  const res = await fetchImpl(listItemsEndpoint(descriptor), {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata',
      'X-RequestDigest': digest,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`POST failed on ${descriptor.displayName} (status ${res.status}).`);
  }
  const created = (await res.json().catch(() => undefined)) as
    | { Id?: number }
    | undefined;
  if (!created || typeof created.Id !== 'number') {
    throw new Error(`POST on ${descriptor.displayName} returned no Id.`);
  }
  return created.Id;
}

async function mergeItem(
  descriptor: PublisherListDescriptor,
  itemId: number,
  body: Record<string, unknown>,
  digest: string,
  fetchImpl: FetchImpl,
): Promise<void> {
  const res = await fetchImpl(`${listItemsEndpoint(descriptor)}(${itemId})`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata',
      'X-RequestDigest': digest,
      'If-Match': '*',
      'X-HTTP-Method': 'MERGE',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`MERGE failed on ${descriptor.displayName} (${itemId}; status ${res.status}).`);
  }
}

/* ── HB Articles master upsert ────────────────────────────────── */

/**
 * Project the typed master-record row into the SharePoint REST
 * field bag for `HB Articles`. Tenant columns only.
 *
 * `MilestoneLabel` / `MilestoneDateUtc` are intentionally NOT
 * emitted here — milestone articles are legacy read-compatible only
 * and not an operational publish path yet. The tenant columns remain
 * on the list (descriptor + contract still carry them so existing rows
 * read cleanly), but the live authoring UI does not expose milestone
 * controls, so the writer refuses to fabricate values. To re-enable,
 * add milestone emission here in lockstep with UI controls and a
 * restored `MILESTONE_REQUIRED` validation profile.
 */
export function mapArticleRowToListFields(
  row: PublisherArticleRow,
): Record<string, unknown> {
  return {
    ArticleId: row.ArticleId,
    Title: row.Title,
    ArticleContentType: row.ArticleContentType,
    Destination: row.Destination,
    Slug: row.Slug,
    TemplateKey: row.TemplateKey,
    WorkflowState: row.WorkflowState,
    Subhead: row.Subhead,
    SummaryExcerpt: row.SummaryExcerpt,
    BodyRichText: row.BodyRichText,
    BodyIntro: nullIfEmpty(row.BodyIntro),
    BodyClosing: nullIfEmpty(row.BodyClosing),
    CalloutText: nullIfEmpty(row.CalloutText),
    PullQuote: nullIfEmpty(row.PullQuote),
    SpotlightType: nullIfEmpty(row.SpotlightType),
    ProjectStage: nullIfEmpty(row.ProjectStage),
    ArticleSubject: nullIfEmpty(row.ArticleSubject),
    AuthorEmail: nullIfEmpty(row.AuthorEmail),
    AuthorDisplayName: nullIfEmpty(row.AuthorDisplayName),
    CreatedDateUtc: row.CreatedDateUtc,
    UpdatedDateUtc: row.UpdatedDateUtc,
    PublishedDateUtc: nullIfEmpty(row.PublishedDateUtc),
    PublishedByEmail: nullIfEmpty(row.PublishedByEmail),
    ScheduledPublishDateUtc: nullIfEmpty(row.ScheduledPublishDateUtc),
    ArchiveDateUtc: nullIfEmpty(row.ArchiveDateUtc),
    ProjectId: nullIfEmpty(row.ProjectId),
    ProjectName: nullIfEmpty(row.ProjectName),
    ProjectLocation: nullIfEmpty(row.ProjectLocation),
    ProjectSector: nullIfEmpty(row.ProjectSector),
    ProjectStatusLabel: nullIfEmpty(row.ProjectStatusLabel),
    HeroPrimaryImage: {
      Url: row.HeroPrimaryImage,
      Description: row.HeroPrimaryImage,
    },
    HeroPrimaryImageAltText: row.HeroPrimaryImageAltText,
    HeroTitle: nullIfEmpty(row.HeroTitle),
    HeroSubhead: nullIfEmpty(row.HeroSubhead),
    HeroEyebrow: nullIfEmpty(row.HeroEyebrow),
    HeroCategoryLabel: nullIfEmpty(row.HeroCategoryLabel),
    HeroThemeVariant: nullIfEmpty(row.HeroThemeVariant),
    HeroShowMetadata: row.HeroShowMetadata ?? null,
    HeroMetadataMode: nullIfEmpty(row.HeroMetadataMode),
    HeroCtaLabel: nullIfEmpty(row.HeroCtaLabel),
    HeroCtaUrl: row.HeroCtaUrl
      ? { Url: row.HeroCtaUrl, Description: row.HeroCtaUrl }
      : null,
    ShowTeamViewer: row.ShowTeamViewer ?? null,
    TeamViewerTitle: nullIfEmpty(row.TeamViewerTitle),
    TeamViewerIntro: nullIfEmpty(row.TeamViewerIntro),
    TeamViewerMode: nullIfEmpty(row.TeamViewerMode),
    TeamViewerGroupingMode: nullIfEmpty(row.TeamViewerGroupingMode),
    TeamViewerSortMode: nullIfEmpty(row.TeamViewerSortMode),
    TeamViewerMaxInitialVisible: row.TeamViewerMaxInitialVisible ?? null,
    TeamViewerAllowExpand: row.TeamViewerAllowExpand ?? null,
    SecondaryImage: row.SecondaryImage
      ? { Url: row.SecondaryImage, Description: row.SecondaryImage }
      : null,
    SecondaryImageAltText: nullIfEmpty(row.SecondaryImageAltText),
    SecondaryImageCaption: nullIfEmpty(row.SecondaryImageCaption),
    ShowSecondaryImage: row.ShowSecondaryImage ?? null,
    IsFeatured: row.IsFeatured ?? null,
    FeaturedRank: row.FeaturedRank ?? null,
    IsPinned: row.IsPinned ?? null,
    PinRank: row.PinRank ?? null,
    IncludeInArchive: row.IncludeInArchive ?? null,
    IncludeInDestinationLanding: row.IncludeInDestinationLanding ?? null,
    IncludeInHomepageFeed: row.IncludeInHomepageFeed ?? null,
    SuppressFromRollups: row.SuppressFromRollups ?? null,
    ManualSortOverride: row.ManualSortOverride ?? null,
    TargetSiteUrl: nullIfEmpty(row.TargetSiteUrl),
    PageTemplateKey: nullIfEmpty(row.PageTemplateKey),
    PageShellVersion: nullIfEmpty(row.PageShellVersion),
    RenderVersion: nullIfEmpty(row.RenderVersion),
    PageId: nullIfEmpty(row.PageId),
    PageName: nullIfEmpty(row.PageName),
    PageUrl: row.PageUrl ? { Url: row.PageUrl, Description: row.PageUrl } : null,
    PageSyncStatus: nullIfEmpty(row.PageSyncStatus),
    LastPageSyncDateUtc: nullIfEmpty(row.LastPageSyncDateUtc),
    TemplateOverrideAllowed: row.TemplateOverrideAllowed ?? null,
  };
}

export interface ArticleWriter {
  upsert(
    row: PublisherArticleRow,
  ): Promise<{ readonly wasCreated: boolean; readonly itemId: number }>;
}

export function createSharePointArticleWriter(deps: {
  descriptor?: PublisherListDescriptor;
  fetchImpl?: FetchImpl;
  fetchRequestDigestImpl?: DigestImpl;
} = {}): ArticleWriter {
  const descriptor = deps.descriptor ?? PUBLISHER_LISTS.articles;
  const fetchImpl = deps.fetchImpl ?? fetch;
  const digestImpl = deps.fetchRequestDigestImpl ?? fetchRequestDigest;
  return {
    async upsert(row) {
      const digest = await digestImpl(descriptor.hostSiteUrl);
      const body = mapArticleRowToListFields(row);
      const existing = await findItemIdByField(
        descriptor,
        'ArticleId',
        row.ArticleId,
        fetchImpl,
      );
      if (existing !== undefined) {
        await mergeItem(descriptor, existing, body, digest, fetchImpl);
        return { wasCreated: false, itemId: existing };
      }
      const itemId = await postItem(descriptor, body, digest, fetchImpl);
      return { wasCreated: true, itemId };
    },
  };
}

/* ── Child-row writers (replace-all-by-ArticleId) ────────────────── */

/**
 * Map a `PublisherTeamMemberRow` to the SharePoint REST field bag for
 * `HB Article Team Members`. Emits only tenant-supported columns
 * (schema report §B).
 *
 * Tenant→transport distinction: the tenant column is the User field
 * `PersonPrincipal`; the REST write alias is `PersonPrincipalId`
 * (integer user id). The team-members writer resolves the principal
 * via `ensureUserByEmail` before calling this mapper, so by the time
 * we encode the row the id MUST already be present. We refuse to emit
 * a `null` for this required User field — silently persisting `null`
 * breaks the row on the tenant list and is the exact failure mode
 * this seam exists to prevent.
 */
export function mapTeamMemberRowToListFields(
  row: PublisherTeamMemberRow,
): Record<string, unknown> {
  if (typeof row.PersonPrincipalId !== 'number') {
    throw new Error(
      `mapTeamMemberRowToListFields: PersonPrincipalId is required (tenant User field). ` +
        `Resolve the principal '${row.PersonPrincipal}' to a SharePoint user id before write ` +
        `(team member '${row.TeamMemberId}' on article '${row.ArticleId}').`,
    );
  }
  return {
    ArticleId: row.ArticleId,
    TeamMemberId: row.TeamMemberId,
    Title: row.Title,
    PersonPrincipalId: row.PersonPrincipalId,
    DisplayName: row.DisplayName,
    Role: nullIfEmpty(row.Role),
    Company: nullIfEmpty(row.Company),
    Department: nullIfEmpty(row.Department),
    GroupKey: nullIfEmpty(row.GroupKey),
    ParentMemberId: nullIfEmpty(row.ParentMemberId),
    IsFeaturedMember: row.IsFeaturedMember ?? null,
    SortOrder: row.SortOrder ?? null,
    BioSnippet: nullIfEmpty(row.BioSnippet),
    ContactLink: row.ContactLink
      ? { Url: row.ContactLink, Description: row.ContactLink }
      : null,
  };
}

/**
 * Map a `PublisherMediaRow` to the SharePoint REST field bag for
 * `HB Article Media`. Emits only tenant-supported columns
 * (schema report §C). The asset URL column is `ImageAsset` (URL
 * field) — NOT `ImageAssetUrl`; SharePoint serializes URL fields as
 * `{ Url, Description }`. `Title` is a required tenant column and is
 * written unconditionally.
 */
export function mapMediaRowToListFields(
  row: PublisherMediaRow,
): Record<string, unknown> {
  return {
    ArticleId: row.ArticleId,
    MediaId: row.MediaId,
    Title: row.Title,
    MediaRole: row.MediaRole,
    ImageAsset: { Url: row.ImageAsset, Description: row.ImageAsset },
    AltText: row.AltText,
    Caption: nullIfEmpty(row.Caption),
    SortOrder: row.SortOrder ?? null,
    GalleryGroup: nullIfEmpty(row.GalleryGroup),
    FeaturedInGallery: row.FeaturedInGallery ?? null,
  };
}

export interface ChildSyncOutcome {
  /** New rows POSTed (no existing match on the child key). */
  readonly created: number;
  /** Existing rows merged in place by child key. */
  readonly updated: number;
  /** Existing rows removed because the caller did not include them. */
  readonly deleted: number;
  /** `created + updated`, kept for back-compat with older callers. */
  readonly written: number;
}

export interface TeamMembersWriter {
  replaceAllForArticle(
    articleId: string,
    rows: readonly PublisherTeamMemberRow[],
  ): Promise<ChildSyncOutcome>;
}

export interface MediaWriter {
  replaceAllForArticle(
    articleId: string,
    rows: readonly PublisherMediaRow[],
  ): Promise<ChildSyncOutcome>;
}

/**
 * Non-destructive keyed-sync writer for child rows.
 *
 * Strategy (replaces the previous delete-all → recreate-all pattern):
 *   1. List existing tenant rows for `ArticleId`, returning `{Id, childKey}`.
 *   2. For each incoming row:
 *        - matching `childKey` → MERGE the existing item (preserves
 *          tenant Id, version history, and any tenant-side fields the
 *          caller did not author).
 *        - no match              → POST a new item.
 *   3. ONLY after every MERGE/POST has succeeded, delete the
 *      existing rows whose `childKey` was not in the incoming set.
 *
 * The deletion phase runs after writes, not before, so a mid-write
 * failure cannot leave the article with zero children. Throws on any
 * failure; the caller surfaces a partial-write error instead of
 * silent data loss.
 */
function createKeyedSyncWriter<T>(
  descriptor: PublisherListDescriptor,
  childKeyField: string,
  childKeyOf: (row: T) => string,
  mapFn: (row: T) => Record<string, unknown>,
  fetchImpl: FetchImpl,
  digestImpl: DigestImpl,
  preWrite?: (row: T, digest: string) => Promise<T>,
) {
  return async function replaceAllForArticle(
    articleId: string,
    rows: readonly T[],
  ): Promise<ChildSyncOutcome> {
    const digest = await digestImpl(descriptor.hostSiteUrl);
    const existing = await listItemsByParentKey(
      descriptor,
      'ArticleId',
      articleId,
      childKeyField,
      fetchImpl,
    );
    const existingByKey = new Map<string, number>();
    for (const e of existing) existingByKey.set(e.childKey, e.Id);

    let created = 0;
    let updated = 0;
    const incomingKeys = new Set<string>();
    for (const source of rows) {
      const row = preWrite ? await preWrite(source, digest) : source;
      const key = childKeyOf(row);
      incomingKeys.add(key);
      const body = mapFn(row);
      const existingId = existingByKey.get(key);
      if (existingId !== undefined) {
        await mergeItem(descriptor, existingId, body, digest, fetchImpl);
        updated += 1;
      } else {
        await postItem(descriptor, body, digest, fetchImpl);
        created += 1;
      }
    }

    // Deletion runs LAST. If any MERGE/POST above threw, we never
    // reach this block and the prior server rows remain intact.
    let deleted = 0;
    for (const e of existing) {
      if (!incomingKeys.has(e.childKey)) {
        await deleteItem(descriptor, e.Id, digest, fetchImpl);
        deleted += 1;
      }
    }

    return { created, updated, deleted, written: created + updated };
  };
}

/**
 * Resolver seam: email/login → SharePoint numeric user id. Defaults to
 * `ensureUserByEmail` against the descriptor's host site; tests inject
 * a deterministic stub. The writer calls this for every team-member
 * row whose `PersonPrincipalId` is missing, BEFORE the transport
 * payload is encoded. Unresolved or empty principals throw — the
 * tenant `PersonPrincipal` User field is required and cannot be
 * persisted as `null`.
 */
export type EnsureUserIdImpl = (
  email: string,
  digest: string,
) => Promise<number | undefined>;

export function createSharePointTeamMembersWriter(deps: {
  descriptor?: PublisherListDescriptor;
  fetchImpl?: FetchImpl;
  fetchRequestDigestImpl?: DigestImpl;
  ensureUserId?: EnsureUserIdImpl;
} = {}): TeamMembersWriter {
  const descriptor = deps.descriptor ?? PUBLISHER_LISTS.teamMembers;
  const ensureUserId: EnsureUserIdImpl =
    deps.ensureUserId ??
    ((email, digest) => ensureUserByEmail(descriptor.hostSiteUrl, email, digest));

  async function resolvePrincipal(
    row: PublisherTeamMemberRow,
    digest: string,
  ): Promise<PublisherTeamMemberRow> {
    if (typeof row.PersonPrincipalId === 'number') return row;
    const principal = row.PersonPrincipal?.trim() ?? '';
    if (principal.length === 0) {
      throw new Error(
        `Team member '${row.TeamMemberId}' on article '${row.ArticleId}' ` +
          `has no PersonPrincipal — the tenant User field is required.`,
      );
    }
    const resolvedId = await ensureUserId(principal, digest);
    if (typeof resolvedId !== 'number') {
      throw new Error(
        `Could not resolve SharePoint user id for PersonPrincipal '${principal}' ` +
          `(team member '${row.TeamMemberId}' on article '${row.ArticleId}').`,
      );
    }
    return { ...row, PersonPrincipalId: resolvedId };
  }

  return {
    replaceAllForArticle: createKeyedSyncWriter<PublisherTeamMemberRow>(
      descriptor,
      'TeamMemberId',
      (row) => row.TeamMemberId,
      mapTeamMemberRowToListFields,
      deps.fetchImpl ?? fetch,
      deps.fetchRequestDigestImpl ?? fetchRequestDigest,
      resolvePrincipal,
    ),
  };
}

export function createSharePointMediaWriter(deps: {
  descriptor?: PublisherListDescriptor;
  fetchImpl?: FetchImpl;
  fetchRequestDigestImpl?: DigestImpl;
} = {}): MediaWriter {
  const descriptor = deps.descriptor ?? PUBLISHER_LISTS.media;
  return {
    replaceAllForArticle: createKeyedSyncWriter<PublisherMediaRow>(
      descriptor,
      'MediaId',
      (row) => row.MediaId,
      mapMediaRowToListFields,
      deps.fetchImpl ?? fetch,
      deps.fetchRequestDigestImpl ?? fetchRequestDigest,
    ),
  };
}

/* ── Workflow history append ──────────────────────────────────── */

export function mapWorkflowHistoryRowToListFields(
  row: PublisherWorkflowHistoryRow,
): Record<string, unknown> {
  return {
    HistoryId: row.HistoryId,
    ArticleId: row.ArticleId,
    Title: row.Title,
    NewState: row.NewState,
    PreviousState: nullIfEmpty(row.PreviousState),
    ActionDateUtc: row.ActionDateUtc,
    ActorEmail: nullIfEmpty(row.ActorEmail),
    ActionNote: nullIfEmpty(row.ActionNote),
    // Wave-03 Prompt-05 structured supersession lineage. Emitted only
    // on regenerate events; undefined/empty on all other workflow
    // transitions. Uses the same `{ Url, Description }` hyperlink
    // shape SharePoint expects for URL columns (mirrors the binding
    // writer's PageUrl projection).
    SupersededBindingId: nullIfEmpty(row.SupersededBindingId),
    SupersededPageId: nullIfEmpty(row.SupersededPageId),
    SupersededPageName: nullIfEmpty(row.SupersededPageName),
    SupersededPageUrl: row.SupersededPageUrl
      ? { Url: row.SupersededPageUrl, Description: row.SupersededPageUrl }
      : null,
    NewBindingId: nullIfEmpty(row.NewBindingId),
    NewPageId: nullIfEmpty(row.NewPageId),
    NewPageName: nullIfEmpty(row.NewPageName),
    NewPageUrl: row.NewPageUrl
      ? { Url: row.NewPageUrl, Description: row.NewPageUrl }
      : null,
  };
}

export interface WorkflowHistoryWriter {
  append(row: PublisherWorkflowHistoryRow): Promise<{ readonly itemId: number }>;
}

export function createSharePointWorkflowHistoryWriter(deps: {
  descriptor?: PublisherListDescriptor;
  fetchImpl?: FetchImpl;
  fetchRequestDigestImpl?: DigestImpl;
} = {}): WorkflowHistoryWriter {
  const descriptor = deps.descriptor ?? PUBLISHER_LISTS.workflowHistory;
  const fetchImpl = deps.fetchImpl ?? fetch;
  const digestImpl = deps.fetchRequestDigestImpl ?? fetchRequestDigest;
  return {
    async append(row) {
      const digest = await digestImpl(descriptor.hostSiteUrl);
      const itemId = await postItem(
        descriptor,
        mapWorkflowHistoryRowToListFields(row),
        digest,
        fetchImpl,
      );
      return { itemId };
    },
  };
}

/* ── Publishing-errors append ─────────────────────────────────── */

export function mapPublishingErrorRowToListFields(
  row: PublisherPublishingErrorRow,
): Record<string, unknown> {
  return {
    ErrorId: row.ErrorId,
    ArticleId: row.ArticleId,
    Title: row.Title,
    Destination: row.Destination,
    Operation: row.Operation,
    ErrorSummary: row.ErrorSummary,
    BindingId: nullIfEmpty(row.BindingId),
    LastAttemptDateUtc: nullIfEmpty(row.LastAttemptDateUtc),
    RetryStatus: nullIfEmpty(row.RetryStatus),
    // Wave-03 Prompt-06 structured classification columns.
    FailureStage: nullIfEmpty(row.FailureStage),
    FailureContext: nullIfEmpty(row.FailureContext),
    FailureSubsystem: nullIfEmpty(row.FailureSubsystem),
    ActorEmail: nullIfEmpty(row.ActorEmail),
  };
}

export interface PublishingErrorsWriter {
  append(row: PublisherPublishingErrorRow): Promise<{ readonly itemId: number }>;
}

export function createSharePointPublishingErrorsWriter(deps: {
  descriptor?: PublisherListDescriptor;
  fetchImpl?: FetchImpl;
  fetchRequestDigestImpl?: DigestImpl;
} = {}): PublishingErrorsWriter {
  const descriptor = deps.descriptor ?? PUBLISHER_LISTS.publishingErrors;
  const fetchImpl = deps.fetchImpl ?? fetch;
  const digestImpl = deps.fetchRequestDigestImpl ?? fetchRequestDigest;
  return {
    async append(row) {
      const digest = await digestImpl(descriptor.hostSiteUrl);
      const itemId = await postItem(
        descriptor,
        mapPublishingErrorRowToListFields(row),
        digest,
        fetchImpl,
      );
      return { itemId };
    },
  };
}
