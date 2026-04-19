# Prompt 06 — Harden Flagship Tile Density and Wide-State Authority

## Objective
After parity, curation, and layout-mode work are correct, tune the flagship band so it uses available canvas with more confidence and better command density.

## Why this prompt exists
Some of the current weakness is logic.
Some of it is still final density and field-authority tuning.

Once the earlier prompts are complete, the flagship band should still be inspected for:
- dead gutters
- under-dense tile rhythm
- weak wide-state authority
- and over-framed whitespace

## Current issue
The current hosted result under-spends the page width and over-spends structural space on low-value framing.

## Governing authority
Apply directly:
- `UI-Doctrine-SPFx-Governing-Standard.md`
- `UI-Doctrine-SPFx-Homepage-Overlay.md`
- benchmark package conformance / persona materials
- `docs/architecture/plans/MASTER/spfx/command-band/PriorityActionsRail-and-Admin-Spec.md`

## Inspect at minimum
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- any related style/variant seam materially affecting flagship density

## Required implementation outcome
Tune the flagship field so that:
- wide states feel left-authoritative and intentional
- tile density is high enough to feel useful
- spacing supports scanability rather than emptiness
- launch affordances remain clear
- the band remains subordinate to the hero but stronger than a generic utility widget

Do not reintroduce flat Quick Links behavior.
Do not solve this with decorative elevation alone.

## Done state
“Done” means the flagship band looks confident and efficient on real desktop/laptop widths without drifting into visual noise.

## Required proof of closure
Return:
- before/after hosted screenshots at a standard desktop width and a wide state
- notes on which spacing/density rules changed
- confirmation that narrower states were not regressed by the wide-state tuning

## Working rules
- Do not reopen already-correct wrapper ownership unless repo truth proves a real defect.
- Do not migrate the rail into shell-occupant semantics.
- Do not drift into unrelated homepage modules.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Return concrete proof of closure, not just a description of the changes.
