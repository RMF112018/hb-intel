# Phase 3 — Capability Boundary Matrix

> Created: 2026-03-30
> Prompt: P3-04 Delegated vs App-Only Boundaries and Managed Identity Cleanup
> Companion to: `Phase-3_Auth-Baseline-Matrix.md`, `Phase-3_API-Token-Contract.md`

## Purpose

Documents which retained Project Setup backend capabilities run as the authenticated user (delegated) and which run as the application identity (app-only via Managed Identity), so engineers can tell exactly what identity is in play at every point.

## Execution Identity Model

### Delegated (User Identity)

The user's JWT Bearer token is validated by `withAuth()` middleware. The validated claims (`upn`, `oid`, `roles`) are used for:
- **RBAC decisions** — who can see what, who can transition states
- **Audit attribution** — `submittedBy`, `triggeredBy`, `completedBy`, `escalatedBy`
- **Scoping** — non-privileged users see only their own requests

The user's token is **never forwarded** to downstream services (SharePoint, Graph, Table Storage).

### App-Only (Managed Identity)

All backend-to-service calls use system-assigned Managed Identity via `DefaultAzureCredential`. The application identity has its own permission grants independent of the calling user.

| Service | Credential | Scope | Permission Source |
|---------|------------|-------|-------------------|
| SharePoint (PnPjs) | `DefaultAzureCredential` | `https://{tenant}.sharepoint.com/.default` | SharePoint app-only permissions |
| Microsoft Graph | `DefaultAzureCredential` | `https://graph.microsoft.com/.default` | Entra ID app registration (Graph API permissions) |
| Table Storage | `DefaultAzureCredential` | Azure RBAC on storage account | Azure RBAC role assignment |
| Managed Identity Token Service | `DefaultAzureCredential` | Caller-specified scope | Per-resource permission |

### Hybrid Pattern (Provisioning Saga)

The provisioning saga is **triggered** by a delegated user call (`POST /api/provision-project-site`) but **executes** all downstream operations as the app identity:

```
User (delegated) → POST /api/provision-project-site
  → withAuth() validates JWT, extracts triggeredBy = auth.claims.upn
  → SagaOrchestrator.execute() runs asynchronously
    → All steps use app-only MI for SharePoint/Graph/Table operations
```

The user's identity is recorded for audit but never used for downstream access.

## Route-Level Capability Classification

### Delegated-Only Routes (User Identity for RBAC + Audit)

| Route | Capability | User Identity Usage |
|-------|------------|---------------------|
| `POST /api/project-setup-requests` | Submit request | `submittedBy = auth.claims.upn` |
| `GET /api/project-setup-requests` | List requests | Scoped by UPN (non-privileged see own only) |
| `GET /api/project-setup-requests/{id}` | Get request | Role-based access via `resolveRequestRole()` |
| `PATCH /api/project-setup-requests/{id}/state` | Advance state | `isAuthorizedTransition(role, from, to)` |
| `GET /api/estimating/trackers` | List trackers | Any authenticated user |
| `POST /api/estimating/trackers` | Create tracker | `auth.claims.upn` as creator |
| `GET /api/estimating/kickoffs` | List kickoffs | Any authenticated user |
| `POST /api/estimating/kickoffs` | Create kickoff | `auth.claims.upn` as creator |
| All `/api/projects/*` routes | Project CRUD | `auth.claims.upn` for create audit |
| `GET /api/provisioning-status/{id}` | Get status | Any authenticated user |
| `POST /api/provisioning-escalate/{id}` | Escalate | `auth.claims.upn` as escalator |
| `POST /api/provisioning-negotiate` | SignalR negotiate | Group assignment by `auth.claims.roles` |

### Admin-Gated Routes (JWT Role Claims)

| Route | Required Role | Gate |
|-------|---------------|------|
| `GET /api/provisioning-failures` | Admin / HBIntelAdmin | `auth.claims.roles` |
| `GET /api/provisioning-runs` | Admin / HBIntelAdmin | `auth.claims.roles` |
| `POST /api/provisioning-archive/{id}` | Admin / HBIntelAdmin | `auth.claims.roles` |
| `POST /api/provisioning-escalation-ack/{id}` | Admin / HBIntelAdmin | `auth.claims.roles` |
| `POST /api/provisioning-force-state/{id}` | Admin / HBIntelAdmin | `auth.claims.roles` + non-Production env |
| `POST /api/admin/trigger-timer` | Admin / HBIntelAdmin | `auth.claims.roles` + non-Production env |

### Hybrid Routes (Delegated Trigger → App-Only Execution)

| Route | Trigger Identity | Execution Identity |
|-------|------------------|-------------------|
| `POST /api/provision-project-site` | `auth.claims.upn` recorded as `triggeredBy` | Saga uses MI for all downstream ops |
| `POST /api/provisioning-retry/{id}` | Any authenticated user | Saga uses MI for all downstream ops |

### Unauthenticated / Special Routes

| Route | Auth | Notes |
|-------|------|-------|
| `GET /api/health` | None | Returns config diagnostics |
| `/api/proxy/*` | Bearer header checked (format only) | **Stub** — returns mock data. Uses `managedIdentity.acquireAppToken()` (app-only) |

## Seams Renamed in P3-04

| Old Name | New Name | Reason |
|----------|----------|--------|
| `IMsalOboService` | `IManagedIdentityTokenService` | Not OBO — app-only MI |
| `ManagedIdentityOboService` | `ManagedIdentityTokenService` | Not OBO — app-only MI |
| `MockMsalOboService` | `MockManagedIdentityTokenService` | Consistent with interface |
| `acquireTokenOnBehalfOf(userToken, scopes)` | `acquireAppToken(scopes)` | No user token involved |
| `IServiceContainer.msalObo` | `IServiceContainer.managedIdentity` | Semantic accuracy |
| Telemetry: `auth.obo.start/success/error` | `auth.mi.start/success/error` | Correct identity type |
| `msal-obo-service.ts` | `managed-identity-token-service.ts` | File name matches content |

## Deployment Permission Requirements

### Managed Identity Permissions (App-Only)

| Resource | Permission | Purpose |
|----------|------------|---------|
| SharePoint tenant | Sites.FullControl.All (app-only) | Site creation, list management, file upload |
| Microsoft Graph | Group.ReadWrite.All (app-only) | Security group creation and membership |
| Azure Table Storage | Storage Table Data Contributor | Provisioning status persistence |

### Entra ID App Registration

| Setting | Value | Purpose |
|---------|-------|---------|
| `API_AUDIENCE` | `api://<app-registration-client-id>` | Inbound JWT audience validation |
| Exposed API scopes | As needed for SPFx consent | SPFx token acquisition |

## Remaining Issues for Prompt 05

| Issue | Scope |
|-------|-------|
| CORS hardening | Lock down allowed origins for production |
| Proxy route auth | Wrap with `withAuth()` or remove stub |
| Route auth regression tests | Contract tests for all auth-protected routes |
| Dual RBAC mechanism (UPN env vars vs JWT roles) | Convergence decision |
