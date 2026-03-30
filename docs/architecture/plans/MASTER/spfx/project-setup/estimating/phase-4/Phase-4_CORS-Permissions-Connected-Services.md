# Phase 4 — CORS, Permissions, and Connected Services

> Created: 2026-03-30
> Prompt: P4-04 CORS, Connected Services, and Permission Model
> Companion to: `Phase-4_Infrastructure-Baseline-Matrix.md`, `Phase-4_Identity-Storage-Secrets.md`

## Purpose

Documents the production CORS posture, least-privilege permission model, and connected-service status for the retained Project Setup deployment.

---

## 1. CORS Configuration

### Production Origins

**File:** `backend/functions/host.json` — `extensions.http.cors`

| Origin | Purpose | Type |
|--------|---------|------|
| `https://hedrickbrotherscom.sharepoint.com` | Production SPFx webpart host | Required |
| `https://*.sharepoint.com` | SPFx webparts across SharePoint sites | Required |

**`supportCredentials: true`** — enables `Authorization: Bearer` header on cross-origin requests.

### Development Origins

For local development, developers should add localhost origins via Azure Functions local CORS config or browser extension. These are NOT included in the production `host.json`:

| Origin | Purpose | How to Configure |
|--------|---------|-----------------|
| `http://localhost:4000` | PWA dev server | `local.settings.json` → `Host.CORS` |
| `http://localhost:4002` | Estimating dev server | `local.settings.json` → `Host.CORS` |

Example `local.settings.json` CORS override:
```json
{
  "Host": {
    "CORS": "http://localhost:4000,http://localhost:4002,https://hedrickbrotherscom.sharepoint.com"
  }
}
```

### What Changed (P4-04)

- **Before:** No CORS configuration in code — entirely platform-managed, invisible to code review.
- **After:** Explicit CORS allowlist in `host.json` — version-controlled, reviewable, deployment-reproducible.

---

## 2. Connected Services — Retained vs Unsupported

### Retained (Required for Project Setup)

| Service | Authentication | Permission | Status |
|---------|---------------|------------|--------|
| **Azure Table Storage** | Managed Identity (DefaultAzureCredential) | Storage Table Data Contributor (RBAC) | Active — ProvisioningStatus + IdempotencyRecords |
| **SharePoint Online** | Managed Identity (DefaultAzureCredential) | Sites.FullControl.All (app-only) or Sites.Selected | Active — site creation, lists, docs, permissions |
| **Microsoft Graph** | Managed Identity (DefaultAzureCredential) | Group.ReadWrite.All (application) | Active — Entra ID security group management |
| **Azure SignalR Service** | Connection string (HMAC-SHA256) | Data-plane access via AccessKey | Active when configured — real-time provisioning push |
| **Azure App Insights** | Connection string (InstrumentationKey) | Platform-managed telemetry ingestion | Active — telemetry and custom events |
| **Azure Functions Host** | Platform-managed | Timer trigger, queue trigger support | Active — timerFullSpec, cleanupIdempotency |

### Retained (Optional — Graceful Degradation)

| Service | Authentication | Status | Degradation |
|---------|---------------|--------|-------------|
| **Azure SignalR** (when not configured) | N/A | `NoOpSignalRPushService` | Provisioning works; no real-time updates |
| **Notification dispatch** | Unauthenticated internal HTTP | Active but limited | Sends to internal endpoint; no external delivery |

### Unsupported / Stub (Not Active)

| Service | Status | Notes |
|---------|--------|-------|
| **Redis Cache** | Removed (P4-02) | Was always mocked; removed from `IServiceContainer` |
| **SendGrid Email** | Stub (P4-03) | `EMAIL_DELIVERY_API_KEY` never consumed; delivery logs only |
| **Azure Notification Hubs** | Never implemented | Using SignalR instead |

### Explicitly Not in Project Setup Scope

| Service | Notes |
|---------|-------|
| Phase 1 domain CRUD backends (10 services) | Co-deployed but lazily initialized (P4-02); not Project Setup dependencies |
| External identity provider (MSAL direct) | Frontend uses SPFx `aadTokenProviderFactory`; backend validates JWT only |

---

## 3. Least-Privilege Permission Matrix

### Managed Identity Permissions (System-Assigned)

| Resource | Permission | Scope | Saga Step | Justification |
|----------|------------|-------|-----------|---------------|
| SharePoint tenant | `Sites.FullControl.All` (app-only) | Tenant-wide | Steps 1–7 | Site creation, list management, file upload, permission assignment, hub association |
| Microsoft Graph | `Group.ReadWrite.All` (application) | Tenant-wide | Step 6 | Create Entra ID security groups, manage membership |
| Azure Table Storage | `Storage Table Data Contributor` | Storage account | All | Read/write ProvisioningStatus and IdempotencyRecords |

**Alternative SharePoint Permission (Path A):**
If `SITES_PERMISSION_MODEL=sites-selected`, use `Sites.Selected` per-site grants instead of `Sites.FullControl.All`. This requires per-site grant setup before each provisioning run.

### Entra ID App Registration

| Setting | Value | Purpose |
|---------|-------|---------|
| Application ID URI | `api://<client-id>` | Must match `API_AUDIENCE` env var |
| Exposed API scopes | `user_impersonation` or custom | SPFx token acquisition consent |
| `accessTokenAcceptedVersion` | `null` or `2` | Backend accepts both v1 and v2 (P3-03) |
| Redirect URIs | N/A for backend | Backend is API-only; no redirects |

### SharePoint Admin Center Approvals

| Approval | Purpose | Required When |
|----------|---------|---------------|
| API access request for SPFx app | Allows SPFx webpart to acquire tokens for `api://<client-id>` | Before production deployment |
| App catalog solution published | SPFx package available for Step 5 installation | Before provisioning |

### Azure Portal Grants

| Grant | Resource | Purpose |
|-------|----------|---------|
| MI → Storage Table Data Contributor | Storage account | Table Storage access |
| MI → Sites.FullControl.All (or Sites.Selected) | SharePoint tenant | Site operations |
| MI → Group.ReadWrite.All | Microsoft Graph | Entra group management |
| IT confirmation: `GRAPH_GROUP_PERMISSION_CONFIRMED=true` | Env var | Gate for Step 6 execution |

---

## 4. Browser-to-API Request Flow

```
SPFx Webpart (https://*.sharepoint.com)
  → OPTIONS preflight (CORS check against host.json allowedOrigins)
  → POST /api/project-setup-requests
    → Authorization: Bearer <SPFx-acquired token for api://<client-id>>
    → CORS response headers: Access-Control-Allow-Origin, Access-Control-Allow-Credentials
  → withAuth() validates JWT (P3-03 dual-version validator)
  → Handler processes request
```

---

## 5. Unresolved Platform/Tenant Dependencies

These require tenant administrator action and cannot be resolved in code:

| Dependency | Owner | Status |
|------------|-------|--------|
| `Group.ReadWrite.All` MI grant | IT / Entra admin | Set `GRAPH_GROUP_PERMISSION_CONFIRMED=true` after grant |
| SharePoint app catalog publishing | IT / SharePoint admin | Required for Step 5 |
| Hub site existence | IT / SharePoint admin | `SHAREPOINT_HUB_SITE_ID` must be valid |
| `Sites.Selected` per-site grants (if Path A) | IT / SharePoint admin | Requires ongoing per-project setup |
| SPFx API access approval | IT / SharePoint admin | One-time consent flow |
| Azure Function App CORS (if host.json is overridden) | DevOps | Verify portal config matches host.json |
