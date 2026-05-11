# Prompt 10 — Cost & Time Analytics Cards — Updated

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

Prompt 10 adds **Cost & Time** dashboard analytics only. It must consume the existing Prompt 03 analytics foundation and the existing shared `PccPrimaryDashboardSurface` conditional analytics seam.

## Objective

Add three deterministic preview analytics cards to the **Cost & Time** primary dashboard:

```text
1. Schedule Milestone Posture
2. Procurement / Buyout Exposure
3. Commitment / Cost Exposure Preview
```

The implementation must:

- render these cards only for `activePrimaryTabId === 'cost-time'`;
- extend the existing `renderPrimaryDashboardAnalytics(activePrimaryTabId)` helper in `PccPrimaryDashboardSurface`;
- preserve Prompt 07 Estimating analytics, Prompt 08 Startup & Closeout analytics, and Prompt 09 Project Controls analytics;
- preserve the existing Cost & Time Sage book-of-record governance line;
- avoid implying live Sage, schedule, procurement, buyout, commitment, cost, approval, Procore, SharePoint, or source-system integration;
- preserve PCC read-only / preview / no-writeback posture;
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
Prompt 08: 81671c4b46b96217058502c85652aa31e07065d7
Prompt 09: 1eb52e594475efec5163b0f91ae3f144f003dcea
```

Expected current PCC package state:

```text
apps/project-control-center/package.json includes echarts ^5.6.0
apps/project-control-center/package.json does not include echarts-for-react
apps/project-control-center/config/package-solution.json:
  solution.version = 1.0.0.217
  solution.features[0].version = 1.0.0.216
pnpm-lock.yaml md5 = 7c19ccfa8718a42f7f55ce178a626996
```

Current shared dashboard repo truth:

```text
PccPrimaryDashboardSurface currently renders:
1. Overview dashboard card
2. Module status dashboard card
3. renderPrimaryDashboardAnalytics(activePrimaryTabId)
   - estimating-preconstruction -> two Estimating analytics cards
   - startup-closeout -> three Startup & Closeout analytics cards
   - project-controls -> three Project Controls analytics cards
   - all other primary tabs -> null
4. Selected module dashboard card
```

Cost & Time primary tab repo truth:

```text
Primary tab id: cost-time
Primary tab label/title: Cost & Time
Current modules:
- financial-reporting
- schedule-monitor
- procurement-buyout
- commitment-cost-exposure
```

Module state posture to preserve:

```text
financial-reporting: deferred / non-selectable
schedule-monitor: deferred / non-selectable
procurement-buyout: preview / selectable
commitment-cost-exposure: deferred / non-selectable
```

Existing Cost & Time governance posture to preserve:

```text
Sage remains the accounting book of record for cost, commitment, and exposure data; PCC does not write back to Sage.
```

Important repo-truth correction:

```text
apps/project-control-center/src/layout/pccDashboardComposition.ts
```

does not exist in the current repo-truth. Do not depend on it. Do not create it in Prompt 10 unless it already exists from intervening user-approved work and is the established seam. The expected current seam is `renderPrimaryDashboardAnalytics(activePrimaryTabId)` in `PccPrimaryDashboardSurface.tsx`.

## Preflight

Run this preflight before editing:

```bash
git status --short
git rev-parse HEAD
git log --oneline -14
git merge-base --is-ancestor d06d614a02f16123d8c8252f71cebc22f348bc51 HEAD && echo "phase-5-closeout-present" || echo "phase-5-closeout-missing"
git merge-base --is-ancestor 6e6454aafc4c9a6ca04e58611139eddab9616ae7 HEAD && echo "prompt-01-present" || echo "prompt-01-missing"
git merge-base --is-ancestor e5f9783e18f0a5860abec589b01bbc8f58ed1551 HEAD && echo "prompt-02-present" || echo "prompt-02-missing"
git merge-base --is-ancestor 08f133842fc6e8c10f3bfa5dd4fab49178942352 HEAD && echo "prompt-03-present" || echo "prompt-03-missing"
git merge-base --is-ancestor fdedc65dbe88850fd58d4fdadb394f7043ca6619 HEAD && echo "prompt-04-present" || echo "prompt-04-missing"
git merge-base --is-ancestor 75845d253951ae19248b4b820e17ffb50db443e3 HEAD && echo "prompt-07-present" || echo "prompt-07-missing"
git merge-base --is-ancestor 81671c4b46b96217058502c85652aa31e07065d7 HEAD && echo "prompt-08-present" || echo "prompt-08-missing"
git merge-base --is-ancestor 1eb52e594475efec5163b0f91ae3f144f003dcea HEAD && echo "prompt-09-present" || echo "prompt-09-missing"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
node -e "const p=require('./apps/project-control-center/package.json'); console.log(JSON.stringify({dependencies:p.dependencies, devDependencies:p.devDependencies}, null, 2))"
grep -n "version" apps/project-control-center/config/package-solution.json
test -d apps/project-control-center/src/analytics && echo "analytics-dir-present" || echo "analytics-dir-missing"
test -f apps/project-control-center/src/layout/pccDashboardComposition.ts && echo "composition-present" || echo "composition-missing"
git grep -n "echarts-for-react" -- apps/project-control-center/package.json apps/project-control-center/src || true
```

Stop if any required ancestry check through Prompt 09 is missing, if `echarts` is missing, if `echarts-for-react` appears in PCC package/source, if the analytics foundation is missing, if lockfile md5 changed unexpectedly, if package-solution versions differ from the expected values, or if unrelated dirty files cannot be accounted for.

## Global Instructions

- Do not install dependencies.
- Do not add `echarts` or `echarts-for-react`.
- Do not import `echarts-for-react` in PCC.
- Do not use `packages/ui-kit/src/HbcChart/EChartsRenderer.tsx`.
- Do not modify `packages/models/src/pcc/PccPrimaryNavigation.ts`.
- Do not change module ids, module labels, module states, or selectability.
- Do not convert deferred Cost & Time modules into selectable/available modules.
- Do not edit the Prompt 03 analytics foundation unless a type issue blocks usage. It should not be necessary.
- Do not edit Project Home analytics.
- Do not remove or alter Prompt 07, Prompt 08, or Prompt 09 analytics behavior.
- Do not add analytics cards to unrelated primary dashboards.
- Do not remove, weaken, or reword the Cost & Time Sage book-of-record posture line.
- Do not bump `apps/project-control-center/config/package-solution.json`.
- Do not edit `tools/spfx-shell/config/package-solution.json`.
- Do not introduce live integrations, writeback, approval execution, source mutation, URL routing, Sage mutation, schedule mutation, procurement/buyout execution, commitment/cost workflow execution, Procore/SharePoint/Sage mutation, or random render-time data.
- Do not render developer/internal copy in the UI.
- Preserve every dashboard card as a direct child of `[data-pcc-bento-grid]`.
- Do not use `grid-auto-flow: dense`.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not add card-level active-panel ownership.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Use production-grade, end-user-facing copy only.
- Do not run Playwright for Prompt 10 unless the user explicitly requests it.

## Scope

Likely modify:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
```

Likely create:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/costTimeAnalytics.ts
apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx
```

Do not edit:

```text
apps/project-control-center/src/analytics/*
apps/project-control-center/src/surfaces/projectHome/*
apps/project-control-center/src/surfaces/phase05Dashboard/estimatingPreconstructionAnalytics.ts
apps/project-control-center/src/surfaces/phase05Dashboard/startupCloseoutAnalytics.ts
apps/project-control-center/src/surfaces/phase05Dashboard/projectControlsAnalytics.ts
apps/project-control-center/config/package-solution.json
tools/spfx-shell/config/package-solution.json
packages/models/src/pcc/PccPrimaryNavigation.ts
```

## Required Analytics Cards

Create exactly these three Cost & Time analytics cards.

### 1. Schedule Milestone Posture

Related module: `schedule-monitor`

Chart kind: `line`

Visible copy:

```text
Title: Schedule Milestone Posture
Eyebrow: Schedule posture
Description: Preview of milestone posture across baseline, current forecast, and exposure trend.
```

State/source:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic cost and time sample
sampleData: true
```

Dataset:

```ts
[
  { category: 'Baseline', forecast: 0, exposure: 0 },
  { category: 'Update 1', forecast: 2, exposure: 1 },
  { category: 'Update 2', forecast: 4, exposure: 3 },
  { category: 'Update 3', forecast: 3, exposure: 2 },
]
```

Summary:

```ts
[
  { label: 'Forecast variance', value: '+3 days', tone: 'warning' },
  { label: 'Milestones on track', value: '8', tone: 'success' },
  { label: 'Watch milestones', value: '2', tone: 'warning' },
]
```

Accessibility summary:

```text
Line chart preview of schedule milestone posture across baseline and three update periods.
```

### 2. Procurement / Buyout Exposure

Related module: `procurement-buyout`

Chart kind: `grouped-bar`

Visible copy:

```text
Title: Procurement / Buyout Exposure
Eyebrow: Procurement and buyout
Description: Preview of procurement and buyout exposure across bid, award, submittal, and release lanes.
```

State/source:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic cost and time sample
sampleData: true
```

Dataset:

```ts
[
  { category: 'Bid leveling', complete: 74, exposure: 26 },
  { category: 'Award', complete: 61, exposure: 39 },
  { category: 'Submittals', complete: 68, exposure: 32 },
  { category: 'Release', complete: 57, exposure: 43 },
]
```

Summary:

```ts
[
  { label: 'Buyout complete', value: '61%', tone: 'warning' },
  { label: 'Submittal exposure', value: '32%', tone: 'warning' },
  { label: 'Release exposure', value: '43%', tone: 'danger' },
]
```

Accessibility summary:

```text
Grouped bar chart preview of procurement and buyout exposure across bid leveling, award, submittal, and release lanes.
```

### 3. Commitment / Cost Exposure Preview

Related module: `commitment-cost-exposure`

Chart kind: `stacked-bar`

Visible copy:

```text
Title: Commitment / Cost Exposure Preview
Eyebrow: Commitment and cost exposure
Description: Preview of committed, pending, and exposed cost posture by cost-control lane.
```

State/source:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic cost and time sample
sampleData: true
```

Dataset:

```ts
[
  { category: 'Commitments', committed: 78, pending: 12, exposure: 10 },
  { category: 'Allowances', committed: 64, pending: 18, exposure: 18 },
  { category: 'Contingency', committed: 52, pending: 16, exposure: 32 },
  { category: 'Changes', committed: 43, pending: 28, exposure: 29 },
]
```

Summary:

```ts
[
  { label: 'Committed posture', value: '78%', tone: 'info' },
  { label: 'Contingency exposure', value: '32%', tone: 'warning' },
  { label: 'Change exposure', value: '29%', tone: 'warning' },
]
```

Accessibility summary:

```text
Stacked bar chart preview of committed, pending, and exposed cost posture across commitments, allowances, contingency, and changes.
```

## Cost & Time Analytics Helper

Create:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/costTimeAnalytics.ts
```

Use `buildPreviewAnalyticsViewModel` from the Prompt 03 analytics foundation.

Required exports:

```ts
export type PccCostTimeAnalyticsCardKey =
  | 'scheduleMilestonePosture'
  | 'procurementBuyoutExposure'
  | 'commitmentCostExposurePreview';

export const COST_TIME_ANALYTICS_CARD_KEYS = [
  'scheduleMilestonePosture',
  'procurementBuyoutExposure',
  'commitmentCostExposurePreview',
] as const;

export const COST_TIME_ANALYTICS_CARD_TITLES = {
  scheduleMilestonePosture: 'Schedule Milestone Posture',
  procurementBuyoutExposure: 'Procurement / Buyout Exposure',
  commitmentCostExposurePreview: 'Commitment / Cost Exposure Preview',
} as const;

export const COST_TIME_ANALYTICS_SPAN_OVERRIDES = { ... };
export const COST_TIME_ANALYTICS_VIEW_MODELS = { ... };
```

Add this non-UI TODO near the helper exports:

```ts
// TODO(post-mvp): Replace deterministic Cost & Time analytics samples with
// source-backed read-model projections once financial reporting, schedule,
// procurement, buyout, commitment, and cost-exposure envelopes are defined.
// Sage remains the accounting book of record. Keep this read-model driven;
// do not introduce Sage mutation, schedule mutation, procurement/buyout
// execution, commitment/cost workflow execution, approval execution, or
// writeback from analytics cards.
```

Do not use `Date.now()`, `Math.random()`, current time, locale-dependent formatting, tenant reads, source reads, or runtime mutation.

## Span Override Matrix

Use `PccAnalyticsCard.spanOverrides`.

| Analytics card | largeLaptop / desktop / ultrawide | standardLaptop | smaller modes |
|---|---:|---:|---|
| Schedule Milestone Posture | 4 | 3 | footprint/default behavior |
| Procurement / Buyout Exposure | 4 | 4 | footprint/default behavior |
| Commitment / Cost Exposure Preview | 4 | 3 | footprint/default behavior |

Do not override tablet/phone modes unless a test proves a defect.

## Placement Requirements

For `activePrimaryTabId === 'cost-time'`, render this exact direct-card order when no active module is selected:

```text
1. Cost & Time
2. Module status
3. Schedule Milestone Posture
4. Procurement / Buyout Exposure
5. Commitment / Cost Exposure Preview
6. Select a module
```

Preserve existing orders/counts for already-implemented tabs:

```text
estimating-preconstruction -> 5 cards
startup-closeout -> 6 cards
project-controls -> 6 cards
core-tools / systems-administration -> 3 cards
```

Implementation requirements:

- Extend the existing `renderPrimaryDashboardAnalytics(activePrimaryTabId)` helper in `PccPrimaryDashboardSurface.tsx`.
- Add a new `if (activePrimaryTabId === 'cost-time')` branch after the existing Project Controls branch, or use an equivalent explicit branch order.
- Render the three Cost & Time analytics cards between the Module status card and selected-module card.
- Preserve existing Estimating, Startup & Closeout, and Project Controls branches.
- Preserve `PRIMARY_TAB_POSTURE_NOTE['cost-time']` and the visible `[data-pcc-dashboard-book-of-record="cost-time"]` line.
- Do not add gateway actions to analytics cards.
- Do not pass `forceAnimationDisabled` in production render paths. Tests may mock ECharts.

## Test Requirements

Create:

```text
apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx
```

Update:

```text
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
```

Use the same `vi.hoisted` ECharts mock pattern from the Prompt 03 / 04 / 07 / 08 / 09 analytics tests.

Required assertions:

1. Cost & Time analytics titles render:
   - `Schedule Milestone Posture`
   - `Procurement / Buyout Exposure`
   - `Commitment / Cost Exposure Preview`

2. Exact Cost & Time direct-card order:
   - `Cost & Time`
   - `Module status`
   - `Schedule Milestone Posture`
   - `Procurement / Buyout Exposure`
   - `Commitment / Cost Exposure Preview`
   - `Select a module`

3. Cost & Time analytics do not render on `core-tools` or `systems-administration`.

4. Cost & Time analytics do not render on `estimating-preconstruction`, `startup-closeout`, or `project-controls`; the corresponding existing analytics cards still render there.

5. Each Cost & Time analytics card has:
   - `data-pcc-analytics-card`
   - `data-pcc-analytics-card-state="preview"`
   - `data-pcc-analytics-card-sample-data="true"`
   - nested `data-pcc-analytics-chart`
   - nested `data-pcc-analytics-sample-data="true"`

6. Preview copy is visible on each card:
   - `Preview analytics · sample project data`
   - `This preview uses deterministic sample project data until the source read model is connected.`

7. Source label override is visible:
   - `Source: deterministic cost and time sample`

8. Fallback summary rows are visible and outside the chart canvas.

9. All three analytics cards are direct children of the bento grid.

10. Span overrides:
   - desktop / largeLaptop / ultrawide: all three cards = 4, source override
   - standardLaptop: Schedule = 3, Procurement/Buyout = 4, Commitment/Cost = 3, source override
   - tabletLandscape: footprint source and no override mode

11. Existing Cost & Time module rows remain visible:
   - `Financial Reporting`
   - `Schedule Monitor`
   - `Procurement & Buyout`
   - `Commitment / Cost Exposure`

12. Deferred module rows remain visibly deferred/non-selectable for:
   - `financial-reporting`
   - `schedule-monitor`
   - `commitment-cost-exposure`

13. Preview/selectable module row remains visibly preview/selectable for:
   - `procurement-buyout`

14. The Cost & Time Sage book-of-record line remains visible and scoped to Cost & Time:
   - `[data-pcc-dashboard-book-of-record="cost-time"]` exists on the Cost & Time dashboard;
   - it contains `Sage remains the accounting book of record`;
   - `core-tools`, `estimating-preconstruction`, `startup-closeout`, `project-controls`, and `systems-administration` do not render any `[data-pcc-dashboard-book-of-record]`.

15. No `Project Intelligence` text appears.

16. Zero Cost & Time dashboard cards carry `data-pcc-active-surface-panel`.

17. Scoped no-import assertion under:
   - `apps/project-control-center/src/surfaces/phase05Dashboard`
   - `apps/project-control-center/src/analytics`

must not import `echarts-for-react`. Do not fail because `packages/ui-kit` still has its existing wrapper.

## Adjacent Test Updates

In `PccSurfaceRouter.phase05.test.tsx`, update the direct-card-count logic so:

```text
estimating-preconstruction -> 5
startup-closeout -> 6
project-controls -> 6
cost-time -> 6
core-tools -> 3
systems-administration -> 3
```

Update wording/comments so they list Estimating, Startup & Closeout, Project Controls, and Cost & Time as exceptions.

If other tests hardcode the generic primary dashboard card count as `3` for all non-Project Home tabs, update them so Cost & Time expects `6`, Project Controls remains `6`, Startup & Closeout remains `6`, Estimating remains `5`, and the other generic primary dashboards remain `3`.

Existing `PccSurfaceRouter.phase05.test.tsx` already has Cost & Time book-of-record coverage. Preserve it. Do not weaken or remove it.

## Acceptance Criteria

- Cost & Time dashboard renders exactly three analytics cards:
  - `Schedule Milestone Posture`
  - `Procurement / Buyout Exposure`
  - `Commitment / Cost Exposure Preview`
- These cards render only on `cost-time`.
- Prompt 07, Prompt 08, and Prompt 09 analytics remain intact.
- Direct-card order for Cost & Time is overview -> Module status -> three analytics -> selected-module card.
- Existing Cost & Time module rows remain visible.
- Deferred and preview/selectable Cost & Time module rows preserve their registry posture.
- The Cost & Time Sage book-of-record line remains visible and remains scoped only to Cost & Time.
- Analytics cards use deterministic sample-data previews and `PccAnalyticsCard`.
- Analytics cards render chart containers through the Prompt 03 direct ECharts foundation.
- Fallback summary and accessibility content are visible outside the chart canvas.
- No live Sage, schedule, procurement, buyout, commitment, cost, approval, source mutation, or writeback is implied.
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
pnpm exec prettier --check \
  apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx \
  apps/project-control-center/src/surfaces/phase05Dashboard/costTimeAnalytics.ts \
  apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx \
  apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
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
HB: Phase 06 Prompt 10 Closeout — Cost & Time Analytics Cards

Summary:
- ...

Files Changed:
- ...

Version:
- SPFx solution version before: 1.0.0.217
- SPFx solution version after: 1.0.0.217
- SPFx feature version before: 1.0.0.216
- SPFx feature version after: 1.0.0.216
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
- cost-time-only conditional:
- estimating analytics preservation:
- startup/closeout analytics preservation:
- project-controls analytics preservation:
- Sage book-of-record preservation:
- direct-card order:
- related module posture:
- deferred module preservation:
- preview/selectable module preservation:
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
  feat(pcc): HB Intel Project Control Center 1.0.0.217 — add Cost & Time analytics cards
```

## Non-Goals

Do not add analytics cards to Project Home, Core Tools, Document Control, Estimating beyond preserving Prompt 07, Startup & Closeout beyond preserving Prompt 08, Project Controls beyond preserving Prompt 09, or Systems Administration. Do not create or require `pccDashboardComposition.ts`. Do not modify analytics foundation, Project Home analytics, Estimating helper, Startup & Closeout helper, Project Controls helper, shell navigation, navigation registry metadata, dependencies, SPFx package versions, Playwright evidence, or architecture-blueprint docs.
