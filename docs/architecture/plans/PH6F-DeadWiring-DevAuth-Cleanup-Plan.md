# PH6F – Dev Auth Role Switcher: Dead-Wiring Cleanup Plan (Master Index)

**Plan ID:** PH6F-DeadWiring-DevAuth
**Blueprint Reference:** §2b (Auth Architecture), §5c (DevToolbar / Persona Switcher)
**Foundation Plan Reference:** Phase 5C (Dev Auth Bypass), Phase 4 (Bootstrap)
**Created:** 2026-03-07
**Status:** Audit Complete — Ready for Implementation
**Priority:** HIGH — Feature is silently broken in all dev environments

---

## Executive Summary

The Dev Auth Role Switcher (DevToolbar persona switcher) was built as part of Phase 5C as a
first-class developer productivity feature. It is designed to allow developers to switch between
11 pre-defined personas (Administrator, AccountingUser, EstimatingUser, ProjectUser, Executive,
Member, and 5 supplemental edge-case personas) without restarting the app or changing
configuration files.

**The feature is entirely non-functional today.**

The DevToolbar UI renders and appears in both the PWA and dev-harness apps (once the PH6F-0
Vite alias fix is applied — see PH6F-DeadWiring-Cleanup-Plan.md). However, selecting a persona
has zero effect on the application's actual auth state. Feature gates, permission checks,
navigation guards, and role-scoped UI elements remain locked to the hardcoded MOCK_USER
(`Dev Admin / *:*`) set at bootstrap regardless of which persona the toolbar displays as selected.

The root cause is an **architectural disconnect between two independently built subsystems**:
the Phase 4 Bootstrap System and the Phase 5C DevToolbar System. These systems were built in
the correct order but never wired together.

---

## The Two-System Disconnect

### System A: Bootstrap (Phase 4)

**Location:** `apps/pwa/src/bootstrap.ts`, `apps/dev-harness/src/bootstrap.ts`
**What it does:** Imperatively sets `useAuthStore` and `usePermissionStore` before React renders.
**Current state:** Sets hardcoded `MOCK_USER` (Dev Admin, `*:*` permissions). This is the only
mechanism that currently sets the Zustand auth state. Runs exactly once at app start.

```typescript
// Current behavior — both bootstrap files are identical
export function bootstrapMockEnvironment(): void {
  useAuthStore.getState().setUser(MOCK_USER);           // hardcoded admin
  usePermissionStore.getState().setPermissions(['*:*']); // wildcard permissions
  // ...
}
```

### System B: DevToolbar (Phase 5C)

**Location:** `packages/shell/src/devToolbar/`
**What it does:** Provides a UI for selecting personas; manages local component state via
`useDevAuthBypass` hook; creates sessions via `DevAuthBypassAdapter`.
**Current state:** `selectPersona()` creates an `ISessionData` and stores it in:
  1. React component state (`setCurrentSession(session)`)
  2. `sessionStorage` (via `adapter.normalizeSession()`)

It does **not** call `useAuthStore.getState().setUser()` or `usePermissionStore.getState().setPermissions()`.
The app sees nothing. Feature gates, nav rendering, and permission hooks all remain at bootstrap state.

### The Missing Wire

```
DevToolbar.selectPersona(persona)
  ↓ calls
DevAuthBypassAdapter.normalizeSession()   → produces ISessionData
  ↓ result stored to
useDevAuthBypass component state          → ✅ toolbar UI updates
sessionStorage['hb-auth-dev-session']     → ✅ session survives refresh (for toolbar display only)
  ↓
❌ useAuthStore.setUser() NEVER CALLED
❌ usePermissionStore.setPermissions() NEVER CALLED
  ↓
App feature gates, nav guards, permission hooks  → see MOCK_USER / *:* forever
```

---

## Complete Gap Inventory

| Gap ID | Severity | Component | Description | Task File |
|--------|----------|-----------|-------------|-----------|
| DA-01 | CRITICAL | `useDevAuthBypass.ts` | `selectPersona()` never calls `useAuthStore.setUser()` after session creation | PH6F.1 |
| DA-02 | CRITICAL | `useDevAuthBypass.ts` | `selectPersona()` never calls `usePermissionStore.setPermissions()` | PH6F.1 |
| DA-03 | HIGH | `useDevAuthBypass.ts` | Mount restore (`restoreSession()`) never syncs to authStore after page refresh | PH6F.1 |
| DA-04 | HIGH | `useDevAuthBypass.ts` | `expireSession()` clears sessionStorage but never calls `useAuthStore.signOut()` | PH6F.1 |
| DA-05 | HIGH | `useDevAuthBypass.ts` | `refreshSession()` restores adapter session but never re-syncs to authStore | PH6F.1 |
| DA-06 | HIGH | `useDevAuthBypass.ts` | No `ISessionData → ICurrentUser` conversion utility exists | PH6F.1 |
| DA-07 | MEDIUM | `DevAuthBypassAdapter.ts` | `normalizeSession()` ignores `persona.permissions` — calls `mapRolesToPermissions()` instead | PH6F.2 |
| DA-08 | MEDIUM | `DevAuthBypassAdapter.ts` | `mapRolesToPermissions()` only generates 11 keys; registry personas have 17 keys | PH6F.2 |
| DA-09 | MEDIUM | `DevAuthBypassAdapter.ts` | Missing permission keys: `action:read/write/delete/approve`, `feature:audit-logs`, `feature:override-requests` | PH6F.2 |
| DA-10 | MEDIUM | `apps/pwa/src/bootstrap.ts` | Hardcoded `MOCK_USER` (Dev Admin) — ignores `PERSONA_REGISTRY.default()` | PH6F.3 |
| DA-11 | MEDIUM | `apps/dev-harness/src/bootstrap.ts` | Same hardcoded `MOCK_USER` as PWA bootstrap | PH6F.3 |
| DA-12 | LOW | `apps/pwa/src/bootstrap.ts` | Bootstrap doesn't attempt to restore persisted persona from localStorage on startup | PH6F.3 |
| DA-13 | LOW | `apps/dev-harness/src/bootstrap.ts` | Same bootstrap persona restoration gap as PWA | PH6F.3 |
| DA-14 | LOW | `useDevAuthBypass.ts` | `lifecyclePhase` transitions not coordinated with DevToolbar actions | PH6F.4 |
| DA-15 | LOW | Test coverage | No integration tests verify persona → authStore → permission gate end-to-end | PH6F.5 |

---

## Affected File Map

```
packages/
  auth/
    src/
      adapters/
        DevAuthBypassAdapter.ts          ← DA-07, DA-08, DA-09 (PH6F.2)
      mock/
        personaRegistry.ts               ← reference only (source of truth)
      stores/
        authStore.ts                     ← call target (setUser / signOut)
        permissionStore.ts               ← call target (setPermissions)
  shell/
    src/
      devToolbar/
        useDevAuthBypass.ts              ← DA-01 through DA-06, DA-14 (PH6F.1, PH6F.4)
        DevToolbar.tsx                   ← display only; no logic changes required

apps/
  pwa/
    src/
      bootstrap.ts                       ← DA-10, DA-12 (PH6F.3)
      main.tsx                           ← reference only (resolveAuthMode path)
  dev-harness/
    src/
      bootstrap.ts                       ← DA-11, DA-13 (PH6F.3)
```

---

## Type Relationships

Understanding the types involved is essential for the PH6F.1 fix:

```
IPersona                           (personaRegistry.ts)
  id: string
  name: string
  email: string
  roles: string[]
  permissions: Record<string, boolean>   ← 17 keys
          ↓
          selected in DevToolbar
          ↓
DevAuthBypassAdapter.normalizeSession()
          ↓
ISessionData                       (DevAuthBypassAdapter.ts)
  sessionId: string
  userId: string
  displayName: string
  email: string
  roles: string[]
  permissions: Record<string, boolean>   ← currently only 11 keys (DA-08/09)
  expiresAt: number
  acquiredAt: number
          ↓
          🔴 MISSING CONVERSION 🔴
          ↓
ICurrentUser                       (@hbc/models)
  id: string
  displayName: string
  email: string
  roles: Array<{
    id: string
    name: string
    permissions: string[]             ← flat string[], not Record<string, boolean>
  }>
          ↓
          passed to useAuthStore.setUser(user: ICurrentUser)
          ↓
NormalizedAuthSession              (authStore.ts - internal)
  user: ICurrentUser
  resolvedRoles: string[]
  permissionSummary: { grants: string[], overrides: string[] }
  runtimeMode: string
  ...
          ↓
          stored in useAuthStore.session
          ↓
          drives ALL feature gates, nav guards, permission hooks
```

The `ISessionData.permissions: Record<string, boolean>` must also be flattened to `string[]`
for `usePermissionStore.setPermissions()` — only the `true` entries are included.

---

## Conversion Utility (DA-06)

The core conversion that must be added to `packages/auth/src/adapters/DevAuthBypassAdapter.ts`
or as a standalone utility in `packages/shell/src/devToolbar/`:

```typescript
// sessionDataToCurrentUser.ts — new utility
import type { ICurrentUser } from '@hbc/models';
import type { ISessionData } from '@hbc/auth/dev';

/**
 * Converts a DevAuthBypassAdapter ISessionData to the ICurrentUser shape
 * expected by useAuthStore.setUser().
 *
 * Each session role becomes a role entry with permissions derived from
 * the session's permission map (only truthy entries are included).
 */
export function sessionDataToCurrentUser(session: ISessionData): ICurrentUser {
  const grantedPermissions = Object.entries(session.permissions)
    .filter(([, allowed]) => allowed)
    .map(([perm]) => perm);

  return {
    id: session.userId,
    displayName: session.displayName,
    email: session.email,
    roles: session.roles.map((roleName) => ({
      id: `role-${roleName.toLowerCase().replace(/\s+/g, '-')}`,
      name: roleName,
      permissions: grantedPermissions,
    })),
  };
}
```

---

## Implementation Sequence

Execute tasks in order — each builds on the previous:

```
PH6F.2  ←  Fix permission accuracy first (DA-07, DA-08, DA-09)
  ↓
PH6F.1  ←  Wire authStore sync using correct permissions (DA-01 through DA-06)
  ↓
PH6F.3  ←  Replace bootstrap hardcode with persona registry (DA-10 through DA-13)
  ↓
PH6F.4  ←  Verify/enforce lifecycle phase transitions (DA-14)
  ↓
PH6F.5  ←  Integration tests validating all of the above (DA-15)
```

**Rationale for order:** PH6F.1 depends on the `ISessionData.permissions` being accurate
(populated from `persona.permissions` rather than regenerated from roles). Doing PH6F.2 first
ensures that when PH6F.1 calls `usePermissionStore.setPermissions()`, the resulting permission
set correctly reflects the persona's actual permissions. Running PH6F.3 after PH6F.1 means that
bootstrap and toolbar will both use the same permission source, and the first render will show
the correct persona rather than a Dev Admin override.

---

## Success Criteria Checklist

The feature is considered 100% complete when all of the following are verified:

### Core Functionality
- [ ] Selecting a persona in the DevToolbar causes `useAuthStore.session` to update immediately
- [ ] Selecting a persona causes `usePermissionStore.permissions` to update immediately
- [ ] `useAuthStore.lifecyclePhase` reads `'authenticated'` after persona selection
- [ ] `useAuthStore.shellBootstrap.shellReadyToRender` reads `true` after persona selection
- [ ] Feature gates (`hasFeatureAccess`, `hasPermission`) return role-correct values per persona
- [ ] Navigation guards re-evaluate on persona change (role-scoped route access updates)
- [ ] Dev toolbar displays the currently active persona accurately

### Expiry & Refresh
- [ ] `expireSession()` transitions `lifecyclePhase` to `'signed-out'`
- [ ] `expireSession()` causes feature gates to deny access (no session)
- [ ] `refreshSession()` restores session to authStore, transitions to `'authenticated'`
- [ ] Page refresh restores persisted persona from sessionStorage to authStore

### Permission Accuracy
- [x] All 17 permission keys from `IPersona.permissions` are reflected in `ISessionData.permissions`
- [x] `action:read`, `action:write`, `action:delete`, `action:approve` are correctly set per persona
- [x] `feature:audit-logs` and `feature:override-requests` are correctly set per persona
- [x] The `Member` persona correctly denies `action:write` features
- [x] The `Executive` persona correctly grants `action:approve` but denies `action:write`
- [x] The `DegradedMode` persona correctly denies `feature:system-settings` and `feature:user-management`

### Bootstrap Integration
- [ ] `bootstrapMockEnvironment()` uses `PERSONA_REGISTRY.default()` (Administrator) instead of hardcoded `MOCK_USER`
- [ ] Bootstrap-derived permissions match Administrator persona's `IPersona.permissions`
- [ ] DevToolbar persona selection overrides the bootstrap persona correctly

### Test Coverage
- [ ] Integration test: all 11 personas verified round-trip through authStore
- [ ] Integration test: `expireSession` → `signed-out` lifecycle phase
- [ ] Integration test: `refreshSession` → `authenticated` lifecycle phase
- [ ] Unit test: `sessionDataToCurrentUser()` produces correct `ICurrentUser` shape
- [x] Unit test: `mapRolesToPermissions()` covers all 17 permission keys correctly

---

## Related Plans

- `PH6F-DeadWiring-Cleanup-Plan.md` — Parent plan covering all dead-wiring issues (PH6F-0 through PH6F-10)
- `PH6F-0` in that plan covers the Vite alias fix that makes the DevToolbar visible in apps
  (prerequisite — must be complete before testing these fixes)
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` — Original Phase 5C implementation plan

---

## Task File Index

| File | Scope | Gaps |
|------|-------|------|
| `PH6F.1-Cleanup-SessionToAuthStoreSync.md` | Wire persona selection to authStore + permissionStore; add conversion utility; fix expiry/refresh sync; fix mount restore | DA-01 through DA-06 |
| `PH6F.2-Cleanup-PersonaRegistryAlignment.md` | Fix `mapRolesToPermissions()` gaps; pass `persona.permissions` through; align 17-key permission set | DA-07, DA-08, DA-09 |
| `PH6F.3-Cleanup-BootstrapPersonaIntegration.md` | Replace hardcoded MOCK_USER with PERSONA_REGISTRY.default(); add localStorage persona restore at startup | DA-10, DA-11, DA-12, DA-13 |
| `PH6F.4-Cleanup-LifecyclePhaseSync.md` | Verify and enforce correct lifecyclePhase transitions for all DevToolbar actions | DA-14 |
| `PH6F.5-Cleanup-IntegrationTests.md` | Full integration test suite for persona switching end-to-end | DA-15 |

<!-- IMPLEMENTATION PROGRESS & NOTES
Plan created: 2026-03-07
Status: Audit complete, implementation pending
Prerequisite: PH6F-0 (Vite alias fix) from PH6F-DeadWiring-Cleanup-Plan.md must be complete
Next: Execute PH6F.2 → PH6F.1 → PH6F.3 → PH6F.4 → PH6F.5 in order
2026-03-07: PH6F.2 implementation completed for DA-07/DA-08/DA-09 in DevAuthBypassAdapter; 17-key permission mapping + normalizeSessionWithPermissions added with D-PH6F-02 traceability comments.
2026-03-07: Verification complete for PH6F.2 scope: build/lint/check-types passed for @hbc/auth and @hbc/shell; @hbc/auth tests passed; persona permission flags manually verified against registry definitions.
-->
