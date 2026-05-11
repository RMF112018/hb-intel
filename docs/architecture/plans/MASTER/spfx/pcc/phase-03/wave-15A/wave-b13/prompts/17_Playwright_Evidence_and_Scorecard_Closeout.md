# Phase 08 Prompt 17 — Playwright Evidence and Scorecard Closeout

## Objective

Generate or update Phase 08 evidence proving product-experience enhancement, host-fit, accessibility, and no-regression posture.

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

Run or update the live/synthetic evidence lanes needed for Phase 08. Generate screenshot evidence, contact sheet, evidence index, and scorecard/closeout notes. If tenant/live evidence is blocked, document the exact blocker and preserve available synthetic/component evidence.

## Expected File Targets

```text
e2e/pcc-live/*
docs/architecture/evidence/pcc-live/*
docs/reference/spfx-surfaces/project-control-center/*
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/*

```

## Allowed Changes

- Evidence docs and screenshot artifacts under governed evidence roots.
- Playwright test/evidence writer updates required for new evidence.
- Scorecard evidence notes.

## Prohibited Changes

- Do not stage auth/session artifacts.
- Do not claim live evidence passed if it self-skipped or was blocked.
- Do not treat Playwright as the final score authority.
- Do not delete historical evidence.

## Required Steps

1. Run Playwright list and evidence registry commands.
2. Run live evidence if environment/auth permits.
3. Capture screenshots for all eight current primary tabs.
4. Capture module menu open state, selected module state, command search preview, disabled/deferred module, Cost & Time Sage cue, and Systems Administration source/configuration posture.
5. Generate or update screenshot contact sheet.
6. Document before/after visual findings.
7. Update scorecard/evidence notes without treating Playwright as final expert scorer.
8. Run final validations and prepare closeout.

## Acceptance Criteria

- Evidence covers all eight primary tabs.
- Screenshots prove no clipping and improved first-fold hierarchy.
- Command header, module launcher, cards, analytics, and gateway states are captured.
- Accessibility/source/no-writeback evidence updated or blocked with reason.
- Scorecard/evidence notes updated.
- No raw/auth-sensitive artifacts staged.

## Required Validation

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
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
- Include evidence root path.
- Include list of screenshots/contact sheets generated.
- Include exact live evidence blocked/pass status.
