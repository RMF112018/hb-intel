# Phase 2 Shell Header Consolidation Closeout

Wave: 15A · Sprint: wave-b7 · Phase: 2 (Shell Header Consolidation)

## 1. Objective

Phase 2 consolidated semantic active-surface panel ownership and compact
surface-header metadata into the PCC shell/header layer (`<PccShell>` +
`<PccProjectHeroBand>`) without altering bento direct-child invariants and
without removing surface header / command cards. Card-level
`data-pcc-active-surface-panel` markers were intentionally retained as a
deprecated compatibility bridge so adjacent surface tests, e2e selectors,
and operator-pending tenant evidence stay valid until the next remediation
phase removes duplicate cards in lockstep.

## 2. Final Repo Baseline

**SHA disclosure note.** The pre-closeout local HEAD captured below is a
session-local reference only; treat it as not-yet-pushed repo truth and do
not cite it as a public-facing baseline. The final closeout-commit SHA
(produced when this document is committed) becomes the canonical Phase 2
closeout marker. Recover the closeout-commit SHA via
`git log -1 --pretty='%H %s' -- docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b7/closeout/Phase_2_Shell_Header_Consolidation_Closeout.md`
once it lands.

```
Branch: main
Pre-closeout local HEAD (session reference only):
  ce0fdf6dafa6c00d138e7020545eed285a33e110  docs(pcc): update Prompt 06 closeout manifest v2.0
git status --short (pre-execution): clean
pnpm-lock.yaml MD5: 00570e10e3dc9015188ba503ea996943
package-solution.json solution.version: 1.0.0.18
package-solution.json solution.features[0].version: 1.0.0.18
ProjectControlCenterWebPart.manifest.json version: 1.0.0.18
```

## 3. Commit Inventory

The Phase 2 source-and-evidence commits, in chronological order on
`main`. Citations below use **historical commit SHAs** (already merged
prior to the closeout). The pre-closeout HEAD `ce0fdf6da` is a docs
manifest update and is **not** a substantive Phase 2 source commit; it is
listed in §2 as session reference only.

| SHA         | Subject                                                                      |
| ----------- | ---------------------------------------------------------------------------- |
| `1155470cd` | refactor(pcc): shell `<main>` owns active-surface panel marker (wave-b7 P01) |
| `c7eeb1734` | feat(pcc): shell hero surface metadata seam (wave-b7 P02)                    |
| `dc8cc9f42` | test(pcc): active-tab metadata switching + contract floor (wave-b7 P03)      |
| `b15741255` | test(pcc): all-surface direct-child guardrail (wave-b7 P04)                  |
| `e17751172` | test(pcc-live): shell active-panel evidence posture (wave-b7 P05)            |
| `493fa4de6` | docs(pcc): add Phase 03 command-header package v2 and bump 1.0.0.18          |
| `113d655e6` | chore(pcc): align feature.version with solution.version (1.0.0.18)           |
| `a350603a7` | docs(pcc-live): add surface smoke evidence package 1.0.0.18                  |

`493fa4de6` introduced the `1.0.0.18` package-and-manifest version bump
plus wave-b8 prompt scaffolding. `113d655e6` resolved a partial-bump in
`package-solution.json` (the embedded `feature.version` had stayed at
`1.0.0.17`) so the PCC live env resolver returned `'ready'` and the
tenant tests could dispatch. `a350603a7` committed the resulting live
tenant evidence package.

## 4. Scope Completed

- shell `<main role="tabpanel">` is the semantic active-panel owner;
- tab clicks update both `aria-labelledby="pcc-tab-<surfaceId>"` and
  `data-pcc-active-surface-panel="<surfaceId>"` on shell `<main>`;
- the shell hero now renders compact `surfaceSummaryItems`
  (`mode` / `source` / `authority`), `surfaceCues` (`focus` / `boundary`
  pairs), and a `readOnlyCue` per active surface, switching by tab;
- card-level `data-pcc-active-surface-panel` markers are explicitly
  framed as **deprecated compatibility markers** in tests and in the
  `PccSurfaceRouter` doc comment;
- all eight active surfaces have a full `<PccApp>` integration guardrail
  asserting shell-panel uniqueness, no nested `[data-pcc-card]
[data-pcc-card]`, every card a direct bento child, per-card
  tier / region / footprint / column-span / row-span markers, and
  exactly one direct bento-child compatibility card;
- live Playwright surface smoke records owner / shell evidence as soft
  signals without hard-gating compatibility smoke;
- live tenant evidence is committed under
  `docs/architecture/evidence/pcc-live/surface-smoke-1778249836440/`
  with shell ownership confirmed on every surface.

## 5. Shell Active-Panel Ownership Proof

Source: `apps/project-control-center/src/shell/PccShell.tsx` lines
112–119. The shell `<main>` element is rendered as:

```tsx
<main
  id={ACTIVE_PANEL_ID}
  role="tabpanel"
  aria-labelledby={`pcc-tab-${activeSurfaceId}`}
  className={styles.canvas}
  data-pcc-canvas=""
  data-pcc-active-surface-panel={activeSurfaceId}
>
  <PccBentoGrid forceMode={forceMode}>{children}</PccBentoGrid>
</main>
```

Canonical selector pair tests use:

```
main[role="tabpanel"][data-pcc-active-surface-panel="<surfaceId>"]
aria-labelledby="pcc-tab-<surfaceId>"
```

Source commit: `1155470cd refactor(pcc): shell <main> owns active-surface panel marker (wave-b7 P01)`.

Test sweep that locks the contract:

- `apps/project-control-center/src/tests/PccShell.responsive.test.tsx`
- `apps/project-control-center/src/tests/PccShell.navigation.test.tsx`
- `apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx`
- `apps/project-control-center/src/tests/PccCardTierContract.test.tsx`
  (`getActiveBento` resolves through shell main; `getActiveCompatibilityCard`
  scopes to direct bento children)
- `apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx`
  (Prompt 04 — full per-surface integration)

## 6. Shell Hero Metadata Proof

Production:

- `apps/project-control-center/src/shell/surfaceHeaderMetadata.ts` —
  defines `PccShellSurfaceSummaryTone`, `IPccShellSurfaceSummaryItem`,
  `IPccShellSurfaceCue`, `IPccShellSurfaceHeaderMetadata`, and the
  exhaustive `PCC_SHELL_SURFACE_HEADER_METADATA: Readonly<Record<
PccMvpSurfaceId, IPccShellSurfaceHeaderMetadata>>` covering all eight
  MVP surfaces.
- `apps/project-control-center/src/preview/projectShellViewModel.ts` —
  re-exports the new type symbols and extends `IPccShellHeroViewModel`
  with `surfaceSummaryItems`, `surfaceCues`, `readOnlyCue`.
  `deriveShellHeroViewModel` derives those fields from the active
  `PccMvpSurfaceId` via the metadata table by reference.
- `apps/project-control-center/src/shell/PccProjectHeroBand.tsx` —
  renders inert summary and cue / read-only zones using
  `data-pcc-hero-surface-summary`, `data-pcc-hero-summary-item`,
  `data-pcc-hero-summary-tone` (default `'neutral'`),
  `data-pcc-hero-surface-cues`, `data-pcc-hero-surface-cue`,
  `data-pcc-hero-read-only-cue`. No interactive descendants in the new
  zones.
- `apps/project-control-center/src/shell/PccProjectHeroBand.module.css` —
  extends grid-template-areas with `summary` and `cues` rows; styles use
  only `var(--pcc-color-*)`, `var(--pcc-space-*)`, `var(--pcc-radius-*)`,
  `var(--pcc-status-*)`, and `var(--pcc-hero-accent)` tokens.

Tests:

- `apps/project-control-center/src/tests/projectShellViewModel.test.ts`
  — per-surface presence / non-empty fields, by-reference equality with
  the metadata table, Project Home and Approvals targeted copy locks,
  Prompt 03 contract floor (≥3 summary items, ≥2 cues per surface; key
  parity over `PCC_MVP_SURFACE_IDS`; no `http://` / `https://` URL in any
  value; no affirmative-action verb as a `label`).
- `apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx` —
  per-surface marker count, label / value text, declared order,
  default-tone fallback to `'neutral'`, zero-interactive descendants in
  the new zones, no forbidden source-confidence / pill markers.
- `apps/project-control-center/src/tests/PccShell.responsive.test.tsx`
  — Prompt 02 presence smoke at standardLaptop and phone modes; Prompt
  03 active-tab metadata switching for **Project Home (default)**,
  **Documents (click)**, and **Site Health (click)** with scoped
  `afterEach(cleanup)` and a private `expectShellHeroMetadata` helper.

Source commits: `c7eeb1734` (Prompt 02), `dc8cc9f42` (Prompt 03).

## 7. Direct-Child / No-Nested-Card Proof

Source:

- `apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx`
  — Prompt 04 all-eight-surface integration block with scoped
  `afterEach(cleanup)`. Helpers: `renderAppOnSurface`, `getShellPanel`
  (`querySelectorAll` + `toHaveLength(1)` so a duplicate render fails
  the helper instead of being silently masked), `getBentoFromShellPanel`.
- `apps/project-control-center/src/tests/PccCardTierContract.test.tsx`
  — Prompt 01 `getActiveBento` resolves through shell main;
  `expectCardsAreDirectChildrenOfBento` enforces
  `card.parentElement === bento` per surface (stricter than a
  `[data-pcc-card] [data-pcc-card]` selector check).

Per-surface guardrail asserted on every entry of `PCC_MVP_SURFACE_IDS`
(`project-home`, `team-and-access`, `documents`, `project-readiness`,
`approvals`, `external-systems`, `control-center-settings`,
`site-health`):

| Guardrail                      | Assertion                                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Exactly one shell active panel | `querySelectorAll('main[role="tabpanel"][data-pcc-active-surface-panel="<id>"]')` length `1`                                       |
| Shell panel is `<main>`        | `panel.tagName === 'MAIN'`                                                                                                         |
| Shell panel role               | `role="tabpanel"`                                                                                                                  |
| Shell panel `aria-labelledby`  | `pcc-tab-<id>`                                                                                                                     |
| Cards present                  | `≥ 1 [data-pcc-card]`                                                                                                              |
| No nested cards                | `bento.querySelectorAll('[data-pcc-card] [data-pcc-card]').length === 0`                                                           |
| Direct bento children          | every `card.parentElement === bento`                                                                                               |
| Card markers                   | non-empty `data-pcc-card-tier`, `data-pcc-card-region`, `data-pcc-footprint`; positive `data-pcc-column-span`, `data-pcc-row-span` |
| Compatibility card uniqueness  | exactly one direct bento-child carries `[data-pcc-card][data-pcc-active-surface-panel="<id>"]`                                     |

Source commit: `b15741255 test(pcc): all-surface direct-child guardrail (wave-b7 P04)`.

## 8. Playwright / Live Evidence Proof

Committed evidence package:

```
docs/architecture/evidence/pcc-live/surface-smoke-1778249836440/pcc-live-surface-smoke.json
docs/architecture/evidence/pcc-live/surface-smoke-1778249836440/pcc-live-surface-smoke.md
```

**Run summary:**

```
Run ID: pcc-live-surface-smoke-1778249836440
Generated: 2026-05-08T14:17:16.440Z
runState: completed
selfSkipped: false
totalSurfaces: 8
passedSurfaces: 8
failedSurfaces: 0
totalGridCount: 8
totalCardCount: 64
consoleErrorCount: 0
pageErrorCount: 0
warnings: none
```

**Per-surface ownership** (identical across all eight surfaces):

```
activePanelOwnerTagName: "MAIN"
activePanelRole:         "tabpanel"
activePanelId:           "pcc-active-surface-panel"
activePanelIsShellMain:  true
shellActivePanelCount:   1
activePanelCount:        2     (shell main + direct bento-child compatibility card)
warning:                 (none)
```

Surfaces covered: `project-home`, `team-and-access`, `documents`,
`project-readiness`, `approvals`, `external-systems`,
`control-center-settings`, `site-health`.

**Package-version label caveat:** the committed evidence label is
`expectedPackageVersion: 1.0.0.18`. Operator notes indicate the deployed
tenant package observed at runtime may still be `1.0.0.17`. The DOM
evidence (shell ownership confirmed on every surface, zero console / page
errors, no warnings) is the substantive proof of the Phase 2 shell
change in tenant; the `expectedPackageVersion` label is local
source-derived evidence metadata and reflects the local
`package-solution.json` value at evidence-generation time, not the
hosted `.sppkg` filename. Treat the evidence as confirming **shell-DOM
parity with Phase 2**, not as confirming a specific deployed package
filename.

Source commits: `e17751172` (Prompt 05 source), `113d655e6` (env-resolver
unblock — `feature.version` aligned to `1.0.0.18`), `a350603a7` (evidence
package commit).

## 9. Package / Manifest / Lockfile Baseline

> Package/manifest baseline is intentionally `1.0.0.18` after committed
> version-alignment work (`493fa4de6` + `113d655e6`). No additional
> package, manifest, package-solution, dependency, or lockfile drift was
> introduced during Prompt 06.

- `apps/project-control-center/config/package-solution.json`
  `solution.version` = `1.0.0.18`.
- `apps/project-control-center/config/package-solution.json`
  `solution.features[0].version` = `1.0.0.18`.
- `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json`
  `version` = `1.0.0.18`.
- `pnpm-lock.yaml` MD5 = `00570e10e3dc9015188ba503ea996943` — preserved
  across the entire wave-b7 sequence and re-asserted before and after
  Prompt 06's validation block.
- root `package.json`: no edit. `apps/project-control-center/package.json`:
  no edit.
- No dependency add / install / update / remove during the entire
  wave-b7 sequence.

## 10. Compatibility Bridge Status

Phase 2 posture intentionally produces **two**
`[data-pcc-active-surface-panel]` matches in shell-rendered trees on
every active surface:

1. the **semantic owner** — shell `<main role="tabpanel">` (Prompt 01);
2. **one direct bento-child compatibility command card** — emitted by
   the surface-specific command/header card per `PccDashboardCard`'s
   `dataActiveSurfacePanel` prop.

Tests scope to the **shell selector** for ownership claims and to the
**direct-bento-child selector** for compatibility claims; no
shell-rendered test asserts global broad-marker count of `1`. The
canonical posture documentation lives in `apps/project-control-center/
src/shell/PccSurfaceRouter.tsx` lines 70–79 (Prompt 01 doc-comment
correction) and the `surfaceHeaderMetadata.ts` docblock (Prompt 02).
Helper APIs that lock the bridge:

- `getActiveBento(container, surfaceId)` —
  `PccCardTierContract.test.tsx`
- `getActiveCompatibilityCard(bento, surfaceId)` —
  `PccCardTierContract.test.tsx`
- `getSoleActivePanel(container, surfaceId)` —
  `PccSurfaceCommandCardContract.test.tsx`
- `getShellPanel(container, surfaceId)` —
  `PccApp.bentoIntegration.test.tsx`

Card-level marker removal is **deferred**. Future duplicate-card removal
must update tests, e2e selectors, and committed evidence in lockstep.

## 11. Deferred Work / Phase 3 Handoff

- Duplicate bento header / top-level cards remain intentionally — no
  Phase 2 prompt removed them.
- Card-level `data-pcc-active-surface-panel` compatibility markers
  remain intentionally as the deprecated bridge.
- Phase 3 should handle conditional command-header content and
  duplicate-card removal in lockstep with Playwright evidence selectors
  and committed evidence.
- Future evidence-writer enhancement: record artifact paths as
  repo-relative rather than absolute filesystem paths. The committed
  `surface-smoke-1778249836440/pcc-live-surface-smoke.md` currently
  embeds absolute local paths under `/Users/.../hb-intel/...`.
- Stale `PccCardTierContract.test.tsx` top-of-file comment claims
  `project-readiness` is intentionally excluded from the generic loop;
  the current `IN_SCOPE_SURFACES` array DOES include
  `'project-readiness'`. Minor cleanup gated on the next prompt that
  touches that file.
- Hosted parity on next deploy: when a new `.sppkg` (1.0.0.18 or later)
  deploys, the existing tenant-lag warning logic continues to work
  without code change; future evidence runs will continue to show
  shell-owner DOM matching Phase 2.

## 12. Validation Commands

Validation gate run during Prompt 06 closeout. The Playwright surface-
smoke spec is invoked with `PCC_LIVE_STORAGE_STATE` overridden to a
non-existent path so the live hosted tests **self-skip** — this prevents
generating a new untracked `surface-smoke-<timestamp>/` directory at
closeout time. The committed `surface-smoke-1778249836440/` package
remains the canonical Phase 2 closeout evidence.

Recorded commands and outcomes are appended below the bullets after
execution. The post-execution chat report includes the full output.

```
git status --short                                        # snapshots 1–3 (pre / post-doc / post-commit)
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD                                        # captured for §2
md5 pnpm-lock.yaml                                        # preserved 00570e10e3dc9015188ba503ea996943
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
PCC_LIVE_STORAGE_STATE=/nonexistent/path/closeout-skip \
  pnpm exec playwright test --config=playwright.pcc-live.config.ts \
  e2e/pcc-live/pcc-live.surface-smoke.spec.ts             # 4 passed (registry, sanitizer, two non-live owner tests); 2 self-skipped
pnpm exec prettier --check <touched + Phase 2 surface files>
git diff --check
git diff --cached --name-only                             # pre-commit audit: only the closeout markdown
```

## 13. Residual Risks

- **Pre-closeout local HEAD `ce0fdf6da` is session reference only.**
  Until pushed and verified externally, do not cite that SHA as public
  Phase 2 closeout state. The closeout-commit SHA produced when this
  document is committed is the canonical marker; recover it via
  `git log -1 --pretty='%H %s' -- docs/architecture/plans/MASTER/spfx/
pcc/phase-03/wave-15A/wave-b7/closeout/Phase_2_Shell_Header_
Consolidation_Closeout.md`.
- **`expectedPackageVersion: 1.0.0.18` evidence label vs deployed
  tenant `.sppkg`.** Operator notes indicate the deployed package may
  still be `1.0.0.17`. DOM evidence is substantive; the label is
  metadata. Future evidence runs after a tenant `1.0.0.18+` deploy
  will close this gap automatically.
- **Committed live evidence is baseline EV-52 / EV-55 only.** Final
  scorecard EV capture requires operator review per the writer's
  embedded disclaimer.
- **Card-level compatibility markers and duplicate header cards remain
  in place** pending the next remediation phase; tests, e2e selectors,
  and evidence must move in lockstep when that phase lands.
- **Evidence writer records absolute local paths.** Minor housekeeping
  for a follow-up prompt; not blocking Phase 2 closeout.
- **Closeout-time Playwright re-run is non-live.** The live hosted
  tests are forced to self-skip via env override during this validation
  block; therefore this closeout did not produce a new
  `surface-smoke-<timestamp>/` directory. The canonical evidence
  remains `surface-smoke-1778249836440/` (`a350603a7`).

---

> Operator review is required before treating any committed PCC live
> evidence as captured EV. This closeout document is a Phase 2
> consolidation summary; it is not a final scorecard result.
