import * as React from 'react';
import { HbcCard, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import { normalizeProjectPortfolioSpotlightConfig } from '../../homepage/helpers/operationalAwarenessConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import { HomepageOperationalAwarenessCluster } from '../../homepage/shared/HomepageOperationalAwarenessCluster.js';
import type { ProjectPortfolioSpotlightConfig } from '../../homepage/webparts/operationalAwarenessContracts.js';

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
    return (
      <HomepageEmptyState
        title="No project spotlight items configured"
        description="Add featured or secondary project spotlight items in the property pane to publish this section."
      />
    );
  }

  return (
    <HbcCard>
      <HomepageOperationalAwarenessCluster
        heading={normalized.heading}
        featured={
          normalized.featured ? (
            <article>
              <h3 style={{ margin: 0 }}>{normalized.featured.title}</h3>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {normalized.featured.strategicEmphasis ? <HbcStatusBadge label="Strategic" variant="critical" /> : null}
                {normalized.featured.status ? (
                  <HbcStatusBadge
                    label={normalized.featured.status.label}
                    variant={normalized.featured.status.variant ?? 'info'}
                  />
                ) : null}
                {normalized.featured.isStale ? <HbcStatusBadge label="Stale" variant="warning" /> : null}
              </div>
              <p style={{ margin: '8px 0 0' }}>{normalized.featured.summary}</p>
              {normalized.featured.milestones.length > 0 ? (
                <ul style={{ margin: '8px 0 0', paddingInlineStart: 18 }}>
                  {normalized.featured.milestones.map((milestone) => (
                    <li key={milestone.id}>
                      {milestone.title}
                      {milestone.completed ? ' (Completed)' : ''}
                    </li>
                  ))}
                </ul>
              ) : null}
              {normalized.featured.freshnessLabel ? (
                <p style={{ margin: '8px 0 0', opacity: 0.75 }}>{normalized.featured.freshnessLabel}</p>
              ) : null}
              {normalized.featured.cta ? <a href={normalized.featured.cta.href}>{normalized.featured.cta.label}</a> : null}
            </article>
          ) : undefined
        }
        secondary={normalized.secondary.map((item) => (
          <article key={item.id}>
            <h3 style={{ margin: 0 }}>{item.title}</h3>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {item.status ? <HbcStatusBadge label={item.status.label} variant={item.status.variant ?? 'info'} /> : null}
              {item.isStale ? <HbcStatusBadge label="Stale" variant="warning" /> : null}
            </div>
            <p style={{ margin: '8px 0 0' }}>{item.summary}</p>
            {item.freshnessLabel ? <p style={{ margin: '8px 0 0', opacity: 0.75 }}>{item.freshnessLabel}</p> : null}
            {item.cta ? <a href={item.cta.href}>{item.cta.label}</a> : null}
          </article>
        ))}
      />
    </HbcCard>
  );
}
