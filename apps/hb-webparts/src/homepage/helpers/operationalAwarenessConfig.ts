import { isVisibleForAudience } from './visibility.js';
import type { HomepageCtaLink, HomepageMediaSlot } from '../models/contentModels.js';
import {
  DEFAULT_PROJECT_PORTFOLIO_SPOTLIGHT_CONFIG,
  DEFAULT_SAFETY_FIELD_EXCELLENCE_CONFIG,
  type ProjectMilestone,
  type ProjectPortfolioSpotlightConfig,
  type ProjectPortfolioSpotlightItem,
  type ProjectTeamMember,
  type SafetyContextMetadata,
  type SafetyFieldExcellenceConfig,
  type SafetyPrimarySpotlight,
  type SafetySecondarySignal,
  type SafetyTopLineSummary,
  type SafetyUrgencyLevel,
} from '../webparts/operationalAwarenessContracts.js';

export interface CuratedOperationalCollection<T> {
  heading: string;
  featured?: T;
  secondary: T[];
  sectionCta?: HomepageCtaLink;
  /** Section-level CTA label (decoupled from featured item CTA). */
  allProjectsLabel?: string;
  /** Section-level CTA URL. */
  allProjectsUrl?: string;
}

/** Content completeness tier for authoring safety. */
export type ContentCompleteness = 'full' | 'partial' | 'minimal';

export interface NormalizedProjectPortfolioSpotlightItem extends ProjectPortfolioSpotlightItem {
  milestones: ProjectMilestone[];
  isStale: boolean;
  freshnessLabel?: string;
  image?: HomepageMediaSlot;
  highlightHeadline?: string;
  location?: string;
  sector?: string;
  teamMembers: ProjectTeamMember[];
  /** How complete the authored content is — drives UI fallback behavior. */
  contentCompleteness: ContentCompleteness;
}

export interface NormalizedSafetyContextMetadata extends SafetyContextMetadata {}

export interface NormalizedSafetyTopLineSummary extends SafetyTopLineSummary {
  statusVariant: NonNullable<SafetyTopLineSummary['statusVariant']>;
}

export interface NormalizedSafetyFieldExcellenceItem extends SafetySecondarySignal {
  urgency: NonNullable<SafetySecondarySignal['urgency']>;
  context?: NormalizedSafetyContextMetadata;
  isStale: boolean;
  freshnessLabel?: string;
  compactSummary: string;
}

export interface NormalizedSafetyPrimarySpotlight extends SafetyPrimarySpotlight {
  urgency: NonNullable<SafetyPrimarySpotlight['urgency']>;
  context?: NormalizedSafetyContextMetadata;
  isStale: boolean;
  freshnessLabel?: string;
  compactSummary: string;
}

export interface NormalizedSafetyFieldExcellenceModel
  extends CuratedOperationalCollection<NormalizedSafetyFieldExcellenceItem> {
  topLineSummary?: NormalizedSafetyTopLineSummary;
  featured?: NormalizedSafetyPrimarySpotlight;
}

function hasText(value: string | undefined): value is string {
  return Boolean(value?.trim());
}

function isValidDate(value: string | undefined): value is string {
  return Boolean(value && Number.isFinite(Date.parse(value)));
}

/**
 * Deterministic selection sort: featured > order > recency > title.
 *
 * Featured items always sort first. Within the same priority tier,
 * more recently updated items are preferred. Title is the final
 * stable tiebreaker for identical timestamps or missing freshness.
 */
function byPriority(
  a: { featured?: boolean; order?: number; title: string; freshness?: { updatedAt?: string } },
  b: { featured?: boolean; order?: number; title: string; freshness?: { updatedAt?: string } },
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

  // Recency tiebreak: prefer more recently updated items
  const aTime = isValidDate(a.freshness?.updatedAt) ? Date.parse(a.freshness!.updatedAt!) : 0;
  const bTime = isValidDate(b.freshness?.updatedAt) ? Date.parse(b.freshness!.updatedAt!) : 0;
  if (aTime !== bTime) {
    return bTime - aTime; // descending — newer first
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

function normalizeStandaloneCta(
  cta: { label?: string; href?: string; openInNewTab?: boolean } | undefined,
): HomepageCtaLink | undefined {
  if (!hasText(cta?.label) || !hasText(cta?.href)) return undefined;
  return {
    label: cta.label.trim(),
    href: cta.href.trim(),
    openInNewTab: cta.openInNewTab,
  };
}

function normalizeSafetyContext(
  input: SafetyContextMetadata | undefined,
): NormalizedSafetyContextMetadata | undefined {
  if (!input) return undefined;
  const context: NormalizedSafetyContextMetadata = {
    region: hasText(input.region) ? input.region.trim() : undefined,
    site: hasText(input.site) ? input.site.trim() : undefined,
    project: hasText(input.project) ? input.project.trim() : undefined,
    scope: hasText(input.scope) ? input.scope.trim() : undefined,
    owner: hasText(input.owner) ? input.owner.trim() : undefined,
  };
  return context.region || context.site || context.project || context.scope || context.owner
    ? context
    : undefined;
}

const SAFETY_URGENCY_WEIGHT: Record<SafetyUrgencyLevel, number> = {
  urgent: 0,
  attention: 1,
  routine: 2,
};

function normalizeSafetyUrgency(urgency: SafetyUrgencyLevel | undefined): SafetyUrgencyLevel {
  if (urgency === 'urgent' || urgency === 'attention') return urgency;
  return 'routine';
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

function normalizeTeamMembers(members: ProjectTeamMember[] | undefined): ProjectTeamMember[] {
  return (members ?? [])
    .filter((m) => hasText(m.id) && hasText(m.displayName))
    .map((m) => ({
      id: m.id.trim(),
      displayName: m.displayName.trim(),
      role: hasText(m.role) ? m.role.trim() : undefined,
      photoUrl: hasText(m.photoUrl) ? m.photoUrl.trim() : undefined,
    }));
}

/**
 * Produce a concise relative time label (e.g. "2 days ago", "3 hours ago").
 * Falls back to the date portion of the ISO string when the gap exceeds 30 days.
 */
function relativeTimeLabel(isoDate: string, now: Date): string {
  const deltaMs = now.getTime() - Date.parse(isoDate);
  const hours = Math.floor(deltaMs / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days <= 30) return `${days} days ago`;
  return isoDate.slice(0, 10);
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
    return { isStale: false, freshnessLabel: `Updated ${relativeTimeLabel(updatedAt, now)}` };
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
      const image = hasText(item.image?.src)
        ? { src: item.image.src.trim(), alt: (item.image.alt ?? '').trim(), aspectRatio: item.image.aspectRatio }
        : undefined;
      const highlightHeadline = hasText(item.highlightHeadline) ? item.highlightHeadline.trim() : undefined;

      // Content completeness: full (image + headline + status), partial (missing 1-2), minimal (bare minimum)
      const signals = [Boolean(image), Boolean(highlightHeadline), Boolean(hasText(item.status?.label))];
      const signalCount = signals.filter(Boolean).length;
      const contentCompleteness: ContentCompleteness =
        signalCount === 3 ? 'full' : signalCount >= 1 ? 'partial' : 'minimal';

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
        image,
        highlightHeadline,
        location: hasText(item.location) ? item.location.trim() : undefined,
        sector: hasText(item.sector) ? item.sector.trim() : undefined,
        teamMembers: normalizeTeamMembers(item.teamMembers),
        contentCompleteness,
      });
    })
    .sort(byPriority);

  const [featured, ...rest] = normalized;

  // Stale demotion: push stale items to the end of the secondary rail
  // so fresh items get priority visibility in the limited rail space.
  const fresh = rest.filter((item) => !item.isStale);
  const stale = rest.filter((item) => item.isStale);
  const secondary = [...fresh, ...stale].slice(0, maxSecondaryItems);

  const allProjectsLabel = hasText(input?.allProjectsLabel)
    ? input.allProjectsLabel.trim()
    : DEFAULT_PROJECT_PORTFOLIO_SPOTLIGHT_CONFIG.allProjectsLabel;
  const allProjectsUrl = hasText(input?.allProjectsUrl)
    ? input.allProjectsUrl.trim()
    : DEFAULT_PROJECT_PORTFOLIO_SPOTLIGHT_CONFIG.allProjectsUrl;

  return {
    heading,
    featured,
    secondary,
    allProjectsLabel,
    allProjectsUrl,
  };
}

export function normalizeSafetyFieldExcellenceConfig(
  input: Partial<SafetyFieldExcellenceConfig> | undefined,
  activeAudience?: string,
  now = new Date(),
): NormalizedSafetyFieldExcellenceModel {
  const heading = hasText(input?.heading) ? input.heading.trim() : DEFAULT_SAFETY_FIELD_EXCELLENCE_CONFIG.heading;
  const maxSecondaryItems = Number.isFinite(input?.maxSecondaryItems) && (input?.maxSecondaryItems ?? 0) > 0
    ? (input?.maxSecondaryItems as number)
    : DEFAULT_SAFETY_FIELD_EXCELLENCE_CONFIG.maxSecondaryItems;
  const staleAfterHours = Number.isFinite(input?.staleAfterHours) && (input?.staleAfterHours ?? 0) > 0
    ? (input?.staleAfterHours as number)
    : DEFAULT_SAFETY_FIELD_EXCELLENCE_CONFIG.staleAfterHours;

  const topLineSummary =
    hasText(input?.topLineSummary?.statusLabel) && hasText(input?.topLineSummary?.summaryText)
      ? {
          statusLabel: input!.topLineSummary!.statusLabel.trim(),
          statusVariant: input!.topLineSummary!.statusVariant ?? 'info',
          summaryText: input!.topLineSummary!.summaryText.trim(),
          lastUpdatedLabel: hasText(input?.topLineSummary?.lastUpdatedLabel)
            ? input!.topLineSummary!.lastUpdatedLabel!.trim()
            : undefined,
        }
      : undefined;

  const featured =
    input?.primarySpotlight &&
    hasText(input.primarySpotlight.id) &&
    hasText(input.primarySpotlight.title) &&
    hasText(input.primarySpotlight.summary) &&
    isVisibleForAudience(input.primarySpotlight.audiences, activeAudience)
      ? (() => {
          const freshness = resolveFreshness(input.primarySpotlight!.freshness, staleAfterHours, now);
          const compactSummary = hasText(input.primarySpotlight?.compactSummary)
            ? input.primarySpotlight!.compactSummary!.trim()
            : input.primarySpotlight!.summary.trim().slice(0, 96);
          return normalizeCta({
            ...input.primarySpotlight!,
            id: input.primarySpotlight!.id.trim(),
            title: input.primarySpotlight!.title.trim(),
            summary: input.primarySpotlight!.summary.trim(),
            compactSummary,
            metadata: hasText(input.primarySpotlight?.metadata)
              ? input.primarySpotlight!.metadata!.trim()
              : undefined,
            urgency: normalizeSafetyUrgency(input.primarySpotlight!.urgency),
            context: normalizeSafetyContext(input.primarySpotlight!.context),
            indicator: hasText(input.primarySpotlight?.indicator?.label)
              ? {
                  label: input.primarySpotlight!.indicator!.label.trim(),
                  variant: input.primarySpotlight!.indicator!.variant ?? 'warning',
                }
              : undefined,
            isStale: freshness.isStale,
            freshnessLabel: freshness.freshnessLabel,
          });
        })()
      : undefined;

  const secondary = (input?.secondarySignals ?? [])
    .filter((item) => hasText(item.id) && hasText(item.title) && hasText(item.summary))
    .filter((item) => isVisibleForAudience(item.audiences, activeAudience))
    .filter((item) => item.id !== featured?.id)
    .map((item) => {
      const freshness = resolveFreshness(item.freshness, staleAfterHours, now);
      const compactSummary = hasText(item.compactSummary)
        ? item.compactSummary.trim()
        : item.summary.trim().slice(0, 88);
      return normalizeCta({
        ...item,
        id: item.id.trim(),
        title: item.title.trim(),
        summary: item.summary.trim(),
        compactSummary,
        metadata: hasText(item.metadata) ? item.metadata.trim() : undefined,
        urgency: normalizeSafetyUrgency(item.urgency),
        context: normalizeSafetyContext(item.context),
        indicator: hasText(item.indicator?.label)
          ? {
              label: item.indicator.label.trim(),
              variant: item.indicator.variant ?? 'warning',
            }
          : undefined,
        isStale: freshness.isStale,
        freshnessLabel: freshness.freshnessLabel,
      });
    })
    .sort((a, b) => {
      const aUrgency = SAFETY_URGENCY_WEIGHT[a.urgency];
      const bUrgency = SAFETY_URGENCY_WEIGHT[b.urgency];
      if (aUrgency !== bUrgency) return aUrgency - bUrgency;

      const aOrder = Number.isFinite(a.order) ? (a.order as number) : Number.MAX_SAFE_INTEGER;
      const bOrder = Number.isFinite(b.order) ? (b.order as number) : Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;

      if (a.isStale !== b.isStale) return a.isStale ? 1 : -1;

      const aTime = isValidDate(a.freshness?.updatedAt) ? Date.parse(a.freshness.updatedAt!) : 0;
      const bTime = isValidDate(b.freshness?.updatedAt) ? Date.parse(b.freshness.updatedAt!) : 0;
      if (aTime !== bTime) return bTime - aTime;

      return a.title.localeCompare(b.title);
    })
    .slice(0, maxSecondaryItems);

  const sectionCta = normalizeStandaloneCta(input?.sectionCta);

  return {
    heading,
    topLineSummary,
    featured,
    secondary,
    sectionCta,
  };
}
