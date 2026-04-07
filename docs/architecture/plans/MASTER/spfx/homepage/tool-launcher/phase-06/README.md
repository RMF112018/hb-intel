# Phase 06 Package — All Platforms Overlay / Index Layer

## Objective

Implement the **All Platforms overlay / index layer** for Tool Launcher / Work Hub so the launcher can expose the broader platform inventory without crowding the homepage surface or flattening the hierarchy established in earlier phases.

This phase should build on:

- **Phase 01** normalized launcher seam
- **Phase 02** desktop launcher skeleton
- **Phase 03** flagship platform stage
- **Phase 04** utility rail and support actions
- **Phase 05** workflow shelves

## Why this phase exists

By the end of Phase 05, the launcher should already have:

1. a live SharePoint-backed normalized launcher model
2. a desktop composition shell
3. a featured flagship stage
4. a utility rail with support actions and notices
5. curated workflow shelves for secondary platforms

What should still be missing is the **broad inventory layer** that lets users reach the full set of platforms without turning the homepage launcher into one oversized tile board.

This phase introduces the dedicated `All Platforms` experience described in the architecture brief:

- overlay, drawer, or panel presentation
- searchable full inventory
- premium indexed rows or compact cards
- clear direct-launch behavior
- support for broader platform discovery without disturbing homepage curation

The result should feel like a premium internal platform directory that expands from the launcher, not a fallback page of generic links.

## Scope

This package should result in:

1. a locked overlay / index contract driven by normalized launcher records
2. a local overlay shell or panel suitable for the homepage Utility-zone launcher
3. indexed inventory rows or compact result cards that are visually subordinate to the flagship stage
4. search/filter behavior for the full platform inventory using normalized launcher metadata
5. keyboard, focus, dismissal, and accessibility behavior appropriate for an anchored overlay
6. composition proof that the overlay stays additive to the launcher rather than replacing it
7. documentation updates and validation proof for the full-inventory layer

## Explicit exclusions

This phase must **not**:

- redesign or weaken the Phase 03 flagship stage
- redesign or overextend the Phase 04 utility rail
- redesign the Phase 05 workflow shelves
- broaden into advanced personalization, favorites persistence, or recents systems
- replace homepage launcher composition with a full-page directory paradigm
- push tenant-specific overlay behavior into shared kit prematurely
- regress into generic grouped-tile thinking under an “all platforms” label

## Package contents

- `phase-06-package-summary.md`
- `prompt-01-overlay-contract-and-launcher-index-model.md`
- `prompt-02-overlay-shell-and-index-row-surface.md`
- `prompt-03-full-inventory-search-focus-and-dismissal-behavior.md`
- `prompt-04-overlay-composition-proof-and-docs-hardening.md`
- `phase-06-validation-checklist.md`
- `phase-06-completion-notes-template.md`

## Prompt execution order

1. Prompt 01
2. Prompt 02
3. Prompt 03
4. Prompt 04

## Required working posture for all prompts

- repo truth first
- do not re-read files still in current context unless needed
- preserve the Phase 01 normalized launcher seam
- preserve the Phase 02 launcher anatomy and desktop shell
- preserve the Phase 03 flagship hierarchy, Phase 04 utility rail, and Phase 05 workflow shelves
- keep overlay/index logic local to homepage / launcher code unless shared extraction is clearly justified
- keep the overlay additive to the launcher instead of turning it into a separate shell or page
- do not broaden into favorites persistence, recents systems, or unrelated homepage work
- preserve authoring safety, host-aware behavior, and clean fallback states throughout
