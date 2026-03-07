# PH6F-7 — Wire Startup Timing Instrumentation

**Plan ID:** PH6F-7-Cleanup-StartupTiming
**Parent Plan:** PH6F-DeadWiring-Cleanup-Plan.md
**Blueprint Reference:** §8b (Performance budgets), §2b (Bootstrap sequence)
**Foundation Plan Reference:** Phase 5B (startupTiming.ts, five budgeted startup phases)
**Priority:** MEDIUM
**Execution Order:** 6th in sequence (after PH6F-1 through PH6F-5)
**Estimated Effort:** 1–2 hours
**Risk:** LOW — purely additive instrumentation; no behavior changes

---

## Problem Statement

`startupTiming.ts` defines five budgeted startup phases with defined millisecond budgets:

| Phase | Budget |
|-------|--------|
| `runtime-detection` | The time to determine auth mode (mock/MSAL/SPFx) |
| `auth-bootstrap` | The time to initialize the auth adapter |
| `session-restore` | The time to restore an existing session from storage |
| `permission-resolution` | The time to load and evaluate permissions |
| `first-protected-shell-render` | Time from init to first authenticated render |

The timing module auto-registers itself on `globalThis.__HBC_STARTUP_TIMING_BRIDGE__`, making
it accessible in browser DevTools. However, **none of the four app-side phases are
instrumented** — `startPhase()` and `endPhase()` are never called from `main.tsx` or the auth
bootstrap path. Startup regressions go completely undetected.

`first-protected-shell-render` is already instrumented inside `ShellCore` (the one component
that uses the timing bridge correctly). The remaining four phases are the gap.

**Note:** `startupTiming.ts` uses `startStartupPhase`/`endStartupPhase` internally (called from
`authStore.beginBootstrap` and `authStore.completeBootstrap`) — these are different from the
app-level `startPhase`/`endPhase` calls. Verify which API surface the app should use before
implementing.

---

## Step 1 — Verify the Startup Timing API

Find the actual exported function names:

```bash
grep -n "export.*startPhase\|export.*endPhase\|export.*startStartupPhase\|export.*validateBudgets\|export.*getSnapshot" \
  packages/shell/src --include="*.ts" -r
```

The plan assumes these exports exist — verify and correct the names used in Steps 2–4:
- `startPhase(phaseName: string)` or `startStartupPhase`
- `endPhase(phaseName, context)` or `endStartupPhase`
- `validateBudgets(records[])` — checks all phases against their ms budgets
- `getSnapshot()` — returns all recorded timing data

---

## Step 2 — Instrument `runtime-detection` Phase in `main.tsx`

**File:** `apps/pwa/src/main.tsx`

The runtime detection phase covers the time from script execution to auth mode resolution:

```typescript
import { startPhase, endPhase, getSnapshot, validateBudgets } from '@hbc/shell';
// Or from the actual export path — verify in Step 1

// D-PH6F-7: Mark the very start of the app lifecycle.
// Must be the first meaningful line of main.tsx after imports.
startPhase('runtime-detection');

// ... existing import.meta.env.DEV checks and resolveAuthMode() call ...

const authMode = resolveAuthMode(); // or equivalent

// D-PH6F-7: End runtime-detection once auth mode is known.
endPhase('runtime-detection', { source: 'pwa-main', outcome: 'success', runtimeMode: authMode });
```

---

## Step 3 — Instrument `auth-bootstrap` and `session-restore` Phases

**File:** `apps/pwa/src/main.tsx` or `apps/pwa/src/auth/msal-init.ts`

For the **mock/dev auth path** (bootstrapMockEnvironment):

```typescript
// D-PH6F-7: mock auth path
startPhase('auth-bootstrap');
bootstrapMockEnvironment(); // from PH6F.3 updated bootstrap — synchronous
endPhase('auth-bootstrap', { source: 'mock-bootstrap', outcome: 'success' });

// session-restore is effectively instantaneous in mock mode
startPhase('session-restore');
// Mock: no async session restore needed — session is set synchronously
endPhase('session-restore', { source: 'mock-bootstrap', outcome: 'success' });

startPhase('permission-resolution');
usePermissionStore.getState().setFeatureRegistrations(/* ... */); // from PH6F-3
endPhase('permission-resolution', { source: 'pwa-bootstrap', outcome: 'success' });
```

For the **MSAL auth path** (in `MsalGuard` or MSAL initialization file):

```typescript
// D-PH6F-7: MSAL auth path
startPhase('auth-bootstrap');

// Before MSAL PublicClientApplication.initialize() or equivalent:
const msalInstance = new PublicClientApplication(msalConfig);
await msalInstance.initialize();

endPhase('auth-bootstrap', { source: 'msal-init', outcome: 'success' });

// Before session restoration from MSAL cache:
startPhase('session-restore');

const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  // Attempt silent session restore
  const result = await msalInstance.acquireTokenSilent(/* ... */);
  endPhase('session-restore', { source: 'msal-cache', outcome: result ? 'success' : 'failure' });
} else {
  endPhase('session-restore', { source: 'msal-cache', outcome: 'not-found' });
}
```

---

## Step 4 — Instrument `permission-resolution` Phase

For both auth paths, instrument the permission resolution that occurs after the session is set:

```typescript
// D-PH6F-7: Covers usePermissionStore.setFeatureRegistrations and setPermissions
startPhase('permission-resolution');

// ... permission store initialization (setPermissions, setFeatureRegistrations) ...

endPhase('permission-resolution', { source: 'pwa-bootstrap', outcome: 'success' });
```

---

## Step 5 — Add Budget Validation Logging (DEV mode)

In `root-route.tsx` or `App.tsx`, after the first successful render, check for budget
violations:

```typescript
// In RootComponent, useEffect that fires once on mount:
React.useEffect(() => {
  if (!import.meta.env.DEV) return;

  // D-PH6F-7: Validate startup budgets and log any violations.
  // Runs once after first render — all phases should be complete by this point.
  const snapshot = getSnapshot();
  const validation = validateBudgets(snapshot.records ?? []);

  if (!validation.allPassed) {
    console.warn('[HB Intel Startup] ⚠️ Startup budget violations:', validation.failures);
  } else {
    console.info('[HB Intel Startup] ✅ All startup phases within budget.', snapshot);
  }

  // Bridge is also accessible in DevTools console:
  // window.__HBC_STARTUP_TIMING_BRIDGE__.getSnapshot()
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

---

## Step 6 — Verify Phase Name Constants

Confirm the exact phase name strings by checking `startupTiming.ts`:

```bash
grep -n "PHASE\|phase.*name\|'runtime-detection'\|'auth-bootstrap'" \
  packages/shell/src --include="*.ts" -r
```

If phase names are exported as constants (e.g., `STARTUP_PHASES.AUTH_BOOTSTRAP`), use the
constants rather than string literals to prevent typos.

---

## Files Modified

| Action | File |
|--------|------|
| Modify | `apps/pwa/src/main.tsx` |
| Modify (if needed) | `apps/pwa/src/auth/msal-init.ts` or `MsalGuard.tsx` |
| Modify | `apps/pwa/src/router/root-route.tsx` (add budget validation useEffect) |

---

## Verification Commands

```bash
# 1. Build check
pnpm turbo run build

# 2. Dev server
pnpm --filter pwa dev

# 3. Open browser DevTools → Console
# a. Look for: "[HB Intel Startup] ✅ All startup phases within budget."
#    OR:       "[HB Intel Startup] ⚠️ Startup budget violations: [...]"

# 4. Access the timing bridge directly in DevTools console:
#    window.__HBC_STARTUP_TIMING_BRIDGE__.getSnapshot()
#    → Should show timing records for all 5 phases including elapsed ms

# 5. Simulate budget violation (optional):
#    Throttle CPU in DevTools → Performance → 4x slowdown
#    Reload the app
#    Verify: budget violations appear in console for phases that exceeded their budget
```

---

## Success Criteria

- [ ] PH6F-7.1 `runtime-detection` phase instrumented with `startPhase`/`endPhase`
- [ ] PH6F-7.2 `auth-bootstrap` phase instrumented for both mock and MSAL paths
- [ ] PH6F-7.3 `session-restore` phase instrumented for both mock and MSAL paths
- [ ] PH6F-7.4 `permission-resolution` phase instrumented
- [ ] PH6F-7.5 `getSnapshot()` returns non-empty timing records for all 4 app-side phases
- [ ] PH6F-7.6 `validateBudgets()` logs budget violations in DEV mode
- [ ] PH6F-7.7 `window.__HBC_STARTUP_TIMING_BRIDGE__` accessible in browser console
- [ ] PH6F-7.8 Build passes with zero TypeScript errors

<!-- IMPLEMENTATION PROGRESS & NOTES
Task created: 2026-03-07
Status: Pending implementation
Execution: Sixth in sequence
Key: Verify startPhase/endPhase export names before implementing (Step 1)
Note: ShellCore already instruments first-protected-shell-render — don't duplicate
-->
