/**
 * LeadershipMessage — Premium executive communication channel
 * Phase 15-07 — Editorial communications redesign
 *
 * Executive messages with gravitas and intentional authored voice.
 * Featured messages use brand-accented containers with quote-like
 * presentation, strong attribution, and formal tone. Visually distinct
 * from the news-digest style of CompanyPulse.
 */
import * as React from 'react';
import { HbcHomepageCta, HbcHomepageEyebrow } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeLeadershipMessageConfig } from '../../homepage/helpers/communicationsConfig.js';
import { HomepageCuratedContentCluster } from '../../homepage/shared/HomepageCuratedContentCluster.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { LeadershipMessageConfig } from '../../homepage/webparts/communicationsContracts.js';
import { HP_SPACE, hpFeaturedImage, hpMediaContainer } from '../../homepage/tokens.js';

export interface LeadershipMessageProps {
  config?: Partial<LeadershipMessageConfig>;
  isLoading?: boolean;
}

/** Featured headline — formal, authoritative */
const featuredHeadlineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.125rem',
  fontWeight: 700,
  lineHeight: 1.3,
  letterSpacing: '-0.01em',
  color: 'rgb(34, 83, 145)',
};

/** Featured message — quote-like presentation with left padding */
const featuredMessageStyle: React.CSSProperties = {
  margin: `${HP_SPACE.xl}px 0 0`,
  fontSize: '0.9375rem',
  lineHeight: 1.7,
  maxWidth: '58ch',
  color: 'rgba(0, 0, 0, 0.75)',
  fontStyle: 'italic' as const,
};

/** Attribution — leader name and role with formal treatment */
const attributionStyle: React.CSSProperties = {
  margin: `${HP_SPACE.xl}px 0 0`,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 2,
};

const leaderNameStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 700,
  color: '#323130',
};

const leaderRoleStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 400,
  color: 'rgba(0, 0, 0, 0.55)',
};

/** Secondary leader name */
const secondaryNameStyle: React.CSSProperties = {
  margin: `${HP_SPACE.md}px 0 0`,
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'rgba(34, 83, 145, 0.8)',
};

/** Secondary message — compact */
const secondaryMessageStyle: React.CSSProperties = {
  margin: `${HP_SPACE.sm}px 0 0`,
  fontSize: '0.875rem',
  lineHeight: 1.5,
  color: 'rgba(0, 0, 0, 0.65)',
};

export function LeadershipMessage({ config, isLoading = false }: LeadershipMessageProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading leadership message" />;
  }

  const normalized = normalizeLeadershipMessageConfig(config);

  if (!normalized.featured && normalized.secondary.length === 0) {
    const message = resolveAuthoringMessage('leadershipMessage', config?.entries?.length ? 'invalid' : 'noData');
    return (
      <HomepageEmptyState
        title={message.title}
        description={message.description}
      />
    );
  }

  return (
    <HomepageCuratedContentCluster
      heading={normalized.heading}
      variant="executive"
      featured={
        normalized.featured ? (
          <article>
            <HbcHomepageEyebrow tone="default">From Leadership</HbcHomepageEyebrow>
            <h3 style={featuredHeadlineStyle}>{normalized.featured.title}</h3>
            <p style={featuredMessageStyle}>{normalized.featured.message}</p>
            <div style={attributionStyle}>
              <span style={leaderNameStyle}>{normalized.featured.leaderName}</span>
              {normalized.featured.leaderRole ? (
                <span style={leaderRoleStyle}>{normalized.featured.leaderRole}</span>
              ) : null}
            </div>
            {normalized.featured.media ? (
              <div style={{ ...hpMediaContainer, marginTop: HP_SPACE.xl }}>
                <img
                  alt={normalized.featured.media.alt}
                  src={normalized.featured.media.src}
                  style={hpFeaturedImage}
                />
              </div>
            ) : null}
            {normalized.featured.cta ? (
              <div style={{ marginTop: HP_SPACE.xl }}>
                <HbcHomepageCta label={normalized.featured.cta.label} href={normalized.featured.cta.href} variant="link" arrow />
              </div>
            ) : null}
          </article>
        ) : undefined
      }
      secondary={normalized.secondary.map((entry) => (
        <article key={entry.id}>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>{entry.title}</h3>
          <p style={secondaryMessageStyle}>{entry.message}</p>
          <p style={secondaryNameStyle}>{entry.leaderName}</p>
        </article>
      ))}
    />
  );
}
