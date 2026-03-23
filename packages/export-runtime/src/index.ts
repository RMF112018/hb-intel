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

// Types — SF24-T01 contract stubs
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

// Constants — SF24-T01 locked values
export {
  EXPORT_FORMATS,
  EXPORT_STATUSES,
  EXPORT_CONFIDENCE_LEVELS,
  EXPORT_COMPLEXITY_TIERS,
} from './types/index.js';

// Model — lifecycle, state derivation, confidence (SF24-T03)
// export * from './model/index.js';

// API — render pipeline, storage, sync (SF24-T03)
// export * from './api/index.js';

// Hooks — export orchestration hooks (SF24-T04)
// export * from './hooks/index.js';

// Components — thin composition shells (SF24-T05/T06)
// export * from './components/index.js';

// Composers — report composition (SF24-T05)
// export * from './composers/index.js';

// Renderers — format-specific render pipeline (SF24-T03)
// export * from './renderers/index.js';

// Templates — branded layouts (SF24-T05/T06)
// export * from './templates/index.js';
