# P10-02 — Accounting Packaging and Runtime Injection Closure

> **Created:** 2026-04-02  
> **Phase:** 10 — Accounting SPFx Production Gap Closure  
> **Status:** Complete

## Objective

Wire the Accounting app's runtime config consumption path end-to-end so the shell-injected production configuration (`functionAppUrl`, `apiAudience`, `backendMode`, `allowBackendModeSwitch`) is received, stored, and resolvable by all app-level consumers.

## Prior State (P10-01 Baseline)

- Shell injection mechanism existed in `ShellWebPart.ts` and `gulpfile.js` (DefinePlugin constants).
- `mount.tsx` accepted `IMountConfig` with `functionAppUrl` and `apiAudience` but **discarded it** — `config` was never passed to the App component or stored.
- No `runtimeConfig.ts` module existed in accounting.
- No SPFx API token provider was created.
- `env.d.ts` declared only `VITE_MSAL_CLIENT_ID`, `VITE_MSAL_AUTHORITY`, `VITE_FUNCTION_APP_URL`, and `VITE_ADMIN_APP_URL`.

## Implementation

### 1. Created `apps/accounting/src/config/runtimeConfig.ts`

Module-level singleton adapted from the Project Setup pattern (`apps/estimating/src/config/runtimeConfig.ts`):

| Export | Purpose |
|--------|---------|
| `IRuntimeConfig` | Config shape: `functionAppUrl`, `backendMode`, `allowBackendModeSwitch`, `apiAudience` |
| `IProductionModeReadiness` | `{ ready: boolean, issues: string[] }` for production gating |
| `BackendMode` | `'production' \| 'ui-review'` |
| `ConfigError` | Typed error for missing required config |
| `setRuntimeConfig()` | Store config from mount; normalizes values; sparse storage |
| `getBackendMode()` | Resolution: runtime → `VITE_BACKEND_MODE` → `'production'` |
| `getAllowBackendModeSwitch()` | Resolution: runtime → `VITE_ALLOW_BACKEND_MODE_SWITCH` → `false` |
| `getFunctionAppUrl()` | Resolution: runtime → `VITE_FUNCTION_APP_URL` → `ConfigError` |
| `getApiAudience()` | Resolution: runtime → `VITE_API_AUDIENCE` → `undefined` |
| `hasRuntimeConfig()` | Diagnostic: `_config !== null` |
| `checkProductionReadiness()` | Validates `functionAppUrl` + token provider availability |
| `_resetConfig()` | Test-only reset |

### 2. Updated `apps/accounting/src/mount.tsx`

- Imports `setRuntimeConfig` and `getApiAudience` from `./config/runtimeConfig.js`
- Imports `createSpfxApiTokenProvider` from `@hbc/auth/spfx`
- Expanded `IMountConfig` to include `backendMode` and `allowBackendModeSwitch`
- Calls `setRuntimeConfig(config)` before rendering
- Creates SPFx API token provider when `apiAudience` is available
- Passes `getApiToken` to `<App>` as a prop
- Matches estimating's mount pattern exactly

### 3. Updated `apps/accounting/src/App.tsx`

- Added `getApiToken?: () => Promise<string>` to `AppProps`
- Destructured in component signature for Prompt-05 backend provider wiring

### 4. Updated `apps/accounting/src/env.d.ts`

Added declarations:
- `VITE_BACKEND_MODE?: 'production' | 'ui-review'`
- `VITE_ALLOW_BACKEND_MODE_SWITCH?: 'true' | 'false'`
- `VITE_API_AUDIENCE?: string`

Reformatted to multi-line for readability (matching estimating pattern).

## Config Flow After This Change

```
SPFx Shell (ShellWebPart.ts)
  → DefinePlugin constants (FUNCTION_APP_URL, API_AUDIENCE, BACKEND_MODE, ALLOW_BACKEND_MODE_SWITCH)
  → mount(el, spfxContext, { functionAppUrl, apiAudience, backendMode, allowBackendModeSwitch })
  → setRuntimeConfig(config)  ← NEW: stores in module singleton
  → getApiAudience() → createSpfxApiTokenProvider()  ← NEW: token provider created
  → <App getApiToken={getApiToken} />  ← NEW: token provider passed to app
```

## Remaining Work (Out of Scope)

| Gap | Owner Prompt |
|-----|-------------|
| Backend context provider consuming `getApiToken` and `runtimeConfig` | Prompt-05 |
| `webApiPermissionRequests` in package-solution.json | Prompt-04 |
| Light-theme forcing (`forceTheme="light"`) | Prompt-06 |
| Environment-state readiness messaging | Prompt-06 |
| .sppkg rebuild and artifact inspection | Prompt-09 |

## Verification

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/spfx-accounting lint` | 0 errors, 3 warnings (2 pre-existing `any` casts in global export, 1 expected `getApiToken` unused until Prompt-05) |
| `pnpm --filter @hbc/spfx-accounting build` | Passed — 1,027 KB IIFE bundle (`+1 KB` from runtimeConfig module) |
| `pnpm --filter @hbc/spfx-accounting test` | 37 tests passed across 5 test files |

## Files Changed

| File | Action |
|------|--------|
| `apps/accounting/src/config/runtimeConfig.ts` | Created |
| `apps/accounting/src/mount.tsx` | Updated — config consumption, token provider, expanded IMountConfig |
| `apps/accounting/src/App.tsx` | Updated — added `getApiToken` prop |
| `apps/accounting/src/env.d.ts` | Updated — added `VITE_API_AUDIENCE`, `VITE_BACKEND_MODE`, `VITE_ALLOW_BACKEND_MODE_SWITCH` |
| `apps/accounting/config/package-solution.json` | Version bump `001.000.019` → `001.000.020` |
