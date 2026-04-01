# Prompt-03 — Phase 3 External Setup and Launch Action Completion

## Objective

Close the current `AwaitingExternalSetup` dead-end and complete the final controller-side handoff flow in the Accounting app so the controller can finish pre-provisioning business work in alignment with the hardened backend lifecycle contract.

This prompt must stay grounded in current repo truth: the live surface has no forward action from `AwaitingExternalSetup`, and current UI messaging already reflects automatic provisioning start after approval. Do not assume a distinct controller-side launch action exists today unless earlier-phase contract work explicitly changed that behavior.

## Working Rules

1. Treat the live repo as the authority.
2. Do not re-read files already in active context unless needed to verify a contradiction or capture exact evidence.
3. Do not redesign the frozen workflow contract unless Prompt-01 evidence and earlier-phase outputs explicitly require documenting a dependency or contradiction.
4. Do not move Admin-only recovery capabilities into Accounting.
5. Do not move requester or coordinator responsibilities into Accounting.
6. Compare the UI behavior against current provisioning references, not only historical lifecycle plans.
7. Separate confirmed repo fact, repo-doc intent, implementation recommendation, and unresolved dependency in report updates.

## Required Paths

- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/accounting/src/components/*`
- `apps/accounting/src/utils/stateDisplayHelpers.ts`
- `apps/accounting/src/test/*`
- `packages/provisioning/src/*`
- `docs/reference/provisioning/state-machine.md`
- `docs/reference/provisioning/saga-steps.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`

## Required Tasks

- Implement the correct UI path for requests in `AwaitingExternalSetup`.
- Implement the correct controller-side handoff or final action path according to the frozen backend contract and current repo truth.
- Ensure project-number capture, validation presentation, and action enablement are clear and deterministic.
- Ensure controller-facing wording is semantically aligned with actual backend behavior.
- Ensure post-action navigation and feedback are correct after external-setup completion and final handoff.
- Do not alter backend lifecycle authority in this prompt except for strictly necessary client-alignment changes.
- Add or update tests for external-setup completion and final-action flows.

## Deliverables

- A complete external-setup exit path in the Accounting app.
- Corrected controller-side handoff wording and interaction behavior.
- Updated tests for the new or corrected flow.
- Report update with explicit closure of the dead-end-state issue and any preserved dependency on Phase 2 contract output.

## Verification

- Run valid Accounting verification commands relevant to the touched scope:
  - `pnpm --filter @hbc/spfx-accounting build`
  - `pnpm --filter @hbc/spfx-accounting lint`
  - `pnpm --filter @hbc/spfx-accounting test`
- If this prompt expands into shared provisioning package changes, run the smallest additional package-local verification needed and explain why.
- Verify no request can become stranded in `AwaitingExternalSetup` from the controller perspective.
- Verify the final controller-side action is shown and enabled only under the intended conditions.
- Verify user-facing wording matches actual lifecycle semantics instead of older launch assumptions.

## Required Report Update

Update or create:

- `docs/architecture/reviews/accounting-phase-3-functional-completion-report.md`

The report update must include:

- progress notes
- exact repo-truth findings
- implementation summary
- touched tests and verification results
- blockers or unresolved items
- closure statements for external-setup and handoff scope
- evidence paths for every meaningful conclusion
