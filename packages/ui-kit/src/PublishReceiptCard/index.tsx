/**
 * PublishReceiptCard — SF25-T06. Publish receipt with provenance and deep-links.
 * Governing: SF25-T06, L-04, L-06
 */
import React from 'react';

export interface PublishReceiptTarget { targetId: string; label: string; status: string; }
export interface PublishReceiptLink { label: string; href: string; kind: 'source-record' | 'governance' | 'deep-link'; }
export interface PublishReceiptOwner { upn: string; displayName: string; role: string; }
export interface PublishReceiptDetail { publishId: string; issueLabel: string | null; publishedByName: string; publishedAtIso: string; versionNumber: number; frozen: boolean; supersedesPublishId: string | null; targets: PublishReceiptTarget[]; }

export interface PublishReceiptCardProps {
  receipt: PublishReceiptDetail;
  relatedLinks: PublishReceiptLink[];
  owners: PublishReceiptOwner[];
  syncStatus: string | null;
  onDownload?: () => void;
  onDismiss?: () => void;
}

const cardStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', border: '1px solid #edebe9', borderRadius: '4px', background: '#fff' };
const sectionTitle: React.CSSProperties = { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, color: '#797775', letterSpacing: '0.5px' };
const fieldStyle: React.CSSProperties = { fontSize: '13px', color: '#323130' };
const boldLabel: React.CSSProperties = { fontWeight: 600, marginRight: '4px' };
const avatarStyle: React.CSSProperties = { width: '20px', height: '20px', borderRadius: '50%', background: '#0078d4', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, marginRight: '6px' };
const linkStyle: React.CSSProperties = { color: '#0078d4', textDecoration: 'none', fontSize: '13px' };
const actionsStyle: React.CSSProperties = { display: 'flex', gap: '8px', borderTop: '1px solid #edebe9', paddingTop: '10px' };
const primaryBtn: React.CSSProperties = { padding: '6px 16px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' };
const secondaryBtn: React.CSSProperties = { padding: '6px 16px', background: 'transparent', color: '#484644', border: '1px solid #8a8886', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' };
const syncBadge: React.CSSProperties = { display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, background: '#e1dfdd', color: '#484644' };

export function PublishReceiptCard({ receipt, relatedLinks, owners, syncStatus, onDownload, onDismiss }: PublishReceiptCardProps): React.ReactElement {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={sectionTitle}>Publish Receipt</div>
        {syncStatus && <span style={syncBadge}>{syncStatus}</span>}
      </div>
      <div style={fieldStyle}><span style={boldLabel}>ID:</span>{receipt.publishId}{receipt.issueLabel && <span style={{ marginLeft: '8px', color: '#797775' }}>({receipt.issueLabel})</span>}</div>
      <div style={fieldStyle}><span style={boldLabel}>Published:</span>{new Date(receipt.publishedAtIso).toLocaleString()} by {receipt.publishedByName}</div>
      <div style={fieldStyle}><span style={boldLabel}>Version:</span>v{receipt.versionNumber}{receipt.frozen && ' (frozen)'}</div>
      {receipt.supersedesPublishId && <div style={fieldStyle}><span style={boldLabel}>Supersedes:</span>{receipt.supersedesPublishId}</div>}
      {receipt.targets.length > 0 && (
        <div>
          <div style={sectionTitle}>Targets</div>
          {receipt.targets.map(t => <div key={t.targetId} style={{ fontSize: '13px', padding: '2px 0' }}>{t.label} — {t.status}</div>)}
        </div>
      )}
      {owners.length > 0 && (
        <div>
          <div style={sectionTitle}>Ownership</div>
          {owners.map(o => <div key={o.upn} style={{ display: 'flex', alignItems: 'center', padding: '2px 0' }}><span style={avatarStyle}>{o.displayName.charAt(0)}</span><span style={{ fontSize: '13px' }}>{o.displayName} ({o.role})</span></div>)}
        </div>
      )}
      {relatedLinks.length > 0 && (
        <div>
          <div style={sectionTitle}>Related</div>
          {relatedLinks.map((l, i) => <a key={i} href={l.href} style={linkStyle}>{l.label}</a>)}
        </div>
      )}
      <div style={actionsStyle}>
        {onDownload && <button style={primaryBtn} onClick={onDownload}>Download</button>}
        {onDismiss && <button style={secondaryBtn} onClick={onDismiss}>Dismiss</button>}
      </div>
    </div>
  );
}
