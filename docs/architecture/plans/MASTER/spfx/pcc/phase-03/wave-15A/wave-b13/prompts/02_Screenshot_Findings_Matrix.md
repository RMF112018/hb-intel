# Phase 08 Prompt 02 — Screenshot Findings Matrix

## Objective

Convert the current screenshot baseline into a developer-actionable findings matrix that drives the enhancement work.

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

Create a screenshot findings document that records visual weaknesses and desired end-state improvements surface by surface. Use existing screenshot contact sheet/evidence where available. This prompt is docs/evidence only unless minor path references need correction.

## Expected File Targets

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/01_Screenshot_Baseline_Findings.md
docs/architecture/evidence/pcc-live/** (read only unless adding a findings reference)
```

## Allowed Changes

- Only changes needed to complete this prompt's objective.

## Prohibited Changes

- Do not edit runtime source.
- Do not regenerate live evidence unless explicitly needed and authorized.
- Do not delete existing screenshots.

## Required Steps

1. Find the latest relevant PCC screenshot contact sheet or use the operator-provided screenshot baseline.
2. Evaluate all eight current primary tabs.
3. Rate first-fold hierarchy, header strength, nav clarity, card usefulness, analytics clarity, source trust, visual appeal, and interaction gaps.
4. For each surface, write concrete enhancement findings.
5. Map each finding to a later prompt number.
6. Classify high-impact and high-risk enhancement areas.

## Acceptance Criteria

- Findings matrix covers all eight current primary tabs.
- Each finding is actionable and tied to a prompt/workstream.
- Document avoids generic statements like 'make it nicer' without implementation guidance.
- No runtime code changed.

## Required Validation

```bash
git status --short
pnpm exec prettier --check docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/01_Screenshot_Baseline_Findings.md
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

