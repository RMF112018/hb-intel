import * as React from 'react';
import { HbcHomepageSurfaceCard, HbcHomepageCta, HbcHomepageMetadataRow, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeProjectPortfolioSpotlightConfig } from '../../homepage/helpers/operationalAwarenessConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import { HomepageOperationalAwarenessCluster } from '../../homepage/shared/HomepageOperationalAwarenessCluster.js';
import type { ProjectPortfolioSpotlightConfig } from '../../homepage/webparts/operationalAwarenessContracts.js';
import { hpHeadingReset, hpContentParagraph, hpSecondaryText, hpListStyle } from '../../homepage/tokens.js';

export interface ProjectPortfolioSpotlightProps {
  config?: Partial<ProjectPortfolioSpotlightConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

export function ProjectPortfolioSpotlight({
  config,
  activeAudience,
  isLoading = false,
}: ProjectPortfolioSpotlightProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading project and portfolio spotlight" />;
  }

  const normalized = normalizeProjectPortfolioSpotlightConfig(config, activeAudience);

  if (!normalized.featured && normalized.secondary.length === 0) {
    const message = resolveAuthoringMessage('projectPortfolioSpotlight', config?.items?.length ? 'invalid' : 'noData');
    return (
      <HomepageEmptyState
        title={message.title}
        description={message.description}
      />
    );
  }

  return (
    <HbcHomepageSurfaceCard surface="operational">
      <HomepageOperationalAwarenessCluster
        heading={normalized.heading}
        featured={
          normalized.featured ? (
            <article>
              <h3 style={hpHeadingReset}>{normalized.featured.title}</h3>
              <HbcHomepageMetadataRow>
                {normalized.featured.strategicEmphasis ? <HbcStatusBadge label="Strategic" variant="critical" /> : null}
                {normalized.featured.status ? (
                  <HbcStatusBadge
                    label={normalized.featured.status.label}
                    variant={normalized.featured.status.variant ?? 'info'}
                  />
                ) : null}
                {normalized.featured.isStale ? <HbcStatusBadge label="Stale" variant="warning" /> : null}
              </HbcHomepageMetadataRow>
              <p style={hpContentParagraph}>{normalized.featured.summary}</p>
              {normalized.featured.milestones.length > 0 ? (
                <ul style={hpListStyle}>
                  {normalized.featured.milestones.map((milestone) => (
                    <li key={milestone.id}>
                      {milestone.title}
                      {milestone.completed ? ' (Completed)' : ''}
                    </li>
                  ))}
                </ul>
              ) : null}
              {normalized.featured.freshnessLabel ? (
                <p style={hpSecondaryText}>{normalized.featured.freshnessLabel}</p>
              ) : null}
              {normalized.featured.cta ? (
                <HbcHomepageCta label={normalized.featured.cta.label} href={normalized.featured.cta.href} variant="link" arrow />
              ) : null}
            </article>
          ) : undefined
        }
        secondary={normalized.secondary.map((item) => (
          <article key={item.id}>
            <h3 style={hpHeadingReset}>{item.title}</h3>
            <HbcHomepageMetadataRow>
              {item.status ? <HbcStatusBadge label={item.status.label} variant={item.status.variant ?? 'info'} /> : null}
              {item.isStale ? <HbcStatusBadge label="Stale" variant="warning" /> : null}
            </HbcHomepageMetadataRow>
            <p style={hpContentParagraph}>{item.summary}</p>
            {item.freshnessLabel ? <p style={hpSecondaryText}>{item.freshnessLabel}</p> : null}
            {item.cta ? (
              <HbcHomepageCta label={item.cta.label} href={item.cta.href} variant="link" arrow />
            ) : null}
          </article>
        ))}
      />
    </HbcHomepageSurfaceCard>
  );
}
