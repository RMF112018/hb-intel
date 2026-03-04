// @hbc/ui-kit — HB Intel Design System (V2.1)
// Blueprint §1d — Package barrel

// Theme system
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
  hbcLightTheme,
  hbcFieldTheme,
  hbcDarkTheme,
  keyframes,
  transitions,
  TRANSITION_FAST,
  TRANSITION_NORMAL,
  TRANSITION_SLOW,
  useAnimationStyles,
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
  displayHero,
  displayLarge,
  displayMedium,
  titleLarge,
  titleMedium,
  bodyLarge,
  bodyMedium,
  caption,
  monospace,
  hbcElevation,
  elevationRest,
  elevationHover,
  elevationRaised,
  elevationOverlay,
  elevationDialog,
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
} from './theme/index.js';
export type { HbcSemanticTokens, HbcTheme, HbcSpacingKey, HbcBreakpointConfig } from './theme/index.js';

// Icons
export * from './icons/index.js';

// Components
export { HbcStatusBadge } from './HbcStatusBadge/index.js';
export type { HbcStatusBadgeProps, StatusVariant } from './HbcStatusBadge/index.js';

export { HbcEmptyState } from './HbcEmptyState/index.js';
export type { HbcEmptyStateProps } from './HbcEmptyState/index.js';

export { HbcErrorBoundary } from './HbcErrorBoundary/index.js';
export type { HbcErrorBoundaryProps, HbcErrorBoundaryState } from './HbcErrorBoundary/index.js';

export {
  HbcTextField,
  HbcSelect,
  HbcCheckbox,
  HbcFormLayout,
} from './HbcForm/index.js';
export type {
  HbcTextFieldProps,
  HbcSelectProps,
  HbcSelectOption,
  HbcCheckboxProps,
  HbcFormLayoutProps,
} from './HbcForm/index.js';

export { HbcPanel } from './HbcPanel/index.js';
export type { HbcPanelProps, PanelSize } from './HbcPanel/index.js';

export { HbcCommandBar } from './HbcCommandBar/index.js';
export type {
  HbcCommandBarProps,
  CommandBarAction,
  CommandBarFilter,
} from './HbcCommandBar/index.js';

export { HbcDataTable } from './HbcDataTable/index.js';
export type { HbcDataTableProps } from './HbcDataTable/index.js';
export type { ColumnDef } from '@tanstack/react-table';

export { HbcChart } from './HbcChart/index.js';
export type { HbcChartProps } from './HbcChart/index.js';

export { WorkspacePageShell } from './WorkspacePageShell/index.js';
export type { WorkspacePageShellProps } from './WorkspacePageShell/index.js';
