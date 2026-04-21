/**
 * SafetyFieldExcellence — Safety-critical field intelligence surface.
 *
 * W01r-P20 — rebuild on the elevated `HbcOperationalSurface`:
 *   - Safety-register nameplate masthead driven by the shared surface
 *   - Severity spectrum strip anchors safety as a first-class HB value
 *   - Severity-aware featured signal block (icon + accent + chips)
 *   - Severity-accent signal rows for the supporting feed
 *
 * The webpart consumer owns only non-visual concerns:
 *   - manifest-config fallback
 *   - normalization + audience filtering
 *   - loading / empty / invalid state handling
 *   - mapping the normalized output into the surface view-model
 *
 * No inline styling. All safety typography, severity accents, and
 * spacing live in the shared surface family.
 */
import * as React from 'react';
import {
  HbcOperationalSurface,
  HbcPremiumBadge,
  Shield,
  AlertCircle,
  Info,
  AlertTriangle,
  Clock,
  type HbcOperationalSurfaceMode,
  type OperationalSignal,
  type OperationalSignalSeverity,
  type LucideIcon,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeSafetyFieldExcellenceConfig } from '../../homepage/helpers/operationalAwarenessConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type {
  SafetyContextMetadata,
  SafetyFieldExcellenceConfig,
  SafetyUrgencyLevel,
} from '../../homepage/webparts/operationalAwarenessContracts.js';

export interface SafetyFieldExcellenceProps {
  config?: Partial<SafetyFieldExcellenceConfig>;
  activeAudience?: string;
  isLoading?: boolean;
  shellRenderMode?: 'standard' | 'compact' | 'summary-collapsed';
}

const URGENCY_VARIANT_MAP: Record<SafetyUrgencyLevel, 'info' | 'warning' | 'critical'> = {
  routine: 'info',
  attention: 'warning',
  urgent: 'critical',
};

const URGENCY_ICON_MAP: Record<SafetyUrgencyLevel, LucideIcon> = {
  routine: Info,
  attention: AlertTriangle,
  urgent: AlertCircle,
};

const URGENCY_SIGNAL_SEVERITY_MAP: Record<SafetyUrgencyLevel, OperationalSignalSeverity> = {
  routine: 'default',
  attention: 'warning',
  urgent: 'danger',
};

const URGENCY_LABEL_MAP: Record<SafetyUrgencyLevel, string> = {
  routine: 'Routine focus',
  attention: 'Needs attention',
  urgent: 'Urgent priority',
};

function contextLabels(context: SafetyContextMetadata | undefined): string[] {
  if (!context) return [];
  return [
    context.region ? `Region: ${context.region}` : undefined,
    context.site ? `Site: ${context.site}` : undefined,
    context.project ? `Project: ${context.project}` : undefined,
    context.scope ? `Scope: ${context.scope}` : undefined,
    context.owner ? `Owner: ${context.owner}` : undefined,
  ].filter((value): value is string => Boolean(value));
}

export function SafetyFieldExcellence({
  config,
  activeAudience,
  isLoading = false,
  shellRenderMode = 'standard',
}: SafetyFieldExcellenceProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading safety and field excellence" />;
  }

  const normalized = normalizeSafetyFieldExcellenceConfig(config, activeAudience);

  if (!normalized.featured && normalized.secondary.length === 0) {
    const hasAnyInput =
      Boolean(config?.primarySpotlight) ||
      Boolean(config?.topLineSummary) ||
      Boolean(config?.secondarySignals?.length);
    const message = resolveAuthoringMessage(
      'safetyFieldExcellence',
      hasAnyInput ? 'invalid' : 'noData',
    );
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const signals: OperationalSignal[] = normalized.secondary.map((item) => {
    const urgency = item.urgency;
    const context = contextLabels(item.context);
    return {
      id: item.id,
      title: item.title,
      meta:
        item.freshnessLabel ??
        context[0] ??
        item.compactSummary,
      icon: URGENCY_ICON_MAP[urgency],
      severity: URGENCY_SIGNAL_SEVERITY_MAP[urgency],
      href: item.cta?.href,
      openInNewTab: item.cta?.openInNewTab,
      badge: (
        <>
          <HbcPremiumBadge
            label={URGENCY_LABEL_MAP[urgency]}
            status={URGENCY_VARIANT_MAP[urgency]}
            size="sm"
          />
          {item.indicator ? (
            <HbcPremiumBadge
              label={item.indicator.label}
              status={item.indicator.variant ?? 'warning'}
              size="sm"
            />
          ) : null}
        </>
      ),
    };
  });
  const featuredUrgency = normalized.featured?.urgency ?? 'routine';

  const operationalMode: HbcOperationalSurfaceMode =
    shellRenderMode === 'summary-collapsed' ? 'minimal' : shellRenderMode;

  return (
    <HbcOperationalSurface
      title={normalized.heading}
      icon={Shield}
      mastheadEyebrow={normalized.topLineSummary?.statusLabel ?? 'Field Safety'}
      latestUpdated={normalized.topLineSummary?.lastUpdatedLabel ?? normalized.featured?.freshnessLabel}
      action={normalized.sectionCta}
      variant="safety-homepage"
      mode={operationalMode}
      featured={
        normalized.featured
          ? {
              title: normalized.featured.title,
              description: normalized.featured.summary,
              eyebrow: URGENCY_LABEL_MAP[featuredUrgency],
              icon: URGENCY_ICON_MAP[featuredUrgency],
              severity: URGENCY_SIGNAL_SEVERITY_MAP[featuredUrgency],
              badge: (
                <>
                  <HbcPremiumBadge
                    label={URGENCY_LABEL_MAP[featuredUrgency]}
                    status={URGENCY_VARIANT_MAP[featuredUrgency]}
                  />
                  {normalized.featured.indicator ? (
                    <HbcPremiumBadge
                      label={normalized.featured.indicator.label}
                      status={normalized.featured.indicator.variant ?? 'warning'}
                    />
                  ) : null}
                  {normalized.featured.isStale ? (
                    <HbcPremiumBadge label="Stale" status="warning" />
                  ) : null}
                </>
              ),
              metaItems: [
                ...(normalized.topLineSummary?.summaryText
                  ? [{ label: normalized.topLineSummary.summaryText }]
                  : []),
                ...(normalized.featured.metadata
                  ? [{ label: normalized.featured.metadata }]
                  : []),
                ...contextLabels(normalized.featured.context).map((label) => ({ label })),
                ...(normalized.featured.freshnessLabel
                  ? [{ label: normalized.featured.freshnessLabel, icon: Clock }]
                  : []),
              ],
              cta: normalized.featured.cta
                ? {
                    label: normalized.featured.cta.label,
                    href: normalized.featured.cta.href,
                    openInNewTab: normalized.featured.cta.openInNewTab,
                  }
                : undefined,
            }
          : undefined
      }
      signals={signals}
    />
  );
}
