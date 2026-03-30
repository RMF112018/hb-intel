# Estimating SPFx Project Information Step Acceptance Audit

**Date:** 2026-03-30
**Scope:** Focused acceptance audit for the Project Information step in the Estimating SPFx limited-release Project Setup wizard.

## Verdict

The Project Information step is ready for SharePoint UI vetting.

This verdict is based on verified code paths, targeted test coverage, and package-local build validation. A true rendered browser smoke for spacing and alignment remains environment-blocked in this workstation session because Playwright browser binaries are not installed locally.

## Confirmed Facts

### 1. Field structure and order match the approved layout

- `apps/estimating/src/components/project-setup/ProjectInfoStepBody.tsx` renders the Project Information step in this order:
  - `Project Name`
  - `Client Name`
  - grouped `Project Location`
    - `Street Address`
    - `City`
    - `County`
    - `State`
    - `Zip`
  - `Estimated Value`
  - `Expected Project Start Date`
  - `Procore Project`
- The legacy single `Project Location` input is no longer rendered.
- `State` uses the existing select pattern.
- `Procore Project` uses a select with `Yes` and `No`.

### 2. Validation and step completion use the new structured location fields

- `packages/features/estimating/src/project-setup/config/projectSetupSteps.ts` now requires:
  - `projectName`
  - `projectStreetAddress`
  - `projectCity`
  - `projectCounty`
  - `projectState`
  - `projectZip`
- `Estimated Value` validation remains intact.
- The review step still routes users back to Project Information when required Project Information fields are incomplete.

### 3. Draft persistence and resume behavior are compatible with the new field structure

- `apps/estimating/src/pages/NewRequestPage.tsx` persists Step 1 values through the existing draft/session flow using `Partial<IProjectSetupRequest>`.
- `packages/features/estimating/src/project-setup/config/projectLocationFields.ts` normalizes older draft/request data.
- The compatibility rule is intentional and simple:
  - if legacy data has `projectLocation` but no structured location fields, that legacy value is copied into `projectStreetAddress`
  - `projectCity`, `projectCounty`, `projectState`, and `projectZip` remain blank until the user fills them
- No attempt is made to infer city, county, state, or zip from the old free-text value.

### 4. Submission and review remain coherent

- `projectLocation` remains in the request contract as a derived compatibility field for the current live/mock submission path.
- `packages/features/estimating/src/project-setup/config/projectLocationFields.ts` rebuilds `projectLocation` as a comma-separated summary of populated structured location fields.
- `apps/estimating/src/components/project-setup/ReviewStepBody.tsx` renders the Project Information values in structured form, including the new location fields and `Procore Project`.

### 5. UI Review mode and Production mode remain compatible

- `apps/estimating/src/project-setup/backend/uiReviewProjectSetupClient.ts` now persists seeded and created requests with structured location fields plus the derived legacy `projectLocation`.
- `apps/estimating/src/pages/NewRequestPage.tsx` uses the same normalized field handling in both `ui-review` and `production`, so the Project Information step does not fork behavior by backend mode.
- No new runtime-mode-specific code path was introduced for this field restructure.

## Verification Evidence

The following commands were run successfully for this acceptance pass:

- `pnpm --filter @hbc/features-estimating test`
- `pnpm --filter @hbc/spfx-estimating exec tsc --noEmit`
- `pnpm --filter @hbc/spfx-estimating test`
- `pnpm --filter @hbc/spfx-estimating build`

Observed test/build status:

- `@hbc/features-estimating` project-setup tests passed, including field-map, step-validation, and location-helper coverage.
- `@hbc/spfx-estimating` typecheck passed.
- `@hbc/spfx-estimating` tests passed with `100 passed, 2 todo`.
- `@hbc/spfx-estimating` build passed.

## Inferred Conclusions

- The Project Information step is code-ready for SharePoint reviewer walkthroughs because:
  - the requested field structure is implemented end to end,
  - step validation aligns with the new required fields,
  - draft resume behavior remains intact,
  - the review screen displays the new structure coherently,
  - and both `ui-review` and `production` continue through the same normalized request model.

## Unresolved Items

- A true live rendered visual smoke for spacing and alignment of the Project Location group could not be completed in this workstation session because the local Playwright browser binary is missing and installation was blocked by the environment.
- This is an environment limitation for local browser automation, not a confirmed defect in the Estimating app code path.

## Non-Blocking Residual Warnings

- `pnpm --filter @hbc/spfx-estimating test` still emits existing non-blocking warnings involving:
  - `indexedDB` in session-state-related tests
  - React `act(...)` warnings
  - an unrelated DOM nesting warning in failure-detail test coverage
- `pnpm --filter @hbc/spfx-estimating build` still emits existing non-blocking Rollup warnings from third-party SignalR packaging.

## Acceptance Decision

Ready for SharePoint UI vetting.
