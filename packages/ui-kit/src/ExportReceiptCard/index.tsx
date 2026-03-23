/**
 * ExportReceiptCard — SF24-T06
 *
 * Immutable artifact receipt with context stamps, trust state, BIC review
 * owners, related deep-links, and download/re-export actions.
 * Pure presentational — data-in, callbacks-out.
 *
 * Governing: SF24-T06, L-04 (offline), L-05 (AI), L-06 (provenance)
 */

import React from 'react';

// ── Prop Types ───────────────────────────────────────────────────────────

export interface ExportReceiptDetail {
  /** Deterministic file name. */
  fileName: string;
  /** Export format label. */
  format: string;
  /** Export intent label. */
  intent: string;
  /** Module display label. */
  moduleLabel: string;
  /** Record display label. */
  recordLabel: string;
  /** Snapshot type description. */
  snapshotType: string;
  /** ISO 8601 creation timestamp. */
  createdAtIso: string;
  /** Author display name. */
  createdByName: string;
  /** Filter summary (null if no filters). */
  filterSummary: string | null;
  /** Sort summary (null if no sort). */
  sortSummary: string | null;
  /** Visible column keys (null if unrestricted). */
  visibleColumns: string[] | null;
  /** Selected row count (null if all rows). */
  selectedRowCount: number | null;
  /** Source version number (null if unversioned). */
  versionNumber: number | null;
  /** Human-readable file size (null if unknown). */
  fileSize: string | null;
}

export interface ExportReceiptTrustState {
  /** Confidence level label. */
  confidence: string;
  /** Whether the artifact is degraded. */
  isDegraded: boolean;
  /** Whether the receipt was restored from cache. */
  isRestored: boolean;
  /** Trust state message (null if trusted). */
  trustMessage: string | null;
  /** Stale warning if source truth changed (null if fresh). */
  staleWarning: string | null;
}

export interface ExportReceiptReviewOwner {
  /** Owner UPN. */
  upn: string;
  /** Owner display name. */
  displayName: string;
  /** Owner role. */
  role: string;
  /** Review step label. */
  stepLabel: string;
  /** Step status. */
  status: string;
}

export interface ExportReceiptRelatedLink {
  /** Link display label. */
  label: string;
  /** Link URL. */
  href: string;
  /** Link category. */
  kind: 'record' | 'approval' | 'task' | 'deep-link';
}

export interface ExportReceiptCardProps {
  /** Artifact receipt detail. */
  receipt: ExportReceiptDetail;
  /** Trust and explainability state. */
  trustState: ExportReceiptTrustState;
  /** BIC review owners with step status. */
  reviewOwners: ExportReceiptReviewOwner[];
  /** Related deep-links. */
  relatedLinks: ExportReceiptRelatedLink[];
  /** Fired when user clicks download. */
  onDownload?: () => void;
  /** Fired when user clicks re-export. */
  onReExport?: () => void;
  /** Fired when user dismisses the receipt (guarded). */
  onDismiss?: () => void;
}

// ── Styles ───────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px',
  borderRadius: '4px',
  border: '1px solid #edebe9',
  background: '#fff',
};

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  color: '#797775',
  letterSpacing: '0.5px',
};

const fieldStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#323130',
};

const fieldLabelStyle: React.CSSProperties = {
  fontWeight: 600,
  marginRight: '4px',
};

const trustWarningStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '4px',
  fontSize: '12px',
};

const reviewOwnerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  padding: '4px 0',
};

const avatarStyle: React.CSSProperties = {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  background: '#0078d4',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  fontWeight: 600,
  flexShrink: 0,
};

const linkStyle: React.CSSProperties = {
  color: '#0078d4',
  textDecoration: 'none',
  fontSize: '13px',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  borderTop: '1px solid #edebe9',
  paddingTop: '12px',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '6px 16px',
  background: '#0078d4',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '13px',
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '6px 16px',
  background: 'transparent',
  color: '#484644',
  border: '1px solid #8a8886',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
};

// ── Component ────────────────────────────────────────────────────────────

/**
 * Export receipt card with immutable context stamps and trust state.
 */
export function ExportReceiptCard({
  receipt,
  trustState,
  reviewOwners,
  relatedLinks,
  onDownload,
  onReExport,
  onDismiss,
}: ExportReceiptCardProps): React.ReactElement {
  const createdDate = new Date(receipt.createdAtIso).toLocaleString();

  return (
    <div style={cardStyle}>
      {/* Artifact metadata */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Artifact</div>
        <div style={fieldStyle}>
          <span style={fieldLabelStyle}>File:</span>{receipt.fileName}
          {receipt.fileSize && <span style={{ color: '#797775' }}> ({receipt.fileSize})</span>}
        </div>
        <div style={fieldStyle}>
          <span style={fieldLabelStyle}>Format:</span>{receipt.format}
          <span style={{ color: '#797775', marginLeft: '8px' }}>{receipt.intent}</span>
        </div>
        <div style={fieldStyle}>
          <span style={fieldLabelStyle}>Source:</span>{receipt.moduleLabel} — {receipt.recordLabel}
        </div>
        <div style={fieldStyle}>
          <span style={fieldLabelStyle}>Snapshot:</span>{receipt.snapshotType}
          {receipt.versionNumber !== null && <span> (v{receipt.versionNumber})</span>}
        </div>
        <div style={fieldStyle}>
          <span style={fieldLabelStyle}>Created:</span>{createdDate} by {receipt.createdByName}
        </div>
      </div>

      {/* Context stamps */}
      {(receipt.filterSummary || receipt.sortSummary || receipt.visibleColumns || receipt.selectedRowCount !== null) && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Context</div>
          {receipt.filterSummary && (
            <div style={fieldStyle}><span style={fieldLabelStyle}>Filters:</span>{receipt.filterSummary}</div>
          )}
          {receipt.sortSummary && (
            <div style={fieldStyle}><span style={fieldLabelStyle}>Sort:</span>{receipt.sortSummary}</div>
          )}
          {receipt.visibleColumns && (
            <div style={fieldStyle}><span style={fieldLabelStyle}>Columns:</span>{receipt.visibleColumns.length} visible</div>
          )}
          {receipt.selectedRowCount !== null && (
            <div style={fieldStyle}><span style={fieldLabelStyle}>Rows:</span>{receipt.selectedRowCount} selected</div>
          )}
        </div>
      )}

      {/* Trust state */}
      {(trustState.isDegraded || trustState.isRestored || trustState.staleWarning) && (
        <div
          style={{
            ...trustWarningStyle,
            background: trustState.isDegraded ? '#fff4ce' : trustState.isRestored ? '#f0e6ff' : '#faf9f8',
            color: trustState.isDegraded ? '#797775' : '#484644',
          }}
        >
          {trustState.trustMessage && <div>{trustState.trustMessage}</div>}
          {trustState.staleWarning && <div style={{ fontStyle: 'italic' }}>{trustState.staleWarning}</div>}
        </div>
      )}

      {/* BIC review owners */}
      {reviewOwners.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Review</div>
          {reviewOwners.map((owner) => (
            <div key={owner.upn} style={reviewOwnerStyle}>
              <span style={avatarStyle}>{owner.displayName.charAt(0)}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{owner.displayName}</div>
                <div style={{ fontSize: '11px', color: '#797775' }}>
                  {owner.stepLabel} — {owner.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Related links */}
      {relatedLinks.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Related</div>
          {relatedLinks.map((link, i) => (
            <a key={i} href={link.href} style={linkStyle}>{link.label}</a>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={actionsStyle}>
        {onDownload && (
          <button style={primaryButtonStyle} onClick={onDownload}>Download</button>
        )}
        {onReExport && (
          <button style={secondaryButtonStyle} onClick={onReExport}>Re-export</button>
        )}
        {onDismiss && (
          <button style={{ ...secondaryButtonStyle, color: '#797775' }} onClick={onDismiss}>Dismiss</button>
        )}
      </div>
    </div>
  );
}
