import React, { useState } from 'react';
import { useComplexity } from '@hbc/complexity';
import type { ISeedConfig, ISeedRowMeta } from '../types';
import {
  SEED_PREVIEW_ROW_COUNT_STANDARD,
  SEED_PREVIEW_ROW_COUNT_EXPERT,
} from '../constants';

interface HbcSeedPreviewProps<TSource, TDest> {
  config: ISeedConfig<TSource, TDest>;
  rows: TSource[];
  rowMeta: ISeedRowMeta[];
  activeMapping: Record<string, keyof TDest>;
  onImportConfirmed: () => void;
  onBack: () => void;
  testId?: string;
}

/**
 * Preview table showing the first N mapped rows with validation error highlighting.
 *
 * D-04: If allowPartialImport is true and errors exist, the CTA shows
 *       "Import N valid rows, skip M errors". If false, CTA is disabled
 *       and user must resolve all errors first.
 *
 * D-09: Standard tier shows first 20 rows. Expert tier shows first 50 rows
 *       plus per-row error count in a side column. Essential tier renders
 *       a simplified row count summary only (no table).
 */
export function HbcSeedPreview<TSource, TDest>({
  config,
  rows,
  rowMeta,
  activeMapping,
  onImportConfirmed,
  onBack,
  testId = 'hbc-seed-preview',
}: HbcSeedPreviewProps<TSource, TDest>) {
  const { tier } = useComplexity();

  const validCount = rowMeta.filter((m) => m.isValid).length;
  const errorCount = rowMeta.filter((m) => !m.isValid).length;
  const canImport =
    config.allowPartialImport ? validCount > 0 : errorCount === 0;

  // Essential tier: simplified summary only
  if (tier === 'essential') {
    return (
      <div data-testid={testId} className="hbc-seed-preview hbc-seed-preview--essential">
        <div className="hbc-seed-preview__summary" data-testid={`${testId}-summary`}>
          <span className="hbc-seed-preview__row-count">
            {rows.length.toLocaleString()} rows ready to import
          </span>
          {errorCount > 0 && (
            <span className="hbc-seed-preview__error-count hbc-seed-preview__error-count--amber">
              {errorCount} rows have validation issues
              {config.allowPartialImport
                ? ' — these will be skipped'
                : ' — all errors must be resolved before importing'}
            </span>
          )}
        </div>
        <div className="hbc-seed-preview__actions">
          <button type="button" onClick={onBack}>Back</button>
          <button
            type="button"
            className="hbc-seed-preview__confirm-button"
            onClick={onImportConfirmed}
            disabled={!canImport}
            data-testid={`${testId}-confirm-button`}
          >
            {config.allowPartialImport && errorCount > 0
              ? `Import ${validCount.toLocaleString()} rows, skip ${errorCount}`
              : `Import ${validCount.toLocaleString()} rows`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <HbcSeedPreviewTable
      config={config}
      rows={rows}
      rowMeta={rowMeta}
      activeMapping={activeMapping}
      onImportConfirmed={onImportConfirmed}
      onBack={onBack}
      testId={testId}
      previewRowCount={
        tier === 'expert' ? SEED_PREVIEW_ROW_COUNT_EXPERT : SEED_PREVIEW_ROW_COUNT_STANDARD
      }
      showErrorColumn={tier === 'expert'}
      validCount={validCount}
      errorCount={errorCount}
      canImport={canImport}
    />
  );
}

interface HbcSeedPreviewTableProps<TSource, TDest>
  extends HbcSeedPreviewProps<TSource, TDest> {
  previewRowCount: number;
  showErrorColumn: boolean;
  validCount: number;
  errorCount: number;
  canImport: boolean;
}

function HbcSeedPreviewTable<TSource, TDest>({
  config,
  rows,
  rowMeta,
  activeMapping,
  onImportConfirmed,
  onBack,
  testId,
  previewRowCount,
  showErrorColumn,
  validCount,
  errorCount,
  canImport,
}: HbcSeedPreviewTableProps<TSource, TDest>) {
  const [showAllErrors, setShowAllErrors] = useState(false);

  // Columns to display: source columns that are mapped
  const displayColumns = Object.entries(activeMapping)
    .map(([sourceCol, destField]) => {
      const mapping = config.fieldMappings.find((m) => m.destinationField === destField);
      return { sourceCol, destField, label: mapping?.label ?? String(destField) };
    });

  const previewRows = rows.slice(0, previewRowCount);

  return (
    <div data-testid={testId} className="hbc-seed-preview">
      {/* Summary bar */}
      <div className="hbc-seed-preview__summary-bar" data-testid={`${testId}-summary-bar`}>
        <span className="hbc-seed-preview__total">
          {rows.length.toLocaleString()} total rows
        </span>
        <span className="hbc-seed-preview__valid hbc-seed-preview__valid--green">
          {validCount.toLocaleString()} ready
        </span>
        {errorCount > 0 && (
          <span className="hbc-seed-preview__errors hbc-seed-preview__errors--red">
            {errorCount.toLocaleString()} {errorCount === 1 ? 'error' : 'errors'}
          </span>
        )}
        {rows.length > previewRowCount && (
          <span className="hbc-seed-preview__truncated">
            (showing first {previewRowCount.toLocaleString()} of {rows.length.toLocaleString()})
          </span>
        )}
      </div>

      {/* Data table */}
      <div className="hbc-seed-preview__table-wrapper" role="region" aria-label="Import preview">
        <table className="hbc-seed-preview__table">
          <thead>
            <tr>
              <th scope="col" className="hbc-seed-preview__row-num">#</th>
              {displayColumns.map(({ sourceCol, label }) => (
                <th key={sourceCol} scope="col">{label}</th>
              ))}
              {showErrorColumn && <th scope="col">Errors</th>}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, index) => {
              const meta = rowMeta[index];
              const rawRow = row as Record<string, string>;
              return (
                <tr
                  key={index}
                  className={meta?.isValid ? '' : 'hbc-seed-preview__row--error'}
                  data-testid={`${testId}-row-${index + 1}`}
                >
                  <td className="hbc-seed-preview__row-num">{index + 1}</td>
                  {displayColumns.map(({ sourceCol, label }) => {
                    const cellError = meta?.errors.find((e) => e.column === sourceCol);
                    return (
                      <td
                        key={sourceCol}
                        className={cellError ? 'hbc-seed-preview__cell--error' : ''}
                        title={cellError?.error}
                        aria-label={
                          cellError ? `${label}: ${rawRow[sourceCol]} — Error: ${cellError.error}` : undefined
                        }
                        data-testid={cellError ? `${testId}-cell-error-${index + 1}-${sourceCol.replace(/\s+/g, '-')}` : undefined}
                      >
                        {rawRow[sourceCol] ?? ''}
                      </td>
                    );
                  })}
                  {showErrorColumn && (
                    <td className="hbc-seed-preview__error-count-cell">
                      {meta?.errors.length > 0 ? (
                        <span className="hbc-seed-preview__error-badge">
                          {meta.errors.length}
                        </span>
                      ) : null}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Error list (Expert: show all errors below table) */}
      {showErrorColumn && errorCount > 0 && (
        <details
          className="hbc-seed-preview__error-details"
          open={showAllErrors}
          onToggle={(e) => setShowAllErrors((e.target as HTMLDetailsElement).open)}
          data-testid={`${testId}-error-details`}
        >
          <summary>{errorCount} validation {errorCount === 1 ? 'error' : 'errors'} — click to expand</summary>
          <ul className="hbc-seed-preview__error-list">
            {rowMeta.flatMap((m) => m.errors).map((err, i) => (
              <li key={i} className="hbc-seed-preview__error-item">
                Row {err.row}, {err.column}: &quot;{err.value}&quot; — {err.error}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Actions */}
      <div className="hbc-seed-preview__actions">
        <button
          type="button"
          onClick={onBack}
          data-testid={`${testId}-back-button`}
        >
          Back to Mapping
        </button>
        {!config.allowPartialImport && errorCount > 0 && (
          <p className="hbc-seed-preview__error-notice" role="alert">
            All errors must be resolved in the source file before importing.
            Fix the errors and re-upload.
          </p>
        )}
        <button
          type="button"
          className="hbc-seed-preview__confirm-button"
          onClick={onImportConfirmed}
          disabled={!canImport}
          data-testid={`${testId}-confirm-button`}
        >
          {config.allowPartialImport && errorCount > 0
            ? `Import ${validCount.toLocaleString()} rows, skip ${errorCount}`
            : `Import ${rows.length.toLocaleString()} rows`}
        </button>
      </div>
    </div>
  );
}
