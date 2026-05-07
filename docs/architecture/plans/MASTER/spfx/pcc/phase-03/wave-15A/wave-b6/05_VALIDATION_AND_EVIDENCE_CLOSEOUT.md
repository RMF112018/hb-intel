# Validation and Evidence Closeout

## Purpose

This document defines how the local code agent should validate the Project Home flagship remediation and report before/after evidence.

## Pre-implementation checks

```bash
git status --short
git branch --show-current
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Record:

```text
Branch:
HEAD:
Dirty files before edits:
Lockfile hash before:
```

## Local validation commands

Run at minimum:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccProjectHome )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccApp.optIn )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccCardTierContract )
pnpm exec prettier --check   apps/project-control-center/src/surfaces/projectHome   apps/project-control-center/src/tests/PccProjectHome.test.tsx   apps/project-control-center/src/tests/PccApp.optIn.test.tsx
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Run full SPFx PCC vitest when practical:

```bash
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts )
```

## Live Playwright evidence rerun

Only run if the local environment is configured.

Required variables:

```bash
PCC_LIVE_SITE_URL
PCC_LIVE_PAGE_URL
PCC_LIVE_STORAGE_STATE
PCC_EXPECTED_PACKAGE_VERSION
PCC_EVIDENCE_OUTPUT_DIR
```

Suggested output path format:

```text
docs/architecture/evidence/pcc-live/<YYYYMMDD-HHMMSS>-project-home-flagship-remediation/
```

Commands:

```bash
pnpm pcc:e2e:live:list
pnpm pcc:e2e:evidence:registry
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.content.spec.ts
pnpm pcc:e2e:live
```

## Evidence artifacts to compare

Baseline:

```text
docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/surface-screenshots-1778188679091/pcc-live-dom-card-summary.json
docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/surface-screenshots-1778188679091/pcc-live-screenshot-inventory.json
docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/breakpoints-1778188624999/pcc-live-breakpoint-matrix.json
docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/breakpoints-1778188624999/pcc-live-breakpoint-card-measurements.json
docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/accessibility-1778188606395/pcc-live-accessibility-evidence.md
docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/accessibility-1778188606395/pcc-live-axe-summary.json
docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/content-1778188651911/content-review-findings.json
docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/workflow-1778188695837/pcc-live-action-summary.json
docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/workflow-1778188695837/pcc-live-false-affordance-summary.json
docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/workflow-1778188695837/pcc-live-hbi-authority-summary.json
```

## Required closeout comparison

Create a closeout summary with:

| Metric                             |       Baseline |    New | Required direction                   |
| ---------------------------------- | -------------: | -----: | ------------------------------------ |
| Project Home read-model card count |             16 | record | may remain 16 if first-fold improves |
| Project Home phone height          |         8432px | record | lower preferred                      |
| Priority Actions phone height      |         2573px | record | materially lower                     |
| Project Home axe violations        |              4 | record | 0 target                             |
| Project Home touch issues          |             18 | record | lower or classified                  |
| Project Home content needs-review  |             27 | record | materially lower                     |
| False-affordance needs-review      |              0 | record | must remain 0                        |
| Horizontal overflow                |              0 | record | must remain 0                        |
| Direct-child card failures         |              0 | record | must remain 0                        |
| Screenshot scroll evidence         | scrollY 0 only | record | real below-fold required             |

## Evidence discipline

Do not commit:

- storage state;
- auth files;
- Playwright traces unless explicitly requested;
- HAR files;
- `playwright-report/`;
- `test-results/`.

## Closeout response format

```text
Files changed:
Project Home command hierarchy changes:
Priority Actions compression:
Card order / tier changes:
Lifecycle / HBI promotion:
Content/source/HBI authority copy changes:
Accessibility fixes:
Validation commands and results:
Evidence output path:
Before/after evidence deltas:
Lockfile/package/manifest status:
Known residual risks:
```

## Scorecard statement

Use this wording:

```text
This remediation is designed to improve the Project Home scorecard posture. It does not by itself constitute a final 100/100 rating, Phase 4 readiness, or hard-stop closure. Final scorecard disposition remains expert-reviewed.
```
