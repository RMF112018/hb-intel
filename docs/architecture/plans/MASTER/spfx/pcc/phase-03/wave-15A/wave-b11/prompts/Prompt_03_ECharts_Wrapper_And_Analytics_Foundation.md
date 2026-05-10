# Prompt 03 — Direct ECharts Analytics Foundation — Updated

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

Prompt 01 added `spanOverrides` to `PccDashboardCard`.
Prompt 02 choreographed Project Home and added card-level gateways.
Prompt 03 creates the reusable PCC analytics foundation only.

## Objective

Create the PCC-owned analytics foundation using direct `echarts`, with:

- a direct ECharts canvas wrapper;
- deterministic preview/degraded sample data behavior;
- analytics card wrapper around `PccDashboardCard`;
- theme token mapping;
- reduced-motion support;
- accessibility fallback summaries;
- no page-specific dashboard analytics insertion yet.

Do **not** add Project Home, primary-tab, or cross-surface analytics cards in this prompt. Those are later prompts.

## Current Repo-Truth Baseline

Expected ancestry:

```text
Phase 5 closeout:
d06d614a02f16123d8c8252f71cebc22f348bc51

Prompt 01:
6e6454aafc4c9a6ca04e58611139eddab9616ae7

Prompt 02:
e5f9783e18f0a5860abec589b01bbc8f58ed1551
```

Expected current PCC package state:

```text
apps/project-control-center/package.json includes:
  "echarts": "^5.6.0"

apps/project-control-center/package.json does not include:
  "echarts-for-react"

apps/project-control-center/config/package-solution.json:
  solution.version = 1.0.0.216
  solution.features[0].version = 1.0.0.216
```

Expected current lockfile md5 after the user-side `echarts` add and Prompt 02 closeout:

```text
7c19ccfa8718a42f7f55ce178a626996
```

Important repo-truth correction:

- `echarts-for-react` may already exist elsewhere in the workspace, including `packages/ui-kit` and `pnpm-lock.yaml`.
- Do **not** treat workspace-level or lockfile-level `echarts-for-react` as a blocker.
- Prompt 03 must only ensure that `@hbc/spfx-project-control-center` does not add `echarts-for-react` and that PCC analytics code does not import it.

Run this preflight before editing:

```bash
git status --short
git rev-parse HEAD
git merge-base --is-ancestor d06d614a02f16123d8c8252f71cebc22f348bc51 HEAD && echo "phase-5-closeout-present" || echo "phase-5-closeout-missing"
git merge-base --is-ancestor 6e6454aafc4c9a6ca04e58611139eddab9616ae7 HEAD && echo "prompt-01-present" || echo "prompt-01-missing"
git merge-base --is-ancestor e5f9783e18f0a5860abec589b01bbc8f58ed1551 HEAD && echo "prompt-02-present" || echo "prompt-02-missing"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
node -e "const p=require('./apps/project-control-center/package.json'); console.log(JSON.stringify({dependencies:p.dependencies, devDependencies:p.devDependencies}, null, 2))"
git grep -n "echarts-for-react" -- apps/project-control-center package.json pnpm-workspace.yaml || true
git grep -n "from ['\"]echarts-for-react['\"]\|require(['\"]echarts-for-react['\"]" -- apps/project-control-center/src || true
```

Stop if:

- Phase 5, Prompt 01, or Prompt 02 ancestry is missing;
- `echarts` is missing from `apps/project-control-center/package.json`;
- `echarts-for-react` is present in `apps/project-control-center/package.json`;
- PCC source imports `echarts-for-react`;
- the working tree has unrelated dirty runtime/test/dependency files that you cannot account for.

If `echarts` is missing, stop and report exactly:

```text
BLOCKED_BY_MISSING_ECHARTS
```

Do not install dependencies.

## Global Instructions

- Do not re-read files that are still within your current context or memory unless they have changed, your context is stale, or validation requires it.
- Do not install dependencies.
- Do not add `echarts`.
- Do not add `echarts-for-react`.
- Do not import `echarts-for-react` in PCC.
- Do not use `@hbc/ui-kit`'s `EChartsRenderer`; PCC must own its direct ECharts wrapper.
- Do not add analytics cards to Project Home or primary-tab surfaces in this prompt.
- Do not edit Project Home choreography or gateway behavior.
- Do not edit `PccDashboardCard` unless a type-only import path issue is unavoidable; it should already support `spanOverrides` and `action`.
- Do not bump `apps/project-control-center/config/package-solution.json`; PCC remains `1.0.0.216`.
- Do not edit `tools/spfx-shell/config/package-solution.json`.
- Do not run broad repo scans when targeted reads/greps are sufficient.
- Do not introduce live integrations, writeback, approval execution, source mutation, URL routing, SharePoint mutation, or random render-time data.
- Do not render developer/internal copy in the UI.
- Preserve PCC read-only / preview / no-writeback posture.
- Keep every analytics card, when rendered, as a direct child-compatible `PccDashboardCard`.
- Do not use `grid-auto-flow: dense`.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Use production-grade, end-user-facing copy only.

## Scope

Create analytics foundation files only.

Create:

```text
apps/project-control-center/src/analytics/PccEchartsCanvas.tsx
apps/project-control-center/src/analytics/PccEchartsCanvas.module.css
apps/project-control-center/src/analytics/PccAnalyticsCard.tsx
apps/project-control-center/src/analytics/PccAnalyticsCard.module.css
apps/project-control-center/src/analytics/pccAnalyticsA11y.ts
apps/project-control-center/src/analytics/pccAnalyticsEcharts.ts
apps/project-control-center/src/analytics/pccAnalyticsFixtures.ts
apps/project-control-center/src/analytics/pccAnalyticsOptions.ts
apps/project-control-center/src/analytics/pccAnalyticsTheme.ts
apps/project-control-center/src/analytics/pccAnalyticsTypes.ts
apps/project-control-center/src/analytics/pccAnalyticsViewModels.ts
apps/project-control-center/src/analytics/index.ts
apps/project-control-center/src/analytics/PccEchartsCanvas.test.tsx
apps/project-control-center/src/analytics/PccAnalyticsCard.test.tsx
```

Do not create or edit in this prompt:

```text
apps/project-control-center/src/surfaces/projectHome/*
apps/project-control-center/src/surfaces/phase05Dashboard/*
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/config/package-solution.json
tools/spfx-shell/config/package-solution.json
apps/project-control-center/src/analytics/**/*.stories.*
```

If you discover a legitimate type-export issue that requires editing an existing file, stop and report before broadening scope.

## Architecture Contract

Use the current analytics architecture contract as the source for required types, direct-ECharts MVP posture, preview/degraded copy, reduced-motion behavior, theme mapping, and accessibility fallback requirements:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b11/03_Analytics_Architecture_Contract.md
```

This prompt implements the foundation only. Documentation updates are still owned by Phase 06 Prompt 13 unless a local README is needed for test discovery. Do not update architecture-blueprint docs here.

## Required Types

Create `pccAnalyticsTypes.ts`.

Minimum required exports:

```ts
import type { ReactNode } from 'react';
import type { PccCardFootprint, PccCardSpanOverrides } from '../layout/footprints';
import type { PccCardRegion, PccCardTier } from '../layout/PccDashboardCard';

export type PccAnalyticsState =
  | 'ready'
  | 'preview'
  | 'degraded'
  | 'empty'
  | 'source-unavailable';

export type PccAnalyticsChartKind =
  | 'donut'
  | 'stacked-bar'
  | 'grouped-bar'
  | 'line'
  | 'area'
  | 'progress-bars'
  | 'matrix';

export type PccAnalyticsTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface PccAnalyticsSummaryItem {
  readonly label: string;
  readonly value: string;
  readonly tone?: PccAnalyticsTone;
}

export interface PccAnalyticsViewModel {
  readonly id: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly description: string;
  readonly state: PccAnalyticsState;
  readonly stateLabel: string;
  readonly sourceLabel: string;
  readonly sampleData: boolean;
  readonly summary: readonly PccAnalyticsSummaryItem[];
  readonly chartKind: PccAnalyticsChartKind;
  readonly dataset: readonly Record<string, unknown>[];
  readonly accessibilitySummary: string;
}

export interface PccAnalyticsCardLayout {
  readonly footprint?: PccCardFootprint;
  readonly tier?: PccCardTier;
  readonly region?: PccCardRegion;
  readonly spanOverrides?: PccCardSpanOverrides;
}

export interface PccAnalyticsCardAction {
  readonly content: ReactNode;
}
```

Adjust names only if local type conventions require it, but preserve the data model.

## pccAnalyticsEcharts.ts

Create a small ECharts registration module:

```text
apps/project-control-center/src/analytics/pccAnalyticsEcharts.ts
```

Requirements:

- Use direct `echarts`, not `echarts-for-react`.
- Prefer modular registration.
- Register only the chart/components needed for the foundation.
- Register SVG renderer.
- Register a PCC/HB theme from `pccAnalyticsTheme.ts`.
- Make registration idempotent with a module-scoped boolean.
- Export the ECharts namespace or init helpers needed by `PccEchartsCanvas`.

Recommended import posture:

```ts
import * as echarts from 'echarts/core';
import type { EChartsOption, EChartsType } from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
```

If the exact ECharts type exports differ under the installed version, use the nearest type-safe ECharts v5 imports. Do not use `any` unless there is no reasonable alternative, and isolate any unavoidable type cast.

Default renderer:

```ts
{ renderer: 'svg' }
```

Do not use the existing `packages/ui-kit/src/HbcChart/EChartsRenderer.tsx` wrapper. That wrapper uses `echarts-for-react` and Canvas; Prompt 03 requires a PCC-owned direct wrapper.

Add non-UI TODO in this module:

```ts
// TODO(post-mvp): Re-evaluate echarts-for-react after MVP if it materially
// improves chart lifecycle handling, animation quality, responsiveness,
// accessibility integration, or maintainability versus the PCC-owned direct
// echarts wrapper.
```

## pccAnalyticsTheme.ts

Map existing HB/PCC tokens into chart colors.

Use imports from `@hbc/ui-kit/theme` where available.

Required theme intent:

- text primary;
- text muted;
- border/gridline;
- info;
- success;
- warning;
- danger;
- neutral;
- HB orange accent;
- command navy/dark header only where appropriate.

Do not hardcode arbitrary per-chart palettes inside `PccEchartsCanvas` or `PccAnalyticsCard`.

Export:

```ts
export const PCC_ANALYTICS_ECHARTS_THEME_NAME = 'pcc-analytics';
export const PCC_ANALYTICS_THEME = { ... };
export const PCC_ANALYTICS_SERIES_COLORS = [...];
```

or equivalent.

## pccAnalyticsA11y.ts

Create utilities for:

- reduced-motion detection;
- deterministic state copy;
- sample-data explanation;
- fallback summary text helpers.

Requirements:

```ts
export const PCC_ANALYTICS_PREVIEW_LABEL = 'Preview analytics · sample project data';

export const PCC_ANALYTICS_PREVIEW_DESCRIPTION =
  'This preview uses deterministic sample project data until the source read model is connected.';
```

Do not use:

```text
TODO
Mock chart
Dummy data
Developer preview
Fake data
```

Reduced motion:

```ts
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

Also provide a helper that returns whether animation should be disabled given `forceAnimationDisabled`.

## pccAnalyticsFixtures.ts and pccAnalyticsViewModels.ts

Create deterministic sample view models for tests and future prompts.

Requirements:

- no `Date.now()`;
- no `Math.random()`;
- no current system time;
- no live fetch;
- no tenant data;
- no Procore/Sage/SharePoint mutation;
- stable ids and values;
- at least one ready sample, one preview sample, and one degraded sample.

These fixtures are allowed because later prompts need deterministic analytics cards.

Do not render these fixtures into any production surface in Prompt 03.

## pccAnalyticsOptions.ts

Convert `PccAnalyticsViewModel` into an ECharts option.

Requirements:

- deterministic output;
- no mutation of the input view model;
- disable animation when requested;
- support at least:
  - line/area;
  - grouped-bar/stacked-bar;
  - donut;
- return a safe fallback option for unsupported kinds;
- place labels/legend so facts are not chart-only;
- do not rely on tooltip-only critical facts.

Suggested shape:

```ts
export interface BuildPccAnalyticsOptionArgs {
  readonly viewModel: PccAnalyticsViewModel;
  readonly animationDisabled: boolean;
}

export function buildPccAnalyticsOption(args: BuildPccAnalyticsOptionArgs): EChartsOption {
  ...
}
```

## PccEchartsCanvas.tsx

Create a direct ECharts canvas wrapper.

Props:

```ts
import type { EChartsOption } from 'echarts/core';
import type { PccAnalyticsState } from './pccAnalyticsTypes';

export interface PccEchartsCanvasProps {
  readonly chartId: string;
  readonly state: PccAnalyticsState;
  readonly sampleData: boolean;
  readonly option: EChartsOption;
  readonly accessibilitySummary: string;
  readonly forceAnimationDisabled?: boolean;
  readonly className?: string;
}
```

Requirements:

- render a container `<div>` with a child chart host `<div ref={...}>`;
- initialize ECharts only when the chart host ref exists;
- register ECharts modules/theme before init;
- initialize with SVG renderer;
- dispose on unmount;
- call `setOption` when options or animation policy changes;
- resize on container resize;
- handle missing `ResizeObserver` by falling back to window `resize`;
- support `forceAnimationDisabled`;
- disable animation if reduced-motion is active;
- emit stable markers:
  - `data-pcc-analytics-chart={chartId}`
  - `data-pcc-analytics-state={state}`
  - `data-pcc-analytics-sample-data={sampleData ? 'true' : 'false'}`
  - `data-pcc-analytics-animation="enabled" | "disabled"`
- include accessible text/fallback outside the ECharts instance, for example:
  - `role="img"`
  - `aria-label={accessibilitySummary}`
  - visually available fallback summary when used through `PccAnalyticsCard`;
- never be the only source of critical information.

Important lifecycle guidance:

- Store the ECharts instance in `useRef`.
- Do not re-initialize on every render.
- Dispose and clear refs on unmount.
- Do not call ECharts APIs before the instance exists.
- Do not rely on chart host width being non-zero in tests.

## PccAnalyticsCard.tsx

Create a wrapper around `PccDashboardCard`.

Props should include:

```ts
import type { ReactNode } from 'react';
import type { PccCardFootprint, PccCardSpanOverrides } from '../layout/footprints';
import type { PccCardRegion, PccCardTier } from '../layout/PccDashboardCard';
import type { PccAnalyticsViewModel } from './pccAnalyticsTypes';

export interface PccAnalyticsCardProps {
  readonly viewModel: PccAnalyticsViewModel;
  readonly footprint?: PccCardFootprint;
  readonly tier?: PccCardTier;
  readonly region?: PccCardRegion;
  readonly spanOverrides?: PccCardSpanOverrides;
  readonly action?: ReactNode;
  readonly forceAnimationDisabled?: boolean;
}
```

Requirements:

- render `PccDashboardCard`;
- pass through `spanOverrides`;
- render `viewModel.eyebrow`, `viewModel.title`, and optional `action`;
- render state/source copy visibly;
- render preview/degraded explanation visibly when:
  - `viewModel.state === 'preview'`, or
  - `viewModel.state === 'degraded'`, or
  - `viewModel.sampleData === true`;
- render fallback summary list/table from `viewModel.summary`;
- render `PccEchartsCanvas`;
- call `buildPccAnalyticsOption`;
- use product-grade copy only;
- add stable markers:
  - `data-pcc-analytics-card={viewModel.id}`
  - `data-pcc-analytics-card-state={viewModel.state}`
  - `data-pcc-analytics-card-sample-data={viewModel.sampleData ? 'true' : 'false'}`.

Direct-child invariant:

- `PccAnalyticsCard` must return a `PccDashboardCard` as its outer rendered element, not a wrapper around it. It must be safe to render as a direct child of `PccBentoGrid`.

## CSS Requirements

`PccEchartsCanvas.module.css`:

- stable minimum chart height suitable for cards;
- no absolute-only chart content without fallback;
- supports responsive width;
- no horizontal overflow;
- chart host must have explicit min height.

`PccAnalyticsCard.module.css`:

- compact summary/fallback layout;
- state/source row;
- preview/degraded explanation;
- non-color-only summary tones;
- no hardcoded arbitrary brand colors where existing CSS variables or token-backed variables are available.

## index.ts

Export only the public analytics foundation API needed by later prompts:

```ts
export * from './PccAnalyticsCard';
export * from './PccEchartsCanvas';
export * from './pccAnalyticsA11y';
export * from './pccAnalyticsFixtures';
export * from './pccAnalyticsOptions';
export * from './pccAnalyticsTheme';
export * from './pccAnalyticsTypes';
export * from './pccAnalyticsViewModels';
```

Do not export internal test-only helpers.

## Tests

Create:

```text
apps/project-control-center/src/analytics/PccEchartsCanvas.test.tsx
apps/project-control-center/src/analytics/PccAnalyticsCard.test.tsx
```

Use Vitest and Testing Library conventions already used in PCC.

### ECharts test strategy

Do not require a real browser canvas/SVG layout engine in jsdom.

Use `vi.mock` for direct ECharts modules in `PccEchartsCanvas.test.tsx` where practical:

- mock `echarts/core`:
  - `use`
  - `registerTheme`
  - `init`
  - returned instance with:
    - `setOption`
    - `resize`
    - `dispose`
- mock chart/component/renderer modules if needed to satisfy imports.
- provide a mock `ResizeObserver` for tests that verify resize behavior.
- restore global mocks after each test.

Do not mock `PccAnalyticsCard` tests so heavily that `PccDashboardCard` integration is bypassed. It must render through `PccBentoGrid` because `PccDashboardCard` requires bento context.

### Required PccEchartsCanvas tests

Prove:

- chart container renders with markers:
  - `data-pcc-analytics-chart`
  - `data-pcc-analytics-state`
  - `data-pcc-analytics-sample-data`
- ECharts is initialized once when mounted;
- ECharts uses SVG renderer;
- `setOption` is called with deterministic options;
- `forceAnimationDisabled` results in `animation: false`;
- reduced-motion matchMedia results in `animation: false`;
- ResizeObserver triggers `resize`;
- window resize fallback triggers `resize` when ResizeObserver is unavailable;
- unmount disposes the instance;
- no `echarts-for-react` import exists in PCC analytics source.

The no-wrapper test can be a targeted source grep/static test or a unit assertion against imported mocks. It must inspect only PCC analytics source, not the whole workspace.

### Required PccAnalyticsCard tests

Render through:

```tsx
<PccBentoGrid forceMode="desktop">
  <PccAnalyticsCard viewModel={...} forceAnimationDisabled />
</PccBentoGrid>
```

Prove:

- ready chart renders;
- preview chart renders with sample-data markers;
- degraded chart renders with sample-data markers and explanation;
- fallback summary renders outside the chart canvas;
- state/source copy renders visibly;
- preview copy renders exactly:
  - `Preview analytics · sample project data`
  - `This preview uses deterministic sample project data until the source read model is connected.`
- `spanOverrides` pass through to `PccDashboardCard` and emit `data-pcc-span-source="override"`;
- optional action renders in the card action slot;
- `PccAnalyticsCard` outer element is a `data-pcc-card` direct child when rendered inside `PccBentoGrid`;
- unsupported chart kinds or empty datasets still render a safe fallback summary and do not throw.

### Do not add Playwright

Do not run Playwright for Prompt 03 unless the user explicitly asks. This is a foundation/component prompt. Hosted visual evidence belongs to later evidence prompts.

## Acceptance Criteria

- `apps/project-control-center/src/analytics/` exists with the required foundation files.
- Direct `echarts` wrapper exists and uses SVG renderer.
- `echarts-for-react` is not added to PCC and not imported in PCC source.
- Workspace-level `echarts-for-react` in `packages/ui-kit` or `pnpm-lock.yaml` is not treated as a failure.
- `PccAnalyticsCard` wraps `PccDashboardCard` and supports `spanOverrides`.
- Preview/degraded states render deterministic sample data with product-grade explanation.
- Critical facts render outside the chart canvas in fallback summaries.
- Reduced motion and `forceAnimationDisabled` disable chart animation.
- ECharts lifecycle is covered: init, setOption, resize, dispose.
- No page-specific analytics cards are inserted into Project Home or other surfaces.
- No dependency installation occurs.
- No package/lockfile changes occur in this prompt.
- No SPFx version bump occurs.
- Full PCC typecheck and test suite pass.

## Required Validation

Run the narrowest validation needed during implementation, then at closeout run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check \
  apps/project-control-center/src/analytics/PccEchartsCanvas.tsx \
  apps/project-control-center/src/analytics/PccEchartsCanvas.module.css \
  apps/project-control-center/src/analytics/PccAnalyticsCard.tsx \
  apps/project-control-center/src/analytics/PccAnalyticsCard.module.css \
  apps/project-control-center/src/analytics/pccAnalyticsA11y.ts \
  apps/project-control-center/src/analytics/pccAnalyticsEcharts.ts \
  apps/project-control-center/src/analytics/pccAnalyticsFixtures.ts \
  apps/project-control-center/src/analytics/pccAnalyticsOptions.ts \
  apps/project-control-center/src/analytics/pccAnalyticsTheme.ts \
  apps/project-control-center/src/analytics/pccAnalyticsTypes.ts \
  apps/project-control-center/src/analytics/pccAnalyticsViewModels.ts \
  apps/project-control-center/src/analytics/index.ts \
  apps/project-control-center/src/analytics/PccEchartsCanvas.test.tsx \
  apps/project-control-center/src/analytics/PccAnalyticsCard.test.tsx
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If `pnpm exec prettier` cannot resolve the binary, stop and report. Do not use `npx`, do not install prettier, and do not modify dependency files.

Expected lockfile md5 before/after, absent user-owned dependency changes:

```text
7c19ccfa8718a42f7f55ce178a626996
```

## Closeout Report

Report in this structure:

```text
HB: Phase 06 Prompt 03 Closeout — Direct ECharts Analytics Foundation

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
- echarts already present before prompt: Yes/No
- echarts added by agent: No
- echarts-for-react added to PCC: No
- PCC source imports echarts-for-react: No
- Workspace-level echarts-for-react treated as blocker: No
- pnpm-lock md5 before:
- pnpm-lock md5 after:

Implementation Notes:
- direct ECharts wrapper:
- SVG renderer:
- module registration:
- theme mapping:
- reduced-motion behavior:
- preview/degraded sample data:
- accessibility fallback:
- analytics card direct-child compatibility:
- no page-specific analytics inserted:

Validation:
- ...

Risks / Follow-Up:
- ...

Commit Guidance:
- Suggested summary:
  feat(pcc): add direct ECharts analytics foundation
- Suggested description bullets:
  - add PCC-owned direct ECharts wrapper using modular registration and SVG renderer;
  - add analytics card wrapper around PccDashboardCard with spanOverrides, state/source copy, deterministic sample-data explanations, and fallback summaries;
  - add analytics theme, a11y utilities, fixtures, view-model helpers, and option builders;
  - cover ECharts lifecycle, reduced motion, preview/degraded behavior, span pass-through, fallback summaries, and no PCC echarts-for-react import with tests;
  - no page-specific analytics insertion, no dependency install, no SPFx version bump, no lockfile change.
```

## Non-Goals

Do not do any of the following in Prompt 03:

- Add analytics cards to Project Home.
- Add analytics cards to primary dashboard surfaces.
- Add surface-specific chart choreography.
- Import or add `echarts-for-react` to PCC.
- Use `packages/ui-kit/src/HbcChart/EChartsRenderer.tsx`.
- Install dependencies.
- Change `pnpm-lock.yaml`.
- Bump SPFx package version.
- Generate SPFx package.
- Run Playwright.
- Produce tenant-hosted evidence.
- Edit architecture blueprint docs.
- Change Project Home order, gateways, or span choreography.
