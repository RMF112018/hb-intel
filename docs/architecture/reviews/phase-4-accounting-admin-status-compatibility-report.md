# Phase 4 — Accounting and Admin Status Workflow Compatibility Report

> **Prompt:** P4-05 | **Date:** 2026-04-01 | **Type:** Compatibility verification

## Accounting Indirect Compatibility via Request-State Reconciliation

### Verification Result: COMPATIBLE

**File:** `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`

The Accounting controller review surface operates exclusively on `IProjectSetupRequest` state. It does not import, reference, or query `IProvisioningStatus` at any point.

**Boundary enforcement verified:**
- Only imports `IProjectSetupRequest` from `@hbc/models` — no provisioning status types
- Only calls `client.listRequests()` and `client.advanceState()` — no provisioning status endpoints
- No retry, archive, escalation, or force-state controls present
- "Send to Admin" navigation button on `Failed` requests is the only Admin interaction
- All lifecycle banners reflect request state, not provisioning run state

**Request-state reconciliation compatibility:**
After P4-04, all mutation paths that change provisioning `overallStatus` to a terminal state now reconcile the linked request:

| Provisioning event | Request state | Accounting sees |
|-------------------|---------------|-----------------|
| Saga start | Provisioning | "Provisioning is in progress" banner |
| Saga completion | Completed | "Provisioned successfully" banner + site URL |
| Saga failure | Failed | Failed state + "Send to Admin" button |
| Timer completion | Completed | Same as saga completion |
| Timer failure | Failed | Same as saga failure |
| Admin archive (P4-04) | Completed | "Provisioned successfully" banner |
| Admin force-state to terminal (P4-04) | Completed/Failed | Appropriate terminal banner |

**No recovery-action leakage:** Accounting does not show retry, archive, escalation acknowledgment, or force-state controls. The "Send to Admin" button is a navigation action, not a recovery action.

## Admin Direct Compatibility via Durable Provisioning-Status Reads and Actions

### Verification Result: COMPATIBLE

**File:** `apps/admin/src/pages/ProvisioningOversightPage.tsx`

The Admin oversight surface reads `IProvisioningStatus` directly via `listProvisioningRuns()`. It renders all P4-hardened fields and provides exclusive recovery actions.

**Direct status consumption verified:**
- Uses `listProvisioningRuns()` for full `IProvisioningStatus[]` reads
- Renders `overallStatus` with correct P4 values (NotStarted, InProgress, BaseComplete, Completed, Failed, WebPartsPending)
- Renders P4-02 persisted fields: `failureClass`, `escalatedBy`, `escalatedAt`, `lastRetryAt`, `entraGroups`
- Status badges use `PROVISIONING_STATUS_LABELS[run.overallStatus]` — consistent with P4 contract
- Field names use P4 convention: `projectNumber` (not `projectCode`), `steps` (not `stepResults`)

**Admin actions verified:**
- Force Retry — gated by `ADMIN_PROVISIONING_RETRY` permission, creates new run
- Archive — gated by `ADMIN_PROVISIONING_ARCHIVE` permission, edits latest run, reconciles request (P4-04)
- Acknowledge Escalation — gated by `ADMIN_PROVISIONING_ESCALATE` permission, clears markers
- Force State Override — gated by `ADMIN_PROVISIONING_FORCE_STATE` permission, edits latest run, reconciles request on terminal targets (P4-04)

**No controller-action leakage:** Admin does not show approve, clarify, hold, or review controls. Confirmed by test assertion G4-T04-010.

## Preserved App Boundary

| Responsibility | Owner | Verified |
|---------------|-------|----------|
| Request review, approve, clarify, hold | Accounting (T03) | No admin actions in ProjectReviewDetailPage |
| Provisioning retry, archive, escalation, force-state | Admin (T04) | No controller actions in ProvisioningOversightPage |
| Route failed request to admin | Accounting → Admin navigation | "Send to Admin" button navigates, does not execute |
| Cross-app pre-selection | Admin query param | `?projectId=` opens detail modal |

## Consistent Status Truth Across Both Surfaces

After P4-04 reconciliation hardening, both surfaces see consistent truth:

- **Accounting** reads request state → reflects terminal provisioning truth via reconciliation
- **Admin** reads provisioning status → reflects authoritative durable run state
- Archive and force-state mutations now reconcile request state, eliminating the drift gaps identified in P4-01

## Documentation Updates

| Document | Change | Reason |
|----------|--------|--------|
| `docs/reference/spfx-surfaces/controller-review-surface.md` | Added P4 reconciliation boundary section | Documents how request state reflects provisioning truth at terminal boundaries |
| `docs/reference/spfx-surfaces/admin-recovery-boundary.md` | Replaced stale "API Method Gaps" with implemented methods, added P4 mutation reconciliation table, updated diagnostic fields section | Backend endpoints are implemented, P4-02 persistence fields are now available, P4-04 reconciliation is documented |

## Test Coverage

**File:** `apps/admin/src/test/ProvisioningOversightPage.test.tsx`

- Uses P4 field names (`projectNumber`, `steps`, `overallStatus`) throughout — no legacy naming
- Test fixtures use correct P4 `overallStatus` values (`Failed`, `InProgress`, `Completed`)
- Permission gating tested for all four admin actions
- Confirmation dialog variants tested (danger for retry/force-state, warning for archive)
- Complexity tier gating tested (essential, standard, expert)

## Completion Standard

Both surfaces are compatible with the adopted Phase 4 status model. Their responsibilities remain cleanly separated: Accounting owns request-lifecycle review and approval through `advanceState()`, Admin owns provisioning-status recovery and oversight through direct `IProvisioningStatus` reads and admin mutation endpoints. No new ownership drift or cross-app responsibility overlap was introduced.
