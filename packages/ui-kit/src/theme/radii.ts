/**
 * HB Intel Design System — Border-radius tokens (V2.1.1)
 * WS1-T03 — Intent-based radius scale for normalized shape language.
 *
 * Intent model:
 *   none  — Data-dense surfaces where every pixel counts (tables, dense lists)
 *   sm    — Tight inline elements (inline badges, score segments, small tags)
 *   md    — Interactive controls (buttons, inputs, search, pagination)
 *   lg    — Containers with moderate rounding (toasts, toolbars, sub-panels)
 *   xl    — Cards, modals, popovers, photos, drawing viewer
 *   full  — Circular elements (FABs, spinners, avatars, radio indicators)
 */

export const HBC_RADIUS_NONE = '0px' as const;
export const HBC_RADIUS_SM = '2px' as const;
export const HBC_RADIUS_MD = '4px' as const;
export const HBC_RADIUS_LG = '6px' as const;
export const HBC_RADIUS_XL = '8px' as const;
export const HBC_RADIUS_FULL = '50%' as const;

export const hbcRadii = {
  none: HBC_RADIUS_NONE,
  sm: HBC_RADIUS_SM,
  md: HBC_RADIUS_MD,
  lg: HBC_RADIUS_LG,
  xl: HBC_RADIUS_XL,
  full: HBC_RADIUS_FULL,
} as const;

export type HbcRadiusKey = keyof typeof hbcRadii;
