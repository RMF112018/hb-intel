/**
 * Notifications section for the People & Culture HR operating
 * companion. Phase-14 pc/ Prompt-05.
 *
 * Renders the list of notification events derived by
 * `buildPeopleCultureNotifications`, filtered for the viewer via
 * `filterNotificationsForViewer`. Surfaces which cohort is being
 * notified (editor / approver / submitter / contentOwner) and the
 * item title + context. No actions — the notifications surface is
 * observational only; actions happen in the relevant tab (Approvals,
 * Content family, Homepage).
 */

import * as React from 'react';
import type {
  PeopleCultureNotificationEvent,
  PeopleCultureNotificationRecipientKind,
  PeopleCultureRole,
} from '../../../homepage/webparts/peopleCultureSplitContracts.js';
import { filterNotificationsForViewer } from '../../../homepage/helpers/peopleCultureNotificationBuilder.js';
import {
  BADGE_STYLE,
  EMPTY_STATE_STYLE,
  LIST_BODY_STYLE,
  LIST_META_ROW_STYLE,
  LIST_ROW_STYLE,
  LIST_ROW_TEXT_STYLE,
  LIST_STYLE,
  LIST_TITLE_STYLE,
  PANEL_STYLE,
  SECTION_HINT_STYLE,
  SECTION_TITLE_STYLE,
  SUCCESS_BADGE_STYLE,
  WARNING_BADGE_STYLE,
} from '../companionStyles.js';

export interface NotificationsSectionProps {
  events: ReadonlyArray<PeopleCultureNotificationEvent>;
  currentUserRole: PeopleCultureRole;
  currentUserEmail?: string;
  currentUserId?: string;
}

const RECIPIENT_LABEL: Record<PeopleCultureNotificationRecipientKind, string> = {
  editor: 'Editor cohort',
  approver: 'Approver cohort',
  submitter: 'Submitter',
  contentOwner: 'Content owner',
};

const TRIGGER_BADGE_STYLE_BY_TRIGGER: Record<
  string,
  React.CSSProperties
> = {
  submitted: BADGE_STYLE,
  approved: SUCCESS_BADGE_STYLE,
  scheduled: SUCCESS_BADGE_STYLE,
  published: SUCCESS_BADGE_STYLE,
  rejected: WARNING_BADGE_STYLE,
  revisionRequested: WARNING_BADGE_STYLE,
  expired: WARNING_BADGE_STYLE,
};

export function NotificationsSection({
  events,
  currentUserRole,
  currentUserEmail,
  currentUserId,
}: NotificationsSectionProps): React.JSX.Element {
  const visible = React.useMemo(
    () =>
      filterNotificationsForViewer(events, {
        role: currentUserRole,
        viewerEmail: currentUserEmail,
        viewerId: currentUserId,
      }),
    [events, currentUserRole, currentUserEmail, currentUserId],
  );

  return (
    <div
      role="tabpanel"
      aria-label="Notifications"
      data-hbc-companion-section="notifications"
      data-hbc-companion-notifications-count={String(visible.length)}
      style={PANEL_STYLE}
    >
      <div>
        <h3 style={SECTION_TITLE_STYLE}>Notifications</h3>
        <p style={SECTION_HINT_STYLE}>
          Lifecycle events routed to operators and content owners only.
          Featured people are never auto-notified.
        </p>
      </div>

      {visible.length === 0 ? (
        <div style={EMPTY_STATE_STYLE} role="status">
          No notifications for your role.
        </div>
      ) : (
        <ul style={LIST_STYLE} data-hbc-companion-notifications-list>
          {visible.map((event) => {
            const triggerStyle =
              TRIGGER_BADGE_STYLE_BY_TRIGGER[event.trigger] ?? BADGE_STYLE;
            return (
              <li
                key={event.id}
                style={LIST_ROW_STYLE}
                data-hbc-companion-notification-id={event.id}
                data-hbc-companion-notification-trigger={event.trigger}
                data-hbc-companion-notification-recipient-kind={event.recipientKind}
                data-hbc-companion-notification-item={event.itemId}
              >
                <div style={LIST_ROW_TEXT_STYLE}>
                  <p style={LIST_TITLE_STYLE}>{event.itemTitle}</p>
                  {event.context ? <p style={LIST_BODY_STYLE}>{event.context}</p> : null}
                  <div style={LIST_META_ROW_STYLE}>
                    <span style={triggerStyle}>{event.trigger}</span>
                    <span style={BADGE_STYLE}>{event.itemFamily}</span>
                    <span style={BADGE_STYLE}>{RECIPIENT_LABEL[event.recipientKind]}</span>
                    {event.recipient ? (
                      <span style={BADGE_STYLE}>{event.recipient.displayName}</span>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
