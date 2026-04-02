# 03 — Accounting API Permission Decision Matrix

**Status:** Complete
**Full review:** [accounting-protected-api-permission-contract-reconciliation.md](../../../../reviews/accounting-protected-api-permission-contract-reconciliation.md)

## Decision

**Accounting IS a protected API caller.** The `webApiPermissionRequests` declaration is correct and required.

## Decision Matrix

| Question | Evidence | Answer |
|----------|----------|--------|
| Does Accounting call protected backend routes? | `ProjectReviewQueuePage` → `listRequests()`, `ProjectReviewDetailPage` → `advanceState()` | **Yes** |
| Are calls token-authenticated? | `authFetch()` injects `Authorization: Bearer <token>` | **Yes** |
| Is the `webApiPermissionRequests` declaration correct? | `package-solution.json` declares `hb-intel-api-production / access_as_user` | **Yes** |
| Is this product-intentional? | Controller review surfaces require project setup API access | **Yes** |
| Are docs now aligned? | Auth contract doc and Phase 7 audit updated | **Yes** |

## Permission Posture by App

| App | Protected API Caller | `webApiPermissionRequests` | Status |
|-----|---------------------|---------------------------|--------|
| Estimating | Yes | `hb-intel-api-production / access_as_user` | Active since Phase 7 |
| Accounting | Yes | `hb-intel-api-production / access_as_user` | Active since Phase 10 (P10-05) |

## SharePoint Admin Consequence

Both apps declare the same resource/scope. If the Estimating permission was already tenant-approved, the Accounting deployment may auto-inherit the approval. Otherwise, admin approval is required before Accounting's controller review surfaces can function in production.

## What Later Prompts Can Assume

1. Accounting's API permission declaration is correct — do not remove it.
2. The auth contract doc now reflects both Estimating and Accounting as authorized callers.
3. SharePoint admin approval for `hb-intel-api-production / access_as_user` is a deployment prerequisite.
4. Pages without API calls (BudgetsPage, InvoicesPage, OverviewPage) use mock data only — no permission impact.
