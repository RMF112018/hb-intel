# SPFx Package Environment Injection Audit

**Date:** 2026-04-01
**Scope:** Fresh rebuild and audit of Project Setup `.sppkg` with explicit environment injection

## Packaging Path Used

**Authoritative entry point:** `npx tsx tools/build-spfx-package.ts --domain estimating`

**Pipeline:**
1. Vite IIFE build → `apps/estimating/dist/estimating-app.js`
2. Content hash → `estimating-app-c24cc323.js`
3. VM smoke test (mount/unmount on globalThis + window)
4. `SPFX_API_RESOURCE` → overrides `webApiPermissionRequests.resource`
5. `gulp bundle --ship` → webpack DefinePlugin injects 6 compile-time constants
6. `gulp package-solution --ship` → produces `.sppkg`
7. `verifySppkg()` + `inspectPackagedShellAsset()` → structural + content verification

## Explicit Target-Environment Values

| Variable | Value | Environment |
|----------|-------|-------------|
| `SPFX_API_RESOURCE` | `hb-intel-api-staging` | Staging |
| `FUNCTION_APP_URL` | `https://func-hb-intel-staging.azurewebsites.net` | Staging |
| `API_AUDIENCE` | `api://func-hb-intel-staging` | Staging |
| `BACKEND_MODE` | `production` | Production runtime (real backend) |
| `ALLOW_BACKEND_MODE_SWITCH` | `false` | Security hardened |

## Fresh Artifact Produced

| Attribute | Value |
|-----------|-------|
| **File** | `dist/sppkg/hb-intel-project-setup.sppkg` |
| **Size** | 336 KB |
| **Version** | `001.000.019` |
| **Content hash** | `c24cc323` |
| **Node version** | v18.20.8 |

## Packaged Shell Asset Audit

**Shell JS:** `ClientSideAssets/shell-web-part_82a9c7316a396b611ef8.js`

| Check | Result | Evidence |
|-------|--------|----------|
| `FUNCTION_APP_URL` injected | **PASS** | `func-hb-intel-staging.azurewebsites.net` found in shell JS |
| `API_AUDIENCE` injected | **PASS** | `api://func-hb-intel-staging` found in shell JS |
| `BACKEND_MODE` injected | **PASS** | `"production"` found in shell JS |
| `ALLOW_BACKEND_MODE_SWITCH` injected | **PASS** | `allowBackendModeSwitch=!1` (minified `false`) |
| Bundle reference | **PASS** | `estimating-app-c24cc323.js` found |
| Global name | **PASS** | `__hbIntel_projectSetup` found (3 occurrences) |
| No fallback `app.js` | **PASS** | Not present |
| No fallback `__hbIntel_app` | **PASS** | Not present |

## AppManifest.xml Audit

| Check | Result |
|-------|--------|
| `ProductID` | `d01a9600-a68a-4afe-83a5-514339f47dbb` |
| `Version` | `001.000.019` |
| `WebApiPermissionRequest ResourceId` | `hb-intel-api-staging` |
| `WebApiPermissionRequest Scope` | `access_as_user` |

## Environment-Scope Conclusion

This `.sppkg` is **explicitly staging-scoped**. All injected values target the staging environment. For a production build, the following values must change:

| Variable | Staging Value | Production Value (example) |
|----------|--------------|---------------------------|
| `SPFX_API_RESOURCE` | `hb-intel-api-staging` | `hb-intel-api-production` |
| `FUNCTION_APP_URL` | `https://func-hb-intel-staging.azurewebsites.net` | `https://func-hb-intel.azurewebsites.net` |
| `API_AUDIENCE` | `api://func-hb-intel-staging` | `api://func-hb-intel` |

## Build Verification Enhancements

The `inspectCompiledShellAsset()` and `inspectPackagedShellAsset()` functions in `build-spfx-package.ts` now also verify `FUNCTION_APP_URL` injection when the env var is non-empty. This ensures future builds with explicit environment values are proven at package time.

## Impacted Files

| File | Change |
|------|--------|
| `apps/estimating/config/package-solution.json` | Version sync 014→019 |
| `tools/build-spfx-package.ts` | Added FUNCTION_APP_URL verification to shell asset inspection |
| `dist/sppkg/hb-intel-project-setup.sppkg` | Fresh staging-scoped artifact |
| `tools/spfx-shell/config/package-solution.json` | Version bump 019→020 |
