// @hbc/ui-kit — HB Intel Design System
// Blueprint §1d — Package barrel

// Theme system
export {
  hbcBrandRamp,
  HBC_PRIMARY_BLUE,
  HBC_ACCENT_ORANGE,
  HBC_STATUS_COLORS,
  hbcLightTheme,
  hbcDarkTheme,
  keyframes,
  transitions,
  TRANSITION_FAST,
  TRANSITION_NORMAL,
  TRANSITION_SLOW,
  useAnimationStyles,
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
  hbcElevation,
  elevationRest,
  elevationHover,
  elevationRaised,
  elevationOverlay,
  elevationDialog,
} from './theme/index.js';
export type { HbcSemanticTokens, HbcTheme } from './theme/index.js';

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
