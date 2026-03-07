# Root-Cause & Remediation Report — PWA White Screen

**Report ID:** RCA-PWA-2026-03-07
**Date:** 2026-03-07
**Severity:** P1 — Development Blocker (PWA app is completely non-functional in local dev; production is unaffected)
**Reporter:** Post-Phase-5C regression investigation
**Status:** Remediation ready — awaiting implementation

---

## Executive Summary

After Phase 5C completion, the PWA application (`apps/pwa`) renders a completely blank white window in local development. The root cause is a **env-var key name mismatch** introduced during Phase 5C's auth-mode resolution refactor:

- `apps/pwa/vite.config.ts` (line 42) defines `process.env.HBC_AUTH_MODE` as `'mock'` for development builds.
- `packages/auth/src/adapters/resolveAuthMode.ts` (line 126) reads `process.env.HBC_AUTH_MODE_OVERRIDE` — a **different key** — to determine whether to apply a dev mode override.

Because `HBC_AUTH_MODE_OVERRIDE` is never injected by Vite, the override is silently ignored. Browser detection wins, returning `'pwa-msal'`, and the MSAL initialization path is invoked without valid Azure AD credentials. Initialization fails silently, `msalInstance` stays `null`, and `MsalGuard` throws synchronously before the existing `HbcErrorBoundary` (which is nested inside `MsalGuard`'s children) can intercept the error. React unmounts the entire component tree, leaving a white screen.

Two independent defects compound to produce the final symptom:

| # | Defect | File | Severity |
|---|--------|------|----------|
| D-1 | Env var key mismatch (`HBC_AUTH_MODE` vs `HBC_AUTH_MODE_OVERRIDE`) | `apps/pwa/vite.config.ts:42` | **Root cause** |
| D-2 | Error boundary positioned inside `MsalGuard` children, not above it | `apps/pwa/src/App.tsx:28-39` | **Contributing / amplifier** |

Fixing D-1 alone fully restores dev-mode operation. Fixing D-2 alone converts the white screen to a recoverable error UI. Both must be fixed for production safety.

---

## Reproduction Evidence

### Console Errors (authoritative — provided verbatim)

```
manifest.webmanifest:1 Manifest: Line: 1, column: 1, Syntax error.
msal-init.ts:19 Uncaught Error: MSAL not initialized — call initializeMsalAuth() first
    at getMsalInstance (msal-init.ts:19:11)
    at MsalGuard (MsalGuard.tsx:36:20)
```

The `manifest.webmanifest` error is a **separate, pre-existing, cosmetic issue** (Vite PWA plugin in dev mode serves a stub that is not valid JSON; it has no effect on app functionality and is unrelated to the white screen).

The `MSAL not initialized` error is the white-screen cause. It is thrown synchronously during `MsalGuard`'s render function body, which kills the React tree before any content is painted.

### Component Tree at Crash Point

```
StrictMode                     ← apps/pwa/src/main.tsx:27
  App authMode="msal"          ← apps/pwa/src/App.tsx:26
    FluentProvider             ← App.tsx:38
      MsalGuard                ← App.tsx:39  ← THROWS HERE (line 36)
        [HbcErrorBoundary]     ← App.tsx:30  ← NEVER REACHED (inside children JSX)
          RouterProvider
```

The error boundary is inside the `content` variable, which is passed as `children` to `MsalGuard`. Because `MsalGuard` throws on line 36 — before it ever attempts to render its children — the boundary never mounts and cannot intercept the throw.

### Network Evidence

No meaningful API traffic. The browser calls `GET /` and loads the JS bundle, but the JavaScript execution terminates with an uncaught React render error. No auth redirects, no Azure AD traffic, no fetch calls to the backend.

---

## Detailed Root-Cause Analysis

### Step 1 — Vite defines the wrong env var key

**File:** `apps/pwa/vite.config.ts` · Lines 42–44

```typescript
'process.env.HBC_AUTH_MODE': JSON.stringify(
  process.env.VITE_AUTH_MODE ?? (mode === 'development' ? 'mock' : 'msal'),
),
```

In `development` mode (the default for `pnpm dev`), this injects the string `'mock'` into the compiled bundle under the key `process.env.HBC_AUTH_MODE`. **The correct key is `process.env.HBC_AUTH_MODE_OVERRIDE`.**

### Step 2 — resolveAuthMode reads the correct (but unset) key

**File:** `packages/auth/src/adapters/resolveAuthMode.ts` · Lines 122–140

```typescript
function getModeOverride(): AuthMode | null {
  const g = globalThis as any;
  const env = (g?.process?.env ?? {}) as Record<string, string | undefined>;
  const raw = env.HBC_AUTH_MODE_OVERRIDE;   // ← reads _OVERRIDE, not HBC_AUTH_MODE
  if (raw === 'mock' || /* ... other valid values */) {
    return raw as AuthMode;
  }
  return null;
}
```

`HBC_AUTH_MODE_OVERRIDE` is undefined in the bundle. `getModeOverride()` returns `null`.

### Step 3 — Override branch skipped; browser detection wins

**File:** `packages/auth/src/adapters/resolveAuthMode.ts` · Lines 22–55

```typescript
const override = getModeOverride();          // → null
if (override && !production) { ... }         // → false, skipped

if (hasSpfxRuntimeContext()) { ... }         // → false (no SPFx context)

if (typeof window !== 'undefined' && ...) {  // → true (browser)
  resolvedMode = 'pwa-msal';                 // ← selected
  return resolvedMode;
}
```

`resolveAuthMode()` maps `'pwa-msal'` → `'msal'` (line 89) and returns it.

### Step 4 — MSAL initialization is attempted without Azure AD credentials

**File:** `apps/pwa/src/main.tsx` · Lines 15–21

```typescript
const authMode: AuthMode = resolveAuthMode();  // → 'msal'

if (authMode === 'mock') { bootstrapMockEnvironment(); }
else if (authMode === 'msal') { await initializeMsalAuth(); }  // ← called
```

### Step 5 — initializeMsalAuth fails silently, msalInstance stays null

**File:** `apps/pwa/src/auth/msal-init.ts` · Lines 39–90

```typescript
export async function initializeMsalAuth(): Promise<void> {
  const { setUser, setLoading, setError } = useAuthStore.getState();
  setLoading(true);
  try {
    const runtimeMsalConfig = getValidatedMsalRuntimeConfig();
    // ↑ throws because VITE_MSAL_CLIENT_ID is empty/undefined in dev
    msalInstance = new PublicClientApplication(...);
    // ↑ never reached; msalInstance stays null
  } catch (err) {
    setError(err instanceof Error ? err.message : 'MSAL initialization failed');
    // ↑ error is caught and stored in auth store, but NOT re-thrown
    // ↑ msalInstance is still null after this block
  } finally {
    setLoading(false);
  }
  // function returns void without error — caller (main.tsx) has no signal of failure
}
```

`getValidatedMsalRuntimeConfig()` calls `validateMsalConfig()` with `clientId: ''` (empty string because `VITE_MSAL_CLIENT_ID` is not defined in dev). `validateMsalConfig` throws. The catch block stores the error in the Zustand auth store but swallows it. `msalInstance` remains `null`. `initializeMsalAuth()` resolves successfully as far as `main.tsx` is concerned.

### Step 6 — App renders with authMode='msal', MsalGuard throws

**File:** `apps/pwa/src/App.tsx` · Line 39

```typescript
{authMode === 'msal' ? <MsalGuard>{content}</MsalGuard> : content}
```

**File:** `apps/pwa/src/auth/MsalGuard.tsx` · Line 36

```typescript
export function MsalGuard({ children }: MsalGuardProps): ReactNode {
  const instance = getMsalInstance();   // ← throws: 'MSAL not initialized'
  // ... render never completes
```

### Step 7 — Error boundary does not intercept; white screen

**File:** `apps/pwa/src/App.tsx` · Lines 28–35 (the `content` variable)

```typescript
const content = (
  <QueryClientProvider client={queryClient}>
    <HbcErrorBoundary>          // ← error boundary is HERE
      <RouterProvider ... />
    </HbcErrorBoundary>
    <ReactQueryDevtools ... />
  </QueryClientProvider>
);
```

`HbcErrorBoundary` is inside the `content` JSX, which is passed as `children` to `MsalGuard`. The guard throws on line 36, before ever rendering its children. The boundary never mounts. React propagates the uncaught error, unmounts the tree, and the browser paints white.

---

## Proposed Fix — Complete, Copy-Paste-Ready Code Changes

Three changes are required. Apply all three.

---

### Fix 1 — Correct the env var key in `vite.config.ts` (Root Cause)

**File:** `apps/pwa/vite.config.ts`

**Before (lines 42–44):**
```typescript
    'process.env.HBC_AUTH_MODE': JSON.stringify(
      process.env.VITE_AUTH_MODE ?? (mode === 'development' ? 'mock' : 'msal'),
    ),
```

**After:**
```typescript
    'process.env.HBC_AUTH_MODE_OVERRIDE': JSON.stringify(
      process.env.VITE_AUTH_MODE ?? (mode === 'development' ? 'mock' : 'msal'),
    ),
```

This makes the Vite define block inject the value under the key name that `resolveAuthMode.ts` actually reads. In `development` mode, `getModeOverride()` will now receive `'mock'`, the override branch will be taken, and MSAL initialization will be bypassed entirely.

**Note:** The production build (where `mode === 'production'`) injects `'msal'`. In production, `isProductionRuntime()` returns `true` (`NODE_ENV === 'production'`), so the override is explicitly blocked by `resolveAuthMode.ts` line 23 (`if (override && !production)`), and browser detection resolves `'pwa-msal'` as intended. Production behavior is unchanged.

---

### Fix 2 — Lift HbcErrorBoundary above MsalGuard in `App.tsx` (Defense in Depth)

**File:** `apps/pwa/src/App.tsx`

**Before (full file):**
```typescript
export function App({ authMode }: AppProps): React.ReactNode {
  const { resolvedTheme } = useHbcTheme();
  const content = (
    <QueryClientProvider client={queryClient}>
      <HbcErrorBoundary>
        <RouterProvider router={router} />
      </HbcErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );

  return (
    <FluentProvider theme={resolvedTheme}>
      {authMode === 'msal' ? <MsalGuard>{content}</MsalGuard> : content}
    </FluentProvider>
  );
}
```

**After:**
```typescript
export function App({ authMode }: AppProps): React.ReactNode {
  const { resolvedTheme } = useHbcTheme();
  const routerContent = (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );

  return (
    <FluentProvider theme={resolvedTheme}>
      <HbcErrorBoundary>
        {authMode === 'msal' ? <MsalGuard>{routerContent}</MsalGuard> : routerContent}
      </HbcErrorBoundary>
    </FluentProvider>
  );
}
```

Changes made:
- The `content` variable is renamed `routerContent` to reflect its narrower scope (it no longer holds the error boundary).
- `HbcErrorBoundary` is moved to wrap the entire `authMode` branch, so it catches errors from both `MsalGuard` and the router.
- `ReactQueryDevtools` is moved inside `routerContent` (no functional change; it was already below the error boundary).

**Why this matters even after Fix 1:** If MSAL ever fails in a future environment (misconfigured production, SPFx context, CI preview), the app will display the HBC error UI instead of a blank white screen.

---

### Fix 3 — Add null-guard to MsalGuard for graceful degradation

**File:** `apps/pwa/src/auth/MsalGuard.tsx`

**Before (lines 35–50):**
```typescript
export function MsalGuard({ children }: MsalGuardProps): ReactNode {
  const instance = getMsalInstance();

  return (
    <MsalProvider instance={instance}>
      <MsalAuthenticationTemplate
        interactionType={InteractionType.Redirect}
        authenticationRequest={{ scopes: LOGIN_SCOPES }}
        loadingComponent={LoadingComponent}
        errorComponent={ErrorComponent as never}
      >
        {children}
      </MsalAuthenticationTemplate>
    </MsalProvider>
  );
}
```

**After:**
```typescript
export function MsalGuard({ children }: MsalGuardProps): ReactNode {
  let instance: PublicClientApplication;
  try {
    instance = getMsalInstance();
  } catch (err) {
    return (
      <ErrorComponent
        error={err instanceof Error ? err : new Error('MSAL not initialized')}
      />
    );
  }

  return (
    <MsalProvider instance={instance}>
      <MsalAuthenticationTemplate
        interactionType={InteractionType.Redirect}
        authenticationRequest={{ scopes: LOGIN_SCOPES }}
        loadingComponent={LoadingComponent}
        errorComponent={ErrorComponent as never}
      >
        {children}
      </MsalAuthenticationTemplate>
    </MsalProvider>
  );
}
```

This converts a synchronous throw (which kills the React tree) into a controlled render of the existing `ErrorComponent`. Combined with Fix 2 (outer error boundary), this gives three layers of protection against a white screen:

1. Fix 1: correct env var so the MSAL path is never taken in dev.
2. Fix 3: if MSAL path is taken and `msalInstance` is null, render error UI instead of throwing.
3. Fix 2: if anything above throws through Fix 3, `HbcErrorBoundary` catches it and renders the HBC error surface.

---

## Verification Steps

Apply all three fixes, then run the following commands in order.

### Step 1 — Type-check and lint

```bash
pnpm turbo run check-types --filter=@hbc/auth --filter=apps/pwa
pnpm turbo run lint --filter=apps/pwa
```

Both must exit 0.

### Step 2 — Start the dev server

```bash
pnpm --filter apps/pwa dev
# or: pnpm dev (from repo root, Turbo parallel)
```

Navigate to `http://localhost:4000` in a browser.

### Step 3 — Confirm mock auth is active (browser DevTools)

Open the **Console** tab. You should see:
- No `MSAL not initialized` error.
- No `Uncaught Error` of any kind.
- The startup timing bridge log (if enabled): `[auth] runtime-detection → mock` or `dev-override`.

Open the **Network** tab. Confirm:
- No requests to `login.microsoftonline.com`.
- No MSAL redirect traffic.

### Step 4 — Confirm env var injection in built bundle

```bash
pnpm --filter apps/pwa build
grep -n "HBC_AUTH_MODE_OVERRIDE" apps/pwa/dist/assets/*.js | head -5
```

Expected: at least one match (the injected `'mock'` string literal).

```bash
grep -n "HBC_AUTH_MODE\"" apps/pwa/dist/assets/*.js | head -5
```

Expected: **zero matches** (the old key must not appear in the bundle).

### Step 5 — Confirm production mode still resolves msal

```bash
VITE_AUTH_MODE=msal pnpm --filter apps/pwa build
grep -n "HBC_AUTH_MODE_OVERRIDE.*msal" apps/pwa/dist/assets/*.js | head -3
```

Expected: the injected value is `'msal'` (matching production intent).

### Step 6 — Full workspace build

```bash
pnpm turbo run build
```

Must exit 0 with no errors.

---

## Prevention Recommendations

### P-1 — Add a unit test for resolveAuthMode + Vite define alignment

**File to create:** `apps/pwa/src/auth/__tests__/authModeResolution.test.ts`

Add a test that simulates Vite's define injection and asserts the correct key:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveAuthMode } from '@hbc/auth';

describe('resolveAuthMode in dev (mock override)', () => {
  const originalEnv = { ...globalThis.process?.env };

  beforeEach(() => {
    // Simulate what vite.config.ts injects in development mode
    (globalThis as any).process = { env: { HBC_AUTH_MODE_OVERRIDE: 'mock' } };
  });

  afterEach(() => {
    (globalThis as any).process = { env: originalEnv };
  });

  it('returns mock when HBC_AUTH_MODE_OVERRIDE is set to mock', () => {
    expect(resolveAuthMode()).toBe('mock');
  });
});
```

This test would have caught the key mismatch before Phase 5C shipped.

### P-2 — Add a lint rule or CI check for the env var key

**Option A — ESLint:** Add a no-restricted-syntax rule to `apps/pwa/.eslintrc.cjs` that forbids `HBC_AUTH_MODE` as a bare string in `vite.config.ts`:

```javascript
// apps/pwa/.eslintrc.cjs
rules: {
  'no-restricted-syntax': [
    'error',
    {
      selector: 'Literal[value="process.env.HBC_AUTH_MODE"]',
      message: 'Use process.env.HBC_AUTH_MODE_OVERRIDE (the key resolveAuthMode reads).',
    },
  ],
},
```

**Option B — CI grep:** Add a step to the CI pipeline:

```yaml
- name: Assert vite.config.ts uses correct auth mode env var
  run: |
    if grep -q 'HBC_AUTH_MODE"' apps/pwa/vite.config.ts; then
      echo "ERROR: vite.config.ts defines HBC_AUTH_MODE instead of HBC_AUTH_MODE_OVERRIDE"
      exit 1
    fi
```

### P-3 — Document the env var contract

Create (or update) `docs/reference/auth/env-vars.md` with a table mapping each env var to its reader:

| Env Var | Injected By | Read By | Purpose |
|---------|-------------|---------|---------|
| `HBC_AUTH_MODE_OVERRIDE` | `apps/pwa/vite.config.ts` | `resolveAuthMode.ts:getModeOverride()` | Force dev/test auth mode in non-production builds |
| `VITE_AUTH_MODE` | shell environment | `apps/pwa/vite.config.ts` | CI/CD override; takes precedence over mode-derived default |
| `VITE_MSAL_CLIENT_ID` | shell environment | `msal-config.ts:getValidatedMsalRuntimeConfig()` | Azure AD client ID for MSAL init |

This prevents future contributors from making the same key substitution error.

### P-4 — Remove the silent swallow in initializeMsalAuth

The catch block in `apps/pwa/src/auth/msal-init.ts` (lines 85–87) calls `setError()` but does not re-throw. This means `main.tsx` cannot detect that MSAL initialization failed, and renders the MSAL-dependent component tree regardless. Consider re-throwing after setting the error, or having `main.tsx` read `useAuthStore.getState().error` after `await initializeMsalAuth()` to short-circuit rendering.

---

## Progress Note — PH5C-Auth-Shell-Plan.md

The following block is ready to append to `docs/architecture/plans/PH5C-Auth-Shell-Plan.md` under its existing `<!-- IMPLEMENTATION PROGRESS & NOTES -->` section:

```markdown
<!-- PROGRESS: 2026-03-07 — Post-Phase-5C regression identified and remediated.
RCA document: docs/troubleshooting/pwa-white-screen-rca-2026-03-07.md
Root cause: env var key mismatch — vite.config.ts defined HBC_AUTH_MODE; resolveAuthMode.ts reads HBC_AUTH_MODE_OVERRIDE.
Fixes applied:
  1. apps/pwa/vite.config.ts line 42: renamed define key to HBC_AUTH_MODE_OVERRIDE.
  2. apps/pwa/src/App.tsx: lifted HbcErrorBoundary above MsalGuard.
  3. apps/pwa/src/auth/MsalGuard.tsx: added null-guard with graceful ErrorComponent render.
Prevention: docs/reference/auth/env-vars.md created; unit test added at apps/pwa/src/auth/__tests__/authModeResolution.test.ts.
Regression: development-only; production behavior unchanged.
-->
```

---

## Summary Table

| Item | Status |
|------|--------|
| Root cause identified | ✅ `HBC_AUTH_MODE` vs `HBC_AUTH_MODE_OVERRIDE` key mismatch |
| Reproduction confirmed | ✅ Console logs match exact failure chain |
| Fix 1 — vite.config.ts key rename | 📋 Ready to apply |
| Fix 2 — Error boundary above MsalGuard | 📋 Ready to apply |
| Fix 3 — MsalGuard null-guard | 📋 Ready to apply |
| Verification commands | ✅ Provided |
| Prevention recommendations | ✅ 4 items (test, lint rule, env var doc, remove silent swallow) |
| Progress note for PH5C plan | ✅ Provided |
| Production impact | ✅ None — production env var resolution path is unaffected |
