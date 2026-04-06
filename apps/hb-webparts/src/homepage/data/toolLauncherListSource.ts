/**
 * SharePoint list data source for the Tool Launcher / Work Hub webpart.
 *
 * Fetches items from the "Tool Launcher Contents" list via the
 * SharePoint REST API and normalizes them into LauncherPlatformRecord
 * instances using the domain normalization layer.
 */
import type { RawToolLauncherListItem } from '../webparts/toolLauncherContracts.js';
import { normalizeToolLauncherItems } from './toolLauncherNormalization.js';
import type { LauncherPlatformRecord } from '../webparts/toolLauncherContracts.js';

/* ── List metadata ──────────────────────────────────────────────── */

export const SP_LIST_TITLE = 'Tool Launcher Contents';

/* ── SharePoint field internal names ────────────────────────────── */

export const SP_FIELDS = {
  /* Core identity */
  Title: 'Title',
  PlatformKey: 'PlatformKey',
  LaunchURL: 'LaunchURL',

  /* Logo / brand treatment */
  OfficialLogoAssetReference: 'OfficialLogoAssetReference',
  DarkLogoAssetReference: 'DarkLogoAssetReference',
  PreferredLogoType: 'PreferredLogoType',

  /* Content / description */
  ShortDescriptor: 'ShortDescriptor',
  Category: 'Category',
  WorkflowShelf: 'WorkflowShelf',
  AliasesKeywords: 'AliasesKeywords',
  Notes: 'Notes',

  /* Visibility and featured */
  IsActive: 'IsActive',
  Featured: 'Featured',
  FeaturedSortOrder: 'FeaturedSortOrder',
  SortOrder: 'SortOrder',
  AudienceVisibility: 'AudienceVisibility',
  AudienceRulesJSON: 'AudienceRulesJSON',
  OpenInNewTab: 'OpenInNewTab',
  FavoriteEligible: 'FavoriteEligible',

  /* Support / help */
  HelpLink: 'HelpLink',
  SupportOwner: 'SupportOwner',
  SupportOwnerReference: 'SupportOwnerReference',
  AccessRequestDestination: 'AccessRequestDestination',

  /* Notice / status */
  NoticeStatus: 'NoticeStatus',
  NoticeBadgeText: 'NoticeBadgeText',
  NoticeDetails: 'NoticeDetails',
  NoticeExpiresOn: 'NoticeExpiresOn',
  StatusBadgeTone: 'StatusBadgeTone',

  /* Governance */
  VendorProductFamily: 'VendorProductFamily',
  TenantEnvironmentLabel: 'TenantEnvironmentLabel',
  RequiresReview: 'RequiresReview',
  LastReviewedOn: 'LastReviewedOn',
} as const;

/**
 * $select fields for the REST query.
 * Notes is excluded from the query — it is governance-only metadata
 * not needed at render time.
 */
const SELECT_FIELDS = [
  SP_FIELDS.Title,
  SP_FIELDS.PlatformKey,
  SP_FIELDS.LaunchURL,
  SP_FIELDS.OfficialLogoAssetReference,
  SP_FIELDS.DarkLogoAssetReference,
  SP_FIELDS.PreferredLogoType,
  SP_FIELDS.ShortDescriptor,
  SP_FIELDS.Category,
  SP_FIELDS.WorkflowShelf,
  SP_FIELDS.AliasesKeywords,
  SP_FIELDS.IsActive,
  SP_FIELDS.Featured,
  SP_FIELDS.FeaturedSortOrder,
  SP_FIELDS.SortOrder,
  SP_FIELDS.AudienceVisibility,
  SP_FIELDS.AudienceRulesJSON,
  SP_FIELDS.OpenInNewTab,
  SP_FIELDS.FavoriteEligible,
  SP_FIELDS.HelpLink,
  SP_FIELDS.SupportOwner,
  SP_FIELDS.SupportOwnerReference,
  SP_FIELDS.AccessRequestDestination,
  SP_FIELDS.NoticeStatus,
  SP_FIELDS.NoticeBadgeText,
  SP_FIELDS.NoticeDetails,
  SP_FIELDS.NoticeExpiresOn,
  SP_FIELDS.StatusBadgeTone,
  SP_FIELDS.VendorProductFamily,
  SP_FIELDS.TenantEnvironmentLabel,
  SP_FIELDS.RequiresReview,
  SP_FIELDS.LastReviewedOn,
].join(',');

/* ── Public API ──────────────────────────────────────────────────── */

/**
 * Fetch active tool launcher items from the Tool Launcher Contents
 * list and normalize them into the launcher domain model.
 *
 * Server-side filter on IsActive. All further normalization (dedup,
 * audience filtering, sort, notice expiry) happens in the
 * normalization layer.
 */
export async function fetchToolLauncherListItems(
  siteUrl: string,
): Promise<LauncherPlatformRecord[]> {
  const filter = `${SP_FIELDS.IsActive} eq 1`;
  const url =
    `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(SP_LIST_TITLE)}')/items` +
    `?$select=${SELECT_FIELDS}` +
    `&$filter=${filter}` +
    `&$top=100`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json;odata=nometadata',
    },
  });

  if (!response.ok) {
    throw new Error(`Tool Launcher list request failed: ${response.status} ${response.statusText}`);
  }

  const body = (await response.json()) as { value?: RawToolLauncherListItem[] };
  const rawItems = body.value ?? [];

  return normalizeToolLauncherItems(rawItems);
}
