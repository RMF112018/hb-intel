# Phase 08 Prompt 01 — Product Experience Enhancement Brief

## Objective

Create the repo-local Phase 08 product experience brief that governs all subsequent enhancement prompts.

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

Add or update the Phase 08 planning document. This prompt is primarily doc-only. It should land the final target experience, visual principles, card taxonomy, surface intent, interaction rules, evidence plan, and no-open-decisions posture.

The document must explicitly frame Phase 08 as product-experience enhancement, not simple polish.

## Expected File Targets

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/00_PCC_Phase_08_Product_Experience_Enhancement_Plan.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/README.md (if already present or created as package index)
```

## Allowed Changes

- Only changes needed to complete this prompt's objective.

## Prohibited Changes

- Do not edit runtime source.
- Do not update lockfile.
- Do not change package versions.

## Required Steps

1. Create `wave-b13/` if it does not exist.
2. Add the Phase 08 implementation plan using this package's plan as source truth.
3. Ensure the plan references the current eight-tab runtime model.
4. Ensure no open decisions remain.
5. Include allowed/prohibited changes, surface intent, card taxonomy, visual system, accessibility, evidence, and validation sections.
6. Run markdown formatting checks if available.

## Acceptance Criteria

- Plan exists at the target path.
- Plan uses current eight-tab model.
- Plan explicitly prohibits sidebar, writeback, fake affordances, dependency additions, and active-panel ownership regressions.
- Plan is comprehensive enough for later prompts to reference.
- No runtime code changed.

## Required Validation

```bash
git status --short
pnpm exec prettier --check docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/00_PCC_Phase_08_Product_Experience_Enhancement_Plan.md
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

