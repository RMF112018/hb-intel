# Phase 05 Package — Workflow Shelves

## Objective

Implement the **workflow shelves layer** for Tool Launcher / Work Hub so the launcher gains a curated secondary platform system organized by real work patterns rather than generic grouped links.

This phase should build on:

- **Phase 01** normalized launcher seam
- **Phase 02** desktop launcher skeleton
- **Phase 03** flagship platform stage
- **Phase 04** utility rail and support actions

## Why this phase exists

By the end of Phase 04, the launcher should already have:

1. a live SharePoint-backed normalized launcher model
2. a desktop composition shell
3. a featured flagship stage
4. a utility rail with support actions and notices

What should still be missing is the **secondary inventory system** that lets the homepage surface more platforms without flattening everything into one equal-weight grid.

This phase turns the lower launcher area into curated workflow shelves such as:

- People & Payroll
- Field & Operations
- Training & Compliance
- Finance & Admin

The result should feel like a premium internal app marketplace with a clear hierarchy:

- flagship cards first
- support rail second
- secondary workflow shelves below

## Scope

This package should result in:

1. a locked workflow-shelf contract driven by normalized launcher records
2. shelf grouping from workflow/category metadata rather than hardcoded generic buckets
3. medium-weight workflow cards that are visually distinct from flagship cards
4. ordering, suppression, and partial-data behavior for shelves and shelf items
5. desktop composition proof that shelves sit naturally below the flagship stage and utility rail
6. documentation updates and validation proof for the shelf system

## Explicit exclusions

This phase must **not**:

- redesign or weaken the Phase 03 flagship stage
- redesign or overextend the Phase 04 utility rail
- implement the Phase 06 all-platform overlay / index
- broaden into advanced search, command suggestions, favorites persistence, or personalization systems
- collapse shelves into a generic grouped-tile launcher
- move tenant-specific launcher business rules into shared kit prematurely

## Package contents

- `phase-05-package-summary.md`
- `prompt-01-workflow-shelf-contract-and-grouping-model.md`
- `prompt-02-shelf-surface-and-secondary-card-primitives.md`
- `prompt-03-live-shelf-binding-ordering-and-suppression.md`
- `prompt-04-workflow-shelf-composition-proof-and-docs-hardening.md`
- `phase-05-validation-checklist.md`
- `phase-05-completion-notes-template.md`

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
- preserve the Phase 03 flagship hierarchy and Phase 04 utility-rail hierarchy
- keep workflow-shelf logic local to homepage / launcher code unless shared extraction is clearly justified
- keep shelves visually subordinate to the flagship stage and compositionally compatible with the Signature Hero + Utility zone posture
- do not broaden into overlay, deep search, favorites persistence, or unrelated homepage work
- preserve authoring safety, host-aware behavior, and clean fallback states throughout
