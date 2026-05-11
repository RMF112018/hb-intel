# Prompt 01 — PCC Phase 06 Screenshot Capture Reliability Remediation

## Role

You are my local code agent for `RMF112018/hb-intel`.

Your task is to remediate **screenshot capture reliability** for the PCC live Playwright evidence lane. This is a test/evidence-capture remediation, not a production UI design remediation.

Do not re-read files that are still in your current context or memory. Only open files needed to verify current repo truth, make the targeted changes, and run validation.

## Objective

Fix the screenshot capture pipeline so the evidence artifacts reliably prove what was captured.

The immediate defects to address are:

1. Surface `full-page` and `scroll-001` screenshots often appear identical or near-identical.
2. Screenshot metadata records intended scroll values but does not clearly prove actual scroll state.
3. Some right-side tab surfaces, specifically Cost & Time and Systems Administration, captured with visible left-side clipping / horizontal offset.
4. Capture does not appear to reset and verify horizontal scroll across the document, body, app containers, tab strip/shell, and active surface panel before each screenshot.
5. The native SharePoint assistant floating button is an external SharePoint overlay. Do not move it, hide it globally, or treat it as a PCC defect.

## Current Repo-Truth Anchors

Relevant current files are expected to include:

```text
e2e/pcc-live/pcc-live.screenshot-capture.ts
e2e/pcc-live/pcc-live.screenshot.spec.ts
e2e/pcc-live/pcc-live.screenshot.types.ts
e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts
e2e/pcc-live/pcc-live.breakpoint-evidence-writer.ts
e2e/pcc-live/pcc-live.breakpoint*.ts
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.surfaces.ts
```

The current capture code already has `capturePccSurfaceScreenshots(...)` and writes:
- above-fold screenshots;
- full-page screenshots;
- scroll-segment screenshots;
- DOM card summaries;
- screenshot inventories/contact sheets.

Keep that general architecture. Harden it.

## Strict Scope

Allowed:
- Modify screenshot capture helpers/specs/types/writers.
- Add evidence metadata fields needed for capture reliability.
- Add focused validation assertions around scroll state, clipping, and meaningful scroll segments.
- Add narrowly scoped helper functions for scroll reset, scroll container discovery, and capture diagnostics.
- Add focused evidence/closeout documentation if Prompt 02 is later run.

Not allowed:
- Do not change production source or UI components for this prompt.
- Do not install dependencies.
- Do not modify `pnpm-lock.yaml`.
- Do not move, hide, or style the native SharePoint assistant button.
- Do not remediate first-card/hero redundancy here.
- Do not claim final visual approval.
- Do not commit raw Playwright output, trace, video, HAR, storageState, cookies, auth files, or unsanitized console dumps.

## Implementation Requirements

### 1. Add a robust scroll reset helper

In the screenshot capture lane, add a reusable helper that runs before each screenshot capture and after navigation to each surface.

It must:

- force `window.scrollTo(0, 0)`;
- force `document.documentElement.scrollLeft = 0`;
- force `document.body.scrollLeft = 0`;
- find likely horizontal scroll containers within the PCC root/shell/surface area and set `scrollLeft = 0`;
- avoid relying on the tab strip’s horizontal scroll position as the page/content scroll position;
- wait for layout stabilization after reset.

Suggested DOM scope targets, adapted to repo truth:

```text
[data-pcc-root]
[data-pcc-active-surface-panel]
main[role="tabpanel"][data-pcc-active-surface-panel]
[data-pcc-bento-grid]
[data-pcc-shell]
[data-pcc-surface-shell]
```

Also include a safe generic fallback over visible elements with `scrollWidth > clientWidth`, but do not create brittle selectors or mutate production DOM attributes.

### 2. Add actual scroll diagnostics

For every screenshot artifact, record diagnostics in metadata. At minimum:

```ts
requestedScrollY?: number;
actualWindowScrollY: number;
actualDocumentScrollLeft: number;
actualBodyScrollLeft: number;
maxHorizontalScrollLeftObserved: number;
activeSurfacePanelLeft: number | null;
activeSurfacePanelRight: number | null;
activeSurfacePanelWidth: number | null;
activeSurfacePanelScrollLeft: number | null;
bentoGridLeft: number | null;
bentoGridRight: number | null;
bentoGridWidth: number | null;
documentClientWidth: number;
documentScrollWidth: number;
viewportWidth: number;
viewportHeight: number;
horizontalResetApplied: boolean;
horizontalScrollWithinTolerance: boolean;
surfacePanelLeftWithinTolerance: boolean;
captureReliabilityWarnings: string[];
```

Use the project’s existing type names/patterns. Do not overfit this exact interface name if repo conventions differ.

### 3. Capture scroll segments from the correct scroll root

The current behavior appears to use `window.scrollTo(0, y)`. That may be insufficient if the scrollable content is inside a SharePoint canvas, PCC shell container, or active surface panel.

Implement a reliable scroll-root selection strategy:

1. Prefer the active PCC surface panel if it is vertically scrollable.
2. Else prefer a PCC shell/root/container if vertically scrollable.
3. Else fall back to `window/document`.

For each surface:
- compute the actual scrollable height of the selected scroll root;
- compute meaningful segment positions;
- capture no duplicate scroll segment if the surface is not scrollable;
- if no meaningful scroll is possible, record a `not-scrollable` reason rather than creating fake duplicate scroll screenshots;
- for scrollable content, set the scroll root to the target Y, wait for layout, then verify the actual scroll Y.

Do not record `scrollY` as only the intended target. Record both requested and actual.

### 4. Prevent and detect horizontal capture drift

Before each capture:
- run horizontal reset;
- verify document/body/root/panel `scrollLeft` is zero or within tolerance;
- verify the active surface panel’s bounding left is not negative and is within the expected viewport/content tolerance;
- verify the bento grid’s bounding left is not negative and is within the same tolerance.

If these checks fail:
- add a warning to the surface evidence;
- do not silently proceed as if capture is reliable;
- optionally retry once after another reset;
- if still failing, classify the screenshot artifact with `captureReliabilityWarnings`.

Recommended tolerance:
- 0 to 2 pixels for scrollLeft;
- no negative active panel/grid left value below `-2px`;
- if SharePoint chrome produces a positive left inset, accept it. The key failure is negative clipping/left-shift.

### 5. Make full-page and scroll screenshots meaningful

Update capture behavior so:

- above-fold = viewport at top with verified horizontal reset;
- full-page = true full-page screenshot when technically supported;
- scroll-segment screenshots are only produced for meaningful additional vertical positions;
- if the selected scroll root cannot produce a different viewport, do not create misleading `scroll-001` duplicates, or explicitly label them as `not-scrollable-confirmation`;
- evidence metadata indicates:
  - `segmentIndex`;
  - `segmentCount`;
  - `requestedScrollY`;
  - `actualScrollY`;
  - `scrollRootKind`;
  - `scrollRootSelector` or safe descriptor;
  - `contentScrollHeight`;
  - `contentClientHeight`;
  - `meaningfulScrollDelta`.

### 6. Add duplicate / near-duplicate capture diagnostics

Use Node built-ins only; do not install dependencies.

At minimum:
- record file size and/or a simple SHA-256 hash for each screenshot artifact after capture;
- within each surface, compare above-fold vs scroll-segment hashes;
- if hashes are identical, add a reliability warning unless the surface is explicitly classified as not scrollable;
- optionally compare dimensions and actual scroll positions.

Do not fail merely because a non-scrollable surface has identical images. Do fail or warn if a surface is scrollable but the segment image is identical to the top capture.

### 7. Update tests

Update or add focused tests in `e2e/pcc-live/pcc-live.screenshot.spec.ts` or a nearby spec to validate:

- new screenshot artifact metadata fields are populated;
- horizontal reset diagnostics are present;
- raw/sensitive artifact policy still passes;
- no unsafe path classes are emitted;
- operator-review-required posture remains;
- no final score / hard-stop / Phase readiness approval is claimed;
- scroll-segment artifacts must either:
  - have verified actual scroll movement, or
  - be explicitly marked not-scrollable / not-applicable.

If live env is missing, retain self-skip behavior.

### 8. Update evidence writer output

Update `pcc-live.screenshot-evidence-writer.ts` so generated JSON/Markdown/contact sheet/inventory surfaces the new reliability diagnostics without leaking sensitive information.

The Markdown should make these clear:

- actual vs requested scroll state;
- horizontal reset status;
- clipped/left-shift capture warning status;
- duplicate/near-duplicate warning status;
- whether each scroll segment is meaningful or not applicable;
- no final score or hard-stop approval is produced.

### 9. Optional breakpoint parity

If breakpoint screenshot capture has a separate path parallel to surface screenshots, apply the same horizontal reset and diagnostic principles there.

Do not broaden the change unless the breakpoint capture path clearly shares the same reliability problem.

## Validation Commands

Run these in order:

```bash
git status --short

pnpm --filter @hbc/spfx-project-control-center check-types

pnpm --filter @hbc/spfx-project-control-center test -- e2e/pcc-live/pcc-live.screenshot.spec.ts

pnpm exec playwright test --config=playwright.pcc-live.config.ts --list

pnpm pcc:e2e:evidence:registry

pnpm exec prettier --check e2e/pcc-live/pcc-live.screenshot-capture.ts e2e/pcc-live/pcc-live.screenshot.spec.ts e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts

git diff --check
```

If the targeted `pnpm --filter ... test -- e2e/...` syntax is not valid for this repo’s test runner, use the repo-correct focused test command and report exactly what you ran.

If live env is available, also run a focused screenshot evidence capture against a new evidence root:

```bash
PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-screenshot-reliability-rerun" pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
```

## Required Local-Agent Output

Return a following-execution report with:

```text
Summary:
- ...

Files changed:
- ...

Implementation notes:
- ...

Capture reliability changes:
- Horizontal reset helper:
- Scroll-root selection:
- Actual scroll diagnostics:
- Duplicate/near-duplicate diagnostics:
- Evidence writer changes:
- Breakpoint parity changes, if any:

Validation:
- command -> pass/fail + key output

Live evidence:
- ran / not run
- evidence root
- screenshots generated
- scroll reliability warnings
- Cost & Time clipping status
- Systems Administration clipping status

Git status:
- ...

Commit recommendation:
- ...
```

## Acceptance Criteria

This prompt is complete only if:

- no production source was changed;
- no dependency or lockfile drift occurred;
- screenshot artifacts now distinguish requested vs actual scroll;
- horizontal scroll reset is applied and verified before each capture;
- active panel/grid left clipping is detected and reported;
- scroll screenshots are meaningful or explicitly marked not applicable;
- duplicate screenshots are detected or justified;
- raw Playwright/auth artifacts remain excluded;
- generated reports do not claim final visual approval;
- validation passes.
