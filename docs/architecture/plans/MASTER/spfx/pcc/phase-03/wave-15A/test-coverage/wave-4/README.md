# PCC Phase 06 — Screenshot Capture Reliability Prompt Package

## Purpose

This package gives your local code agent focused instructions to remediate screenshot capture reliability only.

It is intentionally scoped to Playwright/evidence capture mechanics, not production UI design remediation.

## Current Finding Being Addressed

Operator screenshot review found that the evidence capture lane does not reliably prove visual state because:

- Some `full-page` and `scroll-001` screenshots appear identical or near-identical.
- `scrollY` appears recorded as an intended value, not necessarily the verified browser/container scroll state.
- Cost & Time and Systems Administration screenshots showed horizontal left-clipping / shifted content.
- The capture flow does not visibly prove that document/body/app/shell/surface-panel horizontal scroll was reset before capture.
- The native SharePoint assistant floating button is an environmental overlay and must not be treated as a PCC defect or moved by PCC code.

## Package Contents

1. `Prompt_01_Screenshot_Capture_Reliability_Remediation.md`
   - Main implementation prompt.
   - Targets screenshot capture helpers/specs/evidence writer metadata.
   - Adds hard-gated scroll-state reliability checks and richer diagnostics.

2. `Prompt_02_Focused_Rerun_And_Closeout.md`
   - Follow-up evidence rerun and closeout prompt.
   - Ensures the local agent proves the remediation with targeted captures and validation output.

## Use Order

Run Prompt 01 first. After the agent completes implementation and validation, run Prompt 02 to collect and report the focused evidence.

## Expected Scope

Allowed likely files:

```text
e2e/pcc-live/pcc-live.screenshot-capture.ts
e2e/pcc-live/pcc-live.screenshot.spec.ts
e2e/pcc-live/pcc-live.screenshot.types.ts
e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts
e2e/pcc-live/pcc-live.breakpoint*.ts        # only if breakpoint capture has parallel capture reliability gaps
docs/architecture/evidence/pcc-live/**       # only new focused rerun evidence, not broad historical cleanup
```

Do not edit production PCC source unless the local agent discovers and proves a real production defect. This package is not intended to remediate the duplicate first-card/hero issue or any SharePoint native assistant overlay.

## Acceptance Summary

The prompt sequence is successful only when:

- Surface screenshots record actual scroll position, not only requested scroll position.
- Horizontal scroll is reset and verified before each capture.
- Active surface panel left boundary is non-negative / within tolerance.
- `scroll-001` and full-page captures are meaningful or explicitly classified as not applicable due no-scroll content.
- Cost & Time and Systems Administration no longer capture with left-side clipping caused by capture state.
- Evidence metadata clearly distinguishes requested vs actual scroll and includes capture diagnostics.
- Raw Playwright artifacts, auth, storageState, HAR, trace, video, and unsanitized sensitive data remain excluded.
