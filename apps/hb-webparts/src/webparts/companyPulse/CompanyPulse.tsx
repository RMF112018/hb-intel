/**
 * CompanyPulse — Premium editorial news digest
 * Phase 15-07 — Editorial communications redesign
 *
 * Curated company news with magazine-like hierarchy. Featured items
 * get warm-accented container with category badges and strong headline
 * treatment. Secondary items are compact but scannable. The surface
 * reads as an authored news digest, not a list of announcements.
 */
import * as React from 'react';
import { HbcPremiumCta, HbcPremiumBadge } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeCompanyPulseConfig } from '../../homepage/helpers/communicationsConfig.js';
import { HomepageCuratedContentCluster } from '../../homepage/shared/HomepageCuratedContentCluster.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { CompanyPulseConfig } from '../../homepage/webparts/communicationsContracts.js';
import { HP_SPACE } from '../../homepage/tokens.js';

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

/** Featured headline — larger, bolder for editorial authority */
const featuredHeadlineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.125rem',
  fontWeight: 700,
  lineHeight: 1.3,
  letterSpacing: '-0.01em',
};

/** Featured summary — comfortable reading width */
const featuredSummaryStyle: React.CSSProperties = {
  margin: `${HP_SPACE.md}px 0 0`,
  fontSize: '0.9375rem',
  lineHeight: 1.6,
  maxWidth: '55ch',
  color: 'rgba(0, 0, 0, 0.75)',
};

/** Featured metadata — warm-toned secondary info */
const featuredMetaStyle: React.CSSProperties = {
  margin: `${HP_SPACE.md}px 0 0`,
  fontSize: '0.8125rem',
  opacity: 0.6,
  fontStyle: 'italic' as const,
};

/** Secondary headline */
const secondaryHeadlineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9375rem',
  fontWeight: 600,
  lineHeight: 1.4,
};

/** Secondary summary — compact */
const secondarySummaryStyle: React.CSSProperties = {
  margin: `${HP_SPACE.sm}px 0 0`,
  fontSize: '0.875rem',
  lineHeight: 1.5,
  color: 'rgba(0, 0, 0, 0.65)',
};

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
    <HomepageCuratedContentCluster
      heading={normalized.heading}
      variant="news"
      featured={
        normalized.featured ? (
          <article>
            {normalized.featured.category ? (
              <div style={{ marginBottom: HP_SPACE.md }}>
                <HbcPremiumBadge
                  label={normalized.featured.category}
                  status={CATEGORY_VARIANT_MAP[normalized.featured.category]}
                />
              </div>
            ) : null}
            <h3 style={featuredHeadlineStyle}>{normalized.featured.title}</h3>
            <p style={featuredSummaryStyle}>{normalized.featured.summary}</p>
            {normalized.featured.metadata ? <p style={featuredMetaStyle}>{normalized.featured.metadata}</p> : null}
            {normalized.featured.cta ? (
              <div style={{ marginTop: HP_SPACE.xl }}>
                <HbcPremiumCta label={normalized.featured.cta.label} href={normalized.featured.cta.href} variant="ghost" arrow />
              </div>
            ) : null}
          </article>
        ) : undefined
      }
      secondary={normalized.secondary.map((item) => (
        <article key={item.id}>
          <h3 style={secondaryHeadlineStyle}>{item.title}</h3>
          <p style={secondarySummaryStyle}>{item.summary}</p>
          {item.cta ? (
            <div style={{ marginTop: HP_SPACE.md }}>
              <HbcPremiumCta label={item.cta.label} href={item.cta.href} variant="ghost" arrow />
            </div>
          ) : null}
        </article>
      ))}
    />
  );
}
