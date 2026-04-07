# Phase 04 Package — Utility Rail and Support Actions

## Objective

Implement the **utility rail and support-actions layer** for Tool Launcher / Work Hub so the launcher gains a polished secondary command/support column without diluting the flagship platform stage or collapsing back into a generic utility grid.

This phase should build on:

- **Phase 01** normalized launcher seam
- **Phase 02** desktop launcher skeleton
- **Phase 03** flagship platform stage

## Why this phase exists

By the end of Phase 03, the launcher should already have:

1. a command band
2. a flagship stage with featured ordering
3. a desktop skeleton that defines the utility rail region
4. workflow shelf scaffolds below

What should still be missing is the **secondary support logic** that makes the launcher feel operationally complete:

- help destinations
- request-access actions
- support-owner references
- notices / maintenance / outage treatment
- low-weight contextual utility content that belongs beside the flagship stage

This phase gives the right-side support layer real purpose without allowing it to become a second launcher, a noisy alerts column, or a competing hero.

## Scope

This package should result in:

1. a locked utility-rail contract
2. a utility-rail local surface or composition layer appropriate for secondary launcher content
3. live binding from normalized launcher records and support metadata into the utility rail
4. support-action rendering for help / access-request pathways
5. notice and maintenance treatment that remains visually subordinate to the flagship stage
6. clean suppression and degraded behavior when support metadata is partial or absent
7. composition proof that the utility rail supports the launcher hierarchy rather than competing with it

## Explicit exclusions

This phase must **not**:

- redesign or replace the Phase 03 flagship stage
- perform the Phase 05 workflow shelf refinement
- implement the Phase 06 all-platform overlay / index
- broaden into advanced search, command suggestions, favorites persistence, or personalization systems
- create a second grouped-tile surface inside the utility rail
- move tenant-specific support metadata logic into shared kit prematurely

## Package contents

- `phase-04-package-summary.md`
- `prompt-01-utility-rail-contract-and-support-model.md`
- `prompt-02-help-and-access-request-actions.md`
- `prompt-03-notices-maintenance-and-degraded-rail-states.md`
- `prompt-04-utility-rail-composition-proof-and-docs-hardening.md`
- `phase-04-validation-checklist.md`
- `phase-04-completion-notes-template.md`

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
- preserve the Phase 03 flagship hierarchy and asset behavior
- keep utility-rail logic local to homepage / launcher code unless shared extraction is clearly justified
- keep the utility rail visually subordinate to the flagship stage and compatible with the Signature Hero + Utility zone posture
- do not broaden into overlay, deep search, favorites persistence, or unrelated homepage work
- preserve authoring safety, host-aware behavior, and clean fallback states throughout
