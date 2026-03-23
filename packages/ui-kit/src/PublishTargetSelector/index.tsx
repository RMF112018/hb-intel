/**
 * PublishTargetSelector — SF25-T05. Target selection with readiness indicators.
 * Governing: SF25-T05, L-06
 */
import React from 'react';

export interface PublishTargetOption { targetId: string; label: string; targetType: string; compatible: boolean; incompatibleReason: string | null; selected: boolean; }

export interface PublishTargetSelectorProps {
  targets: PublishTargetOption[];
  offlineStatus: string | null;
  onToggleTarget: (targetId: string) => void;
}

const containerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px' };
const chipStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '4px', border: '1px solid #edebe9', cursor: 'pointer', fontSize: '13px' };
const selectedChip: React.CSSProperties = { ...chipStyle, border: '2px solid #0078d4', background: '#f3f9ff' };
const disabledChip: React.CSSProperties = { ...chipStyle, opacity: 0.5, cursor: 'not-allowed' };
const syncBadge: React.CSSProperties = { display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, background: '#e1dfdd', color: '#484644' };

export function PublishTargetSelector({ targets, offlineStatus, onToggleTarget }: PublishTargetSelectorProps): React.ReactElement {
  return (
    <div style={containerStyle}>
      {offlineStatus && <span style={syncBadge}>{offlineStatus}</span>}
      {targets.map(t => (
        <button key={t.targetId} style={!t.compatible ? disabledChip : t.selected ? selectedChip : chipStyle} disabled={!t.compatible} onClick={() => t.compatible && onToggleTarget(t.targetId)}>
          <span>{t.selected ? '☑' : '☐'}</span>
          <span>{t.label} ({t.targetType})</span>
          {!t.compatible && t.incompatibleReason && <span style={{ fontSize: '11px', color: '#a4262c' }}>{t.incompatibleReason}</span>}
        </button>
      ))}
    </div>
  );
}
