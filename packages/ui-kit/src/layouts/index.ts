// Page Layout Taxonomy — PH4.5 + PH4B.3 | Blueprint §1f, §2c
// Five canonical layouts: ToolLanding, Detail, CreateUpdate, Dashboard, List

export { ToolLandingLayout } from './ToolLandingLayout.js';
export { DetailLayout } from './DetailLayout.js';
export { CreateUpdateLayout } from './CreateUpdateLayout.js';
export { DashboardLayout } from './DashboardLayout.js';
export { ListLayout } from './ListLayout.js';
export { useFocusMode } from './hooks/index.js';
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
} from './types.js';
