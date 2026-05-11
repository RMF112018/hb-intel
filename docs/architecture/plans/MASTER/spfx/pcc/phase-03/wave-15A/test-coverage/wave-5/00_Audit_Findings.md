# Audit Findings — PCC Screenshot Capture Reliability

## Observed Screenshot Artifact Behavior

The uploaded PCC 1.0.0.219 screenshot ZIP contains 24 screenshots:

- 8 surfaces
- 3 capture kinds per surface:
  - above-fold
  - full-page
  - scroll-001

All screenshots are 1280x720.

Exact SHA/file-size duplicate behavior:

| Surface | above-fold/full-page/scroll result |
|---|---|
| core-tools | all three exact duplicates |
| cost-time | all three exact duplicates |
| documents | all three exact duplicates |
| estimating-preconstruction | all three exact duplicates |
| project-controls | all three exact duplicates |
| systems-administration | all three exact duplicates |
| project-home | full-page and scroll-001 duplicates; above-fold differs |
| startup-closeout | above-fold and full-page duplicates; scroll-001 differs |

## Operator Visual Failures

### Cost & Time
- The left side of the PCC content is visibly clipped.
- The surface title appears as `st & Time`.
- The Project Control Center label and owner/client text are clipped.
- The first bento card title is clipped.

### Systems Administration
- Severe left clipping persists.
- Surface title and command header are partially missing.
- Left card content is clipped.
- Blank white area remains at the right while PCC content is shifted left.

## Likely Root Causes

### Root Cause 1 — Playwright tab click is inducing or preserving horizontal scroll drift

`PccLivePageObject.navigateToSurface(...)` uses a normal `tab.click()`. Playwright actionability will scroll the clicked element into view before clicking. For right-side tabs like Cost & Time and Systems Administration, this can horizontally scroll an ancestor container. The current capture reset does not prove it resets every relevant ancestor or SharePoint canvas container before capture.

### Root Cause 2 — Full-page screenshot is page/document-level, not active-surface-level

`page.screenshot({ fullPage: true })` only captures the browser document full page. In SharePoint/SPFx, meaningful scroll may be inside SharePoint canvas, PCC shell, active panel, or another container. If document height is effectively viewport-height, `fullPage` will remain 1280x720 and duplicate above-fold.

### Root Cause 3 — Scroll segments are accepted even when they are duplicate or not visually meaningful

The capture helper still generates a `scroll-001` file for not-scrollable content. This can be legitimate only if the surface is proven non-scrollable and the artifact is clearly marked not applicable. The current test passes as long as screenshots exist and basic metadata is present.

### Root Cause 4 — Live Playwright test is too permissive

The live screenshot test currently verifies that artifacts exist, that every surface has screenshot kinds, and that metadata fields exist. It does not hard-fail on:
- duplicate screenshots;
- Cost & Time left clipping;
- Systems Administration left clipping;
- full-page images staying 1280x720 without a not-applicable reason;
- scroll segments that do not visually or semantically prove capture movement.

## Remediation Objective

Do not make the evidence green by loosening gates. Make the capture reliable and then make the tests fail if the evidence is unreliable.
