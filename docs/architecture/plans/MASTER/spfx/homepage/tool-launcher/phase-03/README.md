# Phase 03 Package — Flagship Platform Stage

## Objective

Implement the **flagship platform stage** for Tool Launcher / Work Hub so the launcher begins to read like a curated internal app marketplace rather than a grouped utility grid. This phase should build on the **Phase 02 desktop skeleton** and the **Phase 01 normalized launcher seam**.

## Why this phase exists

Phase 02 should have established the launcher structure:

1. command band
2. flagship stage shell
3. utility rail shell
4. workflow shelf scaffolds

This phase now gives the **flagship stage** real weight:

- featured ordering
- premium brand-led launch cards
- live logo/asset binding
- primary CTA treatment
- status / notice treatment where justified
- clean degraded behavior when asset or metadata quality is partial

This phase is where the launcher should begin to feel materially different from the current grouped tile implementation.

## Scope

This package should result in:

1. a locked featured-stage rendering contract
2. a flagship card primitive or local surface family suitable for premium brand-led launcher cards
3. live binding from normalized featured launcher records into the flagship stage
4. asset resolution using the tool-launcher asset manifest and launcher record metadata
5. degraded / missing-asset fallback behavior that preserves hierarchy without collapsing to generic tile clutter
6. composition proof that the flagship stage is clearly primary relative to the utility rail and workflow shelves

## Explicit exclusions

This phase must **not**:

- rework the SharePoint list adapter already handled in Phase 01
- redesign the full launcher shell already handled in Phase 02
- finish the utility rail support behavior planned for Phase 04
- complete workflow shelf refinement planned for Phase 05
- implement the all-platforms overlay planned for Phase 06
- broaden into advanced personalization or persistent favorites
- regress to equal-weight grouped quick links or pseudo-brand icon tiles

## Package contents

- `phase-03-package-summary.md`
- `prompt-01-flagship-card-primitive-and-stage-contract.md`
- `prompt-02-featured-stage-rendering-and-ordering.md`
- `prompt-03-logo-asset-binding-and-degraded-states.md`
- `prompt-04-flagship-composition-proof-and-docs-hardening.md`
- `phase-03-validation-checklist.md`
- `phase-03-completion-notes-template.md`

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
- keep flagship work local to homepage / launcher code unless shared extraction is clearly justified
- use the asset manifest as the preferred logo-governance input rather than inventing ad hoc asset rules
- keep the launcher compatible with the Signature Hero and Utility zone posture
- do not broaden into overlay, deep search, favorites persistence, or unrelated homepage webparts
- preserve authoring safety, host-aware behavior, and clean fallback states throughout
