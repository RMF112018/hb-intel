# Prompt 05 — Card-Tier Contract Audit and Playwright Evidence Closeout

## Role

You are the local code agent working in the `hb-intel` repository. You are implementing the final controlled Project Readiness remediation closeout for the PCC SPFx application.

This is **Wave 15A B5 / Prompt 05**. Treat Prompts 01–04 as landed repo truth unless the current working tree proves otherwise.

## Current commit chain / accepted progress

Use the following as the current remediation baseline:

```text
Prompt 01 — 805edd00f
Command-first Project Readiness default view. Default embedded module wall removed. Module index introduced. Default Project Readiness card count capped at <= 12.

Prompt 02 — e32751adb
Detail-section renderer wired. All seven detail sections selectable. Prompt 01 validation exception closed. Workspace vitest green at 1889 passed.

Prompt 03 — 004763243
Read-model parity and degraded-state test hardening. Unified Lifecycle acceptable data-flow shape confirmed. Workspace vitest green at 1900 passed.

Prompt 04 — be81bdaaf
Compact loading/error behavior, circular import removal, false-affordance hardening, drilldown accessibility lock, selected-detail structural consistency. Workspace vitest green at 1916 passed.
```

## Non-negotiable agent instructions

- Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
- Do not touch unrelated dirty files.
- Do not edit `package.json`, `pnpm-lock.yaml`, package-solution files, manifests, or test-runner config.
- Do not modify `PccBentoGrid`, `PccDashboardCard`, or `footprints.ts` unless a blocking validation failure proves this remediation cannot be completed otherwise. If that happens, stop and report the exact evidence before editing shared primitives.
- Preserve bento direct-child behavior: every rendered `[data-pcc-card]` must have `parentElement === [data-pcc-bento-grid]`.
- Do not nest `PccDashboardCard` inside another `PccDashboardCard`.
- Do not introduce live writes, uploads, syncs, approvals, external launches, mutations, or API side effects.
- Preserve read-only/source-confidence/HBI/source-of-record boundary language.
- Do not change product behavior unless a test reveals a legitimate repo-truth defect.
- Treat Playwright evidence as required for final evidence closeout. If live Playwright environment variables are unavailable, stop and report the exact missing variables; do **not** claim evidence closeout.
- Do not commit `test-results/`, `playwright-report/`, storage-state files, browser traces with secrets, or any `.auth` / credential artifacts.

## Objective

Perform the final Prompt 05 audit/update pass for Project Readiness card-tier contracts and evidence closeout.

This prompt should:

1. Verify `PccCardTierContract.test.tsx` is aligned to the current command/detail structure.
2. Patch card-tier/direct-child tests only if repo truth shows a remaining mismatch.
3. Preserve existing Project Readiness surface and density tests from Prompts 01–04.
4. Run static validation and full app vitest.
5. Run the PCC live Playwright evidence suite against the configured non-production tenant/runtime.
6. Compare the new Playwright evidence against the prior baseline evidence.
7. Update Wave 15A B5 closeout documentation with the final commit chain, validation results, Playwright evidence path, and residual risks.

## Current expected behavior

### Default command view

- Ready / preview default command view renders exactly 9 cards:
  - Project Readiness hero
  - 7 native command-critical readiness cards
  - module-index card
- Default command view must remain `<= 12` cards.
- Embedded module detail sections must not render in the default DOM.

### Loading/error primary-readiness states

- Loading and error states render exactly 2 cards:
  - hero state card
  - module-index card
- `FixtureScaffoldRegions` was deleted in Prompt 04 and must not be reintroduced.

### Selected detail sections

All seven selected detail sections must remain selectable from `data-pcc-readiness-drilldown-control`:

```text
lifecycle-readiness
permits-inspections
responsibility-matrix
constraints
buyout
procore-source-confidence
unified-lifecycle
```

For each selected detail section:

- hero remains the sole `data-pcc-active-surface-panel="project-readiness"` owner;
- module-index remains visible;
- only the selected detail group renders;
- non-selected detail markers remain absent;
- every `[data-pcc-card]` remains a direct child of `[data-pcc-bento-grid]`;
- no `[data-pcc-card] [data-pcc-card]` nesting exists;
- every rendered card has explicit tier source, explicit region source, and a non-empty footprint.

### Enabled controls / false affordance posture

- Enabled buttons inside Project Readiness must be local view-selection/drilldown controls only.
- Enabled buttons must carry `data-pcc-readiness-drilldown-control`.
- No enabled button text may match either the broad Prompt 03 executable-verb discipline or the Prompt 04 exact-match forbidden regex:

```text
/^(submit|approve|upload|run|execute|sync|write\s*back|writeback|complete\s*checklist|launch|create|modify|delete|save)$/i
```

## Primary files to inspect and patch only if needed

```text
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessDensityContract.test.tsx
```

## Documentation files to update for closeout

Update existing Wave 15A B5 docs if present. Prefer the current canonical folder:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b5/
```

Minimum documentation update target:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b5/04_VALIDATION_AND_EVIDENCE_CLOSEOUT.md
```

If that file does not exist in the current working tree, create a Prompt 05 closeout file in the same folder:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b5/05_PROMPT_05_CARD_TIER_AND_PLAYWRIGHT_EVIDENCE_CLOSEOUT.md
```

Documentation must include:

- Prompt 01–04 commit chain and Prompt 05 commit SHA after commit.
- Final default Project Readiness card count.
- Loading/error compact card count.
- Selected detail sections covered.
- Static validation results.
- Full workspace vitest result.
- Playwright evidence command results.
- New evidence output path.
- Old-vs-new evidence comparison table.
- Residual risks.
- Clear statement that Playwright evidence is not automatic Phase 4 approval or final score.

## Implementation requirements

### 1. Audit card-tier contract alignment

Inspect `PccCardTierContract.test.tsx` only as needed.

Expected current posture after Prompts 02–04:

- Generic explicit-source loop may inspect the default Project Readiness command overview only.
- Targeted Project Readiness assertions for embedded/detail cards must select the relevant detail section before finding target cards.
- Lifecycle detail card assertions must select `lifecycle-readiness`.
- Permit / inspection detail assertions must select `permits-inspections`.
- Responsibility Matrix assertions must select `responsibility-matrix`.
- Buyout assertions must select `buyout`.
- Procore source confidence assertions must select `procore-source-confidence`.
- Unified Lifecycle assertions, if present, must select `unified-lifecycle`.

Patch the test only if any assertion still assumes embedded/detail cards exist by default.

### 2. Preserve Project Readiness density and surface tests

Do not weaken existing Prompt 01–04 tests.

Specifically preserve coverage for:

- default command `<= 12` density cap;
- default ready/preview card count of 9;
- compact loading/error card count of 2;
- embedded detail markers absent by default;
- selected-detail direct-child invariant;
- no card nesting;
- unique active-surface marker;
- selected-detail explicit tier/region/footprint consistency;
- false-affordance discipline;
- read-model degraded-state behavior.

If you must update tests, preserve or strengthen the assertions. Do not loosen them to make validation pass.

### 3. Add missing selected-section direct-child coverage only if absent

If `PccProjectReadinessDensityContract.test.tsx` or `PccProjectReadinessSurface.test.tsx` does not already cover each selected detail section, add/restore coverage for:

```text
lifecycle-readiness
permits-inspections
responsibility-matrix
constraints
buyout
procore-source-confidence
unified-lifecycle
```

Each selected-section assertion must verify:

- selected marker present;
- non-selected detail markers absent;
- exactly one `data-pcc-active-surface-panel` marker;
- no `[data-pcc-card] [data-pcc-card]` nesting;
- every rendered card parent is `[data-pcc-bento-grid]`.

### 4. Evidence closeout documentation

Update Wave 15A B5 closeout docs with exact repo-truth results after validation.

Do not invent evidence values. Extract them from command output and evidence JSON/MD files.

Record at minimum:

```text
Prompt 01: 805edd00f
Prompt 02: e32751adb
Prompt 03: 004763243
Prompt 04: be81bdaaf
Prompt 05: <new commit SHA>
```

Record final test counts from the actual commands. Do not copy prior expected numbers unless the command output matches.

## Strong Playwright validation requirement

Prompt 05 is not complete without live Playwright evidence unless the live environment is unavailable. If unavailable, stop and report `BLOCKED: live Playwright environment unavailable` with exact missing variables. Do not claim evidence closeout.

### 4A. Required environment variables

Before running Playwright, validate these environment variables are present and non-empty:

```bash
PCC_LIVE_SITE_URL
PCC_LIVE_PAGE_URL
PCC_LIVE_STORAGE_STATE
PCC_EXPECTED_PACKAGE_VERSION
```

Set `PCC_EVIDENCE_OUTPUT_DIR` if it is not already set:

```bash
export PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/$(date +%Y%m%d-%H%M%S)-wave-15A-b5-prompt-05"
mkdir -p "$PCC_EVIDENCE_OUTPUT_DIR"
```

Then validate:

```bash
: "${PCC_LIVE_SITE_URL:?missing PCC_LIVE_SITE_URL}"
: "${PCC_LIVE_PAGE_URL:?missing PCC_LIVE_PAGE_URL}"
: "${PCC_LIVE_STORAGE_STATE:?missing PCC_LIVE_STORAGE_STATE}"
: "${PCC_EVIDENCE_OUTPUT_DIR:?missing PCC_EVIDENCE_OUTPUT_DIR}"
: "${PCC_EXPECTED_PACKAGE_VERSION:?missing PCC_EXPECTED_PACKAGE_VERSION}"
```

If any required variable is missing, stop. Do not run a partial Playwright closeout. Do not commit documentation that claims live evidence passed.

### 4B. Required Playwright commands

Run the full live suite, not just a targeted subset:

```bash
pnpm pcc:e2e:live:list | tee "$PCC_EVIDENCE_OUTPUT_DIR/pcc-live-list.log"
pnpm pcc:e2e:evidence:registry | tee "$PCC_EVIDENCE_OUTPUT_DIR/pcc-evidence-registry.log"
pnpm pcc:e2e:live | tee "$PCC_EVIDENCE_OUTPUT_DIR/pcc-live-full-suite.log"
```

If the full suite fails:

1. Do not hide the failure.
2. Preserve the evidence output directory.
3. Identify the failed spec(s), failed evidence IDs if emitted, and whether the failure is caused by Prompt 01–05 changes or an unrelated hosted/runtime condition.
4. Do not claim Prompt 05 evidence closeout is complete unless the failure is demonstrably unrelated and the user accepts that exception.

### 4C. Required evidence artifacts to locate and inspect

After `pnpm pcc:e2e:live`, locate and inspect the new evidence output path.

At minimum, confirm whether these files exist in the new evidence tree. If a file name has moved, locate the equivalent artifact and document the actual path:

```text
README.md
pcc-live-dom-card-summary.json
pcc-live-breakpoint-matrix.json
pcc-live-breakpoint-card-measurements.json
pcc-live-false-affordance-summary.json
pcc-live-action-summary.json
pcc-live-state-summary.json
pcc-live-source-summary.json
pcc-live-hbi-authority-summary.json
pcc-live-axe-summary.json
pcc-live-scorecard-report.json
pcc-live-scorecard-report.md
```

Do not commit `playwright-report/` or `test-results/`.

### 4D. Baseline evidence to compare against

Compare the new Playwright artifacts against the prior evidence run:

```text
docs/architecture/evidence/pcc-live/20260507-134047/surface-screenshots-1778175753367/pcc-live-dom-card-summary.json
docs/architecture/evidence/pcc-live/20260507-134047/breakpoints-1778175676324/pcc-live-breakpoint-matrix.json
docs/architecture/evidence/pcc-live/20260507-134047/breakpoints-1778175676324/pcc-live-breakpoint-card-measurements.json
```

Required comparison outputs:

- Project Readiness default card count: old vs new.
- Project Readiness default card count must be `<= 12` in the new evidence.
- Project Readiness measured heights by breakpoint: old vs new.
- Highlight phone and standard-laptop measurements if present.
- Confirm no horizontal overflow regression.
- Confirm no new card nesting/direct-child regression if represented in evidence.
- Confirm no new false-affordance findings for Project Readiness.
- Confirm no new HBI/source-authority regression.
- Confirm accessibility evidence has no new Project Readiness-specific blocker.

Use a small Node/Python script or `jq` if helpful, but include the script or command output summary in the closeout. Do not manually eyeball JSON and claim exact values without recording the source file path.

### 4E. Evidence commit discipline

If the new evidence output directory is inside `docs/architecture/evidence/pcc-live/`, include it in the Prompt 05 commit unless it contains secrets, storage-state data, traces with credentials, or oversized browser artifacts that violate repo policy.

Before committing evidence:

```bash
find "$PCC_EVIDENCE_OUTPUT_DIR" -maxdepth 3 -type f | sort
```

Confirm no storage-state or secret-bearing files are included.

## Static validation sequence

Run from workspace root.

Use the correct package filter:

```text
@hbc/spfx-project-control-center
```

Do not use the old incorrect filter `@hbc/project-control-center`.

Required commands:

```bash
git status --short

pnpm exec prettier --write \
  apps/project-control-center/src/tests/PccCardTierContract.test.tsx \
  apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx \
  apps/project-control-center/src/tests/PccProjectReadinessDensityContract.test.tsx \
  docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b5/04_VALIDATION_AND_EVIDENCE_CLOSEOUT.md

pnpm --filter @hbc/spfx-project-control-center check-types

( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccProjectReadinessSurface )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccProjectReadinessDensityContract )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccCardTierContract )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts )
```

If the closeout doc path does not exist and you create the fallback Prompt 05 closeout file, adjust prettier commands accordingly.

## Final validation sequence

After Playwright evidence and documentation updates:

```bash
pnpm exec prettier --check \
  apps/project-control-center/src/tests/PccCardTierContract.test.tsx \
  apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx \
  apps/project-control-center/src/tests/PccProjectReadinessDensityContract.test.tsx \
  docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b5/04_VALIDATION_AND_EVIDENCE_CLOSEOUT.md

git diff --check
git status --short
```

If the generated evidence path contains Markdown/JSON files and they are committed, do not run Prettier over screenshots or binary assets. Only run Prettier over touched Markdown/JSON/TS/TSX files.

## Commit requirements

Commit only after:

- static validation passes;
- full workspace vitest passes;
- Playwright live suite passes, or evidence closeout is explicitly blocked due to missing environment and no evidence claims are made;
- closeout documentation reflects actual results;
- `git diff --check` passes;
- `git status --short` contains only intended files.

## Commit summary format

Use this structure, adjusted to actual files changed:

```text
Commit summary

docs(pcc/project-readiness): close Wave 15A B5 evidence and card-tier validation

Commit description

Close the Project Readiness Wave 15A B5 remediation with card-tier contract verification and live Playwright evidence alignment.

- Audits/updates Project Readiness card-tier tests for command/detail selected-section behavior.
- Preserves default command density, compact loading/error density, selected-detail direct-child, false-affordance, and degraded-state contracts from Prompts 01–04.
- Records the Prompt 01–05 commit chain and static validation results.
- Runs the PCC live Playwright suite and records the evidence output path.
- Compares new Project Readiness evidence against the 20260507-134047 baseline for card count, measured height, overflow, false-affordance, accessibility, and source/HBI authority findings.
- Preserves read-only/source-confidence/HBI/source-of-record boundaries.
```

## Closeout response

Return exactly this structure:

```text
Files changed:
Prompt 01–05 commit chain:
Final default Project Readiness card count:
Compact loading/error card count:
Selected detail sections covered:
Static validation:
Vitest validation:
Playwright validation:
Evidence output path:
Evidence artifacts inspected:
Baseline comparison:
Residual risks:
Commit summary:
Commit description:
```

If Playwright is blocked, return:

```text
BLOCKED: live Playwright environment unavailable
Missing variables:
Static validation completed:
Files changed before block:
No evidence closeout claimed:
Next action required:
```
