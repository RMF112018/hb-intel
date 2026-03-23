/**
 * SF24-T01 — Export Runtime TypeScript Contract Stubs.
 *
 * Placeholder types reserving the public API surface for T02 full contracts.
 * Export truth vocabulary, receipt states, artifact confidence, review steps,
 * next recommended export, and retry/failure/restore diagnostics.
 *
 * Governing: SF24-T01, SF24 Master Plan L-01/L-03/L-04/L-06
 */

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
