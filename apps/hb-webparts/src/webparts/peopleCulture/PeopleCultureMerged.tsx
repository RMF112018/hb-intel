/**
 * PeopleCultureMerged — Three-region People & Culture desktop shell
 *
 * Phase 3: Desktop composition skeleton with four-part structure.
 * Phase 4: Band A editorial announcement grid with medium-format cards.
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

// ---------------------------------------------------------------------------
// Shared styles — shell
// ---------------------------------------------------------------------------

const shellStyle: React.CSSProperties = {
  ...hpZoneSection('communications'),
  display: 'flex',
  flexDirection: 'column',
  gap: HP_SPACE['3xl'],
};

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

const bandARegionStyle: React.CSSProperties = {
  padding: HP_SPACE['2xl'],
  border: HP_BORDER.subtle,
  borderRadius: HP_RADIUS.editorial,
};

const bandAHeaderStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9375rem',
  fontWeight: 600,
  letterSpacing: '0.01em',
};

const announcementGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: HP_SPACE.xl,
  marginTop: HP_SPACE.xl,
};

const announcementCardStyle: React.CSSProperties = {
  padding: HP_SPACE['2xl'],
  border: HP_BORDER.standard,
  borderRadius: HP_RADIUS.editorial,
  display: 'flex',
  flexDirection: 'column',
  gap: HP_SPACE.sm,
};

const announcementCardImageStyle: React.CSSProperties = {
  width: '100%',
  maxHeight: 160,
  objectFit: 'cover' as const,
  borderRadius: HP_RADIUS.image,
  display: 'block',
};

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

const kudosRegionStyle: React.CSSProperties = {
  padding: HP_SPACE['2xl'],
  border: HP_BORDER.warmAccent,
  borderRadius: HP_RADIUS.editorial,
};

const kudosHeaderRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: HP_SPACE.md,
  flexWrap: 'wrap',
};

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

const kudosFeaturedStyle: React.CSSProperties = {
  marginTop: HP_SPACE.xl,
  padding: HP_SPACE['2xl'],
  border: HP_BORDER.standard,
  borderRadius: HP_RADIUS.editorial,
  background: 'rgba(229,126,70,0.02)',
};

const kudosHeadlineStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: HP_SPACE.md,
  padding: `${HP_SPACE.sm}px 0`,
};

const kudosEmptyStyle: React.CSSProperties = {
  marginTop: HP_SPACE.xl,
  padding: `${HP_SPACE['3xl']}px ${HP_SPACE['2xl']}px`,
  textAlign: 'center',
  opacity: HP_TEXT_OPACITY.secondary,
  fontSize: '0.875rem',
  lineHeight: 1.5,
};

// ---------------------------------------------------------------------------
// Band B styles — compact weekly layer (lightest, densest)
// ---------------------------------------------------------------------------

const bandBRegionStyle: React.CSSProperties = {
  padding: `${HP_SPACE.xl}px ${HP_SPACE['2xl']}px`,
  border: HP_BORDER.subtle,
  borderRadius: HP_RADIUS.card,
};

const bandBHeaderStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.8125rem',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  opacity: HP_TEXT_OPACITY.muted,
};

const celebrationGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: HP_SPACE.lg,
  marginTop: HP_SPACE.xl,
};

const celebrationTileStyle: React.CSSProperties = {
  padding: HP_SPACE.lg,
  border: HP_BORDER.subtle,
  borderRadius: HP_RADIUS.card,
  textAlign: 'center' as const,
  fontSize: '0.8125rem',
  lineHeight: 1.4,
};

const bandBEmptyStyle: React.CSSProperties = {
  marginTop: HP_SPACE.md,
  fontSize: '0.8125rem',
  opacity: HP_TEXT_OPACITY.secondary,
};

// ---------------------------------------------------------------------------
// Region components
// ---------------------------------------------------------------------------

function BandARegion({ output }: { output: BandAOutput }): React.JSX.Element | null {
  if (output.isEmpty) return null;

  return (
    <section aria-label="Announcements" data-hbc-homepage="band-a">
      <div style={bandARegionStyle}>
        <h3 style={bandAHeaderStyle}>
          <Users size={ICON_SIZE} style={{ marginRight: HP_SPACE.md, verticalAlign: 'text-bottom' }} />
          Highlights
        </h3>
        <div style={announcementGridStyle}>
          {output.items.map((item) => (
            <div key={item.id} style={announcementCardStyle}>
              {item.media && (
                <img
                  src={item.media.src}
                  alt={item.media.alt}
                  style={announcementCardImageStyle}
                />
              )}
              <HbcPremiumBadge
                label={ANNOUNCEMENT_LABEL_MAP[item.announcementType] ?? item.announcementType}
                status={ANNOUNCEMENT_BADGE_MAP[item.announcementType] ?? 'info'}
                size="sm"
              />
              <div style={announcementCardNameStyle}>{item.personName}</div>
              <div style={announcementCardHeadlineStyle}>{item.headline}</div>
              <p style={announcementCardSummaryStyle}>{item.summary}</p>
              {item.cta && (
                <div style={{ marginTop: HP_SPACE.xs }}>
                  <HbcPremiumCta label={item.cta.label} href={item.cta.href} variant="ghost" arrow />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function KudosRegion({ output }: { output: KudosModuleOutput }): React.JSX.Element {
  return (
    <section aria-label="Kudos recognition" data-hbc-homepage="kudos-module">
      <div style={kudosRegionStyle}>
        <div style={kudosHeaderRowStyle}>
          <h3 style={kudosHeaderStyle}>
            <CheckCircle2 size={ICON_SIZE} style={{ marginRight: HP_SPACE.md, verticalAlign: 'text-bottom' }} />
            Kudos
          </h3>
          <HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="ghost" arrow />
        </div>
        <p style={kudosDescriptionStyle}>
          Recognize great work, celebrate teammates, and spotlight wins across the company
        </p>

        {output.isEmpty ? (
          <div role="status" aria-live="polite" style={kudosEmptyStyle}>
            No Kudos yet — be the first to recognize a teammate.
          </div>
        ) : (
          <>
            {output.featured && (
              <div style={kudosFeaturedStyle}>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.4 }}>
                  {output.featured.headline}
                </div>
                <div style={{ marginTop: HP_SPACE.sm, fontSize: '0.8125rem', opacity: HP_TEXT_OPACITY.secondary, lineHeight: 1.5 }}>
                  {output.featured.excerpt}
                </div>
                <div style={{ marginTop: HP_SPACE.md, fontSize: '0.75rem', opacity: HP_TEXT_OPACITY.secondary }}>
                  by {output.featured.submittedBy.displayName}
                  {output.featured.celebrateCount ? ` · ${output.featured.celebrateCount} celebrate` : ''}
                </div>
              </div>
            )}

            {output.recentHeadlines.length > 0 && (
              <>
                <Separator decorative style={{ margin: `${HP_SPACE.xl}px 0` }} />
                <div>
                  {output.recentHeadlines.map((item) => (
                    <div key={item.id} style={kudosHeadlineStyle}>
                      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.headline}</span>
                      <span style={{ fontSize: '0.75rem', opacity: HP_TEXT_OPACITY.secondary, whiteSpace: 'nowrap' }}>
                        by {item.submittedBy.displayName}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function BandBRegion({ output }: { output: BandBOutput }): React.JSX.Element {
  return (
    <section aria-label="This week celebrations" data-hbc-homepage="band-b">
      <div style={bandBRegionStyle}>
        <h3 style={bandBHeaderStyle}>
          <Calendar size={ICON_SIZE - 2} style={{ marginRight: HP_SPACE.sm, verticalAlign: 'text-bottom' }} />
          This Week
        </h3>

        {output.isEmpty ? (
          <div role="status" aria-live="polite" style={bandBEmptyStyle}>
            No upcoming celebrations this week.
          </div>
        ) : (
          <div style={celebrationGridStyle}>
            {output.items.map((item) => (
              <div key={item.id} style={celebrationTileStyle}>
                <div style={{ fontWeight: 500 }}>{item.personName}</div>
                <div style={{ marginTop: HP_SPACE.xs, opacity: HP_TEXT_OPACITY.secondary }}>
                  {item.celebrationType === 'anniversary' && item.anniversaryYears
                    ? `${item.anniversaryYears} yr anniversary`
                    : item.celebrationType}
                </div>
              </div>
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

export function PeopleCultureMerged({
  config,
  activeAudience,
  isLoading = false,
}: PeopleCultureMergedProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading people and culture" />;
  }

  const output = normalizePeopleCultureMergedConfig(config, activeAudience);

  const allEmpty = output.bandA.isEmpty && output.kudos.isEmpty && output.bandB.isEmpty;

  if (allEmpty && (!config?.announcements?.length && !config?.kudos?.length && !config?.celebrations?.length)) {
    const message = resolveAuthoringMessage('peopleCulture', 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  return (
    <HbcHomepageSectionShell title={output.heading} subtitle="Birthdays, anniversaries, recognition, milestones, and team news">
      <div style={shellStyle} data-hbc-homepage="people-culture-merged">
        <BandARegion output={output.bandA} />
        <KudosRegion output={output.kudos} />
        <BandBRegion output={output.bandB} />
      </div>
    </HbcHomepageSectionShell>
  );
}
