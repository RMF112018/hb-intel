/**
 * Canonical responsive breakpoints for PH4C.12 dead-zone remediation.
 * Traceability: D-PH4C-24, D-PH4C-25 | Blueprint §2c | Foundation Plan PH4.14.5 / PH4B.10
 */

/** <=767px: full mobile; field-mode-first navigation surface. */
export const HBC_BREAKPOINT_MOBILE = 767;

/** <=1023px: tablet range where bottom navigation replaces sidebar. */
export const HBC_BREAKPOINT_TABLET = 1023;

/** >=1024px: sidebar-eligible desktop boundary. */
export const HBC_BREAKPOINT_SIDEBAR = 1024;

/** <=1199px: medium content reflow threshold for dashboard/tool landing grids. */
export const HBC_BREAKPOINT_CONTENT_MEDIUM = 1199;

/** >=1440px: compact density threshold for fine pointers. */
export const HBC_BREAKPOINT_COMPACT_DENSITY = 1440;
