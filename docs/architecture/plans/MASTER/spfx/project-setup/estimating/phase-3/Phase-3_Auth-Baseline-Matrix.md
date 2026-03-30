# Phase 3 — Auth Baseline Matrix

> Created: 2026-03-30
> Prompt: P3-01 Repo Truth and Auth Surface Baseline
> Companion to: `Phase-3_Auth-Gap-Summary.md`

## Purpose

This matrix is the single authoritative baseline for the Project Setup auth surface before any Phase 3 redesign work begins. Every retained route and auth touchpoint is inventoried here.

## Evidence Sources

| Source | Path |
|--------|------|
| Backend auth middleware | `backend/functions/src/middleware/auth.ts` |
| Token validator | `backend/functions/src/middleware/validateToken.ts` |
| Managed Identity service | `backend/functions/src/services/msal-obo-service.ts` |
| Service factory | `backend/functions/src/services/service-factory.ts` |
| Frontend mode gating | `apps/estimating/src/config/runtimeConfig.ts` |
| Frontend token resolution | `apps/estimating/src/utils/resolveSessionToken.ts` |
| Backend context provider | `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx` |
| Provisioning API client | `packages/provisioning/src/api-client.ts` |
| SPFx bootstrap | `packages/auth/src/spfx/SpfxContextAdapter.ts` |
| SPFx RBAC adapter | `packages/auth/src/spfx/SpfxRbacAdapter.ts` |

## Token Validation Contract (Current)

| Property | Value | Source |
|----------|-------|--------|
| Library | `jose` (JWKS verification) | `validateToken.ts:1` |
| JWKS endpoint | `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys` | `validateToken.ts:21-23` |
| Issuer | `https://sts.windows.net/${TENANT_ID}/` | `validateToken.ts:56` |
| Audience | `process.env.API_AUDIENCE \|\| api://${AZURE_CLIENT_ID}` | `validateToken.ts:19` |
| Required claims | `upn` (or `preferred_username`), `oid` | `validateToken.ts:69-71` |
| Optional claims | `roles`, `name`, `jobTitle` | `validateToken.ts:74-80` |

## Frontend Token Sourcing Contract (Current)

| Property | Value | Source |
|----------|-------|--------|
| Resolution function | `resolveSessionToken(session)` | `resolveSessionToken.ts:7` |
| Primary path | `session.rawContext.payload.accessToken` | `resolveSessionToken.ts:11` |
| Secondary path | `session.rawContext.payload.token` | `resolveSessionToken.ts:12` |
| Tertiary fallback | `session.providerIdentityRef` | `resolveSessionToken.ts:15` |
| Final fallback | `'mock-token'` (hardcoded) | `resolveSessionToken.ts:15` |
| Token refresh | None — captured once at `useMemo` render | `ProjectSetupBackendContext.tsx:131,136` |
| Injection point | `Authorization: Bearer ${token}` header | `api-client.ts:65` |

## Mode Gating Contract (Current)

| Property | ui-review | production |
|----------|-----------|------------|
| Data source | `window.localStorage` | Azure Function App API |
| Token required | No | Yes (Bearer from session) |
| API calls | None (local simulation) | Real HTTP via `authFetch()` |
| SignalR enabled | No | Yes (when provisioning active) |
| Config resolution | `runtimeConfig.ts` → Vite env → default | Same chain, defaults to `'production'` |
| Mode override | `localStorage` key when `allowBackendModeSwitch=true` | N/A |

---

## 1. Project Setup Request Routes

| Route | Method | Handler | Auth | Caller | Frontend Token Source | Backend Expectation | Mode Gating | Delegated / App-Only | RBAC | Mismatch Notes |
|-------|--------|---------|------|--------|-----------------------|---------------------|-------------|----------------------|------|----------------|
| `/api/project-setup-requests` | POST | `submitProjectSetupRequest` | `withAuth()` + `withTelemetry()` | Frontend (user) | `resolveSessionToken()` → Bearer header | JWT validated via `validateToken()` | production only (ui-review uses localStorage) | Delegated | None — any authenticated user | Token captured once at render; no refresh if expired mid-session |
| `/api/project-setup-requests` | GET | `listProjectSetupRequests` | `withAuth()` + `withTelemetry()` | Frontend (user) | Same as above | Same as above | production only | Delegated | Privileged (admin/controller UPNs) see all; others see own | UPN comparison is case-insensitive; env-var-driven, no role claims used |
| `/api/project-setup-requests/{id}` | GET | `getProjectSetupRequest` | `withAuth()` + `withTelemetry()` | Frontend (user) | Same as above | Same as above | production only | Delegated | `resolveRequestRole()` → 403 if "system" role | Role resolution uses state-machine function, not JWT roles |
| `/api/project-setup-requests/{id}/state` | PATCH | `advanceRequestState` | `withAuth()` + `withTelemetry()` | Frontend (user) | Same as above | Same as above | production only | Delegated | `isAuthorizedTransition(role, from, to)` | Transition auth uses env-var UPN lists, not JWT role claims |

**Source:** `backend/functions/src/functions/projectRequests/index.ts`

## 2. Estimating Routes

| Route | Method | Handler | Auth | Caller | Frontend Token Source | Backend Expectation | Mode Gating | Delegated / App-Only | RBAC | Mismatch Notes |
|-------|--------|---------|------|--------|-----------------------|---------------------|-------------|----------------------|------|----------------|
| `/api/estimating/trackers` | GET | `getTrackers` | `withAuth()` | Frontend (user) | `resolveSessionToken()` | JWT via `validateToken()` | production | Delegated | None | — |
| `/api/estimating/trackers/{id}` | GET | `getTrackerById` | `withAuth()` | Frontend (user) | Same | Same | production | Delegated | None | — |
| `/api/estimating/trackers` | POST | `createTracker` | `withAuth()` | Frontend (user) | Same | Same | production | Delegated | None | Records `auth.claims.upn` as creator |
| `/api/estimating/trackers/{id}` | PUT | `updateTracker` | `withAuth()` | Frontend (user) | Same | Same | production | Delegated | None | — |
| `/api/estimating/trackers/{id}` | DELETE | `deleteTracker` | `withAuth()` | Frontend (user) | Same | Same | production | Delegated | None | — |
| `/api/estimating/kickoffs` | GET | `getKickoff` | `withAuth()` | Frontend (user) | Same | Same | production | Delegated | None | — |
| `/api/estimating/kickoffs` | POST | `createKickoff` | `withAuth()` | Frontend (user) | Same | Same | production | Delegated | None | Records `auth.claims.upn` as creator |

**Source:** `backend/functions/src/functions/estimating/index.ts`

## 3. Projects Routes

| Route | Method | Handler | Auth | Caller | Frontend Token Source | Backend Expectation | Mode Gating | Delegated / App-Only | RBAC | Mismatch Notes |
|-------|--------|---------|------|--------|-----------------------|---------------------|-------------|----------------------|------|----------------|
| `/api/projects` | GET | `getProjects` | `withAuth()` + `withTelemetry()` | Frontend (user) | `resolveSessionToken()` | JWT via `validateToken()` | production | Delegated | None | — |
| `/api/projects/{id}` | GET | `getProjectById` | `withAuth()` + `withTelemetry()` | Frontend (user) | Same | Same | production | Delegated | None | — |
| `/api/projects` | POST | `createProject` | `withAuth()` + `withTelemetry()` | Frontend (user) | Same | Same | production | Delegated | None | Records `auth.claims.upn` as creator |
| `/api/projects/{id}` | PUT | `updateProject` | `withAuth()` + `withTelemetry()` | Frontend (user) | Same | Same | production | Delegated | None | — |
| `/api/projects/{id}` | DELETE | `deleteProject` | `withAuth()` + `withTelemetry()` | Frontend (user) | Same | Same | production | Delegated | None | — |
| `/api/projects/summary` | GET | `getPortfolioSummary` | `withAuth()` + `withTelemetry()` | Frontend (user) | Same | Same | production | Delegated | None | — |

**Source:** `backend/functions/src/functions/projects/index.ts`

## 4. Provisioning Saga Routes

| Route | Method | Handler | Auth | Caller | Frontend Token Source | Backend Expectation | Mode Gating | Delegated / App-Only | RBAC | Mismatch Notes |
|-------|--------|---------|------|--------|-----------------------|---------------------|-------------|----------------------|------|----------------|
| `/api/provision-project-site` | POST | `provisionProjectSite` | `withAuth()` + `withTelemetry()` | Frontend / internal (state machine fire-and-forget) | `resolveSessionToken()` | JWT via `validateToken()` | production | Delegated (user triggers) → App-only (saga executes via MI) | None — any authenticated user | Saga runs as MI; user token only identifies triggerer |
| `/api/provisioning-status/{projectId}` | GET | `getProvisioningStatus` | `withAuth()` + `withTelemetry()` | Frontend (user) | Same | Same | production | Delegated | None | — |
| `/api/provisioning-failures` | GET | `listFailedRuns` | `withAuth()` + `withTelemetry()` | Frontend (admin) | Same | Same | production | Delegated | Admin/HBIntelAdmin role required (JWT `roles` claim) | Uses JWT role claims (unlike project-request UPN-based RBAC) |
| `/api/admin/trigger-timer` | POST | `triggerTimerManually` | `withAuth()` + `withTelemetry()` | Frontend (admin) | Same | Same | production (blocked in Production env) | Delegated | Admin/HBIntelAdmin role + non-Production env guard | Double gate: role + environment |
| `/api/provisioning-retry/{projectId}` | POST | `retryProvisioning` | `withAuth()` + `withTelemetry()` | Frontend (user) | Same | Same | production | Delegated (user triggers) → App-only (saga) | None | Saga runs as MI |
| `/api/provisioning-escalate/{projectId}` | POST | `escalateProvisioning` | `withAuth()` + `withTelemetry()` | Frontend (user) | Same | Same | production | Delegated | None — records `auth.claims.upn` as escalator | — |
| `/api/provisioning-runs` | GET | `listProvisioningRuns` | `withAuth()` + `withTelemetry()` | Frontend (admin) | Same | Same | production | Delegated | Admin/HBIntelAdmin role required | — |
| `/api/provisioning-archive/{projectId}` | POST | `archiveFailure` | `withAuth()` + `withTelemetry()` | Frontend (admin) | Same | Same | production | Delegated | Admin/HBIntelAdmin role required | — |
| `/api/provisioning-escalation-ack/{projectId}` | POST | `acknowledgeEscalation` | `withAuth()` + `withTelemetry()` | Frontend (admin) | Same | Same | production | Delegated | Admin/HBIntelAdmin role required | — |
| `/api/provisioning-force-state/{projectId}` | POST | `forceStateTransition` | `withAuth()` + `withTelemetry()` | Frontend (admin) | Same | Same | production | Delegated | Admin/HBIntelAdmin role required | Expert-tier admin only |

**Source:** `backend/functions/src/functions/provisioningSaga/index.ts`

## 5. SignalR Negotiate

| Route | Method | Handler | Auth | Caller | Frontend Token Source | Backend Expectation | Mode Gating | Delegated / App-Only | RBAC | Mismatch Notes |
|-------|--------|---------|------|--------|-----------------------|---------------------|-------------|----------------------|------|----------------|
| `/api/provisioning-negotiate` | POST | `signalrNegotiate` | `withAuth()` + `withTelemetry()` | Frontend (user) | `resolveSessionToken()` via `getToken` callback | JWT via `validateToken()` | production only (disabled in ui-review) | Delegated | Admin roles get additional `provisioning-admin` group | — |

**Source:** `backend/functions/src/functions/signalr/index.ts`

## 6. Proxy Routes (Special Case)

| Route | Method | Handler | Auth | Caller | Frontend Token Source | Backend Expectation | Mode Gating | Delegated / App-Only | RBAC | Mismatch Notes |
|-------|--------|---------|------|--------|-----------------------|---------------------|-------------|----------------------|------|----------------|
| `/api/proxy/{*path}` | GET | `proxyGet` → `handleProxyRequest` | **Custom** (not `withAuth()`) | Frontend (user) | Bearer header forwarded | Extracts Bearer, passes to `acquireTokenOnBehalfOf()` — but **does not call `validateToken()`** | production | Nominally delegated (OBO signature) but **actually app-only** (MI ignores user token) | None | **Critical**: JWT is extracted but never validated; `ManagedIdentityOboService.acquireTokenOnBehalfOf()` ignores `_userToken` parameter |
| `/api/proxy/{*path}` | POST, PATCH, PUT, DELETE | `proxyMutate` → `handleProxyRequest` | **Custom** (not `withAuth()`) | Frontend (user) | Same as above | Same as above | production | Same as above | None | Same as GET — stub handler returns `{ _mock: true }` responses |

**Source:** `backend/functions/src/functions/proxy/index.ts`, `proxy-handler.ts`

## 7. Health Probe (Unauthenticated)

| Route | Method | Handler | Auth | Caller | Frontend Token Source | Backend Expectation | Mode Gating | Delegated / App-Only | RBAC | Mismatch Notes |
|-------|--------|---------|------|--------|-----------------------|---------------------|-------------|----------------------|------|----------------|
| `/api/health` | GET | `health` | **None** | Azure App Service / monitoring | N/A | No auth required | Both modes | N/A | None | Returns config diagnostics — consider whether config key names should be exposed without auth |

**Source:** `backend/functions/src/functions/health/index.ts`

## 8. Backend-to-Service Auth (App-Only / Managed Identity)

| Capability | Token Source | Scope | Credential | Auth Type | Mismatch Notes |
|------------|-------------|-------|------------|-----------|----------------|
| SharePoint site operations (PnPjs) | `DefaultAzureCredential` | `https://${tenantHost}/.default` | System-assigned Managed Identity | App-only | Token bound via PnPjs `auth.replace` hook (`sharepoint-service.ts:420-433`) |
| SharePoint token via OBO service | `DefaultAzureCredential` | `https://${tenantHost}/.default` | System-assigned MI | App-only | `ManagedIdentityOboService.getSharePointToken()` — correct app-only usage |
| Graph API operations | `DefaultAzureCredential` | `https://graph.microsoft.com/.default` | System-assigned MI | App-only | Gated by `GRAPH_GROUP_PERMISSION_CONFIRMED=true` (`graph-service.ts:71-75`) |
| OBO compatibility bridge | `DefaultAzureCredential` | Caller-specified scope | System-assigned MI | **App-only** (labeled OBO) | `acquireTokenOnBehalfOf(_userToken, scopes)` ignores user token — misleading name and signature |
| Table Storage | `DefaultAzureCredential` | Azure Table endpoint | System-assigned MI | App-only | Standard credential chain |

## 9. RBAC Model Summary

The backend uses **two distinct RBAC mechanisms** that do not intersect:

### Mechanism A: Environment-Variable UPN Lists

- **Used by:** Project Setup request routes (list, get, state transitions)
- **Config:** `ADMIN_UPNS`, `CONTROLLER_UPNS` environment variables (comma-separated)
- **Resolution:** Case-insensitive UPN comparison at handler level
- **Source:** `projectRequests/index.ts:141-157`

### Mechanism B: JWT Role Claims

- **Used by:** Provisioning admin routes (failures, runs, archive, escalation-ack, force-state, trigger-timer)
- **Config:** `roles` array in Entra ID access token (app registration role assignments)
- **Resolution:** `auth.claims.roles.some(role => role === 'Admin' || role === 'HBIntelAdmin')`
- **Source:** `provisioningSaga/index.ts`, `signalr/index.ts`

### Gap

These two RBAC mechanisms are not aligned. An admin in mechanism A (UPN-based) is not necessarily an admin in mechanism B (role-claim-based), and vice versa. There is no single source of truth for "who is an admin."
