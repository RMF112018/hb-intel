# Phase 08 Prompt 13 — Cross-Surface Choreography

## Objective

Tune card order, span overrides, and visual hierarchy surface by surface so each PCC surface has a distinct purpose and first-fold story.

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

Apply intentional card choreography across all eight surfaces. The result should not be eight near-identical module-status pages; each surface must emphasize its user value.

## Expected File Targets

```text
apps/project-control-center/src/surfaces/projectHome/projectHomeChoreography.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/surfaces/phase05Dashboard/*Analytics.ts
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/tests/*

```

## Allowed Changes

- Only changes needed to complete this prompt's objective.

## Prohibited Changes

- Do not use `grid-auto-flow: dense` as the primary fix.
- Do not make layout changes without tests.
- Do not remove operational content without replacement.

## Required Steps

1. Review screenshot findings matrix and current card order by surface.
2. For each surface, identify primary visual priority.
3. Adjust order/spans only where needed to improve first-fold hierarchy.
4. Keep direct bento child invariant.
5. Keep Phase 06 analytics and Phase 07 counts unless a tested enhancement requires change.
6. Update tests for expected direct card order/counts and span markers.
7. Document surface-specific choreography rationale.

## Acceptance Criteria

- Each surface has one clear primary visual priority.
- Shared surfaces no longer feel generically identical.
- No stranded gap regression.
- Responsive stacking remains readable.
- Tests reflect intentional order/count changes.

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

