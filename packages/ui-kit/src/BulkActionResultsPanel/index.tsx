/** BulkActionResultsPanel — SF27-T01 scaffold. Mixed-result summary. */
import React from 'react';
export interface BulkActionResultItem { itemId: string; status: string; message: string | null; retryable: boolean; }
export interface BulkActionResultsPanelProps { actionLabel: string; successCount: number; failedCount: number; skippedCount: number; items: BulkActionResultItem[]; onRetryFailed?: () => void; onDismiss: () => void; }
export function BulkActionResultsPanel({ actionLabel, successCount, failedCount, skippedCount, items, onRetryFailed, onDismiss }: BulkActionResultsPanelProps): React.ReactElement {
  return (<div style={{ padding: '16px', border: '1px solid #edebe9', borderRadius: '4px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <div style={{ fontSize: '14px', fontWeight: 600 }}>{actionLabel} Results</div>
    <div style={{ fontSize: '13px' }}><span style={{ color: '#107c10' }}>{successCount} succeeded</span> · <span style={{ color: '#a4262c' }}>{failedCount} failed</span> · <span style={{ color: '#797775' }}>{skippedCount} skipped</span></div>
    {failedCount > 0 && onRetryFailed && <button style={{ background: 'transparent', border: 'none', color: '#0078d4', cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: 0 }} onClick={onRetryFailed}>Retry failed items</button>}
    <button style={{ background: 'transparent', border: 'none', color: '#797775', cursor: 'pointer', fontSize: '12px', padding: 0 }} onClick={onDismiss}>Dismiss</button>
  </div>);
}
