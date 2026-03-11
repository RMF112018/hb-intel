/**
 * HbcSyncStatusBadge — Sync status indicator badge — SF12-T06, D-08
 *
 * Renders a badge showing pending sync count with an expandable popover
 * listing queued operations. Uses native <details>/<summary> for zero-dependency
 * keyboard-navigable disclosure. Inline styles only (SPFx-safe).
 */
import { useSessionState } from '../hooks/useSessionState.js';

export interface HbcSyncStatusBadgeProps {
  /** When true the badge is visible even when the queue is empty. Default: false */
  showWhenEmpty?: boolean;
}

const badgeBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 10px',
  borderRadius: '12px',
  fontSize: '13px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const greenBadge: React.CSSProperties = {
  ...badgeBase,
  backgroundColor: '#d4edda',
  color: '#155724',
  cursor: 'default',
};

const amberBadge: React.CSSProperties = {
  ...badgeBase,
  backgroundColor: '#fff3cd',
  color: '#856404',
};

const popoverStyle: React.CSSProperties = {
  marginTop: '8px',
  padding: '8px 12px',
  backgroundColor: '#fff',
  border: '1px solid #dee2e6',
  borderRadius: '6px',
  fontSize: '12px',
  maxHeight: '200px',
  overflowY: 'auto',
};

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

const listItemStyle: React.CSSProperties = {
  padding: '4px 0',
  borderBottom: '1px solid #f0f0f0',
};

export function HbcSyncStatusBadge({ showWhenEmpty = false }: HbcSyncStatusBadgeProps): React.ReactElement | null {
  const { pendingCount, queuedOperations } = useSessionState();

  if (pendingCount === 0 && !showWhenEmpty) {
    return null;
  }

  if (pendingCount === 0 && showWhenEmpty) {
    return (
      <span style={greenBadge} aria-label="All changes synced" data-testid="sync-badge">
        ✓ Synced
      </span>
    );
  }

  return (
    <details data-testid="sync-badge">
      <summary style={{ listStyle: 'none', display: 'inline-block' }}>
        <button
          type="button"
          style={amberBadge}
          aria-label={`${pendingCount} pending operation${pendingCount === 1 ? '' : 's'}`}
        >
          {pendingCount} pending
        </button>
      </summary>
      <div style={popoverStyle} data-testid="sync-popover">
        <ul style={listStyle}>
          {queuedOperations.map((op) => (
            <li key={op.operationId} style={listItemStyle}>
              <strong>{op.type}</strong> → {op.target}
              {op.retryCount > 0 && (
                <span style={{ marginLeft: '6px', color: '#856404' }}>
                  (retry {op.retryCount}/{op.maxRetries})
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
