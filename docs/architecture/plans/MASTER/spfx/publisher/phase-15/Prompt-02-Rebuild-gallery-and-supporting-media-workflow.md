# Prompt 02 — Rebuild gallery and supporting-media workflow

    ## Objective
    Structurally rebuild the gallery/supporting-image workflow so it becomes a governed visual-media composition surface rather than a polished wrapper around raw URL entry.

    ## Why this issue matters
    The gallery seam now looks materially better than the old flat row editor, but the core acquisition and trust model is still too infrastructural. That leaves one of the most visible editorial workflows only partially rebuilt.

    ## Current repo-truth problem state
    `GalleryPanel` and `MediaComposer` already provide tile-based management, alt-text assessment, featured-image handling, and ordering, but the flyout still makes `https://` entry the real acquisition seam. The visual redesign landed first; the structural workflow replacement is incomplete.

    ## Intended future state
    The gallery workflow should feel like a governed visual composition tool:
    - authors add images from approved tenant-safe sources as the primary path
    - gallery vs supporting role is authored intentionally, not incidentally
    - featured image, ordering, and accessibility guidance stay integrated
    - the interaction is resilient across add, edit, reorder, feature, replace, and remove flows

    ## Governing authority / required reference docs
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
    - this wave package’s `Dependency-Map.md` and `Validation-Strategy.md`

    ## Exact repo files and seams to inspect
    - `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/GalleryPanel.tsx`
    - `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/MediaComposer.tsx`
    - `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/buildMediaRow.ts`
    - `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/mediaInvariants.ts`
    - `apps/hb-publisher/src/webparts/articlePublisher/mediaComposer/altTextGuidance.ts`
    - any shared acquisition helper introduced by Prompt 01 if reuse is justified

    ## Required implementation outcome
    - Replace the current gallery/supporting acquisition model with a governed picker/uploader-driven model appropriate for SPFx.
    - Keep the current tile/grid management only if it still serves the rebuilt acquisition flow; otherwise refactor it.
    - Preserve or improve featured-gallery invariants, ordering truth, and alt-text/caption guidance.
    - Ensure the chosen asset path integrates cleanly with preview and publish-readiness behavior.
    - Remove future-wave placeholder language about a tenant-safe picker if this wave closes it.

    ## Validation / proof-of-closure requirements
    - Authors can add, edit, replace, reorder, feature, and remove gallery/supporting images without using raw URL entry as the normal path.
    - The flow behaves correctly when cancelled mid-composer, when acquisition fails, and when an asset preview is broken.
    - Accessibility guidance, featured logic, and ordering logic still hold after the rebuild.
    - There is no hidden regression in media row persistence shape or sort-order truth.

    ## Deliverables / closure notes to create
    - `docs/architecture/reviews/publisher/wave-02-gallery-workflow-closure.md`


## Explicit instruction not to make unrelated changes
- Do **not** make unrelated code changes.
- Do **not** reopen unrelated Wave 01 shell/layout decisions unless a direct dependency makes it necessary for Wave 02 closure.
- Do **not** perform broad cleanup outside the touched seams.

## Mandatory execution rules
- Conduct an exhaustive scrub of the affected code path before changing anything.
- Verify whether referenced files, symbols, or contracts have drifted before editing.
- Do **not** re-read files already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
- Preserve already-verified closures unless this prompt explicitly requires refinement.
- Prove closure before moving to the next prompt.
