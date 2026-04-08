/**
 * @hbc/ui-kit/primitives
 *
 * Layer 2 — Shared building blocks for both productive and presentation lanes.
 * Primitives are intentionally generic within the HB Intel system, reusable
 * across multiple features and surfaces, visually driven by foundations.
 *
 * This entry point deliberately excludes:
 * - Surface families (DataTable, Charts, Layouts, WorkspacePageShell, CommandBar)
 * - Module-specific UI (Activity Timeline, Export, Saved Views, Bulk Actions, etc.)
 * - App shell components (Header, Sidebar, Connectivity)
 * - Homepage/presentation surface families (use @hbc/ui-kit/homepage)
 * - Data-fetching components (HbcPeoplePicker — use main barrel)
 *
 * @see docs/reference/ui-kit/UI-System-Layer-Model.md
 * @version W01-P02
 */

// ── Button & Typography ────────────────────────────────────────────────

export { HbcButton } from './HbcButton/index.js';
export type { HbcButtonProps, ButtonVariant, ButtonSize } from './HbcButton/index.js';

export { HbcTypography } from './HbcTypography/index.js';
export type { HbcTypographyProps, TypographyIntent } from './HbcTypography/index.js';

// ── Status & Badges ────────────────────────────────────────────────────

export { HbcStatusBadge } from './HbcStatusBadge/index.js';
export type { HbcStatusBadgeProps, StatusVariant } from './HbcStatusBadge/index.js';

export { HbcRiskBadge } from './HbcRiskBadge/index.js';
export type { HbcRiskBadgeProps, RiskLevel } from './HbcRiskBadge/index.js';

export { HbcSpinner } from './HbcSpinner/index.js';
export type { HbcSpinnerProps, SpinnerSize } from './HbcSpinner/index.js';

// ── Form Primitives ───────────────────────────────────────────────────

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

export { HbcTextArea, HbcRichTextEditor, useVoiceDictation } from './HbcInput/index.js';
export type {
  HbcTextAreaProps,
  HbcRichTextEditorProps,
  RichTextToolbarAction,
  UseVoiceDictationReturn,
} from './HbcInput/index.js';

export { HbcFormField } from './HbcFormField/index.js';
export type { HbcFormFieldProps } from './HbcFormField/index.js';

// ── Overlay & Dialog ──────────────────────────────────────────────────

export { HbcCard } from './HbcCard/index.js';
export type { HbcCardProps, CardWeight } from './HbcCard/index.js';

export { HbcModal } from './HbcModal/index.js';
export type { HbcModalProps, ModalSize } from './HbcModal/index.js';

export { HbcPanel } from './HbcPanel/index.js';
export type { HbcPanelProps, PanelSize } from './HbcPanel/index.js';

export { HbcTearsheet } from './HbcTearsheet/index.js';
export type { HbcTearsheetProps, TearsheetStep } from './HbcTearsheet/index.js';

export { HbcPopover } from './HbcPopover/index.js';
export type { HbcPopoverProps, PopoverSize } from './HbcPopover/index.js';

export { HbcConfirmDialog } from './HbcConfirmDialog/index.js';
export type { HbcConfirmDialogProps } from './HbcConfirmDialog/types.js';

// ── Messaging & Feedback ──────────────────────────────────────────────

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

export { HbcEmptyState } from './HbcEmptyState/index.js';
export type { HbcEmptyStateProps } from './HbcEmptyState/index.js';

export { HbcCoachingCallout } from './HbcCoachingCallout/index.js';
export type { HbcCoachingCalloutProps } from './HbcCoachingCallout/index.js';

export { HbcErrorBoundary } from './HbcErrorBoundary/index.js';
export type { HbcErrorBoundaryProps, HbcErrorBoundaryState } from './HbcErrorBoundary/index.js';

// ── Navigation ────────────────────────────────────────────────────────

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

export { HbcSegmentedControl } from './HbcSegmentedControl/index.js';
export type { HbcSegmentedControlProps, SegmentedOption } from './HbcSegmentedControl/index.js';

export { HbcBottomNav } from './HbcBottomNav/index.js';
export type { BottomNavItem, HbcBottomNavProps } from './HbcBottomNav/index.js';

export { HbcTree } from './HbcTree/index.js';
export type { HbcTreeProps, HbcTreeNode } from './HbcTree/index.js';

// ── Data Display ──────────────────────────────────────────────────────

export { HbcDescriptionList } from './HbcDescriptionList/index.js';
export type { HbcDescriptionListProps, DescriptionListItem } from './HbcDescriptionList/index.js';

export { HbcScoreBar } from './HbcScoreBar/index.js';
export type { HbcScoreBarProps } from './HbcScoreBar/index.js';

export { HbcStatusTimeline } from './HbcStatusTimeline/index.js';
export type { HbcStatusTimelineProps, IStatusEntry } from './HbcStatusTimeline/index.js';

// ── Workflow ──────────────────────────────────────────────────────────

export { HbcApprovalStepper } from './HbcApprovalStepper/index.js';
export type { HbcApprovalStepperProps, ApprovalStep } from './HbcApprovalStepper/index.js';
