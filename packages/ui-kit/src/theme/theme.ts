/**
 * HB Intel Design System — Light & Dark themes
 * Blueprint §1d — Fluent v9 theme with HBC semantic overrides
 */
import {
  createLightTheme,
  createDarkTheme,
  type Theme,
} from '@fluentui/react-components';
import { hbcBrandRamp, HBC_PRIMARY_BLUE, HBC_ACCENT_ORANGE, type HbcSemanticTokens } from './tokens.js';

/** Extended HBC theme type — Fluent Theme + HBC semantic tokens */
export type HbcTheme = Theme & HbcSemanticTokens;

const hbcSemanticLight: HbcSemanticTokens = {
  hbcColorBrandPrimary: HBC_PRIMARY_BLUE,
  hbcColorBrandAccent: HBC_ACCENT_ORANGE,
  hbcColorStatusSuccess: '#0E7A0D',
  hbcColorStatusWarning: '#F7A93B',
  hbcColorStatusError: '#D13438',
  hbcColorStatusInfo: '#0078D4',
  hbcColorStatusNeutral: '#605E5C',
  hbcColorSurfaceElevated: '#FFFFFF',
  hbcColorSurfaceSubtle: '#F5F5F5',
  hbcColorTextSubtle: '#605E5C',
};

const hbcSemanticDark: HbcSemanticTokens = {
  hbcColorBrandPrimary: '#337AAB',
  hbcColorBrandAccent: '#F7A93B',
  hbcColorStatusSuccess: '#57A773',
  hbcColorStatusWarning: '#F7A93B',
  hbcColorStatusError: '#E87272',
  hbcColorStatusInfo: '#6CB8F0',
  hbcColorStatusNeutral: '#A19F9D',
  hbcColorSurfaceElevated: '#2D2D2D',
  hbcColorSurfaceSubtle: '#1E1E1E',
  hbcColorTextSubtle: '#A19F9D',
};

/** HB Intel light theme — primary theme for the platform */
export const hbcLightTheme: HbcTheme = {
  ...createLightTheme(hbcBrandRamp),
  ...hbcSemanticLight,
};

/** HB Intel dark theme — defined for completeness (not MVP-critical) */
export const hbcDarkTheme: HbcTheme = {
  ...createDarkTheme(hbcBrandRamp),
  ...hbcSemanticDark,
};
