import * as React from 'react';
import { HbcHomepageSurfaceCard, HbcHomepageCta, HbcHomepageMetadataRow, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizePeopleCultureConfig } from '../../homepage/helpers/communicationsConfig.js';
import { HomepageCuratedContentCluster } from '../../homepage/shared/HomepageCuratedContentCluster.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { PeopleCultureConfig } from '../../homepage/webparts/communicationsContracts.js';
import { hpHeadingReset, hpContentParagraph, hpCompactImage, hpMediaContainer } from '../../homepage/tokens.js';

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
    <HbcHomepageSurfaceCard surface="editorial">
      <HomepageCuratedContentCluster
        heading={normalized.heading}
        featured={
          normalized.featured ? (
            <article>
              <h3 style={hpHeadingReset}>{normalized.featured.personName}</h3>
              <HbcHomepageMetadataRow>
                <HbcStatusBadge label={normalized.featured.eventType} variant={EVENT_VARIANT_MAP[normalized.featured.eventType]} />
              </HbcHomepageMetadataRow>
              <p style={hpContentParagraph}>{normalized.featured.highlight}</p>
              {normalized.featured.media ? (
                <div style={hpMediaContainer}>
                  <img
                    alt={normalized.featured.media.alt}
                    src={normalized.featured.media.src}
                    style={hpCompactImage}
                  />
                </div>
              ) : null}
              {normalized.featured.cta ? (
                <HbcHomepageCta label={normalized.featured.cta.label} href={normalized.featured.cta.href} variant="link" arrow />
              ) : null}
            </article>
          ) : undefined
        }
        secondary={normalized.secondary.map((entry) => (
          <article key={entry.id}>
            <h3 style={hpHeadingReset}>{entry.personName}</h3>
            <HbcHomepageMetadataRow>
              <HbcStatusBadge label={entry.eventType} variant={EVENT_VARIANT_MAP[entry.eventType]} />
            </HbcHomepageMetadataRow>
            <p style={hpContentParagraph}>{entry.highlight}</p>
          </article>
        ))}
      />
    </HbcHomepageSurfaceCard>
  );
}
