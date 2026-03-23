/** BulkActionInputDialog — SF27-T01 scaffold. Configured action input form. */
import React from 'react';
export interface BulkActionInputField { key: string; label: string; type: 'text' | 'select' | 'date'; options?: string[]; }
export interface BulkActionInputDialogProps { actionLabel: string; fields: BulkActionInputField[]; values: Record<string, string>; onChange: (key: string, value: string) => void; onConfirm: () => void; onCancel: () => void; }
export function BulkActionInputDialog({ actionLabel, fields, values, onChange, onConfirm, onCancel }: BulkActionInputDialogProps): React.ReactElement {
  return (<div style={{ padding: '20px', border: '1px solid #edebe9', borderRadius: '4px', background: '#fff', minWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ fontSize: '16px', fontWeight: 600 }}>{actionLabel}</div>
    {fields.map(f => (<div key={f.key}><label style={{ fontSize: '13px', fontWeight: 600 }}>{f.label}</label><input style={{ width: '100%', padding: '6px 8px', border: '1px solid #8a8886', borderRadius: '2px' }} value={values[f.key] ?? ''} onChange={e => onChange(f.key, e.target.value)} /></div>))}
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      <button style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #8a8886', borderRadius: '4px', cursor: 'pointer' }} onClick={onCancel}>Cancel</button>
      <button style={{ padding: '8px 16px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }} onClick={onConfirm}>Apply</button>
    </div>
  </div>);
}
