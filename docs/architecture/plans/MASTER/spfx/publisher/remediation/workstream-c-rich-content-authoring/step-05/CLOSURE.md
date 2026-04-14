# Workstream C · Step 05 — Closure

## Objective
Close the Rich Content Authoring workstream with exhaustive accessibility, keyboard, paste-behaviour, and hosted-SharePoint vetting.

## What changed

### Paste sanitiser (the one real remaining host-safety gap)
Authors routinely paste from Word, Outlook, Office for Web, and SharePoint pages. StarterKit's schema parser handles a lot of that, but not cleanly — inline `style`, `class`, `<font>`, MSO conditional comments, WordML-namespaced tags (`<o:p>`, `<w:sdt>`), and `<meta>` / `<style>` / `<script>` blocks can still smuggle through in ways that would land presentational noise or worse on the published SharePoint page.

- `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/pasteSanitization.ts` (new)
  - Pure string `sanitizePastedHtml(html)`. SPFx-safe (no DOM, no `window`).
  - Strips MSO processing instructions, conditional comments, HTML comments, WordML-namespaced tags, and the `<script>/<style>/<meta>/<link>/<iframe>/<object>/<embed>/<form>/<input>/<button>/<img>` families along with their contents.
  - Flattens `<span>/<font>/<div>` presentational wrappers into their inner text.
  - Normalises `<b>` → `<strong>` and `<i>` → `<em>` for schema fit.
  - Strips every attribute on every remaining tag except `href` on `<a>`. The link mark's existing href governance in `linkValidation.ts` then filters unsafe schemes.
- `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/StoryBodyEditor.tsx`
  - Wired `sanitizePastedHtml` into TipTap via `editorProps.transformPastedHTML`, so ProseMirror / the schema parser only ever sees sanitised HTML. This is defence-in-depth around `STORY_BODY_EXTENSIONS`, not a replacement for it.
- `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/__tests__/pasteSanitization.test.ts` (new, 10 tests)
  - Covers Word/Office paste (`MsoNormal`, `font-family: Calibri`, `<o:p>`, conditional comments), dangerous tag + content removal, `<b>/<i>` normalisation, anchor href preservation + attribute stripping, list/heading schema preservation, and idempotence on already-clean HTML.

### Accessibility and keyboard posture — verified, no code changes required
The editor surface already satisfies the governing standard:
- `StoryBodyEditor` exposes `role="textbox"` + `aria-multiline="true"` + `aria-label` + optional `aria-describedby` on the contenteditable.
- `EditorToolbar` wraps controls in `role="toolbar"` with `aria-label="Body formatting"`; every control is a real `<button type="button">` carrying `aria-pressed` reflecting the active mark/node, plus a `aria-label` / `title` that includes the keyboard shortcut.
- The link prompt is a `role="group" aria-label="Insert link"` with an `aria-label`ed text input; `Enter` applies, `Escape` cancels and returns focus to the editor. Invalid URLs surface inline via `role="alert"`.
- The Step-03 `Field` primitive now carries helper + counter copy announced via `aria-live="polite"`, so length awareness reaches AT users.

No toolbar or editor wiring changed in this step; the audit confirms the keyboard/a11y posture is already production-grade for workstream C.

### Hosted SharePoint vetting
The SharePoint Pages REST body control stamps the author's HTML verbatim (confirmed Step 04 by the `preview → compose` byte-for-byte test). The risks that matter at the hosted boundary are:
1. Inline `style` / `class` that would conflict with rendered page CSS → **closed** by the paste sanitiser + schema parser.
2. `<script>`, `<iframe>`, `<object>`, `<embed>` → **closed** by the paste sanitiser (content dropped) and the schema (no node types exist for them).
3. Unsafe link schemes (`javascript:`, `data:`, `file:`, `vbscript:`, protocol-relative `//`) → **closed** by `linkValidation.isAllowedHref` on both the toolbar entry path and the TipTap Link `validate` hook.
4. Empty TipTap document reaching publish → **closed** Step 04 by `isRichBodyEmpty` in the validation engine.

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run pasteSanitization storyBody ArticlePublisher` — 97/97 pass (includes the 10 new paste tests plus every existing editor / publisher test).
- Manual scrub of `StoryBodyEditor.tsx`, `editorToolbar.tsx`, and the new sanitiser for stale naming, contradictory labels, and drift — none found. The Step-02 comment on `StoryBodyEditor` was left as-is because it is accurate historical provenance.

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/pasteSanitization.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/__tests__/pasteSanitization.test.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/storyBodyEditor/StoryBodyEditor.tsx`
- `apps/hb-webparts/config/package-solution.json` (version bump)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-c-rich-content-authoring/step-05/CLOSURE.md` (this file)

## Workstream C — overall state after this step
- Step 01 — rich-text editor architecture locked ✔
- Step 02 — TipTap body editor live, replacing the legacy `<textarea>` ✔
- Step 03 — editorial guidance + character awareness on Subhead / Summary / Intro / Closing / Callout / Pull quote / Hero alt text ✔
- Step 04 — preview + publish validated for rich-content output; empty-body hole closed ✔
- Step 05 — paste sanitisation + accessibility + keyboard + hosted SharePoint vetting ✔ (this step)

## Remaining / blockers
- None blocking workstream C. Unrelated pre-existing failures in the hb-webparts test suite (homepage bundle budget, homepage webpart composition, publisher orchestrator outcome-phase drift) are tracked by other workstreams and do not regress rich-content authoring.
