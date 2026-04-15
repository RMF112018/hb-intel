# Prompt 03 — Rebuild local draft resilience and recovery

    ## Objective
    Structurally rebuild the Publisher’s local draft resilience model so autosave, dirty-state, recovery, and resume behavior are explicit, truthful, and bounded rather than left to manual save discipline.

    ## Why this issue matters
    The current product already has truthful server-side save orchestration. What it does not yet have is a closure-grade local resilience layer that protects the author during active composition without blurring the line between local draft state and durable SharePoint persistence.

    ## Current repo-truth problem state
    `useDraftLifecycle` truthfully models durable save operations, but the Publisher does not yet appear to consume the repo’s existing local draft / autosave primitives. The repo already contains `useAutoSaveDraft` and draft-key registry patterns elsewhere, so the missing piece is productized integration, not invention from scratch.

    ## Intended future state
    The Publisher should have a clear two-layer truth model:
    - local working draft resilience for interrupted sessions
    - durable server persistence through the existing save orchestrator

    These must complement each other without ever pretending that local cache equals server save.

    ## Governing authority / required reference docs
    - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
    - `docs/reference/workflow-experience/draft-key-registry.md`
    - this wave package’s `Validation-Strategy.md`

    ## Exact repo files and seams to inspect
    - `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
    - `apps/hb-publisher/src/webparts/articlePublisher/controllers/useStatusChannel.ts`
    - `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
    - `apps/hb-publisher/src/data/publisherAdapter/draftSaveOrchestrator.ts`
    - `packages/session-state/src/hooks/useAutoSaveDraft.ts`
    - any supporting draft-key / TTL / purge utilities needed for a bounded implementation

    ## Required implementation outcome
    - Integrate a bounded local draft resilience layer into the Publisher.
    - Define a stable draft key strategy appropriate for the active article/draft identity.
    - Make it clear what is local working state versus durably saved server state.
    - Support resume/recovery for interrupted in-flight authoring where safe.
    - Preserve the existing durable save orchestrator as the sole source of truth for committed SharePoint persistence.
    - Do **not** invent fake “saved” language for locally cached changes.

    ## Validation / proof-of-closure requirements
    - Local recovery works for interrupted sessions without corrupting durable save truth.
    - Dirty/changed working state is detectable.
    - Autosave debounce behavior is bounded, predictable, and documented.
    - Clearing/discarding state behaves intentionally.
    - Partial durable-save failure still reports truthfully and does not get masked by local cache semantics.

    ## Deliverables / closure notes to create
    - `docs/architecture/reviews/publisher/wave-02-local-draft-resilience-closure.md`
    - update or add draft-key documentation if the Publisher introduces a new registry entry


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
