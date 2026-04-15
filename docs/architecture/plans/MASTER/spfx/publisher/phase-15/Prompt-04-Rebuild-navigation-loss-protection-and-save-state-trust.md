# Prompt 04 — Rebuild navigation-loss protection and save-state trust

    ## Objective
    Structurally rebuild the Publisher’s save-state trust loop so authors get clear save-status signaling and meaningful protection against accidental tab close or in-app navigation loss.

    ## Why this issue matters
    Local draft resilience without an explicit trust loop still leaves the author guessing. The product needs to tell the truth about whether work is dirty, pending local autosave, durably saved, or blocked — and it needs to intervene when the author is about to lose unsaved work.

    ## Current repo-truth problem state
    The repo already contains guard primitives (`useUnsavedChangesBlocker`, `HbcFormGuard`) but the Publisher does not yet appear to use them. The Publisher also has a status channel, but not a fully closed save-state signal model spanning dirty/pending/local/durable/failure conditions.

    ## Intended future state
    The Publisher should expose a visible, trustworthy save-state loop and navigation-loss protection model that fits SPFx-hosted authoring:
    - authors can tell the difference between local autosave activity and durable server save
    - the browser tab close / refresh path is protected when appropriate
    - in-app navigation loss is guarded when appropriate
    - recovery messaging is concise and credible

    ## Governing authority / required reference docs
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
    - this wave package’s `Validation-Strategy.md`

    ## Exact repo files and seams to inspect
    - `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
    - `apps/hb-publisher/src/webparts/articlePublisher/controllers/useStatusChannel.ts`
    - `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
    - `packages/ui-kit/src/hooks/useUnsavedChangesBlocker.ts`
    - `packages/ui-kit/src/HbcForm/HbcFormGuard.tsx`
    - any route/shell/navigation seam relevant to the Publisher host surface

    ## Required implementation outcome
    - Integrate appropriate unsaved-change protection into the Publisher.
    - Add save-state language/UI that distinguishes dirty, local-autosave-pending, local-recovered, durable-save-success, and durable-save-failure states.
    - Keep the messaging compact and truth-forward.
    - Do not create status duplication that competes with the readiness rail.
    - Ensure the interaction model works in SPFx hosting conditions.

    ## Validation / proof-of-closure requirements
    - Closing/refreshing a dirty session is guarded appropriately.
    - In-app navigation loss is guarded where technically applicable.
    - Authors can tell whether the product is protecting local work, saving durably, or failing.
    - No misleading “all saved” state appears when only local recovery has occurred.

    ## Deliverables / closure notes to create
    - `docs/architecture/reviews/publisher/wave-02-save-state-trust-loop-closure.md`


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
