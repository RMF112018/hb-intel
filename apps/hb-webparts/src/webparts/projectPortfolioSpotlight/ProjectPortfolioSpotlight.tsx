/**
 * ProjectPortfolioSpotlight — Strategic operational intelligence surface
 * Phase 17-05 — Structural rebuild with P17 surface family
 *
 * Rebuilt on HbcOperationalSurface with dashboard-adjacent featured
 * highlight, severity-aware signal items, HbcPremiumBadge for status
 * and freshness indicators, and lucide icons for operational accents.
 */
import * as React from 'react';
import {
  HbcOperationalSurface,
  HbcPremiumCta,
  HbcPremiumBadge,
  BarChart3,
  Briefcase,
  Clock,
  CheckCircle2,
  type OperationalSignal,
  type OperationalSignalSeverity,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeProjectPortfolioSpotlightConfig } from '../../homepage/helpers/operationalAwarenessConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { ProjectPortfolioSpotlightConfig } from '../../homepage/webparts/operationalAwarenessContracts.js';

export interface ProjectPortfolioSpotlightProps {
  config?: Partial<ProjectPortfolioSpotlightConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

function resolveSignalSeverity(variant: string | undefined): OperationalSignalSeverity {
  if (variant === 'critical' || variant === 'warning') return 'warning';
  if (variant === 'success') return 'success';
  return 'default';
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
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const signals: OperationalSignal[] = normalized.secondary.map((item) => ({
    id: item.id,
    title: item.title,
    meta: item.freshnessLabel ?? item.summary.slice(0, 80),
    icon: Briefcase,
    severity: resolveSignalSeverity(item.status?.variant),
    badge: item.status ? (
      <HbcPremiumBadge label={item.status.label} status={item.status.variant ?? 'info'} size="sm" />
    ) : undefined,
    href: item.cta?.href,
  }));

  return (
    <HbcOperationalSurface
      title={normalized.heading}
      icon={BarChart3}
      featured={normalized.featured ? {
        title: normalized.featured.title,
        description: normalized.featured.summary,
        badge: (
          <>
            {normalized.featured.strategicEmphasis ? <HbcPremiumBadge label="Strategic" status="critical" size="sm" /> : null}
            {normalized.featured.status ? (
              <HbcPremiumBadge label={normalized.featured.status.label} status={normalized.featured.status.variant ?? 'info'} size="sm" />
            ) : null}
            {normalized.featured.isStale ? <HbcPremiumBadge label="Stale" status="warning" size="sm" /> : null}
          </>
        ),
        meta: (
          <>
            {normalized.featured.freshnessLabel ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} aria-hidden="true" style={{ opacity: 0.5 }} />
                {normalized.featured.freshnessLabel}
              </span>
            ) : null}
            {normalized.featured.milestones.length > 0 ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={11} aria-hidden="true" style={{ opacity: 0.5 }} />
                {normalized.featured.milestones.filter((m) => m.completed).length}/{normalized.featured.milestones.length} milestones
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
