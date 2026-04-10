/**
 * HB Kudos notification builder — Phase-14 kudos/ Prompt-05.
 *
 * Pure helper that determines when and whom to notify for kudos
 * governance events. Does NOT dispatch emails/Teams messages — it
 * only builds a typed notification intent that the caller can
 * persist to a queue or log. Delivery infrastructure is out of
 * scope for Phase-14 (the patterns are documented so a future
 * integration prompt can plug in a delivery channel).
 *
 * Notification rules (Decision-Lock-Appendix + Prompt-05):
 *
 * Submitter notifications:
 *   - approve    → notify submitter that their kudos is live
 *   - reject     → notify submitter with rejection reason
 *   - revisionRequested → notify submitter with revision guidance
 *
 * Recipient notifications:
 *   - only after the item is actually live (approved + homepageEnabled)
 *   - NOT on later removal/unpublish
 *   - for scheduled items, only when the item actually publishes
 *     (i.e., at go-live, not at schedule time)
 *
 * Overdue / reminder targets:
 *   - Pending or Revision Requested → HR reviewers
 *   - Flagged for Admin Review → Kudos admins
 *   - Approved / Rejected / Removed → no routine reminders
 *
 * Governing sources:
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Prompt-05-Permissions-Notifications-and-Work-Management.md`
 */

import type { KudosAuditEventType } from '../webparts/kudosContracts.js';

// ---------------------------------------------------------------------------
// Notification intent shape
// ---------------------------------------------------------------------------

export type KudosNotificationRecipientKind = 'submitter' | 'recipients' | 'reviewers' | 'admins';

export interface KudosNotificationIntent {
  /** The governance event that triggered this notification. */
  eventType: KudosAuditEventType;
  /** App-side KudosId of the item. */
  kudosId: string;
  /** Which audience(s) should receive this notification. */
  targetKinds: readonly KudosNotificationRecipientKind[];
  /** Short subject line for the notification. */
  subject: string;
  /** Body text (plain text, may include the reason / guidance). */
  body: string;
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export interface BuildNotificationInput {
  eventType: KudosAuditEventType;
  kudosId: string;
  headline: string;
  /** Is the item currently live on the homepage? */
  isLive: boolean;
  /** Was this the first time the item went live? (wasEverPublished was false before this action.) */
  isFirstPublish: boolean;
  /** Optional reason / guidance text. */
  reason?: string;
}

/**
 * Build zero or more notification intents for a governance event.
 * Returns an empty array when no notification should be sent.
 */
export function buildKudosNotificationIntents(
  input: BuildNotificationInput,
): KudosNotificationIntent[] {
  const intents: KudosNotificationIntent[] = [];

  switch (input.eventType) {
    case 'approve':
      // Always notify the submitter.
      intents.push({
        eventType: 'approve',
        kudosId: input.kudosId,
        targetKinds: ['submitter'],
        subject: 'Your kudos has been approved',
        body: `"${input.headline}" has been approved and is now live on the homepage.`,
      });
      // Notify recipients only if this is the first publish (not a
      // re-approval after restore, and not a scheduled-but-not-yet-live).
      if (input.isLive && input.isFirstPublish) {
        intents.push({
          eventType: 'approve',
          kudosId: input.kudosId,
          targetKinds: ['recipients'],
          subject: 'You received a kudos!',
          body: `"${input.headline}" is now on the homepage.`,
        });
      }
      break;

    case 'reject':
      intents.push({
        eventType: 'reject',
        kudosId: input.kudosId,
        targetKinds: ['submitter'],
        subject: 'Your kudos was not approved',
        body: input.reason
          ? `"${input.headline}" was rejected. Reason: ${input.reason}`
          : `"${input.headline}" was rejected.`,
      });
      break;

    case 'revisionRequested':
      intents.push({
        eventType: 'revisionRequested',
        kudosId: input.kudosId,
        targetKinds: ['submitter'],
        subject: 'Your kudos needs a revision',
        body: input.reason
          ? `"${input.headline}" needs a change before it can be approved. Guidance: ${input.reason}`
          : `"${input.headline}" needs a change before it can be approved.`,
      });
      break;

    // No submitter/recipient notification for these events.
    default:
      break;
  }

  return intents;
}

// ---------------------------------------------------------------------------
// Overdue / reminder helpers
// ---------------------------------------------------------------------------

export interface KudosOverdueThresholds {
  /** Days after which a pending/revisionRequested entry is overdue. */
  pendingOverdueDays: number;
  /** Days after which a flagged-for-admin-review entry is overdue. */
  adminReviewOverdueDays: number;
}

export const DEFAULT_KUDOS_OVERDUE_THRESHOLDS: KudosOverdueThresholds = {
  pendingOverdueDays: 3,
  adminReviewOverdueDays: 2,
};

export type KudosOverdueStatus = 'ok' | 'approaching' | 'overdue';

/**
 * Derive the overdue status of a pending or flagged entry relative to
 * a reference "now" timestamp and the configured thresholds.
 *
 * "Approaching" means > 50% of the threshold has elapsed; "overdue"
 * means the full threshold has passed.
 */
export function deriveKudosOverdueStatus(
  submittedDateIso: string | undefined,
  nowIso: string,
  thresholdDays: number,
): KudosOverdueStatus {
  if (!submittedDateIso) return 'ok';
  const submittedMs = Date.parse(submittedDateIso);
  const nowMs = Date.parse(nowIso);
  if (Number.isNaN(submittedMs) || Number.isNaN(nowMs)) return 'ok';

  const elapsedDays = Math.max(0, (nowMs - submittedMs) / (24 * 60 * 60 * 1000));
  if (elapsedDays >= thresholdDays) return 'overdue';
  if (elapsedDays >= thresholdDays * 0.5) return 'approaching';
  return 'ok';
}

export type KudosReminderTargetKind = 'reviewers' | 'admins';

export interface KudosReminderTarget {
  kudosId: string;
  headline: string;
  targetKind: KudosReminderTargetKind;
  overdueStatus: KudosOverdueStatus;
  elapsedDays: number;
}

/**
 * Scan a list of KudosEntry-shaped objects and return the ones that
 * qualify for an overdue / approaching reminder.
 */
export function findKudosReminderTargets(
  entries: readonly {
    id: string;
    headline: string;
    submittedDate: string;
    workflowStatus?: string;
    isFlaggedForAdminReview?: boolean;
  }[],
  nowIso: string,
  thresholds: KudosOverdueThresholds = DEFAULT_KUDOS_OVERDUE_THRESHOLDS,
): KudosReminderTarget[] {
  const targets: KudosReminderTarget[] = [];
  const nowMs = Date.parse(nowIso);
  if (Number.isNaN(nowMs)) return targets;

  for (const entry of entries) {
    const status = entry.workflowStatus;
    const submittedMs = Date.parse(entry.submittedDate);
    if (Number.isNaN(submittedMs)) continue;
    const elapsedDays = Math.max(0, (nowMs - submittedMs) / (24 * 60 * 60 * 1000));

    if (status === 'pending' || status === 'revisionRequested') {
      const overdueStatus = deriveKudosOverdueStatus(
        entry.submittedDate,
        nowIso,
        thresholds.pendingOverdueDays,
      );
      if (overdueStatus !== 'ok') {
        targets.push({
          kudosId: entry.id,
          headline: entry.headline,
          targetKind: 'reviewers',
          overdueStatus,
          elapsedDays: Math.floor(elapsedDays),
        });
      }
    }

    if (entry.isFlaggedForAdminReview === true) {
      const overdueStatus = deriveKudosOverdueStatus(
        entry.submittedDate,
        nowIso,
        thresholds.adminReviewOverdueDays,
      );
      if (overdueStatus !== 'ok') {
        targets.push({
          kudosId: entry.id,
          headline: entry.headline,
          targetKind: 'admins',
          overdueStatus,
          elapsedDays: Math.floor(elapsedDays),
        });
      }
    }
  }

  return targets;
}
