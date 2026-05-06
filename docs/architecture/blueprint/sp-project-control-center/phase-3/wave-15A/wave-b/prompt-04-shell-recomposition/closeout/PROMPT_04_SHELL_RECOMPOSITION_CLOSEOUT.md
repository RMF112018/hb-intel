# Wave 15A / Wave B (b1) — Prompt 04 Shell Recomposition Closeout

Thin shell live: Project Hero Band + Horizontal Tabs + Canvas/Bento. Vertical rail and slim header retired.

## Outcome

`PccShell` now mounts the new thin shell composed of `PccProjectHeroBand` + `PccHorizontalTabs` + `<main data-pcc-canvas>` + `PccBentoGrid`. The vertical `PccNavigationRail` and slim `PccProjectIntelligenceHeader` are deleted from source. `PccApp` threads the new prop set (project placeholder identity + metadata, hero source confidence, active surface id + selection handler). `PccSurfaceRouter`, the read-model client pass-through, the bento direct-child invariant, and all 8 surface routes are preserved. Host-fit CSS removes `min-height: 100vh`, drops the rail/workArea split, and adds `min-width: 0` + `overflow-x: hidden` so the shell flows inside SharePoint host containers without claiming the viewport.

- Posture: major runtime shell replacement; navigation IA migrated from rail to tabs; project context migrated from band/header to hero band.
- Score improvement: foundational shell reconstitution complete. Wave 15A 56/56 doctrine readiness is **not** claimed.

## Old Files Deleted or Retained

### Deleted

```
apps/project-control-center/src/shell/PccNavigationRail.tsx
apps/project-control-center/src/shell/PccNavigationRail.module.css
apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx
```

### Retained with deferment (Decision 2 — user-revised)

```
apps/project-control-center/src/shell/PccProjectIntelligenceHeader.module.css   (unchanged)
```

`PccCommandSearch.tsx:3` imports `searchField`, `searchIcon`, and `searchInput` classes from this CSS module. The hero band embeds `PccCommandSearch` unchanged, so the import contract must continue to resolve. `PccCommandSearch.tsx` is **not** in this prompt's allowed-edit list and was not modified. Per the user's revision: leave the CSS module untouched (no trim) and document the file as a transitional command-search dependency. Defer rename / repoint / trim to a follow-up prompt (Prompt 05 or a dedicated cleanup prompt).

### Left untouched as orphaned dead code (Decision 1 — user-revised)

```
apps/project-control-center/src/shell/PccProjectContextBand.tsx
apps/project-control-center/src/shell/PccProjectContextBand.module.css
apps/project-control-center/src/tests/PccProjectContextBand.test.tsx
```

`PccShell.tsx` no longer imports or mounts `PccProjectContextBand`. The component, its CSS, and its standalone unit tests remain on disk; Vite tree-shakes the unimported component out of the production bundle. Two of the band test file's five cases (the two that rendered `<PccApp>` and asserted band-in-shell) **had to be removed** because they queried marker contracts that no longer exist after the shell recomposition (e.g., `[data-pcc-context-band]` inside `PccApp`). The three direct-render unit cases preserve the per-component contract and continue to pass. This is the only Decision-1 amendment: the integration cases could not survive the recomposition.

A follow-up dead-code cleanup prompt should remove the band trio outright once a workspace-wide grep confirms no consumers.

## Shell DOM Order

```
<div data-pcc-shell="thin" data-pcc-shell-mode={mode}>
  <PccProjectHeroBand mode … />
  <PccHorizontalTabs mode activeSurfaceId onSelectSurface … />
  <main data-pcc-canvas>
    <PccBentoGrid forceMode={forceMode}>{children}</PccBentoGrid>
  </main>
</div>
```

`data-pcc-shell` value migrated from `"wave-2"` → `"thin"` (semantic, vocabulary-clean). `data-pcc-shell-mode` is preserved as defensive marker for any consumer not yet audited.

## Host-Fit CSS Changes

`apps/project-control-center/src/shell/PccShell.module.css`:

- **Removed** `min-height: 100vh` from `.shell` — the shell flows inside its parent (SharePoint webpart slot or standalone Vite host). No viewport assumption.
- **Removed** `.layout` and `.workArea` rules and the `:has([data-pcc-rail-variant=...])` selector — no rail/workArea split.
- **Added** `min-width: 0` to `.shell` so long content (project name, tab labels) inside flex children does not force horizontal overflow.
- **Added** `overflow-x: hidden` to `.canvas` so wide bento content does not spill horizontally inside constrained host zones (SharePoint zones can be narrower than the 1920 px ultrawide design).
- Phone-width canvas padding rule (`@media (max-width: 720px)`) preserved.

`PCC_THEME_VARS` is unchanged. Rail-specific CSS variables (`--pcc-color-rail*`) remain exported on the shell root; trimming dead tokens is a separate cleanup whose blast radius is out of scope for Prompt 04.

## Source-Confidence Vocabulary Reconciliation

`PccApp` now derives `sourceConfidence: PccProjectHeroSourceConfidence`:

```ts
const sourceConfidence = shell.previewMode ? 'reference' : 'live';
```

This retires the `'preview' | 'live'` vocabulary from the production tree. The `PccProjectContextSourceConfidence` type still exists on the orphaned `PccProjectContextBand` component but is no longer threaded by `PccApp` or `PccShell`.

## Marker Migration Table

| Before                      | After                              | Site of migration                                                     |
| --------------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| `[data-pcc-rail]`           | `[data-pcc-horizontal-tabs]`       | shell tablist root; tests querying tab list                           |
| `[data-pcc-surface-id="X"]` | `[data-pcc-tab-id="X"]`            | per-tab markers; click targets in 14 sibling test files               |
| `aria-current="page"`       | `aria-selected="true"`             | active-tab a11y assertion                                             |
| `data-pcc-surface-active`   | `data-pcc-tab-active`              | active-tab structural marker                                          |
| `[data-pcc-rail-variant=…]` | (gone — tabs do not have variants) | dropped from `PccShell.responsive.test.tsx`                           |
| `[data-pcc-header]`         | (gone)                             | dropped from tests                                                    |
| `[data-pcc-context-band]`   | (gone in production tree)          | retained only in `PccProjectContextBand.test.tsx` direct-render cases |
| `data-pcc-shell="wave-2"`   | `data-pcc-shell="thin"`            | shell root                                                            |

`[data-pcc-active-surface-context]` is preserved — the marker now lives inside `PccProjectHeroBand` (already rendered exactly once per band, in the always-visible identity row). `[data-pcc-active-surface-panel]` is preserved unchanged — it is rendered inside surface modules by `PccSurfaceRouter`.

## Route Preservation Evidence

- `PccSurfaceRouter` is unchanged; the `PccApp` → `<PccSurfaceRouter activeSurfaceId={shell.activeSurfaceId} readModelClient={readModelClient} />` thread is intact.
- `PccSurfaceContextHeader.contract.test.tsx` iterates all 8 `PCC_MVP_SURFACE_IDS`, clicks the corresponding `[data-pcc-tab-id]`, and asserts: exactly one `[data-pcc-active-surface-panel]` matches the surface id + the panel renders the six `[data-pcc-context-*]` markers. All 8 cases pass.
- `PccShell.navigation.test.tsx` (rewritten) iterates all 8 surface ids, clicks each tab, and asserts: clicked tab is `aria-selected="true"`, all other tabs are `aria-selected="false"`, exactly one panel exists, panel marker matches the clicked id, panel includes the surface's `displayName` + `description` from `PCC_MVP_SURFACES`. All 8 + the default-render + keyboard cases pass.

## Bento Invariant Evidence

- `PccApp.bentoIntegration.test.tsx` was **not edited** (per user's revision 3). It renders `<PccApp forceMode="desktop" />`, asserts every `[data-pcc-card]` is a direct child of `[data-pcc-bento-grid]`, asserts non-zero column spans + inline `gridColumn` style, and asserts `<PccApp />` (no `forceMode`) still mounts the grid. All 3 cases pass unchanged after the shell recomposition — direct evidence that the bento direct-child invariant survived the new DOM order.
- `PccBentoGrid.footprints.test.tsx` (footprint contract) — unchanged; passes.

## Test Cascade Migration

Beyond the four prompt-listed test files, the rail-marker removal cascaded to **15 sibling test files** that used `[data-pcc-surface-id="X"]` as a click target. Mechanical migration via sed:

- `data-pcc-surface-id` → `data-pcc-tab-id`
- `data-pcc-rail` → `data-pcc-horizontal-tabs`

These migrations are tightly-scoped click-target renames; no test logic changes. The user's revision authorized the cascade as type-driven contract realignment (same precedent as Prompt 01's `wideDesktop`/`standardDesktop` cascade).

`PccApp.test.tsx` required hand-edit (4 of 5 cases) because its assertions explicitly described the prior shell composition (slim header, persistent context band, rail with `data-pcc-surface-id`/`data-pcc-surface-active`). The rewrites assert the new composition: hero band with eyebrow, identity, source-confidence, active-surface; horizontal tablist with all 8 tabs; default `data-pcc-tab-active="true"` and `aria-selected="true"` on `project-home`; bento grid mode marker (preserved unchanged).

`PccProjectContextBand.test.tsx` had two integration cases removed (Decision-1 amendment as documented above).

## Revision-4 Grep Audit (post-execution)

| Check                                                                                                             | Result                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Any runtime import of `PccNavigationRail` (excluding test files)                                                  | **none**                                                                                                     |
| Any runtime import of `PccProjectIntelligenceHeader.tsx` (anywhere)                                               | **none**                                                                                                     |
| Any active test asserting `data-pcc-rail`                                                                         | **none**                                                                                                     |
| References to `PccProjectIntelligenceHeader.module.css` (must be only the transitional `PccCommandSearch` import) | only `apps/project-control-center/src/shell/PccCommandSearch.tsx:3` — the documented transitional dependency |

All four revision-4 audit checks pass.

## Files Changed

| Path                                                                                                                                                             | Action                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `apps/project-control-center/src/PccApp.tsx`                                                                                                                     | edit — thread new shell props; reconcile source-confidence vocabulary                                                          |
| `apps/project-control-center/src/PccApp.test.tsx`                                                                                                                | edit — rewrite 4 cases for hero/tabs (cascade)                                                                                 |
| `apps/project-control-center/src/shell/PccShell.tsx`                                                                                                             | edit — replace rail/workArea/header/band layout with hero + tabs + canvas                                                      |
| `apps/project-control-center/src/shell/PccShell.module.css`                                                                                                      | edit — host-fit (drop `min-height: 100vh`, drop `.layout`/`.workArea`, add `min-width: 0` + `overflow-x: hidden`)              |
| `apps/project-control-center/src/shell/PccNavigationRail.tsx`                                                                                                    | **delete**                                                                                                                     |
| `apps/project-control-center/src/shell/PccNavigationRail.module.css`                                                                                             | **delete**                                                                                                                     |
| `apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx`                                                                                         | **delete**                                                                                                                     |
| `apps/project-control-center/src/tests/PccShell.navigation.test.tsx`                                                                                             | edit — rewrite for tabs (rail markers → tab markers, `aria-current` → `aria-selected`, ArrowLeft/Right + Home/End auto-select) |
| `apps/project-control-center/src/tests/PccShell.responsive.test.tsx`                                                                                             | edit — replace `EXPECTED_RAIL_VARIANT` map with hero+tabs assertion suite; preserve `resolveResponsiveMode` boundary suite     |
| `apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx`                                                                                | edit — switch click target to `[data-pcc-tab-id]`                                                                              |
| `apps/project-control-center/src/tests/PccProjectContextBand.test.tsx`                                                                                           | edit (Decision-1 amendment) — remove two `<PccApp>`-integration cases; drop now-unused imports                                 |
| `apps/project-control-center/src/tests/AskHbiGroundingPreviewPanel.test.tsx`                                                                                     | edit — mechanical click-target rename (cascade)                                                                                |
| `apps/project-control-center/src/tests/buyoutLogGuardrails.test.ts`                                                                                              | edit — mechanical rename (cascade)                                                                                             |
| `apps/project-control-center/src/tests/PccBuyoutLogRegions.test.tsx`                                                                                             | edit — mechanical rename (cascade)                                                                                             |
| `apps/project-control-center/src/tests/PccConstraintsLogRegions.test.tsx`                                                                                        | edit — mechanical rename (cascade)                                                                                             |
| `apps/project-control-center/src/tests/PccPermitInspectionControlCenterRegions.test.tsx`                                                                         | edit — mechanical rename (cascade)                                                                                             |
| `apps/project-control-center/src/tests/PccProjectHome.test.tsx`                                                                                                  | edit — mechanical rename (cascade)                                                                                             |
| `apps/project-control-center/src/tests/PccProjectHomeAskHbiSection.test.tsx`                                                                                     | edit — mechanical rename (cascade)                                                                                             |
| `apps/project-control-center/src/tests/PccProjectHomeUnifiedLifecycleSection.test.tsx`                                                                           | edit — mechanical rename (cascade)                                                                                             |
| `apps/project-control-center/src/tests/PccProjectReadinessSurface.hierarchy.test.tsx`                                                                            | edit — mechanical rename (cascade)                                                                                             |
| `apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx`                                                                                      | edit — mechanical rename (cascade)                                                                                             |
| `apps/project-control-center/src/tests/PccPrompt07.surfaces.test.tsx`                                                                                            | edit — mechanical rename (cascade)                                                                                             |
| `apps/project-control-center/src/tests/PccResponsibilityMatrixIntegration.test.tsx`                                                                              | edit — mechanical rename (cascade)                                                                                             |
| `apps/project-control-center/src/tests/PccResponsibilityMatrixRegions.test.tsx`                                                                                  | edit — mechanical rename (cascade)                                                                                             |
| `apps/project-control-center/src/tests/unifiedLifecycleSurfaceIntegrationCloseout.test.tsx`                                                                      | edit — mechanical rename (cascade)                                                                                             |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-04-shell-recomposition/closeout/PROMPT_04_SHELL_RECOMPOSITION_CLOSEOUT.md` | create                                                                                                                         |

Files **not** edited or deleted: `PccProjectContextBand.tsx`, `PccProjectContextBand.module.css`, `PccProjectIntelligenceHeader.module.css`, `PccCommandSearch.tsx`, `PccSurfaceRouter.tsx`, `PccApp.bentoIntegration.test.tsx`, all surface modules, viewModels, API, webparts, shared packages (`@hbc/models`, `@hbc/ui-kit`), packaging files, manifests, lockfile, homepage breakpoint policy.

## Validation

| Command                                                                                                                                                                               | Result                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `git status --short`                                                                                                                                                                  | only the 25 in-scope changes (above) plus this closeout                                                                                                                                                                                                                                                                                    |
| `md5 pnpm-lock.yaml` (before)                                                                                                                                                         | `c56df7b79986896624536aab74d609f4`                                                                                                                                                                                                                                                                                                         |
| `md5 pnpm-lock.yaml` (after)                                                                                                                                                          | `c56df7b79986896624536aab74d609f4` (unchanged)                                                                                                                                                                                                                                                                                             |
| `pnpm --filter @hbc/spfx-project-control-center check-types`                                                                                                                          | PASS                                                                                                                                                                                                                                                                                                                                       |
| `pnpm --filter @hbc/spfx-project-control-center test -- PccShell.navigation PccShell.responsive PccApp.bentoIntegration PccSurfaceContextHeader PccHorizontalTabs PccProjectHeroBand` | PASS                                                                                                                                                                                                                                                                                                                                       |
| `pnpm --filter @hbc/spfx-project-control-center test`                                                                                                                                 | PASS — 82 files / 1716 tests (down 2 from prior 1718 because two `<PccApp>`-integration cases were removed from the band test file)                                                                                                                                                                                                        |
| `pnpm --filter @hbc/spfx-project-control-center build`                                                                                                                                | PASS — `dist/spfx-project-control-center.css` 70.69 kB, `dist/project-control-center-app.js` 830.73 kB. CSS bundle decreased ~1.6 kB (rail/header CSS removed); JS bundle effectively unchanged (hero + tabs were already imported but tree-shaken; net delta dominated by deleted rail/header components and replaced shell composition). |
| `pnpm exec prettier --check <changed-files>`                                                                                                                                          | clean (`PccApp.tsx`, `PccApp.test.tsx`, `PccShell.navigation.test.tsx`, `unifiedLifecycleSurfaceIntegrationCloseout.test.tsx` re-formatted in-place after authoring; all rechecked clean)                                                                                                                                                  |
| Revision-4 grep audit (4 checks)                                                                                                                                                      | all PASS                                                                                                                                                                                                                                                                                                                                   |

## Context-Efficiency Section

Files actually read for Prompt 04 (per `wave-b1/docs/00_CONTEXT_EFFICIENCY_RULES.md`):

- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/prompts/Prompt_04_Shell_Recomposition_And_Rail_Removal.md`
- `apps/project-control-center/src/shell/PccShell.tsx` (full re-read for prop migration)
- `apps/project-control-center/src/shell/PccShell.module.css` (full re-read for host-fit rewrite)
- `apps/project-control-center/src/PccApp.tsx` (full re-read for prop threading)
- `apps/project-control-center/src/tests/PccShell.navigation.test.tsx` (full re-read for migration; rewritten)
- `apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx` (read once to confirm no rail/header markers; left untouched per revision 3)
- `apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx` (read once for click-target migration)
- `apps/project-control-center/src/tests/PccProjectContextBand.test.tsx` (read for Decision-1 amendment)
- `apps/project-control-center/src/PccApp.test.tsx` (read once for cascade rewrites)

Files **not** re-read (already in active context from prior prompts in this conversation): `wave-b1/docs/03_SHELL_TARGET_SPECIFICATION.md`, `apps/project-control-center/src/shell/PccProjectHeroBand.tsx` (Prompt 03), `apps/project-control-center/src/shell/PccHorizontalTabs.tsx` (Prompt 02), `apps/project-control-center/src/shell/PccCommandSearch.tsx` (Prompt 03 closeout audit), `apps/project-control-center/src/shell/PccProjectContextBand.tsx` (Prompt 02), `apps/project-control-center/src/preview/projectPlaceholder.ts` (Prompt 03), `apps/project-control-center/src/layout/footprints.ts` (Prompt 01). No backend, surfaces (except per-surface tests grep'd for `data-pcc-surface-id`), viewModels, webparts, `@hbc/models`, `@hbc/ui-kit` source. No homepage breakpoint policy. No broad audit.

## Visual Contracts Pending (Operator Review)

Pixel-level confirmation deferred to Prompt 07 evidence capture and Prompt 08 final closeout:

- Hero band 72–85 px target height per mode.
- Horizontal tabs 2 px orange underline, 8% wash, 13 px / 600 / 0.02 em typography, 120 ms transitions, focus-visible ring.
- Phone-mode `Project Intel` toggle visible / collapsible behavior in browser.
- Host-fit behavior in SharePoint published page (no double-scroll, no horizontal overflow inside narrow zones).
- Tab tablist horizontal-scroll affordance at phone width.

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
- `PccSurfaceRouter.tsx` and `PccCommandSearch.tsx` untouched.
- No `git push`.

## Residual Risk

- **`PccCommandSearch.tsx` still imports from `PccProjectIntelligenceHeader.module.css`** (the only remaining reference, verified by revision-4 grep). Prompt 05 or a dedicated cleanup prompt should rename to `PccCommandSearch.module.css` and repoint the import.
- **`PccProjectContextBand.tsx` + `.module.css` + `.test.tsx` remain on disk as orphaned dead code** (two of five test cases removed; three direct-render unit cases retained). Production tree-shakes the unimported component. A follow-up dead-code prompt should remove the trio outright.
- **Rail-specific theme variables** (`--pcc-color-rail*`) remain exported on the shell root; trimming dead tokens is a separate cleanup whose blast radius across consuming CSS modules is out of scope here.
- **Hosted (SharePoint published / edit-mode) evidence operator-pending.**
- **No final Wave 15A 56/56 claim.**

## Next Prompt

Execute next:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/prompts/Prompt_05_Navigation_A11y_Keyboard_And_Surface_Smoke.md
```

Foundational state available to Prompt 05:

- Thin shell live: hero + tabs + canvas + bento.
- All 8 surfaces route via the new tabs; per-surface context header contract intact.
- 82 test files / 1716 tests green.
- Decision-2 transitional `PccCommandSearch` ↔ `PccProjectIntelligenceHeader.module.css` dependency awaiting rename in Prompt 05's decision register.
- Decision-1 orphaned `PccProjectContextBand` trio awaiting dead-code cleanup.
