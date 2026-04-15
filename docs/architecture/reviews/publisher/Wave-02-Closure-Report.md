# Publisher Wave-02 — Closure Report

**Wave:** Phase-15 Wave-02 — cross-layer workflow burdens
**Prompts:** 01 – 08
**Final manifest:** hb-publisher Feature 1.0.0.43
**Verification baseline:** `pnpm --filter @hbc/spfx-hb-publisher check-types` clean; `pnpm --filter @hbc/spfx-hb-publisher test` 614 passing / 6 pre-existing `publisherEndToEnd.test.ts` adapter failures unrelated to this wave.

## Wave verdict

**Wave 02 is closed.** Every prompt landed structural rebuild work (not decorative polish), every per-prompt closure note was produced, the regression baseline is unchanged from Wave-01 entry, and every touched seam has a coherent interaction with its neighbours.

## Touched seams × what changed × what was verified

| Seam | Prompts | What changed | Verified |
|---|---|---|---|
| `ImageAssetField` (hero + secondary) | 01, 07 | URL-first acquisition replaced with a governed "Browse library" primary action that opens `AssetLibraryBrowser`; URL entry demoted behind an Advanced accent-rail disclosure; alt text seeds from library suggestions; Replace re-opens the library; fallback URL-first path retained for unwired hosts. Instance-safe ids confirmed. | `check-types`, `test` (heroPanel, metadataPanel, image-asset integration). Manual states: empty (governed) / empty (fallback) / selected / replaced / removed / invalid-URL / broken-preview. |
| `AssetLibraryBrowser` *(new)* | 01 | Modal with `role="dialog"` + `aria-modal`, debounced search + `AbortController`, `role="listbox"` grid, arrow/home/end keyboard nav, live-region status, lazy thumbs, escape + backdrop dismissal, lazy-loaded images. | `check-types`, `test`. Manual: loading / empty / no-results / error / populated / keyboard / backdrop close. |
| `MediaComposer` + `GalleryPanel` | 02, 07 | Composer Source block leads with "Browse library" / "Replace from library" when `searchAssets` is wired; Advanced URL disclosure for custom sources; preserved featured-single invariant, sort-order restamping, moveMediaRow reorder, alt-text assessment, caption guidance, role chooser. Alt/caption `aria-describedby` ids migrated to `useId()`. | `test` (buildMediaRow, mediaInvariants, mediaPersistence, altTextGuidance, publishReadinessDiagnostics), `check-types`. Manual: add / edit / replace / reorder / feature / remove / cancel mid-composer. |
| `useLocalDraftResilience` *(new)* | 03 | Two-layer truth model: `@hbc/session-state` autosave keyed `publisher-article-working-draft-{articleId}` (TTL 48 h); exposes `workingCopy`, `queueCache`, `clear`, `lastCachedAtIso`, `isCachePending`, `draftKey`; silent degradation when IndexedDB unavailable. Registered in `docs/reference/workflow-experience/draft-key-registry.md` row #4. | `check-types`, `test`. Manual: dirty / caching / cached / restore / discard / successful-save clears / failed-save preserves. |
| Recovery offer (ArticlePublisher) | 03 | "Unsaved working copy found" notice + "Restore working copy" / "Discard cached copy" actions when cached `cachedAtIso > server UpdatedDateUtc`. | Manual: offer appears only when applicable, dismisses on articleId switch, Restore posts info status + rehydrates, Discard clears key. |
| Save-state trust loop | 04, 07 | New `useSaveStateTrust` selector hook reduces `{ hasDraft, isDirty, hasLocalCache, isCachePending, busy, lastStatusTone, lastCachedAtIso }` into a single `SaveStatePhase` (`clean` / `dirty` / `caching` / `cached` / `saving` / `saved` / `failed`). Rendered through a single `SaveStateChip` with neutral / info / success / warn / danger tones. Removed the prior separate `LocalCacheStatus` line. | `check-types`, `test`. Manual: all seven phase transitions. |
| Tab-close protection | 04 | `useUnsavedChangesBlocker({ isDirty })` from `@hbc/ui-kit` wired — browser `beforeunload` fires only while dirty. In-app router blocking intentionally not attempted (SPFx-hosted, no owned router). | Manual: close dirty tab → prompt; close clean tab → no prompt. |
| Dirty-state baseline | 04 | `baselineRef` JSON-signature of `{articleDraft, teamDraft, mediaDraft}`; captured on articleId change; reset after successful durable save/publish via `markBaselineClean`. | `check-types`, `test`. Manual: type → dirty, Save → clean, switch drafts → clean. |
| `StoryBodyEditor` | 05 | Auto-expand selection to word at caret on Link invocation; new `EditorFooter` with live char + word counts (aria-live), schema-support line ("Supports…; scrubs…"), collapsed "Keyboard shortcuts" disclosure. No schema / toolbar / paste-sanitizer changes. | `test` (bodyTextProjection, linkValidation, pasteSanitization, storyBodyEditor DOM), `check-types`. Manual: Ctrl+K on word / in whitespace / on selection / inside existing link. |
| `ArticlePreview` trust bridge | 06 | Structured `TrustBridge` aside at top of preview: faithfulness headline + up-to-3 inline findings with "Go to <section> →" anchors via `sectionAnchorForFindingField` + overflow line pointing to rail + clean-state success variant. | `test` (publishReadinessDiagnostics), `check-types`. Manual: no issues / warnings only / blocking / overflow. |
| `mount.tsx` fallback | 07 | Raw-hex inline-styled unknown-webpart fallback replaced with `mount.module.css` token-disciplined surface; side-effect token import guarantees `:root` tokens load before fallback renders; `aria-live="assertive"` role=alert. | `check-types`. Manual: unknown webPartId renders token-disciplined panel. |
| `ProjectPicker` ids | 07 | Module-constant listbox id promoted to `React.useId()` for instance safety. | `check-types`, `test` (metadataPanel project-binding suite). |

## Cross-seam interactions (the real closure question)

- **Media + recovery + trust loop.** Selecting an asset from the library mutates `articleDraft`, which triggers the dirty baseline, which triggers local-cache queueing, which flows through the save-state chip to `caching` → `cached`. A subsequent Save clears the cache and flips to `saved`. Verified clean.
- **Editor + preview + trust bridge.** Typing in the story editor flows through the same dirty/cache/chip pipeline. The preview controller rebuilds on save; the trust bridge reads the latest validation findings and anchors author attention back to the right section via the shared `sectionAnchorForFindingField` + `handleSectionIndexClick` seam that also backs the readiness-rail backlinks — the preview and the rail speak the same jump-link vocabulary.
- **Save guard + publish.** `handlePublishWithCacheClear` clears the cache and resets the dirty baseline only when `kind !== 'preview'`, so "Recompose preview" does not falsely mark the draft saved. Tab-close protection stays off during an in-flight `saving` phase because the blocker reads the same `isDirty` state that flips back to false only after the commit completes.
- **Recovery offer vs. save-state chip.** The recovery offer renders only when `cached.cachedAtIso > articleDraft.UpdatedDateUtc` and is dismissed on draft switch; the chip continues to render the live phase independently. No double-prompting.
- **Hardening sweep.** All new ids are instance-safe; the mount fallback consumes the same token seam every other surface uses; no raw hex in touched Wave-02 CSS; every interactive control is a real focusable element with token-driven focus rings.

## Residual limitations explicitly in scope

- **Live tenant-library wiring.** `searchAssets` is a prop contract, not a concrete SharePoint adapter. The adapter implementation lives at the SPFx mount boundary and is out of scope for this wave — the wave delivers the governed acquisition model, the UX, and the typed contract; the concrete wiring is a separable task that does not affect the closure of the rebuild. No "future wave" narration in the UI claims otherwise; when `searchAssets` is absent the UI falls back to URL entry without prose pointing to a later wave.
- **In-app router blocking.** Not attempted, documented inline in the wiring comment and in the Prompt-04 closure note. The SPFx host owns routing; the Publisher provides browser `beforeunload` protection, which is the full extent of what the current host surface supports.

No other residuals.

## Declaration

Wave 02 is closed. Every prompt (01 – 08) has a closure note and a manifest version; the final regression matches the Wave-01 baseline; the cross-seam interactions behave coherently; no "future pass" language covers work that belonged inside Wave 02.
