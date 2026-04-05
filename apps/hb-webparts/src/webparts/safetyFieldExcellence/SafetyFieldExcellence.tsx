import * as React from 'react';
import { HbcCard, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeSafetyFieldExcellenceConfig } from '../../homepage/helpers/operationalAwarenessConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import { HomepageOperationalAwarenessCluster } from '../../homepage/shared/HomepageOperationalAwarenessCluster.js';
import type { SafetyFieldExcellenceConfig } from '../../homepage/webparts/operationalAwarenessContracts.js';
import { hpHeadingReset, hpBadgeRow, hpContentParagraph, hpSecondaryText } from '../../homepage/tokens.js';

export interface SafetyFieldExcellenceProps {
  config?: Partial<SafetyFieldExcellenceConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

const EVENT_VARIANT_MAP = {
  highlight: 'info',
  recognition: 'success',
  reminder: 'warning',
  notice: 'critical',
} as const;

export function SafetyFieldExcellence({
  config,
  activeAudience,
  isLoading = false,
}: SafetyFieldExcellenceProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading safety and field excellence" />;
  }

  const normalized = normalizeSafetyFieldExcellenceConfig(config, activeAudience);

  if (!normalized.featured && normalized.secondary.length === 0) {
    const message = resolveAuthoringMessage('safetyFieldExcellence', config?.items?.length ? 'invalid' : 'noData');
    return (
      <HomepageEmptyState
        title={message.title}
        description={message.description}
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
              <h3 style={hpHeadingReset}>{normalized.featured.title}</h3>
              <div style={hpBadgeRow}>
                <HbcStatusBadge
                  label={normalized.featured.eventType}
                  variant={EVENT_VARIANT_MAP[normalized.featured.eventType]}
                />
                {normalized.featured.indicator ? (
                  <HbcStatusBadge
                    label={normalized.featured.indicator.label}
                    variant={normalized.featured.indicator.variant ?? 'warning'}
                  />
                ) : null}
                {normalized.featured.isStale ? <HbcStatusBadge label="Stale" variant="warning" /> : null}
              </div>
              <p style={hpContentParagraph}>{normalized.featured.summary}</p>
              {normalized.featured.metadata ? <p style={hpSecondaryText}>{normalized.featured.metadata}</p> : null}
              {normalized.featured.freshnessLabel ? (
                <p style={hpSecondaryText}>{normalized.featured.freshnessLabel}</p>
              ) : null}
              {normalized.featured.cta ? <a href={normalized.featured.cta.href}>{normalized.featured.cta.label}</a> : null}
            </article>
          ) : undefined
        }
        secondary={normalized.secondary.map((item) => (
          <article key={item.id}>
            <h3 style={hpHeadingReset}>{item.title}</h3>
            <div style={hpBadgeRow}>
              <HbcStatusBadge label={item.eventType} variant={EVENT_VARIANT_MAP[item.eventType]} />
              {item.indicator ? <HbcStatusBadge label={item.indicator.label} variant={item.indicator.variant ?? 'warning'} /> : null}
              {item.isStale ? <HbcStatusBadge label="Stale" variant="warning" /> : null}
            </div>
            <p style={hpContentParagraph}>{item.summary}</p>
            {item.freshnessLabel ? <p style={hpSecondaryText}>{item.freshnessLabel}</p> : null}
            {item.cta ? <a href={item.cta.href}>{item.cta.label}</a> : null}
          </article>
        ))}
      />
    </HbcCard>
  );
}
