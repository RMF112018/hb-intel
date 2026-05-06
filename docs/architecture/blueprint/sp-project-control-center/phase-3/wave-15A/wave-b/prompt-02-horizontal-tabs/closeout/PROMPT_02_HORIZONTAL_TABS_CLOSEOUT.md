# Wave 15A / Wave B (b1) — Prompt 02 Horizontal Tabs Closeout

Premium horizontal tab primitive (`PccHorizontalTabs`).

## Outcome

`PccHorizontalTabs` is a PCC-local navigation primitive built and tested in isolation. The component is **not** mounted in `PccShell`; mounting and rail removal are deferred to `Prompt_04_Shell_Recomposition_And_Rail_Removal.md`. No surface, router, shell, rail, hero, header, backend, package, manifest, or lockfile change in this prompt.

- Posture: implementation prompt; new isolated primitive; no shell behavior change.
- Score improvement: foundational only — Prompt 02 unblocks the Project Hero Band (Prompt 03) and the shell recomposition (Prompt 04).
- Final Wave 15A 56/56 doctrine readiness is **not** claimed.

## HbcTabs Composition Decision

`HbcTabs` (`packages/ui-kit/src/HbcTabs/index.tsx`) was **not composed**. Specific gaps verified against the current `HbcTabs` source:

| PCC requirement                                                                                                     | `HbcTabs` provides                         | Gap                                                                          |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| 2px orange underline                                                                                                | 3px orange underline (Griffel-controlled)  | wrong thickness; not externally overridable                                  |
| 8% orange background wash on active                                                                                 | none                                       | missing                                                                      |
| 13px / 600 / 0.02em typography                                                                                      | `0.875rem` (~14px), 600, no letter-spacing | wrong size; missing letter-spacing                                           |
| 120ms transitions                                                                                                   | `TRANSITION_FAST` (Griffel-controlled)     | not externally tunable                                                       |
| ArrowLeft / ArrowRight                                                                                              | yes                                        | OK                                                                           |
| **Home / End**                                                                                                      | **no**                                     | missing                                                                      |
| Enter / Space                                                                                                       | native `<button>`                          | OK                                                                           |
| Roving `tabIndex`                                                                                                   | yes                                        | OK                                                                           |
| `role="tablist"` / `role="tab"` / `aria-selected`                                                                   | yes                                        | OK                                                                           |
| **PCC marker contract** (`data-pcc-horizontal-tabs`, `data-pcc-tab-id`, `data-pcc-tab-active`, `data-pcc-tab-mode`) | only `data-hbc-ui="tabs"`                  | missing                                                                      |
| Responsive density (compact at smallLaptop and below)                                                               | none                                       | missing                                                                      |
| Phone: tablist always visible                                                                                       | n/a                                        | needs PCC-specific layout                                                    |
| Style system                                                                                                        | Griffel `makeStyles`                       | PCC convention is CSS Modules; Griffel cannot be overridden cleanly from PCC |

PCC-local primitive uses `@hbc/ui-kit/theme` accent and `@hbc/ui-kit/icons` glyphs (matching the existing rail pattern). Theme tokens are bridged from TypeScript into CSS via inline-style CSS custom properties on the tablist root (`--pcc-tabs-accent`); CSS Module rules consume the variable. CSS modules cannot import TypeScript constants directly; the inline-style bridge mirrors the convention already used in `PccShell.tsx`.

## Files Created

```
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-02-horizontal-tabs/closeout/PROMPT_02_HORIZONTAL_TABS_CLOSEOUT.md
```

No other file is created, modified, deleted, or renamed.

## Component Contract

### Public API

```ts
export interface PccHorizontalTabsProps {
  mode: PccResponsiveMode;
  activeSurfaceId: PccMvpSurfaceId;
  onSelectSurface: (id: PccMvpSurfaceId) => void;
  panelId?: string;
  ariaLabel?: string;
}
```

### Tab order and labels

Canonical `PCC_MVP_SURFACE_IDS` order from `@hbc/models/pcc`. PCC-local label overrides (distinct from `PCC_MVP_SURFACES` display names):

| Surface ID                | Tab label         |
| ------------------------- | ----------------- |
| `project-home`            | Project Home      |
| `team-and-access`         | Team              |
| `documents`               | Documents         |
| `project-readiness`       | Project Readiness |
| `approvals`               | Approvals         |
| `external-systems`        | Apps              |
| `control-center-settings` | Settings          |
| `site-health`             | Site Health       |

### Markers

- Root: `data-pcc-horizontal-tabs=""`, `data-pcc-mode={mode}`, `data-pcc-tabs-density={'compact' | 'comfortable'}`, `role="tablist"`, `aria-label="PCC primary navigation"` (override via `ariaLabel`).
- Each tab `<button type="button">`: `id="pcc-tab-{id}"`, `role="tab"`, `aria-selected`, `aria-controls={panelId?}`, `tabIndex={isActive ? 0 : -1}`, `data-pcc-tab-id={id}`, `data-pcc-tab-active={'true' | 'false'}`, `data-pcc-tab-mode={mode}`.
- Icons (`@hbc/ui-kit/icons`) wrapped in a `<span aria-hidden="true">` directly inside each tab button — decorative; no SVG-internal assertions.

### Density mapping

Compact at `phone`, `tabletPortrait`, `tabletLandscape`, `smallLaptop`. Comfortable at `standardLaptop`, `largeLaptop`, `desktop`, `ultrawide`. Phone keeps the tablist visible with horizontal-overflow scroll; **no hidden disclosure variant**.

## Keyboard / A11y Test Results

| Case                                                                                                                                                                                                     | Result                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `role="tablist"` on root, `role="tab"` on each button                                                                                                                                                    | PASS                                    |
| `aria-selected` reflects `activeSurfaceId`                                                                                                                                                               | PASS                                    |
| `aria-controls` stamped only when `panelId` is supplied                                                                                                                                                  | PASS                                    |
| Roving `tabIndex` (active tab `0`, inactive `-1`)                                                                                                                                                        | PASS                                    |
| Active state structurally non-color-only (aria-selected + data-pcc-tab-active + bold weight + 2px underline + 8% wash) — unit asserts the structural cues; pixel cues are CSS / browser visual contracts | PASS (structural)                       |
| ArrowRight wraps last → first                                                                                                                                                                            | PASS                                    |
| ArrowLeft wraps first → last                                                                                                                                                                             | PASS                                    |
| ArrowRight from a middle tab moves to next                                                                                                                                                               | PASS                                    |
| Home selects first surface                                                                                                                                                                               | PASS                                    |
| End selects last surface                                                                                                                                                                                 | PASS                                    |
| Enter / Space activation via native `<button type="button">` (HTML spec)                                                                                                                                 | PASS (structural — tag + type asserted) |
| Click activation calls `onSelectSurface` once with target id                                                                                                                                             | PASS                                    |
| Decorative icon wrapper `aria-hidden="true"` on every tab; no `aria-label` leak on the button                                                                                                            | PASS                                    |
| Phone-mode renders all 8 tabs, no hidden disclosure                                                                                                                                                      | PASS                                    |
| `data-pcc-tab-mode` mirrors prop across all 8 modes                                                                                                                                                      | PASS                                    |
| Density marker `'compact'` for phone/tabletPortrait/tabletLandscape/smallLaptop, `'comfortable'` for the four wider modes                                                                                | PASS                                    |

15 distinct cases; `it.each` over `PCC_RESPONSIVE_MODES` and explicit cases combined yield more individual assertions covered by Vitest.

## Validation

| Command                                                                    | Result                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short`                                                       | only the four created files; no unrelated drift                                                                                                                                                                                                                                          |
| `md5 pnpm-lock.yaml` (before)                                              | `c56df7b79986896624536aab74d609f4`                                                                                                                                                                                                                                                       |
| `md5 pnpm-lock.yaml` (after)                                               | `c56df7b79986896624536aab74d609f4` (unchanged)                                                                                                                                                                                                                                           |
| `pnpm --filter @hbc/spfx-project-control-center check-types`               | PASS                                                                                                                                                                                                                                                                                     |
| `pnpm --filter @hbc/spfx-project-control-center test -- PccHorizontalTabs` | PASS (81 files / 1688 tests; targeted suite covered by the new test file)                                                                                                                                                                                                                |
| `pnpm --filter @hbc/spfx-project-control-center test`                      | PASS (81 files / 1688 tests)                                                                                                                                                                                                                                                             |
| `pnpm --filter @hbc/spfx-project-control-center build`                     | PASS — `dist/spfx-project-control-center.css` 72.30 kB, `dist/project-control-center-app.js` 830.82 kB. Bundle size is unchanged from Prompt 01 because `PccHorizontalTabs` is **not** mounted in `PccShell` and Vite tree-shakes the unimported component out of the production bundle. |
| `pnpm exec prettier --check <changed-files>`                               | clean (`PccHorizontalTabs.tsx` and `PccHorizontalTabs.test.tsx` were re-formatted in-place after authoring; rechecked clean)                                                                                                                                                             |

## Context-Efficiency Section

Files actually read for Prompt 02 (per `wave-b1/docs/00_CONTEXT_EFFICIENCY_RULES.md`):

- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/prompts/Prompt_02_Horizontal_Tabs_Primitive.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/docs/03_SHELL_TARGET_SPECIFICATION.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/docs/02_SOURCE_OWNERSHIP_MAP.md`
- `packages/ui-kit/src/HbcTabs/index.tsx` (read once to verify HbcTabs API suitability per the prompt's allowed-reads clause)
- `apps/project-control-center/src/shell/PccNavigationRail.tsx` (lines 1–60 only, for surface-id / icon-import / `@hbc/models/pcc` import pattern)
- `apps/project-control-center/src/shell/PccShell.tsx` (lines 30–60 only, to confirm the inline-style CSS-variable bridge convention)

Files **not** read: `HbcTabs/types.ts` (the index file already exposed the public API surface needed for the gap analysis), `HbcTabs/__tests__/HbcTabs.test.tsx`, any backend, surfaces, viewModels, webparts, `@hbc/models` source beyond the `PccMvpSurfaceId` import shape, homepage breakpoint policy, and any other unrelated files. No broad audit was run.

## Guardrails Preserved

- No backend / Functions / Graph / PnP / SharePoint REST / Procore / Document Crunch / Adobe Sign change.
- No `apps/**/package.json` or root `package.json` change.
- No `@hbc/models` or `@hbc/ui-kit` source change.
- No `tools/spfx-shell/config/package-solution.json` change; no `.sppkg`, app-catalog, or tenant work.
- No CI / GitHub Actions workflow change.
- No dependency install or update; `pnpm-lock.yaml` MD5 unchanged before/after.
- No edits under `docs/architecture/plans/MASTER/**`.
- No edits under `apps/hb-webparts/**` (homepage breakpoint policy untouched).
- No surface (`apps/project-control-center/src/surfaces/**`), API (`src/api/**`), viewModel, or webpart change.
- `PccShell.tsx`, `PccSurfaceRouter.tsx`, `PccNavigationRail.tsx`, `PccProjectIntelligenceHeader.tsx`, `PccProjectContextBand.tsx` all untouched.
- No `git push`.

## Visual Contracts Documented (CSS / Browser, Not jsdom-Asserted)

The following visual cues are encoded in `PccHorizontalTabs.module.css` and validated structurally only in unit tests. Pixel-level confirmation is a CSS / browser visual contract, captured here for operator review when the tabs land in the shell at Prompt 04:

- 2px solid orange underline on `[data-pcc-tab-active="true"]` (`border-bottom: 2px solid var(--pcc-tabs-accent)`).
- 8% orange background wash on the active tab (`background-color: rgba(243, 112, 33, 0.08)`).
- 13px / 600 / 0.02em letter-spacing typography.
- 120ms transitions on `color`, `background-color`, `border-color`.
- Visible focus ring on `:focus-visible` (`outline: 2px solid var(--pcc-tabs-accent); outline-offset: 2px`).
- Hover affordance via subtle `color` shift; no underline change on hover (active state remains the only underline-bearing variant).

The 8% wash is expressed as a literal `rgba(...)` because `@hbc/ui-kit/theme` does not currently export a precomputed `HBC_ACCENT_ORANGE_WASH_8` token. Adding such a token to the shared package is **out of scope** for this prompt and is recorded as a follow-up token-extraction item.

## Residual Risk

- The component is built but **not mounted**. Mounting is Prompt 04. Until then, the live shell still uses `PccNavigationRail`, `PccProjectIntelligenceHeader`, and `PccProjectContextBand`.
- The 8% orange wash uses an inline `rgba(243, 112, 33, 0.08)` literal; if `@hbc/ui-kit/theme` later ships a precomputed wash token, replace the literal in this CSS Module.
- The visible focus ring, underline thickness, and wash opacity are CSS / browser visual contracts. Operator visual review should confirm them at Prompt 04 mount time and again at Prompt 07 evidence capture.
- Tenant-hosted (SharePoint published / edit-mode) evidence remains operator-pending. Hosted proof cannot be claimed from local validation alone.
- Final Wave 15A 56/56 doctrine score is not assertable from this prompt; the shell remediation target is ≥ 3 in shell-related categories.

## Next Prompt

Execute next:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/prompts/Prompt_03_Project_Hero_Band.md
```

Foundational state available to Prompt 03:

- 8-mode breakpoint contract live in `apps/project-control-center/src/layout/footprints.ts`.
- `PccHorizontalTabs` available at `apps/project-control-center/src/shell/PccHorizontalTabs.tsx`, ready to be mounted by Prompt 04.
- `PccNavigationRail`, `PccProjectIntelligenceHeader`, `PccProjectContextBand` still mounted; their replacement is Prompt 04.
- All PCC tests green at 1688 / 81 files.
