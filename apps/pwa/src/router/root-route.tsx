/**
 * Root route — Blueprint §2c, §2f, Phase 4.19, PH4B.5 §4b.5.1, PH6F.1.
 * Renders HbcConnectivityBar + HbcAppShell (fully-styled Griffel shell) with <Outlet/>.
 * D-04: active state is synchronized from TanStack Router location into navStore.
 * D-PH6F-1: HbcConnectivityBar mounted above HbcAppShell for shell connectivity surface.
 */
import * as React from 'react';
import { createRootRoute, Outlet, useRouter } from '@tanstack/react-router';
import {
  useNavStore,
  resolveShellStatusSnapshot,
  captureIntendedDestination,
  restoreRedirectTarget,
  clearRedirectMemory,
  isSafeRedirectPath,
  type ShellConnectivitySignal,
} from '@hbc/shell';
import { HbcAppShell, HbcConnectivityBar } from '@hbc/ui-kit';
import { useCurrentUser, useAuthStore } from '@hbc/auth';
import { buildSidebarGroupsFromRegistry, mapCurrentUserToShellUser } from '../utils/shell-bridge.js';
import { performPwaSignOut } from '../auth/signOut.js';

function RootComponent(): React.ReactNode {
  const router = useRouter();
  const startNavSync = useNavStore((s) => s.startNavSync);
  const stopNavSync = useNavStore((s) => s.stopNavSync);
  const currentUser = useCurrentUser();
  const activeWorkspace = useNavStore((s) => s.activeWorkspace);
  const lifecyclePhase = useAuthStore((s) => s.lifecyclePhase);
  const structuredError = useAuthStore((s) => s.structuredError);

  // D-PH6F-1: Online/offline connectivity signal
  const [onlineStatus, setOnlineStatus] = React.useState<ShellConnectivitySignal>(
    typeof navigator !== 'undefined' && navigator.onLine ? 'connected' : 'reconnecting',
  );

  React.useEffect(() => {
    const setOnline = () => setOnlineStatus('connected');
    const setOffline = () => setOnlineStatus('reconnecting');
    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);
    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
    };
  }, []);

  const shellStatusSnapshot = React.useMemo(
    () =>
      resolveShellStatusSnapshot({
        lifecyclePhase,
        experienceState: 'ready',
        hasAccessValidationIssue: false,
        hasFatalError: Boolean(structuredError),
        connectivitySignal: onlineStatus,
      }),
    [lifecyclePhase, structuredError, onlineStatus],
  );

  // CF-005 / D-04: subscribe exactly once to TanStack history for deep-link + back/forward sync.
  React.useEffect(() => {
    startNavSync(router.history);
    return () => stopNavSync();
  }, [router, startNavSync, stopNavSync]);

  // D-PH6F-4: Restore intended destination after successful auth.
  React.useEffect(() => {
    if (lifecyclePhase !== 'authenticated') return;

    const restored = restoreRedirectTarget({ runtimeMode: 'pwa' });
    if (restored && restored.pathname !== router.state.location.pathname) {
      clearRedirectMemory();
      void router.navigate({ to: restored.pathname, replace: true });
    }
    // If no redirect memory, PH6F-5 will handle role-based landing
  }, [lifecyclePhase, router]);

  const shellUser = mapCurrentUserToShellUser(currentUser);
  const sidebarGroups = React.useMemo(
    () => buildSidebarGroupsFromRegistry(activeWorkspace),
    [activeWorkspace],
  );

  return (
    <>
      <HbcConnectivityBar
        shellStatus={shellStatusSnapshot}
        onShellAction={(action) => {
          if (action === 'sign-in-again') {
            void performPwaSignOut().then(() => {
              void router.navigate({ to: '/' });
            });
          }
          if (action === 'retry') {
            window.location.reload();
          }
        }}
      />
      <HbcAppShell
        mode="pwa"
        user={shellUser}
        sidebarGroups={sidebarGroups}
        onNavigate={(href: string) => {
          void router.navigate({ to: href });
        }}
        onSignOut={() => {
          void performPwaSignOut().then(() => {
            void router.navigate({ to: '/' });
          });
        }}
      >
        <Outlet />
      </HbcAppShell>
    </>
  );
}

export const rootRoute = createRootRoute({
  // D-PH6F-4: Capture intended destination before auth redirect.
  beforeLoad: ({ location }) => {
    const isAuthenticated =
      useAuthStore.getState().lifecyclePhase === 'authenticated';

    if (
      !isAuthenticated &&
      location.pathname !== '/' &&
      isSafeRedirectPath(location.pathname)
    ) {
      // Only capture if no existing redirect memory (prevent overwrite during redirect chains)
      const existing = restoreRedirectTarget({ runtimeMode: 'pwa' });
      if (!existing) {
        captureIntendedDestination({
          pathname: location.pathname,
          runtimeMode: 'pwa',
        });
      }
    }
  },
  component: RootComponent,
});
