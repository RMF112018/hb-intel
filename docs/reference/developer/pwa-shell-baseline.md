# PWA Shell Baseline — Wave 1

**Purpose:** Define the PWA shell landing behavior, route protection, role-aware entry, and notification surfacing baseline for Wave 1.
**Date:** 2026-03-15
**Key files:** `apps/pwa/src/App.tsx`, `apps/pwa/src/router/root-route.tsx`, `apps/pwa/src/router/workspace-routes.ts`

---

## 1. Provider Hierarchy

```
HbcThemeProvider
  └─ HbcErrorBoundary
       └─ ComplexityProvider
            └─ SessionStateProvider (pwaExecutor)
                 └─ MsalGuard (conditional on authMode='msal')
                      └─ QueryClientProvider
                           └─ RouterProvider
```

- `SessionStateProvider` receives a `pwaExecutor` that handles offline operation replay
- `MsalGuard` wraps the router only when `HBC_AUTH_MODE='msal'` (production PWA)
- `DevToolbar` lazy-loaded in development only (zero production cost)

---

## 2. Landing Behavior

| State | Current (Wave 0) | Wave 1 Target |
|-------|------------------|---------------|
| Default landing | `/` → `/project-hub` | `/` → `/my-work` (Personal Work Hub) |
| Post-auth redirect | Redirect memory (priority 1) → role landing (priority 2) | Same priority chain, default falls through to `/my-work` |
| Administrator | `/admin` | `/admin` (unchanged) |
| Executive | `/leadership` | `/my-work` with `teamMode: 'my-team'` |
| Default user | `/project-hub` | `/my-work` with `teamMode: 'personal'` |

### Post-Auth Navigation Flow

1. **Redirect memory** (priority 1): If the user was redirected to auth from a specific page, `restoreRedirectTarget()` returns them there
2. **Role landing** (priority 2): `resolveRoleLandingPath(resolvedRoles)` routes to role-appropriate workspace
3. **Default** (priority 3): `/my-work`

Reference: `apps/pwa/src/router/root-route.tsx`

---

## 3. Route Protection

### Shell-level guard

`ProtectedContentGuard` wraps the root layout. It resolves auth lifecycle, session state, role authorization, and permission authorization in strict precedence before rendering any protected content.

### Route-level guards

```typescript
// Imperative guard in beforeLoad
export function requireAuth(): void {
  const user = useAuthStore.getState().currentUser;
  if (!user) throw redirect({ to: '/' });
}

export function requirePermission(action: string): void {
  requireAuth();
  const hasIt = usePermissionStore.getState().hasPermission(action);
  if (!hasIt) throw redirect({ to: '/project-hub' });
}
```

### Workspace-level routing

`createWorkspaceRoute(key, loader)` handles:
- Lazy component loading
- Active workspace sync via `useNavStore.getState().setActiveWorkspace(key)`
- `beforeLoad` hook for auth/permission checks

---

## 4. Role-Aware Entry Surfaces

| Role | Landing Route | Feed Mode | Shell Behavior |
|------|--------------|-----------|----------------|
| Default | `/my-work` | Personal | Standard shell with My Work badge |
| Administrator | `/admin` | N/A | Admin workspace with oversight dashboards |
| Executive | `/my-work` | Team (`my-team`) | Shell with team-mode feed, portfolio counts |

Role resolution: `resolveRoleLandingPath(resolvedRoles)` in `@hbc/shell`

---

## 5. Shell Status Surfaces

| Component | Location | Purpose | Source Package |
|-----------|----------|---------|---------------|
| `HbcConnectivityBar` | Above shell (root-route) | Connectivity status: online/degraded/offline | `@hbc/session-state` |
| `HbcSyncStatusBadge` | Workspace layout | Queued operation count with expandable detail | `@hbc/session-state` |
| `HbcMyWorkBadge` | Shell header | Unread/actionable work item count | `@hbc/my-work-feed` |
| Shell status rail | Shell sidebar | Auth lifecycle, connectivity, access state | `@hbc/shell` |

### Shell Degraded Mode

`useShellDegradedRecovery` tracks degraded state:
- Degraded eligibility based on auth lifecycle + network status
- `wasDegraded` tracking for recovery transitions
- Recovery policy surfaces via degraded section metadata

---

## 6. PWA-Specific Capabilities

| Capability | Implementation | Wave 1 Status |
|-----------|---------------|---------------|
| Service worker | `vite-plugin-pwa` with `registerType: 'autoUpdate'` | Active — auto-updates on navigation |
| Background Sync | Background Sync API for operation replay | Active — replays queued mutations on reconnect |
| Standalone display | PWA manifest with `display: 'standalone'` | Active — installable |
| Offline queue | `@hbc/session-state` operation queue | Active — `submitRequest` handler wired |
| Draft persistence | IndexedDB via `@hbc/session-state` | Active — TTL-governed, default 24h |
| Token resolution | `resolveSessionToken()` for offline executor | Active — imperative token access outside React |

### Operation Executor (Wave 1 Extension Point)

Currently handles `submitRequest` only. Wave 1 will extend for additional mutation types:
- My Work Feed actions (mark-read, defer, acknowledge)
- Feature-specific mutations as needed

---

## Related Documents

- [Wave 1 Surface Readiness Rubric](./wave-1-surface-readiness-rubric.md)
- [SPFx Baseline](./spfx-baseline.md)
- [Degraded-State UX Standard](./degraded-state-ux-standard.md)
- [Freshness Behavior](./freshness-behavior.md)
- [Work Hub Runway Definition](../work-hub/runway-definition.md)
