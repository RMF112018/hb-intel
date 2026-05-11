# Prompt 02 — PCC Phase 06 Screenshot Reliability Rerun and Closeout

## Role

You are my local code agent for `RMF112018/hb-intel`.

You have already implemented screenshot capture reliability hardening. Your task now is to run the focused evidence rerun, curate the output, and produce a closeout report that makes the remaining visual/operator posture clear.

Do not re-read files that are still in your current context or memory. Only open files needed to verify the implementation and evidence output.

## Objective

Produce focused evidence that proves screenshot capture reliability has been corrected.

This is not a production UI polish task. Do not remediate first-card/hero redundancy here. Do not try to move or hide the native SharePoint assistant button.

## Required Preflight

Run:

```bash
git status --short
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
git diff --check
```

Report exact commands and outputs.

## Focused Live Rerun

If the live lane is ready, run the screenshot spec against a focused evidence root:

```bash
PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-screenshot-reliability-rerun" pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
```

If the live lane is not ready:
- do not fabricate evidence;
- report the blocker;
- confirm the spec self-skips correctly;
- produce a blocked-but-honest closeout.

## Evidence That Must Be Present

If live rerun succeeds, confirm the evidence root includes:

```text
pcc-live-screenshot-evidence.json
pcc-live-screenshot-evidence.md
pcc-live-screenshot-inventory.json
pcc-live-dom-card-summary.json
screenshot-contact-sheet.md
screenshot-manifest-by-ev.json
first-screen-review-index.md
screenshots/**
```

Confirm the evidence metadata includes:

- requested scroll Y;
- actual scroll Y;
- scroll root kind / selector descriptor;
- horizontal reset status;
- document/body/root/panel scroll-left diagnostics;
- active panel left / bento grid left diagnostics;
- duplicate or near-duplicate screenshot diagnostics;
- not-scrollable / not-applicable classification where appropriate;
- operator-review-required posture.

## Focused Visual Targets

Confirm the rerun specifically covers:

- Cost & Time above-fold / full-page / scroll segment;
- Systems Administration above-fold / full-page / scroll segment;
- Project Home above-fold confirmation;
- Document Control above-fold confirmation.

Do not claim visual approval unless actual screenshot review has happened. The purpose is capture reliability evidence, not design approval.

## Required Closeout File

Create:

```text
docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-screenshot-reliability-rerun/SCREENSHOT_CAPTURE_RELIABILITY_CLOSEOUT.md
```

The closeout must include:

```text
# HB: PCC Phase 06 Screenshot Capture Reliability Closeout

## Repo / Version
- HEAD before:
- HEAD after:
- package version:
- lockfile md5 before:
- lockfile md5 after:

## Scope
- What changed:
- What did not change:
- Explicit note: native SharePoint assistant button is an environmental overlay and not a PCC defect.

## Validation
- command results

## Evidence Root
- path:
- run state:
- screenshot count:
- surfaces:
- viewport:
- operator-review posture:

## Reliability Checks
- horizontal reset:
- actual scroll recorded:
- scroll root selection:
- duplicate/near-duplicate detection:
- non-scrollable classification:
- active panel/grid left boundary diagnostics:
- Cost & Time clipping status:
- Systems Administration clipping status:

## Artifact Policy
- raw Playwright output:
- storage/auth artifacts:
- sanitization:
- screenshots operator review:

## Remaining Operator-Pending Items
- ...

## Conclusion
- PASS / PASS WITH OPERATOR-PENDING / BLOCKED / FAIL
```

## Commit Rules

Stage only:

- targeted `e2e/pcc-live/**` test/evidence files changed by the remediation;
- focused evidence root, if live rerun succeeded and artifacts are scrubbed/reviewed;
- closeout markdown.

Do not stage:

- raw traces/videos/HAR;
- `test-results/`;
- `playwright-report/`;
- storageState/auth/cookies/tokens;
- unrelated historical evidence dirs;
- unrelated production source.

## Required Final Agent Response

Return:

```text
Summary:
- ...

Evidence root:
- ...

Validation:
- ...

Reliability verdict:
- ...

Remaining operator-pending:
- ...

Files changed:
- ...

Git status:
- ...

Commit summary:
- ...

Commit description:
- ...
```
