// Theme barrel — Blueprint §1d (HB Intel Design System)
export {
  hbcBrandRamp,
  HBC_PRIMARY_BLUE,
  HBC_ACCENT_ORANGE,
  HBC_STATUS_COLORS,
} from './tokens.js';
export type { HbcSemanticTokens } from './tokens.js';

export { hbcLightTheme, hbcDarkTheme } from './theme.js';
export type { HbcTheme } from './theme.js';

export {
  keyframes,
  transitions,
  TRANSITION_FAST,
  TRANSITION_NORMAL,
  TRANSITION_SLOW,
  useAnimationStyles,
} from './animations.js';

export {
  hbcTypeScale,
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

export {
  hbcElevation,
  elevationRest,
  elevationHover,
  elevationRaised,
  elevationOverlay,
  elevationDialog,
} from './elevation.js';
