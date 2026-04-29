import futuraLtProBook from './futura-lt-pro-book.otf';
import futuraLtProMedium from './futura-lt-pro-medium.otf';
import futuraLtProBold from './futura-lt-pro-bold.otf';
import futuraLtProDisplay from './futura-lt-pro-display.otf';

export const HBC_FONT_FALLBACK_UI = '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif';
export const HBC_FONT_FALLBACK_MONO =
  '"Courier New", "Cascadia Code", "Fira Code", "Consolas", monospace';

/**
 * Theme-owned font asset registry.
 * Consumers should use semantic family tokens below, never raw paths.
 */
export const hbcFontAssetUrls = {
  futuraLtProBook,
  futuraLtProMedium,
  futuraLtProBold,
  futuraLtProDisplay,
} as const;

/**
 * Semantic font-family tokens for governed usage roles.
 */
export const HBC_FONT_FAMILY_BRAND_DISPLAY =
  '"Futura LT Pro Display", "Futura LT Pro", "Futura", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif';
export const HBC_FONT_FAMILY_HEADLINE =
  '"Futura LT Pro Medium", "Futura LT Pro", "Futura", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif';
export const HBC_FONT_FAMILY_BODY_UI =
  '"Futura LT Pro Book", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif';

/**
 * Optional fallback-only mode when branded fonts fail to load or are unavailable.
 */
export const hbcFontFallbackFamilies = {
  brandDisplay: HBC_FONT_FALLBACK_UI,
  headline: HBC_FONT_FALLBACK_UI,
  bodyUi: HBC_FONT_FALLBACK_UI,
  mono: HBC_FONT_FALLBACK_MONO,
} as const;
