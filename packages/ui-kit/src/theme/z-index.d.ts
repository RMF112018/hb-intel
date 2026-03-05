/**
 * HB Intel Design System — Centralized Z-Index Constants
 * PH4.8 §Step 1 | Blueprint §1d
 *
 * Single source of truth for all z-index values across the design system.
 * Layers are ordered to ensure correct stacking: content < sidebar < header < popover < panel < modal < toast.
 */
/** All available z-index layer names */
export type ZIndexLayer = 'content' | 'stickyFooter' | 'sidebar' | 'header' | 'bottomNav' | 'popover' | 'panel' | 'panelBackdrop' | 'modal' | 'modalBackdrop' | 'tearsheet' | 'commandPaletteBackdrop' | 'commandPalette' | 'toast' | 'spfx' | 'connectivityBar';
/** Centralized z-index scale — import and use instead of magic numbers */
export declare const Z_INDEX: Record<ZIndexLayer, number>;
//# sourceMappingURL=z-index.d.ts.map