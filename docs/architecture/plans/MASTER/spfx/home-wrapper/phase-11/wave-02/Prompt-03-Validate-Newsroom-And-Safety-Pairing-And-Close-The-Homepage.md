# Prompt 03 — Validate Newsroom And Safety Pairing And Close The Homepage

## Objective
Validate the final composed homepage against the locked target state and close any remaining fit issues in the Safety + Newsroom / Company Pulse row.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/06-Closure-Checklist.md`

## Inspect these seams first
- `apps/hb-webparts/src/webparts/hbHomepage/**`
- `apps/hb-webparts/src/webparts/companyPulse/**`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/**` or equivalent safety seams
- any tests/harnesses created in Wave 01

## Current gap to close
After shell and child-fit work, the final homepage still needs breakpoint-proof closure across:
- standard laptop / desktop,
- larger desktop,
- tablet portrait fallback,
- handheld single-column fallback.

## Required implementation outcome
Prove the homepage now meets all of the following:
- only the approved six surfaces render below the launcher,
- row order matches the locked target state,
- row handedness alternates correctly,
- non-handheld widths preserve the intended three-row premium composition,
- handheld widths fall back cleanly to a disciplined single column,
- no horizontal overflow or fragile slot compression remains.

## Rules
- Do not claim closure on screenshots alone.
- Do not leave known fit failures for a later wave.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Proof of closure
Return:
1. viewport-by-viewport evidence,
2. any remaining defect list if full closure is not achieved,
3. a clear pass/fail statement against the locked target state.
