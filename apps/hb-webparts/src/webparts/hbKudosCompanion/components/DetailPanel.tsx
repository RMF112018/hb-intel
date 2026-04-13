/**
 * DetailPanel — moderation detail + action-family workspace that
 * opens inside the companion's `KudosGovernanceDetailShell`.
 *
 * Owns:
 *   - audit timeline fetch on panel open,
 *   - primary/secondary action wiring,
 *   - action-family grouping (review decision, publication &
 *     prominence, admin review flag, ownership, takedown).
 *
 * All capability gating stays 1:1 with the prior inline definition.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import {
  getKudosAuditTimeline as fetchKudosAuditTimeline,
  type KudosAuditTimelineEntry,
} from '../../../homepage/data/kudosAdapter/index.js';
import { getKudosListHostUrl } from '../../../homepage/data/spContext.js';
import { KudosDetailPanelContent } from '../../../homepage/shared/KudosDetailPanelContent.js';
import { KudosGovernanceDetailShell } from '../../../homepage/shared/kudosShells.js';
import {
  KudosActionButton,
  KudosGovernanceErrorAlert,
} from '../../../homepage/shared/KudosGovernancePrimitives.js';
import type {
  KudosCapabilities,
  KudosRole,
} from '../../../homepage/helpers/kudosCapabilities.js';
import {
  needsAdminReview,
  type KudosEntry,
} from '../../../homepage/webparts/kudosContracts.js';
import kudosFlyoutStyles from '../../hbKudos/kudosFlyout.module.css';
import type { DetailActionKind } from '../runtime/useCompanionActions.js';

export interface DetailPanelProps {
  entry: KudosEntry | undefined;
  onClose: () => void;
  capabilities: KudosCapabilities;
  role: KudosRole;
  dispatching: boolean;
  error?: string;
  onAction: (kind: DetailActionKind) => void;
}

export function DetailPanel({
  entry,
  onClose,
  capabilities,
  role,
  dispatching,
  error,
  onAction,
}: DetailPanelProps): React.JSX.Element {
  const canApprove = capabilities.canApprove && entry?.workflowStatus !== 'approved';
  const canReject = capabilities.canReject && entry?.workflowStatus !== 'rejected';
  const canRequestRevision =
    capabilities.canRequestRevision && entry?.workflowStatus === 'pending';

  const [timeline, setTimeline] = React.useState<KudosAuditTimelineEntry[]>([]);
  const [timelineLoading, setTimelineLoading] = React.useState(false);
  React.useEffect(() => {
    if (!entry) {
      setTimeline([]);
      return;
    }
    const listHostUrl = getKudosListHostUrl();
    if (!listHostUrl) return;
    let cancelled = false;
    setTimelineLoading(true);
    fetchKudosAuditTimeline(listHostUrl, entry.id)
      .then((events) => {
        if (!cancelled) {
          setTimeline(events);
          setTimelineLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setTimelineLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entry?.id]);

  return (
    <KudosGovernanceDetailShell
      open={Boolean(entry)}
      onClose={onClose}
      title={entry?.headline ?? 'Governance detail'}
      subtitle={entry ? `Submitted by ${entry.submittedBy.displayName}` : undefined}
      primaryAction={
        canApprove
          ? {
              label: 'Approve',
              onClick: () => onAction('approve'),
              loading: dispatching,
              disabled: dispatching,
            }
          : { label: 'Close', onClick: onClose }
      }
      secondaryAction={canApprove ? { label: 'Close', onClick: onClose } : undefined}
      testId="hb-kudos-companion-detail"
      ariaLabel="Governance detail"
    >
      {entry ? (
        <>
          <KudosDetailPanelContent
            entry={entry}
            role={role}
            timeline={timeline}
            timelineLoading={timelineLoading}
          />

          {error ? <KudosGovernanceErrorAlert message={error} /> : null}

          <div className={kudosFlyoutStyles.actionFamilies}>
            <div
              role="group"
              aria-label="Review decision"
              className={kudosFlyoutStyles.actionFamily}
            >
              <span className={kudosFlyoutStyles.actionFamilyLabel}>Review decision</span>
              <div className={kudosFlyoutStyles.actionFamilyRow}>
                <KudosActionButton label="Reject" onClick={() => onAction('reject')} disabled={!canReject || dispatching} tone="danger" testId="hb-kudos-action-reject" />
                <KudosActionButton label="Request revision" onClick={() => onAction('requestRevision')} disabled={!canRequestRevision || dispatching} tone="warning" testId="hb-kudos-action-request-revision" />
                {capabilities.canApprove && entry?.workflowStatus === 'rejected' ? (
                  <KudosActionButton label="Reopen" onClick={() => onAction('reopen')} disabled={dispatching} tone="info" testId="hb-kudos-action-reopen" />
                ) : null}
              </div>
            </div>

            {(capabilities.canSchedule ||
              capabilities.canPin ||
              capabilities.canFeature ||
              (capabilities.canEditPublished && entry?.workflowStatus === 'approved')) ? (
              <div
                role="group"
                aria-label="Publication and prominence"
                className={kudosFlyoutStyles.actionFamily}
              >
                <span className={kudosFlyoutStyles.actionFamilyLabel}>Publication &amp; prominence</span>
                <div className={kudosFlyoutStyles.actionFamilyRow}>
                  {capabilities.canSchedule ? (
                    entry?.isScheduled
                      ? <KudosActionButton label="Unschedule" onClick={() => onAction('unschedule')} disabled={dispatching} tone="info" testId="hb-kudos-action-unschedule" />
                      : <KudosActionButton label="Schedule" onClick={() => onAction('schedule')} disabled={dispatching} tone="info" testId="hb-kudos-action-schedule" />
                  ) : null}
                  {capabilities.canPin ? (
                    entry?.isPinned
                      ? <KudosActionButton label="Unpin" onClick={() => onAction('unpin')} disabled={dispatching} tone="info" testId="hb-kudos-action-unpin" />
                      : <KudosActionButton label="Pin" onClick={() => onAction('pin')} disabled={dispatching} tone="info" testId="hb-kudos-action-pin" />
                  ) : null}
                  {capabilities.canFeature ? (
                    entry?.isFeatured
                      ? <KudosActionButton label="Unfeature" onClick={() => onAction('unfeature')} disabled={dispatching} tone="info" testId="hb-kudos-action-unfeature" />
                      : <KudosActionButton label="Feature" onClick={() => onAction('feature')} disabled={dispatching} tone="info" testId="hb-kudos-action-feature" />
                  ) : null}
                  {capabilities.canEditPublished && entry?.workflowStatus === 'approved' ? (
                    <KudosActionButton label="Edit published" onClick={() => onAction('updateContent')} disabled={dispatching} tone="info" testId="hb-kudos-action-update-content" />
                  ) : null}
                  <KudosActionButton label="Celebrate" onClick={() => onAction('celebrate')} disabled={dispatching} tone="info" />
                </div>
              </div>
            ) : null}

            {(capabilities.canFlagAdminReview || capabilities.canClearAdminReview) ? (
              <div
                role="group"
                aria-label="Admin review flag"
                className={kudosFlyoutStyles.actionFamily}
              >
                <span className={kudosFlyoutStyles.actionFamilyLabel}>Admin review flag</span>
                <div className={kudosFlyoutStyles.actionFamilyRow}>
                  {capabilities.canFlagAdminReview && !needsAdminReview(entry) ? (
                    <KudosActionButton label="Flag for admin review" onClick={() => onAction('flagAdminReview')} disabled={dispatching} tone="warning" testId="hb-kudos-action-flag" />
                  ) : null}
                  {capabilities.canClearAdminReview && needsAdminReview(entry) ? (
                    <KudosActionButton label="Clear admin review" onClick={() => onAction('clearAdminReview')} disabled={dispatching} tone="info" testId="hb-kudos-action-clear-flag" />
                  ) : null}
                </div>
              </div>
            ) : null}

            {capabilities.canClaim ? (
              <div
                role="group"
                aria-label="Ownership"
                className={kudosFlyoutStyles.actionFamily}
              >
                <span className={kudosFlyoutStyles.actionFamilyLabel}>Ownership</span>
                <div className={kudosFlyoutStyles.actionFamilyRow}>
                  <KudosActionButton label="Claim" onClick={() => onAction('claim')} disabled={dispatching} tone="info" testId="hb-kudos-action-claim" />
                  <KudosActionButton label="Reassign" onClick={() => onAction('reassign')} disabled={dispatching} tone="info" testId="hb-kudos-action-assign" />
                </div>
              </div>
            ) : null}

            {((capabilities.canRemove && entry?.workflowStatus !== 'removedUnpublished') ||
              (capabilities.canRestore && entry?.workflowStatus === 'removedUnpublished')) ? (
              <div
                role="group"
                aria-label="Takedown"
                className={clsx(
                  kudosFlyoutStyles.actionFamily,
                  kudosFlyoutStyles.actionFamilyDestructive,
                )}
              >
                <span className={kudosFlyoutStyles.actionFamilyLabel}>Takedown</span>
                <div className={kudosFlyoutStyles.actionFamilyRow}>
                  {capabilities.canRemove && entry?.workflowStatus !== 'removedUnpublished' ? (
                    <KudosActionButton label="Remove" onClick={() => onAction('remove')} disabled={dispatching} tone="danger" testId="hb-kudos-action-remove" />
                  ) : null}
                  {capabilities.canRestore && entry?.workflowStatus === 'removedUnpublished' ? (
                    <KudosActionButton label="Restore" onClick={() => onAction('restore')} disabled={dispatching} tone="info" testId="hb-kudos-action-restore" />
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </KudosGovernanceDetailShell>
  );
}
