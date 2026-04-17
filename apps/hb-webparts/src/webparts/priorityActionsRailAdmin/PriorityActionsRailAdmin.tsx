/**
 * PriorityActionsRailAdmin — Maintainer authoring surface for the
 * Priority Actions command band.
 *
 * Follows the HbHeroBannerAdmin precedent: typed draft state, explicit
 * load/save state machines, dirty tracking, validation, preview
 * through the shared surface family, and read-after-write confirmation.
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
import { normalizeItemRows } from '../../homepage/data/priorityActionsNormalization.js';
import { invalidatePriorityActionsCache } from '../../homepage/data/usePriorityActionsData.js';
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
import { validatePriorityRailDraft } from '../../homepage/data/priorityActionsValidation.js';
import {
  savePriorityRailBandConfig,
  savePriorityRailItems,
  archivePriorityRailItem,
  reorderPriorityRailItems,
} from '../../homepage/data/priorityActionsListWriter.js';
import type {
  PriorityActionsConfigResolved,
  PriorityActionsConfigDraft,
  PriorityActionsValidationIssue,
  PriorityActionsAdminRow,
  PriorityActionsItemDraft,
  PriorityActionsValidationContext,
} from '../../homepage/data/priorityActionsContracts.js';
import styles from './priority-actions-rail-admin.module.css';

export interface PriorityActionsRailAdminProps {
  siteUrl?: string;
}

type PreviewDevice = 'desktop' | 'tablet' | 'phone';

function firstFailure(results: Array<{ ok: boolean; error?: string }>): string | undefined {
  const failed = results.find((result) => !result.ok);
  return failed?.error;
}

export function PriorityActionsRailAdmin({ siteUrl: siteUrlProp }: PriorityActionsRailAdminProps): React.JSX.Element {
  const siteUrl = siteUrlProp ?? getSiteUrl();

  const [loadState, setLoadState] = React.useState<AdminLoadState>('idle');
  const [saveState, setSaveState] = React.useState<AdminSaveState>('idle');
  const [loadError, setLoadError] = React.useState<string>();
  const [saveError, setSaveError] = React.useState<string>();

  const [resolvedConfig, setResolvedConfig] = React.useState<PriorityActionsConfigResolved>();
  const [validationContext, setValidationContext] = React.useState<PriorityActionsValidationContext>({});

  const [configDraft, setConfigDraft] = React.useState<PriorityActionsConfigDraft>();
  const [itemRows, setItemRows] = React.useState<PriorityActionsAdminRow[]>([]);
  const [baselineConfig, setBaselineConfig] = React.useState<PriorityActionsConfigDraft>();
  const [baselineRows, setBaselineRows] = React.useState<PriorityActionsAdminRow[]>([]);

  const [selectedRowKey, setSelectedRowKey] = React.useState<string>();
  const [showDiscardDialog, setShowDiscardDialog] = React.useState(false);
  const [previewDevice, setPreviewDevice] = React.useState<PreviewDevice>('desktop');

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

  const selectedItem = React.useMemo(
    () => itemRows.find((row) => row.rowKey === selectedRowKey),
    [itemRows, selectedRowKey],
  );

  /* ── Load ──────────────────────────────────────────────────────── */

  const loadData = React.useCallback(async () => {
    if (!siteUrl) {
      setLoadState('load-error');
      setLoadError('No SharePoint site URL available.');
      return;
    }
    setLoadState('loading');
    setLoadError(undefined);
    try {
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

  /* ── Save ──────────────────────────────────────────────────────── */

  const handleSave = React.useCallback(async () => {
    if (!siteUrl || !configDraft) return;
    if (!validation.valid) return;

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
      setSaveError(err instanceof Error ? err.message : 'Save failed.');
    }
  }, [siteUrl, configDraft, resolvedConfig, validation, itemRows, baselineRows, loadData]);

  /* ── Discard ───────────────────────────────────────────────────── */

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

  /* ── Item operations ───────────────────────────────────────────── */

  const handleAddItem = React.useCallback(() => {
    const bandKey = configDraft?.bandKey ?? 'homepage-primary';
    const newRow = createNewAdminRow(bandKey);

    setItemRows((prev) => {
      const next = resequenceAdminRows([...prev, newRow]);
      return next;
    });
    setSelectedRowKey(newRow.rowKey);
  }, [configDraft]);

  const handleToggleArchiveItem = React.useCallback((rowKey: string) => {
    setItemRows((prev) => {
      const next = prev.map((row) => (row.rowKey === rowKey ? { ...row, markedForArchive: !row.markedForArchive } : row));
      return resequenceAdminRows(next);
    });
    if (selectedRowKey === rowKey) {
      setSelectedRowKey(undefined);
    }
  }, [selectedRowKey]);

  const handleMoveItem = React.useCallback((rowKey: string, direction: -1 | 1) => {
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
  }, []);

  const updateItemDraft = React.useCallback((rowKey: string, patch: Partial<PriorityActionsItemDraft>) => {
    setItemRows((prev) => prev.map((row) => (row.rowKey === rowKey ? { ...row, draft: { ...row.draft, ...patch } } : row)));
  }, []);

  const updateConfigDraft = React.useCallback((patch: Partial<PriorityActionsConfigDraft>) => {
    setConfigDraft((prev) => prev ? { ...prev, ...patch } : prev);
  }, []);

  /* ── Preview model ─────────────────────────────────────────────── */

  const previewItems: PriorityRailActionModel[] = React.useMemo(() => {
    return getActiveItemDrafts(itemRows)
      .filter((d) => d.title.trim() && d.href.trim())
      .map((d) => ({
        id: d.actionKey,
        title: d.title,
        href: d.href,
        description: d.description || undefined,
        badge: d.badgeLabel ? { label: d.badgeLabel, variant: d.badgeVariant } : undefined,
        external: d.isExternal,
      }));
  }, [itemRows]);

  const previewUrgency: PriorityRailUrgency = React.useMemo(() => {
    if (previewItems.some((item) => item.badge?.variant === 'critical')) return 'critical';
    if (previewItems.some((item) => item.badge?.variant === 'warning')) return 'high';
    return 'default';
  }, [previewItems]);

  const previewMaxVisible = React.useMemo(() => {
    if (!configDraft) return 5;
    switch (previewDevice) {
      case 'desktop': return configDraft.maxVisibleDesktop;
      case 'tablet': return configDraft.maxVisibleTabletPortrait;
      case 'phone': return configDraft.maxVisiblePhone;
      default: return configDraft.maxVisibleDesktop;
    }
  }, [configDraft, previewDevice]);

  /* ── Render ────────────────────────────────────────────────────── */

  if (loadState === 'loading') {
    return (
      <div className={styles.workspace}>
        <div className={styles.section}>
          <div className={`${styles.statusBanner} ${styles.statusInfo}`}>Loading Priority Actions configuration…</div>
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

  if (!configDraft) {
    return (
      <div className={styles.workspace}>
        <div className={`${styles.statusBanner} ${styles.statusWarning}`}>
          No active config row found. A new config will be created on save.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.workspace}>
      {saveState === 'saved' && (
        <div className={`${styles.statusBanner} ${styles.statusSuccess}`}>
          <CheckCircle2 size={16} /> Changes saved successfully.
        </div>
      )}
      {saveState === 'save-error' && (
        <div className={`${styles.statusBanner} ${styles.statusError}`} role="alert">
          <AlertCircle size={16} /> {saveError ?? 'Save failed.'}
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionHeading}>Band Settings</h2>
        <div className={styles.fieldRow}>
          <label className={styles.label}>Config Name</label>
          <input className={styles.input} value={configDraft.title} onChange={(e) => updateConfigDraft({ title: e.target.value })} />
        </div>
        <div className={styles.fieldRowInline}>
          <div className={styles.checkboxRow}>
            <input type="checkbox" checked={configDraft.showHeading} onChange={(e) => updateConfigDraft({ showHeading: e.target.checked })} />
            <span className={styles.label}>Show heading</span>
          </div>
          <div className={styles.checkboxRow}>
            <input type="checkbox" checked={configDraft.showBadges} onChange={(e) => updateConfigDraft({ showBadges: e.target.checked })} />
            <span className={styles.label}>Show badges</span>
          </div>
          <div className={styles.checkboxRow}>
            <input type="checkbox" checked={configDraft.stickyAfterHero} onChange={(e) => updateConfigDraft({ stickyAfterHero: e.target.checked })} />
            <span className={styles.label}>Sticky after hero</span>
          </div>
        </div>
        {configDraft.showHeading && (
          <div className={styles.fieldRow}>
            <label className={styles.label}>Heading Text</label>
            <input className={styles.input} value={configDraft.headingText} onChange={(e) => updateConfigDraft({ headingText: e.target.value })} />
          </div>
        )}
        <div className={styles.fieldRow}>
          <label className={styles.label}>Overflow Label</label>
          <input className={styles.input} value={configDraft.overflowLabel} onChange={(e) => updateConfigDraft({ overflowLabel: e.target.value })} />
        </div>
        <div className={styles.fieldRowInline}>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Desktop Layout</label>
            <select className={styles.select} value={configDraft.desktopLayoutMode} onChange={(e) => updateConfigDraft({ desktopLayoutMode: e.target.value as PriorityActionsConfigDraft['desktopLayoutMode'] })}>
              <option value="rail">Rail</option>
              <option value="segmented">Segmented</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Tablet Layout</label>
            <select className={styles.select} value={configDraft.tabletLayoutMode} onChange={(e) => updateConfigDraft({ tabletLayoutMode: e.target.value as PriorityActionsConfigDraft['tabletLayoutMode'] })}>
              <option value="grid">Grid</option>
              <option value="rail">Rail</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Mobile Layout</label>
            <select className={styles.select} value={configDraft.mobileLayoutMode} onChange={(e) => updateConfigDraft({ mobileLayoutMode: e.target.value as PriorityActionsConfigDraft['mobileLayoutMode'] })}>
              <option value="grid">Grid</option>
              <option value="scroll">Scroll</option>
              <option value="sheet-trigger">Sheet Trigger</option>
            </select>
          </div>
        </div>
        <div className={styles.fieldRowInline}>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Max Desktop</label>
            <input type="number" className={`${styles.input} ${styles.inputSmall}`} value={configDraft.maxVisibleDesktop} min={1} max={20} onChange={(e) => updateConfigDraft({ maxVisibleDesktop: parseInt(e.target.value, 10) || 5 })} />
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Max Laptop</label>
            <input type="number" className={`${styles.input} ${styles.inputSmall}`} value={configDraft.maxVisibleLaptop} min={1} max={20} onChange={(e) => updateConfigDraft({ maxVisibleLaptop: parseInt(e.target.value, 10) || 5 })} />
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Max Tablet</label>
            <input type="number" className={`${styles.input} ${styles.inputSmall}`} value={configDraft.maxVisibleTabletPortrait} min={1} max={20} onChange={(e) => updateConfigDraft({ maxVisibleTabletPortrait: parseInt(e.target.value, 10) || 4 })} />
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Max Phone</label>
            <input type="number" className={`${styles.input} ${styles.inputSmall}`} value={configDraft.maxVisiblePhone} min={1} max={20} onChange={(e) => updateConfigDraft({ maxVisiblePhone: parseInt(e.target.value, 10) || 4 })} />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionHeading}>Action Library ({activeItemRows.length} active)</h2>
        <div className={styles.itemList}>
          {itemRows.map((row) => {
            const item = row.draft;
            const activePosition = activePositionByRowKey.get(row.rowKey) ?? -1;
            const isArchived = row.markedForArchive;
            return (
              <div
                key={row.rowKey}
                className={`${styles.itemCard} ${row.rowKey === selectedRowKey ? styles.itemCardSelected : ''}`}
                onClick={() => setSelectedRowKey(row.rowKey === selectedRowKey ? undefined : row.rowKey)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedRowKey(row.rowKey === selectedRowKey ? undefined : row.rowKey);
                  }
                }}
              >
                <span className={styles.itemCardTitle}>
                  {item.title || '(untitled)'}{isArchived ? ' (archived on save)' : ''}
                </span>
                <span className={styles.itemCardMeta}>
                  {activePosition >= 0 ? `#${activePosition + 1}` : '#—'} · {item.priority}
                </span>
                <div className={styles.itemCardActions}>
                  <button
                    type="button"
                    className={styles.smallButton}
                    disabled={isArchived || activePosition <= 0}
                    onClick={(e) => { e.stopPropagation(); handleMoveItem(row.rowKey, -1); }}
                    aria-label="Move up"
                  >↑</button>
                  <button
                    type="button"
                    className={styles.smallButton}
                    disabled={isArchived || activePosition < 0 || activePosition >= activeItemRows.length - 1}
                    onClick={(e) => { e.stopPropagation(); handleMoveItem(row.rowKey, 1); }}
                    aria-label="Move down"
                  >↓</button>
                  <button
                    type="button"
                    className={isArchived ? styles.smallButton : styles.dangerButton}
                    onClick={(e) => { e.stopPropagation(); handleToggleArchiveItem(row.rowKey); }}
                    aria-label={isArchived ? 'Restore' : 'Archive'}
                  >{isArchived ? '↺' : '✕'}</button>
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={handleAddItem}>+ Add Action</button>
        </div>
      </div>

      {selectedItem && !selectedItem.markedForArchive && (
        <div className={styles.section}>
          <h2 className={styles.sectionHeading}>Edit Action: {selectedItem.draft.title || '(new)'}</h2>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Action Key</label>
            <input className={styles.input} value={selectedItem.draft.actionKey} onChange={(e) => updateItemDraft(selectedItem.rowKey, { actionKey: e.target.value })} />
            <span className={styles.help}>Stable identifier for idempotent operations</span>
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Title *</label>
            <input className={styles.input} value={selectedItem.draft.title} onChange={(e) => updateItemDraft(selectedItem.rowKey, { title: e.target.value })} />
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.label}>URL *</label>
            <input className={styles.input} value={selectedItem.draft.href} onChange={(e) => updateItemDraft(selectedItem.rowKey, { href: e.target.value })} />
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Description</label>
            <input className={styles.input} value={selectedItem.draft.description} onChange={(e) => updateItemDraft(selectedItem.rowKey, { description: e.target.value })} />
          </div>
          <div className={styles.fieldRowInline}>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Badge Label</label>
              <input className={styles.input} value={selectedItem.draft.badgeLabel} onChange={(e) => updateItemDraft(selectedItem.rowKey, { badgeLabel: e.target.value })} />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Badge Variant</label>
              <select className={styles.select} value={selectedItem.draft.badgeVariant} onChange={(e) => updateItemDraft(selectedItem.rowKey, { badgeVariant: e.target.value as PriorityActionsItemDraft['badgeVariant'] })}>
                <option value="neutral">Neutral</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Priority</label>
              <select className={styles.select} value={selectedItem.draft.priority} onChange={(e) => updateItemDraft(selectedItem.rowKey, { priority: e.target.value as PriorityActionsItemDraft['priority'] })}>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="overflow">Overflow</option>
              </select>
            </div>
          </div>
          <div className={styles.fieldRowInline}>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Icon Key</label>
              <input className={styles.input} value={selectedItem.draft.iconKey} onChange={(e) => updateItemDraft(selectedItem.rowKey, { iconKey: e.target.value })} />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Group Key</label>
              <input className={styles.input} value={selectedItem.draft.groupKey} onChange={(e) => updateItemDraft(selectedItem.rowKey, { groupKey: e.target.value })} />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Group Title</label>
              <input className={styles.input} value={selectedItem.draft.groupTitle} onChange={(e) => updateItemDraft(selectedItem.rowKey, { groupTitle: e.target.value })} />
            </div>
          </div>
          <div className={styles.fieldRowInline}>
            <div className={styles.checkboxRow}>
              <input type="checkbox" checked={selectedItem.draft.isExternal} onChange={(e) => updateItemDraft(selectedItem.rowKey, { isExternal: e.target.checked })} />
              <span className={styles.label}>External link</span>
            </div>
            <div className={styles.checkboxRow}>
              <input type="checkbox" checked={selectedItem.draft.openInNewTab} onChange={(e) => updateItemDraft(selectedItem.rowKey, { openInNewTab: e.target.checked })} />
              <span className={styles.label}>Open in new tab</span>
            </div>
            <div className={styles.checkboxRow}>
              <input type="checkbox" checked={selectedItem.draft.overflowOnly} onChange={(e) => updateItemDraft(selectedItem.rowKey, { overflowOnly: e.target.checked })} />
              <span className={styles.label}>Overflow only</span>
            </div>
          </div>
          <div className={styles.fieldRowInline}>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Schedule Start</label>
              <input type="datetime-local" className={styles.input} value={selectedItem.draft.startsAtUtc ? selectedItem.draft.startsAtUtc.slice(0, 16) : ''} onChange={(e) => updateItemDraft(selectedItem.rowKey, { startsAtUtc: e.target.value ? new Date(e.target.value).toISOString() : '' })} />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Schedule End</label>
              <input type="datetime-local" className={styles.input} value={selectedItem.draft.endsAtUtc ? selectedItem.draft.endsAtUtc.slice(0, 16) : ''} onChange={(e) => updateItemDraft(selectedItem.rowKey, { endsAtUtc: e.target.value ? new Date(e.target.value).toISOString() : '' })} />
            </div>
          </div>
          <h3 className={styles.label} style={{ marginTop: 8 }}>Device Visibility</h3>
          <div className={styles.fieldRowInline}>
            {(['visibleDesktop', 'visibleLaptop', 'visibleTabletLandscape', 'visibleTabletPortrait', 'visiblePhone'] as const).map((field) => (
              <div key={field} className={styles.checkboxRow}>
                <input type="checkbox" checked={selectedItem.draft[field]} onChange={(e) => updateItemDraft(selectedItem.rowKey, { [field]: e.target.checked } as Partial<PriorityActionsItemDraft>)} />
                <span className={styles.label}>{field.replace('visible', '')}</span>
              </div>
            ))}
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
            <span>Live Preview</span>
            <div className={styles.previewDeviceBar}>
              {(['desktop', 'tablet', 'phone'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  className={d === previewDevice ? styles.primaryButton : styles.smallButton}
                  onClick={() => setPreviewDevice(d)}
                  style={{ padding: '2px 10px', fontSize: '0.6875rem' }}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.previewFrame}>
            <HbcPriorityRailPreviewSurface
              title={configDraft.showHeading ? configDraft.headingText || 'Priority Actions' : undefined}
              urgency={previewUrgency}
              layout={previewDevice === 'phone' ? 'compact' : 'rail'}
              items={previewItems.slice(0, previewMaxVisible)}
              overflowItems={previewItems.slice(previewMaxVisible)}
              overflowLabel={configDraft.overflowLabel}
              showBadges={configDraft.showBadges}
              previewLabel={`Admin Preview — ${previewDevice}`}
            />
          </div>
        </div>
      </div>

      {showDiscardDialog && (
        <div className={styles.discardDialog} role="alertdialog" aria-label="Discard changes">
          <p>Discard all unsaved changes and revert to the last saved state?</p>
          <div className={styles.dialogActions}>
            <button type="button" className={styles.secondaryButton} onClick={() => setShowDiscardDialog(false)}>Keep Editing</button>
            <button type="button" className={styles.dangerButton} onClick={handleDiscard}>Discard Changes</button>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={!isDirty || !validation.valid || saveState === 'saving'}
          onClick={() => void handleSave()}
        >
          {saveState === 'saving' ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={!isDirty}
          onClick={() => setShowDiscardDialog(true)}
        >
          Discard
        </button>
      </div>
    </div>
  );
}
