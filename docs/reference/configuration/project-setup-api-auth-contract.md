# Project Setup API Auth Contract

## Executive Summary

This document freezes the production inbound API authentication and authorization contract for the Project Setup domain. It is the single canonical reference for how SPFx callers, app-only workloads, and the protected backend agree on audience, issuer handling, token version tolerance, claim requirements, delegated scope, workload-token exceptions, role posture, ownership fallback rules, and SharePoint admin approval dependencies.

**Key contract facts:**

- Inbound API auth uses Entra ID Bearer tokens validated by the `jose` JWKS library
- Production audience: `api://<app-registration-client-id>` (Application ID URI format, not bare GUID)
- Both v1 and v2 Entra tokens are tolerated
- Delegated callers must carry `access_as_user` scope
- App-only workloads must carry `Automation` role
- Outbound service access is NOT part of this contract (it uses app-only managed identity; see `project-setup-connected-service-posture.md`)
- Notification UPN env vars (`CONTROLLER_UPNS`, `ADMIN_UPNS`) are NOT authorization sources

**Created by:** Phase 7 Prompt-02 (P7-02), 2026-04-02
**Resolves:** Audit gaps G7-05 (managed identity vs delegated auth confusion risk) and G7-02 (SPFx permission/approval clarity)

---

## Scope of the Contract

This contract covers:

- **Inbound** authentication and authorization for the Project Setup protected API
- SPFx-to-API token acquisition and permission request posture
- SharePoint admin API access approval workflow
- Backend token validation, claims extraction, role enforcement, and ownership checks

This contract does NOT cover:

- Outbound service access (managed identity for SharePoint, Graph, Storage) — see `docs/reference/developer/project-setup-connected-service-posture.md`
- Frontend auth shell architecture — see `docs/reference/developer/auth-shell-architecture.md`
- CORS posture — covered separately in Phase 7 Prompt-03
- Environment validation tiers — covered separately in Phase 7 Prompt-03

---

## Interactive SPFx Caller Model

### Token Acquisition Flow

1. SPFx web part calls `createSpfxApiTokenProvider(context, audience)` from `packages/auth/src/spfx/apiTokenProvider.ts`
2. Provider resolves audience from shell config (`apiAudience`) or build-time env (`VITE_API_AUDIENCE`)
3. Each API call acquires a fresh token via `context.aadTokenProviderFactory.getTokenProvider().getToken(audience)`
4. SPFx framework internally caches tokens; the provider does not add its own cache layer
5. Token is sent as `Authorization: Bearer <token>` header on each API request

### Audience Resolution (Frontend)

Resolution order in `apps/estimating/src/config/runtimeConfig.ts` (`getApiAudience()`):

1. Runtime injection via mount config (`_config.apiAudience`) — highest priority
2. Vite build-time env (`VITE_API_AUDIENCE`) — fallback
3. `undefined` — if neither source provides a value, token acquisition is skipped

The resolved audience value MUST match the backend `API_AUDIENCE` env var exactly. Both must resolve to the same Application ID URI (`api://<app-registration-client-id>`).

---

## Required SPFx Permission Requests

### Estimating App (`apps/estimating/config/package-solution.json`)

```json
{
  "webApiPermissionRequests": [
    {
      "resource": "hb-intel-api-production",
      "scope": "access_as_user"
    }
  ]
}
```

- **Resource:** `hb-intel-api-production` (friendly name of the app registration in Entra ID)
- **Scope:** `access_as_user` (delegated scope exposed by the app registration)
- **Status:** Declared and active

### Accounting App (`apps/accounting/config/package-solution.json`)

- **webApiPermissionRequests:** None declared
- **Status:** The Accounting app does not currently call the Project Setup protected API
- **Decision:** No permission request is required unless a future Accounting surface needs to call the protected API directly. If that need arises, a `webApiPermissionRequests` entry identical to the Estimating app's must be added

---

## SharePoint Admin API Access Approval Model

### Approval Workflow

1. When the SPFx solution is deployed to the SharePoint app catalog, the `webApiPermissionRequests` entries are registered as pending API access requests
2. A SharePoint admin (or Global admin) must navigate to the SharePoint admin center > API access page
3. The admin reviews and approves the pending request for `hb-intel-api-production` / `access_as_user`
4. Once approved, the permission applies tenant-wide for all SPFx solutions requesting that resource/scope combination
5. After approval, SPFx web parts can acquire delegated tokens for the protected API

### Critical Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| App registration `hb-intel-api-production` exists in Entra ID | Tenant prerequisite | Must be verified before deployment |
| App registration exposes `access_as_user` scope | Tenant prerequisite | Must be configured in app registration manifest |
| `accessTokenAcceptedVersion` is null or 1 in app registration | Tenant prerequisite | Required for `api://` audience format |
| SharePoint admin approves API access request | Admin action | Required after each new SPFx solution deployment |
| SPFx solution deployed to tenant app catalog | Deployment step | Required before admin can see the approval request |

### Revoking Access

- Revoking the API access approval in the SharePoint admin center affects ALL SPFx solutions using that permission
- Revocation should be treated as a breaking change for all Project Setup SPFx surfaces

---

## Backend Audience / Issuer / Token Version Contract

### Audience

| Property | Value |
|----------|-------|
| **Production audience** | `api://<app-registration-client-id>` |
| **Env var** | `API_AUDIENCE` (required in production) |
| **Format** | Application ID URI, NOT bare client ID GUID |
| **Reason** | Entra issues tokens with `aud` matching the Application ID URI when `accessTokenAcceptedVersion` is null/1 (the default). If the app registration were changed to v2 tokens, Entra would issue bare GUID audience, causing validation to fail intentionally |
| **Test/mock fallback** | `api://${AZURE_CLIENT_ID}` |
| **Validation library** | `jose` — `jwtVerify()` with `audience` constraint |

### Accepted Issuers

| Issuer Format | Token Version | Value |
|--------------|--------------|-------|
| v1 (STS) | 1.0 | `https://sts.windows.net/{AZURE_TENANT_ID}/` |
| v2 (login.microsoftonline.com) | 2.0 | `https://login.microsoftonline.com/{AZURE_TENANT_ID}/v2.0` |

Both issuer forms are accepted because Entra ID may issue either format depending on the token version requested by the client.

### Token Version Tolerance

| Property | Value |
|----------|-------|
| **v1 tokens** | Accepted |
| **v2 tokens** | Accepted |
| **Detection** | `ver` claim in JWT payload (`'1.0'` or `'2.0'`) |
| **Reason** | SPFx may acquire v1 or v2 tokens depending on the app registration's `accessTokenAcceptedVersion` and the tenant's Entra configuration. Both are tolerated to avoid brittle coupling to a specific token version |

### JWKS Source

| Property | Value |
|----------|-------|
| **Endpoint** | `https://login.microsoftonline.com/{AZURE_TENANT_ID}/discovery/v2.0/keys` |
| **Resolution** | Lazy — deferred to first `validateToken()` call, not startup |
| **Reason** | Allows health endpoint to respond even if identity config is missing |

### Required Environment Variables

| Variable | Required In | Description |
|----------|------------|-------------|
| `AZURE_TENANT_ID` | Production | Entra ID tenant GUID for issuer and JWKS construction |
| `API_AUDIENCE` | Production | Application ID URI for audience validation |

---

## Required Claims and Roles

### Always Required (All Token Types)

| Claim | Purpose |
|-------|---------|
| `oid` | Object ID — stable identity for delegated users and app-only service principals |

### Required for Delegated Tokens Only

| Claim | Purpose |
|-------|---------|
| `upn` or `preferred_username` | User Principal Name — display identity, ownership fallback |

### Optional Claims

| Claim | Purpose |
|-------|---------|
| `roles` | App roles (Admin, Controller, BreakGlass, Automation) |
| `scp` | Delegated scope (space-delimited, e.g., `access_as_user`) |
| `idtyp` | Token type indicator (`app` for app-only) |
| `name` | Display name (fallback to UPN for `displayName`) |
| `jobTitle` | Optional claim from app registration custom claims |
| `ver` | Token version (`1.0` or `2.0`) |

### App Role Posture

| Role | Values | Purpose |
|------|--------|---------|
| Admin | `Admin`, `HBIntelAdmin` | Full administrative access |
| Controller | `Controller`, `HBIntelController` | Controller-level access |
| Break Glass | `BreakGlass` | Emergency override with dedicated audit telemetry |
| Automation | `Automation` | App-only workload authorization |
| Privileged | Union of Admin + Controller | Convenience grouping for policy checks |

Dual role names per role exist for tenant-specific naming flexibility.

---

## Delegated Scope Rules

| Rule | Detail |
|------|--------|
| **Required scope** | `access_as_user` |
| **Enforcement** | `requireDelegatedScope()` checks `scp` claim for `access_as_user` |
| **App-only bypass** | App-only tokens (`isAppOnlyToken() === true`) bypass the delegated scope check entirely |
| **Missing scope response** | `403 Forbidden` with message `Missing required scope: access_as_user` |
| **Scope source** | Declared in SPFx `package-solution.json` `webApiPermissionRequests` |
| **Claim format** | Space-delimited string in JWT `scp` claim |

---

## App-Only Workload Rules

| Rule | Detail |
|------|--------|
| **Detection (primary)** | `claims.idtyp === 'app'` |
| **Detection (fallback)** | Absence of both `scp` and `upn` |
| **Required role** | `Automation` (via `requireWorkloadRole()`) |
| **Delegated scope** | Not checked (app-only tokens do not carry `scp`) |
| **Missing token type response** | `403 Forbidden` with message `Workload authorization requires an app-only token` |
| **Missing role response** | `403 Forbidden` with message `Automation role required` |
| **Use case** | Automated processes, CI/CD pipelines, service-to-service calls |

---

## Ownership Fallback Rules

| Rule | Detail |
|------|--------|
| **Primary method** | OID-based: `resource.submittedByOid === claims.oid` |
| **Fallback method** | UPN-based: `resource.submittedBy.toLowerCase() === claims.upn.toLowerCase()` (case-insensitive) |
| **Fallback scope** | Pre-migration records only (records that lack `submittedByOid`) |
| **No match** | Returns `{ isOwner: false, method: 'none' }` |
| **Audit trail** | `method` field (`oid`, `upn`, `none`) is included in authorization telemetry |
| **Production contract** | Ownership fallback remains part of the production contract for backward compatibility with pre-migration data. New records MUST include `submittedByOid`. The UPN fallback should be treated as a transitional mechanism |

---

## Explicit Non-Sources of Authorization

The following are NOT used for authorization decisions. Misusing them would create a security gap.

| Item | Actual Purpose |
|------|---------------|
| `CONTROLLER_UPNS` env var | Notification email targeting ONLY |
| `ADMIN_UPNS` env var | Notification email targeting ONLY |
| `SHAREPOINT_TENANT_URL` | SharePoint service configuration, not auth |
| Outbound managed identity tokens | Backend-to-service access, not inbound auth |

Authorization is exclusively claims-based via JWT `roles` and `scp` claims. No env var can grant or deny access to the protected API.

---

## Validation and Telemetry Expectations

### Token Validation Error Responses

| Scenario | Status | Reason Code | Body |
|----------|--------|------------|------|
| Missing or malformed `Authorization` header | 401 | `missing_header` / `malformed_header` | `{ error: "Unauthorized", reason }` |
| Expired token | 401 | `expired` | `{ error: "Unauthorized", reason: "expired" }` |
| Wrong issuer | 401 | `invalid_issuer` | `{ error: "Unauthorized", reason: "invalid_issuer" }` |
| Wrong audience | 401 | `invalid_audience` | `{ error: "Unauthorized", reason: "invalid_audience" }` |
| Missing required claims | 401 | `missing_claims` | `{ error: "Unauthorized", reason: "missing_claims" }` |
| Generic validation failure | 401 | `validation_failed` | `{ error: "Unauthorized", reason: "validation_failed" }` |
| Identity config missing in production | 401 | `config_error` | `{ error: "Unauthorized", reason: "config_error" }` |

### Authorization Error Responses

| Scenario | Status | Message |
|----------|--------|---------|
| Missing required role | 403 | `Required role: <role>` |
| Missing required scope | 403 | `Missing required scope: access_as_user` |
| Workload token type mismatch | 403 | `Workload authorization requires an app-only token` |
| Workload missing Automation role | 403 | `Automation role required` |

### Telemetry Events

| Event Name | Trigger | Payload |
|-----------|---------|---------|
| `auth.bearer.success` | Token validated successfully | `{ correlationId, durationMs }` |
| `auth.bearer.error` | Token extraction or validation failed | `{ correlationId, reason, durationMs }` |
| `authz.decision` | Authorization policy evaluated (non-break-glass) | `{ action, outcome, role, method, correlationId, callerOid, callerUpn }` |
| `authz.break_glass` | Break-glass role used | Same as `authz.decision` with `isBreakGlass: true` |

---

## Known External Dependencies

| Dependency | Type | Owner | Status |
|-----------|------|-------|--------|
| App registration `hb-intel-api-production` in Entra ID | Tenant prerequisite | IT / Identity team | Must exist before SPFx deployment |
| `accessTokenAcceptedVersion` set to null or 1 | App registration config | IT / Identity team | Required for `api://` audience format |
| `access_as_user` scope exposed in app registration | App registration config | IT / Identity team | Required for delegated access |
| App roles configured in app registration manifest | App registration config | IT / Identity team | Required for role-based authorization |
| SharePoint admin API access approval | Admin action | SharePoint admin | Required after SPFx deployment to app catalog |
| Entra ID JWKS endpoint available | Platform dependency | Microsoft | Always available (public endpoint) |

---

## Files and Docs This Contract Depends On

### Implementation Files

| File | Role |
|------|------|
| `backend/functions/src/middleware/validateToken.ts` | JWT validation, audience/issuer enforcement, claims extraction |
| `backend/functions/src/middleware/auth.ts` | Bearer extraction, `withAuth()` middleware wrapper, telemetry |
| `backend/functions/src/middleware/authorization.ts` | Role/scope enforcement, ownership checks, workload authorization |
| `packages/auth/src/spfx/apiTokenProvider.ts` | SPFx token acquisition provider |
| `apps/estimating/src/config/runtimeConfig.ts` | `getApiAudience()` resolution |
| `apps/estimating/src/mount.tsx` | Token provider wiring |
| `apps/estimating/config/package-solution.json` | SPFx `webApiPermissionRequests` declaration |
| `apps/accounting/config/package-solution.json` | Confirms no API permission requests |

### Reference Documents

| Document | Role |
|----------|------|
| `docs/reference/developer/project-setup-connected-service-posture.md` | Outbound service identity model (complements this inbound contract) |
| `docs/reference/configuration/sites-selected-validation.md` | SharePoint permission governance |
| `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md` | Phase 7 audit baseline |
