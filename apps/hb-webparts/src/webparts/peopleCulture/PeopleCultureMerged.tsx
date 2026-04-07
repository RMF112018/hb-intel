/**
 * PeopleCultureMerged — Rebuilt People & Culture homepage surface
 *
 * Phase 11 / P03: Full rebuild against P01 Surface Blueprint.
 *
 * Focal sequence: Kudos → Announcements → Celebrations
 * Layout: Rail-first (300-400px) with wide-mode adaptation (>480px)
 * Suppression: Empty regions are not rendered; module-level empty state
 * only when all regions are empty.
 * Visual: Single module header, eyebrow region labels, separator rhythm
 * instead of per-region box boundaries.
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
// Constants
// ---------------------------------------------------------------------------

const FOCUS_OUTLINE = '2px solid #225391';

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
// Kudos region
// ---------------------------------------------------------------------------

function formatRecipients(recipients: { name: string }[]): string {
  if (recipients.length === 0) return '';
  if (recipients.length === 1) return recipients[0].name;
  if (recipients.length === 2) return `${recipients[0].name} and ${recipients[1].name}`;
  return `${recipients[0].name}, ${recipients[1].name}, and ${recipients.length - 2} more`;
}

function CelebrateButton({ count }: { count?: number }): React.JSX.Element {
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
    transition: 'background 150ms ease, border-color 150ms ease',
    flexShrink: 0,
    outline: 'none',
  };

  return (
    <button
      type="button"
      style={style}
      aria-label={label}
      onMouseEnter={(e) => { e.currentTarget.style.background = `rgba(229,126,70,0.06)`; e.currentTarget.style.borderColor = `rgba(229,126,70,0.25)`; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = ''; }}
      onFocus={(e) => { e.currentTarget.style.outline = FOCUS_OUTLINE; e.currentTarget.style.outlineOffset = '2px'; }}
      onBlur={(e) => { e.currentTarget.style.outline = 'none'; e.currentTarget.style.outlineOffset = ''; }}
    >
      <CheckCircle2 size={12} />
      <span>{label}</span>
    </button>
  );
}

function KudosSpotlight({ item, layout }: { item: NonNullable<KudosModuleOutput['featured']>; layout: LayoutMode }): React.JSX.Element {
  const recipientLabel = formatRecipients(item.recipients);
  const mediaSize = layout === 'rail' ? 64 : 120;

  const spotlightStyle: React.CSSProperties = {
    padding: HP_SPACE.xl,
    borderLeft: `3px solid rgba(229,126,70,0.35)`,
    background: 'rgba(229,126,70,0.02)',
    borderRadius: HP_RADIUS.card,
    display: 'flex',
    flexDirection: layout === 'wide' ? 'row' : 'column',
    gap: HP_SPACE.lg,
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    transition: 'box-shadow 150ms ease',
  };

  return (
    <div
      style={spotlightStyle}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(229,126,70,0.1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
    >
      {item.media && (
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
          <CelebrateButton count={item.celebrateCount} />
        </div>
      </div>
    </div>
  );
}

function KudosHeadlineRow({ item, isLast, tier }: { item: NonNullable<KudosModuleOutput['featured']>; isLast: boolean; tier: ResponsiveTier }): React.JSX.Element {
  const recipientLabel = formatRecipients(item.recipients);
  const hasAvatar = Boolean(item.recipients[0]?.media?.src);
  const avatarSize = tier === 'mobile' ? 24 : 24;

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: HP_SPACE.md,
    padding: `${HP_SPACE.sm}px 0`,
    borderBottom: isLast ? 'none' : HP_BORDER.subtle,
    transition: 'background 150ms ease',
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
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(229,126,70,0.03)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
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

function KudosRegion({ output, layout, tier }: { output: KudosModuleOutput; layout: LayoutMode; tier: ResponsiveTier }): React.JSX.Element | null {
  if (output.isEmpty) return null;

  const maxHeadlines = layout === 'rail' ? 4 : 6;
  const headlines = output.recentHeadlines.slice(0, maxHeadlines);

  return (
    <div data-hbc-region="kudos">
      <div style={{ display: 'flex', alignItems: 'center', gap: HP_SPACE.md, marginBottom: HP_SPACE.md }}>
        <CheckCircle2 size={12} style={{ opacity: HP_TEXT_OPACITY.muted }} />
        <span style={eyebrowStyle}>Kudos</span>
      </div>

      {output.featured && (
        <KudosSpotlight item={output.featured} layout={layout} />
      )}

      {headlines.length > 0 && (
        <div style={{ marginTop: HP_SPACE.lg }}>
          {headlines.map((item, idx) => (
            <KudosHeadlineRow key={item.id} item={item} isLast={idx === headlines.length - 1} tier={tier} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Announcements region
// ---------------------------------------------------------------------------

function AnnouncementCard({ item, layout }: { item: BandAOutput['items'][number]; layout: LayoutMode }): React.JSX.Element {
  const label = ANNOUNCEMENT_LABEL[item.announcementType] ?? item.announcementType;
  const badgeStatus = ANNOUNCEMENT_BADGE[item.announcementType] ?? 'info';
  const showSummary = layout === 'wide' && Boolean(item.summary?.trim());

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
      <HbcPremiumBadge label={label} status={badgeStatus} size="sm" />
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

function AnnouncementsRegion({ output, layout }: { output: BandAOutput; layout: LayoutMode }): React.JSX.Element | null {
  if (output.isEmpty) return null;

  const maxItems = layout === 'rail' ? 3 : 4;
  const items = output.items.slice(0, maxItems);

  return (
    <div data-hbc-region="announcements">
      <div style={{ display: 'flex', alignItems: 'center', gap: HP_SPACE.md, marginBottom: HP_SPACE.md }}>
        <Users size={12} style={{ opacity: HP_TEXT_OPACITY.muted }} />
        <span style={eyebrowStyle}>Highlights</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: HP_SPACE.xs }}>
        {items.map((item) => (
          <AnnouncementCard key={item.id} item={item} layout={layout} />
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

function CelebrationItem({ item, layout }: { item: BandBOutput['items'][number]; layout: LayoutMode }): React.JSX.Element {
  const hasAvatar = Boolean(item.media?.src);
  const typeLabel = item.celebrationType === 'anniversary' && item.anniversaryYears
    ? `${item.anniversaryYears} yr`
    : item.celebrationType === 'anniversary'
      ? 'Anniversary'
      : 'Birthday';
  const dateLabel = formatRelativeDate(item.celebrationDate);

  if (layout === 'wide') {
    // Grid tile for wide mode
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
      transition: 'background 150ms ease',
    };

    return (
      <div
        style={tileStyle}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,83,145,0.03)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
      >
        {hasAvatar ? (
          <img src={item.media!.src} alt={item.media!.alt ?? item.personName} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(34,83,145,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
            {item.personName.charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ fontWeight: 500, fontSize: '0.75rem' }}>{item.personName.split(' ')[0]}</div>
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
    width: 56,
    textAlign: 'center',
  };

  return (
    <div style={stripItemStyle}>
      {hasAvatar ? (
        <img src={item.media!.src} alt={item.media!.alt ?? item.personName} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(34,83,145,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
          {item.personName.charAt(0).toUpperCase()}
        </div>
      )}
      <div style={{ fontWeight: 500, fontSize: '0.625rem', lineHeight: 1.2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.personName.split(' ')[0]}
      </div>
      <div style={{ fontSize: '0.5625rem', opacity: HP_TEXT_OPACITY.secondary, lineHeight: 1.2 }}>
        {dateLabel || typeLabel}
      </div>
    </div>
  );
}

function CelebrationsRegion({ output, layout }: { output: BandBOutput; layout: LayoutMode }): React.JSX.Element | null {
  if (output.isEmpty) return null;

  const maxItems = layout === 'rail' ? 6 : 8;
  const items = output.items.slice(0, maxItems);

  if (layout === 'wide') {
    return (
      <div data-hbc-region="celebrations">
        <div style={{ display: 'flex', alignItems: 'center', gap: HP_SPACE.md, marginBottom: HP_SPACE.md }}>
          <Calendar size={12} style={{ opacity: HP_TEXT_OPACITY.muted }} />
          <span style={eyebrowStyle}>This Week</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: HP_SPACE.sm }}>
          {items.map((item) => (
            <CelebrationItem key={item.id} item={item} layout={layout} />
          ))}
        </div>
      </div>
    );
  }

  // Rail: horizontal scroll strip
  return (
    <div data-hbc-region="celebrations">
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
          <CelebrationItem key={item.id} item={item} layout="rail" />
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

export function PeopleCultureMerged({
  config,
  activeAudience,
  isLoading = false,
}: PeopleCultureMergedProps): React.JSX.Element {
  const tier = useResponsiveTier();
  const layout = resolveLayout(tier);

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

  // Assemble rendered regions — focal sequence: Kudos → Announcements → Celebrations
  // Only populated regions render; empty regions are suppressed
  const rendered: React.JSX.Element[] = [];

  const kudos = KudosRegion({ output: output.kudos, layout, tier });
  if (kudos) rendered.push(kudos);

  const announcements = AnnouncementsRegion({ output: output.bandA, layout });
  if (announcements) rendered.push(announcements);

  const celebrations = CelebrationsRegion({ output: output.bandB, layout });
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

  return (
    <HbcHomepageSectionShell
      title={output.heading}
      headerAction={headerAction}
    >
      <div
        style={{ padding: tier === 'mobile' ? HP_SPACE.lg : HP_SPACE.xl }}
        data-hbc-homepage="people-culture"
        data-hbc-authoring-safe="true"
        data-hbc-layout={layout}
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
