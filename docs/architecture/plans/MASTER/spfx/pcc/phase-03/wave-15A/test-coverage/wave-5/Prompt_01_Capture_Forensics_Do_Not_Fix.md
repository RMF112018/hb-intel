# Prompt 01 — PCC Screenshot Capture Forensics — Diagnose Before Fixing

## Role

You are my local code agent for `RMF112018/hb-intel`.

Your task is to identify the exact root cause of PCC live screenshot capture failures. This is a diagnostic prompt. Do not implement remediation in this prompt unless explicitly instructed after the findings are reviewed.

Do not re-read files that are still in your current context or memory. Open only files needed to validate current repo truth and add focused diagnostics.

## Context

The PCC 1.0.0.219 live screenshot rerun generated 24 screenshots, but the evidence failed operator review:

- Cost & Time still has visible left-side clipping.
- Systems Administration still has visible left-side clipping.
- Six of eight surfaces produced exact duplicate hashes across above-fold/full-page/scroll-001.
- All screenshots are 1280x720.
- The live screenshot Playwright spec still passed.

## Objective

Instrument the live screenshot lane to identify:

1. Which element/container is causing horizontal clipping after right-side tab navigation.
2. Whether Playwright `tab.click()` scrolls a tab-strip, SharePoint canvas, shell wrapper, or active-panel ancestor horizontally.
3. Which element is the true vertical scroll root for each surface.
4. Why `fullPage` remains 1280x720.
5. Whether scroll-segment screenshots are moving the actual visible viewport/content or only updating metadata.

## Strict Scope

Allowed:
- Add a temporary/focused diagnostic spec or diagnostic helper under `e2e/pcc-live/**`.
- Write scrubbed diagnostic JSON/Markdown under:
  `docs/architecture/evidence/pcc-live/phase-06-v1.0.0.219-screenshot-reliability-rerun/forensics-*`
- Add no production source changes.
- Add no dependency changes.

Not allowed:
- Do not change runtime UI components.
- Do not change screenshot capture behavior yet.
- Do not weaken existing tests.
- Do not hide/move/native SharePoint assistant button.
- Do not stage raw Playwright artifacts, trace, video, HAR, storageState, cookies, auth, or unsanitized tenant data.

## Required Diagnostics

Create a diagnostic that runs at least these surfaces:

- `project-home`
- `documents`
- `cost-time`
- `systems-administration`

For each target surface, capture diagnostic snapshots at these moments:

1. before tab navigation;
2. immediately after `navigateToSurface(surface)`;
3. after current horizontal reset helper;
4. immediately before above-fold screenshot;
5. immediately before full-page screenshot;
6. immediately before first scroll-segment screenshot.

For each moment, record:

```ts
{
  surfaceId,
  stage,
  urlSanitized,
  viewport: { width, height },
  document: {
    scrollX,
    scrollY,
    documentElementScrollLeft,
    bodyScrollLeft,
    clientWidth,
    scrollWidth,
    clientHeight,
    scrollHeight
  },
  activePanel: {
    found,
    selector,
    tagName,
    role,
    id,
    left,
    right,
    width,
    scrollLeft,
    scrollTop,
    clientWidth,
    scrollWidth,
    clientHeight,
    scrollHeight,
    overflowX,
    overflowY,
    transform
  },
  bentoGrid: same shape where applicable,
  heroBand: same shape where applicable,
  tabsContainer: same shape where applicable,
  activeTab: same shape where applicable,
  scrollContainers: [
    {
      selectorOrPath,
      tagName,
      role,
      dataAttributesSummary,
      classNameSanitized,
      left,
      right,
      width,
      scrollLeft,
      scrollTop,
      clientWidth,
      scrollWidth,
      clientHeight,
      scrollHeight,
      overflowX,
      overflowY,
      transform,
      containsActivePanel,
      containsActiveTab,
      isAncestorOfActivePanel,
      isAncestorOfActiveTab
    }
  ],
  leftBoundaryProbe: {
    activePanelLeftOk,
    bentoGridLeftOk,
    heroBandLeftOk,
    firstVisibleHeadingLeftOk,
    minRelevantLeft,
    failingSelectors
  }
}
```

## Required Scroll Container Discovery

Do not only inspect known PCC selectors.

Discover and record:

- every visible element with `scrollWidth > clientWidth + 1`;
- every visible element with `scrollHeight > clientHeight + 1`;
- every ancestor of the active tab;
- every ancestor of the active panel;
- every ancestor of the bento grid;
- elements whose computed `transform` is not `none`;
- elements whose `left` is negative or whose right edge suggests shifted content.

Limit output size by summarizing class names and data attributes, but keep enough information to identify the culprit.

## Required Image/Hash Diagnostics

For every generated screenshot in the diagnostic run:

- record width/height;
- record file size;
- record SHA-256;
- group identical hashes by surface;
- explicitly report:
  - above-fold == full-page?
  - above-fold == scroll-001?
  - full-page == scroll-001?

## Required Forensics Report

Create:

```text
docs/architecture/evidence/pcc-live/phase-06-v1.0.0.219-screenshot-reliability-rerun/forensics-<timestamp>/SCREENSHOT_CAPTURE_FORENSICS.md
```

The report must include:

```text
# PCC Screenshot Capture Forensics — 1.0.0.219

## Verdict
- Root cause identified: yes/no
- Horizontal clipping cause:
- Full-page duplicate cause:
- Scroll-segment duplicate cause:

## Cost & Time Findings
- stage where clipping appears:
- responsible scroll container or transform:
- activePanel/bento/heading left bounds:

## Systems Administration Findings
- stage where clipping appears:
- responsible scroll container or transform:
- activePanel/bento/heading left bounds:

## Full-Page Findings
- document scroll dimensions:
- active surface scroll dimensions:
- reason fullPage is or is not meaningful:

## Scroll-Segment Findings
- true scroll root:
- requested vs actual scroll:
- hash movement:
- visual movement likely:

## Recommended Remediation
- exact files to change:
- exact test gates to add:
```

## Validation

Run:

```bash
git status --short
PCC_EXPECTED_PACKAGE_VERSION="1.0.0.219" pnpm exec tsx -e "import { resolvePccLiveEnv } from './e2e/pcc-live/pcc-live.env.ts'; console.log(JSON.stringify(resolvePccLiveEnv(), null, 2));"
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/<new-diagnostic-spec-name>.ts
git diff --check
```

## Required Final Response

Return:

```text
Summary:
- ...

Root cause:
- horizontal clipping:
- full-page duplicate:
- scroll duplicate:

Files changed:
- ...

Evidence root:
- ...

Validation:
- ...

Recommended next prompt:
- ...
```
