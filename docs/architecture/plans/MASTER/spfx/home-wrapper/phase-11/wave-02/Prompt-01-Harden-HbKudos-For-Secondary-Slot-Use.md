# Prompt 01 — Harden HB Kudos For Secondary-Slot Use

## Objective
Make `hbKudos` stable and useful as the subordinate companion surface in Row 1 next to Project Portfolio Spotlight across the non-handheld target range.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/01-Homepage-Webpart-Conformance-Standard.md`

## Inspect these seams first
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbKudos/**`
- the HB Kudos zone wrapper under `apps/hb-webparts/src/webparts/hbHomepage/zones/`
- any existing HB Kudos compact or nested-width logic

## Current gap to close
HB Kudos currently carries comfort thresholds that are too expensive for a narrow companion slot across the full non-handheld width range.

## Required implementation outcome
Deliver a real secondary-slot mode for HB Kudos that remains credible when paired beside Project Portfolio Spotlight.
That may include:
- a narrower stable nested mode,
- controlled metadata reduction,
- compact card treatment,
- summary-first posture,
- updated fit contract in the registry.

## Rules
- Do not cheapen the surface into a broken miniature.
- Preserve the HB Kudos persona while adapting it to the shell slot.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Proof of closure
Provide:
1. the new narrow-slot behavior,
2. any registry comfort changes,
3. screenshots or test evidence at the smallest intended non-handheld width where Row 1 must still pair.
