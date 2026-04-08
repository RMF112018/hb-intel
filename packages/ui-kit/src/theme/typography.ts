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

/** Display XL — signature hero headlines, full-bleed presentation banners (W01-P01) */
export const displayXl = {
  fontFamily: FONT_FAMILY,
  fontSize: '3rem',
  fontWeight: '700',
  lineHeight: '1.15',
  letterSpacing: '-0.03em',
} as const;

/** Display Lg — section hero titles, editorial feature headers (W01-P01) */
export const displayLg = {
  fontFamily: FONT_FAMILY,
  fontSize: '2.5rem',
  fontWeight: '700',
  lineHeight: '1.2',
  letterSpacing: '-0.025em',
} as const;

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
  displayXl,
  displayLg,
  display,
  heading1,
  heading2,
  heading3,
  heading4,
  body,
  bodySmall,
  label,
  code,
} as const;
