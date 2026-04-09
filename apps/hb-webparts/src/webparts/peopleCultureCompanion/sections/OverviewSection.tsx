/**
 * Overview landing page for the People & Culture HR operating
 * companion. Phase-14 pc/ Prompt-03.
 *
 * Lightweight operational dashboard — lifecycle counts, pending
 * approvals, upcoming scheduled, expiring soon, homepage conflicts,
 * milestone candidate queue, and intake queue. Not an analytics
 * command center; provides quick links into the work queues and
 * inline action buttons for milestone and intake triage.
 */

import * as React from 'react';
import type {
  PeopleCultureCompanionOverview,
  PeopleCultureContentFamily,
  PeopleCultureItem,
  PeopleCultureLifecycleCounts,
} from '../../../homepage/webparts/peopleCultureSplitContracts.js';
import { PEOPLE_CULTURE_CONTENT_FAMILIES } from '../../../homepage/webparts/peopleCultureSplitContracts.js';
import {
  BADGE_STYLE,
  CARD_GRID_STYLE,
  CARD_LABEL_STYLE,
  CARD_STYLE,
  CARD_VALUE_STYLE,
  EMPTY_STATE_STYLE,
  LIST_BODY_STYLE,
  LIST_META_ROW_STYLE,
  LIST_ROW_STYLE,
  LIST_ROW_TEXT_STYLE,
  LIST_STYLE,
  LIST_TITLE_STYLE,
  PANEL_STYLE,
  PRIMARY_BUTTON_STYLE,
  SECONDARY_BUTTON_STYLE,
  SECTION_HINT_STYLE,
  SECTION_TITLE_STYLE,
  TOOLBAR_STYLE,
  WARNING_BADGE_STYLE,
} from '../companionStyles.js';

export interface OverviewSectionProps {
  overview: PeopleCultureCompanionOverview;
  onNavigateToApprovals: () => void;
  onNavigateToHomepage: () => void;
  onNavigateToFamily: (family: PeopleCultureContentFamily) => void;
  onNavigateToNotifications?: () => void;
  onNavigateToIntake?: () => void;
  notificationsCount?: number;
  onAcceptMilestone: (id: string) => void;
  onSuppressMilestone: (id: string) => void;
  onPromoteIntake: (id: string) => void;
  onDeclineIntake: (id: string) => void;
}

const FAMILY_LABEL: Record<PeopleCultureContentFamily, string> = {
  announcement: 'Announcements',
  celebrationMilestone: 'Celebrations',
  cultureProgramEvent: 'Culture Programs',
};

function sumLifecycle(counts: PeopleCultureLifecycleCounts): number {
  return (
    counts.draft +
    counts.needsApproval +
    counts.scheduled +
    counts.live +
    counts.expiringSoon +
    counts.expired +
    counts.archived +
    counts.suppressed
  );
}

function LifecycleCard({
  family,
  counts,
  onClick,
}: {
  family: PeopleCultureContentFamily;
  counts: PeopleCultureLifecycleCounts;
  onClick: () => void;
}): React.JSX.Element {
  const total = sumLifecycle(counts);
  return (
    <button
      type="button"
      data-hbc-companion-overview-card={family}
      onClick={onClick}
      style={{
        ...CARD_STYLE,
        appearance: 'none',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <span style={CARD_LABEL_STYLE}>{FAMILY_LABEL[family]}</span>
      <span style={CARD_VALUE_STYLE}>{total}</span>
      <span style={{ fontSize: '0.75rem', color: 'rgba(10,27,51,0.55)' }}>
        Live: {counts.live} · Draft: {counts.draft} · Needs approval: {counts.needsApproval}
      </span>
    </button>
  );
}

function ItemRow({
  item,
  onClick,
}: {
  item: PeopleCultureItem;
  onClick?: () => void;
}): React.JSX.Element {
  return (
    <li
      style={onClick ? { ...LIST_ROW_STYLE, cursor: 'pointer' } : LIST_ROW_STYLE}
      data-hbc-companion-item-id={item.id}
      data-hbc-companion-item-family={item.family}
      data-hbc-companion-item-lifecycle={item.lifecycleState}
      onClick={onClick}
    >
      <div style={LIST_ROW_TEXT_STYLE}>
        <p style={LIST_TITLE_STYLE}>{item.title}</p>
        <p style={LIST_BODY_STYLE}>{item.body}</p>
        <div style={LIST_META_ROW_STYLE}>
          <span style={BADGE_STYLE}>{FAMILY_LABEL[item.family]}</span>
          <span style={BADGE_STYLE}>{item.lifecycleState}</span>
          {item.homepage.isPinned ? <span style={WARNING_BADGE_STYLE}>Pinned</span> : null}
        </div>
      </div>
    </li>
  );
}

export function OverviewSection({
  overview,
  onNavigateToApprovals,
  onNavigateToHomepage,
  onNavigateToFamily,
  onNavigateToNotifications,
  onNavigateToIntake,
  notificationsCount,
  onAcceptMilestone,
  onSuppressMilestone,
  onPromoteIntake,
  onDeclineIntake,
}: OverviewSectionProps): React.JSX.Element {
  const queueHealth = overview.queueHealth;
  const queueHealthBadgeStyle =
    queueHealth === 'attention'
      ? WARNING_BADGE_STYLE
      : queueHealth === 'watch'
        ? BADGE_STYLE
        : BADGE_STYLE;

  return (
    <div
      role="tabpanel"
      aria-label="Companion overview"
      data-hbc-companion-section="overview"
      data-hbc-companion-queue-health={queueHealth}
      style={PANEL_STYLE}
    >
      <div>
        <h3 style={SECTION_TITLE_STYLE}>Queue health</h3>
      </div>
      <div style={CARD_GRID_STYLE}>
        <div style={CARD_STYLE} data-hbc-companion-overview-card="queue-health">
          <span style={CARD_LABEL_STYLE}>Queue health</span>
          <span style={CARD_VALUE_STYLE}>{queueHealth}</span>
          <span style={{ fontSize: '0.6875rem', color: 'rgba(10,27,51,0.55)' }}>
            <span style={queueHealthBadgeStyle}>
              {queueHealth === 'attention'
                ? 'Needs attention'
                : queueHealth === 'watch'
                  ? 'Watch'
                  : 'Healthy'}
            </span>
          </span>
        </div>
        <div style={CARD_STYLE} data-hbc-companion-overview-card="pending-approvals-summary">
          <span style={CARD_LABEL_STYLE}>Pending approvals</span>
          <span style={CARD_VALUE_STYLE}>{overview.pendingApprovals.length}</span>
        </div>
        <div style={CARD_STYLE} data-hbc-companion-overview-card="expiring-soon-summary">
          <span style={CARD_LABEL_STYLE}>Expiring soon</span>
          <span style={CARD_VALUE_STYLE}>{overview.expiringSoonItems.length}</span>
        </div>
        <div style={CARD_STYLE} data-hbc-companion-overview-card="homepage-conflicts-summary">
          <span style={CARD_LABEL_STYLE}>Homepage conflicts</span>
          <span style={CARD_VALUE_STYLE}>{overview.homepageConflicts.length}</span>
        </div>
      </div>

      <div style={TOOLBAR_STYLE}>
        {onNavigateToNotifications ? (
          <button
            type="button"
            style={SECONDARY_BUTTON_STYLE}
            onClick={onNavigateToNotifications}
            data-hbc-companion-action="open-notifications"
          >
            Open notifications
            {typeof notificationsCount === 'number' ? ` (${notificationsCount})` : ''}
          </button>
        ) : null}
        {onNavigateToIntake ? (
          <button
            type="button"
            style={SECONDARY_BUTTON_STYLE}
            onClick={onNavigateToIntake}
            data-hbc-companion-action="open-intake"
          >
            Open intake ({overview.pendingIntakeSubmissions.length})
          </button>
        ) : null}
      </div>

      <div>
        <h3 style={SECTION_TITLE_STYLE}>Content families</h3>
        <p style={SECTION_HINT_STYLE}>
          Lifecycle totals per content family. Select a card to open the workspace.
        </p>
      </div>
      <div style={CARD_GRID_STYLE}>
        {PEOPLE_CULTURE_CONTENT_FAMILIES.map((family) => (
          <LifecycleCard
            key={family}
            family={family}
            counts={overview.lifecycleCountsByFamily[family]}
            onClick={() => onNavigateToFamily(family)}
          />
        ))}
      </div>

      <div>
        <h3 style={SECTION_TITLE_STYLE}>Pending approvals</h3>
        <p style={SECTION_HINT_STYLE}>
          Cross-family items awaiting HR approval.
        </p>
      </div>
      {overview.pendingApprovals.length === 0 ? (
        <div style={EMPTY_STATE_STYLE} role="status">
          No items are currently awaiting approval.
        </div>
      ) : (
        <>
          <ul style={LIST_STYLE} data-hbc-companion-overview-list="pending-approvals">
            {overview.pendingApprovals.slice(0, 4).map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </ul>
          <div style={TOOLBAR_STYLE}>
            <button
              type="button"
              style={SECONDARY_BUTTON_STYLE}
              onClick={onNavigateToApprovals}
              data-hbc-companion-action="open-approvals-inbox"
            >
              Open approvals inbox ({overview.pendingApprovals.length})
            </button>
          </div>
        </>
      )}

      <div>
        <h3 style={SECTION_TITLE_STYLE}>Upcoming scheduled &amp; expiring</h3>
      </div>
      <div style={CARD_GRID_STYLE}>
        <div style={CARD_STYLE} data-hbc-companion-overview-card="scheduled">
          <span style={CARD_LABEL_STYLE}>Upcoming scheduled</span>
          <span style={CARD_VALUE_STYLE}>{overview.upcomingScheduled.length}</span>
        </div>
        <div style={CARD_STYLE} data-hbc-companion-overview-card="expiring-soon">
          <span style={CARD_LABEL_STYLE}>Expiring soon</span>
          <span style={CARD_VALUE_STYLE}>{overview.expiringSoonItems.length}</span>
        </div>
        <div style={CARD_STYLE} data-hbc-companion-overview-card="homepage-conflicts">
          <span style={CARD_LABEL_STYLE}>Homepage conflicts</span>
          <span style={CARD_VALUE_STYLE}>{overview.homepageConflicts.length}</span>
        </div>
      </div>
      {overview.homepageConflicts.length > 0 ? (
        <div style={TOOLBAR_STYLE}>
          <button
            type="button"
            style={SECONDARY_BUTTON_STYLE}
            onClick={onNavigateToHomepage}
            data-hbc-companion-action="open-homepage-governance"
          >
            Open homepage governance
          </button>
        </div>
      ) : null}

      <div>
        <h3 style={SECTION_TITLE_STYLE}>Milestone candidate queue</h3>
        <p style={SECTION_HINT_STYLE}>
          Auto-generated recurring milestones awaiting HR review.
        </p>
      </div>
      {overview.pendingMilestoneCandidates.length === 0 ? (
        <div style={EMPTY_STATE_STYLE} role="status">
          No milestone candidates are currently pending.
        </div>
      ) : (
        <ul style={LIST_STYLE} data-hbc-companion-overview-list="milestones">
          {overview.pendingMilestoneCandidates.map((candidate) => (
            <li
              key={candidate.id}
              style={LIST_ROW_STYLE}
              data-hbc-companion-milestone-id={candidate.id}
            >
              <div style={LIST_ROW_TEXT_STYLE}>
                <p style={LIST_TITLE_STYLE}>
                  {candidate.personDisplayName} — {candidate.candidateType}
                  {candidate.anniversaryYears ? ` (${candidate.anniversaryYears}y)` : ''}
                </p>
                <p style={LIST_BODY_STYLE}>
                  Occurs {candidate.occursOn} · source {candidate.sourceSystem}
                </p>
              </div>
              <div style={TOOLBAR_STYLE}>
                <button
                  type="button"
                  style={PRIMARY_BUTTON_STYLE}
                  onClick={() => onAcceptMilestone(candidate.id)}
                  data-hbc-companion-action="accept-milestone"
                  data-hbc-companion-action-target={candidate.id}
                >
                  Accept
                </button>
                <button
                  type="button"
                  style={SECONDARY_BUTTON_STYLE}
                  onClick={() => onSuppressMilestone(candidate.id)}
                  data-hbc-companion-action="suppress-milestone"
                  data-hbc-companion-action-target={candidate.id}
                >
                  Suppress
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div>
        <h3 style={SECTION_TITLE_STYLE}>Limited intake queue</h3>
        <p style={SECTION_HINT_STYLE}>
          Designated non-HR submissions awaiting HR triage. HR reviews,
          edits, and decides whether to publish — submitters never
          publish directly.
        </p>
      </div>
      {overview.pendingIntakeSubmissions.length === 0 ? (
        <div style={EMPTY_STATE_STYLE} role="status">
          No intake submissions are currently pending.
        </div>
      ) : (
        <ul style={LIST_STYLE} data-hbc-companion-overview-list="intake">
          {overview.pendingIntakeSubmissions.map((submission) => (
            <li
              key={submission.id}
              style={LIST_ROW_STYLE}
              data-hbc-companion-intake-id={submission.id}
            >
              <div style={LIST_ROW_TEXT_STYLE}>
                <p style={LIST_TITLE_STYLE}>{submission.title}</p>
                <p style={LIST_BODY_STYLE}>
                  {submission.submittedBy.displayName} · {submission.submitterRole} ·{' '}
                  {submission.suggestedFamily}
                </p>
                <p style={LIST_BODY_STYLE}>{submission.body}</p>
              </div>
              <div style={TOOLBAR_STYLE}>
                <button
                  type="button"
                  style={PRIMARY_BUTTON_STYLE}
                  onClick={() => onPromoteIntake(submission.id)}
                  data-hbc-companion-action="promote-intake"
                  data-hbc-companion-action-target={submission.id}
                >
                  Accept into draft
                </button>
                <button
                  type="button"
                  style={SECONDARY_BUTTON_STYLE}
                  onClick={() => onDeclineIntake(submission.id)}
                  data-hbc-companion-action="decline-intake"
                  data-hbc-companion-action-target={submission.id}
                >
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
