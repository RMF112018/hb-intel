# @hbc/spfx-project-control-center

PCC (Project Control Center) SPFx app — **Wave 2 complete**. Wave 2
delivers the dedicated app target at `apps/project-control-center/`,
the shell visual frame, the flexible bento layout, all eight MVP
surfaces (Project Home + seven preview surfaces), the eight-state
W2-ODR-009 preview catalog, and source-level no-runtime guards. Every
visible region is fixture-driven from `@hbc/models/pcc`. The app is a
preview frame; it is not a live operational PCC release.

The verbatim Wave 2 readiness statement appears at the bottom of this
file.

## Scope

- **Wave 2 final state.** PCC SPFx app shell + UI/UX basis + flexible
  bento layout + MVP surface navigation + Project Home dashboard +
  preview/fallback states + no-runtime guards.
- **No** SPFx webpart manifest, **no** `package-solution.json`, **no**
  app-catalog packaging, **no** deployment.
- **No** Microsoft Graph / PnP / SharePoint REST runtime.
- **No** Procore / Document Crunch / Adobe Sign runtime, secrets, sync,
  mirror, write-back.
- **No** authentication runtime (no `@hbc/auth` import in this app).
- **No** backend, provisioning, or tenant mutation.
- **No** version bumps; package version remains `0.0.1` for the entire
  Wave 2 sequence.
- Fixture-driven only. Visible regions read from `@hbc/models/pcc`.

For the master Wave 2 record, see
[`Wave_2_Closeout.md`](../../docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Closeout.md).

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
    │   ├── PccCommandSearch.tsx
    │   └── PccSurfaceRouter.tsx
    ├── layout/
    │   ├── PccBentoGrid.{tsx,module.css}
    │   ├── PccDashboardCard.{tsx,module.css}
    │   ├── footprints.ts
    │   ├── useBentoRowSpan.ts
    │   └── useContainerBreakpoint.ts
    ├── ui/
    │   ├── PccStatusPill.{tsx,module.css}
    │   └── PccPreviewState.{tsx,module.css}
    ├── state/
    │   └── usePccShellState.ts
    ├── preview/
    │   └── projectPlaceholder.ts
    ├── surfaces/
    │   ├── projectHome/        (10 fixture-driven cards — Prompt 05; Document Control card remediated in Prompt 06)
    │   ├── documents/          (header + 2 Microsoft-lane + 3 external-lane cards — Prompt 06)
    │   ├── externalSystems/    (header + one tile per EXTERNAL_SYSTEM_CATALOG entry — Prompt 06)
    │   ├── siteHealth/         (overview + checks + drift + non-operational repair-requests — Prompt 06)
    │   ├── teamAccess/         (header + 3 lane cards — Prompt 07)
    │   ├── approvals/          (Prompt 07 placeholder surface)
    │   ├── controlCenterSettings/   (Prompt 07 placeholder surface)
    │   └── projectReadiness/   (Prompt 07 placeholder surface)
    └── tests/
        (15 test files; see Validation below for live counts)
```

## Visual Direction

Governed by the saved basis-of-design asset:

[`docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`](../../docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png)

Treated as governing visual direction, not a pixel-perfect specification.

| Basis-of-design cue | Component | Token bridge |
| --- | --- | --- |
| Dark navy "Project Intelligence" header | `PccProjectIntelligenceHeader` | `HBC_DARK_HEADER`, `HBC_HEADER_TEXT`, `HBC_HEADER_ICON_MUTED` |
| HB-orange application navigation rail | `PccNavigationRail` | `HBC_ACCENT_ORANGE` (+ hover/pressed) |
| Compact command/search area | `PccCommandSearch` | header surface tokens + `Search` icon |
| Floating summary cards | `PccDashboardCard` | `HBC_SURFACE_LIGHT['surface-0']`, `elevationCard`, `HBC_RADIUS_MD` |
| Tight bento/masonry grid | `PccBentoGrid` + `useBentoRowSpan` + `useContainerBreakpoint` | CSS Grid with measured row spans, no `grid-auto-flow: dense` |
| Status pills next to project title | `PccStatusPill` | `HBC_STATUS_RAMP_*` ramp tokens |
| Light operational canvas | `PccShell` canvas | `HBC_SURFACE_LIGHT['surface-2']` |

## Components

| Component | Role |
| --- | --- |
| `PccShell` | Top-level shell: stamps theme tokens as CSS variables, hosts the bento context, composes rail + header + canvas |
| `PccNavigationRail` | HB-orange rail listing all 8 `PCC_MVP_SURFACES`; active surface marker; rail variants `expanded` / `iconOnly` / `topStrip` / `hamburger` |
| `PccProjectIntelligenceHeader` | Dark-navy header band with project title, subtitle, search slot, status pill cluster, date scope |
| `PccCommandSearch` | Header search affordance (display-only; non-functional in Wave 2) |
| `PccSurfaceRouter` | Switches surface content based on `PccShellState.activeSurfaceId` |
| `PccBentoGrid` | CSS Grid container with `container-type: inline-size`; provides bento context |
| `PccDashboardCard` | Per-card wrapper that emits `data-pcc-footprint` and applies measured row span via `useBentoRowSpan` |
| `PccStatusPill` | Small status pill primitive (info / success / warning / danger / neutral; filled / outline) |
| `PccPreviewState` | All eight W2-ODR-009 region states with distinct `data-pcc-state` markers |
| `usePccShellState` | React state hook: `activeSurfaceId`, `previewMode: true`, `selectedProjectId?` |

## Footprint Contract

`PCC_CARD_FOOTPRINTS = ['hero', 'wide', 'standard', 'compact', 'tall', 'full']`.

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
`Math.ceil((measuredHeight + gap) / (rowUnit + gap))` over an 8 px row
unit and a 16 px gap. **No** `grid-auto-flow: dense`. **No** CSS columns.
**No** homepage paired-row layout imports (asserted by the no-runtime
guard).

## Responsive Modes

`useContainerBreakpoint` derives the active mode from the bento grid's
**container** inline-size, not viewport width:

| Mode | Container width | Columns | Rail variant | Header behavior |
| --- | --- | --- | --- | --- |
| `wideDesktop` | ≥ 1280 px | 12 | `expanded` | full pill cluster + date scope + expanded search |
| `standardDesktop` | 1024–1279 | 8 | `expanded` | trimmed pill cluster + expanded search |
| `tabletLandscape` | 720–1023 | 6 | `iconOnly` | search collapses to icon affordance |
| `tabletPortrait` | 480–719 | 2 | `topStrip` | title + pill row, no date scope |
| `phone` | < 480 | 1 | `hamburger` | title only, search and pills hidden |

## State Catalog (W2-ODR-009)

`PccPreviewState` renders all eight required states. Each variant emits
a unique `data-pcc-state` marker plus `data-pcc-state-tone`:

| `state` | Tone | Use |
| --- | --- | --- |
| `preview` | info | Default for fixture-driven regions |
| `empty` | neutral | No records match scope |
| `loading` | neutral | Read-model loading (renders `aria-busy` + pulse) |
| `error` | danger | Read-model failure (renders `role="alert"`) |
| `missing-config` | warning | Required configuration not set |
| `unavailable-fixture` | neutral | Region not yet fixture-backed |
| `unauthorized-persona` | warning | Persona has no access |
| `not-yet-implemented-operation` | neutral | Operation deferred to a later wave (added in Prompt 08) |

## MVP Surfaces (Final Wave 2 State)

All eight `PCC_MVP_SURFACE_IDS` are wired through `PccNavigationRail`
and `PccSurfaceRouter`:

| Surface | Wave 2 implementation |
| --- | --- |
| `project-home` | 10-card bento dashboard (Project Intelligence, Priority Actions, Site Health Summary, Document Control, Project Readiness, Approvals & Checkpoints, External Systems, Team Snapshot, Missing Configurations, Recent Activity). Document Control card uses the corrected two-lane model. |
| `team-and-access` | Header + viewer / permission-request / access-manager lane cards (Prompt 07) |
| `documents` | Header + 2 Microsoft-lane cards (SharePoint Drive, OneDrive — disabled action chips) + 3 external-lane cards (Procore Files, Document Crunch, Adobe Sign — launch / visibility cues) |
| `project-readiness` | Prompt 07 placeholder surface |
| `approvals` | Prompt 07 placeholder surface |
| `external-systems` | Header + one tile per `EXTERNAL_SYSTEM_CATALOG` entry; tri-state (`configured` / `missing` / `unavailable-fixture`) |
| `control-center-settings` | Prompt 07 placeholder surface |
| `site-health` | Overview + checks + drift + non-operational repair-requests placeholder |

## Validation

Live runner output captured during the Wave 2 / Prompt 09 closeout run
(HEAD `7f26798a1`):

| Command | Result |
| --- | --- |
| `pnpm --filter @hbc/models check-types` | **PASS** |
| `pnpm --filter @hbc/models test` | **PASS** — `Test Files 30 passed (30)`, `Tests 220 passed (220)` |
| `pnpm --filter @hbc/spfx-project-control-center check-types` | **PASS** |
| `pnpm --filter @hbc/spfx-project-control-center build` | **PASS** — emits `dist/project-control-center-app.js` (222.13 kB · gzip 66.22 kB) and `dist/spfx-project-control-center.css` (20.98 kB · gzip 3.82 kB) |
| `pnpm --filter @hbc/spfx-project-control-center test` | **PASS** — `Test Files 15 passed (15)`, `Tests 173 passed (173)` |
| `pnpm --filter @hbc/spfx-project-control-center lint` | **PASS** |

The IIFE bundle exposes `window.__hbIntel_projectControlCenter.{ mount, unmount }`
for future SharePoint host wiring. The bundle is **not** packaged into
`.sppkg` and **not** deployed.

## Local Preview

```bash
pnpm --filter @hbc/spfx-project-control-center dev
```

Starts the Vite dev server. Loads `index.html` → `src/preview.tsx` →
`mount()`. The preview reads PCC fixtures from `@hbc/models/pcc` and
renders the Project Home dashboard plus the seven other preview
surfaces under `PccSurfaceRouter`. There is no SharePoint context, no
auth, and no network I/O.

## No-Runtime Posture

`tests/pcc-import-guards.test.ts` runs in two scanning modes (described
in detail in [`Wave_2_Closeout.md`](../../docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Closeout.md#no-runtime-guard-coverage)):

- **Module-specifier extraction** scans `import` / `export … from '…'`
  specifiers from comment-stripped raw source.
- **Executable-seam scanning** scans fully stripped executable code
  (comments + string literals removed) for identifier-level runtime
  construction patterns.

Asserted absent throughout `apps/project-control-center/src/`: homepage
paired-row layout, `@hbc/auth`, `@pnp/sp`, `@microsoft/sp-http`,
`@microsoft/microsoft-graph-client`, `MSGraphClient`, `GraphServiceClient`,
`sp.web`, `_api/web`, Procore SDKs, Document Crunch SDK, Adobe Sign SDK.
Bare product names (`Graph`, `Procore`, `Document Crunch`, `Adobe Sign`)
are intentionally not guarded — they appear in legitimate JSX product
copy.

## Governing References

- Wave 2 README:
  `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/README.md`
- Wave 2 master closeout:
  [`docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Closeout.md`](../../docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Closeout.md)
- Per-prompt closeouts (Prompt 02–08) live alongside the master closeout.
- UI/UX basis of design:
  `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`
- Wireframe & layout contract:
  `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/03_PCC_UI_Wireframe_and_Flexible_Layout_Contract.md`
- Wave 1 closeout (PCC shared foundations):
  `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Closeout.md`

---

Phase 3 Wave 2 is complete when the PCC SPFx shell frame, UI/UX basis, flexible bento layout, MVP surface navigation, preview dashboard cards, fallback states, and no-runtime guard tests are implemented and documented. The shell is ready for Wave 3 backend read-model planning, but it is not a live operational PCC release.
