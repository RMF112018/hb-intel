# Prompt-04 — Phase 3 Status Feedback, Audit Trail, and Controller UX Hardening

## Objective

Audit the status, feedback, and audit visibility already present in the Accounting app and harden the remaining controller-facing UX gaps so users receive clear workflow context, action feedback, and read-only history visibility throughout review and handoff.

This prompt should not behave as though status or audit UX is absent today. It should start from the existing:

- banners
- `stateDisplayHelpers`
- `HbcSmartEmptyState`
- timeline behavior
- `HbcAuditTrailPanel` support

and then close the remaining gaps.

## Working Rules

1. Treat the live repo as the authority.
2. Do not re-read files already in active context unless needed to verify a contradiction or capture exact evidence.
3. Do not redesign the frozen workflow contract unless repo truth forces you to record a contradiction.
4. Do not move Admin-only recovery capabilities into Accounting.
5. Do not move requester or coordinator responsibilities into Accounting.
6. Keep audit/history behavior controller-appropriate and read-only.
7. Separate status visibility, audit evidence visibility, degraded-path handling, and controller UX polish in both implementation and reporting.

## Required Paths

- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/accounting/src/utils/stateDisplayHelpers.ts`
- `apps/accounting/src/test/*`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/responsive-failure-catalog.md`

## Required Tasks

- Audit and improve state labels, badges, banners, empty states, loading states, and error states in the Accounting workflow surfaces.
- Ensure controller-facing messages explain what happened and what happens next without leaking Admin-only operational detail.
- Strengthen timeline and audit rendering where appropriate without turning Accounting into a recovery console.
- Ensure success, warning, and failure feedback are specific and workflow-aware.
- Ensure post-handoff and post-failure messages are consistent with actual lifecycle semantics.
- Update or add tests for status feedback, audit visibility, empty/error-state behavior, and controller-facing messaging behavior.
- Reconcile any stale controller-surface doc text that no longer matches the live hardened UX.

## Deliverables

- Improved controller-facing operational UX across queue and detail surfaces.
- Updated tests and docs reflecting the hardened feedback model.
- Report update covering status, feedback, and audit hardening completion.

## Verification

- Run valid Accounting verification commands relevant to the touched scope:
  - `pnpm --filter @hbc/spfx-accounting build`
  - `pnpm --filter @hbc/spfx-accounting lint`
  - `pnpm --filter @hbc/spfx-accounting test`
- Verify the Accounting surface communicates clear next-step context in normal, warning, and failure cases.
- Verify history and audit surfaces remain read-only and controller-appropriate.
- Verify no messaging implies recovery actions that belong to Admin.

## Required Report Update

Update or create:

- `docs/architecture/reviews/accounting-phase-3-functional-completion-report.md`

The report update must include:

- progress notes
- exact repo-truth findings
- implementation summary
- touched tests and verification results
- blockers or unresolved items
- closure statements for status, feedback, and audit scope
- evidence paths for every meaningful conclusion

## Completion Standard

This prompt is complete only when the controller surface feels operationally credible without becoming a recovery console.

---

## Execution Record

- **Status:** COMPLETE
- **Date:** 2026-04-01
- **Changes:**
  - Added `NeedsClarification` warning banner with next-step guidance
  - Added `AwaitingExternalSetup` warning banner with "Resolve Hold" reference
  - Fixed operational detail: renamed "Last Updated" to "Completed", added "Approved By" field
  - Timeline: documented `IProjectSetupRequest` data-model constraint (no mid-lifecycle timestamps); approval info surfaced in operational detail instead
  - All existing banners (ReadyToProvision, Provisioning, Completed, Failed) verified aligned
  - Tests: 4 new tests (P3-04-001 through P3-04-004)
- **No recovery console behavior added:** All banners are informational/warning only, no Admin actions
- **Verification:** lint clean, build passed (tsc + vite), 36 tests passed (5 files)
- **No blockers** for Prompt-05
