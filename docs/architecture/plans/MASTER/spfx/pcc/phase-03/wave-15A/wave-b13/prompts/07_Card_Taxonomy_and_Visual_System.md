# Phase 08 Prompt 07 — Card Taxonomy and Visual System — Updated Execution Prompt

## Objective

Refine the existing PCC card primitive into a more intentional visual system so cards communicate hierarchy, purpose, state, and source posture more clearly without breaking the bento grid, span overrides, row-span measurement, accessibility, or the existing Phase 05/06/07 runtime architecture.

This is **PCC Product Experience Enhancement**, not a rebuild and not a CSS-only polish pass.

## Current Repo-Truth Baseline

Treat the current execution baseline as:

```text
Branch: main
Baseline HEAD: e3ef0e3a11239b4f320660cf66f651800412c061
Prompt 06: committed and pushed
Package / manifest version: 1.0.0.219
Expected pnpm-lock.yaml md5: 7c19ccfa8718a42f7f55ce178a626996
```

Before editing, verify local repo truth. If local repo truth differs, classify the drift and proceed only when it is safe to align without overwriting operator-owned work.

Required pre-edit checks:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Hard stop if there is unrelated modified/untracked work outside this prompt's scope, unless the operator explicitly identifies it as approved carry-forward WIP.

## Current Implementation Facts to Preserve

The current card primitive already has an established taxonomy and evidence contract:

- `PccDashboardCard.tsx` already supports `hierarchy`, `tier`, `region`, `density`, `footprint`, `headingLevel`, `dataActiveSurfacePanel`, and `spanOverrides`.
- Existing emitted markers include `data-pcc-card`, `data-pcc-footprint`, `data-pcc-card-hierarchy`, `data-pcc-card-tier`, `data-pcc-card-tier-source`, `data-pcc-card-region`, `data-pcc-card-region-source`, `data-pcc-card-density`, `data-pcc-heading-level`, `data-pcc-mode`, `data-pcc-column-span`, `data-pcc-span-source`, `data-pcc-span-override-mode`, `data-pcc-row-span`, and `data-pcc-measured-height`.
- `PccDashboardCard.module.css` already includes tier-driven and region-driven visual rules.
- `PccDashboardCard.test.tsx` already validates tier/region/default behavior, heading behavior, ARIA behavior, and required data markers.
- `PccDashboardCard.spanOverrides.test.tsx` already protects span override behavior.
- `footprints.ts` defines responsive modes, footprints, spans, min spans, min inline sizes, row unit, gap, and `resolveDashboardCardColumnSpan`.

Do **not** introduce a parallel taxonomy that duplicates `tier` and `region`. Refine and extend the existing taxonomy only where it adds clear value.

## Scope

This prompt is limited to the shared card primitive and its direct tests.

Expected in-scope files:

```text
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/PccDashboardCard.module.css
apps/project-control-center/src/layout/PccDashboardCard.test.tsx
apps/project-control-center/src/layout/PccDashboardCard.spanOverrides.test.tsx
```

Conditionally in scope only if a direct card contract requires it:

```text
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccBentoGrid.test.tsx
apps/project-control-center/src/tests/*Bento*
```

Default posture: **do not edit `footprints.ts`**. Span/footprint defaults are not part of Prompt 07 unless a card primitive change cannot be safely implemented without a tested footprint correction. If `footprints.ts` is touched, the closeout must justify why it was necessary and identify all tests proving span behavior was preserved.

## Required Design Direction

Refine the card primitive so it feels more production-grade and less visually flat while preserving its current structure.

Use the existing taxonomy first:

- `tier` communicates hierarchy/intensity.
- `region` communicates card role/purpose area.
- `hierarchy` remains the legacy/user-facing input that resolves to tier defaults.
- `density` controls spacing.
- `footprint` controls placement/size, not semantic meaning.

Do not add `cardKind` unless you prove that existing `tier`/`region` cannot represent the needed distinction. If you add any new taxonomy prop, it must be optional, backward compatible, typed, tested, and clearly subordinate to existing `tier`/`region`.

Recommended minimal extension, only if it materially improves the primitive:

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

Optional prop names, if added:

```ts
tone?: PccCardTone;          // default: 'neutral'
sourceSystem?: PccCardSourceSystem; // default: 'none'
```

If added, emit stable markers:

```text
data-pcc-card-tone="neutral|info|success|warning|danger"
data-pcc-card-source-system="none|pcc|sharepoint|procore|sage|power-bi|external|future"
```

Do not migrate consuming surface cards in this prompt. Surface-specific application of the taxonomy belongs to later surface-level prompts unless a compile/test failure requires a local update.

## Allowed Changes

- Token-only CSS refinements to `PccDashboardCard.module.css`.
- Optional prop additions to `PccDashboardCardProps`, if backward compatible and tested.
- Stable `data-*` markers for evidence and future screenshot review.
- Test additions/updates for default marker behavior, explicit marker behavior, and preservation of existing markers.
- Narrow token-discipline cleanup inside `PccDashboardCard.module.css` if existing raw color/shadow literals are touched by the card visual-system work.

## Prohibited Changes

Do not:

- Make cards clickable by default.
- Add `onClick`, `role="button"`, `tabIndex={0}`, or pseudo-interactive card behavior.
- Add hover/focus treatment that implies an entire card is clickable.
- Remove or rename existing `data-pcc-*` card markers.
- Remove `spanOverrides`, row-span measurement, footprint markers, or source markers.
- Add wrappers between `PccBentoGrid` and `PccDashboardCard`.
- Change global footprint defaults unless absolutely necessary and exhaustively tested.
- Edit surface bodies, analytics cards, command search, hero, tabs, shell, navigation registry, package files, manifests, lockfile, or evidence directories.
- Add dependencies or `echarts-for-react`.
- Add raw one-off colors, new design tokens, broad/global CSS resets, or unscoped selectors.
- Add source-system writeback, live integrations, or copy implying decisions/approvals/writeback.
- Add end-user-visible developer copy such as `mock`, `placeholder`, `TODO`, `fixture`, `demo`, prompt numbers, wave names, or implementation sequencing.

## Required Implementation Steps

1. Inspect only the current files needed for this prompt:
   - `PccDashboardCard.tsx`
   - `PccDashboardCard.module.css`
   - `PccDashboardCard.test.tsx`
   - `PccDashboardCard.spanOverrides.test.tsx`
   - bento/footprint files only if needed to validate span behavior.

2. Confirm the existing taxonomy contract before editing:
   - default = `tier2` + `operational`
   - `hierarchy='primary'` resolves to `tier1` + `command`
   - `hierarchy='supporting'` resolves to `tier3` + `reference`
   - explicit `tier` wins over hierarchy
   - explicit `region` wins over tier-derived region
   - heading defaults remain tier-based

3. Refine card visual chrome using the existing `tier` and `region` selectors:
   - stronger but token-disciplined header hierarchy;
   - clearer title/action alignment;
   - subtle left/top accent treatments by tier/region where appropriate;
   - improved state/deferred/reference differentiation;
   - no broad card hover behavior implying clickability;
   - preserve density behavior.

4. Add optional `tone` and/or `sourceSystem` only if it adds concrete value to future evidence/surface prompts and does not duplicate `tier`/`region`.
   - Defaults must preserve current behavior.
   - Markers must be emitted on the `<article>`.
   - CSS must be token-only and scoped.
   - Tests must prove default and explicit values.

5. Preserve accessibility behavior:
   - titled cards use `aria-labelledby` pointing to the heading id;
   - cards without titles may use `aria-label`;
   - no new interactive role;
   - no focusable card root unless a future prompt explicitly authorizes accessible card actions.

6. Preserve span and bento behavior:
   - `gridColumn`, `gridRow`, `minInlineSize`, row span, measured height, and span source markers remain intact.
   - If optional props are added, they must not alter span resolution.
   - Run span override tests.

7. Add or update tests:
   - existing required markers still present;
   - any new marker defaults are emitted;
   - any explicit new marker values are emitted;
   - no card root becomes clickable/focusable by default;
   - span override behavior remains unchanged;
   - tier/region resolver behavior remains unchanged.

8. Do not commit unless the operator explicitly requests a commit.

## Acceptance Criteria

- Existing card taxonomy remains intact and is not replaced.
- Cards are visually more differentiated through the current `tier`/`region` contract.
- Any new props are optional, typed, defaulted, and tested.
- All existing card data markers remain present.
- Span override behavior and row-span measurement are preserved.
- Direct-child bento invariant is preserved.
- No card becomes clickable or appears clickable by default.
- CSS is token-only, scoped, and does not introduce raw one-off values.
- No package, manifest, lockfile, dependency, evidence, live integration, source-system, or surface-body changes.

## Required Validation

Run the full validation sequence after edits:

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

If Prettier fails, run targeted `prettier --write` only on changed files, rerun `prettier --check`, and rerun tests after formatting so the validated artifact matches the final formatted artifact.

Do not run hosted/tenant/Playwright evidence unless the operator explicitly authorizes it. Prompt 17 owns final screenshot evidence.

## Manual Diff Review Before Closeout

Confirm:

- Changed files are limited to the allowed card primitive/test scope.
- No global footprint defaults changed unless explicitly justified.
- No existing card markers removed or renamed.
- No direct-child bento invariant impact.
- No clickable-card affordance added.
- No raw colors/new tokens/broad CSS resets.
- No package/manifest/lockfile/dependency/evidence changes.
- No shell/hero/tabs/command-search/surface-body/analytics changes.
- Full tests and typecheck pass.
- Lockfile md5 unchanged.

## Closeout Requirements

Return closeout in chat using `templates/Closeout_Template.md` and include:

- Prompt number/title.
- Starting and ending HEAD.
- Local drift classification.
- Files changed.
- Exact implementation summary.
- Tests run and results.
- Lockfile md5 before/after.
- Evidence generated or blocked reason.
- Guardrails confirmed.
- Residual visual-review watchpoints for Prompt 17.
- Commit summary/description only if a commit was explicitly requested and authored.
