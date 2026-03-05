/**
 * WorkspacePageShell — Full prop contract
 * PH4B.2 §Step 2 | Blueprint §1d (D-01, D-02)
 *
 * Mandatory outer container for every page in HB Intel.
 * The `layout` prop enforces D-02 at the type level.
 * Layout variant rendering deferred to Phase 4b.3.
 */
import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@hbc/models';
import type { BannerVariant } from '../HbcBanner/types.js';
import type { CommandBarAction } from '../HbcCommandBar/types.js';

/** Page layout variants — enforced by D-02 */
export type PageLayout = 'dashboard' | 'list' | 'form' | 'detail' | 'landing';

/** Banner configuration for page-level alerts */
export interface BannerConfig {
  variant: BannerVariant;
  message: ReactNode;
  dismissible?: boolean;
}

/** Filter definition for list-mode pages */
export interface FilterDef {
  key: string;
  label: string;
  type: 'select' | 'date-range' | 'text';
  options?: { value: string; label: string }[];
}

/** Bulk action for list-mode pages with row selection */
export interface BulkAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (selectedIds: string[]) => void;
  isDestructive?: boolean;
}

/** List-mode configuration (forwarded as context for Phase 4b.3) */
export interface ListConfig {
  filterStoreKey: string;
  primaryFilters: FilterDef[];
  advancedFilters?: FilterDef[];
  savedViewsEnabled?: boolean;
  selectable?: boolean;
  bulkActions?: BulkAction[];
}

/** Full WorkspacePageShell props — D-01 mandatory wrapper */
export interface WorkspacePageShellProps {
  /** Layout variant — required per D-02 */
  layout: PageLayout;
  /** Page title displayed in header */
  title: string;
  /** Breadcrumb navigation segments */
  breadcrumbs?: BreadcrumbItem[];
  /** Primary command bar actions */
  actions?: CommandBarAction[];
  /** Overflow menu actions */
  overflowActions?: CommandBarAction[];
  /** List-mode config (forwarded to Phase 4b.3 context) */
  listConfig?: ListConfig;
  /** Show loading spinner overlay */
  isLoading?: boolean;
  /** Show empty state */
  isEmpty?: boolean;
  /** Show error state */
  isError?: boolean;
  /** Error message for error state */
  errorMessage?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state CTA label */
  emptyActionLabel?: string;
  /** Empty state CTA handler */
  onEmptyAction?: () => void;
  /** Page-level banner */
  banner?: BannerConfig;
  /** Supported device modes */
  supportedModes?: ('office' | 'field')[];
  /** Page content */
  children: ReactNode;
}
