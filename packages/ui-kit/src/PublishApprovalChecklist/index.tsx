/**
 * PublishApprovalChecklist — SF25-T06. Deterministic pass/fail gates.
 * Governing: SF25-T06, L-02, L-05
 */
import React from 'react';

export interface PublishChecklistItem { ruleId: string; label: string; pass: boolean; message: string; ownerName: string | null; dueStatus: string | null; blocking: boolean; }
export interface PublishChecklistProps { items: PublishChecklistItem[]; supersessionWarning: string | null; revocationPrerequisite: string | null; onAcknowledge?: (ruleId: string) => void; }

const listStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px' };
const itemStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '4px 0' };
const passIcon: React.CSSProperties = { color: '#107c10', fontWeight: 600 };
const failIcon: React.CSSProperties = { color: '#a4262c', fontWeight: 600 };
const avatarStyle: React.CSSProperties = { width: '18px', height: '18px', borderRadius: '50%', background: '#0078d4', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 600 };
const warnBox: React.CSSProperties = { padding: '8px 12px', borderRadius: '4px', background: '#fff4ce', fontSize: '12px', color: '#797775' };
const ackBtn: React.CSSProperties = { background: 'transparent', border: 'none', color: '#0078d4', cursor: 'pointer', fontSize: '11px', fontWeight: 600 };

export function PublishApprovalChecklist({ items, supersessionWarning, revocationPrerequisite, onAcknowledge }: PublishChecklistProps): React.ReactElement {
  return (
    <div style={listStyle}>
      {items.map(item => (
        <div key={item.ruleId} style={itemStyle}>
          <span style={item.pass ? passIcon : failIcon}>{item.pass ? '✓' : '✗'}</span>
          <span style={{ flex: 1 }}>
            {item.label}{item.blocking && !item.pass && <span style={{ color: '#a4262c', fontSize: '11px', marginLeft: '4px' }}>(blocking)</span>}
            <div style={{ fontSize: '11px', color: '#484644' }}>{item.message}</div>
          </span>
          {item.ownerName && <span style={avatarStyle}>{item.ownerName.charAt(0)}</span>}
          {item.dueStatus && <span style={{ fontSize: '11px', color: '#797775' }}>{item.dueStatus}</span>}
          {!item.pass && onAcknowledge && <button style={ackBtn} onClick={() => onAcknowledge(item.ruleId)}>Acknowledge</button>}
        </div>
      ))}
      {supersessionWarning && <div style={warnBox}>{supersessionWarning}</div>}
      {revocationPrerequisite && <div style={warnBox}>{revocationPrerequisite}</div>}
    </div>
  );
}
