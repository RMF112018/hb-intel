/**
 * HB Intel Design System — Typography scale
 * Blueprint §1d — Signature type scale for brand recognition
 */

/** Display hero — dashboard headers, feature banners */
export const displayHero = {
  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: '2.5rem',
  fontWeight: '700',
  lineHeight: '3rem',
  letterSpacing: '-0.02em',
} as const;

/** Display large — section headers, page titles */
export const displayLarge = {
  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: '2rem',
  fontWeight: '600',
  lineHeight: '2.5rem',
  letterSpacing: '-0.01em',
} as const;

/** Display medium — card headers, subpage titles */
export const displayMedium = {
  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: '1.5rem',
  fontWeight: '600',
  lineHeight: '2rem',
  letterSpacing: '0',
} as const;

/** Title large — panel headers, modal titles */
export const titleLarge = {
  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: '1.25rem',
  fontWeight: '600',
  lineHeight: '1.75rem',
  letterSpacing: '0',
} as const;

/** Title medium — table headers, toolbar labels */
export const titleMedium = {
  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: '1rem',
  fontWeight: '600',
  lineHeight: '1.5rem',
  letterSpacing: '0',
} as const;

/** Body large — primary content text */
export const bodyLarge = {
  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: '1rem',
  fontWeight: '400',
  lineHeight: '1.5rem',
  letterSpacing: '0',
} as const;

/** Body medium — secondary content text */
export const bodyMedium = {
  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: '0.875rem',
  fontWeight: '400',
  lineHeight: '1.25rem',
  letterSpacing: '0',
} as const;

/** Caption — labels, metadata, timestamps */
export const caption = {
  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: '0.75rem',
  fontWeight: '400',
  lineHeight: '1rem',
  letterSpacing: '0.01em',
} as const;

/** Monospace — code blocks, technical identifiers, project codes */
export const monospace = {
  fontFamily: '"Cascadia Code", "Fira Code", "Consolas", monospace',
  fontSize: '0.875rem',
  fontWeight: '400',
  lineHeight: '1.25rem',
  letterSpacing: '0',
} as const;

/** Complete type scale object for theme integration */
export const hbcTypeScale = {
  displayHero,
  displayLarge,
  displayMedium,
  titleLarge,
  titleMedium,
  bodyLarge,
  bodyMedium,
  caption,
  monospace,
} as const;
