/**
 * Module Configuration Types — PH4.13 §13.7
 * Blueprint §1d — Typed data objects for module-specific patterns
 *
 * Module configs are TypeScript objects, not React components.
 * Column defs, KPI arrays, and tab arrays are exported as typed data objects.
 * Page-level composition happens in apps/pwa, not in ui-kit.
 */
import type { ColumnDef } from '@tanstack/react-table';
import type { KpiCardData, LayoutTab } from '../layouts/types.js';
import type { DensityTier } from '../HbcCommandBar/types.js';

/** Table configuration for a module landing page */
export interface ModuleTableConfig<TData = Record<string, unknown>> {
  /** TanStack Table column definitions */
  columns: ColumnDef<TData, unknown>[];
  /** Default sort column and direction */
  defaultSort?: { id: string; desc: boolean };
  /** Column accessor key for responsibility heat map */
  responsibilityField?: string;
  /** Column accessor keys to freeze (sticky left) */
  frozenColumns?: string[];
  /** Default density tier for this module */
  defaultDensity?: DensityTier;
  /** Accessor keys shown on mobile card face */
  mobileCardFields?: string[];
}

/** Complete landing page configuration for a module */
export interface ModuleLandingConfig<TData = Record<string, unknown>> {
  /** Module/tool display name */
  toolName: string;
  /** Table configuration */
  table: ModuleTableConfig<TData>;
  /** KPI metric cards */
  kpiCards: KpiCardData[];
}

/** Detail page configuration for a module */
export interface ModuleDetailConfig {
  /** Tab definitions */
  tabs: LayoutTab[];
  /** Default active tab ID */
  defaultTabId: string;
}
