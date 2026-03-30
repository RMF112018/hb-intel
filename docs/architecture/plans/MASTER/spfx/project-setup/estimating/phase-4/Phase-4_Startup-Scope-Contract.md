# Phase 4 — Startup Scope Contract

> Created: 2026-03-30
> Prompt: P4-02 Functions Hosting, Startup, and Configuration Scope
> Companion to: `Phase-4_Infrastructure-Baseline-Matrix.md`, `Phase-4_Infrastructure-Gap-Summary.md`

## Purpose

Documents the scoped startup validation, service factory restructuring, and configuration tier model implemented in P4-02.

## Configuration Tiers

Settings are now classified into tiers that determine when they are validated:

| Tier | When Validated | Settings | Purpose |
|------|---------------|----------|---------|
| `core` | At service factory startup | `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `API_AUDIENCE`, `AZURE_TABLE_ENDPOINT`, `APPLICATIONINSIGHTS_CONNECTION_STRING`, `HBC_ADAPTER_MODE` | Required for ANY request (auth, storage, telemetry) |
| `sharepoint` | Warned at startup, hard-fail on first SP operation | `SHAREPOINT_TENANT_URL`, `SHAREPOINT_PROJECTS_SITE_URL` | Required for SharePoint-dependent operations |
| `provisioning` | At saga execution time | `GRAPH_GROUP_PERMISSION_CONFIRMED`, `SHAREPOINT_HUB_SITE_ID`, `SHAREPOINT_APP_CATALOG_URL`, `HB_INTEL_SPFX_APP_ID`, `OPEX_MANAGER_UPN` | Required only when provisioning saga runs |

### Validation Functions

| Function | Tier | Behavior |
|----------|------|----------|
| `validateCoreConfig()` | core | Throws aggregated error if any core setting missing |
| `validateSharePointConfig()` | sharepoint | Throws aggregated error if any SP setting missing |
| `validateConfigTier(tier)` | any | Generic tier validator |
| `validateRequiredConfig()` | all required | Backward-compatible full validation (core + sharepoint + all `requiredInProd`) |
| `validateProvisioningPrerequisites()` | provisioning | Existing saga-time validation (unchanged) |

## Service Factory Changes

### Removed: Redis Cache

`IRedisCacheService` / `redisCache` has been removed from `IServiceContainer`. It was always `MockRedisCacheService` (no-op) in production. The proxy handler's cache calls have been removed.

### Lazy Domain CRUD Services

The 10 Phase 1 domain CRUD services are now lazily initialized via getter properties. They are not created until a route handler first accesses them:

| Service | Eager → Lazy | Reason |
|---------|-------------|--------|
| `leads` | Lazy | Not needed for Project Setup |
| `projects` | Lazy | Not needed for Project Setup |
| `estimating` | Lazy | Not needed for Project Setup core |
| `schedule` | Lazy | Not needed for Project Setup |
| `buyout` | Lazy | Not needed for Project Setup |
| `compliance` | Lazy | Not needed for Project Setup |
| `contracts` | Lazy | Not needed for Project Setup |
| `risk` | Lazy | Not needed for Project Setup |
| `scorecards` | Lazy | Not needed for Project Setup |
| `pmp` | Lazy | Not needed for Project Setup |

### Eagerly Initialized (Project Setup Core)

These services are created at startup because Project Setup routes need them immediately:

| Service | Purpose |
|---------|---------|
| `sharePoint` | Site/list/doc operations |
| `tableStorage` | Provisioning state |
| `signalR` | Real-time updates (still mocked push — Gap 3 deferred to Prompt 03) |
| `managedIdentity` | App-only token acquisition |
| `projectRequests` | Request lifecycle |
| `acknowledgments` | Step 6 bypass |
| `graph` | Entra group management |
| `notifications` | Completion alerts |
| `idempotency` | Write-safe retries |

## Health Endpoint Changes

The health endpoint now reports tiered config status:

```json
{
  "configTiers": {
    "core": "ready",
    "sharepoint": "ready"
  }
}
```

`API_AUDIENCE` is now included in the core config check (was missing — 7 settings → 8).

## Startup Behavior Summary

| Mode | Core Validation | SP Validation | Domain Services |
|------|----------------|---------------|-----------------|
| Production (`proxy`) | Hard fail | Warn at startup, fail on use | Lazy |
| Mock/Test | Skip | Skip | Lazy (mock) |

## Remaining Items for Later Prompts

| Item | Prompt |
|------|--------|
| SignalR push still mocked in production | Prompt 03 |
| Managed identity hardening | Prompt 03 |
| CORS configuration in code | Prompt 04 |
| Monitoring alerts | Prompt 05 |
