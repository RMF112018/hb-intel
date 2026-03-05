/**
 * Shared UI type definitions — PH4B.2 §Step 1
 * Blueprint §1d, §1f — Pure data-shape interfaces extracted from ui-kit
 * for cross-package consumption without circular dependencies.
 *
 * These are data shapes, not components. ReactNode fields use type-only
 * imports from @types/react (devDep on models).
 */
import type { ReactNode } from 'react';

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

/** Density tiers for HbcCommandBar and data tables */
export type DensityTier = 'compact' | 'standard' | 'touch';
