/**
 * HbcRecordForm — SF23-T05
 *
 * Record authoring form container with complexity-tier rendering,
 * validation display, recovery banner, and AI action placeholders.
 * Pure presentational — data-in, callbacks-out.
 *
 * Governing: SF23-T05, L-03 (complexity), L-05 (AI)
 */

import React from 'react';

// ── Prop Types ───────────────────────────────────────────────────────────

export interface RecordFormField {
  key: string;
  label: string;
  required: boolean;
  value: string;
  error: string | null;
  warning: string | null;
}

export interface RecordFormRecoveryBanner {
  message: string;
  recoveredAtIso: string;
  hasConflicts: boolean;
  conflictCount: number;
}

export interface HbcRecordFormProps {
  fields: RecordFormField[];
  complexityTier: 'essential' | 'standard' | 'expert';
  mode: string;
  isBlocked: boolean;
  blockMessage: string | null;
  warnings: string[];
  recoveryBanner: RecordFormRecoveryBanner | null;
  recommendedAction: string | null;
  isDirty: boolean;
  syncStatus: string | null;
  loading?: boolean;
  onFieldChange: (key: string, value: string) => void;
  onSaveDraft?: () => void;
  onDiscardRecovery?: () => void;
  onAcceptRecovery?: () => void;
}

// ── Styles ───────────────────────────────────────────────────────────────

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '16px',
};

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#323130',
};

const inputStyle: React.CSSProperties = {
  padding: '6px 8px',
  border: '1px solid #8a8886',
  borderRadius: '2px',
  fontSize: '14px',
};

const errorInputStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: '#a4262c',
};

const errorTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#a4262c',
};

const warningTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#797775',
};

const bannerStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '4px',
  background: '#fff4ce',
  fontSize: '13px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const blockBannerStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '4px',
  background: '#fde7e9',
  color: '#a4262c',
  fontSize: '13px',
};

const recommendedStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: '#deecf9',
  borderRadius: '4px',
  fontSize: '12px',
  color: '#0078d4',
};

const syncBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '10px',
  fontSize: '11px',
  fontWeight: 600,
  background: '#e1dfdd',
  color: '#484644',
};

const actionButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#0078d4',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 600,
  padding: '2px 4px',
};

// ── Component ────────────────────────────────────────────────────────────

export function HbcRecordForm({
  fields,
  complexityTier,
  isBlocked,
  blockMessage,
  warnings,
  recoveryBanner,
  recommendedAction,
  isDirty,
  syncStatus,
  loading = false,
  onFieldChange,
  onSaveDraft,
  onDiscardRecovery,
  onAcceptRecovery,
}: HbcRecordFormProps): React.ReactElement {
  if (loading) {
    return <div style={formStyle}>Loading form...</div>;
  }

  const visibleFields = complexityTier === 'essential'
    ? fields.filter(f => f.required)
    : fields;

  return (
    <div style={formStyle}>
      {/* Recovery banner */}
      {recoveryBanner && (
        <div style={bannerStyle}>
          <span>
            {recoveryBanner.message}
            {recoveryBanner.hasConflicts && ` (${recoveryBanner.conflictCount} conflict(s))`}
          </span>
          <span>
            {onAcceptRecovery && <button style={actionButtonStyle} onClick={onAcceptRecovery}>Accept</button>}
            {onDiscardRecovery && <button style={{ ...actionButtonStyle, color: '#797775' }} onClick={onDiscardRecovery}>Discard</button>}
          </span>
        </div>
      )}

      {/* Blocked banner */}
      {isBlocked && blockMessage && (
        <div style={blockBannerStyle}>{blockMessage}</div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && complexityTier !== 'essential' && (
        <div style={{ ...bannerStyle, background: '#faf9f8' }}>
          {warnings.map((w, i) => <div key={i} style={warningTextStyle}>{w}</div>)}
        </div>
      )}

      {/* Recommended action */}
      {recommendedAction && (
        <div style={recommendedStyle}>{recommendedAction}</div>
      )}

      {/* Sync status */}
      {syncStatus && <div><span style={syncBadgeStyle}>{syncStatus}</span></div>}

      {/* Fields */}
      {visibleFields.map((field) => (
        <div key={field.key} style={fieldStyle}>
          <label style={labelStyle}>
            {field.label}
            {field.required && <span style={{ color: '#a4262c' }}> *</span>}
          </label>
          <input
            style={field.error ? errorInputStyle : inputStyle}
            value={field.value}
            onChange={(e) => onFieldChange(field.key, e.target.value)}
          />
          {field.error && <span style={errorTextStyle}>{field.error}</span>}
          {field.warning && complexityTier !== 'essential' && (
            <span style={warningTextStyle}>{field.warning}</span>
          )}
        </div>
      ))}

      {/* Draft save (standard+expert) */}
      {isDirty && onSaveDraft && complexityTier !== 'essential' && (
        <button style={actionButtonStyle} onClick={onSaveDraft}>Save draft</button>
      )}
    </div>
  );
}
