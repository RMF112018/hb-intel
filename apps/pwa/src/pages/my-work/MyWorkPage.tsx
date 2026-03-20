/**
 * MyWorkPage — Personal Work Hub page orchestrator.
 *
 * P2-D2 adaptive three-zone layout:
 *   Primary: task runway (HbcMyWorkFeed, protected, not canvas-governed)
 *   Secondary: analytics/oversight cards (role-aware, complexity-gated)
 *   Tertiary: utility/quick-access (role-aware, complexity-gated)
 *
 * P2-A1 §4: hub MUST NOT redirect when the work queue is empty.
 * P2-D1: role determines which zones and card types are visible.
 */
import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { useCurrentUser, useAuthStore } from '@hbc/auth';
import { useComplexity } from '@hbc/complexity';
import { useConnectivity } from '@hbc/session-state';
import { MyWorkProvider } from '@hbc/my-work-feed';
import type { IMyWorkRuntimeContext } from '@hbc/my-work-feed';
import { HubPageLevelEmptyState } from './HubPageLevelEmptyState.js';
import { HubZoneLayout } from './HubZoneLayout.js';
import { HubPrimaryZone } from './HubPrimaryZone.js';
import { HubSecondaryZone } from './HubSecondaryZone.js';
import { HubTertiaryZone } from './HubTertiaryZone.js';

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

  return (
    <WorkspacePageShell layout="dashboard" title="My Work">
      <MyWorkProvider context={runtimeContext}>
        <HubPageLevelEmptyState
          isLoadError={false}
          hasPermission={currentUser !== null}
        >
          <HubZoneLayout
            primaryContent={<HubPrimaryZone />}
            secondaryContent={<HubSecondaryZone />}
            tertiaryContent={<HubTertiaryZone />}
          />
        </HubPageLevelEmptyState>
      </MyWorkProvider>
    </WorkspacePageShell>
  );
}
