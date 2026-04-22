/**
 * Adapter: Priority Actions normalized items → dedicated homepage launcher tiles.
 *
 * Bridges the shared Priority Actions data pipeline
 * (`usePriorityActionsData` + normalization + filtering) to the new
 * `@hbc/homepage-launcher` surface contract.
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
} from '@hbc/ui-kit/homepage';
import {
  HOMEPAGE_LAUNCHER_VISIBLE_COUNT,
  type HomepageLauncherTileModel,
  type HomepageLauncherDeviceClass,
  type HomepageLauncherOverflowSectionModel,
} from '@hbc/homepage-launcher';
import type { PriorityActionsItemNormalized } from './priorityActionsContracts.js';
import type { PriorityRailDeviceResolution } from './priorityActionsPresentation.js';
import { resolveHomepageLauncherGovernedIcon } from '../../webparts/hbHomepage/launcherIconRegistry.js';

const LAUNCHER_PRIORITY_ORDER: ReadonlyArray<string> = [
  'hb-projects',
  'hb-university',
  'procore',
  'compass',
  'bamboohr',
  'hh2',
  'document-crunch',
] as const;

const LAUNCHER_PRIORITY_INDEX: Readonly<Record<string, number>> = Object.freeze(
  LAUNCHER_PRIORITY_ORDER.reduce<Record<string, number>>((acc, key, index) => {
    acc[key] = index;
    return acc;
  }, {}),
);

function normalizeForPriority(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function resolveLauncherPriorityIndex(item: PriorityActionsItemNormalized): number {
  const candidates = [
    item.actionKey,
    item.iconKey,
    item.title,
  ].map(normalizeForPriority);

  for (const candidate of candidates) {
    const direct = LAUNCHER_PRIORITY_INDEX[candidate];
    if (direct !== undefined) return direct;
  }

  if (candidates.includes('document crunch')) {
    return LAUNCHER_PRIORITY_INDEX['document-crunch'] ?? Number.MAX_SAFE_INTEGER;
  }

  return Number.MAX_SAFE_INTEGER;
}

function sortLauncherItems(
  items: readonly PriorityActionsItemNormalized[],
): PriorityActionsItemNormalized[] {
  return [...items].sort((a, b) => {
    const priorityA = resolveLauncherPriorityIndex(a);
    const priorityB = resolveLauncherPriorityIndex(b);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return 0;
  });
}

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

function normalizeGroupToken(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

/**
 * Builds deterministic overflow sections from launcher tile metadata.
 * - group key precedence: groupKey -> groupTitle -> __other_tools
 * - group title precedence: groupTitle -> groupKey -> Other tools
 * - group order follows first-seen item order
 */
export function buildLauncherOverflowSections(
  items: readonly HomepageLauncherTileModel[],
): HomepageLauncherOverflowSectionModel[] {
  if (items.length === 0) return [];
  const byKey = new Map<string, HomepageLauncherOverflowSectionModel>();
  for (const item of items) {
    const groupKey = normalizeGroupToken(item.groupKey);
    const groupTitle = normalizeGroupToken(item.groupTitle);
    const resolvedKey = (groupKey ?? groupTitle ?? '__other_tools').toLowerCase();
    const resolvedTitle = groupTitle ?? groupKey ?? 'Other tools';
    const existing = byKey.get(resolvedKey);
    if (existing) {
      existing.items.push(item);
      continue;
    }
    byKey.set(resolvedKey, {
      key: resolvedKey,
      title: resolvedTitle,
      items: [item],
    });
  }
  return Array.from(byKey.values()).sort((a, b) => {
    if (a.key === '__other_tools') return 1;
    if (b.key === '__other_tools') return -1;
    return a.title.localeCompare(b.title);
  });
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
  const orderedItems = sortLauncherItems(items);
  const handheldMode =
    resolution.launcherHandheldMode ??
    (deviceClass === 'phone' || resolution.shortHeightConstrained
      ? 'single-entry-all-tools'
      : 'standard');
  const maxVisible = Math.max(
    1,
    HOMEPAGE_LAUNCHER_VISIBLE_COUNT[deviceClass] - (resolution.shortHeightConstrained ? 1 : 0),
  );

  const forced: PriorityActionsItemNormalized[] = [];
  const eligible: PriorityActionsItemNormalized[] = [];
  for (const item of orderedItems) {
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
