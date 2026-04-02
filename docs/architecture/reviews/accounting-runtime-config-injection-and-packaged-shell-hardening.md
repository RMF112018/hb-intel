# Accounting Runtime Config Injection and Packaged-Shell Hardening

**Date:** 2026-04-02
**Scope:** Verify Accounting runtime config injection parity with Project Setup and harden packaged-shell evidence.
**Phase:** [Phase 11, Prompt 04](../plans/MASTER/spfx/accounting/phase-11/Prompt-04_Phase-11-Runtime-Config-Injection-Parity-and-Packaged-Shell-Hardening.md)
**Predecessor:** [API Permission Contract Reconciliation](accounting-protected-api-permission-contract-reconciliation.md) (P11-03)
**Comparison baseline:** [Project Setup Packaging Runtime Config Gap Validation](project-setup-packaging-runtime-config-gap-validation.md)

## 1. Injection Inputs

The Accounting packaged shell receives four runtime configuration values, all injected at webpack compile time via DefinePlugin constants:

| Input | Env Var Source | DefinePlugin Constant | Default When Unset |
|-------|---------------|----------------------|-------------------|
| Function App URL | `FUNCTION_APP_URL` | `__FUNCTION_APP_URL__` | `''` (empty — app throws ConfigError in production mode) |
| Backend mode | `BACKEND_MODE` | `__BACKEND_MODE__` | `''` (empty — app defaults to `'production'`) |
| Backend mode switch | `ALLOW_BACKEND_MODE_SWITCH` | `__ALLOW_BACKEND_MODE_SWITCH__` | `''` (empty — app defaults to `false`) |
| API audience | `API_AUDIENCE` | `__API_AUDIENCE__` | `''` (empty — token acquisition skipped) |

Two additional constants are injected for bundle loading (not runtime config):

| Input | DefinePlugin Constant | Source |
|-------|----------------------|--------|
| Bundle filename | `__APP_BUNDLE_NAME__` | Content-hashed Vite output (e.g., `accounting-app-a1b2c3d4.js`) |
| Global name | `__APP_GLOBAL_NAME__` | Domain registry (`__hbIntel_accounting`) |

## 2. Shell Injection Path

```
CI/CD environment variables
    ↓
tools/build-spfx-package.ts → shellEnv object (lines 556-567)
    ↓ (resolveDefaultBackendMode returns '' when BACKEND_MODE unset)
tools/spfx-shell/gulpfile.js → webpack.DefinePlugin (lines 26-33)
    ↓ (JSON.stringify for all values)
Compiled shell-web-part_*.js → string literals baked into bundle
    ↓
ShellWebPart.render() → conditional config construction (lines 99-137)
    ↓ (only truthy values added to runtimeConfig object)
mount(domElement, context, runtimeConfig)
```

**Key behaviors:**
- `resolveDefaultBackendMode()` returns `''` for ALL domains when `BACKEND_MODE` env var is unset (P7-02 remediation — no silent `'ui-review'` default)
- ShellWebPart only adds properties to the config object when the DefinePlugin value is truthy (non-empty string)
- `allowBackendModeSwitch` string `'true'` is converted to boolean `true` in ShellWebPart.render()

## 3. Accounting Runtime Consumption Path

```
mount.tsx → setRuntimeConfig(config)
    ↓
runtimeConfig.ts → normalizes and stores values
    ↓
getBackendMode() → runtime injection → VITE_BACKEND_MODE → 'production' default
getFunctionAppUrl() → runtime injection → VITE_FUNCTION_APP_URL → ConfigError in production
getApiAudience() → runtime injection → VITE_API_AUDIENCE → undefined
getAllowBackendModeSwitch() → runtime injection → false default
checkProductionReadiness() → validates URL + token provider availability
```

**Three-tier resolution order** (same as Estimating):
1. Runtime injection via shell config (highest priority)
2. Vite build-time environment variable (fallback)
3. Default value or error (lowest priority)

## 4. Packaged-Shell Inspection Results

### Source-Level Evidence

The injection chain is verified by source inspection of all five files in the chain. All four runtime config values flow through the full path without gaps:

| Value | build-spfx-package.ts | gulpfile.js DefinePlugin | ShellWebPart.ts render() | mount.tsx IMountConfig | runtimeConfig.ts |
|-------|----------------------|------------------------|--------------------------|-----------------------|------------------|
| functionAppUrl | `FUNCTION_APP_URL` | `__FUNCTION_APP_URL__` | `runtimeConfig.functionAppUrl` | `functionAppUrl?` | `getFunctionAppUrl()` |
| backendMode | `resolveDefaultBackendMode()` | `__BACKEND_MODE__` | `runtimeConfig.backendMode` | `backendMode?` | `getBackendMode()` |
| allowBackendModeSwitch | `ALLOW_BACKEND_MODE_SWITCH` | `__ALLOW_BACKEND_MODE_SWITCH__` | `runtimeConfig.allowBackendModeSwitch` | `allowBackendModeSwitch?` | `getAllowBackendModeSwitch()` |
| apiAudience | `API_AUDIENCE` | `__API_AUDIENCE__` | `runtimeConfig.apiAudience` | `apiAudience?` | `getApiAudience()` |

### Build-Time Evidence

The orchestrator's post-build verification (lines 264-318 of `build-spfx-package.ts`) inspects the compiled shell asset for correct bundle/global references after every build. The `.sppkg` inspection step (lines 190-250) verifies the archive contains the shell JS, Vite bundle, and correct webpart ID.

**Note:** Full `.sppkg` artifact inspection with injected env vars requires a CI/CD build with production environment variables set. Local builds produce valid artifacts but with empty runtime config values (matching the "app defaults to production, readiness check surfaces gaps" design).

### ALLOW_BACKEND_MODE_SWITCH for Accounting

`ALLOW_BACKEND_MODE_SWITCH` is supported in the Accounting injection path but is **not expected to be set in production**. The Accounting surface does not implement a reviewer-mode backend adapter (unlike Estimating's localStorage-backed `ui-review` adapter). The flag flows through the injection chain and is available if needed for future staging or review scenarios, but the current Accounting product posture does not require it. This is an intentional omission, not a gap.

## 5. Differences vs Project Setup Comparison Pattern

| Aspect | Estimating (Project Setup) | Accounting | Impact |
|--------|---------------------------|-----------|--------|
| Injection mechanism | Unified (build-spfx-package.ts → gulpfile.js → ShellWebPart.ts) | Same unified mechanism | None — identical |
| DefinePlugin constants | 6 constants | Same 6 constants | None — identical |
| Shell config construction | Conditional injection of truthy values | Same conditional logic | None — identical |
| mount() acceptance | `setRuntimeConfig(config)` | Same call | None — identical |
| runtimeConfig resolution | 3-tier fallback (runtime → env → default) | Same 3-tier fallback | None — identical |
| `checkProductionReadiness()` | Called from `ProjectSetupBackendContext.tsx` to gate production mode | Present in runtimeConfig.ts, consumed by `AccountingBackendContext.tsx` for readiness assessment | Consumer-side difference — both have the function |
| UI Review backend adapter | localStorage-backed adapter with `ui-review` mode | Not implemented — Accounting calls real API only | Consumer-side difference — does not affect injection |
| `ALLOW_BACKEND_MODE_SWITCH` | Active — enables reviewer mode switch | Supported but not expected in production | Intentional — Accounting has no reviewer adapter |

**Conclusion:** The injection mechanism is identical. All differences are consumer-side — how each app uses the injected values, not how they receive them.

## 6. Changes Made

### New test: `apps/accounting/src/test/shellInjectionChain.test.ts`

Added an end-to-end injection chain validation test suite that reads source files across the full path:
- Orchestrator env construction (build-spfx-package.ts)
- DefinePlugin injection (gulpfile.js)
- Shell webpart config construction (ShellWebPart.ts)
- Mount acceptance (mount.tsx)
- Runtime config consumption (runtimeConfig.ts)

This test catches regressions where any link in the chain is broken, ensuring the Accounting injection path remains consistent with the unified mechanism.

### No code changes required

The injection path is complete and correct. No implementation gaps were found.

## 7. Remaining Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| CI/CD env vars not set for Accounting builds | Medium | Orchestrator warns when `BACKEND_MODE` is unset; app defaults to `'production'` with readiness gating |
| `API_AUDIENCE` not set at build time → no token acquisition | Medium | `checkProductionReadiness()` reports the gap; pages degrade to error state |
| Future ALLOW_BACKEND_MODE_SWITCH activation without reviewer adapter | Low | Flag flows through but has no consumer-side effect in Accounting |
| Shell asset inspection relies on post-build string matching | Low | Orchestrator verification is automated and fails the build on mismatch |

## 8. Exact Files Inspected

### Injection chain
- `tools/build-spfx-package.ts` — orchestrator env construction, `resolveDefaultBackendMode()`, post-build verification
- `tools/spfx-shell/gulpfile.js` — DefinePlugin constant injection
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` — config construction, mount() call
- `apps/accounting/src/mount.tsx` — config acceptance, `setRuntimeConfig()`
- `apps/accounting/src/config/runtimeConfig.ts` — 3-tier resolution, getters, production readiness

### Comparison baseline
- `apps/estimating/src/mount.tsx` — comparison mount file
- `apps/estimating/src/config/runtimeConfig.ts` — comparison runtime config
- `docs/architecture/reviews/project-setup-packaging-runtime-config-gap-validation.md` — prior art

### Existing tests
- `apps/accounting/src/test/runtimeConfig.test.ts` — 22 tests covering config injection
- `apps/accounting/src/test/bundleContract.test.ts` — 18 tests covering bundle contract
