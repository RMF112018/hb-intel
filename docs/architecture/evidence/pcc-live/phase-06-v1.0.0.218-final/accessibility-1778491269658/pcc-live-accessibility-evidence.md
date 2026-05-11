# PCC Live Accessibility Evidence

- Run ID: accessibility-1778491269658
- Generated: 2026-05-11T09:21:24.684Z
- Tenant site: https://hedrickbrotherscom.sharepoint.[redacted-blob]
- Tenant page: https://hedrickbrotherscom.sharepoint.[redacted-blob].aspx
- Expected package version: 1.0.0.218
- EV refs: EV-72, EV-73, EV-74, EV-75, EV-76, EV-77, EV-78, EV-79, EV-80, EV-81, EV-82

## Summary
- Surface count: 8
- Axe violation count: 160
- Keyboard focus stops: 320
- ARIA needs-review count: 11
- Contrast needs-review count: 16
- Reduced-motion risk count: 0
- Hover-only risk count: 0
- Dialog/modal needs-review count: 0
- Touch target issue count: 35
- Touch target diagnostics (candidate/measured/hidden/disabled/disabled-filtered/fallback-used): 36/36/0/22/0/0
- Accessibility issue register count: 87
- Warning count: 0

## Touch Target Reconciliation Diagnostics
- Accessibility lane purpose: accessibility/touch review measurement.
- Accessibility threshold policy: 44px.
- Breakpoint and accessibility touch-target counts may differ by lane scope and threshold; count differences alone are not failure outcomes.
- Zero-measure reason counts:
  - root-not-found: 0
  - no-candidates-in-root: 6
  - all-candidates-hidden: 0
  - all-candidates-disabled-or-excluded: 0
  - measurement-error: 0

## Accessibility Issue Register
- JSON: pcc-live-accessibility-issue-register.json
- Markdown: pcc-live-accessibility-issue-register.md
- Total issue rows: 87
- Issue count by type:
  - axe-violation: 16
  - aria-name-missing: 10
  - disabled-reason-missing: 1
  - focus-indicator-missing: 1
  - contrast-needs-review: 16
  - touch-target-size: 35
  - hover-only-risk: 8
  - reduced-motion-risk: 0
  - dialog-focus-needs-review: 0
- Issue rows are evidence-support signals only and are not automated WCAG/hard-stop/score outcomes.

## Surface Table
| Surface | Axe | Focus Stops | ARIA Review | Contrast Review | Hover Risks | Touch Issues | Dialog Status |
|---|---:|---:|---:|---:|---:|---:|---|
| project-home | 103 | 40 | 3 | 2 | 0 | 27 | not-observed |
| core-tools | 3 | 40 | 2 | 2 | 0 | 0 | not-observed |
| documents | 4 | 40 | 1 | 2 | 0 | 8 | not-observed |
| estimating-preconstruction | 8 | 40 | 1 | 2 | 0 | 0 | not-observed |
| startup-closeout | 13 | 40 | 1 | 2 | 0 | 0 | not-observed |
| project-controls | 9 | 40 | 1 | 2 | 0 | 0 | not-observed |
| cost-time | 11 | 40 | 1 | 2 | 0 | 0 | not-observed |
| systems-administration | 9 | 40 | 1 | 2 | 0 | 0 | not-observed |

## Artifact Paths
- docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/accessibility-1778491269658/pcc-live-accessibility-evidence.json
- docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/accessibility-1778491269658/pcc-live-accessibility-evidence.md
- docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/accessibility-1778491269658/pcc-live-axe-summary.json
- docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/accessibility-1778491269658/pcc-live-keyboard-focus-summary.json
- docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/accessibility-1778491269658/pcc-live-aria-label-summary.json
- docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/accessibility-1778491269658/pcc-live-contrast-summary.json
- docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/accessibility-1778491269658/pcc-live-accessibility-issue-register.json
- docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/accessibility-1778491269658/pcc-live-accessibility-issue-register.md

## Warnings
- None

## Policy
- Accessibility evidence is operator-review pending before commit eligibility.
- Raw DOM HTML and raw Axe node payloads are prohibited in outputs.

> This output is accessibility, keyboard, focus, ARIA, contrast, reduced-motion, hover-only, touch-target, and dialog-focus evidence support for EV-72..EV-82 only. It is not a final scorecard result and does not mark any EV captured without operator review.
