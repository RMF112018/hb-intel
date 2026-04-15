# Publisher Wave-02 — Save-state trust loop closure

**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-15/Prompt-04-Rebuild-navigation-loss-protection-and-save-state-trust.md`
**Scope:** new `useSaveStateTrust` controller selector, `ArticlePublisher` wiring, reuse of `@hbc/ui-kit` `useUnsavedChangesBlocker`, save-state chip CSS.
**Manifest:** hb-publisher Feature 1.0.0.39.

## What changed

1. **Dirty-state detection.** `ArticlePublisher` now keeps a `baselineRef` snapshot of the last known-clean `{articleDraft, teamDraft, mediaDraft}` triple, captured on draft load (articleId change) and reset after every successful durable save or publish via a new `markBaselineClean` callback. `isDirty` is a memoised string-compare (`JSON.stringify`) of the current triple against the baseline. This is the single source of truth for tab-close protection and the save-state chip.
2. **Browser tab-close / refresh protection.** `useUnsavedChangesBlocker({ isDirty })` from `@hbc/ui-kit` is wired directly in the workspace. The hook attaches a `beforeunload` listener only while `isDirty` is true, so unchanged sessions do not prompt. In-app router blocking is **intentionally not wired** — the Publisher is SPFx-hosted and does not own a router surface, which the hook's contract explicitly acknowledges requires caller-owned router integration. This decision is documented inline in the wiring comment.
3. **Consolidated save-state signal.** New `controllers/useSaveStateTrust.ts` selector hook reduces `{ hasDraft, isDirty, hasLocalCache, isCachePending, busy, lastStatusTone, lastCachedAtIso }` into a single `SaveStatePhase` (`clean` / `dirty` / `caching` / `cached` / `saving` / `saved` / `failed`). A `hasCommittedThisSessionRef` tracks busy → not-busy transitions so a freshly-loaded draft reads as "Up to date" (clean) while a just-committed one reads as "Saved to SharePoint" (saved). The hook also returns an `isBlockingNavigation` flag consumers can use for UI cues (not currently read by the chip; kept for future router integration).
4. **Trust-chip UI.** A new `SaveStateChip` local component renders a single compact pill beside the readiness summary. Headlines speak truthfully:
   - `clean` → "Up to date"
   - `dirty` → "Unsaved changes" / detail "Save to commit to SharePoint."
   - `caching` → "Caching working copy locally…"
   - `cached` → "Unsaved · cached locally 12s ago" / detail "Save to commit to SharePoint."
   - `saving` → "Saving to SharePoint…"
   - `saved` → "Saved to SharePoint"
   - `failed` → "Last save failed" (with an unsaved-changes variant if still dirty) / detail "Retry the save from the Ship panel."
   Tone flows through a neutral / info / success / warn / danger family sharing the existing `--hb-status-*` token palette.
5. **No status duplication.** The Wave-02 Prompt-03 italic `LocalCacheStatus` line and its `.localCacheStatus` CSS class have been removed. All save-state signaling now flows through a single chip. The `StatusBanner` at the bottom of the readiness dock continues to surface durable-save commit events as before; the chip and the banner do not overlap responsibilities.

## Preserved invariants

- `useDraftLifecycle` surface untouched; `busy`, `handleSave`, `handlePublishAction`, and all downstream gates behave as before.
- `useLocalDraftResilience` handle untouched; the trust hook treats it as a pure input.
- Recovery offer ("Restore working copy" / "Discard cached copy") from Prompt-03 untouched.
- `useStatusChannel` contract unchanged — the trust hook reads `statusTone` without mutating the channel.
- All 614 existing tests continue to pass (same 6 pre-existing `publisherEndToEnd.test.ts` adapter failures, unrelated).

## Validation states exercised

- **Clean** — freshly loaded draft; no edits; chip reads "Up to date".
- **Dirty** — type into the headline; chip flips to "Unsaved changes".
- **Caching** — during the 1.5 s debounce window after an edit, chip reads "Caching working copy locally…".
- **Cached** — once the cache has landed but before a durable Save, chip reads "Unsaved · cached locally Ns ago".
- **Saving** — while `busy === true`, chip reads "Saving to SharePoint…".
- **Saved** — after a successful save/publish, chip reads "Saved to SharePoint" (for the rest of the session or until the next edit).
- **Failed** — when the status channel last reported a failure tone, chip reads "Last save failed"; if the draft is still dirty it reads "Last save failed — unsaved changes remain".
- **Tab close while dirty** — browser `beforeunload` prompt fires.
- **Tab close while clean** — no prompt.

## Verification

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 614 passing, 6 pre-existing adapter failures unrelated.
- Manifest bumped: `config/package-solution.json` 1.0.0.38 → 1.0.0.39.
