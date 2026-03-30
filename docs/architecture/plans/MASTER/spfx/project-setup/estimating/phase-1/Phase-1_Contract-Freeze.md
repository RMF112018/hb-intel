# Phase 1 — Contract Freeze: Project Setup SPFx Surface

> Frozen: 2026-03-30
> Governs: `@hbc/spfx-project-setup` (apps/estimating) — the isolated Project Setup Requests SPFx surface.

## 1. Scope Statement

This contract defines the allowed frontend routes, backend endpoints, request/response shapes, runtime modes, and configuration requirements for the **isolated Project Setup Requests** SPFx surface.

Anything not listed here is **out of scope** for this surface. Out-of-scope capabilities must not be added without updating this contract.

## 2. Frontend Route Contract

Source: `apps/estimating/src/router/routes.ts`

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Redirect → `/project-setup` | Index redirect |
| `/project-setup` | `ProjectSetupPage` | Request queue / list |
| `/project-setup/new` | `NewRequestPage` | New request wizard; clarification return |
| `/project-setup/$requestId` | `RequestDetailPage` | Request detail with provisioning status |

**Search params on `/project-setup/new`:**
- `mode`: `'new-request'` | `'clarification-return'` (default: `'new-request'`)
- `requestId`: `string | undefined`

**Shell mode:** `"simplified"` — no sidebar nav, no tool picker, back-to-hub enabled.

## 3. Backend Route Contract

### 3.1 Allowed Endpoints

These are the only backend endpoints the Project Setup frontend is permitted to call:

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/api/project-setup-requests` | POST | Submit new request | `201 { data: IProjectSetupRequest }` |
| `/api/project-setup-requests` | GET | List requests | `200 { items: IProjectSetupRequest[], pagination }` |
| `/api/provisioning-status/{projectId}` | GET | Poll provisioning progress | `200 { data: IProvisioningStatus }` or `404` |
| `/api/provisioning-retry/{projectId}` | POST | Retry failed provisioning | `202 { data: { message } }` |
| `/api/provisioning-escalate/{projectId}` | POST | Escalate failure | `200 { data: { message } }` |
| `/api/provisioning-negotiate` | POST | SignalR negotiate | SignalR connection info |

**Backend-only endpoints** (not called by frontend directly, but part of the contract):

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/project-setup-requests/{requestId}` | GET | Single request read |
| `/api/project-setup-requests/{requestId}/state` | PATCH | Advance lifecycle state (saga-triggered) |
| `/api/health` | GET | Liveness probe |

### 3.2 Response Envelopes

**Success (single item):**
```json
{ "data": <T> }
```

**Success (list):**
```json
{
  "items": [<T>, ...],
  "pagination": {
    "total": number,
    "page": number,
    "pageSize": number,
    "totalPages": number
  }
}
```

**Error:**
```json
{
  "message": "Human-readable error description",
  "code": "ERROR_CODE",
  "requestId": "uuid (optional)"
}
```

**Error codes:** `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `INTERNAL_ERROR`

Source: `backend/functions/src/utils/response-helpers.ts`

### 3.3 Excluded Backend Routes

These routes exist in the shared Azure Function App but are **not part of the Project Setup contract**:

Estimating trackers/kickoffs, Projects, Leads, Contracts, Buyout, Compliance, Risk, Schedule, Scorecards, PMP, Acknowledgments, Notifications, Proxy, and admin-only provisioning routes (runs, archive, ack, force-state, timer).

## 4. Type Contract

### 4.1 Frontend Client Interface

Source: `apps/estimating/src/project-setup/backend/types.ts`

```typescript
interface IProjectSetupClient {
  listRequests(): Promise<IProjectSetupRequest[]>;
  submitRequest(data: Partial<IProjectSetupRequest>): Promise<IProjectSetupRequest>;
  getProvisioningStatus(projectId: string): Promise<IProvisioningStatus | null>;
  retryProvisioning(projectId: string): Promise<void>;
  escalateProvisioning(projectId: string, escalatedBy: string): Promise<void>;
}
```

### 4.2 Core Domain Types

Source: `packages/models/src/provisioning/IProvisioning.ts`

**IProjectSetupRequest** — 48 fields covering:
- Identity: `requestId`, `projectId`, `projectName`, `projectNumber?`
- Location (Step 1): `projectStreetAddress?`, `projectCity?`, `projectCounty?`, `projectState?`, `projectZip?`, `projectLocation`
- Classification (Step 2): `projectType`, `projectStage`, `officeDivision?`, `contractType?`
- Team (Step 3): `groupMembers[]`, `groupLeaders?[]`, `projectLeadId?`, `projectExecutiveUpn?`, `projectManagerUpn?`, `leadEstimatorUpn?`, `supportingEstimatorUpns?[]`, `additionalTeamMemberUpns?[]`, `timberscanApproverUpn?`, `viewerUPNs?[]`
- Add-ons (Step 4): `addOns?[]`
- Metadata: `submittedBy`, `submittedAt`, `state`, `completedBy?`, `completedAt?`, `year?`
- Clarification: `clarificationNote?`, `clarificationRequestedAt?`, `clarificationItems?[]`
- Provisioning: `siteUrl?`, `retryCount`, `requesterRetryUsed?`, `department?`

**ProjectSetupRequestState:**
`'Submitted'` | `'UnderReview'` | `'NeedsClarification'` | `'AwaitingExternalSetup'` | `'ReadyToProvision'` | `'Provisioning'` | `'Completed'` | `'Failed'`

**IProvisioningStatus** — provisioning run record:
- `overallStatus`: `'NotStarted'` | `'InProgress'` | `'BaseComplete'` | `'Completed'` | `'Failed'` | `'WebPartsPending'`
- `steps: ISagaStepResult[]` — 7-step saga
- `failureClass?`: `'transient'` | `'structural'` | `'permissions'` | `'repeated'` | `'admin-class'`
- Timestamps: `startedAt`, `completedAt?`, `failedAt?`, `lastRetryAt?`, `escalatedAt?`

**ISagaStepResult** — per-step execution result:
- `status`: `'NotStarted'` | `'InProgress'` | `'Completed'` | `'Failed'` | `'Skipped'` | `'DeferredToTimer'`

**IProvisioningProgressEvent** — SignalR real-time event:
- `projectId`, `correlationId`, `stepNumber`, `stepName`, `status`, `overallStatus`, `timestamp`, `errorMessage?`

### 4.3 SignalR Contract

- **Negotiate:** POST `/api/provisioning-negotiate?projectId={id}`
- **Hub event:** `'provisioningProgress'` → `IProvisioningProgressEvent`
- **Groups:** `provisioning-{projectId}` (per-project), `provisioning-admin` (admin)
- **Reconnection:** 6-tier backoff (0, 2s, 5s, 10s, 30s, 60s)

## 5. Runtime Mode Contract

### 5.1 Production Mode

| Aspect | Rule |
|--------|------|
| Backend calls | All `IProjectSetupClient` methods call real Azure Function App endpoints |
| Authentication | Bearer token from `@hbc/auth` session; validated server-side via JWT |
| `functionAppUrl` | **Required** — `ConfigError` thrown if missing |
| SignalR | Active when provisioning is in progress and `functionAppUrl` is available |
| Data persistence | Azure Table Storage + SharePoint via backend |

### 5.2 UI Review Mode

| Aspect | Rule |
|--------|------|
| Backend calls | **Zero** — all calls served by `uiReviewProjectSetupClient.ts` |
| Authentication | Mock persona from `@hbc/auth` PERSONA_REGISTRY |
| `functionAppUrl` | Not required (returns empty string) |
| SignalR | Disabled |
| Data persistence | Browser `localStorage` only |
| Purpose | Reviewer workflow testing without backend infrastructure |

**Storage keys (UI Review):**
- `hb-intel:estimating:ui-review:project-setup:requests`
- `hb-intel:estimating:ui-review:project-setup:statuses`

### 5.3 Mode Switching

- Controlled by `getAllowBackendModeSwitch()` → renders toggle in shell right slot
- Toggle persists to `localStorage` key `hb-intel:estimating:backend-mode`
- Default: disabled (production-only)
- Enable: set `VITE_ALLOW_BACKEND_MODE_SWITCH=true` or inject via shell config

## 6. Configuration Contract

Source: `apps/estimating/src/config/runtimeConfig.ts`

| Config | Env Var | Runtime Injection | Default | Required? |
|--------|---------|-------------------|---------|-----------|
| Function App URL | `VITE_FUNCTION_APP_URL` | `config.functionAppUrl` | `ConfigError` (production) / `''` (ui-review) | Production only |
| Backend mode | `VITE_BACKEND_MODE` | `config.backendMode` | `'production'` | No |
| Allow mode switch | `VITE_ALLOW_BACKEND_MODE_SWITCH` | `config.allowBackendModeSwitch` | `false` | No |

**Resolution order:** Runtime injection → Vite env var → Default

**Backend required config (production mode):**

| Variable | Purpose | Boot blocker? |
|----------|---------|---------------|
| `AZURE_TENANT_ID` | Auth token validation | Yes |
| `AZURE_CLIENT_ID` | Managed Identity | Yes |
| `AZURE_TABLE_ENDPOINT` | Provisioning status persistence | Yes |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Telemetry | Yes |
| `SHAREPOINT_TENANT_URL` | Request persistence | Yes |
| `SHAREPOINT_PROJECTS_SITE_URL` | Request persistence | Yes |
| `HBC_ADAPTER_MODE` | `'proxy'` or `'mock'` | Yes |
| `AzureSignalRConnectionString` | Real-time updates | No (degrades gracefully) |
| `CONTROLLER_UPNS` | Role-based state transitions | No (fallback: submitter-only) |
| `ADMIN_UPNS` | Admin role resolution | No (fallback: empty) |

## 7. Excluded Scope

These capabilities are **not part of the Project Setup contract** and must not be added without updating this document:

- Estimating bid tracking or templates
- Portfolio management (Projects CRUD)
- Business development (Leads)
- Financial management (Contracts, Buyout)
- Compliance, Risk, Schedule, Scorecards, PMP
- Notification center or preferences
- SharePoint/Graph proxy pass-through
- Admin provisioning management (runs, archive, force-state)
- User/group management APIs
- Direct SharePoint REST calls

## 8. Known Deferred Items

| Item | Status | Notes |
|------|--------|-------|
| `GET /api/users/me/preferences` | Deferred | Called by `@hbc/complexity` `ComplexityProvider`; endpoint not registered in backend; degrades silently to localStorage fallback |
| Preferences backend endpoint | Deferred | Required for server-side complexity tier persistence |
| Full auth-model redesign | Out of Phase 1 | Token-version hardening deferred |
| SharePoint list-field remapping | Out of Phase 1 | Field mapping deferred |
| Full provisioning maturity | Out of Phase 1 | Step 5/6/7 hardening deferred |
