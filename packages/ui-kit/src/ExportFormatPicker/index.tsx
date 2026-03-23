/**
 * ExportFormatPicker — SF24-T05
 *
 * Format selection surface with compatibility states, context stamp preview,
 * duplicate guard, and offline status. Pure presentational — data-in, callbacks-out.
 *
 * Governing: SF24-T05, L-03 (complexity), L-04 (offline)
 */

import React from 'react';

// ── Prop Types ───────────────────────────────────────────────────────────

export interface ExportFormatOption {
  /** Format identifier. */
  format: string;
  /** User-facing label. */
  label: string;
  /** Whether this format is compatible with the current payload/module. */
  compatible: boolean;
  /** User-facing reason if incompatible (null if compatible). */
  incompatibleReason: string | null;
  /** Whether this format produces working-data output (CSV/XLSX). */
  isWorkingData: boolean;
  /** Whether this format produces presentation output (PDF/Print). */
  isPresentation: boolean;
}

export interface ExportContextPreview {
  /** Module display label. */
  moduleLabel: string;
  /** Record display label. */
  recordLabel: string;
  /** Snapshot type description. */
  snapshotType: string;
  /** Filter summary (null if no filters). */
  filterSummary: string | null;
  /** Sort summary (null if no sort). */
  sortSummary: string | null;
  /** Column count (null if not restricted). */
  columnCount: number | null;
}

export interface ExportFormatPickerProps {
  /** Available formats with compatibility info. */
  formats: ExportFormatOption[];
  /** Currently selected format (null if none). */
  selectedFormat: string | null;
  /** Context stamp preview for truth visibility. */
  contextPreview: ExportContextPreview | null;
  /** Whether an in-flight equivalent request exists (duplicate guard). */
  duplicateWarning: boolean;
  /** Offline queue status. */
  offlineStatus: 'online' | 'saved-locally' | 'queued-to-sync' | null;
  /** Fired when user selects a format. */
  onSelectFormat: (format: string) => void;
  /** Fired when user confirms export. */
  onConfirm: () => void;
  /** Fired when user cancels. */
  onCancel: () => void;
}

// ── Styles ───────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px',
};

const formatGridStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

const formatChipStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '4px',
  border: '1px solid #edebe9',
  cursor: 'pointer',
  background: '#fff',
  textAlign: 'center',
  minWidth: '80px',
};

const selectedChipStyle: React.CSSProperties = {
  ...formatChipStyle,
  border: '2px solid #0078d4',
  background: '#f3f9ff',
};

const incompatibleChipStyle: React.CSSProperties = {
  ...formatChipStyle,
  opacity: 0.5,
  cursor: 'not-allowed',
};

const contextPreviewStyle: React.CSSProperties = {
  background: '#faf9f8',
  borderRadius: '4px',
  padding: '10px 12px',
  fontSize: '12px',
  color: '#484644',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const warningStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: '#fff4ce',
  borderRadius: '4px',
  fontSize: '12px',
  color: '#797775',
};

const offlineBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '10px',
  fontSize: '11px',
  fontWeight: 600,
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  justifyContent: 'flex-end',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '8px 20px',
  background: '#0078d4',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 600,
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '8px 20px',
  background: 'transparent',
  color: '#484644',
  border: '1px solid #8a8886',
  borderRadius: '4px',
  cursor: 'pointer',
};

const categoryLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  color: '#797775',
  letterSpacing: '0.5px',
};

// ── Component ────────────────────────────────────────────────────────────

/**
 * Format picker with compatibility states, context preview, and safety guards.
 */
export function ExportFormatPicker({
  formats,
  selectedFormat,
  contextPreview,
  duplicateWarning,
  offlineStatus,
  onSelectFormat,
  onConfirm,
  onCancel,
}: ExportFormatPickerProps): React.ReactElement {
  const workingDataFormats = formats.filter(f => f.isWorkingData);
  const presentationFormats = formats.filter(f => f.isPresentation);

  const renderFormatChip = (fmt: ExportFormatOption) => {
    const isSelected = selectedFormat === fmt.format;
    const style = !fmt.compatible
      ? incompatibleChipStyle
      : isSelected
        ? selectedChipStyle
        : formatChipStyle;

    return (
      <button
        key={fmt.format}
        style={style}
        disabled={!fmt.compatible}
        onClick={() => fmt.compatible && onSelectFormat(fmt.format)}
        title={fmt.incompatibleReason ?? undefined}
      >
        <div style={{ fontWeight: 600 }}>{fmt.label}</div>
        {!fmt.compatible && fmt.incompatibleReason && (
          <div style={{ fontSize: '10px', color: '#a4262c' }}>{fmt.incompatibleReason}</div>
        )}
      </button>
    );
  };

  return (
    <div style={containerStyle}>
      {/* Working-data formats */}
      {workingDataFormats.length > 0 && (
        <div>
          <div style={categoryLabelStyle}>Working Data</div>
          <div style={formatGridStyle}>{workingDataFormats.map(renderFormatChip)}</div>
        </div>
      )}

      {/* Presentation formats */}
      {presentationFormats.length > 0 && (
        <div>
          <div style={categoryLabelStyle}>Presentation</div>
          <div style={formatGridStyle}>{presentationFormats.map(renderFormatChip)}</div>
        </div>
      )}

      {/* Context stamp preview */}
      {contextPreview && (
        <div style={contextPreviewStyle}>
          <div><strong>{contextPreview.moduleLabel}</strong> — {contextPreview.recordLabel}</div>
          <div>Snapshot: {contextPreview.snapshotType}</div>
          {contextPreview.filterSummary && <div>Filters: {contextPreview.filterSummary}</div>}
          {contextPreview.sortSummary && <div>Sort: {contextPreview.sortSummary}</div>}
          {contextPreview.columnCount !== null && <div>Columns: {contextPreview.columnCount}</div>}
        </div>
      )}

      {/* Duplicate guard warning */}
      {duplicateWarning && (
        <div style={warningStyle}>
          An equivalent export is already in progress. Submitting again may create a duplicate artifact.
        </div>
      )}

      {/* Offline status badge */}
      {offlineStatus && offlineStatus !== 'online' && (
        <div>
          <span
            style={{
              ...offlineBadgeStyle,
              background: offlineStatus === 'saved-locally' ? '#e1dfdd' : '#deecf9',
              color: offlineStatus === 'saved-locally' ? '#484644' : '#0078d4',
            }}
          >
            {offlineStatus === 'saved-locally' ? 'Saved locally' : 'Queued to sync'}
          </span>
        </div>
      )}

      {/* Actions */}
      <div style={actionsStyle}>
        <button style={secondaryButtonStyle} onClick={onCancel}>
          Cancel
        </button>
        <button
          style={{
            ...primaryButtonStyle,
            opacity: selectedFormat ? 1 : 0.5,
            cursor: selectedFormat ? 'pointer' : 'not-allowed',
          }}
          disabled={!selectedFormat}
          onClick={onConfirm}
        >
          Export
        </button>
      </div>
    </div>
  );
}
