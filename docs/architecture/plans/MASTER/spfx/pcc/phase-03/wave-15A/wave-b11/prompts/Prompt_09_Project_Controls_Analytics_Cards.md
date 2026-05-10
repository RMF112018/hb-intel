# Prompt 09 — Project Controls Analytics Cards — Updated

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

Prompt 09 adds Project Controls dashboard analytics only.

## Objective

Add three deterministic preview analytics cards to the **Project Controls** primary dashboard:

```text
1. Constraints Aging
2. Permit / Inspection Readiness
3. Risk / Issue Severity Distribution
```

The implementation must:

- render these cards only for `activePrimaryTabId === 'project-controls'`;
- extend the existing `renderPrimaryDashboardAnalytics(activePrimaryTabId)` helper in `PccPrimaryDashboardSurface`;
- preserve Prompt 07 Estimating analytics and Prompt 08 Startup & Closeout analytics;
- support active project controls visibility around constraints, permits/inspections, and risk/issues;
- avoid implying live permit, inspection, risk, issue, decision, approval, Procore, SharePoint, or source-system integration;
- preserve read-only/no-writeback posture;
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
   - all other primary tabs -> null
4. Selected module dashboard card
```

Project Controls primary tab repo truth:

```text
Primary tab id: project-controls
Primary tab label/title: Project Controls
Current modules:
- project-controls-center
- permits-inspections
- contract-compliance
- risk-issues-decisions
- constraints-log
- field-operations
- meeting-communication
```

Module state posture to preserve:

```text
project-controls-center: deferred / non-selectable
permits-inspections: preview / selectable
contract-compliance: deferred / non-selectable
risk-issues-decisions: deferred / non-selectable
constraints-log: preview / selectable
field-operations: deferred / non-selectable
meeting-communication: deferred / non-selectable
```

Important repo-truth correction:

```text
apps/project-control-center/src/layout/pccDashboardComposition.ts
```

does not exist in the current repo-truth. Do not depend on it. Do not create it in Prompt 09 unless it already exists from intervening user-approved work and is the established seam. The expected current seam is `renderPrimaryDashboardAnalytics(activePrimaryTabId)` in `PccPrimaryDashboardSurface.tsx`.

## Preflight

Run this preflight before editing:

```bash
git status --short
git rev-parse HEAD
git log --oneline -12
git merge-base --is-ancestor d06d614a02f16123d8c8252f71cebc22f348bc51 HEAD && echo "phase-5-closeout-present" || echo "phase-5-closeout-missing"
git merge-base --is-ancestor 6e6454aafc4c9a6ca04e58611139eddab9616ae7 HEAD && echo "prompt-01-present" || echo "prompt-01-missing"
git merge-base --is-ancestor e5f9783e18f0a5860abec589b01bbc8f58ed1551 HEAD && echo "prompt-02-present" || echo "prompt-02-missing"
git merge-base --is-ancestor 08f133842fc6e8c10f3bfa5dd4fab49178942352 HEAD && echo "prompt-03-present" || echo "prompt-03-missing"
git merge-base --is-ancestor fdedc65dbe88850fd58d4fdadb394f7043ca6619 HEAD && echo "prompt-04-present" || echo "prompt-04-missing"
git merge-base --is-ancestor 75845d253951ae19248b4b820e17ffb50db443e3 HEAD && echo "prompt-07-present" || echo "prompt-07-missing"
git merge-base --is-ancestor 81671c4b46b96217058502c85652aa31e07065d7 HEAD && echo "prompt-08-present" || echo "prompt-08-missing"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
node -e "const p=require('./apps/project-control-center/package.json'); console.log(JSON.stringify({dependencies:p.dependencies, devDependencies:p.devDependencies}, null, 2))"
grep -n "version" apps/project-control-center/config/package-solution.json
test -d apps/project-control-center/src/analytics && echo "analytics-dir-present" || echo "analytics-dir-missing"
test -f apps/project-control-center/src/layout/pccDashboardComposition.ts && echo "composition-present" || echo "composition-missing"
git grep -n "echarts-for-react" -- apps/project-control-center/package.json apps/project-control-center/src || true
```

Stop if:

- any required ancestry check through Prompt 08 is missing;
- `echarts` is missing from `apps/project-control-center/package.json`;
- `echarts-for-react` is present in PCC package.json or imported under PCC source;
- the analytics directory is missing;
- `pnpm-lock.yaml` md5 is not `7c19ccfa8718a42f7f55ce178a626996`;
- `solution.version` is not `1.0.0.217`;
- `solution.features[0].version` is not `1.0.0.216`;
- the working tree has unrelated dirty runtime/test/dependency files that you cannot account for.

If the branch includes user-approved work after Prompt 08, preserve that work. Do not revert or overwrite it. Extend only the Project Controls path required by this prompt.

## Global Instructions

- Do not install dependencies.
- Do not add `echarts` or `echarts-for-react`.
- Do not import `echarts-for-react` in PCC.
- Do not use `packages/ui-kit/src/HbcChart/EChartsRenderer.tsx`.
- Do not modify `packages/models/src/pcc/PccPrimaryNavigation.ts`.
- Do not change module ids, module labels, module states, or selectability.
- Do not convert deferred Project Controls modules into selectable/available modules.
- Do not edit the Prompt 03 analytics foundation unless a type issue blocks usage. It should not be necessary.
- Do not edit Project Home analytics.
- Do not remove or alter Prompt 07 Estimating analytics behavior.
- Do not remove or alter Prompt 08 Startup & Closeout analytics behavior.
- Do not add analytics cards to unrelated primary dashboards.
- Do not bump `apps/project-control-center/config/package-solution.json`; current solution/feature versions remain unchanged.
- Do not edit `tools/spfx-shell/config/package-solution.json`.
- Do not introduce live integrations, writeback, approval execution, source mutation, URL routing, permit/inspection execution, risk/issue/decision workflow execution, Procore/SharePoint/Sage mutation, or random render-time data.
- Do not render developer/internal copy in the UI.
- Preserve PCC read-only / preview / no-writeback posture.
- Preserve every dashboard card as a direct child of `[data-pcc-bento-grid]`.
- Do not use `grid-auto-flow: dense`.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not add card-level active-panel ownership.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Use production-grade, end-user-facing copy only.
- Do not run Playwright for Prompt 09 unless the user explicitly requests it.

## Scope

Likely modify:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
```

Likely create:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/projectControlsAnalytics.ts
apps/project-control-center/src/tests/PccProjectControlsAnalyticsCards.test.tsx
```

Do not edit:

```text
apps/project-control-center/src/analytics/*
apps/project-control-center/src/surfaces/projectHome/*
apps/project-control-center/src/surfaces/phase05Dashboard/estimatingPreconstructionAnalytics.ts
apps/project-control-center/src/surfaces/phase05Dashboard/startupCloseoutAnalytics.ts
apps/project-control-center/config/package-solution.json
tools/spfx-shell/config/package-solution.json
packages/models/src/pcc/PccPrimaryNavigation.ts
```

## Required Analytics Cards

Create exactly these three Project Controls analytics cards.

### 1. Constraints Aging

Related module:

```text
constraints-log
```

Chart kind:

```text
stacked-bar
```

Visible copy:

```text
Title: Constraints Aging
Eyebrow: Constraint exposure
Description: Preview of open project constraints by aging bucket and resolution posture.
```

State/source:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic project controls sample
sampleData: true
```

Dataset:

```ts
[
  { category: '0–7 days', open: 4, mitigated: 6 },
  { category: '8–14 days', open: 5, mitigated: 3 },
  { category: '15–30 days', open: 3, mitigated: 2 },
  { category: '31+ days', open: 2, mitigated: 1 },
]
```

Summary:

```ts
[
  { label: 'Open constraints', value: '14', tone: 'warning' },
  { label: '31+ day constraints', value: '2', tone: 'danger' },
  { label: 'Recently mitigated', value: '12', tone: 'success' },
]
```

Accessibility summary:

```text
Stacked bar chart preview of open and mitigated project constraints across aging buckets.
```

### 2. Permit / Inspection Readiness

Related module:

```text
permits-inspections
```

Chart kind:

```text
grouped-bar
```

Visible copy:

```text
Title: Permit / Inspection Readiness
Eyebrow: Permits and inspections
Description: Preview of permit and inspection readiness across submitted, approved, scheduled, and open items.
```

State/source:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic project controls sample
sampleData: true
```

Dataset:

```ts
[
  { category: 'Permits', ready: 7, open: 3 },
  { category: 'Inspections', ready: 11, open: 4 },
  { category: 'Re-inspections', ready: 3, open: 2 },
  { category: 'Closeout holds', ready: 5, open: 1 },
]
```

Summary:

```ts
[
  { label: 'Permit readiness', value: '7 ready', tone: 'info' },
  { label: 'Open inspection items', value: '4', tone: 'warning' },
  { label: 'Closeout holds open', value: '1', tone: 'danger' },
]
```

Accessibility summary:

```text
Grouped bar chart preview of permit and inspection readiness across permits, inspections, re-inspections, and closeout holds.
```

### 3. Risk / Issue Severity Distribution

Related module:

```text
risk-issues-decisions
```

Chart kind:

```text
donut
```

Visible copy:

```text
Title: Risk / Issue Severity Distribution
Eyebrow: Risk and issue posture
Description: Preview distribution of project controls risks and issues by severity.
```

State/source:

```text
state: preview
stateLabel: Preview
sourceLabel: Source: deterministic project controls sample
sampleData: true
```

Dataset:

```ts
[
  { name: 'Critical', value: 2 },
  { name: 'High', value: 5 },
  { name: 'Medium', value: 9 },
  { name: 'Low', value: 6 },
]
```

Summary:

```ts
[
  { label: 'Critical risks / issues', value: '2', tone: 'danger' },
  { label: 'High risks / issues', value: '5', tone: 'warning' },
  { label: 'Total tracked items', value: '22', tone: 'info' },
]
```

Accessibility summary:

```text
Donut chart preview of project controls risk and issue severity distribution across critical, high, medium, and low severity.
```

## Project Controls Analytics Helper

Create:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/projectControlsAnalytics.ts
```

Use `buildPreviewAnalyticsViewModel` from the Prompt 03 analytics foundation.

Required exports:

```ts
export type PccProjectControlsAnalyticsCardKey =
  | 'constraintsAging'
  | 'permitInspectionReadiness'
  | 'riskIssueSeverityDistribution';

export const PROJECT_CONTROLS_ANALYTICS_CARD_KEYS = [
  'constraintsAging',
  'permitInspectionReadiness',
  'riskIssueSeverityDistribution',
] as const;

export const PROJECT_CONTROLS_ANALYTICS_CARD_TITLES = {
  constraintsAging: 'Constraints Aging',
  permitInspectionReadiness: 'Permit / Inspection Readiness',
  riskIssueSeverityDistribution: 'Risk / Issue Severity Distribution',
} as const;

export const PROJECT_CONTROLS_ANALYTICS_SPAN_OVERRIDES = { ... };
export const PROJECT_CONTROLS_ANALYTICS_VIEW_MODELS = { ... };
```

Add this non-UI TODO near the helper exports:

```ts
// TODO(post-mvp): Replace deterministic Project Controls analytics samples
// with source-backed read-model projections once constraints, permits,
// inspections, risks, issues, decisions, field-operations, and communication
// envelopes are defined. Keep this read-model driven; do not introduce
// workflow execution, source-system mutation, permit/inspection execution,
// risk decision execution, approval execution, or writeback from analytics cards.
```

Do not use `Date.now()`, `Math.random()`, current time, locale-dependent formatting, tenant reads, source reads, or runtime mutation.

## Span Override Matrix

Use `PccAnalyticsCard.spanOverrides`.

| Analytics card | largeLaptop / desktop / ultrawide | standardLaptop | smaller modes |
|---|---:|---:|---|
| Constraints Aging | 4 | 3 | footprint/default behavior |
| Permit / Inspection Readiness | 4 | 4 | footprint/default behavior |
| Risk / Issue Severity Distribution | 4 | 3 | footprint/default behavior |

Do not override tablet/phone modes unless a test proves a defect.

## Placement Requirements

For `activePrimaryTabId === 'project-controls'`, render this exact direct-card order when no active module is selected:

```text
1. Project Controls
2. Module status
3. Constraints Aging
4. Permit / Inspection Readiness
5. Risk / Issue Severity Distribution
6. Select a module
```

Preserve existing orders/counts for already-implemented tabs:

```text
estimating-preconstruction:
1. Estimating & Preconstruction
2. Module status
3. Handoff Continuity Preview
4. Estimate Exposure Preview
5. Select a module

startup-closeout:
1. Project Startup & Closeout
2. Module status
3. Startup Readiness Completion
4. Responsibility Coverage
5. Closeout & Warranty Readiness
6. Select a module

core-tools / cost-time / systems-administration:
1. <tab dashboard title>
2. Module status
3. Select a module
```

Implementation requirement:

- Extend the existing `renderPrimaryDashboardAnalytics(activePrimaryTabId)` helper in `PccPrimaryDashboardSurface.tsx`.
- Add a new `if (activePrimaryTabId === 'project-controls')` branch after the existing Estimating and Startup branches, or use an equivalent explicit branch order.
- Render the three Project Controls analytics cards between the Module status card and selected-module card.
- Do not nest analytics cards in a wrapper between `PccBentoGrid` and `PccDashboardCard`.
- Preserve existing Estimating and Startup branches.
- Do not add gateway actions to analytics cards.
- Do not pass `forceAnimationDisabled` in production render paths. Tests may mock ECharts.

## Integration Requirements

In `PccPrimaryDashboardSurface.tsx`:

- import the Project Controls analytics helper from `./projectControlsAnalytics`;
- continue importing `PccAnalyticsCard` from `../../analytics`;
- preserve existing Estimating and Startup imports/behavior;
- render Project Controls analytics only when `activePrimaryTabId === 'project-controls'`;
- render the cards between the `Module status` card and the selected-module card.

## Test Requirements

Create:

```text
apps/project-control-center/src/tests/PccProjectControlsAnalyticsCards.test.tsx
```

Update:

```text
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
```

### ECharts mocking

These tests render `PccAnalyticsCard`, which renders `PccEchartsCanvas`.

Use the same `vi.hoisted` ECharts mock pattern from Prompt 03 / Prompt 04 / Prompt 07 / Prompt 08 analytics tests.

Do not modify production code to satisfy jsdom chart behavior.

### Recommended render helper

Render through `PccBentoGrid` and `PccPrimaryDashboardSurface` for fast direct testing:

```tsx
function renderProjectControls(mode: PccResponsiveMode = 'desktop') {
  return render(
    <PccBentoGrid forceMode={mode}>
      <PccPrimaryDashboardSurface activePrimaryTabId="project-controls" />
    </PccBentoGrid>,
  );
}
```

### Required assertions

Tests must prove:

1. Project Controls analytics titles render:
   - `Constraints Aging`
   - `Permit / Inspection Readiness`
   - `Risk / Issue Severity Distribution`

2. Exact Project Controls direct-card order:
   - `Project Controls`
   - `Module status`
   - `Constraints Aging`
   - `Permit / Inspection Readiness`
   - `Risk / Issue Severity Distribution`
   - `Select a module`

3. Project Controls analytics do not render on at least two unrelated primary dashboards:
   - `core-tools`
   - `cost-time`

4. Project Controls analytics do not render on `estimating-preconstruction`, while Estimating analytics still render there.

5. Project Controls analytics do not render on `startup-closeout`, while Startup & Closeout analytics still render there.

6. Each Project Controls analytics card has:
   - `data-pcc-analytics-card`
   - `data-pcc-analytics-card-state="preview"`
   - `data-pcc-analytics-card-sample-data="true"`
   - nested `data-pcc-analytics-chart`
   - nested `data-pcc-analytics-sample-data="true"`

7. Preview copy is visible on each card:
   - `Preview analytics · sample project data`
   - `This preview uses deterministic sample project data until the source read model is connected.`

8. Source label override is visible:
   - `Source: deterministic project controls sample`

9. Fallback summary rows are visible and outside the chart canvas.

10. All three analytics cards are direct children of the bento grid.

11. Span overrides:
   - desktop / largeLaptop / ultrawide: all three cards = 4, source override
   - standardLaptop: Constraints = 3, Permit/Inspection = 4, Risk/Issue = 3, source override
   - tabletLandscape: footprint source and no override mode

12. Existing Project Controls module rows remain visible:
   - `Project Controls`
   - `Permits & Inspections`
   - `Contract & Compliance`
   - `Risk / Issues / Decisions`
   - `Constraints Log`
   - `Field Operations`
   - `Meeting & Communication`

13. Deferred module rows remain visibly deferred/non-selectable for:
   - `project-controls-center`
   - `contract-compliance`
   - `risk-issues-decisions`
   - `field-operations`
   - `meeting-communication`

14. Preview/selectable module rows remain visibly preview/selectable for:
   - `permits-inspections`
   - `constraints-log`

15. No `Project Intelligence` text appears.

16. Zero Project Controls dashboard cards carry `data-pcc-active-surface-panel`.

17. Scoped no-import assertion under:
   - `apps/project-control-center/src/surfaces/phase05Dashboard`
   - `apps/project-control-center/src/analytics`

must not import `echarts-for-react`.

Do not fail because `packages/ui-kit` still has its existing wrapper.

## Adjacent Test Updates

In `PccSurfaceRouter.phase05.test.tsx`, update the direct-card-count logic so:

```text
estimating-preconstruction -> 5
startup-closeout -> 6
project-controls -> 6
core-tools -> 3
cost-time -> 3
systems-administration -> 3
```

Update wording/comments so they list Estimating, Startup & Closeout, and Project Controls as exceptions.

If other tests hardcode the generic primary dashboard card count as `3` for all non-Project Home tabs, update them so Project Controls expects `6`, Startup & Closeout remains `6`, Estimating remains `5`, and the other generic primary dashboards remain `3`.

## Acceptance Criteria

- Project Controls dashboard renders exactly three analytics cards:
  - `Constraints Aging`
  - `Permit / Inspection Readiness`
  - `Risk / Issue Severity Distribution`
- These cards render only on `project-controls`.
- Prompt 07 Estimating analytics remain intact.
- Prompt 08 Startup & Closeout analytics remain intact.
- Direct-card order for Project Controls is overview -> Module status -> three analytics -> selected-module card.
- Existing Project Controls module rows remain visible.
- Deferred and preview/selectable Project Controls module rows preserve their registry posture.
- Analytics cards use deterministic sample-data previews and `PccAnalyticsCard`.
- Analytics cards render chart containers through the Prompt 03 direct ECharts foundation.
- Fallback summary and accessibility content are visible outside the chart canvas.
- No live constraints, permit, inspection, risk, issue, decision, approval, source mutation, or writeback is implied.
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
  apps/project-control-center/src/surfaces/phase05Dashboard/projectControlsAnalytics.ts \
  apps/project-control-center/src/tests/PccProjectControlsAnalyticsCards.test.tsx \
  apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If additional adjacent tests are edited, add them to the prettier check list. If `pnpm exec prettier` cannot resolve, stop and report. Do not use `npx`.

Expected lockfile md5 before/after:

```text
7c19ccfa8718a42f7f55ce178a626996
```

## Closeout Report

Report in this structure:

```text
HB: Phase 06 Prompt 09 Closeout — Project Controls Analytics Cards

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
- project-controls-only conditional:
- estimating analytics preservation:
- startup/closeout analytics preservation:
- direct-card order:
- related module posture:
- deferred module preservation:
- preview/selectable module preservation:
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
  feat(pcc): HB Intel Project Control Center 1.0.0.217 — add Project Controls analytics cards
```

## Non-Goals

Do not add analytics cards to Project Home, Core Tools, Document Control, Estimating beyond preserving Prompt 07, Startup & Closeout beyond preserving Prompt 08, Cost & Time, or Systems Administration. Do not create or require `pccDashboardComposition.ts`. Do not modify analytics foundation, Project Home analytics, Estimating helper, Startup & Closeout helper, shell navigation, navigation registry metadata, dependencies, SPFx package versions, Playwright evidence, or architecture-blueprint docs.
