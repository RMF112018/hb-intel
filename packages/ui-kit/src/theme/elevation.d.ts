/**
 * HB Intel Design System — V2.1 Dual-Shadow Elevation System
 * PH4.8 §Step 1 | Blueprint §1d
 *
 * 4-level dual-shadow scale: each level uses two box-shadows for natural depth.
 * Field Mode variants increase opacity by ~50% for visibility in dark environments.
 */
/** Level 0 — rest: no shadow (flat surface) */
export declare const elevationLevel0: "none";
/** Level 1 — card: subtle depth for cards, table containers */
export declare const elevationLevel1: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)";
/** Level 2 — raised: popovers, dropdowns, floating elements */
export declare const elevationLevel2: "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)";
/** Level 3 — modal: dialogs, panels, tearsheets */
export declare const elevationLevel3: "0 10px 20px rgba(0, 0, 0, 0.10), 0 6px 6px rgba(0, 0, 0, 0.08)";
/** Semantic aliases */
export declare const elevationCard: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)";
export declare const elevationModal: "0 10px 20px rgba(0, 0, 0, 0.10), 0 6px 6px rgba(0, 0, 0, 0.08)";
/** Field Mode Level 0 — still none */
export declare const elevationFieldLevel0: "none";
/** Field Mode Level 1 — card with increased opacity */
export declare const elevationFieldLevel1: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.09)";
/** Field Mode Level 2 — raised with increased opacity */
export declare const elevationFieldLevel2: "0 4px 6px rgba(0, 0, 0, 0.11), 0 2px 4px rgba(0, 0, 0, 0.09)";
/** Field Mode Level 3 — modal with increased opacity */
export declare const elevationFieldLevel3: "0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.12)";
/** Complete Field Mode elevation scale */
export declare const hbcElevationField: {
    readonly level0: "none";
    readonly level1: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.09)";
    readonly level2: "0 4px 6px rgba(0, 0, 0, 0.11), 0 2px 4px rgba(0, 0, 0, 0.09)";
    readonly level3: "0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.12)";
};
/** @deprecated Use `elevationLevel1` — maps to card shadow for backward compatibility */
export declare const elevationRest: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)";
/** @deprecated Use `elevationLevel1` */
export declare const elevationHover: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)";
/** @deprecated Use `elevationLevel2` */
export declare const elevationRaised: "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)";
/** @deprecated Use `elevationLevel2` */
export declare const elevationOverlay: "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)";
/** @deprecated Use `elevationLevel3` */
export declare const elevationDialog: "0 10px 20px rgba(0, 0, 0, 0.10), 0 6px 6px rgba(0, 0, 0, 0.08)";
/** Complete elevation scale for theme integration */
export declare const hbcElevation: {
    readonly rest: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)";
    readonly hover: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)";
    readonly raised: "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)";
    readonly overlay: "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)";
    readonly dialog: "0 10px 20px rgba(0, 0, 0, 0.10), 0 6px 6px rgba(0, 0, 0, 0.08)";
    readonly level0: "none";
    readonly level1: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)";
    readonly level2: "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)";
    readonly level3: "0 10px 20px rgba(0, 0, 0, 0.10), 0 6px 6px rgba(0, 0, 0, 0.08)";
};
//# sourceMappingURL=elevation.d.ts.map