/**
 * Read-side SharePoint service for the Foleon Content Registry.
 *
 * Uses @hbc/sharepoint-platform list-by-GUID descriptor endpoint
 * builders so the service inherits the repo-wide GUID-binding rule
 * (never bind by list title) even though the SharePoint data-model
 * plan names the list `HB_FoleonContentRegistry`.
 */
import {
  buildListItemsEndpoint,
  fetchListItemsJson,
  type SharePointListDescriptor,
  type ListItemsQuery,
} from '@hbc/sharepoint-platform';
import type {
  FoleonContentRecord,
  FoleonContentType,
  FoleonOpenMode,
  FoleonPublishStatus,
  FoleonSyncSource,
} from '../types/foleon-content.types.js';

export const FOLEON_CONTENT_REGISTRY_TITLE = 'HB_FoleonContentRegistry' as const;

interface FoleonContentRawRow {
  Id?: number;
  Title?: string;
  FoleonDocId?: number;
  FoleonDocUid?: string;
  FoleonIdentifier?: string;
  FoleonProjectId?: number;
  FoleonProjectName?: string;
  ContentTypeKey?: string;
  PublishStatus?: string;
  IsVisible?: boolean;
  IsFeatured?: boolean;
  IsHomepageEligible?: boolean;
  PublishedUrl?: { Url?: string } | string | null;
  PreviewUrl?: { Url?: string } | string | null;
  EmbedUrl?: { Url?: string } | string | null;
  ThumbnailUrl?: { Url?: string } | string | null;
  HeroImageUrl?: { Url?: string } | string | null;
  Summary?: string;
  IssueDate?: string;
  PublishedOn?: string;
  DisplayFrom?: string;
  DisplayThrough?: string;
  SortRank?: number;
  RelatedProjectNumber?: string;
  RelatedProjectName?: string;
  Region?: string;
  Sector?: string;
  OpenMode?: string;
  AllowEmbed?: boolean;
  RequiresExternalOpen?: boolean;
  SyncSource?: string;
}

const CONTENT_SELECT_FIELDS = [
  'Id',
  'Title',
  'FoleonDocId',
  'FoleonDocUid',
  'FoleonIdentifier',
  'FoleonProjectId',
  'FoleonProjectName',
  'ContentTypeKey',
  'PublishStatus',
  'IsVisible',
  'IsFeatured',
  'IsHomepageEligible',
  'PublishedUrl',
  'PreviewUrl',
  'EmbedUrl',
  'ThumbnailUrl',
  'HeroImageUrl',
  'Summary',
  'IssueDate',
  'PublishedOn',
  'DisplayFrom',
  'DisplayThrough',
  'SortRank',
  'RelatedProjectNumber',
  'RelatedProjectName',
  'Region',
  'Sector',
  'OpenMode',
  'AllowEmbed',
  'RequiresExternalOpen',
  'SyncSource',
].join(',');

export interface FoleonContentQueryParams {
  readonly siteUrl: string;
  readonly contentRegistryListId: string;
  readonly foleonDocId?: number;
  readonly homepageEligibleOnly?: boolean;
  readonly publishedOnly?: boolean;
  readonly top?: number;
  readonly signal?: AbortSignal;
}

export async function fetchFoleonContent(
  params: FoleonContentQueryParams,
): Promise<ReadonlyArray<FoleonContentRecord>> {
  const descriptor: SharePointListDescriptor = {
    id: params.contentRegistryListId,
    title: FOLEON_CONTENT_REGISTRY_TITLE,
    urlSegment: FOLEON_CONTENT_REGISTRY_TITLE,
  };
  const filterClauses: string[] = [];
  if (typeof params.foleonDocId === 'number') {
    filterClauses.push(`FoleonDocId eq ${params.foleonDocId}`);
  }
  if (params.publishedOnly) {
    filterClauses.push(`IsVisible eq 1`);
    filterClauses.push(`PublishStatus eq 'Published'`);
  }
  if (params.homepageEligibleOnly) {
    filterClauses.push(`IsHomepageEligible eq 1`);
  }
  const query: ListItemsQuery = {
    select: CONTENT_SELECT_FIELDS,
    top: params.top ?? 100,
    ...(filterClauses.length > 0 ? { filter: filterClauses.join(' and ') } : {}),
  };
  const endpoint = buildListItemsEndpoint(params.siteUrl, descriptor, query);
  const rows = await fetchListItemsJson<FoleonContentRawRow>(endpoint, {
    signal: params.signal,
    label: FOLEON_CONTENT_REGISTRY_TITLE,
  });
  return rows.map(toFoleonContentRecord).filter((row): row is FoleonContentRecord => row !== null);
}

export function toFoleonContentRecord(row: FoleonContentRawRow): FoleonContentRecord | null {
  if (typeof row.Id !== 'number' || typeof row.FoleonDocId !== 'number') return null;
  return {
    id: row.Id,
    title: row.Title ?? '',
    foleonDocId: row.FoleonDocId,
    foleonDocUid: row.FoleonDocUid,
    foleonIdentifier: row.FoleonIdentifier,
    foleonProjectId: row.FoleonProjectId,
    foleonProjectName: row.FoleonProjectName,
    contentTypeKey: normalizeContentType(row.ContentTypeKey),
    publishStatus: normalizePublishStatus(row.PublishStatus),
    isVisible: !!row.IsVisible,
    isFeatured: !!row.IsFeatured,
    isHomepageEligible: !!row.IsHomepageEligible,
    publishedUrl: readHyperlink(row.PublishedUrl),
    previewUrl: readHyperlink(row.PreviewUrl),
    embedUrl: readHyperlink(row.EmbedUrl),
    thumbnailUrl: readHyperlink(row.ThumbnailUrl),
    heroImageUrl: readHyperlink(row.HeroImageUrl),
    summary: row.Summary,
    issueDate: row.IssueDate,
    publishedOn: row.PublishedOn,
    displayFrom: row.DisplayFrom,
    displayThrough: row.DisplayThrough,
    sortRank: row.SortRank,
    relatedProjectNumber: row.RelatedProjectNumber,
    relatedProjectName: row.RelatedProjectName,
    region: row.Region,
    sector: row.Sector,
    openMode: normalizeOpenMode(row.OpenMode),
    allowEmbed: !!row.AllowEmbed,
    requiresExternalOpen: !!row.RequiresExternalOpen,
    syncSource: normalizeSyncSource(row.SyncSource),
  };
}

function readHyperlink(value: FoleonContentRawRow['PublishedUrl']): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return value.Url ?? undefined;
}

function normalizeContentType(value: string | undefined): FoleonContentType {
  const allowed: ReadonlyArray<FoleonContentType> = [
    'Project Highlight',
    'Newsletter',
    'Company News',
    'Market Update',
    'Leadership',
    'Other',
  ];
  return allowed.includes(value as FoleonContentType) ? (value as FoleonContentType) : 'Other';
}

function normalizePublishStatus(value: string | undefined): FoleonPublishStatus {
  const allowed: ReadonlyArray<FoleonPublishStatus> = [
    'Draft',
    'Preview',
    'Published',
    'Archived',
    'Offline',
    'Suppressed',
  ];
  return allowed.includes(value as FoleonPublishStatus) ? (value as FoleonPublishStatus) : 'Draft';
}

function normalizeOpenMode(value: string | undefined): FoleonOpenMode {
  const allowed: ReadonlyArray<FoleonOpenMode> = [
    'Inline Reader',
    'Fullscreen Reader',
    'New Tab Only',
  ];
  return allowed.includes(value as FoleonOpenMode) ? (value as FoleonOpenMode) : 'Inline Reader';
}

function normalizeSyncSource(value: string | undefined): FoleonSyncSource {
  const allowed: ReadonlyArray<FoleonSyncSource> = ['Manual', 'Foleon API', 'Hybrid'];
  return allowed.includes(value as FoleonSyncSource) ? (value as FoleonSyncSource) : 'Manual';
}

export { CONTENT_SELECT_FIELDS as FOLEON_CONTENT_SELECT_FIELDS };
