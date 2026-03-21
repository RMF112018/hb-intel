/**
 * Root route — Blueprint §2c, §2f, Phase 4.19, PH4B.5 §4b.5.1, PH6F.1.
 * Renders HbcConnectivityBar + HbcAppShell (fully-styled Griffel shell) with <Outlet/>.
 * D-04: active state is synchronized from TanStack Router location into navStore.
 * D-PH6F-1: HbcConnectivityBar mounted above HbcAppShell for shell connectivity surface.
 */
import * as React from 'react';
import { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';
import { createRootRoute, Outlet, useRouter, useRouterState } from '@tanstack/react-router';
import {
  useNavStore,
  resolveShellStatusSnapshot,
  captureIntendedDestination,
  restoreRedirectTarget,
  clearRedirectMemory,
  isSafeRedirectPath,
  resolveLandingDecision,
  isMyWorkCohortEnabled,
  getSnapshot,
  validateBudgets,
} from '@hbc/shell';
import { HbcAppShell, HbcConnectivityBar } from '@hbc/ui-kit';
import { useCurrentUser, useAuthStore } from '@hbc/auth';
import { useConnectivity, HbcSyncStatusBadge } from '@hbc/session-state';
import { buildSidebarGroupsFromRegistry, mapCurrentUserToShellUser } from '../utils/shell-bridge.js';
import { performPwaSignOut } from '../auth/signOut.js';

// UIF-012: DevToolbarMenuEntry replaces the fixed bottom bar — lives in user avatar menu.
// Same lazy-guard pattern as DevToolbar in App.tsx (D-PH5C-06/D-PH5C-02).
let DevToolbarMenuEntry: ComponentType | null = null;
if (import.meta.env.DEV) {
  DevToolbarMenuEntry = lazy(() =>
    import('@hbc/shell/dev-toolbar').then((m) => ({ default: m.DevToolbarMenuEntry })),
  );
}

function RootComponent(): React.ReactNode {
  const router = useRouter();
  const startNavSync = useNavStore((s) => s.startNavSync);
  const stopNavSync = useNavStore((s) => s.stopNavSync);
  const currentUser = useCurrentUser();
  const activeWorkspace = useNavStore((s) => s.activeWorkspace);
  const lifecyclePhase = useAuthStore((s) => s.lifecyclePhase);
  const structuredError = useAuthStore((s) => s.structuredError);

  // D-PH6F-1: Online/offline connectivity signal — delegated to @hbc/session-state
  const connectivity = useConnectivity();
  const onlineStatus = connectivity === 'online' ? 'connected' as const : 'reconnecting' as const;

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

  // D-PH6F-4 + D-PH6F-5: Post-auth navigation — redirect memory (priority 1) then role landing (priority 2).
  React.useEffect(() => {
    if (lifecyclePhase !== 'authenticated') return;

    // Priority 1: Restore redirect memory (PH6F-4)
    const restored = restoreRedirectTarget({ runtimeMode: 'pwa' });
    if (restored && restored.pathname !== router.state.location.pathname) {
      clearRedirectMemory();
      void router.navigate({ to: restored.pathname, replace: true });
      return;
    }

    // Priority 2: Role + cohort-aware landing when user is at root (PH6F-5, P2-B1 §11.3)
    if (router.state.location.pathname === '/' || router.state.location.pathname === '') {
      const resolvedRoles = useAuthStore.getState().session?.resolvedRoles ?? [];
      const decision = resolveLandingDecision({
        resolvedRoles,
        runtimeMode: 'pwa',
        cohortEnabled: isMyWorkCohortEnabled(),
      });
      if (decision.pathname !== '/') {
        void router.navigate({ to: decision.pathname, replace: true });
      }
    }
  }, [lifecyclePhase, router]);

  // D-PH6F-07: DEV-mode startup budget validation.
  // Runs once after first render — all four app-side phases should be complete by this point.
  // first-protected-shell-render is recorded separately by ShellCore.
  React.useEffect(() => {
    if (!import.meta.env.DEV) return;
    const snapshot = getSnapshot();
    const validation = validateBudgets(snapshot.records);
    if (!validation.ok) {
      console.warn('[HB Intel Startup] Budget violations:', validation.failures);
    } else {
      console.info('[HB Intel Startup] All startup phases within budget.', snapshot);
    }
  }, []);

  // Hide project selector on pages that are not project-scoped (My Work).
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showProjectSelector = !pathname.startsWith('/my-work');

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
        showProjectSelector={showProjectSelector}
        userMenuExtra={
          import.meta.env.DEV && DevToolbarMenuEntry ? (
            <Suspense fallback={null}>
              <DevToolbarMenuEntry />
            </Suspense>
          ) : undefined
        }
      >
        {/* W0-G5-T04: Site-wide pending sync badge — visible on all G5 routes */}
        <HbcSyncStatusBadge />
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
