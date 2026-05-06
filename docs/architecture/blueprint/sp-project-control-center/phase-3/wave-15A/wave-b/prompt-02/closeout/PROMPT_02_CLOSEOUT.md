# Wave 15A / Wave B — Prompt 02 Closeout

Shell Frame and Project Context Band.

## Outcome

Prompt 02 reduced shell visual dominance and introduced a persistent compact project-context band that renders on every PCC surface and across every responsive mode.

- Posture: implementation prompt; runtime UI changed within Wave B Prompt 02 scope.
- Score improvement (claim): partial against shell/host fit, project context, hierarchy, token discipline, product confidence — final 56/56 doctrine readiness is **not** claimed and cannot be claimed from Wave B alone.
- Implementation readiness: Prompt 03 (Navigation Information Architecture and State Cues) is the next prompt; navigation IA was deliberately not touched in this prompt.

## Repo-Truth Snapshot

| Item                 | Before                                                          | After                                                                                         |
| -------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| HEAD                 | `23b3acdea487339dec299df711dfac0b2d226efe` (Prompt 01 closeout) | unchanged at time of closeout authoring (no commit yet)                                       |
| Branch               | `main`                                                          | `main`                                                                                        |
| `git status --short` | clean                                                           | 5 modified + 3 untracked (all in `apps/project-control-center/src`); 1 untracked closeout doc |
| `md5 pnpm-lock.yaml` | `c56df7b79986896624536aab74d609f4`                              | `c56df7b79986896624536aab74d609f4` (unchanged)                                                |

## Files Changed

Source of truth: `git diff --cached --name-only --stat`.

```
apps/project-control-center/src/PccApp.test.tsx                                |  18 ++-
apps/project-control-center/src/PccApp.tsx                                     |   2 +
apps/project-control-center/src/shell/PccProjectContextBand.module.css         | 113 ++++++++++++++++
apps/project-control-center/src/shell/PccProjectContextBand.tsx                |  93 +++++++++++++
apps/project-control-center/src/shell/PccProjectIntelligenceHeader.module.css  |  94 ++-----------
apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx         |  41 +-----
apps/project-control-center/src/shell/PccShell.tsx                             |  17 ++-
apps/project-control-center/src/tests/PccProjectContextBand.test.tsx           | 147 +++++++++++++++++++++
8 files changed, 401 insertions(+), 124 deletions(-)
```

Plus this closeout doc:

```
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-02/closeout/PROMPT_02_CLOSEOUT.md
```

### Per-file role

| Path                                                                                       | Role                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/project-control-center/src/shell/PccProjectContextBand.tsx` (NEW)                    | Persistent compact band: project identity, source confidence, active surface label/workflow, pill row, date scope.                                                                                               |
| `apps/project-control-center/src/shell/PccProjectContextBand.module.css` (NEW)             | Band layout: 44 px desktop / 56 px phone min-height; responsive grid; meta area hidden on phone; identity + active-surface always visible.                                                                       |
| `apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx` (modified)        | Slimmed to ambient row: eyebrow subtitle + command-search slot only. Removed `projectName`, `pills`, `dateScope`, `activeSurfaceLabel`, `activeSurfaceWorkflowLabel` props (migrated to band).                   |
| `apps/project-control-center/src/shell/PccProjectIntelligenceHeader.module.css` (modified) | Header min-height 72 → 44 px; grid simplified to two columns (identity + commandArea); removed pillRow, dateScope, activeSurface\* rules and the meta-area placement; phone variant adjusted.                    |
| `apps/project-control-center/src/shell/PccShell.tsx` (modified)                            | Mounts band between header and `<main>`; new `sourceConfidence` prop typed `PccProjectContextSourceConfidence`; threads identity + meta props to band; no other prop or marker change.                           |
| `apps/project-control-center/src/PccApp.tsx` (modified)                                    | Derives `sourceConfidence = shell.previewMode ? 'preview' : 'live'` from `usePccShellState` and threads it to the shell. No state-shape change to `usePccShellState`.                                            |
| `apps/project-control-center/src/PccApp.test.tsx` (modified)                               | Header assertion updated to eyebrow text only; new band assertion covers project identity, source confidence, pill row, active surface; existing rail/default-surface/grid assertions preserved.                 |
| `apps/project-control-center/src/tests/PccProjectContextBand.test.tsx` (NEW)               | Five-case suite: wide-desktop full contract; live-mode label; phone-mode minimum context contract; cross-mode in-shell mount with bento-outside invariant; rail-click persistence + default-mount band presence. |

## Architecture Decisions (locked this prompt)

1. **Band as a separate component, header subordinated to slim ambient row.** The header retains `data-pcc-header` / `data-pcc-mode` so existing responsive shell tests still query it correctly. The band carries the persistent project-context affordance.
2. **Migrated markers (header → band):** `data-pcc-active-surface-context`, `data-pcc-pill-row`, `data-pcc-date-scope`. Existing consumers query by attribute and continue to pass without test rewrites (verified by `PccShell.navigation.test.tsx:112` still selecting `[data-pcc-active-surface-context]` from anywhere in the rendered tree).
3. **New markers introduced:** `data-pcc-context-band`, `data-pcc-mode` (on band), `data-pcc-source-confidence` (`'preview' \| 'live'`), `data-pcc-source-confidence-label`, `data-pcc-context-project`.
4. **Source-confidence derivation kept in `PccApp`.** No new field on `PccShellState`; the literal `previewMode: true` continues to govern, and `'preview'` is today's label. The `'live'` branch is reachable only when `previewMode` flips in a later wave (no behavior change in this prompt).
5. **`data-pcc-shell="wave-2"` retained.** Per Prompt 01 closeout, the wave stamp is not flipped in Prompt 02. Reassessment is a Prompt 06/07 closeout concern.
6. **No change to `PccCommandSearch`.** Search remains `disabled`/`readOnly` with accessible label; that affordance is owned by Prompts 03/05.
7. **No change to `PccSurfaceRouter` or any surface module under `apps/project-control-center/src/surfaces/`.** The band sits outside the bento grid in the work area; the bento direct-child invariant is preserved.
8. **No change to `usePccShellState`.** State shape remains `{ activeSurfaceId, previewMode: true, selectedProjectId? }`. Source-confidence is derived, not state.
9. **No change to `projectPlaceholder.ts`.** No `sourceConfidence` field added — placeholder stays as a pure projection of header copy.
10. **Source-confidence label copy:** `'preview' → "Reference data"`, `'live' → "Live data"`. Product-safe; no wave/prompt/coming-soon language.

## Marker Migration Table

| Marker                            | Before — Element                            | After — Element                             | Existing consumer impact                                                                                           |
| --------------------------------- | ------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `data-pcc-active-surface-context` | `<p>` inside `PccProjectIntelligenceHeader` | `<p>` inside `PccProjectContextBand`        | Compatible — `PccShell.navigation.test.tsx` query is global; passes.                                               |
| `data-pcc-pill-row`               | `<ul>` inside header                        | `<ul>` inside band                          | `PccApp.test.tsx` updated to assert pill content via the band; existing rail tests do not query this marker.       |
| `data-pcc-date-scope`             | `<span>` inside header                      | `<span>` inside band                        | No external consumer found via repo grep; only in-component reference.                                             |
| `data-pcc-header`                 | header element                              | unchanged on header element                 | `PccShell.responsive.test.tsx` and `PccApp.test.tsx` still pass (header still present, `data-pcc-mode` preserved). |
| `data-pcc-context-band`           | n/a                                         | NEW on band element                         | Asserted by new band suite.                                                                                        |
| `data-pcc-source-confidence`      | n/a                                         | NEW on band element (`'preview' \| 'live'`) | Asserted by new band suite.                                                                                        |
| `data-pcc-context-project`        | n/a                                         | NEW inside band identity                    | Asserted by new band suite + `PccApp.test.tsx`.                                                                    |

Repo-wide grep confirmed (excluding `dist/` / `node_modules/`) that the only consumers of the migrated markers were `PccProjectIntelligenceHeader.tsx` (the producer), `PccShell.navigation.test.tsx`, and `PccApp.test.tsx`. The producer was migrated, the test file `PccApp.test.tsx` was updated; the navigation test query is attribute-only and remained compatible.

## Validation Results

| Command                                                       | Result                                                                                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short` (baseline at HEAD `23b3acde…`)           | clean                                                                                                                                                   |
| `md5 pnpm-lock.yaml` baseline                                 | `c56df7b79986896624536aab74d609f4`                                                                                                                      |
| `pnpm --filter @hbc/spfx-project-control-center check-types`  | PASS (`tsc --noEmit` exit 0)                                                                                                                            |
| `pnpm --filter @hbc/spfx-project-control-center test`         | PASS — 80 test files / 1647 tests passed (vitest 4.1.0). Includes the new `PccProjectContextBand.test.tsx` (5 cases) and the updated `PccApp.test.tsx`. |
| `pnpm --filter @hbc/spfx-project-control-center build`        | PASS — `tsc --noEmit && vite build`; 2333 modules transformed; CSS 72.30 kB / JS 830.15 kB; `vite v6.4.1`.                                              |
| `pnpm exec prettier --check` (each changed file individually) | PASS — all files conform to Prettier code style.                                                                                                        |
| `git status --short` (final, pre-commit)                      | 5 modified + 3 new (all under `apps/project-control-center/src/`) + 1 new closeout doc under blueprint. No unrelated files.                             |
| `md5 pnpm-lock.yaml` (final)                                  | `c56df7b79986896624536aab74d609f4` (unchanged from baseline).                                                                                           |

Skipped:

| Command                     | Reason                                                                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workspace-wide ESLint       | The PCC app's package-local `lint` script targets `eslint src/ --ext .ts,.tsx`; deferred unless needed for a downstream gate. Type and test passes are the primary correctness signal here. |
| Hosted/tenant probes        | Not authorized; band is preview-shell only. Tenant-hosted evidence remains operator-pending (Prompt 06 / Prompt 07).                                                                        |
| `pnpm install` / `pnpm add` | Not run; no dependency change. Lockfile MD5 unchanged.                                                                                                                                      |

## Evidence

### Local browser screenshots (Project Home desktop wide + constrained)

**Operator-pending — not captured in this prompt.** No headless-browser tooling was used in the agent environment for this prompt; capturing before/after PNGs through the live `pnpm --filter @hbc/spfx-project-control-center dev` server requires an interactive browser session that this run did not perform. This is the documented evidence gap for Prompt 02.

Recommended capture set (as authored in `wave-b/docs/06_SCREENSHOT_AND_TENANT_EVIDENCE_PLAN.md` — read-only reference, **not** modified):

- `WB-SS-001_project-home_desktop-wide_before.png` (from `23b3acde…^`)
- `WB-SS-001_project-home_desktop-wide_after.png` (from this prompt's HEAD)
- `WB-SS-002_project-home_constrained_before.png`
- `WB-SS-002_project-home_constrained_after.png`

When captured, place under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/evidence/prompt-02/` (canonical lowercase per Prompt 01 closeout).

### Tenant-hosted (SharePoint published / edit) evidence

**Operator-pending.** Deferred to Prompt 06 (cross-surface smoke) / Prompt 07 (Wave B closeout & handoff). Package truth ≠ runtime truth.

### Programmatic evidence (in lieu of screenshots)

- `PccProjectContextBand.test.tsx` "renders inside PccShell across every responsive mode and remains outside the bento grid" exercises five modes (`wideDesktop`, `standardDesktop`, `tabletLandscape`, `tabletPortrait`, `phone`) and asserts band presence + DOM order header → band → canvas + bento-outside invariant.
- `PccProjectContextBand.test.tsx` "renders the band once for every active surface" exercises a rail click for every `PCC_MVP_SURFACE_IDS` entry and asserts the band remains a singleton across all surfaces.
- `PccApp.test.tsx` exercises the wide-desktop full path including band identity, source confidence (`'preview'`), pill content, and active-surface label.

## Scorecard Impact (claim)

| Category                              | Wave B Prompt 02 Effect                                                                                                                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell visual dominance / hierarchy    | Reduced — header min-height 72 → 44 px; project identity demoted to compact band; eyebrow subtitle remains as the only header-level identity hint.                                                                              |
| Project context persistence           | Established — band renders on every active surface and every responsive mode (test-verified).                                                                                                                                   |
| Source confidence affordance          | New — `data-pcc-source-confidence` and product-safe label ("Reference data") visible to users; future-flippable to `'live'`.                                                                                                    |
| Token discipline                      | Preserved — band uses existing `--pcc-color-card`, `--pcc-color-border`, `--pcc-color-text-primary`, `--pcc-color-text-muted`, `--pcc-space-*`, `--pcc-radius-*` tokens from `@hbc/ui-kit/theme`. No one-off colors introduced. |
| Diagnostic/preview text subordination | Done — `subtitle` ("Project overview") remains as eyebrow only; `dateScope` and pills moved to band meta area at smaller weight; phone mode hides meta entirely.                                                                |
| Host fit / scroll ownership           | Untouched — `min-height: 100vh` remains on `PccShell.module.css`. Owned by Prompt 04.                                                                                                                                           |
| Navigation IA                         | Untouched — owned by Prompt 03.                                                                                                                                                                                                 |
| Final 56/56                           | Not claimable from Wave B alone.                                                                                                                                                                                                |

## Manifest Version Posture

**No 4-part SharePoint manifest version bump.** Justification:

- Wave B README non-scope: package/manifest scope is permitted only when host fit is blocked by packaging identity. Prompt 02 is shell-frame compaction + band, not host fit.
- The PCC `apps/project-control-center/package.json` is `0.0.1` and `private: true`; the `1.0.0.11` 4-part version visible in the recent `feat(spfx-pcc 1.0.0.11)` commit relates to a Wave 15A SPFx packaging surface that Prompt 02 does not touch.
- No `package-solution.json`, no `*.manifest.json`, no `package.json` was modified.

## Residual Risk and Open Items

- **Local browser screenshot gap** for Prompt 02 (documented above). Operator follow-up recommended; programmatic test coverage compensates structurally but not visually.
- **Tenant-hosted proof** remains operator-pending until Prompt 06 / Prompt 07.
- **`data-pcc-shell="wave-2"`** wave stamp retained intentionally; revisiting is a Prompt 06/07 concern.
- **`wave-b/docs/06_SCREENSHOT_AND_TENANT_EVIDENCE_PLAN.md`** still spells the recommended folder uppercase `wave-B/evidence/`; canonical blueprint path is lowercase `wave-b/`. Carry-over from Prompt 01 closeout — documentation alignment item, not blocking, intentionally **not** modified by this prompt (MASTER plan files are out of scope).
- **`shell.previewMode`** is a literal `true` today; the `'live'` branch in `PccApp` and the band test exists for forward-compatibility but is not exercised by the runtime. Memory: future-runtime references are deferred posture, not authorization.
- **Bento direct-child invariant** holds for cards; band sits outside the bento grid (verified by test).

## Guardrails Preserved

- No backend / Functions / Graph / PnP / SharePoint REST / Procore / Adobe Sign / Sage / CRM call introduced.
- No `.sppkg`, app catalog deployment, tenant mutation, CI workflow change, or workflow dispatch.
- No dependency install / add / update; lockfile MD5 unchanged.
- No edits under `docs/architecture/plans/MASTER/**`.
- No edits under `docs/architecture/blueprint/**` outside this closeout file.
- No edits to `usePccShellState.ts`, `projectPlaceholder.ts`, `PccCommandSearch.tsx`, `PccSurfaceRouter.tsx`, `PccNavigationRail.tsx`, any `surfaces/**`, `api/**`, `viewModels/**`, `webparts/**`, `@hbc/models`, or `@hbc/ui-kit`.
- No `git push`. No `--no-verify`. No `--amend`.
- No 4-part manifest bump (Wave B Prompt 02 non-scope).
- All 8 PCC MVP surface routes continue to render under the new shell (test-verified by `PccProjectContextBand.test.tsx` rail-click loop, `PccShell.navigation.test.tsx`, `PccSurfaceContextHeader.contract.test.tsx`).

## Stop Conditions — Not Hit

- Band did not require live read-model changes.
- All-surface routing did not break.
- No external consumer of the migrated markers exists outside `apps/project-control-center/**`.
- Lockfile did not drift.
- No SPFx manifest tied to this UI surface needed to bump.

## Next Step

Execute `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b/prompts/Prompt_03_Navigation_Information_Architecture_And_State_Cues.md`. Prompt 03 owns navigation grouping, active/focus state cues, and phone-mode disclosure — none of which were touched in this prompt.
