# Prompt 08 — Run ID Sanitizer Over-Redaction Repair

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

Fix sanitizer over-redaction that incorrectly treats safe evidence run IDs and relative artifact paths as phone numbers.

Example problem observed in Markdown evidence output:

```text
/tmp/pcc-live-evidence/[redacted-phone]/workflow-[redacted-phone]/pcc-live-workflow-evidence.json
```

The sanitizer must continue to redact true phone numbers, auth/session/token/cookie/storageState terms, raw artifact paths, emails, secrets, and long blobs, but it should preserve safe run IDs and evidence folder names.

## Why This Matters

Over-redacted run IDs make evidence packages harder to navigate and undermine audit reproducibility. Under-redaction creates security risk. This prompt must improve precision without weakening safety.

## Repo Areas to Inspect

Look for sanitizer functions across:

```text
e2e/pcc-live/pcc-live.screenshot-capture.ts
e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts
e2e/pcc-live/pcc-live.breakpoint-capture.ts
e2e/pcc-live/pcc-live.breakpoint-evidence-writer.ts
e2e/pcc-live/pcc-live.accessibility-capture.ts
e2e/pcc-live/pcc-live.accessibility-evidence-writer.ts
e2e/pcc-live/pcc-live.workflow-capture.ts
e2e/pcc-live/pcc-live.workflow-evidence-writer.ts
e2e/pcc-live/pcc-live.content-capture.ts
e2e/pcc-live/pcc-live.content-review-writer.ts
e2e/pcc-live/pcc-live.conditional-capture.ts
e2e/pcc-live/pcc-live.conditional-evidence-writer.ts
e2e/pcc-live/pcc-live.scorecard-report-assembler.ts
e2e/pcc-live/pcc-live.surface-blocks-assembler.ts
e2e/pcc-live/pcc-live.surface-blocks-writer.ts
```

## Required Changes

1. Identify the sanitizer(s) responsible for redacting run IDs as phone numbers.
2. Add a centralized helper if feasible and low-risk. Possible file:

```text
e2e/pcc-live/pcc-live.sanitization.ts
```

3. Add tests for both false positives and true positives.

### Must Preserve

These should remain visible:

```text
20260507-134047
workflow-1778175784527
surface-screenshots-1778175753367
docs/architecture/evidence/pcc-live/20260507-134047/workflow-1778175784527/pcc-live-workflow-evidence.json
```

### Must Redact

These should still be redacted:

```text
qa.user@example.com
+1 (561) 555-1212
561-555-1212
storageState
storage-state
cookie
token
auth
session
secret
test-results
playwright-report
trace.zip
video.webm
network.har
.auth
long token-like blobs
URLs with query strings containing secret/auth/token-like values
```

4. Avoid weakening existing artifact allow/deny logic.
5. Do not expose raw tenant URLs with sensitive query strings.
6. Do not normalize away useful relative evidence paths.

## Validation

Run affected specs. At minimum:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check "e2e/pcc-live/**/*.{ts,md,json}"
git diff --check
```

## Acceptance Criteria

- Safe run IDs are preserved in generated Markdown/JSON paths.
- True phone numbers are redacted.
- Auth/session/token/cookie/storageState terms remain redacted.
- Raw prohibited artifact paths remain redacted or excluded as designed.
- Tests prove both false-positive and true-positive cases.
