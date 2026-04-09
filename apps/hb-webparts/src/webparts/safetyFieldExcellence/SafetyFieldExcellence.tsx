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

type EventType = 'highlight' | 'recognition' | 'reminder' | 'notice';

const EVENT_VARIANT_MAP: Record<EventType, 'info' | 'success' | 'warning' | 'critical'> = {
  highlight: 'info',
  recognition: 'success',
  reminder: 'warning',
  notice: 'critical',
};

const EVENT_ICON_MAP: Record<EventType, LucideIcon> = {
  highlight: Info,
  recognition: CheckCircle2,
  reminder: AlertTriangle,
  notice: AlertCircle,
};

const EVENT_SEVERITY_MAP: Record<EventType, OperationalSignalSeverity> = {
  highlight: 'default',
  recognition: 'success',
  reminder: 'warning',
  notice: 'danger',
};

const EVENT_EYEBROW_LABEL: Record<EventType, string> = {
  highlight: 'Field highlight',
  recognition: 'Safety recognition',
  reminder: 'Field reminder',
  notice: 'Critical notice',
};

function toEventType(value: string | undefined): EventType {
  if (value === 'recognition' || value === 'reminder' || value === 'notice') {
    return value;
  }
  return 'highlight';
}

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
    const message = resolveAuthoringMessage(
      'safetyFieldExcellence',
      config?.items?.length ? 'invalid' : 'noData',
    );
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const signals: OperationalSignal[] = normalized.secondary.map((item) => {
    const eventType = toEventType(item.eventType);
    return {
      id: item.id,
      title: item.title,
      meta: item.freshnessLabel ?? item.summary.slice(0, 80),
      icon: EVENT_ICON_MAP[eventType],
      severity: EVENT_SEVERITY_MAP[eventType],
      href: item.cta?.href,
      openInNewTab: item.cta?.openInNewTab,
      badge: (
        <>
          <HbcPremiumBadge
            label={EVENT_EYEBROW_LABEL[eventType]}
            status={EVENT_VARIANT_MAP[eventType]}
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

  const featuredEventType = normalized.featured
    ? toEventType(normalized.featured.eventType)
    : 'highlight';

  return (
    <HbcOperationalSurface
      title={normalized.heading}
      icon={Shield}
      mastheadEyebrow="Field Safety"
      latestUpdated={normalized.featured?.freshnessLabel}
      variant="safety-homepage"
      featured={
        normalized.featured
          ? {
              title: normalized.featured.title,
              description: normalized.featured.summary,
              eyebrow: EVENT_EYEBROW_LABEL[featuredEventType],
              icon: EVENT_ICON_MAP[featuredEventType],
              severity: EVENT_SEVERITY_MAP[featuredEventType],
              badge: (
                <>
                  <HbcPremiumBadge
                    label={EVENT_EYEBROW_LABEL[featuredEventType]}
                    status={EVENT_VARIANT_MAP[featuredEventType]}
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
                ...(normalized.featured.metadata
                  ? [{ label: normalized.featured.metadata }]
                  : []),
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
