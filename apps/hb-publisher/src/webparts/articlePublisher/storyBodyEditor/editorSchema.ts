/**
 * TipTap extension set for the Story body editor.
 *
 * The schema is the law. The set defined here is the only
 * authoritative source for what nodes, marks, and attributes the
 * editor accepts. Anything outside the schema is dropped at edit
 * time and again at hydrate time when an existing article is loaded
 * into the editor.
 *
 * ── Allowed (the canonical schema) ─────────────────────────────
 *   nodes:  paragraph, heading (h2 / h3 only), bullet_list,
 *           ordered_list, list_item, blockquote, hard_break
 *   marks:  bold (<strong>), italic (<em>), link (<a href>) —
 *           links are narrowed further by `linkValidation.ts`
 *           (https://, mailto:, tenant-relative /path only)
 *
 * ── Explicitly kept out, and why ───────────────────────────────
 *   h1, h4–h6 ............ page-shell owns the page <h1>; headings
 *                          beyond h3 are not styled by the preview
 *                          surface (`articlePreview.module.css`
 *                          `.bodyProse h2 / h3`) or the published
 *                          Project Spotlight page.
 *   horizontalRule ....... neither the preview nor the published
 *                          page styles `<hr>` today; adding it
 *                          would create author-visible drift
 *                          between the editor and the rendered
 *                          article.
 *   codeBlock / code / pre product voice for Project Spotlight
 *                          articles is editorial, not technical;
 *                          preview CSS does not style code and the
 *                          page shell does not render it faithfully.
 *   strike / underline ... editorial anti-patterns in this product
 *                          voice; not styled by preview or page.
 *   table ................ preview CSS has no table rules and the
 *                          page shell is not compositionally set up
 *                          to render a safe, accessible table; the
 *                          payload would render as an unstyled
 *                          runtime blob on the live page.
 *   inline img ........... image authoring is already structured
 *                          (hero / secondary / gallery roles) with
 *                          alt-text governance and tenant-asset
 *                          library binding; inline images would
 *                          duplicate the flow and bypass
 *                          `suggestedAltText` seeding.
 *   raw class / style .... the paste sanitiser
 *                          (`pasteSanitization.ts`) scrubs these
 *                          before the schema parser sees them;
 *                          defense-in-depth with the schema.
 *   script / iframe ...... the sanitiser strips these; the schema
 *                          has no matching node so they cannot be
 *                          round-tripped even if they survived.
 *
 * ── Rule for future extension ──────────────────────────────────
 * A mark or block may be added here only when ALL of the following
 * hold:
 *   (a) a concrete authoring need names it,
 *   (b) `articlePreview.module.css` styles it under `.bodyProse`
 *       so the preview renders it faithfully, and
 *   (c) the live Project Spotlight page renders it without drift.
 * Each addition must come with an added case in
 * `editorSchemaFaithfulness.test.ts` so the editor↔preview↔publish
 * lock-step is continuously proven.
 *
 * Paired invariants live in:
 *   - `pasteSanitization.ts`     — pre-schema scrub for MSO/Word
 *                                  noise and attribute smuggling
 *   - `linkValidation.ts`        — href allowlist
 *   - `editorSchemaFaithfulness.test.ts` — allowed-round-trip and
 *                                          disallowed-dropped proofs
 *   - `previewSurface/articlePreview.module.css` (`.bodyProse`)
 *                                  — preview rendering rules for
 *                                    every allowed element
 */

import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { isAllowedHref } from './linkValidation';

export const STORY_BODY_EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    horizontalRule: false,
    codeBlock: false,
    code: false,
    strike: false,
    // Bold, italic, paragraph, bullet list, ordered list, list item,
    // blockquote, hard break, history (undo / redo), and document
    // remain enabled from StarterKit's defaults.
  }),
  Link.configure({
    openOnClick: false,
    autolink: false,
    HTMLAttributes: {
      rel: 'noopener noreferrer',
      target: '_blank',
    },
    validate: (href) => isAllowedHref(href),
  }),
];
