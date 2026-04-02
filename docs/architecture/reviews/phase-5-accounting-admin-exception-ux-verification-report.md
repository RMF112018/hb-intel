# Phase 5 — Accounting/Admin Exception UX and Operational Verification Report

> **Prompt:** P5-05 | **Date:** 2026-04-02 | **Type:** UX hardening + documentation

## Executive Summary

The exception UX across Accounting, Admin, and Estimating was audited for ownership clarity, messaging consistency, action visibility, and cross-surface coherence. Five targeted improvements were implemented: Accounting's passive "Route to Admin" language was replaced with explicit ownership-transfer messaging, the "Send to Admin" button was renamed to "Escalate to Admin" to match Estimating's language, the queue tab was relabeled from "Failed / Needs Routing" to "Failed — Route to Admin", and Admin coaching callouts were strengthened to explicitly declare Admin ownership. No functional defects were found — all issues were messaging clarity improvements.

---

## Accounting Exception UX

### State Context Text
**Before:** "Site provisioning encountered an error. Route to Admin for resolution."
**After:** "Site provisioning failed. Admin must resolve this failure."
**Rationale:** The original phrasing was passive — "Route to Admin" could be read as informational rather than an ownership transfer. The new text explicitly states Admin ownership.

### Action Button
**Before:** "Send to Admin" (submission language)
**After:** "Escalate to Admin" (ownership-transfer language, matches Estimating)
**Rationale:** Estimating uses "Escalate to Admin" for its exception path. Using consistent language across surfaces eliminates ambiguity about whether the controller is submitting information or transferring ownership.

### Queue Tab
**Before:** "Failed / Needs Routing"
**After:** "Failed — Route to Admin"
**Rationale:** "Needs Routing" was ambiguous — could mean internal triage or Admin escalation. The new label explicitly names the destination.

### Verified Correct (no changes needed)
- Failed-state badge variant renders correctly via `getStateBadgeVariant()`.
- "Send to Admin" (now "Escalate to Admin") only renders when `request.state === 'Failed'`.
- Graceful degradation when `VITE_ADMIN_APP_URL` is missing (warning banner, button hidden).
- No recovery actions (retry, archive, force-state) exist in Accounting — boundary preserved.

---

## Admin Exception UX

### Coaching Callout — Max Retries
**Before:** "Maximum retries reached. Escalation is required. See the escalation procedure in the runbook."
**After:** "Maximum retries reached. As Admin, you must now escalate this failure. See the escalation procedure in the runbook."
**Rationale:** Explicitly addresses the Admin operator and declares their ownership of the next step.

### State Override Banner
**Before:** "This is a last-resort recovery action. Only use if the provisioning saga is stuck and cannot recover automatically."
**After:** "Manual state override is an Admin-only last-resort recovery action. Only use if the provisioning saga is stuck and cannot recover automatically."
**Rationale:** Reinforces that this is an Admin-exclusive action.

### Verified Correct (no changes needed)
- Force Retry confirmation dialog includes idempotency warning and attempt counter.
- Archive confirmation dialog explains the consequence (removal from active queue).
- State Override confirmation dialog includes data-inconsistency warning and target state.
- Escalation badge ("Escalated") renders when `escalatedBy` is set.
- "Ack Escalation" button appears only for escalated runs with proper permission gate.
- Retry counter displays correctly: `Retry ({retryCount}/{ADMIN_RETRY_CEILING})`.
- Failure class badges and descriptions render from shared `FAILURE_CLASS_LABELS`/`FAILURE_CLASS_DESCRIPTIONS`.
- Coaching callouts link to runbook sections (retry procedure, escalation procedure, stuck-alert observability).
- Coaching callout for stuck runs correctly identifies transitional-state condition.

---

## Estimating Exception UX (Adjacent Verification)

### Verified Correct (no changes needed)
- "This failure requires Admin recovery." banner is explicit about ownership transfer.
- "Escalate to Admin" button clearly signals escalation (matches Accounting's new label).
- "Open Admin Recovery" button navigates to `/provisioning-failures?projectId=` (fixed in P5-02).
- Failure class descriptions correctly state coordinator vs Admin expectations for each class.
- `canCoordinatorRetry()` 5-condition gate correctly limits coordinator retry to transient failures.
- `failureClass === undefined` renders nothing (spec R1 compliance).
- Retry error message ("Retry failed. If the issue persists, contact Admin.") directs to Admin.
- Escalation error message ("Escalation failed. Please contact Admin directly.") directs to Admin.

---

## Cross-Surface Ownership Consistency

| Surface | Context | Message | Clarity |
|---------|---------|---------|---------|
| Accounting | Failed state text | "Site provisioning failed. Admin must resolve this failure." | High |
| Accounting | Action button | "Escalate to Admin" | High |
| Accounting | Queue tab | "Failed — Route to Admin" | High |
| Estimating | Non-retryable banner | "This failure requires Admin recovery." | High |
| Estimating | Escalation button | "Escalate to Admin" | High |
| Admin | Max retries callout | "As Admin, you must now escalate this failure." | High |
| Admin | State override banner | "Manual state override is an Admin-only last-resort recovery action." | High |

All surfaces now use consistent ownership-transfer language. Accounting and Estimating both use "Escalate to Admin" for their exception-routing actions. Admin explicitly declares "Admin-only" on its exclusive recovery actions.

---

## App Boundary Preservation

| Boundary | Status | Evidence |
|----------|--------|---------|
| Accounting has no recovery actions | Preserved | No retry, archive, escalate, or force-state buttons in Accounting |
| Accounting has no provisioning status reads | Preserved | No `IProvisioningStatus` imports in Accounting source |
| Admin recovery actions are permission-gated | Preserved | `PermissionGate` wraps all Admin-exclusive actions |
| Estimating retry is coordinator-bounded | Preserved | `canCoordinatorRetry()` + `HbcComplexityGate(standard)` |
| Escalation is one-way from coordinator | Preserved | Only Admin can clear via `acknowledgeEscalation()` |

---

## Documentation Updates

| File | Change |
|------|--------|
| `docs/reference/spfx-surfaces/controller-review-surface.md` | Updated tab label, button label, and prose to match new "Escalate to Admin" / "Failed — Route to Admin" wording |
| `docs/reference/provisioning/state-machine.md` | Updated retry entry point description (P5-03 state guard, P5-04 retryCount propagation, shared access model); added Reopen and Re-Provisioning section (P5-04) |

---

## Files Changed

| File | Change |
|------|--------|
| `apps/accounting/src/utils/stateDisplayHelpers.ts` | Failed state text: "Admin must resolve this failure" |
| `apps/accounting/src/pages/ProjectReviewDetailPage.tsx` | Button: "Send to Admin" → "Escalate to Admin" |
| `apps/accounting/src/pages/ProjectReviewQueuePage.tsx` | Tab: "Failed / Needs Routing" → "Failed — Route to Admin" |
| `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx` | Updated test assertions for new button label |
| `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx` | Updated test assertions for new tab label |
| `apps/admin/src/pages/ProvisioningOversightPage.tsx` | Strengthened coaching callout and override banner ownership language |
| `docs/reference/spfx-surfaces/controller-review-surface.md` | Updated tab label, button label, and prose |
| `docs/reference/provisioning/state-machine.md` | Updated retry description and added reopen section |
| `docs/architecture/reviews/phase-5-accounting-admin-exception-ux-verification-report.md` | This report |
