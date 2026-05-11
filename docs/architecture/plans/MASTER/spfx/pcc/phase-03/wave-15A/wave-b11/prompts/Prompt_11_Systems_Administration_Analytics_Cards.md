# Prompt 11 — Systems Administration Analytics Cards — Updated

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

Prompt 01 added `spanOverrides`.
Prompt 02 locked Project Home choreography and gateways.
Prompt 03 added the PCC-owned direct ECharts analytics foundation.
Prompt 04 inserted Project Home analytics cards.
Prompt 07 inserted Estimating & Preconstruction analytics cards conditionally into `PccPrimaryDashboardSurface`.
Prompt 08 inserted Startup & Closeout analytics cards conditionally into `PccPrimaryDashboardSurface`.
Prompt 09 inserted Project Controls analytics cards conditionally into `PccPrimaryDashboardSurface`.
Prompt 10 inserted Cost & Time analytics cards conditionally into `PccPrimaryDashboardSurface`.

Prompt 11 adds Systems Administration dashboard analytics only.

## Objective

Add three deterministic preview analytics cards to the **Systems Administration** primary dashboard:

```text
1. Integration Health Summary
2. Configuration Severity
3. Procore Mapping / Sync Posture
```

The implementation must:

- render these cards only for `activePrimaryTabId === 'systems-administration'`;
- extend the existing `renderPrimaryDashboardAnalytics(activePrimaryTabId)` helper in `PccPrimaryDashboardSurface`;
- preserve Prompt 07 Estimating analytics, Prompt 08 Startup & Closeout analytics, Prompt 09 Project Controls analytics, and Prompt 10 Cost & Time analytics;
- preserve the existing Cost & Time Sage book-of-record governance line and scoping;
- support integration health, configuration severity, and Procore mapping/sync-health visibility;
- avoid implying live tenant repair, source mutation, sync execution, Procore writeback, settings mutation, approval execution, or live integration monitoring;
- preserve PCC read-only / preview / no-writeback posture;
- avoid dependency, SPFx-version, analytics-foundation, navigation-registry, Project Home, and unrelated-surface changes.

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

Current shared dashboard repo truth:

```text
PccPrimaryDashboardSurface currently renders:
1. Overview dashboard card
2. Module status dashboard card
3. renderPrimaryDashboardAnalytics(activePrimaryTabId)
   - estimating-preconstruction -> two Estimating analytics cards
   - startup-closeout -> three Startup & Closeout analytics cards
   - project-controls -> three Project Controls analytics cards
   - cost-time -> three Cost & Time analytics cards
   - all other primary tabs -> null
4. Selected module dashboard card
```

Systems Administration primary tab repo truth:

```text
Primary tab id: systems-administration
Primary tab label/title: Systems Administration
Current modules:
- site-health
- control-center-settings
- integration-settings
- procore-mapping-sync-health
- module-configuration
```

Module state posture to preserve:

```text
site-health: preview / selectable
control-center-settings: preview / selectable
integration-settings: deferred / non-selectable
procore-mapping-sync-health: preview / selectable
module-configuration: preview / selectable
```

Existing Cost & Time governance posture to preserve:

```text
Sage remains the accounting book of record for cost, commitment, and exposure data; PCC does not write back to Sage.
```

Important repo-truth correction:

```text
apps/project-control-center/src/layout/pccDashboardComposition.ts
```

does not exist in the current repo-truth. Do not depend on it. Do not create it in Prompt 11 unless it already exists from intervening user-approved work and is the established seam. The expected current seam is `renderPrimaryDashboardAnalytics(activePrimaryTabId)` in `PccPrimaryDashboardSurface.tsx`.

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
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
node -e "const p=require('./apps/project-control-center/package.json'); console.log(JSON.stringify({dependencies:p.dependencies, devDependencies:p.devDependencies}, null, 2))"
grep -n "version" apps/project-control-center/config/package-solution.json
test -d apps/project-control-center/src/analytics && echo "analytics-dir-present" || echo "analytics-dir-missing"
test -f apps/project-control-center/src/layout/pccDashboardComposition.ts && echo "composition-present" || echo "composition-missing"
git grep -n "echarts-for-react" -- apps/project-control-center/package.json apps/project-control-center/src || true
```

Stop if:

- any required ancestry check through Prompt 10 is missing;
- `echarts` is missing from `apps/project-control-center/package.json`;
- `echarts-for-react` is present in PCC package.json or imported under PCC source;
- the analytics directory is missing;
- `pnpm-lock.yaml` md5 is not `7c19ccfa8718a42f7f55ce178a626996`;
- `solution.version` is not `1.0.0.217`;
- `solution.features[0].version` is not `1.0.0.216`;
- the working tree has unrelated dirty runtime/test/dependency files that you cannot account for.

If the branch includes user-approved work after Prompt 10, preserve that work. Do not revert or overwrite it. Extend only the Systems Administration path required by this prompt.

## Global Instructions

- Do not install dependencies.
- Do not add `echarts` or `echarts-for-react`.
- Do not import `echarts-for-react` in PCC.
- Do not use `packages/ui-kit/src/HbcChart/EChartsRenderer.tsx`.
- Do not modify `packages/models/src/pcc/PccPrimaryNavigation.ts`.
- Do not change module ids, module labels, module states, or selectability.
- Do not convert deferred Systems Administration modules into selectable/available modules.
- Do not edit the Prompt 03 analytics foundation unless a type issue blocks usage. It should not be necessary.
- Do not edit Project Home analytics.
- Do not remove or alter Prompt 07, Prompt 08, Prompt 09, or Prompt 10 analytics behavior.
- Do not add analytics cards to unrelated primary dashboards.
- Do not remove, weaken, or reword the Cost & Time Sage book-of-record posture line.
- Do not bump `apps/project-control-center/config/package-solution.json`.
- Do not edit `tools/spfx-shell/config/package-solution.json`.
- Do not introduce live integrations, writeback, approval execution, source mutation, URL routing, tenant repair, configuration mutation, sync execution, Procore writeback, Procore mutation, SharePoint mutation, source-system mutation, or random render-time data.
- Do not render developer/internal copy in the UI.
- Preserve every dashboard card as a direct child of `[data-pcc-bento-grid]`.
- Do not use `grid-auto-flow: dense`.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not add card-level active-panel ownership.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Use production-grade, end-user-facing copy only.
- Do not run Playwright for Prompt 11 unless the user explicitly requests it.

## Scope

Likely modify:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
```

Likely create:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/systemsAdministrationAnalytics.ts
apps/project-control-center/src/tests/PccSystemsAdministrationAnalyticsCards.test.tsx
```

Likely adjacent test updates:

```text
apps/project-control-center/src/tests/PccEstimatingPreconstructionAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccStartupCloseoutAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccProjectControlsAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx
```

Reason: after Prompt 11, `systems-administration` is no longer an unchanged 3-card baseline. Any prior "unrelated dashboards remain unchanged" sweep that includes `systems-administration` must be updated to use only `core-tools` or to use a per-tab expected-count map.

Do not edit:

```text
apps/project-control-center/src/analytics/*
apps/project-control-center/src/surfaces/projectHome/*
apps/project-control-center/src/surfaces/phase05Dashboard/estimatingPreconstructionAnalytics.ts
apps/project-control-center/src/surfaces/phase05Dashboard/startupCloseoutAnalytics.ts
apps/project-control-center/src/surfaces/phase05Dashboard/projectControlsAnalytics.ts
apps/project-control-center/src/surfaces/phase05Dashboard/costTimeAnalytics.ts
apps/project-control-center/config/package-solution.json
tools/spfx-shell/config/package-solution.json
packages/models/src/pcc/PccPrimaryNavigation.ts
```

## Required Analytics Cards

Create exactly these three Systems Administration analytics cards.

### 1. Integration Health Summary

Related module:

```text
integration-settings
```

Chart kind:

```text
donut
```

Visible copy:

```text
Title: Integration Health Summary
Eyebrow: Integration health
Description: Preview of integration health across connected, attention, unavailable, and deferred integration lanes.
```

State/source:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic systems administration sample
sampleData: true
```

Dataset:

```ts
[
  { name: 'Healthy', value: 6 },
  { name: 'Needs attention', value: 3 },
  { name: 'Unavailable', value: 1 },
  { name: 'Deferred', value: 2 },
]
```

Summary:

```ts
[
  { label: 'Healthy integrations', value: '6', tone: 'success' },
  { label: 'Needs attention', value: '3', tone: 'warning' },
  { label: 'Unavailable integrations', value: '1', tone: 'danger' },
]
```

Accessibility summary:

```text
Donut chart preview of integration health across healthy, attention-needed, unavailable, and deferred integration lanes.
```

### 2. Configuration Severity

Related modules:

```text
control-center-settings
module-configuration
```

Chart kind:

```text
stacked-bar
```

Visible copy:

```text
Title: Configuration Severity
Eyebrow: Configuration controls
Description: Preview of configuration findings by severity across site, project, module, and integration scopes.
```

State/source:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic systems administration sample
sampleData: true
```

Dataset:

```ts
[
  { category: 'Site settings', critical: 0, warning: 2, informational: 5 },
  { category: 'Project settings', critical: 1, warning: 3, informational: 4 },
  { category: 'Module settings', critical: 1, warning: 4, informational: 6 },
  { category: 'Integration settings', critical: 2, warning: 3, informational: 2 },
]
```

Summary:

```ts
[
  { label: 'Critical findings', value: '4', tone: 'danger' },
  { label: 'Warning findings', value: '12', tone: 'warning' },
  { label: 'Informational findings', value: '17', tone: 'info' },
]
```

Accessibility summary:

```text
Stacked bar chart preview of configuration findings by severity across site, project, module, and integration settings.
```

### 3. Procore Mapping / Sync Posture

Related module:

```text
procore-mapping-sync-health
```

Chart kind:

```text
grouped-bar
```

Visible copy:

```text
Title: Procore Mapping / Sync Posture
Eyebrow: Procore mapping
Description: Preview of Procore mapping and sync-health posture across mapping, validation, sync, and exception lanes.
```

State/source:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic systems administration sample
sampleData: true
```

Dataset:

```ts
[
  { category: 'Project mapping', healthy: 8, attention: 2 },
  { category: 'Company mapping', healthy: 11, attention: 3 },
  { category: 'Sync validation', healthy: 7, attention: 4 },
  { category: 'Exception review', healthy: 5, attention: 5 },
]
```

Summary:

```ts
[
  { label: 'Mapped records healthy', value: '31', tone: 'success' },
  { label: 'Records needing attention', value: '14', tone: 'warning' },
  { label: 'Exception review lanes', value: '5', tone: 'warning' },
]
```

Accessibility summary:

```text
Grouped bar chart preview of Procore mapping and sync-health posture across project mapping, company mapping, sync validation, and exception review.
```

## Systems Administration Analytics Helper

Create:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/systemsAdministrationAnalytics.ts
```

Use `buildPreviewAnalyticsViewModel` from the Prompt 03 analytics foundation.

Required exports:

```ts
export type PccSystemsAdministrationAnalyticsCardKey =
  | 'integrationHealthSummary'
  | 'configurationSeverity'
  | 'procoreMappingSyncPosture';

export const SYSTEMS_ADMINISTRATION_ANALYTICS_CARD_KEYS = [
  'integrationHealthSummary',
  'configurationSeverity',
  'procoreMappingSyncPosture',
] as const;

export const SYSTEMS_ADMINISTRATION_ANALYTICS_CARD_TITLES = {
  integrationHealthSummary: 'Integration Health Summary',
  configurationSeverity: 'Configuration Severity',
  procoreMappingSyncPosture: 'Procore Mapping / Sync Posture',
} as const;

export const SYSTEMS_ADMINISTRATION_ANALYTICS_SPAN_OVERRIDES = { ... };
export const SYSTEMS_ADMINISTRATION_ANALYTICS_VIEW_MODELS = { ... };
```

Add this non-UI TODO near the helper exports:

```ts
// TODO(post-mvp): Replace deterministic Systems Administration analytics
// samples with source-backed read-model projections once site-health,
// settings, integration, Procore mapping, sync-health, and module-
// configuration envelopes are defined. Keep this read-model driven; do not
// introduce tenant repair, configuration mutation, sync execution, Procore
// writeback, source-system mutation, approval execution, or workflow
// execution from analytics cards.
```

Do not use `Date.now()`, `Math.random()`, current time, locale-dependent formatting, tenant reads, source reads, or runtime mutation.

## Span Override Matrix

Use `PccAnalyticsCard.spanOverrides`.

| Analytics card | largeLaptop / desktop / ultrawide | standardLaptop | smaller modes |
|---|---:|---:|---|
| Integration Health Summary | 4 | 3 | footprint/default behavior |
| Configuration Severity | 4 | 4 | footprint/default behavior |
| Procore Mapping / Sync Posture | 4 | 3 | footprint/default behavior |

Do not override tablet/phone modes unless a test proves a defect.

## Placement Requirements

For `activePrimaryTabId === 'systems-administration'`, render this exact direct-card order when no active module is selected:

```text
1. Systems Administration
2. Module status
3. Integration Health Summary
4. Configuration Severity
5. Procore Mapping / Sync Posture
6. Select a module
```

Preserve existing orders/counts for already-implemented tabs:

```text
estimating-preconstruction -> 5 cards
startup-closeout -> 6 cards
project-controls -> 6 cards
cost-time -> 6 cards
core-tools -> 3 cards
```

Implementation requirements:

- Extend the existing `renderPrimaryDashboardAnalytics(activePrimaryTabId)` helper in `PccPrimaryDashboardSurface.tsx`.
- Add a new `if (activePrimaryTabId === 'systems-administration')` branch after the existing Cost & Time branch, or use an equivalent explicit branch order.
- Render the three Systems Administration analytics cards between the Module status card and selected-module card.
- Preserve existing Estimating, Startup & Closeout, Project Controls, and Cost & Time branches.
- Preserve `PRIMARY_TAB_POSTURE_NOTE['cost-time']` and the visible `[data-pcc-dashboard-book-of-record="cost-time"]` line.
- Do not add gateway actions to analytics cards.
- Do not pass `forceAnimationDisabled` in production render paths. Tests may mock ECharts.

## Test Requirements

Create:

```text
apps/project-control-center/src/tests/PccSystemsAdministrationAnalyticsCards.test.tsx
```

Update:

```text
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
```

Also update any prior analytics tests whose "unrelated dashboards remain unchanged" sweep currently includes `systems-administration`, likely:

```text
apps/project-control-center/src/tests/PccEstimatingPreconstructionAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccStartupCloseoutAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccProjectControlsAnalyticsCards.test.tsx
apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx
```

Use the same `vi.hoisted` ECharts mock pattern from the Prompt 03 / 04 / 07 / 08 / 09 / 10 analytics tests.

Required assertions in the new Systems Administration analytics test:

1. Systems Administration analytics titles render:
   - `Integration Health Summary`
   - `Configuration Severity`
   - `Procore Mapping / Sync Posture`

2. Exact Systems Administration direct-card order:
   - `Systems Administration`
   - `Module status`
   - `Integration Health Summary`
   - `Configuration Severity`
   - `Procore Mapping / Sync Posture`
   - `Select a module`

3. Systems Administration analytics do not render on `core-tools`.

4. Systems Administration analytics do not render on `estimating-preconstruction`, `startup-closeout`, `project-controls`, or `cost-time`; the corresponding existing analytics cards still render there.

5. Each Systems Administration analytics card has:
   - `data-pcc-analytics-card`
   - `data-pcc-analytics-card-state="preview"`
   - `data-pcc-analytics-card-sample-data="true"`
   - nested `data-pcc-analytics-chart`
   - nested `data-pcc-analytics-sample-data="true"`

6. Preview copy is visible on each card:
   - `Preview analytics · sample project data`
   - `This preview uses deterministic sample project data until the source read model is connected.`

7. Source label override is visible:
   - `Source: deterministic systems administration sample`

8. Fallback summary rows are visible and outside the chart canvas.

9. All three analytics cards are direct children of the bento grid.

10. Span overrides:
   - desktop / largeLaptop / ultrawide: all three cards = 4, source override
   - standardLaptop: Integration = 3, Configuration = 4, Procore Mapping = 3, source override
   - tabletLandscape: footprint source and no override mode

11. Existing Systems Administration module rows remain visible:
   - `Site Health`
   - `Control Center Settings`
   - `Integration Settings`
   - `Procore Mapping / Sync Health`
   - `Module Configuration`

12. Deferred module row remains visibly deferred/non-selectable for:
   - `integration-settings`

13. Preview/selectable module rows remain visibly preview/selectable for:
   - `site-health`
   - `control-center-settings`
   - `procore-mapping-sync-health`
   - `module-configuration`

14. Procore no-writeback posture remains visible in the selected-module context when `activeModuleId="procore-mapping-sync-health"`:
   - render Systems Administration with that active module id;
   - selected module card should contain `No writeback to Procore is performed here` or equivalent existing authority copy;
   - do not add any Procore action verbs or source mutation UI.

15. The Cost & Time Sage book-of-record line remains visible and scoped to Cost & Time only:
   - Cost & Time still renders `[data-pcc-dashboard-book-of-record="cost-time"]`;
   - Systems Administration and all other primary tabs render zero `[data-pcc-dashboard-book-of-record]`.

16. No `Project Intelligence` text appears.

17. Zero Systems Administration dashboard cards carry `data-pcc-active-surface-panel`.

18. Scoped no-import assertion under:
   - `apps/project-control-center/src/surfaces/phase05Dashboard`
   - `apps/project-control-center/src/analytics`

must not import `echarts-for-react`. Do not fail because `packages/ui-kit` still has its existing wrapper.

## Adjacent Test Updates

In `PccSurfaceRouter.phase05.test.tsx`, update the direct-card-count logic so:

```text
estimating-preconstruction -> 5
startup-closeout -> 6
project-controls -> 6
cost-time -> 6
systems-administration -> 6
core-tools -> 3
```

Update wording/comments so they list Estimating, Startup & Closeout, Project Controls, Cost & Time, and Systems Administration as exceptions. Core Tools is now the only 3-card primary dashboard that uses `PccPrimaryDashboardSurface`.

If prior analytics tests use `systems-administration` as an unchanged 3-card comparison tab, update the sweep to use only `core-tools` or convert to a per-tab expected-count map. Do not leave any test asserting `systems-administration` has exactly 3 cards.

Existing `PccSurfaceRouter.phase05.test.tsx` already has Cost & Time book-of-record coverage. Preserve it. Do not weaken or remove it.

## Acceptance Criteria

- Systems Administration dashboard renders exactly three analytics cards:
  - `Integration Health Summary`
  - `Configuration Severity`
  - `Procore Mapping / Sync Posture`
- These cards render only on `systems-administration`.
- Prompt 07, Prompt 08, Prompt 09, and Prompt 10 analytics remain intact.
- Direct-card order for Systems Administration is overview -> Module status -> three analytics -> selected-module card.
- Existing Systems Administration module rows remain visible.
- Deferred and preview/selectable Systems Administration module rows preserve their registry posture.
- Procore mapping/sync-health copy remains context-only and no-writeback.
- Cost & Time Sage book-of-record line remains visible and scoped only to Cost & Time.
- Analytics cards use deterministic sample-data previews and `PccAnalyticsCard`.
- Analytics cards render chart containers through the Prompt 03 direct ECharts foundation.
- Fallback summary and accessibility content are visible outside the chart canvas.
- No live tenant repair, configuration mutation, integration execution, Procore sync, Procore writeback, approval, source mutation, or writeback is implied.
- No dependency changes.
- No `echarts-for-react` addition or PCC import.
- No SPFx version bump.
- No navigation registry change.
- No Project Home change.
- No analytics foundation change.
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
  apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx \
  apps/project-control-center/src/surfaces/phase05Dashboard/systemsAdministrationAnalytics.ts \
  apps/project-control-center/src/tests/PccSystemsAdministrationAnalyticsCards.test.tsx \
  apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx \
  apps/project-control-center/src/tests/PccEstimatingPreconstructionAnalyticsCards.test.tsx \
  apps/project-control-center/src/tests/PccStartupCloseoutAnalyticsCards.test.tsx \
  apps/project-control-center/src/tests/PccProjectControlsAnalyticsCards.test.tsx \
  apps/project-control-center/src/tests/PccCostTimeAnalyticsCards.test.tsx
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If some adjacent test files do not require edits, omit them from the final prettier list. If additional adjacent tests are edited, add them to the prettier check list. If `pnpm exec prettier` cannot resolve, stop and report. Do not use `npx`.

Expected lockfile md5 before/after:

```text
7c19ccfa8718a42f7f55ce178a626996
```

## Closeout Report

Report in this structure:

```text
HB: Phase 06 Prompt 11 Closeout — Systems Administration Analytics Cards

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
- echarts already present before prompt: Yes
- echarts added by agent: No
- echarts-for-react added to PCC: No
- PCC source imports echarts-for-react: No
- pnpm-lock md5 before:
- pnpm-lock md5 after:

Implementation Notes:
- analytics cards added:
- systems-administration-only conditional:
- estimating analytics preservation:
- startup/closeout analytics preservation:
- project-controls analytics preservation:
- cost-time analytics preservation:
- Cost & Time Sage book-of-record preservation:
- direct-card order:
- related module posture:
- deferred module preservation:
- preview/selectable module preservation:
- Procore no-writeback posture:
- span overrides:
- sample-data posture:
- fallback/accessibility posture:
- active-panel ownership:
- direct-child invariant:
- unrelated dashboard preservation:

Validation:
- ...

Risks / Follow-Up:
- ...

Commit Guidance:
- Suggested summary:
  feat(pcc): HB Intel Project Control Center 1.0.0.217 — add Systems Administration analytics cards
```

## Non-Goals

Do not add analytics cards to Project Home, Core Tools, Document Control, Estimating beyond preserving Prompt 07, Startup & Closeout beyond preserving Prompt 08, Project Controls beyond preserving Prompt 09, or Cost & Time beyond preserving Prompt 10. Do not create or require `pccDashboardComposition.ts`. Do not modify analytics foundation, Project Home analytics, Estimating helper, Startup & Closeout helper, Project Controls helper, Cost & Time helper, shell navigation, navigation registry metadata, dependencies, SPFx package versions, Playwright evidence, or architecture-blueprint docs.
