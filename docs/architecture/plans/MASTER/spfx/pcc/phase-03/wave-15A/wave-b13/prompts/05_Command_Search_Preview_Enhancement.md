# Phase 08 Prompt 05 — Command Search Preview Enhancement — FOLEON DIRECTION UPDATE

## Objective

Enhance `PccCommandSearch` so it feels like a premium command-preview capsule embedded inside the unified PCC Command Surface. It should borrow Foleon's polished card/capsule language — layered surface, clear CTA-like hierarchy, rounded treatment, and strong typography — while remaining completely non-interactive, preview-only, advisory, and no-writeback.

This prompt is **not** a real search implementation.


## Required Precondition Before Execution

Prompt 08 was previously audited as blocked because commit `c40296bca0ca7207b5e7126a0b750eeaad02823a` introduced unauthorized version changes and package/manifest misalignment. Before executing this prompt, verify that a corrective commit has been pushed and audited, or that the operator has explicitly authorized a complete, aligned package-version posture.

Pre-edit gate:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git log --oneline -5
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Proceed only if:

- branch is `main`;
- working tree is clean except explicitly operator-owned prompt WIP;
- package/manifest versions are aligned across all PCC package loci;
- `pnpm-lock.yaml` md5 is unchanged unless dependency work was explicitly authorized;
- any drift is forward-only, operator-owned, and does not conflict with this prompt.


## Design Direction Overlay — Foleon-Inspired PCC Polish

The operator has approved a revised visual direction based on the `apps/hb-intel-foleon` / Company Pulse presentation quality. Translate the **principles** into PCC; do not copy the Foleon implementation literally.

Required design principles:

1. **Unified command surface** — the PCC tab bar and hero must read as one composed command/header surface, not two disconnected elements.
2. **Layered gradient field** — use a restrained PCC token-driven gradient field, with subtle radial highlights and a linear surface transition. The treatment should feel operational and premium, not editorial/orange-heavy.
3. **Clear first-fold hierarchy** — active tab, surface title, project facts, command search preview, hero highlights, and governance microcopy must feel intentionally arranged inside one surface.
4. **Foleon-grade card polish** — rounded slabs, stronger hierarchy, subtle inset/accent treatments, and clear CTAs/action states should inform PCC components where appropriate.
5. **Token discipline** — PCC implementation must use existing PCC theme variables and `color-mix(...)`. Do not introduce raw hex/rgb/rgba/hsl colors copied from Foleon.
6. **Truthful affordances** — preview-only, read-only, launch-only, disabled, and no-writeback states must remain explicit.
7. **No host takeover** — the design must still feel native inside SharePoint and must not introduce fixed/sticky takeover behavior, sidebars, portals, or global resets.

Visual target:

- The command surface should sit below SharePoint chrome as a single premium PCC slab.
- The tab bar should appear embedded into the top of that slab.
- The hero should continue the same background field below the tabs.
- The command search preview should feel like an intentional glass/card capsule inside the hero, not a disconnected box.
- Cards below the command surface should use consistent rounded/elevated/inset accent language, but remain operational and data-forward.


## Global Guardrails

1. Work in `RMF112018/hb-intel`.
2. Treat this as **PCC Product Experience Enhancement**, not a CSS-only polish pass.
3. Preserve the eight primary-tab model exactly: `project-home`, `core-tools`, `documents`, `estimating-preconstruction`, `startup-closeout`, `project-controls`, `cost-time`, `systems-administration`.
4. Do not reintroduce a permanent PCC sidebar, rail, drawer, or left navigation.
5. Do not move `data-pcc-active-surface-panel` back to a card. It must remain shell-owned on `main[role="tabpanel"]`.
6. Preserve the bento direct-child invariant. Do not add wrappers between `PccBentoGrid` and `PccDashboardCard`.
7. Do not add dependencies. Do not add `echarts-for-react`.
8. Do not create live SharePoint, Graph, Procore, Sage, Azure, tenant, app-catalog, or source-system mutations.
9. Preserve read-only / preview / launch-only / no-writeback posture.
10. Do not introduce fake affordances. Non-working search/action/control elements must be visibly preview-only, disabled, or non-interactive.
11. Do not use end-user-visible developer copy: `mock`, `placeholder`, `TODO`, `fixture`, `demo`, prompt numbers, wave names, repo terms, or implementation sequencing.
12. Do not weaken tests to pass. Update tests only when the expected product contract intentionally changes.
13. Use stable `[data-*]` markers and semantic roles for tests. Do not test CSS module class names as behavior contracts.
14. Do not re-read files still in current context or memory. Open only files needed to verify repo truth, inspect drift, or make the scoped change.
15. Do not run `git add .`. Do not commit or push unless the operator explicitly instructs you.
16. Do not regenerate hosted/tenant/Playwright evidence unless the operator explicitly authorizes it.


## Scope

Refine only the command search preview capsule and tests.

Expected files:

```text
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/PccCommandSearch.module.css
apps/project-control-center/src/tests/PccCommandSearch.test.tsx
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx  # only if needed
```

Do not edit shell composition, hero layout, tabs, bento, cards, analytics, surfaces, package, manifest, lockfile, or evidence directories.

## Required Design Direction

The command preview should feel visually integrated with the unified command surface produced by Prompt 04:

- use a glass/capsule/card treatment that sits comfortably on a gradient command surface;
- use existing PCC tokens and `color-mix(...)` only;
- use subtle border/elevation/radius — no heavy marketing shadow;
- make the title, helper, advisory/no-writeback cue, and examples readable at first glance;
- keep icon/compact variant restrained so it does not crowd the hero.

Do not copy Foleon raw colors. Translate the card polish into PCC operational styling.

## Required Product Copy

Recommended visible copy:

```text
Title: Command Search — Preview
Helper: Search, HBI prompts, and project commands are preview-only in this phase.
Cue: Advisory only · no decisions · no writeback
Preview examples:
- Ask HBI for project context
- Find project records
- Review blocking signals
```

Adjust wording only if it preserves the same no-false-affordance meaning.

## Required Implementation Direction

1. Preserve root markers:
   - `data-pcc-command-search={variant}`
   - `data-pcc-command-search-state="preview"`
2. Add or preserve markers for:
   - title;
   - helper;
   - cue;
   - examples.
3. Decorative SVG is allowed only if:
   - `aria-hidden="true"`;
   - `focusable="false"`;
   - not focusable or clickable.
4. Preview examples must be static spans/text, not buttons or links.
5. Expanded variant may show examples. Icon/compact variant should omit examples if spacing is tight.
6. No input, button, link, `tabIndex`, searchbox/combobox/textbox role, click handler, keyboard handler, or placeholder-like active input styling.

## Testing Requirements

Add or preserve tests proving:

- expanded and icon variants render;
- preview-state marker remains;
- title includes `Command Search — Preview`;
- helper/cue include preview-only, advisory, no decisions, no writeback posture;
- examples render only as non-interactive elements;
- no input/button/link/select/textarea descendants;
- no descendant with `tabindex="0"`;
- no `role="button"`, `searchbox`, `combobox`, or `textbox`;
- decorative SVG is hidden/focusable false;
- hero integration remains non-interactive.

## Acceptance Criteria

- Command preview looks premium and intentional inside the command surface.
- User cannot mistake it for a working search input.
- Advisory/no-writeback posture is visible.
- Compact variant does not overflow.
- No package/manifest/lockfile/dependency/evidence drift.


## Required Validation

Run after edits:

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

If Prettier fails, run targeted `pnpm exec prettier --write <changed-files>` only, then rerun `prettier --check` and rerun tests after formatting touches runtime/test files.

Do not broad-format unrelated files.


## Closeout Requirements

Return closeout in chat using `templates/Closeout_Template.md` unless repo-local convention clearly requires a saved closeout file.

Include:

- verdict;
- prompt number/title;
- branch;
- starting and ending HEAD;
- local drift classification;
- package / manifest version posture;
- lockfile md5 before/after;
- files changed with summaries;
- tests run and results;
- evidence generated or blocked reason;
- guardrails confirmed;
- visual-review watchpoints for Prompt 17;
- commit summary/description only if the operator explicitly requested a commit and a commit was actually authored.
