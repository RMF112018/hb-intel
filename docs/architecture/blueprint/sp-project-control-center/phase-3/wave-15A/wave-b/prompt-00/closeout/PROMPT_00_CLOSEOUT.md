# Wave 15A / Wave B (b1) — Prompt 00 Closeout

Rebaseline and Scope Supersession.

## Outcome

- Posture: documentation-only rebaseline; no runtime, CSS, test, manifest, package, or `pnpm-lock.yaml` change.
- Score improvement: none — Prompt 00 is a planning prompt and does not move any scorecard category.
- Implementation readiness: handoff to Prompt 01 (Breakpoint Foundation — 8-Mode Contract) only.
- Final Wave 15A 56/56 doctrine readiness is **not** claimed and cannot be claimed from this rebaseline.

## Supersession Statement

The prior plan-library prompt at:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b/prompts/Prompt_02_Shell_Frame_And_Project_Context_Band.md
```

is **superseded** for all forward Wave B work by the deeper, context-efficient shell remediation package at:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/
```

The accepted target shell composition is:

```text
Project Hero Band  (PccProjectHeroBand replaces PccProjectIntelligenceHeader)
Premium Horizontal Tabs  (PccHorizontalTabs replaces PccNavigationRail after recomposition)
Canvas / Bento Grid  (preserved)
```

Runtime artifacts already landed by the prior Prompt 02 (`PccProjectContextBand.tsx`, `PccProjectContextBand.module.css`, marker migration to the band, `sourceConfidence` derivation in `PccApp.tsx`, and the slimmed `PccProjectIntelligenceHeader`) **remain on `main` until** `Prompt_04_Shell_Recomposition_And_Rail_Removal.md` recomposes the shell around `PccProjectHeroBand` + `PccHorizontalTabs`. They are **not rolled back** by this rebaseline. Tests authored for the prior Prompt 02 (`PccProjectContextBand.test.tsx` and updates to `PccApp.test.tsx`) remain in place until the corresponding components are replaced.

The prior Prompt 01 audit-only closeout (`…/wave-b/prompt-01/closeout/PROMPT_01_CLOSEOUT.md`) **remains valid** as the Wave B file-ownership baseline; the new package extends it rather than displacing it.

## Accepted Target — Locked Decisions

Mirroring `wave-b1/docs/01_UPDATED_REMEDIATION_PLAN.md`:

| Decision         | Final                                                                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigation style | Premium horizontal tabs (`PccHorizontalTabs`).                                                                                                                 |
| Vertical rail    | Remove **after** horizontal tabs are implemented and tests are migrated. Rail deletion is not the first step.                                                  |
| Hero / header    | Replace `PccProjectIntelligenceHeader` with `PccProjectHeroBand`. **No second persistent band** is added.                                                      |
| Breakpoints      | Expand PCC-local `apps/project-control-center/src/layout/footprints.ts` to 8 modes. **Do not** modify the homepage breakpoint policy for PCC.                  |
| Standard laptop  | Treat 1181–1440 px as primary design range.                                                                                                                    |
| HbcTabs          | Use or compose `HbcTabs` only if it satisfies the public API and required behavior; PCC-local wrapper may implement missing behavior with the decision logged. |
| Bento            | Preserve `PccBentoGrid`, `PccDashboardCard`, and row-span logic; preserve the bento direct-child invariant.                                                    |
| Final score      | Target ≥ 3 in shell-related categories. **No Wave 15A 56/56 claim** from shell work alone.                                                                     |

## Strict Execution Order

Mirroring `wave-b1/docs/06_IMPLEMENTATION_SEQUENCE.md`:

| Batch | Prompt                                                         | Posture        |
| ----- | -------------------------------------------------------------- | -------------- |
| 0     | `Prompt_00_Rebaseline_Scope_Supersession_Context_Efficient.md` | This closeout  |
| 1     | `Prompt_01_Breakpoint_Foundation_8_Mode_Contract.md`           | Runtime change |
| 2     | `Prompt_02_Horizontal_Tabs_Primitive.md`                       | Runtime change |
| 3     | `Prompt_03_Project_Hero_Band.md`                               | Runtime change |
| 4     | `Prompt_04_Shell_Recomposition_And_Rail_Removal.md`            | Runtime change |
| 5     | `Prompt_05_Navigation_A11y_Keyboard_And_Surface_Smoke.md`      | Runtime change |
| 6     | `Prompt_06_Bento_Priority_And_Standard_Laptop_QA.md`           | Runtime change |
| 7     | `Prompt_07_Readme_Evidence_And_Screenshot_Index.md`            | Documentation  |
| 8     | `Prompt_08_Final_Wave_B_Closeout_And_Handoff.md`               | Documentation  |

A runtime-changing batch may not begin until the immediately preceding batch's closeout is in place and its package-local validation has passed. The horizontal tab primitive (Batch 2) must be built and tested before the shell is recomposed (Batch 4); the rail is deleted only at Batch 4.

## Context-Efficiency Section

Per `wave-b1/docs/00_CONTEXT_EFFICIENCY_RULES.md`, this prompt was executed against the smallest sufficient source set. Files actually read for Prompt 00:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-01/closeout/PROMPT_01_CLOSEOUT.md` (prior Prompt 01 audit-only closeout)
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-02/closeout/PROMPT_02_CLOSEOUT.md` (prior Prompt 02 closeout being superseded)
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/README.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/prompts/Prompt_00_Rebaseline_Scope_Supersession_Context_Efficient.md` (canonical on-disk Prompt 00)
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/docs/01_UPDATED_REMEDIATION_PLAN.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/docs/06_IMPLEMENTATION_SEQUENCE.md`

Source files inspected (read-only, line counts only — no edits):

- `apps/project-control-center/src/layout/footprints.ts` (87 lines) — current 5-mode contract: `phone`, `tabletPortrait`, `tabletLandscape`, `standardDesktop`, `wideDesktop`.
- `apps/project-control-center/src/shell/PccShell.tsx` (154 lines).
- `apps/project-control-center/src/shell/PccNavigationRail.tsx` (167 lines).
- `apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx` (41 lines).
- `apps/project-control-center/src/tests/PccShell.navigation.test.tsx` (116 lines).
- `apps/project-control-center/src/tests/PccShell.responsive.test.tsx` (30 lines).

Files **not** re-read (already-known repo truth from Prompt 01 closeout): `PccApp.tsx`, `usePccShellState.ts`, `projectPlaceholder.ts`, `PccCommandSearch.tsx`, `PccSurfaceRouter.tsx`, `PccBentoGrid.tsx`, `PccDashboardCard.tsx`, `useContainerBreakpoint.ts`. No backend, surfaces, viewModels, webparts, `@hbc/ui-kit`, or `@hbc/models` files were read.

## Repo-Truth Snapshot

| Item                          | Value                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------- |
| Branch                        | `main`                                                                       |
| `git rev-parse HEAD`          | `ca9072a408983b11608ee8cbb1a93774295e3302` (Wave 15A Wave B1 package landed) |
| Baseline expected by package  | `23b3acdea487339dec299df711dfac0b2d226efe` or newer clean `main` — satisfied |
| `md5 pnpm-lock.yaml` (before) | `c56df7b79986896624536aab74d609f4`                                           |
| `md5 pnpm-lock.yaml` (after)  | `c56df7b79986896624536aab74d609f4` (unchanged)                               |
| App package                   | `@hbc/spfx-project-control-center` — no version change in this prompt        |

## Files Changed by Prompt 00

Source of truth: `git diff --cached --name-only` at commit time.

| Path                                                                                                                     | Action  |
| ------------------------------------------------------------------------------------------------------------------------ | ------- |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-00/closeout/PROMPT_00_CLOSEOUT.md` | created |

No other file is created, edited, deleted, renamed, or staged by Prompt 00. `pnpm-lock.yaml` MD5 is unchanged. No manifest or package-version bump. The prior Prompt 02 closeout (`…/wave-b/prompt-02/closeout/PROMPT_02_CLOSEOUT.md`) is **not deleted** — it remains as historical record of the superseded direction.

## Validation

Commands run for this rebaseline (per the canonical Prompt 00 spec):

| Command                                                                                                                                             | Result                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short`                                                                                                                                | recorded at commit time; pre-existing in-progress `.md.md` → `.md` rename of `wave-b1/prompts/**` files is not introduced or absorbed by this prompt |
| `md5 pnpm-lock.yaml`                                                                                                                                | `c56df7b79986896624536aab74d609f4` (before and after — unchanged)                                                                                    |
| `pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-00/closeout/PROMPT_00_CLOSEOUT.md` | clean (formatted to prettier defaults before staging)                                                                                                |

Commands deliberately **deferred** (Prompt 00 is documentation-only):

| Command                                                      | Reason for deferral |
| ------------------------------------------------------------ | ------------------- |
| `pnpm --filter @hbc/spfx-project-control-center check-types` | No source touched.  |
| `pnpm --filter @hbc/spfx-project-control-center test`        | No source touched.  |
| `pnpm --filter @hbc/spfx-project-control-center build`       | No source touched.  |

## Guardrails Preserved

- No runtime UI / CSS / component / test change.
- No `apps/project-control-center/package.json`, app `package.json`, or root `package.json` change.
- No `@hbc/models` or `@hbc/ui-kit` change.
- No backend / Functions / Graph / PnP / SharePoint REST / Procore / Document Crunch / Adobe Sign operation.
- No `.sppkg` generation, app-catalog deployment, or tenant mutation.
- No CI / GitHub Actions workflow change.
- No dependency install or update; `pnpm-lock.yaml` MD5 unchanged.
- No edits under `docs/architecture/plans/MASTER/**` (the `wave-b1/` package was committed by the user prior to this prompt and is not modified here).
- No edits under `apps/hb-webparts/**` (homepage breakpoint policy untouched).
- No `git push`.

## Residual Risk

- The runtime surface still reflects the prior Prompt 02 (`PccProjectContextBand` mounted between the slim header and `<main>`; `sourceConfidence` derivation in `PccApp.tsx`). This will be recomposed by `Prompt_04_Shell_Recomposition_And_Rail_Removal.md`, not rolled back by this rebaseline. Until then, two project-context surfaces (existing band + future hero) must not coexist in the recomposed shell.
- The current `footprints.ts` 5-mode contract is the starting point for Prompt 01's expansion to 8 modes. Any rename of `standardDesktop` / `wideDesktop` will require a sweep of consumers (footprint maps, breakpoint hook, tests).
- The `wave-b1/prompts/**` working tree currently shows an in-progress `.md.md` → `.md` rename (9 files deleted from index, 9 untracked new files). This rename is **not introduced and not absorbed** by Prompt 00; it is a pre-existing operation in the user's working tree and is left for its owning prompt or commit.
- Tenant-hosted (SharePoint published / edit-mode) evidence remains operator-pending. Hosted proof cannot be claimed from any audit, local validation, or rebaseline document.
- Final Wave 15A 56/56 doctrine score is not assertable from any single prompt in this package; the shell remediation target is ≥ 3 in shell-related categories.

## Next Prompt Handoff

Execute next:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/prompts/Prompt_01_Breakpoint_Foundation_8_Mode_Contract.md
```

Owning file for the 8-mode contract: `apps/project-control-center/src/layout/footprints.ts`. Do **not** touch the homepage breakpoint policy or any surface/api/viewModel/webpart file. Preserve `useContainerBreakpoint` consumers and the bento direct-child invariant.
