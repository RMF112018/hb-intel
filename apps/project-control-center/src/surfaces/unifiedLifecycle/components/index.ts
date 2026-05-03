/**
 * Unified Lifecycle preview components — barrel.
 *
 * Reusable, presentational, fixture-safe preview seams consumed by
 * future PCC surface integrations (Prompt 05). All components render
 * card BODY content only and are non-routed; consumers wrap them in
 * `PccDashboardCard` to preserve the bento direct-child invariant.
 */

export {
  LifecycleTimelinePreview,
  type ILifecycleTimelinePreviewProps,
} from './LifecycleTimelinePreview.js';
export {
  ProjectMemoryPanel,
  type IProjectMemoryPanelProps,
} from './ProjectMemoryPanel.js';
export {
  ProjectLensSwitcher,
  type IProjectLensSwitcherProps,
} from './ProjectLensSwitcher.js';
export {
  RelatedRecordsPanel,
  type IRelatedRecordsPanelProps,
} from './RelatedRecordsPanel.js';
export {
  WarrantyTracePreview,
  type IWarrantyTracePreviewProps,
} from './WarrantyTracePreview.js';
export {
  ClosedProjectReferencePreview,
  type IClosedProjectReferencePreviewProps,
} from './ClosedProjectReferencePreview.js';
export {
  UnifiedProjectSearchPreview,
  type IUnifiedProjectSearchPreviewProps,
} from './UnifiedProjectSearchPreview.js';
export {
  AskHbiGroundingPreviewPanel,
  ASK_HBI_SAMPLE_QUERIES,
  ASK_HBI_PANEL_TITLE,
  ASK_HBI_PANEL_DISCLAIMER,
  ASK_HBI_IDLE_TITLE,
  ASK_HBI_IDLE_DESCRIPTION,
  type IAskHbiGroundingPreviewPanelProps,
} from './AskHbiGroundingPreviewPanel.js';
