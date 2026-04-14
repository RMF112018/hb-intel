/**
 * Paste sanitiser for the Story body editor (workstream-c step-05).
 *
 * TipTap's schema parser already drops nodes and marks that sit
 * outside the allow-list in `editorSchema.ts`, but Office, Word, and
 * "Reveal formatting" copies routinely smuggle dangerous noise
 * through: inline `style` + `class` attributes, `<font>` tags, MSO
 * processing instructions, `<meta>` / `<link>` / `<style>` blocks,
 * and WordML-namespaced `<o:p>` / `<w:*>` tags. The schema parser
 * tolerates some of that; the hosted SharePoint Pages REST pipeline
 * does not — an inline style or class sliding through would land
 * verbatim on the published page and break the premium editorial
 * treatment.
 *
 * This module runs as `editorProps.transformPastedHTML` so the
 * sanitised string is what ProseMirror sees, which is what the
 * schema parser then narrows to the allow-list. The two layers are
 * deliberate: this sanitiser is defence-in-depth around the schema,
 * not a replacement for it.
 *
 * Pure string work. SPFx-safe (no DOM, no window, no SSR hazard).
 */

const OFFICE_CONDITIONAL_COMMENT_RE = /<!--\s*\[if[\s\S]*?endif\s*\]\s*-->/gi;
const HTML_COMMENT_RE = /<!--[\s\S]*?-->/g;
const DROP_BLOCK_TAG_RE =
  /<(script|style|meta|link|title|base|iframe|object|embed|form|input|button|noscript)\b[\s\S]*?<\/\1\s*>/gi;
const DROP_SELF_CLOSING_TAG_RE =
  /<(meta|link|base|img|input)\b[^>]*\/?>/gi;
const MSO_NAMESPACED_TAG_RE = /<\/?(?:o|w|v|m|x|st1):[a-z0-9-]+\b[^>]*>/gi;
const MSO_PROCESSING_RE = /<\?xml[\s\S]*?\?>/gi;
const FONT_OPEN_RE = /<font\b[^>]*>/gi;
const FONT_CLOSE_RE = /<\/font\s*>/gi;
const SPAN_OPEN_RE = /<span\b[^>]*>/gi;
const SPAN_CLOSE_RE = /<\/span\s*>/gi;
const DIV_OPEN_RE = /<div\b[^>]*>/gi;
const DIV_CLOSE_RE = /<\/div\s*>/gi;
const B_OPEN_RE = /<b(\s[^>]*)?>/gi;
const B_CLOSE_RE = /<\/b\s*>/gi;
const I_OPEN_RE = /<i(\s[^>]*)?>/gi;
const I_CLOSE_RE = /<\/i\s*>/gi;

// Attributes on any remaining tag: strip everything except href on <a>
// (which the schema's link mark validates separately). We do this by
// walking every open tag and rewriting its attribute list.
const OPEN_TAG_RE = /<([a-z][a-z0-9]*)\b([^>]*)>/gi;
const HREF_RE = /\shref\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i;

function stripDangerousAttrs(tagName: string, attrs: string): string {
  const lower = tagName.toLowerCase();
  if (lower === 'a') {
    const match = HREF_RE.exec(attrs);
    return match ? ` href=${match[1]!.startsWith('"') || match[1]!.startsWith("'") ? match[1] : `"${match[1]}"`}` : '';
  }
  return '';
}

/**
 * Sanitise an HTML string pasted into the Story body editor.
 *
 * - Strips MSO / Word conditional comments, processing instructions,
 *   and WordML-namespaced tags (`<o:p>`, `<w:sdt>`, …).
 * - Drops `<script>`, `<style>`, `<meta>`, `<link>`, `<iframe>`,
 *   `<object>`, `<embed>`, `<form>`, `<input>`, `<button>`, `<img>`
 *   and their contents (the schema has no slot for any of these).
 * - Flattens `<font>`, `<span>`, and `<div>` wrappers into their
 *   inner text — they carry only presentational noise here.
 * - Converts `<b>` / `<i>` to `<strong>` / `<em>` for schema fit.
 * - Strips every attribute except `href` on `<a>`; the link mark's
 *   href governance in `linkValidation.ts` then filters unsafe
 *   schemes (javascript:, data:, file:, etc.).
 */
export function sanitizePastedHtml(input: string): string {
  if (typeof input !== 'string' || input.length === 0) return '';

  let out = input;
  out = out.replace(MSO_PROCESSING_RE, '');
  out = out.replace(OFFICE_CONDITIONAL_COMMENT_RE, '');
  out = out.replace(HTML_COMMENT_RE, '');
  out = out.replace(DROP_BLOCK_TAG_RE, '');
  out = out.replace(DROP_SELF_CLOSING_TAG_RE, '');
  out = out.replace(MSO_NAMESPACED_TAG_RE, '');

  // Flatten presentational wrappers.
  out = out.replace(FONT_OPEN_RE, '').replace(FONT_CLOSE_RE, '');
  out = out.replace(SPAN_OPEN_RE, '').replace(SPAN_CLOSE_RE, '');
  out = out.replace(DIV_OPEN_RE, '').replace(DIV_CLOSE_RE, '');

  // Normalise legacy bold / italic tag names.
  out = out.replace(B_OPEN_RE, '<strong>').replace(B_CLOSE_RE, '</strong>');
  out = out.replace(I_OPEN_RE, '<em>').replace(I_CLOSE_RE, '</em>');

  // Strip attributes on every remaining tag (keep href on <a>).
  out = out.replace(OPEN_TAG_RE, (_full, tag: string, attrs: string) => {
    const kept = stripDangerousAttrs(tag, attrs);
    return `<${tag.toLowerCase()}${kept}>`;
  });

  return out;
}
