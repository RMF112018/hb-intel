# Prompt 01 — Rebuild single-image acquisition surfaces

    ## Objective
    Structurally rebuild the hero and secondary single-image authoring seams so they no longer operate as URL-first infrastructure fields disguised as editorial controls.

    ## Why this issue matters
    Wave 01 rebuilt the shell to make the Publisher feel like a real product. Leaving hero and secondary media as URL-driven acquisition seams preserves one of the biggest remaining “tool friction” patterns in the app.

    The author should be choosing and validating a governed asset, not managing a raw transport string as the front-door interaction.

    ## Current repo-truth problem state
    The repo already contains a preview-first `ImageAssetField` and dedicated hero/secondary panels, but the acquisition model is still fundamentally raw `https://` entry with a future-picker note. That means the surface has better presentation than before, but not a fully rebuilt authoring interaction.

    ## Intended future state
    The single-image seams should become governed, asset-first editorial surfaces:
    - authors browse/select from approved tenant-safe sources as the primary path
    - the chosen asset renders immediately in the field’s preview-first presentation
    - alt text remains first-class and truthful
    - replace/remove flows remain fast and obvious
    - raw URL editing, if retained at all, is subordinate and explicitly secondary

    ## Governing authority / required reference docs
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` where relevant to shared homepage-safe primitives
    - `docs/architecture/plans/MASTER/spfx/publisher/architecture/publisher-rebranding-report.md`
    - this wave package’s `Dependency-Map.md` and `Validation-Strategy.md`

    ## Exact repo files and seams to inspect
    - `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/HeroPanel.tsx`
    - `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/SecondaryImagePanel.tsx`
    - `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/ImageAssetField.tsx`
    - any existing SharePoint / SPFx-safe file-picker or asset helper already present in the repo
    - any uploader / asset normalization seam needed to keep the saved contract stable

    ## Required implementation outcome
    - Replace the current URL-first acquisition pattern with a governed asset acquisition flow suitable for SPFx hosting.
    - Preserve the existing persisted article contract unless a tightly bounded schema change is clearly necessary and justified.
    - Keep the current preview-first populated state only if it still fits the rebuilt acquisition model; otherwise refactor it.
    - Keep alt text tied to the chosen asset and clearly required for publish readiness.
    - Remove any guidance language that narrates the future picker as a later-wave concept if the picker now lands in this wave.
    - If a fallback raw URL edit path remains, demote it behind explicit advanced disclosure and make it clearly non-primary.

    ## Validation / proof-of-closure requirements
    - Hero and secondary-image authoring no longer depend on raw URL entry as the normal path.
    - The surface works in empty, selected, replaced, removed, invalid-asset, and broken-preview states.
    - Keyboard and focus behavior remain strong.
    - The rebuilt surface is host-safe in SPFx and does not create brittle shell assumptions.
    - The saved data remains truthful and preview/readiness behavior still works.

    ## Deliverables / closure notes to create
    - `docs/architecture/reviews/publisher/wave-02-single-image-acquisition-closure.md`
    - include before/after interaction summary, touched files, validation states exercised, and any intentionally preserved fallback behavior


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
