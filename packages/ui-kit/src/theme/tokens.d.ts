/**
 * HB Intel Design System — Brand tokens & semantic colors (V2.1)
 * Blueprint §1d — Signature color palette derived from HB logos
 * PH4.3 §3.1 — Sunlight-optimized status ramps for field/jobsite use
 *
 * HB Blue Primary: #004B87 (dominant logo background)
 * HB Orange Accent: #F37021 (highlighted square element)
 */
import type { BrandVariants } from '@fluentui/react-components';
/**
 * 16-shade brand ramp generated via HSL lightness interpolation from #004B87.
 * Shade 80 = the primary brand color.
 */
export declare const hbcBrandRamp: BrandVariants;
/** HB Intel primary blue — logo background color */
export declare const HBC_PRIMARY_BLUE: "#004B87";
/** HB Intel accent orange — CTA and active state color */
export declare const HBC_ACCENT_ORANGE: "#F37021";
/** Dark header background */
export declare const HBC_DARK_HEADER: "#1E1E1E";
/** Header text color */
export declare const HBC_HEADER_TEXT: "#FFFFFF";
/** Header muted icon color */
export declare const HBC_HEADER_ICON_MUTED: "#A0A0A0";
/** Semantic status colors for badges, indicators, and alerts (V2.1) */
export declare const HBC_STATUS_COLORS: {
    readonly success: "#00C896";
    readonly warning: "#FFB020";
    readonly error: "#FF4D4D";
    readonly info: "#3B9FFF";
    readonly neutral: "#8B95A5";
    readonly onTrack: "#00C896";
    readonly atRisk: "#FFB020";
    readonly critical: "#FF4D4D";
    readonly pending: "#8B95A5";
    readonly inProgress: "#3B9FFF";
    readonly completed: "#00C896";
    readonly draft: "#8B95A5";
};
export declare const HBC_STATUS_RAMP_GREEN: {
    readonly 10: "#003D2E";
    readonly 30: "#007A5C";
    readonly 50: "#00C896";
    readonly 70: "#66DDB8";
    readonly 90: "#CCF3E6";
};
export declare const HBC_STATUS_RAMP_RED: {
    readonly 10: "#4D0000";
    readonly 30: "#B30000";
    readonly 50: "#FF4D4D";
    readonly 70: "#FF9999";
    readonly 90: "#FFE0E0";
};
export declare const HBC_STATUS_RAMP_AMBER: {
    readonly 10: "#4D3300";
    readonly 30: "#996600";
    readonly 50: "#FFB020";
    readonly 70: "#FFD07A";
    readonly 90: "#FFF0D4";
};
export declare const HBC_STATUS_RAMP_INFO: {
    readonly 10: "#001A4D";
    readonly 30: "#0050B3";
    readonly 50: "#3B9FFF";
    readonly 70: "#8CC5FF";
    readonly 90: "#DCE9FF";
};
export declare const HBC_STATUS_RAMP_GRAY: {
    readonly 10: "#1A1D23";
    readonly 30: "#4A5060";
    readonly 50: "#8B95A5";
    readonly 70: "#B8BFC9";
    readonly 90: "#E8EAED";
};
export declare const HBC_SURFACE_LIGHT: {
    readonly 'surface-0': "#FFFFFF";
    readonly 'surface-1': "#FAFBFC";
    readonly 'surface-2': "#F0F2F5";
    readonly 'surface-3': "#E4E7EB";
    readonly 'border-default': "#D1D5DB";
    readonly 'border-focus': "#004B87";
    readonly 'text-primary': "#1A1D23";
    readonly 'text-muted': "#6B7280";
    readonly 'responsibility-bg': "#F0F7FF";
};
export declare const HBC_SURFACE_FIELD: {
    readonly 'surface-0': "#0F1419";
    readonly 'surface-1': "#1A2332";
    readonly 'surface-2': "#243040";
    readonly 'surface-3': "#2E3D50";
    readonly 'border-default': "#3A4A5C";
    readonly 'border-focus': "#337AAB";
    readonly 'text-primary': "#E8EAED";
    readonly 'text-muted': "#8B95A5";
    readonly 'responsibility-bg': "#1A2A3D";
};
export declare const HBC_CONNECTIVITY: {
    readonly online: "#00C896";
    readonly syncing: "#FFB020";
    readonly offline: "#FF4D4D";
};
/** Extended semantic tokens for the HB Intel design system (V2.1) */
export interface HbcSemanticTokens {
    hbcColorBrandPrimary: string;
    hbcColorBrandAccent: string;
    hbcColorStatusSuccess: string;
    hbcColorStatusWarning: string;
    hbcColorStatusError: string;
    hbcColorStatusInfo: string;
    hbcColorStatusNeutral: string;
    hbcColorSurface0: string;
    hbcColorSurface1: string;
    hbcColorSurface2: string;
    hbcColorSurface3: string;
    /** @deprecated Use hbcColorSurface0 */
    hbcColorSurfaceElevated: string;
    /** @deprecated Use hbcColorSurface1 */
    hbcColorSurfaceSubtle: string;
    hbcColorBorderDefault: string;
    hbcColorBorderFocus: string;
    hbcColorTextPrimary: string;
    hbcColorTextMuted: string;
    /** @deprecated Use hbcColorTextMuted */
    hbcColorTextSubtle: string;
    hbcColorHeaderBg: string;
    hbcColorHeaderText: string;
    hbcColorHeaderIconMuted: string;
    hbcColorConnOnline: string;
    hbcColorConnSyncing: string;
    hbcColorConnOffline: string;
    hbcColorResponsibilityBg: string;
}
//# sourceMappingURL=tokens.d.ts.map