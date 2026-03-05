/**
 * HB Intel Design System — Light, Field Mode & Dark themes (V2.1)
 * Blueprint §1d — Fluent v9 theme with HBC semantic overrides
 * PH4.3 §3.1 — Warm off-white surfaces, sunlight-optimized Field Mode
 */
import { createLightTheme, createDarkTheme, } from '@fluentui/react-components';
import { hbcBrandRamp, HBC_PRIMARY_BLUE, HBC_ACCENT_ORANGE, HBC_STATUS_COLORS, HBC_SURFACE_LIGHT, HBC_SURFACE_FIELD, HBC_DARK_HEADER, HBC_HEADER_TEXT, HBC_HEADER_ICON_MUTED, HBC_CONNECTIVITY, } from './tokens.js';
// ---------------------------------------------------------------------------
// Light theme semantic tokens (V2.1)
// ---------------------------------------------------------------------------
const hbcSemanticLight = {
    // Brand
    hbcColorBrandPrimary: HBC_PRIMARY_BLUE,
    hbcColorBrandAccent: HBC_ACCENT_ORANGE,
    // Status (V2.1 sunlight-optimized)
    hbcColorStatusSuccess: HBC_STATUS_COLORS.success,
    hbcColorStatusWarning: HBC_STATUS_COLORS.warning,
    hbcColorStatusError: HBC_STATUS_COLORS.error,
    hbcColorStatusInfo: HBC_STATUS_COLORS.info,
    hbcColorStatusNeutral: HBC_STATUS_COLORS.neutral,
    // Surfaces
    hbcColorSurface0: HBC_SURFACE_LIGHT['surface-0'],
    hbcColorSurface1: HBC_SURFACE_LIGHT['surface-1'],
    hbcColorSurface2: HBC_SURFACE_LIGHT['surface-2'],
    hbcColorSurface3: HBC_SURFACE_LIGHT['surface-3'],
    hbcColorSurfaceElevated: HBC_SURFACE_LIGHT['surface-0'],
    hbcColorSurfaceSubtle: HBC_SURFACE_LIGHT['surface-1'],
    // Borders
    hbcColorBorderDefault: HBC_SURFACE_LIGHT['border-default'],
    hbcColorBorderFocus: HBC_SURFACE_LIGHT['border-focus'],
    // Text
    hbcColorTextPrimary: HBC_SURFACE_LIGHT['text-primary'],
    hbcColorTextMuted: HBC_SURFACE_LIGHT['text-muted'],
    hbcColorTextSubtle: HBC_SURFACE_LIGHT['text-muted'],
    // Header
    hbcColorHeaderBg: HBC_DARK_HEADER,
    hbcColorHeaderText: HBC_HEADER_TEXT,
    hbcColorHeaderIconMuted: HBC_HEADER_ICON_MUTED,
    // Connectivity
    hbcColorConnOnline: HBC_CONNECTIVITY.online,
    hbcColorConnSyncing: HBC_CONNECTIVITY.syncing,
    hbcColorConnOffline: HBC_CONNECTIVITY.offline,
    // Responsibility
    hbcColorResponsibilityBg: HBC_SURFACE_LIGHT['responsibility-bg'],
};
// ---------------------------------------------------------------------------
// Field Mode semantic tokens (V2.1)
// ---------------------------------------------------------------------------
const hbcSemanticField = {
    // Brand (lighter variants for dark bg)
    hbcColorBrandPrimary: '#337AAB',
    hbcColorBrandAccent: '#F7A93B',
    // Status (same V2.1 values — high contrast on dark)
    hbcColorStatusSuccess: HBC_STATUS_COLORS.success,
    hbcColorStatusWarning: HBC_STATUS_COLORS.warning,
    hbcColorStatusError: HBC_STATUS_COLORS.error,
    hbcColorStatusInfo: HBC_STATUS_COLORS.info,
    hbcColorStatusNeutral: HBC_STATUS_COLORS.neutral,
    // Surfaces
    hbcColorSurface0: HBC_SURFACE_FIELD['surface-0'],
    hbcColorSurface1: HBC_SURFACE_FIELD['surface-1'],
    hbcColorSurface2: HBC_SURFACE_FIELD['surface-2'],
    hbcColorSurface3: HBC_SURFACE_FIELD['surface-3'],
    hbcColorSurfaceElevated: HBC_SURFACE_FIELD['surface-1'],
    hbcColorSurfaceSubtle: HBC_SURFACE_FIELD['surface-0'],
    // Borders
    hbcColorBorderDefault: HBC_SURFACE_FIELD['border-default'],
    hbcColorBorderFocus: HBC_SURFACE_FIELD['border-focus'],
    // Text
    hbcColorTextPrimary: HBC_SURFACE_FIELD['text-primary'],
    hbcColorTextMuted: HBC_SURFACE_FIELD['text-muted'],
    hbcColorTextSubtle: HBC_SURFACE_FIELD['text-muted'],
    // Header
    hbcColorHeaderBg: '#0A0E14',
    hbcColorHeaderText: HBC_HEADER_TEXT,
    hbcColorHeaderIconMuted: '#6B7280',
    // Connectivity
    hbcColorConnOnline: HBC_CONNECTIVITY.online,
    hbcColorConnSyncing: HBC_CONNECTIVITY.syncing,
    hbcColorConnOffline: HBC_CONNECTIVITY.offline,
    // Responsibility
    hbcColorResponsibilityBg: HBC_SURFACE_FIELD['responsibility-bg'],
};
// ---------------------------------------------------------------------------
// Assembled themes
// ---------------------------------------------------------------------------
/** HB Intel light theme — primary theme for the platform (V2.1 warm off-white) */
export const hbcLightTheme = {
    ...createLightTheme(hbcBrandRamp),
    // V2.1 warm off-white surface overrides
    colorNeutralBackground1: '#FFFFFF',
    colorNeutralBackground2: '#FAFBFC',
    colorNeutralBackground3: '#F0F2F5',
    ...hbcSemanticLight,
};
/** HB Intel Field Mode theme — high-contrast dark for jobsite/sunlight use (V2.1) */
export const hbcFieldTheme = {
    ...createDarkTheme(hbcBrandRamp),
    // V2.1 Field Mode surface overrides
    colorNeutralBackground1: '#1A2332',
    colorNeutralBackground2: '#0F1419',
    colorNeutralBackground3: '#243040',
    ...hbcSemanticField,
};
/** @deprecated Use hbcFieldTheme — kept as alias for backward compatibility */
export const hbcDarkTheme = hbcFieldTheme;
//# sourceMappingURL=theme.js.map