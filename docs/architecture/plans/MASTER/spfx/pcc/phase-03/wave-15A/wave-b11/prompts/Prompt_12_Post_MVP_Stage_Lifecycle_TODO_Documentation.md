# Prompt 12 — Post-MVP Stage/Lifecycle TODO Documentation — Updated

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 documentation-only work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

Prompt 01 added `spanOverrides`.
Prompt 02 locked Project Home choreography and gateways.
Prompt 03 added the PCC-owned direct ECharts analytics foundation.
Prompt 04 inserted Project Home analytics cards.
Prompts 07–11 inserted primary-dashboard analytics into `PccPrimaryDashboardSurface` for Estimating, Startup & Closeout, Project Controls, Cost & Time, and Systems Administration.

Prompt 12 adds **non-UI post-MVP TODO documentation only** for future stage/lifecycle-aware Project Home, navigation, analytics, and role/persona context.

## Objective

Add durable developer-facing TODO documentation for future post-MVP stage/lifecycle-aware PCC behavior, aligned to the Product Architecture / User Journey Blueprint.

The implementation must:

- add comments only;
- not render TODO text in the UI;
- not change runtime behavior;
- not change card order, span overrides, analytics view-model values, navigation metadata, tests, package versions, dependencies, or read-model behavior;
- preserve all Prompt 01–11 implementation and tests;
- avoid creating stale or speculative implementation files.

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
Prompt 10: 122d9c6d156e2f99ccbc33d9e90823c72756159e
Prompt 11: 35417e699fc1a1a4b9c4e9d06e0e1ac3c77ea153
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

Current implementation facts:

```text
apps/project-control-center/src/layout/pccDashboardComposition.ts does not exist.
Do not create it.

apps/project-control-center/src/surfaces/projectHome/projectHomeChoreography.ts already contains a post-MVP stage/lifecycle-aware Project Home TODO from Prompt 02.
Do not duplicate it; refine or extend it only if needed.

apps/project-control-center/src/analytics/pccAnalyticsEcharts.ts already contains the echarts-for-react post-MVP re-evaluation TODO from Prompt 03.
Do not duplicate it; verify that it exists and report it in closeout.

PccPrimaryDashboardSurface currently routes analytics through renderPrimaryDashboardAnalytics(activePrimaryTabId):
- estimating-preconstruction -> 2 analytics cards
- startup-closeout -> 3 analytics cards
- project-controls -> 3 analytics cards
- cost-time -> 3 analytics cards
- systems-administration -> 3 analytics cards
- core-tools -> null / unchanged 3-card primary dashboard
```

## Governing Reference

Use this architecture file as the governing reference for the TODO language:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
```

The TODOs should align to these blueprint concepts:

- project-first command center;
- role-aware journeys;
- Project Home / Command Center;
- governed work center navigation;
- lifecycle readiness;
- unified lifecycle doctrine;
- later-phase structured workflows;
- safe read-model posture until command-model gates authorize mutation or execution.

## Preflight

Run this preflight before editing:

```bash
git status --short
git rev-parse HEAD
git log --oneline -16
git merge-base --is-ancestor d06d614a02f16123d8c8252f71cebc22f348bc51 HEAD && echo "phase-5-closeout-present" || echo "phase-5-closeout-missing"
git merge-base --is-ancestor 6e6454aafc4c9a6ca04e58611139eddab9616ae7 HEAD && echo "prompt-01-present" || echo "prompt-01-missing"
git merge-base --is-ancestor e5f9783e18f0a5860abec589b01bbc8f58ed1551 HEAD && echo "prompt-02-present" || echo "prompt-02-missing"
git merge-base --is-ancestor 08f133842fc6e8c10f3bfa5dd4fab49178942352 HEAD && echo "prompt-03-present" || echo "prompt-03-missing"
git merge-base --is-ancestor fdedc65dbe88850fd58d4fdadb394f7043ca6619 HEAD && echo "prompt-04-present" || echo "prompt-04-missing"
git merge-base --is-ancestor 75845d253951ae19248b4b820e17ffb50db443e3 HEAD && echo "prompt-07-present" || echo "prompt-07-missing"
git merge-base --is-ancestor 81671c4b46b96217058502c85652aa31e07065d7 HEAD && echo "prompt-08-present" || echo "prompt-08-missing"
git merge-base --is-ancestor 1eb52e594475efec5163b0f91ae3f144f003dcea HEAD && echo "prompt-09-present" || echo "prompt-09-missing"
git merge-base --is-ancestor 122d9c6d156e2f99ccbc33d9e90823c72756159e HEAD && echo "prompt-10-present" || echo "prompt-10-missing"
git merge-base --is-ancestor 35417e699fc1a1a4b9c4e9d06e0e1ac3c77ea153 HEAD && echo "prompt-11-present" || echo "prompt-11-missing"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
grep -n "version" apps/project-control-center/config/package-solution.json
test -f apps/project-control-center/src/layout/pccDashboardComposition.ts && echo "composition-present" || echo "composition-missing"
git grep -n "Re-evaluate echarts-for-react after MVP" -- apps/project-control-center/src/analytics/pccAnalyticsEcharts.ts || true
git grep -n "stage/lifecycle-aware Project Home context" -- apps/project-control-center/src/surfaces/projectHome/projectHomeChoreography.ts || true
git grep -n "echarts-for-react" -- apps/project-control-center/package.json apps/project-control-center/src || true
```

Stop if:

- any required ancestry check through Prompt 11 is missing;
- `pnpm-lock.yaml` md5 is not `7c19ccfa8718a42f7f55ce178a626996`;
- `solution.version` is not `1.0.0.217`;
- `solution.features[0].version` is not `1.0.0.216`;
- `echarts-for-react` appears in PCC package.json or is imported under PCC source, except for the existing non-import TODO text in `pccAnalyticsEcharts.ts`;
- `pccDashboardComposition.ts` exists unexpectedly and you cannot confirm it was introduced by an approved intervening commit;
- the working tree has unrelated dirty runtime/test/dependency files that you cannot account for.

If the branch includes user-approved work after Prompt 11, preserve that work. Do not revert or overwrite it.

## Global Instructions

- Do not re-read files that are still within your current context or memory unless they have changed, your context is stale, or validation requires it.
- Do not install dependencies.
- Do not add `echarts`.
- Do not add `echarts-for-react`.
- Do not import `echarts-for-react`.
- Do not change TypeScript runtime logic.
- Do not change JSX output.
- Do not change user-visible copy.
- Do not add tests solely for comments.
- Do not create `apps/project-control-center/src/layout/pccDashboardComposition.ts`.
- Do not create a new shared composition helper.
- Do not edit `packages/models/src/pcc/PccPrimaryNavigation.ts`.
- Do not modify navigation metadata, module ids, module labels, module states, selectability, card counts, card order, span overrides, datasets, summaries, chart kinds, source labels, or analytics ids.
- Do not edit architecture-blueprint docs; Prompt 13 owns canonical architecture documentation.
- Do not bump `apps/project-control-center/config/package-solution.json`.
- Do not edit `tools/spfx-shell/config/package-solution.json`.
- Do not introduce live integrations, writeback, approval execution, source mutation, URL routing, command-model behavior, sync execution, or random render-time data.
- Do not render developer/internal copy in the UI.
- Preserve PCC read-only / preview / no-writeback posture.
- Preserve every dashboard card as a direct child of `[data-pcc-bento-grid]`.
- Do not use `grid-auto-flow: dense`.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not add card-level active-panel ownership.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Use production-grade, end-user-facing copy only where existing UI copy remains present.
- Do not run Playwright for Prompt 12 unless the user explicitly requests it.

## Scope

Documentation comments only. No runtime behavior changes.

Allowed files to edit, only if the TODO belongs naturally there:

```text
apps/project-control-center/src/surfaces/projectHome/projectHomeChoreography.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeAnalytics.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/analytics/pccAnalyticsViewModels.ts
```

Verification-only file:

```text
apps/project-control-center/src/analytics/pccAnalyticsEcharts.ts
```

Do not edit `pccAnalyticsEcharts.ts` if the required `echarts-for-react` post-MVP TODO already exists. If it is missing, add only that exact TODO and do not change module behavior.

Do not edit:

```text
apps/project-control-center/src/layout/pccDashboardComposition.ts
apps/project-control-center/src/analytics/pccAnalyticsTypes.ts
apps/project-control-center/src/analytics/pccAnalyticsOptions.ts
apps/project-control-center/src/analytics/PccAnalyticsCard.tsx
apps/project-control-center/src/analytics/PccEchartsCanvas.tsx
apps/project-control-center/src/surfaces/phase05Dashboard/*Analytics.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/tests/*
apps/project-control-center/config/package-solution.json
tools/spfx-shell/config/package-solution.json
packages/models/src/pcc/PccPrimaryNavigation.ts
docs/architecture/blueprint/sp-project-control-center/**
```

Exception: if `PccProjectHome.tsx` is the only place a future team would naturally see the render-path split, you may add one short non-UI comment to its existing docblock. Prefer `projectHomeChoreography.ts` and `PccProjectHomeReadModelContent.tsx` first.

## Required TODO Themes

Add or refine durable non-UI comments that cover these themes without duplicating existing comments:

1. Stage-aware Project Home context:
   - project stage;
   - lifecycle phase;
   - stage-specific card priority;
   - stage-specific analytics emphasis;
   - stage-specific gateway recommendations.

2. Role/persona-aware Project Home and navigation:
   - Project Manager;
   - Project Executive;
   - Superintendent;
   - Project Accountant;
   - Estimating users;
   - Executive read-only;
   - IT/Admin where settings, site health, and integrations are involved.

3. Lifecycle-aware navigation:
   - module visibility/emphasis by stage;
   - Project Home command context;
   - gateway recommendations;
   - future route/module model;
   - read-model source authority.

4. Analytics context:
   - stage-aware chart selection;
   - lifecycle trend emphasis;
   - preview sample data replaced by read-model projections;
   - source-backed readiness;
   - analytics remain advisory/read-only until command-model authorization.

5. Safety boundaries:
   - no writeback;
   - no autonomous decisions;
   - no approval execution;
   - no external-system mutation until future command-model contract.

## Required TODO Placement

### 1. `projectHomeChoreography.ts`

This file already owns Project Home operational card priority, span overrides, and gateway routing.

It already contains this existing TODO or equivalent:

```ts
// TODO(post-mvp): Implement stage/lifecycle-aware Project Home context using
// the PCC Product Architecture and User Journey Blueprint as the governing
// reference. Project Home should adjust card priority, analytics emphasis,
// gateway recommendations, and command context based on project stage,
// lifecycle signals, role/persona, and source-backed project readiness.
// This must remain read-model driven until a future command-model contract
// authorizes workflow execution or source-system writeback.
```

Action:

- If the TODO already exists and is substantively equivalent, do not duplicate it.
- If it is missing a required theme, refine it in place.
- Add at most one additional adjacent TODO for future route/module model only if needed.

### 2. `projectHomeAnalytics.ts`

Add or refine a TODO near the existing Project Home analytics sample-data TODO.

Required intent:

```ts
// TODO(post-mvp): Make Project Home analytics stage/lifecycle-aware once
// source-backed Project Home analytics envelopes exist. Chart selection and
// summary emphasis should respond to project stage, lifecycle phase, role/
// persona, readiness blockers, approval posture, source confidence, and
// cross-stage traceability. Keep the projection read-model driven; analytics
// must remain advisory and must not execute approvals, mutate source systems,
// or initiate workflow commands until a future command-model contract allows it.
```

Do not change existing analytics values.

### 3. `PccProjectHomeReadModelContent.tsx`

Add a TODO to the existing file-level docblock, or immediately below it, documenting the future read-model stage/lifecycle seam.

Required intent:

```ts
// TODO(post-mvp): When Project Home read-model envelopes include project
// stage, lifecycle phase, role/persona lens, readiness blockers, source
// confidence, and cross-stage traceability, use that context to prioritize
// Project Home cards and lifecycle sections. The read-model path remains
// advisory/read-only until command-model gates authorize workflow execution,
// approval execution, or source-system writeback.
```

Do not change hook usage, render order, fallback states, or card props.

### 4. `PccPrimaryDashboardSurface.tsx`

Add a TODO near `renderPrimaryDashboardAnalytics(activePrimaryTabId)` or its docblock, documenting future role/stage-aware work-center emphasis.

Required intent:

```ts
// TODO(post-mvp): Replace the current primary-tab-only analytics routing
// with read-model-backed stage/lifecycle/role emphasis once the route/module
// model exposes project stage, lifecycle phase, source authority, and persona
// context. Work-center analytics should remain deterministic projections over
// source-backed envelopes and must not imply command execution, approval
// execution, source-system mutation, or autonomous decisioning.
```

Do not change branch order, JSX, card counts, imports, analytics helpers, or user-visible strings.

### 5. `pccAnalyticsViewModels.ts`

Add a TODO near the file-level comment or builder exports, documenting future projection context.

Required intent:

```ts
// TODO(post-mvp): Extend analytics projection inputs with explicit project
// stage, lifecycle phase, role/persona lens, source confidence, and source
// lineage once read-model envelopes support those fields. Builders must stay
// pure and deterministic; they should shape chart emphasis and summary
// priority only, not execute commands or mutate source systems.
```

Do not change builder signatures in Prompt 12.

### 6. `pccAnalyticsEcharts.ts`

Verify this existing TODO is present:

```ts
// TODO(post-mvp): Re-evaluate echarts-for-react after MVP if it materially
// improves chart lifecycle handling, animation quality, responsiveness,
// accessibility integration, or maintainability versus the PCC-owned direct
// echarts wrapper.
```

Do not add a duplicate.

## Tests

No new tests are required for Prompt 12 because this is comment-only documentation.

Do not update test snapshots or assertions unless a validation failure proves a comment introduced syntax or formatting issues. Since comments must not affect JSX output, any UI test failure likely indicates accidental runtime changes and must be remediated by reverting the runtime change.

## Acceptance Criteria

- Durable non-UI TODO documentation exists in appropriate implementation locations.
- Existing `echarts-for-react` post-MVP TODO is present and not duplicated.
- No TODO text appears in the visible UI.
- No runtime behavior changes.
- No card order/count/span/dataset/source-label/chart-kind changes.
- No dependency changes.
- No package version changes.
- No lockfile changes.
- No `pccDashboardComposition.ts` creation.
- No architecture-blueprint docs edited.
- Full PCC typecheck and test suite pass.

## Required Validation

Run the narrowest validation needed during implementation, then at closeout run:

```bash
git status --short
git rev-parse HEAD
git log --oneline -3
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
grep -n "version" apps/project-control-center/config/package-solution.json
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check \
  apps/project-control-center/src/surfaces/projectHome/projectHomeChoreography.ts \
  apps/project-control-center/src/surfaces/projectHome/projectHomeAnalytics.ts \
  apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx \
  apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx \
  apps/project-control-center/src/analytics/pccAnalyticsViewModels.ts
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If `pccAnalyticsEcharts.ts` is edited because the `echarts-for-react` TODO was missing, add it to the prettier list.

If one of the allowed files is not changed because its existing TODO already satisfies the requirement, omit that unchanged file from the final prettier list.

If `pnpm exec prettier` cannot resolve, stop and report. Do not use `npx`.

Expected lockfile md5 before/after:

```text
7c19ccfa8718a42f7f55ce178a626996
```

Expected package-solution versions before/after:

```text
solution.version = 1.0.0.217
solution.features[0].version = 1.0.0.216
```

## Closeout Report

Report in this structure:

```text
HB: Phase 06 Prompt 12 Closeout — Post-MVP Stage/Lifecycle TODO Documentation

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
- echarts added by agent: No
- echarts-for-react added to PCC: No
- PCC source imports echarts-for-react: No
- pnpm-lock md5 before:
- pnpm-lock md5 after:

Documentation Notes:
- Project Home stage/lifecycle TODO:
- Project Home analytics TODO:
- Project Home read-model TODO:
- primary-dashboard lifecycle/navigation TODO:
- analytics projection TODO:
- echarts-for-react TODO verified:
- pccDashboardComposition.ts created: No
- UI TODO text rendered: No

Validation:
- ...

Risks / Follow-Up:
- Prompt 13 owns architecture-blueprint documentation updates.
- Future implementation must replace TODOs with read-model-backed projection contracts before adding command-model execution.
- Core Tools remains the only 3-card PccPrimaryDashboardSurface tab after Prompt 11; Prompt 12 must not alter that.

Commit Guidance:
- Suggested summary:
  docs(pcc): add post-MVP stage lifecycle TODOs
- Suggested description bullets:
  - add non-UI TODO documentation for post-MVP stage/lifecycle-aware Project Home context, role/persona emphasis, lifecycle navigation, and analytics projection;
  - align TODOs to the PCC Product Architecture and User Journey Blueprint while keeping them read-model driven and command-model gated;
  - verify the existing echarts-for-react post-MVP re-evaluation TODO remains present without duplication;
  - no runtime behavior changes, no UI TODO copy, no dependency install, no lockfile change, no SPFx version bump, no pccDashboardComposition helper, no architecture-blueprint edits.
```

## Non-Goals

Do not do any of the following in Prompt 12:

- Implement stage-aware behavior.
- Implement role/persona-aware routing.
- Implement lifecycle-aware analytics.
- Change navigation metadata.
- Change Project Home card order or primary-dashboard card order.
- Change analytics values, ids, datasets, chart kinds, source labels, or span overrides.
- Add commands, mutations, approvals, writeback, workflow execution, or sync behavior.
- Add tests solely for comments.
- Install dependencies.
- Add or import `echarts-for-react`.
- Bump SPFx package version.
- Run Playwright.
- Generate tenant evidence.
- Edit architecture-blueprint docs.
- Create `pccDashboardComposition.ts`.
