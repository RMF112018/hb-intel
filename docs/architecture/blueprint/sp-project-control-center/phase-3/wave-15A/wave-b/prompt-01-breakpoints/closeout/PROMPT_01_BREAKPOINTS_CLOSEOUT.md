# Wave 15A / Wave B (b1) — Prompt 01 Breakpoints Closeout

8-mode PCC Breakpoint Foundation.

## Outcome

PCC's responsive contract has been replaced with the finalized 8-mode breakpoint policy from `wave-b1/docs/04_BREAKPOINT_POLICY_SPECIFICATION.md`. No shell UI behavior, navigation logic, hero/header semantics, surface rendering, backend, package files, manifests, or `pnpm-lock.yaml` were changed. Three shell components and 37 sibling tests received a strict, mechanical contract realignment from the old `'wideDesktop'`/`'standardDesktop'` literals to their new 8-mode analogs (`'desktop'`/`'standardLaptop'`); behavior at equivalent screen sizes is preserved.

- Posture: implementation prompt; runtime type contract changed; no shell UI behavior change.
- Score improvement: foundational only — Prompt 01 unlocks the horizontal-tab primitive (Prompt 02), Project Hero Band (Prompt 03), and shell recomposition (Prompt 04). No final 56/56 doctrine claim.

## Locked 8-Mode Contract

| Mode              | Width         | Columns |
| ----------------- | ------------- | ------: |
| `phone`           | `< 480px`     |       1 |
| `tabletPortrait`  | `480 – 768`   |       2 |
| `tabletLandscape` | `769 – 1024`  |       6 |
| `smallLaptop`     | `1025 – 1180` |       8 |
| `standardLaptop`  | `1181 – 1440` |      10 |
| `largeLaptop`     | `1441 – 1599` |      12 |
| `desktop`         | `1600 – 1919` |      12 |
| `ultrawide`       | `>= 1920`     |      12 |

Resolver: deterministic, non-overlapping, literal-numeric per the spec. See `apps/project-control-center/src/layout/footprints.ts:resolveResponsiveMode`.

## Boundary Test Results

`apps/project-control-center/src/tests/PccShell.responsive.test.tsx` now contains a `describe('resolveResponsiveMode 8-mode boundary contract', …)` block asserting the spec's mandatory 14 boundary rows. All 14 cases pass:

| Width | Expected          | Result |
| ----: | ----------------- | ------ |
|   479 | `phone`           | PASS   |
|   480 | `tabletPortrait`  | PASS   |
|   768 | `tabletPortrait`  | PASS   |
|   769 | `tabletLandscape` | PASS   |
|  1024 | `tabletLandscape` | PASS   |
|  1025 | `smallLaptop`     | PASS   |
|  1180 | `smallLaptop`     | PASS   |
|  1181 | `standardLaptop`  | PASS   |
|  1440 | `standardLaptop`  | PASS   |
|  1441 | `largeLaptop`     | PASS   |
|  1599 | `largeLaptop`     | PASS   |
|  1600 | `desktop`         | PASS   |
|  1919 | `desktop`         | PASS   |
|  1920 | `ultrawide`       | PASS   |

## Cascade Realignment (in-scope, user-approved)

A repository-truth grep at plan time identified that strict removal of `'wideDesktop'` and `'standardDesktop'` from `PccResponsiveMode` cascades into 41 PCC source/test files. The user explicitly approved this cascade as **type-driven contract realignment** with the following constraints:

- Approved scope: footprint contract source, `useContainerBreakpoint` default if required, the three shell components branching on the old literals, PCC tests that reference the old literals or `forceMode` values, and this closeout.
- Mechanical migration map (no subjective tuning):
  - `'wideDesktop'` → `'desktop'`
  - `'standardDesktop'` → `'standardLaptop'`
- Forbidden: surfaces, APIs, viewModels, webparts, homepage breakpoint policy, package files, manifests, lockfile, shared packages, unrelated docs.

Behavior at equivalent screen sizes is preserved. The three shell components had narrow conditional/case-statement references to the old literals; each was extended to cover the new wide modes (`smallLaptop`, `standardLaptop`, `largeLaptop`, `desktop`, `ultrawide` for "expanded"-class branches; phone/tabletPortrait/tabletLandscape unchanged).

### Footprint Matrix (deterministic carryover, no subjective tuning)

Net-new modes carry forward the nearest existing 5-mode row 1:1; `full` clamps to each mode's column count where required:

| Mode              | Source row carried    | Notes                             |
| ----------------- | --------------------- | --------------------------------- |
| `phone`           | old `phone`           | unchanged                         |
| `tabletPortrait`  | old `tabletPortrait`  | unchanged                         |
| `tabletLandscape` | old `tabletLandscape` | unchanged                         |
| `smallLaptop`     | old `standardDesktop` | natural fit (8 columns)           |
| `standardLaptop`  | old `standardDesktop` | `full` clamps from 8 → 10 columns |
| `largeLaptop`     | old `wideDesktop`     | unchanged 12-column row           |
| `desktop`         | old `wideDesktop`     | unchanged 12-column row           |
| `ultrawide`       | old `wideDesktop`     | unchanged 12-column row           |

`FOOTPRINT_MIN_COLUMN_SPANS` and `FOOTPRINT_MIN_INLINE_SIZE_PX` follow the same carryover rule.

### Temporary Rail-Variant Mapping

`PccShell.responsive.test.tsx` now declares an 8-key `EXPECTED_RAIL_VARIANT` map covering all new modes. Variants for `smallLaptop`, `standardLaptop`, `largeLaptop`, `desktop`, and `ultrawide` are all `'expanded'` (matching today's behavior at equivalent sizes); `tabletLandscape` stays `'iconOnly'`, `tabletPortrait` stays `'topStrip'`, `phone` stays `'hamburger'`. The map is **temporary** and exits with the rail in `Prompt_04_Shell_Recomposition_And_Rail_Removal.md`.

## Files Changed

Source of truth: `git diff --cached --name-only` at commit time. PCC scope (42 files):

| Path                                                                                           | Role                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/project-control-center/src/layout/footprints.ts`                                         | replaced `PCC_RESPONSIVE_MODES`, exhaustive maps (`PCC_RESPONSIVE_COLUMNS`, `FOOTPRINT_COLUMN_SPANS`, `FOOTPRINT_MIN_COLUMN_SPANS`, `FOOTPRINT_MIN_INLINE_SIZE_PX`), thresholds, and `resolveResponsiveMode` |
| `apps/project-control-center/src/layout/useContainerBreakpoint.ts`                             | default `initialMode: 'standardDesktop'` → `'standardLaptop'`                                                                                                                                                |
| `apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx`                       | `showSearchExpanded` extended to `standardLaptop`/`largeLaptop`/`desktop`/`ultrawide`                                                                                                                        |
| `apps/project-control-center/src/shell/PccProjectContextBand.tsx`                              | `showDateScope` extended to `standardLaptop`/`largeLaptop`/`desktop`/`ultrawide`                                                                                                                             |
| `apps/project-control-center/src/shell/PccNavigationRail.tsx`                                  | `railVariantForMode` switch extended to all 5 wide modes returning `'expanded'`                                                                                                                              |
| `apps/project-control-center/src/PccApp.test.tsx`                                              | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx`                       | mechanical literal rename + `resolveFootprintColumnSpan` argument                                                                                                                                            |
| `apps/project-control-center/src/tests/PccShell.responsive.test.tsx`                           | rebuilt rail-variant map + new 14-row boundary test block                                                                                                                                                    |
| `apps/project-control-center/src/tests/askHbiGroundingCloseout.test.tsx`                       | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/buyoutLogGuardrails.test.ts`                            | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx`                       | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccApp.optIn.test.tsx`                                  | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccApprovalsCheckpointsCard.readModel.test.tsx`         | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccApprovalsSurface.test.tsx`                           | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccBuyoutLogRegions.test.tsx`                           | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccConstraintsLogRegions.test.tsx`                      | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccControlCenterSettingsSurface.test.tsx`               | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx`                           | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccDocumentsSurface.tier.test.tsx`                      | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccExternalSystemsAddEditLinkDrawer.test.tsx`           | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccExternalSystemsLaunchPad.routerPassThrough.test.tsx` | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccExternalSystemsRegistryHealthAudit.test.tsx`         | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccExternalSystemsSurface.test.tsx`                     | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccPermitInspectionControlCenterRegions.test.tsx`       | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccProcoreSurfaceCards.test.tsx`                        | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccProjectContextBand.test.tsx`                         | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx`                    | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccProjectHome.states.test.tsx`                         | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccProjectHome.test.tsx`                                | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccProjectHomeAskHbiSection.test.tsx`                   | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccProjectHomeUnifiedLifecycleSection.test.tsx`         | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccProjectReadinessSurface.hierarchy.test.tsx`          | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx`                    | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccProjectReadinessUnifiedLifecycleSection.test.tsx`    | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccPrompt07.surfaces.test.tsx`                          | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccResponsibilityMatrixIntegration.test.tsx`            | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccResponsibilityMatrixRegions.test.tsx`                | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccShell.navigation.test.tsx`                           | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccSiteHealthSurface.test.tsx`                          | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx`              | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/PccTeamAccessSurface.layout.test.tsx`                   | mechanical literal rename                                                                                                                                                                                    |
| `apps/project-control-center/src/tests/unifiedLifecycleSurfaceIntegrationCloseout.test.tsx`    | mechanical literal rename                                                                                                                                                                                    |

Plus this closeout:

```
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-01-breakpoints/closeout/PROMPT_01_BREAKPOINTS_CLOSEOUT.md
```

No package file, manifest, lockfile, surface module, viewModel, API client, or webpart was changed. The two `wave-b1/prompts/Prompt_02_*.md` and `wave-b1/prompts/Prompt_03_*.md` modifications visible in the working tree are pre-existing user edits and are **not** introduced or staged by this prompt.

## Validation

| Command                                                                                              | Result                                                                                                                 |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `git status --short`                                                                                 | recorded above; only PCC scope + this closeout                                                                         |
| `md5 pnpm-lock.yaml` (before)                                                                        | `c56df7b79986896624536aab74d609f4`                                                                                     |
| `md5 pnpm-lock.yaml` (after)                                                                         | `c56df7b79986896624536aab74d609f4` (unchanged)                                                                         |
| `pnpm --filter @hbc/spfx-project-control-center check-types`                                         | PASS                                                                                                                   |
| `pnpm --filter @hbc/spfx-project-control-center test -- PccBentoGrid.footprints PccShell.responsive` | PASS (80 files / 1664 tests)                                                                                           |
| `pnpm --filter @hbc/spfx-project-control-center test`                                                | PASS (80 files / 1664 tests)                                                                                           |
| `pnpm --filter @hbc/spfx-project-control-center build`                                               | PASS — `dist/spfx-project-control-center.css` 72.30 kB, `dist/project-control-center-app.js` 830.82 kB, built in 1.71s |
| `pnpm exec prettier --check <changed-files>`                                                         | clean (6 files reformatted in-place after sed-driven line-length drift, all rechecked clean)                           |

## Context-Efficiency Section

Files actually read for Prompt 01 (per `wave-b1/docs/00_CONTEXT_EFFICIENCY_RULES.md`):

- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/prompts/Prompt_01_Breakpoint_Foundation_8_Mode_Contract.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/docs/04_BREAKPOINT_POLICY_SPECIFICATION.md`
- `apps/project-control-center/src/layout/footprints.ts`
- `apps/project-control-center/src/layout/useContainerBreakpoint.ts`
- `apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx`
- `apps/project-control-center/src/tests/PccShell.responsive.test.tsx`
- `apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx` (lines 15–34)
- `apps/project-control-center/src/shell/PccProjectContextBand.tsx` (lines 40–55)
- `apps/project-control-center/src/shell/PccNavigationRail.tsx` (lines 40–65)

Files **not** read (intentionally): the homepage breakpoint policy at `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts` (out of scope by spec); any `apps/project-control-center/src/api/**`, `surfaces/**`, `viewModels/**`, `webparts/**`; any `@hbc/ui-kit` or `@hbc/models` source; any backend or tooling files. The 35 sibling tests that received the mechanical literal rename were modified via in-place sed without being read line-by-line, since the rename is a single-token contract realignment with no test-logic implication; their content was verified only through the full test-suite pass.

## Guardrails Preserved

- No backend / Functions / Graph / PnP / SharePoint REST / Procore / Document Crunch / Adobe Sign change.
- No `apps/**/package.json` or root `package.json` change.
- No `@hbc/models` or `@hbc/ui-kit` change.
- No `tools/spfx-shell/config/package-solution.json` change; no `.sppkg`, app-catalog, or tenant work.
- No CI / GitHub Actions workflow change.
- No dependency install or update; `pnpm-lock.yaml` MD5 unchanged before/after.
- No edits under `docs/architecture/plans/MASTER/**` (the two `wave-b1/prompts/Prompt_02_*` and `wave-b1/prompts/Prompt_03_*` working-tree modifications are pre-existing user edits not absorbed into this commit).
- No edits under `apps/hb-webparts/**`.
- No surface (`apps/project-control-center/src/surfaces/**`), API (`src/api/**`), viewModel, or webpart change.
- No `git push`.

## Residual Risk

- The temporary rail-variant map in `PccShell.responsive.test.tsx` exists only until the rail is removed in `Prompt_04_Shell_Recomposition_And_Rail_Removal.md`; both should retire together.
- 35 sibling tests now reference `'desktop'` instead of `'wideDesktop'`. Width semantics are preserved (both rendered the bento grid at a wide-mode-class size); follow-up batches may revisit these usages once horizontal tabs and the hero band are in place.
- Net-new modes (`smallLaptop`, `standardLaptop`, `largeLaptop`, `ultrawide`) inherit footprint span/min-inline values from their nearest existing analog under the deterministic carryover rule; no subjective visual tuning was applied. Any tuning judgment is deferred to a later prompt with operator visual review.
- Tenant-hosted (SharePoint published / edit-mode) evidence remains operator-pending. Hosted proof cannot be claimed from local validation alone.
- Final Wave 15A 56/56 doctrine score is not assertable from this prompt; the shell remediation target is ≥ 3 in shell-related categories.

## Next Prompt

Execute next:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/prompts/Prompt_02_Horizontal_Tabs_Primitive.md
```

Foundational state for Prompt 02:

- 8-mode contract live in `apps/project-control-center/src/layout/footprints.ts`.
- `useContainerBreakpoint` default mode is `'standardLaptop'`.
- Bento direct-child invariant preserved.
- `PccNavigationRail` still mounted; its removal happens in Prompt 04.
- All PCC tests green at 1664 / 80 files.
