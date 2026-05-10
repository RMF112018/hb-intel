# Prompt 07 — Estimating & Preconstruction Analytics Cards — Updated

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

Prompt 01 added `spanOverrides`. Prompt 02 locked Project Home choreography and gateways. Prompt 03 added the PCC-owned direct ECharts analytics foundation. Prompt 04 inserted Project Home analytics cards.

Prompt 07 adds Estimating & Preconstruction dashboard analytics only.

## Objective

Add two deterministic preview analytics cards to the **Estimating & Preconstruction** primary dashboard:

```text
1. Handoff Continuity Preview
2. Estimate Exposure Preview
```

The implementation must:

- render these cards only for `activePrimaryTabId === 'estimating-preconstruction'`;
- place them near the existing Estimating & Preconstruction module-status content;
- support preconstruction handoff continuity and estimating exposure visibility;
- avoid implying live estimating integration;
- preserve the generic primary dashboard surface for all other primary tabs;
- preserve read-only/no-writeback posture;
- avoid dependency, SPFx-version, analytics-foundation, navigation-registry, and unrelated-surface changes.

## Current Repo-Truth Baseline

Expected minimum ancestry:

```text
Phase 5 closeout:
d06d614a02f16123d8c8252f71cebc22f348bc51

Prompt 01:
6e6454aafc4c9a6ca04e58611139eddab9616ae7

Prompt 02:
e5f9783e18f0a5860abec589b01bbc8f58ed1551

Prompt 03:
08f133842fc6e8c10f3bfa5dd4fab49178942352

Prompt 04:
fdedc65dbe88850fd58d4fdadb394f7043ca6619
```

Expected current PCC package state:

```text
apps/project-control-center/package.json includes echarts ^5.6.0
apps/project-control-center/package.json does not include echarts-for-react
apps/project-control-center/config/package-solution.json = 1.0.0.216
pnpm-lock.yaml md5 = 7c19ccfa8718a42f7f55ce178a626996
```

Current primary navigation repo truth:

```text
Primary tab id:
estimating-preconstruction

Primary tab label/title:
Estimating & Preconstruction

Current modules under the tab:
future-estimating-modules
preconstruction-handoff
estimate-assumptions-alternates-exclusions
```

Current `PccPrimaryDashboardSurface` repo truth:

```text
The generic primary dashboard surface currently renders:
1. Overview dashboard card
2. Module status dashboard card
3. Selected module dashboard card

It is used for multiple primary tabs. Any Estimating & Preconstruction analytics insertion must be conditional and must not appear on unrelated primary dashboards.
```

Important repo-truth correction:

```text
apps/project-control-center/src/layout/pccDashboardComposition.ts
```

does not exist after Prompt 04 in the current repo-truth. Do not depend on it. Do not create it in Prompt 07 unless it already exists from an intervening user-approved Prompt 05/06 execution. If it exists locally, inspect it and preserve/extend it narrowly instead of duplicating composition logic.

## Preflight

Run this preflight before editing:

```bash
git status --short
git rev-parse HEAD
git log --oneline -8
git merge-base --is-ancestor d06d614a02f16123d8c8252f71cebc22f348bc51 HEAD && echo "phase-5-closeout-present" || echo "phase-5-closeout-missing"
git merge-base --is-ancestor 6e6454aafc4c9a6ca04e58611139eddab9616ae7 HEAD && echo "prompt-01-present" || echo "prompt-01-missing"
git merge-base --is-ancestor e5f9783e18f0a5860abec589b01bbc8f58ed1551 HEAD && echo "prompt-02-present" || echo "prompt-02-missing"
git merge-base --is-ancestor 08f133842fc6e8c10f3bfa5dd4fab49178942352 HEAD && echo "prompt-03-present" || echo "prompt-03-missing"
git merge-base --is-ancestor fdedc65dbe88850fd58d4fdadb394f7043ca6619 HEAD && echo "prompt-04-present" || echo "prompt-04-missing"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
node -e "const p=require('./apps/project-control-center/package.json'); console.log(JSON.stringify({dependencies:p.dependencies, devDependencies:p.devDependencies}, null, 2))"
test -d apps/project-control-center/src/analytics && echo "analytics-dir-present" || echo "analytics-dir-missing"
test -f apps/project-control-center/src/layout/pccDashboardComposition.ts && echo "composition-present" || echo "composition-missing"
git grep -n "echarts-for-react" -- apps/project-control-center/package.json apps/project-control-center/src || true
```

Stop if:

- any required ancestry check through Prompt 04 is missing;
- `echarts` is missing from `apps/project-control-center/package.json`;
- `echarts-for-react` is present in PCC package.json or imported under PCC source;
- the analytics directory is missing;
- the working tree has unrelated dirty runtime/test/dependency files that you cannot account for.

If the branch includes user-approved Prompt 05/06 work after Prompt 04, preserve that work. Do not revert or overwrite it. Extend only the Estimating & Preconstruction path required by this prompt.

## Global Instructions

- Do not re-read files that are still within your current context or memory unless they have changed, your context is stale, or validation requires it.
- Do not install dependencies.
- Do not add `echarts`.
- Do not add `echarts-for-react`.
- Do not import `echarts-for-react` in PCC.
- Do not use `packages/ui-kit/src/HbcChart/EChartsRenderer.tsx`.
- Do not modify `packages/models/src/pcc/PccPrimaryNavigation.ts`.
- Do not change module ids, module labels, module states, or selectability.
- Do not convert deferred estimating modules into selectable/available modules.
- Do not edit the Prompt 03 analytics foundation unless a type issue blocks usage. It should not be necessary.
- Do not edit Project Home analytics.
- Do not edit unrelated primary dashboards beyond preserving any existing shared helper imports/calls.
- Do not bump `apps/project-control-center/config/package-solution.json`; PCC remains `1.0.0.216`.
- Do not edit `tools/spfx-shell/config/package-solution.json`.
- Do not run broad repo scans when targeted reads/greps are sufficient.
- Do not introduce live integrations, writeback, approval execution, source mutation, URL routing, SharePoint mutation, Autodesk/Unanet/Sage/Procore integration, or random render-time data.
- Do not render developer/internal copy in the UI.
- Preserve PCC read-only / preview / no-writeback posture.
- Preserve every dashboard card as a direct child of `[data-pcc-bento-grid]`.
- Do not use `grid-auto-flow: dense`.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not add card-level active-panel ownership.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Use production-grade, end-user-facing copy only.
- Do not run Playwright for Prompt 07 unless the user explicitly requests it.

## Scope

Implement Estimating & Preconstruction analytics cards only.

Likely modify:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
```

Likely create:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/estimatingPreconstructionAnalytics.ts
apps/project-control-center/src/tests/PccEstimatingPreconstructionAnalyticsCards.test.tsx
```

If a shared dashboard analytics helper/test already exists from user-approved Prompt 05/06 work, extend the existing helper/test narrowly instead of creating duplicate patterns. Preserve all existing analytics cards from those prompts.

Do not create or edit, unless already present and clearly owned by intervening Prompt 05/06 work:

```text
apps/project-control-center/src/layout/pccDashboardComposition.ts
```

Do not edit:

```text
apps/project-control-center/src/analytics/*
apps/project-control-center/src/surfaces/projectHome/*
apps/project-control-center/config/package-solution.json
tools/spfx-shell/config/package-solution.json
packages/models/src/pcc/PccPrimaryNavigation.ts
```

## Required Analytics Cards

Create exactly these two Estimating & Preconstruction analytics cards.

### 1. Handoff Continuity Preview

Related module: `preconstruction-handoff`

Chart kind: `stacked-bar`

Visible copy:

```text
Title: Handoff Continuity Preview
Eyebrow: Preconstruction handoff
Description: Preview of handoff readiness across scope, budget, schedule, and risk context.
```

State/source:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic preconstruction sample
sampleData: true
```

Dataset:

```ts
[
  { category: 'Scope basis', complete: 78, open: 22 },
  { category: 'Budget context', complete: 64, open: 36 },
  { category: 'Schedule assumptions', complete: 72, open: 28 },
  { category: 'Risk notes', complete: 58, open: 42 },
]
```

Summary:

```ts
[
  { label: 'Scope basis complete', value: '78%', tone: 'info' },
  { label: 'Budget context complete', value: '64%', tone: 'warning' },
  { label: 'Open risk notes', value: '42%', tone: 'warning' },
]
```

Accessibility summary:

```text
Stacked bar chart preview of preconstruction handoff readiness across scope basis, budget context, schedule assumptions, and risk notes.
```

### 2. Estimate Exposure Preview

Related module: `estimate-assumptions-alternates-exclusions`

Chart kind: `grouped-bar`

Visible copy:

```text
Title: Estimate Exposure Preview
Eyebrow: Estimate exposure
Description: Preview of estimating assumptions, alternates, and exclusions requiring handoff attention.
```

State/source:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic preconstruction sample
sampleData: true
```

Dataset:

```ts
[
  { category: 'Assumptions', documented: 14, needsReview: 5 },
  { category: 'Alternates', documented: 9, needsReview: 4 },
  { category: 'Exclusions', documented: 11, needsReview: 6 },
]
```

Summary:

```ts
[
  { label: 'Assumptions needing review', value: '5', tone: 'warning' },
  { label: 'Alternates needing review', value: '4', tone: 'info' },
  { label: 'Exclusions needing review', value: '6', tone: 'danger' },
]
```

Accessibility summary:

```text
Grouped bar chart preview of documented and review-needed estimating assumptions, alternates, and exclusions.
```

## Estimating Analytics Helper

Create:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/estimatingPreconstructionAnalytics.ts
```

This file should own only Estimating & Preconstruction analytics view models and span overrides.

Use `buildPreviewAnalyticsViewModel` from the Prompt 03 analytics foundation.

Recommended exports:

```ts
export type PccEstimatingPreconstructionAnalyticsCardKey =
  | 'handoffContinuityPreview'
  | 'estimateExposurePreview';

export const ESTIMATING_PRECONSTRUCTION_ANALYTICS_CARD_KEYS = [
  'handoffContinuityPreview',
  'estimateExposurePreview',
] as const;

export const ESTIMATING_PRECONSTRUCTION_ANALYTICS_CARD_TITLES = {
  handoffContinuityPreview: 'Handoff Continuity Preview',
  estimateExposurePreview: 'Estimate Exposure Preview',
} as const;

export const ESTIMATING_PRECONSTRUCTION_ANALYTICS_SPAN_OVERRIDES = { ... };
export const ESTIMATING_PRECONSTRUCTION_ANALYTICS_VIEW_MODELS = { ... };
```

Add this non-UI TODO near the helper exports:

```ts
// TODO(post-mvp): Replace deterministic Estimating & Preconstruction
// analytics samples with source-backed read-model projections once
// preconstruction handoff and estimate-exposure envelopes are defined.
// Keep this read-model driven; do not introduce estimating-system mutation,
// source-system writeback, or workflow execution from analytics cards.
```

Do not use `Date.now()`, `Math.random()`, current time, locale-dependent formatting, tenant reads, source reads, or runtime mutation.

## Span Override Matrix

Use `PccAnalyticsCard.spanOverrides`.

Analytics card spans:

| Analytics card | largeLaptop / desktop / ultrawide | standardLaptop | smaller modes |
|---|---:|---:|---|
| Handoff Continuity Preview | 6 | 5 | footprint/default behavior |
| Estimate Exposure Preview | 6 | 5 | footprint/default behavior |

Do not override tablet/phone modes unless a test proves a defect.

## Placement Requirements

Current generic primary dashboard order is:

```text
1. <tab dashboard title>
2. Module status
3. Select a module / selected module
```

For `activePrimaryTabId === 'estimating-preconstruction'`, render this exact direct-card order when no active module is selected:

```text
1. Estimating & Preconstruction
2. Module status
3. Handoff Continuity Preview
4. Estimate Exposure Preview
5. Select a module
```

If an active estimating module is supplied directly in component tests, preserve the same placement and let the selected-module card title resolve normally:

```text
1. Estimating & Preconstruction
2. Module status
3. Handoff Continuity Preview
4. Estimate Exposure Preview
5. <selected estimating module label>
```

For every other `activePrimaryTabId`, preserve the existing generic order and do not render these two estimating analytics cards:

```text
1. <tab dashboard title>
2. Module status
3. Select a module / selected module
```

Implementation requirement:

- Insert the two analytics cards after the `Module status` card and before the selected-module card.
- Wrap them in a conditional fragment:

```tsx
{activePrimaryTabId === 'estimating-preconstruction' ? (
  <>
    ...
  </>
) : null}
```

Do not add gateway actions to these analytics cards.

Do not pass `forceAnimationDisabled` in production render paths. Tests may mock ECharts.

## Integration Requirements

In `PccPrimaryDashboardSurface.tsx`:

- import `PccAnalyticsCard` from `../../analytics`;
- import the Estimating analytics helper from `./estimatingPreconstructionAnalytics`;
- add a small local renderer if it improves readability;
- render the two analytics cards between the `Module status` card and the selected-module card;
- render them only when `activePrimaryTabId === 'estimating-preconstruction'`.

If intervening Prompt 05/06 work already added a primary-dashboard analytics rendering seam, use that seam instead of adding a second conditional block, but still preserve the exact Estimating order above.

## Test Requirements

Create or extend:

```text
apps/project-control-center/src/tests/PccEstimatingPreconstructionAnalyticsCards.test.tsx
```

If an existing shared test exists from Prompt 05/06:

```text
apps/project-control-center/src/tests/PccDashboardAnalyticsCards.test.tsx
```

extend it narrowly and add Estimating-specific describe blocks. Do not duplicate the same assertions in both files.

### ECharts mocking

These tests render `PccAnalyticsCard`, which renders `PccEchartsCanvas`.

Use the same `vi.hoisted` ECharts mock pattern from Prompt 03 / Prompt 04 analytics tests:

```ts
vi.mock('echarts/core', () => ({
  use: vi.fn(),
  registerTheme: vi.fn(),
  init: initMock,
}));
vi.mock('echarts/charts', () => ({ BarChart: {}, LineChart: {}, PieChart: {} }));
vi.mock('echarts/components', () => ({
  DatasetComponent: {},
  GridComponent: {},
  LegendComponent: {},
  TooltipComponent: {},
}));
vi.mock('echarts/renderers', () => ({ SVGRenderer: {} }));
```

Do not modify production code to satisfy jsdom chart behavior.

### Recommended render helper

Render through `PccBentoGrid` and `PccPrimaryDashboardSurface` for fast direct testing:

```tsx
function renderEstimatingSurface(mode: PccResponsiveMode = 'desktop') {
  return render(
    <PccBentoGrid forceMode={mode}>
      <PccPrimaryDashboardSurface activePrimaryTabId="estimating-preconstruction" />
    </PccBentoGrid>,
  );
}
```

### Required assertions

Tests must prove:

1. Estimating card titles render:
   - `Handoff Continuity Preview`
   - `Estimate Exposure Preview`

2. Exact Estimating direct-card order with no active module:
   - `Estimating & Preconstruction`
   - `Module status`
   - `Handoff Continuity Preview`
   - `Estimate Exposure Preview`
   - `Select a module`

3. Analytics cards do not render on at least two unrelated primary dashboards:
   - `core-tools`
   - `project-controls`

4. Each analytics card has:
   - `data-pcc-analytics-card`
   - `data-pcc-analytics-card-state="preview"`
   - `data-pcc-analytics-card-sample-data="true"`
   - nested `data-pcc-analytics-chart`
   - nested `data-pcc-analytics-sample-data="true"`

5. Preview copy is visible on each analytics card:
   - `Preview analytics · sample project data`
   - `This preview uses deterministic sample project data until the source read model is connected.`

6. Source label override is visible on each analytics card:
   - `Source: deterministic preconstruction sample`

7. Fallback summary rows are visible and outside the chart canvas.

8. Both analytics cards are direct children of the bento grid through `PccAnalyticsCard`/`PccDashboardCard`.

9. Span overrides:
   - desktop / largeLaptop / ultrawide: both cards = 6, source override
   - standardLaptop: both cards = 5, source override
   - tabletLandscape: footprint source and no override mode

10. Existing Estimating module rows remain visible:
   - `Future estimating modules`
   - `Preconstruction Handoff`
   - `Estimate Assumptions / Alternates / Exclusions`

11. No `Project Intelligence` text appears on the Estimating dashboard.

12. Zero Estimating dashboard cards carry `data-pcc-active-surface-panel`.

13. Scoped no-import assertion:
   - `apps/project-control-center/src/surfaces/phase05Dashboard`
   - `apps/project-control-center/src/analytics`

must not import `echarts-for-react`.

Do not fail because `packages/ui-kit` still has its existing wrapper.

## Adjacent Test Updates

Run the full PCC test suite.

If existing tests hardcode the generic primary dashboard card count as `3` for all non-Project Home tabs, update them so:

- Estimating & Preconstruction expects `5`;
- unrelated generic primary dashboards remain `3`;
- any existing Prompt 05/06 analytics dashboards preserve their own expected counts.

If existing tests assert exact direct-card order for all primary dashboards, add a branch/fixture for Estimating & Preconstruction only. Do not add old/new toggles.

## Acceptance Criteria

- Estimating & Preconstruction dashboard renders exactly two analytics cards:
  - `Handoff Continuity Preview`
  - `Estimate Exposure Preview`
- These cards render only on `estimating-preconstruction`.
- Direct-card order for Estimating is exactly:
  - dashboard overview
  - module status
  - the two analytics cards
  - selected-module card
- Existing Estimating module rows remain visible.
- Analytics cards use deterministic sample-data previews and `PccAnalyticsCard`.
- Analytics cards render actual chart containers through the Prompt 03 direct ECharts foundation.
- Fallback summary and accessibility content are visible outside the chart canvas.
- No live estimating integration, source mutation, or writeback is implied.
- No dependency changes.
- No `echarts-for-react` addition or PCC import.
- No SPFx version bump.
- No navigation registry change.
- No Project Home change.
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
pnpm exec prettier --check   apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx   apps/project-control-center/src/surfaces/phase05Dashboard/estimatingPreconstructionAnalytics.ts   apps/project-control-center/src/tests/PccEstimatingPreconstructionAnalyticsCards.test.tsx
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If you extend an existing shared test instead, replace the new-test path in the prettier command with the actual changed shared test file.

If additional adjacent tests are edited, add them to the prettier check list.

If `pnpm exec prettier` cannot resolve the binary, stop and report. Do not use `npx`, do not install prettier, and do not modify dependency files.

Expected lockfile md5 before/after, absent user-owned dependency changes:

```text
7c19ccfa8718a42f7f55ce178a626996
```

## Closeout Report

Report in this structure:

```text
HB: Phase 06 Prompt 07 Closeout — Estimating & Preconstruction Analytics Cards

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
- estimating-only conditional:
- direct-card order:
- related module posture:
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
  feat(pcc): add Estimating & Preconstruction analytics cards
- Suggested description bullets:
  - add Estimating & Preconstruction analytics helper with deterministic sample-data view models and span overrides for Handoff Continuity Preview and Estimate Exposure Preview;
  - insert analytics cards conditionally into PccPrimaryDashboardSurface only for `estimating-preconstruction`, between Module status and Selected module;
  - preserve estimating module rows and deferred/no-writeback posture without changing navigation metadata;
  - use PccAnalyticsCard from the direct ECharts foundation with visible preview explanation, deterministic preconstruction source label, chart markers, and fallback summaries;
  - add/extend tests for Estimating-only rendering, direct-card order, sample-data markers, source label, summary outside chart, direct-child invariant, spans, no Project Intelligence regression, and scoped no echarts-for-react import;
  - no dependency install, no echarts-for-react PCC import, no SPFx version bump, no navigation registry change, no Project Home change, no unrelated surface changes.
```

## Non-Goals

Do not do any of the following in Prompt 07:

- Add analytics cards to Project Home.
- Add analytics cards to Core Tools, Document Control, Startup & Closeout, Project Controls, Cost & Time, or Systems Administration.
- Create or require `pccDashboardComposition.ts` unless it already exists from user-approved intervening work and is the established seam.
- Modify the analytics foundation.
- Modify Project Home analytics.
- Modify shell navigation.
- Modify navigation registry metadata.
- Install dependencies.
- Add or import `echarts-for-react`.
- Bump SPFx package version.
- Run Playwright.
- Generate tenant evidence.
- Edit architecture-blueprint docs.
