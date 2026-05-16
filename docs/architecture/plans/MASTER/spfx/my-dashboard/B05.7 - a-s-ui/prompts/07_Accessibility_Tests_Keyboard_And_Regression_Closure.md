# Prompt 07 — Accessibility, Tests, Keyboard, and Regression Closure

## Prompt to Send Local Agent

```md
You are working in the live `hb-intel` repository on Prompt 07 of the Adobe Sign flagship UI/UX remediation package.

# Objective

Close accessibility, keyboard, and regression-proofing gaps after the structural UI work is complete.

# Required Ground Rules

- Follow the decision-closed package exactly.
- Do not re-read files that are still within your current context or memory unless repo truth is stale, missing, contradictory, or exact edit context must be verified.
- This prompt is primarily test/accessibility closure. Do not restart visual redesign.
- Do not modify package manifests, lockfiles, SPFx manifests, backend/functions code, or deployment files.
- Do not use `git add .`.
- Do not push.

# Required Pre-Edit Baseline

Run and paste raw output for:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -20
md5 pnpm-lock.yaml
```

# Files to Inspect

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.test.tsx
apps/my-dashboard/src/layout/MyWorkCard.test.tsx
```

Re-open runtime source files only when exact assertions or a test failure require verification.

# Allowed Files to Modify

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.test.tsx
apps/my-dashboard/src/layout/MyWorkCard.test.tsx
```

If a test reveals a real implementation bug in files modified by Prompts 02–06, stop and report before changing implementation source.

# Required Test Closure

## 1. Stable heading semantics

Prove:

- article `aria-labelledby` points to the visible `Agreement Activity` heading;
- the heading does not contain interactive view-switch controls.

## 2. Tablist/tab/tabpanel wiring

Prove:

- tablist exists;
- tabs have `aria-selected`;
- panels use `role="tabpanel"`;
- active panel is labelled by active tab.

## 3. Keyboard activation without synthetic click scaffolding

Replace any weak tests that keydown and then manually click.

Prove with direct keyboard-event behavior that:

- ArrowRight/ArrowLeft/Home/End move focus as required;
- Enter activates the focused tab;
- Space activates the focused tab;
- Completed fetch occurs only on activation, not on arrow focus movement.

## 4. Completed retry

Prove:

- retry control appears in degraded/error Completed state;
- invoking retry reissues the request;
- success cache behavior remains intact after successful Completed load.

## 5. Preview context and copy regressions

Prove:

- preview-context line conditions are correct;
- `Updated date unavailable` never renders;
- `Completion metadata not reported.` only appears in the both-metadata-absent case.

## 6. Link safety

Prove all row Open links preserve:

```text
target="_blank"
rel="noopener noreferrer"
```

## 7. No retired patterns re-enter

Preserve/adapt existing tests that block:

- retired Adobe card roles;
- developer-facing placeholder/mock/TODO copy;
- removed obsolete toggle semantics.

# Required Validation

Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard lint
git diff --check
md5 pnpm-lock.yaml
```

# Commit Guidance

Commit summary:

```text
my-dashboard(adobe-sign): close accessibility and regression coverage gaps
```

# Required Final Response

Return:

## 1. Implementation Summary
## 2. Files Changed
## 3. Validation Results
## 4. Lockfile MD5 Before / After
## 5. Staged File Proof
## 6. Commit SHA
## 7. Explicit Forbidden-Scope Confirmation
## 8. Prompt 08 Readiness Decision

# Stop Conditions

Stop before commit if:

- a failing test proves an implementation bug that requires non-test source edits;
- the new semantics cannot be asserted without revising prior implementation;
- any validation fails;
- lockfile checksum changes.
```
