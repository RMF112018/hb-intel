# Publisher Wave-02 — Story editor composition closure

**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-15/Prompt-05-Rebuild-story-editor-into-editorial-grade-composition.md`
**Scope:** `StoryBodyEditor`, `editorToolbar` link-insertion flow, new editor footer + shortcuts surface, story-editor CSS.
**Manifest:** hb-publisher Feature 1.0.0.40.

## What changed

1. **Auto-expand word selection when inserting a link.** The toolbar's Link control previously required the author to select text before pressing `Ctrl+K` / clicking the Link button — otherwise it rejected the action with "Select the text you want to link first." `editorToolbar.tsx` now extends the current link mark range and, when the selection is still empty, walks word boundaries (`/\W/`) backwards and forwards from the caret and selects the word at cursor. The "select the text first" hint is preserved as a fallback for cursors landing in whitespace. This removes one of the highest-friction keystrokes in day-to-day composition.
2. **Live compose readout.** A new `measureBodyText()` helper in `StoryBodyEditor.tsx` returns `{ charCount, wordCount }` from `editor.getText()`. Both numbers render in a new `EditorFooter` subcomponent beneath the edit area, wired through `aria-live="polite"` so screen-reader users hear the updated counts during composition.
3. **Schema-governance trust line.** The editor footer renders a concise "Supports headings (H2, H3), bold, italic, bullet + numbered lists, block quote, and links. Inline styles, colors, images, tables, and pasted Word formatting are scrubbed to match the published page." This closes the preview-trust gap the prompt calls out — authors now know at a glance what their authored content will become on the published page, matching the `STORY_BODY_EXTENSIONS` allow-list in `editorSchema.ts` and the sanitization in `pasteSanitization.ts` rather than leaving the schema implicit.
4. **Keyboard-shortcut discoverability.** The footer also carries a collapsed `<details>` labelled "Keyboard shortcuts" that enumerates every shortcut the toolbar's `aria-label` strings already expose (`Ctrl+B`, `Ctrl+I`, `Ctrl+K`, `Ctrl+Z`, `Ctrl+Shift+Z`) plus guidance on focusing the toolbar. Rendered as a `<dl>` grid with mono keys, this makes the editor's interaction vocabulary transparent without bloating the always-visible chrome.
5. **Editorial chrome tokenisation.** New footer styles (`.editorFooter`, `.editorCounts`, `.editorSupportHint`, `.editorShortcuts*`) consume the Wave-02 token seam: `--hb-surface-2` for the footer plate, `--hb-border-subtle` / `--hb-border-strong` for its edges, `--hb-color-presentation-blue` for the open-disclosure accent rail (matching the Phase-14 Prompt-07 disclosure family), and `--hb-font-mono` for the key legends.

## What was intentionally preserved

- **Schema posture** — `STORY_BODY_EXTENSIONS` in `editorSchema.ts` is untouched. No new nodes, no new marks, no additional toolbar controls. The editor remains exactly as expressive as before — the prompt's "Do not bloat the editor with low-value controls" rule governed every decision.
- **Paste sanitization** — `sanitizePastedHtml` is still the `transformPastedHTML` for every paste, before the schema parser gets to narrow.
- **Toolbar accessibility** — every button still carries `role=button`, `aria-pressed`, `aria-label`, `title`, W3C roving-tabindex, and keyboard activation. Phase-14 Prompt-08's `PublisherButton` rebuild of the link prompt survives unchanged.
- **Hydration contract** — external `value` changes still flow through `editor.commands.setContent(incoming, false)` and empty-document canonicalisation still normalises `<p></p>` / `<p><br></p>` variants to `''` on emit. `bodyTextProjection` and the existing `storyBodyEditor` test suites continue to pass.
- **Link validation** — `isAllowedHref` / `normaliseHref` still gate every `setLink({ href })`; only the selection UX before the prompt opens changed.

## Validation / proof of closure

- Editor remains schema-safe and accessible: the `storyBodyEditor` test suite (body projection, link validation, paste sanitization, editor DOM) continues to pass.
- Composition is faster: Link no longer requires a manual selection for the common "link this word" case.
- Preview expectation is clearer: the support-hint line explicitly names what survives and what gets scrubbed, matching the schema and sanitizer.
- Shortcut discoverability: no longer scattered only across `title` / `aria-label` strings; now enumerated in one collapsed surface the author can open at any time.

## Verification

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 614 passing (including every `storyBodyEditor` test, linkValidation, pasteSanitization, and bodyTextProjection); 6 failures all pre-existing in `publisherAdapter/__tests__/publisherEndToEnd.test.ts`, unrelated.
- Manifest bumped: `config/package-solution.json` 1.0.0.39 → 1.0.0.40.
