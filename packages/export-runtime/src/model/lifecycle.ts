/**
 * SF24-T03 — Export lifecycle state machine.
 *
 * Deterministic lifecycle transitions, request creation, and monotonic
 * status enforcement. No silent transitions — every state change is
 * validated against VALID_TRANSITIONS.
 *
 * Governing: SF24-T03, L-01 (primitive ownership), L-02 (BIC steps)
 */

import type {
  ExportFormat,
  ExportIntent,
  ExportRenderMode,
  ExportStatus,
  ExportComplexityTier,
  ExportPayload,
  IExportSourceTruthStamp,
  IExportBicStepConfig,
  IExportVersionRef,
  IExportRequest,
  IExportReceiptState,
  IExportTruthState,
  IExportTelemetryState,
  ExportTrustDowngradeReasonCode,
} from '../types/index.js';

import { computeArtifactConfidence } from './confidence.js';

// ── Input Contract ───────────────────────────────────────────────────────

/**
 * Input for creating a new export request.
 * Module adapters provide this; the primitive owns lifecycle from here.
 */
export interface IExportRequestInput {
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
  /** Discriminated payload — table or report. */
  payload: ExportPayload;
  /** BIC ownership steps (optional). */
  bicSteps?: IExportBicStepConfig[];
  /** Version provenance reference (optional). */
  versionRef?: IExportVersionRef | null;
  /** Saved view context (optional, SF26 handoff). */
  savedViewContext?: Record<string, unknown> | null;
}

// ── Valid Transitions ────────────────────────────────────────────────────

/**
 * Monotonic lifecycle transition map.
 *
 * `saved-locally → queued-to-sync → rendering → complete | failed`
 * Plus: `complete → degraded`, any terminal → `restored-receipt`.
 */
export const VALID_TRANSITIONS: Readonly<Record<ExportStatus, readonly ExportStatus[]>> = {
  'saved-locally': ['queued-to-sync', 'rendering', 'failed'],
  'queued-to-sync': ['rendering', 'failed'],
  'rendering': ['complete', 'failed'],
  'complete': ['degraded'],
  'failed': ['restored-receipt'],
  'degraded': ['restored-receipt'],
  'restored-receipt': [],
} as const;

// ── Create Request ───────────────────────────────────────────────────────

/**
 * Create a new export request with initial lifecycle state.
 *
 * @param input - Module-provided export parameters.
 * @param now - Optional injectable timestamp for testing.
 * @returns Fully initialized IExportRequest in `saved-locally` state.
 * @throws If required fields are missing or payload discriminator is invalid.
 */
export function createExportRequest(input: IExportRequestInput, now?: Date): IExportRequest {
  const timestamp = (now ?? new Date()).toISOString();

  // Validation
  if (!input.format) throw new Error('ExportRequest: format is required');
  if (!input.intent) throw new Error('ExportRequest: intent is required');
  if (!input.context?.moduleKey) throw new Error('ExportRequest: context.moduleKey is required');
  if (!input.context?.projectId) throw new Error('ExportRequest: context.projectId is required');
  if (!input.context?.recordId) throw new Error('ExportRequest: context.recordId is required');
  if (!input.payload?.kind) throw new Error('ExportRequest: payload.kind is required');

  const requestId = crypto.randomUUID();

  // Build truth state from context + payload
  const truth: IExportTruthState = {
    sourceTruthStamp: input.context,
    snapshotType: input.context.snapshotType,
    filtersApplied: input.context.appliedFilters !== null,
    sortApplied: input.context.appliedSort !== null,
    columnsRestricted: input.context.visibleColumns !== null,
    selectedRowsOnly: input.payload.kind === 'table' && input.payload.selectedRowIds !== null,
    composedSections: input.payload.kind === 'report'
      ? input.payload.sections.filter(s => s.included).map(s => s.sectionId)
      : null,
    sourceTruthChangedDuringRender: false,
    truthDowngradeReasons: [],
  };

  // Build initial receipt
  const receipt: IExportReceiptState = {
    receiptId: crypto.randomUUID(),
    status: 'saved-locally',
    confidence: 'queued-local-only',
    createdAtIso: timestamp,
    completedAtIso: null,
    artifactUrl: null,
    restoredFromCache: false,
  };

  // Build initial telemetry
  const telemetry: IExportTelemetryState = {
    requestTimestampIso: timestamp,
    renderStartTimestampIso: null,
    renderCompleteTimestampIso: null,
    renderDurationMs: null,
    downloadedByUser: false,
    reviewCompletedByUser: false,
    retryCount: 0,
    abandonedBeforeComplete: false,
    exportIntent: input.intent,
    exportFormat: input.format,
  };

  const request: IExportRequest = {
    requestId,
    format: input.format,
    intent: input.intent,
    renderMode: input.renderMode,
    complexityTier: input.complexityTier,
    context: input.context,
    artifact: null,
    receipt,
    reviewSteps: [],
    nextRecommendedAction: null,
    failure: null,
    retry: null,
    confidence: 'queued-local-only',
    savedViewContext: input.savedViewContext ?? null,
    payload: input.payload,
    truth,
    bicSteps: input.bicSteps ?? [],
    versionRef: input.versionRef ?? null,
    telemetry,
    suppressedFormats: [],
    contextDelta: null,
  };

  return request;
}

// ── Transition Status ────────────────────────────────────────────────────

/**
 * Transition an export request to a new lifecycle status.
 *
 * Enforces monotonic transitions per VALID_TRANSITIONS. Returns a new
 * immutable request object — never mutates the input.
 *
 * @param request - Current export request state.
 * @param targetStatus - Desired next status.
 * @param now - Optional injectable timestamp for testing.
 * @returns New IExportRequest with updated status, confidence, and telemetry.
 * @throws If the transition is not allowed from the current status.
 */
export function transitionExportStatus(
  request: IExportRequest,
  targetStatus: ExportStatus,
  now?: Date,
): IExportRequest {
  const currentStatus = request.receipt?.status;
  if (!currentStatus) {
    throw new Error(`ExportLifecycle: cannot transition — request has no receipt`);
  }

  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed?.includes(targetStatus)) {
    throw new Error(
      `ExportLifecycle: invalid transition ${currentStatus} → ${targetStatus}. ` +
      `Allowed: [${allowed?.join(', ') ?? 'none'}]`,
    );
  }

  const timestamp = (now ?? new Date()).toISOString();

  // Update receipt
  const updatedReceipt: IExportReceiptState = {
    ...request.receipt!,
    status: targetStatus,
    completedAtIso: targetStatus === 'complete' || targetStatus === 'failed'
      ? timestamp
      : request.receipt!.completedAtIso,
    restoredFromCache: targetStatus === 'restored-receipt' ? true : request.receipt!.restoredFromCache,
  };

  // Update telemetry timestamps
  const updatedTelemetry: IExportTelemetryState = {
    ...request.telemetry,
    renderStartTimestampIso: targetStatus === 'rendering'
      ? timestamp
      : request.telemetry.renderStartTimestampIso,
    renderCompleteTimestampIso: targetStatus === 'complete' || targetStatus === 'failed'
      ? timestamp
      : request.telemetry.renderCompleteTimestampIso,
    renderDurationMs: targetStatus === 'complete' && request.telemetry.renderStartTimestampIso
      ? new Date(timestamp).getTime() - new Date(request.telemetry.renderStartTimestampIso).getTime()
      : request.telemetry.renderDurationMs,
  };

  // Update truth if degraded
  const updatedTruth: IExportTruthState = targetStatus === 'degraded'
    ? {
        ...request.truth,
        sourceTruthChangedDuringRender: true,
        truthDowngradeReasons: [
          ...request.truth.truthDowngradeReasons,
          'source-changed-during-render' as ExportTrustDowngradeReasonCode,
        ],
      }
    : request.truth;

  const updated: IExportRequest = {
    ...request,
    receipt: updatedReceipt,
    telemetry: updatedTelemetry,
    truth: updatedTruth,
  };

  // Recompute confidence from updated state
  updated.confidence = computeArtifactConfidence(updated);
  updatedReceipt.confidence = updated.confidence;

  return updated;
}
