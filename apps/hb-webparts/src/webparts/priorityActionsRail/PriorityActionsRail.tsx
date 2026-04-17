/**
 * PriorityActionsRail — Public homepage command band webpart.
 *
 * Consumes the canonical Priority Actions read model (Prompt 02) and
 * renders through the shared HbcPriorityRail surface family (Prompt 03).
 * Supports breakpoint-aware overflow, audience/schedule/device filtering,
 * and governed loading/empty/error states.
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
  Briefcase,
  type LucideIcon,
  type PriorityRailActionModel,
  type PriorityRailUrgency,
  type PriorityRailBadgeVariant,
  type PriorityRailLayoutMode,
} from '@hbc/ui-kit/homepage';
import { usePriorityActionsData, invalidatePriorityActionsCache } from '../../homepage/data/usePriorityActionsData.js';
import { resolveByBreakpoint, filterByDevice, type DeviceClass } from '../../homepage/data/priorityActionsNormalization.js';
import {
  mapPriorityActionsDeviceClassToShellState,
  type PriorityActionsDeviceClass,
} from '../../homepage/entryStack/entryStackOrchestration.js';
import type { ShellEntryStateId } from '../hbHomepage/shell/shellTypes.js';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import type { PriorityActionsItemNormalized, PriorityActionsConfigResolved, BadgeVariant as SchemaBadgeVariant } from '../../homepage/data/priorityActionsContracts.js';
import type { PriorityActionsRailConfig } from '../../homepage/webparts/utilityContracts.js';
import { normalizePriorityActionsRailConfig } from '../../homepage/helpers/utilityConfig.js';
import { getSiteUrl } from '../../homepage/data/spContext.js';

export interface PriorityActionsRailProps {
  config?: Partial<PriorityActionsRailConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

/* ── Urgency resolution ─────────────────────────────────────────── */

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

/* ── Device class resolution ────────────────────────────────────── */

function useDeviceClass(): DeviceClass {
  const [device, setDevice] = React.useState<DeviceClass>(() => resolveDeviceClass());

  React.useEffect(() => {
    function handleResize(): void {
      setDevice(resolveDeviceClass());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return device;
}

function resolveDeviceClass(): DeviceClass {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
  if (w >= 1440) return 'desktop';
  if (w >= 1024) return 'laptop';
  if (w >= 768) return 'tabletLandscape';
  if (w >= 600) return 'tabletPortrait';
  return 'phone';
}

// Governance alignment (Prompt-04): the rail's author-facing DeviceClass is
// anchored to the shell entry-state vocabulary. Width thresholds above are
// intentionally author-budget scoped; shell-layout thresholds live in
// `shell/breakpointPolicy.ts`. This helper is the governance seam that lets
// downstream inspectors (harness, control-panel preview) name the rail's
// active state in shell vocabulary.
export function getShellEntryStateForRailDevice(
  device: DeviceClass,
): ShellEntryStateId {
  return mapPriorityActionsDeviceClassToShellState(device as PriorityActionsDeviceClass);
}

function mapLayoutMode(config: PriorityActionsConfigResolved, device: DeviceClass): PriorityRailLayoutMode {
  switch (device) {
    case 'desktop':
    case 'laptop':
      return config.desktopLayoutMode === 'rail' ? 'rail' : 'grid';
    case 'tabletLandscape':
    case 'tabletPortrait':
      return config.tabletLayoutMode === 'grid' ? 'grid' : 'rail';
    case 'phone':
      return 'compact';
    default:
      return 'rail';
  }
}

/* ── List-sourced rail ──────────────────────────────────────────── */

function ListSourcedRail({
  activeAudience,
}: {
  activeAudience: string | undefined;
}): React.JSX.Element {
  const { config, items, isLoading, error } = usePriorityActionsData({ activeAudience });
  const device = useDeviceClass();

  if (isLoading) {
    return <HbcPriorityRailSkeleton count={4} />;
  }

  if (error) {
    return (
      <HbcPriorityRailErrorState
        title="Unable to load actions"
        description="Priority actions could not be loaded from the list."
        onRetry={() => {
          invalidatePriorityActionsCache();
          window.location.reload();
        }}
      />
    );
  }

  if (!config) {
    const msg = resolveAuthoringMessage('priorityActionsRail', 'noData');
    return <HbcPriorityRailEmptyState title={msg.title} description={msg.description} />;
  }

  const deviceItems = filterByDevice(items, device);
  const breakpoint = resolveByBreakpoint(deviceItems, config, device);

  if (breakpoint.primaryItems.length === 0 && breakpoint.overflowItems.length === 0) {
    const msg = resolveAuthoringMessage('priorityActionsRail', 'noData');
    return <HbcPriorityRailEmptyState title={msg.title} description={msg.description} />;
  }

  return (
    <HbcPriorityRailSurface
      title={config.showHeading ? config.headingText || 'Priority Actions' : undefined}
      urgency={resolveUrgency(deviceItems)}
      layout={mapLayoutMode(config, device)}
      items={breakpoint.primaryItems.map(mapToRailAction)}
      overflowItems={breakpoint.overflowItems.map(mapToRailAction)}
      overflowLabel={config.overflowLabel}
      showBadges={config.showBadges}
    />
  );
}

/* ── Manifest-config fallback rail ──────────────────────────────── */

function ManifestFallbackRail({
  config,
  activeAudience,
}: {
  config: Partial<PriorityActionsRailConfig> | undefined;
  activeAudience: string | undefined;
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
      items={allActions}
      showBadges
    />
  );
}

/* ── Public webpart entry ───────────────────────────────────────── */

export function PriorityActionsRail({
  config,
  activeAudience,
  isLoading = false,
}: PriorityActionsRailProps): React.JSX.Element {
  if (isLoading) {
    return <HbcPriorityRailSkeleton count={4} />;
  }

  const hasSiteUrl = Boolean(getSiteUrl());

  if (hasSiteUrl) {
    return <ListSourcedRail activeAudience={activeAudience} />;
  }

  return <ManifestFallbackRail config={config} activeAudience={activeAudience} />;
}
