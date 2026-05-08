# Prompt 09 — Immediate ROI Closeout Validation

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

Conduct an integrated closeout validation of all Immediate / Highest ROI improvements implemented by Prompts 01 through 08.

Do not introduce broad new features in this prompt unless a small correction is required to make the implemented work coherent and valid.

## Scope

Validate that the PCC Playwright evidence harness now supports:

1. Canonical scorecard traceability.
2. Full evidence package completeness checks.
3. Scorecard report / surface-block / doctrine-source closeout visibility.
4. Screenshot contact sheet and EV manifest.
5. Breakpoint issue register.
6. Accessibility issue register.
7. Reconciled touch target measurements.
8. Run ID sanitizer precision.
9. Preserved safety/scoring boundaries.

## Required Review Steps

1. Run repo-state checks:

```bash
git status --short
git rev-parse HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

2. Search for stale scorecard references:

```bash
grep -R "PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md" e2e/pcc-live || true
```

There should be no durable Playwright references to `_v2`.

3. Confirm expected new artifacts are represented in tests/writers:

```text
evidence-package-completeness.json
evidence-package-completeness.md
screenshot-contact-sheet.md
screenshot-manifest-by-ev.json
first-screen-review-index.md
pcc-live-breakpoint-issue-register.json
pcc-live-breakpoint-issue-register.md
pcc-live-accessibility-issue-register.json
pcc-live-accessibility-issue-register.md
```

4. Confirm report output remains expert-review-only.

5. Confirm no output claims:

```text
final score
hard stop passed
hard stop failed
Phase 4 ready
EV captured
100/100
95/100 achieved
```

except when explicitly redacted or stated as prohibited/boundary language.

## Required Validation Commands

Run targeted validation:

```bash
pnpm pcc:e2e:evidence:registry
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.content.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.doctrine-source.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-blocks.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
```

If a new package-completeness spec was created:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts
```

Run formatting/diff checks:

```bash
pnpm exec prettier --check "e2e/pcc-live/**/*.{ts,md,json}" "docs/architecture/evidence/pcc-live/**/*.md" "docs/reference/spfx-surfaces/project-control-center/**/*.md"
git diff --check
```

## Required Closeout Review

Produce a closeout summary that answers:

- Which Immediate ROI items are fully implemented?
- Which files changed per item?
- Which artifacts were added?
- Which validation commands passed?
- Did `pnpm-lock.yaml` change?
- Are any live-tenant runs still required?
- Are screenshots still operator-review-required?
- Are hard-stop dispositions still manual?
- Are final scores still expert-reviewed and blank?
- Are any risks or gaps left before a Phase 4 audit package?

## Acceptance Criteria

- All Prompt 01–08 changes validate together.
- No stale `_v2` Playwright evidence references remain.
- New artifacts are covered by tests.
- Sanitization tests preserve safe run IDs and redact sensitive content.
- Touch target evidence is consistent and explainable.
- Package-completeness gaps are explicit.
- No final scoring or hard-stop disposition is automated.
