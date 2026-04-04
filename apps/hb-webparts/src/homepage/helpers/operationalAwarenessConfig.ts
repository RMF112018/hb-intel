import { isVisibleForAudience } from './visibility.js';
import {
  DEFAULT_PROJECT_PORTFOLIO_SPOTLIGHT_CONFIG,
  DEFAULT_SAFETY_FIELD_EXCELLENCE_CONFIG,
  type ProjectMilestone,
  type ProjectPortfolioSpotlightConfig,
  type ProjectPortfolioSpotlightItem,
  type SafetyFieldExcellenceConfig,
  type SafetyFieldExcellenceItem,
} from '../webparts/operationalAwarenessContracts.js';

export interface CuratedOperationalCollection<T> {
  heading: string;
  featured?: T;
  secondary: T[];
}

export interface NormalizedProjectPortfolioSpotlightItem extends ProjectPortfolioSpotlightItem {
  milestones: ProjectMilestone[];
  isStale: boolean;
  freshnessLabel?: string;
}

export interface NormalizedSafetyFieldExcellenceItem extends SafetyFieldExcellenceItem {
  isStale: boolean;
  freshnessLabel?: string;
}

function hasText(value: string | undefined): value is string {
  return Boolean(value?.trim());
}

function isValidDate(value: string | undefined): value is string {
  return Boolean(value && Number.isFinite(Date.parse(value)));
}

function byPriority(
  a: { featured?: boolean; order?: number; title: string },
  b: { featured?: boolean; order?: number; title: string },
): number {
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

  return a.title.localeCompare(b.title);
}

function normalizeCta<T extends { cta?: { label: string; href: string; openInNewTab?: boolean } }>(item: T): T {
  if (!hasText(item.cta?.label) || !hasText(item.cta?.href)) {
    return { ...item, cta: undefined };
  }

  return {
    ...item,
    cta: {
      label: item.cta.label.trim(),
      href: item.cta.href.trim(),
      openInNewTab: item.cta.openInNewTab,
    },
  };
}

function normalizeMilestones(milestones: ProjectMilestone[] | undefined): ProjectMilestone[] {
  return (milestones ?? [])
    .filter((milestone) => hasText(milestone.id) && hasText(milestone.title))
    .map((milestone) => ({
      id: milestone.id.trim(),
      title: milestone.title.trim(),
      dueDate: hasText(milestone.dueDate) ? milestone.dueDate.trim() : undefined,
      completed: milestone.completed,
    }));
}

function resolveFreshness(
  freshness: { source?: 'curated' | 'live'; updatedAt?: string; expiresAt?: string } | undefined,
  staleAfterHours: number,
  now: Date,
): { isStale: boolean; freshnessLabel?: string } {
  const source = freshness?.source ?? 'curated';
  const updatedAt = isValidDate(freshness?.updatedAt) ? freshness?.updatedAt : undefined;
  const expiresAt = isValidDate(freshness?.expiresAt) ? freshness?.expiresAt : undefined;

  const nowMs = now.getTime();
  const staleByExpiry = Boolean(expiresAt && Date.parse(expiresAt) <= nowMs);
  const staleByAge = Boolean(updatedAt && nowMs - Date.parse(updatedAt) > staleAfterHours * 60 * 60 * 1000);
  const isStale = staleByExpiry || staleByAge;

  if (isStale) {
    return { isStale: true, freshnessLabel: 'Stale signal' };
  }

  if (updatedAt) {
    return { isStale: false, freshnessLabel: `Updated ${updatedAt.slice(0, 10)}` };
  }

  return {
    isStale: false,
    freshnessLabel: source === 'live' ? 'Live signal' : 'Curated item',
  };
}

export function normalizeProjectPortfolioSpotlightConfig(
  input: Partial<ProjectPortfolioSpotlightConfig> | undefined,
  activeAudience?: string,
  now = new Date(),
): CuratedOperationalCollection<NormalizedProjectPortfolioSpotlightItem> {
  const heading = hasText(input?.heading) ? input.heading.trim() : DEFAULT_PROJECT_PORTFOLIO_SPOTLIGHT_CONFIG.heading;
  const maxSecondaryItems = Number.isFinite(input?.maxSecondaryItems) && (input?.maxSecondaryItems ?? 0) > 0
    ? (input?.maxSecondaryItems as number)
    : DEFAULT_PROJECT_PORTFOLIO_SPOTLIGHT_CONFIG.maxSecondaryItems;
  const staleAfterHours = Number.isFinite(input?.staleAfterHours) && (input?.staleAfterHours ?? 0) > 0
    ? (input?.staleAfterHours as number)
    : DEFAULT_PROJECT_PORTFOLIO_SPOTLIGHT_CONFIG.staleAfterHours;

  const normalized = (input?.items ?? [])
    .filter((item) => hasText(item.id) && hasText(item.title) && hasText(item.summary))
    .filter((item) => isVisibleForAudience(item.audiences, activeAudience))
    .map((item) => {
      const freshness = resolveFreshness(item.freshness, staleAfterHours, now);
      return normalizeCta({
        ...item,
        id: item.id.trim(),
        title: item.title.trim(),
        summary: item.summary.trim(),
        metadata: hasText(item.metadata) ? item.metadata.trim() : undefined,
        status: hasText(item.status?.label)
          ? {
              label: item.status?.label.trim(),
              variant: item.status?.variant ?? 'info',
            }
          : undefined,
        milestones: normalizeMilestones(item.milestones),
        isStale: freshness.isStale,
        freshnessLabel: freshness.freshnessLabel,
      });
    })
    .sort(byPriority);

  const [featured, ...secondary] = normalized;

  return {
    heading,
    featured,
    secondary: secondary.slice(0, maxSecondaryItems),
  };
}

export function normalizeSafetyFieldExcellenceConfig(
  input: Partial<SafetyFieldExcellenceConfig> | undefined,
  activeAudience?: string,
  now = new Date(),
): CuratedOperationalCollection<NormalizedSafetyFieldExcellenceItem> {
  const heading = hasText(input?.heading) ? input.heading.trim() : DEFAULT_SAFETY_FIELD_EXCELLENCE_CONFIG.heading;
  const maxSecondaryItems = Number.isFinite(input?.maxSecondaryItems) && (input?.maxSecondaryItems ?? 0) > 0
    ? (input?.maxSecondaryItems as number)
    : DEFAULT_SAFETY_FIELD_EXCELLENCE_CONFIG.maxSecondaryItems;
  const staleAfterHours = Number.isFinite(input?.staleAfterHours) && (input?.staleAfterHours ?? 0) > 0
    ? (input?.staleAfterHours as number)
    : DEFAULT_SAFETY_FIELD_EXCELLENCE_CONFIG.staleAfterHours;

  const normalized = (input?.items ?? [])
    .filter((item) => hasText(item.id) && hasText(item.title) && hasText(item.summary))
    .filter((item) => isVisibleForAudience(item.audiences, activeAudience))
    .map((item) => {
      const freshness = resolveFreshness(item.freshness, staleAfterHours, now);
      return normalizeCta({
        ...item,
        id: item.id.trim(),
        title: item.title.trim(),
        summary: item.summary.trim(),
        metadata: hasText(item.metadata) ? item.metadata.trim() : undefined,
        indicator: hasText(item.indicator?.label)
          ? {
              label: item.indicator?.label.trim(),
              variant: item.indicator?.variant ?? 'warning',
            }
          : undefined,
        isStale: freshness.isStale,
        freshnessLabel: freshness.freshnessLabel,
      });
    })
    .sort(byPriority);

  const [featured, ...secondary] = normalized;

  return {
    heading,
    featured,
    secondary: secondary.slice(0, maxSecondaryItems),
  };
}
