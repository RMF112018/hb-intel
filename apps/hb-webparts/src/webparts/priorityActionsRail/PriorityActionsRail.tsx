/**
 * PriorityActionsRail — standalone Priority Actions webpart surface.
 *
 * Renders shared rail/list presentation through `HbcPriorityRailSurface`
 * for standalone, embedded, and admin-preview usage. The hosted homepage
 * wrapper runtime is governed by `HbHomepageEntryStack` +
 * `HbHomepageLauncherBand` + `HbcHomepageLauncher`, not by this webpart.
 */
import * as React from 'react';
import {
  HbcPriorityRailSurface,
  HbcPriorityRailSkeleton,
  HbcPriorityRailEmptyState,
  HbcPriorityRailErrorState,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  type LucideIcon,
  type PriorityRailActionModel,
  type PriorityRailUrgency,
  type PriorityRailBadgeVariant,
  type PriorityRailContext,
} from '@hbc/ui-kit/homepage';
import { usePriorityActionsData, invalidatePriorityActionsCache } from '../../homepage/data/usePriorityActionsData.js';
import { resolveByBreakpoint, filterByDevice } from '../../homepage/data/priorityActionsNormalization.js';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import type { PriorityActionsItemNormalized, BadgeVariant as SchemaBadgeVariant } from '../../homepage/data/priorityActionsContracts.js';
import type { PriorityActionsRailConfig } from '../../homepage/webparts/utilityContracts.js';
import { normalizePriorityActionsRailConfig } from '../../homepage/helpers/utilityConfig.js';
import { getSiteUrl } from '../../homepage/data/spContext.js';
import {
  resolvePriorityRailDeviceForContainer,
  resolveLauncherPresentation,
  type PriorityRailContainerDimensions,
} from '../../homepage/data/priorityActionsPresentation.js';

export interface PriorityActionsRailProps {
  config?: Partial<PriorityActionsRailConfig>;
  activeAudience?: string;
  /**
   * Optional list-source band key override. When omitted, the rail's data
   * seam uses its built-in default (`homepage-primary`).
   */
  bandKey?: string;
  /**
   * Named presentation context. Defaults to `default` for standalone /
   * non-homepage mounts. `homepage-flagship` is an explicit rail-surface
   * variant for selective embeds/tests; the hosted homepage entry stack
   * does not mount this webpart path.
   */
  surfaceContext?: PriorityRailContext;
  isLoading?: boolean;
}

/* ── Urgency / icon resolution ──────────────────────────────────── */

const URGENCY_ICON_MAP: Record<string, LucideIcon> = {
  critical: AlertCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  atRisk: AlertTriangle,
  success: CheckCircle2,
  completed: CheckCircle2,
  onTrack: CheckCircle2,
};

function resolveActionIcon(variant: SchemaBadgeVariant | string | undefined): LucideIcon {
  if (!variant) return ArrowRight;
  return URGENCY_ICON_MAP[variant] ?? ArrowRight;
}

function resolveUrgency(items: PriorityActionsItemNormalized[]): PriorityRailUrgency {
  if (items.some((i) => i.badgeVariant === 'critical')) return 'critical';
  if (items.some((i) => i.badgeVariant === 'warning')) return 'high';
  return 'default';
}

const BADGE_VARIANT_MAP: Record<string, PriorityRailBadgeVariant> = {
  neutral: 'neutral',
  info: 'info',
  warning: 'warning',
  success: 'success',
  critical: 'critical',
};

function mapToRailAction(item: PriorityActionsItemNormalized): PriorityRailActionModel {
  return {
    id: item.actionKey,
    title: item.title,
    href: item.href,
    description: item.description || undefined,
    icon: resolveActionIcon(item.badgeVariant),
    badge: item.badgeLabel
      ? { label: item.badgeLabel, variant: BADGE_VARIANT_MAP[item.badgeVariant] ?? 'neutral' }
      : undefined,
    external: item.isExternal,
    groupKey: item.groupKey || undefined,
    groupTitle: item.groupTitle || undefined,
  };
}

/* ── Container-driven device resolution ─────────────────────────── */

const DEFAULT_CONTAINER_DIMENSIONS: PriorityRailContainerDimensions = { width: 1200, height: 800 };

function extractDimensions(entry: ResizeObserverEntry, el: HTMLElement): PriorityRailContainerDimensions {
  const contentBox = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;
  if (contentBox && typeof contentBox.inlineSize === 'number' && typeof contentBox.blockSize === 'number') {
    return { width: contentBox.inlineSize, height: contentBox.blockSize };
  }
  if (entry.contentRect) {
    return { width: entry.contentRect.width, height: entry.contentRect.height };
  }
  return { width: el.clientWidth || DEFAULT_CONTAINER_DIMENSIONS.width, height: el.clientHeight || DEFAULT_CONTAINER_DIMENSIONS.height };
}

function useRailContainerDimensions(ref: React.RefObject<HTMLElement | null>): PriorityRailContainerDimensions {
  const [dimensions, setDimensions] = React.useState<PriorityRailContainerDimensions>(DEFAULT_CONTAINER_DIMENSIONS);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const syncFromElement = (): void => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    syncFromElement();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        const entry = entries.find((candidate) => candidate.target === el) ?? entries[0];
        if (!entry) return;
        setDimensions(extractDimensions(entry, el));
      });
      observer.observe(el);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', syncFromElement);
    return () => window.removeEventListener('resize', syncFromElement);
  }, [ref]);

  return dimensions;
}

/* ── List-sourced launcher ──────────────────────────────────────── */

function ListSourcedRail({
  activeAudience,
  bandKey,
  surfaceContext,
}: {
  activeAudience: string | undefined;
  bandKey: string | undefined;
  surfaceContext: PriorityRailContext;
}): React.JSX.Element {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dimensions = useRailContainerDimensions(containerRef);
  const deviceResolution = resolvePriorityRailDeviceForContainer(dimensions);
  const { config, items, isLoading, error } = usePriorityActionsData({ activeAudience, bandKey });

  let content: React.JSX.Element;

  if (isLoading) {
    content = <HbcPriorityRailSkeleton count={4} />;
  } else if (error) {
    content = (
      <HbcPriorityRailErrorState
        title="Unable to load actions"
        description="Priority actions could not be loaded from the list."
        onRetry={() => {
          invalidatePriorityActionsCache();
          window.location.reload();
        }}
      />
    );
  } else if (!config) {
    const msg = resolveAuthoringMessage('priorityActionsRail', 'noData');
    content = <HbcPriorityRailEmptyState title={msg.title} description={msg.description} />;
  } else {
    const presentation = resolveLauncherPresentation(deviceResolution);
    const deviceItems = filterByDevice(items, deviceResolution.deviceClass);
    const breakpoint = resolveByBreakpoint(deviceItems, config, deviceResolution.deviceClass);

    if (breakpoint.primaryItems.length === 0 && breakpoint.overflowItems.length === 0) {
      const msg = resolveAuthoringMessage('priorityActionsRail', 'noData');
      content = <HbcPriorityRailEmptyState title={msg.title} description={msg.description} />;
    } else {
      content = (
        <HbcPriorityRailSurface
          title={config.showHeading ? config.headingText || 'Priority Actions' : undefined}
          urgency={resolveUrgency(deviceItems)}
          layout={presentation.layout}
          context={surfaceContext}
          items={breakpoint.primaryItems.map(mapToRailAction)}
          overflowItems={breakpoint.overflowItems.map(mapToRailAction)}
          overflowLabel={config.overflowLabel}
          overflowStrategy={presentation.overflowStrategy}
          showBadges={config.showBadges}
        />
      );
    }
  }

  return (
    <div
      ref={containerRef}
      data-hbc-rail-device-class={deviceResolution.deviceClass}
      data-hbc-rail-shell-state={deviceResolution.shellState}
      data-hbc-rail-entry-reason={deviceResolution.entryStateReason}
      data-hbc-rail-short-height={deviceResolution.shortHeightConstrained ? 'true' : 'false'}
    >
      {content}
    </div>
  );
}

/* ── Manifest-config fallback launcher ──────────────────────────── */

function ManifestFallbackRail({
  config,
  activeAudience,
  surfaceContext,
}: {
  config: Partial<PriorityActionsRailConfig> | undefined;
  activeAudience: string | undefined;
  surfaceContext: PriorityRailContext;
}): React.JSX.Element {
  const normalized = normalizePriorityActionsRailConfig(config, activeAudience);

  if (normalized.groups.length === 0) {
    const hasInput = Boolean(config?.actions?.length || config?.groups?.length);
    const msg = resolveAuthoringMessage('priorityActionsRail', hasInput ? 'invalid' : 'noData');
    return <HbcPriorityRailEmptyState title={msg.title} description={msg.description} />;
  }

  const allActions: PriorityRailActionModel[] = normalized.groups.flatMap((group) =>
    group.actions.map((action) => ({
      id: action.id,
      title: action.title,
      href: action.href,
      description: action.description,
      icon: resolveActionIcon(action.badge?.variant),
      badge: action.badge
        ? { label: action.badge.label, variant: BADGE_VARIANT_MAP[action.badge.variant ?? 'info'] ?? 'info' }
        : undefined,
      groupKey: action.groupId,
      groupTitle: action.groupTitle,
    })),
  );

  const urgency: PriorityRailUrgency = allActions.some((a) => a.badge?.variant === 'critical')
    ? 'critical'
    : allActions.some((a) => a.badge?.variant === 'warning')
      ? 'high'
      : 'default';

  return (
    <HbcPriorityRailSurface
      title={normalized.heading}
      urgency={urgency}
      context={surfaceContext}
      items={allActions}
      showBadges
    />
  );
}

/* ── Public webpart entry ───────────────────────────────────────── */

export function PriorityActionsRail({
  config,
  activeAudience,
  bandKey,
  surfaceContext = 'default',
  isLoading = false,
}: PriorityActionsRailProps): React.JSX.Element {
  if (isLoading) {
    return <HbcPriorityRailSkeleton count={4} />;
  }

  if (getSiteUrl()) {
    return (
      <ListSourcedRail
        activeAudience={activeAudience}
        bandKey={bandKey}
        surfaceContext={surfaceContext}
      />
    );
  }

  return (
    <ManifestFallbackRail
      config={config}
      activeAudience={activeAudience}
      surfaceContext={surfaceContext}
    />
  );
}
