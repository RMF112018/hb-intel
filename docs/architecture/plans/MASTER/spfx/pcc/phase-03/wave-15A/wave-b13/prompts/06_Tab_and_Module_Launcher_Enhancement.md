# Phase 08 Prompt 06 — Tab and Module Launcher Enhancement — UPDATED

## Objective

Refine the existing PCC primary tab bar and per-tab module launcher/dropdown into a more premium, accessible, production-grade module launcher experience while preserving the current Phase 05/06/07 runtime navigation architecture and all existing keyboard, ARIA, false-affordance, and no-writeback contracts.

This is a **bounded enhancement of the existing `PccHorizontalTabs` implementation**, not a rebuild.

## Current Execution Baseline

Use this as the current Phase 08 execution baseline unless local repo-truth proves a newer operator-authorized commit exists:

```text
Branch: main
Baseline HEAD: b869b1c581763c4e33f7fc037a1a44715f47596c
Prompt 05: committed and pushed
Package / manifest version: 1.0.0.219
Lockfile md5: 7c19ccfa8718a42f7f55ce178a626996
```

The historical package-generation baseline `7d8bae430ab999d4fb38abe8de6689b89d8f4d27` is predecessor context only. Do not treat it as the execution baseline.

## Required Pre-Edit Repo Truth Gate

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

1. The branch is `main`.
2. HEAD is at or after `b869b1c581763c4e33f7fc037a1a44715f47596c`.
3. Any drift from this prompt is forward-only and operator-owned.
4. The working tree is clean except for explicitly operator-owned prompt-file WIP.
5. `pnpm-lock.yaml` md5 is unchanged unless the operator explicitly authorized dependency work. No dependency work is authorized by this prompt.

If unrelated modified/untracked files are present, stop and report the drift classification. Do not overwrite operator-owned work.

## Global Execution Rules

These rules apply to this prompt and every later Phase 08 prompt.

1. Work in the `RMF112018/hb-intel` repo.
2. Treat this phase as **PCC Product Experience Enhancement**, not a CSS-only polish pass.
3. Preserve the current Phase 05/06/07 runtime architecture unless this prompt explicitly authorizes a narrow change.
4. Preserve the current eight primary-tab model exactly:
   - `project-home`
   - `core-tools`
   - `documents`
   - `estimating-preconstruction`
   - `startup-closeout`
   - `project-controls`
   - `cost-time`
   - `systems-administration`
5. Do not reintroduce a permanent PCC sidebar, rail, drawer, or left navigation surface.
6. Do not move `data-pcc-active-surface-panel` back to a card. It must remain shell-owned on `main[role="tabpanel"]`.
7. Preserve the bento direct-child invariant. Do not add wrappers between `PccBentoGrid` and `PccDashboardCard`.
8. Do not add dependencies. Do not add `echarts-for-react`.
9. Do not create live SharePoint, Graph, Procore, Sage, Azure, tenant, or app-catalog mutations.
10. Preserve read-only / preview / launch-only / no-writeback posture.
11. Do not introduce fake affordances. A non-working search/action/control must not appear live without clear preview or disabled state.
12. Do not put developer copy in the UI. Avoid end-user-visible words like `mock`, `placeholder`, `TODO`, `fixture`, `demo`, prompt numbers, wave names, repo terms, or implementation sequencing.
13. Do not weaken tests to pass. Update tests only when the expected product contract has intentionally changed.
14. Use stable `[data-*]` markers and semantic roles for tests. Do not test CSS module class names as behavior contracts.
15. Do not re-read files that are still within current context or memory. Only open files required to verify repo-truth, inspect drift, or make the scoped change.
16. Do not run `git add .`.
17. Do not commit or push unless the operator explicitly requests it.

## Current Repo-Truth Observations to Preserve

At the Prompt 05 baseline, `PccHorizontalTabs` is already a mature implementation. Preserve these existing contracts:

1. Eight registry-driven primary tab groups render from `PCC_PRIMARY_NAVIGATION_TABS`.
2. Each primary tab has:
   - `role="tab"`;
   - `aria-selected`;
   - optional `aria-controls`;
   - stable `data-pcc-tab-id`, `data-pcc-tab-active`, and `data-pcc-tab-mode`.
3. Each primary group has:
   - `data-pcc-surface-nav-parent`;
   - `data-pcc-parent-active`;
   - `data-pcc-module-menu-open`.
4. Each dropdown toggle:
   - is a real button;
   - keeps mouse-click focus on the toggle;
   - exposes `aria-haspopup="menu"`;
   - tracks `aria-expanded`;
   - uses `aria-controls`.
5. Keyboard behavior already includes:
   - `ArrowLeft` / `ArrowRight` / `Home` / `End` primary tab movement;
   - primary-tab `Enter` / `Space` selection;
   - primary-tab or toggle `ArrowDown` opening the matching module menu and focusing the first module;
   - menu item `ArrowDown` / `ArrowUp` / `Home` / `End` roving focus;
   - `Escape` returning focus to the parent tab;
   - blur outside the nav root closing the menu after a microtask.
6. Module menu items already render as buttons with `role="menuitem"`, stable module IDs, parent IDs, state markers, selectable markers, active markers, visible state labels, summaries, authority cues, and disabled reason copy.
7. Non-selectable modules are already protected by `aria-disabled="true"` and guarded click/keyboard handlers.
8. Existing `PccHorizontalTabs.test.tsx` is broad and should remain green.

## Scope

Improve **visual hierarchy, affordance clarity, module menu polish, state differentiation, and evidence/test selectors** for the existing top tabs and module dropdowns.

This prompt is allowed to refine:

```text
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
```

Potential model file target is allowed only if a concrete copy defect is found and the correction is strictly production copy:

```text
packages/models/src/pcc/PccPrimaryNavigation.ts
```

However, default posture is **do not edit the model registry**. Do not change IDs, state enums, source systems, selectable flags, parent mapping, module membership, routing semantics, or authority posture.

## Explicit Non-Scope

Do not edit:

```text
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/PccCommandSearch.module.css
apps/project-control-center/src/layout/*
apps/project-control-center/src/surfaces/*
apps/project-control-center/src/cards/*
apps/project-control-center/src/analytics/*
apps/project-control-center/config/package-solution.json
tools/spfx-shell/config/package-solution.json
**/ProjectControlCenterWebPart.manifest.json
pnpm-lock.yaml
docs/architecture/evidence/**
docs/architecture/blueprint/**
```

Do not regenerate screenshots or hosted evidence. That belongs to Prompt 17 unless the operator explicitly authorizes it.

## Required Implementation Direction

### 1. Preserve behavior first

Before visual work, identify the existing test contracts around:

- all eight primary tabs;
- registry order;
- dropdown toggle open/close;
- mouse click focus retention;
- ArrowDown focus into modules;
- module item roving keyboard behavior;
- selectable and non-selectable module behavior;
- no developer copy;
- ARIA role boundaries;
- launch-only and HBI/no-writeback authority cues.

Do not change these behaviors unless the prompt explicitly authorizes the change. This prompt does not authorize behavior changes.

### 2. Add or preserve stable evidence markers

If useful, add narrowly scoped stable markers. Acceptable examples:

- `data-pcc-tab-launcher-button={tab.id}` on dropdown toggles, while preserving existing `data-pcc-nav-toggle={tab.id}`;
- `data-pcc-module-menu-density={isCompact ? 'compact' : 'comfortable'}` on the open menu;
- `data-pcc-module-state-kind={module.state}` only if not redundant with existing `data-pcc-module-state`.

Do not rename or remove existing markers.

### 3. Refine tab visual hierarchy

Use existing PCC tokens only. Improve, if needed:

- active tab clarity;
- open-menu parent group treatment;
- hover / pressed / focus-visible states;
- non-color-only active indicator clarity;
- compact density spacing.

Constraints:

- No raw colors.
- No new design tokens.
- No heavy custom shadows.
- No broad/global CSS resets.
- No hover/focus treatment that implies disabled items are clickable.
- Reduced-motion behavior must remain protected.

### 4. Refine module launcher panel

Improve the dropdown so it reads as a deliberate **module launcher panel**, not a plain dropdown.

Allowed refinements using existing tokens:

- slightly stronger panel separation using `--pcc-elevation-card`, `--pcc-color-card`, `--pcc-color-border`;
- clearer menu width behavior using existing min/max width patterns;
- better internal spacing;
- state label treatment using existing state tokens;
- active module treatment using an accent rail or token-based left marker;
- selectable vs non-selectable distinction.

Do not convert this to a sidebar, drawer, modal, popover library, portal, or overlay system.

### 5. Refine module item state clarity

Each module state must remain truthful:

- `available`: can be opened/reviewed.
- `preview`: preview/context only.
- `read-only`: no approvals, decisions, or writeback.
- `launch-only`: opens/references source system; PCC does not write back.
- `configuration-required`: cannot be opened until configured.
- `source-unavailable`: source data not available.
- `deferred`: future release; not active for selected project.

Do not make non-selectable modules look active. Do not remove disabled reason copy.

### 6. Active module indicator

Make the active module visibly clear without implying a new action.

Allowed approach:

- token-based accent rail or subtle background on `[data-pcc-module-active='true']`;
- visible active marker text is not required and should not be added unless existing UX clearly needs it.

Avoid adding copy such as “current module” unless tests and UI need it. Visual treatment is preferred.

### 7. Test updates

Update or add tests only where the new product contract needs coverage.

Required test coverage:

- existing keyboard behavior still passes;
- root tablist and all eight tabs still render in order;
- toggle click still opens menus without selecting primary tab or module;
- mouse click still keeps focus on toggle;
- ArrowDown still opens menu and focuses first module;
- non-selectable module click/Enter/Space still does not dispatch and menu stays open;
- selectable module click/Enter/Space dispatches exactly once and closes menu;
- open menu exposes stable state markers;
- active module item exposes `data-pcc-module-active="true"`;
- disabled/deferred items retain `aria-disabled="true"` and disabled reason copy;
- no developer copy appears in closed or opened tablists;
- no sidebar/rail/drawer/portal markers introduced.

Do not replace behavior tests with snapshot-style or CSS-module-class assertions.

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

If Prettier fails, run targeted `prettier --write` only on changed files, then rerun `prettier --check` and the relevant tests if formatting touched runtime/test files.

Expected:

- Typecheck: PASS.
- Full SPFx package tests: PASS.
- Lockfile md5 unchanged: `7c19ccfa8718a42f7f55ce178a626996`.
- No package / manifest / dependency / evidence drift.
- Changed files limited to the explicit scope.

## Manual Diff Review Before Closeout

Confirm:

- No primary tab IDs changed.
- No module IDs changed.
- No module parent relationships changed.
- No module selectable flags changed unless a clear existing defect was found and explained.
- No registry authority posture weakened.
- No new source-system writeback implication.
- No new sidebar / rail / drawer / modal / portal / overlay system.
- No active-panel ownership change.
- No bento/layout/card/surface-body changes.
- No command search or hero changes.
- No raw colors or new tokens.
- No disabled item false affordance.
- No end-user-facing developer copy.
- Existing keyboard and ARIA contracts remain green.
- Reduced-motion protection remains intact.

## Closeout Requirements

Use `templates/Closeout_Template.md` and include:

- Starting and ending HEAD.
- Local drift classification.
- Files changed.
- Tests run and results.
- Lockfile md5 before/after.
- Evidence generated or blocked reason.
- Guardrails confirmed.
- Whether any model registry copy was changed. If yes, explain exactly why and confirm no ID/state/selectable/authority posture changed.
- Whether any visual review watchpoints remain for Prompt 17.

Do not commit unless explicitly instructed.
