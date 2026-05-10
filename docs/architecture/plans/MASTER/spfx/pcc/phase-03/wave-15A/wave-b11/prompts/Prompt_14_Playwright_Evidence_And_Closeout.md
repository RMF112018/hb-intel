# Prompt 14 — Playwright Evidence and Phase 06 Closeout

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

## Objective

Generate Playwright/evidence closeout for Phase 06, prove visual layout and analytics behavior, and produce final validation report.

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

Run Playwright/evidence and produce closeout. Make only evidence/test updates or very narrow fixes for issues found during evidence collection.

## Preflight

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
```

## Required Evidence

Use existing PCC live evidence conventions. Add or update evidence tests only as needed.

### Screenshot / Evidence Set

Capture or update evidence for:

- Project Home standard laptop.
- Project Home desktop.
- Project Home ultrawide.
- Project Home with analytics visible.
- Documents dashboard with analytics visible.
- Core Tools dashboard with analytics visible.
- Estimating & Preconstruction dashboard with analytics visible.
- Startup & Closeout dashboard with analytics visible.
- Project Controls dashboard with analytics visible.
- Cost & Time dashboard with analytics visible.
- Systems Administration dashboard with analytics visible.
- Preview/degraded analytics explanation visible.
- Gateway disabled reason visible where applicable.

### Required Assertions

Evidence must prove:

- no duplicate `Project Intelligence` card;
- no card-level active panel marker;
- shell `main[role="tabpanel"]` owns active panel marker;
- Project Home target order;
- target span rows;
- analytics cards render;
- preview/degraded visualizations render;
- sample-data explanation visible;
- no horizontal overflow;
- disabled gateways are not false affordances;
- no clipped analytics card content.

## Commands

Run as applicable:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```

If tenant/live credentials or storage state are unavailable, report the blocker clearly and run all available component/unit tests. Do not fabricate Playwright evidence.

## Final Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Closeout Report

Produce final report with:

- commit-ready summary;
- exact files changed;
- dependency status:
  - `echarts` present;
  - `echarts-for-react` absent;
  - dependency install was user-owned;
- lockfile md5 before/after;
- SPFx solution/feature version before/after;
- tests run and results;
- Playwright evidence run and results;
- screenshot/evidence paths;
- remaining known limitations;
- confirmation no live writeback/integration/mutation was introduced.

## Acceptance

Phase 06 is not complete until validation and evidence are complete or blockers are explicitly documented.

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
