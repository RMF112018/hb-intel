# Accounting Production-Target .sppkg Build Evidence

**Date:** 2026-04-02
**Scope:** Rebuild fresh Accounting `.sppkg` and produce artifact evidence package.
**Phase:** [Phase 11, Prompt 07](../plans/MASTER/spfx/accounting/phase-11/Prompt-07_Phase-11-Production-Target-Rebuild-and-Artifact-Evidence-Package.md)
**Predecessor:** [Shell Continuity Review](accounting-vs-project-setup-shell-continuity-review.md) (P11-06)

## 1. Packaging Command / Entry Path

```
npx tsx tools/build-spfx-package.ts --domain accounting
```

**Orchestrator:** `tools/build-spfx-package.ts` (Node 22 for orchestration, Node 18 for gulp steps)

**Build chain:**
1. Vite IIFE build → `apps/accounting/dist/accounting-app.js`
2. Content hash rename → `accounting-app-8acaff18.js`
3. Runtime smoke test → mount/unmount verified on both globalThis and window
4. Shell manifest + package-solution injection from `apps/accounting/`
5. `gulp bundle --ship` (Node 18, SPFx 1.18, TS 4.7)
6. `gulp package-solution --ship` → `.sppkg`
7. Post-build verification → structure and reference checks

## 2. Explicit Target Values Used

This build was produced **without** CI/CD environment variables. The values below reflect the build-time injection state:

| Variable | Value at Build Time | Effect |
|----------|-------------------|--------|
| `FUNCTION_APP_URL` | Not set | Empty string — app defaults to `'production'` mode with ConfigError on URL access |
| `BACKEND_MODE` | Not set | Empty string — app defaults to `'production'` |
| `ALLOW_BACKEND_MODE_SWITCH` | Not set | Empty string — app defaults to `false` |
| `API_AUDIENCE` | Not set | Empty string — token acquisition skipped |

**Note:** A CI/CD production build would supply `FUNCTION_APP_URL`, `API_AUDIENCE`, and optionally `BACKEND_MODE=production`. The shell injection path is verified end-to-end (P11-04); env vars flow through DefinePlugin into the compiled shell asset. This local build confirms the packaging path is correct; a CI/CD build with production env vars would produce a fully configured artifact.

## 3. Produced Artifact Details

| Property | Value |
|----------|-------|
| Artifact path | `dist/sppkg/hb-intel-accounting.sppkg` |
| File size | 300,094 bytes (293.1 KB) |
| SHA-256 | `b0c0ee558e358835b4618f3f45a53c30d7e46be7d00be5ca96176472001ae53d` |
| Vite bundle | `accounting-app-8acaff18.js` (1,028,724 bytes) |
| Shell webpart | `shell-web-part_e0c51b569817b47b5742.js` (3,062 bytes) |
| Content hash | `8acaff18` |

### Archive Contents

```
[Content_Types].xml
_rels/.rels
_rels/AppManifest.xml.rels
_rels/ClientSideAssets.xml.rels
_rels/feature_fbb5ac04-cf50-458b-91dd-3784de51a7af.xml.rels
AppManifest.xml
ClientSideAssets.xml
ClientSideAssets.xml.config.xml
ClientSideAssets/accounting-app-8acaff18.js
ClientSideAssets/shell-web-part_e0c51b569817b47b5742.js
fbb5ac04-cf50-458b-91dd-3784de51a7af/WebPart_cf3c98bf-ff78-4f00-bd6d-c304433d959e.xml
feature_fbb5ac04-cf50-458b-91dd-3784de51a7af.xml
feature_fbb5ac04-cf50-458b-91dd-3784de51a7af.xml.config.xml
```

## 4. AppManifest.xml Findings

| Property | Value | Expected | Match |
|----------|-------|----------|-------|
| Name | `hb-intel-accounting` | `hb-intel-accounting` | PASS |
| ProductID | `7dca8e93-b2fb-4e06-9e4b-d14118f87990` | `7dca8e93-b2fb-4e06-9e4b-d14118f87990` | PASS |
| Version | `001.000.033` | `001.000.033` | PASS |
| SkipFeatureDeployment | `true` | `true` | PASS |
| IsDomainIsolated | `false` | `false` | PASS |
| WebApiPermissionRequest Resource | `hb-intel-api-production` | `hb-intel-api-production` | PASS |
| WebApiPermissionRequest Scope | `access_as_user` | `access_as_user` | PASS |

## 5. Packaged Shell Asset Findings

The compiled shell webpart (`shell-web-part_e0c51b569817b47b5742.js`) contains:

| Reference | Found | Evidence |
|-----------|-------|----------|
| Bundle filename | Yes | `"accounting-app-8acaff18.js"` — used to construct CDN URL for script loading |
| Global name (loadScript) | Yes | `globalExportsName:"__hbIntel_accounting"` — passed to `SPComponentLoader.loadScript()` |
| Global name (globalThis fallback) | Yes | `globalThis.__hbIntel_accounting` — explicit fallback resolution |
| Global name (window fallback) | Yes | `window.__hbIntel_accounting` — defensive fallback for SPFx contexts where globalThis !== window |
| mount() call | Yes | `this._appModule.mount(this.domElement` — confirmed in render() |
| Runtime config object | Yes | `const e={};try{...}` — config construction with conditional injection |
| backendMode injection | Yes | `e.backendMode=t` — present in conditional injection path |

## 6. Runtime Injection Findings

The shell asset was built without env vars, so DefinePlugin constants resolve to empty strings. The injection code paths are present but produce an empty config object:

| Constant | Build-Time Value | Shell Behavior | App Default |
|----------|-----------------|---------------|-------------|
| `__FUNCTION_APP_URL__` | `""` | Not added to config | ConfigError in production mode |
| `__BACKEND_MODE__` | `""` | Not added to config | `'production'` |
| `__ALLOW_BACKEND_MODE_SWITCH__` | `""` | Not added to config | `false` |
| `__API_AUDIENCE__` | `""` | Not added to config | `undefined` — token acquisition skipped |

**This is correct behavior for a local build.** A CI/CD build with `FUNCTION_APP_URL=https://...` and `API_AUDIENCE=api://...` would produce a shell asset with those values baked in. The injection path is verified by the shellInjectionChain tests (P11-04).

## 7. Permission Findings

| Permission | In AppManifest.xml | In package-solution.json | Match |
|-----------|-------------------|--------------------------|-------|
| `hb-intel-api-production / access_as_user` | Yes — `<WebApiPermissionRequest ResourceId="hb-intel-api-production" Scope="access_as_user">` | Yes — `webApiPermissionRequests[0]` | PASS |

The permission request is correctly propagated from the app-local `package-solution.json` into the `.sppkg` AppManifest. Confirmed as intentional and required (P11-03).

## 8. Feature and WebPart Definition Findings

| Property | Value | Expected | Match |
|----------|-------|----------|-------|
| Feature ID | `fbb5ac04-cf50-458b-91dd-3784de51a7af` | `fbb5ac04-cf50-458b-91dd-3784de51a7af` | PASS |
| Feature Version | `001.000.033` | `001.000.033` | PASS |
| Feature Title | "hb-intel-accounting Feature" | "hb-intel-accounting Feature" | PASS |
| WebPart ID | `cf3c98bf-ff78-4f00-bd6d-c304433d959e` | `cf3c98bf-ff78-4f00-bd6d-c304433d959e` | PASS |
| WebPart Name | "HB Intel Accounting" | "HB Intel Accounting" | PASS |
| WebPart Alias | "ShellWebPart" | "ShellWebPart" | PASS |
| Supported Hosts | `SharePointWebPart`, `TeamsPersonalApp` | Both | PASS |
| Entry Module | `shell-web-part` → `shell-web-part_e0c51b569817b47b5742.js` | Correct | PASS |

## 9. Comparison Against Intended Repo Truth

| P11 Prompt | Repo Truth | Artifact Truth | Aligned |
|------------|-----------|---------------|---------|
| P11-01 Packaging path | Vite → orchestrator → spfx-shell → .sppkg | Confirmed — same path produced this artifact | Yes |
| P11-02 Bundle contract | IIFE, `__hbIntel_accounting`, mount/unmount | Confirmed — smoke test passed, shell references correct | Yes |
| P11-03 API permissions | `hb-intel-api-production / access_as_user` | Confirmed — AppManifest.xml contains the declaration | Yes |
| P11-04 Runtime injection | 4 DefinePlugin constants → shell → mount → runtimeConfig | Confirmed — injection paths present in compiled shell | Yes |
| P11-05 Hidden dependencies | `/api/users/me/*` isolated, zero runtime calls | Confirmed — bundle contains strings but triple-gate prevents calls | Yes |
| P11-06 Shell continuity | All differences are intentional specialization | N/A — shell continuity is a source-level property | Yes |

## 10. Go / No-Go Artifact Conclusion

**Conditional Go — staging-targeted.**

The artifact is:
- **Repo-aligned:** All identity, version, permission, and bundle references match current repo truth
- **Structurally valid:** OPC archive contains all required SPFx components
- **Staging-targeted:** Built without production env vars; runtime config values are empty (app defaults to production mode with readiness gating)
- **Not production-targeted:** A production-target artifact requires CI/CD build with `FUNCTION_APP_URL` and `API_AUDIENCE` set

**To produce a production-target artifact:** Run the same command in CI/CD with environment variables:
```bash
FUNCTION_APP_URL=https://hb-intel-functions.azurewebsites.net \
API_AUDIENCE=api://<client-id> \
BACKEND_MODE=production \
npx tsx tools/build-spfx-package.ts --domain accounting
```

## 11. Exact Files Inspected

### Build inputs
- `apps/accounting/config/package-solution.json` — version, solution ID, API permissions
- `apps/accounting/src/webparts/accounting/AccountingWebPart.manifest.json` — component ID, supported hosts
- `apps/accounting/src/mount.tsx` — build entry
- `apps/accounting/vite.config.ts` — IIFE config
- `tools/build-spfx-package.ts` — orchestrator
- `tools/spfx-shell/gulpfile.js` — DefinePlugin injection

### Artifact outputs
- `dist/sppkg/hb-intel-accounting.sppkg` — final packaged artifact
- Extracted `AppManifest.xml` — version, identity, permissions
- Extracted `feature_fbb5ac04-...xml` — feature version
- Extracted `WebPart_cf3c98bf-...xml` — webpart definition, manifest, loader config
- Extracted `ClientSideAssets/accounting-app-8acaff18.js` — Vite IIFE bundle
- Extracted `ClientSideAssets/shell-web-part_e0c51b569817b47b5742.js` — compiled shell webpart
