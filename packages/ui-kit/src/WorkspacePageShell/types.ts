/**
 * WorkspacePageShell — Full prop contract
 * PH4B.2 §Step 2 | PH4B.3 §Step 3 | Blueprint §1d (D-01, D-02)
 *
 * Mandatory outer container for every page in HB Intel.
 * The `layout` prop enforces D-02 at the type level and drives LAYOUT_MAP rendering.
 */
import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@hbc/models';
import type { BannerVariant } from '../HbcBanner/types.js';
import type { CommandBarAction } from '../HbcCommandBar/types.js';
import type {
  DashboardConfig,
  ListConfig,
  ListFilterDef,
  ListBulkAction,
} from '../layouts/types.js';

// Re-export layout types for backward compatibility
export type { DashboardConfig, ListConfig, ListFilterDef, ListBulkAction };

/** Page layout variants — enforced by D-02 */
export type PageLayout = 'dashboard' | 'list' | 'form' | 'detail' | 'landing';

/** Banner configuration for page-level alerts */
export interface BannerConfig {
  variant: BannerVariant;
  message: ReactNode;
  dismissible?: boolean;
}

// Legacy aliases — kept for backward compat, prefer ListFilterDef / ListBulkAction
export type FilterDef = ListFilterDef;
export type BulkAction = ListBulkAction;

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
  /** Dashboard layout config (only used when layout='dashboard') */
  dashboardConfig?: DashboardConfig;
  /** List-mode config (forwarded to ListLayout context) */
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
