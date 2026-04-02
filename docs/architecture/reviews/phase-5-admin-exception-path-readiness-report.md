# Phase 5 — Admin Exception-Path Integration Readiness Report

> **Prompt:** P5-06 | **Date:** 2026-04-02 | **Type:** Closure report

## Phase 5 Objectives

Integrate the Admin exception path into the Project Setup workflow so failed, escalated, or otherwise exceptional provisioning cases move into Admin in a controlled, auditable, and production-appropriate way. Specifically:

- Harden cross-app routing from Accounting into Admin for failed requests
- Ensure context handoff is sufficient for safe Admin recovery
- Clarify and enforce the boundary between Admin-exclusive and shared exception actions
- Align escalation, reopen, and retry lifecycle behavior
- Ensure operator messaging across all surfaces reflects correct ownership
- Reconcile documentation to repo truth

---

## What Was Implemented

### P5-01 — Repo-Truth Admin Exception-Path Audit
- Created evidence-based baseline report covering the entire Admin exception path
- Answered all 8 required questions with file-level evidence across 30+ files
- Identified 11 discrepancies and mapped each to implementation prompts P5-02 through P5-05
- **Report:** `docs/architecture/reviews/phase-5-admin-exception-path-audit.md`

### P5-02 — Cross-App Failure Routing and Context Handoff
- Fixed Estimating dead link: `/provisioning-oversight` → `/provisioning-failures` in `RetrySection.tsx`
- Replaced manual `URLSearchParams` with TanStack Router `useSearch()` in Admin `ProvisioningOversightPage.tsx`
- Added multi-run disambiguation: runs sorted by `startedAt` descending to select latest
- Evaluated `crossAppUrls.ts` duplication — retained as-is (app-level concern per W0-G4-T07)
- Updated `admin-recovery-boundary.md` and `coordinator-visibility-spec.md`
- **Report:** `docs/architecture/reviews/phase-5-cross-app-failure-routing-and-context-handoff-report.md`

### P5-03 — Admin Recovery Action Boundary and Authorization Hardening
- Added `overallStatus === 'Failed'` state guards to `retryProvisioning` and `escalateProvisioning` backend endpoints (409 on non-failed runs)
- Explicitly classified all exception actions into Admin-exclusive (L2+L3) and shared (L2) categories
- Updated `admin-recovery-boundary.md` with separated action boundary classification
- **Report:** `docs/architecture/reviews/phase-5-admin-recovery-boundary-and-authorization-report.md`

### P5-04 — Escalation Ownership and Reopen Lifecycle Integration
- Fixed `retryCount` and `lastRetryAt` propagation across retries via `IProvisionSiteRequest` (pre-existing bug where count always reset to 0)
- Expanded auto-trigger condition to accept `Completed` provisioning status (handles archived failures on reopen)
- Documented escalation lifecycle (new runs start clean, only Admin can clear)
- Updated `durable-status-contract.md` with reopen and escalation lifecycle sections
- **Report:** `docs/architecture/reviews/phase-5-escalation-ownership-and-reopen-lifecycle-report.md`

### P5-05 — Accounting/Admin Exception UX and Operational Verification
- Changed Accounting state text: "Route to Admin for resolution" → "Admin must resolve this failure"
- Changed Accounting button: "Send to Admin" → "Escalate to Admin"
- Changed Accounting tab: "Failed / Needs Routing" → "Failed — Route to Admin"
- Strengthened Admin coaching callouts with explicit ownership language
- Updated tests and `controller-review-surface.md` and `state-machine.md`
- **Report:** `docs/architecture/reviews/phase-5-accounting-admin-exception-ux-verification-report.md`

### P5-06 — Final Documentation Reconciliation (this report)
- Audited all living reference docs — zero stale content found
- Confirmed all 6 core reference docs reflect P5 changes
- Confirmed maintenance/runbook docs use current terminology

---

## What Was Corrected

| Defect | Severity | Prompt | Fix |
|--------|----------|--------|-----|
| Estimating "Open Admin Recovery" linked to nonexistent `/provisioning-oversight` route | High | P5-02 | Changed to `/provisioning-failures` |
| Admin page used manual `URLSearchParams` instead of TanStack Router `useSearch()` | Low | P5-02 | Replaced with `useSearch({ from: '/provisioning-failures' })` |
| Multi-run disambiguation selected first array match, not latest run | Low-Moderate | P5-02 | Sort by `startedAt` descending, select first |
| `retryProvisioning` and `escalateProvisioning` had no state validation | Moderate | P5-03 | Added `overallStatus === 'Failed'` guard (409 on violation) |
| `retryCount` reset to 0 on every retry (coordinator limits never triggered) | Moderate | P5-04 | Propagated `retryCount`/`lastRetryAt` via `IProvisionSiteRequest` |
| Auto-trigger skipped re-provisioning after admin archive + controller reopen | Moderate | P5-04 | Expanded condition to accept `Completed` status |
| Accounting messaging used passive ownership language | Medium | P5-05 | "Admin must resolve" + "Escalate to Admin" + "Failed — Route to Admin" |

---

## Key Repo-Truth Findings

1. The Admin exception path is **functionally complete** but was **not exclusively Admin-owned** — Estimating participates via bounded coordinator retry and escalation annotation.
2. `retryProvisioning` and `escalateProvisioning` are **shared endpoints** (L2 delegated scope only). This is intentional — coordinators and admins both need access.
3. Archive, acknowledge-escalation, and force-state are **true Admin-exclusive** actions (L2 + L3 admin role enforcement).
4. Escalation is an **annotation-only** action — it does not change provisioning status or request state.
5. New retry runs start with **clean escalation fields** — `escalatedBy` and `escalatedAt` are not carried forward.
6. The `projectId`-only deep-link contract is **sufficient** when combined with latest-run-by-`startedAt` selection.

---

## Final Exception-Path Routing Summary

| From | To | Trigger | URL | Parameters |
|------|-----|---------|-----|-----------|
| Accounting | Admin | Controller clicks "Escalate to Admin" | `{VITE_ADMIN_APP_URL}/provisioning-failures?projectId={projectId}` | `projectId` only |
| Estimating | Admin | Coordinator clicks "Open Admin Recovery" | `{VITE_ADMIN_APP_URL}/provisioning-failures?projectId={projectId}` | `projectId` only |
| Admin route-in | Auto-select | `useSearch()` reads `projectId` | — | Latest run by `startedAt` |

All deep links target `/provisioning-failures`. No dead links remain. Graceful degradation when `VITE_ADMIN_APP_URL` is missing (warning banner, button hidden).

---

## Final Admin Recovery Boundary Summary

### Admin-Exclusive Actions (L2 + L3 Admin)

| Action | Endpoint | Reconciliation |
|--------|----------|---------------|
| Archive Failure | `POST /provisioning-archive/{projectId}` | Request → Completed (P4-04) |
| Acknowledge Escalation | `POST /provisioning-escalation-ack/{projectId}` | None (annotation cleanup) |
| Manual State Override | `POST /provisioning-force-state/{projectId}` | Request → target if terminal (P4-04) |

### Shared Exception Actions (L2 Delegated Scope)

| Action | Endpoint | State Guard | Consumers |
|--------|----------|------------|-----------|
| Retry | `POST /provisioning-retry/{projectId}` | `overallStatus === 'Failed'` (P5-03) | Estimating, Admin |
| Escalation | `POST /provisioning-escalate/{projectId}` | `overallStatus === 'Failed'` (P5-03) | Estimating |

---

## Final Shared Retry/Escalation Summary

**Coordinator Retry (Estimating):**
- Bounded by 5-condition `canCoordinatorRetry()` gate: `overallStatus === 'Failed'`, `failureClass` defined, `failureClass === 'transient'`, `retryCount < 2`, `escalatedBy == null`
- Uses same `retryProvisioning` endpoint as Admin Force Retry
- Frontend-only business rules; backend enforces only state guard

**Admin Force Retry:**
- No failure-class restriction, no coordinator retry limit
- Bounded by `ADMIN_RETRY_CEILING`
- Same endpoint, broader frontend allowance

**Escalation:**
- Annotation-only: sets `escalatedBy` + `escalatedAt` on latest run
- One-way from coordinator perspective — only Admin can clear via acknowledge
- New retry runs start clean (no escalation carry-forward)

---

## Final Escalation / Reopen / Retry Interaction Summary

| Action | Request State | Provisioning Status | Reconciliation |
|--------|-------------|--------------------|-|
| Coordinator retry | Unchanged | New run (InProgress) | Saga reconciles request → Provisioning |
| Admin force retry | Unchanged | New run (InProgress) | Saga reconciles request → Provisioning |
| Admin archive | → Completed | → Completed | P4-04 reconciliation |
| Admin force-state (terminal) | → target | → target | P4-04 reconciliation |
| Admin acknowledge escalation | Unchanged | Clears markers | None |
| Controller reopen | Failed → UnderReview | Unchanged | None (provisioning preserved) |
| Re-approval after reopen | → ReadyToProvision | Auto-trigger if null/Failed/Completed | New saga if eligible (P5-04) |

**retryCount propagation (P5-04):** Accumulated count and `lastRetryAt` are carried forward to new runs via `IProvisionSiteRequest`. Coordinator retry limits and Admin retry counters now work correctly.

---

## Request/Status Consistency Conclusion

Request lifecycle and provisioning status are aligned at all critical boundaries:

- **Saga start:** Request reconciled to `Provisioning`
- **Saga success:** Request reconciled to `Completed`
- **Saga failure:** Request reconciled to `Failed`
- **Admin archive:** Request reconciled to `Completed` (P4-04)
- **Admin force-state (terminal):** Request reconciled to target (P4-04)
- **Retry:** New run starts; saga reconciles request on start and completion
- **Reopen + re-approval:** Auto-trigger creates new saga if status is null, `Failed`, or `Completed` (P5-04)

**Accepted design decision:** Step 5 deferral does not reconcile request state — request stays `Provisioning` while provisioning moves to `WebPartsPending`. Timer eventually resolves. This was accepted in P4-01 and reaffirmed in P5-04.

**Accepted limitation:** `WebPartsPending` and `BaseComplete` block auto-trigger on reopen because partial site resources exist. Admin manual intervention is the correct path for these edge cases.

---

## Accounting/Admin Operator-Compatibility Conclusion

All three surfaces now use consistent ownership-transfer language:

| Surface | Failed-State Message | Action | Clarity |
|---------|---------------------|--------|---------|
| Accounting | "Admin must resolve this failure." | "Escalate to Admin" | High |
| Estimating | "This failure requires Admin recovery." | "Escalate to Admin" / "Open Admin Recovery" | High |
| Admin | Coaching callouts with "As Admin, you must now escalate" | Force Retry / Archive / Ack / Override | High |

- Accounting has zero recovery actions — boundary preserved
- Accounting has zero `IProvisioningStatus` imports — boundary preserved
- Admin recovery actions are permission-gated — boundary preserved
- Estimating coordinator retry is 5-condition bounded — boundary preserved

---

## Residual Risks

| Risk | Severity | Mitigation | Status |
|------|----------|-----------|--------|
| Coordinator retry business rules are frontend-only | Low | Backend state guard (P5-03) prevents non-failed retries; coordinator retry ceiling enforced by `canCoordinatorRetry()` | Accepted |
| Escalation has no `failureClass` check at backend | Low | Frontend spec R1 renders nothing when `failureClass` is undefined; backend state guard prevents non-failed escalation | Accepted |
| `crossAppUrls.ts` duplicated in accounting and estimating | Low | 14-line utility, architecturally scoped as app-level concern; documented in P5-02 | Accepted |
| `WebPartsPending`/`BaseComplete` block auto-trigger on reopen | Low | Admin manual intervention via direct provisioning endpoint is the correct path; documented in P5-04 | Accepted |
| Expert-tier diagnostic fields (`errorDetails`, `stepContext`, Graph API sequence) not on `IProvisioningStatus` | Low | Known gap from P4-01; `steps[].errorMessage` and `steps[].metadata` serve as partial substitutes | Deferred |

No high or critical residual risks remain.

---

## Phase 6 Prerequisites

No blocking prerequisites were identified. Phase 5 leaves the exception path in a coherent, documented, and operationally testable state.

If a Phase 6 is scoped, candidates for consideration include:
- Adding expert-tier diagnostic fields (`errorDetails`, `stepContext`) to `IProvisioningStatus`
- Extracting `crossAppUrls.ts` to a shared package if cross-app navigation grows
- Adding backend-level coordinator retry business rules (currently frontend-only)
- E2E testing of the exception workflow under real failure conditions

---

## Documentation Reconciliation

All living reference documents were audited and confirmed current:

| Document | Status |
|----------|--------|
| `docs/reference/spfx-surfaces/admin-recovery-boundary.md` | Current (P5-02, P5-03) |
| `docs/reference/spfx-surfaces/controller-review-surface.md` | Current (P5-05) |
| `docs/reference/spfx-surfaces/coordinator-visibility-spec.md` | Current (P5-02) |
| `docs/reference/provisioning/durable-status-contract.md` | Current (P5-03, P5-04) |
| `docs/reference/provisioning/state-machine.md` | Current (P5-03, P5-04, P5-05) |
| `docs/maintenance/provisioning-runbook.md` | Current |
| `docs/maintenance/provisioning-observability-runbook.md` | Current |

Pre-P5 terminology ("Send to Admin", "Failed / Needs Routing") appears only in locked historical documents (Phase 1 freeze, MVP/G4 plans, Phase 3 completion report). These are correctly archived and do not interfere with current operations.

---

## Phase 5 Implementation Evidence

| Prompt | Report |
|--------|--------|
| P5-01 | `docs/architecture/reviews/phase-5-admin-exception-path-audit.md` |
| P5-02 | `docs/architecture/reviews/phase-5-cross-app-failure-routing-and-context-handoff-report.md` |
| P5-03 | `docs/architecture/reviews/phase-5-admin-recovery-boundary-and-authorization-report.md` |
| P5-04 | `docs/architecture/reviews/phase-5-escalation-ownership-and-reopen-lifecycle-report.md` |
| P5-05 | `docs/architecture/reviews/phase-5-accounting-admin-exception-ux-verification-report.md` |
| P5-06 | `docs/architecture/reviews/phase-5-admin-exception-path-readiness-report.md` (this report) |

---

## Completion Status

**Phase 5 complete.**

The Admin exception-path integration is coherent, bounded, documented, and operationally ready. All implementation goals from the Phase 5 Implementation Plan have been met:

- Accounting routes exceptional cases to Admin correctly with explicit ownership messaging
- Admin receives sufficient context to recover safely (latest run by `startedAt`)
- True Admin-only actions are clearly bounded and authorized (L2 + L3)
- Shared retry/escalation behavior is explicitly classified with backend state guards
- Reopen/retry/escalation behavior is coherent with correct retryCount propagation
- Request state and provisioning status remain aligned during exception handling
- Operator-facing messaging reflects correct ownership across all surfaces
- Documentation matches repo truth
