# Workstream C — Step 02 Closure Report

**Prompt:** Phase-08 / Phase-3 / Prompt-02 — Replace the body textarea with a full editorial authoring surface
**Status:** Closed.
**Date:** 2026-04-14
**Manifest:** `hb-webparts` → 1.0.0.275

---

## 1. Summary of what was changed

Implemented the rich-text editor locked by workstream-c step-01. The Story body in `StoryPanel` is now a real editorial authoring surface backed by TipTap 2.x with a strict schema, an accessible toolbar, and link-href governance. Authors compose with formatting affordances instead of typing raw HTML into a textarea.

Highlights:

- **New `storyBodyEditor/` module** under `apps/hb-webparts/src/webparts/articlePublisher/`:
  - `editorSchema.ts` — TipTap extension set: `StarterKit` configured to enable only paragraph, heading (H2/H3 only), bullet list, ordered list, list item, blockquote, hard break, bold, italic, history (undo/redo); explicit `false` on `horizontalRule`, `codeBlock`, inline `code`, `strike`. `Link` extension with `openOnClick: false`, `autolink: false`, `target="_blank" rel="noopener noreferrer"` HTMLAttributes, and a `validate` callback wired to `isAllowedHref`.
  - `linkValidation.ts` — `isAllowedHref(href)` allowlists `https://`, `mailto:`, and tenant-relative `/...` paths; explicitly rejects `http:`, `javascript:`, `data:`, `vbscript:`, `file:`, fragment-only, bare-host, and protocol-relative `//` (which could smuggle insecure schemes). `normaliseHref` returns the trimmed allowed value or `null`.
  - `bodyTextProjection.ts` — `bodyTextProjection(html)` is a pure, DOM-free strip-tag projection that decodes the small set of entities the editor emits and collapses internal whitespace; `bodyTextSnippet(html, max)` truncates at a word boundary and appends an ellipsis.
  - `StoryBodyEditor.tsx` — React component using `@tiptap/react`'s `useEditor` + `EditorContent`. Props: `value`, `onChange`, `placeholder`, `ariaLabel`, `ariaDescribedBy`. Editable area carries `role="textbox"`, `aria-multiline="true"`, the supplied `aria-label`, and an optional `data-placeholder`. On update, the editor's HTML is normalised (empty-document forms collapse to `''`) and emitted to `onChange`. On hydrate (external value change), `editor.commands.setContent(incoming, false)` parses incoming HTML through the schema, dropping anything outside the allow-set.
  - `editorToolbar.tsx` — accessible toolbar: `role="toolbar"` + `aria-label="Body formatting"`. Buttons for Bold (Ctrl-B), Italic (Ctrl-I), Link (Ctrl-K via the toolbar), H2, H3, Paragraph, Bullet list, Ordered list, Blockquote, Undo (Ctrl-Z), Redo (Ctrl-Shift-Z). Each button is a real `<button type="button">` with `aria-pressed` reflecting the active state. Link prompt is an inline row with an `aria-labelled` text input, Apply / Remove link / Cancel buttons, Enter-to-apply, Escape-to-cancel, and an `aria-live` error message when the typed href fails the allowlist.
  - `storyBodyEditor.module.css` + `.d.ts` — token-disciplined surface styles: bordered surface that picks up the standard input focus ring, soft toolbar background, generous editable padding (220px min, 600px max with overflow scroll), and editorial typography for the inline content (paragraphs, H2/H3, lists, blockquote, link). Empty-state placeholder rendered via `[data-placeholder]:empty::before`.
  - `index.ts` — barrel re-exporting `StoryBodyEditor`, `bodyTextProjection`, `bodyTextSnippet`, `isAllowedHref`, `normaliseHref`, and the `StoryBodyEditorProps` type.
- **`StoryPanel`** in `ArticlePublisher.tsx`: the body field is now `<StoryBodyEditor value={...} onChange={...} placeholder="Compose the article." ariaLabel="Article body" />`. The previous `<textarea className={textareaLg}>` and the "HTML is supported" placeholder are gone. All other Story section fields (Subhead, Intro, Closing, Callout, Pull quote) remain unchanged.
- **Preview snippet now plain-text.** The `body` and `subhead` slots in the Preview canvas section now route through `bodyTextSnippet(t.text, 200)`. Authors see editorial prose in the preview ("Hedrick & Brothers shipped …") instead of raw HTML markup (`<p><strong>Hedrick &amp; Brothers</strong>` …). For subhead (which is plain text), the projection is a no-op.
- **New runtime dependencies (per the step-01 lock):**
  - `@tiptap/core@^2.27.2`
  - `@tiptap/pm@^2.27.2`
  - `@tiptap/starter-kit@^2.27.2`
  - `@tiptap/extension-link@^2.27.2`
  - `@tiptap/react@^2.27.2`
- **New tests** under `storyBodyEditor/__tests__/`:
  - `linkValidation.test.ts` — 9 cases: https / mailto / tenant-relative accepted; http / javascript / data / vbscript / file / `#anchor` / bare-host / `//` / empty / null all rejected; `normaliseHref` trim and reject behaviour.
  - `bodyTextProjection.test.ts` — 13 cases: paragraph stripping, block-element separation, list flattening, inline mark preservation, entity decoding (`&amp;`, `&lt;`, `&#39;`), whitespace collapse, empty/nullish input, nested marks + links, `bodyTextSnippet` short / long / word-boundary / ellipsis behaviour.

Preserved seams (unchanged):
- `BodyRichText: string` on `PublisherArticleRow` — unchanged contract. The editor still emits HTML; the adapter still persists it.
- `pageGeneration/pageCompositor.ts` — `body` slot still renders `context.article.BodyRichText` into `TextControlPayload.text`. Empty-body validation continues to fire.
- All adapter modules under `publisherAdapter/**` — untouched.
- `mount.tsx`, runtime contract, webpart manifest id — unchanged.
- Workstream-A editorial shell + readiness rail; Workstream-B governed labels, project picker, slug generation, intelligent defaults — unchanged.
- Lifecycle: publish / republish / archive / withdraw / preview — unchanged.

---

## 2. Exact files changed

New files:
- `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/StoryBodyEditor.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/editorSchema.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/editorToolbar.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/linkValidation.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/bodyTextProjection.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/storyBodyEditor.module.css`
- `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/storyBodyEditor.module.css.d.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/index.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/__tests__/linkValidation.test.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/__tests__/bodyTextProjection.test.ts`

Modified:
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` (`StoryPanel` body editor swap; Preview snippet projection; new imports)
- `apps/hb-webparts/package.json` (TipTap dependencies added)
- `pnpm-lock.yaml` (lockfile updates from the install)
- `apps/hb-webparts/config/package-solution.json` (`1.0.0.274` → `1.0.0.275`)

Not changed:
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/runtimeContract.ts`, `ArticlePublisherWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css` / `.d.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx`, `authorLabels.ts`/`.test.ts`, `slugGovernance.ts`/`.test.ts`, `metadataDefaults.ts`/`.test.ts`, `ProjectPicker.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/**`

---

## 3. Validation performed

- `pnpm --dir apps/hb-webparts run check-types` → pass.
- `pnpm --dir apps/hb-webparts exec vitest run src/webparts/articlePublisher` → 87/87 pass (12 article-publisher + 22 author-labels + 20 slug-governance + 11 metadata-defaults + 9 link-validation + 13 body-text-projection).
- TipTap install successful: `@tiptap/core@2.27.2`, `@tiptap/pm@2.27.2`, `@tiptap/starter-kit@2.27.2`, `@tiptap/extension-link@2.27.2`, `@tiptap/react@2.27.2`.
- Schema-level governance is enforced at edit time and at hydrate time via the same configured extensions: any HTML pasted, typed, or hydrated outside the allow-set is normalised away by ProseMirror's parser.
- Accessibility: editable area has `role="textbox"` + `aria-multiline="true"` + accessible label; toolbar has `role="toolbar"` + accessible label + `aria-pressed` on each button + tooltip + `aria-label` describing keyboard shortcuts; link prompt has accessible field label, Enter/Escape handlers, and `role="alert"` error feedback. `:focus-visible` outline carried by the surface and toolbar buttons.
- Preview snippet manually checked against the new projection: `<p>Hedrick &amp; Brothers shipped <strong>Riverside Tower</strong>.</p>` projects to `Hedrick & Brothers shipped Riverside Tower.`; `<p>One</p><p>Two</p>` projects to `One Two`. Snippet truncates at a word boundary and appends `…` only when the projection exceeds the cap.
- 28 pre-existing failures in `publisherAdapter/**` test suites remain unchanged and out of scope.

---

## 4. Known limitations carried forward to later prompts

- **Soft / hard body length cap (200 KB warn / 256 KB block).** Step-01 §5 specified these caps. They are not enforced in this step because they belong on the readiness rail / `validationEngine` layer, which is the scope of Prompt-04 ("Validate preview and publish compatibility for rich content output"). Documented and deferred, not silently dropped.
- **Subhead / Summary excerpt remain plain `<textarea>`s.** Step-03 ("Improve subhead, summary and content guidance experience") covers their authoring upgrade.
- **Toolbar lacks an inline link to open the rich-text help / formatting tips.** Step-03 covers content guidance; the editor toolbar will gain that affordance there if the workstream warrants it.

---

## 5. Closure report path

`docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-c-rich-content-authoring/step-02/Closure-Report.md`

---

## 6. Real blockers remaining

None. Workstream C can proceed:
- **Prompt-03** — improve subhead, summary, and content guidance experience.
- **Prompt-04** — validate preview and publish compatibility for rich content output (incl. body length caps).
- **Prompt-05** — close Workstream C with hosted and accessibility vetting.
