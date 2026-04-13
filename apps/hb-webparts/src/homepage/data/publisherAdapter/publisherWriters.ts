/**
 * Write seams for Project Spotlight publisher lists (Wave 6).
 *
 * Follows the same list-title + request-digest pattern established by
 * `pageBindingWriter.ts` and the hero-banner writer. Each writer is
 * injectable so the authoring UI can pass a mock in tests.
 *
 * Authority:
 *   architecture doc 03 §§A,B,C,F — MVP=Yes field sets.
 *   architecture doc 04 — child-row relationships (PostId is the parent key).
 *   architecture doc 09 — workflow history semantics.
 *   operating-charter rule 5 — structured lists are the editorial source of truth.
 */

import { fetchRequestDigest } from '@hbc/sharepoint-platform';
import type {
  PublisherMediaRow,
  PublisherPostRow,
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

/* ── Post upsert ──────────────────────────────────────────────── */

export function mapPostRowToListFields(
  row: PublisherPostRow,
): Record<string, unknown> {
  return {
    PostId: row.PostId,
    Title: row.Title,
    BannerTitleOverride: nullIfEmpty(row.BannerTitleOverride),
    Subhead: row.Subhead,
    SummaryExcerpt: row.SummaryExcerpt,
    BodyRichText: row.BodyRichText,
    PostFamily: row.PostFamily,
    SpotlightType: nullIfEmpty(row.SpotlightType),
    ProjectStage: nullIfEmpty(row.ProjectStage),
    ArticleSubject: nullIfEmpty(row.ArticleSubject),
    TemplateKey: row.TemplateKey,
    PageShellKey: row.PageShellKey,
    Slug: row.Slug,
    WorkflowState: row.WorkflowState,
    AuthorEmail: nullIfEmpty(row.AuthorEmail),
    AuthorDisplayName: nullIfEmpty(row.AuthorDisplayName),
    CreatedDateUtc: row.CreatedDateUtc,
    UpdatedDateUtc: row.UpdatedDateUtc,
    PublishedDateUtc: nullIfEmpty(row.PublishedDateUtc),
    ScheduledPublishDateUtc: nullIfEmpty(row.ScheduledPublishDateUtc),
    ArchiveDateUtc: nullIfEmpty(row.ArchiveDateUtc),
    ProjectId: row.ProjectId,
    ProjectName: row.ProjectName,
    ProjectLocation: nullIfEmpty(row.ProjectLocation),
    ProjectSector: nullIfEmpty(row.ProjectSector),
    BannerImageUrl: { Url: row.BannerImageUrl, Description: row.BannerImageUrl },
    BannerImageAltText: row.BannerImageAltText,
    BannerEyebrow: nullIfEmpty(row.BannerEyebrow),
    BannerCategoryLabel: nullIfEmpty(row.BannerCategoryLabel),
    BannerThemeVariant: nullIfEmpty(row.BannerThemeVariant),
    BannerShowPublishDate: row.BannerShowPublishDate ?? null,
    BannerShowGradient: row.BannerShowGradient ?? null,
    HeroRendererKind: nullIfEmpty(row.HeroRendererKind),
    ShowTeamViewer: row.ShowTeamViewer ?? null,
    TeamSectionHeading: nullIfEmpty(row.TeamSectionHeading),
    TeamViewerLayout: nullIfEmpty(row.TeamViewerLayout),
    TeamViewerDensity: nullIfEmpty(row.TeamViewerDensity),
    TeamViewerEnableProfileDrawer: row.TeamViewerEnableProfileDrawer ?? null,
    ShowGallery: row.ShowGallery ?? null,
    GalleryLayoutProfile: nullIfEmpty(row.GalleryLayoutProfile),
    IsFeatured: row.IsFeatured ?? null,
    FeaturedRank: row.FeaturedRank ?? null,
    IsPinned: row.IsPinned ?? null,
    PinRank: row.PinRank ?? null,
    IncludeInProjectSpotlightRollups: row.IncludeInProjectSpotlightRollups ?? null,
    IncludeInArchive: row.IncludeInArchive ?? null,
    TargetSiteUrl: row.TargetSiteUrl,
    TargetSiteKey: row.TargetSiteKey,
    GeneratedPageName: nullIfEmpty(row.GeneratedPageName),
    PageUrl: row.PageUrl ? { Url: row.PageUrl, Description: row.PageUrl } : null,
    PageId: nullIfEmpty(row.PageId),
    SourceTemplatePath: row.SourceTemplatePath,
    AppliedTemplateVersion: nullIfEmpty(row.AppliedTemplateVersion),
    AppliedShellVersion: nullIfEmpty(row.AppliedShellVersion),
    LastPageSyncDateUtc: nullIfEmpty(row.LastPageSyncDateUtc),
    PageSyncStatus: nullIfEmpty(row.PageSyncStatus),
    LastSuccessfulPublishDateUtc: nullIfEmpty(row.LastSuccessfulPublishDateUtc),
  };
}

export interface PostWriter {
  upsert(row: PublisherPostRow): Promise<{ readonly wasCreated: boolean; readonly itemId: number }>;
}

export function createSharePointPostWriter(deps: {
  descriptor?: PublisherListDescriptor;
  fetchImpl?: FetchImpl;
  fetchRequestDigestImpl?: DigestImpl;
} = {}): PostWriter {
  const descriptor = deps.descriptor ?? PUBLISHER_LISTS.posts;
  const fetchImpl = deps.fetchImpl ?? fetch;
  const digestImpl = deps.fetchRequestDigestImpl ?? fetchRequestDigest;
  return {
    async upsert(row) {
      const digest = await digestImpl(descriptor.hostSiteUrl);
      const body = mapPostRowToListFields(row);
      const existing = await findItemIdByField(
        descriptor,
        'PostId',
        row.PostId,
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

/* ── Child-row writers (replace-all-by-PostId) ────────────────── */

export function mapTeamMemberRowToListFields(
  row: PublisherTeamMemberRow,
): Record<string, unknown> {
  return {
    PostId: row.PostId,
    TeamMemberId: row.TeamMemberId,
    PersonPrincipal: row.PersonPrincipal,
    DisplayName: row.DisplayName,
    JobTitle: nullIfEmpty(row.JobTitle),
    PhotoUrl: row.PhotoUrl
      ? { Url: row.PhotoUrl, Description: row.PhotoUrl }
      : null,
    SortOrder: row.SortOrder ?? null,
    BioSnippet: nullIfEmpty(row.BioSnippet),
    ResumeRichText: nullIfEmpty(row.ResumeRichText),
    ResumeDocumentUrl: row.ResumeDocumentUrl
      ? { Url: row.ResumeDocumentUrl, Description: row.ResumeDocumentUrl }
      : null,
    ContactLink: row.ContactLink
      ? { Url: row.ContactLink, Description: row.ContactLink }
      : null,
    IncludeInViewer: row.IncludeInViewer ?? null,
  };
}

export function mapMediaRowToListFields(
  row: PublisherMediaRow,
): Record<string, unknown> {
  return {
    PostId: row.PostId,
    MediaId: row.MediaId,
    MediaRole: row.MediaRole,
    ImageAssetUrl: { Url: row.ImageAssetUrl, Description: row.ImageAssetUrl },
    AltText: row.AltText,
    Caption: nullIfEmpty(row.Caption),
    SortOrder: row.SortOrder ?? null,
  };
}

export interface TeamMembersWriter {
  replaceAllForPost(
    postId: string,
    rows: readonly PublisherTeamMemberRow[],
  ): Promise<{ readonly deleted: number; readonly written: number }>;
}

export interface MediaWriter {
  replaceAllForPost(
    postId: string,
    rows: readonly PublisherMediaRow[],
  ): Promise<{ readonly deleted: number; readonly written: number }>;
}

function createReplaceAllWriter<T>(
  descriptor: PublisherListDescriptor,
  mapFn: (row: T) => Record<string, unknown>,
  fetchImpl: FetchImpl,
  digestImpl: DigestImpl,
) {
  return async function replaceAllForPost(
    postId: string,
    rows: readonly T[],
  ): Promise<{ deleted: number; written: number }> {
    const digest = await digestImpl(descriptor.hostSiteUrl);
    const existingIds = await listItemIdsByField(
      descriptor,
      'PostId',
      postId,
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
    replaceAllForPost: createReplaceAllWriter(
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
    replaceAllForPost: createReplaceAllWriter(
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
    PostId: row.PostId,
    FromState: nullIfEmpty(row.FromState),
    ToState: row.ToState,
    Action: row.Action,
    ActorEmail: nullIfEmpty(row.ActorEmail),
    ActionDateUtc: row.ActionDateUtc,
    Note: nullIfEmpty(row.Note),
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
