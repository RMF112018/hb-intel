# Prompt 02 — Full Evidence Package Completeness and Runbook

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

Add a machine-checkable **full evidence package completeness** contract for PCC live evidence runs.

The package should identify whether a curated run folder includes all expected evidence output groups:

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

This prompt should focus on runbook clarity, package-completeness typing, and testable output expectations. It should not require a live tenant run.

## Why This Matters

The latest reviewed evidence package contained strong screenshot, breakpoint, accessibility, workflow, content, conditional, and smoke artifacts, but the final scorecard-report, surface-blocks, and doctrine-source output groups were not visibly committed in that package.

The suite needs to surface missing package groups explicitly as evidence gaps, not leave auditors to discover them manually.

## Repo Areas to Inspect

```text
docs/architecture/evidence/pcc-live/README.md
docs/architecture/evidence/pcc-live/PCC_Live_Evidence_Closeout_Template.md
docs/architecture/evidence/pcc-live/20260507-134047/README.md

e2e/pcc-live/pcc-live.scorecard-report-assembler.ts
e2e/pcc-live/pcc-live.scorecard-report-writer.ts
e2e/pcc-live/pcc-live.scorecard-report.spec.ts
e2e/pcc-live/pcc-live.surface-blocks-assembler.ts
e2e/pcc-live/pcc-live.surface-blocks-writer.ts
e2e/pcc-live/pcc-live.doctrine-source*
```

If the closeout template is missing, do not invent broad documentation. Add only the minimum cross-reference or completeness artifact needed by this prompt.

## Required Changes

1. Define a canonical list of expected evidence output groups for a full PCC live evidence package.
2. Add a typed package-completeness model with at least:

```ts
groupId
required
expectedGlobOrPrefix
observed
observedPathCount
status: 'present' | 'missing' | 'operator-pending' | 'not-applicable'
notes
```

3. Add an assembler/helper that evaluates a list of artifact paths or a run directory file list against the expected groups.
4. Add Markdown/JSON report support for package completeness.
5. Update the runbook to identify the package-completeness artifact as part of closeout.
6. Ensure missing groups are described as evidence gaps / operator-pending, not failures and not hard-stop dispositions.
7. Preserve manual review posture.

## Suggested New Files

Use existing project naming style. Possible files:

```text
e2e/pcc-live/pcc-live.package-completeness.types.ts
e2e/pcc-live/pcc-live.package-completeness.ts
e2e/pcc-live/pcc-live.package-completeness.spec.ts
```

Or integrate into `pcc-live.scorecard-report-assembler.ts` if that is cleaner. Prefer separate files if the logic is reusable by surface-block/report writers.

## Required Expected Groups

At minimum:

```text
surface-smoke
surface-screenshots
breakpoints
accessibility
workflow
content
doctrine-source
conditional
surface-blocks
scorecard-report
```

For each group, define:

- whether it is required for a full Phase 4 scoring package,
- likely directory prefix,
- key expected files,
- whether absence should be `missing`, `operator-pending`, or `not-applicable`.

Conditional lane nuance:

- If conditional execution is disabled or not configured, the `conditional-*` group may be present with operator-pending statuses.
- Absence of the conditional group should still be surfaced to the operator.

## Report Output Requirements

Add artifacts such as:

```text
evidence-package-completeness.json
evidence-package-completeness.md
```

The Markdown should include:

- run ID,
- group table,
- present count,
- missing count,
- operator-pending count,
- required missing groups,
- statement that this does not pass/fail hard stops,
- recommended rerun/closeout action.

## Validation

Run:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check "e2e/pcc-live/**/*.{ts,md,json}" "docs/architecture/evidence/pcc-live/**/*.md"
git diff --check
```

If you do not create a separate spec file, run the affected scorecard-report/surface-block specs that cover the completeness behavior.

## Acceptance Criteria

- Full package expected groups are defined in typed source.
- Missing report/surface-block/doctrine-source groups can be detected from an artifact-path list or run folder inventory.
- Output describes missing groups as evidence-package gaps.
- No hard stop is auto-failed.
- No final Phase 4 readiness claim is generated.
