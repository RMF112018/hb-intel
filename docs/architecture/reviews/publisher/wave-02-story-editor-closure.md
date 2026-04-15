# Wave 02 — Story editor editorial-grade closure

Scope: Phase 13 Prompt 04. Finish the TipTap-backed story editor to an editorial-grade surface while preserving the governed schema, paste sanitization, and SharePoint-host-safe output contract.

## What remained under-finished

- The placeholder/empty-state behaviour depended on `:empty` pseudo-class selectors in CSS. ProseMirror always keeps at least a `<p></p>` shell in the document, so those selectors could never match once the editor mounted — the placeholder would silently stop appearing. This was brittle and implementation-hacky.
- There was no visible data-empty signal on the editor surface that test harnesses or tokens could rely on for conditional styling.
- There were no component-level tests exercising higher-value editor interactions (placeholder lifecycle, toolbar affordance governance, link-microflow trust copy). Coverage was strong at the sanitizer and link-validator level but thin at the component surface.

## Placeholder / empty-state now

The editor surface is driven by React state `isEmpty`, kept in sync with `editor.isEmpty` via TipTap's `onCreate` and `onUpdate` listeners, plus a hydration sync after external `setContent`. The surface carries `data-empty="true"` when the document is empty, and renders a sibling `.placeholder` node (`aria-hidden`, pointer-events none) positioned over the editor area instead of relying on CSS `:empty`. This approach:

- remains editor-native (driven by the editor's own `isEmpty` signal, not a DOM shape guess),
- handles first render, hydration with `<p></p>`, content removal, and draft-switching identically,
- never touches the ProseMirror contenteditable tree, so caret behaviour and selection are unchanged,
- keeps the schema and allowed formatting set untouched.

The brittle `.editorContent[data-placeholder]:empty::before` rule was removed.

## Toolbar clarity and link flow

- The toolbar's roving-tabindex W3C pattern, governed iconography, and `aria-pressed` state are preserved.
- Link microflow guardrails are unchanged in behaviour: empty-selection attempts surface the *“Select the text you want to link first.”* trust-copy error via `role="alert"`; invalid hrefs continue to surface the allowed-schemes explanation from `linkValidation.ts`; Enter applies, Escape cancels and refocuses the editor.
- No disallowed formatting affordance was added. A regression test asserts that strike, inline code, underline, highlight, table, image, and horizontal rule never appear on the toolbar — guarding the schema through the UI layer as well as the parser layer.

## Tests added

New component test file `storyBodyEditor/__tests__/storyBodyEditor.test.tsx` proves the higher-value contract:

- placeholder renders when the editor mounts empty,
- placeholder absent when seeded with content,
- `<p></p>` hydrate is still classified as empty (the old `:empty` failure mode),
- all allowed toolbar affordances are present (bold, italic, link, headings, bulleted list),
- `data-empty` flips correctly across draft switching (filled → empty → filled),
- empty-selection link attempt surfaces the trust-copy error,
- disallowed formatting affordances are absent from the toolbar,
- empty-document output normalisation never emits `<p></p>` through `onChange`.

All eight new tests pass. Existing `pasteSanitization.test.ts`, `linkValidation.test.ts`, and `bodyTextProjection.test.ts` continue to pass. Typecheck is clean. The pre-existing six `publisherEndToEnd.test.ts` failures are unrelated to this seam.

## Preserved

- `STORY_BODY_EXTENSIONS` and the schema-locked formatting allow-set.
- `sanitizePastedHtml` pipeline wired through `transformPastedHTML`.
- Link allow-list (https, mailto, tenant-relative) and the roving-tabindex toolbar keyboard model.
- `HeroPanel`/`StoryPanel`/`MetadataPanel` integrations are untouched — the StoryBodyEditor public props (`value`, `onChange`, `placeholder`, `ariaLabel`, `ariaDescribedBy`) are unchanged.
