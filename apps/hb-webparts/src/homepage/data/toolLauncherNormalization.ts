/**
 * Normalization layer for Tool Launcher / Work Hub.
 *
 * Converts raw SharePoint list items from the "Tool Launcher Contents"
 * list into the stable LauncherPlatformRecord model and derives the
 * presentation structures (featured stage, workflow shelves, platform
 * index, notices summary).
 *
 * All SharePoint-specific value shapes (Hyperlink objects, multi-value
 * Choice arrays, nullable booleans) are absorbed here so downstream
 * code only works with clean TypeScript types.
 */

import type {
  LauncherFeaturedStage,
  LauncherLogoPreference,
  LauncherNoticeBadge,
  LauncherNoticeStatus,
  LauncherNoticesSummary,
  LauncherPlatformIndex,
  LauncherPlatformRecord,
  LauncherPresentationModel,
  LauncherSupportInfo,
  LauncherWorkflowShelf,
  RawToolLauncherListItem,
} from '../webparts/toolLauncherContracts.js';
import type { UtilityBadgeVariant } from '../webparts/utilityContracts.js';

/* ── Helpers ─────────────────────────────────────────────────────── */

function hasText(value: string | undefined | null): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function trimOrUndefined(value: string | undefined | null): string | undefined {
  if (!hasText(value)) return undefined;
  return value.trim();
}

/**
 * Extract a URL string from a SharePoint Hyperlink field.
 * Handles: plain string, { Url, Description } object, undefined.
 */
function extractUrl(field: string | { Url?: string; Description?: string } | undefined | null): string | undefined {
  if (!field) return undefined;
  if (typeof field === 'string') return field.trim() || undefined;
  return field.Url?.trim() || undefined;
}

/**
 * Normalize a SharePoint boolean field that may be null (column added
 * after item creation) to a concrete boolean with a default.
 */
function normalizeBool(value: boolean | null | undefined, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/**
 * Normalize a SharePoint number field to a finite number with a default.
 */
function normalizeNumber(value: number | null | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * Normalize AudienceVisibility which may be a plain string, a
 * multi-choice { results: string[] }, or null/undefined.
 * Returns a clean string array.
 */
function normalizeAudiences(value: string | { results?: string[] } | null | undefined): string[] {
  if (!value) return [];
  if (typeof value === 'string') {
    return value
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof value === 'object' && Array.isArray(value.results)) {
    return value.results.map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Parse a semicolon/comma-separated aliases string into a clean array.
 */
function normalizeAliases(value: string | undefined | null): string[] {
  if (!hasText(value)) return [];
  return value
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Slugify a platform name for use as a fallback platform key.
 * e.g., "SAP Concur" → "sap-concur"
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const VALID_LOGO_PREFERENCES = new Set<LauncherLogoPreference>([
  'official-wordmark',
  'official-symbol',
  'official-wordmark-plus-symbol',
  'tenant-wordmark',
  'site-derived-wordmark',
  'text-fallback',
]);

function normalizeLogoPreference(value: string | undefined | null): LauncherLogoPreference {
  const trimmed = value?.trim().toLowerCase();
  if (trimmed && VALID_LOGO_PREFERENCES.has(trimmed as LauncherLogoPreference)) {
    return trimmed as LauncherLogoPreference;
  }
  return 'official-wordmark';
}

const VALID_NOTICE_STATUSES = new Set<LauncherNoticeStatus>(['none', 'outage', 'maintenance', 'info']);

function normalizeNoticeStatus(value: string | undefined | null): LauncherNoticeStatus {
  const trimmed = value?.trim().toLowerCase();
  if (trimmed && VALID_NOTICE_STATUSES.has(trimmed as LauncherNoticeStatus)) {
    return trimmed as LauncherNoticeStatus;
  }
  return 'none';
}

const VALID_BADGE_TONES = new Set<UtilityBadgeVariant>(['neutral', 'info', 'warning', 'success', 'critical']);

function normalizeBadgeTone(value: string | undefined | null): UtilityBadgeVariant {
  const trimmed = value?.trim().toLowerCase();
  if (trimmed && VALID_BADGE_TONES.has(trimmed as UtilityBadgeVariant)) {
    return trimmed as UtilityBadgeVariant;
  }
  return 'info';
}

function parseDate(value: string | undefined | null): Date | undefined {
  if (!hasText(value)) return undefined;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? new Date(ms) : undefined;
}

const DEFAULT_SORT = 999;

/* ── Core normalization ──────────────────────────────────────────── */

/**
 * Normalize a single raw SharePoint list item into a LauncherPlatformRecord.
 * Returns undefined if the record is invalid (missing required fields or inactive).
 */
export function normalizeToolLauncherItem(
  raw: RawToolLauncherListItem,
): LauncherPlatformRecord | undefined {
  // Required fields — skip record without these
  const name = raw.Title?.trim();
  const launchUrl = extractUrl(raw.LaunchURL);
  if (!name || !launchUrl) return undefined;

  // Active gate — suppress inactive records
  const isActive = normalizeBool(raw.IsActive, true);
  if (!isActive) return undefined;

  // Notice handling
  const noticeStatus = normalizeNoticeStatus(raw.NoticeStatus);
  let notice: LauncherNoticeBadge | undefined;
  if (noticeStatus !== 'none') {
    const expiresOn = parseDate(raw.NoticeExpiresOn);
    // Auto-expire past notices
    if (!expiresOn || expiresOn.getTime() > Date.now()) {
      notice = {
        status: noticeStatus,
        label: trimOrUndefined(raw.NoticeBadgeText) ?? noticeStatus,
        details: trimOrUndefined(raw.NoticeDetails),
        expiresOn,
        tone: normalizeBadgeTone(raw.StatusBadgeTone),
      };
    }
  }

  // Support info
  const support: LauncherSupportInfo = {
    helpUrl: extractUrl(raw.HelpLink),
    supportOwnerName: trimOrUndefined(raw.SupportOwner),
    supportOwnerUrl: extractUrl(raw.SupportOwnerReference),
    accessRequestUrl: extractUrl(raw.AccessRequestDestination),
  };

  return {
    platformKey: trimOrUndefined(raw.PlatformKey) ?? slugify(name),
    name,
    launchUrl,
    descriptor: trimOrUndefined(raw.ShortDescriptor),

    logoAssetRef: trimOrUndefined(raw.OfficialLogoAssetReference),
    darkLogoAssetRef: trimOrUndefined(raw.DarkLogoAssetReference),
    logoPreference: normalizeLogoPreference(raw.PreferredLogoType),

    category: trimOrUndefined(raw.Category),
    workflowShelf: trimOrUndefined(raw.WorkflowShelf),
    aliases: normalizeAliases(raw.AliasesKeywords),

    isFeatured: normalizeBool(raw.Featured, false),
    featuredSortOrder: normalizeNumber(raw.FeaturedSortOrder, DEFAULT_SORT),
    sortOrder: normalizeNumber(raw.SortOrder, DEFAULT_SORT),
    audiences: normalizeAudiences(raw.AudienceVisibility),
    openInNewTab: normalizeBool(raw.OpenInNewTab, true),
    favoriteEligible: normalizeBool(raw.FavoriteEligible, true),

    support,
    notice,

    vendorFamily: trimOrUndefined(raw.VendorProductFamily),
    tenantLabel: trimOrUndefined(raw.TenantEnvironmentLabel),
    requiresReview: normalizeBool(raw.RequiresReview, false),
    lastReviewedOn: parseDate(raw.LastReviewedOn),
  };
}

/* ── Batch normalization ─────────────────────────────────────────── */

function byFeaturedSort(a: LauncherPlatformRecord, b: LauncherPlatformRecord): number {
  if (a.featuredSortOrder !== b.featuredSortOrder) return a.featuredSortOrder - b.featuredSortOrder;
  return a.name.localeCompare(b.name);
}

function bySortOrderThenName(a: LauncherPlatformRecord, b: LauncherPlatformRecord): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.name.localeCompare(b.name);
}

/**
 * Normalize an array of raw SharePoint items into deduplicated,
 * sorted LauncherPlatformRecords.
 */
export function normalizeToolLauncherItems(
  rawItems: RawToolLauncherListItem[],
): LauncherPlatformRecord[] {
  const seen = new Set<string>();
  const records: LauncherPlatformRecord[] = [];

  for (const raw of rawItems) {
    const record = normalizeToolLauncherItem(raw);
    if (!record) continue;
    if (seen.has(record.platformKey)) continue;
    seen.add(record.platformKey);
    records.push(record);
  }

  return records.sort(bySortOrderThenName);
}

/* ── Presentation model derivation ───────────────────────────────── */

function deriveFeaturedStage(platforms: LauncherPlatformRecord[]): LauncherFeaturedStage {
  return {
    platforms: platforms.filter((p) => p.isFeatured).sort(byFeaturedSort),
  };
}

function deriveWorkflowShelves(platforms: LauncherPlatformRecord[]): LauncherWorkflowShelf[] {
  const shelfMap = new Map<string, LauncherPlatformRecord[]>();

  for (const p of platforms) {
    if (!p.workflowShelf) continue;
    const existing = shelfMap.get(p.workflowShelf);
    if (existing) {
      existing.push(p);
    } else {
      shelfMap.set(p.workflowShelf, [p]);
    }
  }

  return [...shelfMap.entries()]
    .map(([shelfName, items]) => ({
      shelfName,
      platforms: items.sort(bySortOrderThenName),
    }))
    .sort((a, b) => a.shelfName.localeCompare(b.shelfName));
}

function derivePlatformIndex(platforms: LauncherPlatformRecord[]): LauncherPlatformIndex {
  const categoryMap = new Map<string, LauncherPlatformRecord[]>();

  for (const p of platforms) {
    const cat = p.category ?? 'Other';
    const existing = categoryMap.get(cat);
    if (existing) {
      existing.push(p);
    } else {
      categoryMap.set(cat, [p]);
    }
  }

  return {
    groups: [...categoryMap.entries()]
      .map(([category, items]) => ({
        category,
        platforms: items.sort(bySortOrderThenName),
      }))
      .sort((a, b) => a.category.localeCompare(b.category)),
  };
}

function deriveNoticesSummary(platforms: LauncherPlatformRecord[]): LauncherNoticesSummary {
  return {
    activeNotices: platforms
      .filter((p): p is LauncherPlatformRecord & { notice: LauncherNoticeBadge } => p.notice != null)
      .map((p) => ({
        platformKey: p.platformKey,
        name: p.name,
        notice: p.notice,
      })),
  };
}

/**
 * Derive the full presentation model from normalized platform records.
 * This is the primary entry point for the Tool Launcher component to
 * obtain all presentation-ready data structures.
 */
export function deriveToolLauncherPresentation(
  platforms: LauncherPlatformRecord[],
): LauncherPresentationModel {
  return {
    featuredStage: deriveFeaturedStage(platforms),
    workflowShelves: deriveWorkflowShelves(platforms),
    platformIndex: derivePlatformIndex(platforms),
    noticesSummary: deriveNoticesSummary(platforms),
    allPlatforms: [...platforms],
  };
}
