# Prompt 02 — Replace Slice-Then-Group with Homepage-Flagship Curation

## Objective
Replace the current linear primary-selection model with a homepage-flagship curation model that selects visible actions in a way that produces a dense, scanable, balanced command band.

## Why this prompt exists
The current pipeline still effectively does:

1. normalize and filter
2. slice visible actions by max count
3. group afterward
4. render whatever fell into the slice

That is too naïve for a flagship homepage command band.

It directly causes:
- singleton groups
- duplicated or weak headings
- poor balance across action domains
- and a visible set the render layer cannot rescue cleanly

## Current issue
The rail’s visible set is being selected as though it were a flat list.
The homepage flagship path needs a curated visible set, not a simple top-`N` slice.

## Governing authority
Apply directly:
- `UI-Doctrine-SPFx-Governing-Standard.md`
- `UI-Doctrine-SPFx-Homepage-Overlay.md`
- benchmark package scoring / closure materials
- `docs/architecture/plans/MASTER/spfx/command-band/PriorityActionsRail-and-Admin-Spec.md`

## Inspect at minimum
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`

Pay special attention to:
- `resolveByBreakpoint(...)`
- `buildPriorityRailSections(...)`
- the relationship between breakpoint caps and group rendering

## Required implementation outcome
Design and implement a flagship curation stage that can:
- preserve explicit priority/order intent where appropriate
- avoid a visible set dominated by singleton groups
- spread visibility across groups when that improves scanability
- still honor explicit featured action promotion where declared
- remain deterministic and testable

This does **not** mean random balancing.
It means deliberate, deterministic homepage curation.

## Done state
“Done” means the visible primary field is no longer just a linear slice of eligible actions.
It is a curated primary field designed for homepage utility scanning.

## Required proof of closure
Return:
- the final curation rule set
- the exact seam(s) where curation now occurs
- before/after examples of the visible-set output
- tests proving the new curation behavior is deterministic and intentional

## Working rules
- Do not reopen already-correct wrapper ownership unless repo truth proves a real defect.
- Do not migrate the rail into shell-occupant semantics.
- Do not drift into unrelated homepage modules.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Return concrete proof of closure, not just a description of the changes.
