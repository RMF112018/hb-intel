/**
 * SF28-T06 — ActivityDiffPopover.
 *
 * Renders field-level diffs for an activity event: field label,
 * previous value (from), new value (to), and suppression reason
 * when the diff is redacted or unavailable.
 *
 * Governing: SF28-T06, L-08/L-10
 */
import React from 'react';

export interface ActivityDiffEntry {
  fieldLabel: string;
  from: string | null;
  to: string | null;
  suppressionReason?: 'sensitive-field' | 'too-large' | 'binary-content' | string;
}

export interface ActivityDiffPopoverProps {
  /** Diff entries to render */
  entries: ActivityDiffEntry[];
  /** Whether the popover is open */
  open: boolean;
  /** Handler to close the popover */
  onClose?: () => void;
}

const MAX_VALUE_LENGTH = 120;

function truncateValue(value: string | null): string {
  if (!value) return '—';
  if (value.length <= MAX_VALUE_LENGTH) return value;
  return value.slice(0, MAX_VALUE_LENGTH) + '…';
}

const SUPPRESSION_LABELS: Record<string, string> = {
  'sensitive-field': 'Redacted — sensitive data',
  'too-large': 'Truncated — value too large to display',
  'binary-content': 'Not displayed — binary content',
};

const containerStyle: React.CSSProperties = {
  border: '1px solid #e0e0e0',
  borderRadius: 4,
  padding: 12,
  backgroundColor: '#fff',
  fontFamily: 'inherit',
  fontSize: 12,
  maxWidth: 400,
  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
  fontWeight: 600,
  fontSize: 13,
};

const rowStyle: React.CSSProperties = {
  padding: '6px 0',
  borderBottom: '1px solid #f5f5f5',
};

const labelStyle: React.CSSProperties = {
  fontWeight: 500,
  marginBottom: 2,
};

const valueStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 11,
  color: '#444',
};

const suppressionStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#856404',
  backgroundColor: '#fff3cd',
  padding: '1px 5px',
  borderRadius: 3,
  display: 'inline-block',
  marginTop: 2,
};

export function ActivityDiffPopover({
  entries,
  open,
  onClose,
}: ActivityDiffPopoverProps): React.ReactElement | null {
  if (!open || entries.length === 0) return null;

  return (
    <div data-testid="activity-diff-popover" style={containerStyle} role="dialog">
      <div style={headerStyle}>
        <span>Changes ({entries.length})</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {entries.map((entry, i) => (
        <div key={`${entry.fieldLabel}-${i}`} style={rowStyle} data-testid="diff-entry">
          <div style={labelStyle}>{entry.fieldLabel}</div>

          {entry.suppressionReason ? (
            <span style={suppressionStyle}>
              {SUPPRESSION_LABELS[entry.suppressionReason] ?? entry.suppressionReason}
            </span>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ ...valueStyle, textDecoration: 'line-through', color: '#c00' }}>
                {truncateValue(entry.from)}
              </span>
              <span style={{ color: '#888' }}>→</span>
              <span style={{ ...valueStyle, color: '#080' }}>
                {truncateValue(entry.to)}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
