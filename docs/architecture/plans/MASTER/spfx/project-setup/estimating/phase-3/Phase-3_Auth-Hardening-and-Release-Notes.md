# Phase 3 — Auth Hardening and Release Notes

> Created: 2026-03-30
> Prompt: P3-05 Backend Auth Hardening, CORS, Permissions, and Tests
> Companion to: `Phase-3_Auth-Baseline-Matrix.md`, `Phase-3_API-Token-Contract.md`, `Phase-3_Capability-Boundary-Matrix.md`

## Purpose

Documents the auth hardening changes made in P3-05, CORS posture, permission prerequisites for deployment, and the regression tests added to protect the Phase 3 auth contract.

## Route Protection Changes

### Proxy Routes — Now Protected

The `/api/proxy/*` routes were the only HTTP routes not wrapped with `withAuth()`. In P3-05, they are now wrapped with `withAuth()` for full JWT validation. The custom Bearer header format check in `handleProxyRequest()` has been removed since `withAuth()` handles it.

**Before (P3-04):**
```
app.http('proxyGet', {
  authLevel: 'anonymous',
  handler: async (request, context) => { ... }  // Custom auth check inside handler
});
```

**After (P3-05):**
```
app.http('proxyGet', {
  authLevel: 'anonymous',
  handler: withAuth(async (request, context) => { ... })  // JWT validated by middleware
});
```

### Auth Enforcement Summary

| Route Category | Auth | Count |
|---------------|------|-------|
| Project Setup requests | `withAuth()` | 4 routes |
| Estimating (trackers, kickoffs) | `withAuth()` | 7 routes |
| Projects CRUD | `withAuth()` + `withTelemetry()` | 6 routes |
| Provisioning saga | `withAuth()` + `withTelemetry()` | 10 routes |
| SignalR negotiate | `withAuth()` + `withTelemetry()` | 1 route |
| Proxy (Graph passthrough stub) | `withAuth()` | 2 routes |
| Health probe | **None** (intentional) | 1 route |
| Timer triggers | N/A (not HTTP) | 2 functions |

**All HTTP routes now use `withAuth()` except the health probe (intentional exception).**

## CORS Posture

### Current State

The backend does **not** configure CORS in application code or `host.json`. CORS is managed at the Azure Functions runtime / Azure App Service level.

### Recommended Production Configuration

CORS should be configured in the Azure Portal or via Infrastructure-as-Code (Terraform / Bicep) on the Function App resource:

| Setting | Recommended Value | Reason |
|---------|-------------------|--------|
| Allowed Origins | `https://{sharepoint-tenant}.sharepoint.com` | SPFx webpart origin |
| | `https://localhost:4002` (dev only) | Vite dev server |
| Allowed Methods | `GET, POST, PATCH, PUT, DELETE, OPTIONS` | All API methods |
| Allowed Headers | `Authorization, Content-Type, X-Request-ID` | Auth + content + correlation |
| Credentials | `true` | Bearer token in Authorization header |

**This is a deployment-time configuration, not a code change.** The Function App CORS settings must be configured before the SPFx webpart can make cross-origin API calls.

## Permission Prerequisites

### Entra ID App Registration

| Setting | Value | Purpose |
|---------|-------|---------|
| Application ID URI | `api://<client-id>` | Must match `API_AUDIENCE` env var |
| Exposed API scopes | `user_impersonation` (or custom) | SPFx token acquisition |
| `accessTokenAcceptedVersion` | `null` or `2` | Backend accepts both v1 and v2 |

### SharePoint Admin Center

| Approval | Purpose |
|----------|---------|
| API access request for the SPFx app | Allows SPFx to acquire tokens for `api://<client-id>` |

### Azure RBAC (Managed Identity)

| Resource | Role | Purpose |
|----------|------|---------|
| Storage Account | Storage Table Data Contributor | Table Storage for provisioning status |
| SharePoint tenant | Sites.FullControl.All (app-only) | Site creation and management |
| Microsoft Graph | Group.ReadWrite.All (app-only) | Security group management |

### Environment Variables (Required in Production)

| Variable | Source | Purpose |
|----------|--------|---------|
| `AZURE_TENANT_ID` | Entra ID | Issuer validation |
| `AZURE_CLIENT_ID` | Managed Identity | DefaultAzureCredential |
| `API_AUDIENCE` | App registration | JWT audience validation |
| `AZURE_TABLE_ENDPOINT` | Storage Account | Table Storage |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | App Insights | Telemetry |
| `HBC_ADAPTER_MODE` | Deployment config | `proxy` for production |
| `SHAREPOINT_TENANT_URL` | SharePoint | Tenant URL |
| `SHAREPOINT_PROJECTS_SITE_URL` | SharePoint | Projects list site |

## Tests and Release Checks Added

### Auth Contract Test (`auth-contract.test.ts`)

Scans all route registration files to verify:
- All HTTP route modules use `withAuth()` or are in the documented exception list
- Proxy routes are now protected
- Health endpoint remains intentionally unprotected
- Regression protection: adding a new route without `withAuth()` will fail this test

### Auth Release-Readiness Test (`auth-release-readiness.test.ts`)

Verifies configuration registry invariants:
- `API_AUDIENCE` is required in production
- `AZURE_TENANT_ID` and `AZURE_CLIENT_ID` are required in production
- All 8 production-required settings are present and pinned
- Auth-critical settings are in the infrastructure governance bucket

### Existing Tests (from prior prompts)

- `validateToken.test.ts` — 18 tests covering v1/v2 tokens, structured errors, audience config
- `auth.test.ts` — 12 tests covering middleware behavior, telemetry, structured reason codes
- `boot-behavior.test.ts` — 8+ tests covering startup validation with API_AUDIENCE
- `wave0-env-registry.test.ts` — 16 tests covering config registry contract

## Known Deployment-Time Dependencies

These cannot be solved in code and must be completed before production deployment:

1. **Azure Portal CORS configuration** — must be set on the Function App
2. **SharePoint admin center API approval** — must approve the SPFx app's API permission request
3. **Entra ID app registration** — must have exposed API with correct audience URI
4. **Managed Identity role assignments** — must be granted on storage account, SharePoint, and Graph
5. **Environment variable population** — all 8 required settings must be configured

## Remaining Items for Prompt 06

| Item | Scope |
|------|-------|
| Final verification pass | Run full test suite, confirm all prompts complete |
| Handoff notes | Document known follow-on items for Phase 4+ |
| Unresolved dual RBAC | UPN env vars vs JWT roles — convergence is Phase 4+ scope |
