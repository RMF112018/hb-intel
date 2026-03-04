/**
 * HB Intel Design System — Grid & spacing system (V2.1)
 * PH4.3 §3.3 — 4px base unit, 12-column grid, responsive breakpoints
 */

// ---------------------------------------------------------------------------
// Spacing scale (4px base unit)
// ---------------------------------------------------------------------------
export const HBC_SPACE_XS = 4;
export const HBC_SPACE_SM = 8;
export const HBC_SPACE_MD = 16;
export const HBC_SPACE_LG = 24;
export const HBC_SPACE_XL = 32;
export const HBC_SPACE_XXL = 48;

export const hbcSpacing = {
  xs: HBC_SPACE_XS,
  sm: HBC_SPACE_SM,
  md: HBC_SPACE_MD,
  lg: HBC_SPACE_LG,
  xl: HBC_SPACE_XL,
  xxl: HBC_SPACE_XXL,
} as const;

export type HbcSpacingKey = keyof typeof hbcSpacing;

// ---------------------------------------------------------------------------
// Breakpoints
// ---------------------------------------------------------------------------
export const BREAKPOINT_MOBILE = 768;
export const BREAKPOINT_TABLET = 1024;
export const BREAKPOINT_DESKTOP = 1200;
export const BREAKPOINT_WIDE = 1600;

export interface HbcBreakpointConfig {
  min: number;
  columns: number;
  gutter: number;
  maxWidth: number | null;
}

export const hbcBreakpoints: Record<string, HbcBreakpointConfig> = {
  mobile: { min: 0, columns: 4, gutter: HBC_SPACE_MD, maxWidth: BREAKPOINT_MOBILE },
  tablet: { min: BREAKPOINT_MOBILE, columns: 8, gutter: HBC_SPACE_LG, maxWidth: BREAKPOINT_DESKTOP },
  desktop: { min: BREAKPOINT_DESKTOP, columns: 12, gutter: HBC_SPACE_LG, maxWidth: BREAKPOINT_WIDE },
  wide: { min: BREAKPOINT_WIDE, columns: 12, gutter: HBC_SPACE_XL, maxWidth: null },
} as const;

// ---------------------------------------------------------------------------
// 12-column grid config
// ---------------------------------------------------------------------------
export const hbcGrid = {
  columns: 12,
  baseUnit: 4,
  gutterDefault: HBC_SPACE_LG,
} as const;

// ---------------------------------------------------------------------------
// CSS custom property generators
// ---------------------------------------------------------------------------
/** Generates CSS custom property declarations for all spacing tokens */
export function hbcSpacingCSSVars(): string {
  return Object.entries(hbcSpacing)
    .map(([key, value]) => `--hbc-space-${key}: ${value}px;`)
    .join('\n  ');
}

/** Generates a CSS media query string for a given breakpoint */
export function hbcMediaQuery(breakpoint: keyof typeof hbcBreakpoints): string {
  const bp = hbcBreakpoints[breakpoint];
  return `@media (min-width: ${bp.min}px)`;
}
