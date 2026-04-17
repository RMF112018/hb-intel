/**
 * Priority Actions admin draft state, dirty tracking, and permission model.
 *
 * Separates persisted SharePoint state from in-flight admin edits.
 * The admin UI mutates drafts; the writer commits them atomically.
 */
import type {
  PriorityActionsConfigResolved,
  PriorityActionsItemNormalized,
  PriorityActionsConfigDraft,
  PriorityActionsItemDraft,
} from './priorityActionsContracts.js';

/* ── Permission model ────────────────────────────────────────────── */

export interface PriorityActionsPermissions {
  canEdit: boolean;
  canPublish: boolean;
  canArchive: boolean;
  canReorder: boolean;
}

export const DEFAULT_PERMISSIONS: PriorityActionsPermissions = {
  canEdit: false,
  canPublish: false,
  canArchive: false,
  canReorder: false,
};

/* ── Save/load status ────────────────────────────────────────────── */

export type AdminLoadState = 'idle' | 'loading' | 'loaded' | 'load-error';
export type AdminSaveState = 'idle' | 'saving' | 'saved' | 'save-error';

export interface AdminStatusModel {
  loadState: AdminLoadState;
  saveState: AdminSaveState;
  loadError: string | undefined;
  saveError: string | undefined;
}

export const INITIAL_STATUS: AdminStatusModel = {
  loadState: 'idle',
  saveState: 'idle',
  loadError: undefined,
  saveError: undefined,
};

/* ── Persisted snapshot ──────────────────────────────────────────── */

export interface PriorityActionsPersistedSnapshot {
  config: PriorityActionsConfigResolved | undefined;
  items: PriorityActionsItemNormalized[];
  fetchedAt: number;
}

/* ── Draft factories ─────────────────────────────────────────────── */

export function createConfigDraftFromResolved(
  config: PriorityActionsConfigResolved,
): PriorityActionsConfigDraft {
  return {
    title: config.title,
    bandKey: config.bandKey,
    enabled: config.enabled,
    isActive: config.isActive,
    headingText: config.headingText,
    overflowLabel: config.overflowLabel,
    showHeading: config.showHeading,
    stickyAfterHero: config.stickyAfterHero,
    showBadges: config.showBadges,
    desktopLayoutMode: config.desktopLayoutMode,
    tabletLayoutMode: config.tabletLayoutMode,
    mobileLayoutMode: config.mobileLayoutMode,
    maxVisibleDesktop: config.maxVisibleDesktop,
    maxVisibleLaptop: config.maxVisibleLaptop,
    maxVisibleTabletLandscape: config.maxVisibleTabletLandscape,
    maxVisibleTabletPortrait: config.maxVisibleTabletPortrait,
    maxVisiblePhone: config.maxVisiblePhone,
    openExternalInNewTabByDefault: config.openExternalInNewTabByDefault,
    adminNotes: config.adminNotes,
  };
}

export function createItemDraftFromNormalized(
  item: PriorityActionsItemNormalized,
): PriorityActionsItemDraft {
  return {
    actionKey: item.actionKey,
    title: item.title,
    href: item.href,
    description: item.description,
    iconKey: item.iconKey,
    badgeLabel: item.badgeLabel,
    badgeVariant: item.badgeVariant,
    priority: item.priority,
    groupKey: item.groupKey,
    groupTitle: item.groupTitle,
    sortOrder: item.sortOrder,
    overflowOnly: item.overflowOnly,
    mobilePriority: item.mobilePriority,
    audienceMode: item.audienceMode,
    audienceKeys: [...item.audienceKeys],
    isExternal: item.isExternal,
    openInNewTab: item.openInNewTab,
    visibleDesktop: item.visibleDesktop,
    visibleLaptop: item.visibleLaptop,
    visibleTabletLandscape: item.visibleTabletLandscape,
    visibleTabletPortrait: item.visibleTabletPortrait,
    visiblePhone: item.visiblePhone,
    startsAtUtc: item.startsAtUtc ?? '',
    endsAtUtc: item.endsAtUtc ?? '',
  };
}

export function createEmptyItemDraft(bandKey: string): PriorityActionsItemDraft {
  return {
    actionKey: '',
    title: '',
    href: '',
    description: '',
    iconKey: '',
    badgeLabel: '',
    badgeVariant: 'neutral',
    priority: 'primary',
    groupKey: '',
    groupTitle: '',
    sortOrder: 100,
    overflowOnly: false,
    mobilePriority: 100,
    audienceMode: 'all',
    audienceKeys: [],
    isExternal: false,
    openInNewTab: false,
    visibleDesktop: true,
    visibleLaptop: true,
    visibleTabletLandscape: true,
    visibleTabletPortrait: true,
    visiblePhone: true,
    startsAtUtc: '',
    endsAtUtc: '',
  };
}

/* ── Dirty-state detection ───────────────────────────────────────── */

export function isConfigDirty(
  draft: PriorityActionsConfigDraft,
  baseline: PriorityActionsConfigDraft,
): boolean {
  return JSON.stringify(draft) !== JSON.stringify(baseline);
}

export function isItemDirty(
  draft: PriorityActionsItemDraft,
  baseline: PriorityActionsItemDraft,
): boolean {
  return JSON.stringify(draft) !== JSON.stringify(baseline);
}

export function isAnyItemDirty(
  drafts: PriorityActionsItemDraft[],
  baselines: PriorityActionsItemDraft[],
): boolean {
  if (drafts.length !== baselines.length) return true;
  return drafts.some((draft, i) => isItemDirty(draft, baselines[i]));
}
