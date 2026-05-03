/**
 * Unified Lifecycle adapter seam — barrel.
 *
 * SHARED ADAPTER SEAM. NOT A ROUTED SURFACE.
 * Re-exports the seven leaf adapters, the aggregate orchestrator, the
 * lens visibility helper, and the view-model types. Consumers (future
 * surface integrations in Prompt 04C) should import only what they
 * need from this barrel; nothing here mounts a workspace or registers
 * with `PccSurfaceRouter`.
 */

export { buildPccLifecycleTimelineViewModel } from './lifecycleTimelineAdapter.js';
export { buildPccProjectMemoryViewModel } from './projectMemoryAdapter.js';
export { buildPccProjectLensesViewModel } from './projectLensesAdapter.js';
export { buildPccProjectTraceabilityViewModel } from './projectTraceabilityAdapter.js';
export { buildPccWarrantyTraceViewModel } from './warrantyTraceAdapter.js';
export { buildPccCrossProjectKnowledgeViewModel } from './crossProjectKnowledgeAdapter.js';
export { buildPccUnifiedSearchViewModel } from './unifiedSearchAdapter.js';
export { buildPccUnifiedLifecycleViewModel } from './unifiedLifecycleAdapter.js';
export { summarizeLensVisibility, type ILensVisibilityRecord, type LensRecordKind } from './lensState.js';
export {
  LifecycleTimelinePreview,
  type ILifecycleTimelinePreviewProps,
  ProjectMemoryPanel,
  type IProjectMemoryPanelProps,
  ProjectLensSwitcher,
  type IProjectLensSwitcherProps,
  RelatedRecordsPanel,
  type IRelatedRecordsPanelProps,
  WarrantyTracePreview,
  type IWarrantyTracePreviewProps,
  ClosedProjectReferencePreview,
  type IClosedProjectReferencePreviewProps,
  UnifiedProjectSearchPreview,
  type IUnifiedProjectSearchPreviewProps,
  AskHbiGroundingPreviewPanel,
  ASK_HBI_SAMPLE_QUERIES,
  ASK_HBI_PANEL_TITLE,
  ASK_HBI_PANEL_DISCLAIMER,
  ASK_HBI_IDLE_TITLE,
  ASK_HBI_IDLE_DESCRIPTION,
  type IAskHbiGroundingPreviewPanelProps,
} from './components/index.js';
export type {
  IPccLifecyclePostureView,
  IPccRedactionView,
  IPccLifecycleEventVm,
  IPccCheckpointVm,
  IPccGateSignalVm,
  IPccLifecycleTimelineViewModel,
  IPccMemoryNoteVm,
  IPccDecisionVm,
  IPccAssumptionVm,
  IPccMemoryRecordVm,
  IPccProjectMemoryViewModel,
  IPccLensOptionVm,
  IPccLensVisibilitySummary,
  IPccProjectLensesViewModel,
  IPccTraceabilityEdgeVm,
  IPccRelatedRecordClusterVm,
  IPccProjectTraceabilityViewModel,
  IPccWarrantyTraceRowVm,
  IPccWarrantyTraceViewModel,
  IPccCrossProjectReferenceVm,
  IPccKnowledgeReferenceVm,
  IPccClosedProjectReferenceView,
  IPccCrossProjectKnowledgeViewModel,
  IPccUnifiedSearchGroundedAnswerVm,
  IPccUnifiedSearchRefusalAnswerVm,
  IPccUnifiedSearchAnswerVm,
  IPccUnifiedSearchViewModel,
  IPccUnifiedLifecycleViewModel,
  IPccUnifiedLifecycleReadModelClient,
  IPccUnifiedSearchReadModelClient,
} from './unifiedLifecycleViewModel.js';
export {
  useUnifiedLifecycleReadModel,
  type IUseUnifiedLifecycleReadModelState,
} from './useUnifiedLifecycleReadModel.js';
export {
  useUnifiedSearchReadModel,
  type IUseUnifiedSearchReadModelState,
} from './useUnifiedSearchReadModel.js';
