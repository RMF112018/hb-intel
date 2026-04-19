# Prompt 04 — Promote Desktop and Tablet Overflow into a Real Secondary Command Layer

## Objective
Make overflow on larger surfaces feel like a deliberate secondary command layer rather than an appended inline list.

## Why this prompt exists
The shared rail family already supports:
- inline disclosure
- anchored menu
- modal sheet

That is good.
What is not good is allowing the flagship path to over-rely on inline disclosure for desktop and tablet conditions where a stronger anchored secondary-command treatment is available.

## Current issue
Overflow currently feels technically present but product-light.
The flagship surface needs a stronger relationship between:
- visible primary actions
- and deferred secondary tools

## Governing authority
Apply directly:
- `UI-Doctrine-SPFx-Governing-Standard.md`
- `UI-Doctrine-SPFx-Homepage-Overlay.md`
- benchmark package closure materials
- `docs/architecture/plans/MASTER/spfx/command-band/PriorityActionsRail-and-Admin-Spec.md`

## Inspect at minimum
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailOverflow.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`

## Required implementation outcome
1. Re-evaluate overflow strategy selection by device/mode.
2. Prefer stronger anchored overflow behavior on desktop/laptop and appropriate tablet conditions when the deferred set is clearly secondary.
3. Preserve sheet-style disclosure for small handheld conditions where that remains the best pattern.
4. Strengthen the trigger grammar so the overflow affordance reads as a governed secondary tool layer, not a footer afterthought.

## Done state
“Done” means a user can immediately understand:
- which actions are primary,
- which actions are still available behind a deliberate secondary layer,
- and how to reach that layer cleanly on both larger and smaller surfaces.

## Required proof of closure
Return:
- the final overflow strategy matrix by device/mode
- screenshots or proof for desktop/tablet/phone overflow behavior
- keyboard/focus evidence
- confirmation that overflow remains accessible and reduced-motion safe

## Working rules
- Do not reopen already-correct wrapper ownership unless repo truth proves a real defect.
- Do not migrate the rail into shell-occupant semantics.
- Do not drift into unrelated homepage modules.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Return concrete proof of closure, not just a description of the changes.
