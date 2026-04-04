import { isVisibleForAudience } from './visibility.js';
import {
  DEFAULT_COMPANY_PULSE_CONFIG,
  DEFAULT_LEADERSHIP_MESSAGE_CONFIG,
  DEFAULT_PEOPLE_CULTURE_CONFIG,
  type CompanyPulseConfig,
  type CompanyPulseItem,
  type LeadershipMessageConfig,
  type LeadershipMessageEntry,
  type PeopleCultureConfig,
  type PeopleCultureEntry,
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
