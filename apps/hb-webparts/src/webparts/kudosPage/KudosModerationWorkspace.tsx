/**
 * KudosModerationWorkspace — HR/Admin moderation workspace
 * Phase 6-02: Pending queue, approve/reject, pin/unpin, publication
 *             management for Kudos submissions.
 *
 * This workspace is visible only to configured reviewers/approvers.
 * It renders a pending queue (oldest-first for fair review order),
 * review detail with approve/reject/pin actions, and a publication
 * management view for approved/rejected items.
 */
import * as React from 'react';
import {
  HbcHomepageSectionShell,
  HbcPremiumBadge,
  CheckCircle2,
  AlertCircle,
  Clock,
  Separator,
} from '@hbc/ui-kit/homepage';
import {
  HP_SPACE,
  HP_RADIUS,
  HP_BORDER,
  HP_TEXT_OPACITY,
} from '../../homepage/tokens.js';
import type { KudosEntry, KudosStatus } from '../../homepage/webparts/communicationsContracts.js';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface KudosModerationWorkspaceProps {
  kudos?: KudosEntry[];
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Tab types
// ---------------------------------------------------------------------------

type ModerationTab = 'pending' | 'approved' | 'rejected';

const TAB_LABELS: Record<ModerationTab, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

const TAB_OPTIONS: ModerationTab[] = ['pending', 'approved', 'rejected'];

// ---------------------------------------------------------------------------
// Badge mapping
// ---------------------------------------------------------------------------

const STATUS_BADGE_MAP: Record<KudosStatus, 'warning' | 'success' | 'critical'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'critical',
};

// ---------------------------------------------------------------------------
// Shared utility
// ---------------------------------------------------------------------------

function formatRecipients(recipients: KudosEntry['recipients']): string {
  if (recipients.length === 0) return '';
  if (recipients.length === 1) return recipients[0].name;
  if (recipients.length === 2) return `${recipients[0].name} and ${recipients[1].name}`;
  return `${recipients[0].name}, ${recipients[1].name}, and ${recipients.length - 2} more`;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const workspaceHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: HP_SPACE.md,
  flexWrap: 'wrap',
};

const tabRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: HP_SPACE.sm,
  flexWrap: 'wrap',
  marginTop: HP_SPACE.xl,
};

const tabButtonBaseStyle: React.CSSProperties = {
  padding: `${HP_SPACE.sm}px ${HP_SPACE.xl}px`,
  borderRadius: HP_RADIUS.command,
  fontSize: '0.8125rem',
  fontWeight: 500,
  cursor: 'pointer',
  lineHeight: 1,
  transition: 'background 150ms ease',
};

const queueListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  marginTop: HP_SPACE['2xl'],
};

const queueItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: HP_SPACE['2xl'],
  padding: `${HP_SPACE['2xl']}px 0`,
  borderBottom: HP_BORDER.subtle,
};

const queueItemLastStyle: React.CSSProperties = {
  ...queueItemStyle,
  borderBottom: 'none',
};

const queueContentStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const queueActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: HP_SPACE.md,
  flexShrink: 0,
  alignItems: 'center',
  flexWrap: 'wrap',
};

const actionButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: HP_SPACE.xs,
  padding: `${HP_SPACE.sm}px ${HP_SPACE.xl}px`,
  borderRadius: HP_RADIUS.command,
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  lineHeight: 1,
  transition: 'background 150ms ease',
};

const approveButtonStyle: React.CSSProperties = {
  ...actionButtonStyle,
  border: '1px solid rgba(22,119,55,0.3)',
  background: 'rgba(22,119,55,0.06)',
  color: '#167737',
};

const rejectButtonStyle: React.CSSProperties = {
  ...actionButtonStyle,
  border: '1px solid rgba(185,28,28,0.3)',
  background: 'rgba(185,28,28,0.06)',
  color: '#b91c1c',
};

const pinButtonStyle: React.CSSProperties = {
  ...actionButtonStyle,
  border: HP_BORDER.subtle,
  background: 'transparent',
  color: 'inherit',
};

const metaRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
  fontSize: '0.75rem',
  opacity: HP_TEXT_OPACITY.secondary,
  flexWrap: 'wrap',
  marginTop: HP_SPACE.xs,
};

const emptyQueueStyle: React.CSSProperties = {
  padding: `${HP_SPACE['4xl']}px ${HP_SPACE['2xl']}px`,
  textAlign: 'center',
  border: HP_BORDER.subtle,
  borderRadius: HP_RADIUS.editorial,
  marginTop: HP_SPACE['2xl'],
};

const loadingStyle: React.CSSProperties = {
  padding: `${HP_SPACE['4xl']}px ${HP_SPACE['2xl']}px`,
  textAlign: 'center',
  fontSize: '0.875rem',
  opacity: HP_TEXT_OPACITY.secondary,
};

const countBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 20,
  height: 20,
  borderRadius: 10,
  fontSize: '0.6875rem',
  fontWeight: 600,
  lineHeight: 1,
  padding: `0 ${HP_SPACE.sm}px`,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ModerationTabs({
  active,
  onSelect,
  counts,
}: {
  active: ModerationTab;
  onSelect: (t: ModerationTab) => void;
  counts: Record<ModerationTab, number>;
}): React.JSX.Element {
  return (
    <div style={tabRowStyle} role="tablist" aria-label="Moderation queue tabs">
      {TAB_OPTIONS.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab)}
            style={{
              ...tabButtonBaseStyle,
              border: isActive ? HP_BORDER.brandAccent : HP_BORDER.subtle,
              background: isActive ? 'rgba(34,83,145,0.06)' : 'transparent',
            }}
          >
            {TAB_LABELS[tab]}
            {counts[tab] > 0 && (
              <span
                style={{
                  ...countBadgeStyle,
                  marginLeft: HP_SPACE.sm,
                  background: tab === 'pending' && counts[tab] > 0
                    ? 'rgba(229,126,70,0.15)'
                    : 'rgba(0,0,0,0.06)',
                  color: tab === 'pending' && counts[tab] > 0
                    ? '#b45309'
                    : 'inherit',
                }}
              >
                {counts[tab]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ModerationQueueItem({
  item,
  isLast,
  activeTab,
}: {
  item: KudosEntry;
  isLast: boolean;
  activeTab: ModerationTab;
}): React.JSX.Element {
  const recipientLabel = formatRecipients(item.recipients);

  return (
    <div style={isLast ? queueItemLastStyle : queueItemStyle}>
      <div style={queueContentStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: HP_SPACE.md }}>
          <HbcPremiumBadge
            label={item.status}
            status={STATUS_BADGE_MAP[item.status]}
            size="sm"
          />
          {item.isPinned && (
            <HbcPremiumBadge label="Pinned" status="info" size="sm" />
          )}
        </div>
        <div style={{ marginTop: HP_SPACE.sm, fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.4 }}>
          {item.headline}
        </div>
        {recipientLabel && (
          <div style={{ marginTop: HP_SPACE.xs, fontSize: '0.8125rem', fontWeight: 500, opacity: HP_TEXT_OPACITY.muted }}>
            {recipientLabel}
          </div>
        )}
        <div style={{ marginTop: HP_SPACE.sm, fontSize: '0.8125rem', opacity: HP_TEXT_OPACITY.secondary, lineHeight: 1.5 }}>
          {item.excerpt}
        </div>
        <div style={metaRowStyle}>
          <span>
            <Clock size={11} style={{ marginRight: 3, verticalAlign: 'text-bottom' }} />
            Submitted {formatDate(item.submittedDate)}
          </span>
          <span>by {item.submittedBy.displayName}</span>
          {item.approvedBy && (
            <span>Reviewed by {item.approvedBy.displayName}</span>
          )}
          {item.approvedDate && (
            <span>{formatDate(item.approvedDate)}</span>
          )}
          {typeof item.celebrateCount === 'number' && item.celebrateCount > 0 && (
            <span>{item.celebrateCount} celebrate</span>
          )}
        </div>
      </div>
      <div style={queueActionsStyle}>
        {activeTab === 'pending' && (
          <>
            <button type="button" style={approveButtonStyle} aria-label={`Approve: ${item.headline}`}>
              <CheckCircle2 size={12} />
              Approve
            </button>
            <button type="button" style={rejectButtonStyle} aria-label={`Reject: ${item.headline}`}>
              <AlertCircle size={12} />
              Reject
            </button>
          </>
        )}
        {activeTab === 'approved' && (
          <button type="button" style={pinButtonStyle} aria-label={item.isPinned ? `Unpin: ${item.headline}` : `Pin: ${item.headline}`}>
            {item.isPinned ? 'Unpin' : 'Pin'}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function KudosModerationWorkspace({
  kudos = [],
  isLoading = false,
}: KudosModerationWorkspaceProps): React.JSX.Element {
  const [activeTab, setActiveTab] = React.useState<ModerationTab>('pending');

  const counts: Record<ModerationTab, number> = {
    pending: kudos.filter((k) => k.status === 'pending').length,
    approved: kudos.filter((k) => k.status === 'approved').length,
    rejected: kudos.filter((k) => k.status === 'rejected').length,
  };

  const filteredItems = kudos
    .filter((k) => k.status === activeTab)
    .sort((a, b) => {
      if (activeTab === 'pending') {
        // Oldest first for fair review order
        return (Date.parse(a.submittedDate) || 0) - (Date.parse(b.submittedDate) || 0);
      }
      // Most recent first for approved/rejected
      const aDate = Date.parse(a.approvedDate ?? a.submittedDate) || 0;
      const bDate = Date.parse(b.approvedDate ?? b.submittedDate) || 0;
      return bDate - aDate;
    });

  if (isLoading) {
    return (
      <HbcHomepageSectionShell title="Kudos Moderation" subtitle="Review, approve, and manage Kudos submissions">
        <div role="status" aria-live="polite" style={loadingStyle}>
          Loading moderation queue...
        </div>
      </HbcHomepageSectionShell>
    );
  }

  return (
    <HbcHomepageSectionShell title="Kudos Moderation" subtitle="Review, approve, and manage Kudos submissions">
      <div data-hbc-homepage="kudos-moderation">
        <div style={workspaceHeaderStyle}>
          <div style={{ fontSize: '0.875rem', opacity: HP_TEXT_OPACITY.secondary }}>
            {counts.pending} pending review
          </div>
        </div>

        <ModerationTabs active={activeTab} onSelect={setActiveTab} counts={counts} />

        <Separator decorative style={{ margin: `${HP_SPACE.xl}px 0 0` }} />

        {filteredItems.length === 0 ? (
          <div role="status" aria-live="polite" style={emptyQueueStyle}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.4 }}>
              {activeTab === 'pending'
                ? 'No pending submissions'
                : `No ${activeTab} Kudos`}
            </div>
            <p style={{ margin: `${HP_SPACE.sm}px 0 0`, fontSize: '0.8125rem', opacity: HP_TEXT_OPACITY.secondary, lineHeight: 1.5 }}>
              {activeTab === 'pending'
                ? 'All submissions have been reviewed. New submissions will appear here for approval.'
                : `${TAB_LABELS[activeTab]} Kudos items will appear here after review.`}
            </p>
          </div>
        ) : (
          <div style={queueListStyle}>
            {filteredItems.map((item, index) => (
              <ModerationQueueItem
                key={item.id}
                item={item}
                isLast={index === filteredItems.length - 1}
                activeTab={activeTab}
              />
            ))}
          </div>
        )}
      </div>
    </HbcHomepageSectionShell>
  );
}
