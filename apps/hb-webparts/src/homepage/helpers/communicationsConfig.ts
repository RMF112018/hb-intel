import { isVisibleForAudience } from './visibility.js';
import {
  DEFAULT_COMPANY_PULSE_CONFIG,
  DEFAULT_LEADERSHIP_MESSAGE_CONFIG,
  DEFAULT_PEOPLE_CULTURE_CONFIG,
  DEFAULT_PEOPLE_CULTURE_MERGED_CONFIG,
  type AnnouncementEntry,
  type AnnouncementType,
  type BandAOutput,
  type BandBOutput,
  type CompanyPulseConfig,
  type CompanyPulseItem,
  type KudosEntry,
  type KudosModuleOutput,
  type LeadershipMessageConfig,
  type LeadershipMessageEntry,
  type PeopleCultureConfig,
  type PeopleCultureEntry,
  type PeopleCultureMergedConfig,
  type PeopleCultureMergedOutput,
  type WeeklyCelebrationEntry,
} from '../webparts/communicationsContracts.js';

export interface CuratedCollection<T> {
  heading: string;
  featured?: T;
  secondary: T[];
}

function hasText(value: string | undefined): value is string {
  return Boolean(value?.trim());
}

function normalizeCta<T extends { cta?: { label: string; href: string; openInNewTab?: boolean } }>(item: T): T {
  if (!hasText(item.cta?.label) || !hasText(item.cta?.href)) {
    return { ...item, cta: undefined };
  }

  return {
    ...item,
    cta: {
      label: item.cta?.label.trim(),
      href: item.cta?.href.trim(),
      openInNewTab: item.cta?.openInNewTab,
    },
  };
}

function byPriority(a: { featured?: boolean; order?: number; title?: string; personName?: string }, b: { featured?: boolean; order?: number; title?: string; personName?: string }): number {
  const aFeatured = a.featured ? 0 : 1;
  const bFeatured = b.featured ? 0 : 1;
  if (aFeatured !== bFeatured) {
    return aFeatured - bFeatured;
  }

  const aOrder = Number.isFinite(a.order) ? (a.order as number) : Number.MAX_SAFE_INTEGER;
  const bOrder = Number.isFinite(b.order) ? (b.order as number) : Number.MAX_SAFE_INTEGER;
  if (aOrder !== bOrder) {
    return aOrder - bOrder;
  }

  return (a.title ?? a.personName ?? '').localeCompare(b.title ?? b.personName ?? '');
}

export function normalizeCompanyPulseConfig(input: Partial<CompanyPulseConfig> | undefined, activeAudience?: string): CuratedCollection<CompanyPulseItem> {
  const heading = hasText(input?.heading) ? input?.heading.trim() : DEFAULT_COMPANY_PULSE_CONFIG.heading;
  const maxSecondaryItems = Number.isFinite(input?.maxSecondaryItems) && (input?.maxSecondaryItems ?? 0) > 0
    ? (input?.maxSecondaryItems as number)
    : DEFAULT_COMPANY_PULSE_CONFIG.maxSecondaryItems;

  const normalized = (input?.items ?? [])
    .filter((item) => hasText(item.id) && hasText(item.title) && hasText(item.summary))
    .filter((item) => isVisibleForAudience(item.audiences, activeAudience))
    .map((item) =>
      normalizeCta({
        ...item,
        id: item.id.trim(),
        title: item.title.trim(),
        summary: item.summary.trim(),
        metadata: hasText(item.metadata) ? item.metadata.trim() : undefined,
      }),
    )
    .sort(byPriority);

  const [featured, ...secondary] = normalized;

  return {
    heading,
    featured,
    secondary: secondary.slice(0, maxSecondaryItems),
  };
}

export function normalizeLeadershipMessageConfig(input: Partial<LeadershipMessageConfig> | undefined): CuratedCollection<LeadershipMessageEntry> {
  const heading = hasText(input?.heading) ? input?.heading.trim() : DEFAULT_LEADERSHIP_MESSAGE_CONFIG.heading;
  const maxArchivedEntries = Number.isFinite(input?.maxArchivedEntries) && (input?.maxArchivedEntries ?? 0) > 0
    ? (input?.maxArchivedEntries as number)
    : DEFAULT_LEADERSHIP_MESSAGE_CONFIG.maxArchivedEntries;

  const normalized = (input?.entries ?? [])
    .filter((entry) => hasText(entry.id) && hasText(entry.title) && hasText(entry.message) && hasText(entry.leaderName))
    .map((entry) =>
      normalizeCta({
        ...entry,
        id: entry.id.trim(),
        title: entry.title.trim(),
        message: entry.message.trim(),
        leaderName: entry.leaderName.trim(),
        leaderRole: hasText(entry.leaderRole) ? entry.leaderRole.trim() : undefined,
        metadata: hasText(entry.metadata) ? entry.metadata.trim() : undefined,
        media: entry.media?.src && hasText(entry.media.alt) ? entry.media : undefined,
      }),
    )
    .sort(byPriority);

  const [featured, ...secondary] = normalized;

  return {
    heading,
    featured,
    secondary: secondary.slice(0, maxArchivedEntries),
  };
}

export function normalizePeopleCultureConfig(input: Partial<PeopleCultureConfig> | undefined, activeAudience?: string): CuratedCollection<PeopleCultureEntry> {
  const heading = hasText(input?.heading) ? input?.heading.trim() : DEFAULT_PEOPLE_CULTURE_CONFIG.heading;
  const maxSecondaryEntries = Number.isFinite(input?.maxSecondaryEntries) && (input?.maxSecondaryEntries ?? 0) > 0
    ? (input?.maxSecondaryEntries as number)
    : DEFAULT_PEOPLE_CULTURE_CONFIG.maxSecondaryEntries;

  const normalized = (input?.entries ?? [])
    .filter((entry) => hasText(entry.id) && hasText(entry.personName) && hasText(entry.highlight))
    .filter((entry) => isVisibleForAudience(entry.audiences, activeAudience))
    .map((entry) =>
      normalizeCta({
        ...entry,
        id: entry.id.trim(),
        personName: entry.personName.trim(),
        highlight: entry.highlight.trim(),
        metadata: hasText(entry.metadata) ? entry.metadata.trim() : undefined,
        media: entry.media?.src && hasText(entry.media.alt) ? entry.media : undefined,
      }),
    )
    .sort(byPriority);

  const [featured, ...secondary] = normalized;

  return {
    heading,
    featured,
    secondary: secondary.slice(0, maxSecondaryEntries),
  };
}

// ---------------------------------------------------------------------------
// Merged People & Culture normalizer (Band A + Kudos + Band B)
// ---------------------------------------------------------------------------

const ANNOUNCEMENT_PERSISTENCE_DAYS: Record<AnnouncementType, number> = {
  promotion: 5,
  newHire: 5,
  baby: 3,
  wedding: 3,
  special: 3,
};

const MS_PER_DAY = 86_400_000;

function startOfDayUtc(ms: number): number {
  return ms - (ms % MS_PER_DAY);
}

function parseDate(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : undefined;
}

function normalizeMedia(media: AnnouncementEntry['media']): AnnouncementEntry['media'] {
  return media?.src && hasText(media.alt) ? media : undefined;
}

// --- Band A visibility & sorting ---

function isAnnouncementVisible(item: AnnouncementEntry, todayMs: number): boolean {
  if (item.homepageEnabled === false) return false;

  const start = parseDate(item.startDisplayDate) ?? parseDate(item.publishDate);
  if (start === undefined || todayMs < startOfDayUtc(start)) return false;

  const end = parseDate(item.endDisplayDate);
  if (end !== undefined) return todayMs <= end;

  if (item.isPinned) return true;

  const persistenceDays = ANNOUNCEMENT_PERSISTENCE_DAYS[item.announcementType] ?? 3;
  return todayMs <= start + persistenceDays * MS_PER_DAY;
}

function byAnnouncementPriority(a: AnnouncementEntry, b: AnnouncementEntry): number {
  const aPinned = a.isPinned ? 0 : 1;
  const bPinned = b.isPinned ? 0 : 1;
  if (aPinned !== bPinned) return aPinned - bPinned;

  const aOverride = Number.isFinite(a.priorityOverride) ? (a.priorityOverride as number) : Number.MAX_SAFE_INTEGER;
  const bOverride = Number.isFinite(b.priorityOverride) ? (b.priorityOverride as number) : Number.MAX_SAFE_INTEGER;
  if (aOverride !== bOverride) return aOverride - bOverride;

  const aPub = parseDate(a.publishDate) ?? 0;
  const bPub = parseDate(b.publishDate) ?? 0;
  if (aPub !== bPub) return bPub - aPub; // descending

  return a.personName.localeCompare(b.personName);
}

function normalizeBandA(
  items: AnnouncementEntry[] | undefined,
  activeAudience: string | undefined,
  maxItems: number,
  todayMs: number,
): BandAOutput {
  const visible = (items ?? [])
    .filter((item) => hasText(item.id) && hasText(item.personName) && hasText(item.headline) && hasText(item.summary))
    .filter((item) => isVisibleForAudience(item.audiences, activeAudience))
    .filter((item) => isAnnouncementVisible(item, todayMs))
    .map((item) => normalizeCta({
      ...item,
      id: item.id.trim(),
      personName: item.personName.trim(),
      headline: item.headline.trim(),
      summary: item.summary.trim(),
      media: normalizeMedia(item.media),
    }))
    .sort(byAnnouncementPriority)
    .slice(0, maxItems);

  return { items: visible, isEmpty: visible.length === 0 };
}

// --- Kudos visibility & selection ---

function isKudosHomepageVisible(item: KudosEntry, todayMs: number): boolean {
  if (item.status !== 'approved') return false;
  if (item.homepageEnabled === false) return false;

  const start = parseDate(item.publishStartDate) ?? parseDate(item.approvedDate);
  if (start === undefined || todayMs < startOfDayUtc(start)) return false;

  const end = parseDate(item.publishEndDate);
  if (end !== undefined) return todayMs <= end;

  if (item.isPinned) return true;

  const approvedMs = parseDate(item.approvedDate);
  if (approvedMs === undefined) return false;

  return todayMs <= approvedMs + 14 * MS_PER_DAY;
}

function byKudosPriority(a: KudosEntry, b: KudosEntry): number {
  const aPinned = a.isPinned ? 0 : 1;
  const bPinned = b.isPinned ? 0 : 1;
  if (aPinned !== bPinned) return aPinned - bPinned;

  const aApproved = parseDate(a.approvedDate) ?? 0;
  const bApproved = parseDate(b.approvedDate) ?? 0;
  if (aApproved !== bApproved) return bApproved - aApproved; // descending

  return a.headline.localeCompare(b.headline);
}

function normalizeKudos(
  items: KudosEntry[] | undefined,
  maxHeadlines: number,
  todayMs: number,
): KudosModuleOutput {
  const visible = (items ?? [])
    .filter((item) => hasText(item.id) && hasText(item.headline) && hasText(item.excerpt))
    .filter((item) => isKudosHomepageVisible(item, todayMs))
    .map((item) => ({
      ...item,
      id: item.id.trim(),
      headline: item.headline.trim(),
      excerpt: item.excerpt.trim(),
      media: normalizeMedia(item.media),
    }))
    .sort(byKudosPriority);

  if (visible.length === 0) {
    return { featured: undefined, recentHeadlines: [], isEmpty: true };
  }

  const [featured, ...rest] = visible;
  return {
    featured,
    recentHeadlines: rest.slice(0, maxHeadlines),
    isEmpty: false,
  };
}

// --- Band B visibility & sorting ---

function isCelebrationVisible(item: WeeklyCelebrationEntry, todayMs: number): boolean {
  const celebMs = parseDate(item.celebrationDate);
  if (celebMs === undefined) return false;

  const todayStart = startOfDayUtc(todayMs);
  const celebStart = startOfDayUtc(celebMs);

  return celebStart >= todayStart && celebStart <= todayStart + 7 * MS_PER_DAY;
}

function byCelebrationDate(a: WeeklyCelebrationEntry, b: WeeklyCelebrationEntry): number {
  const aDate = parseDate(a.celebrationDate) ?? 0;
  const bDate = parseDate(b.celebrationDate) ?? 0;
  if (aDate !== bDate) return aDate - bDate; // ascending

  return a.personName.localeCompare(b.personName);
}

function normalizeBandB(
  items: WeeklyCelebrationEntry[] | undefined,
  activeAudience: string | undefined,
  maxItems: number,
  todayMs: number,
): BandBOutput {
  const visible = (items ?? [])
    .filter((item) => hasText(item.id) && hasText(item.personName))
    .filter((item) => isVisibleForAudience(item.audiences, activeAudience))
    .filter((item) => isCelebrationVisible(item, todayMs))
    .map((item) => ({
      ...item,
      id: item.id.trim(),
      personName: item.personName.trim(),
      media: normalizeMedia(item.media),
    }))
    .sort(byCelebrationDate)
    .slice(0, maxItems);

  return { items: visible, isEmpty: visible.length === 0 };
}

// --- Public merged normalizer ---

export function normalizePeopleCultureMergedConfig(
  input: Partial<PeopleCultureMergedConfig> | undefined,
  activeAudience?: string,
  now?: Date,
): PeopleCultureMergedOutput {
  const heading = hasText(input?.heading)
    ? input?.heading.trim()
    : DEFAULT_PEOPLE_CULTURE_MERGED_CONFIG.heading;

  const maxAnnouncements = Number.isFinite(input?.maxAnnouncements) && (input?.maxAnnouncements ?? 0) > 0
    ? (input?.maxAnnouncements as number)
    : DEFAULT_PEOPLE_CULTURE_MERGED_CONFIG.maxAnnouncements;

  const maxKudosHeadlines = Number.isFinite(input?.maxKudosHeadlines) && (input?.maxKudosHeadlines ?? 0) > 0
    ? (input?.maxKudosHeadlines as number)
    : DEFAULT_PEOPLE_CULTURE_MERGED_CONFIG.maxKudosHeadlines;

  const maxCelebrations = Number.isFinite(input?.maxCelebrations) && (input?.maxCelebrations ?? 0) > 0
    ? (input?.maxCelebrations as number)
    : DEFAULT_PEOPLE_CULTURE_MERGED_CONFIG.maxCelebrations;

  const todayMs = (now ?? new Date()).getTime();

  return {
    heading,
    bandA: normalizeBandA(input?.announcements, activeAudience, maxAnnouncements, todayMs),
    kudos: normalizeKudos(input?.kudos, maxKudosHeadlines, todayMs),
    bandB: normalizeBandB(input?.celebrations, activeAudience, maxCelebrations, todayMs),
  };
}
