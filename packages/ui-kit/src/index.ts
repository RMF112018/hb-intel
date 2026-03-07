/**
 * @hbc/ui-kit — HB Intel Design System V2.1
 * Blueprint §1d | PH4.16 §Step 9
 *
 * Unified component library for the HB Intel construction intelligence platform.
 * Supports PWA (Next.js 14) and SPFx (SharePoint Framework) dual-target rendering.
 *
 * @version 2.1.0
 * @see docs/reference/ui-kit/ for per-component documentation
 */

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
  TIMING,
  useAnimationStyles,
  useReducedMotionStyles,
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
  elevationRest,
  elevationHover,
  elevationRaised,
  elevationOverlay,
  elevationDialog,
  Z_INDEX,
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
// PH4C.12 traceability: D-PH4C-24 / D-PH4C-25 canonical breakpoints are exported for package consumers.
export {
  HBC_BREAKPOINT_MOBILE,
  HBC_BREAKPOINT_TABLET,
  HBC_BREAKPOINT_SIDEBAR,
  HBC_BREAKPOINT_CONTENT_MEDIUM,
  HBC_BREAKPOINT_COMPACT_DENSITY,
} from './theme/breakpoints.js';
export type { HbcSemanticTokens, HbcTheme, HbcSpacingKey, HbcBreakpointConfig, ZIndexLayer } from './theme/index.js';

// Theme V2.1 — Density & canonical hooks
export {
  detectDensityTier,
  persistDensityOverride,
  getDensityOverride,
  clearDensityOverride,
  DENSITY_BREAKPOINTS,
  useHbcTheme,
  useConnectivity,
  useDensity,
} from './theme/index.js';
export type { DensityTier, UseHbcThemeReturn, UseDensityReturn } from './theme/index.js';

// Icons
export * from './icons/index.js';

// Components
export { HbcStatusBadge } from './HbcStatusBadge/index.js';
export type { HbcStatusBadgeProps, StatusVariant } from './HbcStatusBadge/index.js';
export { HbcPeoplePicker } from './HbcPeoplePicker.js';
export type { HbcPeoplePickerProps } from './HbcPeoplePicker.js';
export {
  ProvisioningNotificationBanner,
} from './components/ProvisioningNotificationBanner/index.js';
export type {
  IProvisioningNotificationBannerProps,
  ProvisioningNotificationVariant,
} from './components/ProvisioningNotificationBanner/index.js';

export { HbcEmptyState } from './HbcEmptyState/index.js';
export type { HbcEmptyStateProps } from './HbcEmptyState/index.js';

export { HbcErrorBoundary } from './HbcErrorBoundary/index.js';
export type { HbcErrorBoundaryProps, HbcErrorBoundaryState } from './HbcErrorBoundary/index.js';

export {
  HbcTextField,
  HbcSelect,
  HbcCheckbox,
  HbcFormLayout,
  HbcForm,
  HbcFormSection,
  HbcFormRow,
  HbcStickyFormFooter,
  useHbcFormContext,
  HbcFormGuard,
  useFormGuardContext,
} from './HbcForm/index.js';
export type {
  HbcTextFieldProps,
  HbcSelectProps,
  HbcSelectOption,
  HbcCheckboxProps,
  HbcFormLayoutProps,
  HbcFormProps,
  HbcFormSectionProps,
  HbcFormRowProps,
  HbcStickyFormFooterProps,
  HbcFormContextValue,
  FormFieldError,
  HbcFormGuardProps,
  HbcFormGuardContextValue,
} from './HbcForm/index.js';

export { HbcPanel } from './HbcPanel/index.js';
export type { HbcPanelProps, PanelSize } from './HbcPanel/index.js';

// PH4.8 Overlay & Surface System
export { HbcCard } from './HbcCard/index.js';
export type { HbcCardProps } from './HbcCard/index.js';

export { HbcModal } from './HbcModal/index.js';
export type { HbcModalProps, ModalSize } from './HbcModal/index.js';

export { HbcTearsheet } from './HbcTearsheet/index.js';
export type { HbcTearsheetProps, TearsheetStep } from './HbcTearsheet/index.js';

export { HbcPopover } from './HbcPopover/index.js';
export type { HbcPopoverProps, PopoverSize } from './HbcPopover/index.js';

// Shared hooks (PH4.8, PH4.9, PH4.12, PH4.14.5)
export { useFocusTrap, useIsMobile, useIsTablet, useMinDisplayTime } from './hooks/index.js';
export { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion.js';
export { useOptimisticMutation } from './hooks/useOptimisticMutation.js';
export type {
  UseOptimisticMutationOptions,
  UseOptimisticMutationReturn,
} from './hooks/useOptimisticMutation.js';
export { useUnsavedChangesBlocker } from './hooks/useUnsavedChangesBlocker.js';
export type {
  UseUnsavedChangesBlockerOptions,
  UseUnsavedChangesBlockerReturn,
} from './hooks/useUnsavedChangesBlocker.js';

export { HbcCommandBar } from './HbcCommandBar/index.js';
export { useFieldModeActions, setFieldModeActions } from './HbcCommandBar/fieldModeActionsStore.js';
export type {
  HbcCommandBarProps,
  CommandBarAction,
  CommandBarFilter,
  SavedView,
  SavedViewScope,
} from './HbcCommandBar/index.js';

export { HbcDataTable } from './HbcDataTable/index.js';
export type { HbcDataTableProps, DataTableEmptyStateConfig } from './HbcDataTable/index.js';
export type { ColumnDef } from '@tanstack/react-table';
export { useAdaptiveDensity } from './HbcDataTable/hooks/useAdaptiveDensity.js';
export type {
  DensityConfig,
  UseAdaptiveDensityOptions,
  UseAdaptiveDensityReturn,
} from './HbcDataTable/hooks/useAdaptiveDensity.js';
export { useSavedViews } from './HbcDataTable/hooks/useSavedViews.js';
export type {
  UseSavedViewsOptions,
  UseSavedViewsReturn,
} from './HbcDataTable/hooks/useSavedViews.js';
export type {
  SavedViewConfig,
  SavedViewEntry,
  SavedViewsPersistenceAdapter,
} from './HbcDataTable/saved-views-types.js';

export { HbcChart } from './HbcChart/index.js';
export type { HbcChartProps } from './HbcChart/index.js';

// PH4.7 Typed chart wrappers
export { HbcBarChart, HbcDonutChart, HbcLineChart } from './HbcChart/index.js';
export type {
  HbcBarChartProps,
  BarDataItem,
  HbcDonutChartProps,
  DonutDataItem,
  HbcLineChartProps,
  LineSeriesItem,
} from './HbcChart/index.js';

// PH4.7 KPI Card
export { HbcKpiCard } from './HbcKpiCard/index.js';
export type { HbcKpiCardProps, KpiTrend } from './HbcKpiCard/index.js';

export { WorkspacePageShell, ListConfigContext } from './WorkspacePageShell/index.js';
export type {
  WorkspacePageShellProps,
  PageLayout,
  BannerConfig,
  FilterDef,
  BulkAction,
} from './WorkspacePageShell/index.js';

// New components (PH4.6)
export { HbcButton } from './HbcButton/index.js';
export type { HbcButtonProps, ButtonVariant, ButtonSize } from './HbcButton/index.js';

export { HbcTypography } from './HbcTypography/index.js';
export type { HbcTypographyProps, TypographyIntent } from './HbcTypography/index.js';

export { HbcTextArea, HbcRichTextEditor, useVoiceDictation } from './HbcInput/index.js';
export type {
  HbcTextAreaProps,
  HbcRichTextEditorProps,
  RichTextToolbarAction,
  UseVoiceDictationReturn,
} from './HbcInput/index.js';

// PH4.12 Interaction Pattern Library
export { HbcConfirmDialog } from './HbcConfirmDialog/index.js';
export type { HbcConfirmDialogProps } from './HbcConfirmDialog/types.js';

export { HbcCommandPalette, useCommandPalette } from './HbcCommandPalette/index.js';
export type {
  HbcCommandPaletteProps,
  CommandPaletteResult,
  CommandPaletteCategory,
  UseCommandPaletteReturn,
} from './HbcCommandPalette/index.js';

// Bottom Navigation (PH4.14.5)
export { HbcBottomNav } from './HbcBottomNav/index.js';
export type { BottomNavItem, HbcBottomNavProps } from './HbcBottomNav/index.js';

// App Shell (PH4.4)
export {
  HbcAppShell,
  HbcThemeProvider,
  HbcThemeContext,
  HbcConnectivityBar,
  HbcHeader,
  HbcSidebar,
  HbcProjectSelector,
  HbcToolboxFlyout,
  HbcFavoriteTools,
  HbcGlobalSearch,
  HbcCreateButton,
  HbcNotificationBell,
  HbcUserMenu,
} from './HbcAppShell/index.js';
export type {
  HbcAppShellProps,
  HbcHeaderProps,
  HbcSidebarProps,
  HbcConnectivityBarProps,
  HbcUserMenuProps,
  ConnectivityStatus,
  SidebarNavItem,
  SidebarNavGroup,
  ShellUser,
  HbcProjectSelectorProps,
  HbcToolboxFlyoutProps,
  HbcFavoriteToolsProps,
  HbcGlobalSearchProps,
  HbcCreateButtonProps,
  HbcNotificationBellProps,
} from './HbcAppShell/index.js';
export { useOnlineStatus, useFieldMode, useSidebarState } from './HbcAppShell/hooks/index.js';
export type { AppMode } from './HbcAppShell/hooks/index.js';

// PH4.9 Messaging & Feedback System
export { HbcBanner } from './HbcBanner/index.js';
export type { HbcBannerProps, BannerVariant } from './HbcBanner/index.js';

export { HbcToastProvider, useToast, HbcToastContainer } from './HbcToast/index.js';
export type {
  ToastConfig,
  ToastCategory,
  ToastContextValue,
  ToastApi,
  HbcToastProviderProps,
  ToastEntry,
} from './HbcToast/index.js';

export { HbcTooltip } from './HbcTooltip/index.js';
export type { HbcTooltipProps, TooltipPosition } from './HbcTooltip/index.js';

export { HbcSpinner } from './HbcSpinner/index.js';
export type { HbcSpinnerProps, SpinnerSize } from './HbcSpinner/index.js';

// PH4.10 Navigation UI System
export { HbcBreadcrumbs } from './HbcBreadcrumbs/index.js';
export type { HbcBreadcrumbsProps } from './HbcBreadcrumbs/index.js';

export { HbcTabs } from './HbcTabs/index.js';
export type { HbcTabsProps, TabPanel } from './HbcTabs/index.js';

export { HbcPagination } from './HbcPagination/index.js';
export type { HbcPaginationProps, PageSizeOption } from './HbcPagination/index.js';

export { HbcSearch } from './HbcSearch/index.js';
export type {
  HbcSearchProps,
  HbcSearchVariant,
  HbcSearchGlobalProps,
  HbcSearchLocalProps,
} from './HbcSearch/index.js';

export { HbcTree } from './HbcTree/index.js';
export type { HbcTreeProps, HbcTreeNode } from './HbcTree/index.js';

// Page Layouts (PH4.5 + PH4B.3)
export {
  ToolLandingLayout,
  DetailLayout,
  CreateUpdateLayout,
  DashboardLayout,
  ListLayout,
  useFocusMode,
} from './layouts/index.js';
export type {
  KpiCardData,
  LayoutAction,
  LayoutTab,
  StatusBarData,
  BreadcrumbItem,
  ToolLandingLayoutProps,
  DetailLayoutProps,
  CreateUpdateLayoutProps,
  DashboardLayoutProps,
  DashboardConfig,
  ListLayoutProps,
  ListConfig,
  ListFilterDef,
  ListBulkAction,
  ListSavedViewEntry,
  UseFocusModeReturn,
} from './layouts/index.js';

// ---------------------------------------------------------------------------
// PH4.13 Module-Specific UI Patterns
// ---------------------------------------------------------------------------

// HbcScoreBar
export { HbcScoreBar } from './HbcScoreBar/index.js';
export type { HbcScoreBarProps } from './HbcScoreBar/index.js';

// HbcApprovalStepper
export { HbcApprovalStepper } from './HbcApprovalStepper/index.js';
export type { HbcApprovalStepperProps, ApprovalStep } from './HbcApprovalStepper/index.js';

// HbcPhotoGrid
export { HbcPhotoGrid } from './HbcPhotoGrid/index.js';
export type { HbcPhotoGridProps, PhotoItem } from './HbcPhotoGrid/index.js';

// HbcCalendarGrid
export { HbcCalendarGrid } from './HbcCalendarGrid/index.js';
export type { HbcCalendarGridProps, CalendarDayData } from './HbcCalendarGrid/index.js';

// HbcDrawingViewer
export { HbcDrawingViewer } from './HbcDrawingViewer/index.js';
export type {
  HbcDrawingViewerProps,
  DrawingMarkup,
  MarkupTool,
  MarkupShapeType,
  SheetOption,
  RevisionOption,
} from './HbcDrawingViewer/index.js';

// Module Configuration Objects — moved to @hbc/shell (PH4B.2 F-014)
// Re-export from @hbc/shell for backward compatibility
export {
  scorecardsLanding,
  scorecardsDetail,
  rfisLanding,
  rfisDetail,
  punchListLanding,
  punchListDetail,
  drawingsLanding,
  disciplineFilters,
  budgetLanding,
  dailyLogSections,
  dailyLogVoiceFields,
  turnoverLanding,
  turnoverDetail,
  turnoverTearsheetSteps,
  documentsLanding,
} from '@hbc/shell';
export type {
  ModuleTableConfig,
  ModuleLandingConfig,
  ModuleDetailConfig,
} from '@hbc/shell';

/* ─────────────────────────────────────────────────────────────────────────────
 * Fluent UI passthrough re-exports (D-10)
 * PH4B.11 §4b.11.4 — apps must import from @hb-intel/ui-kit, not @fluentui/*
 * These re-exports allow apps to consume Fluent primitives through ui-kit
 * without violating the no-direct-fluent-import rule.
 * ───────────────────────────────────────────────────────────────────────────── */
export {
  FluentProvider,
  Text,
  Badge,
  Switch,
  Spinner,
  TabList,
  Tab,
  Card,
  CardHeader,
  Button,
  tokens,
} from '@fluentui/react-components';
export type { SelectTabData } from '@fluentui/react-components';
