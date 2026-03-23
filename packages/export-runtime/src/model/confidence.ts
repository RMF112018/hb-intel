/**
 * SF24-T03 — Artifact confidence computation and context delta detection.
 *
 * Pure functions that derive confidence level from receipt state, truth
 * freshness, and render completion status.
 *
 * Governing: SF24-T03, L-01 (primitive ownership)
 */

import type {
  ExportArtifactConfidence,
  IExportRequest,
  IExportSourceTruthStamp,
  IExportContextDeltaState,
  ExportTrustDowngradeReasonCode,
} from '../types/index.js';

/**
 * Compute artifact confidence from current request state.
 *
 * @param request - Current export request.
 * @returns The computed confidence level.
 */
export function computeArtifactConfidence(request: IExportRequest): ExportArtifactConfidence {
  const status = request.receipt?.status;

  if (!status) return 'failed-or-partial';

  // Restored receipts always need review
  if (status === 'restored-receipt') return 'restored-needs-review';

  // Failed exports
  if (status === 'failed') return 'failed-or-partial';

  // Queued/local states
  if (status === 'saved-locally' || status === 'queued-to-sync') return 'queued-local-only';

  // Rendering in progress — still local-only confidence
  if (status === 'rendering') return 'queued-local-only';

  // Degraded
  if (status === 'degraded') return 'completed-with-degraded-truth';

  // Complete — check for truth downgrades or context delta
  if (status === 'complete') {
    const hasDowngrades = request.truth.truthDowngradeReasons.length > 0;
    const hasDelta = request.contextDelta?.detected === true;

    if (hasDowngrades || hasDelta) return 'completed-with-degraded-truth';
    return 'trusted-synced';
  }

  return 'failed-or-partial';
}

/**
 * Detect material changes between the original and current source truth stamps.
 *
 * @param original - Truth stamp at time of export request.
 * @param current - Truth stamp at time of comparison.
 * @param now - Optional injectable timestamp for testing.
 * @returns Context delta state, or null if no material changes detected.
 */
export function detectContextDelta(
  original: IExportSourceTruthStamp,
  current: IExportSourceTruthStamp,
  now?: Date,
): IExportContextDeltaState | null {
  const changedFields: string[] = [];

  if (original.recordId !== current.recordId) changedFields.push('recordId');
  if (original.snapshotTimestampIso !== current.snapshotTimestampIso) changedFields.push('snapshotTimestampIso');
  if (original.snapshotType !== current.snapshotType) changedFields.push('snapshotType');
  if (original.appliedSort !== current.appliedSort) changedFields.push('appliedSort');

  // Compare filters (shallow JSON comparison)
  if (JSON.stringify(original.appliedFilters) !== JSON.stringify(current.appliedFilters)) {
    changedFields.push('appliedFilters');
  }

  // Compare visible columns
  if (JSON.stringify(original.visibleColumns) !== JSON.stringify(current.visibleColumns)) {
    changedFields.push('visibleColumns');
  }

  if (changedFields.length === 0) return null;

  const trustDowngradeReason: ExportTrustDowngradeReasonCode =
    changedFields.includes('snapshotTimestampIso')
      ? 'source-changed-during-render'
      : 'partial-data';

  return {
    detected: true,
    changedFields,
    detectedAtIso: (now ?? new Date()).toISOString(),
    trustDowngradeReason,
    userNotified: false,
  };
}
