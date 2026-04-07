# Phase 02 Package — Desktop Composition Skeleton

## Objective

Implement the **desktop-first structural composition** for Tool Launcher / Work Hub so the launcher proves the premium marketplace layout direction using the **Phase 01 live SharePoint adapter seam** rather than the retired grouped local-config pattern.

## Why this phase exists

Phase 01 should have replaced or materially redirected the current grouped launcher intake toward a normalized SharePoint-backed launcher model. With that data seam in place, this phase establishes the **desktop composition skeleton** for the launcher:

1. top command band
2. flagship platforms stage
3. secondary utility rail
4. workflow shelf scaffolds

This phase is about **composition, hierarchy, and region anatomy**. It is not the final deep-polish phase.

## Scope

This package should result in:

1. a documented launcher component anatomy for the desktop skeleton
2. a command band shell suitable for launcher search/actions
3. a flagship stage shell wired to featured launcher records
4. a secondary utility rail shell wired to support/access/notice metadata
5. workflow shelf scaffolds wired to normalized shelf/category groupings
6. a reference-composition proof that the launcher fits the Utility zone cleanly beneath the Signature Hero without becoming a faux shell or second hero

## Explicit exclusions

This phase must **not**:

- re-invent the SharePoint list contract already handled in Phase 01
- finalize every premium card detail for flagship platforms
- fully implement advanced search logic, recents, or favorites persistence
- broaden scope into unrelated homepage webparts
- degrade the launcher back into an equal-weight grouped tile grid
- introduce app-shell chrome, fake navigation, or non-homepage-safe shell behavior

## Package contents

- `phase-02-package-summary.md`
- `prompt-01-launcher-anatomy-and-desktop-skeleton-spec.md`
- `prompt-02-command-band-and-outer-composition-shell.md`
- `prompt-03-flagship-stage-and-utility-rail-skeleton.md`
- `prompt-04-workflow-shelf-scaffolds-and-composition-proof.md`
- `phase-02-validation-checklist.md`
- `phase-02-completion-notes-template.md`

## Prompt execution order

1. Prompt 01
2. Prompt 02
3. Prompt 03
4. Prompt 04

## Required working posture for all prompts

- repo truth first
- do not re-read files still in current context unless needed
- treat the Phase 01 normalized launcher model as the content seam
- treat the architecture brief as the UI hierarchy source
- preserve homepage import discipline and Lane A boundaries
- keep the launcher composition compatible with the Signature Hero and Utility zone posture
- do not broaden scope into final flagship polish or advanced personalization unless required for structure proof
- preserve authoring safety and host-aware behavior throughout
