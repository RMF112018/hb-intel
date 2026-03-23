/**
 * ExportProgressToast — SF24-T06
 *
 * Lifecycle state projection with explainability messages, retry guidance,
 * artifact link, and guarded dismiss. Pure presentational.
 *
 * Governing: SF24-T06, L-03 (complexity), L-04 (offline)
 */

import React from 'react';

// ── Prop Types ───────────────────────────────────────────────────────────

export interface ExportProgressToastProps {
  /** Current lifecycle status. */
  status: 'saved-locally' | 'queued-to-sync' | 'rendering' | 'complete' | 'failed' | 'degraded' | 'restored-receipt';
  /** Primary status message. */
  statusMessage: string;
  /** Explainability message (null if not needed). */
  explainMessage: string | null;
  /** URL to completed artifact (null if not available). */
  artifactUrl: string | null;
  /** Whether the current failure is retryable. */
  retryable: boolean;
  /** User-facing retry guidance (null if not retryable). */
  retryMessage: string | null;
  /** Fired when user clicks retry. */
  onRetry?: () => void;
  /** Fired when user dismisses the toast (guarded). */
  onDismiss?: () => void;
  /** Fired when user clicks "View receipt". */
  onViewReceipt?: () => void;
}

// ── Status Indicators ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { icon: string; color: string; bgColor: string }> = {
  'saved-locally': { icon: '\u2601', color: '#484644', bgColor: '#f3f2f1' },
  'queued-to-sync': { icon: '\u2601', color: '#0078d4', bgColor: '#deecf9' },
  'rendering': { icon: '\u23F3', color: '#0078d4', bgColor: '#deecf9' },
  'complete': { icon: '\u2713', color: '#107c10', bgColor: '#dff6dd' },
  'failed': { icon: '\u2717', color: '#a4262c', bgColor: '#fde7e9' },
  'degraded': { icon: '\u26A0', color: '#797775', bgColor: '#fff4ce' },
  'restored-receipt': { icon: '\u21BB', color: '#8764b8', bgColor: '#f0e6ff' },
};

// ── Styles ───────────────────────────────────────────────────────────────

const toastStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  padding: '12px 16px',
  borderRadius: '4px',
  minWidth: '280px',
  maxWidth: '420px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
};

const iconStyle: React.CSSProperties = {
  fontSize: '18px',
  lineHeight: '1',
  flexShrink: 0,
  marginTop: '2px',
};

const contentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: 1,
};

const messageStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: '13px',
};

const explainStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#484644',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginTop: '4px',
};

const linkButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#0078d4',
  cursor: 'pointer',
  fontSize: '12px',
  padding: 0,
  fontWeight: 600,
};

const dismissStyle: React.CSSProperties = {
  ...linkButtonStyle,
  color: '#797775',
  fontWeight: 400,
};

// ── Component ────────────────────────────────────────────────────────────

/**
 * Export progress toast with lifecycle state projection and explainability.
 */
export function ExportProgressToast({
  status,
  statusMessage,
  explainMessage,
  artifactUrl,
  retryable,
  retryMessage,
  onRetry,
  onDismiss,
  onViewReceipt,
}: ExportProgressToastProps): React.ReactElement {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['failed'];

  return (
    <div style={{ ...toastStyle, background: config.bgColor }}>
      <span style={{ ...iconStyle, color: config.color }}>{config.icon}</span>
      <div style={contentStyle}>
        <span style={{ ...messageStyle, color: config.color }}>{statusMessage}</span>
        {explainMessage && <span style={explainStyle}>{explainMessage}</span>}
        {retryable && retryMessage && <span style={explainStyle}>{retryMessage}</span>}
        <div style={actionsStyle}>
          {retryable && onRetry && (
            <button style={linkButtonStyle} onClick={onRetry}>Retry</button>
          )}
          {artifactUrl && onViewReceipt && (
            <button style={linkButtonStyle} onClick={onViewReceipt}>View receipt</button>
          )}
          {onDismiss && (
            <button style={dismissStyle} onClick={onDismiss}>Dismiss</button>
          )}
        </div>
      </div>
    </div>
  );
}
