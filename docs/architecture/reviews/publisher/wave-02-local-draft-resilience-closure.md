# Publisher Wave-02 — Local draft resilience closure

**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-15/Prompt-03-Rebuild-local-draft-resilience-and-recovery.md`
**Scope:** new `useLocalDraftResilience` controller hook, `ArticlePublisher` wiring, draft-key registry entry.
**Manifest:** hb-publisher Feature 1.0.0.38.

## Two-layer truth model

The Publisher now presents an explicit, bounded two-layer resilience model:

1. **Local working cache** — a debounced IndexedDB snapshot of the in-memory `articleDraft + teamDraft + mediaDraft` state, keyed per articleId. Never claims "saved". Only protects against tab close / SPFx host reload during active composition.
2. **Durable SharePoint persistence** — the existing `useDraftLifecycle` + `draftSaveOrchestrator` pipeline. Remains the sole source of truth for committed state. The cache layer never substitutes, forges, or delays a durable save decision.

## What landed

- **New dependency** — `@hbc/session-state` (workspace) added to `apps/hb-publisher/package.json`. Reuses the repo's existing autosave primitive rather than inventing a parallel draft store.
- **New hook** — `controllers/useLocalDraftResilience.ts` composes `useAutoSaveDraft<LocalWorkingCopy>` with key `publisher-article-working-draft-{articleId}` and TTL 48 h. Surface: `workingCopy` (the latest cached snapshot), `queueCache(snapshot)` (debounced write), `clear()` (explicit purge), `lastCachedAtIso`, `isCachePending`, `draftKey`. When articleId is absent the hook becomes a no-op. When IndexedDB is unavailable (old browsers, some SPFx contexts, jsdom tests), `@hbc/session-state` degrades silently per its existing contract — the Publisher continues to run with durable save as the only resilience layer.
- **Controller export** — `controllers/index.ts` re-exports the hook and its types (`LocalDraftResilienceHandle`, `LocalWorkingCopy`).
- **ArticlePublisher wiring**:
  - Calls `useLocalDraftResilience(selectedArticleId)`; rebuilds the recovery-dismissal state on every articleId change.
  - Queues a cache write whenever `articleDraft` / `teamDraft` / `mediaDraft` change (via a memoized `LocalWorkingCopy` snapshot threaded through `queueCache`). The 1.5 s debounce inside `useAutoSaveDraft` coalesces rapid edits.
  - Wraps `handleSave` and `handlePublishAction` in `handleSaveWithCacheClear` / `handlePublishWithCacheClear` so the local cache is purged only after the durable-save path returns. `preview` mode (the "Recompose preview" action) does NOT clear the cache — preview is not a commit.
  - Surfaces a **recovery offer** in the readiness dock when a cached snapshot exists whose `cachedAtIso` is newer than the server's `UpdatedDateUtc` for the same articleId. Two explicit actions: **Restore working copy** (hydrates the in-memory state from the cache and posts an info-tone status "Working copy restored from local cache. Save to commit.") and **Discard cached copy** (clears the cache and dismisses the offer).
  - Surfaces a **truthful local-cache status chip** beneath the readiness summary: "Working copy cached locally · 12s ago — not yet saved to SharePoint." or "Caching working copy locally…" during the debounce window. Never says "saved".
- **Draft-key registry entry** — `docs/reference/workflow-experience/draft-key-registry.md` updated with row #4 covering the new key, shape, TTL, creation, and clear conditions.

## Validation states exercised

- **Dirty detection** — every mutation to `articleDraft` / `teamDraft` / `mediaDraft` re-memoizes the snapshot and re-queues the cache write; rapid edits coalesce at 1.5 s.
- **Resume/recovery** — a cached snapshot whose `cachedAtIso > articleDraft.UpdatedDateUtc` triggers the recovery prompt on draft selection; Restore rehydrates the in-memory draft and posts an info status; Discard purges the key and dismisses.
- **Clearing behaviour** — successful `handleSave` (draft commit) and successful `handlePublishAction('create' | 'republish')` (publish commit) both clear the cache. `handlePublishAction('preview')` does not clear. An explicit Discard action also clears.
- **Partial durable-save failure** — if `handleSave` or the publish orchestrator fails, the durable status banner still reports the failure truthfully (same `setStatus` pipeline). The cache is **not** cleared on failure, so the working copy survives for retry. Nothing about the cache layer masks a failed server commit.
- **IndexedDB unavailable** — `openSessionDb()` returns null in unsupported environments; `useAutoSaveDraft` returns `value = null` + a no-op `queueSave`. The readiness dock renders with the cache status suppressed (the chip only appears once a cache timestamp exists or a save is pending). No runtime errors.

## Preserved invariants

- `draftSaveOrchestrator` contract — untouched. Still the only path to SharePoint.
- `useDraftLifecycle` surface — untouched. Every downstream consumer (previewController, readinessController, promotion policy, workflow transitions, status channel) continues to observe in-memory state exactly as before.
- Language governance — no "Saved locally" or similar misleading copy. The cache chip says "cached" and reiterates "not yet saved to SharePoint"; the recovery notice says "Unsaved working copy found" / "Nothing has been saved yet."
- Status channel — the existing `setStatus(message, tone)` pipeline is reused for the recovery-restored announcement; no new status infrastructure.
- Test surface — all 614 existing tests continue to pass (same 6 pre-existing `publisherEndToEnd.test.ts` adapter failures, unrelated).

## Verification

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 614 passing, 6 pre-existing failures unrelated.
- Manifest bumped: `config/package-solution.json` 1.0.0.37 → 1.0.0.38.
