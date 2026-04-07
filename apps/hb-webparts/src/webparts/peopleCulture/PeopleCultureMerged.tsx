/**
 * PeopleCultureMerged — Three-region People & Culture desktop shell
 * Phase 3 — Desktop Composition Skeleton
 *
 * Structural shell with header, Band A (announcements), Kudos Module,
 * and Band B (weekly celebrations). Each region renders independently
 * with its own empty/populated state. Detailed region UIs are built
 * in Phases 4–7.
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
// Shared styles
// ---------------------------------------------------------------------------

const shellStyle: React.CSSProperties = {
  ...hpZoneSection('communications'),
  display: 'flex',
  flexDirection: 'column',
  gap: HP_SPACE['2xl'],
};

const regionStyle: React.CSSProperties = {
  padding: HP_SPACE['2xl'],
  border: HP_BORDER.subtle,
  borderRadius: HP_RADIUS.card,
};

const regionHeaderStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9375rem',
  fontWeight: 600,
};

const regionMetaStyle: React.CSSProperties = {
  margin: `${HP_SPACE.xs}px 0 0`,
  fontSize: '0.8125rem',
  opacity: HP_TEXT_OPACITY.secondary,
};

const itemRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
  padding: `${HP_SPACE.sm}px 0`,
};

const celebrationGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: HP_SPACE.md,
  marginTop: HP_SPACE.md,
};

const celebrationTileStyle: React.CSSProperties = {
  padding: HP_SPACE.lg,
  border: HP_BORDER.subtle,
  borderRadius: HP_RADIUS.card,
  textAlign: 'center' as const,
  fontSize: '0.8125rem',
};

// ---------------------------------------------------------------------------
// Region components
// ---------------------------------------------------------------------------

function BandARegion({ output }: { output: BandAOutput }): React.JSX.Element | null {
  if (output.isEmpty) return null;

  return (
    <section aria-label="Announcements" data-hbc-homepage="band-a">
      <div style={regionStyle}>
        <h3 style={regionHeaderStyle}>
          <Users size={14} style={{ marginRight: HP_SPACE.sm, verticalAlign: 'text-bottom' }} />
          Highlights
        </h3>
        <div style={{ marginTop: HP_SPACE.md }}>
          {output.items.map((item) => (
            <div key={item.id} style={itemRowStyle}>
              <HbcPremiumBadge label={item.announcementType} status="info" size="sm" />
              <span style={{ fontWeight: 500 }}>{item.personName}</span>
              <span style={{ opacity: HP_TEXT_OPACITY.secondary, fontSize: '0.8125rem' }}>
                {item.headline}
              </span>
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
      <div style={regionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={regionHeaderStyle}>
            <CheckCircle2 size={14} style={{ marginRight: HP_SPACE.sm, verticalAlign: 'text-bottom' }} />
            Kudos
          </h3>
          <HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="ghost" arrow />
        </div>
        <p style={regionMetaStyle}>
          Recognize great work, celebrate teammates, and spotlight wins across the company
        </p>

        {output.isEmpty ? (
          <div
            role="status"
            aria-live="polite"
            style={{ marginTop: HP_SPACE.md, padding: HP_SPACE['2xl'], textAlign: 'center', opacity: HP_TEXT_OPACITY.secondary, fontSize: '0.875rem' }}
          >
            No Kudos yet — be the first to recognize a teammate.
          </div>
        ) : (
          <>
            {output.featured && (
              <div style={{ marginTop: HP_SPACE.md, padding: HP_SPACE.lg, border: HP_BORDER.standard, borderRadius: HP_RADIUS.editorial }}>
                <div style={{ fontWeight: 600 }}>{output.featured.headline}</div>
                <div style={{ marginTop: HP_SPACE.xs, fontSize: '0.8125rem', opacity: HP_TEXT_OPACITY.secondary }}>
                  {output.featured.excerpt}
                </div>
                <div style={{ marginTop: HP_SPACE.sm, fontSize: '0.75rem', opacity: HP_TEXT_OPACITY.secondary }}>
                  by {output.featured.submittedBy.displayName}
                  {output.featured.celebrateCount ? ` · ${output.featured.celebrateCount} celebrate` : ''}
                </div>
              </div>
            )}

            {output.recentHeadlines.length > 0 && (
              <>
                <Separator decorative style={{ margin: `${HP_SPACE.md}px 0` }} />
                <div>
                  {output.recentHeadlines.map((item) => (
                    <div key={item.id} style={itemRowStyle}>
                      <span style={{ fontWeight: 500 }}>{item.headline}</span>
                      <span style={{ fontSize: '0.75rem', opacity: HP_TEXT_OPACITY.secondary }}>
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
      <div style={regionStyle}>
        <h3 style={regionHeaderStyle}>
          <Calendar size={14} style={{ marginRight: HP_SPACE.sm, verticalAlign: 'text-bottom' }} />
          This Week
        </h3>

        {output.isEmpty ? (
          <div
            role="status"
            aria-live="polite"
            style={{ marginTop: HP_SPACE.md, fontSize: '0.8125rem', opacity: HP_TEXT_OPACITY.secondary }}
          >
            No upcoming celebrations this week.
          </div>
        ) : (
          <div style={celebrationGridStyle}>
            {output.items.map((item) => (
              <div key={item.id} style={celebrationTileStyle}>
                <div style={{ fontWeight: 500 }}>{item.personName}</div>
                <div style={{ marginTop: HP_SPACE.xs, opacity: HP_TEXT_OPACITY.secondary }}>
                  {item.celebrationType === 'birthday' ? '🎂' : '🎉'}{' '}
                  {item.celebrationType === 'anniversary' && item.anniversaryYears
                    ? `${item.anniversaryYears} yr`
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
