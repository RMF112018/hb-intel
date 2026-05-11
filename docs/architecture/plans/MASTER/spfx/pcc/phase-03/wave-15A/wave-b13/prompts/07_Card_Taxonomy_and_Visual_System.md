# Phase 08 Prompt 07 — Card Taxonomy and Visual System — FOLEON DIRECTION UPDATE

## Objective

Refine the existing `PccDashboardCard` primitive so PCC cards adopt the same level of polish seen in the Foleon Company Pulse cards — stronger hierarchy, rounded/elevated slabs, subtle gradient/accent language, and clearer state/source posture — while preserving the existing bento grid, span overrides, row-span measurement, accessibility, and taxonomy architecture.

This is not a rebuild and not a migration of all consuming surfaces.


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


## Current Card Contracts to Preserve

The card primitive already has a meaningful taxonomy:

- `hierarchy` resolves to tier defaults;
- `tier` communicates hierarchy/intensity;
- `region` communicates purpose/role;
- `density` controls spacing;
- `footprint` controls placement/size;
- `spanOverrides` remains the intentional choreography mechanism;
- row-span measurement remains intact;
- cards are not clickable by default.

Do not introduce a competing taxonomy that duplicates `tier` and `region`.

## Scope

Expected files:

```text
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/PccDashboardCard.module.css
apps/project-control-center/src/layout/PccDashboardCard.test.tsx
apps/project-control-center/src/layout/PccDashboardCard.spanOverrides.test.tsx  # only if needed
```

Default do-not-edit:

```text
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/shell/**
apps/project-control-center/src/surfaces/**
apps/project-control-center/src/analytics/**
package.json
pnpm-lock.yaml
**/package-solution.json
**/*.manifest.json
docs/architecture/evidence/**
```

## Required Design Direction

Translate Foleon card polish into PCC operational cards:

- stronger rounded card slab posture;
- subtle gradient or tinted background only where token-supported and role-appropriate;
- tier/region-driven accent rails or top accents;
- clearer title/eyebrow/action alignment;
- state/deferred/reference cards visually distinct but not noisy;
- no broad card hover/focus treatment that implies clickability;
- no raw Foleon orange/hex colors;
- no heavy shadows beyond existing tokenized elevation.

The goal is a more intentional system, not one-off decorative styling.

## Optional Taxonomy Extension

If needed and still backward-compatible, add:

```ts
export type PccCardTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type PccCardSourceSystem =
  | 'none'
  | 'pcc'
  | 'sharepoint'
  | 'procore'
  | 'sage'
  | 'power-bi'
  | 'external'
  | 'future';
```

Props:

```ts
tone?: PccCardTone;                 // default 'neutral'
sourceSystem?: PccCardSourceSystem; // default 'none'
```

Markers:

```text
data-pcc-card-tone="neutral|info|success|warning|danger"
data-pcc-card-source-system="none|pcc|sharepoint|procore|sage|power-bi|external|future"
```

Do not migrate consuming surface cards in this prompt. Surface adoption belongs to later prompts.

## CSS Direction

Allowed:

- scoped token-only refinements in `PccDashboardCard.module.css`;
- `color-mix(...)` with existing PCC variables;
- tone/state/deferred inset accent stripes;
- dual-shadow stacks when preserving elevation is intended;
- explicit comments when a selector intentionally drops elevation for reduced emphasis.

Prohibited:

- raw colors;
- new tokens;
- global resets;
- clickable card cues;
- `cursor: pointer` on card root;
- `:hover`/`:focus` rules that imply full-card actionability;
- footprint/span defaults unless unavoidable and tested.

## Testing Requirements

Tests must prove:

- existing tier/region/hierarchy defaults remain;
- existing markers remain;
- optional new markers default deterministically;
- explicit new marker values render;
- card root remains non-interactive by default;
- ARIA labeling remains correct;
- span override behavior remains intact;
- no bento direct-child impact.

## Acceptance Criteria

- Card primitive feels more production-grade and better aligned with Foleon-level polish.
- Existing taxonomy is preserved and strengthened.
- Any new taxonomy props are optional, defaulted, typed, and tested.
- No consuming surface migration is forced.
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
