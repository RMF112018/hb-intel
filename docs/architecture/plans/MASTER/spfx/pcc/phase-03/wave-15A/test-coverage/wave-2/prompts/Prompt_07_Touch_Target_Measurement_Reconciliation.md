# Prompt 07 — Touch Target Measurement Reconciliation

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

Reconcile the breakpoint and accessibility lane touch-target measurement discrepancy.

The reviewed evidence showed:

- breakpoint evidence: `Touch target measurement count: 0`;
- accessibility evidence: `Touch target issue count: 145`.

The goal is to make the two lanes consistent, explainable, and useful for P7/P8 and HS-05/HS-07 review.

## Why This Matters

Conflicting touch-target evidence weakens field/tablet usability review. A scorecard auditor should not have to decide whether the suite measured touch targets or not.

## Repo Areas to Inspect

```text
e2e/pcc-live/pcc-live.breakpoint-capture.ts
e2e/pcc-live/pcc-live.breakpoint.types.ts
e2e/pcc-live/pcc-live.breakpoint-evidence-writer.ts
e2e/pcc-live/pcc-live.breakpoint.spec.ts

e2e/pcc-live/pcc-live.accessibility-capture.ts
e2e/pcc-live/pcc-live.accessibility.types.ts
e2e/pcc-live/pcc-live.accessibility-evidence-writer.ts
e2e/pcc-live/pcc-live.accessibility.spec.ts
```

## Required Changes

1. Identify why breakpoint touch targets are not being counted.
   - Check selector scope.
   - Check active panel selection.
   - Check visibility filtering.
   - Check tab/action placement outside active panel.
   - Check disabled element filtering.
2. Create shared or aligned touch-target selector/visibility logic where practical.
3. Ensure breakpoint lane reports touch target measurements for visible interactive controls per surface/viewport when such controls exist.
4. Preserve accessibility lane’s review threshold behavior.
5. Add an explanatory field or summary note if the two lanes intentionally differ:
   - breakpoint lane = responsive/viewport field-fit measurement;
   - accessibility lane = accessibility/touch review measurement.
6. Update tests to prevent a regression where breakpoint touch target count is zero across all surface/viewport pairs while accessibility detects many targets.

## Suggested Implementation Approach

Consider a small shared helper file only if it reduces duplication without broad refactor:

```text
e2e/pcc-live/pcc-live.touch-targets.ts
```

Potential helper outputs:

```ts
selector
role
tagName
width
height
x
y
visible
disabled
surfaceId
viewportId?
belowRecommendedSize
measurementLane
```

Do not over-engineer. The first goal is consistent measured targets and clear explanation.

## Validation

Run:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec prettier --check "e2e/pcc-live/**/*.{ts,md,json}"
git diff --check
```

## Acceptance Criteria

- Breakpoint lane no longer produces zero touch-target measurements when visible controls exist.
- Accessibility lane still reports accessibility/touch target issues.
- Both lanes explain their threshold and measurement scope.
- Touch target issue/register outputs identify surface, viewport where applicable, selector, width, height, and threshold.
- No hard-stop or accessibility pass/fail is automated.
