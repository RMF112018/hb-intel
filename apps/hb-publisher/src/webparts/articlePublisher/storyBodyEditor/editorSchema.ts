/**
 * TipTap extension set for the Story body editor.
 *
 * The schema is the law (workstream-c step-01 §9). The set defined
 * here is the only authoritative source for what nodes, marks, and
 * attributes the editor accepts. Anything outside the schema is
 * dropped at edit time and again at hydrate time when an existing
 * article is loaded into the editor.
 *
 * Allowed nodes: paragraph, heading (h2 / h3 only), bullet_list,
 * ordered_list, list_item, blockquote, hard_break.
 * Allowed marks: bold (<strong>), italic (<em>), link (<a href>).
 *
 * Disallowed (and explicitly disabled below):
 *   horizontalRule, codeBlock, code (inline), strike, underline,
 *   text colour / highlight, tables, images, h1, h4-h6, classes,
 *   inline styles, raw HTML, scripts, iframes.
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
