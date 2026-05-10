# Prompt 03 — ECharts Wrapper and Analytics Foundation

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

## Objective

Create the PCC analytics foundation using direct `echarts`, with wrapper components, deterministic preview states, theme mapping, reduced-motion behavior, and accessibility fallbacks.

## Global Instructions

- Do not re-read files that are still within your current context or memory unless they have changed, your context is stale, or validation requires it.
- Do not install dependencies.
- Do not add `echarts-for-react`.
- Do not run broad repo scans when targeted reads are sufficient.
- Do not introduce live integrations, writeback, approval execution, source mutation, or random render-time data.
- Do not render developer/internal copy in the UI.
- Preserve PCC read-only / preview / no-writeback posture.
- Keep every bento card as a direct child of `[data-pcc-bento-grid]`.
- Do not use `grid-auto-flow: dense` as the primary layout fix.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Use production-grade, end-user-facing copy only.

## Dependency Gate

Before editing, verify:

```text
apps/project-control-center/package.json includes echarts
pnpm-lock.yaml includes echarts
apps/project-control-center/package.json does NOT include echarts-for-react
pnpm-lock.yaml does NOT include echarts-for-react
```

If `echarts` is missing, stop and report:

```text
BLOCKED_BY_MISSING_ECHARTS
```

Do not install dependencies.

If `echarts` was installed by the user after Prompt 00, record the changed `pnpm-lock.yaml` md5 and treat the package/lockfile changes as expected user-owned prerequisite changes.

## Scope

Create analytics architecture only. Do not add page-specific analytics cards in this prompt except a minimal test fixture/demo if needed to prove the wrapper.

## Required Files

Create:

```text
apps/project-control-center/src/analytics/PccEchartsCanvas.tsx
apps/project-control-center/src/analytics/PccEchartsCanvas.module.css
apps/project-control-center/src/analytics/PccAnalyticsCard.tsx
apps/project-control-center/src/analytics/PccAnalyticsCard.module.css
apps/project-control-center/src/analytics/pccAnalyticsA11y.ts
apps/project-control-center/src/analytics/pccAnalyticsFixtures.ts
apps/project-control-center/src/analytics/pccAnalyticsOptions.ts
apps/project-control-center/src/analytics/pccAnalyticsTheme.ts
apps/project-control-center/src/analytics/pccAnalyticsTypes.ts
apps/project-control-center/src/analytics/pccAnalyticsViewModels.ts
apps/project-control-center/src/analytics/index.ts
apps/project-control-center/src/analytics/PccEchartsCanvas.test.tsx
apps/project-control-center/src/analytics/PccAnalyticsCard.test.tsx
```

## Required Types

Implement the analytics types from `03_Analytics_Architecture_Contract.md`.

## PccEchartsCanvas Requirements

- Use direct `echarts`.
- Prefer modular ECharts registration where practical.
- Default renderer: SVG unless repo constraints require Canvas.
- Initialize only when container ref exists.
- Dispose on unmount.
- Resize on container resize.
- Apply options deterministically.
- Support `forceAnimationDisabled`.
- Disable animation if reduced-motion is active.
- Emit:
  - `data-pcc-analytics-chart`
  - `data-pcc-analytics-state`
  - `data-pcc-analytics-sample-data`
- Render no critical facts only inside canvas.

## PccAnalyticsCard Requirements

- Wrap `PccDashboardCard`.
- Accept `spanOverrides`.
- Render chart plus fallback summary.
- Render visible state/source copy.
- Render preview/degraded explanation.
- Accept optional action/gateway.
- Use product-grade copy.

## Preview State Requirement

Preview/degraded cards must render a chart with deterministic sample data. Use:

```text
Preview analytics · sample project data
This preview uses deterministic sample project data until the source read model is connected.
```

Do not use developer terms in UI.

## TODO for `echarts-for-react`

Add non-UI TODO:

```ts
// TODO(post-mvp): Re-evaluate echarts-for-react after MVP if it materially
// improves chart lifecycle handling, animation quality, responsiveness,
// accessibility integration, or maintainability versus the PCC-owned direct
// echarts wrapper.
```

## Tests

Prove:

- ready chart renders;
- preview chart renders with sample data;
- degraded chart renders with sample data and explanation;
- fallback summary renders;
- reduced-motion disables animation;
- wrapper disposes cleanly;
- no dependency on `echarts-for-react`.

## Acceptance

- `echarts` direct wrapper exists.
- No page-specific dashboard analytics yet required.
- No dependency install performed.
- No `echarts-for-react`.

## Required Validation

Run the narrowest validation needed during implementation, then at closeout run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If Playwright evidence is in scope for this prompt, also run the requested Playwright commands.

## Closeout Report

Report:

- files changed;
- dependency/package/lockfile changes observed;
- validation commands and results;
- whether SPFx solution/feature version changed;
- risks or follow-up items;
- confirmation that you did not install dependencies;
- confirmation that `echarts-for-react` was not added.
