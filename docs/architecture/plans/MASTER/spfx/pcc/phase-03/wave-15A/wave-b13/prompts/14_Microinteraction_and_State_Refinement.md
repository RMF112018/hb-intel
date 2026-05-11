# Phase 08 Prompt 14 — Microinteraction and State Refinement

## Objective

Add restrained, accessible microinteractions and visual state treatments that make PCC feel more complete without becoming distracting.

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

Refine hover, focus, selected, open, disabled, preview, launch-only, read-only, and source-unavailable states across PCC components.

## Expected File Targets

```text
apps/project-control-center/src/**/*.module.css
apps/project-control-center/src/shell/*.tsx
apps/project-control-center/src/layout/*.tsx
apps/project-control-center/src/surfaces/**/*.tsx
apps/project-control-center/src/analytics/*.tsx
apps/project-control-center/src/tests/*

```

## Allowed Changes

- Only changes needed to complete this prompt's objective.

## Prohibited Changes

- Do not add distracting animation.
- Do not animate layout in a janky way.
- Do not rely on hover-only information.

## Required Steps

1. Inventory existing hover/focus/disabled/selected states.
2. Add or refine transitions under 180ms.
3. Add `prefers-reduced-motion` overrides where transitions/animations exist.
4. Ensure hover states do not imply clickability for passive cards.
5. Ensure focus-visible states are strong and consistent.
6. Refine disabled/deferred/read-only/launch-only visual distinction.
7. Add tests where state is behavioral or semantic.

## Acceptance Criteria

- PCC feels more alive but remains professional.
- Reduced-motion respected.
- Keyboard focus is visible.
- Disabled states are visually disabled and explained.
- Passive cards do not imply clickability.

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

