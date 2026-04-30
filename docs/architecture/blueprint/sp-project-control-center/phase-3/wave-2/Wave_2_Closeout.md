# Phase 3 — Wave 2 Closeout

**Phase:** 3
**Wave:** 2
**Status:** Complete (preview frame; no live operations)
**Date:** 2026-04-30
**Closeout commit base (HEAD short):** `7f26798a1`
**Closeout commit base parents (most recent first):**

```text
7f26798a1 docs(pcc): align preview-state catalog comment to eight states
218eac1e6 feat(pcc): harden prompt 08 preview states and runtime guards
2b2f93001 feat(spfx-project-control-center): add document control model metadata and preview frames
9dd7ae78f feat(pcc): implement wave 2 prompt 07 preview surfaces and tests
c0e7d3105 Finalize Document Control lane/action model alignment and export parity
```

## Executive Summary

Wave 2 delivers the Project Control Center SPFx app shell frame, UI/UX
basis, flexible bento layout, MVP surface navigation, Project Home
preview dashboard, eight per-region preview/fallback states (W2-ODR-009),
and source-level no-runtime guard tests. Every visible region is
fixture-driven and reads exclusively from `@hbc/models/pcc`. There is no
live backend, no tenant runtime, no Microsoft Graph / PnP / SharePoint
REST runtime, no Procore / Document Crunch / Adobe Sign runtime, no
authentication runtime, no scanner, no repair runner, no approval
execution, no permission mutation, and no deployment artifact. The
verbatim Wave 2 readiness statement appears once, as the final paragraph
of this document.

## Per-Prompt Closeout Index

Wave 2 governance and per-prompt artifacts already on disk in this
directory. Each is the authoritative record for its scope; this master
closeout cross-references rather than re-narrates.

**Governance:**

- `Wave_2_Repo_Truth_Audit.md`
- `Wave_2_Scope_Lock.md`
- `Wave_2_Decision_Closure_Register.md`
- `Wave_2_UIUX_Basis_of_Design.md`
- `Wave_2_Wireframe_and_Layout_Contract.md`

**Per-prompt closeouts:**

- `Wave_2_Prompt_02_Closeout.md` — SPFx app scaffold (`6994f29ca`)
- `Wave_2_Prompt_03_Closeout.md` — shell visual frame + bento layout (`7aa5ac9b4`, corrective `ac2c63390`)
- `Wave_2_Prompt_04_Closeout.md` — MVP surface navigation + `PccShellState` (`5b5e8a385`)
- `Wave_2_Prompt_05_Closeout.md` — Project Home bento dashboard (`2b861a8fb`)
- `Wave_2_Prompt_06_Closeout.md` — Document Control model + Documents/External Systems/Site Health surfaces (`2b2f93001`, model alignment landed upstream in `c0e7d3105`)
- `Wave_2_Prompt_07_Closeout.md` — Team & Access surface + remaining placeholder surfaces (`9dd7ae78f`)
- `Wave_2_Prompt_08_Closeout.md` — preview-state hardening + runtime guards (`218eac1e6`, comment cleanup `7f26798a1`)

**Mid-wave correction closeouts:**

- `Wave_2_Document_Control_Architecture_Correction_Closeout.md`
- `Wave_2_Document_Control_Model_Alignment_Closeout.md`
- `Wave_2_Team_Access_Model_Alignment_Closeout.md`

## Implemented Files (Final Inventory)

`apps/project-control-center/src/`:

- `shell/`: `PccShell`, `PccNavigationRail`, `PccProjectIntelligenceHeader`, `PccCommandSearch`, `PccSurfaceRouter`
- `layout/`: `PccBentoGrid`, `PccDashboardCard`, `footprints.ts`, `useBentoRowSpan.ts`, `useContainerBreakpoint.ts`
- `ui/`: `PccStatusPill`, `PccPreviewState` (eight W2-ODR-009 states after Prompt 08)
- `state/`: `usePccShellState`
- `preview/`: `projectPlaceholder`
- `surfaces/projectHome/`: ten fixture-driven cards (Prompt 05) including the corrected two-lane Document Control card (Prompt 06)
- `surfaces/documents/`: header + two Microsoft-lane source cards + three external-document-system cards
- `surfaces/externalSystems/`: header + one tile per `EXTERNAL_SYSTEM_CATALOG` entry
- `surfaces/siteHealth/`: overview + checks + drift + non-operational repair-requests placeholder
- `surfaces/teamAccess/`: header + three lane cards (viewer / permission-request / access-manager)
- `surfaces/approvals/`, `surfaces/controlCenterSettings/`, `surfaces/projectReadiness/`: Prompt 07 placeholder surfaces
- `tests/`: 15 test files (count from the live runner, see Validation below)

`packages/models/src/pcc/`:

- Wave 1 read-model contracts unchanged.
- `DocumentControl.ts` extended additively with two-lane vocabulary (`DocumentControlLane`, `DocumentControlActionId`, `IDocumentControlAction`, `DOCUMENT_CONTROL_ACTIONS`, plus required fields on `IDocumentControlSource`) — landed in commit `c0e7d3105`.
- `TeamAccess.ts` introduced for Team & Access preview lanes (Prompt 07 model alignment) — landed in commits `b5300c357` and `9dd7ae78f` companions.

## Package and Scripts

- Package: `@hbc/spfx-project-control-center@0.0.1` (private, ESM)
- Scripts: `build`, `check-types`, `lint`, `test`, `dev`
- Build: Vite 6 IIFE library mode → `dist/project-control-center-app.js`; the bundle exposes `window.__hbIntel_projectControlCenter.{ mount, unmount }` for future SharePoint host wiring.
- The bundle is **not** packaged into `.sppkg`. The bundle is **not** published. The bundle is **not** deployed.

## Basis-of-Design Handling

The saved asset at `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`
is treated as governing visual direction, not a pixel-perfect specification.
Cue mapping:

| Basis-of-design cue | Component | Token bridge |
| --- | --- | --- |
| Dark navy "Project Intelligence" header | `PccProjectIntelligenceHeader` | `HBC_DARK_HEADER`, `HBC_HEADER_TEXT`, `HBC_HEADER_ICON_MUTED` |
| HB-orange application navigation rail | `PccNavigationRail` | `HBC_ACCENT_ORANGE` (+ hover/pressed) |
| Compact command/search area | `PccCommandSearch` | header surface tokens + `Search` icon |
| Floating summary cards | `PccDashboardCard` | `HBC_SURFACE_LIGHT['surface-0']`, `elevationCard`, `HBC_RADIUS_MD` |
| Tight bento/masonry grid | `PccBentoGrid` + `useBentoRowSpan` + `useContainerBreakpoint` | CSS Grid; measured row spans; **no** `grid-auto-flow: dense` |
| Status pills next to project title | `PccStatusPill` | `HBC_STATUS_RAMP_*` |
| Light operational canvas | `PccShell` canvas | `HBC_SURFACE_LIGHT['surface-2']` |

## Flexible Layout Contract

CSS Grid with measured row spans. Per-card row span is computed by
`useBentoRowSpan` (ResizeObserver, `Math.ceil((measuredHeight + gap) / (rowUnit + gap))`).
Active responsive mode is derived from a real container measurement by
`useContainerBreakpoint` so per-surface footprints adapt to canvas width
rather than viewport-hardcoded breakpoints. Footprints are
`hero | wide | standard | compact | tall | full`. The grid never sets
`grid-auto-flow: dense`. CSS columns are not used. The legacy
`hb-intel-homepage` paired-row layout is **not** imported, copied, or
adapted (asserted by the no-runtime guard).

Asserted by `tests/PccApp.bentoIntegration.test.tsx`,
`tests/PccBentoGrid.footprints.test.tsx`, and the no-runtime guard at
`tests/pcc-import-guards.test.ts`.

## MVP Surface Navigation Coverage

All eight `PCC_MVP_SURFACE_IDS` are wired through `PccNavigationRail` and
`PccSurfaceRouter`. State is held in `usePccShellState` with the literal
`previewMode: true` and an optional `selectedProjectId?` for future Wave 3
use. Roving keyboard focus on the rail (ArrowUp / ArrowDown / Home / End
move focus only); `Enter` / `Space` activate. `aria-current="page"` marks
the active surface. Asserted by `tests/PccShell.navigation.test.tsx` and
`tests/usePccShellState.test.ts`.

## Project Home Bento Dashboard Coverage

Project Home renders ten fixture-driven cards mapped to the
basis-of-design composition: Project Intelligence (`hero`), Priority
Actions (`tall`), Site Health Summary (`standard`), Document Control
Center (`wide`, two-lane summary after Prompt 06), Project Readiness
(`standard`), Approvals & Checkpoints (`standard`), External Systems
(`standard`), Team Snapshot (`compact`), Missing Configurations
(`compact`), Recent Activity (`tall`). Priority tone is derived from the
existing `IPriorityAction.severity` field (no `priority` field invented;
`Blocking | Security Risk | Repair Required → high`, `Warning → medium`,
`Info → low`, `undefined → medium`). Asserted by
`tests/PccProjectHome.test.tsx` and `tests/PccProjectHome.states.test.tsx`.

## Preview / Fallback State Coverage

`PccPreviewState` ships the eight W2-ODR-009 states established across
Prompts 03 and 08:

| State | Tone | Notable a11y posture |
| --- | --- | --- |
| `preview` | info | — |
| `empty` | neutral | — |
| `loading` | neutral | `aria-busy="true"` + pulse marker |
| `error` | danger | `role="alert"` |
| `missing-config` | warning | — |
| `unavailable-fixture` | neutral | — |
| `unauthorized-persona` | warning | — |
| `not-yet-implemented-operation` | neutral | (added in Prompt 08 for deferred operations) |

Each variant emits a unique `data-pcc-state` plus a `data-pcc-state-tone`
marker. Default-copy strings are product-safe (no implementation-
sequencing language). Asserted by `tests/PccPreviewState.states.test.tsx`.

## No-Runtime Guard Coverage

`tests/pcc-import-guards.test.ts` runs in two distinct scanning modes:

1. **Module-specifier extraction.** Scans `import` / `export … from '…'`
   specifiers from comment-stripped raw source. The specifier strings
   themselves are preserved during this pass so package paths can be
   matched. Asserted absent: homepage paired-row barrel
   (`@hbc/ui-kit/homepage`, `@hbc/homepage-launcher`, `apps/hb-homepage`),
   auth runtime (`@hbc/auth`), SPFx HTTP runtime (`@microsoft/sp-http`),
   Microsoft Graph runtime package (`@microsoft/microsoft-graph-client`),
   PnP (`@pnp/sp`), Procore SDKs (`procoreApi`, `procore-sdk`).

2. **Executable-seam scanning.** Uses fully stripped executable code
   (comments + string literals removed) to assert no occurrence of
   identifier-level runtime construction patterns: homepage paired-row
   exports (`HbcHomepageSectionShell`, `HbcHomepageActionRow`,
   `HbcHomepageMetadataRow`, plus all eleven homepage surface exports
   `HbcSignatureHeroSurface | HbcCommandSurface | HbcLauncherSurface |
   HbcDiscoverySurface | HbcEditorialSurface | HbcOperationalSurface |
   HbcSafetyHomepageSurface | HbcPeopleCultureSurface |
   HbcProjectSpotlightSurface | HbcNewsroomSurface |
   HbcPriorityRailSurface`); auth runtime functions (`bootstrapSpfxAuth`,
   `resolveSpfxPermissions`); Microsoft Graph runtime classes
   (`MSGraphClient`, `GraphServiceClient`); PnP / SharePoint REST
   patterns (`sp.web`, `_api/web`); Procore / Document Crunch / Adobe Sign
   SDK clients (`ProcoreClient`, `DocumentCrunchClient`, `AdobeSignClient`).

Bare product names (`Graph`, `Procore`, `Document Crunch`, `Adobe Sign`)
appear in legitimate JSX text on the new surfaces and are intentionally
**not** added to either scan. Guarding them would create false positives
on legitimate product copy.

## Validation Command Results

Captured verbatim from the live Prompt 09 validation run on top of HEAD
`7f26798a1`. Pre-validation `pnpm-lock.yaml` MD5:
`c56df7b79986896624536aab74d609f4`.

| Command | Result |
| --- | --- |
| `git status --short` | Clean for the Prompt 09 scope (only the pre-existing `.claude/settings.local.json` modification, which is excluded from the commit). |
| `pnpm --filter @hbc/models check-types` | **PASS** |
| `pnpm --filter @hbc/models test` | **PASS** — `Test Files 30 passed (30)`, `Tests 220 passed (220)` |
| `pnpm --filter @hbc/spfx-project-control-center check-types` | **PASS** |
| `pnpm --filter @hbc/spfx-project-control-center build` | **PASS** — `vite v6.4.1`, 2194 modules transformed; emits `dist/project-control-center-app.js` (222.13 kB · gzip 66.22 kB) and `dist/spfx-project-control-center.css` (20.98 kB · gzip 3.82 kB). The bundle is **not** packaged into `.sppkg` and **not** deployed. |
| `pnpm --filter @hbc/spfx-project-control-center test` | **PASS** — `Test Files 15 passed (15)`, `Tests 173 passed (173)` |
| `pnpm --filter @hbc/spfx-project-control-center lint` | **PASS** — eslint clean |

`@hbc/spfx` was **not** touched in Wave 2 / Prompt 09, so its
package-scoped commands are not run, per the prompt's "If `@hbc/spfx`
exports were touched" conditional.

Post-validation `pnpm-lock.yaml` MD5: `c56df7b79986896624536aab74d609f4` —
**identical** to pre-validation. No `pnpm install`, `pnpm add`, or
`pnpm update` was run during Prompt 09. No `package.json` was edited.
No new direct dependencies.

## Deferred Wave 3 Backend / Read-Model Items

Explicitly out of Wave 2 scope; tracked here so Wave 3 starts from a
known list:

- Live Microsoft Graph–backed Document Control file operations. Every
  action ships with `executionState: 'preview-disabled'`; `'enabled'`
  exists in the type for future use only and is not branched on at
  runtime. The lane requires a per-action permission posture, conditional
  access, app-only vs delegated-token decisions, and a tenant consent /
  security review before any `'enabled'` action ships.
- Live Site Health scanner + repair runner. Wave 2 renders fixture-driven
  summary, checks, drift, and a non-operational repair-requests
  placeholder; the repair-requests card body has zero `<button>` elements.
- Live external-system launch links + missing-config remediation flows
  (External Systems surface).
- Live approval execution and workflow transitions (Approvals surface,
  Approvals & Checkpoints card on Project Home).
- Live Team & Access permission requests, access-manager actions, and
  audience-state changes (Team & Access surface).
- Live read-model wiring to backend services. Wave 2 reads 100% from
  `@hbc/models/pcc` fixtures.
- Tenant-side configuration, app catalog publication, and CI/CD workflow
  changes for the SharePoint deploy path.
- Hosted SPFx parity proof. Wave 2 ships an IIFE bundle but it is not
  packaged or deployed; hosted-runtime evidence is operator-pending and
  must be captured against a real SharePoint host before any release.
- Canonical team-member fixture in `@hbc/models/pcc`. Wave 2 currently
  uses `apps/project-control-center/src/surfaces/projectHome/teamSnapshotPlaceholder.ts`
  as the only app-local presentation fixture (rationale: Wave 1 has no
  team-member fixture). When a canonical fixture lands, the placeholder
  module is removed and the Team Snapshot card switches to the canonical
  source.

## Forbidden Closeout Claims (Explicit Non-Claims)

This closeout makes none of the following claims:

- A live backend read model exists.
- Tenant calls were made or tested.
- A Procore integration exists.
- Access requests execute.
- Approvals execute.
- Site Health scans or repairs run.
- The package was deployed.
- The app catalog was updated.
- A hosted SPFx parity proof exists.
- A version bump was performed.

## Explicit No-Touch Confirmations

- `packages/spfx`: untouched.
- SPFx manifests / `package-solution.json` / `.sppkg` / app-catalog packaging / deployment scripts: none introduced.
- Backend / Azure Functions / provisioning / template packages: untouched.
- CI/CD workflow files: untouched.
- Microsoft Graph / PnP / SharePoint REST / OneDrive runtime: none (guard-asserted).
- Procore / Document Crunch / Adobe Sign API / runtime / SDK / secrets / sync / mirror / write-back paths: none (guard-asserted).
- `@hbc/auth` / live auth integrations: none (guard-asserted).
- Tenant reads / real authorization: none.
- `<a href>` launch behavior on fixture URLs: none (guard-asserted in surface tests).
- `window.open` or router navigation: none.
- Document-management workflow execution (upload / download / copy-link / open / approval): rendered as **disabled chips with no executable handler** only.
- Scanner / repair runner / Graph probe / PnP probe / tenant probe / backend persistence: none.
- Homepage paired-row layout import / copy / adaptation: none (guard-asserted).
- Reintroduction of disabled rail buttons: none (Prompt 04 invariant preserved).
- Package, solution, or manifest version bumps: none. `apps/project-control-center/package.json` version remains `0.0.1`. The trailing instruction in Prompt 09's user prompt to "bump the appropriate manifest version" is not honored — no manifest exists in this scaffold and Wave 2 scope-lock W2-ODR-003 plus every per-prompt forbidden-work clause have prohibited version bumps throughout Wave 2; resolved consistently in favor of "no version bump."
- `pnpm-lock.yaml`: unchanged (MD5 identical pre/post Prompt 09).
- New `@hbc/ui-kit` API additions, new tokens, new icons, new dependencies: none.

## Wave 3 Readiness Gate

Before Wave 3 introduces live operations, the following must land:

- A Graph-backed implementation plan with per-action permission posture, conditional-access posture, and an app-only vs delegated-token decision.
- An authorization model + tenant consent review + security review.
- Backend read-model contracts (likely `@hbc/spfx`-mediated) replacing the Wave 1 fixture seam.
- A hosted SPFx parity proof against a real SharePoint host.
- An app catalog publication strategy + version bump cadence.
- CI/CD workflow changes for the tenant deploy path.

---

Phase 3 Wave 2 is complete when the PCC SPFx shell frame, UI/UX basis, flexible bento layout, MVP surface navigation, preview dashboard cards, fallback states, and no-runtime guard tests are implemented and documented. The shell is ready for Wave 3 backend read-model planning, but it is not a live operational PCC release.
