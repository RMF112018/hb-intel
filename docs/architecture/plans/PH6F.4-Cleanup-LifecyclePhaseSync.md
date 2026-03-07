# PH6F.4 – Lifecycle Phase Sync

**Plan ID:** PH6F.4-Cleanup-LifecyclePhaseSync
**Parent Plan:** PH6F-DeadWiring-DevAuth-Cleanup-Plan.md
**Blueprint Reference:** §2b (Auth lifecycle states), §5c (DevToolbar lifecycle control)
**Foundation Plan Reference:** Phase 5C.2 (AuthStore lifecycle), Phase 5C.3 (Session lifecycle)
**Gaps Addressed:** DA-14
**Execution Order:** 4th (after PH6F.1, PH6F.2, PH6F.3)
**Estimated Effort:** 1 hour (mostly verification, minor code additions)
**Risk:** LOW — primarily verification and edge case handling

---

## Background: `useAuthStore` Lifecycle Phase

`useAuthStore` (`packages/auth/src/stores/authStore.ts`) tracks the auth lifecycle via a
`lifecyclePhase` state field with the following valid values (from `AuthStoreSlice` type):

```typescript
lifecyclePhase:
  | 'idle'           // Initial state before any auth action
  | 'bootstrapping'  // Auth initialization in progress
  | 'restoring'      // Session restore in progress
  | 'authenticated'  // User is authenticated (session exists)
  | 'signed-out'     // Session was cleared
  | 'reauth-required'// Session expired, re-authentication needed
  | 'error'          // Fatal auth error
```

This phase drives:
- Shell rendering decisions (`shellBootstrap.shellReadyToRender`)
- Route guard evaluation
- Error boundary display
- Loading state indicators

---

## Problem Statement (DA-14)

With the pre-PH6F.1 code, `lifecyclePhase` is set at bootstrap and never changes because
DevToolbar persona changes don't touch authStore. After PH6F.1 is applied, the transitions
will be correct for most cases because:

- `useAuthStore.setUser()` → sets `lifecyclePhase: 'authenticated'`
- `useAuthStore.signOut()` → sets `lifecyclePhase: 'signed-out'`

However, there are two lifecycle edge cases that need explicit handling:

### Edge Case 1: `lifecyclePhase` before `selectPersona()` completes

There is an async gap between when `selectPersona()` starts and when `setUser()` is called.
During the simulated adapter delay (default 500ms), the lifecycle phase remains `'authenticated'`
from bootstrap — but the session being reflected is the OLD bootstrap session, not the new
persona. The UI may briefly show inconsistent state (old permissions, new persona name in toolbar).

**Severity:** LOW — 500ms async gap is barely perceptible in DEV mode
**Fix:** Optionally call `useAuthStore.getState().beginBootstrap('mock')` at the START of
`selectPersona()` to signal that authentication is in transition. This sets
`lifecyclePhase: 'bootstrapping'` which shows loading indicators. Then the
`setUser()` call at the end sets it to `'authenticated'`.

### Edge Case 2: Supplemental Persona `_session:expired` Flag

The `ExpiredSession` supplemental persona has `_session:expired: true` and all permissions
set to `false`. It is intended to test session expiry flows. When selected, the app should
behave as if the session has expired — i.e., `lifecyclePhase` should transition to
`'reauth-required'` rather than `'authenticated'`.

Without special handling, selecting the `ExpiredSession` persona would just set an authenticated
session with no permissions — which is not the intended dev test scenario.

### Edge Case 3: Supplemental Persona `_system:degraded` Flag

The `DegradedMode` supplemental persona has `_system:degraded: true`. When selected, the app
should ideally show degraded-mode indicators (if `HbcConnectivityBar` is wired — see PH6F-1
in the parent dead-wiring plan). No lifecycle phase change is needed, but the feature flags
could be set to reflect degraded mode.

---

## Solution

### 1. Transition Phase During Persona Selection

Modify `selectPersona()` in `useDevAuthBypass.ts` to signal bootstrapping during the async gap:

```typescript
const selectPersona = async (persona: IPersona): Promise<void> => {
  if (!adapter) {
    return;
  }

  setSelectedPersona(persona);

  // D-PH6F-04: Signal auth transition to suppress stale permission checks during delay.
  // beginBootstrap puts lifecyclePhase → 'bootstrapping' until setUser() completes.
  useAuthStore.getState().beginBootstrap('mock');

  try {
    const identity = await adapter.acquireIdentity();
    const session = await adapter.normalizeSessionWithPermissions(
      { ...identity, userId: persona.id, displayName: persona.name,
        email: persona.email, roles: persona.roles },
      persona.permissions,
    );
    setCurrentSession(session);

    // D-PH6F-04: Handle special supplemental persona flags.
    if (persona.permissions['_session:expired'] === true) {
      // Simulate an expired session scenario.
      sessionStorage.removeItem('hb-auth-dev-session');
      setCurrentSession(null);
      useAuthStore.getState().markReauthRequired({
        code: 'session-expired',
        message: '[DEV] Simulated session expiry via ExpiredSession persona',
        recoverable: true,
      });
      usePermissionStore.getState().clear();

      if (auditLoggingEnabled) {
        console.log('[HB-AUTH-DEV] ExpiredSession persona: transitioning to reauth-required');
      }
      return;
    }

    // Normal persona: sync to auth stores → lifecyclePhase → 'authenticated'
    const currentUser = sessionDataToCurrentUser(session);
    const grantedPermissions = extractGrantedPermissions(session.permissions);
    useAuthStore.getState().setUser(currentUser);
    usePermissionStore.getState().setPermissions(grantedPermissions);

    if (auditLoggingEnabled) {
      console.log(
        `[HB-AUTH-DEV] Persona selected: ${persona.id} | phase: authenticated`,
      );
    }
  } catch (error) {
    // D-PH6F-04: On failure, transition to error state.
    useAuthStore.getState().setStructuredError({
      code: 'dev-persona-switch-failed',
      message: `[DEV] Failed to switch persona to ${persona.id}`,
      recoverable: true,
    });
    console.error('[HB-AUTH-DEV] Failed to select persona:', error);
  }
};
```

### 2. Handle `DegradedMode` Persona Flags

When `DegradedMode` persona is selected, optionally update feature flags to match:

```typescript
// After setUser() / setPermissions() in selectPersona():
if (persona.permissions['_system:degraded'] === true) {
  // Set feature flags to simulate degraded mode
  usePermissionStore.getState().setFeatureFlags({
    'buyout-schedule': false,
    'risk-matrix': false,
    'ai-insights': false,
    'procore-sync': false,
    '_degraded-mode': true,
  });
  if (auditLoggingEnabled) {
    console.log('[HB-AUTH-DEV] DegradedMode persona: feature flags set to degraded state');
  }
}
```

### 3. Verify Lifecycle Phase Transitions Table

The full transition table after all PH6F changes are applied:

| DevToolbar Action | Before Action | After Action | Notes |
|-------------------|---------------|--------------|-------|
| `selectPersona(normalPersona)` | `authenticated` | `bootstrapping` → `authenticated` | Brief bootstrapping during 500ms adapter delay |
| `selectPersona(expiredSession)` | `authenticated` | `reauth-required` | Special handling for expired persona |
| `expireSession()` | `authenticated` | `signed-out` | `signOut()` sets this phase |
| `refreshSession()` → session found | `signed-out` | `authenticated` | `setUser()` sets this phase |
| `refreshSession()` → no session | `signed-out` | `signed-out` | `signOut()` called again (no-op) |
| Page refresh → persona in localStorage | `idle` | `bootstrapping` → `authenticated` | Bootstrap runs setUser() synchronously |
| Page refresh → no localStorage | `idle` | `bootstrapping` → `authenticated` | Bootstrap uses PERSONA_REGISTRY.default() |

---

## `beginBootstrap` Availability Check

`useAuthStore.beginBootstrap()` exists and sets:
- `lifecyclePhase: 'bootstrapping'`
- `isLoading: true`
- `shellBootstrap.shellReadyToRender: false`

This is intentionally aggressive — it will hide the rendered content during the 500ms delay.
If this is too disruptive for a dev environment, an alternative is to NOT call `beginBootstrap()`
and instead just let the transition be direct from `authenticated` to `authenticated` (no
intermediate loading state). This is acceptable given the 500ms duration is short and
`import.meta.env.DEV` is always true in this code path.

**Decision:** Make `beginBootstrap()` optional, controlled by a DevToolbar setting.
The DevToolbar already has an `authDelay` slider. If `authDelay === 0`, skip the
`beginBootstrap()` call to avoid the loading flash for instantaneous switches.

```typescript
// Conditional: only signal bootstrapping if delay > 100ms
if (authDelay > 100) {
  useAuthStore.getState().beginBootstrap('mock');
}
```

---

## ShellBootstrap Readiness After Persona Switch

After PH6F.1 wires `setUser()`, `useAuthStore.shellBootstrap` will be:
```typescript
shellBootstrap: {
  authReady: true,
  permissionsReady: true,
  shellReadyToRender: true,
}
```

This is correct — the shell should render immediately after a persona switch with the new
permissions active. No additional changes needed here; `setUser()` handles all three flags.

---

## `expireSession` Lifecycle Impact on Shell

After PH6F.1 wires `signOut()`, `useAuthStore.shellBootstrap` will be:
```typescript
shellBootstrap: {
  authReady: true,
  permissionsReady: false,
  shellReadyToRender: false,
}
```

This means the shell may hide protected content and show a sign-in prompt or loading state
depending on how `ShellCore`/`HbcAppShell` handles `shellReadyToRender: false`. In dev mode,
this is the intended behavior for testing the expiry flow. The DevToolbar's "Refresh Session"
button should bring the shell back to `shellReadyToRender: true`.

---

## Files Modified

| Action | File |
|--------|------|
| Modify | `packages/shell/src/devToolbar/useDevAuthBypass.ts` (add `beginBootstrap` call and special persona handlers) |

Note: This file is also modified by PH6F.1. Apply PH6F.4 changes as additions to the PH6F.1
implementation — do not apply separately.

---

## Verification Commands

```bash
# 1. Run dev-harness
pnpm --filter dev-harness dev

# 2. Verify normal persona selection lifecycle
# Open browser devtools → React DevTools → useAuthStore
# Select "AccountingUser" in DevToolbar
# Observe: lifecyclePhase briefly shows 'bootstrapping' (if authDelay > 100ms)
# then immediately → 'authenticated'
# shellBootstrap.shellReadyToRender === true

# 3. Verify expired session persona
# Select "ExpiredSession" in DevToolbar
# Observe: lifecyclePhase → 'reauth-required'
# Observe: shell shows re-auth prompt (if implemented)
# Console: "[HB-AUTH-DEV] ExpiredSession persona: transitioning to reauth-required"

# 4. Verify expiry action
# Select any persona → click "Expire Session" in DevToolbar
# Observe: lifecyclePhase → 'signed-out'
# Observe: shellBootstrap.shellReadyToRender === false

# 5. Verify refresh action
# With expired session: click "Refresh Session"
# IF a session was in sessionStorage: lifecyclePhase → 'authenticated'
# IF no session in sessionStorage: lifecyclePhase remains 'signed-out'
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task created: 2026-03-07
Phase PH6F.4 completed: 2026-03-07
Changes applied to: packages/shell/src/devToolbar/useDevAuthBypass.ts
  - selectPersona(): conditional beginBootstrap('mock') when authDelay > 100ms
  - selectPersona(): _session:expired → markReauthRequired() + clear() + early return
  - selectPersona(): _system:degraded → setFeatureFlags() override after normal sync
  - selectPersona() catch: setStructuredError() with 'provider-bootstrap-failure'
  - Type corrections: 'session-expired' → 'expired-session', 'dev-persona-switch-failed' → 'provider-bootstrap-failure'
  - Audit log updated to include lifecycle phase
Next: Build verification (pnpm turbo run build --filter=@hbc/shell --filter=@hbc/auth)
-->
