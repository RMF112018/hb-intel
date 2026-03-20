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
 * P2-D4: delegated-by-me and escalation-candidate scopes.
 * P2-D5: team mode toggle, card arrangement persistence.
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
import { HubTeamModeSelector } from './HubTeamModeSelector.js';
import { useHubPersonalization } from './useHubPersonalization.js';

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

  return (
    <WorkspacePageShell layout="dashboard" title="My Work">
      <MyWorkProvider context={runtimeContext} defaultQuery={defaultQuery}>
        <HubPageLevelEmptyState
          isLoadError={false}
          hasPermission={currentUser !== null}
        >
          <HubConnectivityBanner />
          <HubTeamModeSelector activeMode={teamMode} onModeChange={setTeamMode} />
          <div ref={scrollContainerRef as React.RefObject<HTMLDivElement>}>
            <HubZoneLayout
              primaryContent={<HubPrimaryZone />}
              secondaryContent={<HubSecondaryZone teamMode={teamMode} />}
              tertiaryContent={<HubTertiaryZone />}
            />
          </div>
        </HubPageLevelEmptyState>
      </MyWorkProvider>
    </WorkspacePageShell>
  );
}
