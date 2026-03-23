/** BulkActionMenu — SF27-T01 scaffold. Action list with eligibility + destructive warnings. */
import React from 'react';
export interface BulkActionMenuItem { actionId: string; label: string; destructive: boolean; enabled: boolean; disabledReason: string | null; }
export interface BulkActionMenuProps { actions: BulkActionMenuItem[]; onSelectAction: (actionId: string) => void; }
export function BulkActionMenu({ actions, onSelectAction }: BulkActionMenuProps): React.ReactElement {
  return (<div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '200px' }}>
    {actions.map(a => (<button key={a.actionId} style={{ padding: '6px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: a.enabled ? 'pointer' : 'not-allowed', opacity: a.enabled ? 1 : 0.5, color: a.destructive ? '#a4262c' : '#323130', fontSize: '13px' }} disabled={!a.enabled} onClick={() => a.enabled && onSelectAction(a.actionId)} title={a.disabledReason ?? undefined}>{a.label}</button>))}
  </div>);
}
