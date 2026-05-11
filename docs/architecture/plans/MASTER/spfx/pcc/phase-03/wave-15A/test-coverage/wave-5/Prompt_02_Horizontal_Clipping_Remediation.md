# Prompt 02 — PCC 1.0.0.219 Horizontal Clipping Remediation — Updated After Forensics

## Role

You are my local code agent for `RMF112018/hb-intel`.

You are remediating the PCC live screenshot horizontal clipping defect confirmed by Prompt 01 forensics.

Do not re-read files that are still in your current context or memory. Use current repo truth and the committed Prompt 01 forensic evidence. Only open files necessary to implement the horizontal clipping remediation, add regression gates, and run validation.

This prompt is designed for Claude Code Opus 4.7 execution.

## Governing Repo-Truth / Evidence

Prompt 01 forensic commit:

```text
1c4da3587e6de8a577e9987e6870944ddc13d97f
test(pcc-live): add screenshot capture forensics diagnostics
```

Forensic evidence root:

```text
docs/architecture/evidence/pcc-live/phase-06-v1.0.0.219-screenshot-reliability-rerun/forensics-2026-05-11T11-43-47-439Z
```

Forensic findings that must govern this remediation:

```text
Cost & Time:
- first failing stage: after-tab-nav
- failing selectors: activePanel, heroBand
- minRelevantLeft: -10.00
- best reset: group:global-overflow-candidates

Systems Administration:
- first failing stage: after-tab-nav
- failing selectors: activePanel, bentoGrid, heroBand
- minRelevantLeft: -263.00
- best reset: group:global-overflow-candidates

Click trigger delta table:
- no simple ancestor scrollLeft deltas observed for Playwright click or DOM click

Full-page / scroll duplicate:
- known separate issue for Prompt 03
- do not try to solve full-page or scroll-segment semantics in this prompt except to preserve existing behavior and avoid regressions
```

The forensics prove the clipping begins immediately after surface navigation and that broad/global overflow candidate resets correct it. They do **not** prove the issue is only a simple tab-click `scrollLeft` delta.

## Objective

Fix PCC live screenshot capture so right-side tab surfaces no longer capture with left-side clipping.

The fix must handle:

- `cost-time`
- `systems-administration`
- future right-side tabs or horizontally scrolled tab-strip states

## Non-Negotiable Outcome

After this prompt, the live screenshot capture lane must fail if either `cost-time` or `systems-administration` has any of the following **after horizontal normalization and before each screenshot capture**:

- `activeSurfacePanelLeft < -2`
- `bentoGridLeft < -2`
- `heroBandLeft < -2`
- first visible heading/card left bound `< -2`
- `horizontalScrollWithinTolerance === false`
- any clipping-related reliability warning
- any visible left clipping in the focused generated screenshot review

Do not allow these defects to remain as warnings on focused surfaces. They must be hard failures.

## Strict Scope

Allowed:

- Modify `e2e/pcc-live/**` screenshot capture, page-object, spec, diagnostic/helper, type, or evidence-writer files as needed.
- Add test-only helpers for horizontal normalization and clipping diagnostics.
- Add or strengthen synthetic tests for global overflow candidate normalization.
- Add or strengthen live screenshot hard gates.
- Add focused evidence metadata fields if needed for horizontal clipping diagnostics.
- If, and only if, current repo truth proves a production layout defect is the cause and the test harness cannot normalize the state without hiding a real UI defect, fix the production shell/layout source explicitly and add runtime regression tests.

Not allowed:

- Do not crop screenshots to hide the defect.
- Do not mask or hide clipped PCC content.
- Do not hide, move, style, or classify the native SharePoint assistant button as a PCC defect.
- Do not weaken existing assertions.
- Do not relabel clipping as acceptable.
- Do not solve Prompt 03 full-page/scroll-segment semantics here except to preserve/avoid regression.
- Do not install dependencies.
- Do not modify `pnpm-lock.yaml`.
- Do not edit blueprint authority docs.
- Do not stage raw Playwright artifacts, trace, video, HAR, storageState, auth, cookies, tokens, or unrelated evidence directories.

## Required Implementation

### 1. Create a reusable horizontal normalization helper

Add a robust helper in the PCC live screenshot lane, with naming aligned to repo conventions, such as:

```ts
normalizeHorizontalCaptureState(...)
```

It must:

1. Run immediately after every surface navigation.
2. Run immediately before every screenshot capture.
3. Preserve vertical scroll position for scroll-segment captures.
4. Reset horizontal state on:
   - `document.documentElement`
   - `document.body`
   - active surface panel
   - bento grid
   - project hero band
   - first visible heading/card container
   - PCC root/shell/surface wrappers
   - ancestors of the active tab
   - ancestors of the active surface panel
   - ancestors of the bento grid
   - all visible horizontal overflow candidates discovered by:
     - `scrollWidth > clientWidth + 1`
     - computed `overflow-x` in `auto | scroll | clip | hidden`
     - negative `getBoundingClientRect().left`
     - transforms not equal to `none`
5. Avoid resetting vertical scroll except when explicitly requested for top captures.
6. Record which containers were reset and which were intentionally excluded.

Important: because Prompt 01 found no simple tab ancestor `scrollLeft` deltas, the helper must not restrict itself to tab ancestors. It must include global overflow candidates.

### 2. Add stronger left-bound diagnostics

Extend or create diagnostics so every artifact can report, at minimum:

```ts
activeSurfacePanelLeft
bentoGridLeft
heroBandLeft
firstHeadingOrCardLeft
minRelevantLeft
horizontalResetCandidateCount
horizontalResetAppliedCount
horizontalResetExcludedCount
horizontalNormalizationAttempts
horizontalNormalizationSucceeded
horizontalNormalizationFailures
```

If adding type fields, update `pcc-live.screenshot.types.ts`, evidence writer, and tests consistently.

### 3. Make focused clipping unrecoverable as a warning

For `cost-time` and `systems-administration`, the capture/test flow must hard-fail when left-bound checks fail after normalization.

This means:

- if normalization fails before above-fold capture: fail the live screenshot test;
- if normalization fails before full-page capture: fail the live screenshot test;
- if normalization fails before scroll-segment capture: fail the live screenshot test;
- do not continue silently and let evidence writer bury the issue in warnings.

Acceptable implementation options:

- throw an error from capture helper for focused hard-gate surfaces;
- return a failed artifact state and assert failure in the spec;
- collect all focused failures then fail with a clear message.

The failure message must include:

```text
surfaceId
artifact kind
minRelevantLeft
activeSurfacePanelLeft
bentoGridLeft
heroBandLeft
firstHeadingOrCardLeft
normalization attempts
top failing candidate summaries
```

### 4. Navigation hardening

Update navigation/capture sequencing so horizontal normalization happens:

1. before surface navigation;
2. immediately after `navigateToSurface(surface)`;
3. after layout stabilization;
4. immediately before each screenshot capture.

If using normal `tab.click()`, normalize after the click. If using a controlled DOM click for the live screenshot lane, prove that tab accessibility state and active-panel state still update correctly.

Do not assume Playwright actionability is the root cause; use the forensic fact that clipping begins after tab navigation and broad/global overflow reset clears it.

### 5. Synthetic regression tests

Add or strengthen deterministic tests in `e2e/pcc-live/pcc-live.screenshot.spec.ts` or a closely scoped new test file.

Tests must include:

#### Synthetic global-overflow clipping fixture

Build a fixture with:

- a horizontal tab strip;
- a right-side tab;
- an active panel;
- bento grid;
- hero band;
- a global overflow ancestor/container that can shift panel content left;
- a visible heading/card.

Then prove:

- before normalization, the fixture can produce `minRelevantLeft < -2`;
- after normalization, active panel, bento grid, hero, and first heading/card left bounds are `>= -2`;
- vertical position is preserved when normalization is called in horizontal-only mode.

#### Focused surface gate fixture

Add a test or assertion helper proving that `cost-time` and `systems-administration` are treated as focused hard-gate surfaces and cannot pass with clipping warnings.

### 6. Live screenshot hard gates

Strengthen the live screenshot test so it fails if either focused surface has any clipping failure.

For these surfaces:

```text
cost-time
systems-administration
```

Assert all artifacts satisfy:

```text
horizontalScrollWithinTolerance === true
surfacePanelLeftWithinTolerance === true
bentoGridLeftWithinTolerance === true
heroBandLeft >= -2 or null only if marker truly absent
firstHeadingOrCardLeft >= -2 or null only if no heading/card exists
minRelevantLeft >= -2
captureReliabilityWarnings does not contain:
  - horizontal-scroll-drift
  - active-surface-panel-left-clipped
  - bento-grid-left-clipped
  - hero-band-left-clipped
  - first-heading-card-left-clipped
  - horizontal-normalization-failed
```

Do not fail `project-home` or `documents` for Prompt 03 duplicate/full-page semantics in this prompt.

### 7. Evidence writer

Update the screenshot evidence markdown/contact sheet so clipping status is visible.

At minimum, surface:

- `minRelevantLeft`
- clipping yes/no
- horizontal normalization succeeded yes/no
- horizontal reset candidate count
- clipping warnings

Do not claim final visual approval.

## Required Validation Commands

Run exactly, unless repo tooling requires a documented equivalent:

```bash
git status --short

PCC_EXPECTED_PACKAGE_VERSION="1.0.0.219" pnpm exec tsx -e "import { resolvePccLiveEnv } from './e2e/pcc-live/pcc-live.env.ts'; console.log(JSON.stringify(resolvePccLiveEnv(), null, 2));"

pnpm --filter @hbc/spfx-project-control-center check-types

pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts

PCC_EXPECTED_PACKAGE_VERSION="1.0.0.219" PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/phase-06-v1.0.0.219-screenshot-reliability-rerun" pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts

pnpm exec playwright test --config=playwright.pcc-live.config.ts --list

pnpm pcc:e2e:evidence:registry

pnpm exec prettier --check e2e/pcc-live/pcc-live.screenshot-capture.ts e2e/pcc-live/pcc-live.screenshot.spec.ts e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts e2e/pcc-live/pcc-live.screenshot.types.ts

git diff --check
```

If production source is changed, also run the relevant package test/build/check commands for the changed source area and report them.

## Required Live Evidence Review

After the live run, inspect the generated evidence root and report:

```text
Evidence root:
- ...

Cost & Time:
- above-fold clipping status:
- full-page clipping status:
- scroll-segment clipping status:
- minRelevantLeft values:
- warnings:

Systems Administration:
- above-fold clipping status:
- full-page clipping status:
- scroll-segment clipping status:
- minRelevantLeft values:
- warnings:
```

Open the focused screenshots and visually verify no left clipping remains for:

```text
surface-cost-time-above-fold.png
surface-cost-time-full-page.png
surface-cost-time-scroll-001.png
surface-systems-administration-above-fold.png
surface-systems-administration-full-page.png
surface-systems-administration-scroll-001.png
```

If full-page/scroll screenshots are duplicates, do not solve that here unless it is directly caused by horizontal clipping. Record it as Prompt 03 carry-forward.

## Required Final Response

Return:

```text
Summary:
- ...

Forensic baseline used:
- commit:
- evidence root:
- confirmed first-failure stages:

Root cause remediated:
- exact mechanism:
- why this is not just a tab-click-only assumption:

Files changed:
- ...

Synthetic gates:
- ...

Live gates:
- Cost & Time:
- Systems Administration:

Prompt 03 carry-forward:
- full-page/scroll duplicate status:
- not remediated here unless fixed incidentally:

Validation:
- command -> pass/fail + key output

Evidence path:
- ...

Git status:
- ...

Commit recommendation:
- summary:
- description:
```

## Acceptance Criteria

This prompt is complete only if:

1. Prompt 01 forensic baseline is explicitly referenced.
2. Horizontal normalization includes global overflow candidates, not only known selectors.
3. Cost & Time no longer captures with negative focused left bounds.
4. Systems Administration no longer captures with negative focused left bounds.
5. Focused clipping failures are hard failures, not warnings.
6. Synthetic tests prove the global-overflow normalization behavior.
7. Live screenshot test passes only if focused clipping gates pass.
8. No screenshot cropping/hiding/masking workaround is used.
9. Native SharePoint assistant button is untouched.
10. Full-page/scroll duplicate issue is either unchanged and carried to Prompt 03 or incidentally improved without broad scope creep.
