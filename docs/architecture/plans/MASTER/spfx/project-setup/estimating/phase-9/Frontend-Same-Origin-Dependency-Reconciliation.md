# Frontend Same-Origin Dependency Reconciliation

**Date:** 2026-04-01
**Scope:** `/api/users/me/preferences` and `/api/users/me/groups` in the Project Setup IIFE bundle

## Prior State

The shipped Project Setup IIFE bundle (`estimating-app-f72eb6c7.js`) contained string references to two same-origin endpoints:
- `/api/users/me/preferences` (GET/PATCH)
- `/api/users/me/groups` (GET)

These came from `@hbc/complexity`'s `complexityApiClient.ts`, which was **statically imported** by `ComplexityProvider.tsx` regardless of whether API sync was enabled. The API calls themselves were gated by `enableApiSync` (defaults to `false`) so they were never executed at runtime, but the endpoint strings were bundled as dead code.

## Exact Dependency Chain (Before)

```
apps/estimating/src/App.tsx
  → imports ComplexityProvider from @hbc/complexity
    → packages/complexity/src/context/ComplexityProvider.tsx (line 14-18)
      → STATIC import { fetchPreference, patchPreference, deriveInitialTierFromADGroups }
        from '../storage/complexityApiClient'
          → complexityApiClient.ts:5: const PREFERENCES_ENDPOINT = '/api/users/me/preferences'
          → complexityApiClient.ts:6: const AD_GROUPS_ENDPOINT = '/api/users/me/groups'
```

The static import chain meant the API client module was always bundled, even though:
- `enableApiSync` defaults to `false`
- The estimating app's `App.tsx` does NOT pass `enableApiSync={true}`
- No backend handler implements these endpoints in the Project Setup domain

## Classification

| Endpoint | Classification | Rationale |
|----------|---------------|-----------|
| `/api/users/me/preferences` | Shared-platform dependency that Project Setup should not inherit | Only used when `enableApiSync=true`; no backend handler exists; cookie-based auth incompatible with SPFx token model |
| `/api/users/me/groups` | Shared-platform dependency that Project Setup should not inherit | Only called for new-user tier derivation when `enableApiSync=true`; SPFx uses `SpfxRbacAdapter` for group resolution instead |

## Final Disposition: Path B — Isolate via Dynamic Import

### Change Made

Converted the **static import** of `complexityApiClient` in `ComplexityProvider.tsx` to a **dynamic import** (`import()`) inside the gated code paths. The API client module is now only loaded when `enableApiSync=true`.

### Dependency Chain (After)

```
apps/estimating/src/App.tsx
  → imports ComplexityProvider from @hbc/complexity
    → packages/complexity/src/context/ComplexityProvider.tsx
      → DYNAMIC import('../storage/complexityApiClient') — only inside:
        1. useEffect when enableApiSync=true (line 77)
        2. setTier callback when enableApiSync=true (line 184)
        3. setShowCoaching callback when enableApiSync=true (line 191)
```

### Bundle Verification

| Metric | Before | After |
|--------|--------|-------|
| `/api/users/me/preferences` occurrences in bundle | 1 | 1 |
| `/api/users/me/groups` occurrences in bundle | 1 | 1 |
| Runtime reachability when `enableApiSync=false` | Unreachable | Unreachable |
| Static import chain from ComplexityProvider | Yes | **No** |

**Why strings remain:** The Vite build uses `inlineDynamicImports: true` for the IIFE single-file format required by SPFx. All dynamic imports are resolved and inlined at build time — Rollup cannot tree-shake them because it must include all possible code paths in the single output file.

### Accepted Trade-off

The endpoint strings remain in the bundle as an artifact of the IIFE single-bundle format. This is accepted because:
1. The strings are unreachable at runtime (triple-gated: `enableApiSync=false`, no prop passed, no backend handler)
2. The static import chain has been broken — `ComplexityProvider` no longer statically depends on `complexityApiClient`
3. The IIFE format is a hard constraint for SPFx hosting (no code splitting possible)
4. Existing contract tests (`routeParityContract.test.ts`, `authTransportContract.test.ts`) verify the runtime isolation
5. If the build format ever supports code splitting, the strings will be automatically eliminated

## Impacted Files

| File | Change |
|------|--------|
| `packages/complexity/src/context/ComplexityProvider.tsx` | Static import → dynamic import for API client |
| `packages/complexity/package.json` | Added `sideEffects: false` for tree-shaking |

## Final Project Setup Frontend Dependency Surface

The Project Setup frontend depends on exactly **one** backend API surface:

| API Surface | Transport | Auth | Status |
|------------|-----------|------|--------|
| `/api/project-setup-requests/*` | Fetch with Bearer token | SPFx AAD token / MSAL | **Active, intentional** |
| `/api/provisioning-*` | Fetch with Bearer token | SPFx AAD token / MSAL | **Active, intentional** |
| `/api/users/me/preferences` | (dead code) | Cookie-based | **Isolated — never called** |
| `/api/users/me/groups` | (dead code) | Cookie-based | **Isolated — never called** |

No other same-origin frontend dependencies exist outside the Function App contract.
