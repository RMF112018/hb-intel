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

/**
 * Maps semantic field names (used by the domain model) to the live
 * SharePoint internal column names from the "Tool Launcher Contents"
 * list export. Many columns retain generic `field_N` internal names
 * from original list creation.
 */
export const SP_FIELDS = {
  /* Core identity */
  Title: 'Title',
  PlatformKey: 'field_1',
  LaunchURL: 'field_2',

  /* Logo / brand treatment */
  OfficialLogoAssetReference: 'field_3',
  DarkLogoAssetReference: 'field_4',
  PreferredLogoType: 'field_5',

  /* Content / description */
  ShortDescriptor: 'field_6',
  Category: 'field_8',
  WorkflowShelf: 'field_7',
  AliasesKeywords: 'field_14',
  Notes: 'field_31',

  /* Visibility and featured */
  IsActive: 'IsActive',
  Featured: 'Featured',
  FeaturedSortOrder: 'field_10',
  SortOrder: 'field_11',
  AudienceVisibility: 'field_12',
  AudienceRulesJSON: 'field_13',
  OpenInNewTab: 'OpenInNewTab',
  FavoriteEligible: 'FavoriteEligible',

  /* Support / help */
  HelpLink: 'HelpLink',
  SupportOwner: 'field_16',
  SupportOwnerReference: 'SupportOwnerReference',
  AccessRequestDestination: 'AccessRequestDestination',

  /* Notice / status */
  NoticeStatus: 'field_19',
  NoticeBadgeText: 'field_20',
  NoticeDetails: 'field_21',
  NoticeExpiresOn: 'field_22',
  StatusBadgeTone: 'field_26',

  /* Governance */
  VendorProductFamily: 'field_27',
  TenantEnvironmentLabel: 'field_28',
  RequiresReview: 'RequiresReview',
  LastReviewedOn: 'field_30',
} as const;

/* ── Reverse map: live internal name → semantic key ────────────── */

const SP_FIELD_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(SP_FIELDS).map(([semantic, internal]) => [internal, semantic]),
);

/**
 * Translate a raw SharePoint REST item (keyed by live internal names)
 * into the semantic {@link RawToolLauncherListItem} shape expected by
 * the normalization layer.
 */
function mapToSemanticItem(spItem: Record<string, unknown>): RawToolLauncherListItem {
  const semantic: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(spItem)) {
    semantic[SP_FIELD_REVERSE[key] ?? key] = value;
  }
  return semantic as RawToolLauncherListItem;
}

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

  let body: { value?: unknown };
  try {
    body = (await response.json()) as { value?: unknown };
  } catch {
    throw new Error('Tool Launcher list response was not valid JSON');
  }

  // Guard against malformed responses — value must be an array
  const rawValue = body.value;
  const spItems: Record<string, unknown>[] = Array.isArray(rawValue)
    ? (rawValue as Record<string, unknown>[])
    : [];

  // Translate live internal names back to semantic keys before normalization
  const rawItems: RawToolLauncherListItem[] = spItems.map(mapToSemanticItem);

  return normalizeToolLauncherItems(rawItems);
}
