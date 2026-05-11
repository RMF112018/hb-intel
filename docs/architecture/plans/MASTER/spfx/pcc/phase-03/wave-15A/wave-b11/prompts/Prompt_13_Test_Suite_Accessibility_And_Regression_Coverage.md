# Prompt 13 — Phase 06 Test Suite, Accessibility, and Regression Coverage — Updated

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

Prompt 01 added the `spanOverrides` foundation.
Prompt 02 locked Project Home operational choreography and gateway actions.
Prompt 03 added the PCC-owned direct ECharts analytics foundation.
Prompt 04 inserted Project Home analytics cards.
Prompts 07–11 inserted primary-dashboard analytics cards into `PccPrimaryDashboardSurface`.
Prompt 12 added post-MVP stage/lifecycle TODO documentation only.

Prompt 13 audits, consolidates, and hardens **test coverage only** for the completed Phase 06 implementation.

## Objective

Harden Phase 06 test coverage for layout, analytics, accessibility, gateway behavior, and no-regression guardrails.

This prompt must:

- preserve all Prompt 01–12 runtime behavior;
- avoid broad production rewrites;
- avoid stale/non-existent helper assumptions;
- strengthen tests around actual repo-truth, not the original speculative file list;
- verify the Phase 06 implementation remains stable after all analytics tabs are present;
- keep PCC package/version/dependency/lockfile posture unchanged.

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
Prompt 12: 33dd4ffc834fb4a2c8fc34c08feeb22ae4af0fc5
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

Expected current test-suite baseline after Prompt 12:

```text
full PCC vitest suite: 2288/2288 across 105 files
```

If the user has landed an approved spec-only commit after Prompt 12, preserve it. Do not stage user-owned prompt/spec docs unless explicitly instructed.

## Critical Repo-Truth Corrections

The original Prompt 13 file list is stale.

These files do **not** exist at the Prompt 12 baseline and must not be required unless you intentionally create a new file with a different, current-purpose name:

```text
apps/project-control-center/src/layout/pccDashboardComposition.test.ts
apps/project-control-center/src/tests/PccDashboardAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccAnalyticsPreviewStates.test.tsx
```

Also:

```text
apps/project-control-center/src/layout/pccDashboardComposition.ts
```

does not exist and must not be created.

Use the actual Phase 06 test structure already present in the repo.

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
git merge-base --is-ancestor 33dd4ffc834fb4a2c8fc34c08feeb22ae4af0fc5 HEAD && echo "prompt-12-present" || echo "prompt-12-missing"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
grep -n "version" apps/project-control-center/config/package-solution.json
node -e "const p=require('./apps/project-control-center/package.json'); console.log(JSON.stringify({dependencies:p.dependencies, devDependencies:p.devDependencies}, null, 2))"
test -f apps/project-control-center/src/layout/pccDashboardComposition.ts && echo "composition-present" || echo "composition-missing"
test -f apps/project-control-center/src/layout/pccDashboardComposition.test.ts && echo "composition-test-present" || echo "composition-test-missing"
test -f apps/project-control-center/src/tests/PccDashboardAnalyticsCards.test.tsx && echo "old-dashboard-analytics-test-present" || echo "old-dashboard-analytics-test-missing"
test -f apps/project-control-center/src/tests/PccAnalyticsPreviewStates.test.tsx && echo "old-preview-states-test-present" || echo "old-preview-states-test-missing"
git grep -n "echarts-for-react" -- apps/project-control-center/package.json apps/project-control-center/src || true
```

Stop if:

- any required ancestry check through Prompt 12 is missing;
- `pnpm-lock.yaml` md5 is not `7c19ccfa8718a42f7f55ce178a626996`;
- `solution.version` is not `1.0.0.217`;
- `solution.features[0].version` is not `1.0.0.216`;
- `echarts-for-react` is present in PCC package.json or imported under PCC source, except for allowed prose/TODO mentions;
- `pccDashboardComposition.ts` exists unexpectedly and was not introduced by an approved intervening commit;
- the working tree contains unrelated dirty runtime/test/dependency files that you cannot account for.

## Global Instructions

- Do not install dependencies.
- Do not add `echarts`.
- Do not add `echarts-for-react`.
- Do not import `echarts-for-react`.
- Do not use `packages/ui-kit/src/HbcChart/EChartsRenderer.tsx`.
- Do not create `pccDashboardComposition.ts`.
- Do not create `pccDashboardComposition.test.ts`.
- Do not require the stale `PccDashboardAnalyticsCards.test.tsx` or `PccAnalyticsPreviewStates.test.tsx` names.
- Do not modify navigation metadata, module ids, labels, state, selectability, card counts, card order, span overrides, datasets, summaries, chart kinds, source labels, or analytics ids.
- Do not add or alter user-visible UI copy unless a test exposes an accessibility defect that cannot be tested otherwise.
- Do not introduce live integrations, writeback, approval execution, source mutation, URL routing, command-model behavior, sync execution, tenant repair, or random render-time data.
- Do not render developer/internal copy in the UI.
- Preserve PCC read-only / preview / no-writeback posture.
- Preserve every dashboard card as a direct child of `[data-pcc-bento-grid]`.
- Do not use `grid-auto-flow: dense`.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not add card-level active-panel ownership.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Do not edit architecture-blueprint docs.
- Do not bump `apps/project-control-center/config/package-solution.json`.
- Do not edit `tools/spfx-shell/config/package-solution.json`.
- Do not run Playwright for Prompt 13 unless the user explicitly requests it.

## Scope

Test-only changes are expected.

Allowed existing test files to update if needed:

```text
apps/project-control-center/src/layout/PccDashboardCard.spanOverrides.test.tsx
apps/project-control-center/src/analytics/PccEchartsCanvas.test.tsx
apps/project-control-center/src/analytics/PccAnalyticsCard.test.tsx
apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx
apps/project-control-center/src/tests/PccProjectHomeGatewayActions.test.tsx
apps/project-control-center/src/tests/PccProjectHomeAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccEstimatingPreconstructionAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccStartupCloseoutAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccProjectControlsAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccSystemsAdministrationAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx
apps/project-control-center/src/tests/PccSurfaceNoDuplicateHeader.test.tsx
```

Allowed new test file, if cross-cutting coverage is cleaner than duplicating assertions in many existing tests:

```text
apps/project-control-center/src/tests/PccPhase06RegressionCoverage.test.tsx
```

Prefer a single new cross-cutting regression test file over editing many mature prompt-specific files if the coverage is broad and phase-level.

Production source edits are strongly discouraged. If a test exposes a real accessibility or marker defect, make the smallest production edit possible and report it clearly in closeout. Do not rewrite components.

## Current Expected Phase 06 Card Counts

Lock these counts in tests:

```text
Project Home fixture path: 12 direct cards
Project Home read-model path: 18 direct cards

PccPrimaryDashboardSurface tabs:
core-tools -> 3 direct cards
estimating-preconstruction -> 5 direct cards
startup-closeout -> 6 direct cards
project-controls -> 6 direct cards
cost-time -> 6 direct cards
systems-administration -> 6 direct cards
```

Document Control remains its own surface and is not part of the shared primary-dashboard analytics test matrix.

## Required Coverage Audit

Before editing, inspect the existing prompt-specific tests and determine whether each coverage item is already locked.

Do not duplicate assertions unless duplication is useful as a phase-level guard.

Required audit buckets:

### 1. Layout and Span Overrides

Verify or add tests for:

- `PccDashboardCard` span override source markers;
- clamp high/low behavior;
- NaN/Infinity fallback;
- decimal truncation;
- intentional below-minimum override behavior;
- min-inline-size preservation;
- `grid-auto-flow` not declared in `PccBentoGrid.module.css`;
- Project Home fixture/read-model direct-child bento invariant;
- Project Home canonical order:
  - fixture path: 12 cards;
  - read-model path: 18 cards;
- Project Home combined row choreography:
  - 12-column modes:
    - Row 1: Priority Actions 5 + Site Health Summary 3 + Document Control Center 4 = 12
    - Row 2: Action Exposure Mix 4 + Project Health Trend 4 + Project Readiness 4 = 12
    - Row 3: Approvals & Checkpoints 4 + Readiness / Approval Rollup 4 + Missing Configurations 4 = 12
    - Row 4: External Platforms 4 + Team Snapshot 3 + Recent Activity 5 = 12
  - standardLaptop:
    - Row 1: Priority Actions 4 + Site Health Summary 3 + Document Control Center 3 = 10
    - Row 2: Action Exposure Mix 3 + Project Health Trend 3 + Project Readiness 4 = 10
    - Row 3: Approvals & Checkpoints 3 + Readiness / Approval Rollup 4 + Missing Configurations 3 = 10
    - Row 4: External Platforms 3 + Team Snapshot 3 + Recent Activity 4 = 10
- footprint fallback at tablet/phone modes.

If the row choreography is not yet tested as combined rows, add it to `PccProjectHome.phase06Composition.test.tsx` or the new phase-level regression file.

### 2. Analytics Foundation

Verify or add tests for:

- `PccEchartsCanvas` initializes direct ECharts with SVG renderer and `pcc-analytics` theme;
- one-way animation-off policy;
- reduced-motion disables animation;
- ResizeObserver and window resize behavior;
- dispose on unmount;
- `role="img"` and `aria-label` from accessibility summary;
- `PccAnalyticsCard` renders ready / preview / degraded states;
- preview explanation copy is visible;
- source label is visible;
- state label is visible;
- summary rows render outside chart canvas;
- summary tone is exposed via a non-color-only data/text signal;
- action slot is inside the card article;
- span override pass-through;
- unsupported chart kinds and empty datasets fail safe;
- no PCC analytics source imports `echarts-for-react`.

### 3. Analytics Consumers

Verify or add tests for each analytics consumer:

```text
Project Home:
- Action Exposure Mix
- Project Health Trend
- Readiness / Approval Rollup

Estimating & Preconstruction:
- Handoff Continuity Preview
- Estimate Exposure Preview

Project Startup & Closeout:
- Startup Readiness Completion
- Responsibility Coverage
- Closeout & Warranty Readiness

Project Controls:
- Constraints Aging
- Permit / Inspection Readiness
- Risk / Issue Severity Distribution

Cost & Time:
- Schedule Milestone Posture
- Procurement / Buyout Exposure
- Commitment / Cost Exposure Preview

Systems Administration:
- Integration Health Summary
- Configuration Severity
- Procore Mapping / Sync Posture
```

For each consumer, verify or add tests for:

- titles render only on the owning tab/surface;
- exact direct-card order;
- card state/sample-data/chart markers;
- preview copy;
- deterministic source label;
- fallback summary outside chart canvas;
- span override behavior for desktop / largeLaptop / ultrawide / standardLaptop;
- tabletLandscape footprint fallback;
- no `Project Intelligence`;
- zero card-level active-panel marker;
- scoped no `echarts-for-react` import;
- module-state/selectability posture remains intact for primary dashboards;
- Cost & Time Sage book-of-record line remains scoped to Cost & Time only;
- Systems Administration Procore mapping/sync-health remains context-only / no-writeback.

Do not create one giant duplicate suite if the existing granular tests already prove these items. Add only missing phase-level guardrails.

### 4. Gateways and Actions

Verify or add tests for:

- Project Home enabled gateway buttons exist with user-facing labels;
- enabled buttons invoke the expected module selection ids;
- disabled Recent Activity action has a visible reason;
- disabled action does not invoke module selection;
- no anchors or URL routing are introduced for Project Home gateway actions;
- no false affordance: disabled action is disabled, and reason copy is visible.

Prefer updating `PccProjectHomeGatewayActions.test.tsx` if any of these are missing.

### 5. Accessibility and No-Regression

Verify or add tests for:

- analytics chart containers have `role="img"` and meaningful `aria-label`;
- analytics cards expose headings / accessible names through the containing card heading;
- fallback summaries are visible outside chart container;
- gateway buttons are findable by accessible name;
- disabled gateway reason copy is visible;
- status information is not color-only:
  - state label visible;
  - source label visible;
  - summary labels/values visible;
  - tone/state markers are supplementary, not the only signal;
- shell `main[role="tabpanel"][data-pcc-active-surface-panel]` remains the active-panel owner;
- no direct bento card carries `data-pcc-active-surface-panel`;
- no nested `[data-pcc-card] [data-pcc-card]`;
- no `Project Intelligence` bento card appears;
- no TODO/developer copy appears in visible UI.

### 6. Static Import / Dependency Guardrails

Verify or add tests for:

- `apps/project-control-center/package.json` does not list `echarts-for-react`;
- PCC source has no actual import / require / dynamic import of `echarts-for-react`;
- prose/TODO mentions of `echarts-for-react` do not fail the guard;
- `packages/ui-kit` existing wrapper is not part of the PCC source guard and must not fail the test.

## Recommended Implementation Approach

1. Run the preflight.
2. Review these existing tests first:
   - `PccDashboardCard.spanOverrides.test.tsx`
   - `PccEchartsCanvas.test.tsx`
   - `PccAnalyticsCard.test.tsx`
   - `PccProjectHome.phase06Composition.test.tsx`
   - `PccProjectHomeGatewayActions.test.tsx`
   - all six analytics consumer tests from Prompt 04 and Prompts 07–11
   - `PccSurfaceRouter.phase05.test.tsx`
3. Identify gaps only.
4. Make the smallest test-only edits needed.
5. Prefer adding `PccPhase06RegressionCoverage.test.tsx` for cross-cutting checks that span multiple surfaces, such as:
   - full phase tab cardinality map;
   - no active-panel markers on cards across all Phase 06 surfaces;
   - no nested cards across all Phase 06 surfaces;
   - no visible developer/TODO copy across all Phase 06 surfaces;
   - static dependency/import guard;
   - Project Home combined row choreography if not better suited to the existing composition test.
6. Do not refactor mature prompt-specific tests unless necessary.

## ECharts Mocking Guidance

Any test that renders `PccAnalyticsCard` must either:

- use an existing test file that already mocks ECharts; or
- include the same `vi.hoisted` direct ECharts mock pattern used by the Prompt 03/04/07/08/09/10/11 tests.

Do not let jsdom initialize real ECharts in a broad cross-surface regression file.

Do not modify production code to satisfy jsdom chart behavior.

## Required Acceptance Criteria

- All Phase 06 test coverage is aligned to the actual current implementation.
- No stale required test file names remain in the prompt execution path.
- No `pccDashboardComposition.ts` or `pccDashboardComposition.test.ts` is created.
- Existing granular analytics tests remain intact.
- Any new tests are narrowly scoped and add missing regression value.
- Full PCC typecheck and test suite pass.
- No dependency changes.
- No lockfile changes.
- No SPFx version changes.
- No architecture-blueprint doc changes.
- No Playwright/evidence generation.
- No runtime behavior changes unless a real defect is found and fixed with the smallest possible production edit.

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
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If no files are changed because the audit proves current coverage is sufficient, report that and do not create a no-op commit.

If changed files include a new test file, include it in the prettier list.

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
HB: Phase 06 Prompt 13 Closeout — Test Suite, Accessibility, and Regression Coverage

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

Coverage Notes:
- layout/span override coverage:
- Project Home order/span-row coverage:
- analytics foundation coverage:
- Project Home analytics coverage:
- Estimating analytics coverage:
- Startup & Closeout analytics coverage:
- Project Controls analytics coverage:
- Cost & Time analytics coverage:
- Systems Administration analytics coverage:
- gateway/action coverage:
- accessibility coverage:
- active-panel ownership coverage:
- direct-child/nested-card coverage:
- no Project Intelligence regression:
- no developer/TODO UI copy:
- static dependency/import guard:
- stale file names avoided:
- pccDashboardComposition.ts created: No

Validation:
- ...

Risks / Follow-Up:
- ...

Commit Guidance:
- Suggested summary:
  test(pcc): HB Intel Project Control Center 1.0.0.217 — harden Phase 06 regression coverage
- Suggested description bullets:
  - audit and harden Phase 06 layout, span override, analytics, gateway, accessibility, and no-regression coverage against the current post-Prompt-12 repo truth;
  - preserve existing prompt-specific granular tests and add only missing cross-cutting guardrails;
  - avoid stale pccDashboardComposition and old aggregate test-file assumptions;
  - keep Project Home and primary-dashboard card order/count/span contracts locked without changing runtime behavior;
  - no dependency install, no echarts-for-react PCC import, no lockfile change, no SPFx version bump, no architecture-blueprint edits, no Playwright evidence.
```

## Non-Goals

Do not do any of the following in Prompt 13:

- Add new runtime features.
- Change card choreography.
- Change analytics cards.
- Change analytics data.
- Change navigation registry metadata.
- Change source labels or UI copy.
- Create `pccDashboardComposition.ts`.
- Create `pccDashboardComposition.test.ts`.
- Install dependencies.
- Add or import `echarts-for-react`.
- Bump SPFx package version.
- Run Playwright.
- Generate tenant evidence.
- Edit architecture-blueprint docs.
