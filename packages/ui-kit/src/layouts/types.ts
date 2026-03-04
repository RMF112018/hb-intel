/**
 * Page Layout Taxonomy — Shared type definitions
 * PH4.5 §Step 1 | Blueprint §1f, §2c
 *
 * Three canonical layouts: ToolLanding, Detail, CreateUpdate.
 * Every page in HB Intel must use exactly one of these.
 */
import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

/** KPI card data for ToolLandingLayout metric cards */
export interface KpiCardData {
  id: string;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  icon?: ReactNode;
}

/** Action button used across layout headers */
export interface LayoutAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}

/** Tab definition for DetailLayout tab bar */
export interface LayoutTab {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

/** Status bar data for ToolLandingLayout */
export interface StatusBarData {
  showing: number;
  total: number;
  lastSynced?: string;
}

/** Breadcrumb segment for DetailLayout */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

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
