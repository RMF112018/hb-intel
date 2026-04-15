# Prompt 04 — Structural redesign of media acquisition and hero/gallery authoring

## Objective

Replace the current URL-first media authoring posture with a structurally stronger editorial asset-acquisition and asset-curation flow for hero, secondary, and gallery media.

## Why this issue exists / current-state problem

The live repo still exposes bare image URL entry in critical seams, including hero media and gallery composition. That is not acceptable as a primary authoring model for a world-class editorial product. It pushes authors into low-trust data entry, obscures asset quality, and makes media work feel infrastructural instead of editorial.

## Intended future state

Media authoring should feel like choosing, reviewing, and curating assets with confidence. Hero image, secondary image, and gallery/supporting images should each have a clear acquisition path, preview posture, alt-text posture, and editorial role. Raw URLs should not be the normal front-door interaction.

## Governing authority / required references

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-12/Prompt-05-Finish-team-and-gallery-editorial-management-surfaces.md`

Also use the following research-backed implementation guidance where relevant:

- WAI-ARIA Authoring Practices — Combobox Pattern / Editable Combobox with List Autocomplete
- GOV.UK Design System — Error Summary / Validation Pattern
- Tiptap Accessibility Guide
- progressive-disclosure / chunking guidance from mature UX references

## Exact repo files and seams to inspect

- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/HeroPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/SecondaryImagePanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/MediaComposer.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/GalleryPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/*.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- any existing tenant-safe image-picker or file-selection seam already available in the repo or reachable through current dependencies

## Implementation requirements

- Replace raw URL entry as the primary author interaction for hero and gallery media.
- If no production-ready tenant-safe picker seam exists, design and implement the strongest bounded acquisition flow that can be truthfully supported now; do not keep bare URL input as the dominant experience simply because it already exists.
- Rebuild media authoring around preview-first asset cards/composers, role clarity, caption/alt guidance, and featured-state confidence.
- Preserve alt-text requirements and gallery invariants.
- Ensure hero and secondary image flows are clearly differentiated from gallery/supporting flows.
- Treat this as a structural redesign of media IA, not a label cleanup.

## Dependencies / supporting concepts

- `MediaComposer` and `GalleryPanel` already manage invariants that must survive.
- Any asset-selection redesign must remain compatible with existing persistence contracts unless a tightly bounded adapter change is required.
- Alt-text guidance and preview behavior must remain truthful and accessible.

## Validation / proof-of-closure requirements

- Demonstrate add/edit/remove/feature/reorder flows still work.
- Demonstrate hero and gallery authoring no longer feel primarily URL-centric.
- Confirm alt text, caption, preview, and role cues remain intact.
- Confirm no invariant regression and no loss of author trust in broken/unreachable asset states.

## Deliverables / closure docs

Create:

- `docs/architecture/reviews/publisher/wave-01-media-authoring-structural-redesign-closure.md`

Include:

- what media-authoring structures were replaced
- how hero/secondary/gallery flows now differ
- whether a tenant-safe asset-picking seam was used or created
- what invariants and accessibility checks were performed

## Do-not-do instructions

- Do **not** close this prompt with modest UI edits, spacing cleanup, or copy-only refinement.
- Do **not** leave the same weak information architecture in place behind a few new disclosures.
- Do **not** re-read files already in active context unless you need to confirm drift, dependencies, or uncertainty after changes.
- Do **not** make unrelated code changes.
- Do **not** weaken or defer in-scope work into future prompts.
- Conduct an exhaustive scrub of the affected seam before making changes.
