/**
 * HB Intel Design System — Brand tokens & semantic colors
 * Blueprint §1d — Signature color palette derived from HB logos
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

/** Semantic status colors for badges, indicators, and alerts */
export const HBC_STATUS_COLORS = {
  success: '#0E7A0D',
  warning: '#F7A93B',
  error: '#D13438',
  info: '#0078D4',
  neutral: '#605E5C',
  onTrack: '#0E7A0D',
  atRisk: '#F7A93B',
  critical: '#D13438',
  pending: '#8A8886',
  inProgress: '#0078D4',
  completed: '#0E7A0D',
  draft: '#A19F9D',
} as const;

/** Extended semantic tokens for the HB Intel design system */
export interface HbcSemanticTokens {
  hbcColorBrandPrimary: string;
  hbcColorBrandAccent: string;
  hbcColorStatusSuccess: string;
  hbcColorStatusWarning: string;
  hbcColorStatusError: string;
  hbcColorStatusInfo: string;
  hbcColorStatusNeutral: string;
  hbcColorSurfaceElevated: string;
  hbcColorSurfaceSubtle: string;
  hbcColorTextSubtle: string;
}
