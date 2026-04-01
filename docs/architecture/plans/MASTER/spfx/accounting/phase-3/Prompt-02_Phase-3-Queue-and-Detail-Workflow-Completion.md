# Prompt-02 — Phase 3 Queue and Detail Workflow Completion

## Objective

Implement the missing or incomplete controller workflow behavior in the Accounting queue and detail surfaces so the controller can execute the required review flow end to end, using Prompt-01’s repo-truth inventory as the worklist.

This prompt should complete the queue/detail workflow that is actually missing, not relitigate ownership or redesign lifecycle semantics.

## Working Rules

1. Treat the live repo as the authority.
2. Do not re-read files already in active context unless needed to verify a contradiction or capture exact evidence.
3. Use Prompt-01 findings as the starting point; do not broaden scope beyond queue/detail workflow completion.
4. Do not move Admin-only recovery capabilities into Accounting.
5. Do not move requester or coordinator responsibilities into Accounting.
6. Preserve the existing controller role of Accounting while removing misleading or incomplete affordances.
7. Explicitly distinguish:
   - correcting misleading affordances
   - adding missing controller-safe affordances
   - preserving backend-valid but non-UI transitions for later-stage handling if Prompt-01 proved they should remain non-UI
8. Separate confirmed repo fact, repo-doc intent, implementation recommendation, and unresolved dependency in report updates.

## Required Paths

- `apps/accounting/src/router/routes.ts`
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/accounting/src/utils/stateDisplayHelpers.ts`
- `apps/accounting/src/test/*`
- `docs/reference/spfx-surfaces/controller-review-surface.md`

## Required Tasks

- Use the Prompt-01 gap inventory as the worklist.
- Complete or correct queue filters, queue columns, row actions, and navigation flow where needed.
- Complete or correct detail-page action visibility by request state.
- Verify the queue tabs and detail affordances match real state handling rather than generic workflow assumptions.
- Remove or correct misleading action affordances without introducing Admin recovery controls.
- Preserve the bounded role of Accounting as the controller surface.
- Update or add tests to cover the completed queue/detail behavior.

## Deliverables

- Updated queue and detail implementation aligned to the frozen contract and current repo truth.
- Test updates covering corrected controller workflow behavior.
- Report update with closure notes for queue/detail completion scope.

## Verification

- Run valid Accounting verification commands relevant to the touched scope:
  - `pnpm --filter @hbc/spfx-accounting build`
  - `pnpm --filter @hbc/spfx-accounting lint`
  - `pnpm --filter @hbc/spfx-accounting test`
- Verify a controller can navigate from queue to detail and back without broken state handling.
- Verify queue tabs and detail actions reflect the real current request states.
- Verify no queue/detail change silently adds Admin-only recovery behavior to Accounting.
- Verify no queue/detail change implies a controller-side provisioning launch step that the current backend contract does not require.

## Required Report Update

Update or create:

- `docs/architecture/reviews/accounting-phase-3-functional-completion-report.md`

The report update must include:

- progress notes
- exact repo-truth findings
- implementation summary
- touched tests and verification results
- blockers or unresolved items
- closure statements for queue/detail scope
- evidence paths for every meaningful conclusion

## Completion Standard

This prompt is complete only when the controller can move through the queue/detail review experience without misleading state handling or unbounded ownership drift.

---

## Execution Record

- **Status:** COMPLETE
- **Date:** 2026-04-01
- **Changes:**
  - Queue: "Pending Review" tab now includes both `Submitted` and `UnderReview` requests (previously `Submitted` was invisible)
  - Detail: Added "Begin Review" action for `Submitted` state (`Submitted → UnderReview`)
  - Tests: Added 3 tests (P3-02-001, P3-02-002, P3-02-003)
- **Verification:** lint clean, build passed (tsc + vite), 29 tests passed (5 files)
- **No boundary violations:** No Admin/coordinator responsibilities added
- **No blockers** for Prompt-03
