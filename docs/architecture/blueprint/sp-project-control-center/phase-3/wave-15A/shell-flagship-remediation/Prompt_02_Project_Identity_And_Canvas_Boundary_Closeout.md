# Wave 15A — wave-b2 — Prompt 02 — Project Identity, Mandatory Facts, and Canvas Boundary — Closeout

## 1. Execution Chronology (do not retcon)

Prompt 02 is part of the intended wave-b2 add-on sequence (Prompt 01 → 02 → 03 → 03A → 04 → 05 → 06). This execution occurred **after** Prompt 03A landed (commit `babdb4260`) due to a targeted copy-alignment insertion and the planning order chosen by the owner. The actual git timeline at the moment of this commit is:

| Order in git log | Commit        | Prompt                                                                       |
| ---------------- | ------------- | ---------------------------------------------------------------------------- |
| 1                | `440ad9ace`   | Flagship (prompts-1) Prompt 01 — scope audit                                 |
| 2                | `00f4c89fb`   | Flagship Prompt 02 — hero hierarchy                                          |
| 3                | `4df5bf3c8`   | Flagship Prompt 03 — tab rail refinement                                     |
| 4                | `babdb4260`   | Wave-b2 (prompts-2) Prompt 03A — External Platforms surface copy alignment   |
| 5                | _this commit_ | **Wave-b2 Prompt 02** — project identity confirmation + canvas boundary seam |

Add-on Prompts 01 and 03 (prompts-2) have **not yet executed** at the time of this commit. This closeout does not imply Prompt 02 physically executed before Prompts 03 / 03A; it is being executed out of intended order on purpose.

## 2. Already Satisfied Before This Prompt (no change in this commit)

Several of the wave-b2 Prompt 02 requirements were already in place before this commit. None of these were modified here:

- **Fixture-selected preview identity.** `SAMPLE_PROJECT_PROFILE` from `@hbc/models/pcc` is the authoritative source threaded through `apps/project-control-center/src/PccApp.tsx` via `deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, shell.activeSurfaceId)` — landed by flagship Prompt 02 (commit `00f4c89fb`).
- **Mandatory hero facts** rendered in `PccProjectHeroBand.tsx` with stable markers: `data-pcc-hero-fact-location`, `data-pcc-hero-fact-estimated-value`, `data-pcc-hero-fact-scheduled-completion`, `data-pcc-hero-fact-project-stage`.
- **Excluded hero facts** confirmed absent with negative assertions in `apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx`: project number, client, project status, source confidence, last updated, plus pill-row markers.
- **Hero primary title** literal `'Project Control Center'` (typed as a string-literal field on `IPccShellHeroViewModel`).
- **Hero secondary title** sourced from `PCC_MVP_SURFACES[activeSurfaceId].displayName`, which already returns `External Platforms` for `external-systems` (locked by flagship Prompt 03).
- **`PCC_PROJECT_PLACEHOLDER` does not exist in the repo.** `apps/project-control-center/src/preview/projectPlaceholder.ts` does not exist either — the only file in `src/preview/` is `projectShellViewModel.ts`. No consumer references a placeholder symbol. This finding is recorded explicitly so future readers do not reintroduce a placeholder symbol on the assumption one was removed by this prompt.

## 3. Landed by This Prompt

- **Explicit canvas/tab seam** in `apps/project-control-center/src/shell/PccShell.module.css`: `border-top: 1px solid var(--pcc-color-border);` added to `.canvas`. Single treatment — no `box-shadow` stacked, no new tokens, no hex literals. The existing `.canvas` flex/padding/background/overflow rules and the `@media (max-width: 720px)` override are preserved verbatim.
- **Canvas-marker test** in `apps/project-control-center/src/tests/PccShell.responsive.test.tsx`: a new `it('renders the canvas marker on a <main> element', …)` asserting (a) exactly one `[data-pcc-canvas]` element renders, and (b) its `tagName === 'MAIN'`. Structural only; no computed-style, color, border-width, or padding assertions.
- **This closeout reconciliation document.**

## 4. Files Inspected

- `apps/project-control-center/src/PccApp.tsx`
- `apps/project-control-center/src/shell/PccShell.tsx`
- `apps/project-control-center/src/shell/PccShell.module.css`
- `apps/project-control-center/src/shell/PccProjectHeroBand.tsx`
- `apps/project-control-center/src/shell/PccProjectHeroBand.module.css`
- `apps/project-control-center/src/preview/projectShellViewModel.ts`
- `apps/project-control-center/src/tests/PccShell.responsive.test.tsx`
- `apps/project-control-center/src/tests/PccShell.navigation.test.tsx`
- `apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx`
- `apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx`
- `apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx`
- `packages/models/src/pcc/IProjectProfile.ts`
- `packages/models/src/pcc/fixtures/projectProfile.ts`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b2/README-addon.md`

## 5. Files Changed

Source of truth: `git diff --cached --name-only` after staging.

| File                                                                                                                                                           | Kind                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `apps/project-control-center/src/shell/PccShell.module.css`                                                                                                    | M — single rule added on `.canvas`     |
| `apps/project-control-center/src/tests/PccShell.responsive.test.tsx`                                                                                           | M — one new structural `it(...)` block |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/Prompt_02_Project_Identity_And_Canvas_Boundary_Closeout.md` | A — this closeout                      |

The pre-existing modifications visible at the start of this prompt (`apps/project-control-center/config/package-solution.json`, `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json`, `tools/spfx-shell/config/package-solution.json`) are out of scope for this prompt and are **not staged** in this commit.

## 6. Tri-State Status

- **Prior posture no longer observed:** the implicit-only seam between `PccHorizontalTabs` and `<main data-pcc-canvas>` (color transition with no border or elevation cue).
- **Current target landed:** explicit 1px `--pcc-color-border` top border on `<main data-pcc-canvas>`; structural canvas-marker test asserting marker presence + `<main>` tag.
- **Known intact:**
  - hero contract — mandatory + excluded fact set, primary title, surface-driven secondary title;
  - fixture-profile threading via `deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, …)`;
  - absence of `PCC_PROJECT_PLACEHOLDER` symbol and `projectPlaceholder.ts` file;
  - `PccBentoGrid` direct-child invariant (no JSX restructure of `PccShell.tsx`);
  - eight-surface routing through `PccSurfaceRouter` (existing `PccShell.navigation.test.tsx` and `PccShell.surfaceSmoke.test.tsx` cover it; not modified here);
  - SPFx manifest, `package-solution.json`, and `pnpm-lock.yaml` parity;
  - **Prompt 03A External Platforms copy alignment remains intact and is not modified by this prompt** — no `External Systems` regression introduced; the new CSS rule is structural-only and does not touch product copy or tests beyond the canvas-marker addition.

## 7. Validation Results

```bash
git status --short
# (modifications listed in §5; pre-existing manifest/version-bump files not staged)

md5 pnpm-lock.yaml
# c56df7b79986896624536aab74d609f4   (before)

pnpm --filter @hbc/spfx-project-control-center check-types
# tsc --noEmit clean

pnpm --filter @hbc/spfx-project-control-center test -- --run \
  PccShell PccApp PccProjectHeroBand projectShellViewModel
# 84 test files / 1754 tests / 0 failures
# (the targeted filter resolves to the full PCC vitest suite under the
#  current vitest.config.ts; this is acceptable — full-suite green is
#  stronger evidence than a narrow filter would be)

pnpm exec prettier --check \
  apps/project-control-center/src/shell/PccShell.module.css \
  apps/project-control-center/src/tests/PccShell.responsive.test.tsx
# All matched files use Prettier code style!

git diff --check
# clean

md5 pnpm-lock.yaml
# c56df7b79986896624536aab74d609f4   (after — match)
```

Hosted/tenant proof: **operator-pending, not in scope.**

## 8. Guardrails Preserved

- No backend / API / Graph / PnP / Procore runtime changes.
- No SPFx package or manifest version bump. The pre-existing `apps/project-control-center/config/package-solution.json`, `ProjectControlCenterWebPart.manifest.json`, and `tools/spfx-shell/config/package-solution.json` modifications are out of scope and remain unstaged.
- No `pnpm-lock.yaml` drift.
- No `git push`.
- No JSX restructure of `PccShell.tsx`.
- No new tokens, no hex literals, no stacked seam treatments.
- No edits to `PccApp.tsx`, `PccProjectHeroBand.tsx`, `PccProjectHeroBand.module.css`, `projectShellViewModel.ts`, or `@hbc/models/**`.
- No new `projectPlaceholder.ts` file. No invented `PCC_PROJECT_PLACEHOLDER` symbol.
- No URL / hash routing.
- No tab icons.
- No sticky / fixed shell behaviour.
- No `PccBentoGrid` invariant change.
- No final 56/56 doctrine claim.
- No broadening into Prompt 03 (surface context de-dup) or Prompt 05 (routing integrity) scope.

## 9. Residual Risk and Judgment Calls

- **Seam variant chosen: `border-top: 1px solid var(--pcc-color-border);`.** Preferred over the `box-shadow: inset 0 1px 0 var(--pcc-color-border)` alternative because the border treatment is simpler, more auditable, and does not introduce shadow stacking with existing `PccBentoGrid` card borders or with hero `.tabSeam` styling. If the host-fit evidence pass in Prompt 06 finds the hairline competes visually with bento card borders or the hero/tab seam, swap one for the other in a follow-up — never stack both.
- **Padding-top.** No padding bump applied. The existing `.canvas` `padding: var(--pcc-space-md) var(--pcc-space-lg);` and the `@media (max-width: 720px)` override of `var(--pcc-space-sm)` already provide adequate breathing room above the bento grid. Reassess if Prompt 06 evidence shows visual cramping.
- **Test scope.** The new `it(...)` asserts only structural facts (marker exists, on `<main>`). No computed-style or border-width assertions — those would be brittle against future seam variants and against jsdom's CSS-resolution gaps. Routing across the eight surfaces and the bento direct-child invariant are still covered by `PccShell.navigation.test.tsx`, `PccShell.surfaceSmoke.test.tsx`, and `PccApp.bentoIntegration.test.tsx`; this prompt did not add duplicates.
- **Add-on package docs.** Wave-b2 add-on README and risk-register entries that name an explicit canvas-boundary requirement could be tightened in a future docs sweep to point at the landed CSS rule. Not in scope for this commit.

## 10. Next-Prompt Handoff

- **Prompt 01 (Add-On Scope Lock and Shell Ownership):** still pending. Scope unchanged by this commit.
- **Prompt 03 (Surface Context De-Duplication and State Model):** still pending. Scope unchanged.
- **Prompt 03A (External Platforms Surface Copy Alignment):** already landed (`babdb4260`). Intact, not modified here.
- **Prompt 04 (Command Preview and Active Panel Accessibility):** scope unchanged. A11y work continues to validate against the final user-facing label set landed by 03A and against the new canvas marker landed here.
- **Prompt 05 (External Platforms and Routing Integrity):** scope unchanged.
- **Prompt 06 (Host Fit, Responsive Evidence, and Closeout):** scope unchanged. The chosen `border-top` seam variant may be reassessed against host-fit evidence if visual competition with bento card borders is observed.

Hosted/tenant proof for the visual seam remains **operator-pending**.
