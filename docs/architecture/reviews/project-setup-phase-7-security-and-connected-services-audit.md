# Phase 7 Prompt-01 — Repo-Truth Security and Connected-Services Audit

## Executive Summary

The Project Setup domain's security and connected-service posture is **materially sound but incompletely documented**. The live codebase implements a well-structured security model with clear separation between inbound delegated auth and outbound app-only managed identity, tiered environment validation, domain-scoped CORS, and gated connected-service access. However, several documentation artifacts have drifted from code truth, three target reference docs do not yet exist, and the distinction between code-readiness and tenant-readiness is not yet formally frozen.

Key strengths:

- Inbound auth is claims-based with explicit audience, issuer, and scope enforcement
- Outbound service access is uniformly app-only managed identity (no OBO)
- Startup validation is intentionally tiered (core/sharepoint/provisioning)
- CORS is domain-scoped for Project Setup with a narrower posture than the shared host
- Connected-service access is gated by explicit permission-confirmation env vars

Key risks:

- `wave-0-config-registry.md` contains three material inaccuracies that could mislead deployment work
- Three target docs referenced by later Phase 7 prompts do not exist and must be created
- The managed-identity vs delegated-auth distinction is strong in code but not yet frozen in a dedicated auth contract doc
- Platform-level CORS configuration is a separate layer not fully captured in repo truth

---

## Canonical Copy Check

- **Phase 7 prompt package location:** `docs/architecture/plans/MASTER/spfx/accounting/phase-7/`
- **Package exists at this path:** Yes (committed, 10 files including README, implementation plan, 6 prompts, audit report)
- **Duplicate copies found:** No
- **Status:** Canonical workspace copy confirmed

---

## Confirmed Repo Facts

The following facts are verified from direct inspection of live code files on 2026-04-02.

### Inbound API Authentication

| Fact | Source |
|------|--------|
| Bearer token extraction via `withAuth()` middleware wrapper | `backend/functions/src/middleware/auth.ts` |
| JWT verification via `validateToken()` using `jose` library JWKS validation | `backend/functions/src/middleware/validateToken.ts` |
| Production requires `AZURE_TENANT_ID` env var | `validateToken.ts` line 45 |
| Production requires `API_AUDIENCE` env var | `validateToken.ts` line 93 |
| `API_AUDIENCE` must be `api://<app-registration-client-id>` format (not bare GUID) | `validateToken.ts` design comment |
| JWKS endpoint: `https://login.microsoftonline.com/{tenantId}/discovery/v2.0/keys` | `validateToken.ts` |
| Accepted issuer v1: `https://sts.windows.net/{tenantId}/` | `validateToken.ts` |
| Accepted issuer v2: `https://login.microsoftonline.com/{tenantId}/v2.0` | `validateToken.ts` |
| Both v1 and v2 tokens are tolerated | `validateToken.ts` |
| `oid` claim always required (delegated and app-only) | `validateToken.ts` lines 284-298 |
| Delegated tokens require `upn` or `preferred_username` | `validateToken.ts` |
| App-only detection: primary `idtyp === 'app'`, fallback absence of `upn`/`preferred_username` | `validateToken.ts` lines 279-282 |
| Lazy identity config initialization (deferred to first call, not startup) | `validateToken.ts` lines 116-157 |
| Health endpoint can respond even if identity config is missing | `validateToken.ts` P8-07 |

### Authorization

| Fact | Source |
|------|--------|
| App roles: `Admin`/`HBIntelAdmin`, `Controller`/`HBIntelController`, `BreakGlass`, `Automation` | `authorization.ts` lines 14-20 |
| Dual role names per role for tenant-specific naming flexibility | `authorization.ts` |
| Required delegated scope: `access_as_user` | `authorization.ts` line 28 |
| Ownership checks: OID-based primary, UPN fallback for pre-migration records | `authorization.ts` lines 122-143 |
| App-only tokens bypass delegated scope checks | `authorization.ts` `requireDelegatedScope()` |
| Workload authorization requires app-only token + `Automation` role | `authorization.ts` `requireWorkloadRole()` |
| Break-glass usage emits dedicated `authz.break_glass` telemetry event | `authorization.ts` lines 209-250 |

### CORS

| Fact | Source |
|------|--------|
| Project Setup host allows only `https://hedrickbrotherscom.sharepoint.com` | `hosts/project-setup/host.json` |
| Project Setup host sets `supportCredentials: true` | `hosts/project-setup/host.json` |
| Shared host allows `https://hedrickbrotherscom.sharepoint.com` + `https://*.sharepoint.com` | `backend/functions/host.json` |
| Shared host also sets `supportCredentials: true` | `backend/functions/host.json` |
| No plain `*` wildcard in either host config | Both host.json files |

### Environment Validation

| Fact | Source |
|------|--------|
| Three config tiers: `core`, `sharepoint`, `provisioning` | `validate-config.ts` lines 18-23 |
| Core tier validated at startup and blocks startup | `validate-config.ts` `validateProjectSetupStartupConfig()` |
| SharePoint tier validated at startup but warning-only (non-blocking) | `service-factory.ts` lines 67-73 |
| Provisioning tier validated at saga execution time only | `validate-config.ts` `validateProvisioningPrerequisites()` |
| Validation skipped in mock mode and test mode | `validate-config.ts` `shouldValidateConfig()` |

#### Core Tier Variables (Startup-Blocking)

| Variable | Bucket | Description |
|----------|--------|-------------|
| `AZURE_TENANT_ID` | infrastructure | Entra ID tenant identifier |
| `AZURE_CLIENT_ID` | infrastructure | User-assigned Managed Identity client ID |
| `AZURE_TABLE_ENDPOINT` | infrastructure | App-data Table Storage endpoint URL |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | infrastructure | Application Insights telemetry |
| `API_AUDIENCE` | infrastructure | Inbound API audience URI for JWT validation |
| `HBC_ADAPTER_MODE` | infrastructure | Adapter mode: `proxy` (production) or `mock` (dev/test) |

#### SharePoint Tier Variables (Warning-Only at Startup)

| Variable | Bucket | Description |
|----------|--------|-------------|
| `SHAREPOINT_TENANT_URL` | infrastructure | Root SharePoint tenant URL |
| `SHAREPOINT_PROJECTS_SITE_URL` | infrastructure | SharePoint site hosting Projects list |

#### Provisioning Tier Variables (Saga-Time Only)

| Variable | Bucket | Description |
|----------|--------|-------------|
| `GRAPH_GROUP_PERMISSION_CONFIRMED` | infrastructure | Must be `true` for group operations |
| `SHAREPOINT_HUB_SITE_ID` | infrastructure | Hub site ID for association |
| `SHAREPOINT_APP_CATALOG_URL` | infrastructure | Site collections app catalog URL |
| `HB_INTEL_SPFX_APP_ID` | infrastructure | SPFx solution package GUID |
| `OPEX_MANAGER_UPN` | business | OpEx manager for provisioning notifications |
| `SITES_SELECTED_GRANT_CONFIRMED` | infrastructure | Conditional: required when `SITES_PERMISSION_MODEL=sites-selected` |

### Adapter Mode

| Fact | Source |
|------|--------|
| Canonical modes: `proxy` (production) and `mock` (dev/test) | `adapter-mode-guard.ts` line 18 |
| Legacy `real` accepted as alias for `proxy` | `adapter-mode-guard.ts` lines 29-43 |
| Default when unset: `proxy` | `adapter-mode-guard.ts` line 57 |
| Mock mode blocked in production (`AZURE_FUNCTIONS_ENVIRONMENT=Production`) unless `NODE_ENV=test` | `adapter-mode-guard.ts` lines 57-73 |

### Connected Services

| Service | Identity Model | Token Scope | Code-Ready | Tenant-Blocked |
|---------|---------------|-------------|------------|----------------|
| SharePoint (PnPjs) | App-only MI via DefaultAzureCredential | `https://{tenant}/.default` | Yes | No |
| Microsoft Graph | App-only MI via DefaultAzureCredential | `https://graph.microsoft.com/.default` | Yes | Yes (requires `GRAPH_GROUP_PERMISSION_CONFIRMED`) |
| Table Storage | MI / Azure identity client | N/A (credential-based) | Yes | No |
| SignalR | Connection string (`AzureSignalRConnectionString`) | N/A | Optional (NoOp fallback) | No |
| Notifications | Service abstraction | N/A | Yes | No |

**No OBO or user-delegated flows are used for any downstream service call.**

### SPFx Access Posture

| App | Permission Requests | Resource | Scope |
|-----|-------------------|----------|-------|
| Estimating (`apps/estimating`) | Yes | `hb-intel-api-production` | `access_as_user` |
| Accounting (`apps/accounting`) | None | N/A | N/A |

Token acquisition pattern: `createSpfxApiTokenProvider()` in `packages/auth/src/spfx/apiTokenProvider.ts` acquires tokens via `context.aadTokenProviderFactory.getTokenProvider().getToken(audience)`.

### Service Factory

| Fact | Source |
|------|--------|
| Singleton pattern for service container | `service-factory.ts` line 43 |
| `assertAdapterModeValid()` called first | `service-factory.ts` line 48 |
| `validateProjectSetupStartupConfig()` called second (core tier only) | `service-factory.ts` |
| SharePoint config validated conditionally, warning-only in non-mock mode | `service-factory.ts` lines 67-73 |
| `CONTROLLER_UPNS` and `ADMIN_UPNS` used for notification targeting ONLY, not authorization | `service-factory.ts` P9-G5 comment |
| 9 service instances created: sharePoint, tableStorage, signalR, managedIdentity, projectRequests, acknowledgments, graph, notifications, idempotency | `service-factory.ts` |

---

## Confirmed Repo-Doc Intent

The following documents already describe aspects of the Project Setup security and connected-service posture and are confirmed as current living authority.

### `docs/reference/developer/project-setup-connected-service-posture.md`

**Status:** Current (last updated 2026-03-31)

Key claims verified as accurate:

- User-assigned Managed Identity (app-only) via `DefaultAzureCredential` for all backend service operations
- User-assigned MI preferred because it survives resource recreation and requires explicit `AZURE_CLIENT_ID`
- CORS allows only `https://hedrickbrotherscom.sharepoint.com` (single origin, no wildcards)
- Three-tier validation: core (startup blocking), SharePoint (warning), provisioning (saga-only)
- `GRAPH_GROUP_PERMISSION_CONFIRMED` acts as human-verified permission gate
- SharePoint access uses either `Sites.Selected` (preferred) or `Sites.FullControl.All` (governed fallback)
- Service factory uses `createProjectSetupServiceFactory()` for domain-scoped initialization

### `docs/reference/configuration/sites-selected-validation.md`

**Status:** Current (last updated 2026-03-14)

Key claims verified as accurate:

- Two supported permission paths: Path A (`Sites.Selected`, least-privilege) and Path B (`Sites.FullControl.All`, governed exception)
- Option A2 (pilot bridge model with manual per-site grants) acceptable for Wave 0 pilot (3 or fewer sites)
- `SITES_PERMISSION_MODEL` env var controls path selection (default: `sites-selected`)
- `SITES_SELECTED_GRANT_CONFIRMED` must be `true` after IT confirms Option A2 workflow
- Path B activation requires ADR with time-bounded expiry (recommended 90 days)
- Per-site grants via Graph API: `POST /sites/{siteId}/permissions`
- Manual grant execution via `tools/grant-site-access.sh`

---

## Confirmed Microsoft-Documented Requirements / Best Practices

The following Microsoft documentation areas are relevant to Phase 7 and were used to validate repo-truth alignment.

### SPFx Connection to Entra-Secured APIs

- SPFx web parts acquire delegated tokens via `AadTokenProvider.getToken(audience)`
- The `webApiPermissionRequests` in `package-solution.json` declares the resource and scope
- SharePoint admin must approve the API access request in the SharePoint admin center
- The resource name in `webApiPermissionRequests` must match the app registration's friendly name or Application ID URI

### SharePoint Admin API Access Approval Model

- API access requests declared in SPFx solution manifests require tenant admin approval
- Approvals are managed through SharePoint admin center > API access page
- Once approved, the permission applies tenant-wide for all SPFx solutions requesting that resource/scope combination
- Revoking approval affects all SPFx solutions using that permission

### Azure Functions / App Service CORS

- `host.json` CORS configuration applies at the function app level
- Azure portal / ARM CORS settings are applied at the platform level and may override or supplement `host.json`
- `supportCredentials: true` is required when the caller sends `Authorization` headers with Bearer tokens
- Wildcard `*` origin is incompatible with `supportCredentials: true` per CORS specification

### DefaultAzureCredential with User-Assigned Managed Identity

- `DefaultAzureCredential` uses a credential chain: environment variables > managed identity > Azure CLI > etc.
- For user-assigned MI, `AZURE_CLIENT_ID` must be set to the MI's client ID
- `AZURE_CLIENT_SECRET` is not required (and should not be set) when using managed identity in production
- Token scope format: `https://{resource}/.default` for application permissions

### Microsoft Graph Permission Requirements

- `Group.ReadWrite.All` (application permission) required for creating security groups and managing membership
- `Sites.Selected` (application permission) enables per-site permission grants without tenant-wide access
- Application permissions require admin consent in the Azure portal

### Sites.Selected / Selected-Permissions Model

- `Sites.Selected` provides least-privilege access to specific SharePoint sites
- Permissions are granted per-site via Graph API: `POST /sites/{siteId}/permissions`
- Available roles: `read`, `write`, `manage`, `fullcontrol`
- The managed identity's service principal must be granted access to each site individually

---

## Current Auth Contract Summary

### Inbound Delegated Auth (SPFx → Protected API)

| Property | Value |
|----------|-------|
| **Audience** | `api://<app-registration-client-id>` (from `API_AUDIENCE` env var) |
| **Accepted Issuers** | `https://sts.windows.net/{AZURE_TENANT_ID}/` (v1), `https://login.microsoftonline.com/{AZURE_TENANT_ID}/v2.0` (v2) |
| **Token Versions** | Both v1 and v2 tolerated |
| **Required Claims** | `oid` (always), `upn` or `preferred_username` (delegated only) |
| **Required Scope** | `access_as_user` |
| **JWKS Source** | `https://login.microsoftonline.com/{tenantId}/discovery/v2.0/keys` |
| **Validation Library** | `jose` (JWKS-based JWT verification) |
| **Error Responses** | 401 with structured `{ error, reason }` body |

### App-Only Workload Auth

| Property | Value |
|----------|-------|
| **Detection** | `idtyp === 'app'` (primary), absence of `upn`/`preferred_username` (fallback) |
| **Required Role** | `Automation` (via `requireWorkloadRole()`) |
| **Scope Check** | Bypassed for app-only tokens |
| **Claims** | `oid` required (service principal OID) |

### Authorization Model

| Concern | Mechanism |
|---------|-----------|
| **Role-based access** | JWT `roles` claim checked against defined role constants |
| **Delegated scope** | JWT `scp` claim checked for `access_as_user` |
| **Ownership** | OID-based comparison (primary), UPN fallback for pre-migration records |
| **Break-glass** | `BreakGlass` role with dedicated audit telemetry |
| **Notification targeting** | `CONTROLLER_UPNS` / `ADMIN_UPNS` env vars (NOT used for authorization) |

### SPFx Permission Request Posture

| App | Declares webApiPermissionRequests | Resource | Scope | Admin Approval Required |
|-----|----------------------------------|----------|-------|------------------------|
| Estimating | Yes | `hb-intel-api-production` | `access_as_user` | Yes (SharePoint admin center) |
| Accounting | No | N/A | N/A | N/A |

---

## Current CORS / Host / Environment Summary

### CORS Posture

| Host | Allowed Origins | Credentials | Notes |
|------|----------------|-------------|-------|
| Project Setup (`hosts/project-setup/host.json`) | `https://hedrickbrotherscom.sharepoint.com` | `true` | Single exact origin, production-only |
| Shared (`backend/functions/host.json`) | `https://hedrickbrotherscom.sharepoint.com`, `https://*.sharepoint.com` | `true` | Exact + wildcard for dev/test |

**Platform layer note:** Azure Function App resource-level CORS settings (configured via Azure portal or ARM templates) are a separate layer that may supplement or override `host.json`. This layer is not fully captured in repo truth.

### Environment Validation Model

```
Startup (service factory initialization)
  ├── assertAdapterModeValid()        → blocks startup if mode unknown or mock-in-production
  ├── validateProjectSetupStartupConfig()
  │     └── validateCoreConfig()      → blocks startup if core tier vars missing
  └── validateSharePointConfig()      → warning-only if SP vars missing (non-mock only)

Saga Execution Time
  └── validateProvisioningPrerequisites()
        ├── checks provisioning-tier vars
        ├── checks GRAPH_GROUP_PERMISSION_CONFIRMED
        └── conditionally checks SITES_SELECTED_GRANT_CONFIRMED
```

---

## Current Connected-Service Summary

### Service-by-Service Matrix

| Service | Identity Model | Credential Type | Token Scope | Min Permission | Gate | Status |
|---------|---------------|-----------------|-------------|----------------|------|--------|
| **SharePoint** | App-only MI | `DefaultAzureCredential` | `https://{tenant}/.default` | `Sites.Selected` (preferred) or `Sites.FullControl.All` (fallback) | Built into service principal | Code-ready |
| **Microsoft Graph** | App-only MI | `DefaultAzureCredential` | `https://graph.microsoft.com/.default` | `Group.ReadWrite.All`, `User.Read.All` | `GRAPH_GROUP_PERMISSION_CONFIRMED=true` | Tenant-blocked until IT confirmation |
| **Table Storage** | MI / Azure identity | `DefaultAzureCredential` | N/A (credential-based) | Table RBAC role | Built into MI assignment | Code-ready |
| **SignalR** | Connection string | `AzureSignalRConnectionString` | N/A | Connection string access | Optional (NoOp fallback if unset) | Code-ready (optional) |
| **Notifications** | Service abstraction | N/A | N/A | N/A | N/A | Code-ready |
| **Idempotency** | Table Storage (shared) | `DefaultAzureCredential` | N/A | Same as Table Storage | Same as Table Storage | Code-ready |

### Sites.Selected Governance

| Path | Model | Status | Conditions |
|------|-------|--------|------------|
| Path A (preferred) | `Sites.Selected` per-site grants | Active (Option A2: manual pilot bridge) | `SITES_PERMISSION_MODEL=sites-selected`, `SITES_SELECTED_GRANT_CONFIRMED=true` |
| Path B (fallback) | `Sites.FullControl.All` | Governed exception only | Requires ADR with 90-day expiry, conditions B-1/B-2/B-3 |

---

## Gap Inventory

| ID | Topic | Classification | Repo-Truth Evidence | Conflicting Doc / Missing Authority | Why It Matters | Recommended Resolution | Downstream Risk If Unresolved |
|----|-------|---------------|--------------------|------------------------------------|----------------|----------------------|------------------------------|
| G7-01 | Auth-core source coverage | Info | `auth.ts`, `validateToken.ts`, `authorization.ts` fully inspected and documented in this audit | N/A — no prior audit existed | Later prompts need a verified baseline | Baseline established by this audit; no further action | Low — baseline now exists |
| G7-02 | SPFx permission/approval clarity | Medium | Estimating declares `webApiPermissionRequests`; Accounting does not | **RESOLVED by P7-02:** Admin approval workflow, SPFx permission posture, and Accounting non-participation now documented in `project-setup-api-auth-contract.md` | Deployment could stall if admin approval is not understood or requested | **Resolved** — auth contract doc created with full admin approval workflow | **Resolved** |
| G7-03 | Project Setup vs shared host CORS posture | Medium-High | Two distinct `host.json` files with different origin lists | Platform-level Azure CORS configuration is not captured in repo | CORS could be misconfigured if platform settings override repo-defined posture | Prompt-03 should freeze CORS posture and explicitly document the platform configuration layer | CORS failures in production or security weakening |
| G7-04 | Tiered startup validation vs saga-time gating | Medium | `validate-config.ts` implements three tiers; `service-factory.ts` applies them | Model exists in code but is not frozen in a dedicated reference doc | Later deployment work could flatten the tiers or misclassify gates | Prompt-03 should freeze the environment readiness model in a dedicated doc | Incorrect startup behavior or false deployment-readiness claims |
| G7-05 | Managed identity vs delegated auth confusion risk | High | Code cleanly separates inbound delegated (validateToken) from outbound app-only (MI services) | **RESOLVED by P7-02:** Dedicated auth contract doc created at `docs/reference/configuration/project-setup-api-auth-contract.md` with explicit inbound/outbound separation, non-sources of authorization, and scope boundary | Confusion between inbound and outbound auth models is the highest-severity conceptual risk | **Resolved** — auth contract doc created | **Resolved** |
| G7-06 | Stale config-registry drift | High | `wave0-env-registry.ts` shows `AZURE_CLIENT_SECRET` removed (P4-03), `AzureSignalRConnectionString` not required, validation IS wired (P4-02) | `wave-0-config-registry.md` §2.1 marks `AZURE_CLIENT_SECRET` as `requiredInProd: true`, marks `AzureSignalRConnectionString` as required, §4 says validation "not wired" | Deployment teams following stale docs could set unnecessary secrets or miss actual requirements | Prompt-03 should reconcile this doc or create a replacement; at minimum, flag the three inaccuracies | Incorrect production configuration, unnecessary Key Vault entries, false readiness claims |
| G7-07 | Stale backend README drift | Low | `backend/functions/README.md` mentions `HBC_ADAPTER_MODE=real` as legacy but doesn't warn against use | Minor naming inconsistency; README is otherwise current | Low risk — adapter-mode-guard.ts handles the alias correctly | Optional clarification in Prompt-03 or Prompt-06 | Minimal — code handles it |
| G7-08 | Missing target docs | Medium | **PARTIALLY RESOLVED by P7-02:** `project-setup-api-auth-contract.md` created. Still missing: `project-setup-environment-readiness.md`, `project-setup-connected-services-readiness.md` | Remaining files referenced by Prompts 03-04 but not yet created | Later prompts assume these docs exist or will be created; without them, Phase 7 outcomes have no canonical home | Prompts 03, 04 must create remaining files deliberately | Phase 7 deliverables for CORS/env and connected-services still need canonical homes |

---

## Drift-Risk Documentation Inventory

### `docs/reference/configuration/wave-0-config-registry.md`

**Status:** Stale — three material inaccuracies detected

| Section | Claim | Actual Code Truth | Severity |
|---------|-------|-------------------|----------|
| §2.1 Infrastructure table | `AZURE_CLIENT_SECRET`: `requiredInProd: true`, Key Vault: Yes | `requiredInProd: false`, removed in P4-03, never consumed by any service in production (MI only) | High |
| §2.1 Infrastructure table | `AzureSignalRConnectionString`: `requiredInProd: true` | `requiredInProd: false`, deferred to provisioning saga real-time updates only | Medium |
| §4 Validation status | "not wired into startup path" | IS wired as of P4-02 via `validateCoreConfig()` and `validateProjectSetupStartupConfig()` | Medium |

**Recommendation:** Reconcile in Prompt-03 when environment readiness is frozen. The three specific inaccuracies should be corrected or the doc should be explicitly classified as partially superseded.

### `backend/functions/README.md`

**Status:** Mostly current — one minor naming quirk

| Section | Claim | Actual Code Truth | Severity |
|---------|-------|-------------------|----------|
| §3 Adapter Mode | Mentions `HBC_ADAPTER_MODE=real` as legacy | Correctly accepted as alias for `proxy` in code; README doesn't explicitly warn against setting it | Low |

**Recommendation:** Optional clarification. The code handles the alias correctly, so this is a documentation hygiene item, not a safety issue.

---

## Severity Ranking

| Rank | Gap ID | Topic | Severity | Remediation Stage |
|------|--------|-------|----------|-------------------|
| 1 | G7-05 | Managed identity vs delegated auth confusion risk | High | ~~Prompt-02~~ **RESOLVED (P7-02)** |
| 2 | G7-06 | Stale config-registry drift | High | Prompt-03 |
| 3 | G7-03 | Project Setup vs shared host CORS posture | Medium-High | Prompt-03 |
| 4 | G7-02 | SPFx permission/approval clarity | Medium | ~~Prompt-02~~ **RESOLVED (P7-02)** |
| 5 | G7-04 | Tiered startup validation vs saga-time gating | Medium | Prompt-03 |
| 6 | G7-08 | Missing target docs | Medium | ~~Prompts 02,~~ 03, 04 (partially resolved by P7-02) |
| 7 | G7-07 | Stale backend README drift | Low | Prompt-03 or Prompt-06 |
| 8 | G7-01 | Auth-core source coverage (baseline established) | Info | Complete |

---

## Recommended Remediation Sequence for Prompts 02-06

### Prompt-02 — API Auth Contract and SPFx Access Alignment — **COMPLETED (P7-02)**

Resolved: G7-05, G7-02, partial G7-08

- Created `docs/reference/configuration/project-setup-api-auth-contract.md` — canonical inbound API auth contract
- Froze audience (`api://<app-registration-client-id>`), issuers (v1 + v2), token version tolerance, claims, delegated scope (`access_as_user`), app-only workload rules (`Automation` role), ownership fallback rules
- Explicitly separated inbound delegated auth from outbound app-only MI with dedicated scope boundary
- Documented SPFx permission-request posture: Estimating declares `access_as_user`; Accounting does not (no API calls)
- Documented SharePoint admin API access approval workflow with critical dependencies
- Documented explicit non-sources of authorization (CONTROLLER_UPNS, ADMIN_UPNS)
- Documented validation error responses, authorization error responses, and telemetry events

### Prompt-03 — CORS, Origin, and Environment Configuration Hardening

Resolves: G7-03, G7-04, G7-06, G7-07

- Freeze Project Setup CORS posture (distinguish from shared host and platform layer)
- Freeze the tiered environment validation model
- Reconcile `wave-0-config-registry.md` inaccuracies (AZURE_CLIENT_SECRET, SignalR, validation status)
- Create `docs/reference/configuration/project-setup-environment-readiness.md` (G7-08)
- Optionally clarify backend README adapter mode naming

### Prompt-04 — Managed Identity and Connected-Service Readiness

Resolves: Remaining G7-08

- Freeze the service-by-service access model with explicit identity, permission, and gate columns
- Separate code-ready from tenant-blocked dependencies
- Document Sites.Selected governance posture
- Create `docs/reference/configuration/project-setup-connected-services-readiness.md` (G7-08)

### Prompt-05 — Deployment Gates, Runbooks, and Tenant Readiness Verification

- Convert technical posture into rollout-ready documentation
- Define staging, pilot, and production gates
- Create blocker register and tenant prerequisite matrix
- Distinguish code-complete vs environment-ready vs tenant-ready vs production-approved

### Prompt-06 — Final Documentation Reconciliation and Readiness Report

- Confirm internal consistency across all Phase 7 artifacts
- Verify all gaps are resolved or explicitly classified as external blockers
- Produce final Phase 7 readiness statement

---

## Explicit Open Questions

1. ~~**Does the Accounting SPFx package need its own `webApiPermissionRequests`?**~~ **RESOLVED (P7-02):** No. The Accounting app does not currently call the Project Setup protected API. No permission request is required unless a future Accounting surface needs direct API access. Decision documented in `project-setup-api-auth-contract.md`.

2. **Should the Project Setup production deployment use only the domain-scoped `host.json`, or does the shared host CORS posture also apply at runtime?** The deployment model determines which `host.json` is effective. Prompt-03 should clarify.

3. **How much of `wave-0-config-registry.md` should be repaired vs replaced?** Three inaccuracies are identified. The doc could be corrected in place or superseded by the new `project-setup-environment-readiness.md`. Prompt-03 should decide.

4. **What Azure portal / ARM CORS settings are currently applied to the Function App resource?** This is a platform-layer question not fully answerable from repo truth alone. Prompt-03 should document what is known and flag what requires external verification.

5. **Should the legacy `real` adapter mode alias be formally deprecated with a startup warning, or is silent acceptance sufficient?** Code handles it correctly today; this is a documentation/guidance question for Prompt-03 or Prompt-06.

---

## Exact Files Inspected

### Auth / Authorization Core
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/validateToken.ts`
- `backend/functions/src/middleware/authorization.ts`

### Host / Config / Startup Validation
- `backend/functions/src/hosts/project-setup/host.json`
- `backend/functions/host.json`
- `backend/functions/src/hosts/project-setup/service-factory.ts`
- `backend/functions/src/utils/validate-config.ts`
- `backend/functions/src/config/wave0-env-registry.ts`
- `backend/functions/src/utils/adapter-mode-guard.ts`

### Connected Services
- `backend/functions/src/services/managed-identity-token-service.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/graph-service.ts`

### SPFx Access Posture
- `apps/estimating/config/package-solution.json`
- `apps/accounting/config/package-solution.json`
- `packages/auth/src/spfx/apiTokenProvider.ts`

### Current Living Docs
- `docs/reference/developer/project-setup-connected-service-posture.md`
- `docs/reference/configuration/sites-selected-validation.md`

### Drift-Risk Operational and Config Docs
- `docs/reference/configuration/wave-0-config-registry.md`
- `backend/functions/README.md`

### Phase 7 Package
- `docs/architecture/plans/MASTER/spfx/accounting/phase-7/README_Phase-7-Security-Connected-Services-and-Environment-Readiness.md`
- `docs/architecture/plans/MASTER/spfx/accounting/phase-7/Phase-7_Security-Connected-Services-and-Environment-Readiness_Implementation-Plan.md`
- `docs/architecture/plans/MASTER/spfx/accounting/phase-7/Accounting_Phase7_Prompt_Audit_Report.md`
- `docs/architecture/plans/MASTER/spfx/accounting/phase-7/Prompt-01_Phase-7-Repo-Truth-Security-and-Connected-Services-Audit.md`

### Target Files Verified as Non-Existent
- `docs/reference/configuration/project-setup-api-auth-contract.md` — does not exist
- `docs/reference/configuration/project-setup-environment-readiness.md` — does not exist
- `docs/reference/configuration/project-setup-connected-services-readiness.md` — does not exist
