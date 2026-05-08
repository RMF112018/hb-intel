# Prompt 09 — Immediate ROI Closeout Validation — Updated

## Role

You are acting as a senior TypeScript/Playwright test architect, SPFx evidence-harness maintainer, UI/UX audit systems engineer, evidence-package reviewer, and repository-quality auditor.

You are working in the local repository:

```text
RMF112018/hb-intel
```

## Mandatory Session Rules

- Start from repo truth. Run `git status --short`, `git branch --show-current`, and `git rev-parse HEAD` before making any change.
- Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, contradictory, or newly changed repo truth.
- Make the smallest coherent set of changes necessary to satisfy this prompt.
- This is primarily a closeout-validation prompt. Do not introduce broad new features.
- Do not modify product UI runtime files.
- Do not change dependencies, `pnpm-lock.yaml`, package metadata, SPFx manifests, package-solution files, or package.json.
- Do not calculate final scorecard points.
- Do not mark hard stops as passed or failed.
- Do not mark EVs as finally captured by automation.
- Do not claim WCAG conformance, accessibility pass/fail, scorecard pass/fail, or Phase 4 readiness.
- Do not add tenant write-side actions or mutation behavior.
- Do not commit storageState, cookies, tokens, raw traces, videos, HAR files, raw `test-results/`, raw `playwright-report/`, or tenant auth artifacts.
- Keep all outputs expert-review / operator-review oriented.
- Do not edit historical evidence files unless the task is an explicit evidence-inventory correction and the artifact is curated JSON/Markdown only.

## Completion Summary Required

When finished, respond with:

```text
Commit summary:
<one-line summary or "No commit required">

Commit description:
- Objective:
- Files changed:
- What changed:
- Validation:
- Evidence inventory:
- Safety/scoring boundary:
- Residual risks:
- Suggested next prompt:
```

If no files changed, do not create an empty commit. Report `No commit required`.

## Objective

Conduct an integrated closeout validation of the Immediate / Highest ROI Playwright evidence-harness improvements implemented through:

1. Prompt 01 — canonical scorecard traceability repair.
2. Prompt 02 — evidence package completeness contract and writer.
3. Prompt 03 — scorecard report / surface-block / doctrine-source closeout integration.
4. Prompt 03A — doctrine-source plural credential sanitization correction.
5. Prompt 04 — screenshot contact sheet and EV manifest.
6. Prompt 05 — breakpoint issue register.
7. Prompt 06 — accessibility issue register and reviewer action matrix.
8. Prompt 07 — touch-target measurement reconciliation.
9. Prompt 08 — run-ID sanitizer over-redaction repair.
10. Prompt 08A — PCC live default environment contract, evidence output root, and manifest-version resolver.
11. Screenshot evidence commit — curated screenshot evidence manifests for package `1.0.0.17`.

Do not introduce new evidence-harness features in this prompt unless a small corrective fix is required for closeout validity.

## Current Repo-Truth Context To Verify

At closeout, verify the current repo truth rather than assuming these values:

- `apps/project-control-center/config/package-solution.json` currently has package-solution `solution.version = 1.0.0.17` and matching feature version.
- Prompt 08A added default env resolution and package-version derivation.
- Prompt 08 added shared sanitizer:
  - `e2e/pcc-live/pcc-live.sanitization.ts`
  - `e2e/pcc-live/pcc-live.sanitization.spec.ts`
- Prompt 08A added focused env resolver tests:
  - `e2e/pcc-live/pcc-live.env.spec.ts`
- Prompt 04/Prompt 05/Prompt 06 added new expected artifacts to package-completeness.
- Screenshot evidence commit:
  - `0b37ad48be82dcec6c7f7f2b7598c0bcf2921bfc`
  - Should contain curated screenshot evidence JSON/Markdown inventories/review docs only, not raw/auth/test-result artifacts.

## Required Review Steps

### 1. Repo State and Version Checks

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
node -e "const p=require('./apps/project-control-center/config/package-solution.json'); console.log(p.solution.version); console.log((p.solution.features||[]).map(f=>f.version).join('\n'))"
```

Confirm:

- branch is expected for this package work, typically `main`;
- `pnpm-lock.yaml` hash is unchanged unless an unrelated pre-existing state is documented;
- package-solution version and all feature versions match;
- package version is derived by the env resolver, not hard-coded in runtime scripts.

### 2. Commit-Hygiene Review

Review the package commits and ensure there are no accidental broad commits left active at tip.

At minimum inspect recent history:

```bash
git log --oneline --decorate -20
```

Confirm the accidental Prompt 05 broad commit remains reverted if present in history.

Confirm Prompt 08A commit exists:

```bash
git show --name-only --stat fddf7abea436122c7c66e7092eb1c484380ef781
```

Confirm screenshot evidence commit exists:

```bash
git show --name-only --stat 0b37ad48be82dcec6c7f7f2b7598c0bcf2921bfc
```

### 3. Screenshot Evidence Commit Inventory Check

Run:

```bash
git show --name-only --pretty="" 0b37ad48be82dcec6c7f7f2b7598c0bcf2921bfc | sort
git show --name-only --pretty="" 0b37ad48be82dcec6c7f7f2b7598c0bcf2921bfc | grep -Ei 'storage|cookie|token|\.auth|test-results|playwright-report|trace\.zip|video\.webm|network\.har|\.png|\.jpg|\.jpeg|\.webp|\.har|\.zip' || true
```

Expected:

- curated JSON/Markdown evidence files may be present;
- no storageState/auth/session material;
- no raw `test-results/` or `playwright-report/`;
- no traces/videos/HAR files;
- no image binaries unless intentionally reviewed and explicitly approved.

If image binaries appear, do not automatically delete them. Report as a closeout blocker unless there is written approval in the evidence runbook/commit message.

### 4. Canonical Scorecard Traceability Check

Run:

```bash
grep -R "PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md" e2e/pcc-live docs/reference/spfx-surfaces/project-control-center || true
```

Interpretation:

- `_v2` may appear only as an explicit forbidden-regression token in tests or as a forbidden/historical example in canonical documentation.
- `_v2` must not appear as a durable source reference in registry/model/report output definitions.

Also run the targeted traceability validation:

```bash
pnpm pcc:e2e:evidence:registry
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts
```

### 5. Expected Artifact Coverage Check

Confirm these expected artifacts are represented in writers/tests/package-completeness:

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

Use targeted search:

```bash
grep -R "evidence-package-completeness.json\|evidence-package-completeness.md\|screenshot-contact-sheet.md\|screenshot-manifest-by-ev.json\|first-screen-review-index.md\|pcc-live-breakpoint-issue-register.json\|pcc-live-breakpoint-issue-register.md\|pcc-live-accessibility-issue-register.json\|pcc-live-accessibility-issue-register.md" e2e/pcc-live docs/architecture/evidence/pcc-live/README.md
```

Confirm package-completeness expected files include:

- screenshot contact sheet / EV manifest / first-screen review index;
- breakpoint issue register JSON/Markdown;
- accessibility issue register JSON/Markdown;
- scorecard-report output files via the scorecard-report output-file constant.

### 6. Safety / No-Claim Search

Search generated harness source and curated docs for forbidden outcome claims.

Run:

```bash
grep -RIn "final score\|hard stop passed\|hard stop failed\|Phase 4 ready\|EV captured\|100/100\|95/100 achieved\|56/56 achieved\|WCAG passed\|WCAG failed\|accessibility passed\|accessibility failed" e2e/pcc-live docs/architecture/evidence/pcc-live docs/reference/spfx-surfaces/project-control-center || true
```

Interpretation:

- Boundary/prohibited-language statements are acceptable when they explicitly say the suite does **not** do those things.
- Redacted claim test strings are acceptable.
- Any affirmative readiness/pass/fail/final-capture claim is a blocker.

### 7. Sanitization / Auth Artifact Search

Run:

```bash
grep -RIn "storageState\|cookie\|cookies\|token\|tokens\|session\|sessions\|\.auth\|test-results\|playwright-report\|trace\.zip\|video\.webm\|network\.har" e2e/pcc-live docs/architecture/evidence/pcc-live || true
```

Interpretation:

- Sanitizer tests and explicit deny-list/runbook language are acceptable.
- Auth/session content, raw artifact paths inside committed evidence packages, or unredacted secrets are blockers.
- Safe evidence run IDs and paths should not be over-redacted as `[redacted-phone]`.

### 8. Required Validation Commands

Run from repo root, in this order:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml

pnpm pcc:e2e:evidence:registry

pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.env.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.runtime.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.sanitization.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.content.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.conditional.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.doctrine-source.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-blocks.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.package-completeness.spec.ts

pnpm exec prettier --check "e2e/pcc-live/**/*.{ts,md,json}" "docs/architecture/evidence/pcc-live/**/*.md"
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Do **not** include `docs/reference/spfx-surfaces/project-control-center/**/*.md` in the closeout Prettier command unless you first confirm those files are already Prettier-clean. There were earlier known formatting warnings in that reference-doc area, and this closeout should not fail on unrelated historical formatting.

If the closeout touches any additional files, add those exact files to a targeted Prettier command.

### 9. Live-Tenant Evidence Treatment

Classify live-tenant evidence status explicitly:

- If default storageState exists and live tests run:
  - report which live specs ran versus self-skipped;
  - do not infer Phase 4 readiness from the live run;
  - confirm screenshot evidence remains operator-review required.
- If storageState is absent:
  - `missing-storage-state` self-skip is acceptable;
  - report live tenant evidence as `operator-pending`.
- If screenshot evidence commit `0b37ad...` is being used as the current visual evidence package:
  - report its inventory result;
  - identify whether it is complete against package-completeness;
  - confirm it remains expert/operator-review evidence, not score authority.

### 10. Closeout Summary Required

Produce a closeout summary answering:

- Which Immediate ROI items are fully implemented?
- Which commits correspond to each item?
- Which files changed per item?
- Which artifacts were added?
- Which validation commands passed?
- Did `pnpm-lock.yaml` change?
- What is the current package-solution version?
- Did env defaults resolve correctly?
- Did sanitizer tests preserve safe run IDs and redact sensitive material?
- Are any live-tenant runs still required?
- Are screenshots still operator-review-required?
- Are hard-stop dispositions still manual?
- Are final scores still expert-reviewed and blank/null?
- Are there any risks or gaps left before a Phase 4 audit package?
- Is Prompt 08A complete and is optional Prompt 08A sanitizer-convergence still optional only?

## If a Correction Is Required

Only make a correction if validation exposes a narrow, material issue such as:

- stale durable `_v2` source reference;
- missing expected artifact in package-completeness;
- broken env resolver behavior;
- sanitizer regression exposing sensitive material or over-redacting run IDs;
- unreviewed raw/auth artifact committed to evidence;
- failing targeted spec due to this package’s implementation.

If correcting:

1. Keep the change tightly scoped.
2. Rerun all affected validation plus the full closeout validation block.
3. Commit only the corrective files.
4. Report the correction clearly.

## Acceptance Criteria

- All Prompt 01–08A changes validate together.
- Screenshot evidence commit inventory is reviewed.
- No stale durable `_v2` Playwright evidence references remain.
- New artifacts are covered by tests and package-completeness.
- Env resolver defaults are validated.
- Sanitization tests preserve safe run IDs and redact sensitive content.
- Touch-target evidence is consistent and explainable.
- Package-completeness gaps are explicit.
- No final scoring, hard-stop disposition, WCAG/accessibility pass/fail, EV final-capture, or Phase 4 readiness is automated.
- No raw/auth/session/test-result artifacts are committed.
- Closeout produces a clear expert-review/operator-review readiness position without claiming scorecard completion.
