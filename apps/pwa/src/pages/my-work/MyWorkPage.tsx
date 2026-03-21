/**
 * MyWorkPage — Personal Work Hub page orchestrator.
 *
 * P2-D2 adaptive three-zone layout:
 *   Primary: task runway (HbcMyWorkFeed, protected, not canvas-governed)
 *   Secondary: analytics/oversight cards (role-aware, complexity-gated)
 *   Tertiary: utility/quick-access (role-aware, complexity-gated)
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
import { lazy, Suspense, useEffect, useMemo, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { useCurrentUser, useAuthStore } from '@hbc/auth';
import { useComplexity } from '@hbc/complexity';
import { useConnectivity } from '@hbc/session-state';
import { MyWorkProvider } from '@hbc/my-work-feed';
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
import { useHubPersonalization } from './useHubPersonalization.js';

// UIF-002: Lazy-load detail panel — zero cost until first item selection.
const HubDetailPanel = lazy(() =>
  import('./HubDetailPanel.js').then((m) => ({ default: m.HubDetailPanel })),
);

export function MyWorkPage(): ReactNode {
  const currentUser = useCurrentUser();
  const session = useAuthStore((s) => s.session);
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

  return (
    <WorkspacePageShell
      layout="dashboard"
      title="My Work"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'My Work' }]}
    >
      <MyWorkProvider context={runtimeContext} defaultQuery={defaultQuery}>
        <HubPageLevelEmptyState
          isLoadError={false}
          hasPermission={currentUser !== null}
        >
          <HubConnectivityBanner />
          <HubTeamModeSelector activeMode={teamMode} onModeChange={setTeamMode} />
          <div ref={scrollContainerRef as React.RefObject<HTMLDivElement>}>
            <HubZoneLayout
              primaryContent={
                <HubPrimaryZone onItemSelect={setSelectedItem} kpiFilter={kpiFilter} />
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
            />
          </div>
        </HubPageLevelEmptyState>
      </MyWorkProvider>
    </WorkspacePageShell>
  );
}
