# Phase 08 Prompt 00 — Preflight Repo Truth Gate

## Objective

Verify local repo truth, classify drift, and establish the Phase 08 execution baseline before any product-experience edits.

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

No runtime code changes are authorized in this prompt. This is a repo-truth and evidence-baseline gate only.

Capture local branch, HEAD, origin/main, lockfile md5, package/manifest versions, existing untracked evidence paths, and any operator-owned work. Confirm whether local repo matches the expected remote baseline or has intentional newer work.

## Expected File Targets

```text
git metadata
pnpm-lock.yaml
apps/project-control-center/config/package-solution.json
tools/spfx-shell/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
docs/architecture/evidence/pcc-live/
```

## Allowed Changes

- Only changes needed to complete this prompt's objective.

## Prohibited Changes

- Do not edit production source.
- Do not delete untracked evidence.
- Do not run destructive cleanup commands.
- Do not install dependencies.

## Required Steps

1. Run `git status --short` and document all modified/untracked paths.
2. Run `git branch --show-current`, `git rev-parse HEAD`, and `git rev-parse origin/main`.
3. Run `md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml`.
4. Inspect PCC package-solution and webpart manifest versions without editing.
5. List existing `docs/architecture/evidence/pcc-live/` roots relevant to Phase 06/07/08.
6. Classify local drift as clean, expected operator-owned, package/evidence-only, or blocking.
7. Create a short preflight closeout note under the future Phase 08 planning folder if docs output is desired; otherwise return closeout only.

## Acceptance Criteria

- No runtime files changed.
- Local branch, HEAD, origin/main, lockfile md5, and package versions are documented.
- Operator-owned WIP is identified and not modified.
- Clear proceed/block verdict is issued.

## Required Validation

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git diff --check
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

