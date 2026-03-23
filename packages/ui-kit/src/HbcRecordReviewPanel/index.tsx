/**
 * HbcRecordReviewPanel — SF23-T06
 *
 * Read-only review presentation with BIC avatars, deep-links,
 * and review-step explainability. Pure presentational.
 *
 * Governing: SF23-T06, L-03 (complexity), L-06 (provenance)
 */

import React from 'react';

export interface ReviewPanelField {
  key: string;
  label: string;
  value: string;
  changed: boolean;
}

export interface ReviewPanelStep {
  stepId: string;
  label: string;
  blocking: boolean;
  phase: 'pre-submit' | 'post-submit';
  ownerName: string;
  ownerRole: string;
  status: string;
  reason: string;
  nextAction: string;
}

export interface ReviewPanelLink {
  label: string;
  href: string;
  kind: 'record' | 'blocker' | 'downstream';
}

export interface HbcRecordReviewPanelProps {
  fields: ReviewPanelField[];
  reviewSteps: ReviewPanelStep[];
  relatedLinks: ReviewPanelLink[];
  complexityTier: 'essential' | 'standard' | 'expert';
  allowAdjustments?: boolean;
  onApprove?: (stepId: string) => void;
  onReject?: (stepId: string) => void;
}

const panelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', border: '1px solid #edebe9', borderRadius: '4px', background: '#fff' };
const sectionTitle: React.CSSProperties = { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, color: '#797775', letterSpacing: '0.5px' };
const fieldRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' };
const changedBadge: React.CSSProperties = { fontSize: '10px', color: '#0078d4', fontWeight: 600, marginLeft: '4px' };
const stepRow: React.CSSProperties = { padding: '8px 0', borderBottom: '1px solid #f3f2f1' };
const avatarStyle: React.CSSProperties = { width: '20px', height: '20px', borderRadius: '50%', background: '#0078d4', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, marginRight: '6px' };
const actionBtn: React.CSSProperties = { background: 'transparent', border: 'none', color: '#0078d4', cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: '2px 4px' };

export function HbcRecordReviewPanel({ fields, reviewSteps, relatedLinks, complexityTier, allowAdjustments = false, onApprove, onReject }: HbcRecordReviewPanelProps): React.ReactElement {
  return (
    <div style={panelStyle}>
      <div style={sectionTitle}>Review</div>
      {fields.map(f => (
        <div key={f.key} style={fieldRow}>
          <span style={{ fontWeight: 600 }}>{f.label}{f.changed && <span style={changedBadge}>Changed</span>}</span>
          <span>{f.value}</span>
        </div>
      ))}
      {reviewSteps.length > 0 && (
        <>
          <div style={sectionTitle}>Review Steps</div>
          {reviewSteps.map(s => (
            <div key={s.stepId} style={stepRow}>
              <div><span style={avatarStyle}>{s.ownerName.charAt(0)}</span><strong>{s.ownerName}</strong> — {s.label}</div>
              <div style={{ fontSize: '12px', color: '#484644' }}>{s.blocking ? 'Blocking' : 'Advisory'} · {s.phase} · {s.status}</div>
              <div style={{ fontSize: '11px', color: '#797775' }}>Why: {s.reason}</div>
              <div style={{ fontSize: '11px', color: '#797775' }}>Next: {s.nextAction}</div>
              {complexityTier !== 'essential' && s.status === 'pending' && (
                <div style={{ marginTop: '4px' }}>
                  {onApprove && <button style={actionBtn} onClick={() => onApprove(s.stepId)}>Approve</button>}
                  {onReject && <button style={{ ...actionBtn, color: '#a4262c' }} onClick={() => onReject(s.stepId)}>Reject</button>}
                </div>
              )}
            </div>
          ))}
        </>
      )}
      {relatedLinks.length > 0 && (
        <>
          <div style={sectionTitle}>Related</div>
          {relatedLinks.map((l, i) => <a key={i} href={l.href} style={{ color: '#0078d4', fontSize: '13px', textDecoration: 'none' }}>{l.label}</a>)}
        </>
      )}
    </div>
  );
}
