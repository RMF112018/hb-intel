/**
 * SafetyFieldExcellence — Safety-critical field intelligence surface
 * Phase 17-05 — Structural rebuild with P17 surface family
 *
 * Rebuilt on HbcOperationalSurface with severity-aware signal items,
 * lucide icons for safety event classification, HbcPremiumBadge for
 * urgency indicators, and strong operational accent treatment.
 * Safety is a core HB value — this surface communicates cultural
 * importance, not just content in a card.
 */
import * as React from 'react';
import {
  HbcOperationalSurface,
  HbcPremiumCta,
  HbcPremiumBadge,
  Shield,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  type OperationalSignal,
  type OperationalSignalSeverity,
  type LucideIcon,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeSafetyFieldExcellenceConfig } from '../../homepage/helpers/operationalAwarenessConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { SafetyFieldExcellenceConfig } from '../../homepage/webparts/operationalAwarenessContracts.js';

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

const EVENT_ICON_MAP: Record<string, LucideIcon> = {
  highlight: Info,
  recognition: CheckCircle2,
  reminder: AlertTriangle,
  notice: AlertCircle,
};

const EVENT_SEVERITY_MAP: Record<string, OperationalSignalSeverity> = {
  highlight: 'default',
  recognition: 'success',
  reminder: 'warning',
  notice: 'danger',
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
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const signals: OperationalSignal[] = normalized.secondary.map((item) => ({
    id: item.id,
    title: item.title,
    meta: item.freshnessLabel ?? item.summary.slice(0, 80),
    icon: EVENT_ICON_MAP[item.eventType] ?? Shield,
    severity: EVENT_SEVERITY_MAP[item.eventType] ?? 'default',
    badge: (
      <>
        <HbcPremiumBadge label={item.eventType} status={EVENT_VARIANT_MAP[item.eventType]} size="sm" />
        {item.indicator ? <HbcPremiumBadge label={item.indicator.label} status={item.indicator.variant ?? 'warning'} size="sm" /> : null}
      </>
    ),
    href: item.cta?.href,
  }));

  return (
    <HbcOperationalSurface
      title={normalized.heading}
      icon={Shield}
      featured={normalized.featured ? {
        title: normalized.featured.title,
        description: normalized.featured.summary,
        badge: (
          <>
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
          </>
        ),
        meta: (
          <>
            {normalized.featured.metadata ? (
              <span style={{ fontStyle: 'italic' }}>{normalized.featured.metadata}</span>
            ) : null}
            {normalized.featured.freshnessLabel ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} aria-hidden="true" style={{ opacity: 0.5 }} />
                {normalized.featured.freshnessLabel}
              </span>
            ) : null}
          </>
        ),
      } : undefined}
      signals={signals}
      headerAction={normalized.featured?.cta ? (
        <HbcPremiumCta label={normalized.featured.cta.label} href={normalized.featured.cta.href} variant="ghost" size="sm" arrow />
      ) : undefined}
    />
  );
}
