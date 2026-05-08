# Prompt 05 — Breakpoint Issue Register

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

Add a detailed breakpoint issue register to the PCC breakpoint lane.

New artifacts:

```text
pcc-live-breakpoint-issue-register.json
pcc-live-breakpoint-issue-register.md
```

The register should convert summary warning counts into localized, audit-usable findings.

## Why This Matters

The current breakpoint evidence can report warnings such as clipping, overflow, direct-child stability issues, mode mismatches, and touch target issues. However, auditors need to know exactly which surface, viewport, card/action, selector, and measurement caused the warning.

## Repo Areas to Inspect

```text
e2e/pcc-live/pcc-live.breakpoint.types.ts
e2e/pcc-live/pcc-live.breakpoint-matrix.ts
e2e/pcc-live/pcc-live.breakpoint-capture.ts
e2e/pcc-live/pcc-live.breakpoint-evidence-writer.ts
e2e/pcc-live/pcc-live.breakpoint.spec.ts
e2e/pcc-live/pcc-scorecard.model.ts
```

## Required Changes

1. Add a typed breakpoint issue model with fields such as:

```ts
id
surfaceId
viewportId
issueType:
  | 'mode-mismatch'
  | 'horizontal-overflow'
  | 'card-clipping'
  | 'card-overflow-x'
  | 'card-overflow-y'
  | 'direct-child-invariant'
  | 'touch-target-size'
  | 'missing-grid'
severitySignal: 'review' | 'moderate' | 'major'
cardIndex?
selector?
footprint?
hierarchy?
tier?
region?
boundingWidth?
boundingHeight?
columnSpan?
rowSpan?
measuredHeight?
viewportWidth
viewportHeight
evRefs
pillarRefs
hardStopRefs
reviewPrompt
```

2. Generate issue rows from existing grid/card/touch measurements.
3. Add Markdown grouped by:

- issue type,
- surface,
- viewport.

4. Update the summary Markdown to include issue-register path and issue counts by type.
5. Keep warnings, but do not rely on repeated warning strings as the primary artifact.
6. Do not auto-fail tests merely because issue rows exist. The register is evidence support.

## Required Mapping

Map likely issue categories to scorecard context:

- Card clipping / overflow / direct-child: P4, P7; HS-03, HS-05.
- Horizontal overflow: P7; HS-05, HS-08.
- Mode mismatch: P7, P9; HS-05, HS-09.
- Missing grid: P3, P4, P9; HS-02, HS-03, HS-09.
- Touch target size: P7, P8; HS-05, HS-07.

Use existing EV ranges for breakpoint/container evidence. Do not create new EV IDs in this prompt unless existing types require extension; prefer existing `EV-69..EV-76` or current suite mapping.

## Validation

Run:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
pnpm exec prettier --check "e2e/pcc-live/**/*.{ts,md,json}"
git diff --check
```

## Acceptance Criteria

- Breakpoint writer emits JSON and Markdown issue registers.
- Issue register localizes issues to surface/viewport and card/action where possible.
- Summary warnings remain but are no longer the only audit signal.
- Tests cover synthetic clipping, direct-child, horizontal overflow, and mode mismatch examples.
- No automatic hard-stop failure is introduced.
