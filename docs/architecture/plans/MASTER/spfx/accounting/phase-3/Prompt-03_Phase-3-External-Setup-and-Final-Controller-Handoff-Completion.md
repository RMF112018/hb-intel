# Prompt-03 — Phase 3 External Setup and Final Controller Handoff Completion

## Objective

Close the current `AwaitingExternalSetup` dead-end and complete the final controller-side handoff flow in the Accounting app so the controller can finish pre-provisioning business work in alignment with the live backend lifecycle contract.

This prompt must stay grounded in current repo truth:

- the live surface has no forward action from `AwaitingExternalSetup`
- the backend still treats `AwaitingExternalSetup -> ReadyToProvision` as a valid controller transition requiring a valid `projectNumber`
- current UI messaging already reflects automatic provisioning start after approval
- the current backend auto-starts provisioning once the controller advances to `ReadyToProvision`

Do not assume or invent a distinct controller-side provisioning launch action unless committed earlier-phase artifacts in the current workspace explicitly changed that behavior and that change remains consistent with current repo truth.

## Working Rules

1. Treat the live repo as the authority.
2. Do not re-read files already in active context unless needed to verify a contradiction or capture exact evidence.
3. Do not redesign the frozen workflow contract unless Prompt-01 evidence and committed earlier-phase outputs in the current workspace explicitly require documenting a dependency or contradiction.
4. Do not move Admin-only recovery capabilities into Accounting.
5. Do not move requester or coordinator responsibilities into Accounting.
6. Compare the UI behavior against current provisioning references and the live backend endpoint, not only historical lifecycle plans.
7. Separate confirmed repo fact, repo-doc intent, implementation recommendation, and unresolved dependency in report updates.
8. Explicitly distinguish:
   - controller completion of external prerequisites
   - controller advancement into `ReadyToProvision`
   - backend auto-start of provisioning
   - system-owned progression into `Provisioning`

## Required Paths

- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/accounting/src/utils/stateDisplayHelpers.ts`
- `apps/accounting/src/test/*`
- `backend/functions/src/functions/projectRequests/index.ts`
- `packages/provisioning/src/bic-config.ts`
- `docs/reference/provisioning/state-machine.md`
- `docs/reference/provisioning/saga-steps.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`

## Required Tasks

- Implement the correct UI path for requests in `AwaitingExternalSetup`.
- Implement the correct final controller handoff path according to the current backend contract and current repo truth.
- Ensure project-number capture, validation presentation, and action enablement are clear and deterministic in the relevant controller path.
- Ensure controller-facing wording is semantically aligned with actual backend behavior.
- Ensure post-action navigation and feedback are correct after external-setup completion and final handoff.
- Do not alter backend lifecycle authority in this prompt except for a strictly necessary client-alignment change that you can justify with direct evidence.
- Update or add tests for external-setup completion and final-handoff flows.
- Update the controller surface doc if it still contains stale approval / handoff wording.

## Deliverables

- A complete external-setup exit path in the Accounting app.
- Corrected controller-side handoff wording and interaction behavior.
- Updated tests for the new or corrected flow.
- Report update with explicit closure of the dead-end-state issue and any preserved dependency on earlier-phase contract output.

## Verification

- Run valid Accounting verification commands relevant to the touched scope:
  - `pnpm --filter @hbc/spfx-accounting build`
  - `pnpm --filter @hbc/spfx-accounting lint`
  - `pnpm --filter @hbc/spfx-accounting test`
- If this prompt expands into shared provisioning package changes, run the smallest additional package-local verification needed and explain why.
- Verify no request can become stranded in `AwaitingExternalSetup` from the controller perspective.
- Verify the final controller-side action is shown and enabled only under the intended conditions.
- Verify user-facing wording matches actual lifecycle semantics instead of older launch assumptions.
- Verify the implementation does not create a second separate controller-side provisioning start concept that conflicts with backend auto-trigger behavior.

## Required Report Update

Update or create:

- `docs/architecture/reviews/accounting-phase-3-functional-completion-report.md`

The report update must include:

- progress notes
- exact repo-truth findings
- implementation summary
- touched tests and verification results
- blockers or unresolved items
- closure statements for external-setup and final-handoff scope
- evidence paths for every meaningful conclusion

## Completion Standard

This prompt is complete only when the controller has a coherent, contract-safe way to get from `AwaitingExternalSetup` through the final handoff without inventing a stale launch model.
