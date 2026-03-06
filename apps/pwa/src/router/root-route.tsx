/**
 * Root route — Blueprint §2c, §2f, Phase 4.19, PH4B.5 §4b.5.1.
 * Renders HbcAppShell (fully-styled Griffel shell) with <Outlet/>.
 * D-04: active state is synchronized from TanStack Router location into navStore.
 */
import * as React from 'react';
import { createRootRoute, Outlet, useRouter } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { HbcAppShell } from '@hbc/ui-kit';
import { useCurrentUser, useAuthStore } from '@hbc/auth';
import { buildSidebarGroupsFromRegistry, mapCurrentUserToShellUser } from '../utils/shell-bridge.js';

function RootComponent(): React.ReactNode {
  const router = useRouter();
  const startNavSync = useNavStore((s) => s.startNavSync);
  const stopNavSync = useNavStore((s) => s.stopNavSync);
  const currentUser = useCurrentUser();
  const activeWorkspace = useNavStore((s) => s.activeWorkspace);

  // CF-005 / D-04: subscribe exactly once to TanStack history for deep-link + back/forward sync.
  React.useEffect(() => {
    startNavSync(router.history);
    return () => stopNavSync();
  }, [router, startNavSync, stopNavSync]);

  const shellUser = mapCurrentUserToShellUser(currentUser);
  const sidebarGroups = React.useMemo(
    () => buildSidebarGroupsFromRegistry(activeWorkspace),
    [activeWorkspace],
  );

  return (
    <HbcAppShell
      mode="pwa"
      user={shellUser}
      sidebarGroups={sidebarGroups}
      onNavigate={(href: string) => {
        void router.navigate({ to: href });
      }}
      onSignOut={() => {
        useAuthStore.getState().clear();
        void router.navigate({ to: '/' });
      }}
    >
      <Outlet />
    </HbcAppShell>
  );
}

export const rootRoute = createRootRoute({
  component: RootComponent,
});
