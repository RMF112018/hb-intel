# P10-03 — Accounting Auth Model and Audience Contract Freeze

> **Created:** 2026-04-02  
> **Phase:** 10 — Accounting SPFx Production Gap Closure  
> **Status:** Complete

## Objective

Define and freeze the authoritative production auth model for the Accounting SPFx surface so that frontend token acquisition, backend token validation, runtime config, and deployment docs all point to the same supported contract.

## Chosen Auth Model

**Decision: Accounting aligns with the Project Setup SPFx audience-scoped token model.**

Both surfaces share the same backend (`backend/functions/src/hosts/project-setup/`), the same API endpoints, and the same token validation middleware. There is no reason for Accounting to use a different auth model.

## Audience Contract

### Frontend token acquisition (SPFx production mode)

| Step | Implementation | File |
|------|----------------|------|
| Shell injects `apiAudience` | DefinePlugin constant `__API_AUDIENCE__` → `runtimeConfig.apiAudience` | `tools/spfx-shell/gulpfile.js:32` |
| mount stores config | `setRuntimeConfig(config)` | `apps/accounting/src/mount.tsx:43` |
| mount resolves audience | `getApiAudience()` → runtime config → `VITE_API_AUDIENCE` → `undefined` | `apps/accounting/src/config/runtimeConfig.ts:154-170` |
| mount creates token provider | `createSpfxApiTokenProvider(spfxContext, apiAudience)` | `apps/accounting/src/mount.tsx:61` |
| Token provider acquires tokens | `aadTokenProviderFactory.getToken(audience)` — fresh token per call | `packages/auth/src/spfx/apiTokenProvider.ts:30-40` |

### Backend token validation

| Step | Implementation | File |
|------|----------------|------|
| Middleware extracts Bearer token | `withAuth()` wrapper | `backend/functions/src/middleware/auth.ts:25-37` |
| Middleware validates JWT | JWKS discovery, issuer check, audience check | `backend/functions/src/middleware/validateToken.ts:242-265` |
| Audience resolution | `API_AUDIENCE` env var (required, no fallback in production) | `backend/functions/src/middleware/validateToken.ts:93-113` |
| Scope enforcement | `access_as_user` delegated scope required | `backend/functions/src/middleware/authorization.ts:28` |

### Audience alignment rule

```
Frontend: apiAudience (from shell config or VITE_API_AUDIENCE)
Backend:  API_AUDIENCE env var
Both must resolve to the same app registration audience URI (api://<client-id>).
```

### Configuration injection points

| Environment | Frontend audience source | Backend audience source |
|-------------|------------------------|----------------------|
| SPFx production | Shell DefinePlugin `API_AUDIENCE` → `runtimeConfig.apiAudience` | Azure Function App `API_AUDIENCE` env var |
| SPFx staging | Shell DefinePlugin (override via `SPFX_API_RESOURCE`) | Azure Function App `API_AUDIENCE` env var |
| Vite dev | `VITE_API_AUDIENCE` in `.env.local` | Local Functions host `API_AUDIENCE` |

### Missing or stale audience behavior

| Scenario | Frontend behavior | Backend behavior |
|----------|-------------------|-----------------|
| `apiAudience` absent | `getApiAudience()` returns `undefined`; token provider not created; `checkProductionReadiness()` reports issue | N/A — no request reaches backend |
| `API_AUDIENCE` absent | N/A — frontend is independent | `resolveApiAudience()` throws `TokenValidationError` at startup |
| Audience mismatch | Token acquired for wrong resource | `validateToken()` rejects — audience claim doesn't match |

## Token Path Classification

### Production path (SPFx)
- `createSpfxApiTokenProvider(spfxContext, apiAudience)` — audience-scoped, fresh token per call, SPFx handles caching and renewal
- Created in `mount.tsx`, will be propagated to backend provider in Prompt-05

### Transitional path (dev/fallback)
- `createSessionTokenFactory(sessionRef)` — extracts token from auth session's `rawContext.payload`
- Used by page components (`ProjectReviewQueuePage`, `ProjectReviewDetailPage`) for direct API client creation
- Will be replaced by centralized backend context provider in Prompt-05
- Marked transitional in `resolveSessionToken.ts` JSDoc

### Dev-only path
- `bootstrapMockEnvironment()` — seeds auth stores with persona-based mock data
- No token acquisition — mock adapter bypasses API calls

## Implementation Changes

### 1. Added runtime config tests (`apps/accounting/src/test/runtimeConfig.test.ts`)

18 tests covering:
- `setRuntimeConfig()` — storage, trailing slash normalization, empty value handling
- `getBackendMode()` — default, injection, invalid value rejection
- `getAllowBackendModeSwitch()` — default, boolean, string normalization
- `getFunctionAppUrl()` — injection, ConfigError on missing, ui-review empty return
- `getApiAudience()` — undefined default, injection
- `checkProductionReadiness()` — missing URL + token, URL-only, fully ready
- `_resetConfig()` — state clearing

### 2. Marked session token factory as transitional (`apps/accounting/src/utils/resolveSessionToken.ts`)

Updated JSDoc to explicitly document:
- SPFx production preference for `createSpfxApiTokenProvider()`
- Session-based factory as dev/fallback path
- Prompt-05 backend provider as replacement target

### 3. No code changes to page components

Page-level API client creation (`createSessionTokenFactory` + `import.meta.env.VITE_FUNCTION_APP_URL`) is unchanged. This is intentional — the centralized backend provider (Prompt-05) will replace per-page client creation with a context-driven approach that selects the correct token path based on runtime mode.

## Verification

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/spfx-accounting lint` | 0 errors, 5 warnings (2 pre-existing `any` in mount.tsx, 2 intentional `as any` in tests, 1 unused `getApiToken` pending Prompt-05) |
| `pnpm --filter @hbc/spfx-accounting build` | Passed — 1,027 KB IIFE bundle |
| `pnpm --filter @hbc/spfx-accounting test` | 55 tests passed across 6 test files (+18 new runtimeConfig tests) |

## Remaining Work

| Item | Owner Prompt |
|------|-------------|
| Add `webApiPermissionRequests` to package-solution.json | Prompt-04 |
| Backend context provider consuming `getApiToken` + replacing per-page API client creation | Prompt-05 |
| SharePoint admin API permission approval | External prerequisite (post Prompt-04) |
