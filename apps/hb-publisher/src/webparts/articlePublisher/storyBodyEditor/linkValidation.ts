/**
 * Link href governance for the Story body editor.
 *
 * Per workstream-c step-01: only `https://`, `mailto:`, and
 * tenant-relative `/...` URLs are permitted on `<a href>`. Any
 * other scheme (`http:`, `javascript:`, `data:`, `vbscript:`,
 * `file:`, …) is rejected so the SPFx host pipeline cannot end up
 * stamping an unsafe link into the destination page.
 */

const ABSOLUTE_PROTOCOL_RE = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;

export function isAllowedHref(href: string | null | undefined): boolean {
  if (!href) return false;
  const trimmed = href.trim();
  if (trimmed.length === 0) return false;

  // Tenant-relative: must start with `/` and not be a protocol-
  // relative `//` (which could otherwise smuggle an http:// link).
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//');
  }

  const match = ABSOLUTE_PROTOCOL_RE.exec(trimmed);
  if (!match) return false;
  const protocol = match[1]!.toLowerCase();
  if (protocol === 'https') return true;
  if (protocol === 'mailto') return true;
  return false;
}

/**
 * Normalise a candidate href before stamping it on a link mark.
 * Trims whitespace and rejects values that are not allowed.
 * Returns `null` when the value should not be stored on the mark.
 */
export function normaliseHref(href: string | null | undefined): string | null {
  if (!href) return null;
  const trimmed = href.trim();
  if (!isAllowedHref(trimmed)) return null;
  return trimmed;
}
