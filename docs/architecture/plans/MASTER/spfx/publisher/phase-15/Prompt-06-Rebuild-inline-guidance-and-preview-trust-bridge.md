# Prompt 06 — Rebuild inline guidance and preview trust bridge

    ## Objective
    Structurally rebuild the guidance model so more corrective understanding lives near the field and near the preview, instead of relying too heavily on the right rail as the only place where authors learn what to do next.

    ## Why this issue matters
    The repo already contains a substantive preview surface and publish-readiness diagnostics. The remaining weakness is distribution of guidance: too much understanding is still separated from the place where the author is acting.

    ## Current repo-truth problem state
    `ArticlePreview` and `PublishReadinessDiagnostics` already exist and meaningfully improve trust, but the wave is not fully closed while authors still need to repeatedly scan the right rail to infer corrective next steps that could be surfaced closer to the active panel or preview context.

    ## Intended future state
    The guidance model should work as a layered system:
    - concise inline cues at the field/panel level for immediate remediation
    - a trustworthy preview bridge that explains what is shown vs what is blocked
    - the right rail as summary/governance, not the only place where understanding lives

    ## Governing authority / required reference docs
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
    - this wave package’s `Validation-Strategy.md`

    ## Exact repo files and seams to inspect
    - `apps/hb-publisher/src/webparts/articlePublisher/previewSurface/ArticlePreview.tsx`
    - `apps/hb-publisher/src/webparts/articlePublisher/readinessSurface/PublishReadinessDiagnostics.tsx`
    - `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
    - authoring panel files where inline remediation cues belong
    - any section/jump-link/focus helper that threads readiness findings back to active sections

    ## Required implementation outcome
    - Improve inline guidance where it helps the author act immediately.
    - Tighten the preview trust bridge so authors understand what the preview is faithfully showing, what is provisional, and what is blocked from publish.
    - Reduce duplicated warning prose across field, preview, and readiness surfaces.
    - Keep the right rail concise and governance-oriented rather than bloated.

    ## Validation / proof-of-closure requirements
    - Authors can resolve more issues without relying exclusively on the right rail.
    - Preview confidence improves.
    - Guidance is more actionable and less repetitive.
    - Field/panel/preview/readiness layers each have a clear role.

    ## Deliverables / closure notes to create
    - `docs/architecture/reviews/publisher/wave-02-preview-guidance-closure.md`


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
