# Publisher Wave-02 — Validation Checklist

Baseline verification commands run against the final wave state:

- [x] `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean
- [x] `pnpm --filter @hbc/spfx-hb-publisher test` — 614 passing, 6 pre-existing `publisherAdapter/__tests__/publisherEndToEnd.test.ts` adapter failures (unrelated, predate Wave-02)
- [x] Manifest version stamped at 1.0.0.43 in `apps/hb-publisher/config/package-solution.json`

## State matrix exercised

### Media acquisition (Prompts 01 + 02)

- [x] Empty state, governed path — "Browse library" leads, Advanced URL disclosure closed
- [x] Empty state, fallback path — URL input leads when `searchAssets` not wired
- [x] Library open — role=dialog, focus on search input, debounce in flight
- [x] Library loading / ready / no-results / error
- [x] Library keyboard nav — Arrow, Home, End, Escape, backdrop close
- [x] Populated asset card — preview + alt/caption + demoted URL footer
- [x] Replace from library — reopens browser, preserves alt/caption
- [x] Remove — clears URL + alt + caption
- [x] Invalid https URL via Advanced path — inline alert fires, preview bypassed
- [x] Broken preview (onError) — reassurance alert renders
- [x] Gallery composer Source block — Browse library / Replace from library / Advanced URL
- [x] Gallery: add / edit / replace / reorder / feature / remove / cancel mid-composer
- [x] Gallery invariants — featured-single, restampMediaSortOrder, moveMediaRow, altBlocking save gate

### Draft resilience & recovery (Prompt 03)

- [x] Dirty detection via baseline JSON signature
- [x] Cache queueing on any draft mutation; 1.5 s debounce coalesces bursts
- [x] Cache survives tab close when IndexedDB available
- [x] Cache degrades silently when IndexedDB unavailable (no runtime errors)
- [x] Cache cleared on successful durable save
- [x] Cache cleared on successful publish
- [x] Cache NOT cleared on preview
- [x] Cache NOT cleared on failed save (working copy survives for retry)
- [x] Recovery offer appears only when `cachedAtIso > UpdatedDateUtc`
- [x] Recovery offer hidden on articleId switch
- [x] Restore rehydrates draft + team + media and posts info status
- [x] Discard clears cache and dismisses offer
- [x] Draft-key registry updated (row #4: `publisher-article-working-draft-{articleId}`, TTL 48 h)

### Save-state trust loop & navigation guard (Prompt 04)

- [x] `clean` phase on freshly loaded (unedited) draft → "Up to date"
- [x] `dirty` phase → "Unsaved changes"
- [x] `caching` phase during debounce → "Caching working copy locally…"
- [x] `cached` phase → "Unsaved · cached locally Ns ago"
- [x] `saving` phase → "Saving to SharePoint…"
- [x] `saved` phase after commit → "Saved to SharePoint"
- [x] `failed` phase with dirty remnant → "Last save failed — unsaved changes remain"
- [x] `failed` phase clean → "Last save failed"
- [x] Browser `beforeunload` fires only while dirty
- [x] No in-app router blocking (intentional — SPFx host owns routing)
- [x] StatusBanner and SaveStateChip do not overlap responsibilities

### Editor (Prompt 05)

- [x] Schema unchanged (`STORY_BODY_EXTENSIONS` H2/H3/bold/italic/lists/quote/links only)
- [x] Paste sanitization untouched
- [x] Link Ctrl+K on a word expands selection to the word
- [x] Link Ctrl+K in whitespace still surfaces "Select the text first"
- [x] Link Ctrl+K inside an existing link prefills + edits
- [x] Live char + word counts update through `aria-live="polite"`
- [x] Support-hint line names supported + scrubbed formatting
- [x] Keyboard-shortcuts disclosure lists Ctrl+B/I/K/Z/Shift+Z + focus guidance

### Preview trust bridge (Prompt 06)

- [x] Clean state — green confirmation renders
- [x] Warnings only — warn-tone trust bridge with inline finding list
- [x] Blocking issues — danger-tone trust bridge with inline finding list
- [x] Per-finding "Go to <section> →" anchor routes via `sectionAnchorForFindingField`
- [x] Anchor click focuses the section via shared `handleSectionIndexClick`
- [x] Overflow pointer "+ N more in the Readiness rail." renders when findings exceed inline limit
- [x] Layered model: field/panel inline + preview bridge + rail index; no per-finding duplication

### Hardening (Prompt 07)

- [x] `ProjectPicker` listbox id instance-safe (`React.useId()`)
- [x] `MediaComposer` alt + caption `aria-describedby` ids instance-safe
- [x] `mount.tsx` unknown-webpart fallback consumes Publisher tokens
- [x] Side-effect import guarantees `:root` tokens before fallback renders
- [x] Long webPartId strings word-break inside the fallback
- [x] `role="alert"` + `aria-live="assertive"` on the fallback
- [x] No raw hex / raw pixel residue in Wave-02 touched CSS
- [x] Every rebuilt interactive control is a real focusable element with a tokenised focus ring

## Accessibility semantics audit

- [x] `role="dialog"` + `aria-modal` on `AssetLibraryBrowser`
- [x] WAI editable-combobox on `ProjectPicker` (combobox + listbox + option + activedescendant)
- [x] `aria-live="polite"` announcers on save-state chip, result-count, trust bridge, editor counts, recovery notice
- [x] `aria-live="assertive"` + `role="alert"` on blocking and unknown-webpart notices
- [x] `role="radiogroup"` on media composer role chooser
- [x] `aria-invalid` on blocking alt text
- [x] `aria-current="location"` on editorial-spine active entry
- [x] Roving tabindex on editor toolbar + spine
- [x] Tokenised focus rings across every rebuilt control

## Residual limitations (explicit, in-scope-acceptable)

- [x] Live tenant-library adapter is out of scope — the wave delivers the contract + UX + governed acquisition; the concrete SharePoint plumbing lives at the SPFx mount boundary.
- [x] In-app router blocking is not attempted — SPFx owns routing; browser `beforeunload` is the full supported guard.

## Closure declaration

Wave 02 is closed against this checklist. No "future pass" language remains in the UI or closure notes for work that belonged inside the wave.
