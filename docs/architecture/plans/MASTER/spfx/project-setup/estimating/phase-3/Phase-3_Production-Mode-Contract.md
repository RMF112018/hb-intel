# Phase 3 — Production Mode and Token Acquisition Contract

> Created: 2026-03-30
> Prompt: P3-02 Production Mode and SPFx Token Acquisition
> Companion to: `Phase-3_Auth-Baseline-Matrix.md`, `Phase-3_Auth-Gap-Summary.md`

## Purpose

Documents the production-mode activation rules, token-acquisition behavior, and runtime configuration requirements implemented in P3-02.

## Production-Mode Activation Rules

Production mode is no longer latent or assumed. It activates only when all prerequisites are met:

| Prerequisite | Check | Diagnostic |
|-------------|-------|------------|
| Function App URL configured | `getFunctionAppUrl()` returns a non-empty string | `ConfigError` with actionable message if missing |
| API token provider available | `getApiToken` prop is not `undefined` | Production readiness reports "API token provider is not available" |

When production mode is requested but prerequisites are not met:
1. The backend context provider falls back to `ui-review` mode automatically.
2. A **warning banner** is displayed: "Production mode is not available. [issues]. Falling back to UI Review mode with local sample data."
3. The `productionBlocked` flag is exposed on the context for programmatic detection.

## Token Acquisition Behavior

### SPFx Path (Preferred Production Path)

```
mount.tsx
  → getApiAudience() resolves audience from config/env
  → createSpfxApiTokenProvider(spfxContext, audience)
  → getApiToken factory passed to App → ProjectSetupBackendProvider
  → Each API call invokes getApiToken() → fresh token via aadTokenProviderFactory
```

- Token is **audience-scoped** to the Project Setup API (`api://<client-id>`).
- Token is **acquired fresh** on each API call; SPFx handles caching and silent renewal internally.
- No `'mock-token'` fallback exists in this path.

### PWA/MSAL Fallback Path

When no SPFx context is available (Vite dev with MSAL):
- `createSessionTokenFactory()` extracts the access token from the auth store's `session.rawContext.payload.accessToken` on each call.
- Throws with a diagnostic error if no valid token is found (no silent `'mock-token'` fallback).

### Non-Production Path

When `backendMode === 'ui-review'` or dev mode:
- `createDevTokenFactory()` returns `'dev-placeholder-token'`.
- No real API calls are made; the localStorage-backed UI review client is used.

## Runtime Configuration Requirements

### SPFx Shell Mount Config

| Property | Type | Required for Production | Description |
|----------|------|------------------------|-------------|
| `functionAppUrl` | `string` | Yes | Azure Function App base URL |
| `backendMode` | `'production' \| 'ui-review'` | No (defaults to `'production'`) | Runtime backend mode |
| `allowBackendModeSwitch` | `boolean` | No (defaults to `false`) | Enable mode switcher in UI |
| `apiAudience` | `string` | Yes (for SPFx token acquisition) | API audience URI (e.g., `api://<client-id>`) |

### Vite Environment Variables

| Variable | Required for Production | Description |
|----------|------------------------|-------------|
| `VITE_FUNCTION_APP_URL` | Yes | Function App base URL |
| `VITE_BACKEND_MODE` | No | Override backend mode |
| `VITE_ALLOW_BACKEND_MODE_SWITCH` | No | Enable mode switcher |
| `VITE_API_AUDIENCE` | Yes (for local dev with API) | API audience URI |

## Compatibility Notes

### Deprecated: `resolveSessionToken()`

The original `resolveSessionToken()` function is retained but marked `@deprecated`. It captures the token once at call time and never refreshes — unsafe for production. It will be removed after Prompt 03 completes validator alignment.

### Remaining Phase 3 Issues

The following frontend/backend auth issues must be addressed in later prompts:

| Issue | Prompt |
|-------|--------|
| Backend validator uses v1 issuer but v2 JWKS | Prompt 03 |
| Audience fallback conflates MI and app reg client IDs | Prompt 03 |
| No token version assertion in validator | Prompt 03 |
| Delegated vs app-only boundary enforcement | Prompt 04 |
| OBO abstraction rename | Prompt 04 |
| CORS hardening | Prompt 05 |
| Route auth regression tests | Prompt 05 |

## Key Files

| File | Role |
|------|------|
| `packages/auth/src/spfx/apiTokenProvider.ts` | SPFx API token provider factory |
| `apps/estimating/src/config/runtimeConfig.ts` | Production readiness checks, API audience resolution |
| `apps/estimating/src/utils/resolveSessionToken.ts` | Token factory functions (SPFx, session, dev) |
| `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx` | Token factory wiring, readiness gate, fallback logic |
| `apps/estimating/src/mount.tsx` | SPFx token provider creation and injection |
| `apps/estimating/src/router/root-route.tsx` | Production-blocked warning banner |
