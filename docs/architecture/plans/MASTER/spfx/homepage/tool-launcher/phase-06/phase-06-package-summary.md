# Phase 06 — Package Summary

## Phase Title

All Platforms Overlay / Index Layer

## Objective

Implement the **full-platform inventory overlay / index layer** for Tool Launcher / Work Hub so the launcher can expose the broader platform set through a searchable, premium secondary surface without flattening the curated homepage hierarchy.

## What has already been solved

- the overall launcher architecture and hierarchy direction have already been defined
- the SharePoint list already exists and should already be wired through the Phase 01 adapter seam
- the desktop composition skeleton should already exist from Phase 02
- the flagship featured stage should already exist from Phase 03
- the utility rail and support actions should already exist from Phase 04
- the workflow shelves should already exist from Phase 05
- the homepage lane, Utility zone placement, and Signature Hero relationship are already established in repo truth

## What this phase must solve

- lock the all-platforms overlay / index contract
- create or refine a local overlay shell suitable for the homepage launcher
- define the index-row or compact-result presentation for broad platform inventory
- implement searchable inventory behavior using normalized launcher metadata
- implement keyboard, focus, open/close, and dismissal behavior that is host-safe and author-safe
- preserve launcher hierarchy by keeping the overlay additive rather than primary

## Key repo constraints

- keep work within `apps/hb-webparts` unless shared extraction is clearly warranted
- preserve `@hbc/ui-kit/homepage` import discipline
- do not regress the cumulative `hb-webparts` package or mount/dispatch seam
- do not move business-specific inventory rules into shared kit prematurely
- do not let the overlay displace the flagship stage, utility rail, or workflow shelves
- do not let the full inventory surface devolve into a generic link directory or giant tile grid

## Required outputs

1. overlay / index rendering contract
2. local overlay shell and open/close state model
3. index-row or compact-result primitive
4. full inventory search and filter behavior from normalized launcher data
5. keyboard / focus / dismissal behavior
6. composition proof and documentation updates

## Dependencies

Phase 01 should have established the normalized launcher seam, Phase 02 the desktop launcher skeleton, Phase 03 the flagship stage, Phase 04 the utility rail and support actions, and Phase 05 the workflow shelves.

## Primary risks

- making the overlay visually primary enough to undermine the curated launcher hierarchy
- binding inventory search directly to raw SharePoint fields instead of the normalized launcher model
- creating a modal/panel that behaves poorly in SharePoint host contexts
- overbuilding search and pseudo-personalization before later phases
- allowing the overlay to become a generic fallback directory with weak information hierarchy
