# Phase 08 Prompt 09 — Project Home Experience Enhancement

## Objective

Make Project Home feel like the daily command dashboard with a clear first-fold hierarchy and stronger end-user value.

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

Enhance Project Home so it immediately communicates what needs attention today. Priority Actions should dominate, Site Health and Document Control should support, analytics should explain insight, and the rest of the operational spine should feel purposeful.

## Expected File Targets

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/*.tsx
apps/project-control-center/src/surfaces/projectHome/*.module.css
apps/project-control-center/src/surfaces/projectHome/projectHomeChoreography.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeAnalytics.ts
apps/project-control-center/src/tests/*ProjectHome*
apps/project-control-center/src/tests/*Analytics*

```

## Allowed Changes

- Only changes needed to complete this prompt's objective.

## Prohibited Changes

- Do not change Project Home into a full workflow implementation.
- Do not add live data calls.
- Do not remove current operational cards unless replacing with equivalent or better operational value.

## Required Steps

1. Inspect Project Home card order, span overrides, and analytics.
2. Preserve the operational spine and direct bento children.
3. Strengthen Priority Actions card as the primary first-fold card.
4. Refine Site Health and Document Control as strong supporting cards.
5. Improve Project Readiness / Approvals relationship and visual hierarchy.
6. Make Missing Configurations an exception/control card.
7. Refine Team Snapshot and Recent Activity as supporting context.
8. Ensure analytics remain insight-led and accessible.
9. Update tests for order, card kind/severity markers, gateway behavior, and no duplicate `Project Intelligence` card.

## Acceptance Criteria

- Project Home has a clear dominant first-fold priority.
- No `Project Intelligence` bento card returns.
- No duplicate header/overview card.
- First fold feels operational and useful.
- No stranded gap regression.
- Analytics and gateways remain functional/tested.

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

