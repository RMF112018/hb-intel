/**
 * SF24-T05 — ExportFormatPicker composition shell.
 *
 * Thin wrapper deriving format options, context preview, and duplicate
 * detection from an IExportRequest, then passing to @hbc/ui-kit
 * ExportFormatPicker.
 *
 * Governing: SF24-T05, L-03 (complexity), L-04 (offline)
 */

import React, { useMemo } from 'react';
import {
  ExportFormatPicker,
  type ExportFormatOption,
  type ExportContextPreview,
} from '@hbc/ui-kit';
import type { IExportRequest } from '../types/index.js';
import { EXPORT_FORMATS } from '../types/index.js';

// ── Props ────────────────────────────────────────────────────────────────

export interface ExportFormatPickerShellProps {
  /** Current export request with context and suppressed formats. */
  request: IExportRequest;
  /** Currently selected format (null if none). */
  selectedFormat: string | null;
  /** Whether a duplicate in-flight request exists. */
  duplicateWarning?: boolean;
  /** Fired when user selects a format. */
  onSelectFormat: (format: string) => void;
  /** Fired when user confirms export. */
  onConfirm: () => void;
  /** Fired when user cancels. */
  onCancel: () => void;
}

// ── Working-data vs presentation classification ─────────────────────────

const WORKING_DATA_FORMATS = new Set(['csv', 'xlsx']);
const PRESENTATION_FORMATS = new Set(['pdf', 'print']);

// ── Shell ────────────────────────────────────────────────────────────────

/**
 * Wires export request state to the ExportFormatPicker ui-kit component.
 */
export function ExportFormatPickerShell({
  request,
  selectedFormat,
  duplicateWarning = false,
  onSelectFormat,
  onConfirm,
  onCancel,
}: ExportFormatPickerShellProps): React.ReactElement {
  // Derive format options from suppressed formats
  const formats: ExportFormatOption[] = useMemo(() => {
    const suppressedMap = new Map(request.suppressedFormats.map(s => [s.format, s]));
    return EXPORT_FORMATS.map(format => {
      const suppressed = suppressedMap.get(format);
      return {
        format,
        label: format.toUpperCase(),
        compatible: !suppressed,
        incompatibleReason: suppressed?.userMessage ?? null,
        isWorkingData: WORKING_DATA_FORMATS.has(format),
        isPresentation: PRESENTATION_FORMATS.has(format),
      };
    });
  }, [request.suppressedFormats]);

  // Derive context preview from truth stamp
  const contextPreview: ExportContextPreview | null = useMemo(() => {
    const ctx = request.context;
    return {
      moduleLabel: ctx.moduleKey,
      recordLabel: ctx.recordId,
      snapshotType: ctx.snapshotType === 'point-in-time' ? 'Point-in-time snapshot' : 'Current view',
      filterSummary: request.payload.kind === 'table' ? request.payload.filterSummary : null,
      sortSummary: request.payload.kind === 'table' ? request.payload.sortSummary : null,
      columnCount: request.payload.kind === 'table' && request.payload.columns
        ? request.payload.columns.filter(c => c.visible).length
        : null,
    };
  }, [request.context, request.payload]);

  // Derive offline status from receipt
  const offlineStatus = useMemo(() => {
    const status = request.receipt?.status;
    if (status === 'saved-locally') return 'saved-locally' as const;
    if (status === 'queued-to-sync') return 'queued-to-sync' as const;
    return 'online' as const;
  }, [request.receipt?.status]);

  return (
    <ExportFormatPicker
      formats={formats}
      selectedFormat={selectedFormat}
      contextPreview={contextPreview}
      duplicateWarning={duplicateWarning}
      offlineStatus={offlineStatus}
      onSelectFormat={onSelectFormat}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
