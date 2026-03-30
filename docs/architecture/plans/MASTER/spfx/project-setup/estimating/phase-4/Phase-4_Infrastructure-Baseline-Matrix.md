# Phase 4 — Infrastructure Baseline Matrix

> Created: 2026-03-30
> Prompt: P4-01 Repo Truth and Infrastructure Surface Baseline
> Companion to: `Phase-4_Infrastructure-Gap-Summary.md`

## Purpose

Authoritative baseline for the Project Setup infrastructure surface before any Phase 4 hardening. Every retained dependency is inventoried and classified.

## Evidence Sources

| Source | Path |
|--------|------|
| Service factory | `backend/functions/src/services/service-factory.ts` |
| Config registry | `backend/functions/src/config/wave0-env-registry.ts` |
| Startup validator | `backend/functions/src/utils/validate-config.ts` |
| Provisioning prerequisites | `backend/functions/src/utils/validate-config.ts:29-75` |
| Host config | `backend/functions/host.json` |
| Managed Identity token service | `backend/functions/src/services/managed-identity-token-service.ts` |
| SharePoint service | `backend/functions/src/services/sharepoint-service.ts` |
| Graph service | `backend/functions/src/services/graph-service.ts` |
| Table Storage service | `backend/functions/src/services/table-storage-service.ts` |
| SignalR push service | `backend/functions/src/services/signalr-push-service.ts` |

---

## 1. Runtime Entrypoints

### Function Registration Summary

| Category | Count | Project Setup Required |
|----------|-------|----------------------|
| Project Setup request lifecycle | 4 HTTP | Yes |
| Provisioning saga + admin oversight | 10 HTTP | Yes |
| SignalR negotiate | 1 HTTP | Yes |
| Acknowledgments | 2 HTTP | Yes (Step 6 bypass) |
| Proxy (Graph passthrough stub) | 2 HTTP | No (stub — returns mock data) |
| Health probe | 1 HTTP | Yes (deployment monitoring) |
| Notifications | 7 HTTP + 2 queue + 1 timer | Optional |
| Estimating (trackers/kickoffs) | 7 HTTP | No |
| Projects CRUD | 6 HTTP | No |
| Leads CRUD | 5 HTTP | No |
| Contracts CRUD | 7 HTTP | No |
| Schedule CRUD | 6 HTTP | No |
| Compliance CRUD | 6 HTTP | No |
| Buyout CRUD | 6 HTTP | No |
| Risk CRUD | 6 HTTP | No |
| Scorecards CRUD | 6 HTTP | No |
| PMP CRUD | 7 HTTP | No |
| Timer: timerFullSpec (deferred Step 5) | 1 timer | Yes |
| Timer: cleanupIdempotency | 1 timer | Yes |
| **Total** | **~94** | **~20 required** |

### Project Setup Required Routes

| Route | Method | Handler | Purpose |
|-------|--------|---------|---------|
| `/api/project-setup-requests` | POST | `submitProjectSetupRequest` | Submit new request |
| `/api/project-setup-requests` | GET | `listProjectSetupRequests` | List requests (scoped) |
| `/api/project-setup-requests/{id}` | GET | `getProjectSetupRequest` | Get single request |
| `/api/project-setup-requests/{id}/state` | PATCH | `advanceRequestState` | State transitions |
| `/api/provision-project-site` | POST | `provisionProjectSite` | Trigger provisioning |
| `/api/provisioning-status/{projectId}` | GET | `getProvisioningStatus` | Query status |
| `/api/provisioning-retry/{projectId}` | POST | `retryProvisioning` | Retry failed |
| `/api/provisioning-escalate/{projectId}` | POST | `escalateProvisioning` | Escalate failure |
| `/api/provisioning-failures` | GET | `listFailedRuns` | Admin: failures inbox |
| `/api/provisioning-runs` | GET | `listProvisioningRuns` | Admin: all runs |
| `/api/provisioning-archive/{projectId}` | POST | `archiveFailure` | Admin: archive failure |
| `/api/provisioning-escalation-ack/{projectId}` | POST | `acknowledgeEscalation` | Admin: ack escalation |
| `/api/provisioning-force-state/{projectId}` | POST | `forceStateTransition` | Admin: force state |
| `/api/admin/trigger-timer` | POST | `triggerTimerManually` | Admin: manual timer |
| `/api/provisioning-negotiate` | POST | `signalrNegotiate` | SignalR connection |
| `/api/acknowledgments` | POST/GET | acknowledgment CRUD | Step 6 bypass |
| `/api/health` | GET | `health` | Deployment probe |

---

## 2. Service Factory Dependencies

### Services Initialized (14 total)

| Service | Interface | Required for Project Setup | Production Implementation |
|---------|-----------|---------------------------|--------------------------|
| `sharePoint` | `ISharePointService` | **Yes** — site/list/doc creation | `SharePointService` (PnPjs + MI) |
| `tableStorage` | `ITableStorageService` | **Yes** — provisioning state | `RealTableStorageService` (@azure/data-tables) |
| `managedIdentity` | `IManagedIdentityTokenService` | **Yes** — app-only tokens | `ManagedIdentityTokenService` (DefaultAzureCredential) |
| `signalR` | `ISignalRPushService` | **Yes** — real-time updates | `MockSignalRPushService` ⚠️ |
| `projectRequests` | `IProjectRequestsRepository` | **Yes** — request lifecycle | `SharePointProjectRequestsAdapter` |
| `acknowledgments` | `IAcknowledgmentService` | **Yes** — Step 6 bypass | `RealAcknowledgmentService` |
| `graph` | `IGraphService` | **Yes** — Entra group mgmt | `GraphService` (DefaultAzureCredential) |
| `notifications` | `INotificationService` | **Optional** — completion alerts | `NotificationService` |
| `idempotency` | `IIdempotencyStorageService` | **Yes** — write-safe retries | `RealIdempotencyStorageService` |
| `redisCache` | `IRedisCacheService` | **No** — never used | `MockRedisCacheService` ⚠️ |
| `leads` | `ILeadService` | **No** | `RealLeadService` |
| `projects` | `IProjectService` | **No** | `RealProjectService` |
| `estimating` | `IEstimatingService` | **No** | `RealEstimatingService` |
| `schedule` | `IScheduleService` | **No** | `RealScheduleService` |
| `buyout` | `IBuyoutService` | **No** | `RealBuyoutService` |
| `compliance` | `IComplianceService` | **No** | `RealComplianceService` |
| `contracts` | `IContractService` | **No** | `RealContractService` |
| `risk` | `IRiskService` | **No** | `RealRiskService` |
| `scorecards` | `IScorecardService` | **No** | `RealScorecardService` |
| `pmp` | `IPmpService` | **No** | `RealPmpService` |

⚠️ = Mocked in production path (see Gap Summary)

---

## 3. Environment Configuration

### Required in Production (8 settings — startup gate)

| Variable | Bucket | Purpose | Project Setup Critical |
|----------|--------|---------|----------------------|
| `AZURE_TENANT_ID` | infrastructure | Entra ID tenant for token validation + Graph ops | Yes |
| `AZURE_CLIENT_ID` | infrastructure | MI client ID for DefaultAzureCredential | Yes |
| `API_AUDIENCE` | infrastructure | JWT inbound audience (P3-03) | Yes |
| `AZURE_TABLE_ENDPOINT` | infrastructure | Table Storage for provisioning state | Yes |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | infrastructure | Telemetry ingestion | Yes |
| `HBC_ADAPTER_MODE` | infrastructure | `proxy` for production, `mock` for dev | Yes |
| `SHAREPOINT_TENANT_URL` | infrastructure | Root SharePoint URL for site creation | Yes |
| `SHAREPOINT_PROJECTS_SITE_URL` | infrastructure | Projects list site | Yes |

### Soft-Required (safe degradation)

| Variable | Fallback Behavior |
|----------|-------------------|
| `CONTROLLER_UPNS` | Role-based transitions disabled for controllers |
| `ADMIN_UPNS` | Admin role disabled |

### Provisioning Prerequisites (validated before saga execution)

| Variable | Purpose | Required When |
|----------|---------|--------------|
| `GRAPH_GROUP_PERMISSION_CONFIRMED` | Must be `"true"` | Step 6 Entra group creation |
| `SHAREPOINT_HUB_SITE_ID` | Hub site GUID | Step 7 hub association |
| `SHAREPOINT_APP_CATALOG_URL` | App catalog URL | Step 5 SPFx install |
| `HB_INTEL_SPFX_APP_ID` | SPFx package GUID | Step 5 |
| `OPEX_MANAGER_UPN` | Leaders group membership | Step 6 |

### Optional (deferred features or dev-only)

| Variable | Purpose | Status |
|----------|---------|--------|
| `AzureSignalRConnectionString` | Real-time updates | Required for SignalR but not startup-gated |
| `EMAIL_DELIVERY_API_KEY` | SendGrid email | Stub only — not sending |
| `EMAIL_FROM_ADDRESS` | Sender address | Stub only |
| `NOTIFICATION_API_BASE_URL` | Notification dispatch | Has localhost fallback |
| `AZURE_CLIENT_SECRET` | App reg secret | Not needed with MI |
| `AzureWebJobsStorage` | Functions host | Local dev only |
| `PROVISIONING_STEP5_TIMEOUT_MS` | Step 5 timeout | Default 90000ms |

---

## 4. Connected Azure / Microsoft 365 Services

| Service | Authentication | Purpose | Required |
|---------|---------------|---------|----------|
| **Azure Table Storage** | DefaultAzureCredential | ProvisioningStatus + IdempotencyRecord tables | Yes |
| **SharePoint Online (PnPjs)** | DefaultAzureCredential | Site/list/doc/permission operations (Steps 1–7) | Yes |
| **Microsoft Graph** | DefaultAzureCredential | Entra ID security group creation (Step 6) | Yes |
| **Azure SignalR Service** | Connection string (HMAC-SHA256) | Real-time provisioning progress | Yes |
| **Azure App Insights** | Connection string | Telemetry, custom events, diagnostics | Yes |
| **Azure Functions Host** | Platform-managed | Timer triggers, storage queues | Yes |
| **Azure Storage Queues** | Platform-managed | `hbc-notifications-queue`, `hbc-email-queue` | Optional |
| **SendGrid** | API key | Email delivery | Stub only (not sending) |
| **Redis** | — | Cache | Never used (mocked) |

### Permission Requirements (Managed Identity)

| Resource | Permission | Saga Step |
|----------|------------|-----------|
| SharePoint tenant | Sites.FullControl.All (app-only) | Steps 1–7 |
| Microsoft Graph | Group.ReadWrite.All (app-only) | Step 6 |
| Azure Table Storage | Storage Table Data Contributor (RBAC) | All |

---

## 5. Timer / Scheduled Jobs

| Timer | Schedule | Purpose | Required |
|-------|----------|---------|----------|
| `timerFullSpec` | `0 0 1 * * *` (1 AM EST) | Deferred Step 5 (Web Parts install) retries | Yes |
| `cleanupIdempotency` | `0 0 3 * * *` (3 AM EST) | Prune expired idempotency records | Yes |
| `SendDigestEmail` | Timer (schedule TBD) | Aggregate digest email notifications | No |

### Timer Runtime Requirements

- `WEBSITE_TIME_ZONE = Eastern Standard Time` (Azure App Setting)
- `AzureWebJobsStorage` — Functions runtime storage for timer state
- `functionTimeout: 00:10:00` — covers Step 5 retry attempts

---

## 6. Azure Functions Host Configuration

**File:** `backend/functions/host.json`

| Setting | Value | Purpose |
|---------|-------|---------|
| `version` | `2.0` | Functions runtime version |
| `functionTimeout` | `00:10:00` | 10 min timeout for provisioning saga |
| `samplingSettings.maxTelemetryItemsPerSecond` | `20` | App Insights throttle |
| `extensions.signalR.connectionStringSetting` | `AzureSignalRConnectionString` | SignalR negotiate binding |
