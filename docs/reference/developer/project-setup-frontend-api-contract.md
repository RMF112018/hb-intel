# Project Setup Frontend API Contract

> **Frozen:** Phase 7 Prompt 1 (2026-03-31)
> **Last updated:** 2026-03-31 (P8-02 apiAudience shell injection)

This document defines the authoritative frontend API contract for the Project Setup SPFx application. All production HTTP calls flow through `createProvisioningApiClient(baseUrl, getToken)` in `packages/provisioning/src/api-client.ts`.

## Client interfaces

### IProjectSetupClient (requester surface)

Defined in `apps/estimating/src/project-setup/backend/types.ts`. Used by the estimating app for the requester workflow.

| Method | Signature |
|--------|-----------|
| `listRequests` | `() => Promise<IProjectSetupRequest[]>` |
| `submitRequest` | `(data: Partial<IProjectSetupRequest>) => Promise<IProjectSetupRequest>` |
| `getProvisioningStatus` | `(projectId: string) => Promise<IProvisioningStatus \| null>` |
| `retryProvisioning` | `(projectId: string) => Promise<void>` |
| `escalateProvisioning` | `(projectId: string, escalatedBy: string) => Promise<void>` |

### IProvisioningApiClient (full surface)

Defined in `packages/provisioning/src/api-client.ts`. Used by admin and controller surfaces.

| Method | Backend Route | HTTP |
|--------|---------------|------|
| `submitRequest` | `/api/project-setup-requests` | POST |
| `listRequests` | `/api/project-setup-requests` | GET |
| `listMyRequests` | `/api/project-setup-requests?submitterId=...` | GET |
| `advanceState` | `/api/project-setup-requests/{requestId}/state` | PATCH |
| `getProvisioningStatus` | `/api/provisioning-status/{projectId}` | GET |
| `listFailedRuns` | `/api/provisioning-failures` | GET |
| `listProvisioningRuns` | `/api/provisioning-runs` | GET |
| `retryProvisioning` | `/api/provisioning-retry/{projectId}` | POST |
| `escalateProvisioning` | `/api/provisioning-escalate/{projectId}` | POST |
| `archiveFailure` | `/api/provisioning-archive/{projectId}` | POST |
| `acknowledgeEscalation` | `/api/provisioning-escalation-ack/{projectId}` | POST |
| `forceStateTransition` | `/api/provisioning-force-state/{projectId}` | POST |

## Runtime mode resolution

Resolution order (each tier overrides the next):

1. **Shell-injected config** — SPFx webpart passes `backendMode` via `mount()` config
2. **Vite build-time env** — `VITE_BACKEND_MODE` in `.env.local`
3. **App default** — `'production'`

Production mode requires:
- `functionAppUrl` (Azure Functions base URL)
- An API token provider (SPFx `aadTokenProviderFactory` or MSAL session)

If production prerequisites are unmet, the app falls back to `'ui-review'` with a diagnostic warning in the browser console.

## Auth transport

All production API calls use Bearer token authentication:

```
Authorization: Bearer <token>
```

Token acquisition paths:
1. **SPFx production** — `createSpfxTokenFactory(spfxTokenProvider)` via `aadTokenProviderFactory`, audience-scoped to `API_AUDIENCE`
2. **PWA fallback** — `createSessionTokenFactory(getSession)` from MSAL session
3. **UI-review** — `createDevTokenFactory()` returns `'dev-placeholder-token'` (no real backend calls)

## Response envelope

- Single-item endpoints: `{ data: T }`
- List endpoints: `{ items: T[], pagination? }`
- Errors: `{ error: string, reason?: string, code?: string }` with appropriate HTTP status

## Route parity — cross-surface consumers

The `IProjectSetupClient` interface (5 methods) is the **requester-surface** contract used by the estimating app. The `IProvisioningApiClient` interface (12 methods) is the **full** contract used by admin, accounting, and PWA surfaces. This is by design:

| Surface | Interface | Methods Used |
|---------|-----------|-------------|
| Estimating (requester) | `IProjectSetupClient` | `listRequests`, `submitRequest`, `getProvisioningStatus`, `retryProvisioning`, `escalateProvisioning` |
| Accounting (reviewer) | `IProvisioningApiClient` | `listRequests`, `advanceState`, `getProvisioningStatus`, `retryProvisioning` |
| Admin (controller) | `IProvisioningApiClient` | `listProvisioningRuns`, `listFailedRuns`, `archiveFailure`, `acknowledgeEscalation`, `forceStateTransition`, `retryProvisioning` |
| PWA (requester) | `IProvisioningApiClient` | `listMyRequests`, `submitRequest`, `getProvisioningStatus` |

Every client method maps 1:1 to an existing backend route. No frontend-required route lacks a backend implementation.

## `/api/users/me/*` resolution (P7-03)

The `/api/users/me/preferences` and `/api/users/me/groups` routes are **not part of the Project Setup domain contract**. They exist only in the shared complexity package (`packages/complexity/src/storage/complexityApiClient.ts`) with API sync disabled by default (`enableApiSync = false`, P6-03).

- The estimating app does **not** pass `enableApiSync={true}` to `ComplexityProvider`
- No backend handler implements `/api/users/me/preferences` or `/api/users/me/groups`
- The complexity package gracefully handles missing endpoints (returns `null` on 404, falls back to localStorage)
- This was formally resolved in Phase 6 (P6-03) and confirmed in Phase 7 (P7-03)

**Decision:** Option B — frontend callers are already migrated to the authoritative backend routes. The `/api/users/me/*` paths are unused stubs in an opt-in disabled feature. No backend implementation is required.

## Backend token validation contract (P7-04)

The backend validates inbound Entra ID JWT tokens via `withAuth()` → `validateToken()` in `backend/functions/src/middleware/`.

| Parameter | Value | Notes |
|-----------|-------|-------|
| Token versions | v1 (`1.0`) and v2 (`2.0`) accepted | SPFx issues v1; MSAL may issue v2. Both valid for the tenant. `ver` claim recorded but not enforced. |
| Issuers | `https://sts.windows.net/{TENANT_ID}/` (v1), `https://login.microsoftonline.com/{TENANT_ID}/v2.0` (v2) | V2 JWKS validates both |
| Audience | `API_AUDIENCE` env var (required in production) | Mismatch → `invalid_audience` rejection |
| Required claims | `upn` or `preferred_username`, `oid` | Missing → `missing_claims` rejection |
| Optional claims | `roles`, `name`, `jobTitle`, `ver` | Used for RBAC and diagnostics |
| RBAC model | JWT + `ADMIN_UPNS` / `CONTROLLER_UPNS` env vars | Dual-model is intentional per P6-03 |

**Audience consistency contract:** Frontend `getApiAudience()` and backend `resolveApiAudience()` must resolve to the same Entra app-registration audience URI (`api://<app-registration-client-id>`). Both are configured via environment variables injected at build/deploy time.

## SPFx API calling pattern (P7-05)

The production auth flow for the Project Setup SPFx application:

```
ShellWebPart.render()
  → mount(el, spfxContext, config)
    → bootstrapSpfxAuth(spfxContext)
    → createSpfxApiTokenProvider(spfxContext, apiAudience)
      → returns async () => tokenProvider.getToken(audience)
    → <App getApiToken={getApiToken} />
      → <ProjectSetupBackendProvider getApiToken={getApiToken}>
        → resolveTokenFactory(getApiToken, ...)
          → createSpfxTokenFactory(getApiToken) [preferred]
        → createProvisioningApiClient(functionAppUrl, tokenFactory)
          → authFetch(): Authorization: Bearer ${await getToken()}
```

Key properties:
- **Per-request token acquisition**: `getToken()` is called on every HTTP request — no cached/stale tokens
- **SPFx-managed renewal**: The SPFx AadTokenProvider handles caching and silent renewal internally
- **Audience-scoped**: Tokens are scoped to `API_AUDIENCE` — not a generic Microsoft Graph token
- **SignalR**: Uses `accessTokenFactory: getToken` for negotiate and reconnect auth

### API audience configuration chain (P8-02)

The `apiAudience` value flows through the same DefinePlugin injection pattern as other runtime constants:

1. **CI/deployment** sets `API_AUDIENCE` env var (same value for both frontend build and backend Function App)
2. **`build-spfx-package.ts`** passes `API_AUDIENCE` into `shellEnv`
3. **`gulpfile.js`** DefinePlugin injects `__API_AUDIENCE__` into the compiled shell bundle
4. **`ShellWebPart.render()`** conditionally adds `apiAudience` to the `runtimeConfig` object (only when truthy)
5. **`mount.tsx`** calls `setRuntimeConfig(config)` then `getApiAudience()`
6. **`getApiAudience()`** returns: shell-injected value → `VITE_API_AUDIENCE` env → `undefined`
7. **`createSpfxApiTokenProvider(spfxContext, apiAudience)`** creates the per-request token factory
8. **Backend `validateToken()`** validates the JWT `aud` claim against its own `API_AUDIENCE` env var

When `API_AUDIENCE` is empty at build time, the shell guard is falsy and no `apiAudience` is injected. The app falls back through `getApiAudience()` and `checkProductionReadiness()` surfaces the gap diagnostically.

### Permission requirements

The SPFx package requires the following for production:
1. **Entra app registration** with audience URI (e.g. `api://<client-id>`)
2. **SPFx API permission** approved in SharePoint admin center for the target audience
3. **`API_AUDIENCE`** env var set on the Azure Function App matching the app registration
4. **`API_AUDIENCE`** env var set at shell build time (injected via DefinePlugin as `__API_AUDIENCE__`)
5. **`FUNCTION_APP_URL`** injected into the shell webpart build or shell config

## Non-production paths

| Path | Status | Notes |
|------|--------|-------|
| `uiReviewProjectSetupClient` | Active | localStorage-backed mock for development/demo |
| `resolveSessionToken()` | **Removed P7-05** | Was deprecated P3-09; removed from estimating app. Other apps retain their own copies for dev-harness. |
| `'mock-token'` fallback | **Removed P7-05** | Was in the deprecated function; no longer in estimating codebase |
