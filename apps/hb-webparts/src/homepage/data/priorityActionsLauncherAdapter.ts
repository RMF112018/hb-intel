/**
 * Adapter: Priority Actions normalized items → HbcHomepageLauncher chips.
 *
 * Bridges the shared Priority Actions data pipeline
 * (`usePriorityActionsData` + normalization + filtering) to the new
 * `@hbc/ui-kit/homepage` launcher band contract.
 *
 * The launcher band governs visible-chip density explicitly per device
 * class (binding per UI-Doctrine-SPFx-Homepage-Overlay § 7.1–7.4),
 * overriding authored `maxVisible*` knobs and authored layout-matrix
 * semantics on the admin config.
 */
import {
  ArrowRight,
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  HardHat,
  Landmark,
  Link2,
  Mail,
  Search,
  Settings,
  Shield,
  Users,
  type LucideIcon,
  HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT,
  type HomepageLauncherTileModel,
  type HomepageLauncherDeviceClass,
} from '@hbc/ui-kit/homepage';
import type { PriorityActionsItemNormalized } from './priorityActionsContracts.js';
import type { PriorityRailDeviceResolution } from './priorityActionsPresentation.js';
import { resolveHomepageLauncherGovernedIcon } from '../../webparts/hbHomepage/launcherIconRegistry.js';

const ICON_BY_GOVERNED_KEY: Readonly<Record<string, LucideIcon>> = Object.freeze({
  finance: DollarSign,
  field: HardHat,
  hr: Users,
  safety: Shield,
  quality: Shield,
  risk: Shield,
  ops: Settings,
  admin: Settings,
  legal: Landmark,
  it: Settings,
  project: Calendar,
  report: FileText,
  schedule: Calendar,
  email: Mail,
  document: FileText,
  team: Users,
  form: FileText,
  policy: Landmark,
  search: Search,
  link: Link2,
  clipboard: FileText,
});

const SERVICE_FALLBACK_MATCHERS: ReadonlyArray<readonly [token: string, icon: LucideIcon]> = [
  ['safety', Shield],
  ['quality', Shield],
  ['risk', Shield],
  ['finance', DollarSign],
  ['budget', DollarSign],
  ['cost', DollarSign],
  ['field', HardHat],
  ['project', Calendar],
  ['schedule', Calendar],
  ['report', FileText],
  ['document', FileText],
  ['policy', Landmark],
  ['legal', Landmark],
  ['team', Users],
  ['hr', Users],
  ['email', Mail],
  ['search', Search],
  ['admin', Settings],
  ['ops', Settings],
] as const;

function resolveIconByGovernedKey(iconKey: string | undefined): LucideIcon | undefined {
  if (!iconKey) return undefined;
  const normalized = iconKey.trim().toLowerCase();
  if (!normalized) return undefined;
  return ICON_BY_GOVERNED_KEY[normalized];
}

function resolveServiceFallbackIcon(item: PriorityActionsItemNormalized): LucideIcon | undefined {
  const haystack = [
    item.actionKey,
    item.groupKey,
    item.groupTitle,
    item.title,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  for (const [token, icon] of SERVICE_FALLBACK_MATCHERS) {
    if (haystack.includes(token)) return icon;
  }
  return undefined;
}

export function resolveChipIcon(item: PriorityActionsItemNormalized): LucideIcon {
  const explicitIdentity = resolveIconByGovernedKey(item.launcherIconIdentity);
  if (explicitIdentity) return explicitIdentity;
  const iconKeyIdentity = resolveIconByGovernedKey(item.iconKey);
  if (iconKeyIdentity) return iconKeyIdentity;
  const serviceFallback = resolveServiceFallbackIcon(item);
  if (serviceFallback) return serviceFallback;
  return ArrowRight;
}

export function mapItemToTile(
  item: PriorityActionsItemNormalized,
): HomepageLauncherTileModel {
  const description = item.description?.trim() || undefined;
  const groupKey = item.groupKey?.trim() || undefined;
  const groupTitle = item.groupTitle?.trim() || undefined;
  const governedIcon = resolveHomepageLauncherGovernedIcon(item);
  const fallbackIcon = resolveChipIcon(item);
  const fallbackIconKey = item.iconKey || undefined;

  return {
    id: item.actionKey || String(item.id),
    serviceKey: item.actionKey || String(item.id),
    title: item.title,
    href: item.href,
    description,
    icon: governedIcon?.icon ?? fallbackIcon,
    iconAssetSrc: governedIcon?.iconAssetSrc,
    iconAssetStrategy: governedIcon?.iconAssetSrc ? 'img-filter-white' : undefined,
    iconPresentation: governedIcon ? 'compliant' : 'standard',
    iconKey: governedIcon?.iconKey ?? fallbackIconKey,
    groupKey,
    groupTitle,
    external: item.isExternal,
    openInNewTab: item.openInNewTab,
    ariaLabel: description ? `${item.title}. ${description}` : item.title,
    variant: 'primary',
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
  primary: HomepageLauncherTileModel[];
  overflow: HomepageLauncherTileModel[];
  visibleBudget: number;
  handheldMode: 'standard' | 'single-entry-all-tools';
  drawerSource: 'all-tools';
  capGovernance: 'binding-visible-cap' | 'all-tools-drawer';
}

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
  resolution: Pick<
    PriorityRailDeviceResolution,
    'shortHeightConstrained' | 'shellState' | 'launcherHandheldMode'
  >,
  options: LauncherBudgetOptions = { strictShellAlignment: true },
): LauncherPartition {
  void options;
  const handheldMode =
    resolution.launcherHandheldMode ??
    (deviceClass === 'phone' || resolution.shortHeightConstrained
      ? 'single-entry-all-tools'
      : 'standard');
  const maxVisible = Math.max(
    1,
    HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT[deviceClass] - (resolution.shortHeightConstrained ? 1 : 0),
  );

  const forced: PriorityActionsItemNormalized[] = [];
  const eligible: PriorityActionsItemNormalized[] = [];
  for (const item of items) {
    if (item.overflowOnly) forced.push(item);
    else eligible.push(item);
  }

  if (handheldMode === 'single-entry-all-tools') {
    const allTools = [...eligible, ...forced].map((item) => ({
      ...mapItemToTile(item),
      variant: 'mobile-entry' as const,
    }));
    const entryTile = allTools.length > 0 ? [allTools[0]!] : [];
    return {
      primary: entryTile,
      overflow: allTools,
      visibleBudget: entryTile.length,
      handheldMode,
      drawerSource: 'all-tools',
      capGovernance: 'all-tools-drawer',
    };
  }

  const primary = eligible.slice(0, maxVisible).map((item) => ({
    ...mapItemToTile(item),
    variant: 'primary' as const,
  }));
  const overflow = [...eligible.slice(maxVisible), ...forced].map((item) => ({
    ...mapItemToTile(item),
    variant: 'secondary-overflow-entry' as const,
  }));
  return {
    primary,
    overflow,
    visibleBudget: maxVisible,
    handheldMode,
    drawerSource: 'all-tools',
    capGovernance: 'binding-visible-cap',
  };
}

/** Backward-compatible alias during chip -> tile transition. */
export const mapItemToChip = mapItemToTile;

/** Re-export for convenience so the webpart only imports from this adapter. */
export { Briefcase };
