/**
 * MyWorkPage — Personal Work Hub page orchestrator.
 *
 * P2-D2 adaptive three-zone layout:
 *   Primary: task runway (HbcMyWorkFeed, protected, not canvas-governed)
 *   Secondary: analytics/oversight cards (role-aware, complexity-gated)
 *   Tertiary: utility/quick-access (role-aware, complexity-gated)
 *
 * P2-A1 §4: hub MUST NOT redirect when the work queue is empty.
 * P2-B2: hub state persistence, return memory, feed refresh on return.
 * P2-B3: trust-state freshness, connectivity display.
 * P2-D1: role determines which zones and card types are visible.
 */
import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { useCurrentUser, useAuthStore } from '@hbc/auth';
import { useComplexity } from '@hbc/complexity';
import { useConnectivity } from '@hbc/session-state';
import { MyWorkProvider } from '@hbc/my-work-feed';
import type { IMyWorkRuntimeContext, IMyWorkQuery } from '@hbc/my-work-feed';
import { HubPageLevelEmptyState } from './HubPageLevelEmptyState.js';
import { HubZoneLayout } from './HubZoneLayout.js';
import { HubPrimaryZone } from './HubPrimaryZone.js';
import { HubSecondaryZone } from './HubSecondaryZone.js';
import { HubTertiaryZone } from './HubTertiaryZone.js';
import { useHubStatePersistence } from './useHubStatePersistence.js';
import { useHubReturnMemory } from './useHubReturnMemory.js';
import { useHubFeedRefresh } from './useHubFeedRefresh.js';
import { HubConnectivityBanner } from './HubConnectivityBanner.js';

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

  // P2-B2: Hub state persistence (query-seed + return UI state)
  const { querySeed, returnState } = useHubStatePersistence();
  const { refreshFeed } = useHubFeedRefresh();
  const { scrollContainerRef, restoredQuerySeed } = useHubReturnMemory({
    returnState,
    querySeed,
    onReturn: refreshFeed,
  });

  // P2-B2 §4: Seed default query from restored draft
  const defaultQuery: IMyWorkQuery = useMemo(() => {
    if (!restoredQuerySeed) return {};
    const seed: IMyWorkQuery = {};
    if (restoredQuerySeed.teamMode) seed.teamMode = restoredQuerySeed.teamMode;
    if (restoredQuerySeed.lane) seed.lane = restoredQuerySeed.lane as IMyWorkQuery['lane'];
    return seed;
  }, [restoredQuerySeed]);

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

  return (
    <WorkspacePageShell layout="dashboard" title="My Work">
      <MyWorkProvider context={runtimeContext} defaultQuery={defaultQuery}>
        <HubPageLevelEmptyState
          isLoadError={false}
          hasPermission={currentUser !== null}
        >
          <HubConnectivityBanner />
          <div ref={scrollContainerRef as React.RefObject<HTMLDivElement>}>
            <HubZoneLayout
              primaryContent={<HubPrimaryZone />}
              secondaryContent={<HubSecondaryZone />}
              tertiaryContent={<HubTertiaryZone />}
            />
          </div>
        </HubPageLevelEmptyState>
      </MyWorkProvider>
    </WorkspacePageShell>
  );
}
