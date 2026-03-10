# SF09-T07 — HbcSeedPreview and HbcSeedProgress: `@hbc/data-seeding`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-09-Shared-Feature-Data-Seeding.md`
**Decisions Applied:** D-04 (partial import), D-05 (batch progress), D-09 (complexity gating)
**Estimated Effort:** 0.50 sprint-weeks
**Depends On:** T01–T06

> **Doc Classification:** Canonical Normative Plan — SF09-T07 component task; sub-plan of `SF09-Data-Seeding.md`.

---

## Objective

Implement `HbcSeedPreview` (data table with validation error highlighting, import confirm CTA) and `HbcSeedProgress` (real-time batch progress bar with result summary and error report download).

---

## 3-Line Plan

1. Implement `HbcSeedPreview`: tabular view of first N mapped rows (20 in Standard, 50 in Expert), error cells highlighted in red with tooltip, summary row count ("48 rows ready, 3 have errors"), import CTA disabled when `allowPartialImport: false` and errors exist.
2. Implement `HbcSeedProgress`: progress bar segmented into imported (green) + errors (red) + pending (grey), per-batch count updates, final result summary with downloadable CSV error report CTA.
3. Apply D-09 complexity gating: Preview is Standard+ only (Essential shows row count summary instead); Progress is visible in all tiers with tier-appropriate detail.

---

## `src/components/HbcSeedPreview.tsx`

```tsx
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
  const { variant } = useComplexity();

  const validCount = rowMeta.filter((m) => m.isValid).length;
  const errorCount = rowMeta.filter((m) => !m.isValid).length;
  const canImport =
    config.allowPartialImport ? validCount > 0 : errorCount === 0;

  // Essential tier: simplified summary only
  if (variant === 'essential') {
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
        variant === 'expert' ? SEED_PREVIEW_ROW_COUNT_EXPERT : SEED_PREVIEW_ROW_COUNT_STANDARD
      }
      showErrorColumn={variant === 'expert'}
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
```

---

## `src/components/HbcSeedProgress.tsx`

```tsx
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
  const { variant } = useComplexity();
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
      {variant === 'expert' && status === 'importing' && (
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
```

---

## Five-Step Orchestrating Component (Reference)

The four components (`HbcSeedUploader`, `HbcSeedMapper`, `HbcSeedPreview`, `HbcSeedProgress`) are orchestrated by a consuming-module-level component. Here is the standard pattern using `useSeedImport`:

```tsx
import { useComplexity } from '@hbc/complexity';
import {
  useSeedImport, HbcSeedUploader, HbcSeedMapper,
  HbcSeedPreview, HbcSeedProgress
} from '@hbc/data-seeding';

function BdLeadsImporter({ user }) {
  const { variant } = useComplexity();
  const seedState = useSeedImport(bdLeadsImportConfig, {
    userId: user.id,
    userName: user.displayName,
  });

  // Essential: skip previewing state; go straight to importing after file loaded
  const effectiveStatus =
    variant === 'essential' && seedState.status === 'previewing'
      ? 'importing'
      : seedState.status;

  return (
    <div>
      <HbcSeedUploader
        config={bdLeadsImportConfig}
        onFileLoaded={seedState.onMappingConfirmed ? undefined : undefined}
        disabled={effectiveStatus === 'importing'}
      />
      {effectiveStatus === 'previewing' && (
        <>
          <HbcSeedMapper
            config={bdLeadsImportConfig}
            detectedHeaders={seedState.detectedHeaders}
            autoMapping={seedState.activeMapping}
            onMappingConfirmed={seedState.onMappingConfirmed}
          />
          <HbcSeedPreview
            config={bdLeadsImportConfig}
            rows={seedState.rows}
            rowMeta={seedState.rowMeta}
            activeMapping={seedState.activeMapping}
            onImportConfirmed={seedState.onImportConfirmed}
            onBack={seedState.onReset}
          />
        </>
      )}
      {(effectiveStatus === 'importing' || effectiveStatus === 'complete' ||
        effectiveStatus === 'partial' || effectiveStatus === 'failed') && (
        <HbcSeedProgress
          totalRows={seedState.rows.length}
          importedRows={seedState.importedCount}
          errorRows={seedState.importErrorCount}
          status={effectiveStatus}
          result={seedState.result}
          onRetryErrors={seedState.onRetryErrors}
          onReset={seedState.onReset}
        />
      )}
    </div>
  );
}
```

---

## Verification Commands

```bash
# Type-check
pnpm --filter @hbc/data-seeding check-types

# Run component tests
pnpm --filter @hbc/data-seeding test -- --grep "HbcSeedPreview|HbcSeedProgress"

# Verify Essential tier renders simplified view for Preview
# Verify Standard tier renders 20 rows in Preview
# Verify Expert tier renders 50 rows + error column in Preview
pnpm --filter @hbc/data-seeding test -- --grep "complexity.*preview|preview.*essential|preview.*expert"

# Verify Progress renders segmented bar with correct widths
pnpm --filter @hbc/data-seeding test -- --grep "HbcSeedProgress.*bar|progress.*segment"
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF09-T07 completed: 2026-03-10
- HbcSeedPreview: full implementation with Essential summary, Standard table (20 rows), Expert table (50 rows + error column)
- HbcSeedProgress: segmented progress bar, terminal state actions, Expert batch detail
- Fix applied: useComplexity() returns `tier` not `variant` (4 occurrences in Preview, 2 in Progress)
- Verification: check-types ✓, build ✓, lint ✓ (zero errors)
Note: HbcSeedPreview's error cell tooltip uses title attribute for simplicity.
For Expert tier, a Popover from @hbc/ui-kit/app-shell should be considered
if tooltip accessibility requirements exceed what title provides.
Next: SF09-T08-Platform-Wiring.md
-->
