/**
 * Page Layout Taxonomy — Shared type definitions
 * PH4.5 §Step 1 | Blueprint §1f, §2c
 *
 * Three canonical layouts: ToolLanding, Detail, CreateUpdate.
 * Every page in HB Intel must use exactly one of these.
 *
 * PH4B.2 §Step 1 — Pure data-shape interfaces re-exported from @hbc/models
 * to break circular deps while preserving backward compatibility.
 */
import type { ReactNode } from 'react';
import type {
  KpiCardData,
  LayoutAction,
  LayoutTab,
  StatusBarData,
  BreadcrumbItem,
} from '@hbc/models';

// Re-export shared data shapes from @hbc/models (canonical source)
export type {
  KpiCardData,
  LayoutAction,
  LayoutTab,
  StatusBarData,
  BreadcrumbItem,
};

// ---------------------------------------------------------------------------
// ToolLandingLayout
// ---------------------------------------------------------------------------

export interface ToolLandingLayoutProps {
  /** Tool/module display name shown in page header */
  toolName: string;
  /** Primary CTA button (orange) */
  primaryAction?: LayoutAction;
  /** Secondary action buttons */
  secondaryActions?: LayoutAction[];
  /** Slot for HbcCommandBar or similar filter bar */
  commandBar?: ReactNode;
  /** Optional KPI metric cards */
  kpiCards?: KpiCardData[];
  /** Status bar data (showing X of Y, last synced) */
  statusBar?: StatusBarData;
  /** Page content (typically a data table) */
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// DetailLayout
// ---------------------------------------------------------------------------

export interface DetailLayoutProps {
  /** Breadcrumb navigation segments */
  breadcrumbs?: BreadcrumbItem[];
  /** Back navigation link href */
  backLink?: string;
  /** Back button label (e.g., "Back to RFIs") */
  backLabel?: string;
  /** Item title displayed in detail header */
  itemTitle: string;
  /** Optional status badge next to title */
  statusBadge?: ReactNode;
  /** Header action buttons */
  actions?: LayoutAction[];
  /** Tab definitions */
  tabs?: LayoutTab[];
  /** Active tab identifier */
  activeTabId?: string;
  /** Tab change handler */
  onTabChange?: (tabId: string) => void;
  /** Main content area (left/top column) */
  mainContent: ReactNode;
  /** Optional sidebar content (right/bottom column) */
  sidebarContent?: ReactNode;
  /** Navigation handler for breadcrumbs and back link */
  onNavigate?: (href: string) => void;
}

// ---------------------------------------------------------------------------
// CreateUpdateLayout
// ---------------------------------------------------------------------------

export interface CreateUpdateLayoutProps {
  /** Form mode */
  mode: 'create' | 'edit';
  /** Item type label (e.g., "RFI", "Submittal") */
  itemType: string;
  /** Existing item title for edit mode */
  itemTitle?: string;
  /** Cancel handler */
  onCancel: () => void;
  /** Submit handler */
  onSubmit: () => void;
  /** Whether form is submitting (shows spinner) */
  isSubmitting?: boolean;
  /** Form content */
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// useFocusMode hook
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// DashboardLayout
// ---------------------------------------------------------------------------

export interface DashboardLayoutProps {
  /** KPI card data for the responsive grid */
  kpiCards?: KpiCardData[];
  /** Chart zone content (full-width slot below KPI grid) */
  chartContent?: ReactNode;
  /** Data zone content (flexGrow: 1) */
  children: ReactNode;
}

/** DashboardConfig — subset of DashboardLayoutProps for WorkspacePageShell */
export interface DashboardConfig {
  kpiCards?: KpiCardData[];
  chartContent?: ReactNode;
}

// ---------------------------------------------------------------------------
// ListLayout
// ---------------------------------------------------------------------------

/** Filter definition for list-mode pages */
export interface ListFilterDef {
  key: string;
  label: string;
  type: 'select' | 'date-range' | 'text';
  options?: { value: string; label: string }[];
}

/** Bulk action for list-mode pages with row selection */
export interface ListBulkAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (selectedIds: string[]) => void;
  isDestructive?: boolean;
}

/** Saved view entry for ListLayout */
export interface ListSavedViewEntry {
  id: string;
  name: string;
  scope: 'personal' | 'project' | 'organization';
}

export interface ListLayoutProps {
  /** Primary filter definitions (shown in toolbar) */
  primaryFilters?: ListFilterDef[];
  /** Advanced filter definitions (shown in expandable panel) */
  advancedFilters?: ListFilterDef[];
  /** Active filter values — controlled by parent */
  activeFilters?: Record<string, string | string[]>;
  /** Filter change handler */
  onFilterChange?: (key: string, value: string | string[] | undefined) => void;
  /** Clear all filters handler */
  onClearAllFilters?: () => void;
  /** Search input value — controlled */
  searchValue?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Enable saved views bar */
  savedViewsEnabled?: boolean;
  /** Saved view entries */
  savedViews?: ListSavedViewEntry[];
  /** Currently active view ID */
  activeViewId?: string;
  /** View selection handler */
  onViewSelect?: (viewId: string) => void;
  /** Save current view handler */
  onSaveView?: () => void;
  /** Current view mode */
  viewMode?: 'table' | 'card';
  /** View mode change handler */
  onViewModeChange?: (mode: 'table' | 'card') => void;
  /** Number of selected rows (triggers bulk bar) */
  selectedCount?: number;
  /** Bulk action definitions */
  bulkActions?: ListBulkAction[];
  /** Clear selection handler */
  onClearSelection?: () => void;
  /** Number of items currently shown */
  showingCount?: number;
  /** Total number of items */
  totalCount?: number;
  /** Table/card content */
  children: ReactNode;
}

/** ListConfig — subset of ListLayoutProps for WorkspacePageShell */
export interface ListConfig {
  filterStoreKey: string;
  primaryFilters?: ListFilterDef[];
  advancedFilters?: ListFilterDef[];
  savedViewsEnabled?: boolean;
  selectable?: boolean;
  bulkActions?: ListBulkAction[];
}

// ---------------------------------------------------------------------------
// useFocusMode hook
// ---------------------------------------------------------------------------

export interface UseFocusModeReturn {
  /** Whether focus mode is currently active */
  isFocusMode: boolean;
  /** Toggle focus mode on/off (desktop only) */
  toggleFocusMode: () => void;
  /** Whether focus mode was auto-activated (touch device) */
  isAutoFocus: boolean;
  /** Explicitly deactivate focus mode (e.g., on save/cancel) */
  deactivate: () => void;
}
