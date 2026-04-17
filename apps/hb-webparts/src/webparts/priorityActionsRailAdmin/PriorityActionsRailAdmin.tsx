/**
 * PriorityActionsRailAdmin — Maintainer authoring surface for the
 * Priority Actions command band.
 */
import * as React from 'react';
import {
  HbcPriorityRailPreviewSurface,
  HbcPriorityRailSkeleton,
  AlertCircle,
  CheckCircle2,
  type PriorityRailActionModel,
  type PriorityRailUrgency,
} from '@hbc/ui-kit/homepage';
import { getSiteUrl } from '../../homepage/data/spContext.js';
import { fetchPriorityActionsConfigWithDiagnostics } from '../../homepage/data/priorityActionsConfigListSource.js';
import { fetchPriorityActionsItems } from '../../homepage/data/priorityActionsItemsListSource.js';
import { normalizeItemRows, type DeviceClass } from '../../homepage/data/priorityActionsNormalization.js';
import { invalidatePriorityActionsCache } from '../../homepage/data/usePriorityActionsData.js';
import {
  buildPriorityRailSections,
  resolvePriorityRailPresentationForDevice,
} from '../../homepage/data/priorityActionsPresentation.js';
import {
  createConfigDraftFromResolved,
  createAdminRowsFromNormalized,
  createNewAdminRow,
  getActiveItemDrafts,
  cloneAdminRows,
  resequenceAdminRows,
  isConfigDirty,
  isAnyItemDirty,
  planItemOperations,
  type AdminLoadState,
  type AdminSaveState,
} from '../../homepage/data/priorityActionsAdminState.js';
import { validateItem, validatePriorityRailDraft } from '../../homepage/data/priorityActionsValidation.js';
import {
  savePriorityRailBandConfig,
  savePriorityRailItems,
  archivePriorityRailItem,
  reorderPriorityRailItems,
} from '../../homepage/data/priorityActionsListWriter.js';
import { resolvePriorityActionsAdminPermissions } from '../../homepage/data/priorityActionsAdminPermissions.js';
import { PRIORITY_ACTIONS_GOVERNED_ICON_KEYS } from '../../homepage/data/priorityActionsGovernance.js';
import type {
  PriorityActionsConfigResolved,
  PriorityActionsConfigDraft,
  PriorityActionsValidationIssue,
  PriorityActionsAdminRow,
  PriorityActionsItemDraft,
  PriorityActionsValidationContext,
  PriorityActionsAdminPermissionResolution,
  PriorityActionsAdminRowStatusChip,
} from '../../homepage/data/priorityActionsContracts.js';
import styles from './priority-actions-rail-admin.module.css';

export interface PriorityActionsRailAdminProps {
  siteUrl?: string;
}

type PreviewDevice = DeviceClass;
type LibraryFilter = 'all' | 'invalid' | 'new' | 'edited' | 'reordered' | 'archive-intent';

const PREVIEW_DEVICE_LABELS: Readonly<Record<PreviewDevice, string>> = Object.freeze({
  desktop: 'Desktop',
  laptop: 'Laptop',
  tabletLandscape: 'Tablet Landscape',
  tabletPortrait: 'Tablet Portrait',
  phone: 'Phone',
});

const LIBRARY_FILTER_LABELS: Readonly<Record<LibraryFilter, string>> = Object.freeze({
  all: 'All',
  invalid: 'Invalid',
  new: 'New',
  edited: 'Edited',
  reordered: 'Reordered',
  'archive-intent': 'Archive intent',
});

function firstFailure(results: Array<{ ok: boolean; error?: string }>): string | undefined {
  const failed = results.find((result) => !result.ok);
  return failed?.error;
}

function formatScheduleInput(iso: string): string {
  return iso ? iso.slice(0, 16) : '';
}

function parseDateTimeInput(value: string): string {
  if (!value) return '';
  return new Date(value).toISOString();
}

function isScheduleActive(draft: PriorityActionsItemDraft, now: Date): boolean {
  const start = draft.startsAtUtc ? new Date(draft.startsAtUtc) : undefined;
  const end = draft.endsAtUtc ? new Date(draft.endsAtUtc) : undefined;
  if (start && !Number.isNaN(start.getTime()) && now < start) return false;
  if (end && !Number.isNaN(end.getTime()) && now >= end) return false;
  return true;
}

function rowMatchesSearch(row: PriorityActionsAdminRow, query: string): boolean {
  if (!query) return true;
  const haystack = [
    row.draft.title,
    row.draft.actionKey,
    row.draft.href,
    row.draft.groupKey,
    row.draft.groupTitle,
  ].join(' ').toLowerCase();
  return haystack.includes(query);
}

function rowHasChip(chips: PriorityActionsAdminRowStatusChip[], chip: PriorityActionsAdminRowStatusChip): boolean {
  return chips.includes(chip);
}

export function PriorityActionsRailAdmin({ siteUrl: siteUrlProp }: PriorityActionsRailAdminProps): React.JSX.Element {
  const siteUrl = siteUrlProp ?? getSiteUrl();

  const [loadState, setLoadState] = React.useState<AdminLoadState>('idle');
  const [saveState, setSaveState] = React.useState<AdminSaveState>('idle');
  const [loadError, setLoadError] = React.useState<string>();
  const [saveError, setSaveError] = React.useState<string>();

  const [permissionResolution, setPermissionResolution] = React.useState<PriorityActionsAdminPermissionResolution>();

  const [resolvedConfig, setResolvedConfig] = React.useState<PriorityActionsConfigResolved>();
  const [validationContext, setValidationContext] = React.useState<PriorityActionsValidationContext>({});

  const [configDraft, setConfigDraft] = React.useState<PriorityActionsConfigDraft>();
  const [itemRows, setItemRows] = React.useState<PriorityActionsAdminRow[]>([]);
  const [baselineConfig, setBaselineConfig] = React.useState<PriorityActionsConfigDraft>();
  const [baselineRows, setBaselineRows] = React.useState<PriorityActionsAdminRow[]>([]);

  const [selectedRowKey, setSelectedRowKey] = React.useState<string>();
  const [showDiscardDialog, setShowDiscardDialog] = React.useState(false);
  const [previewDevice, setPreviewDevice] = React.useState<PreviewDevice>('desktop');
  const [librarySearch, setLibrarySearch] = React.useState('');
  const [libraryFilter, setLibraryFilter] = React.useState<LibraryFilter>('all');

  const canView = permissionResolution?.permissions.canView ?? true;
  const canEdit = permissionResolution?.permissions.canEdit ?? true;
  const canPublish = permissionResolution?.permissions.canPublish ?? true;
  const canReorder = permissionResolution?.permissions.canReorder ?? true;
  const canArchive = permissionResolution?.permissions.canArchive ?? true;

  const activeItemRows = React.useMemo(
    () => itemRows.filter((row) => !row.markedForArchive),
    [itemRows],
  );

  const activePositionByRowKey = React.useMemo(() => {
    const positions = new Map<string, number>();
    for (let index = 0; index < activeItemRows.length; index += 1) {
      positions.set(activeItemRows[index].rowKey, index);
    }
    return positions;
  }, [activeItemRows]);

  const isDirty = React.useMemo(() => {
    if (!configDraft || !baselineConfig) return false;
    return isConfigDirty(configDraft, baselineConfig) || isAnyItemDirty(itemRows, baselineRows);
  }, [configDraft, baselineConfig, itemRows, baselineRows]);

  const validation = React.useMemo(() => {
    if (!configDraft) return { valid: true, issues: [] as PriorityActionsValidationIssue[] };
    return validatePriorityRailDraft(configDraft, getActiveItemDrafts(itemRows), validationContext);
  }, [configDraft, itemRows, validationContext]);

  const rowValidationMap = React.useMemo(() => {
    const map = new Map<string, PriorityActionsValidationIssue[]>();
    const activeRows = itemRows.filter((row) => !row.markedForArchive);
    for (let index = 0; index < activeRows.length; index += 1) {
      map.set(activeRows[index].rowKey, validateItem(activeRows[index].draft, index));
    }
    return map;
  }, [itemRows]);

  const operationPlan = React.useMemo(() => planItemOperations(itemRows, baselineRows), [itemRows, baselineRows]);

  const rowStatusChips = React.useMemo(() => {
    const chipsByRow = new Map<string, PriorityActionsAdminRowStatusChip[]>();
    for (const row of itemRows) {
      const chips: PriorityActionsAdminRowStatusChip[] = [];
      const lifecycle = operationPlan.lifecycleByRowKey[row.rowKey];
      const issueCount = rowValidationMap.get(row.rowKey)?.length ?? 0;

      if (lifecycle === 'new') chips.push('new');
      if (lifecycle === 'persisted-edited') chips.push('edited');
      if (lifecycle === 'pending-reorder') chips.push('reordered');
      if (row.markedForArchive) chips.push('archive-intent');
      if (issueCount > 0) chips.push('invalid');
      if (chips.length === 0) chips.push('persisted');

      chipsByRow.set(row.rowKey, chips);
    }
    return chipsByRow;
  }, [itemRows, operationPlan.lifecycleByRowKey, rowValidationMap]);

  const selectedItem = React.useMemo(
    () => itemRows.find((row) => row.rowKey === selectedRowKey),
    [itemRows, selectedRowKey],
  );

  const filteredRows = React.useMemo(() => {
    const query = librarySearch.trim().toLowerCase();
    return itemRows.filter((row) => {
      if (!rowMatchesSearch(row, query)) return false;
      const chips = rowStatusChips.get(row.rowKey) ?? [];
      if (libraryFilter === 'all') return true;
      if (libraryFilter === 'invalid') return rowHasChip(chips, 'invalid');
      if (libraryFilter === 'new') return rowHasChip(chips, 'new');
      if (libraryFilter === 'edited') return rowHasChip(chips, 'edited');
      if (libraryFilter === 'reordered') return rowHasChip(chips, 'reordered');
      return rowHasChip(chips, 'archive-intent');
    });
  }, [itemRows, libraryFilter, librarySearch, rowStatusChips]);

  const filterCounts = React.useMemo(() => {
    const next: Record<LibraryFilter, number> = {
      all: itemRows.length,
      invalid: 0,
      new: 0,
      edited: 0,
      reordered: 0,
      'archive-intent': 0,
    };
    for (const row of itemRows) {
      const chips = rowStatusChips.get(row.rowKey) ?? [];
      if (chips.includes('invalid')) next.invalid += 1;
      if (chips.includes('new')) next.new += 1;
      if (chips.includes('edited')) next.edited += 1;
      if (chips.includes('reordered')) next.reordered += 1;
      if (chips.includes('archive-intent')) next['archive-intent'] += 1;
    }
    return next;
  }, [itemRows, rowStatusChips]);

  const previewRows = React.useMemo(() => {
    const now = new Date();
    return itemRows
      .filter((row) => !row.markedForArchive)
      .map((row) => {
        const reasons: string[] = [];
        const draft = row.draft;

        if (!draft.title.trim() || !draft.href.trim()) reasons.push('missing-required');
        if (draft.audienceMode !== 'all') reasons.push('audience-targeted');
        if (!isScheduleActive(draft, now)) reasons.push('schedule-inactive');

        const visibleOnDevice = previewDevice === 'desktop'
          ? draft.visibleDesktop
          : previewDevice === 'laptop'
            ? draft.visibleLaptop
            : previewDevice === 'tabletLandscape'
              ? draft.visibleTabletLandscape
              : previewDevice === 'tabletPortrait'
                ? draft.visibleTabletPortrait
                : draft.visiblePhone;

        if (!visibleOnDevice) reasons.push('device-hidden');
        if ((rowValidationMap.get(row.rowKey)?.length ?? 0) > 0) reasons.push('invalid');

        return {
          row,
          include: reasons.length === 0,
          reasons,
        };
      });
  }, [itemRows, previewDevice, rowValidationMap]);

  const previewExclusionCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      'missing-required': 0,
      'device-hidden': 0,
      'schedule-inactive': 0,
      'audience-targeted': 0,
      invalid: 0,
    };
    for (const result of previewRows) {
      for (const reason of result.reasons) {
        counts[reason] += 1;
      }
    }
    return counts;
  }, [previewRows]);

  const previewDrafts = React.useMemo(() => previewRows.filter((entry) => entry.include).map((entry) => entry.row.draft), [previewRows]);

  const previewItems: PriorityRailActionModel[] = React.useMemo(() => {
    return previewDrafts.map((d) => ({
      id: d.actionKey,
      title: d.title,
      href: d.href,
      description: d.description || undefined,
      badge: d.badgeLabel ? { label: d.badgeLabel, variant: d.badgeVariant } : undefined,
      external: d.isExternal,
      groupKey: d.groupKey || undefined,
      groupTitle: d.groupTitle || undefined,
    }));
  }, [previewDrafts]);

  const previewUrgency: PriorityRailUrgency = React.useMemo(() => {
    if (previewItems.some((item) => item.badge?.variant === 'critical')) return 'critical';
    if (previewItems.some((item) => item.badge?.variant === 'warning')) return 'high';
    return 'default';
  }, [previewItems]);

  const previewMaxVisible = React.useMemo(() => {
    if (!configDraft) return 5;
    switch (previewDevice) {
      case 'desktop': return configDraft.maxVisibleDesktop;
      case 'laptop': return configDraft.maxVisibleLaptop;
      case 'tabletLandscape': return configDraft.maxVisibleTabletLandscape;
      case 'tabletPortrait': return configDraft.maxVisibleTabletPortrait;
      case 'phone': return configDraft.maxVisiblePhone;
      default: return configDraft.maxVisibleDesktop;
    }
  }, [configDraft, previewDevice]);

  const previewPresentation = React.useMemo(() => {
    if (!configDraft) {
      return {
        deviceClass: previewDevice,
        shellState: 'standard-laptop' as const,
        layout: previewDevice === 'phone' ? 'compact' : 'rail',
        overflowStrategy: 'inline-disclosure' as const,
        authoredLayoutMode: previewDevice === 'phone' ? 'scroll' : 'rail',
        normalizations: [],
      };
    }
    return resolvePriorityRailPresentationForDevice(configDraft, previewDevice);
  }, [configDraft, previewDevice]) as ReturnType<typeof resolvePriorityRailPresentationForDevice>;

  const previewPrimaryItems = React.useMemo(() => {
    const forced: PriorityRailActionModel[] = [];
    const eligible: PriorityRailActionModel[] = [];

    for (let index = 0; index < previewDrafts.length; index += 1) {
      const draft = previewDrafts[index];
      const action = previewItems[index];
      if (!action) continue;
      if (draft.overflowOnly) {
        forced.push(action);
      } else {
        eligible.push(action);
      }
    }

    return {
      primary: eligible.slice(0, previewMaxVisible),
      overflow: [...eligible.slice(previewMaxVisible), ...forced],
    };
  }, [previewDrafts, previewItems, previewMaxVisible]);

  const previewNormalizationLabel = React.useMemo(() => {
    if (previewPresentation.normalizations.length === 0) {
      return `${previewPresentation.authoredLayoutMode} -> ${previewPresentation.layout}`;
    }
    return `${previewPresentation.authoredLayoutMode} -> ${previewPresentation.layout} (${previewPresentation.normalizations.join(', ')})`;
  }, [previewPresentation]);

  const previewSurfaceProps = React.useMemo(
    () => ({
      title: configDraft?.showHeading ? configDraft.headingText || 'Priority Actions' : undefined,
      urgency: previewUrgency,
      layout: previewPresentation.layout,
      items: previewPrimaryItems.primary,
      sections: buildPriorityRailSections(previewPrimaryItems.primary),
      overflowItems: previewPrimaryItems.overflow,
      overflowLabel: configDraft?.overflowLabel ?? 'More',
      overflowStrategy: previewPresentation.overflowStrategy,
      showBadges: Boolean(configDraft?.showBadges),
      previewLabel: `Admin Preview - ${PREVIEW_DEVICE_LABELS[previewDevice]}`,
    }),
    [configDraft, previewDevice, previewPresentation.layout, previewPresentation.overflowStrategy, previewPrimaryItems.overflow, previewPrimaryItems.primary, previewUrgency],
  );

  const loadData = React.useCallback(async () => {
    setLoadState('loading');
    setLoadError(undefined);
    try {
      const permissions = await resolvePriorityActionsAdminPermissions(siteUrl);
      setPermissionResolution(permissions);

      if (!siteUrl) {
        setLoadState('load-error');
        setLoadError('No SharePoint site URL available.');
        return;
      }

      if (!permissions.permissions.canView) {
        setResolvedConfig(undefined);
        setConfigDraft(undefined);
        setBaselineConfig(undefined);
        setItemRows([]);
        setBaselineRows([]);
        setSelectedRowKey(undefined);
        setLoadState('loaded');
        return;
      }

      const [{ config, activeConfigCountForBand }, rawItems] = await Promise.all([
        fetchPriorityActionsConfigWithDiagnostics(siteUrl),
        fetchPriorityActionsItems(siteUrl),
      ]);
      const normalizedItems = normalizeItemRows(rawItems);

      setResolvedConfig(config);
      setValidationContext({ activeConfigCountForBand });

      if (config) {
        const nextConfigDraft = createConfigDraftFromResolved(config);
        setConfigDraft(nextConfigDraft);
        setBaselineConfig(JSON.parse(JSON.stringify(nextConfigDraft)));
      }

      const nextRows = resequenceAdminRows(createAdminRowsFromNormalized(normalizedItems));
      setItemRows(nextRows);
      setBaselineRows(cloneAdminRows(nextRows));
      setSelectedRowKey(undefined);
      setLoadState('loaded');
    } catch (err) {
      setLoadState('load-error');
      setLoadError(err instanceof Error ? err.message : 'Failed to load data.');
    }
  }, [siteUrl]);

  React.useEffect(() => { void loadData(); }, [loadData]);

  const runPersist = React.useCallback(async () => {
    if (!siteUrl || !configDraft) return;
    if (!validation.valid) return;
    if (!canPublish) {
      setSaveState('save-error');
      setSaveError('Publish is not available for your permission posture.');
      return;
    }

    setSaveState('saving');
    setSaveError(undefined);

    try {
      const configResult = await savePriorityRailBandConfig(siteUrl, resolvedConfig?.id, configDraft);
      if (!configResult.ok) {
        setSaveState('save-error');
        setSaveError(configResult.error);
        return;
      }

      const plan = planItemOperations(itemRows, baselineRows);

      const itemWriteResults = await savePriorityRailItems(
        siteUrl,
        [
          ...plan.update.map((entry) => ({ itemId: entry.itemId, draft: entry.draft })),
          ...plan.create.map((entry) => ({ itemId: undefined, draft: entry.draft })),
        ],
        configDraft.bandKey,
      );
      const writeFailure = firstFailure(itemWriteResults);
      if (writeFailure) {
        setSaveState('save-error');
        setSaveError(writeFailure);
        return;
      }

      for (const archiveOp of plan.archive) {
        const result = await archivePriorityRailItem(siteUrl, archiveOp.itemId);
        if (!result.ok) {
          setSaveState('save-error');
          setSaveError(result.error);
          return;
        }
      }

      if (plan.reorder.length > 0) {
        const reorderResults = await reorderPriorityRailItems(siteUrl, plan.reorder);
        const reorderFailure = firstFailure(reorderResults);
        if (reorderFailure) {
          setSaveState('save-error');
          setSaveError(reorderFailure);
          return;
        }
      }

      invalidatePriorityActionsCache();
      setSaveState('saved');
      await loadData();
    } catch (err) {
      setSaveState('save-error');
      setSaveError(err instanceof Error ? err.message : 'Publish failed.');
    }
  }, [siteUrl, configDraft, validation.valid, canPublish, resolvedConfig?.id, itemRows, baselineRows, loadData]);

  const handleDiscard = React.useCallback(() => {
    if (baselineConfig) {
      setConfigDraft(JSON.parse(JSON.stringify(baselineConfig)));
      setItemRows(cloneAdminRows(baselineRows));
      setSelectedRowKey(undefined);
    }
    setShowDiscardDialog(false);
    setSaveState('idle');
    setSaveError(undefined);
  }, [baselineConfig, baselineRows]);

  const handleAddItem = React.useCallback(() => {
    if (!canEdit) return;
    const bandKey = configDraft?.bandKey ?? 'homepage-primary';
    const newRow = createNewAdminRow(bandKey);

    setItemRows((prev) => resequenceAdminRows([...prev, newRow]));
    setSelectedRowKey(newRow.rowKey);
  }, [canEdit, configDraft]);

  const handleToggleArchiveItem = React.useCallback((rowKey: string) => {
    if (!canArchive) return;
    setItemRows((prev) => {
      const next = prev.map((row) => (row.rowKey === rowKey ? { ...row, markedForArchive: !row.markedForArchive } : row));
      return resequenceAdminRows(next);
    });
    if (selectedRowKey === rowKey) {
      setSelectedRowKey(undefined);
    }
  }, [canArchive, selectedRowKey]);

  const handleMoveItem = React.useCallback((rowKey: string, direction: -1 | 1) => {
    if (!canReorder) return;
    setItemRows((prev) => {
      const next = [...prev];
      const activeIndexes = next
        .map((row, index) => ({ row, index }))
        .filter((entry) => !entry.row.markedForArchive);

      const fromActiveIndex = activeIndexes.findIndex((entry) => entry.row.rowKey === rowKey);
      const toActiveIndex = fromActiveIndex + direction;
      if (fromActiveIndex < 0 || toActiveIndex < 0 || toActiveIndex >= activeIndexes.length) {
        return prev;
      }

      const fromIndex = activeIndexes[fromActiveIndex].index;
      const toIndex = activeIndexes[toActiveIndex].index;
      [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
      return resequenceAdminRows(next);
    });
    setSelectedRowKey(rowKey);
  }, [canReorder]);

  const updateItemDraft = React.useCallback((rowKey: string, patch: Partial<PriorityActionsItemDraft>) => {
    if (!canEdit) return;
    setItemRows((prev) => prev.map((row) => (row.rowKey === rowKey ? { ...row, draft: { ...row.draft, ...patch } } : row)));
  }, [canEdit]);

  const updateConfigDraft = React.useCallback((patch: Partial<PriorityActionsConfigDraft>) => {
    if (!canEdit) return;
    setConfigDraft((prev) => prev ? { ...prev, ...patch } : prev);
  }, [canEdit]);

  if (loadState === 'loading') {
    return (
      <div className={styles.workspace}>
        <div className={styles.section}>
          <div className={`${styles.statusBanner} ${styles.statusInfo}`}>Loading Priority Actions maintainer workspace…</div>
          <HbcPriorityRailSkeleton count={3} />
        </div>
      </div>
    );
  }

  if (loadState === 'load-error') {
    return (
      <div className={styles.workspace}>
        <div className={`${styles.statusBanner} ${styles.statusError}`} role="alert">
          <AlertCircle size={16} />
          <span>{loadError ?? 'Failed to load.'}</span>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.primaryButton} onClick={() => void loadData()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!configDraft && canView) {
    return (
      <div className={styles.workspace}>
        <div className={`${styles.statusBanner} ${styles.statusWarning}`}>
          No active config row found. A new config will be created on publish.
        </div>
      </div>
    );
  }

  const permissionBannerClass = permissionResolution?.posture === 'editable'
    ? styles.permissionBannerEditable
    : permissionResolution?.posture === 'read-only'
      ? styles.permissionBannerReadonly
      : styles.permissionBannerInsufficient;

  return (
    <div className={styles.workspace}>
      <div className={styles.section}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Priority Actions Maintainer</h1>
            <div className={styles.help}>Permission-aware admin authoring workspace</div>
          </div>
          <div className={styles.postureChip}>{permissionResolution?.posture ?? 'editable'}</div>
        </div>

        {permissionResolution && (
          <div className={`${styles.permissionBanner} ${permissionBannerClass}`} role="status">
            {permissionResolution.status === 'resolution-failed'
              ? `Permission resolution failed; actions are fail-closed. ${permissionResolution.reason ?? ''}`
              : permissionResolution.posture === 'editable'
                ? 'You can edit, reorder, archive, and publish.'
                : permissionResolution.posture === 'read-only'
                  ? 'Read-only posture: browsing and preview are available, publish/destructive actions are disabled.'
                  : 'Insufficient permission: this surface cannot load editable authoring data.'}
          </div>
        )}

        {saveState === 'saved' && (
          <div className={`${styles.statusBanner} ${styles.statusSuccess}`}>
            <CheckCircle2 size={16} /> Published successfully.
          </div>
        )}
        {saveState === 'save-error' && (
          <div className={`${styles.statusBanner} ${styles.statusError}`} role="alert">
            <AlertCircle size={16} /> {saveError ?? 'Publish failed.'}
          </div>
        )}
      </div>

      {!canView ? null : (
        <>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>Band Settings</h2>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Config Name</label>
              <input className={styles.input} value={configDraft?.title ?? ''} onChange={(e) => updateConfigDraft({ title: e.target.value })} disabled={!canEdit} />
            </div>
            <div className={styles.fieldRowInlineWrap}>
              <div className={styles.checkboxRow}>
                <input type="checkbox" checked={Boolean(configDraft?.showHeading)} onChange={(e) => updateConfigDraft({ showHeading: e.target.checked })} disabled={!canEdit} />
                <span className={styles.label}>Show heading</span>
              </div>
              <div className={styles.checkboxRow}>
                <input type="checkbox" checked={Boolean(configDraft?.showBadges)} onChange={(e) => updateConfigDraft({ showBadges: e.target.checked })} disabled={!canEdit} />
                <span className={styles.label}>Show badges</span>
              </div>
              <div className={styles.checkboxRow}>
                <input type="checkbox" checked={Boolean(configDraft?.stickyAfterHero)} onChange={(e) => updateConfigDraft({ stickyAfterHero: e.target.checked })} disabled={!canEdit} />
                <span className={styles.label}>Sticky after hero</span>
              </div>
            </div>
            {configDraft?.showHeading && (
              <div className={styles.fieldRow}>
                <label className={styles.label}>Heading Text</label>
                <input className={styles.input} value={configDraft.headingText} onChange={(e) => updateConfigDraft({ headingText: e.target.value })} disabled={!canEdit} />
              </div>
            )}
            <div className={styles.fieldRowInlineWrap}>
              <div className={styles.fieldRow}>
                <label className={styles.label}>Desktop Layout</label>
                <select className={styles.select} value={configDraft?.desktopLayoutMode ?? 'rail'} onChange={(e) => updateConfigDraft({ desktopLayoutMode: e.target.value as PriorityActionsConfigDraft['desktopLayoutMode'] })} disabled={!canEdit}>
                  <option value="rail">Rail</option>
                  <option value="segmented">Segmented</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className={styles.fieldRow}>
                <label className={styles.label}>Tablet Layout</label>
                <select className={styles.select} value={configDraft?.tabletLayoutMode ?? 'grid'} onChange={(e) => updateConfigDraft({ tabletLayoutMode: e.target.value as PriorityActionsConfigDraft['tabletLayoutMode'] })} disabled={!canEdit}>
                  <option value="grid">Grid</option>
                  <option value="rail">Rail</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className={styles.fieldRow}>
                <label className={styles.label}>Mobile Layout</label>
                <select className={styles.select} value={configDraft?.mobileLayoutMode ?? 'sheet-trigger'} onChange={(e) => updateConfigDraft({ mobileLayoutMode: e.target.value as PriorityActionsConfigDraft['mobileLayoutMode'] })} disabled={!canEdit}>
                  <option value="grid">Grid</option>
                  <option value="scroll">Scroll</option>
                  <option value="sheet-trigger">Sheet Trigger</option>
                </select>
              </div>
            </div>
            <div className={styles.fieldRowInlineWrap}>
              <div className={styles.fieldRow}>
                <label className={styles.label}>Max Desktop</label>
                <input type="number" className={`${styles.input} ${styles.inputSmall}`} value={configDraft?.maxVisibleDesktop ?? 5} min={1} max={20} onChange={(e) => updateConfigDraft({ maxVisibleDesktop: parseInt(e.target.value, 10) || 5 })} disabled={!canEdit} />
              </div>
              <div className={styles.fieldRow}>
                <label className={styles.label}>Max Laptop</label>
                <input type="number" className={`${styles.input} ${styles.inputSmall}`} value={configDraft?.maxVisibleLaptop ?? 5} min={1} max={20} onChange={(e) => updateConfigDraft({ maxVisibleLaptop: parseInt(e.target.value, 10) || 5 })} disabled={!canEdit} />
              </div>
              <div className={styles.fieldRow}>
                <label className={styles.label}>Max Tablet Portrait</label>
                <input type="number" className={`${styles.input} ${styles.inputSmall}`} value={configDraft?.maxVisibleTabletPortrait ?? 4} min={1} max={20} onChange={(e) => updateConfigDraft({ maxVisibleTabletPortrait: parseInt(e.target.value, 10) || 4 })} disabled={!canEdit} />
              </div>
              <div className={styles.fieldRow}>
                <label className={styles.label}>Max Phone</label>
                <input type="number" className={`${styles.input} ${styles.inputSmall}`} value={configDraft?.maxVisiblePhone ?? 4} min={1} max={20} onChange={(e) => updateConfigDraft({ maxVisiblePhone: parseInt(e.target.value, 10) || 4 })} disabled={!canEdit} />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>Action Library ({activeItemRows.length} active)</h2>
            <div className={styles.libraryControls}>
              <input
                className={styles.input}
                placeholder="Search title, action key, URL, group"
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
              />
              <div className={styles.filterBar}>
                {(Object.keys(LIBRARY_FILTER_LABELS) as LibraryFilter[]).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={filter === libraryFilter ? styles.filterChipActive : styles.filterChip}
                    onClick={() => setLibraryFilter(filter)}
                  >
                    {LIBRARY_FILTER_LABELS[filter]} ({filterCounts[filter]})
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.itemList}>
              {filteredRows.map((row) => {
                const item = row.draft;
                const activePosition = activePositionByRowKey.get(row.rowKey) ?? -1;
                const isArchived = row.markedForArchive;
                const chips = rowStatusChips.get(row.rowKey) ?? [];
                const rowIssues = rowValidationMap.get(row.rowKey) ?? [];
                return (
                  <div
                    key={row.rowKey}
                    className={`${styles.itemCard} ${row.rowKey === selectedRowKey ? styles.itemCardSelected : ''}`}
                    onClick={() => setSelectedRowKey(row.rowKey === selectedRowKey ? undefined : row.rowKey)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedRowKey(row.rowKey === selectedRowKey ? undefined : row.rowKey);
                      }
                    }}
                  >
                    <div className={styles.itemCardMain}>
                      <span className={styles.itemCardTitle}>
                        {item.title || '(untitled)'}
                      </span>
                      <span className={styles.itemCardMeta}>
                        {activePosition >= 0 ? `#${activePosition + 1}` : '#—'} · {item.priority} · {item.actionKey || 'no-key'}
                      </span>
                      <div className={styles.itemChipRow}>
                        {chips.map((chip) => (
                          <span key={`${row.rowKey}-${chip}`} className={styles.itemChip}>{chip}</span>
                        ))}
                        {rowIssues.length > 0 && (
                          <span className={styles.itemIssueCount}>{rowIssues.length} issue{rowIssues.length === 1 ? '' : 's'}</span>
                        )}
                        {isArchived && <span className={styles.itemIssueCount}>Archived on publish</span>}
                      </div>
                    </div>
                    <div className={styles.itemCardActions}>
                      <button
                        type="button"
                        className={styles.smallButton}
                        disabled={!canReorder || isArchived || activePosition <= 0}
                        onClick={(e) => { e.stopPropagation(); handleMoveItem(row.rowKey, -1); }}
                        aria-label="Move up"
                      >↑</button>
                      <button
                        type="button"
                        className={styles.smallButton}
                        disabled={!canReorder || isArchived || activePosition < 0 || activePosition >= activeItemRows.length - 1}
                        onClick={(e) => { e.stopPropagation(); handleMoveItem(row.rowKey, 1); }}
                        aria-label="Move down"
                      >↓</button>
                      <button
                        type="button"
                        className={isArchived ? styles.smallButton : styles.dangerButton}
                        disabled={!canArchive}
                        onClick={(e) => { e.stopPropagation(); handleToggleArchiveItem(row.rowKey); }}
                        aria-label={isArchived ? 'Restore' : 'Archive'}
                      >{isArchived ? '↺' : '✕'}</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={handleAddItem} disabled={!canEdit}>+ Add Action</button>
            </div>
          </div>

          {selectedItem && !selectedItem.markedForArchive && (
            <div className={styles.section}>
              <h2 className={styles.sectionHeading}>Item Editor: {selectedItem.draft.title || '(new)'}</h2>

              <div className={styles.editorGroup}>
                <h3 className={styles.editorGroupHeading}>Identity and Link Behavior</h3>
                <div className={styles.fieldRowInlineWrap}>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>Action Key</label>
                    <input className={styles.input} value={selectedItem.draft.actionKey} onChange={(e) => updateItemDraft(selectedItem.rowKey, { actionKey: e.target.value })} disabled={!canEdit} />
                    <span className={styles.help}>Stable write identity; avoid changing after publish.</span>
                  </div>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>Title *</label>
                    <input className={styles.input} value={selectedItem.draft.title} onChange={(e) => updateItemDraft(selectedItem.rowKey, { title: e.target.value })} disabled={!canEdit} />
                  </div>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>URL *</label>
                    <input className={styles.input} value={selectedItem.draft.href} onChange={(e) => updateItemDraft(selectedItem.rowKey, { href: e.target.value })} disabled={!canEdit} />
                  </div>
                </div>
                <div className={styles.fieldRowInlineWrap}>
                  <div className={styles.checkboxRow}>
                    <input type="checkbox" checked={selectedItem.draft.isExternal} onChange={(e) => updateItemDraft(selectedItem.rowKey, { isExternal: e.target.checked })} disabled={!canEdit} />
                    <span className={styles.label}>External link</span>
                  </div>
                  <div className={styles.checkboxRow}>
                    <input type="checkbox" checked={selectedItem.draft.openInNewTab} onChange={(e) => updateItemDraft(selectedItem.rowKey, { openInNewTab: e.target.checked })} disabled={!canEdit} />
                    <span className={styles.label}>Open in new tab</span>
                  </div>
                </div>
              </div>

              <div className={styles.editorGroup}>
                <h3 className={styles.editorGroupHeading}>Audience, Visibility, and Scheduling</h3>
                <div className={styles.fieldRowInlineWrap}>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>Audience Mode</label>
                    <select className={styles.select} value={selectedItem.draft.audienceMode} onChange={(e) => updateItemDraft(selectedItem.rowKey, { audienceMode: e.target.value as PriorityActionsItemDraft['audienceMode'] })} disabled={!canEdit}>
                      <option value="all">All</option>
                      <option value="include-only">Include only</option>
                      <option value="exclude">Exclude</option>
                      <option value="role-driven">Role driven</option>
                    </select>
                    <span className={styles.help}>Preview excludes targeted audiences without a persona context.</span>
                  </div>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>Audience Keys</label>
                    <input className={styles.input} value={selectedItem.draft.audienceKeys.join(', ')} onChange={(e) => updateItemDraft(selectedItem.rowKey, { audienceKeys: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} disabled={!canEdit} />
                    <span className={styles.help}>Comma-delimited keys; validator dedupes on publish.</span>
                  </div>
                </div>
                <div className={styles.fieldRowInlineWrap}>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>Schedule Start</label>
                    <input type="datetime-local" className={styles.input} value={formatScheduleInput(selectedItem.draft.startsAtUtc)} onChange={(e) => updateItemDraft(selectedItem.rowKey, { startsAtUtc: parseDateTimeInput(e.target.value) })} disabled={!canEdit} />
                  </div>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>Schedule End</label>
                    <input type="datetime-local" className={styles.input} value={formatScheduleInput(selectedItem.draft.endsAtUtc)} onChange={(e) => updateItemDraft(selectedItem.rowKey, { endsAtUtc: parseDateTimeInput(e.target.value) })} disabled={!canEdit} />
                  </div>
                </div>
                <div className={styles.fieldRowInlineWrap}>
                  {(['visibleDesktop', 'visibleLaptop', 'visibleTabletLandscape', 'visibleTabletPortrait', 'visiblePhone'] as const).map((field) => (
                    <div key={field} className={styles.checkboxRow}>
                      <input type="checkbox" checked={selectedItem.draft[field]} onChange={(e) => updateItemDraft(selectedItem.rowKey, { [field]: e.target.checked } as Partial<PriorityActionsItemDraft>)} disabled={!canEdit} />
                      <span className={styles.label}>{field.replace('visible', '')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.editorGroup}>
                <h3 className={styles.editorGroupHeading}>Grouping, Priority, and Presentation</h3>
                <div className={styles.fieldRowInlineWrap}>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>Priority</label>
                    <select className={styles.select} value={selectedItem.draft.priority} onChange={(e) => updateItemDraft(selectedItem.rowKey, { priority: e.target.value as PriorityActionsItemDraft['priority'] })} disabled={!canEdit}>
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="overflow">Overflow</option>
                    </select>
                  </div>
                  <div className={styles.checkboxRow}>
                    <input type="checkbox" checked={selectedItem.draft.overflowOnly} onChange={(e) => updateItemDraft(selectedItem.rowKey, { overflowOnly: e.target.checked })} disabled={!canEdit} />
                    <span className={styles.label}>Overflow only</span>
                  </div>
                </div>
                <div className={styles.fieldRowInlineWrap}>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>Group Key</label>
                    <input className={styles.input} value={selectedItem.draft.groupKey} onChange={(e) => updateItemDraft(selectedItem.rowKey, { groupKey: e.target.value })} disabled={!canEdit} />
                  </div>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>Group Title</label>
                    <input className={styles.input} value={selectedItem.draft.groupTitle} onChange={(e) => updateItemDraft(selectedItem.rowKey, { groupTitle: e.target.value })} disabled={!canEdit} />
                  </div>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>Icon Key</label>
                    <select className={styles.select} value={selectedItem.draft.iconKey} onChange={(e) => updateItemDraft(selectedItem.rowKey, { iconKey: e.target.value })} disabled={!canEdit}>
                      <option value="">None</option>
                      {PRIORITY_ACTIONS_GOVERNED_ICON_KEYS.map((icon) => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                    <span className={styles.help}>Governed icon set only.</span>
                  </div>
                </div>
                <div className={styles.fieldRowInlineWrap}>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>Badge Label</label>
                    <input className={styles.input} value={selectedItem.draft.badgeLabel} onChange={(e) => updateItemDraft(selectedItem.rowKey, { badgeLabel: e.target.value })} disabled={!canEdit} />
                  </div>
                  <div className={styles.fieldRow}>
                    <label className={styles.label}>Badge Variant</label>
                    <select className={styles.select} value={selectedItem.draft.badgeVariant} onChange={(e) => updateItemDraft(selectedItem.rowKey, { badgeVariant: e.target.value as PriorityActionsItemDraft['badgeVariant'] })} disabled={!canEdit}>
                      <option value="neutral">Neutral</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!validation.valid && (
            <div className={styles.section}>
              <h2 className={styles.sectionHeading}>Validation Issues ({validation.issues.length})</h2>
              <div className={styles.validationSummary}>
                {validation.issues.map((issue, i) => (
                  <div key={i} className={styles.validationIssue}>
                    {issue.rowId !== undefined ? `Item #${issue.rowId + 1}: ` : ''}{issue.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.section}>
            <div className={styles.previewPane}>
              <div className={styles.previewHeading}>
                <span>Preview Controls</span>
                <div className={styles.previewDeviceBar}>
                  {(['desktop', 'laptop', 'tabletLandscape', 'tabletPortrait', 'phone'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={d === previewDevice ? styles.primaryButton : styles.smallButton}
                      onClick={() => setPreviewDevice(d)}
                      style={{ padding: '2px 10px', fontSize: '0.6875rem' }}
                    >
                      {PREVIEW_DEVICE_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.help}>Authored {'->'} Resolved: {previewNormalizationLabel}</div>
              <div className={styles.previewDiagnostics}>
                <span>Excluded (device hidden): {previewExclusionCounts['device-hidden']}</span>
                <span>Excluded (schedule): {previewExclusionCounts['schedule-inactive']}</span>
                <span>Excluded (audience): {previewExclusionCounts['audience-targeted']}</span>
                <span>Excluded (validation): {previewExclusionCounts.invalid}</span>
              </div>
              <div className={styles.previewFrame}>
                <HbcPriorityRailPreviewSurface {...(previewSurfaceProps as React.ComponentProps<typeof HbcPriorityRailPreviewSurface>)} />
              </div>
            </div>
          </div>

          {showDiscardDialog && (
            <div className={styles.discardDialog} role="alertdialog" aria-label="Discard changes">
              <p>Discard all unsaved changes and revert to the last published state?</p>
              <div className={styles.dialogActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => setShowDiscardDialog(false)}>Keep Editing</button>
                <button type="button" className={styles.dangerButton} onClick={handleDiscard}>Discard Changes</button>
              </div>
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>Save / Discard / Publish</h2>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={!isDirty || !canEdit || saveState === 'saving'}
                onClick={() => void runPersist()}
              >
                {saveState === 'saving' ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={!isDirty || !canEdit}
                onClick={() => setShowDiscardDialog(true)}
              >
                Discard
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                disabled={!isDirty || !validation.valid || !canPublish || saveState === 'saving'}
                onClick={() => void runPersist()}
              >
                {saveState === 'saving' ? 'Publishing…' : 'Publish'}
              </button>
            </div>
            {!canPublish && <div className={styles.help}>Publish is unavailable for your current permission posture.</div>}
          </div>
        </>
      )}
    </div>
  );
}
