# Prompt 13 — Test Suite, Accessibility, and Regression Coverage

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

## Objective

Consolidate and harden tests for Phase 06 layout, analytics, gateway behavior, accessibility, and no-regression guardrails.

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

## Scope

Implement or update tests across Phase 06. This prompt may touch tests and small testability markers only. Avoid production rewrites unless a test exposes a real defect that must be fixed.

## Required Test Files

Ensure these exist and pass:

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

Update:

```text
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx
apps/project-control-center/src/tests/PccSurfaceNoDuplicateHeader.test.tsx
```

## Required Assertions

### Layout

- span override source markers;
- span clamp behavior;
- target Project Home card order;
- target Project Home span rows for:
  - `standardLaptop`
  - `largeLaptop`
  - `desktop`
  - `ultrawide`
- no `grid-auto-flow: dense`;
- direct-child bento invariant.

### Analytics

- analytics cards exist on every current primary dashboard;
- preview/degraded state renders visualization;
- deterministic sample-data explanation visible;
- accessible summary/fallback visible;
- no critical information is canvas-only.

### Gateways

- Project Home gateway actions exist;
- enabled actions invoke module selection;
- disabled action has visible reason;
- no false affordance.

### No Regression

- `Project Intelligence` not present as bento card;
- no card-level active panel marker;
- shell tabpanel remains active panel owner;
- no `echarts-for-react` dependency.

## Accessibility

Tests should verify:

- analytics card accessible names;
- chart fallback summaries;
- gateway button labels;
- disabled reason copy;
- no color-only status text.

## Validation

Run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

Then run formatting and diff checks.

## Acceptance

All Phase 06 component tests pass. Any failures are fixed or explicitly reported with root cause.

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
