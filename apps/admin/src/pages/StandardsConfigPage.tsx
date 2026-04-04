/**
 * P10-08: Standards & Configuration lane page.
 *
 * Provides the operator console surface for Phase 10 hybrid configuration
 * governance. Organized by taxonomy domain with provenance indicators,
 * version history, diff preview, and publish/revert actions.
 *
 * Protected/infrastructure-controlled items are clearly separated from
 * live-editable items.
 */

import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import {
  HbcButton,
  HbcCard,
  HbcStatusBadge,
  HbcTypography,
  HbcBanner,
  HbcModal,
  HbcTabs,
  HbcTextField,
  HbcTextArea,
  WorkspacePageShell,
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
  HBC_RADIUS_MD,
} from '@hbc/ui-kit';
import type { LayoutTab, StatusVariant } from '@hbc/ui-kit';
import {
  useStandardsConfig,
  CONFIG_DOMAINS,
} from '../hooks/useStandardsConfig.js';
import type {
  IResolvedConfigItemView,
  IConfigVersionView,
  ConfigValueSource,
} from '../hooks/useStandardsConfig.js';

// ─── Styles ─────────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  container: { display: 'flex', flexDirection: 'column', gap: `${HBC_SPACE_LG}px` },
  domainTabs: { marginBottom: `${HBC_SPACE_MD}px` },
  itemList: { display: 'flex', flexDirection: 'column', gap: `${HBC_SPACE_SM}px` },
  itemCard: { padding: `${HBC_SPACE_MD}px` },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: `${HBC_SPACE_XS}px`,
  },
  itemKey: { fontFamily: 'monospace', fontWeight: 600 },
  itemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    flexWrap: 'wrap' as const,
  },
  itemValue: {
    fontFamily: 'monospace',
    padding: `${HBC_SPACE_XS}px ${HBC_SPACE_SM}px`,
    backgroundColor: 'var(--colorNeutralBackground3)',
    borderRadius: HBC_RADIUS_MD,
    wordBreak: 'break-all' as const,
  },
  actions: { display: 'flex', gap: `${HBC_SPACE_SM}px`, marginTop: `${HBC_SPACE_SM}px` },
  historyList: { display: 'flex', flexDirection: 'column', gap: `${HBC_SPACE_XS}px` },
  historyEntry: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${HBC_SPACE_XS}px 0`,
    borderBottomWidth: 'var(--strokeWidthThin)',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--colorNeutralStroke2)',
  },
  diffBlock: {
    padding: `${HBC_SPACE_SM}px`,
    backgroundColor: 'var(--colorNeutralBackground3)',
    borderRadius: HBC_RADIUS_MD,
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap' as const,
  },
  modalBody: { display: 'flex', flexDirection: 'column', gap: `${HBC_SPACE_MD}px` },
  formField: { display: 'flex', flexDirection: 'column', gap: `${HBC_SPACE_XS}px` },
});

// ─── Helpers ────────────────────────────────────────────────────────────────────

function sourceToVariant(source: ConfigValueSource): StatusVariant {
  switch (source) {
    case 'live-override': return 'success';
    case 'infrastructure': return 'neutral';
    case 'code-default': return 'inProgress';
    default: return 'neutral';
  }
}

function sourceToLabel(source: ConfigValueSource): string {
  switch (source) {
    case 'live-override': return 'Live Override';
    case 'infrastructure': return 'Infrastructure';
    case 'code-default': return 'Code Default';
    default: return source;
  }
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '(not set)';
  if (typeof value === 'string') return value || '(empty)';
  return JSON.stringify(value);
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function StandardsConfigPage(): ReactNode {
  const styles = useStyles();
  const {
    items,
    loading,
    error,
    activeDomain,
    setActiveDomain,
    selectedItem,
    setSelectedItem,
    history,
    historyLoading,
    diff,
    publishOverride,
    revertOverride,
    loadHistory,
    loadDiff,
    refreshItems,
  } = useStandardsConfig();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editReason, setEditReason] = useState('');
  const [revertReason, setRevertReason] = useState('');
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Domain tabs from taxonomy
  const domainTabs: LayoutTab[] = [
    { id: '__all', label: 'All Domains' },
    ...CONFIG_DOMAINS.map((d) => ({ id: d.id, label: d.label })),
  ];

  const handleDomainChange = useCallback((tabId: string) => {
    setActiveDomain(tabId === '__all' ? null : tabId);
    setSelectedItem(null);
  }, [setActiveDomain, setSelectedItem]);

  // Separate items by editability
  const editableItems = items.filter((i) => i.liveEditable);
  const protectedItems = items.filter((i) => !i.liveEditable && !i.secret);

  // ── Edit flow ─────────────────────────────────────────────────────────

  const handleEdit = useCallback((item: IResolvedConfigItemView) => {
    setSelectedItem(item);
    setEditValue(formatValue(item.effectiveValue));
    setEditReason('');
    setActionError(null);
    setShowEditModal(true);
  }, [setSelectedItem]);

  const handlePublish = useCallback(async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await publishOverride(selectedItem.key, editValue, editReason);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setActionLoading(false);
    }
  }, [selectedItem, editValue, editReason, publishOverride, setSelectedItem]);

  // ── Revert flow ───────────────────────────────────────────────────────

  const handleRevertStart = useCallback((item: IResolvedConfigItemView) => {
    setSelectedItem(item);
    setRevertReason('');
    setActionError(null);
    setShowRevertConfirm(true);
  }, [setSelectedItem]);

  const handleRevert = useCallback(async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await revertOverride(selectedItem.key, revertReason);
      setShowRevertConfirm(false);
      setSelectedItem(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Revert failed');
    } finally {
      setActionLoading(false);
    }
  }, [selectedItem, revertReason, revertOverride, setSelectedItem]);

  // ── History flow ──────────────────────────────────────────────────────

  const handleShowHistory = useCallback(async (item: IResolvedConfigItemView) => {
    setSelectedItem(item);
    setShowHistoryModal(true);
    await loadHistory(item.key);
  }, [setSelectedItem, loadHistory]);

  const handleShowDiff = useCallback(async (item: IResolvedConfigItemView, fromVer: number | null, toVer: number) => {
    await loadDiff(item.key, fromVer, toVer);
  }, [loadDiff]);

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <WorkspacePageShell
      layout="list"
      title="Standards & Configuration"
      isLoading={loading}
      isError={Boolean(error)}
      errorMessage={error ?? undefined}
      onRetry={refreshItems}
    >
      <div className={styles.container}>
        {/* Domain navigation tabs */}
        <div className={styles.domainTabs}>
          <HbcTabs
            tabs={domainTabs}
            activeTabId={activeDomain ?? '__all'}
            onTabChange={handleDomainChange}
          />
        </div>

        {/* Live-editable section */}
        {editableItems.length > 0 && (
          <>
            <HbcTypography intent="heading2">Live-Editable Standards</HbcTypography>
            <HbcBanner variant="info">
              These settings can be modified by authorized admins. Changes are versioned and auditable.
            </HbcBanner>
            <div className={styles.itemList}>
              {editableItems.map((item) => (
                <ConfigItemCard
                  key={item.key}
                  item={item}
                  styles={styles}
                  onEdit={handleEdit}
                  onRevert={handleRevertStart}
                  onShowHistory={handleShowHistory}
                />
              ))}
            </div>
          </>
        )}

        {/* Protected section */}
        {protectedItems.length > 0 && (
          <>
            <HbcTypography intent="heading2">Protected Settings</HbcTypography>
            <HbcBanner variant="warning">
              These settings are infrastructure-controlled or read-only. They cannot be modified through this console.
            </HbcBanner>
            <div className={styles.itemList}>
              {protectedItems.map((item) => (
                <ConfigItemCard
                  key={item.key}
                  item={item}
                  styles={styles}
                  onEdit={undefined}
                  onRevert={undefined}
                  onShowHistory={handleShowHistory}
                />
              ))}
            </div>
          </>
        )}

        {!loading && items.length === 0 && (
          <HbcBanner variant="info">
            No configuration items found for the selected domain. Standards governance items will appear here once the backend catalog is seeded.
          </HbcBanner>
        )}

        {/* Edit modal */}
        <HbcModal
          open={showEditModal}
          title={`Edit: ${selectedItem?.key ?? ''}`}
          onClose={() => setShowEditModal(false)}
          size="md"
        >
          <div className={styles.modalBody}>
            {actionError && <HbcBanner variant="error">{actionError}</HbcBanner>}
            <div className={styles.formField}>
              <HbcTypography intent="body">Current value: {formatValue(selectedItem?.effectiveValue)}</HbcTypography>
              <HbcTypography intent="bodySmall">Source: {selectedItem ? sourceToLabel(selectedItem.source) : ''}</HbcTypography>
            </div>
            <div className={styles.formField}>
              <HbcTextField
                label="New value"
                value={editValue}
                onChange={setEditValue}
              />
            </div>
            <div className={styles.formField}>
              <HbcTextArea
                label="Reason (required)"
                value={editReason}
                onChange={setEditReason}
                placeholder="Why are you making this change?"
                required
              />
            </div>
            <div className={styles.actions}>
              <HbcButton variant="primary" onClick={handlePublish} disabled={!editReason.trim() || actionLoading}>
                {actionLoading ? 'Publishing…' : 'Publish'}
              </HbcButton>
              <HbcButton variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </HbcButton>
            </div>
          </div>
        </HbcModal>

        {/* Revert confirmation modal */}
        <HbcModal
          open={showRevertConfirm}
          title={`Revert: ${selectedItem?.key ?? ''}`}
          onClose={() => setShowRevertConfirm(false)}
          size="sm"
        >
          <div className={styles.modalBody}>
            {actionError && <HbcBanner variant="error">{actionError}</HbcBanner>}
            <HbcTypography intent="body">
              This will revert the override and restore the code default value.
            </HbcTypography>
            <div className={styles.formField}>
              <HbcTextArea
                label="Reason (required)"
                value={revertReason}
                onChange={setRevertReason}
                placeholder="Why are you reverting this override?"
                required
              />
            </div>
            <div className={styles.actions}>
              <HbcButton variant="primary" onClick={handleRevert} disabled={!revertReason.trim() || actionLoading}>
                {actionLoading ? 'Reverting…' : 'Revert to Default'}
              </HbcButton>
              <HbcButton variant="secondary" onClick={() => setShowRevertConfirm(false)}>
                Cancel
              </HbcButton>
            </div>
          </div>
        </HbcModal>

        {/* History modal */}
        <HbcModal
          open={showHistoryModal}
          title={`History: ${selectedItem?.key ?? ''}`}
          onClose={() => { setShowHistoryModal(false); setSelectedItem(null); }}
          size="lg"
        >
          <div className={styles.modalBody}>
            {historyLoading && <HbcTypography intent="body">Loading history…</HbcTypography>}
            {!historyLoading && history.length === 0 && (
              <HbcTypography intent="body">No version history for this item.</HbcTypography>
            )}
            {!historyLoading && history.length > 0 && (
              <div className={styles.historyList}>
                {history.map((v) => (
                  <VersionEntry
                    key={v.version}
                    version={v}
                    item={selectedItem}
                    styles={styles}
                    onShowDiff={handleShowDiff}
                  />
                ))}
              </div>
            )}
            {diff && (
              <>
                <HbcTypography intent="heading3">
                  Diff: v{diff.fromVersion ?? 'default'} → v{diff.toVersion}
                </HbcTypography>
                <div className={styles.diffBlock}>
                  {diff.unchanged
                    ? '(no value change)'
                    : `- ${formatValue(diff.fromValue)}\n+ ${formatValue(diff.toValue)}`}
                </div>
                <HbcTypography intent="bodySmall">{diff.summary}</HbcTypography>
              </>
            )}
          </div>
        </HbcModal>
      </div>
    </WorkspacePageShell>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function ConfigItemCard({
  item,
  styles,
  onEdit,
  onRevert,
  onShowHistory,
}: {
  readonly item: IResolvedConfigItemView;
  readonly styles: ReturnType<typeof useStyles>;
  readonly onEdit: ((item: IResolvedConfigItemView) => void) | undefined;
  readonly onRevert: ((item: IResolvedConfigItemView) => void) | undefined;
  readonly onShowHistory: (item: IResolvedConfigItemView) => void;
}): ReactNode {
  return (
    <HbcCard weight="supporting">
      <div className={styles.itemCard}>
        <div className={styles.itemHeader}>
          <span className={styles.itemKey}>{item.key}</span>
          <div className={styles.itemMeta}>
            <HbcStatusBadge variant={sourceToVariant(item.source)} label={sourceToLabel(item.source)} size="small" />
            {item.version !== null && (
              <HbcStatusBadge variant="neutral" label={`v${item.version}`} size="small" />
            )}
          </div>
        </div>
        <div className={styles.itemValue}>{formatValue(item.effectiveValue)}</div>
        {item.lastChangedBy && (
          <HbcTypography intent="bodySmall">
            Last changed by {item.lastChangedBy} on {item.lastChangedAt ? new Date(item.lastChangedAt).toLocaleString() : 'unknown'}
          </HbcTypography>
        )}
        {item.source !== 'live-override' && item.codeDefault !== undefined && (
          <HbcTypography intent="bodySmall">
            Default: {formatValue(item.codeDefault)}
          </HbcTypography>
        )}
        <div className={styles.actions}>
          {onEdit && (
            <HbcButton size="sm" variant="primary" onClick={() => onEdit(item)}>
              Edit
            </HbcButton>
          )}
          {onRevert && item.source === 'live-override' && (
            <HbcButton size="sm" variant="secondary" onClick={() => onRevert(item)}>
              Revert
            </HbcButton>
          )}
          <HbcButton size="sm" variant="ghost" onClick={() => onShowHistory(item)}>
            History
          </HbcButton>
        </div>
      </div>
    </HbcCard>
  );
}

function VersionEntry({
  version,
  item,
  styles,
  onShowDiff,
}: {
  readonly version: IConfigVersionView;
  readonly item: IResolvedConfigItemView | null;
  readonly styles: ReturnType<typeof useStyles>;
  readonly onShowDiff: (item: IResolvedConfigItemView, from: number | null, to: number) => void;
}): ReactNode {
  const eventLabel = version.eventType === 'created' ? 'Created'
    : version.eventType === 'reverted' ? 'Reverted'
    : 'Updated';

  return (
    <div className={styles.historyEntry}>
      <div>
        <HbcTypography intent="body">
          v{version.version} — {eventLabel}
        </HbcTypography>
        <HbcTypography intent="bodySmall">
          {version.actor} · {new Date(version.timestamp).toLocaleString()} · {version.reason}
        </HbcTypography>
      </div>
      {item && version.version > 1 && (
        <HbcButton
          size="sm"
          variant="ghost"
          onClick={() => onShowDiff(item, version.version - 1, version.version)}
        >
          Diff
        </HbcButton>
      )}
    </div>
  );
}
