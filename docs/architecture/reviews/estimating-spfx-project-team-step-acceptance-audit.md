# Estimating SPFx Project Team Step Acceptance Audit

**Date:** 2026-03-30
**Scope:** Focused acceptance audit for the Project Team step in the Estimating SPFx limited-release Project Setup wizard.

## Verdict

The Project Team step is ready for SharePoint UI vetting.

This verdict is based on verified code paths, targeted Step 3 interaction coverage, and package-local build validation. A true live browser smoke remains environment-blocked in this workstation session, so final visual confirmation in SharePoint is still a manual reviewer check rather than a local automated browser pass.

## Confirmed Facts

### 1. Field structure and order match the approved Step 3 layout

- `apps/estimating/src/components/project-setup/TeamStepBody.tsx` renders the Project Team step in this exact order:
  - `Project Executive`
  - `Project Manager`
  - `Lead Estimator`
  - `Supporting Estimators`
  - `Additional Team Members`
  - `Timberscan Approver`
- The legacy Step 3 fields `Project Lead`, `Team Members`, and `Viewers` are no longer rendered in the Project Team step body.

### 2. Single-person vs multi-person behavior is intentionally split

- `Project Executive`, `Project Manager`, and `Lead Estimator` use the existing people-picker control but normalize to a single stored UPN by keeping only the first entered value.
- `Supporting Estimators` and `Additional Team Members` remain multi-person fields and preserve one-or-many UPNs.
- This split is covered in the Step 3 component and normalization path rather than by a second page-local state source.

### 3. Timberscan Approver is derived from the upstream selected team set

- `packages/features/estimating/src/project-setup/config/projectTeamFields.ts` derives eligible Timberscan approvers from the deduplicated union of:
  - `projectExecutiveUpn`
  - `projectManagerUpn`
  - `leadEstimatorUpn`
  - `supportingEstimatorUpns`
  - `additionalTeamMemberUpns`
- The option set preserves stable field order and removes duplicates when the same person appears in multiple upstream roles.
- `TeamStepBody.tsx` keeps the `Timberscan Approver` select disabled until at least one upstream person exists and shows helper text explaining that state.
- If the current `timberscanApproverUpn` is no longer in the eligible upstream set, normalization clears it intentionally rather than preserving an invalid off-team value.

### 4. Validation, draft persistence, and step completion use the new Step 3 model

- `packages/features/estimating/src/project-setup/config/projectSetupSteps.ts` requires exactly:
  - `projectExecutiveUpn`
  - `leadEstimatorUpn`
  - `timberscanApproverUpn`
- Step 3 validation also rejects a `timberscanApproverUpn` that is not present in the current eligible upstream team set.
- `apps/estimating/src/pages/NewRequestPage.tsx` continues to persist Step 3 values through the existing draft/session flow using `Partial<IProjectSetupRequest>`, with Step 3 normalization applied during draft hydration, interactive changes, and submit.
- Back/Next navigation and step completion continue to rely on the same shared wizard flow; no separate Step 3 navigation state was introduced.

### 5. Legacy draft compatibility and backend submission behavior are intentional

- Legacy drafts are handled lazily through `normalizeProjectSetupTeamFields(...)`:
  - `projectManagerUpn` hydrates from legacy `projectLeadId`
  - `additionalTeamMemberUpns` hydrates from legacy `groupMembers` excluding `projectLeadId`
  - `projectExecutiveUpn`, `leadEstimatorUpn`, and `timberscanApproverUpn` are not inferred from older data
- The current compatibility boundary is explicit:
  - the wizard and `ui-review` storage use the new Step 3 role fields,
  - production submit still derives the live backend contract from them using legacy `projectLeadId`, `groupLeaders`, and `groupMembers`,
  - `viewerUPNs` is no longer driven by the new Step 3 UI.

### 6. Review rendering and backend modes remain coherent

- `apps/estimating/src/components/project-setup/ReviewStepBody.tsx` renders the revised Project Team summary as:
  - `Project Executive`
  - `Project Manager`
  - `Lead Estimator`
  - `Supporting Estimators`
  - `Additional Team Members`
  - `Timberscan Approver`
- Multi-person fields render as readable comma-separated values in the review card.
- `apps/estimating/src/project-setup/backend/uiReviewProjectSetupClient.ts` seeds and stores the new Step 3 role fields while still normalizing derived legacy fields for compatibility.
- No Step 3-specific fork was introduced between `ui-review` and `production`; both modes use the same normalized frontend request model.

## Verification Evidence

The following commands were run successfully for this acceptance pass:

- `pnpm --filter @hbc/spfx-estimating exec vitest run src/test/TeamStepBody.test.tsx src/test/ReviewStepBody.test.tsx`
- `pnpm --filter @hbc/spfx-estimating exec tsc --noEmit`
- `pnpm --filter @hbc/spfx-estimating test`
- `pnpm --filter @hbc/spfx-estimating build`

Observed status:

- Focused Step 3 component/review coverage passed with `5` tests.
- `@hbc/spfx-estimating` typecheck passed.
- `@hbc/spfx-estimating` tests passed with `108 passed, 2 todo`.
- `@hbc/spfx-estimating` build passed.

Additional evidence:

- `pnpm --filter @hbc/features-estimating test` again showed the visible Step 3-related suites green, including:
  - `projectTeamFields.test.ts`
  - `projectSetupSteps.test.ts`
  - `projectSetupFieldMap.test.ts`
  - `clarificationReturn.test.ts`
- In this workstation environment, that command still did not emit a clean final footer before stalling, so it is recorded as supportive evidence rather than the sole acceptance signal.

## Inferred Conclusions

- The Project Team step is code-ready for SharePoint reviewer walkthroughs because:
  - the old Step 3 fields have been fully replaced in the rendered wizard,
  - the requested role structure is implemented end to end,
  - Timberscan eligibility is deduplicated and centrally enforced,
  - invalid approver selections are cleared predictably,
  - draft resume behavior remains coherent,
  - and review rendering reflects the new Step 3 model accurately.

## Unresolved Items

- A true live browser smoke for final visual spacing, picker ergonomics, and SharePoint-hosted interaction could not be completed in this workstation session, so that remains a manual UI-vetting check.
- This is an environment limitation for local browser interaction, not a confirmed defect in the Estimating code path.

## Non-Blocking Residual Warnings

- `pnpm --filter @hbc/spfx-estimating test` still emits existing non-blocking warnings involving:
  - `indexedDB` in session-state-related tests,
  - React `act(...)` warnings,
  - an unrelated invalid URL warning in complexity coverage.
- `pnpm --filter @hbc/spfx-estimating build` still emits existing non-blocking Rollup warnings from third-party SignalR packaging.

## Acceptance Decision

Ready for SharePoint UI vetting.
