import * as React from 'react';
import { HbcCard } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeLeadershipMessageConfig } from '../../homepage/helpers/communicationsConfig.js';
import { HomepageCuratedContentCluster } from '../../homepage/shared/HomepageCuratedContentCluster.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { LeadershipMessageConfig } from '../../homepage/webparts/communicationsContracts.js';
import { hpHeadingReset, hpContentParagraph, hpFeaturedImage, hpLeaderAttribution, hpCtaLink, hpMediaContainer } from '../../homepage/tokens.js';
import styles from '../../homepage/homepage-interactive.module.css';

export interface LeadershipMessageProps {
  config?: Partial<LeadershipMessageConfig>;
  isLoading?: boolean;
}

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
    <HbcCard>
      <HomepageCuratedContentCluster
        heading={normalized.heading}
        featured={
          normalized.featured ? (
            <article>
              <h3 style={hpHeadingReset}>{normalized.featured.title}</h3>
              <p style={hpContentParagraph}>{normalized.featured.message}</p>
              <p style={hpLeaderAttribution}>
                {normalized.featured.leaderName}
                {normalized.featured.leaderRole ? `, ${normalized.featured.leaderRole}` : ''}
              </p>
              {normalized.featured.media ? (
                <div style={hpMediaContainer}>
                  <img
                    alt={normalized.featured.media.alt}
                    src={normalized.featured.media.src}
                    style={hpFeaturedImage}
                  />
                </div>
              ) : null}
              {normalized.featured.cta ? <a href={normalized.featured.cta.href} className={styles.ctaLink} style={hpCtaLink}>{normalized.featured.cta.label} →</a> : null}
            </article>
          ) : undefined
        }
        secondary={normalized.secondary.map((entry) => (
          <article key={entry.id}>
            <h3 style={hpHeadingReset}>{entry.title}</h3>
            <p style={hpContentParagraph}>{entry.message}</p>
            <p style={hpContentParagraph}>{entry.leaderName}</p>
          </article>
        ))}
      />
    </HbcCard>
  );
}
