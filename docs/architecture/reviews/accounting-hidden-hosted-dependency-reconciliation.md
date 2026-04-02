# Accounting Hidden Hosted Dependency Reconciliation

**Date:** 2026-04-02
**Scope:** Reconcile the `/api/users/me/*` latent dependency chain in the Accounting SPFx hosted artifact.
**Phase:** [Phase 11, Prompt 05](../plans/MASTER/spfx/accounting/phase-11/Prompt-05_Phase-11-Hidden-Hosted-Dependency-Reconciliation-and-Complexity-Path-Cleanup.md)
**Predecessor:** [Runtime Config Injection Parity](accounting-runtime-config-injection-and-packaged-shell-hardening.md) (P11-04)
**Prior art:** [P10-07 — Latent Users/Me Dependency Reconciliation](../plans/MASTER/spfx/accounting/phase-10/P10-07_Latent-Users-Me-Dependency-Reconciliation.md)

## 1. Executive Summary

The `/api/users/me/preferences` and `/api/users/me/groups` endpoint references are **present in the compiled Accounting IIFE bundle but completely unreachable at runtime**. They are governed as accepted, isolated technical debt — unchanged from the Phase 10 P10-07 determination.

A triple-gate isolation architecture ensures zero runtime calls:
1. `enableApiSync` defaults to `false` in `ComplexityProvider`
2. No Accounting code (or any other SPFx app) passes `enableApiSync={true}`
3. Dynamic import isolates the API client module from the static dependency chain

`ComplexityProvider` itself IS a legitimate production dependency — Accounting's `ProjectReviewDetailPage` uses `HbcComplexityGate` and `HbcComplexityDial` for UI feature gating. Only the API sync feature is disabled.

No code changes are required. No same-origin assumptions are active in the hosted path.

## 2. Dependency Inventory

| Endpoint | Definition | Purpose | Runtime Status | Owner |
|----------|-----------|---------|---------------|-------|
| `/api/users/me/preferences` | `packages/complexity/src/storage/complexityApiClient.ts:5` | Fetch/persist user complexity tier preference | **Unreachable** — triple-gate isolated | Future backend (unimplemented) |
| `/api/users/me/groups` | `packages/complexity/src/storage/complexityApiClient.ts:6` | Derive initial tier from AD group membership | **Unreachable** — triple-gate isolated | Future backend (unimplemented) |

## 3. Current Purpose of Each Dependency

### `/api/users/me/preferences`
Intended for a future feature: persistent, cross-device complexity tier storage backed by the API. When enabled, `ComplexityProvider` would fetch the user's stored tier on mount and persist changes on `setTier`/`setShowCoaching`. Currently, tier persistence uses `sessionStorage` (SPFx) or `localStorage` only.

### `/api/users/me/groups`
Derivative of the preferences feature. When a new user has no stored preference, `deriveInitialTierFromADGroups()` would fetch the user's AD groups and map them to an initial tier via `roleComplexityMap`. Currently, new users default to the "essential" tier (`COMPLEXITY_OPTIMISTIC_DEFAULT`).

## 4. Hosted Accounting Impact

**Zero runtime impact.** The Accounting hosted artifact:
- Mounts `ComplexityProvider` without `enableApiSync` — confirmed by `apps/accounting/src/App.tsx:24`
- Zero instances of `enableApiSync` anywhere in `apps/accounting/src/` — confirmed by grep
- No backend handler exists for these endpoints
- Endpoint strings are present in the IIFE bundle due to `inlineDynamicImports: true` (required for SPFx single-file output) but the code path referencing them is unreachable

The provider stack (`App.tsx:18-33`) mounts `ComplexityProvider` for its legitimate purpose: UI feature gating via `useComplexity()` hook, `HbcComplexityGate`, and `HbcComplexityDial` in `ProjectReviewDetailPage`.

## 5. Final Decision per Dependency

| Dependency | Decision | Rationale |
|------------|----------|-----------|
| `/api/users/me/preferences` | **Keep — accepted isolated debt** | Legitimate future feature, cleanly isolated, zero runtime impact. Removing would require rebuild when backend deploys. |
| `/api/users/me/groups` | **Keep — accepted isolated debt** | Same rationale. Derivative of preferences feature. |
| `ComplexityProvider` | **Keep — active production dependency** | Required for UI complexity gating in Accounting pages. API sync feature is orthogonal and disabled by default. |

### Governing Conditions

This isolation remains valid as long as:
1. No SPFx app passes `enableApiSync={true}` to `ComplexityProvider`
2. Contract tests in `packages/complexity` verify zero fetch calls at default configuration
3. No backend handler for `/api/users/me/*` is deployed

If any condition changes, the dependency must be re-evaluated for auth model, CORS posture, and token acquisition pattern.

## 6. Code Changes Made

**None.** The current implementation is correct:
- Triple-gate isolation is intact
- Contract tests verify the isolation
- Prior documentation (P10-07) governs the acceptance decision

## 7. Documentation Changes Made

- Created this reconciliation memo confirming the Phase 10 determination
- Created phase-local decision log (`05-Hosted-Dependency-Decision-Log.md`)
- No updates to existing docs required — P10-07 and the prior art remain accurate

## 8. Exact Files Inspected

### Accounting app
- `apps/accounting/src/App.tsx` — provider stack, no `enableApiSync`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx` — `HbcComplexityGate` and `HbcComplexityDial` usage
- `apps/accounting/src/test/complexity.test.tsx` — complexity UI gate tests
- `apps/accounting/src/test/renderWithProviders.tsx` — test helper confirms no `enableApiSync`
- `apps/accounting/src/backend/AccountingBackendContext.tsx` — no profile endpoints

### Complexity package
- `packages/complexity/src/context/ComplexityProvider.tsx` — provider, gates, dynamic import
- `packages/complexity/src/storage/complexityApiClient.ts` — endpoint definitions
- `packages/complexity/src/__tests__/ComplexityProvider.test.tsx` — contract tests

### Prior documentation
- `docs/architecture/plans/MASTER/spfx/accounting/phase-10/P10-07_Latent-Users-Me-Dependency-Reconciliation.md`
- `docs/architecture/reviews/project-setup-latent-users-me-dependency-gap-validation.md`
