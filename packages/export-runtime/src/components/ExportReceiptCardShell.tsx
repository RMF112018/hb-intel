/**
 * SF24-T06 — ExportReceiptCard composition shell.
 *
 * Wires IExportRequest artifact/truth/review/BIC state to @hbc/ui-kit
 * ExportReceiptCard props.
 *
 * Governing: SF24-T06, L-06 (provenance)
 */

import React, { useMemo } from 'react';
import {
  ExportReceiptCard,
  type ExportReceiptDetail,
  type ExportReceiptTrustState,
  type ExportReceiptReviewOwner,
  type ExportReceiptRelatedLink,
} from '@hbc/ui-kit';
import type { IExportRequest } from '../types/index.js';
import { generateExportFileName } from '../model/naming.js';

// ── Props ────────────────────────────────────────────────────────────────

export interface ExportReceiptCardShellProps {
  /** Current export request. */
  request: IExportRequest;
  /** Related deep-links to show on the receipt. */
  relatedLinks?: ExportReceiptRelatedLink[];
  /** Fired when user clicks download. */
  onDownload?: () => void;
  /** Fired when user clicks re-export. */
  onReExport?: () => void;
  /** Fired when user dismisses the receipt. */
  onDismiss?: () => void;
}

// ── Confidence labels ────────────────────────────────────────────────────

const CONFIDENCE_LABELS: Record<string, string> = {
  'trusted-synced': 'Trusted',
  'queued-local-only': 'Local only',
  'completed-with-degraded-truth': 'Degraded',
  'failed-or-partial': 'Failed',
  'restored-needs-review': 'Restored — review needed',
};

// ── Shell ────────────────────────────────────────────────────────────────

/**
 * Wires export request state to the ExportReceiptCard ui-kit component.
 */
export function ExportReceiptCardShell({
  request,
  relatedLinks = [],
  onDownload,
  onReExport,
  onDismiss,
}: ExportReceiptCardShellProps): React.ReactElement {
  const receipt: ExportReceiptDetail = useMemo(() => ({
    fileName: request.artifact?.fileName ?? generateExportFileName(request),
    format: request.format.toUpperCase(),
    intent: request.intent,
    moduleLabel: request.context.moduleKey,
    recordLabel: request.context.recordId,
    snapshotType: request.context.snapshotType === 'point-in-time'
      ? 'Point-in-time snapshot'
      : 'Current view',
    createdAtIso: request.receipt?.createdAtIso ?? request.telemetry.requestTimestampIso,
    createdByName: request.bicSteps[0]?.ownerName ?? 'System',
    filterSummary: request.payload.kind === 'table' ? request.payload.filterSummary : null,
    sortSummary: request.payload.kind === 'table' ? request.payload.sortSummary : null,
    visibleColumns: request.context.visibleColumns,
    selectedRowCount: request.payload.kind === 'table' && request.payload.selectedRowIds
      ? request.payload.selectedRowIds.length
      : null,
    versionNumber: request.versionRef?.version ?? null,
    fileSize: request.artifact?.sizeBytes
      ? `${Math.round(request.artifact.sizeBytes / 1024)} KB`
      : null,
  }), [request]);

  const trustState: ExportReceiptTrustState = useMemo(() => ({
    confidence: CONFIDENCE_LABELS[request.confidence] ?? request.confidence,
    isDegraded: request.confidence === 'completed-with-degraded-truth'
      || request.receipt?.status === 'degraded',
    isRestored: request.receipt?.restoredFromCache === true
      || request.receipt?.status === 'restored-receipt',
    trustMessage: request.truth.truthDowngradeReasons.length > 0
      ? `Confidence reduced: ${request.truth.truthDowngradeReasons.join(', ')}`
      : null,
    staleWarning: request.contextDelta?.detected
      ? `Source data changed after export was requested (${request.contextDelta.changedFields.join(', ')})`
      : null,
  }), [request]);

  const reviewOwners: ExportReceiptReviewOwner[] = useMemo(
    () => request.reviewSteps.map(step => ({
      upn: step.ownerUpn,
      displayName: step.ownerName,
      role: 'Reviewer',
      stepLabel: step.blocking ? 'Blocking review' : 'Advisory review',
      status: step.status,
    })),
    [request.reviewSteps],
  );

  return (
    <ExportReceiptCard
      receipt={receipt}
      trustState={trustState}
      reviewOwners={reviewOwners}
      relatedLinks={relatedLinks}
      onDownload={onDownload}
      onReExport={onReExport}
      onDismiss={onDismiss}
    />
  );
}
