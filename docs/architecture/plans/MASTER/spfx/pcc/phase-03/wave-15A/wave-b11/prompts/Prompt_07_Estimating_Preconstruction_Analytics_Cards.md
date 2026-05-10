# Prompt 07 — Estimating & Preconstruction Analytics Cards

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

## Objective

Add estimating/preconstruction preview analytics that support handoff continuity and exposure visibility without implying live estimating integration.

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

Implement analytics cards for the **Estimating & Preconstruction** dashboard only.

Do not modify unrelated dashboards in this prompt.

## Required Analytics Cards

- **Handoff Continuity Preview** — related to Preconstruction Handoff; chart: progress / stacked bar; placement: near handoff card.
- **Estimate Exposure Preview** — related to Assumptions / Alternates / Exclusions; chart: grouped bar or waterfall-style bar; placement: near estimate context cards.

## Files To Inspect / Modify

- `apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx`
- `apps/project-control-center/src/surfaces/phase05Dashboard/`
- `apps/project-control-center/src/tests/PccDashboardAnalyticsCards.test.tsx`

Also use the shared analytics foundation created in:

```text
apps/project-control-center/src/analytics/
apps/project-control-center/src/layout/pccDashboardComposition.ts
```

## Placement Requirements

Use current primary tab id `estimating-preconstruction`. These analytics are likely preview/sample-data-backed in MVP. Make the preview state clear and product-grade.

Analytics cards should be direct children of `PccBentoGrid` via the existing surface render path. They should be near related operational cards where feasible.

## Data Requirements

- Use existing read-model/fixture data where available.
- Where source data is incomplete, use deterministic sample project data from `pccAnalyticsFixtures.ts`.
- Do not generate random values in render.
- Set `sampleData: true` for preview sample-data visualizations.
- Use product-grade preview explanation.

## Chart Requirements

- Build chart options through `pccAnalyticsOptions.ts`.
- Use consistent theme mapping from `pccAnalyticsTheme.ts`.
- Include accessible summary and fallback content.
- Do not make tooltip-only information critical.
- Animation defaults to enabled unless reduced-motion or test override disables it.

## Test Requirements

Add or extend tests to prove:

- the required analytics cards render on Estimating & Preconstruction;
- the cards are placed near related operational content;
- preview/degraded state renders an actual visualization;
- sample-data explanation is visible;
- summary/fallback text is visible;
- direct-child bento invariant remains intact.

## Acceptance

- Estimating & Preconstruction dashboard includes the required MVP analytics cards.
- Visualizations are previewable in MVP.
- No live data or writeback is implied.
- No dependency install performed.

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
