/**
 * SF24-T02 — Export Runtime TypeScript Contracts.
 *
 * Canonical primitive contracts for export lifecycle truth, receipt semantics,
 * artifact confidence, context stamping, BIC handoff steps, provenance/versioning,
 * payload discriminators, and operational telemetry.
 *
 * Governing: SF24-T02, SF24 Master Plan L-01 through L-06
 */

/**
 * Version workflow tag — mirrors `VersionTag` from `@hbc/versioned-record`.
 * Defined locally to avoid coupling the scaffold to versioned-record's
 * build output. T03+ may replace with a direct import when the runtime
 * dependency is needed for offline persistence (L-04).
 */
export type ExportVersionTag =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'archived'
  | 'handoff'
  | 'superseded';

// ── Export Truth Vocabulary ────────────────────────────────────────────────

/** Supported export output formats (L-03). */
export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'print';

/**
 * Export intent classification (SF24 truth vocabulary).
 *
 * Users must be able to tell what kind of export they are receiving.
 * - `working-data` — CSV/XLSX for working analysis
 * - `current-view` — filters, sort, visible columns, selected rows
 * - `record-snapshot` — point-in-time immutable record
 * - `presentation` — PDF/print for circulation
 * - `composite-report` — section-based narrative
 */
export type ExportIntent =
  | 'working-data'
  | 'current-view'
  | 'record-snapshot'
  | 'presentation'
  | 'composite-report';

/**
 * Export render mode — where and how the export is produced.
 *
 * - `local` — rendered client-side immediately
 * - `offline-queued` — request created locally with deferred remote completion
 * - `server-render` — heavier render path delegated to server
 */
export type ExportRenderMode = 'local' | 'offline-queued' | 'server-render';

// ── Receipt / Status States ───────────────────────────────────────────────

/**
 * Export receipt lifecycle status (SF24 receipt vocabulary).
 *
 * All receipt states must explain themselves to the user — no silent transitions.
 */
export type ExportStatus =
  | 'saved-locally'
  | 'queued-to-sync'
  | 'rendering'
  | 'complete'
  | 'failed'
  | 'degraded'
  | 'restored-receipt';

/**
 * Artifact confidence level — how trustworthy is this export artifact?
 *
 * Confidence is computed from receipt state, source truth freshness,
 * and render completion status.
 */
export type ExportArtifactConfidence =
  | 'trusted-synced'
  | 'queued-local-only'
  | 'completed-with-degraded-truth'
  | 'failed-or-partial'
  | 'restored-needs-review';

// ── Complexity Tiers (L-03) ──────────────────────────────────────────────

/**
 * Module complexity tier governing export surface depth.
 *
 * - `essential` — CSV/XLSX button only
 * - `standard` — full menu + branded PDF/Print
 * - `expert` — report composition + full receipt card + configure link
 */
export type ExportComplexityTier = 'essential' | 'standard' | 'expert';

// ── Core Interfaces ──────────────────────────────────────────────────────

/**
 * Source truth stamp — what record/view/version the artifact represents.
 *
 * Governs explainability: users must be able to tell exactly what
 * record/view/version/filter/column state an artifact represents.
 */
export interface IExportSourceTruthStamp {
  /** Module key that owns the source data. */
  moduleKey: string;
  /** Project ID context. */
  projectId: string;
  /** Record or view identifier. */
  recordId: string;
  /** ISO 8601 timestamp of truth snapshot. */
  snapshotTimestampIso: string;
  /** Whether this is a point-in-time snapshot or current-view projection. */
  snapshotType: 'point-in-time' | 'current-view';
  /** Applied filters, if any (current-view exports). */
  appliedFilters: Record<string, unknown> | null;
  /** Applied sort order, if any. */
  appliedSort: string | null;
  /** Visible column keys, if restricted. */
  visibleColumns: string[] | null;
}

/**
 * Receipt state — local-vs-remote-vs-restored receipt tracking.
 *
 * Receipt metadata must be trustworthy enough to download, retry,
 * re-export, review, or hand off.
 */
export interface IExportReceiptState {
  /** Unique receipt identifier. */
  receiptId: string;
  /** Current lifecycle status. */
  status: ExportStatus;
  /** Computed artifact confidence level. */
  confidence: ExportArtifactConfidence;
  /** ISO 8601 timestamp when the receipt was created. */
  createdAtIso: string;
  /** ISO 8601 timestamp when the export completed (null if in-progress). */
  completedAtIso: string | null;
  /** URL to download the artifact (null if not yet available). */
  artifactUrl: string | null;
  /** Whether this receipt was restored from offline cache. */
  restoredFromCache: boolean;
}

/**
 * Review step state — blocking vs non-blocking, owner attribution, reassignment.
 *
 * Review steps create granular BIC ownership with avatar projection (L-02).
 */
export interface IExportReviewStepState {
  /** Unique step identifier. */
  stepId: string;
  /** Whether this step blocks export completion. */
  blocking: boolean;
  /** Current owner UPN. */
  ownerUpn: string;
  /** Current owner display name. */
  ownerName: string;
  /** Step status. */
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  /** Reassignment history for this step. */
  reassignmentHistory: IExportReviewHistoryEntry[];
}

/** Review step reassignment history entry. */
export interface IExportReviewHistoryEntry {
  /** Previous owner UPN. */
  fromUpn: string;
  /** New owner UPN. */
  toUpn: string;
  /** ISO 8601 timestamp of reassignment. */
  reassignedAtIso: string;
  /** Reason for reassignment (null if not provided). */
  reason: string | null;
}

/**
 * Next recommended export action — guides users to the most useful next step.
 *
 * Top recommended export logic reduces repeated export friction.
 */
export interface IExportNextRecommendedAction {
  /** Kind of recommended action. */
  actionKind:
    | 'download'
    | 'review'
    | 'approve'
    | 'circulate'
    | 'publish'
    | 'retry'
    | 're-export';
  /** User-facing explanation of why this action is recommended. */
  reason: string;
  /** Recommended format, if applicable. */
  exportFormat: ExportFormat | null;
}

/** Failure state with diagnostic detail. */
export interface IExportFailureState {
  /** Machine-readable failure code. */
  failureCode: ExportFailureReasonCode;
  /** User-facing failure message. */
  userMessage: string;
  /** Technical detail for logging/debugging (null if not available). */
  technicalDetail: string | null;
  /** ISO 8601 timestamp of failure. */
  occurredAtIso: string;
}

/** Retry state with attempt tracking. */
export interface IExportRetryState {
  /** Number of retry attempts made. */
  attemptCount: number;
  /** Maximum allowed retry attempts. */
  maxAttempts: number;
  /** ISO 8601 timestamp of last retry attempt. */
  lastAttemptAtIso: string;
  /** Reason for retry. */
  reasonCode: ExportRetryReasonCode;
  /** Whether another retry is allowed. */
  canRetry: boolean;
}

/** Artifact metadata for provenance stamping. */
export interface IExportArtifactMetadata {
  /** Unique artifact identifier. */
  artifactId: string;
  /** Deterministic file name. */
  fileName: string;
  /** Export format. */
  format: ExportFormat;
  /** File size in bytes (null if not yet available). */
  sizeBytes: number | null;
  /** Content checksum for integrity verification (null if not computed). */
  checksum: string | null;
  /** ISO 8601 timestamp of artifact creation. */
  createdAtIso: string;
}

// ── T02 Truth / Explainability Contracts ─────────────────────────────────

/**
 * Aggregate truth/explainability state (SF24-T02).
 *
 * Answers: what record/view/version does the artifact represent?
 * Whether filters, sorts, visible columns, selected rows, or composed
 * sections were applied. Whether source truth changed during render.
 */
export interface IExportTruthState {
  /** Source truth stamp identifying module, project, record, and snapshot. */
  sourceTruthStamp: IExportSourceTruthStamp;
  /** Whether this is a point-in-time snapshot or current-view projection. */
  snapshotType: 'point-in-time' | 'current-view';
  /** Whether filters were applied to the exported data. */
  filtersApplied: boolean;
  /** Whether a sort order was applied. */
  sortApplied: boolean;
  /** Whether visible columns were restricted. */
  columnsRestricted: boolean;
  /** Whether only selected rows were exported. */
  selectedRowsOnly: boolean;
  /** Section IDs for composite report exports (null for table exports). */
  composedSections: string[] | null;
  /** Whether source truth changed materially before render completion. */
  sourceTruthChangedDuringRender: boolean;
  /** Reasons why truth confidence was downgraded (empty if trusted). */
  truthDowngradeReasons: ExportTrustDowngradeReasonCode[];
}

// ── T02 Payload Discriminators ───────────────────────────────────────────

/** Column metadata for table exports. */
export interface IExportColumnDefinition {
  /** Column key matching the source data field. */
  key: string;
  /** Human-readable column label. */
  label: string;
  /** Whether this column is visible in the export. */
  visible: boolean;
  /** Column data type for formatting. */
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'currency';
}

/**
 * Table export payload — CSV/XLSX working-data and current-view exports.
 *
 * Module adapters own the source data; this contract describes the
 * structural metadata passed to the render pipeline.
 */
export interface ITableExportPayload {
  /** Discriminator. */
  kind: 'table';
  /** Column definitions for the exported table. */
  columns: IExportColumnDefinition[];
  /** Total row count in the export. */
  rowCount: number;
  /** Selected row IDs if only selected rows are exported (null for all rows). */
  selectedRowIds: string[] | null;
  /** Human-readable filter summary (null if no filters). */
  filterSummary: string | null;
  /** Human-readable sort summary (null if no sort). */
  sortSummary: string | null;
}

/** Individual section in a composite report export. */
export interface IReportExportSection {
  /** Unique section identifier. */
  sectionId: string;
  /** Section display title. */
  title: string;
  /** Module key providing this section's data. */
  sourceModuleKey: string;
  /** Display order (1-based). */
  order: number;
  /** Whether this section is included in the export. */
  included: boolean;
}

/**
 * Composite report export payload — section-based narrative assembly
 * for Expert complexity tier (L-03).
 */
export interface IReportExportPayload {
  /** Discriminator. */
  kind: 'report';
  /** Sections composing the report. */
  sections: IReportExportSection[];
  /** Template ID if a report template was used (null for custom composition). */
  templateId: string | null;
  /** Whether sections were auto-composed or manually arranged. */
  compositionMode: 'auto' | 'manual';
}

/** Discriminated union of table and report payloads. */
export type ExportPayload = ITableExportPayload | IReportExportPayload;

// ── T02 BIC Ownership (L-02) ────────────────────────────────────────────

/**
 * BIC ownership step configuration for export review/approval (L-02).
 *
 * Review/approval and post-export handoff steps create granular BIC
 * ownership with avatar projection in export surfaces and My Work.
 */
export interface IExportBicStepConfig {
  /** Unique step identifier. */
  stepId: string;
  /** Human-readable step label. */
  stepLabel: string;
  /** Whether this step blocks export completion. */
  blocking: boolean;
  /** Owner UPN. */
  ownerUpn: string;
  /** Owner display name. */
  ownerName: string;
  /** Owner role. */
  ownerRole: string;
  /** Expected action description. */
  expectedAction: string;
  /** ISO 8601 due date (null if no deadline). */
  dueDateIso: string | null;
}

// ── T02 Version Provenance (L-06) ───────────────────────────────────────

/**
 * Version provenance reference for immutable artifact stamping (L-06).
 *
 * Links an export artifact to its source versioned record via
 * `@hbc/versioned-record` snapshot identity.
 */
export interface IExportVersionRef {
  /** Versioned record snapshot ID. */
  snapshotId: string;
  /** Version number at time of export. */
  version: number;
  /** Workflow tag at time of export. */
  tag: ExportVersionTag;
  /** ISO 8601 timestamp of the source snapshot. */
  createdAtIso: string;
  /** UPN of the user who created the source snapshot. */
  createdByUpn: string;
}

// ── T02 Telemetry (L-06) ────────────────────────────────────────────────

/**
 * Export telemetry state for the five operational UX KPIs (L-06).
 *
 * Tracks timing, user engagement, retry frequency, and abandonment
 * to drive operational value measurement.
 */
export interface IExportTelemetryState {
  /** ISO 8601 timestamp when the export was requested. */
  requestTimestampIso: string;
  /** ISO 8601 timestamp when rendering started (null if not yet started). */
  renderStartTimestampIso: string | null;
  /** ISO 8601 timestamp when rendering completed (null if not yet complete). */
  renderCompleteTimestampIso: string | null;
  /** Total render duration in milliseconds (null if not yet complete). */
  renderDurationMs: number | null;
  /** Whether the user downloaded the completed artifact. */
  downloadedByUser: boolean;
  /** Whether the user completed a review step. */
  reviewCompletedByUser: boolean;
  /** Number of retry attempts. */
  retryCount: number;
  /** Whether the user abandoned the export before completion. */
  abandonedBeforeComplete: boolean;
  /** Export intent for KPI segmentation. */
  exportIntent: ExportIntent;
  /** Export format for KPI segmentation. */
  exportFormat: ExportFormat;
}

// ── T02 Suppressed Format / Context Delta ────────────────────────────────

/**
 * Suppressed format state — why a format is unavailable for export.
 *
 * Users must understand why a format is enabled, disabled, deferred,
 * or review-gated.
 */
export interface IExportSuppressedFormatState {
  /** The suppressed export format. */
  format: ExportFormat;
  /** Always true (discriminator for suppressed state). */
  suppressed: true;
  /** Machine-readable reason code. */
  reasonCode: ExportUnavailableReasonCode;
  /** User-facing explanation of why this format is unavailable. */
  userMessage: string;
}

/**
 * Context delta state — whether source truth changed materially
 * between request initiation and render completion.
 */
export interface IExportContextDeltaState {
  /** Whether a material context change was detected. */
  detected: boolean;
  /** Field paths that changed. */
  changedFields: string[];
  /** ISO 8601 timestamp when the delta was detected. */
  detectedAtIso: string;
  /** Trust downgrade reason if applicable (null if no downgrade). */
  trustDowngradeReason: ExportTrustDowngradeReasonCode | null;
  /** Whether the user was notified of the context change. */
  userNotified: boolean;
}

/**
 * Export request — top-level orchestration contract.
 *
 * Represents a single export operation from request through receipt.
 * The primitive chooses runtime behavior by pattern, but module adapters
 * still own source payloads and export policy.
 */
export interface IExportRequest {
  /** Unique request identifier. */
  requestId: string;
  /** Requested output format. */
  format: ExportFormat;
  /** Export intent classification. */
  intent: ExportIntent;
  /** Render mode. */
  renderMode: ExportRenderMode;
  /** Complexity tier governing surface depth. */
  complexityTier: ExportComplexityTier;
  /** Source truth stamp. */
  context: IExportSourceTruthStamp;
  /** Artifact metadata (null before render completion). */
  artifact: IExportArtifactMetadata | null;
  /** Receipt state (null before export initiation). */
  receipt: IExportReceiptState | null;
  /** Review steps (empty if no review gates). */
  reviewSteps: IExportReviewStepState[];
  /** Next recommended action (null if no recommendation). */
  nextRecommendedAction: IExportNextRecommendedAction | null;
  /** Failure state (null if no failure). */
  failure: IExportFailureState | null;
  /** Retry state (null if no retries). */
  retry: IExportRetryState | null;
  /** Current artifact confidence. */
  confidence: ExportArtifactConfidence;
  /** Saved view context for view-scoped exports (SF26 handoff, Stage 5.4). */
  savedViewContext: Record<string, unknown> | null;
  /** Discriminated payload — table or report composition (T02). */
  payload: ExportPayload;
  /** Aggregate truth/explainability state (T02). */
  truth: IExportTruthState;
  /** BIC ownership steps (L-02, T02). Empty if no BIC gates. */
  bicSteps: IExportBicStepConfig[];
  /** Version provenance reference (L-06, T02). Null for non-versioned exports. */
  versionRef: IExportVersionRef | null;
  /** Telemetry state for operational KPI tracking (L-06, T02). */
  telemetry: IExportTelemetryState;
  /** Suppressed formats with user-facing reasons (T02). */
  suppressedFormats: IExportSuppressedFormatState[];
  /** Context delta detection state (T02). Null if no delta check performed. */
  contextDelta: IExportContextDeltaState | null;
}

// ── Reason-Code Enums ────────────────────────────────────────────────────

/** Why a format is unavailable for export. */
export type ExportUnavailableReasonCode =
  | 'format-not-supported'
  | 'data-insufficient'
  | 'review-gate-pending'
  | 'offline-not-eligible';

/** Why artifact truth confidence was downgraded. */
export type ExportTrustDowngradeReasonCode =
  | 'source-changed-during-render'
  | 'partial-data'
  | 'timestamp-inference'
  | 'restored-from-cache';

/** Why an export retry was needed. */
export type ExportRetryReasonCode =
  | 'transient-failure'
  | 'timeout'
  | 'offline-replay';

/** Why an export was queued rather than completed immediately. */
export type ExportQueueReasonCode =
  | 'offline-deferred'
  | 'server-render-queued'
  | 'background-sync-pending';

/** Why an export failed. */
export type ExportFailureReasonCode =
  | 'render-error'
  | 'timeout'
  | 'storage-error'
  | 'permission-denied'
  | 'data-validation';

// ── Constants ────────────────────────────────────────────────────────────

/** All supported export formats (L-03). */
export const EXPORT_FORMATS: readonly ExportFormat[] = [
  'csv',
  'xlsx',
  'pdf',
  'print',
] as const;

/** All export receipt lifecycle statuses. */
export const EXPORT_STATUSES: readonly ExportStatus[] = [
  'saved-locally',
  'queued-to-sync',
  'rendering',
  'complete',
  'failed',
  'degraded',
  'restored-receipt',
] as const;

/** All artifact confidence levels. */
export const EXPORT_CONFIDENCE_LEVELS: readonly ExportArtifactConfidence[] = [
  'trusted-synced',
  'queued-local-only',
  'completed-with-degraded-truth',
  'failed-or-partial',
  'restored-needs-review',
] as const;

/** All complexity tiers (L-03). */
export const EXPORT_COMPLEXITY_TIERS: readonly ExportComplexityTier[] = [
  'essential',
  'standard',
  'expert',
] as const;

// ── T02 Constants ────────────────────────────────────────────────────────

/** IndexedDB/Background Sync queue key for offline export replay (L-04, T02). */
export const EXPORT_RUNTIME_SYNC_QUEUE_KEY = 'export-runtime-sync-queue' as const;

/** Export statuses that represent offline-queued state (T02). */
export const EXPORT_RUNTIME_SYNC_STATUSES: readonly ExportStatus[] = [
  'saved-locally',
  'queued-to-sync',
] as const;

/** All complexity tier profiles (T02). */
export const EXPORT_RUNTIME_COMPLEXITY_PROFILES: readonly ExportComplexityTier[] = [
  'essential',
  'standard',
  'expert',
] as const;

/** All artifact confidence states (T02). */
export const EXPORT_RUNTIME_CONFIDENCE_STATES: readonly ExportArtifactConfidence[] = [
  'trusted-synced',
  'queued-local-only',
  'completed-with-degraded-truth',
  'failed-or-partial',
  'restored-needs-review',
] as const;
