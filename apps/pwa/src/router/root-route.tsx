/**
 * Root route — Blueprint §2c, §2f, Phase 4.19.
 * Renders HbcAppShell (fully-styled Griffel shell) with <Outlet/>.
 * Bridge functions convert navStore + auth data to HbcAppShell's expected shapes.
 */
import { createRootRoute, Outlet, useRouter } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { HbcAppShell } from '@hbc/ui-kit';
import { useCurrentUser, useAuthStore } from '@hbc/auth';
import { mapNavStoreToSidebarGroups, mapCurrentUserToShellUser } from '../utils/shell-bridge.js';

function RootComponent(): React.ReactNode {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const activeWorkspace = useNavStore((s) => s.activeWorkspace);
  const sidebarItems = useNavStore((s) => s.sidebarItems);

  const shellUser = mapCurrentUserToShellUser(currentUser);
  const sidebarGroups = mapNavStoreToSidebarGroups(sidebarItems, activeWorkspace);

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
