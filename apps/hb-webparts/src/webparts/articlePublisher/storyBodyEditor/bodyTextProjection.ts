/**
 * Plain-text projection of the rich body HTML.
 *
 * Used by the Preview surface to derive a snippet that reads as
 * editorial prose rather than markup. The projection strips tags,
 * collapses whitespace, and decodes the small set of HTML entities
 * that the editor schema can emit. It does not attempt to be a
 * general HTML-to-text converter.
 *
 * Pure / deterministic / DOM-free so it is safe in tests and on the
 * SPFx render path.
 */

const TAG_RE = /<[^>]*>/g;
const ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
};

function decodeBasicEntities(input: string): string {
  return input.replace(/&(nbsp|amp|lt|gt|quot|#39|apos);/g, (match) =>
    ENTITY_MAP[match] ?? match,
  );
}

export function bodyTextProjection(html: string | undefined | null): string {
  if (!html) return '';
  // Replace block-level closing tags with a space so adjacent
  // paragraphs read as separated words rather than running together.
  const blocked = html.replace(/<\/(p|h2|h3|li|ul|ol|blockquote|br|hr)\s*>/gi, ' ');
  const stripped = blocked.replace(TAG_RE, '');
  const decoded = decodeBasicEntities(stripped);
  return decoded.replace(/\s+/g, ' ').trim();
}

/**
 * Truncate a plain-text body to a snippet of at most `maxChars`
 * characters, appending a trailing ellipsis when the text was
 * shortened. Avoids breaking inside a word when a space is nearby.
 */
export function bodyTextSnippet(html: string | undefined | null, maxChars = 200): string {
  const text = bodyTextProjection(html);
  if (text.length <= maxChars) return text;
  const sliced = text.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(' ');
  const cutoff = lastSpace > maxChars * 0.6 ? lastSpace : maxChars;
  return `${sliced.slice(0, cutoff).trimEnd()}…`;
}
