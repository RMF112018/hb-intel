# Phase 08 Prompt 11 — Shared Primary Dashboard Surface Enhancement

## Objective

Refine the reusable dashboard surface used by Core Tools, Estimating, Startup/Closeout, Project Controls, Cost & Time, and Systems Administration.

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

Improve `PccPrimaryDashboardSurface` so each shared surface feels purposeful and productized while preserving the Phase 07 removal of the generic hero card and the Phase 06 analytics insertion.

## Expected File Targets

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.module.css
apps/project-control-center/src/surfaces/phase05Dashboard/*Analytics.ts
apps/project-control-center/src/tests/*PrimaryDashboard*
apps/project-control-center/src/tests/*CostTime*
apps/project-control-center/src/tests/*SystemsAdministration*

```

## Allowed Changes

- Only changes needed to complete this prompt's objective.

## Prohibited Changes

- Do not remove Sage cue or weaken its language.
- Do not reintroduce `getPrimaryNavigationTab` hero card rendering.
- Do not reduce test coverage for exact direct card counts without replacement.

## Required Steps

1. Inspect `PccPrimaryDashboardSurface` and all analytics modules.
2. Refine Module Status card into a more useful surface entry card.
3. Add surface-specific KPI/status strip where deterministic existing data supports it.
4. Refine selected-module empty state and active state.
5. Apply card taxonomy/severity/source treatment.
6. Preserve Cost & Time Sage cue exact meaning and no-writeback posture.
7. Preserve analytics rendering between Module Status and Selected Module unless a tested choreography change is justified.
8. Update tests for first card, exact counts, Sage cue, selected module, no duplicate generic hero, and markers.

## Acceptance Criteria

- First card remains `Module status` on shared surfaces.
- No generic dashboard hero card returns.
- Each shared surface feels more distinct.
- Cost & Time Sage cue preserved.
- Selected module card is visually useful.
- Analytics remain direct bento children.

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

