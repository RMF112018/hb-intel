/**
 * HbcRecordSubmitBar — SF23-T05
 *
 * Submit status bar with validation gates, BIC avatars, queue/sync
 * indicators, blocked/warning/deferred explainability, and duplicate guard.
 * Pure presentational — data-in, callbacks-out.
 *
 * Governing: SF23-T05, L-02 (BIC), L-03 (complexity)
 */

import React from 'react';

// ── Prop Types ───────────────────────────────────────────────────────────

export interface SubmitBarReviewOwner {
  upn: string;
  displayName: string;
  role: string;
  stepLabel: string;
  status: string;
}

export interface HbcRecordSubmitBarProps {
  canSubmit: boolean;
  isSubmitting: boolean;
  isBlocked: boolean;
  blockMessage: string | null;
  warningMessage: string | null;
  deferMessage: string | null;
  syncStatus: string | null;
  recommendedAction: string | null;
  reviewOwners: SubmitBarReviewOwner[];
  onSubmit: () => void;
  onCancel?: () => void;
}

// ── Styles ───────────────────────────────────────────────────────────────

const barStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderTop: '1px solid #edebe9',
  background: '#faf9f8',
};

const leftStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: 1,
};

const rightStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
};

const submitButtonStyle: React.CSSProperties = {
  padding: '8px 24px',
  background: '#0078d4',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '14px',
};

const disabledSubmitStyle: React.CSSProperties = {
  ...submitButtonStyle,
  opacity: 0.5,
  cursor: 'not-allowed',
};

const cancelButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: 'transparent',
  color: '#484644',
  border: '1px solid #8a8886',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
};

const messageStyle: React.CSSProperties = {
  fontSize: '12px',
};

const blockStyle: React.CSSProperties = {
  ...messageStyle,
  color: '#a4262c',
};

const warnStyle: React.CSSProperties = {
  ...messageStyle,
  color: '#797775',
};

const deferStyle: React.CSSProperties = {
  ...messageStyle,
  color: '#8764b8',
};

const syncStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: '10px',
  background: '#e1dfdd',
  color: '#484644',
};

const reviewStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  color: '#484644',
};

const avatarStyle: React.CSSProperties = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: '#0078d4',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '10px',
  fontWeight: 600,
};

// ── Component ────────────────────────────────────────────────────────────

export function HbcRecordSubmitBar({
  canSubmit,
  isSubmitting,
  isBlocked,
  blockMessage,
  warningMessage,
  deferMessage,
  syncStatus,
  recommendedAction,
  reviewOwners,
  onSubmit,
  onCancel,
}: HbcRecordSubmitBarProps): React.ReactElement {
  return (
    <div style={barStyle}>
      <div style={leftStyle}>
        {isBlocked && blockMessage && <div style={blockStyle}>{blockMessage}</div>}
        {warningMessage && !isBlocked && <div style={warnStyle}>{warningMessage}</div>}
        {deferMessage && <div style={deferStyle}>{deferMessage}</div>}
        {recommendedAction && <div style={{ fontSize: '12px', color: '#0078d4' }}>{recommendedAction}</div>}
        {syncStatus && <span style={syncStyle}>{syncStatus}</span>}

        {reviewOwners.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {reviewOwners.map((owner) => (
              <div key={owner.upn} style={reviewStyle}>
                <span style={avatarStyle}>{owner.displayName.charAt(0)}</span>
                <span>{owner.displayName} — {owner.stepLabel}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={rightStyle}>
        {onCancel && (
          <button style={cancelButtonStyle} onClick={onCancel}>Cancel</button>
        )}
        <button
          style={canSubmit && !isSubmitting ? submitButtonStyle : disabledSubmitStyle}
          disabled={!canSubmit || isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
