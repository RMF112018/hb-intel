import type { ReactNode } from 'react';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { useCurrentUser, useAuthStore } from '@hbc/auth';
import { useComplexity } from '@hbc/complexity';
import { useConnectivity } from '@hbc/session-state';
import { HbcMyWorkFeed, MyWorkProvider } from '@hbc/my-work-feed';
import type { IMyWorkRuntimeContext } from '@hbc/my-work-feed';

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
        <HbcMyWorkFeed />
      </MyWorkProvider>
    </WorkspacePageShell>
  );
}
