/**
 * PeopleCultureMerged — Three-region People & Culture desktop shell
 *
 * Phase 3: Desktop composition skeleton with four-part structure.
 * Phase 4: Band A editorial announcement grid with medium-format cards,
 *          adaptive grid layout, and partial-data resilience.
 * Phase 5: Kudos featured spotlight and recent headlines with recipient
 *          display, avatar thumbnails, celebrate counts, Give Kudos
 *          entry posture, Celebrate affordance, and empty states.
 * Phase 7: Band B compact weekly celebration tiles with avatar/photo,
 *          celebration type label, and relative date display.
 * Phase 8A: Responsive adaptation for tablet and mobile — tier-aware
 *           grid layouts preserving hierarchy across breakpoints.
 * Phase 8B: Authoring/loading/empty/invalid hardening — safe behavior
 *           in SharePoint edit mode and imperfect data conditions.
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
  hpZoneSection,
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
// Icon size constant — consistent across all region headers
// ---------------------------------------------------------------------------

const ICON_SIZE = 16;
const HP_FOCUS_OUTLINE = '2px solid #225391';

// ---------------------------------------------------------------------------
// Shared styles — shell
// ---------------------------------------------------------------------------

function getShellStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    ...hpZoneSection('communications'),
    display: 'flex',
    flexDirection: 'column',
    gap: tier === 'mobile' ? HP_SPACE['2xl'] : HP_SPACE['3xl'],
    padding: tier === 'mobile' ? HP_SPACE.xl : HP_SPACE['3xl'],
  };
}

// ---------------------------------------------------------------------------
// Band A — Announcement type label and badge mappings
// ---------------------------------------------------------------------------

const ANNOUNCEMENT_LABEL_MAP: Record<string, string> = {
  promotion: 'Congratulations',
  newHire: 'Welcome',
  baby: 'Baby Announcement',
  wedding: 'Wedding Announcement',
  special: 'Special Announcement',
};

const ANNOUNCEMENT_BADGE_MAP: Record<string, 'info' | 'success' | 'warning' | 'critical'> = {
  promotion: 'critical',
  newHire: 'info',
  baby: 'success',
  wedding: 'success',
  special: 'warning',
};

// ---------------------------------------------------------------------------
// Band A styles — editorial announcement layer (most formal)
// ---------------------------------------------------------------------------

function getBandARegionStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    padding: tier === 'mobile' ? HP_SPACE.xl : HP_SPACE['2xl'],
    border: HP_BORDER.subtle,
    borderRadius: HP_RADIUS.editorial,
  };
}

const bandAHeaderStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9375rem',
  fontWeight: 600,
  letterSpacing: '0.01em',
};

function announcementGridColumns(itemCount: number, tier: ResponsiveTier): React.CSSProperties {
  if (tier === 'mobile') {
    return {
      display: 'flex',
      flexDirection: 'column',
      gap: HP_SPACE.md,
      marginTop: HP_SPACE.md,
    };
  }
  return {
    display: 'grid',
    gridTemplateColumns: itemCount === 1
      ? 'minmax(0, 480px)'
      : tier === 'tablet'
        ? 'repeat(auto-fit, minmax(240px, 1fr))'
        : 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: HP_SPACE.xl,
    marginTop: HP_SPACE.xl,
  };
}

const announcementCardStyle: React.CSSProperties = {
  padding: HP_SPACE['2xl'],
  border: HP_BORDER.standard,
  borderRadius: HP_RADIUS.editorial,
  display: 'flex',
  flexDirection: 'column',
  gap: HP_SPACE.sm,
  minHeight: 120,
  overflowWrap: 'break-word',
  wordBreak: 'break-word',
};

function getAnnouncementCardImageStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    width: '100%',
    maxHeight: tier === 'mobile' ? 120 : 160,
    objectFit: 'cover' as const,
    borderRadius: HP_RADIUS.image,
    display: 'block',
  };
}

const announcementCardNameStyle: React.CSSProperties = {
  fontSize: '0.9375rem',
  fontWeight: 600,
  lineHeight: 1.3,
};

const announcementCardHeadlineStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 500,
  lineHeight: 1.4,
};

const announcementCardSummaryStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  lineHeight: 1.5,
  opacity: HP_TEXT_OPACITY.secondary,
  margin: 0,
};

// ---------------------------------------------------------------------------
// Kudos styles — engagement center (warmest, most prominent)
// ---------------------------------------------------------------------------

function getKudosRegionStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    padding: tier === 'mobile' ? HP_SPACE.xl : HP_SPACE['2xl'],
    border: HP_BORDER.warmAccent,
    borderRadius: HP_RADIUS.editorial,
  };
}

function getKudosHeaderRowStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    display: 'flex',
    justifyContent: tier === 'mobile' ? 'flex-start' : 'space-between',
    alignItems: tier === 'mobile' ? 'flex-start' : 'center',
    flexDirection: tier === 'mobile' ? 'column' : 'row',
    gap: HP_SPACE.md,
    flexWrap: 'wrap',
  };
}

const kudosHeaderStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 700,
  letterSpacing: '0.01em',
};

const kudosDescriptionStyle: React.CSSProperties = {
  margin: `${HP_SPACE.sm}px 0 0`,
  fontSize: '0.8125rem',
  opacity: HP_TEXT_OPACITY.secondary,
  lineHeight: 1.5,
};

function getKudosFeaturedStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    marginTop: HP_SPACE.xl,
    padding: tier === 'mobile' ? HP_SPACE.xl : HP_SPACE['2xl'],
    border: HP_BORDER.standard,
    borderRadius: HP_RADIUS.editorial,
    background: 'rgba(229,126,70,0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: HP_SPACE.sm,
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  };
}

function getKudosFeaturedImageStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    width: '100%',
    maxHeight: tier === 'mobile' ? 140 : 200,
    objectFit: 'cover' as const,
    borderRadius: HP_RADIUS.image,
    display: 'block',
  };
}

const kudosFeaturedHeadlineStyle: React.CSSProperties = {
  fontSize: '0.9375rem',
  fontWeight: 600,
  lineHeight: 1.4,
};

const kudosFeaturedRecipientsStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 500,
  lineHeight: 1.4,
  opacity: HP_TEXT_OPACITY.muted,
};

const kudosFeaturedExcerptStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  opacity: HP_TEXT_OPACITY.secondary,
  lineHeight: 1.5,
  margin: 0,
};

const kudosFeaturedMetaStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
  fontSize: '0.75rem',
  opacity: HP_TEXT_OPACITY.secondary,
  flexWrap: 'wrap',
};

const kudosHeadlineItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.lg,
  padding: `${HP_SPACE.md}px 0`,
  borderBottom: HP_BORDER.subtle,
};

const kudosHeadlineItemLastStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.lg,
  padding: `${HP_SPACE.md}px 0`,
};

function getKudosHeadlineAvatarSize(tier: ResponsiveTier): number {
  return tier === 'mobile' ? 28 : 32;
}

function getKudosHeadlineAvatarStyle(tier: ResponsiveTier): React.CSSProperties {
  const size = getKudosHeadlineAvatarSize(tier);
  return {
    width: size,
    height: size,
    borderRadius: '50%',
    objectFit: 'cover' as const,
    flexShrink: 0,
  };
}

function getKudosHeadlineAvatarPlaceholderStyle(tier: ResponsiveTier): React.CSSProperties {
  const size = getKudosHeadlineAvatarSize(tier);
  return {
    width: size,
    height: size,
    borderRadius: '50%',
    background: 'rgba(229,126,70,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };
}

const kudosHeadlineContentStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const kudosCelebrateButtonStyle: React.CSSProperties = {
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

const kudosCtaRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.xl,
  flexWrap: 'wrap',
};

const kudosEmptyStyle: React.CSSProperties = {
  marginTop: HP_SPACE.xl,
  padding: `${HP_SPACE['4xl']}px ${HP_SPACE['2xl']}px`,
  textAlign: 'center',
  border: HP_BORDER.subtle,
  borderRadius: HP_RADIUS.editorial,
  background: 'rgba(229,126,70,0.015)',
};

const kudosEmptyHeadingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9375rem',
  fontWeight: 600,
  lineHeight: 1.4,
};

const kudosEmptyDescriptionStyle: React.CSSProperties = {
  margin: `${HP_SPACE.sm}px 0 0`,
  fontSize: '0.8125rem',
  opacity: HP_TEXT_OPACITY.secondary,
  lineHeight: 1.5,
};

const kudosEmptyCtaStyle: React.CSSProperties = {
  marginTop: HP_SPACE.xl,
};

// ---------------------------------------------------------------------------
// Band B styles — compact weekly layer (lightest, densest)
// ---------------------------------------------------------------------------

function getBandBRegionStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    padding: tier === 'mobile'
      ? `${HP_SPACE.md}px ${HP_SPACE.xl}px`
      : `${HP_SPACE.xl}px ${HP_SPACE['2xl']}px`,
    border: HP_BORDER.subtle,
    borderRadius: HP_RADIUS.card,
  };
}

const bandBHeaderStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.8125rem',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  opacity: HP_TEXT_OPACITY.muted,
};

function getCelebrationGridStyle(tier: ResponsiveTier): React.CSSProperties {
  if (tier === 'mobile') {
    return {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
      gap: HP_SPACE.xs,
      marginTop: HP_SPACE.sm,
    };
  }
  return {
    display: 'grid',
    gridTemplateColumns: tier === 'tablet'
      ? 'repeat(auto-fill, minmax(100px, 1fr))'
      : 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: HP_SPACE.sm,
    marginTop: HP_SPACE.md,
  };
}

const celebrationTileStyle: React.CSSProperties = {
  padding: HP_SPACE.md,
  border: HP_BORDER.subtle,
  borderRadius: HP_RADIUS.card,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 3,
  textAlign: 'center' as const,
  fontSize: '0.75rem',
  lineHeight: 1.3,
};

const celebrationAvatarStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  objectFit: 'cover' as const,
};

const celebrationAvatarPlaceholderStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  background: 'rgba(34,83,145,0.06)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const celebrationNameStyle: React.CSSProperties = {
  fontWeight: 500,
  fontSize: '0.75rem',
  lineHeight: 1.3,
};

const celebrationMetaStyle: React.CSSProperties = {
  fontSize: '0.625rem',
  opacity: HP_TEXT_OPACITY.secondary,
  lineHeight: 1.3,
};

const bandBEmptyStyle: React.CSSProperties = {
  marginTop: HP_SPACE.md,
  fontSize: '0.8125rem',
  opacity: HP_TEXT_OPACITY.secondary,
};

// ---------------------------------------------------------------------------
// Region components
// ---------------------------------------------------------------------------

function AnnouncementCard({ item, tier }: { item: BandAOutput['items'][number]; tier: ResponsiveTier }): React.JSX.Element {
  const label = ANNOUNCEMENT_LABEL_MAP[item.announcementType] ?? item.announcementType;
  const badgeStatus = ANNOUNCEMENT_BADGE_MAP[item.announcementType] ?? 'info';
  const hasSummary = Boolean(item.summary?.trim());

  return (
    <div style={announcementCardStyle}>
      {item.media && (
        <img
          src={item.media.src}
          alt={item.media.alt}
          style={getAnnouncementCardImageStyle(tier)}
        />
      )}
      <HbcPremiumBadge label={label} status={badgeStatus} size="sm" />
      <div style={announcementCardNameStyle}>{item.personName}</div>
      <div style={announcementCardHeadlineStyle}>{item.headline}</div>
      {hasSummary && <p style={announcementCardSummaryStyle}>{item.summary}</p>}
      {item.cta && (
        <div style={{ marginTop: 'auto', paddingTop: HP_SPACE.sm }}>
          <HbcPremiumCta label={item.cta.label} href={item.cta.href} variant="ghost" arrow />
        </div>
      )}
    </div>
  );
}

function BandARegion({ output, tier }: { output: BandAOutput; tier: ResponsiveTier }): React.JSX.Element | null {
  if (output.isEmpty) return null;

  return (
    <section aria-label="Announcements" data-hbc-homepage="band-a" data-hbc-region-state="populated">
      <div style={getBandARegionStyle(tier)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: HP_SPACE.sm }}>
          <h3 style={bandAHeaderStyle}>
            <Users size={ICON_SIZE} style={{ marginRight: HP_SPACE.md, verticalAlign: 'text-bottom' }} />
            Highlights
          </h3>
          <HbcPremiumCta label="Submit announcement" href="#submit-announcement" variant="ghost" arrow />
        </div>
        <div style={announcementGridColumns(output.items.length, tier)}>
          {output.items.map((item) => (
            <AnnouncementCard key={item.id} item={item} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
}

function formatRecipients(recipients: KudosModuleOutput['featured'] extends undefined ? never : NonNullable<KudosModuleOutput['featured']>['recipients']): string {
  if (recipients.length === 0) return '';
  if (recipients.length === 1) return recipients[0].name;
  if (recipients.length === 2) return `${recipients[0].name} and ${recipients[1].name}`;
  return `${recipients[0].name}, ${recipients[1].name}, and ${recipients.length - 2} more`;
}

function CelebrateButton({ count }: { count?: number }): React.JSX.Element {
  const hasCount = typeof count === 'number' && count > 0;
  const label = hasCount ? `Celebrate (${count})` : 'Celebrate';
  return (
    <button
      type="button"
      style={kudosCelebrateButtonStyle}
      aria-label={label}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(229,126,70,0.06)'; e.currentTarget.style.borderColor = 'rgba(229,126,70,0.25)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = ''; }}
      onFocus={(e) => { e.currentTarget.style.outline = HP_FOCUS_OUTLINE; e.currentTarget.style.outlineOffset = '2px'; }}
      onBlur={(e) => { e.currentTarget.style.outline = 'none'; e.currentTarget.style.outlineOffset = ''; }}
    >
      <CheckCircle2 size={12} />
      <span>{label}</span>
    </button>
  );
}

function KudosFeaturedSpotlight({ item, tier }: { item: NonNullable<KudosModuleOutput['featured']>; tier: ResponsiveTier }): React.JSX.Element {
  const recipientLabel = formatRecipients(item.recipients);

  return (
    <div style={getKudosFeaturedStyle(tier)}>
      {item.media && (
        <img src={item.media.src} alt={item.media.alt} style={getKudosFeaturedImageStyle(tier)} />
      )}
      <div style={kudosFeaturedHeadlineStyle}>{item.headline}</div>
      {recipientLabel && (
        <div style={kudosFeaturedRecipientsStyle}>{recipientLabel}</div>
      )}
      <p style={kudosFeaturedExcerptStyle}>{item.excerpt}</p>
      <div style={kudosFeaturedMetaStyle}>
        <span>by {item.submittedBy.displayName}</span>
        <CelebrateButton count={item.celebrateCount} />
      </div>
    </div>
  );
}

function KudosHeadlineItem({ item, isLast, tier }: { item: NonNullable<KudosModuleOutput['featured']>; isLast: boolean; tier: ResponsiveTier }): React.JSX.Element {
  const recipientLabel = formatRecipients(item.recipients);
  const hasAvatar = Boolean(item.recipients[0]?.media?.src);

  return (
    <div style={isLast ? kudosHeadlineItemLastStyle : kudosHeadlineItemStyle}>
      {hasAvatar ? (
        <img
          src={item.recipients[0].media!.src}
          alt={item.recipients[0].media!.alt ?? item.recipients[0].name}
          style={getKudosHeadlineAvatarStyle(tier)}
        />
      ) : (
        <div style={getKudosHeadlineAvatarPlaceholderStyle(tier)}>
          <CheckCircle2 size={tier === 'mobile' ? 12 : 14} />
        </div>
      )}
      <div style={kudosHeadlineContentStyle}>
        <div style={{ fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.3 }}>{item.headline}</div>
        <div style={{ fontSize: '0.75rem', opacity: HP_TEXT_OPACITY.secondary, marginTop: 2, lineHeight: 1.4 }}>
          {recipientLabel ? `${recipientLabel} · ` : ''}by {item.submittedBy.displayName}
        </div>
      </div>
      <CelebrateButton count={item.celebrateCount} />
    </div>
  );
}

function KudosRegion({ output, tier }: { output: KudosModuleOutput; tier: ResponsiveTier }): React.JSX.Element {
  return (
    <section aria-label="Kudos recognition" data-hbc-homepage="kudos-module" data-hbc-region-state={output.isEmpty ? 'empty' : 'populated'}>
      <div style={getKudosRegionStyle(tier)}>
        <div style={getKudosHeaderRowStyle(tier)}>
          <h3 style={kudosHeaderStyle}>
            <CheckCircle2 size={ICON_SIZE} style={{ marginRight: HP_SPACE.md, verticalAlign: 'text-bottom' }} />
            Kudos
          </h3>
          <div style={kudosCtaRowStyle}>
            <HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="ghost" arrow />
            <HbcPremiumCta label="View All Kudos" href="#view-all-kudos" variant="ghost" arrow />
          </div>
        </div>
        <p style={kudosDescriptionStyle}>
          Recognize great work, celebrate teammates, and spotlight wins across the company
        </p>

        {output.isEmpty ? (
          <div role="status" aria-live="polite" style={kudosEmptyStyle}>
            <div style={kudosEmptyHeadingStyle}>No Kudos yet</div>
            <p style={kudosEmptyDescriptionStyle}>
              Be the first to recognize a teammate. Share appreciation for great work, team wins, or everyday excellence.
            </p>
            <div style={kudosEmptyCtaStyle}>
              <HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="ghost" arrow />
            </div>
          </div>
        ) : (
          <>
            {output.featured && (
              <KudosFeaturedSpotlight item={output.featured} tier={tier} />
            )}

            {output.recentHeadlines.length > 0 && (
              <>
                <Separator decorative style={{ margin: `${HP_SPACE.xl}px 0` }} />
                <div>
                  {output.recentHeadlines.map((item, index) => (
                    <KudosHeadlineItem
                      key={item.id}
                      item={item}
                      isLast={index === output.recentHeadlines.length - 1}
                      tier={tier}
                    />
                  ))}
                </div>
              </>
            )}

            {output.recentHeadlines.length >= 6 && (
              <div style={{ marginTop: HP_SPACE.xl, textAlign: 'center' }}>
                <HbcPremiumCta label="View All Kudos" href="#view-all-kudos" variant="ghost" arrow />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

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

function CelebrationTile({ item }: { item: BandBOutput['items'][number] }): React.JSX.Element {
  const hasAvatar = Boolean(item.media?.src);
  const typeLabel = item.celebrationType === 'anniversary' && item.anniversaryYears
    ? `${item.anniversaryYears} yr`
    : item.celebrationType === 'anniversary'
      ? 'Anniversary'
      : 'Birthday';
  const dateLabel = formatRelativeDate(item.celebrationDate);
  const metaLabel = dateLabel ? `${typeLabel} · ${dateLabel}` : typeLabel;

  return (
    <div style={celebrationTileStyle}>
      {hasAvatar ? (
        <img src={item.media!.src} alt={item.media!.alt ?? item.personName} style={celebrationAvatarStyle} />
      ) : (
        <div style={celebrationAvatarPlaceholderStyle}>
          <Users size={14} />
        </div>
      )}
      <div style={celebrationNameStyle}>{item.personName}</div>
      <div style={celebrationMetaStyle}>{metaLabel}</div>
    </div>
  );
}

function BandBRegion({ output, tier }: { output: BandBOutput; tier: ResponsiveTier }): React.JSX.Element {
  return (
    <section aria-label="This week celebrations" data-hbc-homepage="band-b" data-hbc-region-state={output.isEmpty ? 'empty' : 'populated'}>
      <div style={getBandBRegionStyle(tier)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: HP_SPACE.md }}>
          <h3 style={bandBHeaderStyle}>
            <Calendar size={ICON_SIZE - 2} style={{ marginRight: HP_SPACE.sm, verticalAlign: 'text-bottom' }} />
            This Week
          </h3>
          {!output.isEmpty && (
            <span style={{ fontSize: '0.6875rem', opacity: HP_TEXT_OPACITY.secondary }}>
              {output.items.length}
            </span>
          )}
        </div>

        {output.isEmpty ? (
          <div role="status" aria-live="polite" style={bandBEmptyStyle}>
            No upcoming celebrations this week.
          </div>
        ) : (
          <div style={getCelebrationGridStyle(tier)}>
            {output.items.map((item) => (
              <CelebrationTile key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
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

  // State 1: Loading
  if (isLoading) {
    return <HomepageLoadingState label="Loading people and culture" />;
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

  // State 2: No data configured — authoring guidance
  if (allEmpty && !hadInput) {
    const message = resolveAuthoringMessage('peopleCulture', 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  // State 3: Data configured but all filtered/invalid — invalid guidance
  if (allEmpty && hadInput) {
    const message = resolveAuthoringMessage('peopleCulture', 'invalid');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  // State 4: Normal render — at least one region has content
  return (
    <HbcHomepageSectionShell
      title={output.heading}
      subtitle="Birthdays, anniversaries, recognition, milestones, and team news"
      headerAction={<HbcPremiumCta label="View all" href="#people-culture" variant="ghost" arrow />}
    >
      <div
        style={getShellStyle(tier)}
        data-hbc-homepage="people-culture-merged"
        data-hbc-authoring-safe="true"
      >
        <BandARegion output={output.bandA} tier={tier} />
        <KudosRegion output={output.kudos} tier={tier} />
        <BandBRegion output={output.bandB} tier={tier} />
      </div>
    </HbcHomepageSectionShell>
  );
}
