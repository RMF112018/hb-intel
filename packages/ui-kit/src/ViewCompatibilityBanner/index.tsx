/**
 * ViewCompatibilityBanner — SF26-T06. Degraded-compatible warning with apply/cancel.
 * Governing: SF26-T06, L-03
 */
import React from 'react';

export interface ViewCompatibilityBannerResult { status: string; removedColumns: string[]; removedFilterFields: string[]; removedGroupFields: string[]; userExplanation: string; }
export interface ViewCompatibilityBannerProps { result: ViewCompatibilityBannerResult; onApplyAnyway: () => void; onCancel: () => void; }

const bannerStyle: React.CSSProperties = { padding: '12px 16px', borderRadius: '4px', background: '#fff4ce', display: 'flex', flexDirection: 'column', gap: '8px' };
const headingStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 600, color: '#323130' };
const listStyle: React.CSSProperties = { margin: '4px 0 0 16px', padding: 0, fontSize: '12px', color: '#484644' };
const actionsStyle: React.CSSProperties = { display: 'flex', gap: '8px' };
const primaryBtn: React.CSSProperties = { padding: '6px 16px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' };
const secondaryBtn: React.CSSProperties = { padding: '6px 16px', background: 'transparent', color: '#484644', border: '1px solid #8a8886', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' };

export function ViewCompatibilityBanner({ result, onApplyAnyway, onCancel }: ViewCompatibilityBannerProps): React.ReactElement {
  const allRemoved = [...result.removedColumns, ...result.removedFilterFields, ...result.removedGroupFields];
  return (
    <div style={bannerStyle}>
      <div style={headingStyle}>Some fields in this view are no longer available</div>
      {allRemoved.length > 0 && (
        <ul style={listStyle}>
          {result.removedColumns.map(c => <li key={`col-${c}`}>Column: {c}</li>)}
          {result.removedFilterFields.map(f => <li key={`flt-${f}`}>Filter: {f}</li>)}
          {result.removedGroupFields.map(g => <li key={`grp-${g}`}>Group: {g}</li>)}
        </ul>
      )}
      <div style={{ fontSize: '12px', color: '#484644' }}>{result.userExplanation}</div>
      <div style={actionsStyle}>
        <button style={primaryBtn} onClick={onApplyAnyway}>Apply anyway</button>
        <button style={secondaryBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
