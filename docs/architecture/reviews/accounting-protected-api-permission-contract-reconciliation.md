# Accounting Protected API Permission Contract Reconciliation

**Date:** 2026-04-02
**Scope:** Reconcile Accounting's protected API permission posture across code, package config, and documentation.
**Phase:** [Phase 11, Prompt 03](../plans/MASTER/spfx/accounting/phase-11/Prompt-03_Phase-11-Accounting-Protected-API-Permission-Contract-Reconciliation.md)
**Predecessor:** [Entry Surface and Bundle Contract](accounting-entry-surface-and-bundle-contract-reconciliation.md) (P11-02)

## 1. Executive Summary

**Accounting IS a protected API caller.** This is confirmed by code evidence, package configuration, and intended product behavior.

The Phase 7 audit (P7-02) correctly stated that Accounting did not call the protected API *at the time of that audit*. Phase 10 (P10-05) subsequently added `AccountingBackendProvider` with real API client integration, token acquisition, and protected endpoint calls. The `webApiPermissionRequests` declaration in `apps/accounting/config/package-solution.json` is correct and required.

The auth contract doc (`project-setup-api-auth-contract.md`) and Phase 7 audit resolution were stale — they described the pre-Phase-10 posture. Both have been updated by this prompt.

## 2. Current Code Evidence

### Active API callers

| Page | API Method | Endpoint | Auth |
|------|-----------|----------|------|
| `ProjectReviewQueuePage.tsx` | `client.listRequests()` | `GET /api/project-setup-requests` | Bearer token |
| `ProjectReviewDetailPage.tsx` | `client.listRequests()` | `GET /api/project-setup-requests` | Bearer token |
| `ProjectReviewDetailPage.tsx` | `client.advanceState()` | `PATCH /api/project-setup-requests/{id}/state` | Bearer token |

### Token acquisition chain

1. `mount.tsx` → `createSpfxApiTokenProvider(spfxContext, apiAudience)` — acquires audience-scoped Entra tokens via SPFx AadTokenProvider
2. `AccountingBackendContext.tsx` → token factory resolution: SPFx provider (production) → session-based (dev fallback) → error
3. `createProvisioningApiClient(baseUrl, getToken)` → `authFetch()` injects `Authorization: Bearer <token>` on every request

### Backend enforcement

All Project Setup API endpoints are wrapped with `withAuth()` middleware (`backend/functions/src/middleware/auth.ts`) which validates the Bearer JWT against Entra ID JWKS, enforces audience match, and extracts claims for authorization.

### Pages without protected API calls

`BudgetsPage`, `InvoicesPage`, `OverviewPage` use local mock data only — no protected API calls.

## 3. Current Package Evidence

`apps/accounting/config/package-solution.json`:
```json
"webApiPermissionRequests": [
  {
    "resource": "hb-intel-api-production",
    "scope": "access_as_user"
  }
]
```

This is the same permission declaration used by Estimating. It is required for Accounting's controller review surfaces to acquire tokens for the protected backend API.

## 4. Current Repo-Doc Position (Pre-Reconciliation)

| Document | Stated Position | Accuracy |
|----------|----------------|----------|
| `project-setup-api-auth-contract.md` (P7-02) | "Accounting does not currently call the Project Setup protected API" | **Stale** — correct at time of writing, superseded by Phase 10 |
| Phase 7 audit (G7-02 resolution) | "No permission request is required unless a future Accounting surface needs direct API access" | **Stale** — the future need arrived in Phase 10 |
| `apps/accounting/config/package-solution.json` | Declares `hb-intel-api-production / access_as_user` | **Correct** — added during Phase 10 |
| P11-01 truth freeze | Notes permission declaration is present | **Correct** |

## 5. Microsoft Guidance Summary

### SPFx API Permission Request Semantics

Per [Microsoft documentation on SPFx API permissions](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient):

- `webApiPermissionRequests` in `package-solution.json` declares which AAD-secured APIs the solution needs to call
- When the `.sppkg` is uploaded to the app catalog, these permissions appear as pending requests in the SharePoint admin center
- A SharePoint admin must approve the request before the solution can acquire tokens
- Approval is **tenant-wide** — once approved for one solution, all solutions requesting the same resource/scope benefit
- If the Estimating solution's identical permission request has already been approved, the Accounting solution's request will either auto-approve or require minimal admin action

### Consequence for Accounting

Since Accounting and Estimating both declare the same `hb-intel-api-production / access_as_user` permission:
- If Estimating's permission has already been tenant-approved, Accounting's deployment may auto-inherit the approval
- If not yet approved, the admin must approve it before Accounting's controller review surfaces can function in production
- Removing the declaration would break Accounting's ability to acquire tokens for the protected API

## 6. Final Contract Decision

| Question | Answer |
|----------|--------|
| Does Accounting currently call protected backend routes? | **Yes** — `listRequests()` and `advanceState()` via Bearer-authenticated `authFetch()` |
| Is this intentional and product-correct? | **Yes** — Accounting's controller review surfaces are designed to manage project setup requests, which requires protected API access |
| Should Accounting declare `webApiPermissionRequests`? | **Yes** — the declaration is already present and correct |
| Which docs were stale? | `project-setup-api-auth-contract.md` (P7-02 position) and Phase 7 audit G7-02 resolution |
| What code path is incorrect? | **None** — the code, package config, and runtime behavior are all consistent |

## 7. Required Repo Changes

### Updated: `docs/reference/configuration/project-setup-api-auth-contract.md`

Changed the Accounting section from "None declared / does not currently call" to reflect the active permission declaration and Phase 10 evolution. Added Accounting alongside Estimating as an authorized SPFx caller. Updated the implementation files reference table.

### Updated: `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`

Updated G7-02 resolution and the explicit open question to note that the Phase 7 position was superseded by Phase 10 implementation and reconciled in Phase 11 (P11-03).

### Created: `docs/architecture/plans/MASTER/spfx/accounting/phase-11/03-Accounting-API-Permission-Decision-Matrix.md`

Short decision matrix for downstream Phase 11 prompts.

## 8. Exact Files Inspected

### Accounting code paths
- `apps/accounting/src/backend/AccountingBackendContext.tsx` — token factory, API client creation
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx` — `listRequests()` call
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx` — `listRequests()` + `advanceState()` calls
- `apps/accounting/src/mount.tsx` — `createSpfxApiTokenProvider()` wiring
- `apps/accounting/src/config/runtimeConfig.ts` — `getApiAudience()` resolution
- `apps/accounting/config/package-solution.json` — `webApiPermissionRequests` declaration

### Backend auth
- `packages/provisioning/src/api-client.ts` — `authFetch()` with Bearer token injection
- `backend/functions/src/middleware/auth.ts` — `withAuth()` middleware
- `backend/functions/src/middleware/validateToken.ts` — JWT validation

### Documentation
- `docs/reference/configuration/project-setup-api-auth-contract.md` — pre-reconciliation position
- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md` — G7-02 resolution
- `docs/architecture/plans/MASTER/spfx/accounting/phase-11/01-Canonical-Packaging-Truth-Freeze.md` — P11-01 reference
