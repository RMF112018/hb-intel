# @hbc/spfx-project-control-center

Wave 2 scaffold for the PCC (Project Control Center) SPFx app. Establishes
the dedicated app target at `apps/project-control-center/` with a Vite-IIFE
mount entry, a preview-only root component (`PccApp`), and a minimal test
skeleton.

## Scope

- **Wave 2 / Prompt 02**: safe app scaffold only.
- **No** SPFx webpart manifest, **no** `package-solution.json`, **no**
  app-catalog packaging.
- **No** Graph/PnP, **no** Procore runtime, **no** tenant mutation, **no**
  backend/provisioning.
- **No** version bumps.
- **No** full PCC UI (no bento dashboard, priority actions, launch cards,
  workflow panels, approvals execution, document workflows, Site Health
  scanning, or access execution). Those land in subsequent Wave 2 prompts.
- Fixture-driven preview only. The 8 MVP surface labels render directly from
  `@hbc/models/pcc` (`PCC_MVP_SURFACES`).

## File Tree

```text
apps/project-control-center/
├── .eslintrc.cjs
├── README.md
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── src/
    ├── PccApp.tsx
    ├── PccApp.test.tsx
    ├── mount.tsx
    ├── preview.tsx
    ├── test-setup.ts
    ├── shell/
    │   ├── PccShell.{tsx,module.css}
    │   ├── PccNavigationRail.{tsx,module.css}
    │   ├── PccProjectIntelligenceHeader.{tsx,module.css}
    │   └── PccCommandSearch.tsx
    ├── layout/
    │   ├── PccBentoGrid.{tsx,module.css}
    │   ├── PccDashboardCard.{tsx,module.css}
    │   ├── footprints.ts
    │   ├── useBentoRowSpan.ts
    │   └── useContainerBreakpoint.ts
    ├── ui/
    │   ├── PccStatusPill.{tsx,module.css}
    │   └── PccPreviewState.{tsx,module.css}
    ├── preview/
    │   └── projectPlaceholder.ts
    └── tests/
        ├── pcc-import-guards.test.ts
        ├── PccBentoGrid.footprints.test.tsx
        ├── PccPreviewState.states.test.tsx
        └── PccShell.responsive.test.tsx
```

## Visual Direction

The PCC shell visual frame is governed by the saved basis-of-design asset:

- **Basis of design:** [`docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`](../../docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png)

This asset is treated as governing visual direction, not a pixel-perfect
specification. The mapping below shows how the image's cues land in
Prompt 03 components:

| Basis-of-design cue | Component | Token bridge |
| --- | --- | --- |
| Dark navy "Project Intelligence" header | `PccProjectIntelligenceHeader` | `HBC_DARK_HEADER`, `HBC_HEADER_TEXT`, `HBC_HEADER_ICON_MUTED` |
| HB-orange application navigation rail | `PccNavigationRail` | `HBC_ACCENT_ORANGE` (+ hover/pressed) |
| Compact command/search area | `PccCommandSearch` | header surface + `Search` icon from `@hbc/ui-kit/icons` |
| Floating summary cards | `PccDashboardCard` | `HBC_SURFACE_LIGHT['surface-0']`, `elevationCard`, `HBC_RADIUS_MD` |
| Tight bento/masonry grid | `PccBentoGrid` + `useBentoRowSpan` + `useContainerBreakpoint` | CSS Grid with measured row spans, no `grid-auto-flow: dense` |
| Status pills next to project title | `PccStatusPill` | `HBC_STATUS_RAMP_*` ramp tokens |
| Light operational canvas | `PccShell` canvas | `HBC_SURFACE_LIGHT['surface-2']` |

## Components

| Component | Role |
| --- | --- |
| `PccShell` | Top-level shell: stamps theme tokens as CSS variables, hosts the bento context, composes rail + header + canvas |
| `PccNavigationRail` | HB-orange rail listing all 8 `PCC_MVP_SURFACES`; active surface marker; rail variants `expanded`/`iconOnly`/`topStrip`/`hamburger` |
| `PccProjectIntelligenceHeader` | Dark-navy header band with project title, subtitle, search slot, status pill cluster, date scope |
| `PccCommandSearch` | Header search affordance (display-only; non-functional in Wave 2) |
| `PccBentoGrid` | CSS Grid container with `container-type: inline-size`, exposes a context for footprint resolution |
| `PccDashboardCard` | Per-card wrapper that emits `data-pcc-footprint` and applies measured row span via `useBentoRowSpan` |
| `PccStatusPill` | Small status pill primitive with five tones (info / success / warning / danger / neutral), filled / outline |
| `PccPreviewState` | All seven W2-ODR-009 region states (preview / empty / loading / error / missing-config / unavailable-fixture / unauthorized-persona) with distinct `data-pcc-state` markers |

## Footprint Contract

Card footprints come from `PCC_CARD_FOOTPRINTS = ['hero', 'wide', 'standard', 'compact', 'tall', 'full']`.
Column spans per responsive mode:

| Footprint | wideDesktop | standardDesktop | tabletLandscape | tabletPortrait | phone |
| --- | --- | --- | --- | --- | --- |
| `hero` | 8 | 6 | 4 | 2 | 1 |
| `wide` | 6 | 5 | 3 | 2 | 1 |
| `standard` | 4 | 3 | 2 | 1 | 1 |
| `compact` | 3 | 2 | 2 | 1 | 1 |
| `tall` | 4 | 3 | 2 | 1 | 1 |
| `full` | 12 | 8 | 6 | 2 | 1 |

Row span is measured per card via `ResizeObserver` with
`Math.ceil((measuredHeight + gap) / (rowUnit + gap))` over an 8 px row unit
and a 16 px gap. No `grid-auto-flow: dense`. CSS columns are not used.

## Responsive Modes

`useContainerBreakpoint` derives the active mode from the bento grid's
**container** inline-size (not viewport-hardcoded), via `ResizeObserver` and
container-query positioning:

| Mode | Container width | Columns | Rail variant | Header behavior |
| --- | --- | --- | --- | --- |
| `wideDesktop` | ≥ 1280 px | 12 | `expanded` | full pill cluster + date scope + expanded search |
| `standardDesktop` | 1024–1279 | 8 | `expanded` | trimmed pill cluster + expanded search |
| `tabletLandscape` | 720–1023 | 6 | `iconOnly` | search collapses to icon affordance |
| `tabletPortrait` | 480–719 | 2 | `topStrip` | title + pill row, no date scope |
| `phone` | < 480 | 1 | `hamburger` | title only, search and pills hidden |

## State Catalog (W2-ODR-009)

`PccPreviewState` renders all seven required states; later prompts wire them
to surface conditions. Each variant emits a unique `data-pcc-state` marker
plus a `data-pcc-state-tone` for visual contract:

| `state` | Tone | Use |
| --- | --- | --- |
| `preview` | info | Default for all Wave 2 fixture-driven regions |
| `empty` | neutral | No records match scope |
| `loading` | neutral | Read-model loading; renders `aria-busy` + pulse |
| `error` | danger | Read-model failure; renders `role="alert"` |
| `missing-config` | warning | Required configuration not set |
| `unavailable-fixture` | neutral | Module wired in a later wave |
| `unauthorized-persona` | warning | Persona has no access |

## Design Decisions

### PccApp lives in this app, not in `packages/spfx`

Prompt 02 lists `src/PccApp.tsx` explicitly and instructs that
`packages/spfx/src/webparts/projectControlCenter/` should not be created
unless necessary. Wave 2 is preview-only with no webpart manifest, so a
package-level export barrel is not required. The root component therefore
lives at `src/PccApp.tsx` here. When a real webpart manifest is introduced
in a later wave, the component may be promoted to `packages/spfx` if
package-oriented import discipline is required at that point.

### No auth bootstrap, no live runtime

Unlike `apps/project-sites/src/mount.tsx`, this scaffold's `mount()`
does **not** import `@hbc/auth/spfx`, does **not** call `bootstrapSpfxAuth`
or `resolveSpfxPermissions`, and does **not** create a `QueryClient`. Those
concerns belong with the eventual webpart manifest, not with the scaffold.
`mount(el, spfxContext?, config?)` accepts an optional `spfxContext`
parameter strictly for forward compatibility; the parameter is unused.

### CSS modules + theme tokens (no Griffel, no hex)

Visual cues are expressed in plain CSS modules that consume CSS custom
properties stamped at the `PccShell` root from `@hbc/ui-kit/theme` exports
(colors, radii, spacing, elevation, status ramps). Griffel is intentionally
avoided to keep the dependency surface minimal. No hex literals appear in
Prompt 03 CSS — every value comes from a verified theme export.

## Local Preview

```bash
pnpm --filter @hbc/spfx-project-control-center dev
```

This starts the Vite dev server, which loads `index.html` → `src/preview.tsx`
→ `mount()`. The preview reads PCC surface metadata from `@hbc/models/pcc`
and renders the 8 MVP surface labels. There is no SharePoint context, no
auth, and no network I/O.

## Validation Commands

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center lint
```

The `build` script emits an IIFE bundle at
`dist/project-control-center-app.js` exposing
`window.__hbIntel_projectControlCenter.{ mount, unmount }` for future
SPFx host wiring. The bundle is not packaged into an `.sppkg` and is not
deployed.

## Governing References

- Wave 2 README:
  `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/README.md`
- Decision Closure Register:
  `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/01_Wave_2_Decision_Closure_Register.md`
- UI/UX basis of design:
  `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`
- Wireframe & layout contract:
  `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/03_PCC_UI_Wireframe_and_Flexible_Layout_Contract.md`
- Scope lock:
  `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/04_Wave_2_Scope_Lock_Implementation_Boundaries.md`
- Wave 1 closeout (PCC shared foundations):
  `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Closeout.md`

## Prerequisites Verified by Wave 2 Governance

Prompt 02 prerequisites are satisfied through the committed Wave 2
governance docs, which together cover Prompt 01's verification scope:

| Prerequisite | Source |
| --- | --- |
| Wave 1 closeout present | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Closeout.md` |
| Basis-of-design image exists | `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png` |
| Target = `apps/project-control-center/` | Decision W2-ODR-001 (frozen), Wave 2 README, scope lock |
| `apps/project-control-center/` not yet present (correct prerequisite state) | Resolved by this scaffold |
| Allowed/forbidden file boundaries locked | `04_Wave_2_Scope_Lock_Implementation_Boundaries.md` |
| `@hbc/models/pcc` exposes `PCC_MVP_SURFACES`, `PCC_MVP_SURFACE_IDS` | `packages/models/src/pcc/PccMvpSurfaces.ts` (Wave 1) |
