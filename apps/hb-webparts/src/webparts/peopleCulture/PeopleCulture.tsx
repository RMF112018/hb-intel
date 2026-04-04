import * as React from 'react';
import { HbcCard, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import { normalizePeopleCultureConfig } from '../../homepage/helpers/communicationsConfig.js';
import { HomepageCuratedContentCluster } from '../../homepage/shared/HomepageCuratedContentCluster.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { PeopleCultureConfig } from '../../homepage/webparts/communicationsContracts.js';

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
    return (
      <HomepageEmptyState
        title="No people and culture moments configured"
        description="Add people/culture entries in the property pane to show welcomes, milestones, and recognition."
      />
    );
  }

  return (
    <HbcCard>
      <HomepageCuratedContentCluster
        heading={normalized.heading}
        featured={
          normalized.featured ? (
            <article>
              <h3 style={{ margin: 0 }}>{normalized.featured.personName}</h3>
              <HbcStatusBadge label={normalized.featured.eventType} variant={EVENT_VARIANT_MAP[normalized.featured.eventType]} />
              <p style={{ margin: '8px 0 0' }}>{normalized.featured.highlight}</p>
              {normalized.featured.media ? (
                <img
                  alt={normalized.featured.media.alt}
                  src={normalized.featured.media.src}
                  style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 6 }}
                />
              ) : null}
              {normalized.featured.cta ? <a href={normalized.featured.cta.href}>{normalized.featured.cta.label}</a> : null}
            </article>
          ) : undefined
        }
        secondary={normalized.secondary.map((entry) => (
          <article key={entry.id}>
            <h3 style={{ margin: 0 }}>{entry.personName}</h3>
            <HbcStatusBadge label={entry.eventType} variant={EVENT_VARIANT_MAP[entry.eventType]} />
            <p style={{ margin: '8px 0 0' }}>{entry.highlight}</p>
          </article>
        ))}
      />
    </HbcCard>
  );
}
