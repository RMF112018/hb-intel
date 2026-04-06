/**
 * SafetyFieldExcellence — Safety-critical field intelligence surface
 * Phase 15-08 — Operational intelligence redesign
 *
 * Safety is a core HB value. This surface must communicate cultural
 * importance and urgency, not just display safety-related content
 * in a generic card. Event types (highlight, recognition, reminder,
 * notice) get distinct visual framing with urgency-aware colors.
 */
import * as React from 'react';
import { HbcPremiumCta, HbcPremiumBadge } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeSafetyFieldExcellenceConfig } from '../../homepage/helpers/operationalAwarenessConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import { HomepageOperationalAwarenessCluster } from '../../homepage/shared/HomepageOperationalAwarenessCluster.js';
import type { SafetyFieldExcellenceConfig } from '../../homepage/webparts/operationalAwarenessContracts.js';
import { HP_SPACE } from '../../homepage/tokens.js';

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

/** Event-type eyebrow labels for safety framing */
const EVENT_EYEBROW_MAP: Record<string, string> = {
  highlight: 'Safety Highlight',
  recognition: 'Field Recognition',
  reminder: 'Safety Reminder',
  notice: 'Important Notice',
};

/** Event-type colors for visual distinction */
const EVENT_COLOR_MAP: Record<string, string> = {
  highlight: 'rgb(34, 83, 145)',
  recognition: 'rgb(16, 124, 65)',
  reminder: 'rgb(180, 120, 20)',
  notice: 'rgb(180, 40, 40)',
};

/** Featured title — safety-aware, strong */
const featuredTitleStyle = (eventType: string): React.CSSProperties => ({
  margin: 0,
  fontSize: '1.125rem',
  fontWeight: 700,
  lineHeight: 1.3,
  letterSpacing: '-0.01em',
  color: EVENT_COLOR_MAP[eventType] ?? '#323130',
});

/** Featured summary — clear, field-grade readability */
const featuredSummaryStyle: React.CSSProperties = {
  margin: `${HP_SPACE.md}px 0 0`,
  fontSize: '0.9375rem',
  lineHeight: 1.6,
  maxWidth: '55ch',
  color: 'rgba(0, 0, 0, 0.75)',
};

/** Status strip — horizontal indicators with urgency framing */
const statusStripStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: HP_SPACE.md,
  alignItems: 'center',
  padding: `${HP_SPACE.md}px 0`,
  marginTop: HP_SPACE.md,
  borderTop: '1px solid rgba(220, 38, 38, 0.08)',
  borderBottom: '1px solid rgba(220, 38, 38, 0.08)',
};

/** Metadata — operational freshness */
const metadataStyle: React.CSSProperties = {
  margin: `${HP_SPACE.md}px 0 0`,
  fontSize: '0.8125rem',
  opacity: 0.6,
  fontStyle: 'italic' as const,
};

/** Freshness label */
const freshnessStyle: React.CSSProperties = {
  margin: `${HP_SPACE.sm}px 0 0`,
  fontSize: '0.75rem',
  fontWeight: 500,
  letterSpacing: '0.02em',
  opacity: 0.5,
};

/** Secondary title */
const secondaryTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9375rem',
  fontWeight: 600,
  lineHeight: 1.4,
};

/** Secondary summary */
const secondarySummaryStyle: React.CSSProperties = {
  margin: `${HP_SPACE.sm}px 0 0`,
  fontSize: '0.875rem',
  lineHeight: 1.5,
  color: 'rgba(0, 0, 0, 0.65)',
};

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
    <HomepageOperationalAwarenessCluster
      heading={normalized.heading}
      variant="safety"
      featured={
        normalized.featured ? (
          <article>
            <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: EVENT_COLOR_MAP[normalized.featured.eventType] ?? '#323130', opacity: 0.7, marginBottom: 6 }}>
              {EVENT_EYEBROW_MAP[normalized.featured.eventType] ?? 'Safety'}
            </span>
            <h3 style={featuredTitleStyle(normalized.featured.eventType)}>{normalized.featured.title}</h3>

            {/* Status strip — urgency-framed indicators */}
            <div style={statusStripStyle}>
              <HbcPremiumBadge
                label={normalized.featured.eventType}
                status={EVENT_VARIANT_MAP[normalized.featured.eventType]}
              />
              {normalized.featured.indicator ? (
                <HbcPremiumBadge
                  label={normalized.featured.indicator.label}
                  status={normalized.featured.indicator.variant ?? 'warning'}
                />
              ) : null}
              {normalized.featured.isStale ? <HbcPremiumBadge label="Stale" status="warning" /> : null}
            </div>

            <p style={featuredSummaryStyle}>{normalized.featured.summary}</p>
            {normalized.featured.metadata ? <p style={metadataStyle}>{normalized.featured.metadata}</p> : null}
            {normalized.featured.freshnessLabel ? (
              <p style={freshnessStyle}>{normalized.featured.freshnessLabel}</p>
            ) : null}
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
          <h3 style={secondaryTitleStyle}>{item.title}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            <HbcPremiumBadge label={item.eventType} status={EVENT_VARIANT_MAP[item.eventType]} size="sm" />
            {item.indicator ? <HbcPremiumBadge label={item.indicator.label} status={item.indicator.variant ?? 'warning'} size="sm" /> : null}
            {item.isStale ? <HbcPremiumBadge label="Stale" status="warning" size="sm" /> : null}
          </div>
          <p style={secondarySummaryStyle}>{item.summary}</p>
          {item.freshnessLabel ? <p style={freshnessStyle}>{item.freshnessLabel}</p> : null}
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
