/** BulkActionConfirmDialog — SF27-T01 scaffold. Destructive action confirmation. */
import React from 'react';
export interface BulkActionConfirmDialogProps { actionLabel: string; itemCount: number; destructive: boolean; onConfirm: () => void; onCancel: () => void; }
export function BulkActionConfirmDialog({ actionLabel, itemCount, destructive, onConfirm, onCancel }: BulkActionConfirmDialogProps): React.ReactElement {
  return (<div style={{ padding: '20px', border: '1px solid #edebe9', borderRadius: '4px', background: '#fff', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ fontSize: '16px', fontWeight: 600 }}>Confirm {actionLabel}</div>
    <div style={{ fontSize: '13px' }}>This will apply to {itemCount} item(s).{destructive && <span style={{ color: '#a4262c' }}> This action cannot be undone.</span>}</div>
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      <button style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #8a8886', borderRadius: '4px', cursor: 'pointer' }} onClick={onCancel}>Cancel</button>
      <button style={{ padding: '8px 16px', background: destructive ? '#a4262c' : '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }} onClick={onConfirm}>{actionLabel}</button>
    </div>
  </div>);
}
