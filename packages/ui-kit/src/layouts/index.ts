// Page Layout Taxonomy — PH4.5 | Blueprint §1f, §2c
// Three canonical layouts: ToolLanding, Detail, CreateUpdate

export { ToolLandingLayout } from './ToolLandingLayout.js';
export { DetailLayout } from './DetailLayout.js';
export { CreateUpdateLayout } from './CreateUpdateLayout.js';
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
  UseFocusModeReturn,
} from './types.js';
