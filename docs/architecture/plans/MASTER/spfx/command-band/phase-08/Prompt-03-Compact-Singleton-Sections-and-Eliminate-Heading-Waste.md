# Prompt 03 — Compact Singleton Sections and Eliminate Heading Waste

## Objective
Make the homepage-flagship render path compact sparse sections intelligently so the command band no longer wastes space on literal group chrome.

## Why this prompt exists
Even with better curation, the flagship render path will still fail if it gives every small group a full section treatment.

The current hosted result shows exactly that failure:
- oversized containers
- repeated headings
- blank interiors
- low command density

## Current issue
The render layer is still too literal about groups.
Groups exist to improve scanability, not to force empty structure onto the surface.

## Governing authority
Apply directly:
- `UI-Doctrine-SPFx-Governing-Standard.md`
- `UI-Doctrine-SPFx-Homepage-Overlay.md`
- benchmark package conformance and persona materials
- `docs/architecture/plans/MASTER/spfx/command-band/PriorityActionsRail-and-Admin-Spec.md`

## Inspect at minimum
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/types.ts`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- any related preview surface or variant seam touched by flagship rendering

## Required implementation outcome
Implement homepage-flagship compaction rules such as, where appropriate:
- singleton-section compaction
- redundant adjacent heading suppression
- lighter section chrome when a section has minimal visible content
- featured-action treatment only when it improves the field
- stronger visual priority for actions over section framing

Do not solve this by flattening everything into an undifferentiated directory row.
The future state still needs structure; it just needs better structure.

## Done state
“Done” means the flagship surface no longer shows the kind of sparse section waste visible in the current screenshot.

## Required proof of closure
Return:
- before/after hosted or representative screenshots
- explicit render rules for singleton and sparse sections
- tests proving headings/sections are suppressed or compacted where intended
- confirmation that default/non-flagship consumers are not unintentionally regressed

## Working rules
- Do not reopen already-correct wrapper ownership unless repo truth proves a real defect.
- Do not migrate the rail into shell-occupant semantics.
- Do not drift into unrelated homepage modules.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Return concrete proof of closure, not just a description of the changes.
