import * as React from 'react';
import {
  HbcPremiumBadge,
  AlertCircle,
  AlertTriangle,
  Clock,
  Info,
  type HbcSafetyHomepageSurfaceMode,
  type HbcSafetyHomepageSurfaceProps,
  type LucideIcon,
  type SafetyDataConfidence,
  type SafetySecondarySignal as SafetySurfaceSecondarySignal,
  type SafetySignalSeverity,
  type SafetySurfaceFallbackReason,
} from '@hbc/ui-kit/homepage';
import type { NormalizedSafetyFieldExcellenceModel } from '../../homepage/helpers/operationalAwarenessConfig.js';
import type {
  SafetyContextMetadata,
  SafetyFieldExcellenceConfig,
  SafetyUrgencyLevel,
} from '../../homepage/webparts/operationalAwarenessContracts.js';

export type SafetyFieldExcellenceConsumerState =
  | 'loading'
  | 'runtimeError'
  | 'invalid'
  | 'empty'
  | 'valid';

export interface SafetyFieldExcellenceStateResolution {
  state: Exclude<SafetyFieldExcellenceConsumerState, 'runtimeError'>;
  hasAnyInput: boolean;
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

export function resolveOperationalMode(
  shellRenderMode: 'standard' | 'compact' | 'summary-collapsed',
): HbcSafetyHomepageSurfaceMode {
  return shellRenderMode === 'summary-collapsed' ? 'minimal' : shellRenderMode;
}

export function resolveConsumerState(
  config: Partial<SafetyFieldExcellenceConfig> | undefined,
  normalized: NormalizedSafetyFieldExcellenceModel,
): SafetyFieldExcellenceStateResolution {
  const hasAnyInput =
    Boolean(config?.primarySpotlight) ||
    Boolean(config?.topLineSummary) ||
    Boolean(config?.secondarySignals?.length) ||
    Boolean(config?.sectionCta);

  if (!normalized.featured && normalized.secondary.length === 0) {
    return {
      state: hasAnyInput ? 'invalid' : 'empty',
      hasAnyInput,
    };
  }

  return {
    state: 'valid',
    hasAnyInput,
  };
}

export interface SafetySurfaceModelExtras {
  readonly isPreview?: boolean;
  readonly isStale?: boolean;
  readonly fallbackReason?: SafetySurfaceFallbackReason;
  readonly dataConfidence?: SafetyDataConfidence;
  readonly primaryLastUpdatedLabel?: string;
}

export function mapSafetySurfaceModel(
  normalized: NormalizedSafetyFieldExcellenceModel,
  mode: HbcSafetyHomepageSurfaceMode,
  extras: SafetySurfaceModelExtras = {},
): Omit<HbcSafetyHomepageSurfaceProps, 'title' | 'icon'> {
  const secondarySignals: SafetySurfaceSecondarySignal[] = normalized.secondary.map((item) => {
    const urgency = item.urgency;
    const context = toContextLabels(item.context);
    return {
      id: item.id,
      title: item.title,
      meta: item.freshnessLabel ?? context[0] ?? item.compactSummary,
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

  const staleSecondaryCount = normalized.secondary.filter((item) => item.isStale).length;
  const hasStalePrimary = Boolean(normalized.featured?.isStale);
  const degradedNotice = hasStalePrimary
    ? staleSecondaryCount > 0
      ? `Primary signal and ${staleSecondaryCount} secondary safety signal${staleSecondaryCount === 1 ? '' : 's'} may be stale.`
      : 'Primary safety signal may be stale; verify field status before action.'
    : staleSecondaryCount > 0
      ? `${staleSecondaryCount} secondary safety signal${staleSecondaryCount === 1 ? '' : 's'} may be stale; verify before action.`
      : undefined;

  const featuredUrgency = normalized.featured?.urgency ?? 'routine';
  const hasPrimaryCta = Boolean(normalized.featured?.cta);
  const action =
    normalized.sectionCta && !(mode === 'standard' && hasPrimaryCta)
      ? normalized.sectionCta
      : undefined;

  // Stale signal is now expressed at the surface level via `isStale` (which
  // renders the `Stale` chip in the primary header). Suppress the legacy
  // badge-level "Stale" pill to avoid duplication when the caller has set
  // `extras.isStale`.
  const showLegacyStaleBadge = !extras.isStale && Boolean(normalized.featured?.isStale);

  return {
    mode,
    posture: {
      label: normalized.topLineSummary?.statusLabel ?? 'Field Safety',
      summary: normalized.topLineSummary?.summaryText,
      updatedLabel: normalized.topLineSummary?.lastUpdatedLabel ?? normalized.featured?.freshnessLabel,
      tone: normalized.topLineSummary?.statusVariant ?? 'info',
    },
    degradedNotice,
    action,
    isPreview: extras.isPreview,
    isStale: extras.isStale,
    fallbackReason: extras.fallbackReason,
    dataConfidence: extras.dataConfidence,
    primary: normalized.featured
      ? {
          title: normalized.featured.title,
          summary: normalized.featured.summary,
          compactSummary: normalized.featured.compactSummary,
          urgencyLabel: URGENCY_LABEL_MAP[featuredUrgency],
          icon: URGENCY_ICON_MAP[featuredUrgency],
          severity: URGENCY_SIGNAL_SEVERITY_MAP[featuredUrgency],
          lastUpdatedLabel:
            extras.primaryLastUpdatedLabel ?? normalized.featured.freshnessLabel,
          dataConfidence: extras.dataConfidence,
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
              {showLegacyStaleBadge ? (
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
            ...toContextLabels(normalized.featured.context).map((label) => ({ label })),
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
      : undefined,
    secondarySignals,
  };
}

function toContextLabels(context: SafetyContextMetadata | undefined): string[] {
  if (!context) return [];
  return [
    context.region ? `Region: ${context.region}` : undefined,
    context.site ? `Site: ${context.site}` : undefined,
    context.project ? `Project: ${context.project}` : undefined,
    context.scope ? `Scope: ${context.scope}` : undefined,
    context.owner ? `Owner: ${context.owner}` : undefined,
  ].filter((value): value is string => Boolean(value));
}
