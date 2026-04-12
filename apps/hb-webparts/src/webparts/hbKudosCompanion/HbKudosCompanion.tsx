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
 * into
 *   header → priority pulse strip → control zone → active-filter bar
 *   → bulk bar → (spotlight + triage list) → detail panel → dialogs
 * and nothing more.
 *
 * Phase-28 Prompt-02 structural redesign: the workspace is no longer
 * a flat stack of generic cards. Two new surfaces elevate the
 * moderation product:
 *   - `PriorityPulseStrip` renders the true workload (overdue,
 *     approaching, flagged, pending) above the control zone.
 *   - `TriageSpotlight` elevates the single most-pressing queue item
 *     above the list so "what to review first" is explicit.
 * The queue itself renders as an `<ol className="triageList">` of
 * borderless `QueueRow` items sharing a single productized surface —
 * no more per-row `HbcCard` frame.
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
import { useBulkApproval } from './runtime/useBulkApproval.js';
import { BulkActionBar } from './components/BulkActionBar.js';
import { QueueRow } from './components/QueueRow.js';
import { DetailPanel } from './components/DetailPanel.js';
import { PriorityPulseStrip } from './components/PriorityPulseStrip.js';
import { TriageSpotlight } from './components/TriageSpotlight.js';
import { useCompanionPulseSignals } from './runtime/useCompanionPulseSignals.js';
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

// ---------------------------------------------------------------------------
// ActiveFilterBar — dismissible chips for applied refinement filters.
// Rendered between the sticky control zone and the queue so operators
// always know which refinements narrow the current view and can revert
// single filters without returning to the control zone.
// ---------------------------------------------------------------------------

const OWNERSHIP_LABEL: Record<CompanionFilterState['ownership'], string> = {
  all: 'All',
  mine: 'Mine',
  unassigned: 'Unassigned',
  others: 'Others',
};

interface ActiveFilterBarProps {
  filter: CompanionFilterState;
  activeTabId: string;
  onClearSearch: () => void;
  onClearOwnership: () => void;
  onClearAdminReview: () => void;
  onClearScheduled: () => void;
}

function ActiveFilterBar({
  filter,
  activeTabId,
  onClearSearch,
  onClearOwnership,
  onClearAdminReview,
  onClearScheduled,
}: ActiveFilterBarProps): React.JSX.Element | null {
  const searchActive = Boolean(filter.searchText && filter.searchText.trim());
  const ownershipActive = filter.ownership !== 'all';
  // The `flagged` tab auto-sets adminReviewOnly; don't show it as a
  // dismissible chip there — it is the scope itself.
  const adminActive = filter.adminReviewOnly && activeTabId !== 'flagged';
  const scheduledActive = filter.scheduledOnly;

  if (!searchActive && !ownershipActive && !adminActive && !scheduledActive) {
    return null;
  }

  return (
    <div
      className={companionStyles.activeFilters}
      role="group"
      aria-label="Active refinement filters"
      data-hbc-testid="hb-kudos-active-filters"
    >
      <span className={companionStyles.activeFiltersLabel}>Filters</span>
      {searchActive ? (
        <FilterChip
          label={`Search: "${filter.searchText}"`}
          onClear={onClearSearch}
          testId="hb-kudos-active-filter-search"
        />
      ) : null}
      {ownershipActive ? (
        <FilterChip
          label={`Ownership: ${OWNERSHIP_LABEL[filter.ownership]}`}
          onClear={onClearOwnership}
          testId="hb-kudos-active-filter-ownership"
        />
      ) : null}
      {adminActive ? (
        <FilterChip
          label="Flagged for admin"
          onClear={onClearAdminReview}
          testId="hb-kudos-active-filter-admin"
        />
      ) : null}
      {scheduledActive ? (
        <FilterChip
          label="Scheduled only"
          onClear={onClearScheduled}
          testId="hb-kudos-active-filter-scheduled"
        />
      ) : null}
      <button
        type="button"
        className={companionStyles.activeFiltersClearAll}
        onClick={() => {
          if (searchActive) onClearSearch();
          if (ownershipActive) onClearOwnership();
          if (adminActive) onClearAdminReview();
          if (scheduledActive) onClearScheduled();
        }}
        data-hbc-testid="hb-kudos-active-filters-clear-all"
      >
        Clear all
      </button>
    </div>
  );
}

function FilterChip({
  label,
  onClear,
  testId,
}: {
  label: string;
  onClear: () => void;
  testId: string;
}): React.JSX.Element {
  return (
    <span className={companionStyles.activeFilterChip} data-hbc-testid={testId}>
      {label}
      <button
        type="button"
        className={companionStyles.activeFilterChipClear}
        aria-label={`Clear filter: ${label}`}
        onClick={onClear}
      >
        ×
      </button>
    </span>
  );
}

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

  const { queue, overdueMap, reminderTargets, scopeCount, isRefined, tabCounts } =
    useCompanionQueue({ allKudos, filter, nowIso: now, overdueThresholds });

  const actions = useCompanionActions({
    detailEntry,
    setDetailEntry,
    identityEmail: identity?.email,
    role,
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

  const { bulkState, runBulkApproval, retryFailed, dismissSummary, isRunning: bulkRunning } =
    useBulkApproval({
      queue,
      identityEmail: identity?.email,
      role,
      capabilities,
      refreshData,
      onRunFinished: clearSelection,
    });

  const selectable =
    capabilities.canBulkApprove &&
    (filter.tabId === 'pending' ||
      filter.tabId === 'revisionRequested' ||
      filter.tabId === 'flagged');

  const activeTab = COMPANION_TABS.find((t) => t.id === filter.tabId) ?? COMPANION_TABS[0]!;

  const { signals: pulseSignals } = useCompanionPulseSignals({
    allKudos,
    nowIso: now,
    overdueThresholds,
    tabCounts,
    activeTabId: filter.tabId,
    adminReviewOnly: filter.adminReviewOnly,
    dispatch,
  });

  // Spotlight only surfaces on triage-oriented tabs. On approved /
  // rejected / revisionRequested-audit scopes the operator is not
  // picking "what to review first," so the spotlight would add noise.
  const showSpotlight =
    (filter.tabId === 'pending' ||
      filter.tabId === 'flagged' ||
      filter.tabId === 'revisionRequested') &&
    queue.length > 0;

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

      {/* Priority pulse strip — Phase-28 Prompt-02 structural upgrade.
          Advertises the true workload (overdue / approaching / flagged
          / pending) in a compact band above the control zone so the
          operator sees what actually needs attention before scanning
          the queue. Each pulse chip is a scoping shortcut. */}
      <PriorityPulseStrip
        signals={pulseSignals}
        totalPending={tabCounts['pending'] ?? 0}
      />

      <section className={companionStyles.controlZone} aria-label="Queue controls">
        <div
          role="group"
          aria-label="Queue scope"
          className={clsx(companionStyles.filterBar, companionStyles.controlZoneTabs)}
        >
          {COMPANION_TABS.map((tab) => {
            const count = tabCounts[tab.id] ?? 0;
            return (
              <KudosGovernanceTabButton
                key={tab.id}
                label={`${tab.label} (${count})`}
                active={tab.id === filter.tabId}
                onClick={() => dispatch({ type: 'setTab', tabId: tab.id })}
                testId={`hb-kudos-queue-tab-${tab.id}`}
              />
            );
          })}
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

      {/* Active filter chip bar — Phase-27 Prompt-06 UX upgrade.
          Each applied refinement becomes a dismissible chip so the
          operator can see current scope at a glance and revert
          single filters without hunting through the control zone.
          Hidden when no refinement is active. */}
      <ActiveFilterBar
        filter={filter}
        activeTabId={filter.tabId}
        onClearSearch={() => dispatch({ type: 'setSearch', value: '' })}
        onClearOwnership={() => dispatch({ type: 'setOwnership', ownership: 'all' })}
        onClearAdminReview={() => dispatch({ type: 'toggleAdminReviewOnly' })}
        onClearScheduled={() => dispatch({ type: 'toggleScheduledOnly' })}
      />

      {selectable ? (
        <BulkActionBar
          selectionCount={selectedIds.size}
          bulkState={bulkState}
          onApprove={() => void runBulkApproval(selectedIds)}
          onClearSelection={clearSelection}
          onRetryFailed={() => void retryFailed()}
          onDismissSummary={dismissSummary}
          dispatchingOtherAction={dispatching || bulkRunning}
        />
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
          <>
            {showSpotlight ? (
              <TriageSpotlight
                queue={queue}
                overdueMap={overdueMap}
                onReview={(e) => {
                  setDetailEntry(e);
                  setActionError(undefined);
                }}
              />
            ) : null}
            <ol
              className={companionStyles.triageList}
              data-hbc-testid="hb-kudos-triage-list"
            >
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
            </ol>
          </>
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
