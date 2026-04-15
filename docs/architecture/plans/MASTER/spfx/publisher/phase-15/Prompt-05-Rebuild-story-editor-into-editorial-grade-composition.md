# Prompt 05 — Rebuild story editor into editorial-grade composition

    ## Objective
    Take the existing TipTap foundation and structurally rebuild the story-composition seam into an editorial-grade tool rather than a technically-correct rich text field with a toolbar.

    ## Why this issue matters
    The base editor already exists. The remaining risk is stopping too early and treating “real rich text works” as closure, even though the author still needs better composition flow, stronger formatting ergonomics, and clearer preview interplay.

    ## Current repo-truth problem state
    The repo already has:
    - a TipTap-backed editor
    - accessible toolbar semantics
    - schema-locked content
    - paste sanitization

    What remains is a more premium, author-efficient composition experience with better insertion ergonomics, shortcut clarity, and stronger interplay between authored content and preview confidence.

    ## Intended future state
    The body editor should feel like a real editorial workstation:
    - quick to compose in
    - safe by default
    - expressive within the governed schema
    - clear about what formatting is supported
    - closely aligned with the rendered preview outcome

    ## Governing authority / required reference docs
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
    - this wave package’s `Validation-Strategy.md`

    ## Exact repo files and seams to inspect
    - `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/StoryBodyEditor.tsx`
    - `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/editorToolbar.tsx`
    - `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/editorSchema.ts`
    - `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/pasteSanitization.ts`
    - `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/StoryPanel.tsx`
    - `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/ArticlePreview.tsx`

    ## Required implementation outcome
    - Preserve the existing safe/editorial schema posture.
    - Improve composition ergonomics with stronger insertion, shortcut, link, and selection affordances where they materially help.
    - Keep the toolbar accessible and disciplined.
    - Improve the relationship between editor output and preview trust, so authors better understand what the formatting becomes.
    - Do **not** bloat the editor with low-value controls that weaken content quality or preview predictability.

    ## Validation / proof-of-closure requirements
    - The editor remains schema-safe and accessible.
    - Composition becomes materially faster and clearer for authors.
    - Link handling and shortcut discoverability improve.
    - Preview/render expectations are clearer than before.

    ## Deliverables / closure notes to create
    - `docs/architecture/reviews/publisher/wave-02-story-editor-closure.md`


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
