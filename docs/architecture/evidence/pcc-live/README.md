# PCC Live Evidence Runbook and Closeout Guide

## 1. Purpose

This folder is the recommended repo-visible home for curated, operator-reviewed PCC live evidence outputs.

Recommended path:

```text
docs/architecture/evidence/pcc-live/<run-id>/
```

This runbook defines how to execute, organize, scrub, review, and close out a live PCC Playwright evidence run in support of the PCC 100-point UI/UX Mold Breaker scorecard.

## 2. Related Canonical References

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Evidence_Taxonomy.md
docs/reference/spfx-surfaces/project-control-center/PCC_Playwright_Evidence_Subset_Map.md
```

## 3. Required Environment

```bash
export PCC_LIVE_SITE_URL="https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject"
export PCC_LIVE_PAGE_URL="https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject/SitePages/<page>.aspx"
export PCC_LIVE_STORAGE_STATE="$HOME/.config/hbc/pcc-live-storageState.json"
export PCC_EVIDENCE_OUTPUT_DIR="/tmp/pcc-live-evidence/<run-id>"
export PCC_EXPECTED_PACKAGE_VERSION="<spfx-package-version>"
```

Optional:

```bash
export PCC_LIVE_BRAVE_EXECUTABLE_PATH="/path/to/brave"
export PCC_LIVE_EDIT_PAGE_URL="https://..."
export PCC_LIVE_UNAUTHORIZED_STORAGE_STATE="$HOME/.config/hbc/pcc-live-unauthorized-storageState.json"
export PCC_LIVE_UNAUTHORIZED_PAGE_URL="https://..."
export PCC_LIVE_ENABLE_CONDITIONAL="true"
```

## 4. Authentication and StorageState Rules

Never commit:

- `storageState` files.
- Tenant cookies.
- Auth/session data.
- Raw traces/videos/HAR containing tenant session context.
- Raw `test-results/`.
- Raw `playwright-report/`.
- Unsanitized console output.
- Unscrubbed screenshots.

Store auth state outside the repo, preferably:

```text
$HOME/.config/hbc/
```

## 5. Commands

```bash
pnpm pcc:e2e:live:list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```

Focused specs:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.content.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.doctrine-source.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.conditional.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-blocks.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
```

Prompt 03 closeout sequence uses the four focused specs above (doctrine-source, surface-blocks, package-completeness, and scorecard-report). No single orchestration command is assumed.

## 6. Expected Evidence Output Groups

A full run may produce:

```text
surface-smoke-*/
surface-screenshots-*/
breakpoints-*/
accessibility-*/
workflow-*/
content-*/
doctrine-source-*/
conditional-*/
surface-blocks-*/
scorecard-report-*/
```

Completeness support artifacts (machine + human review):

```text
<run-id>/evidence-package-completeness.json
<run-id>/evidence-package-completeness.md
```

These completeness artifacts are closeout support only. They do not calculate final scorecard points, do not pass/fail hard stops, do not mark EVs finally captured, and do not approve Phase 4 readiness.

Screenshot lane closeout support artifacts include:

```text
pcc-live-screenshot-evidence.json
pcc-live-screenshot-evidence.md
pcc-live-screenshot-inventory.json
pcc-live-dom-card-summary.json
screenshot-contact-sheet.md
screenshot-manifest-by-ev.json
first-screen-review-index.md
```

These screenshot artifacts remain operator/expert review support and are not scoring authority.

Breakpoint lane closeout support artifacts include:

```text
pcc-live-breakpoint-evidence.json
pcc-live-breakpoint-evidence.md
pcc-live-breakpoint-matrix.json
pcc-live-breakpoint-card-measurements.json
pcc-live-breakpoint-touch-targets.json
pcc-live-breakpoint-issue-register.json
pcc-live-breakpoint-issue-register.md
```

Breakpoint issue-register artifacts are review support only and are not scoring authority.

## 7. Commit Eligibility

Commit-eligible after operator review and scrubbing:

- JSON summaries.
- Markdown reports.
- Evidence indexes.
- Coverage matrices.
- Evidence package completeness reports (`.json` and `.md`).
- Hard-stop worksheets.
- Expert scoring worksheets.
- Findings registers.
- Residual risk registers.
- Sanitized screenshot inventories.
- Scrubbed screenshots approved for repo evidence.

Never commit:

- StorageState files.
- Auth/session/cookie data.
- Raw Playwright traces.
- Raw Playwright videos.
- HAR files.
- Raw `test-results/`.
- Raw `playwright-report/`.
- Unsanitized console/page-error dumps.
- Any file containing secrets, tokens, personal data, or tenant auth context.

## 8. Required Operator Review

Before moving evidence into this folder:

1. Confirm package/version matches the package being scored.
2. Confirm tenant page URL is correct.
3. Confirm screenshots are scrubbed and approved.
4. Confirm summaries do not contain secrets/session data.
5. Confirm self-skipped specs are documented.
6. Confirm conditional lanes are marked completed, blocked, not-configured, or operator-pending.
7. Confirm hard-stop worksheet remains manual review until reviewed.
8. Confirm expert scoring worksheet remains blank until final expert scoring.
9. Confirm no generated file claims Phase 4 readiness or final score automatically.

## 9. Closeout Procedure

For every curated live evidence run:

1. Create a run folder:

```text
docs/architecture/evidence/pcc-live/<YYYYMMDD-HHMMSS>-<package-version>/
```

2. Copy approved evidence artifacts into the run folder.
3. Complete:

```text
docs/architecture/evidence/pcc-live/PCC_Live_Evidence_Closeout_Template.md
```

4. Add or update an evidence index.
5. Add reviewer notes.
6. Add final package/version alignment proof.
7. Complete hard-stop worksheet.
8. Complete expert scoring worksheet.
9. Record whether this run is accepted for Phase 4 scoring.

## 10. Final Scoring Boundary

The live Playwright suite generates evidence and audit support.

It does not:

- Calculate final 100-point score.
- Pass or fail hard stops.
- Approve Phase 4 readiness.
- Certify production readiness.
