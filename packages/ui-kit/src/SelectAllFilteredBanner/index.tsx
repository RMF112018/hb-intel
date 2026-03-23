/** SelectAllFilteredBanner — SF27-T01 scaffold. "Select all X filtered items" banner. */
import React from 'react';
export interface SelectAllFilteredBannerProps { filteredCount: number; selectedCount: number; onSelectAllFiltered: () => void; }
export function SelectAllFilteredBanner({ filteredCount, selectedCount, onSelectAllFiltered }: SelectAllFilteredBannerProps): React.ReactElement | null {
  if (selectedCount >= filteredCount) return null;
  return (<div style={{ padding: '8px 12px', background: '#faf9f8', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span>{selectedCount} of {filteredCount} items selected.</span>
    <button style={{ background: 'transparent', border: 'none', color: '#0078d4', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }} onClick={onSelectAllFiltered}>Select all {filteredCount} filtered items</button>
  </div>);
}
