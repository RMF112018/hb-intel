/**
 * Adapter: Priority Actions normalized items → HbcHomepageLauncher chips.
 *
 * Bridges the shared Priority Actions data pipeline
 * (`usePriorityActionsData` + normalization + filtering) to the new
 * `@hbc/ui-kit/homepage` launcher band contract.
 *
 * The launcher band governs visible-chip density explicitly per device
 * class (binding per UI-Doctrine-SPFx-Homepage-Overlay § 7.1–7.4),
 * overriding the authored `maxVisible*` knobs on the admin config.
 */
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  type LucideIcon,
  HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT,
  type HomepageLauncherChipModel,
  type HomepageLauncherDeviceClass,
} from '@hbc/ui-kit/homepage';
import type { PriorityActionsItemNormalized } from './priorityActionsContracts.js';
import type { PriorityRailDeviceResolution } from './priorityActionsPresentation.js';

const BADGE_ICON_MAP: Record<string, LucideIcon> = {
  critical: AlertCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  atRisk: AlertTriangle,
  success: CheckCircle2,
  completed: CheckCircle2,
  onTrack: CheckCircle2,
};

export function resolveChipIcon(variant: string | undefined): LucideIcon {
  if (!variant) return ArrowRight;
  return BADGE_ICON_MAP[variant] ?? ArrowRight;
}

export function mapItemToChip(
  item: PriorityActionsItemNormalized,
): HomepageLauncherChipModel {
  return {
    id: item.actionKey || String(item.id),
    title: item.title,
    href: item.href,
    icon: resolveChipIcon(item.badgeVariant),
    external: item.isExternal,
  };
}

/**
 * Map the rail device-class + short-height resolution into the launcher's
 * device-class vocabulary using the shared entry-state authority.
 */
export function resolveLauncherDeviceClass(
  resolution: PriorityRailDeviceResolution,
): HomepageLauncherDeviceClass {
  if (resolution.shellState === 'ultrawide-desktop') {
    return 'ultrawide';
  }

  const base = resolution.deviceClass;
  switch (base) {
    case 'desktop':
      return 'desktop';
    case 'laptop':
      return 'desktop';
    case 'tabletLandscape':
      return 'tablet-landscape';
    case 'tabletPortrait':
      return 'tablet-portrait';
    case 'phone':
      return 'phone';
    default:
      return 'desktop';
  }
}

export interface LauncherPartition {
  primary: HomepageLauncherChipModel[];
  overflow: HomepageLauncherChipModel[];
  visibleBudget: number;
}

const SHELL_STATE_VISIBLE_CAP: Readonly<Record<PriorityRailDeviceResolution['shellState'], number>> =
  Object.freeze({
    'ultrawide-desktop': 8,
    'standard-laptop': 6,
    'tablet-landscape': 4,
    'tablet-portrait-large': 3,
    'tablet-portrait': 3,
    'phone-portrait': 2,
    'phone-landscape': 2,
  });

export interface LauncherBudgetOptions {
  strictShellAlignment: boolean;
}

/**
 * Split a filtered item list into primary chips and overflow chips using
 * the binding visible-count matrix. Items flagged `overflowOnly` are
 * forced into the overflow bucket regardless of position.
 *
 * Short-height shaves one primary slot to keep the band finger-safe on
 * constrained viewports (phone landscape, split panels, projector mode).
 */
export function partitionItems(
  items: readonly PriorityActionsItemNormalized[],
  deviceClass: HomepageLauncherDeviceClass,
  resolution: Pick<PriorityRailDeviceResolution, 'shortHeightConstrained' | 'shellState'>,
  options: LauncherBudgetOptions = { strictShellAlignment: true },
): LauncherPartition {
  const baseVisible = Math.max(
    1,
    HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT[deviceClass] - (resolution.shortHeightConstrained ? 1 : 0),
  );
  const maxVisible = options.strictShellAlignment
    ? Math.max(1, Math.min(baseVisible, SHELL_STATE_VISIBLE_CAP[resolution.shellState]))
    : baseVisible;

  const forced: PriorityActionsItemNormalized[] = [];
  const eligible: PriorityActionsItemNormalized[] = [];
  for (const item of items) {
    if (item.overflowOnly) forced.push(item);
    else eligible.push(item);
  }

  const primary = eligible.slice(0, maxVisible).map(mapItemToChip);
  const overflow = [...eligible.slice(maxVisible), ...forced].map(mapItemToChip);
  return { primary, overflow, visibleBudget: maxVisible };
}

/** Re-export for convenience so the webpart only imports from this adapter. */
export { Briefcase };
