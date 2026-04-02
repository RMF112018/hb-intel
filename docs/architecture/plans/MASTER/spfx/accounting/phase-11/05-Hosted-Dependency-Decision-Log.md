# 05 — Hosted Dependency Decision Log

**Status:** Complete
**Full review:** [accounting-hidden-hosted-dependency-reconciliation.md](../../../../reviews/accounting-hidden-hosted-dependency-reconciliation.md)
**Prior art:** [P10-07 — Latent Users/Me Dependency Reconciliation](../../accounting/phase-10/P10-07_Latent-Users-Me-Dependency-Reconciliation.md)

## Decision Summary

| Dependency | Present in Bundle | Reachable at Runtime | Decision |
|------------|------------------|---------------------|----------|
| `/api/users/me/preferences` | Yes (IIFE inlines all) | No (triple-gate isolated) | Accepted isolated debt |
| `/api/users/me/groups` | Yes (IIFE inlines all) | No (triple-gate isolated) | Accepted isolated debt |
| `ComplexityProvider` | Yes | Yes — active dependency | Keep — required for UI complexity gating |

## Triple-Gate Isolation

1. **Gate 1:** `enableApiSync` defaults to `false` in `ComplexityProvider`
2. **Gate 2:** Accounting never passes `enableApiSync={true}` (zero matches in `apps/accounting/src/`)
3. **Gate 3:** Dynamic import isolates API client from static dependency chain

## Why ComplexityProvider Is Needed

`ProjectReviewDetailPage` uses `HbcComplexityGate` and `HbcComplexityDial` to show/hide advanced features based on complexity tier. The provider supplies the tier context — its API sync feature is orthogonal and disabled by default.

## Governing Conditions

Isolation is valid as long as:
- No SPFx app passes `enableApiSync={true}`
- Contract tests verify zero fetch calls at default config
- No backend handler deployed for `/api/users/me/*`

## What Later Prompts Can Assume

1. No hidden same-origin dependencies are active in the Accounting hosted path.
2. The `/api/users/me/*` endpoints are accepted isolated debt with zero runtime impact.
3. `ComplexityProvider` is a legitimate production dependency for UI gating.
4. No code changes were needed — Phase 10 P10-07 determination stands.
