/**
 * Phase 06 Prompt 03 — PCC analytics ECharts theme.
 *
 * Reuses HB Intel brand + status tokens from `@hbc/ui-kit/theme` so chart
 * colors stay consistent with the rest of PCC. All values are literal
 * hex/string constants (sourced from token exports) because echarts
 * inlines theme values into rendered SVG output and `var(--pcc-color-*)`
 * does not resolve inside that scope.
 */

import {
  HBC_ACCENT_ORANGE,
  HBC_DARK_HEADER,
  HBC_PRIMARY_BLUE,
  HBC_STATUS_COLORS,
} from '@hbc/ui-kit/theme';

export const PCC_ANALYTICS_ECHARTS_THEME_NAME = 'pcc-analytics' as const;

const TEXT_PRIMARY = '#1B1B1B' as const;
const TEXT_MUTED = '#605E5C' as const;
const GRIDLINE = '#E1DFDD' as const;

export const PCC_ANALYTICS_SERIES_COLORS = [
  HBC_PRIMARY_BLUE,
  HBC_ACCENT_ORANGE,
  HBC_STATUS_COLORS.success,
  HBC_STATUS_COLORS.warning,
  HBC_STATUS_COLORS.error,
  HBC_STATUS_COLORS.info,
  HBC_STATUS_COLORS.neutral,
  HBC_DARK_HEADER,
] as const;

export const PCC_ANALYTICS_TONE_COLORS = {
  neutral: HBC_STATUS_COLORS.neutral,
  info: HBC_STATUS_COLORS.info,
  success: HBC_STATUS_COLORS.success,
  warning: HBC_STATUS_COLORS.warning,
  danger: HBC_STATUS_COLORS.error,
} as const;

export const PCC_ANALYTICS_THEME = {
  color: [...PCC_ANALYTICS_SERIES_COLORS],
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
    color: TEXT_PRIMARY,
  },
  title: {
    textStyle: {
      color: TEXT_PRIMARY,
      fontWeight: 600,
    },
  },
  legend: {
    textStyle: {
      color: TEXT_MUTED,
    },
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: GRIDLINE } },
    axisTick: { lineStyle: { color: GRIDLINE } },
    axisLabel: { color: TEXT_MUTED },
    splitLine: { lineStyle: { color: GRIDLINE } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: GRIDLINE } },
    axisTick: { lineStyle: { color: GRIDLINE } },
    axisLabel: { color: TEXT_MUTED },
    splitLine: { lineStyle: { color: GRIDLINE } },
  },
  tooltip: {
    backgroundColor: '#FFFFFF',
    borderColor: GRIDLINE,
    textStyle: { color: TEXT_PRIMARY },
  },
} as const;
