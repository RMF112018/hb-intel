/**
 * Shell chrome layout constants — canonical source (W01r-P03)
 *
 * These are app-shell layout dimensions used for offset calculations by
 * HbcHeader, HbcSidebar, HbcAppShell, HbcBottomNav, and WorkspacePageShell.
 *
 * They are NOT design tokens. They represent physical shell chrome dimensions
 * and belong in the app-shell boundary, not the theme/token system.
 */

/** Fixed header height in pixels */
export const HBC_HEADER_HEIGHT = 56;

/** Connectivity bar height when online (thin indicator) */
export const HBC_CONNECTIVITY_HEIGHT_ONLINE = 2;

/** Connectivity bar height when offline (expanded warning) */
export const HBC_CONNECTIVITY_HEIGHT_OFFLINE = 4;

/** Sidebar width when collapsed (icon-only rail) */
export const HBC_SIDEBAR_WIDTH_COLLAPSED = 56;

/** Sidebar width when fully expanded */
export const HBC_SIDEBAR_WIDTH_EXPANDED = 240;

/** Bottom navigation bar height (mobile) */
export const HBC_BOTTOM_NAV_HEIGHT = 56;
