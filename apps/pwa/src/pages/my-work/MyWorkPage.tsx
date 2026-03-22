/**
 * MyWorkPage — Personal Work Hub page orchestrator.
 *
 * P2-D2 adaptive three-zone layout:
 *   Primary: task runway (HbcMyWorkFeed, protected, not canvas-governed)
 *   Secondary: analytics/oversight cards (role-aware, complexity-gated)
 *   Tertiary: Recent Activity card (role-aware, complexity-gated)
 *
 * UIF-002: Master-detail layout at ≥1200px. Selected item shows detail
 * panel in the right column, replacing secondary/tertiary zones.
 *
 * UIF-008: KPI click-to-filter with URL state reflection (?filter=...).
 *
 * P2-A1 §4: hub MUST NOT redirect when the work queue is empty.
 * P2-B2: hub state persistence, return memory, feed refresh on return.
 * P2-B3: trust-state freshness, connectivity display.
 * P2-D1: role determines which zones and card types are visible.
 * P2-D4: delegated-by-me and escalation-candidate scopes.
 * P2-D5: team mode toggle, card arrangement persistence.
 */
import { lazy, Suspense, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { WorkspacePageShell, HBC_ACCENT_ORANGE } from '@hbc/ui-kit';
import { useCurrentUser, useCurrentSession } from '@hbc/auth';
import { useComplexity } from '@hbc/complexity';
import { useConnectivity } from '@hbc/session-state';
import { MyWorkProvider, useMyWorkCounts } from '@hbc/my-work-feed';
import type { IMyWorkRuntimeContext, IMyWorkQuery, IMyWorkItem } from '@hbc/my-work-feed';
import { HubPageLevelEmptyState } from './HubPageLevelEmptyState.js';
import { HubZoneLayout } from './HubZoneLayout.js';
import { HubPrimaryZone } from './HubPrimaryZone.js';
import { HubSecondaryZone } from './HubSecondaryZone.js';
import { HubTertiaryZone } from './HubTertiaryZone.js';
import { useHubStatePersistence } from './useHubStatePersistence.js';
import { useHubReturnMemory } from './useHubReturnMemory.js';
import { useHubFeedRefresh } from './useHubFeedRefresh.js';
import { HubConnectivityBanner } from './HubConnectivityBanner.js';
import { HubTeamModeSelector } from './HubTeamModeSelector.js';
import { QuickActionsStrip } from './cards/QuickActionsStrip.js';
import { QuickActionsSheet } from './cards/QuickActionsSheet.js';
import { useHubPersonalization } from './useHubPersonalization.js';

// UIF-002: Lazy-load detail panel — zero cost until first item selection.
const HubDetailPanel = lazy(() =>
  import('./HubDetailPanel.js').then((m) => ({ default: m.HubDetailPanel })),
);

// MB-08 + Rule-6: FAB button uses named token and Griffel responsive style
// instead of inline style + <style> tag.
const useStyles = makeStyles({
  fab: {
    position: 'fixed',
    bottom: 'calc(56px + env(safe-area-inset-bottom, 0px) + 12px)',
    right: '16px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: HBC_ACCENT_ORANGE,
    color: '#FFFFFF',
    fontSize: '1.5rem',
    fontWeight: 700,
    cursor: 'pointer',
    zIndex: 299,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    display: 'none',
    '@media (max-width: 1023px)': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
});

/**
 * UIF-027-addl: Badge bridge — renders inside MyWorkProvider to access
 * useMyWorkCounts, then pushes blocked counts up to page-level state
 * for the header-slot HubTeamModeSelector (which is outside the provider).
 */
function HubTabBadgeBridge({
  activeMode,
  isExecutive,
  onCounts,
}: {
  activeMode: string;
  isExecutive: boolean;
  onCounts: (delegated: number, team: number) => void;
}): null {
  const { counts: delegatedCounts } = useMyWorkCounts(
    activeMode !== 'delegated-by-me' ? { teamMode: 'delegated-by-me' } : undefined,
  );
  const { counts: teamCounts } = useMyWorkCounts(
    isExecutive && activeMode !== 'my-team' ? { teamMode: 'my-team' } : undefined,
  );

  const prevRef = useRef({ d: 0, t: 0 });
  const d = delegatedCounts?.blockedCount ?? 0;
  const t = teamCounts?.blockedCount ?? 0;
  useEffect(() => {
    if (prevRef.current.d !== d || prevRef.current.t !== t) {
      prevRef.current = { d, t };
      onCounts(d, t);
    }
  }, [d, t, onCounts]);

  return null;
}

export function MyWorkPage(): ReactNode {
  const styles = useStyles();
  const currentUser = useCurrentUser();
  // P2-D1 / ARC-F4: Single role resolution via canonical @hbc/auth hook.
  const session = useCurrentSession();
  const { tier } = useComplexity();
  const connectivity = useConnectivity();

  const runtimeContext: IMyWorkRuntimeContext = {
    currentUserId: currentUser?.id ?? '',
    roleKeys: session?.resolvedRoles ?? [],
    isOffline: connectivity !== 'online',
    complexityTier: tier,
  };

  // P2-D5: Personalization — team mode + card arrangement
  const { teamMode, setTeamMode } = useHubPersonalization();

  // P2-B2: Hub state persistence (query-seed + return UI state)
  const { querySeed, returnState } = useHubStatePersistence();
  const { refreshFeed } = useHubFeedRefresh();
  const { scrollContainerRef, restoredQuerySeed } = useHubReturnMemory({
    returnState,
    querySeed,
    onReturn: refreshFeed,
  });

  // Build default query: team mode from personalization, seeded from restored draft
  const defaultQuery: IMyWorkQuery = useMemo(() => {
    const seed: IMyWorkQuery = { teamMode };
    if (restoredQuerySeed?.lane) {
      seed.lane = restoredQuerySeed.lane as IMyWorkQuery['lane'];
    }
    return seed;
  }, [teamMode, restoredQuerySeed]);

  // P2-B2 §4: Auto-save query seed when mode/lane preferences change
  useEffect(() => {
    if (defaultQuery.teamMode ?? defaultQuery.lane) {
      querySeed.queueSave({
        teamMode: defaultQuery.teamMode,
        lane: defaultQuery.lane,
        savedAt: new Date().toISOString(),
      });
    }
  }, [defaultQuery.teamMode, defaultQuery.lane, querySeed]);

  // ─── UIF-049-addl: Quick Actions sheet state (mobile) ────────────────────
  const [isActionsSheetOpen, setIsActionsSheetOpen] = useState(false);

  // ─── UIF-027-addl: Badge counts for team mode tabs ───────────────────────
  const isExecutive = session?.resolvedRoles.includes('Executive') ?? false;
  const [[delegatedBlocked, teamBlocked], setBadgeCounts] = useState([0, 0]);
  const handleBadgeCounts = useCallback((d: number, t: number) => setBadgeCounts([d, t]), []);

  // ─── UIF-002: Selected item for master-detail panel ─────────────────────
  const [selectedItem, setSelectedItem] = useState<IMyWorkItem | null>(null);

  // ─── UIF-008: KPI click-to-filter with URL state ───────────────────────
  const [kpiFilter, setKpiFilter] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('filter');
  });

  const handleKpiFilter = useCallback((filter: string) => {
    setKpiFilter((prev) => (prev === filter || filter === 'total' ? null : filter));
  }, []);

  // UIF-020-addl: Clear KPI filter — used by empty state "View all items" action.
  const handleClearKpiFilter = useCallback(() => setKpiFilter(null), []);

  // Sync kpiFilter to URL
  useEffect(() => {
    const url = new URL(window.location.href);
    if (kpiFilter) {
      url.searchParams.set('filter', kpiFilter);
    } else {
      url.searchParams.delete('filter');
    }
    window.history.replaceState({}, '', url.toString());
  }, [kpiFilter]);

  // ─── Detail panel (lazy-loaded) ────────────────────────────────────────
  const detailContent = selectedItem ? (
    <Suspense fallback={null}>
      <HubDetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
    </Suspense>
  ) : undefined;

  // UIF-008: Right panel is meaningful only when secondary/tertiary zones have
  // real tile content (standard/expert tier) or a detail panel is open.
  // At essential tier both zones are hidden or empty — collapse to full-width.
  const hasRightPanelContent = tier !== 'essential' || !!selectedItem;

  return (<>
    <WorkspacePageShell
      layout="dashboard"
      title="My Work"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'My Work' }]}
      suppressProjectContext
      stickyHeader
      headerSlot={<HubTeamModeSelector activeMode={teamMode} onModeChange={setTeamMode} isExecutive={isExecutive} delegatedBlockedCount={delegatedBlocked} teamBlockedCount={teamBlocked} rightSlot={<QuickActionsStrip />} />}
    >
      <MyWorkProvider context={runtimeContext} defaultQuery={defaultQuery}>
        <HubTabBadgeBridge activeMode={teamMode} isExecutive={isExecutive} onCounts={handleBadgeCounts} />
        <HubPageLevelEmptyState
          hasPermission={currentUser !== null}
        >
          <HubConnectivityBanner />
          <div ref={scrollContainerRef as React.RefObject<HTMLDivElement>}>
            <HubZoneLayout
              primaryContent={
                <HubPrimaryZone onItemSelect={setSelectedItem} kpiFilter={kpiFilter} onClearKpiFilter={handleClearKpiFilter} />
              }
              secondaryContent={
                <HubSecondaryZone
                  teamMode={teamMode}
                  activeFilter={kpiFilter}
                  onFilterChange={handleKpiFilter}
                />
              }
              tertiaryContent={<HubTertiaryZone />}
              detailContent={detailContent}
              hasRightPanelContent={hasRightPanelContent}
            />
          </div>
        </HubPageLevelEmptyState>
      </MyWorkProvider>
    </WorkspacePageShell>
    {/* UIF-049-addl: Mobile-only floating Actions trigger + sheet.
        Hidden at ≥1024px where the desktop strip is visible in the tab row.
        Rendered at page root level so it overlays correctly. */}
    <button
      type="button"
      data-hbc-ui="quick-actions-fab"
      aria-label="Quick Actions"
      onClick={() => setIsActionsSheetOpen(true)}
      className={styles.fab}
    >
      +
    </button>
    <QuickActionsSheet isOpen={isActionsSheetOpen} onDismiss={() => setIsActionsSheetOpen(false)} />
  </>
  );
}
