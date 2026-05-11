# Phase 08 Prompt 04 — Unified Command Surface / Hero Enhancement — FOLEON DIRECTION UPDATE

## Objective

Refactor and refine the PCC command header so the primary tab bar and `PccProjectHeroBand` read as one unified, premium **PCC Command Surface**. The result should borrow the polish principles from the Foleon Company Pulse experience — layered gradients, strong hierarchy, rounded/elevated surfaces, and intentional section composition — while preserving PCC's operational tone, SharePoint host fit, preview-only command search, and no-writeback guardrails.

This prompt **does authorize a narrow shell composition change**: wrapping the existing tabs and hero in a shared command-surface container above `main[role="tabpanel"]`. This wrapper is above the bento grid and must not affect the bento direct-child invariant.


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


## Current Repo-Truth to Respect

The current PCC shell renders tabs, hero, and `main` in this order. `PccHorizontalTabs` is a standalone rail, and `PccProjectHeroBand` is a separate card-like hero slab. The visual gap is that they read as two disconnected page elements.

Preserve these existing contracts:

- tab bar renders before hero;
- hero renders before `main[role="tabpanel"]`;
- `main[role="tabpanel"]` retains `data-pcc-active-surface-panel`;
- hero keeps primary title, secondary title, surface description, project facts, `heroHighlights`, `governanceMicrocopy`, and preview-only command search;
- command search remains non-interactive;
- no wrappers are added between `PccBentoGrid` and `PccDashboardCard`.

## Expected File Targets

Primary targets:

```text
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/tests/PccShell.hostFit.test.tsx
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/*Shell*
```

Only touch a listed file if necessary. Do not edit package/manifest/lockfile/evidence files.

## Required Implementation Direction

### 1. Create the PCC Command Surface wrapper

In `PccShell.tsx`, wrap the existing tab bar and hero in one container:

```tsx
<section data-pcc-command-surface="" className={styles.commandSurface}>
  <PccHorizontalTabs ... />
  <PccProjectHeroBand ... />
</section>
<main role="tabpanel" data-pcc-active-surface-panel={activePrimaryTabId}>...</main>
```

Exact class/prop names may vary based on current repo truth, but the structural contract must be:

- one wrapper above `main`;
- tabs first, hero second;
- `main` third;
- active-panel marker stays on `main`;
- wrapper is not a bento child and does not contain the bento grid.

Add stable evidence markers:

```text
data-pcc-command-surface=""
data-pcc-command-surface-variant="unified-gradient"
```

### 2. Apply Foleon-inspired PCC gradient field

In `PccShell.module.css`, style the command surface as a single integrated slab:

- use existing PCC variables only;
- use `color-mix(in srgb, ...)` with existing PCC tokens;
- use subtle radial gradients plus a linear gradient;
- use existing radius/elevation/border tokens;
- do not use raw Foleon colors;
- do not use fixed/sticky positioning;
- keep horizontal clipping controlled.

The command surface should visually connect the tabs and hero. It should not feel like a separate marketing banner.

### 3. Convert hero surface to participate in the unified field

In `PccProjectHeroBand.module.css`:

- remove or soften the hero's standalone card-slab feel where it conflicts with the new command surface;
- make `.heroSurface` visually transparent or semi-layered relative to the wrapper gradient, using PCC tokens only;
- preserve facts/highlights/governance structure;
- preserve compact/phone behavior;
- maintain readable contrast;
- avoid making the hero oversized.

### 4. Project Home “Today’s Focus” remains required

If not already present in current repo truth, update `surfaceHeaderMetadata.ts` so Project Home includes a deterministic `Today’s Focus` highlight.

Do not introduce live date logic, tenant calls, or source-system calls.

### 5. Tests

Add/update tests proving:

- one `[data-pcc-command-surface]` exists;
- command surface contains the tablist before the hero region;
- `main[role="tabpanel"][data-pcc-active-surface-panel]` remains outside and after the command surface;
- bento grid remains inside `main`, not inside the command surface;
- no sidebar/rail/drawer/complementary region is introduced;
- hero still renders all required facts/highlights/governance;
- Project Home still renders Today’s Focus;
- command search remains preview-only and non-interactive.

## Prohibited Changes

- Do not redesign module launcher behavior.
- Do not make command search interactive.
- Do not edit surface body cards.
- Do not edit analytics.
- Do not change package/manifest/lockfile.
- Do not add raw colors copied from Foleon.
- Do not remove no-writeback/governance microcopy.

## Acceptance Criteria

- Tabs and hero read as one unified PCC command surface.
- The header has Foleon-grade polish translated into PCC tokens.
- The command surface remains native inside SharePoint.
- The hero is visually stronger but not oversized.
- Project facts and surface posture remain visible.
- Command search remains clearly preview-only.
- Tests lock the new command-surface ownership and order contract.


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
