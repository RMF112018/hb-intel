# Wave 2 — Prompt 04 Closeout: MVP Surface Navigation and PccShellState

**Phase:** 3
**Wave:** 2
**Prompt:** 04 — MVP Surface Navigation and State Model
**Status:** Complete
**Date:** 2026-04-29

## Objective Recap

Wire the eight PCC MVP surfaces into the shell navigation using
`PCC_MVP_SURFACE_IDS` / `PCC_MVP_SURFACES`, with internal React state
only. Default active surface: `project-home`. Provide active state,
focus state, keyboard navigation, and a compact/narrow-mode rail
affordance. Surface panels are preview-only frames. No URL router, no
backend, no persisted preferences, no real authorization.

## Files Created / Modified

**Created (4 source files + 1 closeout):**

```text
apps/project-control-center/src/
├── state/
│   └── usePccShellState.ts
├── shell/
│   └── PccSurfaceRouter.tsx
└── tests/
    ├── PccShell.navigation.test.tsx
    └── usePccShellState.test.ts

docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/
└── Wave_2_Prompt_04_Closeout.md   ← this file
```

**Modified:**

```text
apps/project-control-center/src/
├── PccApp.tsx                                  (uses usePccShellState; renders PccSurfaceRouter)
├── layout/PccDashboardCard.tsx                  (added optional dataActiveSurfacePanel passthrough prop)
├── shell/PccNavigationRail.tsx                  (mode by prop already; added onSelectSurface + roving-focus keyboard)
├── shell/PccShell.tsx                           (activeSurfaceId now required; added onSelectSurface prop)
├── ui/PccPreviewState.tsx                       (unavailable-fixture default copy → product-safe)
└── tests/PccApp.bentoIntegration.test.tsx       (column-span assertion no longer references demo cards)
```

**Deleted:** none.

No files outside `apps/project-control-center/` and this closeout were
modified.

## State-Model Contract

`src/state/usePccShellState.ts`:

```ts
export interface PccShellState {
  readonly activeSurfaceId: PccMvpSurfaceId;
  readonly previewMode: true;
  readonly selectedProjectId?: PccProjectId;
}

export interface PccShellStateActions {
  setActiveSurface(id: PccMvpSurfaceId): void;
  setSelectedProject(id: PccProjectId | undefined): void;
}

export type PccShellStateController = PccShellState & PccShellStateActions;

export type PccShellStateInitial = Partial<
  Pick<PccShellState, 'activeSurfaceId' | 'selectedProjectId'>
>;

export function usePccShellState(initial?: PccShellStateInitial): PccShellStateController;
```

Implementation uses React `useState` and stable `useCallback` setters. No
`localStorage`, `sessionStorage`, cookies, route params, or URL state.
`previewMode` is a literal `true` and is never flipped in Wave 2.
`selectedProjectId` is optional and unused beyond the setter contract;
later prompts may populate it without changing the hook signature.

## Navigation Coverage

All eight `PCC_MVP_SURFACE_IDS` from `@hbc/models/pcc` are wired
end-to-end. For every surface, click → `onSelectSurface(id)` →
`setActiveSurface(id)` → state update → `PccSurfaceRouter` swaps the
active panel → `aria-current="page"` moves to the clicked rail button.

| Surface ID | Display name | Rail icon | Surface panel marker |
| --- | --- | --- | --- |
| `project-home` | Project Home | `Home` | `data-pcc-active-surface-panel="project-home"` |
| `team-and-access` | Team & Access | `HardHat` | `data-pcc-active-surface-panel="team-and-access"` |
| `documents` | Documents | `BlueprintRoll` | `data-pcc-active-surface-panel="documents"` |
| `project-readiness` | Project Readiness | `Inspection` | `data-pcc-active-surface-panel="project-readiness"` |
| `approvals` | Approvals | `Submittal` | `data-pcc-active-surface-panel="approvals"` |
| `external-systems` | External Systems | `ExternalLink` | `data-pcc-active-surface-panel="external-systems"` |
| `control-center-settings` | Control Center Settings | `Settings` | `data-pcc-active-surface-panel="control-center-settings"` |
| `site-health` | Site Health | `AlertTriangle` | `data-pcc-active-surface-panel="site-health"` |

The active surface panel is a single `PccDashboardCard` with
`footprint="full"` and a `PccPreviewState` `state="unavailable-fixture"`.
The card sits as a direct child of `[data-pcc-bento-grid]` (Prompt 03
corrective invariant preserved). The panel's visible copy is the
surface's `displayName` and `description` from `PCC_MVP_SURFACES`,
overriding the generic preview-state defaults.

## Keyboard Map

Roving focus on the rail, focus-only — focus changes do not auto-activate.

| Key | Behavior |
| --- | --- |
| Tab | native focus traversal into / out of the rail |
| ArrowDown / ArrowRight | move focus to the next rail button (wraps); does NOT change `aria-current` |
| ArrowUp / ArrowLeft | move focus to the previous rail button (wraps); does NOT change `aria-current` |
| Home | move focus to the first rail button; does NOT change `aria-current` |
| End | move focus to the last rail button; does NOT change `aria-current` |
| Enter / Space | native button activation → `onClick` → `onSelectSurface(id)` |

No `role="tablist"`, `role="tab"`, or `role="tabpanel"` was introduced.
`aria-current="page"` continues to mark only the active surface.

## Unavailable-Fixture Copy Update (W2-ODR-009 catalog)

`PCC_PREVIEW_STATE_SPECS['unavailable-fixture']` default copy:

| Field | Before | After |
| --- | --- | --- |
| `title` | `Fixture not available in this preview` | `Preview content not available` |
| `description` | `This module will be wired in a later wave.` | `This surface is included in the Project Control Center shell, but no fixture content is available for the selected preview context.` |

This removes implementation-sequencing language ("later wave") from
visible copy while keeping the W2-ODR-009 state contract intact. The
existing `tests/PccPreviewState.states.test.tsx` reads the spec
dynamically and continues to pass against the new defaults. The other
six W2-ODR-009 states (`preview`, `empty`, `loading`, `error`,
`missing-config`, `unauthorized-persona`) were not edited — none of
their existing strings contain forbidden vocabulary.

## Test Totals

Pre-Prompt-04: **51 passed across 6 files**.
Post-Prompt-04: **69 passed across 8 files**.

| Test file | Tests | Result |
| --- | --- | --- |
| `PccApp.test.tsx` | 4 | PASS (unchanged) |
| `tests/pcc-import-guards.test.ts` | 26 | PASS (unchanged) |
| `tests/PccBentoGrid.footprints.test.tsx` | 3 | PASS (unchanged) |
| `tests/PccPreviewState.states.test.tsx` | 9 | PASS (reads new unavailable-fixture default copy) |
| `tests/PccShell.responsive.test.tsx` | 5 | PASS (unchanged) |
| `tests/PccApp.bentoIntegration.test.tsx` | 3 | PASS (column-span assertion now generic over rendered cards) |
| `tests/PccShell.navigation.test.tsx` (NEW) | 12 | PASS — 1 default + 8 per-surface click + 1 not-disabled + 1 keyboard focus + 1 click-after-focus |
| `tests/usePccShellState.test.ts` (NEW) | 6 | PASS — defaults, previewMode literal, setActiveSurface, setSelectedProject(undefined), initial override, stable setters |

(Test counts above are per-file from the vitest run; total = 69.)

## Selection-Test Pattern (per Refinement #2)

For every `id` in `PCC_MVP_SURFACE_IDS`, the navigation suite:

1. clicks the rail button
2. asserts the clicked button has `aria-current="page"`
3. asserts every other rail button does **not** have `aria-current="page"`
4. asserts exactly one `[data-pcc-active-surface-panel]` element exists
5. asserts that element's marker equals the clicked surface id
6. asserts that element's `textContent` includes both `surface.displayName` and `surface.description` from `PCC_MVP_SURFACES`

All eight per-surface cases pass.

## State-Hook Contract Coverage (per Refinement #3)

`tests/usePccShellState.test.ts` asserts:

- default `activeSurfaceId === 'project-home'`
- `previewMode === true` initially **and** after every documented mutation
- `setActiveSurface('site-health')` and `setActiveSurface('approvals')` update `activeSurfaceId`
- `setSelectedProject(undefined)` is accepted and leaves `previewMode === true` and `activeSurfaceId === 'project-home'` intact
- `initial.activeSurfaceId` override seeds the hook
- `setActiveSurface` and `setSelectedProject` references are stable across renders

The hook uses no `localStorage`, `sessionStorage`, cookies, route params,
or URL state — all asserted by `tests/pcc-import-guards.test.ts`'s
existing forbidden-specifier scan.

## Validation Command Results

| Command | Result |
| --- | --- |
| `git status --short` | Clean for the Prompt 04 scope. Pre-existing modifications to `CLAUDE.md` and `.claude/settings.local.json` were already present before this prompt and are not part of the commit. |
| `pnpm --filter @hbc/spfx-project-control-center check-types` | **PASS** |
| `pnpm --filter @hbc/spfx-project-control-center build` | **PASS** — `vite v6.4.1`, 2149 modules transformed; emits `dist/project-control-center-app.js` (168.47 kB · gzip 54.19 kB) and `dist/spfx-project-control-center.css` (10.61 kB · gzip 2.27 kB). Bundle was **not** packaged into `.sppkg` and **not** deployed. |
| `pnpm --filter @hbc/spfx-project-control-center test` | **PASS** — 69/69 across 8 files. |
| `pnpm --filter @hbc/spfx-project-control-center lint` | **PASS** — eslint clean. |

## Lockfile Status

`pnpm-lock.yaml` is **unchanged**. MD5 hash before and after Prompt 04
is identical: `c56df7b79986896624536aab74d609f4`. `git diff --stat
pnpm-lock.yaml` reports no diff. No `pnpm install`, `pnpm add`, or
`pnpm update` was run during Prompt 04. No `package.json` was edited.

## Explicit No-Touch Confirmations

- **`packages/spfx`:** untouched.
- **SPFx manifests / `package-solution.json` / `.sppkg` / app-catalog packaging / deployment scripts:** none introduced.
- **Backend / Azure Functions / provisioning / template packages:** untouched.
- **CI/CD workflow files:** untouched.
- **Graph/PnP / Procore / auth integrations:** none introduced. `tests/pcc-import-guards.test.ts` continues to assert this.
- **URL router / route params / history-API consumption:** none introduced.
- **Persisted nav preferences:** none. No `localStorage`, no `sessionStorage`, no cookies.
- **Tenant reads:** none.
- **Real authorization:** none.
- **`PCC_FIXTURES` consumption:** none. Only `PCC_MVP_SURFACES` and `PCC_MVP_SURFACE_IDS` are consumed for navigation/labels.
- **Per-surface module UI:** not implemented. Each panel is a preview-only `PccPreviewState` card.
- **Homepage paired-row layout import / copy / adaptation:** none. `tests/pcc-import-guards.test.ts` continues to assert this.
- **Disabled rail buttons:** not reintroduced. `tests/PccShell.navigation.test.tsx` asserts every rail button has `disabled === false`.
- **Package, solution, or manifest version bumps:** none. `apps/project-control-center/package.json` version remains `0.0.1`. The trailing instruction in the user prompt to "bump the appropriate manifest version" is not honored because no manifest exists in this scaffold and Wave 2 scope-lock W2-ODR-003 plus the Prompt 04 forbidden-work clause both prohibit version bumps; this conflict is resolved in favor of "no version bump."
- **`pnpm-lock.yaml`:** unchanged (MD5 identical pre/post).
- **New components beyond the surface router and the regression tests:** none. **No new tokens, no new dependencies, no new icons, no new `@hbc/ui-kit` API additions.**

## Anti-Scope-Creep Notes

- **Adjacent gap not absorbed:** per-surface content (Project Home bento dashboard, Documents launcher, Approvals checkpoint list, Site Health summary, etc.). These are Prompts 05–08; Prompt 04 leaves every panel as a preview-only `PccPreviewState` card.
- The existing `tests/PccApp.bentoIntegration.test.tsx` "hero / wide / standard" assertion was loosened to "any card under the grid" because the demo cards from Prompt 03 were removed (they were illustrative; the integrated app now renders one full-width active-surface card). The integration **intent** — every rendered card under the grid receives a non-zero `data-pcc-column-span` and an inline `gridColumn: span N` style — still holds and is asserted.
- No promotion to `packages/spfx`. No `@hbc/spfx/project-control-center` barrel introduced.
- No expansion of the W2-ODR-009 state catalog beyond the seven established in Prompt 03; only the `unavailable-fixture` default copy was edited.

## Forward Look (informational only)

Subsequent Wave 2 prompts will:

- Replace the Project Home preview panel with the real bento dashboard (priority actions, KPIs, charts).
- Replace each remaining surface preview panel with surface-specific content using fixture data from `@hbc/models/pcc/fixtures`.
- Optionally populate `selectedProjectId` once a project picker exists.
- Continue the no-runtime / no-tenant / no-deployment posture.
