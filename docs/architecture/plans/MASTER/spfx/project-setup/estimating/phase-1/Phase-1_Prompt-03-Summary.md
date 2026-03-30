# Prompt 03 Summary — Backend Scope Alignment and Orphaned Call Removal

> Completed: 2026-03-30

## Outcome

The isolated Project Setup frontend has **no orphaned backend calls** requiring removal. All active API calls map to real backend endpoints. One indirect call (`ComplexityProvider` → `/api/users/me/preferences`) is documented as a gracefully degrading deferred dependency.

## Allowed Backend Surface for Phase 1

These are the backend routes that the Project Setup frontend actively calls and that have corresponding backend handler registrations:

| Endpoint | Method | Frontend Caller | Handler Location |
|----------|--------|----------------|-----------------|
| `/api/project-setup-requests` | POST | `submitRequest()` | `projectRequests/index.ts` |
| `/api/project-setup-requests` | GET | `listRequests()` | `projectRequests/index.ts` |
| `/api/project-setup-requests/{requestId}` | GET | (implied by list) | `projectRequests/index.ts` |
| `/api/project-setup-requests/{requestId}/state` | PATCH | (backend saga only) | `projectRequests/index.ts` |
| `/api/provisioning-status/{projectId}` | GET | `getProvisioningStatus()` | `provisioningSaga/index.ts` |
| `/api/provisioning-retry/{projectId}` | POST | `retryProvisioning()` | `provisioningSaga/index.ts` |
| `/api/provisioning-escalate/{projectId}` | POST | `escalateProvisioning()` | `provisioningSaga/index.ts` |
| `/api/provisioning-negotiate` | POST | `useProvisioningSignalR()` | `signalr/index.ts` |
| `/api/health` | GET | (infrastructure) | `health/index.ts` |

## Backend Scope Decisions

Each concern listed in Prompt 03 has been evaluated:

| Concern | Classification | Rationale |
|---------|---------------|-----------|
| Project requests routes | **Retain for isolated Project Setup** | Core submission and list workflow; 3 endpoints actively called |
| Provisioning status routes | **Retain for isolated Project Setup** | Status polling and display; actively called |
| Provisioning retry/escalation | **Retain for isolated Project Setup** | Failure recovery actions; actively called |
| SignalR negotiate | **Retain for isolated Project Setup** | Real-time provisioning updates; actively called from RequestDetailPage |
| Preferences | **Gate behind later phase** | `ComplexityProvider` calls `GET /api/users/me/preferences`; endpoint does not exist in backend; call degrades silently (try/catch → localStorage fallback); provides real UX value via complexity tier |
| User groups | **Retain (no API call)** | `groupMembers`/`groupLeaders` are data model fields on `IProjectSetupRequest`, not separate API calls; submitted as part of request payload |
| Notifications | **Remove from package scope** | Not referenced anywhere in `apps/estimating/src/`; notifications backend routes serve other HB Intel surfaces |
| Proxy | **Remove from package scope** | Not referenced anywhere in `apps/estimating/src/`; proxy routes serve SharePoint/Graph pass-through for other surfaces |

## Removed/Gated Calls

### Removed from scope (no code change needed — already absent from frontend)
- **Notifications** — 7+ backend routes exist but are never called by this frontend
- **Proxy** — 2 backend routes exist but are never called by this frontend
- **Estimating trackers/kickoffs** — 7 backend routes; not called (confirmed in Prompt 01)
- **All other domain routes** (Projects, Leads, Contracts, Buyout, Compliance, Risk, Schedule, Scorecards, PMP, Acknowledgments) — not called

### Gated behind later phase
- **`GET /api/users/me/preferences`** — Called by `@hbc/complexity` `ComplexityProvider` (shared package, `App.tsx:45`). Endpoint not registered in backend. Call degrades gracefully: catches error, falls back to localStorage cache or `COMPLEXITY_OPTIMISTIC_DEFAULT` (Essential tier). No user-visible failure. The endpoint should be implemented when the preferences backend is built.

## Backend Startup Areas Still Broader Than Desired

The Azure Function App registers **all** domain handlers at startup (89+ routes across 17 domains) regardless of which frontend surface is deployed. This is by design — the Function App serves multiple HB Intel surfaces, not just Project Setup.

Phase 1 does not modify backend route registration. The contract document (Prompt 04) should explicitly define only the Project Setup–relevant subset as the allowed contract surface.

Required startup configuration for Project Setup (production mode):
- `AZURE_TENANT_ID`, `AZURE_CLIENT_ID` — auth
- `AZURE_TABLE_ENDPOINT` — provisioning status persistence
- `APPLICATIONINSIGHTS_CONNECTION_STRING` — telemetry
- `SHAREPOINT_TENANT_URL`, `SHAREPOINT_PROJECTS_SITE_URL` — request persistence
- `HBC_ADAPTER_MODE` — adapter selection
- `AzureSignalRConnectionString` — optional, degrades gracefully

## Items for Prompt 04

The contract freeze should document:
1. The 9 allowed backend routes listed above as the Project Setup API contract
2. Request/response shapes for each endpoint
3. The `ComplexityProvider` preferences call as a known deferred dependency outside the contract
4. Runtime configuration requirements for each deployment mode
5. What `ui-review` mode is allowed to do (zero backend fetches) vs what production mode requires

## Acceptance Criteria Status

| Criterion | Status |
|-----------|--------|
| No known orphaned frontend API call remains | **Met** — all `IProjectSetupClient` calls map to real endpoints; `ComplexityProvider` call documented as gracefully degrading deferred dependency |
| Backend surface required by Project Setup is explicit | **Met** — 9 routes documented above |
| Unrelated scope removed, gated, or documented as deferred | **Met** — notifications, proxy, and all other domain routes confirmed absent from frontend; preferences gated |
| No change broadens package scope | **Met** — documentation only, no code changes |
