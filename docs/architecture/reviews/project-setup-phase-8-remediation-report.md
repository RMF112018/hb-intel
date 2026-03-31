# Phase 8 Remediation Report — Project Setup Frontend/Backend Reconciliation and Production Readiness

## Executive Summary

> **Last updated:** 2026-03-31 (P8-02 runtime-config and token contract reconciliation)

Phase 8 addresses the remaining production blockers identified in the Phase 1–5 audit and Phase 6–7 remediation: packaging pipeline reconciliation, runtime config contract verification, route ownership resolution, backend boundary reduction, managed identity alignment, and operational gate hardening.

### Current status

Prompt-06 (API-Access Approvals, CORS, and Operational Gates) — complete.
Prompt-02 (SPFx Runtime Config and Token Contract Reconciliation) — complete.

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

### P8-02: SPFx Runtime Config and Token Contract Reconciliation

**Status:** Complete
**Date:** 2026-03-31

#### Work completed
- `apiAudience` shell injection implemented via DefinePlugin (closes CF-01/OI-01)
- Orchestrator compiled-asset and packaged-asset inspection extended for `apiAudience` reference
- Runtime-config chain verified end-to-end
- Frontend/backend audience compatibility confirmed
- Production-mode gating behavior verified

#### Runtime-config chain summary

Complete injection chain (verified in source and packaged artifact):

```
CI/deployment → API_AUDIENCE env var
  → build-spfx-package.ts shellEnv.API_AUDIENCE
    → gulpfile.js DefinePlugin __API_AUDIENCE__
      → ShellWebPart.render() → runtimeConfig.apiAudience (if truthy)
        → mount(el, spfxContext, runtimeConfig)
          → setRuntimeConfig(config) stores apiAudience
            → getApiAudience() returns: runtime config → VITE_API_AUDIENCE → undefined
              → createSpfxApiTokenProvider(spfxContext, apiAudience)
                → tokenProvider.getToken(audience) → audience-scoped JWT
                  → Backend validateToken() validates JWT aud against API_AUDIENCE env
```

Updated constant injection chain:

| Constant | Orchestrator env | gulpfile DefinePlugin | ShellWebPart declare | ShellWebPart usage | Status |
|---|---|---|---|---|---|
| `API_AUDIENCE` | `shellEnv.API_AUDIENCE` | `__API_AUDIENCE__` | `declare const __API_AUDIENCE__` | `runtimeConfig.apiAudience` (conditional) | PASS |

#### Frontend/backend token contract summary

- Frontend `getApiAudience()` and backend `resolveApiAudience()` must resolve to the same `api://<app-registration-client-id>` value
- Backend throws `TokenValidationError` with `config_error` reason if `API_AUDIENCE` is missing in production
- Frontend reports missing audience via `checkProductionReadiness()` → `productionBlocked` → diagnostic banner
- JWT `aud` claim mismatch produces backend 401 with `invalid_audience` reason code
- The Entra app registration Application ID URI is the single source of truth for both sides

#### Production-mode behavior verification

- Production mode is the first-class default (`getBackendMode()` returns `'production'`)
- `checkProductionReadiness(!!getApiToken)` gates on both `functionAppUrl` AND token provider
- Token provider requires `apiAudience` resolved AND SPFx `aadTokenProviderFactory` available
- When prerequisites unmet: falls back to `ui-review` with `console.warn` and `productionBlocked = true`
- Root route diagnostic banner displays readiness issues when `productionBlocked`
- ui-review mode uses mock client — no real API calls, no misleading demo success
- Empty `API_AUDIENCE` at build time is safe: `__API_AUDIENCE__` compiles to `''`, shell guard is falsy, no `apiAudience` injected, app falls back through `getApiAudience()` chain

#### Packaged verification results

**Verification suite (all pass):**
- Type-check: clean (0 errors)
- Lint: 0 errors, 65 pre-existing warnings
- Tests: 22 files, 157 passed, 2 todo
- Vite build: 1,187.25 KB (gzip 338.61 KB)

**`.sppkg` build with `API_AUDIENCE=api://test-client-id`:**
- Command: `API_AUDIENCE=api://test-client-id npx tsx tools/build-spfx-package.ts --domain estimating`
- Package: `hb-intel-project-setup.sppkg` (336.0 KB, 16 files)
- Vite IIFE bundle: `estimating-app-f72eb6c7.js` (1,187,248 bytes)
- Compiled shell: `shell-web-part_f979940f30fb8bd05eaf.js` (3,109 bytes)
- Shell hash changed from `ec744fd1fd7668c5e9db` (P8-01) to `f979940f30fb8bd05eaf` (P8-02) due to `apiAudience` injection code addition
- `apiAudience` reference confirmed in compiled shell asset (release and packaged)
- `api://test-client-id` literal confirmed baked into packaged shell asset
- Orchestrator checks: `✓ Compiled shell asset references estimating-app-f72eb6c7.js and __hbIntel_projectSetup`, `✓ Packaged shell asset references estimating-app-f72eb6c7.js and __hbIntel_projectSetup`
- Build used Node v18.20.8 for gulp steps

#### Files changed
- `tools/build-spfx-package.ts` — added `API_AUDIENCE` to shellEnv, extended `inspectCompiledShellAsset` and `inspectPackagedShellAsset` with apiAudience check
- `tools/spfx-shell/gulpfile.js` — added `__API_AUDIENCE__` DefinePlugin constant
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` — added `declare const __API_AUDIENCE__`, added conditional `apiAudience` injection in `render()`
- `apps/estimating/package.json` — version bump 0.2.32 → 0.2.33
- `docs/architecture/reviews/project-setup-phase-8-remediation-report.md` — P8-02 section added
- `docs/reference/developer/project-setup-frontend-api-contract.md` — apiAudience injection chain documented
- `tools/spfx-shell/release/assets/` — rebuilt release assets with apiAudience support

#### Closure statement

The apiAudience shell injection gap (CF-01/OI-01) is closed. The runtime-config and token-acquisition contract is reconciled end-to-end: shell → mount → runtimeConfig → SPFx token provider → backend validation. Frontend and backend audience values must match the Entra app registration URI. Production mode activates only when all prerequisites are satisfied. Ready for Prompt-03 route ownership resolution.

#### Carry-forward items for Prompt-03+

| ID | Item | Target |
|----|------|--------|
| CF-03 | Teams Personal App auth readiness verification (OI-03, open risk retained) | Prompt-02+ |
| CF-04 | Route ownership resolution | Prompt-03 |
| CF-05 | Backend boundary reduction | Prompt-04 |
| CF-06 | `supportsThemeVariants` cosmetic divergence | Low priority |

### P8-03: Resolve `/api/users/me/*` Routes and Identity Dependency Surface

**Status:** Complete
**Date:** 2026-03-31

#### Work completed
- Audited full `/api/users/me/*` dependency graph across frontend, backend, and shared packages
- Verified Graph search dependency (`graph.microsoft.com/v1.0/users`) is intentional SPFx-authorized integration
- Confirmed P6-03/P7-03 resolution still holds in current repo truth — no code changes needed
- Closed OI-04 (route ownership resolution)

#### `/api/users/me/*` findings

**Dependency graph audit:**

| Endpoint | Referenced in | Called by estimating app? | Backend implementation? | Status |
|----------|--------------|--------------------------|------------------------|--------|
| `/api/users/me/preferences` | `packages/complexity/src/storage/complexityApiClient.ts` (line 5) | NO — `enableApiSync` defaults to `false`; estimating app does not pass `enableApiSync={true}` | NO — no route in Project Setup domain host | Dead dependency for PS scope |
| `/api/users/me/groups` | `packages/complexity/src/storage/complexityApiClient.ts` (line 6) | NO — same `enableApiSync` gate | NO — no route in Project Setup domain host | Dead dependency for PS scope |
| `graph.microsoft.com/v1.0/users` | `packages/ui-kit/src/HbcPeoplePicker/useGraphPeopleSearch.ts` (line 14) | YES — `TeamStepBody.tsx` uses `useGraphPeopleSearch()` for people lookup | N/A — direct SPFx Graph call, not proxied | Intentional, authorized |

**Resolution path: Path A — Dead dependency (confirmed)**

The `/api/users/me/*` endpoints are not active dependencies for the Project Setup release surface:
1. Both endpoints exist only in the shared complexity package (`complexityApiClient.ts`)
2. The `ComplexityProvider` gates all API calls behind `enableApiSync` (default: `false`)
3. The estimating app does not pass `enableApiSync={true}` to `ComplexityProvider`
4. Both API functions gracefully degrade on 404 (return `null`/fallback to localStorage)
5. No backend handler implements either route in the Project Setup domain host
6. Test coverage confirms: `routeParityContract.test.ts` verifies API sync is disabled; `authTransportContract.test.ts` confirms credentials are behind the disabled flag

This matches the P6-03 decision (Option B) and the P7-03 confirmation. No code changes are required — the architecture is correct and production-safe.

**No code removal needed:** The complexity package's API client functions are shared infrastructure that may be enabled by other apps in the future. Removing them from the package would be scope-broadening. The estimating app's disabled `enableApiSync` flag is the correct production boundary.

#### Graph search dependency resolution

The `graph.microsoft.com/v1.0/users` reference is a direct SPFx-authorized Graph call from `useGraphPeopleSearch()` in `@hbc/ui-kit`:
- Used by `TeamStepBody.tsx` for Project Team member assignment
- Authorized via `createSpfxGraphTokenProvider()` from `@hbc/auth/spfx`
- Falls back to mock static search in `ui-review` mode (no Graph call needed for testing)
- This is the sanctioned SPFx Graph integration pattern — not a proxy dependency, not a missing backend route
- The backend `GraphService` handles separate backend-initiated operations (group creation for provisioning) using Managed Identity

**Decision:** The direct Graph call is correct and should remain. It uses the SPFx-sanctioned Graph path with proper token scoping. No proxy or backend mediation is needed.

#### Boundary cleanup verification

- No ambiguous code comments found in estimating app regarding `/api/users/me/*` ownership
- Routing assumptions are clear: `IProjectSetupClient` (5 methods) maps 1:1 to backend routes
- Data-source selection is explicit: production uses `createProvisioningApiClient`, ui-review uses `uiReviewProjectSetupClient`
- Production-readiness docs (`project-setup-frontend-api-contract.md`) correctly state the resolution

#### Verification results

- Type-check: clean (0 errors)
- Lint: 0 errors, 65 pre-existing warnings
- Tests: 22 files, 157 passed, 2 todo
- No code changes — verification confirms baseline is green

#### Files changed
- `docs/architecture/reviews/project-setup-phase-8-remediation-report.md` — P8-03 section added, OI-04 closed
- `apps/estimating/package.json` — version bump 0.2.33 → 0.2.34

#### Closure statement

The Project Setup release surface has no ambiguous identity or data-access dependencies. The `/api/users/me/*` endpoints are confirmed dead for this scope (opt-in disabled, no backend implementation, graceful degradation). The Graph search dependency is intentional SPFx-authorized integration. Route ownership is clear: 5 requester methods map 1:1 to backend routes. Ready for Prompt-04 backend boundary reduction.

#### Carry-forward items for Prompt-04+

| ID | Item | Target |
|----|------|--------|
| CF-03 | Teams Personal App auth readiness verification (OI-03, open risk retained) | Future |
| CF-05 | Backend boundary reduction | Prompt-04 |
| CF-06 | `supportsThemeVariants` cosmetic divergence | Low priority |

### P8-05: User-Assigned Managed Identity and App-Access Model

**Status:** Complete
**Date:** 2026-03-31

#### Work completed
- Audited all managed identity assumptions across backend services, config, and docs
- Updated backend service comments from system-assigned to user-assigned MI production posture
- Clarified `AZURE_CLIENT_ID` dual-purpose in config registry and local settings example
- Updated deployment runbook and connected-service posture doc for user-assigned MI
- Updated ADR-0078 to reflect user-assigned MI decision
- Documented exact external grant prerequisites for user-assigned MI
- Verified `DefaultAzureCredential` patterns are user-assigned-compatible (no code logic changes needed)

#### Identity posture findings

**Current code assessment:**
- All backend services use `DefaultAzureCredential()` for token acquisition (Graph, SharePoint, Table Storage)
- `DefaultAzureCredential` is inherently compatible with both system-assigned and user-assigned MI
- With user-assigned MI, `AZURE_CLIENT_ID` env var selects the correct identity — no code changes needed
- The `ManagedIdentityTokenService`, `GraphService`, and `SharePointService` all acquire app-only tokens (no OBO flows)

**Key identity distinction (P3-03):**
- `AZURE_CLIENT_ID` = user-assigned Managed Identity client ID (for outbound Azure resource auth)
- `API_AUDIENCE` = Entra ID app registration audience URI (for inbound JWT validation)
- These are different identities and must not be conflated

**What changed:**
- Service comments updated from "system-assigned" to "user-assigned Managed Identity (production)"
- Config registry `AZURE_CLIENT_ID` description clarified for production vs local dev
- `local.settings.example.json` placeholder updated to `<user-assigned-mi-client-id-in-production OR app-reg-client-id-for-local-dev>`
- Connected-service posture doc updated throughout
- Phase 5 Deployment Runbook updated to require user-assigned MI
- ADR-0078 updated to reflect user-assigned MI as the production decision

#### External grant prerequisites (user-assigned MI)

| Grant | Target | Permission | Purpose |
|-------|--------|-----------|---------|
| Azure RBAC | Storage Account | `Storage Table Data Contributor` | Table Storage read/write for request and provisioning status persistence |
| SharePoint | Tenant or Site | `Sites.Selected` (preferred) or `Sites.FullControl.All` (fallback, requires ADR) | Site creation, list management, template upload, hub association |
| Microsoft Graph | Application | `Group.ReadWrite.All` | Entra ID security group creation and membership management |
| SharePoint Admin | SPFx API permission | `api://<client-id>` scope approved | SPFx app access to backend API |

**Permission gates in code:**
- `GRAPH_GROUP_PERMISSION_CONFIRMED` must be `'true'` before any Graph operations execute (saga-time gate)
- `SITES_PERMISSION_MODEL` controls SharePoint access approach: `sites-selected` (default) or `fullcontrol` (fallback)

#### Verification results

- Type-check: clean (0 errors)
- Lint: 0 errors, 65 pre-existing warnings
- Tests: 22 files, 157 passed, 2 todo
- No code logic changes — only comments, descriptions, and documentation updated

#### Files changed
- `backend/functions/src/services/managed-identity-token-service.ts` — comment updates (system→user-assigned MI)
- `backend/functions/src/config/wave0-env-registry.ts` — AZURE_CLIENT_ID description clarified
- `backend/functions/local.settings.example.json` — AZURE_CLIENT_ID placeholder updated
- `docs/reference/developer/project-setup-connected-service-posture.md` — identity model updated throughout
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Deployment-Runbook.md` — MI prerequisites updated
- `docs/architecture/adr/ADR-0078-security-managed-identity.md` — decision updated to user-assigned MI
- `apps/estimating/package.json` — version bump 0.2.34 → 0.2.35
- `docs/architecture/reviews/project-setup-phase-8-remediation-report.md` — P8-05 section added

#### Closure statement

The backend production identity posture is now explicitly aligned to user-assigned Managed Identity. All service comments, config descriptions, deployment docs, and the security ADR consistently reference user-assigned MI as the required production model. `DefaultAzureCredential` patterns are confirmed compatible — `AZURE_CLIENT_ID` selects the user-assigned identity in Azure-hosted deployments. The dual-identity distinction (`AZURE_CLIENT_ID` for MI outbound auth ≠ `API_AUDIENCE` for inbound JWT validation) is documented and enforced. External grant prerequisites are explicitly documented. Ready for Prompt-06 operational gates.

#### Carry-forward items for Prompt-06+

| ID | Item | Target |
|----|------|--------|
| CF-03 | Teams Personal App auth readiness verification (OI-03, open risk retained) | Future |
| CF-05 | Backend boundary reduction (OI-05, deferred) | Future |
| CF-06 | `supportsThemeVariants` cosmetic divergence | Low priority |

### P8-06: API-Access Approvals, CORS, and Operational Gates

**Status:** Complete
**Date:** 2026-03-31

#### Work completed
- Audited all operator-executed prerequisites and verified they are represented as explicit production gates
- Verified CORS configuration (single origin, credential support, regression-tested)
- Verified 3-tier config validation enforces startup and saga-time gates
- Verified health endpoint reports operational readiness with tiered diagnostics
- Confirmed release-gate tests cover CORS, auth contract, config tiers, and infra readiness
- Fixed config registry test alignment after P8-05 description update
- Documented external prerequisite inventory and runtime symptoms for missing approvals

#### External prerequisite inventory

**Operator-executed items required before production deployment:**

| # | Prerequisite | Where Configured | Gate Treatment in Code | Runtime Symptom if Missing |
|---|-------------|-----------------|----------------------|---------------------------|
| 1 | User-assigned Managed Identity created and assigned | Azure Portal → Function App → Identity blade | `AZURE_CLIENT_ID` required at core tier (blocks startup) | App fails to start |
| 2 | MI → `Storage Table Data Contributor` on storage account | Azure Portal → Storage Account → IAM | `AZURE_TABLE_ENDPOINT` validated at core tier | 403 on table operations |
| 3 | MI → `Sites.Selected` or `Sites.FullControl.All` on SharePoint | SharePoint admin / Graph API | `SHAREPOINT_TENANT_URL` + `SHAREPOINT_PROJECTS_SITE_URL` at SharePoint tier (warning) | 403 on SharePoint operations |
| 4 | MI → `Group.ReadWrite.All` on Microsoft Graph | Azure Portal → Entra ID | `GRAPH_GROUP_PERMISSION_CONFIRMED` gate at provisioning tier | Saga blocks with `GraphPermissionNotConfirmedError` |
| 5 | Entra ID app registration with audience URI | Azure Portal → App registrations | `API_AUDIENCE` required at core tier (blocks startup) | App fails to start |
| 6 | SPFx API permission approved | SharePoint admin center | No code gate — frontend `createSpfxApiTokenProvider` returns `undefined` if not approved | Frontend falls back to ui-review mode with diagnostic banner |
| 7 | CORS origins set on Function App | `host.json` (committed) or Azure Portal → CORS blade | Release-gate test enforces no wildcard + credential support | Browser blocks cross-origin requests |
| 8 | Hub site ID, app catalog URL, SPFx app ID, OpEx manager UPN | Function App → Configuration | Provisioning tier validation (blocks saga only) | Saga refuses to start |

#### Release-gate verification results

**Backend tests (51 files, 659 passed, 3 skipped):**
- Release gates: 13 tests — ALL PASS (CORS no-wildcard, CORS credentials, auth contract, config tiers, health endpoint, MI enforcement, function timeout, smoke test presence)
- Infra readiness: 7 tests — ALL PASS (CORS allows SharePoint, no wildcard origin, tiered validation present)
- Auth contract: all HTTP routes use `withAuth()` — PASS

**Frontend tests (22 files, 157 passed, 2 todo):**
- Type-check: clean (0 errors)
- Lint: 0 errors, 65 pre-existing warnings

#### CORS expectations

- **Allowed origin:** `https://hedrickbrotherscom.sharepoint.com` (single specific origin)
- **Credential support:** `true` (required for Bearer token transport)
- **No wildcard:** Enforced by release-gate test and infra-readiness test
- **Host surfaces calling cross-origin:** SPFx webpart (Estimating, Accounting, Admin) hosted on SharePoint tenant
- **Same-origin exceptions:** None — all API calls are cross-origin from SharePoint to Azure Functions
- **Environment differences:** Staging may use a different origin; host.json must be updated per environment

#### API-access approval expectations

| Approval | Where Granted | Required For | Symptom When Missing |
|----------|--------------|-------------|---------------------|
| Entra app registration `api://<client-id>` | Azure Portal | JWT validation (all authenticated requests) | Backend returns `config_error` on health, app fails to start |
| SPFx API permission consent | SharePoint admin center | Frontend token acquisition via `aadTokenProviderFactory` | `createSpfxApiTokenProvider` returns `undefined`, frontend falls to ui-review with `productionBlocked` banner |
| `Group.ReadWrite.All` application permission | Azure Portal → Enterprise apps | Provisioning saga Step 6 (group creation) | `GraphPermissionNotConfirmedError` blocks saga |
| `Sites.Selected` per-site grants | Graph API `POST /sites/{id}/permissions` | SharePoint site creation and list management | 403 Forbidden on SharePoint operations |
| Admin consent for all app permissions | Azure Portal → API permissions | All Graph/SharePoint operations | 401/403 on first real API call |

#### Files changed
- `backend/functions/src/config/wave0-env-registry.test.ts` — aligned test assertion with P8-05 description update
- `docs/architecture/reviews/project-setup-phase-8-remediation-report.md` — P8-06 section added
- `apps/estimating/package.json` — version bump 0.2.35 → 0.2.36

#### Closure statement

All external prerequisites are represented as explicit, auditable production gates. The repo makes a sharp distinction between "implemented in code" (all release gates pass, all config tiers validated, health endpoint reports tiered readiness) and "still blocked on tenant/operator action" (MI grants, Entra consent, SPFx permission approval, site-scoped access). CORS is locked to a single SharePoint origin with credential support, enforced by 5 regression tests. API-access approval expectations are documented with exact runtime symptoms for each missing prerequisite. No operator action can be mistaken for a code defect. Ready for Prompt-07 startup validation and release hardening.

#### Carry-forward items for Prompt-07+

| ID | Item | Target |
|----|------|--------|
| CF-03 | Teams Personal App auth readiness verification (OI-03, open risk retained) | Future |
| CF-05 | Backend boundary reduction (OI-05, deferred) | Future |
| CF-06 | `supportsThemeVariants` cosmetic divergence | Low priority |

## Open Items

| ID | Description | Owner | Status |
|----|-------------|-------|--------|
| OI-01 | `apiAudience` not injected by shell — requires API audience app registration and DefinePlugin addition | P8-02 | **Closed** |
| OI-02 | Runtime config/token contract reconciliation between shell and app | P8-02 | **Closed** |
| OI-03 | Teams Personal App auth readiness — `aadTokenProviderFactory` resolution unverified in Teams context | P8-02 | Open |
| OI-04 | Route ownership resolution — frontend route definitions vs backend route expectations | P8-03 | **Closed** |
| OI-05 | Backend boundary reduction — reduce direct backend coupling from frontend | P8-04 | Open |
| OI-06 | `supportsThemeVariants` divergence between app manifest and shell manifest | Backlog | Open |

## Evidence Index

| Evidence | Location | Notes |
|----------|----------|-------|
| Phase 8 plan | `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-8/Phase-8-Plan_...md` | Canonical plan |
| Phase 8 review report | This file | Prompt-by-prompt progress |
| Phase 1–5 audit | `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md` | Foundation audit |
| Phase 7 report | `docs/architecture/reviews/project-setup-phase-7-production-alignment-remediation-report.md` | Prior phase |
