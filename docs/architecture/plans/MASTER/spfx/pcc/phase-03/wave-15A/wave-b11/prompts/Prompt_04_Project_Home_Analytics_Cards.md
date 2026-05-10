# Prompt 04 — Project Home Analytics Cards — Updated

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

Prompt 01 added `spanOverrides`.
Prompt 02 locked Project Home operational choreography and gateways.
Prompt 03 added the PCC-owned direct ECharts analytics foundation.

Prompt 04 consumes the Prompt 03 analytics foundation and inserts Project Home analytics cards only.

## Objective

Add three Project Home analytics cards using the existing PCC analytics foundation:

```text
1. Action Exposure Mix
2. Project Health Trend
3. Readiness / Approval Rollup
```

The implementation must:

- keep the nine operational Project Home cards in their Phase 06 relative order;
- place analytics cards near related operational content without putting lifecycle/HBI/Procore/detail content above the operational spine;
- use deterministic preview/sample project data;
- render product-grade preview explanation and fallback summaries;
- preserve direct bento child invariants;
- preserve shell-owned active-panel ownership;
- avoid dependency, package-version, layout-primitive, analytics-foundation, and unrelated-surface changes.

## Current Repo-Truth Baseline

Expected ancestry:

```text
Phase 5 closeout:
d06d614a02f16123d8c8252f71cebc22f348bc51

Prompt 01:
6e6454aafc4c9a6ca04e58611139eddab9616ae7

Prompt 02:
e5f9783e18f0a5860abec589b01bbc8f58ed1551

Prompt 03:
08f133842fc6e8c10f3bfa5dd4fab49178942352
```

Expected current PCC package state:

```text
apps/project-control-center/package.json includes echarts ^5.6.0
apps/project-control-center/package.json does not include echarts-for-react
apps/project-control-center/config/package-solution.json = 1.0.0.216
pnpm-lock.yaml md5 = 7c19ccfa8718a42f7f55ce178a626996
```

Expected Prompt 03 analytics foundation:

```text
apps/project-control-center/src/analytics/PccAnalyticsCard.tsx
apps/project-control-center/src/analytics/PccEchartsCanvas.tsx
apps/project-control-center/src/analytics/pccAnalyticsA11y.ts
apps/project-control-center/src/analytics/pccAnalyticsFixtures.ts
apps/project-control-center/src/analytics/pccAnalyticsOptions.ts
apps/project-control-center/src/analytics/pccAnalyticsTheme.ts
apps/project-control-center/src/analytics/pccAnalyticsTypes.ts
apps/project-control-center/src/analytics/pccAnalyticsViewModels.ts
apps/project-control-center/src/analytics/index.ts
```

Important repo-truth correction:

```text
apps/project-control-center/src/layout/pccDashboardComposition.ts
```

does **not** exist after Prompt 03. Do not depend on it and do not create it in Prompt 04. This prompt is Project Home scoped; use a Project Home helper instead.

Run this preflight before editing:

```bash
git status --short
git rev-parse HEAD
git log --oneline -5
git merge-base --is-ancestor d06d614a02f16123d8c8252f71cebc22f348bc51 HEAD && echo "phase-5-closeout-present" || echo "phase-5-closeout-missing"
git merge-base --is-ancestor 6e6454aafc4c9a6ca04e58611139eddab9616ae7 HEAD && echo "prompt-01-present" || echo "prompt-01-missing"
git merge-base --is-ancestor e5f9783e18f0a5860abec589b01bbc8f58ed1551 HEAD && echo "prompt-02-present" || echo "prompt-02-missing"
git merge-base --is-ancestor 08f133842fc6e8c10f3bfa5dd4fab49178942352 HEAD && echo "prompt-03-present" || echo "prompt-03-missing"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
node -e "const p=require('./apps/project-control-center/package.json'); console.log(JSON.stringify({dependencies:p.dependencies, devDependencies:p.devDependencies}, null, 2))"
test -f apps/project-control-center/src/layout/pccDashboardComposition.ts && echo "composition-present" || echo "composition-missing"
test -d apps/project-control-center/src/analytics && echo "analytics-dir-present" || echo "analytics-dir-missing"
git grep -n "echarts-for-react" -- apps/project-control-center/package.json apps/project-control-center/src || true
```

Stop if:

- any ancestry check is missing;
- `echarts` is missing from `apps/project-control-center/package.json`;
- `echarts-for-react` is present in PCC package.json or imported under PCC source;
- the analytics directory is missing;
- the working tree has unrelated dirty runtime/test/dependency files that you cannot account for.

Do not install dependencies.

## Global Instructions

- Do not re-read files that are still within your current context or memory unless they have changed, your context is stale, or validation requires it.
- Do not install dependencies.
- Do not add `echarts`.
- Do not add `echarts-for-react`.
- Do not import `echarts-for-react` in PCC.
- Do not edit the Prompt 03 analytics foundation unless a type issue blocks Project Home usage. It should not be necessary.
- Do not use `packages/ui-kit/src/HbcChart/EChartsRenderer.tsx`.
- Do not create `apps/project-control-center/src/layout/pccDashboardComposition.ts`.
- Do not create cross-surface dashboard composition helpers.
- Do not modify unrelated dashboards or primary-tab surfaces.
- Do not modify Document Control, Project Readiness, Approvals, External Systems, Team & Access, or other routed surfaces.
- Do not bump `apps/project-control-center/config/package-solution.json`; PCC remains `1.0.0.216`.
- Do not edit `tools/spfx-shell/config/package-solution.json`.
- Do not run broad repo scans when targeted reads/greps are sufficient.
- Do not introduce live integrations, writeback, approval execution, source mutation, URL routing, SharePoint mutation, or random render-time data.
- Do not render developer/internal copy in the UI.
- Preserve PCC read-only / preview / no-writeback posture.
- Preserve every Project Home card as a direct child of `[data-pcc-bento-grid]`.
- Do not use `grid-auto-flow: dense`.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not add card-level active-panel ownership.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Use production-grade, end-user-facing copy only.
- Do not run Playwright for Prompt 04 unless the user explicitly requests it.

## Scope

Implement Project Home analytics cards only.

Likely modify:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
```

Likely create:

```text
apps/project-control-center/src/surfaces/projectHome/projectHomeAnalytics.ts
apps/project-control-center/src/tests/PccProjectHomeAnalyticsCards.test.tsx
```

Do not create or edit:

```text
apps/project-control-center/src/layout/pccDashboardComposition.ts
apps/project-control-center/src/analytics/*
apps/project-control-center/src/surfaces/phase05Dashboard/*
apps/project-control-center/config/package-solution.json
tools/spfx-shell/config/package-solution.json
```

If existing adjacent tests fail because they assert old Project Home order/count, update them to the new Prompt 04 canonical order in place. Do not add old/new toggles.

## Required Analytics Cards

Create exactly these three Project Home analytics cards.

### 1. Action Exposure Mix

Intent:

```text
Shows the mix of current priority-action exposure by type/severity.
```

Placement:

```text
Immediately after the first three operational cards:
Priority Actions
Site Health Summary
Document Control Center
Action Exposure Mix
```

Chart kind:

```text
donut
```

Required visible copy:

```text
Title: Action Exposure Mix
Eyebrow: Action exposure
Description: Preview distribution of active project exposure across action categories.
```

Source/state:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic project sample
sampleData: true
```

Suggested deterministic dataset:

```ts
[
  { name: 'Blocking', value: 4 },
  { name: 'Coordination', value: 7 },
  { name: 'Readiness', value: 5 },
  { name: 'Documentation', value: 3 },
]
```

Suggested summary:

```ts
[
  { label: 'Blocking items', value: '4', tone: 'danger' },
  { label: 'Coordination items', value: '7', tone: 'warning' },
  { label: 'Readiness items', value: '5', tone: 'info' },
]
```

### 2. Project Health Trend

Intent:

```text
Shows near-term project health trajectory related to Site Health Summary.
```

Placement:

```text
Immediately after Action Exposure Mix, so it remains adjacent to the first-row Site Health Summary without displacing the first operational row.
```

Chart kind:

```text
area
```

Required visible copy:

```text
Title: Project Health Trend
Eyebrow: Health trend
Description: Preview trend of project health signals across the next four review periods.
```

Source/state:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic project sample
sampleData: true
```

Suggested deterministic dataset:

```ts
[
  { category: 'W1', health: 82, exposure: 18 },
  { category: 'W2', health: 84, exposure: 16 },
  { category: 'W3', health: 81, exposure: 19 },
  { category: 'W4', health: 86, exposure: 14 },
]
```

Suggested summary:

```ts
[
  { label: 'Current health', value: '86%', tone: 'success' },
  { label: 'Exposure trend', value: 'Improving', tone: 'success' },
  { label: 'Watch items', value: '3', tone: 'warning' },
]
```

### 3. Readiness / Approval Rollup

Intent:

```text
Shows readiness, approvals, and missing-configuration posture in one rollup.
```

Placement:

```text
After Approvals & Checkpoints and before Missing Configurations.
```

Chart kind:

```text
grouped-bar
```

Required visible copy:

```text
Title: Readiness / Approval Rollup
Eyebrow: Readiness controls
Description: Preview rollup of startup readiness, approval aging, and configuration gaps.
```

Source/state:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic project sample
sampleData: true
```

Suggested deterministic dataset:

```ts
[
  { category: 'Readiness', complete: 74, open: 26 },
  { category: 'Approvals', complete: 68, open: 32 },
  { category: 'Configurations', complete: 81, open: 19 },
]
```

Suggested summary:

```ts
[
  { label: 'Readiness complete', value: '74%', tone: 'info' },
  { label: 'Approval open load', value: '32%', tone: 'warning' },
  { label: 'Config complete', value: '81%', tone: 'success' },
]
```

## Canonical Prompt 04 Project Home Order

After Prompt 04, the fixture path must render this exact direct-card order:

```text
1. Priority Actions
2. Site Health Summary
3. Document Control Center
4. Action Exposure Mix
5. Project Health Trend
6. Project Readiness
7. Approvals & Checkpoints
8. Readiness / Approval Rollup
9. Missing Configurations
10. External Platforms
11. Team Snapshot
12. Recent Activity
```

After Prompt 04, the read-model path must render this exact direct-card order:

```text
1. Priority Actions
2. Site Health Summary
3. Document Control Center
4. Action Exposure Mix
5. Project Health Trend
6. Project Readiness
7. Approvals & Checkpoints
8. Readiness / Approval Rollup
9. Missing Configurations
10. External Platforms
11. Team Snapshot
12. Recent Activity
13. Lifecycle Timeline
14. Ask HBI — Grounded Project Answers
15. Procore snapshot
16. Project Memory
17. Project Lens
18. Related Records
```

Operational spine rule:

- The nine operational cards from Prompt 02 must remain in the same relative order.
- Tests must assert the filtered operational-only sequence still equals the Prompt 02 nine-card spine.
- Lifecycle/HBI/Procore/detail cards must remain below the nine operational cards and below the three Project Home analytics cards.

## Span Override Matrix for Prompt 04 Analytics Cards

Use `PccAnalyticsCard.spanOverrides`.

Do not alter existing Prompt 02 operational span overrides.

Analytics card spans:

| Analytics card | largeLaptop / desktop / ultrawide | standardLaptop | smaller modes |
|---|---:|---:|---|
| Action Exposure Mix | 4 | 3 | footprint/default behavior |
| Project Health Trend | 4 | 3 | footprint/default behavior |
| Readiness / Approval Rollup | 4 | 4 | footprint/default behavior |

The intended 12-column Project Home grouping becomes:

```text
Row 1: Priority Actions 5 + Site Health Summary 3 + Document Control Center 4 = 12
Row 2: Action Exposure Mix 4 + Project Health Trend 4 + Project Readiness 4 = 12
Row 3: Approvals & Checkpoints 4 + Readiness / Approval Rollup 4 + Missing Configurations 4 = 12
Row 4: External Platforms 4 + Team Snapshot 3 + Recent Activity 5 = 12
```

The intended standard-laptop 10-column grouping becomes:

```text
Row 1: Priority Actions 4 + Site Health Summary 3 + Document Control Center 3 = 10
Row 2: Action Exposure Mix 3 + Project Health Trend 3 + Project Readiness 4 = 10
Row 3: Approvals & Checkpoints 3 + Readiness / Approval Rollup 4 + Missing Configurations 3 = 10
Row 4: External Platforms 3 + Team Snapshot 3 + Recent Activity 4 = 10
```

Do not override tablet/phone modes unless a test proves a defect.

## Project Home Analytics Helper

Create:

```text
apps/project-control-center/src/surfaces/projectHome/projectHomeAnalytics.ts
```

This file should own only Project Home analytics view models and span overrides.

Recommended exports:

```ts
import type { PccCardSpanOverrides } from '../../layout/footprints';
import {
  buildPreviewAnalyticsViewModel,
  type PccAnalyticsViewModel,
} from '../../analytics';

export type PccProjectHomeAnalyticsCardKey =
  | 'actionExposureMix'
  | 'projectHealthTrend'
  | 'readinessApprovalRollup';

export const PROJECT_HOME_ANALYTICS_CARD_TITLES = { ... } as const;

export const PROJECT_HOME_ANALYTICS_SPAN_OVERRIDES: Readonly<
  Record<PccProjectHomeAnalyticsCardKey, PccCardSpanOverrides>
> = { ... };

export const PROJECT_HOME_ANALYTICS_VIEW_MODELS: Readonly<
  Record<PccProjectHomeAnalyticsCardKey, PccAnalyticsViewModel>
> = { ... };
```

Use `buildPreviewAnalyticsViewModel` from the Prompt 03 analytics foundation.

Add a non-UI TODO near the helper exports:

```ts
// TODO(post-mvp): Replace deterministic Project Home analytics samples with
// source-backed read-model projections once Project Home analytics envelopes
// are defined. Keep this read-model driven; do not introduce workflow
// execution, source-system mutation, or writeback from analytics cards.
```

Do not use `Date.now()`, `Math.random()`, current time, locale-dependent formatting, tenant reads, source reads, or runtime mutation.

## Integration Requirements

### Fixture path

In `PccProjectHome.tsx`, import:

```ts
import { PccAnalyticsCard } from '../../analytics';
import {
  PROJECT_HOME_ANALYTICS_SPAN_OVERRIDES,
  PROJECT_HOME_ANALYTICS_VIEW_MODELS,
} from './projectHomeAnalytics';
```

Insert:

```tsx
<PccAnalyticsCard
  viewModel={PROJECT_HOME_ANALYTICS_VIEW_MODELS.actionExposureMix}
  footprint="standard"
  tier="tier2"
  region="operational"
  spanOverrides={PROJECT_HOME_ANALYTICS_SPAN_OVERRIDES.actionExposureMix}
/>
<PccAnalyticsCard
  viewModel={PROJECT_HOME_ANALYTICS_VIEW_MODELS.projectHealthTrend}
  footprint="standard"
  tier="tier2"
  region="operational"
  spanOverrides={PROJECT_HOME_ANALYTICS_SPAN_OVERRIDES.projectHealthTrend}
/>
```

after Document Control Center and before Project Readiness.

Insert:

```tsx
<PccAnalyticsCard
  viewModel={PROJECT_HOME_ANALYTICS_VIEW_MODELS.readinessApprovalRollup}
  footprint="standard"
  tier="tier2"
  region="operational"
  spanOverrides={PROJECT_HOME_ANALYTICS_SPAN_OVERRIDES.readinessApprovalRollup}
/>
```

after Approvals & Checkpoints and before Missing Configurations.

### Read-model path

Apply the same analytics card insertions in `PccProjectHomeReadModelContent.tsx`.

Prompt 04 analytics cards remain deterministic sample-data previews even when a read-model client is present. Do not attempt to derive these charts from read-model envelopes yet.

Do not pass gateway actions to analytics cards in Prompt 04.

Do not pass `forceAnimationDisabled` in production render paths. Tests may use foundation-level mocks or assertions without forcing production render behavior.

## Test Requirements

Update:

```text
apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
```

Create:

```text
apps/project-control-center/src/tests/PccProjectHomeAnalyticsCards.test.tsx
```

If other adjacent tests fail due to the new 12-card fixture path or 18-card read-model path, update those tests in place to the new canonical Prompt 04 order/count. Do not preserve old-order branches.

### Mocking ECharts in Project Home tests

Project Home tests render analytics cards, which render `PccEchartsCanvas`.

If existing Project Home tests start initializing real ECharts in jsdom and become brittle, add local ECharts mocks to the new analytics-specific Project Home test file only, or use the same direct ECharts mock pattern from the Prompt 03 analytics tests.

Do not modify production code to satisfy jsdom chart behavior.

### Composition tests

Tests must prove:

- fixture path direct-card order exactly equals the 12-card Prompt 04 order;
- read-model path direct-card order exactly equals the 18-card Prompt 04 order after async hooks settle;
- the filtered operational-only sequence still equals the Prompt 02 nine-card spine;
- Project Intelligence remains absent;
- zero direct bento cards carry `data-pcc-active-surface-panel="project-home"`;
- shell `main[role="tabpanel"][data-pcc-active-surface-panel="project-home"]` remains the owner when rendered through `PccApp`;
- every direct child of `[data-pcc-bento-grid]` is a `[data-pcc-card]`.

### Analytics card tests

Tests must prove:

- all three analytics card titles render on the fixture path;
- all three analytics card titles render on the read-model path;
- each analytics card has `data-pcc-analytics-card`;
- each analytics card has `data-pcc-analytics-card-state="preview"`;
- each analytics card has `data-pcc-analytics-card-sample-data="true"`;
- each analytics card has a nested `data-pcc-analytics-chart`;
- each analytics card has a nested `data-pcc-analytics-sample-data="true"`;
- preview copy is visible on each analytics card:
  - `Preview analytics · sample project data`;
  - `This preview uses deterministic sample project data until the source read model is connected.`;
- fallback summary rows are visible and outside the chart canvas;
- each analytics card is a direct child of the bento grid via `PccAnalyticsCard`/`PccDashboardCard`.

### Placement tests

Tests must prove the relative order around analytics cards:

```text
Priority Actions
Site Health Summary
Document Control Center
Action Exposure Mix
Project Health Trend
Project Readiness
Approvals & Checkpoints
Readiness / Approval Rollup
Missing Configurations
```

Also assert:

```text
Lifecycle Timeline index > Recent Activity index
Lifecycle Timeline index > Readiness / Approval Rollup index
```

on the read-model path.

### Span tests

At `desktop`, `largeLaptop`, and `ultrawide`, assert:

```text
Action Exposure Mix = 4, source override
Project Health Trend = 4, source override
Readiness / Approval Rollup = 4, source override
```

At `standardLaptop`, assert:

```text
Action Exposure Mix = 3, source override
Project Health Trend = 3, source override
Readiness / Approval Rollup = 4, source override
```

At `tabletLandscape`, assert analytics cards fall back to footprint behavior:

```text
data-pcc-span-source="footprint"
data-pcc-span-override-mode absent
```

### No dependency/import tests

Add or preserve a targeted assertion that PCC Project Home analytics code does not import `echarts-for-react`.

Scope this to:

```text
apps/project-control-center/src/surfaces/projectHome
apps/project-control-center/src/analytics
```

Do not fail because `packages/ui-kit` still has its existing wrapper.

## Acceptance Criteria

- Project Home fixture path renders 12 direct cards: 9 operational + 3 analytics.
- Project Home read-model path renders 18 direct cards: 12 Project Home first-fold cards + 6 lifecycle/HBI/Procore/detail cards.
- The nine operational cards remain in Prompt 02 relative order.
- The three analytics cards are placed exactly as specified.
- Analytics cards render deterministic sample-data previews using `PccAnalyticsCard`.
- Analytics cards render actual chart containers through the Prompt 03 foundation.
- Fallback summary and accessibility content are visible outside the chart canvas.
- Lifecycle/HBI/Procore/detail cards remain below the operational spine and analytics cluster.
- No dependency changes.
- No `echarts-for-react` addition or PCC import.
- No SPFx version bump.
- No layout composition helper is created.
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
  apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx \
  apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx \
  apps/project-control-center/src/surfaces/projectHome/projectHomeAnalytics.ts \
  apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx \
  apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx \
  apps/project-control-center/src/tests/PccProjectHome.test.tsx \
  apps/project-control-center/src/tests/PccProjectHomeAnalyticsCards.test.tsx
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If additional adjacent tests are edited, add them to the prettier check list.

If `pnpm exec prettier` cannot resolve the binary, stop and report. Do not use `npx`, do not install prettier, and do not modify dependency files.

Expected lockfile md5 before/after, absent user-owned dependency changes:

```text
7c19ccfa8718a42f7f55ce178a626996
```

## Closeout Report

Report in this structure:

```text
HB: Phase 06 Prompt 04 Closeout — Project Home Analytics Cards

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
- fixture order:
- read-model order:
- operational spine preservation:
- lifecycle/HBI/Procore placement:
- span overrides:
- sample-data posture:
- fallback/accessibility posture:
- active-panel ownership:
- direct-child invariant:

Validation:
- ...

Risks / Follow-Up:
- ...

Commit Guidance:
- Suggested summary:
  feat(pcc): add Project Home analytics cards
- Suggested description bullets:
  - add Project Home analytics helper with deterministic sample-data view models and span overrides for Action Exposure Mix, Project Health Trend, and Readiness / Approval Rollup;
  - insert analytics cards into fixture and read-model Project Home paths at the approved adjacency points while preserving the operational spine relative order;
  - keep Lifecycle / Ask HBI / Procore / Memory / Lens / Related Records below the Project Home operational and analytics cluster;
  - use PccAnalyticsCard from the direct ECharts foundation with visible preview explanation and fallback summaries;
  - update Project Home composition and analytics tests for 12-card fixture / 18-card read-model order, span overrides, sample-data markers, direct-child invariant, and no Project Intelligence regression;
  - no dependency install, no echarts-for-react PCC import, no SPFx version bump, no layout composition helper, no unrelated surface changes.
```

## Non-Goals

Do not do any of the following in Prompt 04:

- Add analytics cards to primary dashboard surfaces.
- Add analytics cards to non-Project Home routes.
- Create `pccDashboardComposition.ts`.
- Modify the analytics foundation.
- Modify Project Home gateways.
- Modify shell navigation.
- Install dependencies.
- Add or import `echarts-for-react`.
- Bump SPFx package version.
- Run Playwright.
- Generate tenant evidence.
- Edit architecture-blueprint docs.
