/**
 * DefaultViewToggle — SF26-T06. Set/unset default view.
 * Governing: SF26-T06, L-06
 */
import React from 'react';

export interface DefaultViewToggleProps { isDefault: boolean; onChange: (isDefault: boolean) => void; disabled?: boolean; }

export function DefaultViewToggle({ isDefault, onChange, disabled = false }: DefaultViewToggleProps): React.ReactElement {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: disabled ? '#a19f9d' : '#323130', cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <input type="checkbox" checked={isDefault} onChange={e => onChange(e.target.checked)} disabled={disabled} />
      <span>Default view</span>
      {isDefault && <span style={{ fontSize: '11px', color: '#797775' }}>This view will open automatically when you visit this workspace.</span>}
    </label>
  );
}
