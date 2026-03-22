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
export const hbcBrandRamp: BrandVariants = {
  10: '#001A2F',
  20: '#002540',
  30: '#003052',
  40: '#003B63',
  50: '#004575',
  60: '#004B87',
  70: '#1A6399',
  80: '#337AAB',
  90: '#4D92BD',
  100: '#66A9CF',
  110: '#80C0E0',
  120: '#99D1EA',
  130: '#B3E0F2',
  140: '#CCEDFA',
  150: '#E6F6FD',
  160: '#F5FBFF',
};

/** HB Intel primary blue — logo background color */
export const HBC_PRIMARY_BLUE = '#004B87' as const;

/** HB Intel accent orange — CTA and active state color */
export const HBC_ACCENT_ORANGE = '#F37021' as const;

// ---------------------------------------------------------------------------
// Header tokens (V2.1)
// ---------------------------------------------------------------------------
/** Dark header background */
export const HBC_DARK_HEADER = '#1E1E1E' as const;
/** Header text color */
export const HBC_HEADER_TEXT = '#FFFFFF' as const;
/** Header muted icon color */
export const HBC_HEADER_ICON_MUTED = '#A0A0A0' as const;

// Shell chrome dimensions — single source of truth for all shell offset calculations.
// Used by HbcHeader, HbcAppShell, HbcSidebar, HbcBottomNav, WorkspacePageShell.
/** Fixed header bar height (px) */
export const HBC_HEADER_HEIGHT = 56;
/** Connectivity bar height when online (px) */
export const HBC_CONNECTIVITY_HEIGHT_ONLINE = 2;
/** Connectivity bar height when offline/syncing (px) */
export const HBC_CONNECTIVITY_HEIGHT_OFFLINE = 4;
/** Sidebar collapsed (icon rail) width (px) */
export const HBC_SIDEBAR_WIDTH_COLLAPSED = 56;
/** Sidebar expanded width (px) */
export const HBC_SIDEBAR_WIDTH_EXPANDED = 240;
/** Bottom navigation bar height (px) */
export const HBC_BOTTOM_NAV_HEIGHT = 56;

// ---------------------------------------------------------------------------
// V2.1 Sunlight-optimized status colors
// ---------------------------------------------------------------------------
/** Semantic status colors for badges, indicators, and alerts (V2.1) */
export const HBC_STATUS_COLORS = {
  success: '#00C896',
  warning: '#FFB020',
  error: '#FF4D4D',
  info: '#3B9FFF',
  neutral: '#8B95A5',
  onTrack: '#00C896',
  atRisk: '#FFB020',
  critical: '#FF4D4D',
  pending: '#8B95A5',
  inProgress: '#3B9FFF',
  completed: '#00C896',
  draft: '#8B95A5',
} as const;

// ---------------------------------------------------------------------------
// HSL status ramps (lightness levels: 10 / 30 / 50 / 70 / 90)
// ---------------------------------------------------------------------------
export const HBC_STATUS_RAMP_GREEN = {
  10: '#003D2E',
  30: '#007A5C',
  50: '#00C896',
  70: '#66DDB8',
  90: '#CCF3E6',
} as const;

export const HBC_STATUS_RAMP_RED = {
  10: '#4D0000',
  30: '#B30000',
  50: '#FF4D4D',
  70: '#FF9999',
  90: '#FFE0E0',
} as const;

export const HBC_STATUS_RAMP_AMBER = {
  10: '#4D3300',
  30: '#996600',
  50: '#FFB020',
  70: '#FFD07A',
  90: '#FFF0D4',
} as const;

export const HBC_STATUS_RAMP_INFO = {
  10: '#001A4D',
  30: '#0050B3',
  50: '#3B9FFF',
  70: '#8CC5FF',
  90: '#DCE9FF',
} as const;

export const HBC_STATUS_RAMP_GRAY = {
  10: '#1A1D23',
  30: '#4A5060',
  50: '#8B95A5',
  70: '#B8BFC9',
  90: '#E8EAED',
} as const;

// ---------------------------------------------------------------------------
// Surface tokens — Light mode
// ---------------------------------------------------------------------------
export const HBC_SURFACE_LIGHT = {
  'surface-0': '#FFFFFF',
  'surface-1': '#FAFBFC',
  'surface-2': '#F0F2F5',
  'surface-3': '#E4E7EB',
  'border-default': '#D1D5DB',
  'border-focus': '#004B87',
  'text-primary': '#1A1D23',
  'text-muted': '#6B7280',
  'responsibility-bg': '#F0F7FF',
  'surface-active': '#E8F1F8',
  'destructive-bg': '#FEE2E2',
  'destructive-text': '#991B1B',
  'destructive-bg-hover': '#FECACA',
} as const;

// ---------------------------------------------------------------------------
// Surface tokens — Field Mode (dark)
// ---------------------------------------------------------------------------
export const HBC_SURFACE_FIELD = {
  'surface-0': '#0F1419',
  'surface-1': '#1A2332',
  'surface-2': '#243040',
  'surface-3': '#2E3D50',
  'border-default': '#3A4A5C',
  'border-focus': '#337AAB',
  'text-primary': '#E8EAED',
  'text-muted': '#8B95A5',
  'responsibility-bg': '#1A2A3D',
  'surface-active': '#1E3A5F',
  'destructive-bg': '#4D0000',
  'destructive-text': '#FF9999',
  'destructive-bg-hover': '#5C0000',
} as const;

// ---------------------------------------------------------------------------
// Semantic action-green token (INS-002)
// Reuses HBC_STATUS_RAMP_GREEN[50] — named distinctly for intent clarity.
// Green = "clear to proceed" in construction-ops culture.
// ---------------------------------------------------------------------------
/** Action Now card accent — go-forward, ready-to-act momentum */
export const HBC_STATUS_ACTION_GREEN = '#00C896' as const;

// ---------------------------------------------------------------------------
// Brand-action CTA tokens (UIF-007)
// Primary CTA buttons use brand-ramp blue, distinct from all status tokens.
// ---------------------------------------------------------------------------
/** Brand-action CTA — rest state (brandRamp[80]) */
export const HBC_BRAND_ACTION = '#337AAB' as const;
/** Brand-action CTA — hover state (brandRamp[70]) */
export const HBC_BRAND_ACTION_HOVER = '#1A6399' as const;
/** Brand-action CTA — pressed state (brandRamp[60] = primary blue) */
export const HBC_BRAND_ACTION_PRESSED = '#004B87' as const;

// ---------------------------------------------------------------------------
// Interactive state constants (V2.1.1 — WS1-T03)
// ---------------------------------------------------------------------------
/** Accent orange hover state — darkened variant of HBC_ACCENT_ORANGE */
export const HBC_ACCENT_ORANGE_HOVER = '#E06018' as const;
/** Accent orange pressed state */
export const HBC_ACCENT_ORANGE_PRESSED = '#BF5516' as const;
/** Danger/error hover state */
export const HBC_DANGER_HOVER = '#E04444' as const;
/** Danger/error pressed state */
export const HBC_DANGER_PRESSED = '#CC3C3C' as const;

// ---------------------------------------------------------------------------
// Connectivity bar colors
// ---------------------------------------------------------------------------
export const HBC_CONNECTIVITY = {
  online: '#00C896',
  syncing: '#FFB020',
  offline: '#FF4D4D',
} as const;

// ---------------------------------------------------------------------------
// Extended semantic tokens interface (V2.1)
// ---------------------------------------------------------------------------
/** Extended semantic tokens for the HB Intel design system (V2.1) */
export interface HbcSemanticTokens {
  // Brand
  hbcColorBrandPrimary: string;
  hbcColorBrandAccent: string;
  // Status
  hbcColorStatusSuccess: string;
  hbcColorStatusWarning: string;
  hbcColorStatusError: string;
  hbcColorStatusInfo: string;
  hbcColorStatusNeutral: string;
  // Surfaces
  hbcColorSurface0: string;
  hbcColorSurface1: string;
  hbcColorSurface2: string;
  hbcColorSurface3: string;
  /**
   * @deprecated D-PH4C-03/D-PH4C-04 (Phase 4C.3, 2026-03-07).
   * Scan-gated status: 45 references found across packages/apps/docs, so this token is versioned (not removed).
   * Replacement guidance: use `hbcColorSurface0` for elevated/default surfaces.
   * Timeline: deprecated in PH4C, migration in PH5, removal target PH6+ after migration completion.
   * Tracking issue: PH4C-DEPRECATED-TOKENS-001 (placeholder).
   * @since 1.0.0
   * @version 1.0.0-deprecated.2026-03-07
   */
  hbcColorSurfaceElevated: string;
  /**
   * @deprecated D-PH4C-03/D-PH4C-04 (Phase 4C.3, 2026-03-07).
   * Scan-gated status: 41 references found across packages/apps/docs, so this token is versioned (not removed).
   * Replacement guidance: use `hbcColorSurface1` for subtle container surfaces.
   * Timeline: deprecated in PH4C, migration in PH5, removal target PH6+ after migration completion.
   * Tracking issue: PH4C-DEPRECATED-TOKENS-002 (placeholder).
   * @since 1.0.0
   * @version 1.0.0-deprecated.2026-03-07
   */
  hbcColorSurfaceSubtle: string;
  // Borders
  hbcColorBorderDefault: string;
  hbcColorBorderFocus: string;
  // Text
  hbcColorTextPrimary: string;
  hbcColorTextMuted: string;
  /**
   * @deprecated D-PH4C-03/D-PH4C-04 (Phase 4C.3, 2026-03-07).
   * Scan-gated status: 38 references found across packages/apps/docs, so this token is versioned (not removed).
   * Replacement guidance: use `hbcColorTextMuted` for secondary/subdued text treatment.
   * Timeline: deprecated in PH4C, migration in PH5, removal target PH6+ after migration completion.
   * Tracking issue: PH4C-DEPRECATED-TOKENS-003 (placeholder).
   * @since 1.0.0
   * @version 1.0.0-deprecated.2026-03-07
   */
  hbcColorTextSubtle: string;
  // Header
  hbcColorHeaderBg: string;
  hbcColorHeaderText: string;
  hbcColorHeaderIconMuted: string;
  // Connectivity
  hbcColorConnOnline: string;
  hbcColorConnSyncing: string;
  hbcColorConnOffline: string;
  // Responsibility
  hbcColorResponsibilityBg: string;
}

// ---------------------------------------------------------------------------
// Surface roles (V2.1.1 — WS1-T03)
// Typed reference map: documents which token combinations constitute each role.
// Components are not required to consume this programmatically; its primary
// value is as a documented contract for consistent surface treatment.
// ---------------------------------------------------------------------------
export const HBC_SURFACE_ROLES = {
  baseCanvas: {
    background: 'hbcColorSurface0',
    text: 'hbcColorTextPrimary',
    border: 'hbcColorBorderDefault',
    elevation: 'elevationLevel0',
    radius: 'none',
  },
  secondaryCanvas: {
    background: 'hbcColorSurface1',
    text: 'hbcColorTextPrimary',
    border: 'hbcColorBorderDefault',
    elevation: 'elevationLevel0',
    radius: 'none',
  },
  cards: {
    background: 'hbcColorSurface0',
    text: 'hbcColorTextPrimary',
    border: 'hbcColorBorderDefault',
    elevation: 'elevationLevel1',
    radius: 'xl',
  },
  insetPanels: {
    background: 'hbcColorSurface2',
    text: 'hbcColorTextPrimary',
    border: 'hbcColorBorderDefault',
    elevation: 'elevationLevel0',
    radius: 'lg',
  },
  toolbars: {
    background: 'hbcColorSurface1',
    text: 'hbcColorTextPrimary',
    border: 'hbcColorBorderDefault',
    elevation: 'elevationLevel0',
    radius: 'none',
  },
  overlays: {
    background: 'hbcColorSurface0',
    text: 'hbcColorTextPrimary',
    border: 'hbcColorBorderDefault',
    elevation: 'elevationLevel3',
    radius: 'xl',
  },
  focusedWorkZones: {
    background: 'hbcColorSurface0',
    text: 'hbcColorTextPrimary',
    border: 'hbcColorBorderFocus',
    elevation: 'elevationLevel2',
    radius: 'xl',
  },
} as const;
