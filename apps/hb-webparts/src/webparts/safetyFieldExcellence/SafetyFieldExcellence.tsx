/**
 * SafetyFieldExcellence — Safety-critical field intelligence surface.
 *
 * W02-P01 — rebuild on `HbcSafetyHomepageSurface`:
 *   - Top-line safety posture band with status + cadence
 *   - Dominant primary signal lane with decisive action posture
 *   - Bounded secondary signal lane with severity treatment
 *   - Explicit compact/minimal behavior for shell-fit states
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
  HbcSafetyHomepageSurface,
  HbcPremiumBadge,
  Shield,
  AlertCircle,
  Info,
  AlertTriangle,
  Clock,
  type HbcSafetyHomepageSurfaceMode,
  type SafetySecondarySignal,
  type SafetySignalSeverity,
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

const URGENCY_SIGNAL_SEVERITY_MAP: Record<SafetyUrgencyLevel, SafetySignalSeverity> = {
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

  const signals: SafetySecondarySignal[] = normalized.secondary.map((item) => {
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

  const operationalMode: HbcSafetyHomepageSurfaceMode =
    shellRenderMode === 'summary-collapsed' ? 'minimal' : shellRenderMode;
  const hasStaleSignal = Boolean(normalized.featured?.isStale || normalized.secondary.some((item) => item.isStale));
  const degradedNotice = hasStaleSignal
    ? 'Data freshness is degraded; verify stale signals before field action.'
    : undefined;

  return (
    <HbcSafetyHomepageSurface
      title={normalized.heading}
      icon={Shield}
      posture={{
        label: normalized.topLineSummary?.statusLabel ?? 'Field Safety',
        summary: normalized.topLineSummary?.summaryText,
        updatedLabel: normalized.topLineSummary?.lastUpdatedLabel ?? normalized.featured?.freshnessLabel,
        tone: normalized.topLineSummary?.statusVariant ?? 'info',
      }}
      degradedNotice={degradedNotice}
      action={normalized.sectionCta}
      mode={operationalMode}
      primary={
        normalized.featured
          ? {
              title: normalized.featured.title,
              summary: normalized.featured.summary,
              compactSummary: normalized.featured.compactSummary,
              urgencyLabel: URGENCY_LABEL_MAP[featuredUrgency],
              icon: URGENCY_ICON_MAP[featuredUrgency],
              severity: URGENCY_SIGNAL_SEVERITY_MAP[featuredUrgency],
              badges: (
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
      secondarySignals={signals}
    />
  );
}
