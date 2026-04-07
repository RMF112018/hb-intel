/**
 * PeopleCultureMerged — Rebuilt People & Culture homepage surface
 *
 * Phase 11 / P03: Full rebuild against P01 Surface Blueprint.
 * Phase 11 / P05: State, sparse-data, and authoring hardening.
 *
 * Focal sequence: Kudos → Announcements → Celebrations
 * Layout: Rail-first (300-400px) with wide-mode adaptation (>480px)
 * Suppression: Empty regions are not rendered; module-level empty state
 * only when all regions are empty.
 * Visual: Single module header, eyebrow region labels, separator rhythm
 * instead of per-region box boundaries.
 *
 * P05 hardening:
 * - Emergency compression at <280px (media hidden, avatars shrink, badges hide)
 * - prefers-reduced-motion gating on all transitions
 * - Sparse-data visual quality (min-height, generous padding for single-item)
 * - Defensive guards on empty personName, missing recipients
 * - ARIA landmarks on module body
 */
import * as React from 'react';
import {
  HbcHomepageSectionShell,
  HbcPremiumBadge,
  HbcPremiumCta,
  Users,
  CheckCircle2,
  Calendar,
  Separator,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizePeopleCultureMergedConfig } from '../../homepage/helpers/communicationsConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import { useResponsiveTier, type ResponsiveTier } from '../../homepage/shared/useResponsiveTier.js';
import {
  HP_SPACE,
  HP_RADIUS,
  HP_BORDER,
  HP_TEXT_OPACITY,
} from '../../homepage/tokens.js';
import type { PeopleCultureMergedConfig } from '../../homepage/webparts/communicationsContracts.js';
import type { BandAOutput, KudosModuleOutput, BandBOutput } from '../../homepage/webparts/communicationsContracts.js';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PeopleCultureMergedProps {
  config?: Partial<PeopleCultureMergedConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Layout mode — rail vs wide
// ---------------------------------------------------------------------------

type LayoutMode = 'rail' | 'wide';

function resolveLayout(tier: ResponsiveTier): LayoutMode {
  return tier === 'desktop' ? 'wide' : 'rail';
}

// ---------------------------------------------------------------------------
// Reduced motion hook
// ---------------------------------------------------------------------------

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    function onChange(e: MediaQueryListEvent): void { setReduced(e.matches); }
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

// ---------------------------------------------------------------------------
// Narrow stress detection — emergency compression below 280px
// ---------------------------------------------------------------------------

function useNarrowStress(): boolean {
  const [narrow, setNarrow] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 280;
  });

  React.useEffect(() => {
    function onResize(): void { setNarrow(window.innerWidth < 280); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return narrow;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FOCUS_OUTLINE = '2px solid #225391';
const TRANSITION_FAST = 'background 150ms ease, border-color 150ms ease';
const TRANSITION_NONE = 'none';

// ---------------------------------------------------------------------------
// Announcement maps
// ---------------------------------------------------------------------------

const ANNOUNCEMENT_LABEL: Record<string, string> = {
  promotion: 'Congratulations',
  newHire: 'Welcome',
  baby: 'Baby Announcement',
  wedding: 'Wedding Announcement',
  special: 'Special Announcement',
};

const ANNOUNCEMENT_BADGE: Record<string, 'info' | 'success' | 'warning' | 'critical'> = {
  promotion: 'critical',
  newHire: 'info',
  baby: 'success',
  wedding: 'success',
  special: 'warning',
};

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const moduleBodyStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.6875rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  opacity: HP_TEXT_OPACITY.muted,
};

const separatorMargin: React.CSSProperties = {
  margin: `${HP_SPACE.xl}px 0`,
};

// ---------------------------------------------------------------------------
// Safe initial extraction — defensive for empty names
// ---------------------------------------------------------------------------

function safeInitial(name: string | undefined): string {
  if (!name || name.trim().length === 0) return '?';
  return name.trim().charAt(0).toUpperCase();
}

function safeFirstName(name: string | undefined): string {
  if (!name || name.trim().length === 0) return '';
  return name.trim().split(' ')[0];
}

// ---------------------------------------------------------------------------
// Kudos region
// ---------------------------------------------------------------------------

function formatRecipients(recipients: { name: string }[]): string {
  if (recipients.length === 0) return '';
  if (recipients.length === 1) return recipients[0].name;
  if (recipients.length === 2) return `${recipients[0].name} and ${recipients[1].name}`;
  return `${recipients[0].name}, ${recipients[1].name}, and ${recipients.length - 2} more`;
}

function CelebrateButton({ count, reducedMotion }: { count?: number; reducedMotion: boolean }): React.JSX.Element {
  const hasCount = typeof count === 'number' && count > 0;
  const label = hasCount ? `Celebrate (${count})` : 'Celebrate';

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: HP_SPACE.xs,
    padding: `${HP_SPACE.xs}px ${HP_SPACE.md}px`,
    border: HP_BORDER.subtle,
    borderRadius: HP_RADIUS.command,
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1,
    color: 'inherit',
    transition: reducedMotion ? TRANSITION_NONE : TRANSITION_FAST,
    flexShrink: 0,
    outline: 'none',
  };

  return (
    <button
      type="button"
      style={style}
      aria-label={label}
      onMouseEnter={reducedMotion ? undefined : (e) => { e.currentTarget.style.background = 'rgba(229,126,70,0.06)'; e.currentTarget.style.borderColor = 'rgba(229,126,70,0.25)'; }}
      onMouseLeave={reducedMotion ? undefined : (e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = ''; }}
      onFocus={(e) => { e.currentTarget.style.outline = FOCUS_OUTLINE; e.currentTarget.style.outlineOffset = '2px'; }}
      onBlur={(e) => { e.currentTarget.style.outline = 'none'; e.currentTarget.style.outlineOffset = ''; }}
    >
      <CheckCircle2 size={12} />
      <span>{label}</span>
    </button>
  );
}

interface KudosSpotlightProps {
  item: NonNullable<KudosModuleOutput['featured']>;
  layout: LayoutMode;
  narrowStress: boolean;
  reducedMotion: boolean;
}

function KudosSpotlight({ item, layout, narrowStress, reducedMotion }: KudosSpotlightProps): React.JSX.Element {
  const recipientLabel = formatRecipients(item.recipients);
  const showMedia = !narrowStress && Boolean(item.media);
  const mediaSize = layout === 'rail' ? 64 : 120;

  const spotlightStyle: React.CSSProperties = {
    padding: HP_SPACE.xl,
    borderLeft: '3px solid rgba(229,126,70,0.35)',
    background: 'rgba(229,126,70,0.02)',
    borderRadius: HP_RADIUS.card,
    display: 'flex',
    flexDirection: layout === 'wide' && !narrowStress ? 'row' : 'column',
    gap: HP_SPACE.lg,
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    transition: reducedMotion ? TRANSITION_NONE : 'box-shadow 150ms ease',
  };

  return (
    <div
      style={spotlightStyle}
      onMouseEnter={reducedMotion ? undefined : (e) => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(229,126,70,0.1)'; }}
      onMouseLeave={reducedMotion ? undefined : (e) => { e.currentTarget.style.boxShadow = ''; }}
    >
      {showMedia && item.media && (
        <img
          src={item.media.src}
          alt={item.media.alt}
          style={{
            width: mediaSize,
            height: mediaSize,
            objectFit: 'cover',
            borderRadius: HP_RADIUS.image,
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: HP_SPACE.xs }}>
        <div style={{ fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.4 }}>{item.headline}</div>
        {recipientLabel && (
          <div style={{ fontSize: '0.8125rem', fontWeight: 500, opacity: HP_TEXT_OPACITY.muted }}>{recipientLabel}</div>
        )}
        <p style={{ fontSize: '0.8125rem', opacity: HP_TEXT_OPACITY.secondary, lineHeight: 1.5, margin: 0 }}>{item.excerpt}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: HP_SPACE.md, fontSize: '0.75rem', opacity: HP_TEXT_OPACITY.secondary, flexWrap: 'wrap', marginTop: HP_SPACE.xs }}>
          <span>by {item.submittedBy.displayName}</span>
          <CelebrateButton count={item.celebrateCount} reducedMotion={reducedMotion} />
        </div>
      </div>
    </div>
  );
}

interface KudosHeadlineRowProps {
  item: NonNullable<KudosModuleOutput['featured']>;
  isLast: boolean;
  reducedMotion: boolean;
}

function KudosHeadlineRow({ item, isLast, reducedMotion }: KudosHeadlineRowProps): React.JSX.Element {
  const recipientLabel = formatRecipients(item.recipients);
  const hasAvatar = Boolean(item.recipients[0]?.media?.src);
  const avatarSize = 24;

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: HP_SPACE.md,
    padding: `${HP_SPACE.sm}px 0`,
    borderBottom: isLast ? 'none' : HP_BORDER.subtle,
    transition: reducedMotion ? TRANSITION_NONE : 'background 150ms ease',
  };

  const avatarStyle: React.CSSProperties = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
  };

  const placeholderStyle: React.CSSProperties = {
    ...avatarStyle,
    background: 'rgba(229,126,70,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      style={rowStyle}
      onMouseEnter={reducedMotion ? undefined : (e) => { e.currentTarget.style.background = 'rgba(229,126,70,0.03)'; }}
      onMouseLeave={reducedMotion ? undefined : (e) => { e.currentTarget.style.background = ''; }}
    >
      {hasAvatar ? (
        <img src={item.recipients[0].media!.src} alt={item.recipients[0].media!.alt ?? item.recipients[0].name} style={avatarStyle} />
      ) : (
        <div style={placeholderStyle}>
          <CheckCircle2 size={12} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.3 }}>{item.headline}</div>
        <div style={{ fontSize: '0.75rem', opacity: HP_TEXT_OPACITY.secondary, marginTop: 1 }}>
          {recipientLabel ? `${recipientLabel} · ` : ''}by {item.submittedBy.displayName}
        </div>
      </div>
    </div>
  );
}

interface KudosRegionProps {
  output: KudosModuleOutput;
  layout: LayoutMode;
  narrowStress: boolean;
  reducedMotion: boolean;
}

function KudosRegion({ output, layout, narrowStress, reducedMotion }: KudosRegionProps): React.JSX.Element | null {
  if (output.isEmpty) return null;

  const maxHeadlines = layout === 'rail' ? 4 : 6;
  const headlines = output.recentHeadlines.slice(0, maxHeadlines);

  return (
    <div data-hbc-region="kudos" role="region" aria-label="Kudos recognition">
      <div style={{ display: 'flex', alignItems: 'center', gap: HP_SPACE.md, marginBottom: HP_SPACE.md }}>
        <CheckCircle2 size={12} style={{ opacity: HP_TEXT_OPACITY.muted }} />
        <span style={eyebrowStyle}>Kudos</span>
      </div>

      {output.featured && (
        <KudosSpotlight item={output.featured} layout={layout} narrowStress={narrowStress} reducedMotion={reducedMotion} />
      )}

      {headlines.length > 0 && (
        <div style={{ marginTop: HP_SPACE.lg }}>
          {headlines.map((item, idx) => (
            <KudosHeadlineRow key={item.id} item={item} isLast={idx === headlines.length - 1} reducedMotion={reducedMotion} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Announcements region
// ---------------------------------------------------------------------------

interface AnnouncementCardProps {
  item: BandAOutput['items'][number];
  layout: LayoutMode;
  narrowStress: boolean;
}

function AnnouncementCard({ item, layout, narrowStress }: AnnouncementCardProps): React.JSX.Element {
  const label = ANNOUNCEMENT_LABEL[item.announcementType] ?? item.announcementType;
  const badgeStatus = ANNOUNCEMENT_BADGE[item.announcementType] ?? 'info';
  const showSummary = layout === 'wide' && Boolean(item.summary?.trim());
  const showBadge = !narrowStress;

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: HP_SPACE.md,
    padding: `${HP_SPACE.sm}px 0`,
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  };

  return (
    <div style={cardStyle}>
      {showBadge && <HbcPremiumBadge label={label} status={badgeStatus} size="sm" />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3 }}>{item.personName}</div>
        <div style={{ fontWeight: 500, fontSize: '0.8125rem', lineHeight: 1.4, marginTop: 1 }}>{item.headline}</div>
        {showSummary && (
          <p style={{ fontSize: '0.8125rem', opacity: HP_TEXT_OPACITY.secondary, lineHeight: 1.5, margin: `${HP_SPACE.xs}px 0 0` }}>{item.summary}</p>
        )}
      </div>
    </div>
  );
}

interface AnnouncementsRegionProps {
  output: BandAOutput;
  layout: LayoutMode;
  narrowStress: boolean;
}

function AnnouncementsRegion({ output, layout, narrowStress }: AnnouncementsRegionProps): React.JSX.Element | null {
  if (output.isEmpty) return null;

  const maxItems = layout === 'rail' ? 3 : 4;
  const items = output.items.slice(0, maxItems);

  return (
    <div data-hbc-region="announcements" role="region" aria-label="Announcements">
      <div style={{ display: 'flex', alignItems: 'center', gap: HP_SPACE.md, marginBottom: HP_SPACE.md }}>
        <Users size={12} style={{ opacity: HP_TEXT_OPACITY.muted }} />
        <span style={eyebrowStyle}>Highlights</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: HP_SPACE.xs }}>
        {items.map((item) => (
          <AnnouncementCard key={item.id} item={item} layout={layout} narrowStress={narrowStress} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Celebrations region
// ---------------------------------------------------------------------------

function formatRelativeDate(iso: string): string {
  const celebMs = Date.parse(iso);
  if (Number.isNaN(celebMs)) return '';
  const todayMs = Date.now();
  const diffDays = Math.round((celebMs - todayMs) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  return new Date(celebMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface CelebrationItemProps {
  item: BandBOutput['items'][number];
  layout: LayoutMode;
  narrowStress: boolean;
  reducedMotion: boolean;
}

function CelebrationItem({ item, layout, narrowStress, reducedMotion }: CelebrationItemProps): React.JSX.Element {
  const hasAvatar = Boolean(item.media?.src);
  const typeLabel = item.celebrationType === 'anniversary' && item.anniversaryYears
    ? `${item.anniversaryYears} yr`
    : item.celebrationType === 'anniversary'
      ? 'Anniversary'
      : 'Birthday';
  const dateLabel = formatRelativeDate(item.celebrationDate);
  const avatarSize = narrowStress ? 24 : 32;
  const initial = safeInitial(item.personName);
  const firstName = safeFirstName(item.personName);

  if (layout === 'wide') {
    const tileStyle: React.CSSProperties = {
      padding: HP_SPACE.md,
      borderRadius: HP_RADIUS.card,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
      textAlign: 'center',
      fontSize: '0.75rem',
      lineHeight: 1.3,
      transition: reducedMotion ? TRANSITION_NONE : 'background 150ms ease',
    };

    return (
      <div
        style={tileStyle}
        onMouseEnter={reducedMotion ? undefined : (e) => { e.currentTarget.style.background = 'rgba(34,83,145,0.03)'; }}
        onMouseLeave={reducedMotion ? undefined : (e) => { e.currentTarget.style.background = ''; }}
      >
        {hasAvatar ? (
          <img src={item.media!.src} alt={item.media!.alt ?? item.personName} style={{ width: avatarSize, height: avatarSize, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: avatarSize, height: avatarSize, borderRadius: '50%', background: 'rgba(34,83,145,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
            {initial}
          </div>
        )}
        <div style={{ fontWeight: 500, fontSize: '0.75rem' }}>{firstName}</div>
        <div style={{ fontSize: '0.625rem', opacity: HP_TEXT_OPACITY.secondary }}>{typeLabel}</div>
      </div>
    );
  }

  // Rail: compact horizontal strip item
  const stripItemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
    width: narrowStress ? 44 : 56,
    textAlign: 'center',
  };

  return (
    <div style={stripItemStyle}>
      {hasAvatar ? (
        <img src={item.media!.src} alt={item.media!.alt ?? item.personName} style={{ width: avatarSize, height: avatarSize, borderRadius: '50%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: avatarSize, height: avatarSize, borderRadius: '50%', background: 'rgba(34,83,145,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: narrowStress ? '0.625rem' : '0.75rem', fontWeight: 600 }}>
          {initial}
        </div>
      )}
      <div style={{ fontWeight: 500, fontSize: '0.625rem', lineHeight: 1.2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {firstName}
      </div>
      <div style={{ fontSize: '0.5625rem', opacity: HP_TEXT_OPACITY.secondary, lineHeight: 1.2 }}>
        {dateLabel || typeLabel}
      </div>
    </div>
  );
}

interface CelebrationsRegionProps {
  output: BandBOutput;
  layout: LayoutMode;
  narrowStress: boolean;
  reducedMotion: boolean;
}

function CelebrationsRegion({ output, layout, narrowStress, reducedMotion }: CelebrationsRegionProps): React.JSX.Element | null {
  if (output.isEmpty) return null;

  const maxItems = layout === 'rail' ? 6 : 8;
  const items = output.items.slice(0, maxItems);

  if (layout === 'wide') {
    return (
      <div data-hbc-region="celebrations" role="region" aria-label="This week celebrations">
        <div style={{ display: 'flex', alignItems: 'center', gap: HP_SPACE.md, marginBottom: HP_SPACE.md }}>
          <Calendar size={12} style={{ opacity: HP_TEXT_OPACITY.muted }} />
          <span style={eyebrowStyle}>This Week</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: HP_SPACE.sm }}>
          {items.map((item) => (
            <CelebrationItem key={item.id} item={item} layout={layout} narrowStress={narrowStress} reducedMotion={reducedMotion} />
          ))}
        </div>
      </div>
    );
  }

  // Rail: horizontal scroll strip
  return (
    <div data-hbc-region="celebrations" role="region" aria-label="This week celebrations">
      <div style={{ display: 'flex', alignItems: 'center', gap: HP_SPACE.md, marginBottom: HP_SPACE.md }}>
        <Calendar size={12} style={{ opacity: HP_TEXT_OPACITY.muted }} />
        <span style={eyebrowStyle}>This Week</span>
      </div>
      <div style={{
        display: 'flex',
        gap: HP_SPACE.md,
        overflowX: 'auto',
        paddingBottom: HP_SPACE.xs,
        WebkitOverflowScrolling: 'touch',
        maskImage: items.length > 4 ? 'linear-gradient(to right, black 85%, transparent 100%)' : undefined,
        WebkitMaskImage: items.length > 4 ? 'linear-gradient(to right, black 85%, transparent 100%)' : undefined,
      }}>
        {items.map((item) => (
          <CelebrationItem key={item.id} item={item} layout="rail" narrowStress={narrowStress} reducedMotion={reducedMotion} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Region assembly with suppression + separators
// ---------------------------------------------------------------------------

function RegionAssembly({ regions }: { regions: React.JSX.Element[] }): React.JSX.Element {
  return (
    <div style={moduleBodyStyle}>
      {regions.map((region, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <Separator decorative style={separatorMargin} />}
          {region}
        </React.Fragment>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function hasAnyInputData(config: Partial<PeopleCultureMergedConfig> | undefined): boolean {
  return Boolean(
    config?.announcements?.length
    || config?.kudos?.length
    || config?.celebrations?.length,
  );
}

function countTotalItems(bandA: BandAOutput, kudos: KudosModuleOutput, bandB: BandBOutput): number {
  const kudosCount = (kudos.featured ? 1 : 0) + kudos.recentHeadlines.length;
  return bandA.items.length + kudosCount + bandB.items.length;
}

export function PeopleCultureMerged({
  config,
  activeAudience,
  isLoading = false,
}: PeopleCultureMergedProps): React.JSX.Element {
  const tier = useResponsiveTier();
  const layout = resolveLayout(tier);
  const reducedMotion = useReducedMotion();
  const narrowStress = useNarrowStress();

  // Loading state — module level
  if (isLoading) {
    return <HomepageLoadingState label="Loading People & Culture" />;
  }

  // Normalize — safe even with undefined/malformed input
  let output: ReturnType<typeof normalizePeopleCultureMergedConfig>;
  try {
    output = normalizePeopleCultureMergedConfig(config, activeAudience);
  } catch {
    const message = resolveAuthoringMessage('peopleCulture', 'invalid');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const allEmpty = output.bandA.isEmpty && output.kudos.isEmpty && output.bandB.isEmpty;
  const hadInput = hasAnyInputData(config);

  // No data configured — authoring guidance
  if (allEmpty && !hadInput) {
    const message = resolveAuthoringMessage('peopleCulture', 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  // Data configured but all filtered/invalid
  if (allEmpty && hadInput) {
    const message = resolveAuthoringMessage('peopleCulture', 'invalid');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  // Count total items for sparse-data awareness
  const totalItems = countTotalItems(output.bandA, output.kudos, output.bandB);
  const isSparse = totalItems <= 3;

  // Assemble rendered regions — focal sequence: Kudos → Announcements → Celebrations
  // Only populated regions render; empty regions are suppressed
  const rendered: React.JSX.Element[] = [];

  const kudos = KudosRegion({ output: output.kudos, layout, narrowStress, reducedMotion });
  if (kudos) rendered.push(kudos);

  const announcements = AnnouncementsRegion({ output: output.bandA, layout, narrowStress });
  if (announcements) rendered.push(announcements);

  const celebrations = CelebrationsRegion({ output: output.bandB, layout, narrowStress, reducedMotion });
  if (celebrations) rendered.push(celebrations);

  // Header CTA — "Give Kudos" always visible as participation prompt
  const headerAction = (
    <div style={{ display: 'flex', alignItems: 'center', gap: HP_SPACE.md }}>
      <HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="ghost" />
      {layout === 'wide' && !output.kudos.isEmpty && (
        <HbcPremiumCta label="View All Kudos" href="#view-all-kudos" variant="ghost" arrow />
      )}
    </div>
  );

  // Sparse-data visual treatment: generous padding reads as editorial restraint
  const bodyPadding = isSparse
    ? (tier === 'mobile' ? HP_SPACE.xl : HP_SPACE['2xl'])
    : (tier === 'mobile' ? HP_SPACE.lg : HP_SPACE.xl);

  return (
    <HbcHomepageSectionShell
      title={output.heading}
      headerAction={headerAction}
    >
      <div
        style={{
          padding: bodyPadding,
          minHeight: isSparse ? 80 : undefined,
        }}
        role="region"
        aria-label={output.heading}
        data-hbc-homepage="people-culture"
        data-hbc-authoring-safe="true"
        data-hbc-layout={layout}
        data-hbc-sparse={isSparse ? 'true' : undefined}
        data-hbc-narrow-stress={narrowStress ? 'true' : undefined}
      >
        <RegionAssembly regions={rendered} />

        {/* Module footer — view all destination */}
        <div style={{ marginTop: HP_SPACE.xl, textAlign: 'right' }}>
          <HbcPremiumCta label="View all" href="#people-culture" variant="ghost" arrow />
        </div>
      </div>
    </HbcHomepageSectionShell>
  );
}
