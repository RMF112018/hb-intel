# Phase 08 Prompt 06 — Tab and Module Launcher Enhancement — FOLEON DIRECTION UPDATE

## Objective

Refine the existing `PccHorizontalTabs` and module launcher so the tab bar reads as the top band of the unified PCC Command Surface rather than a disconnected SharePoint-style rail. Preserve all existing keyboard, ARIA, registry, module-state, false-affordance, and no-writeback contracts.

This is a bounded enhancement of the existing implementation, not a rebuild.


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

Expected files:

```text
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
```

Model registry file is default **do not edit**:

```text
packages/models/src/pcc/PccPrimaryNavigation.ts
```

Do not edit shell wrapper/hero/command search/card primitive/surfaces/analytics/package/manifest/lockfile/evidence unless a focused validation failure proves a narrow in-scope update is required.

## Current Contracts to Preserve

- eight registry-driven primary tab groups;
- `role="tab"`, `aria-selected`, `aria-controls` where applicable;
- dropdown toggle as a real button with `aria-haspopup="menu"`, `aria-expanded`, and `aria-controls`;
- ArrowLeft/ArrowRight/Home/End primary tab behavior;
- ArrowDown opens module menu and focuses first module;
- menu roving focus;
- Escape returns focus;
- blur-close behavior;
- selectable/non-selectable guardrails;
- disabled reason copy remains visible;
- no sidebar/drawer/portal.

## Required Design Direction

The tab bar should visually belong to the unified command surface:

- remove the feeling of a flat gray rail pasted above the hero;
- let the command-surface gradient show through or coordinate with tab backgrounds;
- active tab should feel embedded in the surface field, not only underlined;
- use non-color-only active affordance: weight, inset/underline, background lift, and position;
- open menu parent should feel connected to the dropdown panel;
- compact density should remain usable in SharePoint width constraints.

Use existing PCC tokens only. Do not use Foleon raw colors.

## Module Launcher Panel Direction

Refine the dropdown as a premium module launcher panel:

- use existing card/elevation/border/radius tokens;
- use subtle top or inline accent connected to the active tab;
- active module can use an accent rail/background;
- disabled/deferred modules must remain visibly unavailable and not clickable-looking;
- state labels must remain truthful;
- no modal, portal, drawer, sidebar, or overlay library.

## Stable Markers

Add if not already present:

```text
data-pcc-tab-launcher-button={tab.id}
data-pcc-module-menu-density="compact|comfortable"
```

Do not remove existing markers.

## Testing Requirements

Add/preserve tests for:

- all eight tabs render in order;
- toggle click opens menu without selecting module;
- mouse focus retention on toggle;
- ArrowDown opens menu and focuses first module;
- selectable module dispatches exactly once and closes menu;
- non-selectable module click/Enter/Space does not dispatch and menu remains open;
- active module marker remains;
- disabled/deferred modules keep `aria-disabled` and visible reason;
- new launcher/density markers exist;
- no sidebar/drawer/portal/complementary navigation is introduced;
- no developer copy appears.

## Acceptance Criteria

- Tabs and module launcher visually integrate with the command surface.
- Navigation remains behaviorally unchanged.
- Active/open states are clearer and more premium.
- Disabled/deferred modules do not gain false affordance.
- Full tests and typecheck pass.


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
