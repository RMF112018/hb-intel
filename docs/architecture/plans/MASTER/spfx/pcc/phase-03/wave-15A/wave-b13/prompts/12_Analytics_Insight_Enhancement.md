# Phase 08 Prompt 12 — Analytics Insight Enhancement

## Objective

Upgrade analytics cards from chart containers into insight-led decision-support cards.

## Global Execution Rules

These rules apply to this prompt and every later Phase 08 prompt.

1. Work in the `RMF112018/hb-intel` repo.
2. Treat this phase as **PCC Product Experience Enhancement**, not a CSS-only polish pass.
3. Preserve the current Phase 05/06/07 runtime architecture unless this prompt explicitly authorizes a narrow change.
4. Preserve the current eight primary-tab model:
   - `project-home`
   - `core-tools`
   - `documents`
   - `estimating-preconstruction`
   - `startup-closeout`
   - `project-controls`
   - `cost-time`
   - `systems-administration`
5. Do not reintroduce a permanent PCC sidebar.
6. Do not move `data-pcc-active-surface-panel` back to a card. It must remain shell-owned on `main[role="tabpanel"]`.
7. Preserve the bento direct-child invariant. Do not add wrappers between `PccBentoGrid` and `PccDashboardCard` unless the wrapper is itself an intentionally tested grid child and does not break layout.
8. Do not add dependencies. Do not add `echarts-for-react`. `echarts` direct usage remains the approved analytics approach.
9. Do not create live SharePoint, Graph, Procore, Sage, Azure, tenant, or app-catalog mutations.
10. Preserve read-only / preview / launch-only / no-writeback posture.
11. Do not introduce fake affordances. A non-working search/action/control must not appear live without clear preview or disabled state.
12. Do not put developer copy in the UI. Avoid end-user-visible words like `mock`, `placeholder`, `TODO`, `fixture`, or `demo` unless a governed preview/sample label already exists and is intentionally user-facing.
13. Do not weaken tests to pass. Update tests only when the expected product contract has intentionally changed.
14. Use stable `[data-*]` markers and semantic roles for tests. Do not test CSS module class names as behavior contracts.
15. Do not re-read files that are still within the current context or memory. Only open files needed to verify current repo truth, inspect drift, or make the scoped change.
16. If local repo truth differs from this package, classify the drift and proceed only when the change can be safely aligned without overwriting operator-owned work.


## Current Repo-Truth Assumptions

- Remote baseline observed when package was generated: `7d8bae430ab999d4fb38abe8de6689b89d8f4d27`.
- Current runtime model uses the eight primary tabs:
  `project-home`, `core-tools`, `documents`, `estimating-preconstruction`, `startup-closeout`, `project-controls`, `cost-time`, `systems-administration`.
- Local repo truth must be verified before edits.
- If local files have drifted, classify drift before editing.

## Scope

Improve analytics presentation while keeping direct ECharts usage, accessible summaries, sample/preview labels, and no chart-only meaning.

## Expected File Targets

```text
apps/project-control-center/src/analytics/PccAnalyticsCard.tsx
apps/project-control-center/src/analytics/PccAnalyticsCard.module.css
apps/project-control-center/src/analytics/PccEchartsCanvas.tsx
apps/project-control-center/src/analytics/PccEchartsCanvas.module.css
apps/project-control-center/src/analytics/pccAnalyticsOptions.ts
apps/project-control-center/src/analytics/pccAnalyticsTheme.ts
apps/project-control-center/src/analytics/pccAnalyticsTypes.ts
apps/project-control-center/src/surfaces/**/*Analytics.ts
apps/project-control-center/src/tests/*Analytics*

```

## Allowed Changes

- Only changes needed to complete this prompt's objective.

## Prohibited Changes

- Do not add `echarts-for-react`.
- Do not hide critical summary data inside charts only.
- Do not add chart interactions that are inaccessible.

## Required Steps

1. Inspect analytics view model type and card rendering.
2. Add an optional insight/interpretation field if needed and backward compatible.
3. Refine analytics card layout: state/source row, insight sentence, chart, summary rows, preview/sample note.
4. Improve chart container dimensions and rhythm.
5. Preserve accessible summary outside the chart canvas.
6. Preserve `data-pcc-analytics-card` and `data-pcc-analytics-chart` markers.
7. Update analytics tests for insight text, source labels, accessibility, and no `echarts-for-react`.

## Acceptance Criteria

- Analytics explain the insight, not just show a chart.
- Charts are not the only source of meaning.
- Accessible summaries remain intact.
- Sample/preview labels remain visible.
- Direct ECharts implementation preserved.
- No dependency changes.

## Required Validation

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

## Closeout Requirements

Use `templates/Closeout_Template.md` and include:

- Starting and ending HEAD.
- Local drift classification.
- Files changed.
- Tests run and results.
- Lockfile md5 before/after.
- Evidence generated or blocked reason.
- Guardrails confirmed.

