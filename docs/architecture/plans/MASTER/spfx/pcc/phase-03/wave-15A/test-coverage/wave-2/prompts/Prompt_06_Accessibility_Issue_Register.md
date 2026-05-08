# Prompt 06 — Accessibility Issue Register

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

Add a detailed accessibility issue register to the PCC accessibility lane.

New artifacts:

```text
pcc-live-accessibility-issue-register.json
pcc-live-accessibility-issue-register.md
```

The register should convert accessibility summaries into localized, audit-usable findings for expert review.

## Why This Matters

The current accessibility lane captures axe, keyboard focus, ARIA, contrast, reduced motion, hover-only, dialog, and touch target observations. The summary is useful but not detailed enough for fast remediation triage or scorecard support.

## Repo Areas to Inspect

```text
e2e/pcc-live/pcc-live.accessibility.types.ts
e2e/pcc-live/pcc-live.accessibility-capture.ts
e2e/pcc-live/pcc-live.accessibility-evidence-writer.ts
e2e/pcc-live/pcc-live.accessibility.spec.ts
e2e/pcc-live/pcc-scorecard.model.ts
```

## Required Changes

1. Add a typed accessibility issue model with fields such as:

```ts
id
surfaceId
issueType:
  | 'axe-violation'
  | 'aria-name-missing'
  | 'disabled-reason-missing'
  | 'focus-indicator-missing'
  | 'contrast-needs-review'
  | 'touch-target-size'
  | 'hover-only-risk'
  | 'reduced-motion-risk'
  | 'dialog-focus-needs-review'
severitySignal: 'review' | 'moderate' | 'major'
selector?
ruleId?
impact?
count?
role?
tagName?
focusStep?
boundingWidth?
boundingHeight?
evRefs
pillarRefs
hardStopRefs
reviewPrompt
```

2. Generate issue rows from existing accessibility observations.
3. Add Markdown grouped by surface and issue type.
4. Include a short “how to use this register” section:
   - evidence only,
   - expert review required,
   - no automatic WCAG conformance claim,
   - no hard-stop pass/fail.
5. Update accessibility summary output to reference the new issue-register files.
6. Preserve sanitization: no raw HTML, raw axe node payloads, auth/session, tenant-sensitive data.

## Required Mapping

- Axe violations: P8; HS-07.
- Missing accessible names: P8; HS-07.
- Disabled reason missing: P5, P8; HS-04, HS-07.
- Focus indicator missing: P8; HS-07.
- Contrast needs review: P8; HS-07.
- Touch target size: P7, P8; HS-05, HS-07.
- Hover-only/reduced-motion/dialog focus: P8; HS-07.

## Validation

Run:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec prettier --check "e2e/pcc-live/**/*.{ts,md,json}"
git diff --check
```

## Acceptance Criteria

- Accessibility writer emits JSON and Markdown issue registers.
- Issue rows are localized to surface and selector/step/rule when available.
- Tests cover at least axe, ARIA, contrast, focus, touch, and dialog issue generation.
- No automatic accessibility pass/fail or hard-stop disposition is introduced.
