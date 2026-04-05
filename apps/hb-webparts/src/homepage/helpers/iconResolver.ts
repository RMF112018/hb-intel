/**
 * Icon resolution for homepage utility and discovery surfaces.
 * Phase 15-06 — Discovery and launcher productization
 *
 * Replaces placeholder-grade text-initials (FI, HR, SF) with semantic
 * Unicode symbols that communicate function at a glance. These symbols
 * render inside HbcHomepageIconFrame and work across all browsers
 * without icon font dependencies.
 */

/** Semantic icon mapping for utility/launcher surfaces. */
const UTILITY_ICON_MAP: Record<string, string> = {
  finance:  '\u0024',   // $ — dollar sign
  field:    '\u25C9',   // ◉ — fisheye / location marker
  hr:       '\u263A',   // ☺ — person/smiley
  safety:   '\u26E8',   // ⛨ — shield
  quality:  '\u2714',   // ✔ — check mark
  risk:     '\u26A0',   // ⚠ — warning triangle
  ops:      '\u2699',   // ⚙ — gear
  admin:    '\u2630',   // ☰ — hamburger/settings
  legal:    '\u00A7',   // § — section sign
  it:       '\u2328',   // ⌨ — keyboard
  project:  '\u25B6',   // ▶ — play/project
  report:   '\u25A4',   // ▤ — grid/table
  schedule: '\u25F4',   // ◴ — clock quadrant
  email:    '\u2709',   // ✉ — envelope
  document: '\u25A3',   // ▣ — document square
  team:     '\u2302',   // ⌂ — house/team space
  form:     '\u270E',   // ✎ — pencil
  policy:   '\u2261',   // ≡ — triple bar
  search:   '\u2315',   // ⌕ — search/telephone recorder
  link:     '\u2197',   // ↗ — external link arrow
};

const UTILITY_FALLBACK = '\u2B9A';  // ⮚ — right arrowhead

/** Semantic icon mapping for discovery surfaces. */
const DISCOVERY_ICON_MAP: Record<string, string> = {
  ...UTILITY_ICON_MAP,
  tool:        '\u2699',   // ⚙
  form:        '\u270E',   // ✎
  policy:      '\u2261',   // ≡
  system:      '\u2328',   // ⌨
  teamSpace:   '\u2302',   // ⌂
  destination: '\u2197',   // ↗
};

const DISCOVERY_FALLBACK = '\u2192';  // → — right arrow

/**
 * Resolve an iconKey to a semantic symbol for utility/launcher surfaces.
 */
export function resolveUtilityIconContent(iconKey: string | undefined): string {
  if (!iconKey) return UTILITY_FALLBACK;
  const normalized = iconKey.trim().toLowerCase();
  return UTILITY_ICON_MAP[normalized] ?? UTILITY_FALLBACK;
}

/**
 * Resolve an iconKey to a semantic symbol for discovery surfaces.
 */
export function resolveDiscoveryIconContent(iconKey: string | undefined): string {
  if (!iconKey) return DISCOVERY_FALLBACK;
  const normalized = iconKey.trim().toLowerCase();
  return DISCOVERY_ICON_MAP[normalized] ?? DISCOVERY_FALLBACK;
}
