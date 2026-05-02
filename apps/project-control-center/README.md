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
    ├── api/                    (Wave 3 / Prompt 06 — dormant read-model client boundary)
    │   ├── pccReadModelClient.ts
    │   ├── pccFixtureReadModelClient.ts
    │   ├── pccReadModelStateMapping.ts
    │   └── index.ts
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

## Wave 3 Read-Model Client Boundary (Superseded by Wave 4 Opt-In Below)

> **Wave 4 update.** The boundary is no longer fully dormant. Wave 4 / Prompt 03 introduced a backend HTTP implementation (`pccBackendReadModelClient.ts`) and Prompt 05 wired Project Home as the single opt-in consumer. Default mount/app behavior remains fixture-driven; backend reads occur only when explicit mount config opts in. See **Wave 4 Opt-In Backend Reads (Project Home)** below for the active contract.

Wave 3 / Prompt 06 introduced a typed SPFx read-model client boundary
under `src/api/`. Surfaces remain fixture-driven via direct
`@hbc/models/pcc` imports for Wave 2/3, and the eight W2-ODR-009
preview/fallback states are unchanged.

| Module | Purpose |
| --- | --- |
| `pccReadModelClient.ts` | `IPccReadModelClient` interface + static route-path templates for the seven Wave 3 backend GET routes. No HTTP execution, no base URL resolution, no auth. |
| `pccFixtureReadModelClient.ts` | Default fixture implementation. Returns `mode: 'fixture'` envelopes assembled from existing `@hbc/models/pcc` fixtures. `simulateBackendUnavailable` flag returns `sourceStatus: 'backend-unavailable'` envelopes for unit tests. `viewerPersona` is a passthrough; no derivation, no UI gating. |
| `pccReadModelStateMapping.ts` | Pure helper mapping `PccReadModelSourceStatus` → existing `PccPreviewStateKind`. Not consumed by any surface in this wave. |
| `index.ts` | Barrel; exports the interface, factory, route metadata, and mapping helper. |

A backend HTTP implementation behind `IPccReadModelClient` landed in
Wave 4 / Prompt 03 (`pccBackendReadModelClient.ts`) and is consumed
only by Project Home in explicit opt-in mode (see "Wave 4 Opt-In
Backend Reads" below). The Wave 3 dormancy guard was generalized into
the controlled-consumption guard at `tests/pcc-api-dormancy.test.ts`,
which now enforces the Wave 4 boundary: a narrow per-file api-import
allowlist, a recursive `fetch(` allowlist scoped to the backend client
and its direct test, forbidden-runtime import/token scans across both
non-api source and `src/api/**`, a source-level GET-only check on the
backend client, and a single-consumer assertion that `readModelClient`
is threaded only to Project Home in `PccSurfaceRouter`.

## Wave 4 Opt-In Backend Reads (Project Home)

Wave 4 wires Project Home / Command Center through the Wave 3 read-model
seam **only when explicit mount config is supplied**. The default mount
call remains fixture-driven; backend reads are opt-in.

```ts
import { mount } from '@hbc/spfx-project-control-center';

// Default — fixture-driven, unchanged from Wave 2:
mount(el);

// Explicit fixture mode — same default behavior, factory-instantiated:
mount(el, spfxContext, { readModel: { readModelMode: 'fixture' } });

// Opt-in backend mode — calls the seven Wave 3 read-only routes:
mount(el, spfxContext, {
  readModel: {
    readModelMode: 'backend',
    backendBaseUrl: 'https://<functions-host>',
  },
});
```

Mount config (`IPccMountConfig.readModel`) accepts:

| Field | Type | Default |
| --- | --- | --- |
| `readModelMode` | `'fixture' \| 'backend'` | `'fixture'` |
| `backendBaseUrl` | `string` | undefined |
| `simulateBackendUnavailable` | `boolean` | `false` |

Behavior contract:

- **Fixture mode** (default or omitted): Project Home renders fixtures from `@hbc/models/pcc`; no `fetch(` calls; no tenant/Graph/PnP runtime.
- **Backend mode + `backendBaseUrl`**: Project Home consumes three of the seven Wave 3 read-only routes — `GET /api/pcc/projects/{projectId}/home`, `GET /api/pcc/projects/{projectId}/priority-actions`, and `GET /api/pcc/projects/{projectId}/document-control` — and renders envelope-derived state via the Project Home adapter / view-model (`src/surfaces/projectHome/projectHomeAdapter.ts`). The Priority Actions slot is sourced from the standalone `priority-actions` envelope when supplied; absent that envelope, the slot falls back to the home envelope's embedded `priorityActions` field. The backend HTTP client (`src/api/pccBackendReadModelClient.ts`) supports all seven Wave 3 read-only routes for future surface adoption; the other four remain unwired.
- **Backend mode without `backendBaseUrl`**, malformed config, network error, non-2xx response, or malformed JSON: cards render `state: 'error'` (`sourceStatus: 'backend-unavailable'`) via the safe fixture-fallback path. The app does not crash.
- **Other surfaces** (Team & Access, Documents, Site Health, External Systems, Project Readiness, Approvals, Control Center Settings) remain fixture/preview-driven; the read-model client is threaded only to Project Home.

Wave 4 does not introduce auth wiring, write routes, Graph/PnP/SharePoint REST live operations, Procore/Document Crunch/Adobe Sign runtime, packaging, or deployment. See the Wave 4 closeout docs under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/` for the full posture.

### Wave 6 Team & Access Read-Model Opt-In

Wave 6 / Prompt 06 wires Team & Access into the existing PCC read-model
seam using a single read-only GET route and the same explicit-opt-in
contract Project Home uses. Default mount/app behavior remains
fixture-driven; no fetches occur unless the mount config explicitly opts
into backend mode.

- **Backend route**: `GET /api/pcc/projects/{projectId}/team-access`
  delegates to `provider.getTeamAccess(projectId)` on the existing
  `PccMockReadModelProvider`. No write routes; the mock is read-only.
- **SPFx client method**: `IPccReadModelClient.getTeamAccess(...)` is
  implemented by both `pccFixtureReadModelClient` (returns the existing
  `SAMPLE_TEAM_ACCESS_PREVIEW_MODEL` envelope) and
  `pccBackendReadModelClient` (issues the canonical GET via the
  **existing** internal fetch wrapper — zero new `fetch(` callsites
  introduced).
- **Surface wiring**: `PccSurfaceRouter` now threads `readModelClient`
  to **exactly two** surfaces — `project-home` and `team-and-access`.
  Other surfaces remain fixture/preview-driven. Team & Access uses the
  Wave 4 hook pattern via `useTeamAccessReadModel` +
  `PccTeamAccessReadModelContent`. A shared `PccTeamAccessLaneShell`
  presentational component is consumed by both the fixture-default
  surface path and the read-model content wrapper to avoid any import
  cycle between `PccTeamAccessSurface` and
  `PccTeamAccessReadModelContent`.
- **No new runtime**: no auth wiring, no Graph/PnP/SharePoint REST, no
  Procore/Document Crunch/Adobe Sign, no write routes, no permission
  execution, no persistence. The dormancy guard now asserts the
  set-equality `{project-home, team-and-access}` for `readModelClient`
  consumers and asserts `pccBackendReadModelClient.ts` holds exactly
  one `fetch(` callsite.

### Wave 6 Guardrail Hardening (Prompt 07)

Wave 6 / Prompt 07 hardens regression coverage **without changing any
source** — it adds tests only:

- **Workspace-wide mutation/execution identifier scan** in
  `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`. A new
  constant `FORBIDDEN_MUTATION_EXECUTION_IDENTIFIERS` enumerates
  identifier-form (camelCase) tokens grouped by category (permission
  mutation, approval/workflow execution, SharePoint group mutation,
  Teams membership mutation, provisioning execution, Site Health
  repair). Every `apps/project-control-center/src/**/*.{ts,tsx}` source
  file (test files excluded) is scanned with comments+strings stripped;
  no source file may declare or call any forbidden identifier. Generic
  fragment words (`group`, `team`, `member`, `permission`, `approve`,
  `reject`) are intentionally excluded from the scan to avoid false
  positives in legitimate UI prose, type names, and persona names.
- **Direct state-rendering coverage** for
  `PccTeamAccessReadModelContent` in a new
  `PccTeamAccessReadModelContent.test.tsx`. Stub clients exercise the
  `'preview'`, `'error'`, `'loading'`, and rejected-promise branches;
  a `globalThis.fetch` spy stays at zero calls across all four cases.
- **Backend-unavailable opt-in** scenario for `team-and-access` in
  `PccApp.optIn.test.tsx`: rendering the surface-router with a
  `simulateBackendUnavailable: true` fixture client surfaces the safe
  error state (no lane markers, `[data-pcc-state="error"]`, zero
  fetch).
- **Backend route-guardrails extension**: the
  `pcc-read-model-route-guardrails.test.ts`
  `FORBIDDEN_EXECUTABLE_TOKENS` list is extended with explicit
  CamelCase / Graph-API-path identifiers (`addUserToGroup`,
  `removeUserFromGroup`, `addTeamMember`, `addChannelMember`,
  `joinedTeams`, `graphMembers`) — additive to the existing
  fragment-based list.

Wave 4 / Wave 5 / Wave 6 prior-prompt assertions remain green and
unchanged; the new scans are purely additive.

### Wave 9 Lifecycle Readiness Client Seam

`IPccReadModelClient` now exposes **10** read-model methods. Wave 9 / Prompt 04
adds:

- `getLifecycleReadiness(projectId, viewerPersona?)` →
  `Promise<PccReadModelEnvelope<PccLifecycleReadinessReadModel>>`
- Route id `'lifecycle-readiness'` →
  `pcc/projects/{projectId}/lifecycle-readiness` (GET).

The fixture client mirrors the backend mock provider's degraded
`EMPTY_LIFECYCLE_READINESS_READ_MODEL` shape — preserving the canonical
157 / 55 / 32 / 70 `templateLibraryMetadata` in `backend-unavailable` and
`source-unavailable` envelopes. Known projects return
`SAMPLE_LIFECYCLE_READINESS_READ_MODEL`. The narrow
`IPccProjectReadinessReadModelClient` (consumed by `PccProjectReadinessSurface`)
is structurally extended so the lifecycle data is reachable from the
existing Project Readiness surface. Fixture remains the default; no live
fetch is added.

### Wave 9 Project Lifecycle Readiness Center surface

The `project-readiness` surface now renders the Wave 9 **Project Lifecycle
Readiness Center** as eight additional bento cards appended after the
Wave 8 Project Readiness Framework regions. Each lifecycle card is a direct
`PccDashboardCard` Fragment child (no wrapper element — preserves bento
direct-child grid layout) and carries the marker
`data-pcc-readiness-section="lifecycle-readiness-center"` so tests can
scope queries to the lifecycle group.

Region inventory (`data-pcc-readiness-region` values):

| Region | Card | Source |
| --- | --- | --- |
| `lifecycle-hero` | full | `summary.headlinePosture`, derived active gate, totals, `templateLibraryMetadata.total` |
| `lifecycle-map` | full | `phases[]` overlaid on the canonical 10 lifecycle phases (snapshot + not-applicable rows) |
| `lifecycle-family-domains` | full | 3 family cards (startup / safety / closeout) + per-`domains[]` cards |
| `lifecycle-my-actions` | wide | active project items, owner-filtered when `viewerPersona` is supplied |
| `lifecycle-blockers-exceptions` | wide | `blockerSummary[]` buckets + items with `blockerState ∈ {open, escalated}` |
| `lifecycle-evidence-readiness` | wide | `evidenceSummary[]` buckets with document-control reference counts |
| `lifecycle-future-closeout` | standard | template items where `itemType === 'future-closeout-exposure'` |
| `lifecycle-source-traceability` | standard | `templateLibraryMetadata` totals + 3 source documents |

Behavior:

- **Fixture-default** when no `readModelClient` is supplied: the surface
  hydrates from `SAMPLE_LIFECYCLE_READINESS_READ_MODEL` synchronously.
- **Read-model-driven** when a client is supplied: the surface calls
  `client.getLifecycleReadiness(projectId)` and resolves the envelope via
  `buildPccLifecycleReadinessViewModel`. Loading and error states render an
  inert preview hero.
- All controls are inert (`aria-disabled="true"`, no `onClick`, no anchors).
- Degraded envelopes (`source-unavailable`, `backend-unavailable`) preserve
  the canonical 157 / 55 / 32 / 70 library scope; per-region item arrays
  empty out safely.

No live runtime, no mutation, no Graph / PnP / SharePoint REST / Procore /
Sage / Outlook / Document Crunch / Adobe Sign / Safety platform / approval
execution / notifications / package / lockfile / manifest / workflow /
deployment changes are introduced. Hosted / tenant proof of the live
`lifecycle-readiness` route remains operator-pending.

### Wave 5 Priority Actions Rail (Project Home)

The Priority Actions card on Project Home renders a PCC-local four-group rail
(`PccPriorityActionsRail`) — there is **no direct `HbcPriorityRail` reuse**;
the rail is a fresh component scoped to PCC. The MVP rail suppresses the
`documents`, `health`, and `safety` priority-action categories, so the
user-facing rail surfaces only the four canonical groups (`access-requests`,
`readiness-blockers`, `approval-checkpoints`, `external-system-mapping`).
All rail row affordances are non-executing — every disabled action renders
as a `data-pcc-priority-rail-disabled-action` span ("Preview only"), with no
anchors, no `href`s, no buttons, no `onClick` handlers, and no live launch
URLs anywhere on Project Home. Non-preview Priority Actions card states
(`error`, `loading`, `empty`, `missing-config`, `unavailable-fixture`,
`unauthorized-persona`) render the existing `PccPreviewState` instead of the
rail, preserving the W2-ODR-009 state catalog.

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
- Wave 7 closeout (HB Document Control Center):
  [`docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/Wave_7_Closeout.md`](../../docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/Wave_7_Closeout.md)

---

Phase 3 Wave 2 is complete when the PCC SPFx shell frame, UI/UX basis, flexible bento layout, MVP surface navigation, preview dashboard cards, fallback states, and no-runtime guard tests are implemented and documented. The shell is ready for Wave 3 backend read-model planning, but it is not a live operational PCC release.
