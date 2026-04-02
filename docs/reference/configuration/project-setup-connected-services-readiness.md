# Project Setup Connected-Services Readiness

## Executive Summary

This document freezes the service-by-service identity model, minimum permission posture, and code-ready versus tenant-blocked split for every active Project Setup backend dependency. It is the single canonical reference for what identity each downstream service uses, what permissions it requires, and whether the remaining blocker (if any) is code-side or tenant-side.

**Key contract facts:**

- All downstream service calls use **app-only managed identity** via `DefaultAzureCredential` — no OBO or user-delegated flows
- Inbound user tokens are NOT used for downstream service calls in production
- `Sites.Selected` is the preferred least-privilege path for SharePoint site access; `Sites.FullControl.All` is a governed fallback only
- `GRAPH_GROUP_PERMISSION_CONFIRMED` is an operational readiness gate, not proof that permissions have been technically validated in repo
- SignalR remains connection-string based with graceful degradation to NoOp
- Notification service uses unauthenticated HTTP POST to an internal function endpoint

**Created by:** Phase 7 Prompt-04 (P7-04), 2026-04-02
**Resolves:** Remaining audit gap G7-08 (`project-setup-connected-services-readiness.md` creation)

---

## Identity Model Overview

### Inbound vs Outbound Separation

| Direction | Identity Model | Governed By |
|-----------|---------------|-------------|
| **Inbound** (SPFx → API) | Delegated user tokens with `access_as_user` scope | `project-setup-api-auth-contract.md` |
| **Outbound** (API → SharePoint/Graph/Storage) | App-only managed identity via `DefaultAzureCredential` | This document |

These two models are completely separate. Inbound user tokens are validated and used for authorization decisions only. They are never forwarded to downstream services. All downstream operations use the backend's own managed identity.

### DefaultAzureCredential Chain

| Environment | Credential Source |
|-------------|------------------|
| Production | User-assigned Managed Identity (`AZURE_CLIENT_ID` must be set to MI client ID) |
| Local dev | App registration via environment variables (`AZURE_CLIENT_ID` + `AZURE_CLIENT_SECRET`) |
| Test/mock | Mock service implementations (no credential resolution) |

---

## Service-by-Service Readiness Matrix

| # | Service | Identity Type | Token Scope / Credential | Status | Code-Ready | Tenant-Blocked | Least-Privilege |
|---|---------|--------------|--------------------------|--------|------------|----------------|-----------------|
| 1 | SharePoint (request persistence) | App-only MI | `https://{tenant}/.default` via PnPjs | Active | Yes | No | Sites.Selected (preferred) |
| 2 | SharePoint (provisioning) | App-only MI | `https://{tenant}/.default` via PnPjs | Active | Yes | Conditional (Sites.Selected grant) | Sites.Selected (preferred) |
| 3 | Graph (group operations) | App-only MI | `https://graph.microsoft.com/.default` | Active (gated) | Yes | Yes (`GRAPH_GROUP_PERMISSION_CONFIRMED`) | Broad (Group.ReadWrite.All) |
| 4 | Graph (site-grant operations) | App-only MI | `https://graph.microsoft.com/.default` | Active (gated) | Yes | Yes (admin consent) | Sites.Selected |
| 5 | Table Storage (provisioning status) | DefaultAzureCredential | Azure Tables (credential-based) | Active | Yes | No | Table RBAC role |
| 6 | Table Storage (idempotency) | DefaultAzureCredential | Azure Tables (credential-based) | Active | Yes | No | Table RBAC role |
| 7 | SignalR | Connection string (HMAC-JWT) | `AzureSignalRConnectionString` | Optional | Yes | No | Connection string access |
| 8 | Notifications | HTTP POST (no auth) | Internal function URL | Active | Yes | No | N/A (internal) |
| 9 | Acknowledgments | App-only MI | `https://{tenant}/.default` via PnPjs | Active | Yes | No | SharePoint list access |
| 10 | Telemetry (App Insights) | Connection string | `APPLICATIONINSIGHTS_CONNECTION_STRING` | Active | Yes | No | N/A (ingestion) |

---

## Minimum Permission Posture by Service

### SharePoint — Request Persistence

| Permission | Scope | Rationale |
|-----------|-------|-----------|
| `Sites.Selected` (preferred) | Per-site read/write on Projects site | Read and write project request records to SharePoint list |
| `Sites.FullControl.All` (fallback) | Tenant-wide | Governed exception only — see Sites.Selected governance below |

**Operations:** Read/write to `ProjectRequests` list, query by project ID, update request status.
**Credential:** `DefaultAzureCredential` → PnPjs custom auth middleware binding.

### SharePoint — Provisioning Operations

| Permission | Scope | Rationale |
|-----------|-------|-----------|
| `Sites.Selected` (preferred) | Per-site on provisioned sites + Projects site | Create sites, lists, libraries, upload files, install web parts, manage permissions |
| `Sites.FullControl.All` (fallback) | Tenant-wide | Governed exception only |

**Operations:** `createSite`, `createDocumentLibrary`, `createDataLists`, `uploadTemplateFiles`, `installWebParts`, `setGroupPermissions`, `associateHubSite`, `writeAuditRecord`, `assignGroupToPermissionLevel`.
**Env vars:** `SHAREPOINT_TENANT_URL`, `SHAREPOINT_APP_CATALOG_URL`, `HB_INTEL_SPFX_APP_ID`, `AZURE_TENANT_ID`.

### Microsoft Graph — Group Operations

| Permission | Type | Rationale |
|-----------|------|-----------|
| `Group.ReadWrite.All` | Application | Create security groups, add members, query groups by display name |
| `User.Read.All` | Application | Resolve UPN → object ID for group membership |

**Operations:** `createSecurityGroup`, `addGroupMembers`, `getGroupByDisplayName`.
**Gate:** `GRAPH_GROUP_PERMISSION_CONFIRMED=true` required before any operation executes.
**Least-privilege note:** `Group.ReadWrite.All` is broad but required for security group lifecycle management. There is no narrower Graph permission that allows group creation. This is a known broad permission with operational gating.

### Microsoft Graph — Site-Grant Operations

| Permission | Type | Rationale |
|-----------|------|-----------|
| `Sites.Selected` | Application | Grant per-site access to the managed identity's service principal |

**Operations:** `grantSiteAccess` — POST `/sites/{siteId}/permissions` with application identity and role.
**Least-privilege note:** This is the least-privilege path. Per-site grants are scoped to individual sites, not tenant-wide.

### Azure Table Storage

| Permission | Scope | Rationale |
|-----------|-------|-----------|
| `Storage Table Data Contributor` | Storage account | Read/write provisioning status and idempotency records |

**Tables:** `ProvisioningStatus` (provisioning lifecycle), `IdempotencyRecords` (write deduplication).
**Credential:** `DefaultAzureCredential` via `createAppTableClient()`.

### SignalR

| Permission | Scope | Rationale |
|-----------|-------|-----------|
| Connection string access | SignalR Service resource | Real-time provisioning progress push to connected clients |

**Credential:** Connection string parsed for Endpoint and AccessKey. HMAC-JWT generated per request.
**Graceful degradation:** If `AzureSignalRConnectionString` is absent, `NoOpSignalRPushService` is used — all push operations become no-ops with warning logs. Clients fall back to polling.

### Notifications

| Permission | Scope | Rationale |
|-----------|-------|-----------|
| None (internal HTTP) | N/A | POST to internal Azure Function endpoint for email/notification dispatch |

**Credential:** No authentication. Internal function-to-function call.
**Env var:** `NOTIFICATION_API_BASE_URL` (default: `http://localhost:7071`).
**Note:** Email delivery is currently a Phase 1 stub (logs only, never sends). The notification service abstraction is active but the downstream delivery is deferred.

### Acknowledgments

| Permission | Scope | Rationale |
|-----------|-------|-----------|
| SharePoint list read/write | `HbcAcknowledgmentEvents` list on tenant | Record and query acknowledgment events for provisioning workflows |

**Credential:** `DefaultAzureCredential` → PnPjs custom auth middleware (same pattern as SharePointService).
**Env var:** `SHAREPOINT_TENANT_URL`.

### Telemetry

| Permission | Scope | Rationale |
|-----------|-------|-----------|
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | App Insights resource | Telemetry ingestion for auth, authorization, and provisioning events |

**Impact on readiness:** Telemetry is a core startup requirement (blocks startup if missing). Without it, no observability into auth failures, authorization decisions, or provisioning progress.

---

## Sites.Selected / Fallback Governance

### Preferred Path: Sites.Selected (Path A)

| Property | Value |
|----------|-------|
| **Permission model** | `Sites.Selected` — per-site grants scoped to individual SharePoint sites |
| **Env var** | `SITES_PERMISSION_MODEL=sites-selected` (default) |
| **Grant confirmation** | `SITES_SELECTED_GRANT_CONFIRMED=true` (required when sites-selected is active) |
| **Grant mechanism** | Manual per-site grants via `tools/grant-site-access.sh` or Graph API `POST /sites/{siteId}/permissions` |
| **Pilot model** | Option A2 — manual pilot bridge for 3 or fewer sites |
| **Automation** | Option A1 — deferred to future phase (reassess at 4th project) |

### Governed Fallback: Sites.FullControl.All (Path B)

| Property | Value |
|----------|-------|
| **Permission model** | `Sites.FullControl.All` — tenant-wide SharePoint access |
| **Env var** | `SITES_PERMISSION_MODEL=fullcontrol` |
| **Activation conditions** | Only under conditions B-1, B-2, or B-3 (documented in `sites-selected-validation.md`) |
| **Governance** | Requires ADR with time-bounded expiry (recommended 90 days) |
| **No per-site grants** | `SITES_SELECTED_GRANT_CONFIRMED` check is bypassed |

### Key Distinction

`Sites.Selected` is the **intended production path**. `Sites.FullControl.All` is NOT the default — it is a governed exception that requires explicit justification and time-bounded approval. The env var `SITES_PERMISSION_MODEL` defaults to `sites-selected` when unset.

---

## Code-Ready Versus Tenant-Blocked Split

### Code-Ready (No External Blockers)

| Service | Evidence |
|---------|----------|
| SharePoint (request persistence) | `SharePointProjectRequestsAdapter` fully implemented; mock available |
| Table Storage (provisioning status) | `RealTableStorageService` fully implemented; mock available |
| Table Storage (idempotency) | `RealIdempotencyStorageService` fully implemented; mock available |
| SignalR | `RealSignalRPushService` + `NoOpSignalRPushService` fallback; mock available |
| Notifications | `NotificationService` HTTP POST implemented; email delivery is Phase 1 stub |
| Acknowledgments | `RealAcknowledgmentService` fully implemented; mock available |
| Telemetry | App Insights SDK integration via `APPLICATIONINSIGHTS_CONNECTION_STRING` |

### Tenant-Blocked (Requires External Action)

| Service | Blocker | Required Action | Gate |
|---------|---------|-----------------|------|
| Graph (group operations) | IT must grant `Group.ReadWrite.All` and `User.Read.All` to the managed identity's service principal | Admin consent in Azure portal > App registrations > API permissions | `GRAPH_GROUP_PERMISSION_CONFIRMED=true` |
| Graph (site-grant operations) | IT must grant `Sites.Selected` to the managed identity's service principal | Admin consent in Azure portal | Included in Graph gate |
| SharePoint (provisioning — Sites.Selected path) | IT must confirm per-site grant workflow is operational | Manual grant via `tools/grant-site-access.sh` for each provisioned site | `SITES_SELECTED_GRANT_CONFIRMED=true` |
| SharePoint admin API access approval | SharePoint admin must approve `hb-intel-api-production` / `access_as_user` | SharePoint admin center > API access | N/A (SPFx-side, not backend) |

---

## External Admin / Tenant Prerequisites

| # | Prerequisite | Owner | Type | Service Affected | Verified By |
|---|-------------|-------|------|------------------|-------------|
| 1 | App registration `hb-intel-api-production` exists in Entra ID | IT / Identity | Tenant config | Inbound API auth (SPFx callers) | `API_AUDIENCE` env var resolves |
| 2 | `Group.ReadWrite.All` granted to MI service principal | IT / Identity | Admin consent | Graph group operations | `GRAPH_GROUP_PERMISSION_CONFIRMED=true` |
| 3 | `User.Read.All` granted to MI service principal | IT / Identity | Admin consent | Graph member resolution | Included in #2 gate |
| 4 | `Sites.Selected` granted to MI service principal | IT / Identity | Admin consent | Graph site-grant operations | Included in #2 gate |
| 5 | Per-site grants executed for each provisioned site | IT / SharePoint admin | Manual action | SharePoint provisioning | `SITES_SELECTED_GRANT_CONFIRMED=true` |
| 6 | SPFx API access approval in SharePoint admin center | SharePoint admin | Admin action | SPFx token acquisition | SPFx web part can acquire tokens |
| 7 | `AzureSignalRConnectionString` provisioned (optional) | DevOps | Infrastructure | Real-time push | `NoOpSignalRPushService` fallback if absent |
| 8 | Storage account with Table Storage RBAC for MI | DevOps | Infrastructure | Table Storage | `AZURE_TABLE_ENDPOINT` resolves |
| 9 | App Insights resource provisioned | DevOps | Infrastructure | Telemetry | `APPLICATIONINSIGHTS_CONNECTION_STRING` resolves |

---

## Least-Privilege Rationale

| Service | Permission | Least-Privilege? | Rationale |
|---------|-----------|------------------|-----------|
| SharePoint (Sites.Selected) | Per-site read/write | Yes | Scoped to individual sites; no tenant-wide access |
| SharePoint (Sites.FullControl.All) | Tenant-wide | No — governed exception | Only activated under documented conditions with ADR and time-bounded expiry |
| Graph (Group.ReadWrite.All) | Tenant-wide group management | No — broadest available | Required for security group lifecycle; no narrower Graph permission exists for group creation |
| Graph (User.Read.All) | Tenant-wide user read | No — broad | Required for UPN → OID resolution; no narrower permission exists for this lookup |
| Graph (Sites.Selected) | Per-site grant | Yes | Scoped to individual sites |
| Table Storage | Storage account scope | Yes | `Storage Table Data Contributor` scoped to the specific storage account |
| SignalR | Connection string | Yes | Scoped to the specific SignalR Service resource |
| Notifications | None | Yes | Internal function-to-function; no external auth required |
| Acknowledgments | SharePoint list scope | Yes (via Sites.Selected) | Scoped to tenant root site acknowledgment list |
| Telemetry | Ingestion only | Yes | Connection string scoped to App Insights resource |

---

## Known Broad or Exception Paths

### Graph Group.ReadWrite.All

**Classification:** Known broad permission with operational gating.
**Why broad:** No narrower Graph API permission allows creating security groups and managing membership.
**Mitigation:** `GRAPH_GROUP_PERMISSION_CONFIRMED=true` gate prevents accidental use before IT confirms the grant. Break-glass telemetry (`authz.break_glass`) provides audit trail.
**Future consideration:** If Microsoft introduces narrower group permissions, this should be revisited.

### Graph User.Read.All

**Classification:** Known broad permission.
**Why broad:** UPN → OID resolution via `GET /users/{upn}` requires `User.Read.All` application permission.
**Mitigation:** Used only during provisioning saga group-member resolution. Not used for general user queries.

### Sites.FullControl.All (Path B)

**Classification:** Governed exception — not default.
**Why broad:** Tenant-wide SharePoint access bypasses per-site scoping.
**Mitigation:** Requires explicit activation via `SITES_PERMISSION_MODEL=fullcontrol`, documented ADR with 90-day expiry, and conditions B-1/B-2/B-3.

---

## Remaining Service-Access Blockers

| # | Blocker | Type | Impact | Resolution Path |
|---|---------|------|--------|-----------------|
| 1 | `Group.ReadWrite.All` not yet confirmed | Tenant | Provisioning saga cannot create security groups or add members | IT grants permission; set `GRAPH_GROUP_PERMISSION_CONFIRMED=true` |
| 2 | Per-site grants not yet confirmed (Sites.Selected path) | Tenant | Provisioning saga cannot access newly created sites | IT executes per-site grants; set `SITES_SELECTED_GRANT_CONFIRMED=true` |
| 3 | SPFx API access not yet approved | Tenant | SPFx web parts cannot acquire tokens for protected API | SharePoint admin approves in admin center |
| 4 | Email delivery is Phase 1 stub | Code | Notification service logs but does not send | Future phase implements actual email delivery |

Blockers 1–3 are tenant-side. Blocker 4 is code-side but does not affect production readiness for the provisioning workflow itself.

---

## Files and Docs This Readiness Model Depends On

### Implementation Files

| File | Role |
|------|------|
| `backend/functions/src/services/managed-identity-token-service.ts` | App-only token acquisition via DefaultAzureCredential |
| `backend/functions/src/services/sharepoint-service.ts` | SharePoint provisioning operations via PnPjs |
| `backend/functions/src/services/graph-service.ts` | Graph group/site-grant operations with permission gate |
| `backend/functions/src/services/table-storage-service.ts` | Provisioning status persistence |
| `backend/functions/src/services/idempotency-storage-service.ts` | Write deduplication |
| `backend/functions/src/services/signalr-push-service.ts` | Real-time provisioning progress push |
| `backend/functions/src/services/notification-service.ts` | Notification dispatch abstraction |
| `backend/functions/src/services/acknowledgment-service.ts` | Acknowledgment event persistence |
| `backend/functions/src/hosts/project-setup/service-factory.ts` | Service container initialization and startup validation |
| `backend/functions/src/utils/diagnose-permissions.ts` | Sites.Selected permission model diagnosis |

### Reference Documents

| Document | Role |
|----------|------|
| `docs/reference/configuration/project-setup-api-auth-contract.md` | Inbound auth contract (companion — covers SPFx-to-API direction) |
| `docs/reference/configuration/project-setup-environment-readiness.md` | CORS and environment validation tiers |
| `docs/reference/developer/project-setup-connected-service-posture.md` | Original connected-service posture (now complemented by this doc) |
| `docs/reference/configuration/sites-selected-validation.md` | Sites.Selected governance and fallback conditions |
