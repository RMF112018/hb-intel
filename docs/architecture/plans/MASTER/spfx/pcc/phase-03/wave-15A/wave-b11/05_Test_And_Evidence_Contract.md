# Test and Evidence Contract

## Component Test Requirements

Create/modify tests to prove:

### Span Overrides

- `spanOverrides` prop exists on `PccDashboardCard`.
- valid override is used for active mode;
- invalid overrides are clamped;
- base footprint remains default when no override exists;
- diagnostic markers are emitted;
- min inline-size behavior is preserved;
- no dense grid auto-flow is introduced.

### Project Home Composition

- fixture path target order:
  1. Priority Actions
  2. Site Health Summary
  3. Document Control Center
  4. Project Readiness
  5. Approvals & Checkpoints
  6. Missing Configurations
  7. External Platforms
  8. Team Snapshot
  9. Recent Activity
- read-model path aligns first nine operational cards before lifecycle/HBI/procore detail sections;
- Project Intelligence remains absent;
- no card-level active surface marker is reintroduced.

### Gateway Actions

- each Project Home card has required gateway action or disabled preview action;
- enabled gateway invokes module selection behavior;
- disabled gateway does not navigate;
- disabled gateway reason copy is visible.

### Analytics

- `PccEchartsCanvas` renders ready, preview, degraded, empty states;
- preview/degraded states render a visualization with deterministic sample data;
- product-grade explanation is visible;
- summary/fallback text is visible and testable;
- reduced-motion disables animation;
- chart options are deterministic;
- analytics cards render on each current primary dashboard.

## Expected Test Files

Create:

```text
apps/project-control-center/src/layout/PccDashboardCard.spanOverrides.test.tsx
apps/project-control-center/src/layout/pccDashboardComposition.test.ts
apps/project-control-center/src/analytics/PccEchartsCanvas.test.tsx
apps/project-control-center/src/analytics/PccAnalyticsCard.test.tsx
apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx
apps/project-control-center/src/tests/PccProjectHomeGatewayActions.test.tsx
apps/project-control-center/src/tests/PccDashboardAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccAnalyticsPreviewStates.test.tsx
```

Modify:

```text
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx
apps/project-control-center/src/tests/PccSurfaceNoDuplicateHeader.test.tsx
```

## Playwright Evidence Requirements

### Required screenshot set

- Project Home at standard laptop.
- Project Home at desktop.
- Project Home at ultrawide.
- Project Home with analytics cards visible.
- Documents dashboard with analytics visible.
- Core Tools dashboard with analytics visible.
- Estimating & Preconstruction dashboard with analytics visible.
- Startup & Closeout dashboard with analytics visible.
- Project Controls dashboard with analytics visible.
- Cost & Time dashboard with analytics visible.
- Systems Administration dashboard with analytics visible.
- Responsive compact/tablet/phone state where existing evidence supports it.

### Required assertions

- no duplicate `Project Intelligence`;
- no card-level active surface marker;
- shell tabpanel owns active panel marker;
- target Project Home first-fold order;
- target span rows;
- analytics cards render;
- preview/degraded chart explanations render;
- no horizontal overflow;
- gateway actions are present;
- disabled gateway reasons are visible;
- no false affordance;
- no obvious first-row stranded horizontal grid gap.

## Validation Commands

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Closeout Report Requirements

The agent must report:

- files changed;
- whether `echarts` dependency was already installed;
- package/lockfile md5 before/after;
- SPFx version before/after;
- tests run and results;
- Playwright evidence generated;
- known limitations;
- confirmation no dependency install was performed by the agent;
- confirmation no `echarts-for-react` was installed.
