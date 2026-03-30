# Phase 1 — Scope Inventory and Decision Matrix

> Authoritative scope inventory for Phase 1 Scope Control.
> Created from live repo truth on 2026-03-30.
> Governs all Phase 1 code changes — no scope-cutting work should start before this matrix is reviewed.

## 1. Frontend Route Inventory

Source: `apps/estimating/src/router/routes.ts`

| Route | Page Component | Decision | Rationale |
|-------|---------------|----------|-----------|
| `/` | Redirect → `/project-setup` | **Keep** | Index redirect; sets workspace and forwards |
| `/project-setup` | `ProjectSetupPage` | **Keep** | Primary request queue / list page |
| `/project-setup/new` | `NewRequestPage` | **Keep** | New-request wizard and clarification-return flow |
| `/project-setup/$requestId` | `RequestDetailPage` | **Keep** | Request detail with provisioning status |

**Search params on `/project-setup/new`:** `mode` (`new-request` | `clarification-return`), `requestId` (optional).

**Summary:** All four routes are in scope. No orphaned or out-of-scope routes exist. The route tree comment (line 8) already declares this surface is scoped exclusively to Project Setup Requests.

## 2. Visible Shell Inventory

Source: `apps/estimating/src/router/root-route.tsx` (lines 17–22, 56–82)

| Shell Element | Current State | Decision | Rationale |
|---------------|--------------|----------|-----------|
| Shell mode | `"simplified"` | **Keep** | Correct isolation mode for single-purpose SPFx surface |
| `workspaceName` | `''` (empty) | **Keep** | No workspace label rendered |
| Back to Project Hub | `showBackToProjectHub: true`, URL resolved dynamically | **Keep** | Required cross-app navigation affordance |
| Tool picker | `toolPickerItems: []` (empty) | **Keep** | No tool picker in this surface |
| Left slot | `null` | **Keep** | Explicitly empty |
| Tool-picker slot | `null` | **Keep** | Explicitly empty |
| Backend mode toggle (right slot) | Renders "UI Review" / "Production" buttons when `canSwitchBackendMode` is true | **Keep** | Required for dev/QA workflow |
| UI Review info banner | Conditional on `isUiReview` | **Keep** | Required mode indicator |
| NAV_ITEMS (Bids, Templates, etc.) | Registered in `packages/shell/src/module-configs/nav-config.ts` lines 41–42 | **Keep (no action)** | Never rendered — simplified shell mode suppresses sidebar nav |

**Summary:** Shell configuration is already correctly scoped. The `SimplifiedShellConfig` type enforces no sidebar navigation. NAV_ITEMS for broader Estimating workspace exist in the shared shell package but are invisible to this surface.

## 3. Frontend API Expectation Inventory

### 3.1 Active API Calls (via `IProjectSetupClient`)

Source: `apps/estimating/src/project-setup/backend/types.ts`

| Method | Endpoint | Initiated From | Blocking? | In Scope? | Backend Supports? | Decision |
|--------|----------|---------------|-----------|-----------|-------------------|----------|
| `listRequests()` | GET `/api/project-setup-requests` | ProjectSetupPage (load), RequestDetailPage (load, refresh), NewRequestPage (clarification return) | Yes | Yes | Yes | **Keep** |
| `submitRequest(data)` | POST `/api/project-setup-requests` | NewRequestPage (form submit) | Yes | Yes | Yes | **Keep** |
| `getProvisioningStatus(projectId)` | GET `/api/provisioning-status/{projectId}` | ProjectSetupPage (status sync), RequestDetailPage (load, refresh) | Yes | Yes | Yes | **Keep** |
| `retryProvisioning(projectId)` | POST `/api/provisioning-retry/{projectId}` | ProjectSetupPage (row action) | Yes | Yes | Yes | **Keep** |
| `escalateProvisioning(projectId, escalatedBy)` | POST `/api/provisioning-escalate/{projectId}` | ProjectSetupPage (row action) | Yes | Yes | Yes | **Keep** |

### 3.2 SignalR

| Call | Initiated From | Blocking? | In Scope? | Backend Supports? | Decision |
|------|---------------|-----------|-----------|-------------------|----------|
| POST `/api/provisioning-negotiate` | RequestDetailPage via `useProvisioningSignalR()` | No (real-time) | Yes | Yes | **Keep** |

### 3.3 Unused Provisioning API Methods

Source: `packages/provisioning/src/api-client.ts` — broader `IProvisioningApiClient` interface.

These methods exist in the shared `@hbc/provisioning` package but are **not wired** into the app's `IProjectSetupClient` facade. The facade in `ProjectSetupBackendContext.tsx` (lines 70–83) wraps only the 5 methods listed above.

| Method | Used by This App? | Decision |
|--------|-------------------|----------|
| `listMyRequests()` | No | **Keep in package** — shared package, not called by this app |
| `advanceState()` | No | **Keep in package** — coordinator workflow |
| `listProvisioningRuns()` | No | **Keep in package** — admin dashboard |
| `listFailedRuns()` | No | **Keep in package** — admin dashboard |
| `archiveFailure()` | No | **Keep in package** — admin action |
| `acknowledgeEscalation()` | No | **Keep in package** — admin action |
| `forceStateTransition()` | No | **Keep in package** — expert-tier admin |

### 3.4 Estimating Query Hooks (Not Imported)

Source: `packages/query-hooks/src/estimating/`

These hooks exist in the shared `@hbc/query-hooks` package but are **not imported anywhere** in `apps/estimating/src/` (confirmed via grep). The app only imports `defaultQueryOptions` from the package for QueryClient configuration.

| Hook | Used by This App? | Decision |
|------|-------------------|----------|
| `useEstimatingTrackers` | No | **No action** — lives in shared package, not imported |
| `useEstimatingTrackerById` | No | **No action** |
| `useCreateEstimatingTracker` | No | **No action** |
| `useUpdateEstimatingTracker` | No | **No action** |
| `useDeleteEstimatingTracker` | No | **No action** |
| `useEstimatingKickoff` | No | **No action** |
| `useCreateEstimatingKickoff` | No | **No action** |

### 3.5 Other Imports

| Import | File | Decision | Rationale |
|--------|------|----------|-----------|
| `defaultQueryOptions` from `@hbc/query-hooks` | `App.tsx` | **Keep** | Used for QueryClient defaults only |
| `getAdminAppUrl()` from `crossAppUrls.ts` | Used in escalation UI | **Keep** | Graceful cross-app link; returns null if env var missing |

## 4. Backend Surface Inventory

### 4.1 Routes Relevant to Project Setup

Source: `backend/functions/src/functions/`

| Domain | Route | Method | Handler | Decision |
|--------|-------|--------|---------|----------|
| Project Requests | `/api/project-setup-requests` | POST | `submitProjectSetupRequest` | **Keep** |
| Project Requests | `/api/project-setup-requests` | GET | `listProjectSetupRequests` | **Keep** |
| Project Requests | `/api/project-setup-requests/{requestId}` | GET | `getProjectSetupRequest` | **Keep** |
| Project Requests | `/api/project-setup-requests/{requestId}/state` | PATCH | `advanceRequestState` | **Keep** — used by backend saga, not frontend directly |
| Provisioning | `/api/provisioning-status/{projectId}` | GET | `getProvisioningStatus` | **Keep** |
| Provisioning | `/api/provisioning-retry/{projectId}` | POST | `retryProvisioning` | **Keep** |
| Provisioning | `/api/provisioning-escalate/{projectId}` | POST | `escalateProvisioning` | **Keep** |
| SignalR | `/api/provisioning-negotiate` | POST | `signalrNegotiate` | **Keep** |
| Health | `/api/health` | GET | `health` | **Keep** |

### 4.2 Routes NOT Relevant to Project Setup

These are registered in the same Azure Function App but are **never called** by the Project Setup frontend. They serve other HB Intel surfaces.

| Domain | Route Count | Purpose |
|--------|-------------|---------|
| Estimating (trackers/kickoffs) | 7 | Bid tracking — future Estimating surface |
| Projects | 6 | Portfolio management |
| Leads | 5 | Business development |
| Contracts | 7 | Contract management |
| Buyout | 6 | Cost line items |
| Compliance | 6 | Vendor requirements |
| Risk | 6 | Risk management |
| Schedule | 6 | Timeline activities |
| Scorecards | 6 | Go/no-go assessment |
| PMP | 7 | Project management plans |
| Acknowledgments | 2 | Sequential signing |
| Notifications | 7+ | Alert center |
| Proxy | 2 | SharePoint/Graph pass-through |
| Provisioning (admin) | 5 | Admin-only provisioning routes (runs, archive, ack, force-state, timer) |

**Decision:** Out of scope for this frontend's contract. Phase 1 does not modify backend route registration. The contract document (Prompt 04) should explicitly exclude these from the Project Setup API contract.

### 4.3 Startup Dependencies

Source: `backend/functions/src/config/wave0-env-registry.ts`, `backend/functions/src/services/service-factory.ts`

| Dependency | Required? | Impact on Project Setup | Notes |
|-----------|-----------|------------------------|-------|
| `AZURE_TENANT_ID` | Yes (production) | Auth token validation | Boot blocker in proxy mode |
| `AZURE_CLIENT_ID` | Yes (production) | Managed Identity | Boot blocker in proxy mode |
| `AZURE_TABLE_ENDPOINT` | Yes (production) | Status persistence | Boot blocker in proxy mode |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Yes (production) | Telemetry | Boot blocker in proxy mode |
| `SHAREPOINT_TENANT_URL` | Yes (production) | Request persistence | Boot blocker in proxy mode |
| `SHAREPOINT_PROJECTS_SITE_URL` | Yes (production) | Request persistence | Boot blocker in proxy mode |
| `HBC_ADAPTER_MODE` | Yes | `proxy` or `mock` | Defaults to `proxy` |
| `AzureSignalRConnectionString` | Optional (deferred) | Real-time updates | SignalR degrades gracefully |
| `CONTROLLER_UPNS` | Optional | Role-based state transitions | Fallback: empty (submitter-only) |
| `ADMIN_UPNS` | Optional | Admin role resolution | Fallback: empty |

**Frontend runtime config** (`apps/estimating/src/config/runtimeConfig.ts`):

| Config | Resolution | Notes |
|--------|-----------|-------|
| `VITE_FUNCTION_APP_URL` | Runtime injection → env var → throws `ConfigError` in production | Required in production mode |
| `VITE_BACKEND_MODE` | Runtime injection → env var → `'production'` | Determines client factory |
| `VITE_ALLOW_BACKEND_MODE_SWITCH` | Runtime injection → env var → `false` | Controls mode toggle visibility |

## 5. Scope Decision Matrix

| ID | Item | Category | Decision | Notes |
|----|------|----------|----------|-------|
| R-01 | `/` redirect route | Route | **Keep** | Correctly redirects to `/project-setup` |
| R-02 | `/project-setup` list page | Route | **Keep** | Primary queue page |
| R-03 | `/project-setup/new` wizard | Route | **Keep** | Request creation and clarification return |
| R-04 | `/project-setup/$requestId` detail | Route | **Keep** | Request detail with provisioning |
| S-01 | Simplified shell mode | Shell | **Keep** | Correct isolation mode |
| S-02 | Back to Project Hub | Shell | **Keep** | Required cross-app navigation |
| S-03 | Backend mode toggle | Shell | **Keep** | Dev/QA workflow |
| S-04 | UI Review banner | Shell | **Keep** | Mode indicator |
| S-05 | NAV_ITEMS (Bids/Templates) | Shell | **Keep (no action)** | Not rendered in simplified mode |
| A-01 | `listRequests()` | API | **Keep** | Core data loading |
| A-02 | `submitRequest()` | API | **Keep** | Core submission |
| A-03 | `getProvisioningStatus()` | API | **Keep** | Status tracking |
| A-04 | `retryProvisioning()` | API | **Keep** | Failure recovery |
| A-05 | `escalateProvisioning()` | API | **Keep** | Failure escalation |
| A-06 | SignalR negotiate | API | **Keep** | Real-time updates |
| A-07 | `defaultQueryOptions` import | API | **Keep** | QueryClient config only |
| A-08 | `getAdminAppUrl()` | API | **Keep** | Graceful cross-app link |
| A-09 | Unused provisioning API methods | API | **Keep in package** | Not called by app; live in shared `@hbc/provisioning` |
| A-10 | Estimating query hooks | API | **No action** | Not imported by app; live in shared `@hbc/query-hooks` |
| B-01 | Project Setup backend routes (9 total) | Backend | **Keep** | Core contract surface |
| B-02 | Non-Project-Setup backend routes (80+) | Backend | **Out of scope** | Not called by frontend; exclude from contract |
| B-03 | `useProjectStore` bootstrap mock-project seeding | Bootstrap | **Removed (P1-02)** | Vestigial; no component consumed the seeded projects. `useProjectStore` import, `MOCK_PROJECTS` constant, and seeding calls removed from `bootstrap.ts`. |
| B-04 | `setActiveWorkspace('estimating')` naming | Bootstrap/Route | **Keep (P1-02)** | `'estimating'` is the canonical workspace ID in `packages/shell/src/module-configs/nav-config.ts`. Renaming would break the shell package contract. Simplified shell ignores workspace identity. |
| B-05 | `bid-tracking` feature flag in bootstrap | Bootstrap | **Removed (P1-02)** | Flag was set but never consumed by any component. Removed from `setFeatureFlags()` call. |

## Prompt 02 Decisions (Closed)

All Prompt 01 unresolved items are now closed:
- **B-03:** Removed — dead code, no consumers.
- **B-04:** Keep — correct workspace ID, no rename needed.
- **B-05:** Removed — dead feature flag, out of scope for Project Setup.
