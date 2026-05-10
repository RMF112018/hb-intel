# Prompt 01 — Span Override Foundation — Updated

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

This prompt implements only the foundational span override seam needed by later Phase 06 choreography and analytics prompts.

## Objective

Add typed dashboard-specific card span override support to `PccDashboardCard` without changing global footprint defaults, without creating dashboard choreography/composition helpers, and without changing any current dashboard card order.

The result must let later prompts place cards into intentional 12-column / 10-column arrangements such as `5 + 3 + 4` and `4 + 3 + 3`, even when the card’s footprint default or footprint minimum span is larger than the override.

## Baseline Repo-Truth Assumptions

Before editing, verify the Prompt 00 baseline is still true:

```text
Phase 5 closeout commit present:
d06d614a02f16123d8c8252f71cebc22f348bc51

Expected starting SPFx package version:
1.0.0.215

Expected target SPFx package version after this prompt:
1.0.0.216

Expected current state before this prompt:
- PccDashboardCard has no spanOverrides prop.
- PccDashboardCard resolves data-pcc-column-span from resolveFootprintColumnSpan(mode, footprint).
- footprints.ts owns the 8-mode responsive contract.
- grid-auto-flow: dense is absent.
- shell-owned main[role="tabpanel"][data-pcc-active-surface-panel] is already the active-panel owner.
- apps/project-control-center/src/layout/pccDashboardComposition.ts is absent.
- apps/project-control-center/src/analytics/ is absent.
```

Run this preflight and stop if the baseline is not understandable:

```bash
git status --short
git rev-parse HEAD
git merge-base --is-ancestor d06d614a02f16123d8c8252f71cebc22f348bc51 HEAD && echo "phase-5-closeout-present" || echo "phase-5-closeout-missing"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If `phase-5-closeout-missing` is printed, stop and report. Do not edit files.

If the working tree is dirty, report the dirty paths before editing. Do not overwrite unrelated user changes.

## Global Instructions

- Do not re-read files that are still within your current context or memory unless they have changed, your context is stale, or validation requires it.
- Do not install dependencies.
- Do not add `echarts`.
- Do not add `echarts-for-react`.
- Do not create analytics components.
- Do not create dashboard choreography or composition helpers in this prompt.
- Do not reorder Project Home cards in this prompt.
- Do not edit Project Home surfaces in this prompt.
- Do not edit primary dashboard surfaces in this prompt.
- Do not run broad repo scans when targeted reads are sufficient.
- Do not introduce live integrations, writeback, approval execution, source mutation, URL routing, SharePoint mutation, or random render-time data.
- Do not render developer/internal copy in the UI.
- Preserve PCC read-only / preview / no-writeback posture.
- Keep every bento card as a direct child of `[data-pcc-bento-grid]`.
- Do not use `grid-auto-flow: dense`.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Use production-grade, end-user-facing copy only. This prompt should not add visible end-user copy.

## Scope

Implement the span override foundation only.

Modify:

```text
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/config/package-solution.json
```

Create:

```text
apps/project-control-center/src/layout/PccDashboardCard.spanOverrides.test.tsx
```

Do **not** create these in Prompt 01:

```text
apps/project-control-center/src/layout/pccDashboardComposition.ts
apps/project-control-center/src/layout/pccDashboardComposition.test.ts
apps/project-control-center/src/analytics/
```

Those are Prompt 02 / Prompt 03 work.

## Implementation Requirements

### 1. Add span override type

In `apps/project-control-center/src/layout/footprints.ts`, add:

```ts
export type PccCardSpanOverrides = Partial<Record<PccResponsiveMode, number>>;
export type PccCardSpanSource = 'footprint' | 'override';
```

Add a resolved-span result type such as:

```ts
export interface PccResolvedCardColumnSpan {
  readonly columnSpan: number;
  readonly source: PccCardSpanSource;
  readonly overrideMode?: PccResponsiveMode;
}
```

### 2. Add span resolver helper

In `footprints.ts`, add an exported helper with semantics equivalent to:

```ts
export function resolveDashboardCardColumnSpan(
  mode: PccResponsiveMode,
  footprint: PccCardFootprint,
  columns: number,
  spanOverrides?: PccCardSpanOverrides,
): PccResolvedCardColumnSpan {
  const footprintSpan = resolveFootprintColumnSpan(mode, footprint);
  const override = spanOverrides?.[mode];

  if (typeof override !== 'number' || !Number.isFinite(override)) {
    return { columnSpan: footprintSpan, source: 'footprint' };
  }

  const integerOverride = Math.trunc(override);
  const clampedOverride = Math.min(Math.max(integerOverride, 1), columns);

  return {
    columnSpan: clampedOverride,
    source: 'override',
    overrideMode: mode,
  };
}
```

Required semantic decision:

- An explicit override intentionally **wins over** `FOOTPRINT_COLUMN_SPANS` and `FOOTPRINT_MIN_COLUMN_SPANS`.
- Do **not** apply `Math.max(override, FOOTPRINT_MIN_COLUMN_SPANS[mode][footprint])`.
- This is required so Phase 06 can intentionally place a card at 3 columns in a 12-column row even if that footprint’s global default/minimum is 4 columns.
- Existing footprint behavior remains unchanged when no matching override exists.

### 3. Preserve global footprint defaults

Do not change:

```text
PCC_CARD_FOOTPRINTS
PCC_RESPONSIVE_MODES
PCC_RESPONSIVE_COLUMNS
FOOTPRINT_COLUMN_SPANS
FOOTPRINT_MIN_COLUMN_SPANS
FOOTPRINT_MIN_INLINE_SIZE_PX
PCC_BENTO_GRID_ROW_UNIT_PX
PCC_BENTO_GRID_GAP_PX
PCC_RESPONSIVE_THRESHOLDS_PX
resolveResponsiveMode
resolveFootprintColumnSpan
```

The only permitted additions in `footprints.ts` are the override types/helper and related exports.

### 4. Add prop to PccDashboardCard

In `PccDashboardCardProps`, add:

```ts
spanOverrides?: PccCardSpanOverrides;
```

Import the new type/helper from `./footprints`.

### 5. Use columns from bento context

In `PccDashboardCard`, change:

```ts
const { mode } = usePccBentoContext();
const columnSpan = resolveFootprintColumnSpan(mode, footprint);
```

to use both `mode` and `columns`, then call the new resolver:

```ts
const { mode, columns } = usePccBentoContext();
const resolvedColumnSpan = resolveDashboardCardColumnSpan(
  mode,
  footprint,
  columns,
  spanOverrides,
);
const columnSpan = resolvedColumnSpan.columnSpan;
```

Continue using:

```ts
const minInlineSize = FOOTPRINT_MIN_INLINE_SIZE_PX[mode][footprint];
```

Do not weaken or remove the existing min-inline-size behavior.

### 6. Emit instrumentation markers

Continue emitting existing markers:

```text
data-pcc-column-span
data-pcc-footprint
data-pcc-mode
```

Add:

```text
data-pcc-span-source
data-pcc-span-override-mode
```

Marker semantics:

```text
data-pcc-span-source="footprint" when no matching valid override is used.
data-pcc-span-source="override" when the matching mode override is used.
data-pcc-span-override-mode="<mode>" only when source is override.
data-pcc-span-override-mode should be undefined/absent when source is footprint.
```

Do not rename or remove existing markers that tests or evidence rely on.

### 7. Preserve active-panel behavior

Do not add `dataActiveSurfacePanel` usage anywhere.

Do not remove the legacy `dataActiveSurfacePanel` prop in this prompt. It may still exist for backward compatibility, but Phase 06 work must not depend on it.

### 8. Version bump

Because Prompt 01 introduces runtime source changes for Phase 06, bump both values in:

```text
apps/project-control-center/config/package-solution.json
```

from `1.0.0.215` to `1.0.0.216`:

```text
solution.version
solution.features[0].version
```

If the repo already shows a later user-approved PCC version, do not downgrade it. Report the existing version and leave it unchanged.

Do not bump `tools/spfx-shell/config/package-solution.json`.

Do not bump this PCC package version again in later Phase 06 prompts unless the user explicitly instructs it.

## Required Tests

Create:

```text
apps/project-control-center/src/layout/PccDashboardCard.spanOverrides.test.tsx
```

Use existing test conventions in the PCC app.

The tests must prove all of the following:

### Card render tests

- no override uses the footprint span and emits `data-pcc-span-source="footprint"`;
- no override omits `data-pcc-span-override-mode`;
- valid matching-mode override uses the override span and emits `data-pcc-span-source="override"`;
- valid matching-mode override emits `data-pcc-span-override-mode="<active mode>"`;
- override above active columns clamps to the active column count;
- override below `1` clamps to `1`;
- decimal override is made deterministic through integer truncation;
- invalid override values such as `NaN` or `Infinity` fall back to footprint source;
- mode-specific override only affects the matching active mode;
- override can intentionally resolve below the footprint default/minimum span;
- min inline size remains from the footprint;
- existing `data-pcc-column-span` reflects the resolved span, whether source is footprint or override.

### Helper/unit tests

Where practical, test `resolveDashboardCardColumnSpan` directly for:

- footprint fallback;
- override clamp high;
- override clamp low;
- invalid override fallback;
- override below footprint minimum.

### CSS/layout invariant test

Add or include a targeted assertion that `grid-auto-flow: dense` is not present in:

```text
apps/project-control-center/src/layout/PccBentoGrid.module.css
```

Do not add `grid-auto-flow` anywhere.

## Acceptance Criteria

- `spanOverrides?: PccCardSpanOverrides` exists on `PccDashboardCardProps`.
- The override helper is typed, exported, deterministic, and covered by tests.
- Matching mode overrides win over global footprint defaults/minimums.
- Non-matching modes retain normal footprint behavior.
- Override values are clamped to `1..columns`.
- Invalid override values fall back to footprint behavior.
- Existing footprint behavior is unchanged when no valid matching override exists.
- Global footprint constants are unchanged.
- Min inline size remains footprint-derived.
- No composition helper is created in this prompt.
- No analytics directory is created in this prompt.
- No dependency installation is performed.
- `echarts-for-react` is not added to PCC.
- PCC `package-solution.json` solution and feature versions are `1.0.0.216`, unless already later by user approval.

## Required Validation

Run the narrowest validation needed during implementation, then at closeout run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check apps/project-control-center/src/layout/PccDashboardCard.tsx apps/project-control-center/src/layout/footprints.ts apps/project-control-center/src/layout/PccDashboardCard.spanOverrides.test.tsx apps/project-control-center/config/package-solution.json
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Do not run Playwright for Prompt 01 unless the user explicitly asks. This prompt changes a low-level layout primitive and component tests are the correct gate. Playwright evidence belongs to later choreography/evidence prompts.

## Closeout Report

Report in this structure:

```text
HB: Phase 06 Prompt 01 Closeout — Span Override Foundation

Summary:
- ...

Files Changed:
- ...

Version:
- SPFx solution version before:
- SPFx solution version after:
- SPFx feature version before:
- SPFx feature version after:

Dependency / Lockfile:
- Dependencies installed by agent: No
- echarts added by agent: No
- echarts-for-react added to PCC: No
- pnpm-lock md5 before:
- pnpm-lock md5 after:

Implementation Notes:
- span override type/helper:
- override below footprint minimum:
- min-inline-size behavior:
- active-panel ownership:
- grid-auto-flow dense:

Validation:
- ...

Risks / Follow-Up:
- ...

Commit Guidance:
- Suggested summary:
  test(pcc): add span override foundation for dashboard cards
- Suggested description bullets:
  - add typed span override resolver for PccDashboardCard;
  - preserve global footprint defaults and min-inline-size behavior;
  - add instrumentation for span source and override mode;
  - cover clamp/fallback/mode-specific behavior with tests;
  - bump PCC package version to 1.0.0.216;
  - no dependency install and no charting wrapper added.
```

## Non-Goals

Do not do any of the following in Prompt 01:

- Project Home card reordering.
- Project Home gateway action changes.
- Primary dashboard surface analytics.
- Analytics wrapper creation.
- ECharts import/use.
- Composition map/helper creation.
- Playwright evidence generation.
- Tenant-hosted validation.
- Dependency installation.
- SPFx package build or deployment.
