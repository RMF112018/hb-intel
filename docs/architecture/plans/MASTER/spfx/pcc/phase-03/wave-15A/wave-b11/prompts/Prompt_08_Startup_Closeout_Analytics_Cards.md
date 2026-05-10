# Prompt 08 — Startup & Closeout Analytics Cards — Updated

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

Prompt 01 added `spanOverrides`.
Prompt 02 locked Project Home choreography and gateways.
Prompt 03 added the PCC-owned direct ECharts analytics foundation.
Prompt 04 inserted Project Home analytics cards.
Prompt 07 inserted Estimating & Preconstruction analytics cards conditionally into `PccPrimaryDashboardSurface`.

Prompt 08 adds Project Startup & Closeout dashboard analytics only.

## Objective

Add three deterministic preview analytics cards to the **Project Startup & Closeout** primary dashboard:

```text
1. Startup Readiness Completion
2. Responsibility Coverage
3. Closeout & Warranty Readiness
```

The implementation must:

- render these cards only for `activePrimaryTabId === 'startup-closeout'`;
- place them inside the shared `PccPrimaryDashboardSurface` without leaking to unrelated dashboards;
- preserve the existing Prompt 07 Estimating & Preconstruction conditional analytics;
- support startup readiness, responsibility coverage, closeout, and warranty posture visibility;
- avoid implying live startup, closeout, warranty, approval, or source-system integration;
- preserve read-only/no-writeback posture;
- avoid dependency, SPFx-version, analytics-foundation, navigation-registry, Project Home, and unrelated-surface changes.

## Current Repo-Truth Baseline

Expected minimum ancestry:

```text
Phase 5 closeout: d06d614a02f16123d8c8252f71cebc22f348bc51
Prompt 01: 6e6454aafc4c9a6ca04e58611139eddab9616ae7
Prompt 02: e5f9783e18f0a5860abec589b01bbc8f58ed1551
Prompt 03: 08f133842fc6e8c10f3bfa5dd4fab49178942352
Prompt 04: fdedc65dbe88850fd58d4fdadb394f7043ca6619
Prompt 07: 75845d253951ae19248b4b820e17ffb50db443e3
```

Expected current PCC package state:

```text
apps/project-control-center/package.json includes echarts ^5.6.0
apps/project-control-center/package.json does not include echarts-for-react
apps/project-control-center/config/package-solution.json = 1.0.0.216
pnpm-lock.yaml md5 = 7c19ccfa8718a42f7f55ce178a626996
```

Current shared dashboard repo truth:

```text
PccPrimaryDashboardSurface currently renders:
1. Overview dashboard card
2. Module status dashboard card
3. Conditional Estimating & Preconstruction analytics cards only when activePrimaryTabId === 'estimating-preconstruction'
4. Selected module dashboard card
```

Startup & Closeout primary tab repo truth:

```text
Primary tab id: startup-closeout
Primary tab label/title: Project Startup & Closeout
Current modules:
- startup-center
- responsibility-matrix
- closeout
- closeout-turnover-tracker
- warranty
- lessons-learned
- subcontractor-performance
```

Module state posture to preserve:

```text
startup-center: preview / selectable
responsibility-matrix: preview / selectable
closeout: preview / selectable
closeout-turnover-tracker: deferred / non-selectable
warranty: deferred / non-selectable
lessons-learned: deferred / non-selectable
subcontractor-performance: deferred / non-selectable
```

Important repo-truth correction:

```text
apps/project-control-center/src/layout/pccDashboardComposition.ts
```

does not exist in the current repo-truth. Do not depend on it. Do not create it in Prompt 08 unless it already exists from intervening user-approved work and is the established seam.

## Preflight

Run this preflight before editing:

```bash
git status --short
git rev-parse HEAD
git log --oneline -10
git merge-base --is-ancestor d06d614a02f16123d8c8252f71cebc22f348bc51 HEAD && echo "phase-5-closeout-present" || echo "phase-5-closeout-missing"
git merge-base --is-ancestor 6e6454aafc4c9a6ca04e58611139eddab9616ae7 HEAD && echo "prompt-01-present" || echo "prompt-01-missing"
git merge-base --is-ancestor e5f9783e18f0a5860abec589b01bbc8f58ed1551 HEAD && echo "prompt-02-present" || echo "prompt-02-missing"
git merge-base --is-ancestor 08f133842fc6e8c10f3bfa5dd4fab49178942352 HEAD && echo "prompt-03-present" || echo "prompt-03-missing"
git merge-base --is-ancestor fdedc65dbe88850fd58d4fdadb394f7043ca6619 HEAD && echo "prompt-04-present" || echo "prompt-04-missing"
git merge-base --is-ancestor 75845d253951ae19248b4b820e17ffb50db443e3 HEAD && echo "prompt-07-present" || echo "prompt-07-missing"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
node -e "const p=require('./apps/project-control-center/package.json'); console.log(JSON.stringify({dependencies:p.dependencies, devDependencies:p.devDependencies}, null, 2))"
test -d apps/project-control-center/src/analytics && echo "analytics-dir-present" || echo "analytics-dir-missing"
test -f apps/project-control-center/src/layout/pccDashboardComposition.ts && echo "composition-present" || echo "composition-missing"
git grep -n "echarts-for-react" -- apps/project-control-center/package.json apps/project-control-center/src || true
```

Stop if any required ancestry check through Prompt 07 is missing, if `echarts` is missing, if `echarts-for-react` appears in PCC package/source, if analytics foundation is missing, or if the working tree has unrelated dirty files that cannot be accounted for.

## Global Instructions

- Do not install dependencies.
- Do not add `echarts` or `echarts-for-react`.
- Do not import `echarts-for-react` in PCC.
- Do not use `packages/ui-kit/src/HbcChart/EChartsRenderer.tsx`.
- Do not modify `packages/models/src/pcc/PccPrimaryNavigation.ts`.
- Do not change module ids, module labels, module states, or selectability.
- Do not convert deferred startup/closeout modules into selectable/available modules.
- Do not edit the Prompt 03 analytics foundation unless a type issue blocks usage.
- Do not edit Project Home analytics.
- Do not remove or alter Prompt 07 Estimating analytics behavior.
- Do not add analytics cards to unrelated primary dashboards.
- Do not bump `apps/project-control-center/config/package-solution.json`; PCC remains `1.0.0.216`.
- Do not edit `tools/spfx-shell/config/package-solution.json`.
- Do not introduce live integrations, writeback, approval execution, source mutation, URL routing, warranty-system integration, or random render-time data.
- Do not render developer/internal copy in the UI.
- Preserve PCC read-only / preview / no-writeback posture.
- Preserve every dashboard card as a direct child of `[data-pcc-bento-grid]`.
- Do not use `grid-auto-flow: dense`.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not add card-level active-panel ownership.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Use production-grade, end-user-facing copy only.
- Do not run Playwright for Prompt 08 unless the user explicitly requests it.

## Scope

Likely modify:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
```

Likely create:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/startupCloseoutAnalytics.ts
apps/project-control-center/src/tests/PccStartupCloseoutAnalyticsCards.test.tsx
```

Do not edit:

```text
apps/project-control-center/src/analytics/*
apps/project-control-center/src/surfaces/projectHome/*
apps/project-control-center/src/surfaces/phase05Dashboard/estimatingPreconstructionAnalytics.ts
apps/project-control-center/config/package-solution.json
tools/spfx-shell/config/package-solution.json
packages/models/src/pcc/PccPrimaryNavigation.ts
```

## Required Analytics Cards

Create exactly these three Project Startup & Closeout analytics cards.

### 1. Startup Readiness Completion

Related module: `startup-center`

Chart kind: `grouped-bar`

Visible copy:

```text
Title: Startup Readiness Completion
Eyebrow: Startup readiness
Description: Preview of startup readiness completion across onboarding, controls, safety, and source setup.
```

State/source:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic startup and closeout sample
sampleData: true
```

Dataset:

```ts
[
  { category: 'Onboarding', complete: 86, open: 14 },
  { category: 'Project controls', complete: 72, open: 28 },
  { category: 'Safety setup', complete: 91, open: 9 },
  { category: 'Source setup', complete: 68, open: 32 },
]
```

Summary:

```ts
[
  { label: 'Onboarding complete', value: '86%', tone: 'success' },
  { label: 'Controls complete', value: '72%', tone: 'info' },
  { label: 'Source setup open', value: '32%', tone: 'warning' },
]
```

### 2. Responsibility Coverage

Related module: `responsibility-matrix`

Chart kind: `progress-bars`

Visible copy:

```text
Title: Responsibility Coverage
Eyebrow: Responsibility matrix
Description: Preview of responsibility coverage across owner, design, trade, and internal project roles.
```

State/source:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic startup and closeout sample
sampleData: true
```

Dataset:

```ts
[
  { category: 'Owner obligations', covered: 82, open: 18 },
  { category: 'Design responsibilities', covered: 76, open: 24 },
  { category: 'Trade responsibilities', covered: 69, open: 31 },
  { category: 'Internal owners', covered: 88, open: 12 },
]
```

Summary:

```ts
[
  { label: 'Internal owners assigned', value: '88%', tone: 'success' },
  { label: 'Trade responsibility coverage', value: '69%', tone: 'warning' },
  { label: 'Open responsibility gaps', value: '31%', tone: 'warning' },
]
```

### 3. Closeout & Warranty Readiness

Related modules: `closeout`, `warranty`, `closeout-turnover-tracker`

Chart kind: `stacked-bar`

Visible copy:

```text
Title: Closeout & Warranty Readiness
Eyebrow: Closeout and warranty
Description: Preview of closeout, turnover, and warranty readiness across required closeout lanes.
```

State/source:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic startup and closeout sample
sampleData: true
```

Dataset:

```ts
[
  { category: 'Closeout', ready: 63, open: 37 },
  { category: 'Turnover', ready: 58, open: 42 },
  { category: 'Warranty', ready: 44, open: 56 },
  { category: 'Lessons learned', ready: 35, open: 65 },
]
```

Summary:

```ts
[
  { label: 'Closeout ready', value: '63%', tone: 'info' },
  { label: 'Turnover open', value: '42%', tone: 'warning' },
  { label: 'Warranty open', value: '56%', tone: 'danger' },
]
```

## Startup & Closeout Analytics Helper

Create:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/startupCloseoutAnalytics.ts
```

Use `buildPreviewAnalyticsViewModel` from the Prompt 03 analytics foundation.

Required exports:

```ts
export type PccStartupCloseoutAnalyticsCardKey =
  | 'startupReadinessCompletion'
  | 'responsibilityCoverage'
  | 'closeoutWarrantyReadiness';

export const STARTUP_CLOSEOUT_ANALYTICS_CARD_KEYS = [
  'startupReadinessCompletion',
  'responsibilityCoverage',
  'closeoutWarrantyReadiness',
] as const;

export const STARTUP_CLOSEOUT_ANALYTICS_CARD_TITLES = {
  startupReadinessCompletion: 'Startup Readiness Completion',
  responsibilityCoverage: 'Responsibility Coverage',
  closeoutWarrantyReadiness: 'Closeout & Warranty Readiness',
} as const;

export const STARTUP_CLOSEOUT_ANALYTICS_SPAN_OVERRIDES = { ... };
export const STARTUP_CLOSEOUT_ANALYTICS_VIEW_MODELS = { ... };
```

Add this non-UI TODO near the helper exports:

```ts
// TODO(post-mvp): Replace deterministic Project Startup & Closeout
// analytics samples with source-backed read-model projections once
// startup, responsibility, closeout, turnover, warranty, and lessons-learned
// envelopes are defined. Keep this read-model driven; do not introduce
// workflow execution, source-system mutation, warranty-system mutation,
// approval execution, or writeback from analytics cards.
```

Do not use `Date.now()`, `Math.random()`, current time, locale-dependent formatting, tenant reads, source reads, or runtime mutation.

## Span Override Matrix

Use `PccAnalyticsCard.spanOverrides`.

| Analytics card | largeLaptop / desktop / ultrawide | standardLaptop | smaller modes |
|---|---:|---:|---|
| Startup Readiness Completion | 4 | 3 | footprint/default behavior |
| Responsibility Coverage | 4 | 4 | footprint/default behavior |
| Closeout & Warranty Readiness | 4 | 3 | footprint/default behavior |

## Placement Requirements

For `activePrimaryTabId === 'startup-closeout'`, render this exact direct-card order when no active module is selected:

```text
1. Project Startup & Closeout
2. Module status
3. Startup Readiness Completion
4. Responsibility Coverage
5. Closeout & Warranty Readiness
6. Select a module
```

For `estimating-preconstruction`, preserve Prompt 07 order:

```text
1. Estimating & Preconstruction
2. Module status
3. Handoff Continuity Preview
4. Estimate Exposure Preview
5. Select a module
```

For `core-tools`, `project-controls`, `cost-time`, and `systems-administration`, preserve the existing three-card order.

Preferred implementation: add a local helper inside `PccPrimaryDashboardSurface.tsx`:

```tsx
function renderPrimaryDashboardAnalytics(activePrimaryTabId: PccPrimaryTabId): JSX.Element | null {
  if (activePrimaryTabId === 'estimating-preconstruction') {
    return <>{/* existing estimating analytics */}</>;
  }

  if (activePrimaryTabId === 'startup-closeout') {
    return <>{/* startup/closeout analytics */}</>;
  }

  return null;
}
```

Render the helper result between the Module status card and the selected-module card.

Do not add gateway actions or `forceAnimationDisabled` to production render paths.

## Test Requirements

Create:

```text
apps/project-control-center/src/tests/PccStartupCloseoutAnalyticsCards.test.tsx
```

Update:

```text
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
```

Use the same `vi.hoisted` ECharts mock pattern from Prompt 03 / Prompt 04 / Prompt 07 analytics tests.

Tests must prove:

1. Startup & Closeout analytics titles render:
   - `Startup Readiness Completion`
   - `Responsibility Coverage`
   - `Closeout & Warranty Readiness`

2. Exact Startup & Closeout direct-card order:
   - `Project Startup & Closeout`
   - `Module status`
   - `Startup Readiness Completion`
   - `Responsibility Coverage`
   - `Closeout & Warranty Readiness`
   - `Select a module`

3. Startup analytics do not render on `core-tools` or `project-controls`.

4. Startup analytics do not render on `estimating-preconstruction`, while Estimating analytics still render there.

5. Each Startup analytics card has:
   - `data-pcc-analytics-card`
   - `data-pcc-analytics-card-state="preview"`
   - `data-pcc-analytics-card-sample-data="true"`
   - nested `data-pcc-analytics-chart`
   - nested `data-pcc-analytics-sample-data="true"`

6. Preview copy is visible on each card:
   - `Preview analytics · sample project data`
   - `This preview uses deterministic sample project data until the source read model is connected.`

7. Source label override is visible:
   - `Source: deterministic startup and closeout sample`

8. Fallback summary rows are visible and outside the chart canvas.

9. All three analytics cards are direct children of the bento grid.

10. Span overrides:
   - desktop / largeLaptop / ultrawide: all three cards = 4, source override
   - standardLaptop: Startup = 3, Responsibility = 4, Closeout/Warranty = 3, source override
   - tabletLandscape: footprint source and no override mode

11. Existing Startup & Closeout module rows remain visible:
   - `Startup Center`
   - `Responsibility Matrix`
   - `Closeout`
   - `Closeout & Turnover Tracker`
   - `Warranty`
   - `Lessons Learned`
   - `Subcontractor Performance`

12. Deferred module rows remain visibly deferred/non-selectable for:
   - `closeout-turnover-tracker`
   - `warranty`
   - `lessons-learned`
   - `subcontractor-performance`

13. No `Project Intelligence` text appears.

14. Zero Startup & Closeout dashboard cards carry `data-pcc-active-surface-panel`.

15. Scoped no-import assertion under:
   - `apps/project-control-center/src/surfaces/phase05Dashboard`
   - `apps/project-control-center/src/analytics`

must not import `echarts-for-react`.

## Adjacent Test Updates

In `PccSurfaceRouter.phase05.test.tsx`, update the direct-card-count logic so:

```text
estimating-preconstruction -> 5
startup-closeout -> 6
core-tools -> 3
project-controls -> 3
cost-time -> 3
systems-administration -> 3
```

Update wording/comments so they do not say Estimating is the sole exception.

## Acceptance Criteria

- Startup & Closeout dashboard renders exactly three analytics cards.
- These cards render only on `startup-closeout`.
- Prompt 07 Estimating analytics remain intact.
- Direct-card order for Startup & Closeout is overview → Module status → three analytics → selected-module card.
- Existing Startup & Closeout module rows remain visible.
- Deferred startup/closeout module rows remain deferred/non-selectable.
- Analytics cards use deterministic sample-data previews and `PccAnalyticsCard`.
- No live startup, closeout, warranty, approval, source mutation, or writeback is implied.
- No dependency changes.
- No `echarts-for-react` addition or PCC import.
- No SPFx version bump.
- No navigation registry change.
- No Project Home change.
- No analytics foundation change.
- No unrelated surface/dashboard changes.
- No Playwright/evidence generation.
- Full PCC typecheck and test suite pass.

## Required Validation

Run the narrowest validation needed during implementation, then at closeout run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check   apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx   apps/project-control-center/src/surfaces/phase05Dashboard/startupCloseoutAnalytics.ts   apps/project-control-center/src/tests/PccStartupCloseoutAnalyticsCards.test.tsx   apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If additional adjacent tests are edited, add them to the prettier check list. If `pnpm exec prettier` cannot resolve, stop and report. Do not use `npx`.

Expected lockfile md5 before/after:

```text
7c19ccfa8718a42f7f55ce178a626996
```

## Closeout Report

Report in this structure:

```text
HB: Phase 06 Prompt 08 Closeout — Startup & Closeout Analytics Cards

Summary:
- ...

Files Changed:
- ...

Version:
- SPFx solution version before:
- SPFx solution version after:
- SPFx feature version before:
- SPFx feature version after:
- Version changed in this prompt: No

Dependency / Lockfile:
- Dependencies installed by agent: No
- echarts already present before prompt: Yes
- echarts added by agent: No
- echarts-for-react added to PCC: No
- PCC source imports echarts-for-react: No
- pnpm-lock md5 before:
- pnpm-lock md5 after:

Implementation Notes:
- analytics cards added:
- startup-closeout-only conditional:
- estimating analytics preservation:
- direct-card order:
- related module posture:
- deferred module preservation:
- span overrides:
- sample-data posture:
- fallback/accessibility posture:
- active-panel ownership:
- direct-child invariant:
- unrelated dashboard preservation:

Validation:
- ...

Risks / Follow-Up:
- ...

Commit Guidance:
- Suggested summary:
  feat(pcc): add Startup & Closeout analytics cards
```

## Non-Goals

Do not add analytics cards to Project Home, Core Tools, Document Control, Estimating beyond preserving Prompt 07, Project Controls, Cost & Time, or Systems Administration. Do not create or require `pccDashboardComposition.ts`. Do not modify analytics foundation, Project Home analytics, Estimating helper, shell navigation, navigation registry metadata, dependencies, SPFx package versions, Playwright evidence, or architecture-blueprint docs.
