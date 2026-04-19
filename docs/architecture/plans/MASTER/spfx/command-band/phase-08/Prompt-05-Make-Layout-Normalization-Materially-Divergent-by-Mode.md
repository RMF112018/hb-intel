# Prompt 05 — Make Layout Normalization Materially Divergent by Mode

## Objective
Strengthen the presentation-resolution system so authored layout modes produce meaningfully different flagship outcomes instead of collapsing into too-few visible states.

## Why this prompt exists
The code has good vocabulary:
- desktop layout modes
- tablet layout modes
- mobile layout modes
- container-aware device resolution

But the visible outcome still normalizes too aggressively.

That means the adaptive system is directionally good but not closure-grade.

## Current issue
Desktop, tablet, and compact states are not yet diverging enough in real flagship behavior.
The result is technically responsive, but not intentionally adaptive enough.

## Governing authority
Apply directly:
- `UI-Doctrine-SPFx-Governing-Standard.md`
- `UI-Doctrine-SPFx-Homepage-Overlay.md`
- benchmark package conformance and closure materials
- `docs/architecture/plans/MASTER/spfx/command-band/PriorityActionsRail-and-Admin-Spec.md`

## Inspect at minimum
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`

Pay special attention to:
- `resolvePriorityRailDeviceForContainer(...)`
- `resolvePriorityRailPresentationForDevice(...)`

## Required implementation outcome
Refine the layout-resolution contract so that:
- desktop/laptop can express a more confident flagship field
- tablet conditions can step into a genuinely different but still premium mode
- phone/compact modes simplify decisively rather than merely shrinking
- the narrowest stable nested mode is explicitly protected

Do not solve this by proliferating meaningless variant labels.
The divergence must produce materially different, better runtime behavior.

## Done state
“Done” means a reviewer can look at the flagship surface across widths and clearly see purposeful mode changes, not just compressed versions of the same surface.

## Required proof of closure
Return:
- the final presentation-resolution matrix
- before/after screenshots or representative state captures by device class
- tests proving the intended mode resolution
- confirmation that container-aware behavior remains the governing input

## Working rules
- Do not reopen already-correct wrapper ownership unless repo truth proves a real defect.
- Do not migrate the rail into shell-occupant semantics.
- Do not drift into unrelated homepage modules.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Return concrete proof of closure, not just a description of the changes.
