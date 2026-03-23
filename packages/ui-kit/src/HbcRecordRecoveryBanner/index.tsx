/**
 * HbcRecordRecoveryBanner — SF23-T06
 *
 * Recovery state display with compare/restore/discard/retry actions,
 * trust warnings, and offline status. Pure presentational.
 *
 * Governing: SF23-T06, L-04 (offline), L-06 (provenance)
 */

import React from 'react';

export interface RecoveryBannerDraftInfo {
  source: 'local' | 'server' | 'restored' | 'stale-restored';
  timestampIso: string;
  conflictCount: number;
}

export interface HbcRecordRecoveryBannerProps {
  visible: boolean;
  reasonMessage: string;
  trustWarning: string | null;
  draftInfo: RecoveryBannerDraftInfo;
  syncStatus: 'saved-locally' | 'queued-to-sync' | null;
  canCompare: boolean;
  canRestore: boolean;
  canDiscard: boolean;
  canRetry: boolean;
  canResume: boolean;
  onCompare?: () => void;
  onRestore?: () => void;
  onDiscard?: () => void;
  onRetry?: () => void;
  onResume?: () => void;
}

const bannerStyle: React.CSSProperties = { padding: '12px 16px', borderRadius: '4px', background: '#fff4ce', display: 'flex', flexDirection: 'column', gap: '8px' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
const messageStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#323130' };
const trustStyle: React.CSSProperties = { fontSize: '12px', fontStyle: 'italic', color: '#797775' };
const infoStyle: React.CSSProperties = { fontSize: '12px', color: '#484644' };
const actionsStyle: React.CSSProperties = { display: 'flex', gap: '8px', flexWrap: 'wrap' };
const actionBtn: React.CSSProperties = { background: 'transparent', border: 'none', color: '#0078d4', cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: '2px 4px' };
const dangerBtn: React.CSSProperties = { ...actionBtn, color: '#a4262c' };
const syncBadge: React.CSSProperties = { display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, background: '#e1dfdd', color: '#484644' };

const SOURCE_LABELS: Record<string, string> = { 'local': 'Local draft', 'server': 'Server draft', 'restored': 'Restored draft', 'stale-restored': 'Stale restored draft' };

export function HbcRecordRecoveryBanner({ visible, reasonMessage, trustWarning, draftInfo, syncStatus, canCompare, canRestore, canDiscard, canRetry, canResume, onCompare, onRestore, onDiscard, onRetry, onResume }: HbcRecordRecoveryBannerProps): React.ReactElement | null {
  if (!visible) return null;

  return (
    <div style={bannerStyle}>
      <div style={headerStyle}>
        <span style={messageStyle}>{reasonMessage}</span>
        {syncStatus && <span style={syncBadge}>{syncStatus === 'saved-locally' ? 'Saved locally' : 'Queued to sync'}</span>}
      </div>
      {trustWarning && <div style={trustStyle}>{trustWarning}</div>}
      <div style={infoStyle}>
        Source: {SOURCE_LABELS[draftInfo.source] ?? draftInfo.source}
        {draftInfo.conflictCount > 0 && ` · ${draftInfo.conflictCount} conflict(s)`}
        {' · '}{new Date(draftInfo.timestampIso).toLocaleString()}
      </div>
      <div style={actionsStyle}>
        {canCompare && onCompare && <button style={actionBtn} onClick={onCompare}>Compare</button>}
        {canRestore && onRestore && <button style={actionBtn} onClick={onRestore}>Restore</button>}
        {canRetry && onRetry && <button style={actionBtn} onClick={onRetry}>Retry</button>}
        {canResume && onResume && <button style={actionBtn} onClick={onResume}>Resume</button>}
        {canDiscard && onDiscard && <button style={dangerBtn} onClick={onDiscard}>Discard</button>}
      </div>
    </div>
  );
}
