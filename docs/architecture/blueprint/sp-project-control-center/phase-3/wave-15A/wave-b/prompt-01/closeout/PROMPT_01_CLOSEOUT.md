# Wave 15A / Wave B — Prompt 01 Closeout

Shell · Host Fit · Navigation — Scope Lock and File Map.

## Outcome

Prompt 01 completed as an audit-only pass. No runtime UI, CSS, component, backend, manifest, or package files were modified. The only file landed by this prompt is this closeout.

- Posture: audit-only.
- Score improvement: none (no runtime change is permitted from Prompt 01).
- Implementation readiness claim: Prompt 02 (Shell Frame and Project Context Band) handoff readiness only.
- Final 56/56 doctrine readiness is **not** claimed and cannot be claimed from Wave B alone.

## Repo-Truth Snapshot

Captured before authoring this closeout:

| Item                                          | Value                                                                            |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| Branch                                        | `main`                                                                           |
| HEAD                                          | `b8a005c6a5378277f40bb901d6b2a7a19ff38695`                                       |
| `git status --short`                          | empty (clean working tree)                                                       |
| `md5 pnpm-lock.yaml`                          | `c56df7b79986896624536aab74d609f4`                                               |
| Wave B package root                           | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b/`              |
| Blueprint sub-wave root (created this prompt) | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/` |
| App package                                   | `@hbc/spfx-project-control-center` (v `0.0.1`)                                   |

## Source Files Inspected (read-only)

- `apps/project-control-center/package.json`
- `apps/project-control-center/src/PccApp.tsx`
- `apps/project-control-center/src/state/usePccShellState.ts`
- `apps/project-control-center/src/preview/projectPlaceholder.ts`
- `apps/project-control-center/src/shell/PccShell.tsx`
- `apps/project-control-center/src/shell/PccNavigationRail.tsx`
- `apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx`
- `apps/project-control-center/src/shell/PccCommandSearch.tsx`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/layout/` (directory listing only)
- `apps/project-control-center/src/tests/` (directory listing only)
- Wave B package: `wave-b/README.md`, `wave-b/PACKAGE_MANIFEST.md`, `wave-b/docs/05_TEST_AND_VALIDATION_PLAN.md`, `wave-b/docs/06_SCREENSHOT_AND_TENANT_EVIDENCE_PLAN.md`, `wave-b/artifacts/{shell-nav-scorecard,tenant-screenshot-index,wave-B-agent-closeout}-template.md`
- Existing overall Wave 15A closeout (format reference only): `phase-3/wave-15A/prompt-01/closeout/PROMPT_01_CLOSEOUT.md`

## Source File Map (Wave B owning files)

Each row is the authoritative file (or files) that a later Wave B prompt is allowed to edit for the named concern. Tests are listed separately below.

| Wave B Concern                                                      | Owning File(s)                                                                                                                                                        | Notes                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shell frame composition (rail · header · canvas wrap · bento mount) | `apps/project-control-center/src/shell/PccShell.tsx` (143 lines) · `apps/project-control-center/src/shell/PccShell.module.css`                                        | Currently stamps `data-pcc-shell="wave-2"`; wraps all surface output in `<PccBentoGrid>`; uses `useContainerBreakpoint`; theme tokens from `@hbc/ui-kit/theme`.                                                                                                                                                                                              |
| Shell viewport / host fit (`min-height: 100vh`, scroll ownership)   | `apps/project-control-center/src/shell/PccShell.module.css`                                                                                                           | Per Wave B README, current shell uses `min-height: 100vh`; hosted SharePoint published/edit-mode behavior is unproven and is the focus of Prompt 04.                                                                                                                                                                                                         |
| Project identity / context band data                                | `apps/project-control-center/src/preview/projectPlaceholder.ts` (24 lines)                                                                                            | `PCC_PROJECT_PLACEHOLDER` (projectName "Project Control Center", subtitle "Project overview", dateScope "Last 12 Months", pills `Reference`/`PCC`). Local placeholder, **not** a `PCC_FIXTURES` record. Replaced when header binds to real read-models.                                                                                                      |
| Project intelligence header / context band rendering                | `apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx` (68 lines) · `apps/project-control-center/src/shell/PccProjectIntelligenceHeader.module.css` | Header currently renders identity, eyebrow, project name, active surface label/workflow, command-search slot, pill row (hidden in `phone`), and date scope (only `wide`/`standard` desktop). Prompt 02 candidate for "persistent project context band".                                                                                                      |
| Command / search scope                                              | `apps/project-control-center/src/shell/PccCommandSearch.tsx` (44 lines)                                                                                               | Display-only/read-only today (`disabled`/`readOnly`). Variants: `expanded` (input) and `icon` (button). Prompt 03/05 must keep accessible disabled affordance with reason; no misleading primary path.                                                                                                                                                       |
| Navigation information architecture, active state, focus management | `apps/project-control-center/src/shell/PccNavigationRail.tsx` (167 lines) · `apps/project-control-center/src/shell/PccNavigationRail.module.css`                      | Today: flat list across `PCC_MVP_SURFACE_IDS` (8 surfaces); per-surface `workflow` + `signal` (`overview` / `execution` / `risk` / `admin`) but no group headers; responsive variants `expanded` / `iconOnly` / `topStrip` / `hamburger`; `aria-current="page"` + `data-pcc-surface-active`; arrow/Home/End focus-only keyboard nav (Enter/Space activates). |
| Surface routing / shell-mounted surfaces                            | `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` (117 lines)                                                                                              | Switch over `activeSurfaceId`; threads optional `readModelClient` to surfaces that consume envelopes; preserves single `data-pcc-active-surface-panel` invariant; fallback `<PccDashboardCard footprint="full">` for any unrouted id.                                                                                                                        |
| Active-surface state & project selection                            | `apps/project-control-center/src/state/usePccShellState.ts` (53 lines)                                                                                                | Pure `useState`; default `activeSurfaceId = 'project-home'`; `previewMode: true` constant; `selectedProjectId` plumbed but unused by the current shell — relevant if Prompt 02 introduces a true project context band.                                                                                                                                       |
| App entry / placeholder wiring                                      | `apps/project-control-center/src/PccApp.tsx` (42 lines)                                                                                                               | Mounts `<PccShell>` with placeholder identity + active-surface labels; mounts `<PccSurfaceRouter>`; threads optional `readModelClient`.                                                                                                                                                                                                                      |
| Bento layout / footprints (read-only for Wave B)                    | `apps/project-control-center/src/layout/PccBentoGrid.tsx` · `PccDashboardCard.tsx` · `useBentoRowSpan.ts` · `useContainerBreakpoint.ts` · `footprints.ts`             | Wave B does not own bento internals; do not edit unless host-fit work in Prompt 04 forces a wrapper change.                                                                                                                                                                                                                                                  |

### Files explicitly out of scope for Wave B

- All `apps/project-control-center/src/surfaces/**` modules (Wave 15A surface waves own these).
- `apps/project-control-center/src/api/**` (read-model client and HTTP/fixture seam).
- `apps/project-control-center/src/viewModels/**`.
- `apps/project-control-center/src/webparts/**` (SPFx host wiring).
- `@hbc/models`, `@hbc/ui-kit` (shared package boundaries).

## Test Map

### Existing tests under `apps/project-control-center/src/tests/` (baseline — must continue to pass)

| Test File                                                                                                                                                                      | Concern                                                                                 | Wave B status                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `PccShell.navigation.test.tsx`                                                                                                                                                 | Shell + rail integration; surface activation; `aria-current`; `data-pcc-surface-active` | Baseline; expand for grouped IA in Prompt 03.                      |
| `PccShell.responsive.test.tsx`                                                                                                                                                 | Breakpoint variants (expanded / iconOnly / topStrip / hamburger)                        | Baseline; expand for phone-mode disclosure in Prompt 03.           |
| `usePccShellState.test.ts`                                                                                                                                                     | Active-surface and project-id state transitions                                         | Baseline; extend if Prompt 02 lifts project-context state.         |
| `PccApp.bentoIntegration.test.tsx`                                                                                                                                             | Shell ↔ bento composition; direct-child invariant                                       | Baseline; runs as smoke for shell mount.                           |
| `PccApp.optIn.test.tsx`                                                                                                                                                        | Optional `readModelClient` opt-in pass-through                                          | Baseline.                                                          |
| `PccBentoGrid.footprints.test.tsx`                                                                                                                                             | Card footprints / responsive footprint mapping                                          | Baseline; touched only if Prompt 04 changes wrapper.               |
| `PccPreviewState.states.test.tsx`                                                                                                                                              | Preview/empty/unavailable state markers                                                 | Baseline.                                                          |
| `PccSurfaceContextHeader.contract.test.tsx`                                                                                                                                    | Header contract assertions                                                              | Baseline; primary candidate for Prompt 02 context-band assertions. |
| `pcc-import-guards.test.ts`                                                                                                                                                    | Forbidden-import guards                                                                 | Baseline; must not regress when Wave B work lands.                 |
| `pcc-api-dormancy.test.ts`                                                                                                                                                     | No-runtime API dormancy guard                                                           | Baseline; preserve.                                                |
| Per-surface router pass-through tests (e.g., `PccExternalSystemsLaunchPad.routerPassThrough.test.tsx`, `PccApprovalsCheckpointsCard.readModel.test.tsx`, surface `*.test.tsx`) | Cross-surface routing through `PccSurfaceRouter`                                        | Baseline; primary smoke set for Prompt 06.                         |

### Tests to add or extend in later Wave B prompts

| Concern                                                                                   | Likely New / Extended Test                                                                             | Wave B Prompt  |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------- |
| Persistent project context band on every active surface                                   | New `PccProjectContextBand.contract.test.tsx` or extend `PccSurfaceContextHeader.contract.test.tsx`    | Prompt 02      |
| Operational nav grouping order, group headers, group → surface order                      | New cases in `PccShell.navigation.test.tsx` or new `PccNavigationRail.groups.test.tsx`                 | Prompt 03      |
| Active-state colour-independence (status/risk cue not color-only)                         | New rail-state assertions                                                                              | Prompt 03      |
| Phone-mode navigation disclosure (no hidden nav without alternative)                      | New cases in `PccShell.responsive.test.tsx`                                                            | Prompt 03      |
| Host-fit / scroll ownership (no `min-height: 100vh` regression in hosted-like containers) | Static or DOM-based assertion in `PccShell.responsive.test.tsx`                                        | Prompt 04      |
| Search disabled affordance with accessible reason                                         | New cases or extend existing header tests                                                              | Prompt 03 / 05 |
| Keyboard activation (Enter/Space) and focus-only arrow nav still distinct                 | New `PccNavigationRail.keyboard.test.tsx` (or extend)                                                  | Prompt 05      |
| Cross-surface render smoke through new shell                                              | Targeted `PccPrompt07.surfaces.test.tsx`-style aggregator (Wave B may add a shell-anchored equivalent) | Prompt 06      |

> Numbering above mirrors `wave-b/docs/05_TEST_AND_VALIDATION_PLAN.md`. No Wave B test is authored in Prompt 01.

## Evidence Plan / Index

### Existing artifact templates (in-tree, do not duplicate)

| Template                | Path                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Shell + Nav scorecard   | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b/artifacts/shell-nav-scorecard-template.md`     |
| Tenant screenshot index | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b/artifacts/tenant-screenshot-index-template.md` |
| Agent closeout          | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b/artifacts/wave-B-agent-closeout-template.md`   |

### Existing instantiated evidence indices for Wave B

`grep` of the repo confirms **no instantiated Wave B evidence index, screenshot index, or scorecard exists yet**. The templates above are the only Wave B evidence artifacts in tree.

### Recommended evidence folder (canonical, lowercase)

```
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/evidence/
```

Note: `wave-b/docs/06_SCREENSHOT_AND_TENANT_EVIDENCE_PLAN.md` currently spells the recommended folder `wave-15A/wave-B/evidence/` (uppercase `B`). This closeout establishes the canonical blueprint sub-wave path as **lowercase** `wave-b/` to match the in-tree plan-package directory and the existing Wave 15A closeout convention. Wave B authors may align doc 06 in a later prompt; this is a documentation alignment item, not a Prompt 01 deliverable.

### Screenshot capture posture (Prompt 01)

- **No before screenshots are required for Prompt 02 to begin.** Prompt 01 is audit-only and does not require capture.
- No before screenshots are currently available in the repo.
- Visual capture (`WB-SS-001` … `WB-SS-015` per `wave-b/docs/06_…`) is **deferred** to:
  - desktop / responsive / keyboard captures: Prompts 03–06 as the corresponding remediation lands;
  - SharePoint-hosted (published / edit) captures: Prompt 06 / Prompt 07 closeout, **operator-pending** (package truth ≠ runtime truth).
- The instantiated evidence index (`wave-b/evidence/index.md` or equivalent) will be created in Prompt 07 closeout, populated against the matrix already in `wave-b/docs/06_…`, and is **not** required by Prompt 01.

## Command Baseline

Commands run as part of Prompt 01 audit:

| Command                                                                                                | Result                                                       |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `git status --short`                                                                                   | (empty — clean tree)                                         |
| `git rev-parse HEAD`                                                                                   | `b8a005c6a5378277f40bb901d6b2a7a19ff38695`                   |
| `md5 pnpm-lock.yaml`                                                                                   | `c56df7b79986896624536aab74d609f4`                           |
| Directory listing of `apps/project-control-center/src/{shell,layout,state,preview,tests}`              | Confirmed expected file inventory; no surprises.             |
| Find for existing Wave B evidence indices/screenshots under `wave-b/**` and `blueprint/**/wave-15A/**` | None instantiated; only templates and the doc 06 plan exist. |

Commands deliberately **deferred** (Wave B README lists them as run-or-document-why-not for non-runtime prompts):

| Command                                                                                               | Reason for deferral                                                                                |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `pnpm --filter @hbc/spfx-project-control-center check-types`                                          | Audit-only; no source touched.                                                                     |
| `pnpm --filter @hbc/spfx-project-control-center test`                                                 | Audit-only; no source touched.                                                                     |
| `pnpm --filter @hbc/spfx-project-control-center build`                                                | Audit-only; no source touched.                                                                     |
| `pnpm exec prettier --check docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b/**/*.md` | Only this closeout is authored; format check below scoped to it. No MASTER plan files were edited. |

Closeout-specific format check (post-authoring):

```
pnpm exec prettier --check \
  docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-01/closeout/PROMPT_01_CLOSEOUT.md
```

## Stop-Condition Check

| Stop Condition                                         | Result                                                                                                                                   |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Wave 15A docs conflict with this Wave B package        | **PASS** — wave-b README/PACKAGE*MANIFEST/docs `00*…`–`07*…`are coherent with`phase-3/wave-15A/{00..10}*\*.md`; no contradictions found. |
| Local repo has uncommitted changes unrelated to Wave B | **PASS** — `git status --short` is empty at HEAD `b8a005c…`.                                                                             |
| Source ownership cannot be determined                  | **PASS** — every Wave B concern in the file map above resolves to a single owning file (or co-located `.module.css`).                    |

## Prompt 02 Readiness — Go / No-Go

**GO** for Prompt 02 (Shell Frame and Project Context Band).

- Owning files: `apps/project-control-center/src/shell/PccShell.tsx`, `PccShell.module.css`, `PccProjectIntelligenceHeader.tsx`, `PccProjectIntelligenceHeader.module.css`, `apps/project-control-center/src/preview/projectPlaceholder.ts`, and (only if a true project-context band is lifted out of the header) `apps/project-control-center/src/state/usePccShellState.ts` plus `apps/project-control-center/src/PccApp.tsx`.
- Test contract anchor: `PccSurfaceContextHeader.contract.test.tsx` is the recommended starting point for context-band assertions.
- Out of scope for Prompt 02: any `apps/project-control-center/src/surfaces/**` change, any backend/api change, any `@hbc/ui-kit` or `@hbc/models` change, any package/manifest version bump.

## Residual Risk and Open Items

- `wave-b/docs/06_SCREENSHOT_AND_TENANT_EVIDENCE_PLAN.md` spells the evidence folder with uppercase `wave-B`; canonical blueprint path landed by this closeout is lowercase `wave-b`. Documentation-only alignment item; not blocking.
- Tenant-hosted (SharePoint published / edit) evidence remains **operator-pending**. Hosted proof cannot be claimed from any audit or local validation in Wave B.
- Final Wave 15A 56/56 doctrine score is not assertable from Wave B alone; Wave B is foundational only.
- No new fixture/runtime/auth/Graph/PnP/Procore work is implied by Prompt 01.

## Files Changed by Prompt 01

| Path                                                                                                                     | Action  |
| ------------------------------------------------------------------------------------------------------------------------ | ------- |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-01/closeout/PROMPT_01_CLOSEOUT.md` | created |

No other file is created, edited, deleted, renamed, or staged. `pnpm-lock.yaml` MD5 is unchanged. No manifest/package version bump. No commit is created by this prompt.

## Guardrails Preserved

- No runtime UI / CSS / component / `@hbc/models` / `@hbc/ui-kit` change.
- No `apps/project-control-center/package.json` or `apps/**/package.json` change.
- No backend / Functions / Graph / PnP / Procore / SharePoint provisioning operation.
- No `.sppkg` generation, app catalog deployment, or tenant mutation.
- No CI / workflow / dependency install or update.
- No edits under `docs/architecture/plans/MASTER/**` or under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/` outside the new `wave-b/prompt-01/closeout/` folder.
- No staging of unrelated files; no `git commit`; no `git push`.

## Next Step

Execute `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b/prompts/Prompt_02_Shell_Frame_And_Project_Context_Band.md` against the file map above.
