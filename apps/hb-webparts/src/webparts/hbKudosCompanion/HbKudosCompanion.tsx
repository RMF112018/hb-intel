/**
 * HbKudosCompanion — HR Approval Companion webpart (orchestration host).
 *
 * Split-runtime adjacency (Phase-21 Wave 4 containment contract):
 *   - Sibling runtime: `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`.
 *   - Ownership map: `../hbKudos/kudosRuntimeContract.ts` (authoritative).
 *   - Shared local product layer: `../hbKudos/kudosSurfaceFamily.ts`.
 *   - Webpart id: `HB_KUDOS_COMPANION_WEBPART_ID` in
 *     `../hbKudos/kudosRuntimeContract.ts`; mirrored in
 *     `HbKudosCompanionWebPart.manifest.json` and `mount.tsx`.
 *
 * Phase-27 Prompt-05 decomposition: this file is now a thin
 * orchestration host. Filter reducer + selector live in
 * `./runtime/companionFilter.ts`; tab model in `./runtime/companionTabs.ts`;
 * role resolution, queue derivation, and action planning each have a
 * dedicated hook under `./runtime/`; queue-row, detail-panel, and
 * degraded-state JSX live in `./components/`. The host composes them
 * into header → control zone → bulk bar → queue region → detail panel
 * → task dialogs, nothing more.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { HbcEmptyState, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import { usePeopleCultureData } from '../../homepage/data/usePeopleCultureData.js';
import { getKudosListHostUrl } from '../../homepage/data/spContext.js';
import {
  KUDOS_ROLE_LABELS,
} from '../../homepage/helpers/kudosCapabilities.js';
import {
  KudosGovernanceTabButton,
  KudosGovernanceToggleChip,
  KudosGovernanceToolbarLabel,
  KudosGovernanceErrorAlert,
  KudosGovernanceInputDialog,
  KudosGovernanceDateTimeDialog,
  KudosGovernanceAssignmentDialog,
  kudosCSSVars,
} from '../../homepage/shared/KudosGovernancePrimitives.js';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import { Trophy } from '../hbKudos/kudosIcons.js';
import companionStyles from './companion.module.css';
import type { KudosEntry } from '../../homepage/webparts/kudosContracts.js';
import { COMPANION_TABS } from './runtime/companionTabs.js';
import {
  applyCompanionFilter,
  filterReducer,
  INITIAL_FILTER_STATE,
  type CompanionFilterState,
} from './runtime/companionFilter.js';
import { useCompanionRole } from './runtime/useCompanionRole.js';
import {
  useCompanionQueue,
  DEFAULT_KUDOS_OVERDUE_THRESHOLDS,
  type KudosOverdueThresholds,
} from './runtime/useCompanionQueue.js';
import { useCompanionActions } from './runtime/useCompanionActions.js';
import { QueueRow } from './components/QueueRow.js';
import { DetailPanel } from './components/DetailPanel.js';
import {
  CompanionAccessRestricted,
  CompanionHostUnconfigured,
  CompanionLoadError,
  CompanionLoading,
  CompanionRoleResolutionFailed,
  CompanionRoleResolving,
} from './components/CompanionDegradedStates.js';

// Re-export for downstream tests / harness consumers that imported
// the selector from this module prior to the Phase-27 decomposition.
export { applyCompanionFilter };
export type { CompanionFilterState };

export interface HbKudosCompanionProps {
  config?: Record<string, unknown>;
  identity?: HomepageIdentityInput;
  assetBaseUrl?: string;
  /** Dev-only hook so tests can pin "now" for aging derivation. */
  nowIso?: string;
}

export function HbKudosCompanion({
  config,
  identity,
  nowIso,
}: HbKudosCompanionProps): React.JSX.Element {
  const heading =
    (typeof config?.heading === 'string' && config.heading) || 'HB Kudos Approval Companion';

  const { role, roleResolving, roleStatus, capabilities, retryRoleResolution } =
    useCompanionRole({
      currentUserEmail: identity?.email,
      simulatedRole: config?.simulatedRole,
    });

  const overdueThresholds: KudosOverdueThresholds = React.useMemo(
    () => ({
      pendingOverdueDays:
        typeof config?.pendingOverdueDays === 'number'
          ? config.pendingOverdueDays
          : DEFAULT_KUDOS_OVERDUE_THRESHOLDS.pendingOverdueDays,
      adminReviewOverdueDays:
        typeof config?.adminReviewOverdueDays === 'number'
          ? config.adminReviewOverdueDays
          : DEFAULT_KUDOS_OVERDUE_THRESHOLDS.adminReviewOverdueDays,
    }),
    [config?.pendingOverdueDays, config?.adminReviewOverdueDays],
  );

  const { listConfig, isLoading, error: loadError, refresh: refreshData } = usePeopleCultureData();
  const allKudos: KudosEntry[] = React.useMemo(
    () => listConfig?.kudos ?? [],
    [listConfig?.kudos],
  );

  const [filter, dispatch] = React.useReducer(filterReducer, INITIAL_FILTER_STATE);
  const [detailEntry, setDetailEntry] = React.useState<KudosEntry | undefined>();

  const now = nowIso ?? new Date().toISOString();

  const { queue, overdueMap, reminderTargets, scopeCount, isRefined } =
    useCompanionQueue({ allKudos, filter, nowIso: now, overdueThresholds });

  const actions = useCompanionActions({
    detailEntry,
    setDetailEntry,
    identityEmail: identity?.email,
    role,
    capabilities,
    queue,
    refreshData,
  });
  const {
    selectedIds,
    toggleSelect,
    clearSelection,
    dispatching,
    actionError,
    setActionError,
    handleDetailAction,
    handleBulkApprove,
    inputDialog,
    closeInputDialog,
    handleInputDialogConfirm,
    dateTimeDialog,
    closeDateTimeDialog,
    handleDateTimeDialogConfirm,
    assignmentDialogOpen,
    closeAssignmentDialog,
    handleAssignmentDialogConfirm,
  } = actions;

  const selectable =
    capabilities.canBulkApprove &&
    (filter.tabId === 'pending' ||
      filter.tabId === 'revisionRequested' ||
      filter.tabId === 'flagged');

  const activeTab = COMPANION_TABS.find((t) => t.id === filter.tabId) ?? COMPANION_TABS[0]!;

  // Degraded render paths.
  if (roleResolving) return <CompanionRoleResolving />;
  if (roleStatus === 'resolution-failed')
    return <CompanionRoleResolutionFailed onRetry={retryRoleResolution} />;
  if (roleStatus !== 'simulated' && !getKudosListHostUrl())
    return <CompanionHostUnconfigured />;
  if (!capabilities.canViewGovernance) return <CompanionAccessRestricted role={role} />;
  if (isLoading) return <CompanionLoading />;
  if (loadError)
    return <CompanionLoadError role={role} loadError={loadError} onRetry={refreshData} />;

  return (
    <section
      data-hbc-webpart="hb-kudos-companion"
      data-hbc-webpart-phase="phase-14-kudos-phase-04"
      data-hbc-testid="hb-kudos-companion-root"
      data-hbc-role={role}
      aria-label="HB Kudos Approval Companion"
      className={companionStyles.root}
      style={kudosCSSVars()}
    >
      <header className={companionStyles.header}>
        <div className={companionStyles.headerLead}>
          <div className={companionStyles.eyebrow}>
            <Trophy size={11} strokeWidth={2.5} aria-hidden="true" />
            HB Kudos governance
          </div>
          <h2 className={companionStyles.title}>{heading}</h2>
          <div className={companionStyles.workspaceSubtitle} aria-live="polite">
            <span>{activeTab.label}</span>
            <span className={companionStyles.workspaceSubtitleDot}>·</span>
            <span>
              {queue.length} {queue.length === 1 ? 'item' : 'items'}
              {isRefined ? ` of ${scopeCount}` : ''}
            </span>
            {reminderTargets.length > 0 ? (
              <>
                <span className={companionStyles.workspaceSubtitleDot}>·</span>
                <span>{reminderTargets.length} overdue</span>
              </>
            ) : null}
          </div>
        </div>
        <div className={companionStyles.headerMeta} role="status" aria-live="polite">
          {reminderTargets.length > 0 ? (
            <HbcStatusBadge
              variant="warning"
              size="small"
              label={`${reminderTargets.length} overdue`}
            />
          ) : null}
          <HbcStatusBadge
            variant={role === 'admin' ? 'critical' : role === 'reviewer' ? 'info' : 'warning'}
            size="small"
            label={KUDOS_ROLE_LABELS[role]}
          />
        </div>
      </header>

      <section className={companionStyles.controlZone} aria-label="Queue controls">
        <div
          role="group"
          aria-label="Queue scope"
          className={clsx(companionStyles.filterBar, companionStyles.controlZoneTabs)}
        >
          {COMPANION_TABS.map((tab) => (
            <KudosGovernanceTabButton
              key={tab.id}
              label={tab.label}
              active={tab.id === filter.tabId}
              onClick={() => dispatch({ type: 'setTab', tabId: tab.id })}
              testId={`hb-kudos-queue-tab-${tab.id}`}
            />
          ))}
        </div>

        <div
          role="group"
          aria-label="Refinement controls"
          className={clsx(companionStyles.searchCluster, companionStyles.controlZoneRefinement)}
        >
          <label className={companionStyles.searchField}>
            <KudosGovernanceToolbarLabel>Search</KudosGovernanceToolbarLabel>
            <input
              type="search"
              value={filter.searchText ?? ''}
              onChange={(e) => dispatch({ type: 'setSearch', value: e.target.value })}
              placeholder="Search recognition…"
              data-hbc-testid="hb-kudos-queue-filter-search"
              className={companionStyles.searchInput}
            />
          </label>

          <label className={companionStyles.ownershipField}>
            <KudosGovernanceToolbarLabel>Ownership</KudosGovernanceToolbarLabel>
            <select
              value={filter.ownership}
              onChange={(e) =>
                dispatch({
                  type: 'setOwnership',
                  ownership: e.target.value as CompanionFilterState['ownership'],
                })
              }
              data-hbc-testid="hb-kudos-queue-filter-ownership"
              className={companionStyles.ownershipSelect}
            >
              <option value="all">All</option>
              <option value="mine">Assigned to me</option>
              <option value="unassigned">Unassigned</option>
              <option value="others">Assigned to others</option>
            </select>
          </label>

          <KudosGovernanceToggleChip
            label="Flagged for admin"
            active={filter.adminReviewOnly}
            onToggle={() => dispatch({ type: 'toggleAdminReviewOnly' })}
            testId="hb-kudos-queue-filter-admin-review"
          />
          <KudosGovernanceToggleChip
            label="Scheduled only"
            active={filter.scheduledOnly}
            onToggle={() => dispatch({ type: 'toggleScheduledOnly' })}
            testId="hb-kudos-queue-filter-scheduled"
          />
        </div>
      </section>

      {selectable && selectedIds.size > 0 ? (
        <div role="group" aria-label="Bulk actions" className={companionStyles.bulkBar}>
          <span className={companionStyles.bulkCount}>{selectedIds.size} selected</span>
          <button
            type="button"
            onClick={() => void handleBulkApprove()}
            disabled={dispatching}
            aria-busy={dispatching ? 'true' : undefined}
            data-hbc-testid="hb-kudos-bulk-approve"
            className={companionStyles.bulkApproveBtn}
          >
            {dispatching ? 'Approving…' : 'Approve selected'}
          </button>
          <button
            type="button"
            onClick={clearSelection}
            disabled={dispatching}
            className={companionStyles.bulkClearBtn}
          >
            Clear
          </button>
        </div>
      ) : null}

      {actionError ? <KudosGovernanceErrorAlert message={actionError} /> : null}

      <section className={companionStyles.queueRegion} aria-label="Queue">
        <div className={companionStyles.queueRegionHeader}>
          <span className={companionStyles.queueRegionLabel}>{activeTab.label} queue</span>
          <span className={companionStyles.queueRegionCount}>
            {queue.length} {queue.length === 1 ? 'item' : 'items'}
            {isRefined ? ` · refined from ${scopeCount}` : ''}
          </span>
        </div>

        {queue.length === 0 ? (
          allKudos.length === 0 ? (
            <div data-hbc-state="true-empty">
              <HbcEmptyState
                title="No kudos in the system yet"
                description="The governance workspace is connected and working — there are currently no kudos submissions to review."
              />
            </div>
          ) : (
            <div data-hbc-state="filtered-empty">
              <HbcEmptyState
                title="No kudos match this view"
                description="Kudos exist outside the current filter. Try a different tab, clear search, or adjust the ownership / flag filters to see them."
              />
            </div>
          )
        ) : (
          <div className={companionStyles.queueGrid}>
            {queue.map((entry) => (
              <QueueRow
                key={entry.id}
                entry={entry}
                nowIso={now}
                selected={selectedIds.has(entry.id)}
                selectable={selectable}
                overdueStatus={overdueMap.get(entry.id) ?? 'ok'}
                onToggleSelect={toggleSelect}
                onOpenDetail={(e) => {
                  setDetailEntry(e);
                  setActionError(undefined);
                }}
              />
            ))}
          </div>
        )}
      </section>

      <DetailPanel
        entry={detailEntry}
        onClose={() => setDetailEntry(undefined)}
        capabilities={capabilities}
        role={role}
        dispatching={dispatching}
        error={actionError}
        onAction={(kind) => handleDetailAction(kind)}
      />

      <KudosGovernanceInputDialog
        open={inputDialog !== null}
        onClose={closeInputDialog}
        onConfirm={handleInputDialogConfirm}
        title={inputDialog?.title ?? ''}
        description={inputDialog?.description}
        placeholder={inputDialog?.placeholder}
        defaultValue={inputDialog?.defaultValue}
        confirmLabel={inputDialog?.confirmLabel}
        choices={inputDialog?.choices}
        allowEmpty={inputDialog?.allowEmpty}
      />

      <KudosGovernanceDateTimeDialog
        open={dateTimeDialog !== null}
        onClose={closeDateTimeDialog}
        onConfirm={handleDateTimeDialogConfirm}
        title={dateTimeDialog?.title ?? ''}
        description={dateTimeDialog?.description}
        fieldLabel={dateTimeDialog?.fieldLabel}
        hint={dateTimeDialog?.hint}
        defaultIso={dateTimeDialog?.defaultIso}
        confirmLabel={dateTimeDialog?.confirmLabel}
        allowEmpty={dateTimeDialog?.allowEmpty}
      />
      <KudosGovernanceAssignmentDialog
        open={assignmentDialogOpen}
        onClose={closeAssignmentDialog}
        onConfirm={handleAssignmentDialogConfirm}
        title="Reassign kudos"
        description="Enter the assignee's email. The companion resolves the user against the canonical list-host site and dispatches the typed reassign patch."
        listHostUrl={getKudosListHostUrl() ?? ''}
        confirmLabel="Reassign"
      />
    </section>
  );
}
