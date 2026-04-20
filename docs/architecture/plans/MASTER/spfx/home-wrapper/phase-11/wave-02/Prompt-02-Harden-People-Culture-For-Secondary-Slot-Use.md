# Prompt 02 — Harden People Culture For Secondary-Slot Use

## Objective
Make the People Culture homepage surface credible as the subordinate companion in Row 3 beside Leadership Message across the non-handheld target range.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/01-Homepage-Webpart-Conformance-Standard.md`

## Inspect these seams first
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/peopleCulturePublic/**` or equivalent People Culture implementation seams
- the People Culture zone wrapper under `apps/hb-webparts/src/webparts/hbHomepage/zones/`

## Current gap to close
People Culture is currently primary-only, has a large minimum/preferred width, and does not advertise a credible compact or summary-collapsed nested mode.
That blocks Row 3.

## Required implementation outcome
Deliver a real secondary-slot People Culture mode that remains premium, readable, and useful when paired beside Leadership Message.
This likely requires:
- secondary-slot eligibility,
- a narrower stable layout mode,
- compact content hierarchy,
- updated comfort thresholds based on actual rendered behavior.

## Rules
- Do not solve this by forcing the shell to ignore fit rules.
- Do not create a fake secondary slot that is visually broken at standard laptop widths.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Proof of closure
Provide:
1. the implemented secondary-slot mode,
2. the updated fit contract,
3. evidence that Row 3 still pairs at the smallest intended non-handheld width.
