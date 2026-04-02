# P10-08 — Documentation and Connected-Service Posture Reconciliation

> **Created:** 2026-04-02  
> **Phase:** 10 — Accounting SPFx Production Gap Closure  
> **Status:** Complete

## Objective

Reconcile all production-sensitive documentation so that API resource names, approval steps, and connected-service posture match the implemented repo truth after Prompts 02–07.

## Stale Claims Corrected

### 1. Connected-service posture: staging → production API resource name

**File:** `docs/reference/developer/project-setup-connected-service-posture.md` line 88

**Before:** `resource: "hb-intel-api-staging"`  
**After:** `resource: "hb-intel-api-production"`

The document referenced the old staging API resource name. Both Project Setup (`apps/estimating/config/package-solution.json:12`) and Accounting (`apps/accounting/config/package-solution.json:12`) now declare `"hb-intel-api-production"`. Also added note about build-time `SPFX_API_RESOURCE` override for staging builds and clarified that both packages declare the same resource.

### 2. Current-state map: missing Accounting production architecture entries

**File:** `docs/architecture/blueprint/current-state-map.md`

Added three new entries after the existing Accounting page references:

| Entry | Classification | Summary |
|-------|---------------|---------|
| `apps/accounting/src/backend/AccountingBackendContext.tsx` | Canonical Current-State | Centralized backend provider with token resolution, production readiness, `useAccountingBackend()` hook |
| `apps/accounting/src/config/runtimeConfig.ts` | Canonical Current-State | Module-level runtime config singleton with 3-tier fallback resolution |
| `apps/accounting/config/package-solution.json` | Canonical Current-State | SPFx package manifest with `webApiPermissionRequests` declaration |

## Documentation Already Accurate (No Changes Needed)

| Document | Status | Evidence |
|----------|--------|---------|
| `docs/reference/developer/project-setup-frontend-api-contract.md` | Accurate | Accounting listed as `IProvisioningApiClient` consumer (line 81); `/api/users/me/*` resolution documented (lines 87-96); auth transport and audience contract correct |
| Phase 10 prompt outputs (P10-01 through P10-07) | Accurate | Each prompt produced its own authoritative closure documentation |
| `docs/architecture/reviews/project-setup-latent-users-me-dependency-gap-validation.md` | Accurate | Consistent with P10-07 closure |

## Residual External Prerequisites

These items require tenant/admin action outside the repo and cannot be resolved by documentation:

| Prerequisite | Owner | Status |
|-------------|-------|--------|
| Deploy Accounting `.sppkg` to SharePoint app catalog | SharePoint admin | Blocked until .sppkg rebuild (Prompt-09) |
| Approve `hb-intel-api-production` API permission for Accounting | SharePoint admin | Blocked until .sppkg deployed |
| Verify `API_AUDIENCE` env var in Azure Function App matches frontend audience | DevOps | Configuration required |
| Verify CORS allows Accounting's SharePoint origin | DevOps | Verify `host.json` allowedOrigins |

## Verification

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/spfx-accounting lint` | 0 errors, 4 warnings (unchanged) |
| `pnpm --filter @hbc/spfx-accounting build` | Passed — 1,029 KB IIFE bundle |
| `pnpm --filter @hbc/spfx-accounting test` | 55 tests passed across 6 test files |

## Files Changed

| File | Action |
|------|--------|
| `docs/reference/developer/project-setup-connected-service-posture.md` | Fixed stale `"hb-intel-api-staging"` → `"hb-intel-api-production"` |
| `docs/architecture/blueprint/current-state-map.md` | Added Accounting production architecture entries |
