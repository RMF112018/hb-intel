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
| G7-02 | SPFx permission/approval clarity | Medium | Both Estimating and Accounting declare `webApiPermissionRequests` | **RESOLVED by P7-02, updated P11-03:** Admin approval workflow and SPFx permission posture documented in `project-setup-api-auth-contract.md`. Phase 10 (P10-05) added Accounting as an active protected API caller; auth contract doc updated in Phase 11 (P11-03) to reflect both apps as authorized callers. | Deployment could stall if admin approval is not understood or requested | **Resolved** — auth contract doc created (P7-02) and updated (P11-03) | **Resolved** |
| G7-03 | Project Setup vs shared host CORS posture | Medium-High | Two distinct `host.json` files with different origin lists | **RESOLVED by P7-03:** CORS posture frozen in `project-setup-environment-readiness.md` with explicit host comparison, repo-vs-Azure-resource distinction, and release gate consequences | CORS could be misconfigured if platform settings override repo-defined posture | **Resolved** — environment readiness doc created with authoritative CORS posture | **Resolved** |
| G7-04 | Tiered startup validation vs saga-time gating | Medium | `validate-config.ts` implements three tiers; `service-factory.ts` applies them | **RESOLVED by P7-03:** Full environment variable classification matrix with startup-gated, warning-only, provisioning-time, and optional tiers frozen in `project-setup-environment-readiness.md` | Later deployment work could flatten the tiers or misclassify gates | **Resolved** — environment readiness doc created with tier-by-tier classification | **Resolved** |
| G7-05 | Managed identity vs delegated auth confusion risk | High | Code cleanly separates inbound delegated (validateToken) from outbound app-only (MI services) | **RESOLVED by P7-02:** Dedicated auth contract doc created at `docs/reference/configuration/project-setup-api-auth-contract.md` with explicit inbound/outbound separation, non-sources of authorization, and scope boundary | Confusion between inbound and outbound auth models is the highest-severity conceptual risk | **Resolved** — auth contract doc created | **Resolved** |
| G7-06 | Stale config-registry drift | High | `wave0-env-registry.ts` shows `AZURE_CLIENT_SECRET` removed (P4-03), `AzureSignalRConnectionString` not required, validation IS wired (P4-02) | **RESOLVED by P7-03:** `wave-0-config-registry.md` classified as partially superseded. Full drift reconciliation table with 17 stale claims documented in `project-setup-environment-readiness.md` "Known Drift Docs and Reconciled Decisions" section | Deployment teams following stale docs could set unnecessary secrets or miss actual requirements | **Resolved** — environment readiness doc supersedes stale config registry for Project Setup | **Resolved** |
| G7-07 | Stale backend README drift | Low | `backend/functions/README.md` mentions `HBC_ADAPTER_MODE=real` as legacy but doesn't warn against use | **RESOLVED by P7-03:** Classified as acceptable minor drift in `project-setup-environment-readiness.md` — local dev context only, code handles alias correctly | Low risk — adapter-mode-guard.ts handles the alias correctly | **Resolved** — classified as acceptable | **Resolved** |
| G7-08 | Missing target docs | Medium | **RESOLVED by P7-02, P7-03, P7-04:** All three target docs created: `project-setup-api-auth-contract.md` (P7-02), `project-setup-environment-readiness.md` (P7-03), `project-setup-connected-services-readiness.md` (P7-04) | All target docs now exist as canonical references | All Phase 7 outcomes have canonical homes | **Resolved** — all three target docs created | **Resolved** |

---

## Drift-Risk Documentation Inventory

### `docs/reference/configuration/wave-0-config-registry.md`

**Status:** Partially superseded — **RECONCILED by P7-03**

17 stale claims identified and documented in `docs/reference/configuration/project-setup-environment-readiness.md` "Known Drift Docs and Reconciled Decisions" section. Key drift points:

- `AZURE_CLIENT_SECRET` listed as required in prod → removed in P4-03
- `API_AUDIENCE` omitted entirely → required in core tier since P3-03
- Multiple provisioning/notification vars listed as required → all deferred or optional
- Adapter mode vocabulary: doc says `live` → code uses `proxy`
- Validation status: doc says "not wired" → fully wired since P4-02

**Decision:** `wave-0-config-registry.md` remains useful as historical context. For current Project Setup environment readiness, `project-setup-environment-readiness.md` is authoritative.

### `backend/functions/README.md`

**Status:** Minor drift — **CLASSIFIED by P7-03** as acceptable

- `AZURE_CLIENT_SECRET` shown in local dev example → acceptable for local dev context only (not production)
- `HBC_ADAPTER_MODE=real` mentioned as legacy → code handles alias correctly

**Decision:** No changes required. Minor hygiene items that do not affect production safety.

---

## Severity Ranking

| Rank | Gap ID | Topic | Severity | Remediation Stage |
|------|--------|-------|----------|-------------------|
| 1 | G7-05 | Managed identity vs delegated auth confusion risk | High | ~~Prompt-02~~ **RESOLVED (P7-02)** |
| 2 | G7-06 | Stale config-registry drift | High | ~~Prompt-03~~ **RESOLVED (P7-03)** |
| 3 | G7-03 | Project Setup vs shared host CORS posture | Medium-High | ~~Prompt-03~~ **RESOLVED (P7-03)** |
| 4 | G7-02 | SPFx permission/approval clarity | Medium | ~~Prompt-02~~ **RESOLVED (P7-02)** |
| 5 | G7-04 | Tiered startup validation vs saga-time gating | Medium | ~~Prompt-03~~ **RESOLVED (P7-03)** |
| 6 | G7-08 | Missing target docs | Medium | ~~Prompts 02, 03, 04~~ **RESOLVED (P7-02, P7-03, P7-04)** |
| 7 | G7-07 | Stale backend README drift | Low | ~~Prompt-03~~ **RESOLVED (P7-03)** |
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

### Prompt-03 — CORS, Origin, and Environment Configuration Hardening — **COMPLETED (P7-03)**

Resolved: G7-03, G7-04, G7-06, G7-07, partial G7-08

- Created `docs/reference/configuration/project-setup-environment-readiness.md` — canonical CORS and environment readiness reference
- Froze Project Setup CORS posture: single exact origin (`https://hedrickbrotherscom.sharepoint.com`), credentials required, no wildcards, with explicit comparison to shared host
- Documented repo `host.json` vs Azure resource CORS distinction and infrastructure-as-code alignment requirement
- Froze full environment variable classification matrix: 6 core startup-gated, 2 warning-only, 7 provisioning-time, 12+ optional/deferred/stub
- Reconciled `wave-0-config-registry.md` with 17 stale claims documented and classified as superseded
- Classified `backend/functions/README.md` adapter mode drift as acceptable (code handles alias)
- Documented adapter mode contract: `proxy` (production), `mock` (dev/test), `real` (legacy alias)
- Documented release gate consequences for CORS, config validation, and adapter mode

### Prompt-04 — Managed Identity and Connected-Service Readiness — **COMPLETED (P7-04)**

Resolved: Remaining G7-08

- Created `docs/reference/configuration/project-setup-connected-services-readiness.md` — canonical connected-services readiness reference
- Froze service-by-service readiness matrix for all 10 Project Setup dependencies (SharePoint request persistence, SharePoint provisioning, Graph groups, Graph site-grants, Table Storage x2, SignalR, Notifications, Acknowledgments, Telemetry)
- Documented identity model for each service: app-only MI via DefaultAzureCredential (no OBO)
- Documented minimum permission posture with least-privilege rationale per service
- Documented code-ready vs tenant-blocked split: 7 services code-ready, 3 tenant-blocked (Graph groups, Graph site-grants, SharePoint Sites.Selected grants)
- Documented Sites.Selected governance: preferred path vs governed fallback with ADR requirement
- Documented known broad permissions (Group.ReadWrite.All, User.Read.All) with operational gating rationale
- Documented 9 external admin/tenant prerequisites with owners and verification methods
- Documented 4 remaining service-access blockers (3 tenant-side, 1 code-side stub)

### Prompt-05 — Deployment Gates, Runbooks, and Tenant Readiness Verification — **COMPLETED (P7-05)**

- Created `docs/maintenance/project-setup-deployment-readiness-checklist.md` — deployment gates for staging, pilot, and production with 10 code-complete, 14 environment-ready, and 13 tenant-ready criteria
- Created `docs/maintenance/project-setup-tenant-prerequisites.md` — 18 tenant/platform prerequisites across 7 categories (Entra app registration, SharePoint admin, managed identity, Graph permissions, Sites.Selected grants, Azure resources, CORS) with operational ownership matrix and 8-item blocker register
- Defined four readiness levels: code-complete → environment-ready → tenant-ready → production-approved
- Documented verification steps for auth, CORS, provisioning, and permission flows
- Documented evidence requirements for signoff at each gate
- Documented blockers by gate with explicit owner type and resolution path

### Prompt-06 — Final Documentation Reconciliation and Readiness Report — **COMPLETED (P7-06)**

- Created `docs/architecture/reviews/project-setup-phase-7-final-readiness-report.md` — formal Phase 7 closure report
- Confirmed all 8 audit gaps (G7-01 through G7-08) resolved
- Confirmed all 10 Phase 7 objectives closed with evidence
- Answered all 11 core audit questions affirmatively
- Documented 6 remaining external dependencies (all tenant/infrastructure, no code gaps)
- Documented 5 risks carried into later work with mitigations
- Defined next-phase entry criteria and recommended opening work order
- Confirmed all 7 final Phase 7 assertions are true
- **Phase 7 is formally closed**

---

## Explicit Open Questions

1. ~~**Does the Accounting SPFx package need its own `webApiPermissionRequests`?**~~ **RESOLVED (P7-02), UPDATED (P11-03):** Yes. Phase 10 (P10-05) added `AccountingBackendProvider` with real API client integration, making Accounting an active protected API caller. The `webApiPermissionRequests` declaration (`hb-intel-api-production / access_as_user`) is present in `apps/accounting/config/package-solution.json` and is required for the controller review surfaces. Auth contract doc updated in Phase 11 (P11-03). See [accounting-protected-api-permission-contract-reconciliation.md](accounting-protected-api-permission-contract-reconciliation.md).

2. ~~**Should the Project Setup production deployment use only the domain-scoped `host.json`, or does the shared host CORS posture also apply at runtime?**~~ **RESOLVED (P7-03):** The domain-scoped `hosts/project-setup/host.json` is authoritative for Project Setup production. The shared `host.json` applies to other function hosts. Documented in `project-setup-environment-readiness.md`.

3. ~~**How much of `wave-0-config-registry.md` should be repaired vs replaced?**~~ **RESOLVED (P7-03):** Classified as partially superseded. 17 stale claims documented. `project-setup-environment-readiness.md` is now authoritative for Project Setup environment readiness. `wave-0-config-registry.md` retained as historical context.

4. ~~**What Azure portal / ARM CORS settings are currently applied to the Function App resource?**~~ **PARTIALLY RESOLVED (P7-03):** The repo-vs-Azure-resource distinction is now documented. Actual Azure portal settings remain a platform-layer question that requires external verification. Documented as infrastructure-as-code alignment requirement.

5. ~~**Should the legacy `real` adapter mode alias be formally deprecated with a startup warning, or is silent acceptance sufficient?**~~ **RESOLVED (P7-03):** Silent acceptance is sufficient. Code normalizes `real` to `proxy` correctly. Adapter mode contract frozen in `project-setup-environment-readiness.md`.

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
