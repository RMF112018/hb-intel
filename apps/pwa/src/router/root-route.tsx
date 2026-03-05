/**
 * Root route — Blueprint §2c, §2f, Phase 4.19, PH4B.5 §4b.5.1.
 * Renders HbcAppShell (fully-styled Griffel shell) with <Outlet/>.
 * D-04: activeItemId derived from router pathname, not stored on sidebar items.
 */
import * as React from 'react';
import { createRootRoute, Outlet, useRouter, useRouterState } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { HbcAppShell } from '@hbc/ui-kit';
import { useCurrentUser, useAuthStore } from '@hbc/auth';
import { buildSidebarGroupsFromRegistry, mapCurrentUserToShellUser } from '../utils/shell-bridge.js';

function RootComponent(): React.ReactNode {
  const router = useRouter();
  const { location } = useRouterState();
  const currentUser = useCurrentUser();
  const activeWorkspace = useNavStore((s) => s.activeWorkspace);

  const shellUser = mapCurrentUserToShellUser(currentUser);
  const sidebarGroups = React.useMemo(
    () => buildSidebarGroupsFromRegistry(activeWorkspace),
    [activeWorkspace],
  );

  // D-04: derive activeItemId from current pathname
  const activeItemId = React.useMemo(() => {
    const path = location.pathname;
    for (const group of sidebarGroups) {
      for (const item of group.items) {
        if (path === item.href || path.startsWith(item.href + '/')) {
          return item.id;
        }
      }
    }
    return undefined;
  }, [location.pathname, sidebarGroups]);

  return (
    <HbcAppShell
      mode="pwa"
      user={shellUser}
      sidebarGroups={sidebarGroups}
      activeItemId={activeItemId}
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
