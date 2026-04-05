import * as React from 'react';
import { HbcHomepageSurfaceCard, HbcHomepageCta, HbcHomepageMetadataRow, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeCompanyPulseConfig } from '../../homepage/helpers/communicationsConfig.js';
import { HomepageCuratedContentCluster } from '../../homepage/shared/HomepageCuratedContentCluster.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { CompanyPulseConfig } from '../../homepage/webparts/communicationsContracts.js';
import { hpHeadingReset, hpContentParagraph, hpSecondaryText } from '../../homepage/tokens.js';

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
    <HbcHomepageSurfaceCard surface="editorial">
      <HomepageCuratedContentCluster
        heading={normalized.heading}
        featured={
          normalized.featured ? (
            <article>
              <h3 style={hpHeadingReset}>{normalized.featured.title}</h3>
              {normalized.featured.category ? (
                <HbcHomepageMetadataRow>
                  <HbcStatusBadge
                    label={normalized.featured.category}
                    variant={CATEGORY_VARIANT_MAP[normalized.featured.category]}
                  />
                </HbcHomepageMetadataRow>
              ) : null}
              <p style={hpContentParagraph}>{normalized.featured.summary}</p>
              {normalized.featured.metadata ? <p style={hpSecondaryText}>{normalized.featured.metadata}</p> : null}
              {normalized.featured.cta ? (
                <HbcHomepageCta label={normalized.featured.cta.label} href={normalized.featured.cta.href} variant="link" arrow />
              ) : null}
            </article>
          ) : undefined
        }
        secondary={normalized.secondary.map((item) => (
          <article key={item.id}>
            <h3 style={hpHeadingReset}>{item.title}</h3>
            <p style={hpContentParagraph}>{item.summary}</p>
            {item.cta ? (
              <HbcHomepageCta label={item.cta.label} href={item.cta.href} variant="link" arrow />
            ) : null}
          </article>
        ))}
      />
    </HbcHomepageSurfaceCard>
  );
}
