/**
 * PeopleCulture — Warm celebratory recognition surface
 * Phase 15-07 — Editorial communications redesign
 *
 * People recognition with warmth and celebration energy. Visually
 * distinct from the formal editorial (CompanyPulse) and executive
 * (LeadershipMessage) modules. Uses warm-tinted containers, larger
 * person names, and celebratory event badges to humanize the
 * communications zone.
 */
import * as React from 'react';
import { HbcHomepageCta, HbcHomepageMetadataRow, HbcStatusBadge, HbcHomepageEyebrow } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizePeopleCultureConfig } from '../../homepage/helpers/communicationsConfig.js';
import { HomepageCuratedContentCluster } from '../../homepage/shared/HomepageCuratedContentCluster.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { PeopleCultureConfig } from '../../homepage/webparts/communicationsContracts.js';
import { HP_SPACE, hpCompactImage, hpMediaContainer } from '../../homepage/tokens.js';

export interface PeopleCultureProps {
  config?: Partial<PeopleCultureConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

const EVENT_VARIANT_MAP = {
  newHire: 'info',
  anniversary: 'success',
  promotion: 'critical',
  recognition: 'warning',
} as const;

/** Event label for the eyebrow */
const EVENT_LABEL_MAP: Record<string, string> = {
  newHire: 'Welcome',
  anniversary: 'Milestone',
  promotion: 'Congratulations',
  recognition: 'Recognition',
};

/** Featured person name — celebratory, warm, larger */
const featuredNameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 700,
  lineHeight: 1.3,
  color: 'rgb(180, 90, 40)',
};

/** Featured highlight — warm, personal tone */
const featuredHighlightStyle: React.CSSProperties = {
  margin: `${HP_SPACE.md}px 0 0`,
  fontSize: '0.9375rem',
  lineHeight: 1.6,
  maxWidth: '50ch',
  color: 'rgba(0, 0, 0, 0.70)',
};

/** Secondary person name — warm accent */
const secondaryNameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9375rem',
  fontWeight: 700,
  color: 'rgb(180, 90, 40)',
};

/** Secondary highlight — compact */
const secondaryHighlightStyle: React.CSSProperties = {
  margin: `${HP_SPACE.sm}px 0 0`,
  fontSize: '0.875rem',
  lineHeight: 1.5,
  color: 'rgba(0, 0, 0, 0.60)',
};

export function PeopleCulture({ config, activeAudience, isLoading = false }: PeopleCultureProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading people and culture" />;
  }

  const normalized = normalizePeopleCultureConfig(config, activeAudience);

  if (!normalized.featured && normalized.secondary.length === 0) {
    const message = resolveAuthoringMessage('peopleCulture', config?.entries?.length ? 'invalid' : 'noData');
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
      variant="celebration"
      featured={
        normalized.featured ? (
          <article>
            <HbcHomepageEyebrow tone="default">
              {EVENT_LABEL_MAP[normalized.featured.eventType] ?? 'People'}
            </HbcHomepageEyebrow>
            <h3 style={featuredNameStyle}>{normalized.featured.personName}</h3>
            <HbcHomepageMetadataRow>
              <HbcStatusBadge label={normalized.featured.eventType} variant={EVENT_VARIANT_MAP[normalized.featured.eventType]} />
            </HbcHomepageMetadataRow>
            <p style={featuredHighlightStyle}>{normalized.featured.highlight}</p>
            {normalized.featured.media ? (
              <div style={{ ...hpMediaContainer, marginTop: HP_SPACE.xl }}>
                <img
                  alt={normalized.featured.media.alt}
                  src={normalized.featured.media.src}
                  style={hpCompactImage}
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
          <h3 style={secondaryNameStyle}>{entry.personName}</h3>
          <HbcHomepageMetadataRow>
            <HbcStatusBadge label={entry.eventType} variant={EVENT_VARIANT_MAP[entry.eventType]} />
          </HbcHomepageMetadataRow>
          <p style={secondaryHighlightStyle}>{entry.highlight}</p>
        </article>
      ))}
    />
  );
}
