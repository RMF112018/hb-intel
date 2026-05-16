# Prompt 01 — Render Both Primary Cards During Load and Error

## Role

Act as a senior React/SPFx UX performance engineer working in `RMF112018/hb-intel`.

## Objective

Implement the first and highest-ROI remediation:

> Ensure the My Dashboard primary-page composition always renders both primary cards — **My Projects** and **Adobe Sign Agreement Activity** — during home-envelope `loading`, `error`, and resolved readiness variants.

This change must materially improve perceived performance and permit the My Projects data request to begin earlier.

## Read Before Editing

Use the attached package files as governing direction:

- `01_Proposed_Implementation_Plan.md`
- `02_Target_Architecture_And_Closed_Decisions.md`
- `03_Validation_Matrix_And_Acceptance_Criteria.md`

Do **not** re-read files that remain within current context or memory unless required.

## Primary Files to Edit

- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.test.tsx`
- `apps/my-dashboard/src/shell/MyWorkSurfaceRouter.test.tsx`

## Required Production Change

### Current problem
`MyWorkHomeSurface` currently returns an Adobe-only tree when:
- `readinessVariant === 'loading'`
- `readinessVariant === 'error'`

### Required new behavior
Render the two-card tree in **all** readiness variants:

```text
My Projects
Adobe Sign Agreement Activity
```

### Preserve
- hidden readiness marker:
  - `data-my-work-readiness-state="loading"`
  - `data-my-work-readiness-state="error"`
- Adobe card state behavior:
  - loading variant must still report Adobe loading,
  - error variant must still report backend-unavailable.
- locked span overrides and two-card choreography.

### Do not
- change Adobe completed-view deferred-fetch behavior,
- alter module copy,
- add caching,
- add telemetry in this prompt.

## Required Test Changes

### A. `MyWorkHomeSurface.test.tsx`
Update loading and error variant expectations.

#### Loading variant should now assert:
- loading marker exists,
- card roles equal:
  ```text
  ['my-projects-home', 'adobe-sign-action-queue']
  ```
- Adobe card state remains `loading`,
- My Projects card exists.

#### Error variant should now assert:
- error marker exists,
- card roles equal:
  ```text
  ['my-projects-home', 'adobe-sign-action-queue']
  ```
- Adobe card state remains `backend-unavailable`,
- My Projects card exists.

### B. `MyWorkSurfaceRouter.test.tsx`
Add or revise unresolved-home-envelope coverage so that when:

```ts
getMyWorkHome: () => new Promise(() => {})
```

the test proves:
- loading marker exists,
- My Projects card exists,
- Adobe card exists,
- no false source-status ready marker appears.

If the existing stub allows it, also prove `getMyProjectLinks` is invoked while home remains unresolved. If implementation details require a more focused provider/card integration test, add the strongest stable test that proves the earlier request initiation.

## Validation

Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard check-types
```

## Required Closeout Format

Return:

### Summary
What changed and why.

### Files Modified
Bullet list.

### Tests / Validation
Exact command results.

### Behavioral Outcome
Explain how this reduces perceived and actual dashboard time-to-useful.

### Commit Recommendation
Provide a clean commit message in the existing repo style.
