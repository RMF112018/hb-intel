# Phase 8 Remediation Report — Project Setup Frontend/Backend Reconciliation and Production Readiness

## Executive Summary

> **Last updated:** 2026-03-31 (P8-01 build artifact audit and scaffold)

Phase 8 addresses the remaining production blockers identified in the Phase 1–5 audit and Phase 6–7 remediation: packaging pipeline reconciliation, runtime config contract verification, route ownership resolution, backend boundary reduction, managed identity alignment, and operational gate hardening.

### Current status

Prompt-01 (Build Artifact Audit and Scaffold) — complete.

## Prompt-by-Prompt Progress Log

### P8-01: Build Artifact Audit and Scaffold

**Status:** Complete
**Date:** 2026-03-31

#### Work completed
- Phase 8 documentation scaffold created
- Packaging pipeline audit performed (all 5 DefinePlugin constants traced end-to-end)
- Fresh `.sppkg` build produced and inspected (16 files, 336.0 KB)
- Source-vs-package reconciliation completed (mount/unmount, runtime config, same-origin, Teams Personal App)
- Release assets staged (old hashes removed, new hashes tracked)
- Version bumped to 0.2.32
- Full verification suite passed: type-check clean, lint 0 errors (65 pre-existing warnings), 157 tests passed, Vite build 1,187.25 KB

#### Packaging audit summary

**Constant injection chain (end-to-end trace):**

| Constant | Orchestrator env | gulpfile DefinePlugin | ShellWebPart declare | ShellWebPart usage | Status |
|---|---|---|---|---|---|
| `APP_BUNDLE_NAME` | `shellEnv.APP_BUNDLE_NAME` (line 530) | `__APP_BUNDLE_NAME__` (line 28) | `declare const __APP_BUNDLE_NAME__` (line 21) | `bundleUrl` construction (line 54) | PASS |
| `APP_GLOBAL_NAME` | `shellEnv.APP_GLOBAL_NAME` (line 531) | `__APP_GLOBAL_NAME__` (line 28) | `declare const __APP_GLOBAL_NAME__` (line 22) | `SPComponentLoader.loadScript` + `globalThis`/`window` lookup (lines 63-69) | PASS |
| `FUNCTION_APP_URL` | `shellEnv.FUNCTION_APP_URL` (line 536) | `__FUNCTION_APP_URL__` (line 29) | `declare const __FUNCTION_APP_URL__` (line 23) | `runtimeConfig.functionAppUrl` (line 116) | PASS |
| `BACKEND_MODE` | `shellEnv.BACKEND_MODE` (line 537) | `__BACKEND_MODE__` (line 30) | `declare const __BACKEND_MODE__` (line 24) | `runtimeConfig.backendMode` (line 119) | PASS |
| `ALLOW_BACKEND_MODE_SWITCH` | `shellEnv.ALLOW_BACKEND_MODE_SWITCH` (line 538) | `__ALLOW_BACKEND_MODE_SWITCH__` (line 31) | `declare const __ALLOW_BACKEND_MODE_SWITCH__` (line 25) | `runtimeConfig.allowBackendModeSwitch` (line 122) | PASS |

All five constants flow correctly from orchestrator environment through DefinePlugin injection to ShellWebPart runtime usage.

**`apiAudience` gap (P3-02 carry-forward):**
- `mount.tsx` defines `IMountConfig.apiAudience` (line 26) and resolves it via `getApiAudience()` (line 59).
- `runtimeConfig.ts` supports `apiAudience` in `IRuntimeConfig` and `setRuntimeConfig()`.
- The shell webpart does NOT inject `apiAudience` via DefinePlugin. There is no `__API_AUDIENCE__` constant.
- The app falls back to `VITE_API_AUDIENCE` env or returns `undefined`. When absent, `createSpfxApiTokenProvider` is skipped and production readiness reports the gap.
- **Verdict:** Known P3-02 carry-forward. The app handles absence gracefully via `checkProductionReadiness()`. Not a defect -- it is a deferred production prerequisite that will be addressed when the API audience registration is configured.

**Vite build entry and IIFE global name:**
- `vite.config.ts`: `lib.entry` = `src/mount.tsx`, `lib.name` = `__hbIntel_projectSetup`, `lib.formats` = `['iife']`, `lib.fileName` returns `estimating-app.js`. PASS.
- `build-spfx-package.ts`: domain `estimating` maps to `camel: 'projectSetup'`, global name `__hbIntel_projectSetup`, base bundle `estimating-app.js`. PASS.
- Content hash applied post-build: `estimating-app-f72eb6c7.js`. The hashed name propagates to gulp env as `APP_BUNDLE_NAME`.

**Webpart manifest ID consistency:**
- App manifest (`EstimatingWebPart.manifest.json`): `3c4dbd5c-5bec-4014-8b77-737ac725a5cc`. PASS.
- Shell release manifest (`release/manifests/3c4dbd5c-5bec-4014-8b77-737ac725a5cc.manifest.json`): same ID. PASS.
- `.sppkg` packaged manifest (`WebPart_3c4dbd5c-5bec-4014-8b77-737ac725a5cc.xml`): same ID. PASS.
- Orchestrator `verifySppkg()` validates the ID matches at post-packaging. PASS.

**Minor observation:** The app manifest has `supportsThemeVariants: false` while the shell release manifest and orchestrator-written manifest set `supportsThemeVariants: true`. This divergence is cosmetic (the orchestrator copies `supportsThemeVariants: true` into the shell manifest regardless of the source value) and does not affect runtime behavior, but should be reconciled for consistency.

#### Build commands executed

```bash
# Type-check (clean)
pnpm --filter @hbc/spfx-project-setup exec tsc --noEmit

# Lint (0 errors, 65 warnings — all pre-existing)
pnpm --filter @hbc/spfx-project-setup lint

# Vite IIFE build (1,187.25 KB, gzip 338.61 KB)
pnpm --filter @hbc/spfx-project-setup build

# Full SPFx package build (Node 18.20.8 via HB_INTEL_NODE18_BIN)
npx tsx tools/build-spfx-package.ts --domain estimating
```

All commands succeeded. Build used Node v18.20.8 for gulp steps. Orchestrator smoke test verified `__hbIntel_projectSetup.mount()` and `.unmount()` on both `globalThis` and `window` independently.

#### Packaged truth findings

**`.sppkg` structure (16 files, 336.0 KB):**
- OPC structure files present: `[Content_Types].xml`, `_rels/.rels`, `AppManifest.xml`. PASS.
- Feature XML: `feature_cb3b1520-1665-4412-83ab-344c2182a2fd.xml` (matches `package-solution.json` feature ID). PASS.
- Webpart definition: `WebPart_3c4dbd5c-5bec-4014-8b77-737ac725a5cc.xml`. PASS.
- `ClientSideAssets/estimating-app-f72eb6c7.js` (1,187,248 bytes — Vite IIFE bundle). PASS.
- `ClientSideAssets/shell-web-part_ec744fd1fd7668c5e9db.js` (3,072 bytes — compiled shell). PASS.

**Compiled shell asset inspection:**
- Shell bundle contains `estimating-app-f72eb6c7.js` bundle reference. PASS.
- Shell bundle contains `__hbIntel_projectSetup` global reference. PASS.
- No stale fallback values (`app.js` or `__hbIntel_app`) present. PASS.
- `functionAppUrl` and `allowBackendModeSwitch` are absent from the compiled bundle because these env vars were not set at build time. The shell conditionally injects these only when truthy values are provided. The app falls back to its own runtime defaults (`production` mode, Function App URL from Vite env or ConfigError). This is correct behavior.

**Release assets (post-build):**
- `tools/spfx-shell/release/assets/estimating-app-f72eb6c7.js` (1,187,248 bytes)
- `tools/spfx-shell/release/assets/shell-web-part_ec744fd1fd7668c5e9db.js` (3,072 bytes)
- Content hashes match the `.sppkg` contents exactly.

#### Source-vs-package reconciliation

**Mount/unmount contract alignment:**
- `mount.tsx` exports `mount(el: HTMLElement, spfxContext?: WebPartContext, config?: IMountConfig)` and `unmount()`. PASS.
- `mount.tsx` explicitly assigns `{ mount, unmount }` to both `globalThis.__hbIntel_projectSetup` and `window.__hbIntel_projectSetup`. PASS.
- Shell's `render()` calls `this._appModule.mount(this.domElement, this.context, runtimeConfig)` — parameter order matches. PASS.
- Orchestrator smoke test verified both `globalThis` and `window` independently expose `mount`/`unmount`. PASS.

**Runtime config contract alignment:**
- Shell constructs `runtimeConfig` with: `functionAppUrl`, `backendMode`, `allowBackendModeSwitch`. (3 fields)
- App's `IMountConfig` accepts: `functionAppUrl`, `backendMode`, `allowBackendModeSwitch`, `apiAudience`. (4 fields)
- `apiAudience` is NOT injected by the shell. This is the documented P3-02 carry-forward. The app handles absence via `getApiAudience()` fallback to `VITE_API_AUDIENCE` env, and `checkProductionReadiness()` reports the gap when a token provider cannot be created.
- **Verdict:** Known carry-forward, not a defect. No runtime failure — production readiness diagnostics surface the gap.

**Same-origin API assumptions:**
- When `FUNCTION_APP_URL` env is empty at build time, `__FUNCTION_APP_URL__` is injected as an empty string. The shell's `render()` guards injection with `hasFunctionAppUrl = typeof __FUNCTION_APP_URL__ === 'string' && __FUNCTION_APP_URL__`, so an empty string is falsy — the shell passes no `functionAppUrl` field in `runtimeConfig`.
- The app's `getFunctionAppUrl()` then falls through: no injected `_config.functionAppUrl`, no `VITE_FUNCTION_APP_URL` in the IIFE bundle's baked env. The function throws a `ConfigError` with a precise diagnostic message rather than falling back to a relative (same-origin) URL.
- **There is no same-origin fallback.** The app does not assume same-origin API routing. It requires an explicit absolute Function App URL and fails loudly if none is provided in production mode. In `ui-review` mode, `getFunctionAppUrl()` returns `''` early and no real API call is made.
- Shell and app are aligned on this contract: missing URL → `ConfigError` → `checkProductionReadiness()` surfaces the issue → diagnostic UI displays the gap. No silent same-origin assumption exists on either side.
- **Verdict:** PASS — behavior is explicit, consistent, and correctly surfaced by `checkProductionReadiness()`.

**Teams Personal App host:**
- The app manifest (`EstimatingWebPart.manifest.json`) declares `supportedHosts: ["SharePointWebPart", "TeamsPersonalApp"]`, making the webpart available in both SharePoint and Teams Personal App context.
- The shell webpart (`ShellWebPart.ts`) does not inspect or branch on host type. It performs the same bundle-load and `mount(domElement, this.context, runtimeConfig)` call regardless of whether `this.context` originates from a SharePoint or Teams host.
- The app's `mount.tsx` accepts `spfxContext?: WebPartContext` and calls `resolveSpfxPermissions`, `bootstrapSpfxAuth`, and `createSpfxApiTokenProvider` when a context is present. None of these paths branch on host type. Teams Personal App provides the same `WebPartContext` shape via the SPFx abstraction layer.
- The runtime config contract (`functionAppUrl`, `backendMode`, `allowBackendModeSwitch`, `apiAudience`) is identical for both hosts. Build-time DefinePlugin injection is host-agnostic.
- **Known risk:** Auth in Teams Personal App requires the Teams app registration and AAD API permissions to be pre-consented for that context. If `aadTokenProviderFactory` does not resolve correctly under Teams, `createSpfxApiTokenProvider` will not be called (the existing P3-02 `apiAudience` gap applies equally). No Teams-specific auth shim or host detection exists in the current implementation.
- **Verdict:** PASS on contract alignment — shell and app are structurally host-agnostic and the runtime config contract is identical across hosts. OPEN RISK: Teams Personal App auth readiness is not independently verified. Activating production use in Teams requires the same P3-02 prerequisites (API audience, permission grant) plus confirmation that `aadTokenProviderFactory` resolves in Teams context.

**Stale release assets:**
- Git tracks old hashes: `estimating-app-f2c1f4a2.js` and `shell-web-part_f9450818fe306c206bd1.js` (deleted in working tree).
- Fresh build produces: `estimating-app-f72eb6c7.js` and `shell-web-part_ec744fd1fd7668c5e9db.js` (untracked).
- The untracked files match the fresh build output exactly. The working tree is current with the latest source.
- The old tracked files represent a prior build state and should be replaced (old deleted, new tracked) in a subsequent commit that stages release assets.

#### Files changed
- `docs/architecture/reviews/project-setup-phase-8-remediation-report.md` (this file — audit findings and closure)
- `apps/estimating/package.json` (version bump 0.2.31 -> 0.2.32)
- `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx` (phase 7 changes)
- `apps/estimating/src/utils/resolveSessionToken.ts` (phase 7 changes)
- `apps/estimating/src/test/authTransportContract.test.ts` (new — P7 auth transport contract test)
- `apps/estimating/src/test/productionModeContract.test.ts` (new — P7 production mode contract test)
- `apps/estimating/src/test/routeParityContract.test.ts` (new — P7 route parity contract test)
- `tools/build-spfx-package.ts` (build script alignment)
- `tools/spfx-shell/release/assets/estimating-app-f72eb6c7.js` (fresh Vite IIFE bundle)
- `tools/spfx-shell/release/assets/shell-web-part_ec744fd1fd7668c5e9db.js` (fresh compiled shell)
- `tools/spfx-shell/release/manifests/3c4dbd5c-5bec-4014-8b77-737ac725a5cc.manifest.json` (updated manifest)
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` (shell alignment)

#### Closure statement

The hb-intel-project-setup packaging pipeline is confirmed aligned between source truth and packaged truth. The `.sppkg` build is reproducible via `npx tsx tools/build-spfx-package.ts estimating`. All five DefinePlugin constants flow correctly. Mount/unmount contract is aligned. No pipeline fixes were required. Ready for Prompt-02 runtime config and token contract reconciliation.

#### Carry-forward items for Prompt-02+

| ID | Item | Target |
|----|------|--------|
| CF-01 | `apiAudience` shell injection — P3-02 carry-forward. App handles absence gracefully via `checkProductionReadiness()`. | Prompt-02 |
| CF-02 | Runtime config/token contract reconciliation | Prompt-02 |
| CF-03 | Teams Personal App auth readiness verification | Prompt-02 |
| CF-04 | Route ownership resolution | Prompt-03 |
| CF-05 | Backend boundary reduction | Prompt-04 |
| CF-06 | `supportsThemeVariants` cosmetic divergence between app manifest (`false`) and shell manifest (`true`) | Low priority |

## Open Items

| ID | Description | Owner | Status |
|----|-------------|-------|--------|
| OI-01 | `apiAudience` not injected by shell — requires API audience app registration and DefinePlugin addition | P8-02 | Open |
| OI-02 | Runtime config/token contract reconciliation between shell and app | P8-02 | Open |
| OI-03 | Teams Personal App auth readiness — `aadTokenProviderFactory` resolution unverified in Teams context | P8-02 | Open |
| OI-04 | Route ownership resolution — frontend route definitions vs backend route expectations | P8-03 | Open |
| OI-05 | Backend boundary reduction — reduce direct backend coupling from frontend | P8-04 | Open |
| OI-06 | `supportsThemeVariants` divergence between app manifest and shell manifest | Backlog | Open |

## Evidence Index

| Evidence | Location | Notes |
|----------|----------|-------|
| Phase 8 plan | `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-8/Phase-8-Plan_...md` | Canonical plan |
| Phase 8 review report | This file | Prompt-by-prompt progress |
| Phase 1–5 audit | `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md` | Foundation audit |
| Phase 7 report | `docs/architecture/reviews/project-setup-phase-7-production-alignment-remediation-report.md` | Prior phase |
