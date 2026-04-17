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
  HbcPriorityRailSurface,
  HbcPriorityRailPreviewSurface,
  HbcPriorityRailSkeleton,
  AlertCircle,
  CheckCircle2,
  type PriorityRailActionModel,
  type PriorityRailUrgency,
} from '@hbc/ui-kit/homepage';
import { getSiteUrl } from '../../homepage/data/spContext.js';
import { fetchPriorityActionsConfig } from '../../homepage/data/priorityActionsConfigListSource.js';
import { fetchPriorityActionsItems } from '../../homepage/data/priorityActionsItemsListSource.js';
import { normalizeItemRows } from '../../homepage/data/priorityActionsNormalization.js';
import { invalidatePriorityActionsCache } from '../../homepage/data/usePriorityActionsData.js';
import {
  createConfigDraftFromResolved,
  createItemDraftFromNormalized,
  createEmptyItemDraft,
  isConfigDirty,
  isAnyItemDirty,
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
  PriorityActionsItemNormalized,
  PriorityActionsConfigDraft,
  PriorityActionsItemDraft,
  PriorityActionsValidationIssue,
} from '../../homepage/data/priorityActionsContracts.js';
import styles from './priority-actions-rail-admin.module.css';

export interface PriorityActionsRailAdminProps {
  siteUrl?: string;
}

type PreviewDevice = 'desktop' | 'tablet' | 'phone';

export function PriorityActionsRailAdmin({ siteUrl: siteUrlProp }: PriorityActionsRailAdminProps): React.JSX.Element {
  const siteUrl = siteUrlProp ?? getSiteUrl();

  const [loadState, setLoadState] = React.useState<AdminLoadState>('idle');
  const [saveState, setSaveState] = React.useState<AdminSaveState>('idle');
  const [loadError, setLoadError] = React.useState<string>();
  const [saveError, setSaveError] = React.useState<string>();

  const [resolvedConfig, setResolvedConfig] = React.useState<PriorityActionsConfigResolved>();
  const [resolvedItems, setResolvedItems] = React.useState<PriorityActionsItemNormalized[]>([]);

  const [configDraft, setConfigDraft] = React.useState<PriorityActionsConfigDraft>();
  const [itemDrafts, setItemDrafts] = React.useState<PriorityActionsItemDraft[]>([]);
  const [baselineConfig, setBaselineConfig] = React.useState<PriorityActionsConfigDraft>();
  const [baselineItems, setBaselineItems] = React.useState<PriorityActionsItemDraft[]>([]);

  const [selectedItemIndex, setSelectedItemIndex] = React.useState<number>(-1);
  const [showDiscardDialog, setShowDiscardDialog] = React.useState(false);
  const [previewDevice, setPreviewDevice] = React.useState<PreviewDevice>('desktop');

  const isDirty = React.useMemo(() => {
    if (!configDraft || !baselineConfig) return false;
    return isConfigDirty(configDraft, baselineConfig) || isAnyItemDirty(itemDrafts, baselineItems);
  }, [configDraft, baselineConfig, itemDrafts, baselineItems]);

  const validation = React.useMemo(() => {
    if (!configDraft) return { valid: true, issues: [] as PriorityActionsValidationIssue[] };
    return validatePriorityRailDraft(configDraft, itemDrafts);
  }, [configDraft, itemDrafts]);

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
      const [config, rawItems] = await Promise.all([
        fetchPriorityActionsConfig(siteUrl),
        fetchPriorityActionsItems(siteUrl),
      ]);
      const items = normalizeItemRows(rawItems);
      setResolvedConfig(config);
      setResolvedItems(items);

      if (config) {
        const cd = createConfigDraftFromResolved(config);
        setConfigDraft(cd);
        setBaselineConfig(JSON.parse(JSON.stringify(cd)));
      }
      const ids = items.map(createItemDraftFromNormalized);
      setItemDrafts(ids);
      setBaselineItems(JSON.parse(JSON.stringify(ids)));
      setSelectedItemIndex(-1);
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

      const itemsPayload = itemDrafts.map((draft, i) => ({
        itemId: resolvedItems[i]?.id,
        draft,
      }));
      const itemResults = await savePriorityRailItems(siteUrl, itemsPayload, configDraft.bandKey);
      const failed = itemResults.find((r) => !r.ok);
      if (failed && !failed.ok) {
        setSaveState('save-error');
        setSaveError(failed.error);
        return;
      }

      invalidatePriorityActionsCache();
      setSaveState('saved');
      await loadData();
    } catch (err) {
      setSaveState('save-error');
      setSaveError(err instanceof Error ? err.message : 'Save failed.');
    }
  }, [siteUrl, configDraft, itemDrafts, resolvedConfig, resolvedItems, validation, loadData]);

  /* ── Discard ───────────────────────────────────────────────────── */

  const handleDiscard = React.useCallback(() => {
    if (baselineConfig && baselineItems) {
      setConfigDraft(JSON.parse(JSON.stringify(baselineConfig)));
      setItemDrafts(JSON.parse(JSON.stringify(baselineItems)));
      setSelectedItemIndex(-1);
    }
    setShowDiscardDialog(false);
    setSaveState('idle');
    setSaveError(undefined);
  }, [baselineConfig, baselineItems]);

  /* ── Item operations ───────────────────────────────────────────── */

  const handleAddItem = React.useCallback(() => {
    const bandKey = configDraft?.bandKey ?? 'homepage-primary';
    const newDraft = createEmptyItemDraft(bandKey);
    newDraft.sortOrder = (itemDrafts.length + 1) * 10;
    newDraft.actionKey = `action-${Date.now()}`;
    setItemDrafts((prev) => [...prev, newDraft]);
    setSelectedItemIndex(itemDrafts.length);
  }, [configDraft, itemDrafts]);

  const handleArchiveItem = React.useCallback(async (index: number) => {
    const item = resolvedItems[index];
    if (item && siteUrl) {
      await archivePriorityRailItem(siteUrl, item.id);
    }
    setItemDrafts((prev) => prev.filter((_, i) => i !== index));
    setSelectedItemIndex(-1);
    invalidatePriorityActionsCache();
  }, [resolvedItems, siteUrl]);

  const handleMoveItem = React.useCallback((index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= itemDrafts.length) return;
    setItemDrafts((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((d, i) => ({ ...d, sortOrder: (i + 1) * 10 }));
    });
    setSelectedItemIndex(target);
  }, [itemDrafts.length]);

  const updateItemDraft = React.useCallback((index: number, patch: Partial<PriorityActionsItemDraft>) => {
    setItemDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }, []);

  const updateConfigDraft = React.useCallback((patch: Partial<PriorityActionsConfigDraft>) => {
    setConfigDraft((prev) => prev ? { ...prev, ...patch } : prev);
  }, []);

  /* ── Preview model ─────────────────────────────────────────────── */

  const previewItems: PriorityRailActionModel[] = React.useMemo(() => {
    return itemDrafts
      .filter((d) => d.title.trim() && d.href.trim())
      .map((d) => ({
        id: d.actionKey,
        title: d.title,
        href: d.href,
        description: d.description || undefined,
        badge: d.badgeLabel ? { label: d.badgeLabel, variant: d.badgeVariant } : undefined,
        external: d.isExternal,
      }));
  }, [itemDrafts]);

  const previewUrgency: PriorityRailUrgency = React.useMemo(() => {
    if (itemDrafts.some((d) => d.badgeVariant === 'critical')) return 'critical';
    if (itemDrafts.some((d) => d.badgeVariant === 'warning')) return 'high';
    return 'default';
  }, [itemDrafts]);

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

  const selectedItem = selectedItemIndex >= 0 ? itemDrafts[selectedItemIndex] : undefined;

  return (
    <div className={styles.workspace}>
      {/* Status banners */}
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

      {/* Band Settings */}
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

      {/* Action Library */}
      <div className={styles.section}>
        <h2 className={styles.sectionHeading}>Action Library ({itemDrafts.length})</h2>
        <div className={styles.itemList}>
          {itemDrafts.map((item, i) => (
            <div
              key={item.actionKey || i}
              className={`${styles.itemCard} ${i === selectedItemIndex ? styles.itemCardSelected : ''}`}
              onClick={() => setSelectedItemIndex(i === selectedItemIndex ? -1 : i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedItemIndex(i === selectedItemIndex ? -1 : i); } }}
            >
              <span className={styles.itemCardTitle}>{item.title || '(untitled)'}</span>
              <span className={styles.itemCardMeta}>#{i + 1} · {item.priority}</span>
              <div className={styles.itemCardActions}>
                <button type="button" className={styles.smallButton} disabled={i === 0} onClick={(e) => { e.stopPropagation(); handleMoveItem(i, -1); }} aria-label="Move up">↑</button>
                <button type="button" className={styles.smallButton} disabled={i === itemDrafts.length - 1} onClick={(e) => { e.stopPropagation(); handleMoveItem(i, 1); }} aria-label="Move down">↓</button>
                <button type="button" className={styles.dangerButton} onClick={(e) => { e.stopPropagation(); void handleArchiveItem(i); }} aria-label="Archive">✕</button>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={handleAddItem}>+ Add Action</button>
        </div>
      </div>

      {/* Item Editor */}
      {selectedItem && (
        <div className={styles.section}>
          <h2 className={styles.sectionHeading}>Edit Action: {selectedItem.title || '(new)'}</h2>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Action Key</label>
            <input className={styles.input} value={selectedItem.actionKey} onChange={(e) => updateItemDraft(selectedItemIndex, { actionKey: e.target.value })} />
            <span className={styles.help}>Stable identifier for idempotent operations</span>
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Title *</label>
            <input className={styles.input} value={selectedItem.title} onChange={(e) => updateItemDraft(selectedItemIndex, { title: e.target.value })} />
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.label}>URL *</label>
            <input className={styles.input} value={selectedItem.href} onChange={(e) => updateItemDraft(selectedItemIndex, { href: e.target.value })} />
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Description</label>
            <input className={styles.input} value={selectedItem.description} onChange={(e) => updateItemDraft(selectedItemIndex, { description: e.target.value })} />
          </div>
          <div className={styles.fieldRowInline}>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Badge Label</label>
              <input className={styles.input} value={selectedItem.badgeLabel} onChange={(e) => updateItemDraft(selectedItemIndex, { badgeLabel: e.target.value })} />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Badge Variant</label>
              <select className={styles.select} value={selectedItem.badgeVariant} onChange={(e) => updateItemDraft(selectedItemIndex, { badgeVariant: e.target.value as PriorityActionsItemDraft['badgeVariant'] })}>
                <option value="neutral">Neutral</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Priority</label>
              <select className={styles.select} value={selectedItem.priority} onChange={(e) => updateItemDraft(selectedItemIndex, { priority: e.target.value as PriorityActionsItemDraft['priority'] })}>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="overflow">Overflow</option>
              </select>
            </div>
          </div>
          <div className={styles.fieldRowInline}>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Icon Key</label>
              <input className={styles.input} value={selectedItem.iconKey} onChange={(e) => updateItemDraft(selectedItemIndex, { iconKey: e.target.value })} />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Group Key</label>
              <input className={styles.input} value={selectedItem.groupKey} onChange={(e) => updateItemDraft(selectedItemIndex, { groupKey: e.target.value })} />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Group Title</label>
              <input className={styles.input} value={selectedItem.groupTitle} onChange={(e) => updateItemDraft(selectedItemIndex, { groupTitle: e.target.value })} />
            </div>
          </div>
          <div className={styles.fieldRowInline}>
            <div className={styles.checkboxRow}>
              <input type="checkbox" checked={selectedItem.isExternal} onChange={(e) => updateItemDraft(selectedItemIndex, { isExternal: e.target.checked })} />
              <span className={styles.label}>External link</span>
            </div>
            <div className={styles.checkboxRow}>
              <input type="checkbox" checked={selectedItem.openInNewTab} onChange={(e) => updateItemDraft(selectedItemIndex, { openInNewTab: e.target.checked })} />
              <span className={styles.label}>Open in new tab</span>
            </div>
            <div className={styles.checkboxRow}>
              <input type="checkbox" checked={selectedItem.overflowOnly} onChange={(e) => updateItemDraft(selectedItemIndex, { overflowOnly: e.target.checked })} />
              <span className={styles.label}>Overflow only</span>
            </div>
          </div>
          <div className={styles.fieldRowInline}>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Schedule Start</label>
              <input type="datetime-local" className={styles.input} value={selectedItem.startsAtUtc ? selectedItem.startsAtUtc.slice(0, 16) : ''} onChange={(e) => updateItemDraft(selectedItemIndex, { startsAtUtc: e.target.value ? new Date(e.target.value).toISOString() : '' })} />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.label}>Schedule End</label>
              <input type="datetime-local" className={styles.input} value={selectedItem.endsAtUtc ? selectedItem.endsAtUtc.slice(0, 16) : ''} onChange={(e) => updateItemDraft(selectedItemIndex, { endsAtUtc: e.target.value ? new Date(e.target.value).toISOString() : '' })} />
            </div>
          </div>
          <h3 className={styles.label} style={{ marginTop: 8 }}>Device Visibility</h3>
          <div className={styles.fieldRowInline}>
            {(['visibleDesktop', 'visibleLaptop', 'visibleTabletLandscape', 'visibleTabletPortrait', 'visiblePhone'] as const).map((field) => (
              <div key={field} className={styles.checkboxRow}>
                <input type="checkbox" checked={selectedItem[field]} onChange={(e) => updateItemDraft(selectedItemIndex, { [field]: e.target.checked })} />
                <span className={styles.label}>{field.replace('visible', '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Summary */}
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

      {/* Preview */}
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

      {/* Discard dialog */}
      {showDiscardDialog && (
        <div className={styles.discardDialog} role="alertdialog" aria-label="Discard changes">
          <p>Discard all unsaved changes and revert to the last saved state?</p>
          <div className={styles.dialogActions}>
            <button type="button" className={styles.secondaryButton} onClick={() => setShowDiscardDialog(false)}>Keep Editing</button>
            <button type="button" className={styles.dangerButton} onClick={handleDiscard}>Discard Changes</button>
          </div>
        </div>
      )}

      {/* Actions */}
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
