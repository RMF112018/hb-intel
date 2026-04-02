# Project Setup Environment Readiness

## Executive Summary

This document freezes the Project Setup domain's CORS posture, environment-variable classification model, and startup-versus-runtime gating behavior. It is the single canonical reference for what blocks startup, what warns at startup, what blocks provisioning only, and what is optional or deferred.

**Key contract facts:**

- Production CORS: single exact origin (`https://hedrickbrotherscom.sharepoint.com`), credentials required, no wildcards
- Six core variables block startup; two SharePoint variables warn but do not block; seven provisioning variables block saga execution only
- `AZURE_CLIENT_SECRET` is NOT part of the production contract (removed P4-03; managed identity only)
- Adapter mode vocabulary: `proxy` (production), `mock` (dev/test); legacy `real` accepted as alias for `proxy`
- `wave-0-config-registry.md` contains multiple stale claims superseded by this document

**Created by:** Phase 7 Prompt-03 (P7-03), 2026-04-02
**Resolves:** Audit gaps G7-03 (CORS posture), G7-04 (tiered startup validation), G7-06 (config-registry drift), G7-07 (backend README drift)

---

## Authoritative CORS Posture

### Production Contract

| Property | Value |
|----------|-------|
| **Allowed origins** | `https://hedrickbrotherscom.sharepoint.com` (single exact origin) |
| **Credentials** | `supportCredentials: true` |
| **Wildcard** | Not permitted — no `*` or `https://*.sharepoint.com` in production |
| **Enforcement** | `host.json` configuration + release gate test (`release-gates.test.ts`) |

### Why Credentials Are Required

`supportCredentials: true` is required because SPFx callers send `Authorization: Bearer <token>` headers. Per the CORS specification, when credentials are included, the server must respond with an exact `Access-Control-Allow-Origin` header (not `*`). Without credentials support, preflight requests would fail and the browser would block API calls.

### Why No Wildcard

- The CORS specification prohibits combining `Access-Control-Allow-Credentials: true` with `Access-Control-Allow-Origin: *`
- Even the subdomain wildcard `https://*.sharepoint.com` is excluded from the Project Setup production posture to restrict access to the specific tenant
- A release gate test enforces that no `*` wildcard appears in the Project Setup host configuration

---

## Project Setup Host Versus Shared Host

| Property | Project Setup Host | Shared Host |
|----------|-------------------|-------------|
| **Config file** | `backend/functions/src/hosts/project-setup/host.json` | `backend/functions/host.json` |
| **Allowed origins** | `https://hedrickbrotherscom.sharepoint.com` | `https://hedrickbrotherscom.sharepoint.com`, `https://*.sharepoint.com` |
| **Credentials** | `true` | `true` |
| **Function timeout** | `00:10:00` | `00:10:00` |
| **Route prefix** | `api` | `api` |
| **SignalR** | `AzureSignalRConnectionString` | `AzureSignalRConnectionString` |

### Key Differences

- The Project Setup host is **more restrictive** than the shared host — single exact origin only
- The shared host includes `https://*.sharepoint.com` to support dev/test tenants; the Project Setup host does not
- Both hosts enable credentials support
- The Project Setup host configuration is the **authoritative production posture** for the Project Setup domain

### Which Host Applies At Runtime

The deployed Project Setup Function App uses the domain-scoped `hosts/project-setup/host.json`. The shared `host.json` at the backend root applies to other function hosts that do not have their own domain-scoped configuration.

---

## Repo Config Versus Azure Resource Config

| Layer | What It Controls | Where It Lives | Authoritative For |
|-------|-----------------|----------------|-------------------|
| **Repo host.json** | CORS allowedOrigins, supportCredentials, route prefix, function timeout, SignalR binding, logging | `backend/functions/src/hosts/project-setup/host.json` | Production CORS intent, route configuration |
| **Azure Function App resource** | Platform-level CORS settings (portal/ARM/Bicep/Terraform) | Azure portal > Function App > CORS blade | Runtime enforcement that may supplement or override host.json |
| **App Service plan** | Scaling, networking, VNet integration | Azure portal > App Service Plan | Infrastructure-level access control |

### Important Distinction

Azure Functions `host.json` CORS settings define the **intended** posture. However, Azure portal CORS settings at the Function App resource level can supplement or override them. For production deployment:

- The repo `host.json` is the **source of truth for CORS intent**
- Azure resource CORS settings must be configured to **match or be more restrictive** than repo intent
- If Azure portal settings include broader origins than `host.json`, the effective posture will be broader than intended
- Infrastructure-as-code (Terraform/Bicep) should enforce alignment between repo intent and deployed config

---

## Environment Variable Classification Matrix

### Startup-Gated Core Settings (Block Startup)

These variables are validated by `validateCoreConfig()` at service factory initialization. If any are missing or empty in production, the service factory throws an aggregated error and the function host cannot serve requests.

| Variable | Bucket | Description | Key Vault |
|----------|--------|-------------|-----------|
| `AZURE_TENANT_ID` | infrastructure | Entra ID tenant identifier | No |
| `AZURE_CLIENT_ID` | infrastructure | User-assigned Managed Identity client ID (production) | No |
| `AZURE_TABLE_ENDPOINT` | infrastructure | App-data Table Storage endpoint URL | No |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | infrastructure | Application Insights telemetry ingestion | Yes |
| `API_AUDIENCE` | infrastructure | Inbound API audience URI for JWT validation (`api://<client-id>`) | No |
| `HBC_ADAPTER_MODE` | infrastructure | Adapter mode: `proxy` (production) or `mock` (dev/test) | No |

**Failure behavior:** Aggregated startup error listing all missing variables with bucket classification. Function host cannot initialize.

**Validation skip:** Skipped when `HBC_ADAPTER_MODE=mock` or `NODE_ENV=test`.

### Warning-Only Startup Settings (Log Warning, Do Not Block)

These variables are checked by the service factory after core validation. If missing in non-mock mode, a `[StartupWarning]` is logged but startup continues.

| Variable | Bucket | Description |
|----------|--------|-------------|
| `SHAREPOINT_TENANT_URL` | infrastructure | Root SharePoint tenant URL |
| `SHAREPOINT_PROJECTS_SITE_URL` | infrastructure | SharePoint site hosting the Projects list |

**Failure behavior:** Console warning (`[StartupWarning] SharePoint config incomplete...`). Startup continues. SharePoint-dependent operations will fail at runtime if these remain unset.

**Rationale:** Warning-only because:
- Health and auth endpoints should remain available even if SharePoint config is incomplete
- Allows phased deployment where SharePoint integration is configured after initial function host deployment
- SharePoint config can be validated independently via `validateSharePointConfig()`

### Provisioning-Time Prerequisites (Block Saga Execution Only)

These variables are validated by `validateProvisioningPrerequisites()` at saga execution time. They do NOT affect startup or request lifecycle.

| Variable | Bucket | Description | Expected Value |
|----------|--------|-------------|----------------|
| `GRAPH_GROUP_PERMISSION_CONFIRMED` | infrastructure | IT confirmation that `Group.ReadWrite.All` is granted | `'true'` |
| `AZURE_TENANT_ID` | infrastructure | Also checked here for saga context | (any non-empty) |
| `SHAREPOINT_TENANT_URL` | infrastructure | Also checked here for saga context | (any non-empty) |
| `SHAREPOINT_HUB_SITE_ID` | infrastructure | Hub site ID for site association | (any non-empty) |
| `SHAREPOINT_APP_CATALOG_URL` | infrastructure | App catalog URL for SPFx deployment | (any non-empty) |
| `HB_INTEL_SPFX_APP_ID` | infrastructure | SPFx solution package GUID | (any non-empty) |
| `OPEX_MANAGER_UPN` | business | OpEx manager UPN for provisioning notifications | (any non-empty) |

**Conditional gate:** When `SITES_PERMISSION_MODEL=sites-selected` (the default), `SITES_SELECTED_GRANT_CONFIRMED` must also be `'true'`.

**Failure behavior:** Aggregated error at saga execution time listing all missing prerequisites. The provisioning request is not started.

### Optional / Deferred / Local-Only Settings

| Variable | Bucket | Category | Description |
|----------|--------|----------|-------------|
| `AzureSignalRConnectionString` | infrastructure | Deferred | SignalR connection string; NoOp fallback if unset |
| `NOTIFICATION_API_BASE_URL` | infrastructure | Deferred | Notification API endpoint; has localhost fallback |
| `EMAIL_DELIVERY_API_KEY` | infrastructure | Stub (P4-03) | Email delivery is a Phase 1 stub (logs only, never sends) |
| `EMAIL_FROM_ADDRESS` | infrastructure | Stub (P4-03) | Email sender address; not consumed by any service |
| `SITES_PERMISSION_MODEL` | infrastructure | Optional | `sites-selected` (default) or `fullcontrol` |
| `SITES_SELECTED_GRANT_CONFIRMED` | infrastructure | Conditional | Required only when sites-selected model is active |
| `PROVISIONING_STEP5_TIMEOUT_MS` | infrastructure | Optional | Step 5 timeout override (default 90000ms) |
| `CONTROLLER_UPNS` | business | Optional | Notification targeting ONLY — NOT authorization |
| `ADMIN_UPNS` | business | Optional | Notification targeting ONLY — NOT authorization |
| `STRUCTURAL_OWNER_UPNS` | business | Optional | Structural owner notification targeting |
| `DEPT_BACKGROUND_ACCESS_COMMERCIAL` | business | Conditional | Department background image URL |
| `DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL` | business | Conditional | Department background image URL |
| `AzureWebJobsStorage` | infrastructure | Local-only | Function host storage (local dev emulator) |
| `FUNCTIONS_WORKER_RUNTIME` | infrastructure | Platform | Always `node` |
| `WEBSITE_NODE_DEFAULT_VERSION` | infrastructure | Platform | `~20` |

### Removed Variables (No Longer Part of Contract)

| Variable | Removed In | Reason |
|----------|-----------|--------|
| `AZURE_CLIENT_SECRET` | P4-03 | Never consumed by any service. All Azure resource auth uses `DefaultAzureCredential` (Managed Identity). Not required in production, staging, or any deployed environment. Only relevant for local dev with a developer service principal. |

---

## Infrastructure-Controlled Versus Business-Controlled Settings

### Infrastructure-Controlled (Bucket A)

Managed by DevOps/platform team via Terraform, Key Vault, CI/CD pipeline, or Azure portal.

All core, sharepoint, and provisioning-tier infrastructure variables fall in this category:
- `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_TABLE_ENDPOINT`, `APPLICATIONINSIGHTS_CONNECTION_STRING`, `API_AUDIENCE`, `HBC_ADAPTER_MODE`
- `SHAREPOINT_TENANT_URL`, `SHAREPOINT_PROJECTS_SITE_URL`
- `SHAREPOINT_HUB_SITE_ID`, `SHAREPOINT_APP_CATALOG_URL`, `HB_INTEL_SPFX_APP_ID`
- `GRAPH_GROUP_PERMISSION_CONFIRMED`, `SITES_PERMISSION_MODEL`, `SITES_SELECTED_GRANT_CONFIRMED`
- `AzureSignalRConnectionString`, `NOTIFICATION_API_BASE_URL`

### Business-Controlled (Bucket B)

Managed by product owner, admin, or operational staff. These settings affect business behavior but not infrastructure.

- `OPEX_MANAGER_UPN`
- `CONTROLLER_UPNS`, `ADMIN_UPNS`
- `STRUCTURAL_OWNER_UPNS`
- `DEPT_BACKGROUND_ACCESS_COMMERCIAL`, `DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL`

---

## Known Drift Docs and Reconciled Decisions

### `docs/reference/configuration/wave-0-config-registry.md` — Partially Superseded

This document was last updated 2026-03-14 and contains multiple claims that no longer match the current typed config registry (`wave0-env-registry.ts`) or the current validation logic (`validate-config.ts`).

| Section | Stale Claim | Current Truth | Decision |
|---------|------------|---------------|----------|
| §2.1 | `AZURE_CLIENT_SECRET` required in prod, Key Vault | Removed in P4-03 — never consumed | **Superseded** by this document |
| §2.1 | `API_AUDIENCE` not listed | Required in core tier since P3-03 | **Superseded** by this document |
| §2.1 | `SHAREPOINT_PROJECTS_SITE_URL` not listed | Required in sharepoint tier | **Superseded** by this document |
| §2.1 | `AzureSignalRConnectionString` required in prod | `requiredInProd: false`, deferred | **Superseded** by this document |
| §2.1 | `EMAIL_DELIVERY_API_KEY` required in prod | P4-03 stub, not consumed | **Superseded** by this document |
| §2.1 | `EMAIL_FROM_ADDRESS` required in prod | P4-03 stub, not consumed | **Superseded** by this document |
| §2.1 | `SHAREPOINT_HUB_SITE_ID` required in prod | Deferred to provisioning time | **Superseded** by this document |
| §2.1 | `SHAREPOINT_APP_CATALOG_URL` required in prod | Deferred to provisioning time | **Superseded** by this document |
| §2.1 | `HB_INTEL_SPFX_APP_ID` required in prod | Deferred to provisioning time | **Superseded** by this document |
| §2.1 | `NOTIFICATION_API_BASE_URL` required in prod | Has localhost fallback, not required | **Superseded** by this document |
| §2.1 | `OPEX_MANAGER_UPN` required in prod | Deferred to provisioning time | **Superseded** by this document |
| §2.1 | `CONTROLLER_UPNS` required in prod | P9-G5 notification targeting only, optional | **Superseded** by this document |
| §2.1 | `ADMIN_UPNS` required in prod | P9-G5 notification targeting only, optional | **Superseded** by this document |
| §2.1 | `GRAPH_GROUP_PERMISSION_CONFIRMED` not listed | In registry as permission gate | **Superseded** by this document |
| §2.1 | `SITES_SELECTED_GRANT_CONFIRMED` not listed | In registry as conditional gate | **Superseded** by this document |
| §3 | Adapter mode `live` for staging/prod | Code uses `proxy`; `live` does not exist; `real` is legacy alias | **Superseded** by this document |
| §4 | Validation "not wired into startup path" | Fully wired since P4-02 | **Superseded** by this document |

**Classification:** `wave-0-config-registry.md` remains useful as historical context for the original Wave 0 environment design. For current Project Setup environment readiness, **this document is authoritative**.

### `backend/functions/README.md` — Minor Drift

| Section | Stale Claim | Current Truth | Decision |
|---------|------------|---------------|----------|
| Local dev setup | Shows `AZURE_CLIENT_SECRET` in local `.env` example | Removed from registry (P4-03) — but still relevant for local dev service principal | **Acceptable** — local dev context only; README should note this is not a production variable |
| Adapter mode | Mentions `HBC_ADAPTER_MODE=real` as legacy | Correctly accepted as alias for `proxy` in code | **Acceptable** — code handles it; minor hygiene item |

---

## Adapter Mode Contract

| Mode | Value | When Used | Services |
|------|-------|-----------|----------|
| **Production** | `proxy` | All deployed environments (staging, production) | Real services via managed identity |
| **Development** | `mock` | Local development, test runners | In-memory mock services |
| **Legacy alias** | `real` | Should not be used in new config | Silently normalized to `proxy` |
| **Default** | `proxy` | When `HBC_ADAPTER_MODE` is unset | Production behavior by default |

**Safety guard:** `assertAdapterModeValid()` blocks mock mode when `AZURE_FUNCTIONS_ENVIRONMENT=Production` (unless `NODE_ENV=test`).

---

## Release-Gate Consequences

The following release gate tests enforce environment and CORS contract compliance:

| Gate | What It Checks | Consequence of Failure |
|------|---------------|----------------------|
| CORS wildcard prohibition | No `*` wildcard in Project Setup `host.json` CORS origins | Build/release blocked |
| Credentials support | `supportCredentials: true` in Project Setup `host.json` | Build/release blocked |
| Core config validation | All core-tier variables present and non-empty at startup | Function host fails to initialize |
| Adapter mode guard | Mock mode blocked in production environment | Function host fails to initialize |
| Provisioning prerequisites | All saga-required variables present before provisioning | Saga execution blocked |

---

## Files This Document Depends On

| File | Role |
|------|------|
| `backend/functions/src/hosts/project-setup/host.json` | Authoritative CORS configuration |
| `backend/functions/host.json` | Shared host CORS configuration (broader) |
| `backend/functions/src/config/wave0-env-registry.ts` | Typed environment variable registry |
| `backend/functions/src/utils/validate-config.ts` | Config validation logic (tiers, prerequisites) |
| `backend/functions/src/utils/adapter-mode-guard.ts` | Adapter mode normalization and production guard |
| `backend/functions/src/hosts/project-setup/service-factory.ts` | Startup validation orchestration |
| `backend/functions/src/utils/diagnose-permissions.ts` | Sites.Selected permission model diagnosis |
| `docs/reference/configuration/project-setup-api-auth-contract.md` | Inbound auth contract (companion doc) |
| `docs/reference/developer/project-setup-connected-service-posture.md` | Outbound service identity model |
