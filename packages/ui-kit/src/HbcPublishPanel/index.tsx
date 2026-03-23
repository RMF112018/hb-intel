/**
 * HbcPublishPanel — SF25-T05. Always-visible publication command surface.
 * Governing: SF25-T05, L-02, L-03, L-05
 */
import React from 'react';

export interface PublishPanelStep { stepId: string; label: string; status: string; ownerName: string; ownerRole: string; blocking: boolean; }
export interface PublishPanelTarget { targetId: string; label: string; targetType: string; ready: boolean; readyMessage: string | null; }
export interface PublishPanelReceipt { receiptId: string; publishedAtIso: string; versionNumber: number; frozen: boolean; artifactUrl: string | null; }

export interface HbcPublishPanelProps {
  state: string;
  readinessMessage: string;
  isReady: boolean;
  blockingReasons: string[];
  approvalSteps: PublishPanelStep[];
  targets: PublishPanelTarget[];
  receipt: PublishPanelReceipt | null;
  supersessionMessage: string | null;
  revocationMessage: string | null;
  syncStatus: string | null;
  onPublish?: () => void;
  onApprove?: (stepId: string) => void;
  onReject?: (stepId: string) => void;
  onSupersede?: () => void;
  onRevoke?: () => void;
}

const panelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', border: '1px solid #edebe9', borderRadius: '4px', background: '#fff' };
const sectionTitle: React.CSSProperties = { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, color: '#797775', letterSpacing: '0.5px' };
const blockStyle: React.CSSProperties = { fontSize: '12px', color: '#a4262c' };
const avatarStyle: React.CSSProperties = { width: '20px', height: '20px', borderRadius: '50%', background: '#0078d4', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, marginRight: '6px' };
const primaryBtn: React.CSSProperties = { padding: '8px 20px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 };
const actionBtn: React.CSSProperties = { background: 'transparent', border: 'none', color: '#0078d4', cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: '2px 4px' };
const warnBox: React.CSSProperties = { padding: '8px 12px', borderRadius: '4px', background: '#fff4ce', fontSize: '12px', color: '#797775' };
const syncBadge: React.CSSProperties = { display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, background: '#e1dfdd', color: '#484644' };

export function HbcPublishPanel({ state, readinessMessage, isReady, blockingReasons, approvalSteps, targets, receipt, supersessionMessage, revocationMessage, syncStatus, onPublish, onApprove, onReject, onSupersede, onRevoke }: HbcPublishPanelProps): React.ReactElement {
  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={sectionTitle}>Publish</div>
        {syncStatus && <span style={syncBadge}>{syncStatus}</span>}
      </div>

      {/* Readiness */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: isReady ? '#107c10' : '#a4262c' }}>{readinessMessage}</div>
        {blockingReasons.map((r, i) => <div key={i} style={blockStyle}>• {r}</div>)}
      </div>

      {/* Approval steps */}
      {approvalSteps.length > 0 && (
        <div>
          <div style={sectionTitle}>Approvals</div>
          {approvalSteps.map(s => (
            <div key={s.stepId} style={{ padding: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span><span style={avatarStyle}>{s.ownerName.charAt(0)}</span>{s.ownerName} — {s.label} ({s.status})</span>
              {s.status === 'pending' && (
                <span>
                  {onApprove && <button style={actionBtn} onClick={() => onApprove(s.stepId)}>Approve</button>}
                  {onReject && <button style={{ ...actionBtn, color: '#a4262c' }} onClick={() => onReject(s.stepId)}>Reject</button>}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Targets */}
      {targets.length > 0 && (
        <div>
          <div style={sectionTitle}>Targets</div>
          {targets.map(t => <div key={t.targetId} style={{ fontSize: '13px', padding: '2px 0' }}>{t.ready ? '✓' : '✗'} {t.label} ({t.targetType}){!t.ready && t.readyMessage && <span style={{ color: '#a4262c', fontSize: '11px', marginLeft: '6px' }}>{t.readyMessage}</span>}</div>)}
        </div>
      )}

      {/* Supersession / Revocation */}
      {supersessionMessage && <div style={warnBox}>{supersessionMessage}</div>}
      {revocationMessage && <div style={warnBox}>{revocationMessage}</div>}

      {/* Receipt */}
      {receipt && (
        <div>
          <div style={sectionTitle}>Receipt</div>
          <div style={{ fontSize: '13px' }}>v{receipt.versionNumber} — {new Date(receipt.publishedAtIso).toLocaleString()}{receipt.frozen && ' (frozen)'}</div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {onPublish && <button style={{ ...primaryBtn, opacity: isReady ? 1 : 0.5 }} disabled={!isReady} onClick={onPublish}>Publish</button>}
        {onSupersede && state === 'published' && <button style={actionBtn} onClick={onSupersede}>Supersede</button>}
        {onRevoke && state === 'published' && <button style={{ ...actionBtn, color: '#a4262c' }} onClick={onRevoke}>Revoke</button>}
      </div>
    </div>
  );
}
