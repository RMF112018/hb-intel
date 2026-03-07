# PH6F — Dead-Wiring Cleanup: Connecting Built-but-Unwired Infrastructure

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-07
**Classification:** Cross-cutting infrastructure — parallel to active phase work.
**Trigger:** Systematic audit revealed that a significant portion of PH5 deliverables (auth, shell, connectivity, feature registration, provisioning) are fully implemented in `packages/` but never connected to the consuming applications.

---

## 0. Background & Methodology

During PH5 and PH6 implementation, packages were built as self-contained libraries with complete implementations, tests, and exports. The applications (`apps/pwa`, `apps/dev-harness`, `apps/spfx`) consumed the *presentational* surface of these packages (`HbcAppShell`, `HbcThemeProvider`) but did not wire the *orchestration* surface (`ShellCore`, feature gates, connectivity status, sign-out cleanup, redirect restoration, startup timing).

The first confirmed instance — `DevToolbar` (persona/role switcher) — was found unwired and fixed in the session that produced this plan. A subsequent codebase audit revealed 10+ additional unwired features across three priority tiers.

**Reference precedent:** The Vite alias resolution issue discovered during the DevToolbar fix (subpath import `@hbc/shell/dev-toolbar` resolving to the wrong path) is documented in Task PH6F-0 below and applies as a convention to all future subpath imports.

---

## 1. Scope Summary

| Priority | Item | Impact |
|---|---|---|
| HIGH | HbcConnectivityBar | Offline/degraded status invisible to users |
| HIGH | Shell sign-out orchestration | Stores, caches, and redirect memory not cleaned on sign-out |
| HIGH | Feature Registration System | Access-control foundation never initialized; all feature gates are currently open |
| MEDIUM | Shell redirect memory | Users sent to home after login instead of their intended destination |
| MEDIUM | Role-based landing path | All roles land at the same default path regardless of their access tier |
| MEDIUM | `useProvisioningSignalR` | Real-time provisioning progress events not delivered |
| MEDIUM | Startup timing instrumentation | No performance budget enforcement; budget violations silently pass |
| MEDIUM | `useFilterStore` / `useFormDraft` | List filtering, saved views, and form draft persistence unavailable |
| LOW | SPFx host bridge | SPFx webpart cannot signal the shell; SPFx environment adapter not created |
| LOW | Shell component exports audit | `HeaderBar`, `AppLauncher`, `ProjectPicker`, `BackToProjectHub`, `ContextualSidebar` — exported but only usable via ShellCore (document and gate) |

---

## 2. Prerequisite: Vite Subpath Alias Convention (PH6F-0)

**Status:** ALREADY FIXED (session 2026-03-07). Documented here as a standing rule.

All monorepo packages use source-level Vite aliases (e.g., `@hbc/shell` → `packages/shell/src`). When a package subpath is added (e.g., `@hbc/shell/dev-toolbar`), Vite's string-prefix matching resolves it as `packages/shell/src/dev-toolbar` — wrong case. The `package.json` exports map is bypassed by the alias.

**Standing rule:** Whenever a new subpath export is added to any `@hbc/*` package, add a corresponding more-specific alias entry **before** the root alias in **all three** Vite configs:
- `apps/pwa/vite.config.ts`
- `apps/dev-harness/vite.config.ts`
- `apps/spfx/vite.config.ts` (when it exists)

Example pattern (already applied for `@hbc/shell/dev-toolbar`):
```typescript
'@hbc/shell/dev-toolbar': path.resolve(__dirname, '../../packages/shell/src/devToolbar/index.ts'),
'@hbc/shell': path.resolve(__dirname, '../../packages/shell/src'),
```

---

## 3. HIGH Priority Tasks

---

### PH6F-1 — Mount HbcConnectivityBar in the PWA Shell

**Why:** `HbcConnectivityBar` is fully implemented and ready: it detects `navigator.onLine`, maps `ShellStatusSnapshot` to a visual bar (green 2px / orange 4px pulse / red 4px pulse), and surfaces retry/sign-in-again actions. It is never rendered anywhere in the application.

**Files affected:**
- `apps/pwa/src/router/root-route.tsx` (primary wiring point)
- `packages/ui-kit/src/HbcAppShell/HbcAppShell.tsx` (if connectivity bar is added as a built-in slot — alternative approach)

**Recommended approach:** Wire into `root-route.tsx` (PWA root component), not inside `HbcAppShell`. The bar needs a live `ShellStatusSnapshot` from the auth store, and `root-route.tsx` already imports `useAuthStore`. Keeping it outside `HbcAppShell` also means the SPFx shell can wire it independently.

#### Task 1.1 — Build ShellStatusSnapshot in RootComponent

`root-route.tsx` `RootComponent` function — add after existing `useAuthStore` import:

```typescript
import {
  resolveShellStatusSnapshot,
  type ShellStatusSnapshot,
  type ShellConnectivitySignal,
} from '@hbc/shell';
```

Inside `RootComponent`, derive the status snapshot:

```typescript
const lifecyclePhase = useAuthStore((s) => s.lifecyclePhase);
const session = useAuthStore((s) => s.session);
const structuredError = useAuthStore((s) => s.structuredError);

// Connectivity signal from navigator — updated on online/offline events
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

const shellStatusSnapshot: ShellStatusSnapshot = React.useMemo(
  () =>
    resolveShellStatusSnapshot({
      lifecyclePhase,
      experienceState: 'ready',        // Simplified: RootComponent only renders when auth passed
      hasAccessValidationIssue: false,
      hasFatalError: Boolean(structuredError),
      connectivitySignal: onlineStatus,
    }),
  [lifecyclePhase, structuredError, onlineStatus],
);
```

#### Task 1.2 — Render HbcConnectivityBar Above HbcAppShell

```typescript
import { HbcAppShell, HbcConnectivityBar } from '@hbc/ui-kit';

return (
  <>
    <HbcConnectivityBar
      shellStatus={shellStatusSnapshot}
      onShellAction={(action) => {
        if (action === 'sign-in-again') {
          useAuthStore.getState().clear();
          void router.navigate({ to: '/' });
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
      onNavigate={(href) => void router.navigate({ to: href })}
      onSignOut={() => {
        useAuthStore.getState().clear();
        void router.navigate({ to: '/' });
      }}
    >
      <Outlet />
    </HbcAppShell>
  </>
);
```

**Note on `experienceState`:** The simplified `'ready'` value is correct here because `root-route.tsx` only renders after MSAL auth has passed (inside `MsalGuard`). Full degraded-mode support requires ShellCore integration (tracked as a Phase 2 enhancement below).

#### Task 1.3 — Verify

```bash
pnpm turbo run build
# Manual: Start PWA dev server, go offline (DevTools → Network → Offline)
# Verify: Orange pulse bar appears at top of shell
# Verify: "Sign in again" / "Retry" actions render when shell status = error-failure
# Verify: Green 2px bar shows when online and authenticated
```

**Success criteria:**
- [ ] PH6F-1.1 `HbcConnectivityBar` renders in the PWA root at all times.
- [ ] PH6F-1.2 Bar transitions from green → orange when browser goes offline.
- [ ] PH6F-1.3 Bar transitions back to green when browser comes back online.
- [ ] PH6F-1.4 `sign-in-again` action triggers auth clear and navigation to root.
- [ ] PH6F-1.5 `retry` action triggers page reload.
- [ ] PH6F-1.6 Build passes with zero TypeScript errors.

---

### PH6F-2 — Wire Shell Sign-Out Orchestration

**Why:** The current sign-out in `root-route.tsx` calls `useAuthStore.getState().clear()` directly. This misses: redirect memory cleanup, Zustand store teardown for nav/shell/project stores, feature cache eviction, and any adapter-level environment artifact cleanup. `runShellSignOutCleanup` and `createDefaultShellSignOutCleanupDependencies` handle all of this in the correct deterministic order.

**Files affected:**
- `apps/pwa/src/router/root-route.tsx`
- `apps/pwa/src/utils/shell-bridge.ts` (or a new `apps/pwa/src/auth/signOut.ts`)

#### Task 2.1 — Create signOut utility

**New file:** `apps/pwa/src/auth/signOut.ts`

```typescript
import {
  runShellSignOutCleanup,
  createDefaultShellSignOutCleanupDependencies,
} from '@hbc/shell';
import { useAuthStore } from '@hbc/auth';
import { useNavStore, useShellCoreStore } from '@hbc/shell';
import { useProjectStore } from '@hbc/shell';
import { clearRedirectMemory } from '@hbc/shell';

/**
 * Orchestrated PWA sign-out.
 * Cleans auth session, stores, redirect memory, and feature caches
 * in the deterministic order defined by runShellSignOutCleanup.
 */
export async function performPwaSignOut(): Promise<void> {
  const dependencies = createDefaultShellSignOutCleanupDependencies(
    null, // No ShellEnvironmentAdapter in PWA currently — Phase 2 will provide one
  );

  // Override the clearShellBootstrapState to clear all Zustand stores:
  const augmentedDependencies = {
    ...dependencies,
    clearShellBootstrapState: async () => {
      useAuthStore.getState().clear();
      useNavStore.getState().reset?.();
      useShellCoreStore.getState().reset?.();
      useProjectStore.getState().reset?.();
    },
    clearRedirectMemory: () => clearRedirectMemory(),
    clearAuthSession: async () => {
      useAuthStore.getState().clear();
    },
  };

  await runShellSignOutCleanup(augmentedDependencies, ['strict', 'standard']);
}
```

**Note:** `createDefaultShellSignOutCleanupDependencies(null)` produces safe no-op stubs for adapter-dependent cleanup phases. The override above replaces the Zustand store cleanup with explicit calls to each store's reset function. Verify each store has a `reset()` action — if not, add one.

#### Task 2.2 — Replace sign-out calls in root-route.tsx

Replace all instances of:
```typescript
useAuthStore.getState().clear();
void router.navigate({ to: '/' });
```
With:
```typescript
void performPwaSignOut().then(() => {
  void router.navigate({ to: '/' });
});
```

This applies to both the `onSignOut` prop on `HbcAppShell` and the `sign-in-again` action handler added in PH6F-1.

#### Task 2.3 — Add reset actions to Zustand stores (if missing)

Check `useNavStore`, `useShellCoreStore`, `useProjectStore` for a `reset()` action. If absent, add:
```typescript
// In the store definition:
reset: () => set(initialState),
```
Where `initialState` is the default state object used when the store was created.

#### Task 2.4 — Verify

```bash
pnpm turbo run build
# Manual: Sign in to PWA, navigate to a workspace
# Sign out via the user menu
# Verify: auth store is cleared (DevTools → Application → Local Storage / Session Storage)
# Verify: redirect memory key 'hbc-shell-redirect-memory' is absent after sign-out
# Verify: no stale Zustand store state (stores return to initial values)
```

**Success criteria:**
- [ ] PH6F-2.1 `performPwaSignOut()` called on all sign-out pathways.
- [ ] PH6F-2.2 Auth store cleared after sign-out.
- [ ] PH6F-2.3 Nav, shell core, and project stores reset after sign-out.
- [ ] PH6F-2.4 Redirect memory cleared after sign-out.
- [ ] PH6F-2.5 Build passes with zero TypeScript errors.

---

### PH6F-3 — Initialize the Feature Registration System

**Why:** `featureRegistration.ts` provides `createProtectedFeatureRegistry`, `defineProtectedFeatureRegistration`, `FeatureGate`, and `isFeatureAccessible` — a complete, tested access-control foundation. It has never been initialized. Currently, every feature is implicitly accessible to every role because no registry has been created and no `FeatureGate` components have been mounted.

**Files affected:**
- New file: `apps/pwa/src/features/featureRegistry.ts`
- `apps/pwa/src/main.tsx` (or App.tsx bootstrap point)
- `apps/pwa/src/router/root-route.tsx` (context injection)

#### Task 3.1 — Define the PWA Feature Registry

**New file:** `apps/pwa/src/features/featureRegistry.ts`

```typescript
import {
  defineProtectedFeatureRegistration,
  createProtectedFeatureRegistry,
  validateProtectedFeatureRegistration,
  type ProtectedFeatureRegistrationContract,
} from '@hbc/shell';

// ─── Feature Definitions ──────────────────────────────────────────────────────

const projectHub = defineProtectedFeatureRegistration({
  featureId: 'feature:project-hub',
  route: { primaryPath: '/project-hub', allowRedirectRestore: true },
  navigation: { workspaceId: 'project-hub', showInNavigation: true },
  permissions: {
    requiredFeaturePermissions: ['feature:project-hub'],
    requiredActionPermissions: {},
  },
  visibility: 'always',
  compatibleShellModes: 'all',
  compatibleRuntimeModes: 'all',
});

const accounting = defineProtectedFeatureRegistration({
  featureId: 'feature:accounting',
  route: { primaryPath: '/accounting', allowRedirectRestore: true },
  navigation: { workspaceId: 'accounting', showInNavigation: true },
  permissions: {
    requiredFeaturePermissions: ['feature:accounting-invoice'],
    requiredActionPermissions: {},
  },
  visibility: 'always',
  compatibleShellModes: 'all',
  compatibleRuntimeModes: 'all',
});

const estimating = defineProtectedFeatureRegistration({
  featureId: 'feature:estimating',
  route: { primaryPath: '/estimating', allowRedirectRestore: true },
  navigation: { workspaceId: 'estimating', showInNavigation: true },
  permissions: {
    requiredFeaturePermissions: ['feature:estimating-projects'],
    requiredActionPermissions: {},
  },
  visibility: 'always',
  compatibleShellModes: 'all',
  compatibleRuntimeModes: 'all',
});

const businessDevelopment = defineProtectedFeatureRegistration({
  featureId: 'feature:business-development',
  route: { primaryPath: '/bd', allowRedirectRestore: true },
  navigation: { workspaceId: 'business-development', showInNavigation: true },
  permissions: {
    requiredFeaturePermissions: ['feature:project-hub'],  // BD role — refine when BD auth model is complete
    requiredActionPermissions: {},
  },
  visibility: 'always',
  compatibleShellModes: 'all',
  compatibleRuntimeModes: 'all',
});

const admin = defineProtectedFeatureRegistration({
  featureId: 'feature:admin',
  route: { primaryPath: '/admin', allowRedirectRestore: false },
  navigation: { workspaceId: 'admin', showInNavigation: true },
  permissions: {
    requiredFeaturePermissions: ['feature:admin-panel'],
    requiredActionPermissions: {},
  },
  visibility: 'always',
  compatibleShellModes: 'all',
  compatibleRuntimeModes: 'all',
});

// ─── Registry ─────────────────────────────────────────────────────────────────

const ALL_FEATURES: readonly ProtectedFeatureRegistrationContract[] = [
  projectHub,
  accounting,
  estimating,
  businessDevelopment,
  admin,
];

// Validate all registrations at module load time (throws in DEV if misconfigured)
if (import.meta.env.DEV) {
  for (const feature of ALL_FEATURES) {
    const result = validateProtectedFeatureRegistration(feature);
    if (!result.valid) {
      throw new Error(
        `Invalid feature registration for "${feature.featureId}": ${result.errors.join(', ')}`,
      );
    }
  }
}

export const FEATURE_REGISTRY = createProtectedFeatureRegistry(ALL_FEATURES);

// Convenience set: all feature permission strings needed by DevAuthBypassAdapter mapping
export const ALL_FEATURE_PERMISSION_KEYS = ALL_FEATURES.flatMap(
  (f) => f.permissions.requiredFeaturePermissions,
);
```

**Adding more features:** As modules are built (Leadership, HR, OpEx), add their `defineProtectedFeatureRegistration` entry here and expand the permission mapping in `DevAuthBypassAdapter.mapRolesToPermissions()`.

#### Task 3.2 — Register Features with the Auth Permission Store

The `FEATURE_REGISTRY` must be loaded into the auth permission store so that `FeatureGate`, `isFeatureAccessible`, and `evaluateFeatureAccess` have data to work against.

In `apps/pwa/src/main.tsx` (or App.tsx, before the router renders), import and register:

```typescript
import { FEATURE_REGISTRY } from './features/featureRegistry.js';
import { usePermissionStore } from '@hbc/auth';

// Register feature contracts once at bootstrap — before any routing
usePermissionStore.getState().registerFeatures(FEATURE_REGISTRY);
```

**Note:** Verify `usePermissionStore.registerFeatures()` exists — if the permission store has a different registration API, match its actual method name.

#### Task 3.3 — Add FeatureGate to workspace routes

For each route that maps to a protected workspace, add a `FeatureGate` component wrapping the content:

```typescript
// In the workspace route component (example: accounting route)
import { FeatureGate } from '@hbc/auth';

export function AccountingRoute() {
  return (
    <FeatureGate featureId="feature:accounting" fallback={<AccessDenied />}>
      <AccountingPage />
    </FeatureGate>
  );
}
```

This is a progressive enhancement — add to routes as they are built out in subsequent phase tasks. The registry initialization in Task 3.2 is the critical prerequisite.

#### Task 3.4 — Verify

```bash
pnpm turbo run build
# Dev verification:
# 1. Load PWA as 'AccountingUser' persona in DevToolbar
# 2. Navigate to /project-hub — should render (ProjectUser permission)
# 3. Navigate to /accounting — should render (AccountingUser permission)
# 4. Navigate to /admin — should be blocked by FeatureGate (no admin permission)
# 5. Switch to 'Administrator' persona — /admin should now render
```

**Success criteria:**
- [ ] PH6F-3.1 `FEATURE_REGISTRY` created from validated feature contracts.
- [ ] PH6F-3.2 Registry registered with auth permission store at bootstrap.
- [ ] PH6F-3.3 `validateProtectedFeatureRegistration` runs in DEV on all contracts at module load.
- [ ] PH6F-3.4 `FeatureGate` blocks access for personas without the required permission.
- [ ] PH6F-3.5 `FeatureGate` passes access for personas with the required permission.
- [ ] PH6F-3.6 Build passes with zero TypeScript errors.

---

## 4. MEDIUM Priority Tasks

---

### PH6F-4 — Wire Shell Redirect Memory (Post-Login Destination Restore)

**Why:** When a user navigates to `/accounting` before their session is active, the expected UX is: auth redirects them to login, then on return they land at `/accounting`. Currently they always land at the default root path.

**Functions needed:** `captureIntendedDestination`, `resolvePostGuardRedirect`, `clearRedirectMemory`, `isSafeRedirectPath` (all from `@hbc/shell/redirectMemory`).

**Files affected:**
- `apps/pwa/src/router/root-route.tsx`
- `apps/pwa/src/auth/MsalGuard.tsx`

#### Task 4.1 — Capture intended destination before auth redirect

In `root-route.tsx`, `createRootRoute`'s `beforeLoad`:

```typescript
import {
  captureIntendedDestination,
  resolvePostGuardRedirect,
  clearRedirectMemory,
} from '@hbc/shell';

export const rootRoute = createRootRoute({
  beforeLoad: ({ location }) => {
    // If session is not yet established and user is navigating to a protected path,
    // capture their intended destination before MSAL redirects to login.
    const isAuthenticated = useAuthStore.getState().lifecyclePhase === 'authenticated';
    if (!isAuthenticated && isSafeRedirectPath(location.pathname)) {
      captureIntendedDestination({
        pathname: location.pathname,
        runtimeMode: 'pwa',
      });
    }
  },
  component: RootComponent,
});
```

#### Task 4.2 — Restore intended destination after auth completes

In `RootComponent`, add a `useEffect` that fires after session is established:

```typescript
const lifecyclePhase = useAuthStore((s) => s.lifecyclePhase);

React.useEffect(() => {
  if (lifecyclePhase !== 'authenticated') return;

  const resolvedPath = resolvePostGuardRedirect({
    runtimeMode: 'pwa',
    fallbackPath: '/',
    isTargetAllowed: (pathname) => pathname !== currentPathname,
  });

  if (resolvedPath && resolvedPath !== '/') {
    clearRedirectMemory();
    void router.navigate({ to: resolvedPath });
  }
}, [lifecyclePhase]);
```

**Note:** This `useEffect` pattern mirrors what `ShellCore` does internally (lines ~400–430 of ShellCore.tsx). Until `ShellCore` is fully adopted, the PWA implements equivalent logic directly in the root component.

#### Task 4.3 — Verify

```bash
# 1. Navigate to /accounting in a fresh browser tab (not signed in)
# 2. MSAL redirects to login
# 3. Complete sign-in
# 4. Verify: lands at /accounting, not at /
# 5. Repeat with /project-hub/some-project-id — verify deep link restored
```

**Success criteria:**
- [ ] PH6F-4.1 Intended destination captured before MSAL redirect.
- [ ] PH6F-4.2 Destination restored after auth completes.
- [ ] PH6F-4.3 Unsafe paths (e.g., `/login`, `/`) are not captured as redirect targets.
- [ ] PH6F-4.4 Redirect memory cleared after restoration to avoid stale redirects.

---

### PH6F-5 — Wire Role-Based Landing Path Resolution

**Why:** `resolveRoleLandingPath` maps an array of resolved role strings to the appropriate workspace landing path (e.g., `AccountingUser` → `/accounting`). Currently all users land at the default router path regardless of role.

**Function:** `resolveRoleLandingPath(resolvedRoles: readonly string[]): string` (from `@hbc/shell`).

**Files affected:**
- `apps/pwa/src/router/root-route.tsx`

#### Task 5.1 — Use resolveRoleLandingPath for post-auth navigation

In `RootComponent`, when the session becomes authenticated and no redirect memory target exists:

```typescript
import { resolveRoleLandingPath } from '@hbc/shell';

// Inside the useEffect that fires on auth completion (PH6F-4 Task 4.2):
React.useEffect(() => {
  if (lifecyclePhase !== 'authenticated') return;

  const resolvedRoles = useAuthStore.getState().session?.resolvedRoles ?? [];
  const redirectMemoryPath = resolvePostGuardRedirect({
    runtimeMode: 'pwa',
    fallbackPath: null, // Null means: use role-based landing
    isTargetAllowed: (pathname) => pathname !== currentPathname,
  });

  const landingPath = redirectMemoryPath ?? resolveRoleLandingPath(resolvedRoles);
  clearRedirectMemory();

  if (currentPathname === '/' || currentPathname === '') {
    void router.navigate({ to: landingPath });
  }
}, [lifecyclePhase]);
```

**Note:** `resolveRoleLandingPath` internal logic — verify its mapping covers the current role strings emitted by `DevAuthBypassAdapter.mapRolesToPermissions()` and the MSAL adapter. If the function uses hardcoded role IDs that differ from what the adapters emit, update the mapping accordingly.

#### Task 5.2 — Verify

```bash
# 1. Login as 'AccountingUser' persona
# Verify: lands at /accounting
# 2. Login as 'Administrator' persona
# Verify: lands at admin landing path
# 3. Login as 'ProjectUser' persona
# Verify: lands at /project-hub
```

**Success criteria:**
- [ ] PH6F-5.1 Authenticated users with role `AccountingUser` land at `/accounting`.
- [ ] PH6F-5.2 Authenticated users with role `Administrator` land at the admin workspace.
- [ ] PH6F-5.3 Redirect memory destination takes priority over role-based landing.
- [ ] PH6F-5.4 Users already on a non-root path are not navigated away.

---

### PH6F-6 — Wire `useProvisioningSignalR` in the Provisioning UI

**Why:** `useProvisioningSignalR` manages a SignalR connection to receive real-time `IProvisioningProgressEvent` messages during project provisioning. Without it, the provisioning progress UI must poll or remain static.

**Hook signature:**
```typescript
useProvisioningSignalR({
  negotiateUrl: string,   // Function App base URL + /api/provisioning-negotiate
  projectId: string,
  getToken: () => Promise<string>,
  enabled?: boolean,
}): { isConnected: boolean }
```

**Files affected:**
- The provisioning status page/component (in `apps/pwa/src/routes/` or wherever the provisioning saga UI is rendered — check PH6 provisioning plan for exact path)

#### Task 6.1 — Mount the hook in the provisioning progress view

```typescript
// In the provisioning progress component:
import { useProvisioningSignalR } from '@hbc/provisioning';
import { useAuthStore } from '@hbc/auth';

function ProvisioningProgressView({ projectId }: { projectId: string }) {
  const getToken = React.useCallback(async () => {
    // Retrieve Bearer token from auth store or MSAL token factory
    return useAuthStore.getState().session?.accessToken ?? '';
  }, []);

  const { isConnected } = useProvisioningSignalR({
    negotiateUrl: import.meta.env.VITE_API_BASE_URL + '/api/provisioning-negotiate',
    projectId,
    getToken,
    enabled: Boolean(projectId),
  });

  // isConnected drives a connection status indicator in the UI
  // provisioningStore.progressEvents is populated by the hook automatically
  const events = useProvisioningStore((s) => s.progressEvents);

  return (
    <ProvisioningProgressDisplay
      events={events}
      isConnected={isConnected}
    />
  );
}
```

#### Task 6.2 — Add VITE_API_BASE_URL to dev environment

```
# apps/pwa/.env.development
VITE_API_BASE_URL=http://localhost:7071
```

#### Task 6.3 — Verify

```bash
# Start local Azure Functions emulator on port 7071
# Start PWA dev server
# Trigger a provisioning workflow
# Verify: SignalR connection established (isConnected = true)
# Verify: provisioningStore.progressEvents receives events in real time
# Verify: Connection auto-reconnects on disconnect (per withAutomaticReconnect config)
```

**Success criteria:**
- [ ] PH6F-6.1 `useProvisioningSignalR` mounted in the provisioning progress view.
- [ ] PH6F-6.2 `isConnected` reflects actual SignalR connection state.
- [ ] PH6F-6.3 `progressEvents` in provisioning store are populated from SignalR events.
- [ ] PH6F-6.4 Hook cleans up the connection on component unmount.
- [ ] PH6F-6.5 `VITE_API_BASE_URL` env var controls the negotiate endpoint.

---

### PH6F-7 — Wire Startup Timing Instrumentation

**Why:** `startupTiming.ts` defines five budgeted phases (`runtime-detection`, `auth-bootstrap`, `session-restore`, `permission-resolution`, `first-protected-shell-render`) with defined ms budgets. The timing module auto-registers itself on `globalThis.__HBC_STARTUP_TIMING_BRIDGE__`, but the phases are never `startPhase`/`endPhase` called, so no budget validation occurs and startup regression goes undetected.

`first-protected-shell-render` is already recorded inside `ShellCore` (lines 466–480 of ShellCore.tsx). The remaining four phases need to be instrumented in the PWA bootstrap.

**Files affected:**
- `apps/pwa/src/main.tsx`
- `apps/pwa/src/auth/msal-init.ts` (or equivalent auth bootstrap file)

#### Task 7.1 — Instrument runtime-detection phase in main.tsx

```typescript
import { startPhase, endPhase, validateBudgets, getSnapshot } from '@hbc/shell';

// At the very top of main.tsx, before anything else:
startPhase('runtime-detection');

// After mode detection / auth mode resolution:
endPhase('runtime-detection', { source: 'pwa-main', outcome: 'success' });
```

#### Task 7.2 — Instrument auth-bootstrap and session-restore phases

In the MSAL initialization or `MsalGuard` setup:

```typescript
// Before MSAL instance creation:
startPhase('auth-bootstrap');

// After MSAL instance is created and configured:
endPhase('auth-bootstrap', { source: 'msal-init' });

// Before session restoration (if applicable):
startPhase('session-restore');

// After session is restored from storage:
endPhase('session-restore', { source: 'msal-session-restore' });
```

For the mock/dev auth mode (`DevAuthBypassAdapter`), instrument in the adapter's `restoreSession()` call:

```typescript
startPhase('session-restore');
const session = await adapter.restoreSession();
endPhase('session-restore', { source: 'dev-bypass-restore' });
```

#### Task 7.3 — Instrument permission-resolution phase

After the auth session is established and permissions are resolved:

```typescript
startPhase('permission-resolution');
// ... permission resolution logic
endPhase('permission-resolution', { source: 'pwa-auth-store' });
```

#### Task 7.4 — Add budget validation logging in DEV

```typescript
// After all phases complete (e.g., in root-route.tsx after first render):
if (import.meta.env.DEV) {
  const snapshot = getSnapshot();
  const validation = validateBudgets(snapshot.records ?? []);
  if (!validation.allPassed) {
    console.warn('[HB Intel Startup] Budget violations:', validation.failures);
  } else {
    console.info('[HB Intel Startup] All startup phases within budget.', snapshot);
  }
}
```

**Success criteria:**
- [ ] PH6F-7.1 All five startup phases are instrumented.
- [ ] PH6F-7.2 `getSnapshot()` returns timing records for all phases.
- [ ] PH6F-7.3 `validateBudgets()` logs violations in DEV mode.
- [ ] PH6F-7.4 Startup phase data visible on `globalThis.__HBC_STARTUP_TIMING_BRIDGE__` in DevTools console.

---

### PH6F-8 — Wire `useFilterStore` and `useFormDraft` to Data-Driven Pages

**Why:** `useFilterStore` provides filter state, URL-encoded filter persistence, saved views, and pagination state. `useFormDraft` provides auto-saved form state for long forms (e.g., the BD scorecard wizard, project creation wizard). Neither is used in any page.

**Scope note:** These are page-level hooks — they must be wired to specific pages rather than globally. This task defines the wiring pattern; implementation is completed as pages are built in subsequent phase tasks.

**Files affected:** All data-driven list pages and multi-step form pages.

#### Task 8.1 — Establish the filter hook wiring pattern

For any `HbcDataTable` list page (e.g., the accounting invoices page, BD scorecards home):

```typescript
// apps/pwa/src/routes/accounting/index.tsx
import { useFilterStore, useDomainFilters, encodeFiltersToUrl } from '@hbc/query-hooks';
import { useNavigate, useSearch } from '@tanstack/react-router';

function AccountingInvoiceList() {
  // Bind URL search params to filter store
  const search = useSearch({ from: '/accounting/' });
  const navigate = useNavigate();

  const { filters, setFilter, resetFilters, savedViews } = useDomainFilters('accounting-invoices');

  // Sync filters to/from URL on change:
  React.useEffect(() => {
    void navigate({
      to: '/accounting/',
      search: encodeFiltersToUrl(filters),
      replace: true,
    });
  }, [filters]);

  return (
    <HbcDataTable
      filters={filters}
      onFilterChange={setFilter}
      // ...
    />
  );
}
```

#### Task 8.2 — Establish the form draft wiring pattern

For any multi-step form (e.g., BD scorecard wizard Step 1):

```typescript
import { useFormDraft } from '@hbc/query-hooks';

function ScorecardFormWizard({ scorecardId }: { scorecardId?: string }) {
  // Auto-saves form state to sessionStorage every 60s or on change
  const { draft, setDraft, clearDraft } = useFormDraft(
    scorecardId ? `scorecard-edit-${scorecardId}` : 'scorecard-new',
  );

  const { control, reset } = useForm({
    defaultValues: draft ?? defaultFormValues,
  });

  // On submit: clear draft
  const onSubmit = async (data: FormData) => {
    await submitScorecard(data);
    clearDraft();
  };
}
```

#### Task 8.3 — Add domain filter keys registry

**New file:** `apps/pwa/src/features/filterKeys.ts`

```typescript
// Canonical domain filter keys — prevents typos and enables tooling
export const FILTER_KEYS = {
  ACCOUNTING_INVOICES: 'accounting-invoices',
  ESTIMATING_PROJECTS: 'estimating-projects',
  BD_SCORECARDS: 'bd-scorecards',
  PROJECT_HUB_PROJECTS: 'project-hub-projects',
} as const;
```

**Success criteria:**
- [ ] PH6F-8.1 Filter wiring pattern documented and applied to at least one list page per module.
- [ ] PH6F-8.2 Form draft wiring pattern documented and applied to BD scorecard wizard.
- [ ] PH6F-8.3 `FILTER_KEYS` registry defined to prevent key collisions across pages.
- [ ] PH6F-8.4 URL-encoded filters round-trip correctly (filter → URL → filter on reload).

---

## 5. LOW Priority Tasks

---

### PH6F-9 — SPFx Host Bridge Wiring

**Why:** `createSpfxShellEnvironmentAdapter`, `assertValidSpfxHostBridge`, and `normalizeSpfxHostSignals` are needed to wire the SPFx webpart host to the shell's environment adapter pattern. Without this, the SPFx runtime cannot signal the shell about connectivity, theme, or user context.

**Prerequisite:** SPFx webpart host app structure (`apps/spfx/`) must exist. This task is blocked until PH8 (SPFx webparts phase) is active.

**Files affected (when unblocked):**
- `apps/spfx/src/webparts/<webpartName>/<WebpartName>WebPart.ts`

#### Task 9.1 — Create SPFx environment adapter in webpart onInit

```typescript
import { createSpfxShellEnvironmentAdapter, assertValidSpfxHostBridge } from '@hbc/shell';

export default class HbIntelWebPart extends BaseClientSideWebPart<IHbIntelWebPartProps> {
  protected async onInit(): Promise<void> {
    const bridge = {
      signals: {
        theme: this.context.sdks.microsoftTeams?.context?.theme,
        isTeamsContext: Boolean(this.context.sdks.microsoftTeams),
      },
      applySignals: async (signals) => {
        // Apply SPFx-sourced signals to shell
      },
    };

    assertValidSpfxHostBridge(bridge);

    const adapter = createSpfxShellEnvironmentAdapter({
      webpartContext: this.context,
      bridge,
    });

    // Store adapter for use in React render
    this._shellAdapter = adapter;
  }
}
```

**Success criteria:**
- [ ] PH6F-9.1 SPFx environment adapter created in webpart `onInit`.
- [ ] PH6F-9.2 `assertValidSpfxHostBridge` validates bridge before use.
- [ ] PH6F-9.3 Shell connectivity bar reflects SPFx Teams context.

---

### PH6F-10 — Shell Component Export Audit & Documentation

**Why:** `HeaderBar`, `AppLauncher`, `ProjectPicker`, `BackToProjectHub`, and `ContextualSidebar` are exported from `@hbc/shell` but have zero direct usage in any app. These components are correctly consumed *through ShellCore* but are not usable independently without it. Apps importing `@hbc/shell` may attempt to use them directly in the future and encounter surprising behavior.

**Files affected:**
- `packages/shell/src/index.ts`
- `docs/reference/shell/component-exports.md` (new)

#### Task 10.1 — Add JSDoc guard comments to shell component exports

In `packages/shell/src/index.ts`, annotate each shell component export:

```typescript
/**
 * Shell layout components — designed for use inside ShellCore.
 * Direct app usage outside ShellCore is NOT supported.
 * These are exported for ShellCore's internal composition only.
 *
 * @see ShellCore for the correct integration surface.
 */
export { HeaderBar } from './HeaderBar/index.js';
export { AppLauncher } from './AppLauncher/index.js';
export { ProjectPicker } from './ProjectPicker/index.js';
export { BackToProjectHub } from './BackToProjectHub/index.js';
export { ContextualSidebar } from './ContextualSidebar/index.js';
export { ShellLayout } from './ShellLayout/index.js';
```

#### Task 10.2 — Create reference documentation

**New file:** `docs/reference/shell/component-exports.md`

Document:
- Which shell components are "internal composition" exports (usable only inside ShellCore)
- Which are "public API" exports safe for direct app use
- How to use ShellCore as the canonical integration surface
- Why direct component use is discouraged (auth state coupling, experience state, startup timing)

**Success criteria:**
- [ ] PH6F-10.1 Shell component exports annotated with JSDoc guidance.
- [ ] PH6F-10.2 Reference documentation created in `docs/reference/shell/`.

---

## 6. Phase 2 Enhancement: Full ShellCore Adoption (Deferred)

The complete long-term fix for many of the above issues (degraded mode, access-denied surface, full experience state management, startup timing from ShellCore, etc.) is to replace the `HbcAppShell` mounting in `root-route.tsx` with `ShellCore`.

This is intentionally deferred because:
1. `ShellCore` requires a `ShellEnvironmentAdapter` that the PWA does not yet have.
2. The PWA's auth flow is currently managed by `MsalGuard` (MSAL-specific), not through the shell adapter pattern.
3. The adapter pattern is designed for the multi-environment (PWA + SPFx) abstraction that becomes relevant in PH8.

**Deferred task summary (PH8+ scope):**
- Create a `PwaShellEnvironmentAdapter` implementing `ShellEnvironmentAdapter`.
- Replace `HbcAppShell` in `root-route.tsx` with `ShellCore` + `adapter`.
- Remove the manual implementations of redirect memory (PH6F-4) and role landing path (PH6F-5) — ShellCore handles these natively when given an adapter.
- Wire `connectivitySignal`, `degradedSections`, `sensitiveActionIntents`, and `renderStatusRail` via ShellCore props.
- Remove the manual `HbcConnectivityBar` mount (PH6F-1) — ShellCore's `renderStatusRail` prop replaces it.

---

## 7. Implementation Sequence

Execute tasks in this order to minimize rework:

```
PH6F-0 (done) → PH6F-3 (feature registry) → PH6F-2 (sign-out) → PH6F-1 (connectivity bar)
  → PH6F-4 (redirect memory) → PH6F-5 (role landing) → PH6F-7 (startup timing)
  → PH6F-6 (SignalR — blocked on provisioning UI) → PH6F-8 (filter/form — progressive, per page)
  → PH6F-9 (SPFx — blocked on PH8) → PH6F-10 (docs)
```

PH6F-3 first because `FeatureGate` initialization affects every subsequent route. PH6F-2 before PH6F-1 because the connectivity bar's sign-in-again action calls the sign-out pathway.

---

## 8. Definition of Done

A task in this plan is complete when:

1. The feature renders or executes correctly in a running `pnpm dev` session (PWA on port 4000, dev-harness on port 3000).
2. `pnpm turbo run build` passes with zero TypeScript errors.
3. All success criteria checkboxes for the task are checked.
4. No regressions in existing tests (`pnpm turbo run test`).

---

## 9. Master Success Criteria Checklist

**PH6F-0 (Vite Alias Convention — complete):**
- [x] PH6F-0.1 `@hbc/shell/dev-toolbar` Vite alias added to PWA vite config.
- [x] PH6F-0.2 `@hbc/shell/dev-toolbar` Vite alias added to dev-harness vite config.
- [x] PH6F-0.3 `DevToolbar` rendered in PWA `App.tsx`.
- [x] PH6F-0.4 `DevToolbar` rendered in dev-harness `App.tsx`.
- [x] PH6F-0.5 Convention documented: subpath aliases precede root alias.

**PH6F-1 (HbcConnectivityBar):**
- [ ] PH6F-1.1 through PH6F-1.6 (see Task 1.3)

**PH6F-2 (Sign-Out Orchestration):**
- [ ] PH6F-2.1 through PH6F-2.5 (see Task 2.4)

**PH6F-3 (Feature Registration):**
- [ ] PH6F-3.1 through PH6F-3.6 (see Task 3.4)

**PH6F-4 (Redirect Memory):**
- [ ] PH6F-4.1 through PH6F-4.4 (see Task 4.3)

**PH6F-5 (Role Landing Path):**
- [ ] PH6F-5.1 through PH6F-5.4 (see Task 5.2)

**PH6F-6 (SignalR):**
- [ ] PH6F-6.1 through PH6F-6.5 (see Task 6.3)

**PH6F-7 (Startup Timing):**
- [ ] PH6F-7.1 through PH6F-7.4 (see Task 7.4)

**PH6F-8 (Filter/Form Stores):**
- [ ] PH6F-8.1 through PH6F-8.4 (see Task 8.3)

**PH6F-9 (SPFx Bridge):**
- [ ] PH6F-9.1 through PH6F-9.3 (see Task 9.1)

**PH6F-10 (Component Export Docs):**
- [ ] PH6F-10.1 through PH6F-10.2 (see Task 10.2)

<!-- IMPLEMENTATION PROGRESS & NOTES
Plan created: 2026-03-07
PH6F-0: COMPLETE (DevToolbar wired in PWA + dev-harness, Vite aliases fixed)
Status: PH6F-1 through PH6F-10 ready for implementation
Sequence: PH6F-3 → PH6F-2 → PH6F-1 → PH6F-4 → PH6F-5 → PH6F-7 → PH6F-6 → PH6F-8 → PH6F-9 → PH6F-10
-->
