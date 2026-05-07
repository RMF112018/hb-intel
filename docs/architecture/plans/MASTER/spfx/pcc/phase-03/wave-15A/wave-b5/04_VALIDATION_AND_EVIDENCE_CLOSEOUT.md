# Validation and Evidence Closeout

This document is the Wave 15A B5 sprint closeout for the Project Readiness command-first remediation. It records the Prompt 01–05 commit chain, the validation evidence, the Playwright live-suite run, and the old-vs-new evidence comparison against the prior baseline.

## Scorecard posture

This remediation alone does not achieve any of the following — the scorecard remains expert-reviewed and evidence-supported, not auto-scored:

- 100-point scorecard pass;
- 56/56 pass;
- Phase 4 readiness;
- hard-stop closure.

Live Playwright evidence is review-support only; package-scope vitest and check-types results are not hosted/runtime proof.

## Commit chain

| Prompt | Commit                     | Scope                                                                    |
| ------ | -------------------------- | ------------------------------------------------------------------------ |
| 01     | `805edd00f`                | command-first surface; module-index card; default ≤ 12 cards             |
| 02     | `e32751adb`                | detail-section renderer; all 7 detail drilldowns; sibling tests restored |
| 03     | `004763243`                | read-model parity + degraded-state coverage                              |
| 04     | `be81bdaaf`                | compact loading/error; circular-import break; false-affordance hardening |
| 05     | `<filled-in-after-commit>` | card-tier audit + Playwright evidence closeout                           |

## Pre-implementation repo check

```bash
git status --short
git branch --show-current
```

## Local validation commands (Wave 15A B5 actual)

The wave package filter is `@hbc/spfx-project-control-center`. Use this filter, not the older `@hbc/project-control-center` reference.

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccProjectReadinessSurface )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccProjectReadinessDensityContract )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccCardTierContract )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts )
pnpm exec prettier --check \
  apps/project-control-center/src/tests/PccCardTierContract.test.tsx \
  apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx \
  apps/project-control-center/src/tests/PccProjectReadinessDensityContract.test.tsx \
  docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b5/04_VALIDATION_AND_EVIDENCE_CLOSEOUT.md
git diff --check
git status --short
```

Do not edit package scripts, `package.json`, `pnpm-lock.yaml`, package-solution files, manifests, or vitest config for this remediation.

## Static validation results (Prompt 05 run)

| Step                                                         | Result                      |
| ------------------------------------------------------------ | --------------------------- |
| `pnpm --filter @hbc/spfx-project-control-center check-types` | clean                       |
| `vitest run PccProjectReadinessSurface`                      | 72 passed                   |
| `vitest run PccProjectReadinessDensityContract`              | 7 passed                    |
| `vitest run PccCardTierContract`                             | 57 passed                   |
| `vitest run` (full workspace)                                | 1916 passed across 90 files |
| `prettier --check` (closeout doc + 3 test files)             | clean                       |
| `git diff --check`                                           | clean                       |

No card-tier-contract patches were required in Prompt 05 — the `IN_SCOPE_SURFACES` generic loop covers the default command-overview path; the targeted Project Readiness assertions (per-card tier/region/footprint expectations) already select the matching detail section before lookup, courtesy of the Prompt 02 `renderProjectReadiness(sectionId?)` helper.

## Default and selected-section card counts

| State                             | Card count                                              |
| --------------------------------- | ------------------------------------------------------- |
| Default command (ready / preview) | **9** (hero + 7 native command-critical + module-index) |
| Compact loading                   | **2** (hero state + module-index)                       |
| Compact error                     | **2** (hero state + module-index)                       |
| Source-unavailable preview        | 9 (preview shape preserved)                             |

Default card count cap of `≤ 12` holds. Detail-mode densities are intentionally not capped.

## Selected-section coverage

All seven detail drilldowns are covered by `PccProjectReadinessSurface.test.tsx` (Prompt 02 click-and-assert + Prompt 04 selected-detail tier/region/footprint consistency):

- `lifecycle-readiness` → `[data-pcc-readiness-section="lifecycle-readiness-center"]`
- `permits-inspections` → `[data-pcc-readiness-section="permit-inspection-control-center"]`
- `responsibility-matrix` → `[data-pcc-readiness-section="responsibility-matrix"]`
- `constraints` → `[data-pcc-readiness-section="constraints-log"]`
- `buyout` → `[data-pcc-readiness-section="buyout-log"]`
- `procore-source-confidence` → `[data-pcc-card-id="procore-source-confidence"]`
- `unified-lifecycle` → all three body markers (`[data-pcc-lifecycle-timeline]`, `[data-pcc-project-memory]`, `[data-pcc-related-records]`)

Each selected-section assertion verifies: selected marker present, non-selected detail markers absent, exactly one `data-pcc-active-surface-panel` marker, no `[data-pcc-card] [data-pcc-card]` nesting, every rendered card a direct child of `[data-pcc-bento-grid]`, and explicit tier-source / region-source / non-empty footprint.

## Live Playwright evidence rerun

Canonical reference:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_Playwright_Evidence_Subset_Map.md
```

### Required environment variables

```bash
PCC_LIVE_SITE_URL
PCC_LIVE_PAGE_URL
PCC_LIVE_STORAGE_STATE
PCC_EXPECTED_PACKAGE_VERSION
PCC_EVIDENCE_OUTPUT_DIR   # set per-run; e.g. docs/architecture/evidence/pcc-live/<YYYYMMDD-HHMMSS>-wave-15A-b5-prompt-05
```

### Commands run (Prompt 05)

```bash
export PCC_LIVE_SITE_URL="https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject"
export PCC_LIVE_PAGE_URL="https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/CollabHome.aspx"
export PCC_LIVE_STORAGE_STATE="$HOME/.pcc-live-auth/pcc-live-storage-state.json"
export PCC_EXPECTED_PACKAGE_VERSION="1.0.0.17"
export PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05"

pnpm pcc:e2e:live:list           # 75 tests in 13 files
pnpm pcc:e2e:evidence:registry   # 7 passed (registry sanity + manifest)
pnpm pcc:e2e:live                # 74 passed, 1 skipped (web-part-installed gate; expected)
```

### Evidence output path

```text
docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/
```

### Evidence artifacts produced

```text
accessibility-1778188606395/
  pcc-live-accessibility-evidence.{json,md}
  pcc-live-aria-label-summary.json
  pcc-live-axe-summary.json
  pcc-live-contrast-summary.json
  pcc-live-keyboard-focus-summary.json

breakpoints-1778188624999/
  breakpoint-screenshots/                  (8 viewports × 8 surfaces)
  pcc-live-breakpoint-card-measurements.json
  pcc-live-breakpoint-evidence.{json,md}
  pcc-live-breakpoint-matrix.json
  pcc-live-breakpoint-touch-targets.json

conditional-1778188651600/
  pcc-live-conditional-{auth,focus,layout,setup,state}-summary.json
  pcc-live-conditional-evidence.{json,md}

content-1778188651911/
  construction-language-review.md
  content-review-findings.json
  disabled-reason-copy-review.md
  extracted-visible-copy.json
  hbi-authority-language-review.md
  pcc-live-content-evidence.{json,md}
  source-of-record-language-review.md
  state-copy-quality-review.md

surface-screenshots-1778188679091/
  pcc-live-dom-card-summary.json
  pcc-live-screenshot-evidence.{json,md}
  pcc-live-screenshot-inventory.json
  screenshots/                              (3 captures × 8 surfaces)

surface-smoke-1778188695548/
  pcc-live-surface-smoke.{json,md}

workflow-1778188695837/
  pcc-live-action-summary.json
  pcc-live-false-affordance-summary.json
  pcc-live-hbi-authority-summary.json
  pcc-live-source-summary.json
  pcc-live-state-summary.json
  pcc-live-workflow-evidence.{json,md}

pcc-evidence-registry.log
pcc-live-full-suite.log
pcc-live-list.log
```

The scorecard report (`pcc-live-scorecard-report.{json,md}`) listed in some prior runs was not emitted by this suite version — the scorecard traceability tests at `pcc-scorecard.traceability.spec.ts` operate as in-memory fixture checks and do not write a separate JSON/MD report.

## Old-vs-new evidence comparison

Baseline: `docs/architecture/evidence/pcc-live/20260507-134047/`.
New: `docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/`.

### Project Readiness card count

Source: `pcc-live-dom-card-summary.json` (filter `surfaceId == "project-readiness"`).

| Run                              | Card count |
| -------------------------------- | ---------- |
| Old baseline (20260507-134047)   | **62**     |
| New (20260507-171608, Prompt 05) | **9**      |

The new card count satisfies the Wave 15A B5 default command cap (`≤ 12`).

### Project Readiness measured container heights

Source: `pcc-live-breakpoint-matrix.json` (`grid.measuredContainerHeight`, filter `surfaceId == "project-readiness"`).

| Viewport              | Old (px) | New (px) |  Δ (px) |
| --------------------- | -------: | -------: | ------: |
| phone-390             |   56,264 |    8,216 | −48,048 |
| tablet-portrait-768   |   39,584 |    5,336 | −34,248 |
| tablet-landscape-1024 |   30,944 |    5,072 | −25,872 |
| small-laptop-1180     |   36,944 |    4,784 | −32,160 |
| standard-laptop-1366  |   26,960 |    4,328 | −22,632 |
| large-laptop-1536     |   26,384 |    4,208 | −22,176 |
| desktop-1728          |   25,712 |    4,112 | −21,600 |
| ultrawide-2048        |   25,328 |    4,064 | −21,264 |

Phone (~56k → ~8k) and standard-laptop (~27k → ~4k) match the Wave 15A B5 README's stated remediation goal.

### Horizontal overflow

| Viewport              | New `horizontalScrollDetected` | New `viewportOverflowX` |
| --------------------- | ------------------------------ | ----------------------- |
| phone-390             | false                          | 0                       |
| tablet-portrait-768   | false                          | 0                       |
| tablet-landscape-1024 | false                          | 0                       |
| small-laptop-1180     | false                          | 0                       |
| standard-laptop-1366  | false                          | 0                       |
| large-laptop-1536     | false                          | 0                       |
| desktop-1728          | false                          | 0                       |
| ultrawide-2048        | false                          | 0                       |

No horizontal-overflow regression.

### Card nesting / direct-child posture

The breakpoint matrix and DOM card summary do not surface a per-card "nested-card" boolean, but the package-scope vitest contract suite (`PccProjectReadinessDensityContract`, `PccProjectReadinessSurface`) asserts `[data-pcc-card] [data-pcc-card]` count is 0 and every card's `parentElement === [data-pcc-bento-grid]` across both default and selected-detail paths. All 1916 workspace tests pass on the Prompt 04 + Prompt 05 baseline, so no regression at the package level. The hosted breakpoint screenshots show the bento as a flat grid at every viewport; visual inspection corroborates the package-scope invariant.

### False-affordance summary

Source: `workflow-1778188695837/pcc-live-false-affordance-summary.json`.

| Metric                                                                        | Value |
| ----------------------------------------------------------------------------- | ----- |
| Total Project Readiness entries scanned (new)                                 | 33    |
| Project Readiness entries with `falseAffordanceRisk == "none-observed"` (new) | 33    |
| Project Readiness entries with `needsReview == true` (new)                    | **0** |
| Project Readiness entries scanned (old)                                       | 32    |

No new Project Readiness false-affordance findings.

### HBI / source-authority summary

Source: `workflow-1778188695837/pcc-live-hbi-authority-summary.json`.

| Metric                                                     | Value |
| ---------------------------------------------------------- | ----- |
| Project Readiness entries with `needsReview == true` (new) | 1     |
| Project Readiness entries with `needsReview == true` (old) | 1     |

The single `needsReview` entry on the project-readiness active-surface panel is **unchanged from baseline** — the same `[data-pcc-active-surface-panel="project-readiness"]` selector matched in both runs because the hero copy "Workflow execution and approvals are managed by your PCC administrator" trips the framework's `mutationAuthorityClaimObserved` heuristic via the word "approvals." This is a pre-existing curated copy line, intentionally retained as the no-execution caption. No regression.

### Accessibility (axe) summary

Source: `accessibility-1778188606395/pcc-live-axe-summary.json`.

| Surface           | Rule           | Impact  | Old count | New count |
| ----------------- | -------------- | ------- | --------: | --------: |
| project-readiness | color-contrast | serious |        11 |        11 |

No new Project Readiness-specific accessibility blockers introduced by Prompts 01–05. The 11 color-contrast findings are pre-existing baseline targets surfaced by the metric-cell label class (`._metricLabel_*`) and apply equally to Project Home; they are not introduced by the command-first remediation.

## Evidence commit discipline

```bash
find docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05 -maxdepth 4 -type f | sort
```

Forbidden-artifact scan (all zero):

| Artifact pattern                  | Count |
| --------------------------------- | ----- |
| storage-state files               | 0     |
| `*.auth.json` / auth.json         | 0     |
| `playwright-report/`              | 0     |
| `test-results/`                   | 0     |
| HAR files                         | 0     |
| trace files (`*.trace*`, `*.zip`) | 0     |

Total artifacts: 28 JSON, 12 MD, 88 PNG, 3 logs, ~17 MB.

## Residual risks

- **Detail-mode density not capped.** The `≤ 12` cap applies to the default command view only. Detail-mode card counts vary per section (e.g. Permit/Inspection renders 12+ cards) and are intentionally not capped; that is a Wave 15A B5 sprint decision.
- **Cross-mount selection persistence not addressed.** `selectedSectionId` is React local state and resets when the surface unmounts (e.g. tab navigation away and back). A persistence layer is out of Wave 15A B5 scope.
- **`LifecycleReadinessRegions` and its nine inner card components remain inline in `PccProjectReadinessSurface.tsx` (~700 lines).** The Prompt 04 render-prop fix breaks the circular import without moving the code. Extraction to a separate file is a follow-on cleanup.
- **Pre-existing prettier formatting issue in `apps/project-control-center/src/surfaces/projectReadiness/lifecycleReadinessAdapter.test.ts`** is not introduced by Prompts 01–05.
- **Package-scope typecheck/test results are not hosted/runtime proof.** Treat the 1916-vitest baseline as design-time correctness only; live Playwright evidence is the closest available runtime proof and is review-support only — it does not constitute Phase 4 readiness or scorecard pass.
- **HBI-authority `needsReview` baseline of 1** is preserved; the heuristic match is on the canonical "approvals are managed by your PCC administrator" hero caption and is intentional copy.

## Closeout summary

```text
Commit chain:               805edd00f → e32751adb → 004763243 → be81bdaaf → <Prompt 05 SHA>
Default Project Readiness card count:           9 (≤ 12 cap)
Compact loading/error card count:               2 (hero state + module-index)
Selected detail sections covered:               7 (lifecycle-readiness, permits-inspections,
                                                   responsibility-matrix, constraints, buyout,
                                                   procore-source-confidence, unified-lifecycle)
Static validation:                              clean
Vitest validation:                              1916 passed across 90 files
Playwright evidence run:                        74 passed, 1 skipped (web-part-installed gate)
Evidence output path:                           docs/architecture/evidence/pcc-live/
                                                  20260507-171608-wave-15A-b5-prompt-05/
Old card count → new card count:                62 → 9
Old phone height → new phone height:            56,264 px → 8,216 px (−48,048)
Old standard-laptop height → new:               26,960 px → 4,328 px (−22,632)
Horizontal overflow regression:                 none at any breakpoint
False-affordance regression:                    none (0 needsReview for project-readiness)
HBI-authority regression:                       none (1 needsReview unchanged from baseline)
Accessibility (axe) regression:                 none (11 color-contrast unchanged from baseline)
```
