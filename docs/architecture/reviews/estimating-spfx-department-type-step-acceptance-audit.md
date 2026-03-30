# Estimating SPFx Department & Type Step Acceptance Audit

**Date:** 2026-03-30
**Scope:** Focused acceptance audit for the Department & Type step in the Estimating SPFx limited-release Project Setup wizard.

## Verdict

The Department & Type step is ready for SharePoint UI vetting.

This verdict is based on verified code paths, targeted test coverage, and package-local build validation. A true rendered browser smoke remains environment-blocked in this workstation session because no local browser automation binary was available for live interaction.

## Confirmed Facts

### 1. Field structure and order match the approved layout

- `apps/estimating/src/components/project-setup/DepartmentStepBody.tsx` renders the Department & Type step in this exact order:
  - `Project Stage`
  - `Office & Division`
  - `Department`
  - `Project Type`
  - `Contract Type`
- All five controls use `HbcSelect`.
- `Project Type` is rendered as a combobox-style searchable select and stays disabled until `Department` is chosen.

### 2. Option sets match the current requested structure

- `packages/features/estimating/src/project-setup/config/departmentTypeOptions.ts` defines:
  - the full `Office & Division` option list in the approved order,
  - the six requested `Project Stage` values,
  - the full requested `Contract Type` option list,
  - department-driven `Project Type` registries for `commercial` and `luxury-residential`.
- Category-like `Project Type` headings such as `Retail Facilities` and `Luxury and High-End Residential` are intentionally rendered as non-selectable grouped labels rather than valid values.

### 3. Project Type behavior is intentionally department-driven

- `department` remains the canonical downstream field with values `commercial` and `luxury-residential`.
- `Project Type` options are selected from the registry for the current canonical `department`.
- The reset rule is intentional:
  - changing `department` preserves the current `projectType` only when that value remains valid for the newly selected department,
  - otherwise `projectType` is cleared and must be reselected.
- This behavior is covered in `apps/estimating/src/test/DepartmentStepBody.test.tsx`.

### 4. Draft persistence and compatibility behavior are intentional

- `apps/estimating/src/pages/NewRequestPage.tsx` continues to persist Step 2 values through the existing draft/session flow using `Partial<IProjectSetupRequest>`.
- Older Step 2 draft values are handled lazily rather than rewritten in storage:
  - legacy `projectType` and `contractType` values are preserved in state,
  - legacy `projectStage` is preserved only if it matches the new six-value set,
  - `officeDivision` remains unset for older drafts.
- Unsupported legacy `projectType` values are not auto-mapped; users must choose a current valid option before Step 2 can validate cleanly.

### 5. Review rendering and backend modes remain coherent

- `apps/estimating/src/components/project-setup/ReviewStepBody.tsx` renders:
  - `Project Stage`
  - `Office & Division`
  - `Department`
  - `Project Type`
  - `Contract Type`
  with graceful display for unset optional values.
- `apps/estimating/src/project-setup/backend/uiReviewProjectSetupClient.ts` seeds and stores Step 2 values using valid current options.
- No Step 2-specific fork was introduced between `ui-review` and `production`; both modes use the same frontend request model and review rendering path.

## Verification Evidence

The following commands were run successfully for this acceptance pass:

- `pnpm --filter @hbc/spfx-estimating exec tsc --noEmit`
- `pnpm --filter @hbc/spfx-estimating test`
- `pnpm --filter @hbc/spfx-estimating build`

Observed status:

- `@hbc/spfx-estimating` typecheck passed.
- `@hbc/spfx-estimating` tests passed with `104 passed, 2 todo`.
- `@hbc/spfx-estimating` build passed.

Additional evidence:

- `pnpm --filter @hbc/features-estimating test` again showed the visible Step 2-related suites green, including:
  - `departmentTypeOptions.test.ts`
  - `projectSetupSteps.test.ts`
  - `projectSetupFieldMap.test.ts`
- In this workstation environment, that command still did not emit a clean final footer before stalling, so it is recorded as supportive evidence rather than the sole acceptance signal.

## Inferred Conclusions

- The Department & Type step is code-ready for SharePoint reviewer walkthroughs because:
  - the requested field order is implemented,
  - the required option registries are wired in,
  - `Project Type` behavior is intentionally gated by canonical `department`,
  - incompatible cross-department values are cleared predictably,
  - draft resume behavior remains coherent,
  - and review rendering reflects the revised Step 2 model accurately.

## Unresolved Items

- A true live rendered browser smoke for final combobox usability, wrapping, and spacing could not be completed in this workstation session because local browser automation was unavailable.
- This is an environment limitation for local browser interaction, not a confirmed defect in the Estimating code path.

## Non-Blocking Residual Warnings

- `pnpm --filter @hbc/spfx-estimating test` still emits existing non-blocking warnings involving:
  - `indexedDB` in session-state-related tests,
  - React `act(...)` warnings,
  - an unrelated DOM nesting warning in failure-detail coverage.
- `pnpm --filter @hbc/spfx-estimating build` still emits existing non-blocking Rollup warnings from third-party SignalR packaging.

## Acceptance Decision

Ready for SharePoint UI vetting.
