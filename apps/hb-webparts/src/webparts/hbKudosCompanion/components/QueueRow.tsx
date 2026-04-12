/**
 * QueueRow — companion triage-list row anatomy.
 *
 * Phase-28 Prompt-02 structural redesign: the row no longer wraps
 * itself in `HbcCard`. The Companion workspace now presents the
 * queue as a single productized triage list surface (see
 * `.triageList` in `companion.module.css`) with shared rhythm and
 * subtle dividers, rather than a stack of repeated generic cards.
 * Each row owns only its own internal anatomy — rail, selection,
 * content, and date spine — and inherits the list's frame.
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
import type { KudosCapabilities } from '../../../homepage/helpers/kudosCapabilities.js';
import companionStyles from '../companion.module.css';
import { AGING_LABEL } from '../runtime/companionTabs.js';
import type { QuickActionKind } from '../runtime/useCompanionActions.js';

export interface QueueRowProps {
  entry: KudosEntry;
  nowIso: string;
  selected: boolean;
  selectable: boolean;
  overdueStatus: KudosOverdueStatus;
  onToggleSelect: (id: string) => void;
  onOpenDetail: (entry: KudosEntry) => void;
  /**
   * Phase-28 Prompt-03 quick-triage wiring. When present, the row
   * renders inline safe-action buttons for the common moderation
   * flows (approve, clear admin flag, claim). Gated by capability
   * and the entry's current workflow/ownership state.
   */
  capabilities?: KudosCapabilities;
  dispatching?: boolean;
  onQuickAction?: (kind: QuickActionKind, entry: KudosEntry) => void;
  currentUserId?: number | undefined;
}

export function QueueRow({
  entry,
  nowIso,
  selected,
  selectable,
  overdueStatus,
  onToggleSelect,
  onOpenDetail,
  capabilities,
  dispatching,
  onQuickAction,
  currentUserId,
}: QueueRowProps): React.JSX.Element {
  const summary = buildKudosRecipientSummary(entry.recipients);
  const workflowChip = entry.workflowStatus
    ? buildWorkflowChipDescriptor(entry.workflowStatus)
    : undefined;
  const aging = deriveAgingBucket(entry.submittedDate, nowIso);
  const flagged = needsAdminReview(entry);

  // Quick-triage gating — mirrors detail-panel capability logic so
  // the row never offers an action the operator can't actually take.
  const canQuickApprove =
    Boolean(capabilities?.canApprove) &&
    (entry.workflowStatus === 'pending' ||
      entry.workflowStatus === 'revisionRequested');
  const canQuickClearFlag =
    Boolean(capabilities?.canClearAdminReview) && flagged;
  const ownerId = entry.assignedOwnerId ?? entry.claimOwnerId;
  const canQuickClaim =
    Boolean(capabilities?.canClaim) &&
    ownerId == null &&
    currentUserId !== undefined;
  const hasQuickActions =
    Boolean(onQuickAction) &&
    (canQuickApprove || canQuickClearFlag || canQuickClaim);

  return (
    <li className={companionStyles.triageItem}>
      <div
        data-hbc-testid="hb-kudos-queue-row"
        data-workflow-status={entry.workflowStatus ?? ''}
        data-admin-flag={flagged ? 'true' : undefined}
        data-overdue={overdueStatus === 'overdue' ? 'overdue' : undefined}
        className={clsx(
          companionStyles.queueRow,
          selectable && companionStyles.queueRowSelectable,
        )}
      >
        {/* Left-edge state rail — Phase-27 Prompt-06 scan upgrade.
            Colour derives from workflow-status / admin-flag /
            overdue via attribute selectors in companion.module.css. */}
        <span className={companionStyles.queueRowStateRail} aria-hidden="true" />

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
          {hasQuickActions && onQuickAction ? (
            <div
              className={companionStyles.queueRowQuickActions}
              role="group"
              aria-label="Quick triage actions"
              data-hbc-testid="hb-kudos-queue-row-quick-actions"
              /* Stop the row-level click handler on the surrounding
                 button from intercepting these action clicks. */
              onClick={(e) => e.stopPropagation()}
            >
              {canQuickApprove ? (
                <button
                  type="button"
                  className={clsx(
                    companionStyles.queueRowQuickActionBtn,
                    companionStyles.queueRowQuickActionPrimary,
                  )}
                  onClick={() => onQuickAction('approve', entry)}
                  disabled={dispatching}
                  data-hbc-testid="hb-kudos-queue-row-quick-approve"
                  aria-label={`Approve: ${entry.headline}`}
                >
                  Approve
                </button>
              ) : null}
              {canQuickClearFlag ? (
                <button
                  type="button"
                  className={companionStyles.queueRowQuickActionBtn}
                  onClick={() => onQuickAction('clearAdminReview', entry)}
                  disabled={dispatching}
                  data-hbc-testid="hb-kudos-queue-row-quick-clear-flag"
                  aria-label={`Clear admin flag: ${entry.headline}`}
                >
                  Clear flag
                </button>
              ) : null}
              {canQuickClaim ? (
                <button
                  type="button"
                  className={companionStyles.queueRowQuickActionBtn}
                  onClick={() => onQuickAction('claim', entry)}
                  disabled={dispatching}
                  data-hbc-testid="hb-kudos-queue-row-quick-claim"
                  aria-label={`Claim: ${entry.headline}`}
                >
                  Claim
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}
