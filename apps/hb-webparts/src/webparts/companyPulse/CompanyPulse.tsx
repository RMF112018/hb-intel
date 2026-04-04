import * as React from 'react';
import { HbcCard, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeCompanyPulseConfig } from '../../homepage/helpers/communicationsConfig.js';
import { HomepageCuratedContentCluster } from '../../homepage/shared/HomepageCuratedContentCluster.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { CompanyPulseConfig } from '../../homepage/webparts/communicationsContracts.js';

export interface CompanyPulseProps {
  config?: Partial<CompanyPulseConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

const CATEGORY_VARIANT_MAP = {
  update: 'info',
  safety: 'warning',
  recognition: 'success',
  milestone: 'critical',
} as const;

export function CompanyPulse({ config, activeAudience, isLoading = false }: CompanyPulseProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading company pulse" />;
  }

  const normalized = normalizeCompanyPulseConfig(config, activeAudience);

  if (!normalized.featured && normalized.secondary.length === 0) {
    const message = resolveAuthoringMessage('companyPulse', config?.items?.length ? 'invalid' : 'noData');
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
              <h3 style={{ margin: 0 }}>{normalized.featured.title}</h3>
              {normalized.featured.category ? (
                <HbcStatusBadge
                  label={normalized.featured.category}
                  variant={CATEGORY_VARIANT_MAP[normalized.featured.category]}
                />
              ) : null}
              <p style={{ margin: '8px 0 0' }}>{normalized.featured.summary}</p>
              {normalized.featured.metadata ? <p style={{ margin: '8px 0 0', opacity: 0.75 }}>{normalized.featured.metadata}</p> : null}
              {normalized.featured.cta ? <a href={normalized.featured.cta.href}>{normalized.featured.cta.label}</a> : null}
            </article>
          ) : undefined
        }
        secondary={normalized.secondary.map((item) => (
          <article key={item.id}>
            <h3 style={{ margin: 0 }}>{item.title}</h3>
            <p style={{ margin: '8px 0 0' }}>{item.summary}</p>
            {item.cta ? <a href={item.cta.href}>{item.cta.label}</a> : null}
          </article>
        ))}
      />
    </HbcCard>
  );
}
