/**
 * TriageSpotlight — companion workspace "next-up" moderation surface.
 *
 * Phase-28 Prompt-02 structural redesign. Replaces the implicit
 * "scroll the card list and guess what to review first" posture with
 * an explicit priority surface: the single most pressing queue item
 * is elevated above the list with a fuller recognition context and
 * a clear "Review" entry point.
 *
 * Selection order (most-pressing first):
 *   1. oldest overdue item in the current queue,
 *   2. oldest approaching-due item,
 *   3. oldest admin-flagged item,
 *   4. oldest pending item (fallback so the spotlight always has
 *      signal when the queue is non-empty on triage tabs).
 *
 * This is a compositional upgrade, not a detail-panel replacement.
 * Actions still open the shared detail shell for decision + audit —
 * that separation is by design until Prompt-03 addresses row-level
 * action ergonomics.
 */
import * as React from 'react';
import { HbcAvatarStack, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import {
  buildKudosRecipientSummary,
  needsAdminReview,
  type KudosEntry,
} from '../../../homepage/webparts/kudosContracts.js';
import type { KudosOverdueStatus } from '../../../homepage/helpers/kudosNotificationBuilder.js';
import companionStyles from '../companion.module.css';

export interface TriageSpotlightProps {
  queue: KudosEntry[];
  overdueMap: Map<string, KudosOverdueStatus>;
  onReview: (entry: KudosEntry) => void;
}

type SpotlightReason = 'overdue' | 'approaching' | 'flagged' | 'next';

interface SpotlightPick {
  entry: KudosEntry;
  reason: SpotlightReason;
}

const REASON_LABEL: Record<SpotlightReason, string> = {
  overdue: 'Overdue · review first',
  approaching: 'Approaching due · review soon',
  flagged: 'Flagged for admin · review next',
  next: 'Next in queue',
};

const REASON_BADGE: Record<
  SpotlightReason,
  { variant: 'critical' | 'warning' | 'info'; label: string }
> = {
  overdue: { variant: 'critical', label: 'Overdue' },
  approaching: { variant: 'warning', label: 'Approaching' },
  flagged: { variant: 'warning', label: 'Flagged for admin' },
  next: { variant: 'info', label: 'Next up' },
};

function pickSpotlight(
  queue: KudosEntry[],
  overdueMap: Map<string, KudosOverdueStatus>,
): SpotlightPick | undefined {
  if (queue.length === 0) return undefined;

  // The companion filter already sorts pending-family tabs "oldest
  // first," so a forward scan always finds the oldest match.
  let approaching: KudosEntry | undefined;
  let flagged: KudosEntry | undefined;

  for (const entry of queue) {
    const overdueStatus = overdueMap.get(entry.id) ?? 'ok';
    if (overdueStatus === 'overdue') {
      return { entry, reason: 'overdue' };
    }
    if (!approaching && overdueStatus === 'approaching') {
      approaching = entry;
    }
    if (!flagged && needsAdminReview(entry)) {
      flagged = entry;
    }
  }

  if (approaching) return { entry: approaching, reason: 'approaching' };
  if (flagged) return { entry: flagged, reason: 'flagged' };
  return { entry: queue[0]!, reason: 'next' };
}

export function TriageSpotlight({
  queue,
  overdueMap,
  onReview,
}: TriageSpotlightProps): React.JSX.Element | null {
  const pick = pickSpotlight(queue, overdueMap);
  if (!pick) return null;

  const { entry, reason } = pick;
  const summary = buildKudosRecipientSummary(entry.recipients);
  const badge = REASON_BADGE[reason];

  return (
    <section
      className={companionStyles.spotlight}
      data-hbc-testid="hb-kudos-triage-spotlight"
      data-spotlight-reason={reason}
      aria-label={`Triage spotlight: ${REASON_LABEL[reason]}`}
    >
      <div className={companionStyles.spotlightHeader}>
        <span className={companionStyles.spotlightEyebrow}>{REASON_LABEL[reason]}</span>
        <HbcStatusBadge variant={badge.variant} size="small" label={badge.label} />
      </div>

      <h3 className={companionStyles.spotlightHeadline}>{entry.headline}</h3>
      <p className={companionStyles.spotlightExcerpt}>{entry.excerpt}</p>

      <div className={companionStyles.spotlightFooter}>
        <div className={companionStyles.spotlightRecipients}>
          {entry.recipients.length > 0 ? (
            <>
              <HbcAvatarStack
                people={entry.recipients.slice(0, 4).map((r) => ({
                  id: r.id,
                  name: r.name,
                  src: r.media?.src,
                }))}
                size="sm"
                max={4}
              />
              <span className={companionStyles.spotlightRecipientSummary}>
                {summary.label}
              </span>
            </>
          ) : (
            <span className={companionStyles.spotlightRecipientsEmpty}>
              No recipients linked
            </span>
          )}
        </div>
        <span className={companionStyles.spotlightSubmittedMeta}>
          Submitted by {entry.submittedBy.displayName} ·{' '}
          {new Date(entry.submittedDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <button
          type="button"
          className={companionStyles.spotlightReviewBtn}
          data-hbc-testid="hb-kudos-triage-spotlight-review"
          onClick={() => onReview(entry)}
        >
          Review
        </button>
      </div>
    </section>
  );
}
