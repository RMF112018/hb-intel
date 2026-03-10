import React from 'react';
import { useComplexity } from '@hbc/complexity';
import type { SeedStatus, ISeedResult } from '../types';
import { seedStatusLabel, seedStatusColorClass } from '../constants';

interface HbcSeedProgressProps {
  totalRows: number;
  importedRows: number;
  errorRows: number;
  status: SeedStatus;
  result: ISeedResult | null;
  /** Called when user clicks "Retry failed rows" (D-04, allowPartialImport only) */
  onRetryErrors?: () => void;
  /** Called when user clicks "Start new import" */
  onReset?: () => void;
  testId?: string;
}

/**
 * Real-time import progress bar with per-batch updates and final result summary.
 *
 * D-04: If status is 'partial', shows "X rows imported, Y failed" with
 *       a downloadable error report CTA and optional "Retry failed rows".
 *
 * D-05: Updated after each batch completes. Progress is calculated as
 *       (importedRows + errorRows) / totalRows.
 *
 * D-09: All complexity tiers see the progress bar.
 *       Expert tier shows per-batch timing detail.
 */
export function HbcSeedProgress({
  totalRows,
  importedRows,
  errorRows,
  status,
  result,
  onRetryErrors,
  onReset,
  testId = 'hbc-seed-progress',
}: HbcSeedProgressProps) {
  const { tier } = useComplexity();
  const processedRows = importedRows + errorRows;
  const progressPercent =
    totalRows > 0 ? Math.round((processedRows / totalRows) * 100) : 0;
  const pendingRows = Math.max(0, totalRows - processedRows);

  const isTerminal = status === 'complete' || status === 'partial' || status === 'failed';

  return (
    <div data-testid={testId} className="hbc-seed-progress">
      {/* Status label */}
      <div
        className={`hbc-seed-progress__status ${seedStatusColorClass[status]}`}
        data-testid={`${testId}-status`}
      >
        {seedStatusLabel[status]}
      </div>

      {/* Progress bar */}
      {status !== 'idle' && (
        <div
          className="hbc-seed-progress__bar-wrapper"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Import progress: ${progressPercent}%`}
          data-testid={`${testId}-bar`}
        >
          {/* Imported segment (green) */}
          {importedRows > 0 && (
            <div
              className="hbc-seed-progress__bar-segment hbc-seed-progress__bar-segment--success"
              style={{ width: `${(importedRows / totalRows) * 100}%` }}
              data-testid={`${testId}-bar-success`}
            />
          )}
          {/* Error segment (red) */}
          {errorRows > 0 && (
            <div
              className="hbc-seed-progress__bar-segment hbc-seed-progress__bar-segment--error"
              style={{ width: `${(errorRows / totalRows) * 100}%` }}
              data-testid={`${testId}-bar-error`}
            />
          )}
          {/* Pending segment (grey) */}
          {pendingRows > 0 && (
            <div
              className="hbc-seed-progress__bar-segment hbc-seed-progress__bar-segment--pending"
              style={{ width: `${(pendingRows / totalRows) * 100}%` }}
            />
          )}
        </div>
      )}

      {/* Count detail */}
      <div className="hbc-seed-progress__counts" data-testid={`${testId}-counts`}>
        {status === 'importing' && (
          <span>{importedRows.toLocaleString()} of {totalRows.toLocaleString()} imported</span>
        )}
        {isTerminal && result && (
          <>
            <span className="hbc-seed-progress__count-success">
              {result.successCount.toLocaleString()} imported
            </span>
            {result.errorCount > 0 && (
              <span className="hbc-seed-progress__count-error">
                {result.errorCount.toLocaleString()} failed
              </span>
            )}
            {result.skippedCount > 0 && (
              <span className="hbc-seed-progress__count-skipped">
                {result.skippedCount.toLocaleString()} skipped
              </span>
            )}
          </>
        )}
      </div>

      {/* Expert: batch detail */}
      {tier === 'expert' && status === 'importing' && (
        <div className="hbc-seed-progress__batch-detail" data-testid={`${testId}-batch-detail`}>
          <span>Batch in progress…</span>
        </div>
      )}

      {/* Terminal state actions */}
      {isTerminal && (
        <div className="hbc-seed-progress__result" data-testid={`${testId}-result`}>
          {/* Error report download (D-04) */}
          {result && result.errorCount > 0 && result.sourceDocumentUrl && (
            <a
              href={`/api/data-seeding/error-report/${result.sourceDocumentId}`}
              download={`import-errors-${new Date().toISOString().slice(0, 10)}.csv`}
              className="hbc-seed-progress__error-report-link"
              data-testid={`${testId}-error-report-link`}
            >
              Download error report ({result.errorCount.toLocaleString()} rows)
            </a>
          )}

          {/* Retry failed rows (D-04, partial import only) */}
          {status === 'partial' && onRetryErrors && (
            <button
              type="button"
              className="hbc-seed-progress__retry-button"
              onClick={onRetryErrors}
              data-testid={`${testId}-retry-button`}
            >
              Retry {result?.errorCount.toLocaleString() ?? ''} failed rows
            </button>
          )}

          {/* Failed: must re-upload */}
          {status === 'failed' && (
            <p className="hbc-seed-progress__failed-message" role="alert">
              Import failed. Please check your connection and try again.
            </p>
          )}

          {/* Reset / start new import */}
          {onReset && (
            <button
              type="button"
              className="hbc-seed-progress__reset-button"
              onClick={onReset}
              data-testid={`${testId}-reset-button`}
            >
              Start new import
            </button>
          )}
        </div>
      )}
    </div>
  );
}
