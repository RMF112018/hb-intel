/**
 * HB Intel Design System — Centralized Z-Index Constants
 * PH4.8 §Step 1 | Blueprint §1d
 *
 * Single source of truth for all z-index values across the design system.
 * Layers are ordered to ensure correct stacking: content < sidebar < header < popover < panel < modal < toast.
 */
/** Centralized z-index scale — import and use instead of magic numbers */
export const Z_INDEX = {
    /** Page content: 0–99 */
    content: 0,
    /** PH4.11 — Sticky form footer: above content, below sidebar */
    stickyFooter: 50,
    /** Sidebar navigation */
    sidebar: 100,
    /** Fixed header bar */
    header: 200,
    /** Bottom navigation bar (mobile/tablet) — PH4.14.5 */
    bottomNav: 300,
    /** Popovers, dropdowns, flyouts */
    popover: 1000,
    /** Slide-in panel backdrop */
    panelBackdrop: 1099,
    /** Slide-in panel */
    panel: 1100,
    /** Modal/tearsheet backdrop */
    modalBackdrop: 1199,
    /** Modal dialogs and tearsheets */
    modal: 1200,
    /** Alias for modal — tearsheets share the same layer */
    tearsheet: 1200,
    /** Command palette backdrop */
    commandPaletteBackdrop: 1249,
    /** Command palette overlay */
    commandPalette: 1250,
    /** Toast notifications */
    toast: 1300,
    /** SPFx host layer */
    spfx: 10000,
    /** Connectivity bar — always on top */
    connectivityBar: 10001,
};
//# sourceMappingURL=z-index.js.map