/**
 * Tool Launcher / Work Hub domain contracts.
 *
 * Three layers:
 * 1. RawToolLauncherListItem  — runtime payload from SharePoint REST API
 * 2. LauncherPlatformRecord   — normalized internal model
 * 3. Presentation types       — derived structures for stage, shelves, index
 */

import type { UtilityBadgeVariant } from './utilityContracts.js';

/* ── 1. Raw SharePoint list item ──────────────────────────────────── */

/** Shape returned by the SharePoint REST API after $select/$expand. */
export interface RawToolLauncherListItem {
  /* Core identity */
  Title?: string;
  PlatformKey?: string;
  LaunchURL?: string | { Url?: string; Description?: string };

  /* Logo / brand treatment */
  OfficialLogoAssetReference?: string;
  DarkLogoAssetReference?: string;
  PreferredLogoType?: string;

  /* Content / description */
  ShortDescriptor?: string;
  Category?: string;
  WorkflowShelf?: string;
  AliasesKeywords?: string;
  Notes?: string;

  /* Visibility and featured */
  IsActive?: boolean | null;
  Featured?: boolean | null;
  FeaturedSortOrder?: number | null;
  SortOrder?: number | null;
  AudienceVisibility?: string | { results?: string[] } | null;
  AudienceRulesJSON?: string;
  OpenInNewTab?: boolean | null;
  FavoriteEligible?: boolean | null;

  /* Support / help */
  HelpLink?: string | { Url?: string; Description?: string };
  SupportOwner?: string;
  SupportOwnerReference?: string | { Url?: string; Description?: string };
  AccessRequestDestination?: string | { Url?: string; Description?: string };

  /* Notice / status */
  NoticeStatus?: string;
  NoticeBadgeText?: string;
  NoticeDetails?: string;
  NoticeExpiresOn?: string;
  StatusBadgeTone?: string;

  /* Governance */
  VendorProductFamily?: string;
  TenantEnvironmentLabel?: string;
  RequiresReview?: boolean | null;
  LastReviewedOn?: string;
}

/* ── 2. Normalized launcher record ────────────────────────────────── */

export type LauncherLogoPreference =
  | 'official-wordmark'
  | 'official-symbol'
  | 'official-wordmark-plus-symbol'
  | 'tenant-wordmark'
  | 'site-derived-wordmark'
  | 'text-fallback';

export type LauncherNoticeStatus = 'none' | 'outage' | 'maintenance' | 'info';

export interface LauncherNoticeBadge {
  status: LauncherNoticeStatus;
  label: string;
  details?: string;
  expiresOn?: Date;
  tone: UtilityBadgeVariant;
}

export interface LauncherSupportInfo {
  helpUrl?: string;
  supportOwnerName?: string;
  supportOwnerUrl?: string;
  accessRequestUrl?: string;
}

/** Stable normalized record for a single platform in the launcher. */
export interface LauncherPlatformRecord {
  /** Unique key for dedup and asset-manifest matching */
  platformKey: string;
  /** Display name */
  name: string;
  /** Navigation destination */
  launchUrl: string;
  /** Short purpose description */
  descriptor?: string;

  /* Logo */
  logoAssetRef?: string;
  darkLogoAssetRef?: string;
  logoPreference: LauncherLogoPreference;

  /* Organization */
  category?: string;
  workflowShelf?: string;
  aliases: string[];

  /* Visibility */
  isFeatured: boolean;
  featuredSortOrder: number;
  sortOrder: number;
  audiences: string[];
  openInNewTab: boolean;
  favoriteEligible: boolean;

  /* Support */
  support: LauncherSupportInfo;

  /* Notice */
  notice?: LauncherNoticeBadge;

  /* Governance (not rendered; available for staleness checks) */
  vendorFamily?: string;
  tenantLabel?: string;
  requiresReview: boolean;
  lastReviewedOn?: Date;
}

/* ── 3. Presentation-oriented derived structures ──────────────────── */

/** Featured platforms for the flagship stage, pre-sorted by featuredSortOrder. */
export interface LauncherFeaturedStage {
  platforms: LauncherPlatformRecord[];
}

/** A single workflow shelf grouping. */
export interface LauncherWorkflowShelf {
  /** Shelf identity key (slugified shelf name for React keys and data attributes). */
  shelfId: string;
  /** Display name (e.g., "People & Payroll", "Field & Operations"). */
  shelfName: string;
  /** Number of visible platforms in this shelf. */
  platformCount: number;
  /** Platforms in this shelf, sorted by sortOrder then name. */
  platforms: LauncherPlatformRecord[];
}

/** Full platform index for the all-platforms overlay. */
export interface LauncherPlatformIndex {
  /** Grouped by category; uncategorized items grouped under 'Other'. */
  groups: Array<{ category: string; platforms: LauncherPlatformRecord[] }>;
}

/** Aggregated platform notice summary. */
export interface LauncherNoticesSummary {
  activeNotices: Array<{ platformKey: string; name: string; notice: LauncherNoticeBadge }>;
}

/** Pre-derived support action summaries for the utility rail. */
export interface LauncherSupportSummary {
  /** Platforms with help destinations. */
  helpActions: Array<{ platformKey: string; name: string; helpUrl: string; supportOwnerName?: string }>;
  /** Platforms with access-request destinations. */
  accessActions: Array<{ platformKey: string; name: string; accessRequestUrl: string }>;
  /** Platforms with named support contacts. */
  supportContacts: Array<{ platformKey: string; name: string; supportOwnerName: string; supportOwnerUrl?: string }>;
}

/** Complete presentation model derived from normalized records. */
export interface LauncherPresentationModel {
  featuredStage: LauncherFeaturedStage;
  workflowShelves: LauncherWorkflowShelf[];
  platformIndex: LauncherPlatformIndex;
  noticesSummary: LauncherNoticesSummary;
  supportSummary: LauncherSupportSummary;
  /** All active platforms, sorted by sortOrder then name. */
  allPlatforms: LauncherPlatformRecord[];
}
