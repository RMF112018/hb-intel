# Workstream C — Step 01 Closure Report

**Prompt:** Phase-08 / Phase-3 / Prompt-01 — Select and govern the rich-text editor architecture
**Status:** Closed. Architecture decision locked; no code changes (Prompt-02 implements the editor against this lock).
**Date:** 2026-04-14

---

## 1. Scope and objective

Choose and lock the rich-text editor architecture for the Article Publisher's body composition, including:

- the editor library and integration shape,
- the output schema (allowed nodes, marks, attributes),
- SharePoint compatibility constraints,
- accessibility expectations,
- preview / publish round-trip rules,
- bundle-size and SPFx-host safety posture,
- governance (sanitisation, validation, future extension).

Prompt-02 implements the editor against this lock; Prompt-03 extends supporting authoring fields; Prompt-04 validates the preview/publish round-trip; Prompt-05 closes the workstream.

---

## 2. Repo-truth audit relevant to this step

**Story body data path (preserved):**
- Authoring surface holds `BodyRichText: string` on `PublisherArticleRow` (`publisherContracts.ts`).
- `pageGeneration/pageCompositor.ts` line 222 maps `context.article.BodyRichText` directly into the `body` slot's `TextControlPayload.text`.
- `pageCompositor.ts` line 405–407 fails composition validation when the `body` slot is visible and `text` is empty.
- Multiple adapter tests already write HTML strings into `BodyRichText` (e.g., `'<p>body</p>'`, `'<p>Full body rich text.</p>'`), confirming the field already accepts HTML on the persistence and composition path.
- The SharePoint destination page renders the `body` slot through a SharePoint Text webpart binding inside `pageBindingWriter` / `createSharePointPageCreationService`.

**Authoring surface today:**
- `StoryPanel` renders `BodyRichText` in a `<textarea className="textareaLg">` accepting HTML — no formatting affordances, no governed sanitisation, no editorial UX.
- `PreviewPanel` already truncates body to a 200-char snippet for the preview surface.

---

## 3. Decision: editor library

**Selected:** **TipTap 2.x** (headless, ProseMirror-based, MIT-licensed).

**Reasons:**
- **Schema-first** — TipTap's underlying ProseMirror schema lets us declare the **exact set of allowed nodes, marks, and attributes** at editor construction. Anything outside the schema is dropped or normalised at write time, which is the strongest available guarantee for governing an HTML-emitting editor.
- **Headless** — no opinionated visual chrome. The toolbar, focus styles, and surface composition are written in our own code against `@hbc/ui-kit` tokens, in line with the SPFx Governing Standard's premium-authored-composition direction.
- **Accessibility maturity** — TipTap inherits ProseMirror's mature focus and selection semantics; combined with our own toolbar buttons, it satisfies WCAG 2.1 AA requirements (keyboard shortcuts, `aria-pressed`, focus restoration, screen-reader-readable content area).
- **Bundle posture** — TipTap StarterKit + a small extension allowlist is ~80 KB gzipped; acceptable for the SPFx hosted page, well below other rich-text bundles like CKEditor or TinyMCE.
- **Maintained** — actively maintained by Überdosis with regular releases; ProseMirror itself is the most stable rich-text editor primitive in the JavaScript ecosystem.

**Rejected alternatives:**
- **Lexical (Meta).** Solid choice; rejected because Lexical's `@lexical/html` round-trip is less governable than ProseMirror's schema-first model. We want declarative allowed-set governance, not an export-time sanitisation pass.
- **Slate.** Flexible but accessibility consistency varies across versions; toolbar wiring is more bespoke; smaller plugin ecosystem.
- **Draft.js.** Not actively maintained.
- **CKEditor / TinyMCE.** Heavier bundles; commercial licensing concerns; harder to fit `@hbc/ui-kit` token discipline.
- **SharePoint OOTB Text webpart embed.** Cannot be embedded inside a custom SPFx surface. Out of architectural reach.
- **Custom `contentEditable`.** Rejected — the cost of getting selection, IME, paste, undo/redo, and a11y right is far greater than wiring TipTap.

---

## 4. Decision: output schema (allowed nodes / marks / attributes)

The editor emits a strict subset of HTML. Anything outside this set is dropped or normalised at edit time and again at sanitisation time before persistence.

### 4.1 Block nodes (allowed)

| Node | Tag | Notes |
|---|---|---|
| Paragraph | `<p>` | Default block. |
| Heading L2 | `<h2>` | Section headings inside the body. The hero owns H1; nothing in the body should outrank an H2. |
| Heading L3 | `<h3>` | Sub-section headings under an H2. H4+ is intentionally not exposed (encourages flatter editorial structure). |
| Bullet list | `<ul><li>` | One level today. Nested lists deferred to a future iteration. |
| Ordered list | `<ol><li>` | One level today. |
| Blockquote | `<blockquote>` | Single-paragraph quotes only. |
| Hard break | `<br>` | Permitted inside paragraphs. |

### 4.2 Inline marks (allowed)

| Mark | Tag | Notes |
|---|---|---|
| Bold | `<strong>` | Authors get Cmd/Ctrl-B. |
| Italic | `<em>` | Authors get Cmd/Ctrl-I. |
| Link | `<a href>` | `href` allowlisted to `https://`, `mailto:`, and tenant-relative `/`. `target="_blank"` and `rel="noopener noreferrer"` added automatically for external links. |

### 4.3 Disallowed (dropped or normalised)

- `<h1>` (reserved for hero), `<h4>`–`<h6>`.
- `<div>`, `<span>`, `style=""`, inline colour / font / size attributes — all stripped.
- `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>` — Story body is not a tabular surface; tables belong to a future, dedicated component.
- `<img>`, `<video>`, `<audio>`, `<picture>` — Media section owns supporting media; the Story body is text-only.
- `<iframe>`, `<embed>`, `<object>`, `<script>`, `<style>` — security-critical rejections.
- Raw HTML pasted from external sources is normalised through the schema before being inserted.
- `class="..."` is stripped on all nodes; presentation belongs to the destination-page CSS, not authored markup.
- `data-*` attributes are stripped except those explicitly added by the editor for ProseMirror internals (which are then dropped on serialisation).

### 4.4 Sanitiser

A second-line allowlist sanitiser runs on the editor's serialised HTML before `repositories.articles.upsert(...)` (and on render in any future SSR/SPA preview path) using the same node/mark/attribute allowlist. The sanitiser is deterministic and tested. Library: a small in-house wrapper around the existing ProseMirror schema's `Schema.parse` (no new external dependency required for sanitisation; the schema *is* the allowlist).

---

## 5. SharePoint compatibility constraints

- The `body` slot maps to a SharePoint Text webpart on the destination page. SP Text webpart accepts `<p>`, `<h2>`, `<h3>`, `<strong>`, `<em>`, `<a>`, `<ul>/<ol>/<li>`, `<blockquote>`, `<br>` — our allowed set is a strict subset.
- SharePoint sanitises authored HTML on its own pipeline; values outside SP's accept-list are silently stripped at render. Because our allowlist is strict, the SP pipeline is a no-op on our output. No round-trip surprises.
- `<a href>` rel/target augmentation matches SharePoint's external-link rendering convention.
- No fonts, colours, classes, or inline styles are emitted, so the destination page's theming remains under the page-template's CSS — no authored page can carry a competing brand surface.
- The serialised body must be valid UTF-8 and ≤ 256 KB to satisfy the SP list-item field limit. The editor enforces a soft cap at 200 KB with a warning surfaced through the readiness rail; hard cap at 256 KB rejects the save.

---

## 6. Accessibility expectations (WCAG 2.1 AA)

- The editor's editable area is a `role="textbox"` with `aria-multiline="true"`, `aria-label="Article body"`, and `aria-describedby` linked to the section intent line.
- Toolbar is a `role="toolbar"` with `aria-label="Body formatting"`. Each button is a real `<button type="button">` with `aria-pressed` reflecting the active state at the current selection.
- Keyboard shortcuts: Cmd/Ctrl-B (bold), Cmd/Ctrl-I (italic), Cmd/Ctrl-K (link prompt), Cmd/Ctrl-Z / Cmd/Ctrl-Shift-Z (undo / redo), Tab moves out of the editor (does not insert a tab), Enter creates a new paragraph, Shift-Enter creates a hard break.
- Focus order: section heading → toolbar buttons → editable area. `Esc` returns focus from a link prompt back to the editor at the original selection.
- Colour contrast for toolbar buttons and the cursor follows `@hbc/ui-kit` tokens (already at AA in the homepage overlay's premium stack).
- Selection and focus indicators meet 3:1 contrast.
- Screen-reader announcements: changes in mark state (bold on / off) are announced via the `aria-pressed` change on the toolbar button; structural changes (heading inserted, list created) are announced via the editor's accessible content reflecting the new tag.
- Reduced motion: the editor adds no animations beyond cursor blink. `prefers-reduced-motion: reduce` disables any focus-shift transitions on the toolbar.

---

## 7. Preview and publish round-trip

- **Preview:** `previewBuilder.buildPublisherPreview` continues to emit a 200-char snippet for the preview card. After Prompt-02, the snippet will be derived from the **plain-text projection** of the rich body (strip-tag pass), not from raw HTML — so preview text reads as editorial prose, not markup. The composed `body` slot's `TextControlPayload.text` remains the full sanitised HTML for the destination page.
- **Validation:** `pageCompositor.composePage` already requires non-empty body when the body slot is visible. The editor emits an empty string when the document has no usable text, so the existing validation continues to fire correctly.
- **Adapter unchanged.** No `publisherAdapter/**` change is required to land the editor. `BodyRichText` stays a `string` on the row contract.
- **Drift guarantees.** Because the editor schema is a strict subset of what the SP Text webpart accepts, publishing through `pageBindingWriter` cannot introduce content drift between the preview and the rendered destination page.

---

## 8. Implementation seam (Prompt-02 will follow this)

- New module path: `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/`
  - `StoryBodyEditor.tsx` — the rendered editor component used by `StoryPanel`.
  - `editorSchema.ts` — the ProseMirror schema (single source of truth for allowed nodes / marks / attributes).
  - `serializeToHtml.ts` — schema-bound HTML serialisation.
  - `sanitiseToSchema.ts` — defensive parse of incoming HTML against the schema (used on hydrate).
  - `editorToolbar.tsx` — accessible toolbar primitives composed from `@hbc/ui-kit` tokens.
  - `storyBodyEditor.module.css` — token-disciplined editor surface styles.
  - `__tests__/` — schema, serialisation, sanitisation, plain-text projection, link-href allowlist, hard-cap enforcement, keyboard shortcut wiring.
- `StoryPanel` will swap its `<textarea>` for `<StoryBodyEditor value={...} onChange={...} />`. No other Publisher surface changes.
- New runtime dependency: `@tiptap/core`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link` (no other extensions added; the editor avoids paragraph-margin / placeholder / typography opinion modules so authored output stays minimal).
- Bundle accounting: ~80 KB gzipped added to the publisher webpart chunk; not material for the SPFx hosted page.

This seam is **the** authoritative layout for Prompt-02 and is non-negotiable without a new ADR.

---

## 9. Governance posture

- **Schema is the law.** All allowed-set changes (new node, new mark, new attribute) require an ADR and a corresponding sanitiser update.
- **No raw HTML escape hatch.** Authors cannot bypass the schema. If a future need (e.g., embeds) emerges, it is a new authored node with an explicit sanitiser rule, not a "raw HTML" textarea.
- **Sanitiser is tested.** The sanitiser's allow-list is exercised by tests that pass adversarial HTML (script tags, on* handlers, javascript: URIs, style attributes, foreign HTML) and assert it is dropped.
- **Versioning.** The persisted `BodyRichText` string is plain HTML — no internal serialisation format. Authored bodies remain forward-compatible regardless of editor version.

---

## 10. Out of scope for this step

- No code changes (Prompt-02 implements the editor).
- No new `@hbc/ui-kit` primitives proposed yet — the toolbar uses existing button tokens; if Prompt-02 finds a primitive that warrants `@hbc/ui-kit` placement, it will be proposed there.
- No adapter / `publisherAdapter/**` changes — the data path is unchanged.
- No manifest version bump.
- No lifecycle behaviour change.

---

## 11. Validation performed for this step

- Decision cross-checked against the SPFx Governing Standard (host-safety, page-canvas ownership, accessibility, premium authored composition, no-placeholder-UX) — compliant.
- Decision cross-checked against current repo truth: confirmed `BodyRichText: string`, confirmed `body` slot mapping to a `TextControlPayload.text`, confirmed the existing tests already write HTML into `BodyRichText`, confirmed the `pageCompositor.composePage` empty-body validation rule.
- No code or test changes were necessary for this step.

---

## 12. Closure report path

`docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-c-rich-content-authoring/step-01/Closure-Report.md`

---

## 13. Real blockers remaining

**None for Prompt-01.** Prompt-02 can implement `StoryBodyEditor` against §4–§8 directly.
