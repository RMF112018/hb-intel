/**
 * @hbc/export-runtime
 *
 * Shared export runtime primitive for HB Intel.
 * Provides export lifecycle orchestration, render pipeline contracts,
 * receipt state management, artifact provenance stamping, offline
 * replay, and module adapter seams.
 *
 * SF24 Master Plan — L-01 ownership, L-03 complexity tiers,
 * L-04 offline resilience, L-06 deep-linking/provenance.
 *
 * @see docs/architecture/plans/shared-features/SF24-Export-Runtime.md
 */

// Types — SF24-T01 foundation types
export type {
  ExportFormat,
  ExportIntent,
  ExportRenderMode,
  ExportStatus,
  ExportArtifactConfidence,
  ExportComplexityTier,
  IExportSourceTruthStamp,
  IExportReceiptState,
  IExportReviewStepState,
  IExportReviewHistoryEntry,
  IExportNextRecommendedAction,
  IExportFailureState,
  IExportRetryState,
  IExportArtifactMetadata,
  IExportRequest,
  ExportUnavailableReasonCode,
  ExportTrustDowngradeReasonCode,
  ExportRetryReasonCode,
  ExportQueueReasonCode,
  ExportFailureReasonCode,
} from './types/index.js';

// Types — SF24-T02 canonical contracts
export type {
  ExportVersionTag,
  IExportTruthState,
  IExportColumnDefinition,
  ITableExportPayload,
  IReportExportSection,
  IReportExportPayload,
  ExportPayload,
  IExportBicStepConfig,
  IExportVersionRef,
  IExportTelemetryState,
  IExportSuppressedFormatState,
  IExportContextDeltaState,
} from './types/index.js';

// Constants — SF24-T01 locked values
export {
  EXPORT_FORMATS,
  EXPORT_STATUSES,
  EXPORT_CONFIDENCE_LEVELS,
  EXPORT_COMPLEXITY_TIERS,
} from './types/index.js';

// Constants — SF24-T02 locked values
export {
  EXPORT_RUNTIME_SYNC_QUEUE_KEY,
  EXPORT_RUNTIME_SYNC_STATUSES,
  EXPORT_RUNTIME_COMPLEXITY_PROFILES,
  EXPORT_RUNTIME_CONFIDENCE_STATES,
} from './types/index.js';

// Model — lifecycle, state derivation, confidence, naming, governance (SF24-T03)
export {
  createExportRequest,
  transitionExportStatus,
  VALID_TRANSITIONS,
  computeArtifactConfidence,
  detectContextDelta,
  generateExportFileName,
  createAuditEntry,
} from './model/index.js';
export type { IExportRequestInput, ExportAuditAction, IExportAuditEntry } from './model/index.js';

// Storage — adapter interface + in-memory implementation (SF24-T03)
export type { IExportStorageAdapter, IExportStorageRecord } from './storage/index.js';
export { InMemoryExportStorageAdapter } from './storage/index.js';

// API — render pipeline, sync (SF24-T03 future)
// export * from './api/index.js';

// Hooks — export orchestration hooks (SF24-T04)
export {
  exportRuntimeKeys,
  useExportRuntimeState,
  useExportCompositionState,
  useExportQueue,
} from './hooks/index.js';
export type {
  UseExportRuntimeStateOptions,
  UseExportRuntimeStateResult,
  UseExportCompositionStateOptions,
  UseExportCompositionStateResult,
  UseExportQueueOptions,
  UseExportQueueResult,
} from './hooks/index.js';

// Components — thin composition shells (SF24-T05/T06)
export {
  ExportActionMenuShell,
  ExportFormatPickerShell,
  ExportProgressToastShell,
  ExportReceiptCardShell,
} from './components/index.js';
export type {
  ExportActionMenuShellProps,
  ExportFormatPickerShellProps,
  ExportProgressToastShellProps,
  ExportReceiptCardShellProps,
} from './components/index.js';

// Composers — report composition (SF24-T05)
// export * from './composers/index.js';

// Renderers — format-specific render pipeline (SF24-T03)
// export * from './renderers/index.js';

// Templates — branded layouts (SF24-T05/T06)
// export * from './templates/index.js';
