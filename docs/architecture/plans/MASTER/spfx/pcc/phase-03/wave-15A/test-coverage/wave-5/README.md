# PCC Phase 06 — Forceful Screenshot Reliability Remediation Prompt Package

## Purpose

This package gives your local code agent a forceful remediation sequence for the PCC live screenshot evidence failures observed after the PCC 1.0.0.219 rerun.

The observed failures are:

1. Cost & Time still captures with visible left-side clipping.
2. Systems Administration still captures with visible left-side clipping.
3. Six of eight surfaces produced exact duplicate PNG hashes across above-fold, full-page, and scroll-001.
4. Full-page captures remain 1280x720 rather than proving full-page/active-surface content capture.
5. The live Playwright test passes despite these evidence defects.

## Required Execution Order

1. `Prompt_01_Capture_Forensics_Do_Not_Fix.md`
2. `Prompt_02_Horizontal_Clipping_Remediation.md`
3. `Prompt_03_FullPage_And_Scroll_Segment_Remediation.md`
4. `Prompt_04_Strict_Live_Gates_And_Closeout_Rerun.md`

Do not skip Prompt 01. It is intentionally diagnostic and should identify the exact scroll container or layout mechanism responsible before remediation.

## Non-Negotiable Guardrails

- Do not hide, move, or style the native SharePoint assistant button.
- Do not crop screenshots to hide left clipping.
- Do not weaken assertions to get green tests.
- Do not treat duplicate screenshots as valid evidence unless the surface is proven truly non-scrollable and explicitly marked not applicable.
- Do not claim PASS if focused screenshots are not visually reviewed.
- Do not claim final visual polish approval. This work is capture-reliability and screenshot evidence integrity.
- If production source is the actual root cause, report and fix it explicitly. Do not bury a production layout bug inside the Playwright harness.

## Expected Current Baseline

- PCC deployed/test target: `1.0.0.219`
- Prompt 1B source commit ancestor: `00eb1d1748081f36cdffe542bd0aacd8f70e16d7`
- Latest known 1.0.0.219 package alignment commit: `2fdaf00c7bcdc457393b73419e789d2cc7140aec`
- Expected evidence root:
  `docs/architecture/evidence/pcc-live/phase-06-v1.0.0.219-screenshot-reliability-rerun`

## Suggested Commit Strategy

Commit each prompt separately unless Prompt 01 proves no source change is needed.

Recommended commit order:

1. `test(pcc-live): diagnose screenshot capture scroll roots`
2. `fix(pcc-live): prevent horizontal clipping in surface screenshots`
3. `test(pcc-live): harden full-page and scroll-segment screenshot evidence`
4. `docs(pcc): close screenshot reliability rerun for PCC 1.0.0.219`

