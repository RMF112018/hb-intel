# Prompt 03 — Report, Surface Blocks, and Doctrine Source Closeout Integration

## Role

You are acting as a senior TypeScript/Playwright test architect, SPFx evidence-harness maintainer, UI/UX audit systems engineer, and repository-quality reviewer.

You are working in the local repository:

```text
RMF112018/hb-intel
```

## Mandatory Session Rules

- Start from repo truth. Run `git status --short` and identify the current branch/HEAD before making changes.
- Do not re-read files that are still within your current context or memory. Reopen a file only if it may have changed, if exact code is required, or if your prior context is stale.
- Make the smallest coherent set of changes necessary to satisfy this prompt.
- Preserve existing architecture and naming patterns unless this prompt explicitly instructs a targeted adjustment.
- Do not calculate final scorecard points.
- Do not mark hard stops as passed or failed.
- Do not mark EVs as finally captured by automation.
- Do not generate or commit storageState, cookies, tokens, raw traces, videos, HAR files, raw `test-results/`, or raw `playwright-report/`.
- Do not add live write-side PCC actions or tenant mutation behavior.
- Keep all outputs expert-review / operator-review oriented.

## Completion Summary Required

When finished, respond with:

```text
Commit summary:
<one-line summary>

Commit description:
- Objective:
- Files changed:
- What changed:
- Validation:
- Safety/scoring boundary:
- Residual risks:
- Suggested next prompt:
```

## Objective

Integrate the package-completeness contract into the existing scorecard-report, surface-block, and doctrine-source evidence closeout flow.

The goal is for a full evidence package to include or explicitly call out:

```text
doctrine-source-*/
surface-blocks-*/
scorecard-report-*/
evidence-package-completeness.json
evidence-package-completeness.md
```

This prompt builds on Prompt 02.

## Why This Matters

The source code already contains surface-block and scorecard-report assemblers/writers, but the latest committed evidence package did not visibly include those outputs. Auditors need the suite to assemble and expose the final review package, not just the lane-level summaries.

## Repo Areas to Inspect

```text
e2e/pcc-live/pcc-live.doctrine-source.spec.ts
e2e/pcc-live/pcc-live.doctrine-source-capture.ts
e2e/pcc-live/pcc-live.doctrine-source-writer.ts

e2e/pcc-live/pcc-live.surface-blocks.spec.ts
e2e/pcc-live/pcc-live.surface-blocks-assembler.ts
e2e/pcc-live/pcc-live.surface-blocks-writer.ts

e2e/pcc-live/pcc-live.scorecard-report.spec.ts
e2e/pcc-live/pcc-live.scorecard-report-assembler.ts
e2e/pcc-live/pcc-live.scorecard-report-writer.ts

e2e/pcc-live/README.md
docs/architecture/evidence/pcc-live/README.md
```

## Required Changes

1. Ensure `pcc-live.scorecard-report.spec.ts` can assemble a report using artifact paths from all expected evidence lanes.
2. Include package-completeness results in the scorecard report output or in the report artifact inventory.
3. Ensure surface-block outputs are referenced by the scorecard report artifact inventory when present.
4. Ensure doctrine-source outputs are referenced by the scorecard report artifact inventory when present.
5. Update Markdown report wording so missing package groups are surfaced as:

```text
operator-review-pending
source-missing
evidence-package-gap
```

Do not state:

```text
hard stop failed
Phase 4 not ready
score invalid
```

unless those are part of a reviewer-completed manual worksheet outside automation.

6. Update README/runbook references as needed so the operator knows to run:

```bash
pcc-live.doctrine-source.spec.ts
pcc-live.surface-blocks.spec.ts
pcc-live.scorecard-report.spec.ts
```

as part of a full evidence package closeout.

## Specific Output Expectations

The scorecard report should include or reference:

```text
evidence-package-completeness.json
evidence-package-completeness.md
audit-package-index.json
audit-package-index.md
artifact-inventory.json
artifact-inventory.md
manual-review-checklist.md
final-report-readme.md
```

The manual review checklist should ask the expert to verify:

- all expected groups are present or explicitly documented,
- screenshots are scrubbed,
- raw Playwright artifacts are excluded,
- scorecard references are canonical,
- final scores remain blank until expert review,
- hard-stop dispositions remain manual.

## Validation

Run:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.doctrine-source.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-blocks.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check "e2e/pcc-live/**/*.{ts,md,json}" "docs/architecture/evidence/pcc-live/**/*.md"
git diff --check
```

## Acceptance Criteria

- Scorecard report can include package completeness and prior-lane artifact references.
- Surface-block and doctrine-source outputs are visible in report package inventory when present.
- Missing groups are explicit evidence gaps, not hidden omissions.
- No automatic final score, EV capture, hard-stop disposition, or Phase 4 approval is introduced.
