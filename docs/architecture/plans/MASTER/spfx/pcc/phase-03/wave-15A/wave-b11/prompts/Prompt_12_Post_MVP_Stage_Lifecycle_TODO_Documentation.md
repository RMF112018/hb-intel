# Prompt 12 — Post-MVP Stage/Lifecycle TODO Documentation

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

## Objective

Add comprehensive TODO-style non-UI documentation for post-MVP stage/lifecycle-aware navigation and Project Home context, aligned to the Product Architecture / User Journey Blueprint.

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

Documentation comments and/or developer-facing markdown only. Do not render TODO text in the UI.

## Governing Reference

Use:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
```

Focus on:

- project-first command center;
- role-aware journeys;
- Project Home / Command Center;
- governed work center navigation;
- lifecycle readiness;
- unified lifecycle doctrine;
- later-phase structured workflows.

## Required TODO Locations

Add TODOs in appropriate non-UI implementation files, likely:

```text
apps/project-control-center/src/layout/pccDashboardComposition.ts
apps/project-control-center/src/analytics/pccAnalyticsViewModels.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
```

Do not over-comment every component. Place TODOs where future implementation teams will naturally look.

## Required TODO Themes

1. Stage-aware Project Home context:
   - project stage;
   - lifecycle phase;
   - stage-specific card priority;
   - stage-specific analytics emphasis.

2. Role/persona-aware Project Home:
   - PM;
   - PX;
   - Superintendent;
   - Project Accountant;
   - Estimating users;
   - Executive read-only.

3. Lifecycle-aware navigation:
   - module visibility/emphasis by stage;
   - Project Home command context;
   - gateway recommendations;
   - future route/module model;
   - read-model source authority.

4. Analytics context:
   - stage-aware chart selection;
   - lifecycle trend emphasis;
   - preview sample data replaced by read-model data;
   - source-backed readiness.

5. Safety boundaries:
   - no writeback;
   - no autonomous decisions;
   - no approval execution;
   - no external system mutation until future command-model contract.

## Required TODO Example

Use this or a substantively equivalent comment:

```ts
// TODO(post-mvp): Implement stage/lifecycle-aware Project Home context using
// the PCC Product Architecture and User Journey Blueprint as the governing
// reference. Project Home should adjust card priority, analytics emphasis,
// gateway recommendations, and command context based on project stage,
// lifecycle signals, role/persona, and source-backed project readiness.
// This must remain read-model driven until a future command-model contract
// authorizes workflow execution or source-system writeback.
```

## `echarts-for-react` TODO

Ensure this TODO exists in the analytics foundation:

```ts
// TODO(post-mvp): Re-evaluate echarts-for-react after MVP if it materially
// improves chart lifecycle handling, animation quality, responsiveness,
// accessibility integration, or maintainability versus the PCC-owned direct
// echarts wrapper.
```

## Tests

No test is required solely for TODO comments unless existing repo conventions include documentation snapshot tests. If adding docs, include them in prettier check.

## Acceptance

- TODO documentation exists in durable implementation locations.
- No TODO text appears in the visible UI.
- TODOs are specific enough for future developers to implement the post-MVP feature.

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
