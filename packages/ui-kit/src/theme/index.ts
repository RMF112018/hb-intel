// Theme barrel — Blueprint §1d (HB Intel Design System V2.1)

// Tokens
export {
  hbcBrandRamp,
  HBC_PRIMARY_BLUE,
  HBC_ACCENT_ORANGE,
  HBC_STATUS_COLORS,
  HBC_DARK_HEADER,
  HBC_HEADER_TEXT,
  HBC_HEADER_ICON_MUTED,
  HBC_STATUS_RAMP_GREEN,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_AMBER,
  HBC_STATUS_RAMP_INFO,
  HBC_STATUS_RAMP_GRAY,
  HBC_SURFACE_LIGHT,
  HBC_SURFACE_FIELD,
  HBC_CONNECTIVITY,
} from './tokens.js';
export type { HbcSemanticTokens } from './tokens.js';

// Themes
export { hbcLightTheme, hbcFieldTheme, hbcDarkTheme } from './theme.js';
export type { HbcTheme } from './theme.js';

// Animations
export {
  keyframes,
  transitions,
  TRANSITION_FAST,
  TRANSITION_NORMAL,
  TRANSITION_SLOW,
  TIMING,
  useAnimationStyles,
  useReducedMotionStyles,
} from './animations.js';

// Typography (V2.1 intent-based + deprecated aliases)
export {
  hbcTypeScale,
  display,
  heading1,
  heading2,
  heading3,
  heading4,
  body,
  bodySmall,
  label,
  code,
  // Deprecated aliases
  displayHero,
  displayLarge,
  displayMedium,
  titleLarge,
  titleMedium,
  bodyLarge,
  bodyMedium,
  caption,
  monospace,
} from './typography.js';

// Elevation (V2.1 dual-shadow + deprecated aliases)
export {
  hbcElevation,
  elevationLevel0,
  elevationLevel1,
  elevationLevel2,
  elevationLevel3,
  elevationCard,
  elevationModal,
  hbcElevationField,
  elevationFieldLevel0,
  elevationFieldLevel1,
  elevationFieldLevel2,
  elevationFieldLevel3,
  // Deprecated aliases
  elevationRest,
  elevationHover,
  elevationRaised,
  elevationOverlay,
  elevationDialog,
} from './elevation.js';

// Z-Index
export { Z_INDEX } from './z-index.js';
export type { ZIndexLayer } from './z-index.js';

// Grid & spacing
export {
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
  HBC_SPACE_XL,
  HBC_SPACE_XXL,
  hbcSpacing,
  BREAKPOINT_MOBILE,
  BREAKPOINT_TABLET,
  BREAKPOINT_DESKTOP,
  BREAKPOINT_WIDE,
  hbcBreakpoints,
  hbcGrid,
  hbcSpacingCSSVars,
  hbcMediaQuery,
} from './grid.js';
export type { HbcSpacingKey, HbcBreakpointConfig } from './grid.js';

// Density (V2.1)
export {
  detectDensityTier,
  persistDensityOverride,
  getDensityOverride,
  clearDensityOverride,
  DENSITY_BREAKPOINTS,
} from './density.js';
export type { DensityTier } from './density.js';

// Canonical hooks (V2.1)
export { useHbcTheme } from './useHbcTheme.js';
export type { UseHbcThemeReturn } from './useHbcTheme.js';
export { useConnectivity } from './useConnectivity.js';
export { useDensity } from './useDensity.js';
export type { UseDensityReturn } from './useDensity.js';
