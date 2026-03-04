/**
 * HB Intel Design System — Typography scale (V2.1)
 * Blueprint §1d — Intent-based type scale for brand recognition
 * PH4.3 §3.2 — Renamed from size-based to intent-based naming
 */

const FONT_FAMILY = '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif';
const FONT_FAMILY_MONO = '"Courier New", "Cascadia Code", "Fira Code", "Consolas", monospace';

// ---------------------------------------------------------------------------
// V2.1 intent-based typography scale
// ---------------------------------------------------------------------------

/** Display — dashboard headers, feature banners */
export const display = {
  fontFamily: FONT_FAMILY,
  fontSize: '2rem',
  fontWeight: '700',
  lineHeight: '1.25',
  letterSpacing: '-0.02em',
} as const;

/** Heading 1 — section headers, page titles */
export const heading1 = {
  fontFamily: FONT_FAMILY,
  fontSize: '1.5rem',
  fontWeight: '700',
  lineHeight: '1.3',
  letterSpacing: '-0.01em',
} as const;

/** Heading 2 — card headers, subpage titles */
export const heading2 = {
  fontFamily: FONT_FAMILY,
  fontSize: '1.25rem',
  fontWeight: '600',
  lineHeight: '1.35',
  letterSpacing: '0',
} as const;

/** Heading 3 — panel headers, modal titles */
export const heading3 = {
  fontFamily: FONT_FAMILY,
  fontSize: '1rem',
  fontWeight: '600',
  lineHeight: '1.4',
  letterSpacing: '0',
} as const;

/** Heading 4 — table headers, toolbar labels */
export const heading4 = {
  fontFamily: FONT_FAMILY,
  fontSize: '0.875rem',
  fontWeight: '600',
  lineHeight: '1.4',
  letterSpacing: '0',
} as const;

/** Body — primary content text */
export const body = {
  fontFamily: FONT_FAMILY,
  fontSize: '0.875rem',
  fontWeight: '400',
  lineHeight: '1.5',
  letterSpacing: '0',
} as const;

/** Body small — secondary content text */
export const bodySmall = {
  fontFamily: FONT_FAMILY,
  fontSize: '0.75rem',
  fontWeight: '400',
  lineHeight: '1.5',
  letterSpacing: '0',
} as const;

/** Label — labels, metadata, timestamps */
export const label = {
  fontFamily: FONT_FAMILY,
  fontSize: '0.75rem',
  fontWeight: '500',
  lineHeight: '1.4',
  letterSpacing: '0.01em',
} as const;

/** Code — code blocks, technical identifiers, project codes */
export const code = {
  fontFamily: FONT_FAMILY_MONO,
  fontSize: '0.8125rem',
  fontWeight: '400',
  lineHeight: '1.6',
  letterSpacing: '0',
} as const;

// ---------------------------------------------------------------------------
// V2.1 type scale object (primary — intent-based keys)
// ---------------------------------------------------------------------------
export const hbcTypeScale = {
  display,
  heading1,
  heading2,
  heading3,
  heading4,
  body,
  bodySmall,
  label,
  code,
  // Deprecated aliases (included for internal migration)
  displayHero: display,
  displayLarge: heading1,
  displayMedium: heading2,
  titleLarge: heading3,
  titleMedium: heading4,
  bodyLarge: body,
  bodyMedium: bodySmall,
  caption: label,
  monospace: code,
} as const;

// ---------------------------------------------------------------------------
// Deprecated aliases — kept for backward compatibility during migration
// ---------------------------------------------------------------------------
/** @deprecated Use `display` */
export const displayHero = display;
/** @deprecated Use `heading1` */
export const displayLarge = heading1;
/** @deprecated Use `heading2` */
export const displayMedium = heading2;
/** @deprecated Use `heading3` */
export const titleLarge = heading3;
/** @deprecated Use `heading4` */
export const titleMedium = heading4;
/** @deprecated Use `body` */
export const bodyLarge = body;
/** @deprecated Use `bodySmall` */
export const bodyMedium = bodySmall;
/** @deprecated Use `label` */
export const caption = label;
/** @deprecated Use `code` */
export const monospace = code;
