# PCC Live Accessibility Evidence

- Run ID: accessibility-1778273044978
- Generated: 2026-05-08T20:44:23.360Z
- Tenant site: https://hedrickbrotherscom.sharepoint.[redacted-blob]
- Tenant page: https://hedrickbrotherscom.sharepoint.[redacted-blob].aspx
- Expected package version: 1.0.0.19
- EV refs: EV-72, EV-73, EV-74, EV-75, EV-76, EV-77, EV-78, EV-79, EV-80, EV-81, EV-82

## Summary
- Surface count: 8
- Axe violation count: 306
- Keyboard focus stops: 320
- ARIA needs-review count: 12
- Contrast needs-review count: 15
- Reduced-motion risk count: 1
- Hover-only risk count: 0
- Dialog/modal needs-review count: 0
- Touch target issue count: 66
- Touch target diagnostics (candidate/measured/hidden/disabled/disabled-filtered/fallback-used): 82/82/0/51/0/0
- Accessibility issue register count: 145
- Warning count: 0

## Touch Target Reconciliation Diagnostics
- Accessibility lane purpose: accessibility/touch review measurement.
- Accessibility threshold policy: 44px.
- Breakpoint and accessibility touch-target counts may differ by lane scope and threshold; count differences alone are not failure outcomes.
- Zero-measure reason counts:
  - root-not-found: 0
  - no-candidates-in-root: 2
  - all-candidates-hidden: 0
  - all-candidates-disabled-or-excluded: 0
  - measurement-error: 0

## Accessibility Issue Register
- JSON: pcc-live-accessibility-issue-register.json
- Markdown: pcc-live-accessibility-issue-register.md
- Total issue rows: 145
- Issue count by type:
  - axe-violation: 15
  - aria-name-missing: 11
  - disabled-reason-missing: 1
  - focus-indicator-missing: 28
  - contrast-needs-review: 15
  - touch-target-size: 66
  - hover-only-risk: 8
  - reduced-motion-risk: 1
  - dialog-focus-needs-review: 0
- Issue rows are evidence-support signals only and are not automated WCAG/hard-stop/score outcomes.

## Surface Table
| Surface | Axe | Focus Stops | ARIA Review | Contrast Review | Hover Risks | Touch Issues | Dialog Status |
|---|---:|---:|---:|---:|---:|---:|---|
| project-home | 96 | 40 | 3 | 2 | 0 | 18 | not-observed |
| team-and-access | 1 | 40 | 2 | 1 | 0 | 7 | not-observed |
| documents | 5 | 40 | 2 | 2 | 0 | 8 | not-observed |
| project-readiness | 147 | 40 | 1 | 2 | 0 | 2 | not-observed |
| approvals | 5 | 40 | 1 | 2 | 0 | 12 | not-observed |
| external-systems | 5 | 40 | 1 | 2 | 0 | 19 | not-observed |
| control-center-settings | 6 | 40 | 1 | 2 | 0 | 0 | not-observed |
| site-health | 41 | 40 | 1 | 2 | 0 | 0 | not-observed |

## Artifact Paths
- /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/accessibility-1778273044978/pcc-live-accessibility-evidence.json
- /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/accessibility-1778273044978/pcc-live-accessibility-evidence.md
- /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/accessibility-1778273044978/pcc-live-axe-summary.json
- /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/accessibility-1778273044978/pcc-live-keyboard-focus-summary.json
- /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/accessibility-1778273044978/pcc-live-aria-label-summary.json
- /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/accessibility-1778273044978/pcc-live-contrast-summary.json
- /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/accessibility-1778273044978/pcc-live-accessibility-issue-register.json
- /Users/bobbyfetting/hb-intel/docs/architecture/evidence/pcc-live/accessibility-1778273044978/pcc-live-accessibility-issue-register.md

## Warnings
- None

## Policy
- Accessibility evidence is operator-review pending before commit eligibility.
- Raw DOM HTML and raw Axe node payloads are prohibited in outputs.

> This output is accessibility, keyboard, focus, ARIA, contrast, reduced-motion, hover-only, touch-target, and dialog-focus evidence support for EV-72..EV-82 only. It is not a final scorecard result and does not mark any EV captured without operator review.
