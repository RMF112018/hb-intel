# P10-09 — Testing, Artifact Inspection, and Release Evidence

> **Created:** 2026-04-02  
> **Phase:** 10 — Accounting SPFx Production Gap Closure  
> **Status:** Complete

## Objective

Prove Phase 10 implementation with tests, fresh build artifacts, and release-evidence documentation.

## Test Summary

### Commands run

| Command | Result |
|---------|--------|
| `pnpm --filter @hbc/spfx-accounting lint` | 0 errors, 4 warnings (all pre-existing or intentional) |
| `pnpm --filter @hbc/spfx-accounting build` | Passed — IIFE bundle 1,028,724 bytes (294 KB gzip) |
| `pnpm --filter @hbc/spfx-accounting test` | 60 tests passed across 7 test files |

### Test inventory

| File | Tests | Scope |
|------|-------|-------|
| `runtimeConfig.test.ts` | 18 | P10-02/03: config storage, normalization, resolution, production readiness |
| `AccountingBackendContext.test.tsx` | 5 | P10-09: provider client creation, production readiness, hook guard |
| `ProjectReviewQueuePage.test.tsx` | 6 | Queue rendering, tab filtering, navigation |
| `ProjectReviewDetailPage.test.tsx` | 12 | Detail actions, modals, lifecycle status |
| `complexity.test.tsx` | 6 | Complexity tier gating |
| `bootstrap.test.ts` | 4 | Mock environment bootstrap |
| `router.test.ts` | 9 | Route definitions |

### New tests added in Phase 10

| Test | File | What it proves |
|------|------|---------------|
| `setRuntimeConfig` stores config | `runtimeConfig.test.ts` | Shell-injected config is received and stored |
| `setRuntimeConfig` strips trailing slashes | `runtimeConfig.test.ts` | URL normalization |
| `getBackendMode` defaults to production | `runtimeConfig.test.ts` | Safe default when no config |
| `getBackendMode` returns injected mode | `runtimeConfig.test.ts` | Runtime injection works |
| `getFunctionAppUrl` returns injected URL | `runtimeConfig.test.ts` | URL resolution from config |
| `getFunctionAppUrl` throws ConfigError | `runtimeConfig.test.ts` | Missing config is surfaced, not hidden |
| `getApiAudience` returns injected audience | `runtimeConfig.test.ts` | Audience resolution from config |
| `checkProductionReadiness` validates prerequisites | `runtimeConfig.test.ts` | Production gating detects missing URL + token |
| Provider creates client | `AccountingBackendContext.test.tsx` | Client is available to child components |
| Provider reports not ready without token | `AccountingBackendContext.test.tsx` | Missing SPFx token is surfaced |
| Provider reports issues without token | `AccountingBackendContext.test.tsx` | Issue count is explicit |
| Provider improves readiness with token | `AccountingBackendContext.test.tsx` | SPFx token provider resolves token issue |
| Hook throws outside provider | `AccountingBackendContext.test.tsx` | Misuse produces clear error |

## Vite Build Evidence

**Build command:** `pnpm --filter @hbc/spfx-accounting build`  
**Build date:** 2026-04-02 (current session)  
**Output:** `apps/accounting/dist/accounting-app.js`

| Property | Value |
|----------|-------|
| Format | IIFE (`var __hbIntel_accounting=(function(ct){...`) |
| Size | 1,028,724 bytes (1,029 KB) |
| Gzip | 294,420 bytes (294 KB) |
| Global name | `__hbIntel_accounting` (3 references — IIFE wrapper + globalThis + window) |
| Module count | 3,481 modules transformed |

### Phase 10 code confirmed in bundle

| Evidence | Occurrences | Source |
|----------|-------------|--------|
| `Function App URL is not configured` | 3 | `runtimeConfig.ts` ConfigError diagnostic |
| `No auth token available` | 1 | `AccountingBackendContext.tsx` pre-auth placeholder |
| `useAccountingBackend must be used within` | 1 | `AccountingBackendContext.tsx` guard |

## Release Asset Inspection

### Existing .sppkg (pre-Phase 10)

**File:** `dist/sppkg/hb-intel-accounting.sppkg`  
**Date:** 2026-04-02 07:26 (pre-Phase 10 changes)  
**Size:** 299,076 bytes

**Note:** This .sppkg was built before Phase 10 code changes. A fresh `.sppkg` rebuild is required before production deployment. The `.sppkg` rebuild requires the SPFx toolchain with production env vars (`FUNCTION_APP_URL`, `API_AUDIENCE`, `BACKEND_MODE`) — this is an external deployment step, not a repo-code gap.

### Release shell asset inspection

| Property | Value |
|----------|-------|
| Shell webpart asset | `shell-web-part_9560115e8d96047ae761.js` (3,062 bytes) |
| App bundle asset | `accounting-app-a23f71d0.js` (1,025,991 bytes) |
| Manifest ID | `cf3c98bf-ff78-4f00-bd6d-c304433d959e` |
| Manifest title | "HB Intel Accounting" |
| Entry module | `shell-web-part` |
| Global name in shell | `__hbIntel_accounting` (5 references) |
| Bundle name in shell | `accounting-app-a23f71d0` (1 reference) |
| Runtime config construction | Present — config object passed to `mount(domElement, context, config)` |
| DefinePlugin injection path | Working — empty env vars correctly filtered as falsy |

## Validation Report

### Confirmed repo facts

| Fact | Evidence |
|------|----------|
| Runtime config module exists and is tested | `runtimeConfig.ts` + 18 tests |
| mount.tsx stores config and creates SPFx token provider | Source inspection + bundle verification |
| App.tsx wraps router in AccountingBackendProvider | Source inspection + 5 provider tests |
| Pages consume client from context, not inline | Source inspection + existing page tests pass through provider |
| webApiPermissionRequests declared | `package-solution.json` declares `hb-intel-api-production` / `access_as_user` |
| env.d.ts includes required declarations | `VITE_API_AUDIENCE`, `VITE_BACKEND_MODE`, `VITE_ALLOW_BACKEND_MODE_SWITCH` |
| Package version synchronized | Solution and feature both at `001.000.025` |

### Confirmed packaged-artifact facts

| Fact | Evidence |
|------|----------|
| Vite IIFE bundle contains Phase 10 code | grep verification of diagnostic strings |
| Bundle exposes mount/unmount on global | `__hbIntel_accounting` in bundle |
| Shell webpart loads correct bundle | `accounting-app-a23f71d0.js` in compiled shell |
| Shell passes runtime config to mount | Config object construction in compiled shell |
| Manifest targets Accounting | Title "HB Intel Accounting", correct UUID |

### Unresolved external prerequisites

| Prerequisite | Type | Blocking |
|-------------|------|---------|
| Fresh `.sppkg` rebuild with production env vars | Deployment step | Yes — before production deployment |
| SharePoint admin approves API permission | Tenant admin action | Yes — after .sppkg deployment |
| `API_AUDIENCE` env var configured in Function App | Azure resource config | Yes — must match frontend audience |
| CORS origin includes Accounting SharePoint origin | Azure resource config | Verify at deployment |

## Files Changed

| File | Action |
|------|--------|
| `apps/accounting/src/test/AccountingBackendContext.test.tsx` | Created — 5 tests for provider, production readiness, hook guard |
