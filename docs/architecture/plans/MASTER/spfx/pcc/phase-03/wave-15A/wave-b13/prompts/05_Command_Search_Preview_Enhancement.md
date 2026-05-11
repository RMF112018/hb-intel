# Phase 08 Prompt 05 — Command Search Preview Enhancement — UPDATED

## Objective

Enhance the existing `PccCommandSearch` preview capsule so it reads as a premium future command capability while remaining truthful, non-interactive, accessible, and clearly bounded to advisory / no-writeback posture.

This is **not** a real search implementation. It is a production-grade preview treatment only.

## Current Execution Baseline

Use the current pushed Prompt 04 baseline as the operative repo-truth baseline:

```text
Branch: main
Baseline HEAD: 03af2b00aaf46b72adde5fa38dda8ffeec7a8a55
Package / manifest version: 1.0.0.219
Lockfile md5: 7c19ccfa8718a42f7f55ce178a626996
```

Historical package-generation baseline `7d8bae430ab999d4fb38abe8de6689b89d8f4d27` is context only. Do not use it as the execution baseline.

Before editing, verify local repo truth:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git log --oneline -5
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Classify any drift before editing. Proceed only if drift is forward-only, operator-owned, and does not touch runtime/source files this prompt will modify. Any unrelated modified or untracked runtime path blocks execution until the operator resolves it.

## Global Execution Rules

1. Work in the `RMF112018/hb-intel` repo.
2. Treat this phase as **PCC Product Experience Enhancement**, not a CSS-only polish pass.
3. Preserve the current Phase 05/06/07/08 runtime architecture unless this prompt explicitly authorizes a narrow change.
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
7. Preserve the bento direct-child invariant. Do not add wrappers between `PccBentoGrid` and `PccDashboardCard`.
8. Do not add dependencies. Do not add `echarts-for-react`.
9. Do not create live SharePoint, Graph, Procore, Sage, Azure, tenant, or app-catalog mutations.
10. Preserve read-only / preview / launch-only / no-writeback posture.
11. Do not introduce fake affordances. A non-working search/action/control must not appear live.
12. Do not put developer copy in the UI. Avoid end-user-visible words like `mock`, `placeholder`, `TODO`, `fixture`, `demo`, prompt numbers, wave names, or implementation sequencing.
13. Do not weaken tests to pass. Update tests only when the expected product contract intentionally changes.
14. Use stable `[data-*]` markers and semantic roles for tests. Do not test CSS module class names as behavior contracts.
15. Do not re-read files still in current context or memory. Open only files needed to verify repo truth, inspect drift, or make the scoped change.
16. No `git add .`. Stage only in-scope files if the operator later asks for a commit.
17. Do not commit or push unless the operator explicitly instructs you to do so.

## Current Repo-Truth Notes to Preserve

At the Prompt 04 baseline:

- `PccCommandSearch.tsx` already renders a non-focusable preview capsule with `data-pcc-command-search={variant}` and `data-pcc-command-search-state="preview"`.
- The current component renders no `<input>`, `<button>`, `<a>`, activation role, or `tabindex`.
- Existing visible copy is `Command Search — Preview` and `Search and project commands are unavailable in this preview.`
- `PccProjectHeroBand.tsx` already places the command search in the hero command slot.
- Existing hero tests assert the command preview is non-interactive and has visible preview copy.

Prompt 05 must refine this existing preview contract. Do **not** rebuild it as a working search control.

## Scope

Enhance only the preview capsule so it feels more premium and command-oriented while remaining clearly unavailable / preview-only.

The enhancement should communicate:

- future command-search capability;
- HBI advisory posture;
- no decision / approval / writeback authority;
- examples of future command categories, presented as **non-interactive preview examples**, not controls.

## Expected File Targets

```text
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/PccCommandSearch.module.css
apps/project-control-center/src/tests/PccCommandSearch.test.tsx
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx (only if existing copy assertions require update)
```

Do not edit these files unless a focused test failure proves it is necessary:

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
```

Do not edit:

```text
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/layout/**
apps/project-control-center/src/surfaces/**
apps/project-control-center/src/cards/**
apps/project-control-center/src/analytics/**
package.json
pnpm-lock.yaml
**/package-solution.json
**/*.manifest.json
docs/architecture/evidence/**
```

## Allowed Changes

1. **Component refinement** in `PccCommandSearch.tsx`:
   - Preserve the root `data-pcc-command-search={variant}` marker.
   - Preserve `data-pcc-command-search-state="preview"`.
   - Add stable markers for preview title, helper, advisory/no-writeback cue, and examples.
   - Add a local inline SVG search/command glyph if useful. The SVG must be `aria-hidden="true"`, `focusable="false"`, and must not introduce an interactive descendant.
   - Add non-interactive example command chips/rows using `<span>` or static text only.
   - Keep all copy deterministic and non-live.

2. **CSS refinement** in `PccCommandSearch.module.css`:
   - Use existing PCC tokens only: `--pcc-color-*`, `--pcc-space-*`, `--pcc-radius-*`, `--pcc-elevation-card`, and existing status/accent tokens where appropriate.
   - Improve capsule hierarchy, spacing, command feel, and preview legibility.
   - Make expanded and icon variants intentionally distinct while preserving compact fit in the hero.
   - Do not introduce raw hex/rgb/rgba colors, new design tokens, global selectors, broad resets, heavy shadows, sticky/fixed positioning, or cursor behavior that implies interactivity.

3. **Tests**:
   - Add a dedicated `PccCommandSearch.test.tsx` unless equivalent dedicated coverage already exists.
   - Keep or update existing hero tests only when required by intentional copy changes.
   - Assert both expanded and icon variants remain non-interactive.

## Required Product Copy

Use production-facing, truthful copy. Recommended target copy:

```text
Title: Command Search — Preview
Helper: Search, HBI prompts, and project commands are preview-only in this phase.
Cue: Advisory only · no decisions · no writeback
Preview examples:
- Ask HBI for project context
- Find project records
- Review blocking signals
```

These examples must be visually and semantically preview examples, not active actions.

Acceptable wording adjustments are allowed only if they preserve:

- `Command Search — Preview` as the visible title;
- explicit preview-only status;
- HBI advisory posture;
- no decisions / no approval authority / no writeback;
- no live source-system or tenant action implication.

## Prohibited Changes

- Do not add a real input.
- Do not add a button, link, select, textarea, or focusable pseudo-control.
- Do not add `role="button"`, `role="searchbox"`, `role="combobox"`, `role="textbox"`, or `tabIndex={0}`.
- Do not add keyboard behavior.
- Do not add hover/click handlers.
- Do not use placeholder text that makes the capsule look like an active input.
- Do not claim HBI can decide, approve, route, post, sync, mutate, or write back.
- Do not use copy that says the command search is available, enabled, live, connected, or ready.
- Do not introduce new source-system references beyond bounded, preview-only examples.
- Do not modify shell/hero/bento/card architecture.

## Required Steps

1. Verify repo truth and clean working tree.
2. Inspect `PccCommandSearch.tsx`, `PccCommandSearch.module.css`, and existing hero tests.
3. Refine the component into a premium, non-interactive preview capsule.
4. Add non-interactive preview examples only for the expanded variant unless the compact/icon variant can show them without crowding.
5. Ensure the icon variant stays compact and does not overflow hero compact modes.
6. Ensure all visible copy is production-grade and truthful.
7. Add or update tests proving the preview remains non-interactive and clearly preview-only.
8. Run validation.

## Required Test Coverage

Add or preserve tests proving:

- root marker `data-pcc-command-search="expanded"` renders for expanded variant;
- root marker `data-pcc-command-search="icon"` renders for icon variant;
- root marker `data-pcc-command-search-state="preview"` is present;
- visible title contains `Command Search — Preview`;
- visible helper/cue communicates preview-only, HBI advisory posture, no decisions, and no writeback;
- expanded variant renders preview examples, if examples are added;
- compact/icon variant remains legible and bounded;
- no `<input>`, `<button>`, `<a>`, `<select>`, `<textarea>` descendants render;
- no descendant has `tabindex="0"`;
- no descendant has `role="button"`, `role="searchbox"`, `role="combobox"`, or `role="textbox"`;
- inline SVG, if added, is `aria-hidden="true"` and `focusable="false"`;
- existing `PccProjectHeroBand` preview-only command search contract remains green.

## Acceptance Criteria

- Command search looks more like a polished future capability preview.
- Users can immediately tell it is not currently active.
- HBI advisory / no-decision / no-writeback posture is visible.
- No false input/action affordance is introduced.
- Accessible reading order is clear through visible text.
- Expanded and compact/icon variants are both supported.
- No runtime integration, source-system mutation, live data, dependency, package, manifest, or lockfile changes occur.

## Required Validation

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check \
  apps/project-control-center/src/shell/PccCommandSearch.tsx \
  apps/project-control-center/src/shell/PccCommandSearch.module.css \
  apps/project-control-center/src/tests/PccCommandSearch.test.tsx \
  apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If `PccProjectHeroBand.test.tsx` is not touched, omit it from the final Prettier changed-file check.

If Prettier fails, run targeted `pnpm exec prettier --write` only on changed files, then rerun `--check`. Do not broad-format unrelated files.

## Manual Diff Review Before Closeout

Confirm:

- no new dependency;
- no lockfile drift;
- no package / manifest version change;
- no live data call;
- no writeback or source-system mutation implication;
- no shell / active-panel / bento ownership change;
- no sidebar / rail / drawer;
- no real input, button, link, focusable pseudo-control, activation role, click handler, or keyboard handler;
- command search remains explicitly preview-only;
- HBI is described as advisory only;
- no end-user-facing developer copy;
- no raw one-off colors or new design tokens;
- no evidence directories touched;
- existing Prompt 03 and Prompt 04 tests remain green.

## Closeout Requirements

Return closeout in chat using `templates/Closeout_Template.md` unless the repo-local convention clearly requires a saved closeout file.

Include:

- verdict;
- prompt number and title;
- starting and ending HEAD;
- local drift classification;
- files changed;
- tests run and results;
- lockfile md5 before/after;
- evidence generated or blocked reason;
- guardrails confirmed;
- residual risks / follow-up;
- commit summary and description only if the operator explicitly requested a commit and a commit was actually authored.
