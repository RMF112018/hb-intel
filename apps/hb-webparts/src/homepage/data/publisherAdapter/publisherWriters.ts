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

import { fetchRequestDigest } from '@hbc/sharepoint-platform';
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
 * (schema report §B). `PersonPrincipal` is a User field, so the
 * writer emits `PersonPrincipalId` (integer user id) — callers must
 * resolve the principal email/login to a user id (e.g. via
 * `ensureUserByEmail`) before invoking this mapper. When no id is
 * present the User column is sent as `null`, which SharePoint treats
 * as "clear" — the caller is responsible for not persisting rows
 * that require the user field to be set.
 */
export function mapTeamMemberRowToListFields(
  row: PublisherTeamMemberRow,
): Record<string, unknown> {
  return {
    ArticleId: row.ArticleId,
    TeamMemberId: row.TeamMemberId,
    Title: row.Title,
    PersonPrincipalId: row.PersonPrincipalId ?? null,
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

export function mapMediaRowToListFields(
  row: PublisherMediaRow,
): Record<string, unknown> {
  return {
    ArticleId: row.ArticleId,
    MediaId: row.MediaId,
    MediaRole: row.MediaRole,
    ImageAssetUrl: { Url: row.ImageAssetUrl, Description: row.ImageAssetUrl },
    AltText: row.AltText,
    Caption: nullIfEmpty(row.Caption),
    SortOrder: row.SortOrder ?? null,
  };
}

export interface TeamMembersWriter {
  replaceAllForArticle(
    articleId: string,
    rows: readonly PublisherTeamMemberRow[],
  ): Promise<{ readonly deleted: number; readonly written: number }>;
}

export interface MediaWriter {
  replaceAllForArticle(
    articleId: string,
    rows: readonly PublisherMediaRow[],
  ): Promise<{ readonly deleted: number; readonly written: number }>;
}

function createReplaceAllWriter<T>(
  descriptor: PublisherListDescriptor,
  mapFn: (row: T) => Record<string, unknown>,
  fetchImpl: FetchImpl,
  digestImpl: DigestImpl,
) {
  return async function replaceAllForArticle(
    articleId: string,
    rows: readonly T[],
  ): Promise<{ deleted: number; written: number }> {
    const digest = await digestImpl(descriptor.hostSiteUrl);
    const existingIds = await listItemIdsByField(
      descriptor,
      'ArticleId',
      articleId,
      fetchImpl,
    );
    for (const id of existingIds) {
      await deleteItem(descriptor, id, digest, fetchImpl);
    }
    let written = 0;
    for (const row of rows) {
      await postItem(descriptor, mapFn(row), digest, fetchImpl);
      written += 1;
    }
    return { deleted: existingIds.length, written };
  };
}

export function createSharePointTeamMembersWriter(deps: {
  descriptor?: PublisherListDescriptor;
  fetchImpl?: FetchImpl;
  fetchRequestDigestImpl?: DigestImpl;
} = {}): TeamMembersWriter {
  const descriptor = deps.descriptor ?? PUBLISHER_LISTS.teamMembers;
  return {
    replaceAllForArticle: createReplaceAllWriter(
      descriptor,
      mapTeamMemberRowToListFields,
      deps.fetchImpl ?? fetch,
      deps.fetchRequestDigestImpl ?? fetchRequestDigest,
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
    replaceAllForArticle: createReplaceAllWriter(
      descriptor,
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
