/**
 * QueueRow — companion queue row anatomy (Phase-23 Prompt-04 model).
 *
 * Renders a single moderation queue entry: selection checkbox (when
 * bulk-select is permitted), state/scan chip row, headline, excerpt,
 * recipient footer, and right-aligned submitted date. Kept as a
 * local component — coupling to companion-specific data shapes is
 * too high for promotion into the shared UI kit.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import {
  HbcAvatarStack,
  HbcCard,
  HbcStatusBadge,
} from '@hbc/ui-kit/homepage';
import {
  buildKudosRecipientSummary,
  buildWorkflowChipDescriptor,
  deriveAgingBucket,
  needsAdminReview,
  type KudosEntry,
} from '../../../homepage/webparts/kudosContracts.js';
import type { KudosOverdueStatus } from '../../../homepage/helpers/kudosNotificationBuilder.js';
import companionStyles from '../companion.module.css';
import { AGING_LABEL } from '../runtime/companionTabs.js';

export interface QueueRowProps {
  entry: KudosEntry;
  nowIso: string;
  selected: boolean;
  selectable: boolean;
  overdueStatus: KudosOverdueStatus;
  onToggleSelect: (id: string) => void;
  onOpenDetail: (entry: KudosEntry) => void;
}

export function QueueRow({
  entry,
  nowIso,
  selected,
  selectable,
  overdueStatus,
  onToggleSelect,
  onOpenDetail,
}: QueueRowProps): React.JSX.Element {
  const summary = buildKudosRecipientSummary(entry.recipients);
  const workflowChip = entry.workflowStatus
    ? buildWorkflowChipDescriptor(entry.workflowStatus)
    : undefined;
  const aging = deriveAgingBucket(entry.submittedDate, nowIso);
  const flagged = needsAdminReview(entry);

  return (
    <HbcCard weight="standard">
      <div
        data-hbc-testid="hb-kudos-queue-row"
        className={clsx(
          companionStyles.queueRow,
          selectable && companionStyles.queueRowSelectable,
        )}
      >
        {selectable ? (
          <label
            className={companionStyles.queueRowSelect}
            aria-label={`Select ${entry.headline}`}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(entry.id)}
              className={companionStyles.queueRowCheckbox}
            />
          </label>
        ) : null}

        <button
          type="button"
          onClick={() => onOpenDetail(entry)}
          className={companionStyles.queueRowButton}
        >
          <div className={companionStyles.queueRowBody}>
            <div className={companionStyles.queueRowChipRow}>
              {workflowChip ? (
                <HbcStatusBadge
                  variant={
                    workflowChip.tone === 'success'
                      ? 'success'
                      : workflowChip.tone === 'warning'
                        ? 'warning'
                        : workflowChip.tone === 'danger'
                          ? 'critical'
                          : 'info'
                  }
                  size="small"
                  label={workflowChip.label}
                />
              ) : null}
              <span className={companionStyles.queueRowAgingChip}>
                {AGING_LABEL[aging]}
              </span>
              {flagged ? (
                <HbcStatusBadge variant="warning" size="small" label="Flagged for admin" />
              ) : null}
              {overdueStatus === 'overdue' ? (
                <HbcStatusBadge variant="critical" size="small" label="Overdue" />
              ) : overdueStatus === 'approaching' ? (
                <HbcStatusBadge variant="warning" size="small" label="Approaching due" />
              ) : null}
            </div>
            <h4 className={companionStyles.queueRowHeadline}>{entry.headline}</h4>
            <p className={companionStyles.queueRowExcerpt}>{entry.excerpt}</p>
          </div>
          <div className={companionStyles.queueRowFooter}>
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
                <span className={companionStyles.queueRowRecipientSummary}>
                  {summary.label}
                </span>
              </>
            ) : (
              <span className={companionStyles.queueRowRecipientsEmpty}>
                No recipients linked
              </span>
            )}
            <span className={companionStyles.queueRowSubmittedBy}>
              Submitted by {entry.submittedBy.displayName}
            </span>
          </div>
        </button>

        <div className={companionStyles.queueRowDateCell}>
          <span className={companionStyles.queueRowDate}>
            {new Date(entry.submittedDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </HbcCard>
  );
}
