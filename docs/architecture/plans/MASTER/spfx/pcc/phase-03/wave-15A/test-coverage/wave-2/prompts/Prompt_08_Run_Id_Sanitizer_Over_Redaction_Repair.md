# Prompt 08 — Run ID Sanitizer Over-Redaction Repair — Updated

## Role

You are acting as a senior TypeScript/Playwright test architect, SPFx evidence-harness maintainer, evidence security reviewer, UI/UX audit systems engineer, and repository-quality reviewer.

You are working in the local repository:

```text
RMF112018/hb-intel
```

## Mandatory Session Rules

- Start from repo truth. Run `git status --short`, `git branch --show-current`, and `git rev-parse --short HEAD` before making changes.
- Do not re-read files that are still within your current context or memory. Reopen a file only if it may have changed, if exact code is required, or if prior context is stale.
- Make the smallest coherent set of changes necessary to satisfy this prompt.
- Preserve existing architecture and naming patterns unless this prompt explicitly instructs a targeted adjustment.
- Do not calculate final scorecard points.
- Do not mark hard stops as passed or failed.
- Do not mark EVs as finally captured by automation.
- Do not claim WCAG conformance, accessibility pass/fail, scorecard pass/fail, or Phase 4 readiness.
- Do not generate or commit storageState, cookies, tokens, raw traces, videos, HAR files, raw `test-results/`, or raw `playwright-report/`.
- Do not expose raw tenant URLs with sensitive query strings, auth/session material, emails, phone numbers, secrets, raw HTML, raw axe payloads, or token-like blobs.
- Do not add live write-side PCC actions or tenant mutation behavior.
- Keep all outputs expert-review / operator-review oriented.
- Do not modify product UI runtime files.
- Do not change dependencies, `pnpm-lock.yaml`, package metadata, SPFx manifests, or package-solution files.

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

Observed problem in Markdown evidence output:

```text
/tmp/pcc-live-evidence/[redacted-phone]/workflow-[redacted-phone]/pcc-live-workflow-evidence.json
```

The sanitizer must continue to redact true phone numbers, auth/session/token/cookie/storageState terms, raw artifact paths, emails, secrets, and long blobs, while preserving safe run IDs and evidence folder names.

## Why This Matters

Over-redacted run IDs make evidence packages harder to navigate and undermine audit reproducibility. Under-redaction creates security risk. This prompt must improve precision without weakening safety.

## Current Repo-Truth Signals

Repo search has confirmed the over-redaction symptom exists in committed workflow evidence outputs and active harness tests/writers. The highest-risk sanitizer path currently includes a broad phone regex similar to:

```ts
const PHONE_RE = /\+?[0-9][0-9()\-\s]{7,}[0-9]/g;
```

That pattern can match path/date/run fragments such as:

```text
20260507-134047
workflow-1778175784527
```

Current sanitizer copies exist across several PCC live harness files. Do not assume a single source of truth already exists.

## Repo Areas to Inspect

Look for sanitizer functions, phone regexes, and path/artifact filters across:

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
e2e/pcc-live/pcc-live.doctrine-source-capture.ts
e2e/pcc-live/pcc-live.doctrine-source-writer.ts
e2e/pcc-live/pcc-live.scorecard-report-assembler.ts
e2e/pcc-live/pcc-live.surface-blocks-assembler.ts
e2e/pcc-live/pcc-live.surface-blocks-writer.ts
e2e/pcc-live/pcc-live.package-completeness.ts
```

## Required Changes

### 1. Identify the Over-Redaction Source

Find every active sanitizer that can redact run IDs as phones.

At minimum check for:

```text
PHONE_RE
redacted-phone
[0-9()\-\s]{7,}
sanitizeText
sanitizeArtifactPath
safeArtifactPath
UNSAFE_PATH_PATTERN
```

Do not edit committed historical evidence files under `docs/architecture/evidence/pcc-live/**` as part of this prompt. This prompt repairs future output behavior and tests.

### 2. Add a Central Sanitization Helper Unless Clearly Unsafe

Create a focused helper if low-risk:

```text
e2e/pcc-live/pcc-live.sanitization.ts
```

Recommended exports:

```ts
export interface PccLiveSanitizeTextOptions {
  readonly preserveEvidencePaths?: boolean;
  readonly redactPolicyClaims?: boolean;
  readonly maxLength?: number;
}

export function sanitizePccLiveText(input: string, options?: PccLiveSanitizeTextOptions): string;

export function sanitizePccLiveArtifactPath(input: string): string;

export function isPccLiveUnsafeArtifactPath(input: string): boolean;

export function redactPccLivePhoneNumbers(input: string): string;
```

Keep the helper narrow and deterministic. Do not build a large policy framework.

### 3. Repair Phone Redaction Precision

The phone redactor must redact true phone numbers while preserving safe run IDs and evidence paths.

Must preserve:

```text
20260507-134047
workflow-1778175784527
surface-screenshots-1778175753367
breakpoints-1778175676324
accessibility-1778175650631
conditional-1778175718229
scorecard-report-1778175800000
docs/architecture/evidence/pcc-live/20260507-134047/workflow-1778175784527/pcc-live-workflow-evidence.json
docs/architecture/evidence/pcc-live/20260507-134047/surface-screenshots-1778175753367/screenshot-contact-sheet.md
```

Must redact:

```text
qa.user@example.com
+1 (561) 555-1212
561-555-1212
(561) 555-1212
561.555.1212
+15615551212
tel:+15615551212
phone: 561-555-1212
mobile 561 555 1212
```

Guidance:
- Do not treat every 8+ digit numeric string as a phone number.
- Prefer phone redaction only when the pattern has phone-like context or formatting:
  - leading `+`;
  - parentheses around area code;
  - `xxx-xxx-xxxx`;
  - `xxx.xxx.xxxx`;
  - `xxx xxx xxxx` with word/context boundary;
  - `phone`, `mobile`, `tel`, or similar nearby label.
- Do not redact date-like or run-id-like patterns:
  - `YYYYMMDD-HHMMSS`;
  - `<lane>-<13 digit timestamp>`;
  - relative evidence paths with known lane prefixes.

### 4. Preserve Existing Security Redaction

Do not weaken the existing deny-list posture.

Must continue redacting or excluding:

```text
storageState
storage-state
cookie
cookies
token
tokens
auth
session
sessions
secret
secrets
test-results
playwright-report
trace.zip
video.webm
network.har
.auth
.e2e-auth
.storage-state
long token-like blobs
raw HTML tags
raw axe node payload markers where applicable
query strings containing secret/auth/token/session-like parameters
```

URL/query handling:
- Strip query strings by default from URL/path-like strings.
- Never preserve `?token=`, `?auth=`, `?session=`, `?secret=`, or similar query parameters.
- It is acceptable to preserve the base path after removing the query string.

### 5. Centralize Usage in Active Writers/Assemblers Where Low-Risk

Update the highest-impact active files to use the helper or equivalent repaired phone redactor:

Required minimum:

```text
e2e/pcc-live/pcc-live.workflow-evidence-writer.ts
e2e/pcc-live/pcc-live.workflow.spec.ts
```

Also update active sanitizer copies where the same `PHONE_RE` or equivalent over-redaction risk is present:

```text
e2e/pcc-live/pcc-live.workflow-capture.ts
e2e/pcc-live/pcc-live.content-capture.ts
e2e/pcc-live/pcc-live.content-review-writer.ts
e2e/pcc-live/pcc-live.conditional-capture.ts
e2e/pcc-live/pcc-live.conditional-evidence-writer.ts
e2e/pcc-live/pcc-live.doctrine-source-capture.ts
e2e/pcc-live/pcc-live.doctrine-source-writer.ts
e2e/pcc-live/pcc-live.scorecard-report-assembler.ts
e2e/pcc-live/pcc-live.surface-blocks-assembler.ts
e2e/pcc-live/pcc-live.surface-blocks-writer.ts
```

If touching all copies creates excessive churn, prioritize:
1. workflow writer/spec, because the observed problem is workflow output;
2. scorecard-report and surface-blocks, because they aggregate evidence paths;
3. content/conditional/doctrine-source writers where `PHONE_RE` exists;
4. capture files only if they serialize sanitized paths/snippets directly.

Do not refactor screenshot/breakpoint/accessibility/touch-target files unless their sanitizer includes phone over-redaction risk or tests require import compatibility.

### 6. Keep Safe Relative Evidence Paths Navigable

Generated Markdown/JSON should preserve relative or repo-root evidence paths when safe:

```text
docs/architecture/evidence/pcc-live/20260507-134047/workflow-1778175784527/pcc-live-workflow-evidence.json
workflow-1778175784527/pcc-live-workflow-evidence.json
```

Absolute temp paths may be sanitized to safe text, but the run-id and lane folder should not be redacted solely because they contain numbers.

Do not convert safe evidence paths into Markdown image embeds unless the existing artifact type requires it.

### 7. Tests

Add focused sanitizer tests. Prefer a new spec if a helper is introduced:

```text
e2e/pcc-live/pcc-live.sanitization.spec.ts
```

Test categories:

#### False positives that must remain visible

```text
20260507-134047
workflow-1778175784527
surface-screenshots-1778175753367
breakpoints-1778175676324
accessibility-1778175650631
conditional-1778175718229
docs/architecture/evidence/pcc-live/20260507-134047/workflow-1778175784527/pcc-live-workflow-evidence.json
```

#### True positives that must redact

```text
qa.user@example.com
+1 (561) 555-1212
561-555-1212
(561) 555-1212
561.555.1212
tel:+15615551212
phone: 561-555-1212
mobile 561 555 1212
storageState
storage-state
cookie
cookies
token
tokens
auth
session
sessions
secret
secrets
test-results
playwright-report
trace.zip
video.webm
network.har
.auth
ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890TOKENLIKEBLOB
https://example.test/path?token=abc123
https://example.test/path?auth=abc123
```

#### Writer regression tests

Update affected existing specs to assert:

- workflow evidence Markdown/JSON preserves safe run IDs and relative artifact paths;
- workflow evidence Markdown/JSON redacts true phone numbers;
- scorecard-report / surface-blocks path inventories preserve safe run IDs when they sanitize supplied safe artifact paths;
- no unsafe raw artifact paths leak.

### 8. Runbook Update

Minimally update:

```text
e2e/pcc-live/README.md
docs/architecture/evidence/pcc-live/README.md
```

Add sanitizer guidance:

- safe run IDs and evidence folder names should remain navigable;
- true phone/email/auth/session/secret/raw-artifact material must remain redacted/excluded;
- over-redaction that removes run IDs should be treated as evidence usability regression;
- under-redaction of sensitive data remains a safety blocker.

### 9. Validation

Run exactly:

```bash
git status --short
git branch --show-current
git rev-parse --short HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.sanitization.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.content.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.conditional.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.doctrine-source.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-blocks.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts
pnpm exec prettier --check e2e/pcc-live/pcc-live.sanitization.ts e2e/pcc-live/pcc-live.sanitization.spec.ts e2e/pcc-live/pcc-live.workflow-evidence-writer.ts e2e/pcc-live/pcc-live.workflow.spec.ts e2e/pcc-live/pcc-live.workflow-capture.ts e2e/pcc-live/pcc-live.content-capture.ts e2e/pcc-live/pcc-live.content-review-writer.ts e2e/pcc-live/pcc-live.conditional-capture.ts e2e/pcc-live/pcc-live.conditional-evidence-writer.ts e2e/pcc-live/pcc-live.doctrine-source-capture.ts e2e/pcc-live/pcc-live.doctrine-source-writer.ts e2e/pcc-live/pcc-live.scorecard-report-assembler.ts e2e/pcc-live/pcc-live.surface-blocks-assembler.ts e2e/pcc-live/pcc-live.surface-blocks-writer.ts e2e/pcc-live/README.md docs/architecture/evidence/pcc-live/README.md
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If the implementation touches fewer files, the Prettier command may be reduced to the helper/spec and actually touched files. If an additional touched file is necessary, add it to the targeted Prettier command.

## Acceptance Criteria

- Safe run IDs are preserved in generated Markdown/JSON paths.
- Safe evidence folder names are preserved in generated Markdown/JSON paths.
- True phone numbers are redacted.
- Emails are redacted.
- Auth/session/token/cookie/storageState terms remain redacted.
- Raw prohibited artifact paths remain redacted or excluded as designed.
- Query strings with sensitive parameters are stripped or redacted.
- Long token-like blobs remain redacted.
- Tests prove both false-positive preservation and true-positive redaction.
- Workflow evidence regression specifically covers the observed `[redacted-phone]` path failure.
- Scorecard-report/surface-block aggregation remains compatible.
- No hard-stop, accessibility/WCAG, scorecard, EV-capture, or readiness pass/fail is automated.
- No product UI runtime, dependency, lockfile, manifest, package metadata, or package-solution changes are introduced.
