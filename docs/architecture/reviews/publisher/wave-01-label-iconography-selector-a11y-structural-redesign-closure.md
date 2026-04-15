# Publisher Wave-01 — Label governance, iconography & selector-a11y closure

**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-14/Prompt-08-Structural-redesign-label-governance-iconography-and-selector-accessibility.md`
**Scope:** `ProjectPicker`, `EditorialSpine`, `storyBodyEditor/editorToolbar`, supporting CSS.
**Manifest:** hb-publisher Feature 1.0.0.35.

## What author-facing language leaks were removed

An exhaustive scrub of the audited seams (`authorLabels.ts`, `ProjectPicker.tsx`, `editorToolbar.tsx`, `TeamPanel.tsx`, `GalleryPanel.tsx`, `ArticlePreview.tsx`, and every consumer of the Publisher's enum types) confirms **no raw enum-like, token-like, or storage-like values remain in author-facing text**. Every surface that displays a workflow state, content type, destination, spotlight type, project stage, article subject, hero theme, media role, team viewer mode, grouping mode, or sort mode routes through the governed `authorLabels.ts` helpers. The only places the raw enum strings appear in TSX are inside internal control-flow (`if`/`switch`/`filter` predicates) and inside backticked code literals in the legacy-state details block — both appropriate. No change was needed to `authorLabels.ts` — it already carries compile-time exhaustiveness guarantees via `Record<EnumType, string>` for every surfaced enum.

Previously audited residues that were already cleaned in prior waves and remain clean after this scrub: the `SelectedProjectChip`'s `ID <projectId>` is already demoted behind a collapsed `<details>` "System identifiers" block (Prompt-03); the search-result option rows no longer lead with internal IDs (Prompt-03); the editor toolbar already uses real SVG glyphs in place of pseudo-icons (`• List`, `1. List`, `"`) via `editorIcons.tsx` (Phase-12 Prompt-03).

## What icon strategy was used

No new icon assets were introduced. The governed strategy is preserved and extended:

- **Editor toolbar** continues to render inline SVG glyphs from `storyBodyEditor/editorIcons.tsx` (`BoldGlyph`, `ItalicGlyph`, `LinkGlyph`, `HeadingTwoGlyph`, `HeadingThreeGlyph`, `ParagraphGlyph`, `BulletListGlyph`, `OrderedListGlyph`, `QuoteGlyph`, `UndoGlyph`, `RedoGlyph`). Each icon-only control remains accessibly named via `aria-label` + `title` that combine the control label with its keyboard hint (`"Bold (Ctrl+B)"`).
- **Team / Gallery panels** continue to compose the governed `@hbc/ui-kit` icon set (`ChevronBack`, `ChevronForward`, `ChevronUp`, `ChevronDown`, `Star`, `StarFilled`) through `PublisherButton` with `iconOnly` and an explicit `aria-label`, `title`, and `pressed` state on the star toggle.
- **ImageAssetField** empty-state plate uses a single inline SVG image glyph tinted with `--hb-color-presentation-blue`, decorative (`aria-hidden="true"`), with the textual "Choose an image" title carrying the semantic weight.

## What selector / toolbar semantics were strengthened

### `ProjectPicker` (WAI editable-combobox with list autocomplete)

- Keyboard model extended: `ArrowUp` / `ArrowDown` are joined by **`Home`** (jump to first result) and **`End`** (jump to last result). `Enter` commits the active option; `Escape` dismisses the dropdown. All pre-existing behaviour (debounced 300 ms search, `AbortController` cancellation, outside-click dismissal, input-blur-safe option selection via `onMouseDown preventDefault`) is unchanged.
- The active option now **scrolls into view** on every `activeIndex` change via `scrollIntoView({ block: 'nearest' })`, so keyboard-only users never chase the active row off the visible dropdown. JSDOM-safe: the effect guards on `typeof node.scrollIntoView === 'function'` so the existing metadataPanel + project-picker test suites run without patching.
- A new **result-count live region** (`aria-live="polite"`) announces `"N projects match."` at the top of the listbox whenever results are available, giving screen-reader users the same status confirmation sighted users get from the visible option list.
- `aria-autocomplete="list"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, and `role="combobox"` / `role="listbox"` / `role="option"` semantics are unchanged.

### `EditorialSpine` (article composition progress)

- Promoted from tab-only navigation to a **full keyboard-navigable nav list**: `ArrowDown` / `ArrowRight` move focus to the next spine entry, `ArrowUp` / `ArrowLeft` to the previous, `Home` to the first, `End` to the last. Focus wraps at both ends. Default Tab behaviour is preserved.
- Each spine anchor now carries a composed **`aria-label`** that pairs the section label with the current status (`"Identity — Ready"`, `"Media — Optional"`, `"Story — In progress"`). The status chip is marked `aria-hidden="true"` so screen readers don't hear the label twice.
- `aria-current="location"` on the active entry is preserved.

### Editor link prompt

- The three raw `<button className={styles.toolbarBtn}>` controls inside the link-insert prompt have been replaced with **`PublisherButton` variants**: `primary` for Apply link (with the label clarified from `Apply` → `Apply link`), `danger` for Remove link, and the default secondary variant for Cancel. This gives the link-prompt row the same control language as the readiness dock and draft-rail actions — one button primitive, one tone vocabulary.

## Keyboard & accessibility checks performed

- Project picker: input `Tab` → type → results appear with count announced → `ArrowDown` / `ArrowUp` / `Home` / `End` navigate → `Enter` selects → chip renders with `Change` button reachable via `Tab`.
- Editor toolbar: W3C roving-tabindex preserved (`ArrowLeft`/`Right`/`Home`/`End` inside the toolbar, only the currently-focused control in tab order). All icon-only buttons carry `aria-label`, `title`, and `aria-pressed`.
- Editorial spine: all anchors focusable, `ArrowDown` / `ArrowUp` / `Home` / `End` move focus, `Enter` activates, status reads out correctly.
- Icon-only star/move/remove controls on `TeamPanel` + `GalleryPanel` remain accessibly named and focus-safe — no regression.
- `ExceptionalNotice` disclosure summaries remain focus-visible and keyboard-activatable (`Enter` / `Space`).

## Verification

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 614 passing (metadataPanel combobox suite, editor toolbar, team, gallery, shared chrome all green after the `scrollIntoView` JSDOM guard); 6 failures all pre-existing in `publisherAdapter/__tests__/publisherEndToEnd.test.ts`, unrelated to this change.
- Manifest bumped: `config/package-solution.json` 1.0.0.34 → 1.0.0.35.
