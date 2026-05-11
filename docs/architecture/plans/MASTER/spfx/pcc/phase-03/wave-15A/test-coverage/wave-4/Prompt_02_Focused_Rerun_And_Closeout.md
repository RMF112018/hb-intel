# Prompt 02 — PCC Phase 06 Screenshot Reliability Rerun and Closeout — Updated for Prompt 1B

## Role

You are my local code agent for `RMF112018/hb-intel`.

You have already implemented the PCC live screenshot capture reliability hardening and Prompt 1B sequencing fix. Your task is now to run a focused live/browser-capable evidence rerun, verify the generated screenshot reliability metadata, curate the evidence root, and produce a closeout report.

This prompt is designed for Claude Code Opus 4.7 execution.

Do not re-read files that are still in your current context or memory. Only open files needed to verify current repo truth, validate the Prompt 1B source state, run the focused evidence lane, inspect the generated evidence artifacts, and write the closeout.

## Objective

Produce focused evidence proving that PCC screenshot capture reliability has been corrected after Prompt 1B.

The closeout must prove or honestly block the following:

1. Screenshot metadata is collected from the exact pre-capture state, not from a post-screenshot reset state.
2. Scroll-segment captures preserve the requested vertical scroll position.
3. Horizontal scroll is reset/controlled before each capture without disturbing scroll-segment vertical position.
4. Cost & Time and Systems Administration no longer capture with left-side clipping caused by horizontal drift.
5. Scroll segments are either meaningful, duplicate-with-warning, or explicitly not-scrollable; no silent fake scroll evidence is allowed.
6. Raw Playwright/auth/sensitive artifacts remain excluded.
7. The native SharePoint assistant button remains treated as an environmental overlay, not a PCC defect or remediation target.

This is not a production UI polish task. Do not remediate first-card/hero redundancy here. Do not attempt to move, hide, restyle, or classify the native SharePoint assistant button as a PCC defect.

## Current Repo-Truth Baseline

The required Prompt 1B source-fix commit is:

```text
00eb1d1748081f36cdffe542bd0aacd8f70e16d7
test(pcc-live): preserve segment scroll state in screenshot diagnostics
```

The current source must include the Prompt 1B sequencing pattern:

- `resetToTopAndClearHorizontalScroll(...)`
- `clearHorizontalScrollPreservingVerticalPosition(...)`
- `collectPreparedState(...)`
- `buildArtifactFromPreCaptureState(...)`
- `captureArtifactWithPreCaptureDiagnostics(...)`
- scrollable segments must use `collectPreparedState(..., 'horizontal-only', targetY)` before screenshot capture
- artifact metadata must be built from pre-capture diagnostics, then hash/file size appended after screenshot capture

## Strict Scope

Allowed:

- Run validation commands.
- Run the focused live screenshot evidence lane.
- Create one new focused evidence root.
- Create one closeout markdown file inside that evidence root.
- Stage only the focused evidence root and closeout if live evidence succeeds and artifacts are scrubbed/operator-review eligible.
- If live lane is blocked, create a blocked-but-honest closeout only if it is useful and clearly labeled blocked.

Not allowed:

- Do not modify production source.
- Do not modify app runtime source.
- Do not modify screenshot capture implementation unless a true regression is found. If a true source defect is found, stop and report a corrective-prompt recommendation instead of making opportunistic edits.
- Do not install dependencies.
- Do not modify `pnpm-lock.yaml`.
- Do not change SPFx package version or manifests.
- Do not edit blueprint authority docs.
- Do not stage unrelated Phase 07 planning/test work.
- Do not stage unrelated historical evidence directories.
- Do not stage raw traces/videos/HAR/storageState/auth/cookies/tokens.
- Do not claim final visual design approval.
- Do not claim final EV capture or scorecard approval.

## Required Preflight

Run and report exact output for:

```bash
git status --short
git rev-parse HEAD
git log --oneline -5
git merge-base --is-ancestor 00eb1d1748081f36cdffe542bd0aacd8f70e16d7 HEAD && echo "Prompt 1B ancestor: yes" || echo "Prompt 1B ancestor: no"
python - <<'PY'
import hashlib, pathlib
p = pathlib.Path("pnpm-lock.yaml")
print(hashlib.md5(p.read_bytes()).hexdigest())
PY
```

Expected lockfile md5:

```text
7c19ccfa8718a42f7f55ce178a626996
```

Run source-state guards:

```bash
grep -n "resetToTopAndClearHorizontalScroll\|clearHorizontalScrollPreservingVerticalPosition\|collectPreparedState\|buildArtifactFromPreCaptureState\|captureArtifactWithPreCaptureDiagnostics" e2e/pcc-live/pcc-live.screenshot-capture.ts
grep -n "horizontal-only" e2e/pcc-live/pcc-live.screenshot-capture.ts
grep -n "resetAndCollectDiagnostics" e2e/pcc-live/pcc-live.screenshot-capture.ts || true
```

Acceptance for source-state guards:

- Required helper names must be present.
- `horizontal-only` must be present in the scroll-segment capture path.
- `resetAndCollectDiagnostics` should not remain as an active helper/pattern in `pcc-live.screenshot-capture.ts`.
- If source-state guards fail, stop. Do not run Prompt 2 evidence. Report `BLOCKED — Prompt 1B source state not present`.

## Required Validation Commands

Run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types

pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts

pnpm exec playwright test --config=playwright.pcc-live.config.ts --list

pnpm pcc:e2e:evidence:registry

pnpm exec prettier --check e2e/pcc-live/pcc-live.screenshot-capture.ts e2e/pcc-live/pcc-live.screenshot.spec.ts e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts e2e/pcc-live/pcc-live.breakpoint-capture.ts e2e/pcc-live/pcc-live.screenshot.types.ts

git diff --check
```

The screenshot spec result must be interpreted carefully:

- If synthetic browser tests pass: record that scroll preservation is locally proven for window/document and active-panel/container roots.
- If synthetic browser tests self-skip because browser launch is unavailable: record that local synthetic proof is not available in this runtime and require live evidence to carry proof.
- If tests fail for source or assertion reasons: stop and report `FAIL`.

## Focused Live Rerun

If the live lane is ready, run the screenshot spec against this focused evidence root:

```bash
PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-screenshot-reliability-rerun" pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
```

If this root already exists from a previous attempt, do not overwrite useful evidence silently. Either:

- remove only the incomplete/uncommitted failed attempt after confirming it is safe and unrelated raw artifacts are absent, or
- use a timestamped subfolder beneath the same named root and document the path used.

If the live lane is not ready:

- do not fabricate evidence;
- do not copy old screenshots;
- do not reuse Phase 06 final evidence as proof of the Prompt 1B fix;
- confirm the live screenshot test self-skips correctly;
- create a blocked-but-honest closeout only if it clearly states no live screenshots were generated and Cost & Time / Systems Administration were not evaluated.

## Required Evidence Files

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

Also confirm there are no committed/raw artifact paths such as:

```text
test-results/**
playwright-report/**
**/*.zip
**/*.webm
**/*.har
**/storageState*
**/.auth/**
**/*cookie*
**/*token*
**/*session*
```

## JSON Evidence Inspection — Hard Gates

After live rerun succeeds, inspect `pcc-live-screenshot-evidence.json` with a small script or equivalent deterministic check.

Hard-gate the following:

### 1. Surface coverage

Evidence must include all 8 PCC live surfaces, including at minimum:

- `project-home`
- `documents`
- `cost-time`
- `systems-administration`

### 2. Required screenshot kinds

For every surface:

- at least one `above-fold`
- at least one `full-page`
- at least one `scroll-segment` or a clear not-scrollable classification path

For these focused surfaces, explicitly verify all required kinds:

- `cost-time`
- `systems-administration`
- `project-home`
- `documents`

### 3. Metadata presence

Every screenshot artifact must include:

- `operatorReviewRequired === true`
- `actualScrollY`
- `horizontalResetApplied`
- `horizontalScrollWithinTolerance`
- `surfacePanelLeftWithinTolerance`
- `bentoGridLeftWithinTolerance`
- `captureReliabilityWarnings`
- `scrollRootKind`
- `scrollRootSelector`
- `contentScrollHeight`
- `contentClientHeight`
- `contentSha256`
- `fileSizeBytes`

Every scroll segment must include:

- `requestedScrollY`
- `actualScrollY`
- `segmentClassification`

### 4. Scroll preservation proof

At least one scroll segment across the evidence set must satisfy:

```text
requestedScrollY > 0
abs(actualScrollY - requestedScrollY) <= 2
segmentClassification == "meaningful"
no actual-scroll-mismatch warning
```

If no such segment exists, closeout result is `FAIL` unless the evidence proves every surface is genuinely not-scrollable. Given prior surface evidence, assume at least one meaningful segment should exist unless proven otherwise.

### 5. Not-scrollable classification

For any segment with `segmentClassification == "not-scrollable"`:

```text
contentScrollHeight - contentClientHeight <= 2
```

If not, closeout result is `FAIL`.

### 6. Duplicate classification

For any segment with `segmentClassification == "duplicate"`:

- it must carry a duplicate-related warning;
- it must not be silently counted as proof of scroll preservation;
- if duplicate segments appear on a surface that is scrollable, mark the surface as `operator-review-required` and include it in remaining concerns.

### 7. No scroll mismatch

No scroll segment may include `actual-scroll-mismatch` unless the closeout is marked `FAIL` or `PASS WITH OPERATOR-PENDING` with a concrete listed remediation reason. Do not hide this condition.

### 8. Horizontal clipping gates

For `cost-time` and `systems-administration`:

- `horizontalScrollWithinTolerance` must be true for all above-fold/full-page/scroll-segment artifacts;
- `surfacePanelLeftWithinTolerance` must be true for all above-fold/full-page/scroll-segment artifacts;
- `bentoGridLeftWithinTolerance` must be true for all above-fold/full-page/scroll-segment artifacts;
- `activeSurfacePanelLeft` must be `null` or `>= -2`;
- `bentoGridLeft` must be `null` or `>= -2`;
- `captureReliabilityWarnings` must not include:
  - `horizontal-scroll-drift`
  - `active-surface-panel-left-clipped`
  - `bento-grid-left-clipped`

If any of these fail, closeout result is `FAIL` or `PASS WITH OPERATOR-PENDING` only if the issue is conclusively environmental and documented. Do not call it fully passed.

## Screenshot Review Posture

Open the focused screenshots for at least these artifacts:

- Cost & Time above-fold
- Cost & Time full-page
- Cost & Time first scroll segment
- Systems Administration above-fold
- Systems Administration full-page
- Systems Administration first scroll segment
- Project Home above-fold
- Document Control above-fold

Operator review scope:

- Confirm no obvious left-side clipping on Cost & Time.
- Confirm no obvious left-side clipping on Systems Administration.
- Confirm generated screenshots are from the new rerun evidence root.
- Confirm the native SharePoint assistant button, if visible, is treated as an environmental overlay only.
- Confirm no obvious tenant secrets, auth artifacts, cookies, tokens, or user-sensitive material is visible.

Do not claim full UI polish approval. This visual review is limited to capture reliability and sensitive-artifact screening.

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
- Prompt 1B source commit:
- Prompt 1B ancestor present:
- package version:
- feature version:
- lockfile md5 before:
- lockfile md5 after:

## Scope
- What changed:
- What did not change:
- Explicit note: native SharePoint assistant button is an environmental overlay and not a PCC defect.

## Source-State Verification
- helper names present:
- horizontal-only segment path present:
- post-screenshot reset/diagnostic pattern absent:
- source-state verdict:

## Validation
- command results:
- synthetic browser proof status:
  - window-document:
  - active-panel/container:

## Evidence Root
- path:
- run state:
- screenshot count:
- surfaces:
- viewport:
- operator-review posture:

## JSON Evidence Hard Gates
- surface coverage:
- screenshot kind coverage:
- metadata completeness:
- scroll preservation proof:
- not-scrollable classification:
- duplicate classification:
- no scroll mismatch:
- Cost & Time clipping gates:
- Systems Administration clipping gates:

## Focused Screenshot Review
- Cost & Time:
- Systems Administration:
- Project Home:
- Document Control:
- sensitive artifact review:
- SharePoint assistant classification:

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

## Result Definitions

Use these definitions exactly:

- `PASS`: live evidence generated, JSON hard gates pass, focused screenshot review finds no capture-reliability defect, no sensitive artifacts visible, no remaining capture-reliability concern.
- `PASS WITH OPERATOR-PENDING`: live evidence generated and source/data gates mostly pass, but screenshot visual review, duplicate segment review, or environmental interpretation still needs operator signoff.
- `BLOCKED`: live lane or browser/runtime was not available; no live screenshots generated; do not claim evidence proof.
- `FAIL`: source-state guard fails, validation fails, JSON hard gates fail, Cost & Time or Systems Administration clipping persists, actual-scroll mismatch persists, or unsafe artifacts are present.

## Commit Rules

Stage only:

- the focused screenshot reliability evidence root, if live rerun succeeded and artifacts are scrubbed/operator-review eligible;
- the closeout markdown;
- no source files unless a separately approved correction was made.

Do not stage:

- raw traces/videos/HAR;
- `test-results/`;
- `playwright-report/`;
- storageState/auth/cookies/tokens;
- unrelated historical evidence dirs;
- unrelated production source;
- unrelated Phase 07 planning/test files.

Before staging, run:

```bash
git status --short
find docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-screenshot-reliability-rerun -type f | sort
git diff --check
```

After staging, run:

```bash
git diff --cached --name-only
```

Confirm the staged list contains only approved paths.

## Required Final Agent Response

Return:

```text
Summary:
- ...

Source-state verification:
- ...

Evidence root:
- ...

Validation:
- ...

JSON evidence hard gates:
- ...

Focused screenshot review:
- ...

Reliability verdict:
- PASS / PASS WITH OPERATOR-PENDING / BLOCKED / FAIL

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

## Acceptance Criteria

Prompt 02 is complete only if one of the following is true:

1. `PASS` or `PASS WITH OPERATOR-PENDING`:
   - Prompt 1B source-state guard passes;
   - live evidence rerun succeeds;
   - evidence root is generated from this rerun;
   - JSON hard gates are checked and reported;
   - Cost & Time and Systems Administration clipping gates are explicitly evaluated;
   - at least one meaningful scroll segment proves requested-vs-actual scroll preservation, unless every surface is proven not-scrollable;
   - artifact policy is clean;
   - closeout is written.

2. `BLOCKED`:
   - live lane/browser environment is unavailable;
   - self-skip is confirmed;
   - no fabricated evidence is created;
   - closeout clearly states that no live proof was produced.

3. `FAIL`:
   - source-state, validation, evidence, clipping, scroll preservation, or artifact-safety gates fail;
   - closeout clearly states why and recommends the next corrective prompt.
