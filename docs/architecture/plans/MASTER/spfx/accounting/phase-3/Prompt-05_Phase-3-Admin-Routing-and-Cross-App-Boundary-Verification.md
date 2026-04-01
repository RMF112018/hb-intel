# Prompt-05 — Phase 3 Admin Routing and Cross-App Boundary Verification

## Objective

Verify and complete the Accounting-to-Admin routing behavior for failed or exception workflow cases while preserving clean boundary discipline between the controller surface and the Admin recovery surface.

This prompt is about controller-visible handoff, not about re-implementing Admin recovery features inside Accounting.

## Working Rules

1. Treat the live repo as the authority.
2. Do not re-read files already in active context unless needed to verify a contradiction or capture exact evidence.
3. Do not redesign the frozen workflow contract unless repo truth forces you to record a contradiction.
4. Do not move Admin-only recovery capabilities into Accounting.
5. Keep the distinction clear between:
   - Accounting-visible handoff behavior
   - Admin-owned recovery actions
   - cross-app routing and degraded-path handling
6. Update documentation and report artifacts as part of the work.

## Required Paths

- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/accounting/src/utils/crossAppUrls.ts`
- `apps/admin/src/pages/*`
- `apps/accounting/src/test/*`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`
- `docs/reference/spfx-surfaces/responsive-failure-catalog.md`

## Required Tasks

- Verify the `Send to Admin` behavior in the Accounting app for failed requests.
- Verify the generated Admin URL, parameter shape, and route target are correct and resilient.
- Explicitly verify the current route target pattern:
  - `/provisioning-oversight?projectId=...`
- Verify cross-app navigation degrades safely when Admin URL configuration is absent or invalid.
- Ensure Accounting does not expose retry, force-state, archive, escalation-acknowledgment, or override actions.
- Ensure failure-state messaging directs the controller appropriately without taking on Admin responsibilities.
- Add or update tests for cross-app routing and boundary behavior.
- Update documentation where needed to reflect the final cross-app contract.

## Deliverables

- Verified and corrected Accounting-to-Admin routing behavior.
- Boundary-safe failure routing with no Admin-action leakage into Accounting.
- Report update with explicit closure statements for Admin-routing and boundary verification.

## Verification

- Run valid Accounting verification commands relevant to the touched scope:
  - `pnpm --filter @hbc/spfx-accounting build`
  - `pnpm --filter @hbc/spfx-accounting lint`
  - `pnpm --filter @hbc/spfx-accounting test`
- Verify Admin routing only appears in the intended states.
- Verify cross-app navigation degrades safely when Admin URL configuration is absent or invalid.
- Verify the Accounting surface remains free of Admin recovery controls.

## Required Report Update

Update or create:

- `docs/architecture/reviews/accounting-phase-3-functional-completion-report.md`

The report update must include:

- progress notes
- exact repo-truth findings
- implementation summary
- touched tests and verification results
- blockers or unresolved items
- closure statements for boundary-verification scope
- evidence paths for every meaningful conclusion

## Completion Standard

This prompt is complete only when failed-state controller handoff is clean, accurate, and boundary-safe.
