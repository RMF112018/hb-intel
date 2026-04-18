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
  PriorityActionsAdminRow,
  PriorityActionsAdminRowLifecycle,
  PriorityActionsItemOperationPlan,
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

let rowKeyCounter = 0;

function nextRowKey(prefix: string): string {
  rowKeyCounter += 1;
  return `${prefix}-${rowKeyCounter}`;
}

function cloneDraft<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

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

export function createEmptyItemDraft(_: string): PriorityActionsItemDraft {
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

export function createAdminRowsFromNormalized(
  items: PriorityActionsItemNormalized[],
): PriorityActionsAdminRow[] {
  return items.map((item) => ({
    rowKey: `persisted-${item.id}`,
    persisted: {
      itemId: item.id,
      actionKey: item.actionKey,
      sortOrder: item.sortOrder,
    },
    draft: createItemDraftFromNormalized(item),
    markedForArchive: false,
  }));
}

export function createNewAdminRow(
  bandKey: string,
  explicitActionKey?: string,
): PriorityActionsAdminRow {
  const draft = createEmptyItemDraft(bandKey);
  draft.actionKey = explicitActionKey ?? `action-${Date.now()}`;
  return {
    rowKey: nextRowKey('new'),
    draft,
    markedForArchive: false,
  };
}

export function cloneAdminRows(rows: PriorityActionsAdminRow[]): PriorityActionsAdminRow[] {
  return cloneDraft(rows);
}

export function resequenceAdminRows(rows: PriorityActionsAdminRow[]): PriorityActionsAdminRow[] {
  let order = 10;
  return rows.map((row) => {
    if (row.markedForArchive) {
      return row;
    }
    const next = {
      ...row,
      draft: {
        ...row.draft,
        sortOrder: order,
      },
    };
    order += 10;
    return next;
  });
}

export function getActiveItemDrafts(rows: PriorityActionsAdminRow[]): PriorityActionsItemDraft[] {
  return rows
    .filter((row) => !row.markedForArchive)
    .map((row) => row.draft);
}

/* ── Dirty-state detection ───────────────────────────────────────── */

function stripForDirtyCompare(rows: PriorityActionsAdminRow[]): Array<{
  rowKey: string;
  persistedItemId?: number;
  markedForArchive: boolean;
  draft: PriorityActionsItemDraft;
}> {
  return rows.map((row) => ({
    rowKey: row.rowKey,
    persistedItemId: row.persisted?.itemId,
    markedForArchive: row.markedForArchive,
    draft: row.draft,
  }));
}

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
  drafts: PriorityActionsAdminRow[],
  baselines: PriorityActionsAdminRow[],
): boolean {
  return JSON.stringify(stripForDirtyCompare(drafts)) !== JSON.stringify(stripForDirtyCompare(baselines));
}

/* ── Operation planning ──────────────────────────────────────────── */

function buildBaselineById(rows: PriorityActionsAdminRow[]): Map<number, PriorityActionsAdminRow> {
  const result = new Map<number, PriorityActionsAdminRow>();
  for (const row of rows) {
    if (row.persisted?.itemId !== undefined) {
      result.set(row.persisted.itemId, row);
    }
  }
  return result;
}

function isOrderChanged(
  current: PriorityActionsAdminRow[],
  baseline: PriorityActionsAdminRow[],
): boolean {
  const currentPersisted = current
    .filter((row) => row.persisted && !row.markedForArchive)
    .map((row) => row.persisted!.itemId);

  const baselinePersisted = baseline
    .filter((row) => row.persisted)
    .map((row) => row.persisted!.itemId)
    .filter((id) => currentPersisted.includes(id));

  if (currentPersisted.length !== baselinePersisted.length) {
    return true;
  }

  return currentPersisted.some((id, index) => id !== baselinePersisted[index]);
}

export function planItemOperations(
  rows: PriorityActionsAdminRow[],
  baselineRows: PriorityActionsAdminRow[],
): PriorityActionsItemOperationPlan {
  const baselineById = buildBaselineById(baselineRows);
  const lifecycleByRowKey: Record<string, PriorityActionsAdminRowLifecycle> = {};

  const create: Array<{ rowKey: string; draft: PriorityActionsItemDraft }> = [];
  const update: Array<{ rowKey: string; itemId: number; draft: PriorityActionsItemDraft }> = [];
  const archive: Array<{ rowKey: string; itemId: number }> = [];

  for (const row of rows) {
    if (row.saveError) {
      lifecycleByRowKey[row.rowKey] = 'save-error';
      continue;
    }

    if (!row.persisted) {
      if (row.markedForArchive) {
        lifecycleByRowKey[row.rowKey] = 'persisted-unchanged';
        continue;
      }
      create.push({ rowKey: row.rowKey, draft: row.draft });
      lifecycleByRowKey[row.rowKey] = 'new';
      continue;
    }

    if (row.markedForArchive) {
      archive.push({ rowKey: row.rowKey, itemId: row.persisted.itemId });
      lifecycleByRowKey[row.rowKey] = 'marked-for-archive';
      continue;
    }

    const baseline = baselineById.get(row.persisted.itemId);
    const draftChanged = baseline ? JSON.stringify(row.draft) !== JSON.stringify(baseline.draft) : true;

    if (draftChanged) {
      update.push({ rowKey: row.rowKey, itemId: row.persisted.itemId, draft: row.draft });
      lifecycleByRowKey[row.rowKey] = 'persisted-edited';
    } else {
      lifecycleByRowKey[row.rowKey] = 'persisted-unchanged';
    }
  }

  const currentPersistedRows = rows.filter((row) => row.persisted && !row.markedForArchive);
  const reorderChanged = isOrderChanged(rows, baselineRows)
    || currentPersistedRows.some((row) => {
      const baseline = baselineById.get(row.persisted!.itemId);
      return !baseline || baseline.draft.sortOrder !== row.draft.sortOrder;
    });

  const reorder = reorderChanged
    ? currentPersistedRows.map((row) => ({
        itemId: row.persisted!.itemId,
        sortOrder: row.draft.sortOrder,
      }))
    : [];

  if (reorder.length > 0) {
    for (const row of currentPersistedRows) {
      if (lifecycleByRowKey[row.rowKey] === 'persisted-unchanged') {
        lifecycleByRowKey[row.rowKey] = 'pending-reorder';
      }
    }
  }

  return {
    create,
    update,
    archive,
    reorder,
    lifecycleByRowKey,
  };
}
