# Wave 15A — wave-b2 — Prompt 03 — Surface Context De-Duplication and State Model — Closeout

## 1. Execution Chronology (do not retcon)

The intended wave-b2 add-on sequence is Prompt 01 → 02 → 03 → 03A → 04 → 05 → 06. **Actual git chronology differs:**

| Order in git log | Commit        | Prompt                                                                 |
| ---------------- | ------------- | ---------------------------------------------------------------------- |
| 1                | `440ad9ace`   | Flagship (prompts-1) Prompt 01 — scope audit                           |
| 2                | `00f4c89fb`   | Flagship Prompt 02 — hero hierarchy                                    |
| 3                | `4df5bf3c8`   | Flagship Prompt 03 — tab rail refinement                               |
| 4                | `babdb4260`   | Wave-b2 Prompt 03A — External Platforms surface copy alignment         |
| 5                | `08cf2dbe2`   | Wave-b2 Prompt 02 — project identity + canvas boundary seam            |
| 6                | _this commit_ | **Wave-b2 Prompt 03 — surface context de-duplication and state model** |

Add-on Prompt 01 (Add-On Scope Lock and Shell Ownership) remains pending. The closeout history for this package is **non-linear**: 03A landed first, 02 second, and 03 third — diverging from the intended package sequence by owner choice. This closeout does not retcon that order.

## 2. Already Satisfied Before This Prompt (no change in this commit)

- Shell hero band carries surface display name and surface description (flagship Prompt 02, `00f4c89fb`).
- Eight-surface routing and bento direct-child invariants (existing tests).
- Canvas-marker test and canvas/tab seam (Prompt 02, `08cf2dbe2`).
- External Platforms surface copy alignment (Prompt 03A, `babdb4260`).
- `PccPreviewState` covers all eight intentional state kinds — no new primitive needed.
- `PccTeamAccessHeaderCard` is **not orphaned**: it is mounted by `PccTeamAccessLaneShell.tsx:40`, which is rendered by `PccTeamAccessSurface`. Document this finding so future readers don't reintroduce the orphan claim. Team & Access never renders truly blank under any persona/access branch — `PccTeamAccessLaneShell` always renders the header card and at least one persona-branch lane card or `unauthorized-persona` PreviewState.

## 3. Landed by This Prompt

- **Eight happy-path `PccSurfaceContextHeader` mounts removed.** Surface-by-surface:
  - `apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx` — preview-branch mount removed; status pills + 4 metric cells + project number/name remain as the surface body.
  - `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx` — mount removed; the `PccPreviewState` "Team and access overview" body remains as the card body.
  - `apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx` — mount removed; the dynamic `cueFor(...)` text continues to convey source-status posture in plain language.
  - `apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsLaunchPadHeaderCard.tsx` — mount removed; the launch pad subtitle + conditional cue / `PccPreviewState` remain.
  - `apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx` — mount removed; the `PccPreviewState state="preview"` ("Settings overview") body remains.
  - `apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthOverviewCard.tsx` — mount removed (preview branch); the cue + 4-cell metric grid remain.
  - `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx` — happy-path HomeCard mount removed; loading and error mounts retained.
  - `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx` — happy-path HeroCard mount removed; loading and error mounts retained.
- **Degraded-state mounts retained as observed during execution:** `PccProjectReadinessSurface.tsx` loading + error branches; `PccApprovalsSurface.tsx` loading + error branches. These remain the canonical "data unavailable" posture pillars. The retention was confirmed at edit time; no count is assumed beyond what the source code shows after this commit.
- **Unused imports / constants dropped** alongside the mount removals: `PccSurfaceContextHeader` import from each touched surface; `pccSurfacePostureCopy` import where the only remaining usage was the removed mount; `POSTURE` / `POSTURE_REFERENCE` / `POSTURE_UNAVAILABLE` / `POSTURE_REFERENCE_READINESS` constants where they were referenced only in the removed mounts. `POSTURE_LOADING` / `POSTURE_ERROR` / `POSTURE_LOADING_READINESS` / `POSTURE_ERROR_READINESS` retained for the kept degraded-state mounts.
- **Contract test rewritten:** `apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx` now asserts (a) negative happy-path invariant — header does NOT render on any of the eight happy-path tabs; and (b) positive degraded-state assertions — header renders with all six standardized fields on `PccApprovalsSurface` loading + error branches and on `PccProjectReadinessSurface` loading + error branches. Project-readiness assertions use `Object.create(fixtureClient)` so class-prototype methods stay reachable while only `getProjectReadiness` is overridden to never resolve / always reject.
- **New invariant test file:** `apps/project-control-center/src/tests/PccShell.invariants.test.tsx` adds two structural invariants. (a) Eight-surface loop asserts no shell-owned hero marker (per current `PccProjectHeroBand.tsx` repo truth — `data-pcc-project-hero-band`, `data-pcc-hero-surface`, `data-pcc-hero-primary-title`, `data-pcc-hero-secondary-title`, `data-pcc-hero-surface-description`, `data-pcc-hero-facts`, `data-pcc-hero-fact-location`, `data-pcc-hero-fact-estimated-value`, `data-pcc-hero-fact-scheduled-completion`, `data-pcc-hero-fact-project-stage`, `data-pcc-hero-tab-seam`, `data-pcc-hero-command-search`) leaks into `[data-pcc-active-surface-panel]`. (b) Three-branch loop over Team & Access asserts at least one `[data-pcc-card]` with non-empty text content renders for access-manager, non-manager-with-access, and non-manager-without-access personas.
- **Surface-test assertions updated** to reflect the de-dup posture:
  - `PccShell.navigation.test.tsx` — replaced the `panels[0].textContent contains surface.description` assertion with a shell-hero-side check (`[data-pcc-hero-surface-description]` exists with non-empty text). Note: shell hero uses `PCC_SURFACE_HERO_DESCRIPTIONS` copy, not `PCC_MVP_SURFACES.description` — the assertion is structural-only.
  - `PccSiteHealthSurface.test.tsx` — dropped the surface-description-in-panel assertion; comment cites wave-b2 Prompt 03 owner.
  - `PccPrompt07.surfaces.test.tsx` — `approvals` panel-copy assertion changed from the now-absent surface description to `'Approvals home'` (the HomeCard title that remains panel-owned).
- **This closeout reconciliation document.**

## 4. Files Inspected

- `apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.tsx`
- All eight surface files listed in §3 (PccProjectIntelligenceCard, PccTeamAccessHeaderCard, PccDocumentsHeaderCard, PccExternalSystemsLaunchPadHeaderCard, PccControlCenterSettingsSurface, PccSiteHealthOverviewCard, PccApprovalsSurface, PccProjectReadinessSurface)
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.tsx` and `PccTeamAccessLaneShell.tsx` (orphan-claim verification)
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts` (class shape; `Object.create` choice)
- `apps/project-control-center/src/surfaces/approvals/approvalsViewModel.ts` (client interface)
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessViewModel.ts` (client interface)
- The four affected test files plus the new invariants file

## 5. Files Changed

Source of truth: `git diff --cached --name-only` after staging. The wave-b2 add-on closeout pre-existing manifest/version-bump modifications visible in earlier prompts (`apps/project-control-center/config/package-solution.json`, `ProjectControlCenterWebPart.manifest.json`, `tools/spfx-shell/config/package-solution.json`) are **not present in `git status`** at this commit's pre-stage point — confirming nothing manifest-related is staged here.

| File                                                                                                                                                            | Kind                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx`                                                                           | M — happy-path mount removed                      |
| `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx`                                                                               | M — mount removed                                 |
| `apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx`                                                                                 | M — mount removed                                 |
| `apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsLaunchPadHeaderCard.tsx`                                                            | M — mount removed                                 |
| `apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx`                                                            | M — mount removed                                 |
| `apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthOverviewCard.tsx`                                                                             | M — mount removed                                 |
| `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx`                                                                                    | M — happy-path mount removed (loading/error kept) |
| `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx`                                                                      | M — happy-path mount removed (loading/error kept) |
| `apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx`                                                                               | M — full rewrite (negative + positive)            |
| `apps/project-control-center/src/tests/PccShell.navigation.test.tsx`                                                                                            | M — description assertion updated                 |
| `apps/project-control-center/src/tests/PccSiteHealthSurface.test.tsx`                                                                                           | M — description assertion dropped                 |
| `apps/project-control-center/src/tests/PccPrompt07.surfaces.test.tsx`                                                                                           | M — approvals panel-copy assertion updated        |
| `apps/project-control-center/src/tests/PccShell.invariants.test.tsx`                                                                                            | A — new file (two structural invariants)          |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/Prompt_03_Surface_Context_DeDup_And_State_Model_Closeout.md` | A — this closeout                                 |

## 6. Tri-State Status

- **Prior posture no longer observed:** doubled identity strip (project name + surface display name + surface description) at the top of every happy-path surface; reference-only metadata (posture / source-status / source-confidence / last-updated) dominating first-view.
- **Current target landed:** `PccSurfaceContextHeader` removed from happy-path; degraded-state mounts preserved for `project-readiness` (loading + error) and `approvals` (loading + error); structural invariant tests prevent shell-hero leakage and Team & Access blank body.
- **Known intact:**
  - Prompt 02 canvas seam (`border-top: 1px solid var(--pcc-color-border)` on `.canvas`) and canvas-marker test;
  - Prompt 03A External Platforms copy alignment — user-facing labels remain `External Platforms` / `External Platforms Launch Pad`; internal `'external-systems'` ID literal preserved everywhere it functions as a route key, kind discriminator, data attribute, type member, switch case, file/folder name, or component name (the count drop from 40 to 39 is exactly one removed `surfaceId="external-systems"` JSX prop on the deleted External Platforms launch-pad header `PccSurfaceContextHeader` mount, not an internal-ID rename);
  - shell hero contract (mandatory + excluded fact set, primary/secondary title, surface description);
  - `PccBentoGrid` direct-child invariant — no JSX restructure of any surface; only `PccSurfaceContextHeader` mounts removed;
  - eight-surface routing through `PccSurfaceRouter`;
  - SPFx manifest / `package-solution.json` / `pnpm-lock.yaml` parity (lockfile MD5 `c56df7b79986896624536aab74d609f4` unchanged before/after);
  - `PccSurfaceContextHeader.tsx` public contract — props, marker set, and rendered fields untouched.

## 7. Validation Results

```bash
git status --short
# (only in-scope files; no manifest/version-bump files staged)

md5 pnpm-lock.yaml
# c56df7b79986896624536aab74d609f4   (before)

pnpm --filter @hbc/spfx-project-control-center check-types
# tsc --noEmit clean

pnpm --filter @hbc/spfx-project-control-center test -- --run
# 85 test files / 1769 tests / 0 failures
# (+11 over prior 1758 baseline: 8 new negative-invariant cases in the
#  rewritten contract test, 4 positive degraded-state cases there, 8 new
#  shell-hero-leak cases + 3 Team & Access non-empty cases in the new
#  invariants file; minus the 8 prior happy-path positive cases the
#  rewrite replaced.)

pnpm exec prettier --check <changed-files>
# All matched files use Prettier code style!

git diff --check
# clean

md5 pnpm-lock.yaml
# c56df7b79986896624536aab74d609f4   (after — match)

# Prompt 03A copy preservation
grep -rn "External Systems" apps/project-control-center/src/surfaces \
  | grep -v "external-systems"
# → 9 hits, all internal architecture JSDoc / Wave 13–15 history comments
#   under apps/project-control-center/src/surfaces/externalSystems/** and
#   approvalsAdapter.ts. No user-facing JSX or rendered string regression.

grep -rn "'external-systems'" apps/project-control-center/src/surfaces | wc -l
# → 39   (one fewer than pre-commit because one removed mount referenced
#   surfaceId="external-systems" as a JSX prop value; routing / discriminator
#   / data attribute / file / folder / component name preservation untouched.)
```

Hosted/tenant proof: **operator-pending, not in scope.**

## 8. Guardrails Preserved

- No edits to `PccSurfaceContextHeader.tsx` or `PccSurfaceContextHeader.module.css`.
- No edits to `PccProjectHeroBand`, `PccApp.tsx`, `projectShellViewModel.ts`, `PccShell.tsx`, or `PccShell.module.css`.
- No edits to `PccProjectContextBand` or `PccProjectContextBand.test.tsx`.
- No edits to `@hbc/models/**`.
- No new state primitives.
- No file/component/route renames. Internal IDs (`'external-systems'` and the seven other surface IDs) preserved in routing, discriminators, data attributes, file/folder/component names.
- No tab icons, URL/hash routing, sticky/fixed shell, fake SharePoint chrome.
- No backend / API / Graph / PnP / Procore runtime changes.
- No SPFx package or manifest version bump.
- No `pnpm-lock.yaml` drift.
- No `git push`.
- No final 56/56 doctrine claim.
- No regression of Prompt 02 canvas seam or Prompt 03A copy alignment.
- No broadening into Prompt 05 routing-integrity scope.

## 9. Residual Risk and Judgment Calls

- **Compact local posture deferral.** Reference-only metadata (posture / source-status / source-confidence / last-updated) was previously surfaced on happy-path through `PccSurfaceContextHeader`. After this commit, that metadata is no longer surfaced anywhere on happy-path. If downstream design wants compact local posture, the most likely candidates for a small in-card status row in a future prompt are: **Documents**, **External Platforms**, **Site Health**, and **Project Readiness**. Any reintroduction must be a compact in-card row — never a re-mounted full-width duplicated header. Documented here so a future agent does not undo this commit chasing "missing posture."
- **Documents specifically:** the `cueFor(props)` helper in `PccDocumentsHeaderCard.tsx` already varies the cue text by `readModelStatus` / `sourceStatus` and continues to convey source-status posture in plain language, mitigating the metadata-loss concern in the short term.
- **`PccShell.navigation.test.tsx` description assertion**: now structural — asserts the hero-description marker exists with non-empty text. The exact text comes from `PCC_SURFACE_HERO_DESCRIPTIONS` which differs from `PCC_MVP_SURFACES.description`. If a future prompt unifies those copy sources, tighten the assertion accordingly.
- **Contract-test invocation pattern.** Project-readiness positive-mount tests use `Object.create(fixtureClient)` so prototype methods remain reachable. If `PccFixtureReadModelClient` is refactored away from a class, the tests will need a new mock strategy.
- **Pre-existing manifest/version-bump files.** Earlier in the wave-b2 chronology the working tree carried modifications to `apps/project-control-center/config/package-solution.json`, `ProjectControlCenterWebPart.manifest.json`, and `tools/spfx-shell/config/package-solution.json`. At this commit's pre-stage point those files are no longer modified in `git status`. Whatever path resolved them did so outside this commit; this commit does not stage or revert them.

## 10. Next-Prompt Handoff

- **Prompt 01 (Add-On Scope Lock and Shell Ownership):** still pending. Scope unchanged.
- **Prompt 02 (project identity + canvas seam):** intact. No edits.
- **Prompt 03A (External Platforms copy alignment):** intact. No `External Systems` regression introduced; the only `External Systems` strings remaining in surfaces are internal Wave 13–15 history JSDoc, untouched here.
- **Prompt 04 (Command Preview and Active Panel Accessibility):** scope unchanged. A11y work continues to validate against the final user-facing label set.
- **Prompt 05 (External Platforms and Routing Integrity):** scope unchanged. Routing and internal IDs intact.
- **Prompt 06 (Host Fit, Responsive Evidence, and Closeout):** scope unchanged. Compact local posture, if needed, is the deferred candidate for a future surface-level pass per §9.

Hosted/tenant proof remains **operator-pending**.
