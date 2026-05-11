# Phase 08 Prompt 04 — Command Header / Hero Enhancement — UPDATED

## Objective

Enhance `PccProjectHeroBand` into the primary PCC command-context surface with stronger hierarchy, clearer project identity, surface-specific posture, and a Project Home “Today’s Focus” summary while preserving the current Phase 05/06/07 shell architecture, Prompt 03 host-fit work, preview-only command-search posture, and no-writeback guardrails.

This is a bounded runtime enhancement prompt. It is not a redesign of the tab bar, module launcher, bento grid, dashboard cards, analytics, or source-system integrations.

## Current Execution Baseline

Use the current committed and pushed Phase 08 baseline unless local repo truth proves newer safe forward drift:

```text
Branch: main
Expected baseline HEAD: bc545d568b8a652f17171cd3325ac3f5445e2b6d
Prompt 03 status: committed and pushed
Package / manifest version: 1.0.0.219
Expected lockfile md5: 7c19ccfa8718a42f7f55ce178a626996
```

Historical package-generation baseline `7d8bae430ab999d4fb38abe8de6689b89d8f4d27` is reference context only. Do not roll back, overwrite, or discount the Prompt 01, Prompt 02, or Prompt 03 commits.

## Required Pre-Edit Repo-Truth Gate

Before editing, run and record:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git log --oneline -5
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Proceed only if:

1. Branch is `main`.
2. HEAD is `bc545d568b8a652f17171cd3325ac3f5445e2b6d` or safe forward-only drift.
3. `origin/main` is aligned or drift is clearly docs-only/operator-owned and not conflicting.
4. Working tree is clean except operator-owned prompt WIP explicitly identified before editing.
5. Lockfile md5 remains `7c19ccfa8718a42f7f55ce178a626996`.

If unrelated runtime, package, manifest, lockfile, evidence, or operator-owned WIP is present, stop and report before editing.

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
5. Do not reintroduce a permanent PCC sidebar, rail, drawer, or left navigation.
6. Do not move `data-pcc-active-surface-panel` back to a card. It must remain shell-owned on `main[role="tabpanel"]`.
7. Preserve the bento direct-child invariant. Do not add wrappers between `PccBentoGrid` and `PccDashboardCard`.
8. Do not add dependencies. Do not add `echarts-for-react`. `echarts` direct usage remains the approved analytics approach.
9. Do not create live SharePoint, Graph, Procore, Sage, Azure, tenant, or app-catalog mutations.
10. Preserve read-only / preview / launch-only / no-writeback posture.
11. Do not introduce fake affordances. A non-working search/action/control must not appear live without clear preview or disabled state.
12. Do not put developer copy in the UI. Avoid end-user-visible words like `mock`, `placeholder`, `TODO`, `fixture`, or `demo` unless a governed preview/sample label already exists and is intentionally user-facing.
13. Do not weaken tests to pass. Update tests only when the expected product contract has intentionally changed.
14. Use stable `[data-*]` markers and semantic roles for tests. Do not test CSS module class names as behavior contracts.
15. Do not re-read files that are still within the current context or memory. Only open files needed to verify current repo truth, inspect drift, or make the scoped change.
16. Do not use `git add .`.
17. Do not commit unless the operator explicitly requests a commit after closeout.
18. Do not regenerate hosted / tenant / Playwright evidence unless explicitly authorized by the operator.

## Current Repo-Truth to Respect

At the Prompt 03 baseline, the hero already includes:

- `PccShell.tsx` rendering order: tabs → `PccProjectHeroBand` → `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- `PccProjectHeroBand.tsx` rendering:
  - primary title;
  - active-surface secondary title;
  - surface description;
  - project facts row;
  - `heroHighlights`;
  - `governanceMicrocopy`;
  - preview-only command search slot.
- `projectShellViewModel.ts` deriving hero data from `PCC_SHELL_SURFACE_HEADER_METADATA`.
- `surfaceHeaderMetadata.ts` keyed to all eight primary tabs with existing `heroHighlights` and `governanceMicrocopy`.
- `PccProjectHeroBand.test.tsx` locking:
  - primary title;
  - active primary-tab secondary title;
  - all eight local surface descriptions;
  - project facts;
  - preview-only command search;
  - facts → highlights → microcopy DOM order;
  - responsive mode/density markers;
  - all eight `heroHighlights` and `governanceMicrocopy` rows;
  - no source-confidence markers;
  - no generic pill-row markers;
  - no interactive descendants in hero highlight/governance zones.

Do not duplicate these structures. Refine and extend them deliberately.

## Planning Inputs

Use these repo-local artifacts as governing references:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/00_PCC_Phase_08_Product_Experience_Enhancement_Plan.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/01_Screenshot_Baseline_Findings.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/README.md
```

Minimum findings to address from the Prompt 02 matrix:

- shell/hero should read as a command surface, not a flat information strip;
- surface context should be clearer and more useful at first fold;
- Project Home needs a clearer current-focus / today-focus posture;
- source/trust/no-writeback posture must remain visible without looking like developer scaffolding;
- command search must remain a clear preview/disabled affordance, not a fake action.

## Scope

Improve the command header / hero only.

Authorized scope:

1. Strengthen visual hierarchy within `PccProjectHeroBand`.
2. Improve layout separation between:
   - project identity;
   - command search preview;
   - project facts;
   - surface posture / current focus;
   - governance/read-only microcopy.
3. Refine existing `heroHighlights` into a more premium posture-summary treatment without introducing forbidden pill-row/source-confidence markers.
4. Add or adjust Project Home metadata so it clearly presents a “Today’s Focus” style summary using deterministic existing PCC context only.
5. Improve compact responsive behavior so the hero remains readable and does not clip.
6. Add or update tests for the new hero contract.

Out of scope:

- tab bar redesign;
- module launcher redesign;
- command search implementation or live behavior;
- analytics cards;
- dashboard card taxonomy;
- bento grid changes;
- shell host-fit CSS changes already completed in Prompt 03;
- surface body/content changes;
- live data, source mutations, writeback, or new API calls;
- package, manifest, dependency, lockfile, or evidence changes.

## Expected File Targets

Primary targets:

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/projectShellViewModel.test.ts
apps/project-control-center/src/tests/*Shell*
```

Only touch a listed file if necessary. If the final solution does not require `projectShellViewModel.ts`, do not edit it.

Do not edit:

```text
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/layout/*
apps/project-control-center/src/surfaces/*
apps/project-control-center/src/cards/*
package.json
pnpm-lock.yaml
**/package-solution.json
**/*.manifest.json
docs/architecture/evidence/**
```

unless a required validation failure proves a narrow in-scope update is necessary and the closeout explicitly justifies it.

## Required Implementation Direction

### 1. Preserve Existing Hero Contract

Keep the current high-level hero content model unless a specific test is intentionally updated:

- primary title remains `Project Control Center`;
- secondary title remains active primary-tab label;
- surface description remains local surface copy;
- global facts remain visible:
  - Client;
  - Location;
  - Estimated value;
  - Scheduled completion;
  - Project stage;
- command search remains preview-only/non-interactive;
- all eight surfaces retain metadata-backed posture and governance copy;
- `role="region"` and accessible label remain intact.

### 2. Improve Visual Hierarchy

Refine the hero CSS using existing PCC tokens only.

Allowed CSS refinements:

- improve identity block emphasis;
- use existing tokens for border, elevation, spacing, radius, background, and status colors;
- make highlight/posture cells read more like intentional command-surface summaries;
- improve separation between facts, posture, and governance without adding clutter;
- improve compact/phone behavior with existing responsive markers;
- add stable data markers only where they improve testability/evidence.

Prohibited CSS refinements:

- no raw colors;
- no new design tokens;
- no global CSS resets;
- no heavy shadows;
- no sticky/fixed positioning;
- no sidebar/rail/drawer;
- no broad layout restructuring that risks host-fit;
- no decorative effects that are not token-justified.

### 3. Surface-Specific Posture / “Today’s Focus”

Refine `surfaceHeaderMetadata.ts` rather than hardcoding tab-specific text in the component.

Requirements:

- Every primary tab must retain three useful `heroHighlights` unless there is a tested reason to change the count.
- Project Home must include an explicit `Today’s Focus` or equivalent current-focus highlight.
- Project Home focus text must be deterministic and must not depend on the live system date, tenant data, source calls, or hidden runtime state.
- Cost & Time must preserve the Sage book-of-record / no-writeback posture.
- Core Tools must preserve HBI advisory/no-authority posture.
- Documents must preserve Project Record / source-boundary posture.
- Systems Administration must preserve governed-administrator / no tenant mutation posture.
- Avoid end-user-visible `mock`, `fixture`, `TODO`, `placeholder`, `demo`, prompt, phase, or wave language.

### 4. Command Search Preview

Do not make command search interactive in this prompt.

Requirements:

- no `input`, `button`, live search field, executable command menu, or keyboard-focusable fake action inside the hero command search slot;
- existing preview-state marker remains;
- visible copy must make the preview/unavailable state clear;
- no implication that HBI/search can execute actions, make decisions, approve items, or write to source systems.

### 5. Accessibility and Responsive Behavior

Requirements:

- preserve semantic region behavior;
- preserve logical DOM order;
- ensure facts/highlights/governance remain readable in compact modes;
- do not remove focus visibility;
- do not add animations/transitions unless reduced-motion behavior is explicitly handled;
- do not rely on color alone for meaning;
- maintain no interactive descendants in posture/governance zones.

### 6. Testing Requirements

Update or add tests so the new contract is locked:

Required assertions:

- all eight primary tabs still render:
  - active label as secondary title;
  - local surface description;
  - hero highlights;
  - governance microcopy;
- Project Home renders `Today’s Focus` or the chosen current-focus label;
- Project Home focus highlight is deterministic and present in the metadata-derived view model;
- Cost & Time still renders Sage book-of-record / no-writeback copy;
- Core Tools still renders HBI advisory/no-authority copy;
- command search remains preview-only and non-interactive;
- no source-confidence markers are introduced;
- no generic pill-row markers are introduced unless the architecture contract is intentionally revised, which this prompt does not authorize;
- facts → highlights/posture → governance DOM order remains logical;
- responsive mode/density markers remain correct;
- no forbidden UI literals appear.

Use explicit cleanup per existing test convention.

## Required Validation

Run:

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

If Prettier fails, run targeted `pnpm exec prettier --write <changed-files>` only, then rerun `--check`.

Do not run broad formatters across unrelated files.

## Manual Diff Review Before Closeout

Confirm:

- no dependency, lockfile, package, or manifest drift;
- no sidebar, rail, drawer, or host-takeover positioning;
- no active-panel ownership change;
- no bento/layout/card/surface body changes;
- no live data call;
- no writeback or source mutation implication;
- no fake command/search/action behavior;
- no end-user-facing developer copy;
- no raw one-off colors or new design tokens;
- no removal of valuable project facts unless equivalent value is visibly preserved;
- no weakening of existing negative hero tests;
- no screenshot/evidence directories touched.

## Acceptance Criteria

- Hero reads as the primary PCC command-context surface.
- Header is visually stronger but not oversized.
- Header content remains surface-specific for all eight primary tabs.
- Project Home includes a clear current-focus / “Today’s Focus” posture summary.
- Source/trust/no-writeback posture remains visible and end-user appropriate.
- Command search remains clearly preview-only and non-interactive.
- Responsive hero does not clip or overflow.
- Existing governance, accessibility, and no-false-affordance contracts remain intact.
- All required validations pass.

## Evidence

Do not regenerate screenshots or hosted evidence in this prompt unless explicitly authorized.

Closeout should state:

- evidence not generated because Prompt 04 is a runtime/test prompt;
- visual effect must be captured in later evidence work, especially Prompt 17;
- operator visual review remains required before any flagship-complete claim.

## Closeout Requirements

Return closeout in chat using `templates/Closeout_Template.md` unless repo-local convention clearly requires a saved closeout file.

Include:

- verdict;
- prompt number/title;
- branch;
- starting and ending HEAD;
- local drift classification;
- package / manifest version;
- lockfile md5 before/after;
- files changed with summaries;
- tests run and results;
- evidence generated or blocked reason;
- guardrails confirmed;
- residual risks / follow-up;
- commit summary and description only if the operator explicitly requested a commit and a commit was actually authored.
