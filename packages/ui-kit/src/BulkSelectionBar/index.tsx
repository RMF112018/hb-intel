/** BulkSelectionBar — SF27-T01 scaffold. Selection count + scope indicator + clear. */
import React from 'react';
export interface BulkSelectionBarProps { selectedCount: number; scope: string; onClear: () => void; onSelectAll?: () => void; }
export function BulkSelectionBar({ selectedCount, scope, onClear, onSelectAll }: BulkSelectionBarProps): React.ReactElement {
  return (<div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#deecf9', borderRadius: '4px', fontSize: '13px' }}>
    <span style={{ fontWeight: 600 }}>{selectedCount} selected</span><span style={{ color: '#797775' }}>({scope})</span>
    {onSelectAll && <button style={{ background: 'transparent', border: 'none', color: '#0078d4', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }} onClick={onSelectAll}>Select all</button>}
    <button style={{ background: 'transparent', border: 'none', color: '#797775', cursor: 'pointer', fontSize: '12px' }} onClick={onClear}>Clear</button>
  </div>);
}
