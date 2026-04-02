# P10-07 — Latent `/api/users/me/*` Dependency Reconciliation

> **Created:** 2026-04-02  
> **Phase:** 10 — Accounting SPFx Production Gap Closure  
> **Status:** Complete

## Objective

Formally close the latent `/api/users/me/*` dependency surface identified in the P10-01 baseline by documenting its current isolation state and governing rationale.

## Decision

**Governed as accepted, isolated debt — no code changes required.**

The endpoint strings remain bundled but are unreachable at runtime through a triple-gate architecture. Removing the API client source would require rebuilding it when a backend for user preferences is eventually deployed, while the existing isolation provides stronger runtime protection than source deletion.

## Evidence Matrix

| Endpoint | File | Gate 1 | Gate 2 | Gate 3 | Runtime Status |
|----------|------|--------|--------|--------|---------------|
| `/api/users/me/preferences` | `packages/complexity/src/storage/complexityApiClient.ts:5` | `enableApiSync` defaults to `false` | No app passes `enableApiSync={true}` | No backend handler exists | Unreachable |
| `/api/users/me/groups` | `packages/complexity/src/storage/complexityApiClient.ts:6` | `enableApiSync` defaults to `false` | No app passes `enableApiSync={true}` | No backend handler exists | Unreachable |

## Isolation Architecture

### Gate 1: Default-off feature flag
`ComplexityProvider` accepts `enableApiSync?: boolean` (default: `false`). When disabled, the API sync useEffect returns immediately at line 72:
```typescript
if (_testPreference || !enableApiSync) return;
```

### Gate 2: No consumer activation
All SPFx app mounts pass `<ComplexityProvider spfxContext={spfxContext}>` without `enableApiSync={true}`:
- `apps/accounting/src/App.tsx`
- `apps/estimating/src/App.tsx`
- `apps/admin/src/App.tsx`
- `apps/risk-management/src/App.tsx`

### Gate 3: Dynamic import (Phase 9 remediation)
The API client is loaded via dynamic import, breaking the static dependency chain:
```typescript
const loadApiClient = (): Promise<ApiClientModule> => import('../storage/complexityApiClient');
```
This ensures the API client module is only evaluated when `enableApiSync=true` at runtime. However, with `inlineDynamicImports: true` (IIFE format requirement), the strings remain in the compiled bundle.

## Contract Tests Proving Isolation

| Test | File | Lines | Assertion |
|------|------|-------|-----------|
| No fetch when `enableApiSync` disabled | `packages/complexity/src/__tests__/ComplexityProvider.test.tsx` | 154-164 | Verifies zero fetch calls with default props |
| API sync only with explicit opt-in | `packages/complexity/src/__tests__/ComplexityProvider.test.tsx` | 136-152 | Verifies fetch only when `enableApiSync={true}` |
| Complexity API sync isolation | `apps/estimating/src/test/authTransportContract.test.ts` | 84-92 | Confirms no API sync activation |
| `/api/users/me/*` routes not in scope | `apps/estimating/src/test/routeParityContract.test.ts` | 48-59 | Confirms routes excluded from Project Setup |

## Why Not Remove

| Removal approach | Risk | Verdict |
|------------------|------|---------|
| Delete `complexityApiClient.ts` | Requires full rebuild when backend preferences are deployed | Rejected — premature |
| Extract to separate package | Over-engineering for unreachable code | Rejected — unnecessary complexity |
| Tree-shake at build time | Not possible with IIFE `inlineDynamicImports: true` | Not applicable |

## Bundle Impact

The API client adds approximately 1.5 KB (uncompressed) to the IIFE bundle. The endpoint strings `/api/users/me/preferences` and `/api/users/me/groups` appear as string literals in the compiled output but are never referenced by any reachable code path.

## Prior Documentation

| Document | Date | Finding |
|----------|------|---------|
| `docs/architecture/reviews/project-setup-latent-users-me-dependency-gap-validation.md` | 2026-04-01 | "Present in bundle but NOT reachable under Project Setup runtime wiring" |
| `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/Frontend-Same-Origin-Dependency-Reconciliation.md` | 2026-04-01 | Phase 9 static→dynamic import remediation complete |

## Governing Conditions

This closure stands as long as:
1. No SPFx app passes `enableApiSync={true}` to `ComplexityProvider`
2. The contract tests in the complexity package and estimating app remain passing
3. No backend handler is implemented for `/api/users/me/*` endpoints

If any condition changes, the dependency must be re-evaluated for production readiness (auth model, CORS posture, token acquisition pattern).
