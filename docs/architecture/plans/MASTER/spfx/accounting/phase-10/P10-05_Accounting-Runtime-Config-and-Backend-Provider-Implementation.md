# P10-05 — Accounting Runtime Config and Backend Provider Implementation

> **Created:** 2026-04-02  
> **Phase:** 10 — Accounting SPFx Production Gap Closure  
> **Status:** Complete

## Objective

Implement a centralized backend context provider for the Accounting surface so that API client lifecycle, token factory resolution, and production readiness awareness are managed through an explicit boundary instead of per-page inline construction.

## Prior State

Pages (`ProjectReviewQueuePage`, `ProjectReviewDetailPage`) each independently created:
- A session-based token factory via `createSessionTokenFactory(sessionRef)`
- An API client via `createProvisioningApiClient(import.meta.env.VITE_FUNCTION_APP_URL ?? '', getToken)`

This meant:
- No centralized token resolution — SPFx token provider from mount.tsx was accepted but never consumed
- No production readiness awareness — missing config silently produced empty-string URLs
- Duplicated client construction logic across pages

## Implementation

### 1. Created `apps/accounting/src/backend/AccountingBackendContext.tsx`

Simplified from the Project Setup pattern — no backend mode switching or ui-review mock client, since Accounting is a reviewer-only surface.

**Context value:**

| Property | Type | Purpose |
|----------|------|---------|
| `client` | `IProvisioningApiClient` | Provisioning API client for all page consumption |
| `getToken` | `() => Promise<string>` | Active token factory |
| `productionReadiness` | `IProductionModeReadiness` | `{ ready, issues[] }` for diagnostic surfaces |

**Token resolution priority:**

| Priority | Source | When |
|----------|--------|------|
| 1 | `getApiToken` prop (SPFx `createSpfxApiTokenProvider`) | SPFx production deployment |
| 2 | `createSessionTokenFactory(sessionRef)` | Dev mode with auth session |
| 3 | Error-throwing placeholder | Pre-auth (session not yet established) |

**Function App URL resolution:**
- Calls `getFunctionAppUrl()` from `runtimeConfig.ts`
- Catches `ConfigError` and falls back to `''` in dev/test mode
- In SPFx production, the URL is resolved from shell-injected config

### 2. Updated `apps/accounting/src/App.tsx`

Wrapped the router in `<AccountingBackendProvider getApiToken={getApiToken}>`, passing the SPFx token provider from mount through to the context.

### 3. Updated page components

Both `ProjectReviewQueuePage` and `ProjectReviewDetailPage`:
- Removed inline `createSessionTokenFactory` + `createProvisioningApiClient` construction
- Removed `import.meta.env.VITE_FUNCTION_APP_URL` hardcoding
- Now use `const { client } = useAccountingBackend()` from context

### 4. Updated `apps/accounting/src/test/renderWithProviders.tsx`

Added `<AccountingBackendProvider>` to the test wrapper so all test renders have access to the context. In tests, `createProvisioningApiClient` is mocked at module level — the provider calls it with the mocked factory, so existing test assertions work unchanged.

## Architecture After This Change

```
mount.tsx
  → setRuntimeConfig(config)
  → createSpfxApiTokenProvider(spfxContext, apiAudience) → getApiToken
  → <App getApiToken={getApiToken}>
      → <AccountingBackendProvider getApiToken={getApiToken}>
          → resolves token factory (SPFx → session → placeholder)
          → resolves functionAppUrl (runtimeConfig → env → fallback)
          → creates client via createProvisioningApiClient(url, getToken)
          → exposes { client, getToken, productionReadiness } via context
            → <ProjectReviewQueuePage>  ← useAccountingBackend().client
            → <ProjectReviewDetailPage> ← useAccountingBackend().client
```

## Verification

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/spfx-accounting lint` | 0 errors, 4 warnings (down from 5 — `getApiToken` unused warning resolved) |
| `pnpm --filter @hbc/spfx-accounting build` | Passed — 1,029 KB IIFE bundle |
| `pnpm --filter @hbc/spfx-accounting test` | 55 tests passed across 6 test files |

## Files Changed

| File | Action |
|------|--------|
| `apps/accounting/src/backend/AccountingBackendContext.tsx` | Created — centralized backend provider |
| `apps/accounting/src/App.tsx` | Updated — wrapped router with `AccountingBackendProvider` |
| `apps/accounting/src/pages/ProjectReviewQueuePage.tsx` | Updated — uses `useAccountingBackend()` instead of inline client |
| `apps/accounting/src/pages/ProjectReviewDetailPage.tsx` | Updated — uses `useAccountingBackend()` instead of inline client |
| `apps/accounting/src/test/renderWithProviders.tsx` | Updated — includes `AccountingBackendProvider` in test wrapper |
