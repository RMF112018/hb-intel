/**
 * SF24-T06 — ExportProgressToast composition shell.
 *
 * Wires IExportRequest receipt/failure/retry state to @hbc/ui-kit
 * ExportProgressToast props.
 *
 * Governing: SF24-T06, L-01 (primitive ownership)
 */

import React, { useMemo } from 'react';
import { ExportProgressToast } from '@hbc/ui-kit';
import type { IExportRequest } from '../types/index.js';

// ── Props ────────────────────────────────────────────────────────────────

export interface ExportProgressToastShellProps {
  /** Current export request. */
  request: IExportRequest;
  /** Fired when user clicks retry. */
  onRetry?: () => void;
  /** Fired when user dismisses the toast. */
  onDismiss?: () => void;
  /** Fired when user clicks "View receipt". */
  onViewReceipt?: () => void;
}

// ── Status messages ──────────────────────────────────────────────────────

const STATUS_MESSAGES: Record<string, string> = {
  'saved-locally': 'Export saved locally',
  'queued-to-sync': 'Queued to sync',
  'rendering': 'Generating export...',
  'complete': 'Export complete',
  'failed': 'Export failed',
  'degraded': 'Export completed with reduced confidence',
  'restored-receipt': 'Receipt restored from cache',
};

// ── Shell ────────────────────────────────────────────────────────────────

/**
 * Wires export request state to the ExportProgressToast ui-kit component.
 */
export function ExportProgressToastShell({
  request,
  onRetry,
  onDismiss,
  onViewReceipt,
}: ExportProgressToastShellProps): React.ReactElement {
  const status = request.receipt?.status ?? 'failed';

  const statusMessage = STATUS_MESSAGES[status] ?? 'Unknown status';

  const explainMessage = useMemo(() => {
    if (request.failure) return request.failure.userMessage;
    if (request.contextDelta?.detected) return 'Source data changed during export generation';
    if (status === 'degraded' && request.truth.truthDowngradeReasons.length > 0) {
      return `Confidence reduced: ${request.truth.truthDowngradeReasons.join(', ')}`;
    }
    if (status === 'restored-receipt') return 'This receipt was restored from offline cache — review recommended';
    return null;
  }, [request.failure, request.contextDelta, request.truth.truthDowngradeReasons, status]);

  const retryable = request.retry?.canRetry ?? false;

  const retryMessage = useMemo(() => {
    if (!retryable || !request.retry) return null;
    return `Retry attempt ${request.retry.attemptCount} of ${request.retry.maxAttempts}`;
  }, [retryable, request.retry]);

  return (
    <ExportProgressToast
      status={status as ExportProgressToastShellProps['request']['receipt'] extends null ? never : typeof status}
      statusMessage={statusMessage}
      explainMessage={explainMessage}
      artifactUrl={request.receipt?.artifactUrl ?? null}
      retryable={retryable}
      retryMessage={retryMessage}
      onRetry={onRetry}
      onDismiss={onDismiss}
      onViewReceipt={onViewReceipt}
    />
  );
}
