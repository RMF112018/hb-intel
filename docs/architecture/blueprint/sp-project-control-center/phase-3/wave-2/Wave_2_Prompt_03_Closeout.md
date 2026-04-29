# Wave 2 — Prompt 03 Closeout: PCC UI/UX Basis and Flexible Layout Frame

**Phase:** 3
**Wave:** 2
**Prompt:** 03 — UI/UX Basis and Flexible Layout Frame
**Status:** Complete
**Date:** 2026-04-29

## Objective Recap

Implement the PCC shell visual frame and flexible bento/masonry layout
foundation inside `apps/project-control-center/`, governed by the saved
basis-of-design asset. No live integrations, no SPFx webpart manifest, no
package-solution / `.sppkg` packaging, no version bumps. Establish the
reusable visual contract for the full W2-ODR-009 seven-state catalog now,
so later prompts can wire surface conditions without redesigning the
component.

## Files Created / Modified / Deleted

**Created (16 source files + 1 closeout):**

```text
apps/project-control-center/src/
├── shell/
│   ├── PccShell.tsx
│   ├── PccShell.module.css
│   ├── PccNavigationRail.tsx
│   ├── PccNavigationRail.module.css
│   ├── PccProjectIntelligenceHeader.tsx
│   ├── PccProjectIntelligenceHeader.module.css
│   └── PccCommandSearch.tsx
├── layout/
│   ├── PccBentoGrid.tsx
│   ├── PccBentoGrid.module.css
│   ├── PccDashboardCard.tsx
│   ├── PccDashboardCard.module.css
│   ├── footprints.ts
│   ├── useBentoRowSpan.ts
│   └── useContainerBreakpoint.ts
├── ui/
│   ├── PccStatusPill.tsx
│   ├── PccStatusPill.module.css
│   ├── PccPreviewState.tsx
│   └── PccPreviewState.module.css
├── preview/
│   └── projectPlaceholder.ts
└── tests/
    ├── pcc-import-guards.test.ts
    ├── PccBentoGrid.footprints.test.tsx
    ├── PccPreviewState.states.test.tsx
    └── PccShell.responsive.test.tsx

docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/
└── Wave_2_Prompt_03_Closeout.md   ← this file
```

**Modified:**

```text
apps/project-control-center/
├── README.md                  (visual direction, components, footprint table, responsive table, state catalog)
├── tsconfig.json              (add @hbc/ui-kit/icons path alias)
├── vite.config.ts             (add @hbc/ui-kit/icons resolve alias)
├── vitest.config.ts           (add @hbc/ui-kit/icons resolve alias)
├── src/PccApp.tsx             (rewrite: render <PccShell> with footprint demo + MVP surface tiles)
└── src/PccApp.test.tsx        (rewrite: assert header, rail, active surface, bento-grid mode marker)
```

**Deleted:**

```text
apps/project-control-center/src/styles/PccApp.module.css      (superseded by component CSS modules)
apps/project-control-center/src/styles/                        (empty directory removed)
```

No files outside `apps/project-control-center/` and this closeout were
modified.

## Basis-of-Design Cue Mapping

The saved basis-of-design asset
[`docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`](../../../../../reference/ui-kit/dashboard/dashboard-basis-of-design.png)
governs visual direction (not pixel-perfect specification). Cues map to
Prompt 03 components and verified `@hbc/ui-kit/theme` tokens as follows:

| Basis-of-design cue | Component | Token bridge (verified exports) |
| --- | --- | --- |
| Dark navy "Project Intelligence" header | `PccProjectIntelligenceHeader` | `HBC_DARK_HEADER`, `HBC_HEADER_TEXT`, `HBC_HEADER_ICON_MUTED` |
| HB-orange application navigation rail | `PccNavigationRail` | `HBC_ACCENT_ORANGE`, `HBC_ACCENT_ORANGE_HOVER`, `HBC_ACCENT_ORANGE_PRESSED` |
| Compact command/search area | `PccCommandSearch` (icon variant `Search` from `@hbc/ui-kit/icons`) | header surface tokens |
| Floating summary cards | `PccDashboardCard` | `HBC_SURFACE_LIGHT['surface-0']`, `HBC_SURFACE_LIGHT['border-default']`, `elevationCard`, `HBC_RADIUS_MD` |
| Tight bento/masonry grid | `PccBentoGrid` + `useBentoRowSpan` + `useContainerBreakpoint` | CSS Grid; `grid-auto-rows: 8px`; `gap: 16px`; **no** `grid-auto-flow: dense`; **no** CSS columns |
| Status pills next to project title | `PccStatusPill` | `HBC_STATUS_RAMP_INFO/GREEN/AMBER/RED/GRAY` |
| Light operational canvas | `PccShell` canvas | `HBC_SURFACE_LIGHT['surface-2']` |
| Variety of card heights / unique footprints | `PccDashboardCard` `footprint` prop + `useBentoRowSpan` | content-driven row span via `Math.ceil((h+gap)/(rowUnit+gap))` |

All token names above were verified by direct read of
`packages/ui-kit/src/theme/index.ts` before use. No invented token names.
No hex literals in any new Prompt 03 CSS module.

## Footprint Table

| Footprint | wideDesktop | standardDesktop | tabletLandscape | tabletPortrait | phone |
| --- | --- | --- | --- | --- | --- |
| `hero` | 8 | 6 | 4 | 2 | 1 |
| `wide` | 6 | 5 | 3 | 2 | 1 |
| `standard` | 4 | 3 | 2 | 1 | 1 |
| `compact` | 3 | 2 | 2 | 1 | 1 |
| `tall` | 4 | 3 | 2 | 1 | 1 |
| `full` | 12 | 8 | 6 | 2 | 1 |

Defined by `FOOTPRINT_COLUMN_SPANS` in `src/layout/footprints.ts`.

## Responsive Mode Table

`useContainerBreakpoint` derives the active mode from the bento grid's
**container** inline-size via `ResizeObserver` (not viewport-hardcoded).
Container-query positioning is also enabled on the grid root via
`container-type: inline-size`.

| Mode | Container width | Columns | Rail variant | Header behavior |
| --- | --- | --- | --- | --- |
| `wideDesktop` | ≥ 1280 px | 12 | `expanded` | full pill cluster + date scope + expanded search |
| `standardDesktop` | 1024–1279 | 8 | `expanded` | trimmed pill cluster + expanded search |
| `tabletLandscape` | 720–1023 | 6 | `iconOnly` | search collapses to icon affordance |
| `tabletPortrait` | 480–719 | 2 | `topStrip` | title + pill row, no date scope |
| `phone` | < 480 | 1 | `hamburger` | title only, search and pills hidden |

## Full Seven-State Catalog (W2-ODR-009) — Proof

`PccPreviewState` renders all seven states with distinct, machine-checkable
markers. `PccPreviewState.states.test.tsx` asserts each variant.

| `state` | `data-pcc-state` | `data-pcc-state-tone` | A11y posture | Spec source |
| --- | --- | --- | --- | --- |
| `preview` | `preview` | `info` | none | `PCC_PREVIEW_STATE_SPECS.preview` |
| `empty` | `empty` | `neutral` | none | `PCC_PREVIEW_STATE_SPECS.empty` |
| `loading` | `loading` | `neutral` | `aria-busy="true"` + pulse marker | `PCC_PREVIEW_STATE_SPECS.loading` |
| `error` | `error` | `danger` | `role="alert"` + filled badge | `PCC_PREVIEW_STATE_SPECS.error` |
| `missing-config` | `missing-config` | `warning` | none | `PCC_PREVIEW_STATE_SPECS['missing-config']` |
| `unavailable-fixture` | `unavailable-fixture` | `neutral` | none | `PCC_PREVIEW_STATE_SPECS['unavailable-fixture']` |
| `unauthorized-persona` | `unauthorized-persona` | `warning` | none | `PCC_PREVIEW_STATE_SPECS['unauthorized-persona']` |

`PCC_PREVIEW_STATES` array length is asserted = 7, with all unique values.

## Guard-Test Results

`src/tests/pcc-import-guards.test.ts` recursively scans every `.ts(x)`
file under `src/` (excluding the `tests/` directory itself), strips line
comments, block comments, and string/template literals, and asserts no
occurrences of any forbidden specifier.

**Forbidden specifiers asserted absent (homepage layout):**

```
@hbc/ui-kit/homepage   @hbc/homepage-launcher   apps/hb-homepage
HbcHomepageSectionShell   HbcHomepageActionRow   HbcHomepageMetadataRow
HbcSignatureHeroSurface   HbcCommandSurface   HbcLauncherSurface
HbcDiscoverySurface   HbcEditorialSurface   HbcOperationalSurface
HbcSafetyHomepageSurface   HbcPeopleCultureSurface
HbcProjectSpotlightSurface   HbcNewsroomSurface   HbcPriorityRailSurface
```

**Forbidden specifiers asserted absent (live integrations / runtime):**

```
@hbc/auth   bootstrapSpfxAuth   resolveSpfxPermissions
@pnp/sp   @microsoft/sp-http   @microsoft/microsoft-graph-client
procoreApi   procore-sdk
```

**Result:** all 25 guard assertions pass. No homepage paired-row layout
imports. No live integration runtime imports.

## Validation Command Results

| Command | Result |
| --- | --- |
| `git status --short` | Clean for Prompt 03 scope. Pre-existing modifications to `CLAUDE.md` and `.claude/settings.local.json` were already present before this prompt and are not part of the Prompt 03 commit. |
| `pnpm --filter @hbc/spfx-project-control-center check-types` | **PASS** — `tsc --noEmit` succeeded with no diagnostics. |
| `pnpm --filter @hbc/spfx-project-control-center build` | **PASS** — `vite v6.4.1`, 2147 modules transformed; emits `dist/project-control-center-app.js` (167.68 kB · gzip 53.96 kB) and `dist/spfx-project-control-center.css` (10.61 kB · gzip 2.27 kB). The IIFE bundle exposes `__hbIntel_projectControlCenter.{ mount, unmount }`. The bundle was **not** packaged into `.sppkg` and **not** deployed. |
| `pnpm --filter @hbc/spfx-project-control-center test` | **PASS** — 48/48 tests across 5 files (`PccApp.test.tsx`, `tests/pcc-import-guards.test.ts`, `tests/PccBentoGrid.footprints.test.tsx`, `tests/PccPreviewState.states.test.tsx`, `tests/PccShell.responsive.test.tsx`). |
| `pnpm --filter @hbc/spfx-project-control-center lint` | **PASS** — eslint clean. |

## Lockfile Status

`pnpm-lock.yaml` is **unchanged**. MD5 hash before and after Prompt 03
validation: `c56df7b79986896624536aab74d609f4`. `git diff --stat
pnpm-lock.yaml` reports no diff. No `pnpm install`, `pnpm add`, or
`pnpm update` was run during Prompt 03 execution. The new
`@hbc/ui-kit/icons` alias is a sub-path of an already-installed package
and required no install.

## Explicit No-Touch Confirmations

- **`packages/spfx`:** untouched. No `packages/spfx/src/webparts/projectControlCenter/` directory exists. `git status` shows no modifications under `packages/`.
- **SPFx webpart manifest / `package-solution.json` / `.sppkg`:** none created. `apps/project-control-center/` has no `src/webparts/`, no `config/package-solution.json`, no `.sppkg` artifact.
- **App-catalog packaging / deployment scripts:** none created. No tenant-mutation paths.
- **CI/CD workflow files:** untouched.
- **Backend / Azure Functions / provisioning / template packages:** untouched.
- **Tenant mutation / Graph / PnP / Procore / live runtime:** none introduced. Asserted by `pcc-import-guards.test.ts`.
- **Workflow execution / approval execution / access execution / Site-Health scanning or repair execution:** not implemented. The shell renders `PccPreviewState` placeholders only.
- **Homepage paired-row layout import, copy, or adaptation:** none. Asserted by `pcc-import-guards.test.ts` for both the `@hbc/ui-kit/homepage` barrel and the individual paired-row export names (`HbcHomepageSectionShell`, `HbcHomepageActionRow`, `HbcHomepageMetadataRow`, plus all eleven homepage surface exports).
- **Package / solution / manifest version bumps:** none. `apps/project-control-center/package.json` version remains `0.0.1`. The trailing instruction in the user prompt to "bump the appropriate manifest version" is not honored because no manifest exists in this scaffold and Wave 2 scope-lock W2-ODR-003 plus the Prompt 03 forbidden-work clause both prohibit version bumps; this conflict is resolved in favor of "no version bump."
- **`pnpm install`, `pnpm add`, lockfile mutation:** none. Lockfile hash unchanged across the entire Prompt 03 run.
- **New direct dependencies in `apps/project-control-center/package.json`:** none. `@hbc/ui-kit/icons` is a sub-path of the already-declared `@hbc/ui-kit` workspace dependency.

## Token Discipline Verification

Every theme token used in Prompt 03 was verified by direct read of
`packages/ui-kit/src/theme/index.ts` before import. Tokens used:

- Colors: `HBC_DARK_HEADER`, `HBC_HEADER_TEXT`, `HBC_HEADER_ICON_MUTED`, `HBC_ACCENT_ORANGE`, `HBC_ACCENT_ORANGE_HOVER`, `HBC_ACCENT_ORANGE_PRESSED`, `HBC_SURFACE_LIGHT` (keys: `surface-0`, `surface-2`, `border-default`, `text-primary`, `text-muted`).
- Status ramps: `HBC_STATUS_RAMP_INFO`, `HBC_STATUS_RAMP_GREEN`, `HBC_STATUS_RAMP_AMBER`, `HBC_STATUS_RAMP_RED`, `HBC_STATUS_RAMP_GRAY`.
- Spacing: `HBC_SPACE_XS`, `HBC_SPACE_SM`, `HBC_SPACE_MD`, `HBC_SPACE_LG`, `HBC_SPACE_XL`, `HBC_SPACE_XXL`.
- Radii: `HBC_RADIUS_SM`, `HBC_RADIUS_MD`, `HBC_RADIUS_LG`, `HBC_RADIUS_FULL`.
- Elevation: `elevationCard`.

`HBC_SURFACE_LIGHT` keys verified by direct read of
`packages/ui-kit/src/theme/tokens.ts`. The shape is `Record<string, string>`
with `surface-0`, `surface-1`, `surface-2`, `surface-3`, `border-default`,
`border-focus`, `text-primary`, `text-muted`, plus a few state-specific
keys; all keys used here exist on the object.

The `surface-1` shade was not used; the canvas reads `surface-2` for a
subtly heavier light-gray that matches the basis-of-design canvas tone.
No token substitution was needed — no temporary fallback to hex was
required.

## Icon Resolution

`@hbc/ui-kit/icons` subpath verified to exist in
`packages/ui-kit/package.json#exports` and to resolve to
`packages/ui-kit/src/icons/index.tsx`. Icons used (all confirmed exported
by direct read):

- Nav rail: `Home` (project-home), `HardHat` (team-and-access), `BlueprintRoll` (documents), `Inspection` (project-readiness), `Submittal` (approvals), `ExternalLink` (external-systems), `Settings` (control-center-settings), `AlertTriangle` (site-health).
- Header: `Search`.

No icon was missing. No letter-monogram fallback was needed. No new icon
dependency was added.

## Anti-Scope-Creep Notes

- **Adjacent gap not absorbed:** per-surface module UI implementation
  (Project Home bento contents, Documents, Approvals execution, External
  Systems icon catalog with launch metadata, Site Health repair-request
  UI). These are Prompts 04–08; Prompt 03 leaves them visible only as nav
  rail entries plus bento demo cards in the `'preview'` state.
- **No new reusable primitives in `@hbc/ui-kit`** (per W2-ODR-018). All
  new components live in `apps/project-control-center/`.
- **No promotion to `packages/spfx`.** Continues the Prompt 02 deviation
  from the Project Sites split pattern.
- **No `PCC_FIXTURES` consumption.** Header context comes from a tiny
  local `PCC_PROJECT_PLACEHOLDER` (display-only, not a record).

## Forward Look (informational only — no work performed here)

Subsequent Wave 2 prompts will:

- Implement individual MVP surfaces (Project Home, Team & Access,
  Documents, Project Readiness, Approvals, External Systems, Control
  Center Settings, Site Health) inside the bento grid using the footprint
  contract established here.
- Wire `PccPreviewState` instances to actual surface conditions
  (`'empty'`, `'missing-config'`, `'unauthorized-persona'`, etc.).
- Hook fixture data from `@hbc/models/pcc/fixtures` (`PCC_FIXTURES`,
  `SAMPLE_*` exports) into surface contents.
- Continue the no-runtime / no-tenant / no-deployment posture until Wave 3
  formally introduces those concerns.

Nothing above the "Forward Look" line constitutes execution beyond
Prompt 03 scope.

---

## Prompt 03 — Corrective Follow-up

**Date:** 2026-04-29
**Status:** Complete

### Corrective commit summary

`fix(spfx-project-control-center): wire PccDashboardCard children to PccBentoGrid (Wave 2 / Prompt 03 corrective)`

Wires the integrated PCC shell so that `PccDashboardCard` instances are
direct children of `[data-pcc-bento-grid]`, restoring the bento layout in
the live `PccApp`. Also corrects the nav rail posture (no longer renders
disabled buttons) and gives the bento grid a real container measurement
inside `<main data-pcc-canvas>`.

### Root cause

`PccShell` wrapped the entire shell layout in `<PccBentoGrid>`, so the
grid's only direct child was `<div className={styles.layout}>`. CSS Grid
positions only direct children, so the `gridColumn`/`gridRow` styles set
by `PccDashboardCard` were inert because the cards lived three nodes
deeper inside `<main className={styles.canvas}>` (`display: block`).
A second consequence: `PccBentoGrid`'s `ResizeObserver` measured
shell-outer width, not canvas width, so the cards were not really
container-aware.

### Fix shape

```text
<div data-pcc-shell data-pcc-shell-mode={shellMode}>     // PccShell — own useContainerBreakpoint()
  <div data-pcc-layout>
    <PccNavigationRail mode={shellMode} />               // mode by prop (not context)
    <div .workArea>
      <PccProjectIntelligenceHeader mode={shellMode} />  // mode by prop (not context)
      <main data-pcc-canvas>                              // padded; NOT a grid
        <PccBentoGrid forceMode={forceMode}>              // own useContainerBreakpoint() — measures canvas
          {children}                                      // PccDashboardCard direct children of grid
        </PccBentoGrid>
      </main>
    </div>
  </div>
</div>
```

`PccDashboardCard` continues to consume `usePccBentoContext()`. The bento
grid is still its provider — just at the correct DOM position.

### Files modified

| File | Change |
| --- | --- |
| `apps/project-control-center/src/shell/PccShell.tsx` | Stopped wrapping the shell layout in `<PccBentoGrid>`. Added a shell-level `useContainerBreakpoint()`; derived `shellMode = forceMode ?? measured`; passes `mode={shellMode}` to rail and header; passes `forceMode={forceMode}` to bento grid. Attached the shell-level `ref` to the shell root. Moved `<PccBentoGrid>{children}</PccBentoGrid>` inside `<main data-pcc-canvas>`. Added `data-pcc-shell-mode={shellMode}` for diagnostic clarity. |
| `apps/project-control-center/src/shell/PccNavigationRail.tsx` | Replaced `forceMode` prop + `usePccBentoContext()` with required `mode: PccResponsiveMode` prop. Added module-scope `const NAV_NOOP = (): void => undefined;`. Removed `disabled` from surface buttons; added `onClick={NAV_NOOP}`. Kept `type="button"`. Kept `aria-current="page"` only on the active surface. |
| `apps/project-control-center/src/shell/PccNavigationRail.module.css` | `.surfaceButton` cursor switched from `not-allowed` to `pointer`. Active row keeps its existing emphasis. |
| `apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx` | Replaced `forceMode` prop + `usePccBentoContext()` with required `mode: PccResponsiveMode` prop. Header CSS unchanged. |
| `apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx` | NEW — three-case regression test (verbatim below). |

No other files were modified by this corrective. `PccBentoGrid.tsx`,
`PccDashboardCard.tsx`, `PccApp.tsx`, `PccShell.module.css`, and all
other tests are unchanged.

### New regression test (verbatim)

```ts
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PccApp } from '../PccApp';

describe('PccApp bento integration (regression)', () => {
  it('every dashboard card is a direct child of the bento grid', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid, 'bento grid should render').not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(
        card.parentElement === grid,
        `card '${card.getAttribute('data-pcc-footprint')}' must be a direct child of the bento grid`,
      ).toBe(true);
    }
  });

  it('hero / wide / standard cards under the grid have non-zero column span and inline gridColumn', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    expect(grid).not.toBeNull();
    for (const footprint of ['hero', 'wide', 'standard'] as const) {
      const card = grid.querySelector(`[data-pcc-card][data-pcc-footprint="${footprint}"]`) as HTMLElement | null;
      expect(card, `'${footprint}' demo card should render under the grid`).not.toBeNull();
      const declared = Number(card!.getAttribute('data-pcc-column-span'));
      expect(declared).toBeGreaterThan(0);
      expect(card!.style.gridColumn).toMatch(/^span \d+/);
    }
  });

  it('renders without forceMode and still mounts the bento grid', () => {
    const { container } = render(<PccApp />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
  });
});
```

### Updated test totals

Pre-corrective: **48 passed across 5 files**.
Post-corrective: **51 passed across 6 files** (3 new bento-integration cases).

### Validation command results

| Command | Result |
| --- | --- |
| `git status --short` | Clean for the corrective scope. Pre-existing modifications to `CLAUDE.md` and `.claude/settings.local.json` were already present before this corrective and are not part of the commit. |
| `pnpm --filter @hbc/spfx-project-control-center check-types` | **PASS** |
| `pnpm --filter @hbc/spfx-project-control-center build` | **PASS** — `vite v6.4.1`, 2147 modules transformed; emits `dist/project-control-center-app.js` (167.70 kB · gzip 54.00 kB) and `dist/spfx-project-control-center.css` (10.61 kB · gzip 2.27 kB). Bundle was **not** packaged into `.sppkg` and **not** deployed. |
| `pnpm --filter @hbc/spfx-project-control-center test` | **PASS** — 51/51 across 6 files. |
| `pnpm --filter @hbc/spfx-project-control-center lint` | **PASS** — eslint clean. |

### Lockfile status

`pnpm-lock.yaml` is **unchanged**. MD5 hash before and after the corrective:
`c56df7b79986896624536aab74d609f4` (identical). `git diff --stat
pnpm-lock.yaml` reports no diff. No `pnpm install`, `pnpm add`, or
`pnpm update` was run during the corrective.

### Container measurement precision

After this corrective:

- The **bento card grid** measures its own DOM container (the `<main
  data-pcc-canvas>` inline-size) via its own `useContainerBreakpoint()`
  call. This is the correct container for card layout.
- The **shell chrome** derives its responsive mode from a separate,
  shell-level `useContainerBreakpoint()` call attached to the shell root.
  Rail-variant and header-layout decisions consume this shell-level mode.
- `forceMode` remains a test-only override that flows from `PccApp` →
  `PccShell` → `PccBentoGrid`. When set, both the shell chrome and the
  bento grid resolve to the same forced mode.
- When `forceMode` is unset, the shell and the bento grid each derive
  their own mode independently from their own container measurement.

### Explicit no-scope-change confirmations

- **`packages/spfx`:** untouched.
- **SPFx manifests / `package-solution.json` / `.sppkg` / app-catalog packaging / deployment scripts:** none introduced.
- **Backend / Azure Functions / provisioning / template packages:** untouched.
- **Graph / PnP / Procore / auth integrations:** none introduced. `tests/pcc-import-guards.test.ts` continues to assert this.
- **CI/CD workflow files:** untouched.
- **Package, solution, or manifest version bumps:** none. `apps/project-control-center/package.json` version remains `0.0.1`.
- **`pnpm-lock.yaml`:** unchanged (MD5 identical pre/post).
- **`PCC_FIXTURES` consumption:** none.
- **Per-surface module UI (Project Home contents, Documents, Approvals execution, etc.):** not implemented; deferred to Prompts 04–08.
- **Homepage paired-row layout import / copy / adaptation:** none. `tests/pcc-import-guards.test.ts` continues to assert this.
- **New components:** only the regression test file. No new tokens, dependencies, icons, or `@hbc/ui-kit` API additions.
