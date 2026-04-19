/**
 * Priority Actions normalization, filtering, and breakpoint resolution.
 *
 * Transforms raw SharePoint item rows into normalized contracts, then
 * applies audience, schedule, device, and overflow filtering. The
 * breakpoint resolver produces a final render model with explicit
 * primary/overflow splits governed by launcher-visible-count policy.
 *
 * Schema authority:
 *   docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md
 *   docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md
 */
import type {
  PriorityActionsConfigResolved,
  PriorityActionsItemNormalized,
  BadgeVariant,
  ItemPriority,
  AudienceMode,
} from './priorityActionsContracts.js';
import {
  HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT,
  type HomepageLauncherDeviceClass,
} from '@hbc/ui-kit/homepage';
import type { RawPriorityActionsItemRow } from './priorityActionsItemsListDescriptor.js';
import {
  normalizeActionKey,
  normalizeAudienceKeysFromRaw,
  normalizeGroupFields,
  normalizeIconKey,
} from './priorityActionsGovernance.js';

/* ── Typed helpers ───────────────────────────────────────────────── */

function readString(value: unknown, fallback: string = ''): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function readBool(value: unknown, fallback: boolean = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const n = value.trim().toLowerCase();
    return n === 'true' || n === '1';
  }
  if (typeof value === 'number') return value !== 0;
  return fallback;
}

function readInt(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

const VALID_BADGE_VARIANTS = new Set<BadgeVariant>(['neutral', 'info', 'warning', 'success', 'critical']);
const VALID_PRIORITIES = new Set<ItemPriority>(['primary', 'secondary', 'overflow']);
const VALID_AUDIENCE_MODES = new Set<AudienceMode>(['all', 'include-only', 'exclude', 'role-driven']);

function readBadgeVariant(value: unknown): BadgeVariant {
  const s = readString(value).toLowerCase() as BadgeVariant;
  return VALID_BADGE_VARIANTS.has(s) ? s : 'neutral';
}

function readPriority(value: unknown): ItemPriority {
  const s = readString(value).toLowerCase() as ItemPriority;
  return VALID_PRIORITIES.has(s) ? s : 'primary';
}

function readAudienceMode(value: unknown): AudienceMode {
  const s = readString(value).toLowerCase() as AudienceMode;
  return VALID_AUDIENCE_MODES.has(s) ? s : 'all';
}

function readDateOrNull(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const d = new Date(value.trim());
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/* ── Row mapping ────────────────────────────────────────────────── */

export function mapItemRow(row: RawPriorityActionsItemRow): PriorityActionsItemNormalized | undefined {
  const actionKey = normalizeActionKey(readString(row.ActionKey));
  const title = readString(row.Title);
  const href = readString(row.Href);

  if (!actionKey || !title || !href) return undefined;

  const group = normalizeGroupFields(readString(row.GroupKey), readString(row.GroupTitle));

  return {
    id: readInt(row.ID, 0),
    actionKey,
    title,
    href,
    description: readString(row.ActionDescription),
    iconKey: normalizeIconKey(readString(row.IconKey)),
    badgeLabel: readString(row.BadgeLabel),
    badgeVariant: readBadgeVariant(row.BadgeVariant),
    priority: readPriority(row.Priority),
    groupKey: group.groupKey,
    groupTitle: group.groupTitle,
    sortOrder: readInt(row.SortOrder, 100),
    overflowOnly: readBool(row.OverflowOnly),
    mobilePriority: readInt(row.MobilePriority, 100),
    audienceMode: readAudienceMode(row.AudienceMode),
    audienceKeys: normalizeAudienceKeysFromRaw(row.AudienceKeys),
    isExternal: readBool(row.IsExternal),
    openInNewTab: readBool(row.OpenInNewTab),
    visibleDesktop: readBool(row.VisibleDesktop, true),
    visibleLaptop: readBool(row.VisibleLaptop, true),
    visibleTabletLandscape: readBool(row.VisibleTabletLandscape, true),
    visibleTabletPortrait: readBool(row.VisibleTabletPortrait, true),
    visiblePhone: readBool(row.VisiblePhone, true),
    startsAtUtc: readDateOrNull(row.StartsAtUtc),
    endsAtUtc: readDateOrNull(row.EndsAtUtc),
  };
}

export function normalizeItemRows(
  rows: readonly RawPriorityActionsItemRow[],
): PriorityActionsItemNormalized[] {
  const seen = new Set<string>();
  const items: PriorityActionsItemNormalized[] = [];

  for (const row of rows) {
    const item = mapItemRow(row);
    if (!item) continue;
    const dedupeKey = item.actionKey.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    items.push(item);
  }

  return items.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.actionKey.localeCompare(b.actionKey);
  });
}

/* ── Audience filtering ──────────────────────────────────────────── */

export function filterByAudience(
  items: readonly PriorityActionsItemNormalized[],
  activeAudience: string | undefined,
): PriorityActionsItemNormalized[] {
  return items.filter((item) => {
    switch (item.audienceMode) {
      case 'all':
        return true;
      case 'include-only':
        return !!activeAudience && item.audienceKeys.includes(activeAudience);
      case 'exclude':
        return !activeAudience || !item.audienceKeys.includes(activeAudience);
      case 'role-driven':
        return !!activeAudience && item.audienceKeys.includes(activeAudience);
      default:
        return true;
    }
  });
}

/* ── Schedule filtering ──────────────────────────────────────────── */

export function filterBySchedule(
  items: readonly PriorityActionsItemNormalized[],
  now: Date = new Date(),
): PriorityActionsItemNormalized[] {
  const nowMs = now.getTime();
  return items.filter((item) => {
    if (item.startsAtUtc) {
      const start = new Date(item.startsAtUtc).getTime();
      if (nowMs < start) return false;
    }
    if (item.endsAtUtc) {
      const end = new Date(item.endsAtUtc).getTime();
      if (nowMs > end) return false;
    }
    return true;
  });
}

/* ── Device visibility ───────────────────────────────────────────── */

export type DeviceClass = 'desktop' | 'laptop' | 'tabletLandscape' | 'tabletPortrait' | 'phone';

export function filterByDevice(
  items: readonly PriorityActionsItemNormalized[],
  device: DeviceClass,
): PriorityActionsItemNormalized[] {
  return items.filter((item) => {
    switch (device) {
      case 'desktop': return item.visibleDesktop;
      case 'laptop': return item.visibleLaptop;
      case 'tabletLandscape': return item.visibleTabletLandscape;
      case 'tabletPortrait': return item.visibleTabletPortrait;
      case 'phone': return item.visiblePhone;
      default: return true;
    }
  });
}

/* ── Breakpoint resolution ───────────────────────────────────────── */

export interface PriorityActionsBreakpointResult {
  primaryItems: PriorityActionsItemNormalized[];
  overflowItems: PriorityActionsItemNormalized[];
  maxVisible: number;
  overflowLabel: string;
  mode: 'standard-row' | 'single-entry-all-tools';
  drawerSource: 'all-tools';
  capGovernance: 'binding-visible-cap' | 'all-tools-drawer';
}

/**
 * Launcher breakpoint caps (Homepage Overlay §7.1). Data layer uses a
 * fixed table rather than per-config caps so the launcher presents
 * uniform density across pages; authored config still controls which
 * items are enabled / visible / overflow-gated.
 */
function toHomepageLauncherDeviceClass(device: DeviceClass): HomepageLauncherDeviceClass {
  switch (device) {
    case 'desktop':
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

export const LAUNCHER_VISIBLE_CAP: Readonly<Record<DeviceClass, number>> = Object.freeze({
  desktop: HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT.desktop,
  laptop: HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT.desktop,
  tabletLandscape: HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT['tablet-landscape'],
  tabletPortrait: HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT['tablet-portrait'],
  phone: HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT.phone,
});

export type LauncherBreakpointMode = 'standard-row' | 'single-entry-all-tools';

function getMaxVisibleForDevice(
  _config: PriorityActionsConfigResolved,
  device: DeviceClass,
  mode: LauncherBreakpointMode,
): number {
  if (mode === 'single-entry-all-tools') return 1;
  return LAUNCHER_VISIBLE_CAP[device] ?? LAUNCHER_VISIBLE_CAP.desktop;
}

export function getLauncherVisibleCap(
  device: DeviceClass,
  mode: LauncherBreakpointMode = 'standard-row',
): number {
  if (mode === 'single-entry-all-tools') return 1;
  return (
    HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT[toHomepageLauncherDeviceClass(device)] ??
    HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT.desktop
  );
}

export function resolveByBreakpoint(
  items: readonly PriorityActionsItemNormalized[],
  config: PriorityActionsConfigResolved,
  device: DeviceClass,
  mode: LauncherBreakpointMode = 'standard-row',
): PriorityActionsBreakpointResult {
  const maxVisible = getMaxVisibleForDevice(config, device, mode);
  const overflowLabel = config.overflowLabel || 'More tools';

  if (mode === 'single-entry-all-tools') {
    return {
      primaryItems: items.length > 0 ? [items[0]!] : [],
      overflowItems: [...items],
      maxVisible,
      overflowLabel,
      mode,
      drawerSource: 'all-tools',
      capGovernance: 'all-tools-drawer',
    };
  }

  const forced: PriorityActionsItemNormalized[] = [];
  const eligible: PriorityActionsItemNormalized[] = [];

  for (const item of items) {
    if (item.overflowOnly) {
      forced.push(item);
    } else {
      eligible.push(item);
    }
  }

  const primaryItems = eligible.slice(0, maxVisible);
  const overflowItems = [...eligible.slice(maxVisible), ...forced];

  return {
    primaryItems,
    overflowItems,
    maxVisible,
    overflowLabel,
    mode,
    drawerSource: 'all-tools',
    capGovernance: 'binding-visible-cap',
  };
}

/* ── Combined pipeline ───────────────────────────────────────────── */

export interface PriorityActionsRenderModel {
  config: PriorityActionsConfigResolved;
  allItems: PriorityActionsItemNormalized[];
  breakpoint: PriorityActionsBreakpointResult;
}

export function buildPriorityActionsRenderModel(
  config: PriorityActionsConfigResolved,
  rawRows: readonly RawPriorityActionsItemRow[],
  activeAudience: string | undefined,
  device: DeviceClass,
  now: Date = new Date(),
  mode: LauncherBreakpointMode = 'standard-row',
): PriorityActionsRenderModel {
  let items = normalizeItemRows(rawRows);
  items = filterByAudience(items, activeAudience);
  items = filterBySchedule(items, now);
  items = filterByDevice(items, device);

  const breakpoint = resolveByBreakpoint(items, config, device, mode);

  return { config, allItems: items, breakpoint };
}
