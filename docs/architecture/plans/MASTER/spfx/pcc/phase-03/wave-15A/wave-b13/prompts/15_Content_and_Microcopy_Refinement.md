# Phase 08 Prompt 15 — Content and Microcopy Refinement

## Objective

Refine end-user-facing copy so the UI sounds production-grade, construction-specific, and authority-safe.

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

Audit and refine visible UI copy across Phase 08 touched components. The goal is clearer product value, stronger construction operations language, and no developer/demo copy.

## Expected File Targets

```text
apps/project-control-center/src/**/*.tsx
packages/models/src/pcc/PccPrimaryNavigation.ts
apps/project-control-center/src/tests/*

```

## Allowed Changes

- Production copy refinements.
- Exact-copy test updates when copy intentionally changes.
- Small state-label alignment updates.

## Prohibited Changes

- Do not remove required source/no-writeback cues.
- Do not introduce legal/contractual advice language.
- Do not imply HBI can approve or decide.

## Required Steps

1. Search touched UI files for developer/demo/filler language.
2. Standardize preview, read-only, launch-only, source-unavailable, configuration-required, and deferred copy.
3. Preserve no-writeback and no-authority language.
4. Improve card titles and action labels to be concise and operational.
5. Ensure HBI advisory copy states no decisions or writeback.
6. Update tests that assert exact copy.

## Acceptance Criteria

- No end-user-facing `mock`, `placeholder`, `TODO`, `fixture`, or `demo` copy introduced.
- State labels are consistent.
- No authority overstatement.
- Cost & Time/Sage copy does not imply sync, posting, update, mutation, or writeback.
- Action labels are concise and clear.

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

