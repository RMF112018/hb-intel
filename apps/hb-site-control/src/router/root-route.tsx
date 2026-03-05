/**
 * Root route — Blueprint §2c, §2f, Phase 4.19.
 * HbcAppShell mode='pwa' for mobile field app (simplified: minimal sidebar).
 */
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { HbcAppShell } from '@hbc/ui-kit';
import { useCurrentUser, useAuthStore } from '@hbc/auth';
import type { ShellUser } from '@hbc/ui-kit';
import type { ICurrentUser } from '@hbc/models';

function toShellUser(user: ICurrentUser | null): ShellUser | null {
  if (!user) return null;
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    initials: user.displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  };
}

function RootComponent(): React.ReactNode {
  const currentUser = useCurrentUser();
  const shellUser = toShellUser(currentUser);

  return (
    <HbcAppShell
      mode="pwa"
      user={shellUser}
      sidebarGroups={[]}
      onSignOut={() => {
        useAuthStore.getState().clear();
      }}
    >
      <Outlet />
    </HbcAppShell>
  );
}

export const rootRoute = createRootRoute({
  component: RootComponent,
});
