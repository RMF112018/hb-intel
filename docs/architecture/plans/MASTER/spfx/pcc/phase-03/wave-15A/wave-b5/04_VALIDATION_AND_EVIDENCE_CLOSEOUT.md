# Validation and Evidence Closeout

## Pre-implementation repo check

Run:

```bash
git status --short
git branch --show-current
```

Record any pre-existing dirty files. Do not overwrite unrelated work.

## Local validation commands

Use the repo’s established commands. Recommended starting point:

```bash
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test -- PccProjectReadinessSurface
pnpm --filter @hbc/project-control-center test -- PccProjectReadinessDensityContract
pnpm --filter @hbc/project-control-center test -- PccCardTierContract
pnpm exec prettier --check apps/project-control-center/src/surfaces/projectReadiness apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx apps/project-control-center/src/tests/PccCardTierContract.test.tsx
git diff --check
git status --short
```

If the package name or test command differs, inspect existing workspace scripts and use the equivalent. Do not edit package scripts for this remediation.

## Optional full validation

```bash
pnpm check-types
pnpm test
pnpm build
```

Only run full build/test if consistent with current repo workflow and time constraints.

## Live Playwright evidence rerun

After implementation is committed and tenant package/evidence process is ready, rerun the current PCC live evidence suite.

Canonical reference:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_Playwright_Evidence_Subset_Map.md
```

Commands listed there:

```bash
pnpm pcc:e2e:live:list
pnpm pcc:e2e:live
pnpm pcc:e2e:evidence:registry
```

Required environment variables are defined in the subset map:

```bash
PCC_LIVE_SITE_URL
PCC_LIVE_PAGE_URL
PCC_LIVE_STORAGE_STATE
PCC_EVIDENCE_OUTPUT_DIR
PCC_EXPECTED_PACKAGE_VERSION
```

## Evidence artifacts to compare

Before/after comparison targets:

```text
docs/architecture/evidence/pcc-live/20260507-134047/surface-screenshots-1778175753367/pcc-live-dom-card-summary.json
docs/architecture/evidence/pcc-live/20260507-134047/breakpoints-1778175676324/pcc-live-breakpoint-matrix.json
docs/architecture/evidence/pcc-live/20260507-134047/breakpoints-1778175676324/pcc-live-breakpoint-card-measurements.json
```

New run should show:

- Project Readiness default card count <= 12.
- Project Readiness height reduced materially at all breakpoints.
- Non-selected embedded sections absent from default DOM.
- No new false-affordance findings.
- No direct-child/card nesting regressions.

## Evidence closeout note

The agent should produce a closeout summary with:

```text
Commit SHA:
Branch:
Files changed:
Validation commands:
Validation results:
Default Project Readiness card count:
Selected-section test coverage:
Known residual risks:
Evidence run path, if executed:
Scorecard impact:
```

## Scorecard posture

Do not state that this remediation alone achieves:

- 100-point scorecard pass;
- 56/56 pass;
- Phase 4 readiness;
- hard-stop closure.

The scorecard remains expert-reviewed and evidence-supported, not auto-scored.
