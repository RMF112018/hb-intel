import { Fragment, type FC } from 'react';
import type { ExternalReviewState } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState, type PccPreviewStateKind } from '../../ui/PccPreviewState';
import { PccStatusPill, type PccStatusPillTone } from '../../ui/PccStatusPill';
import type {
  IPccLaunchPadReviewItemRow,
  IPccLaunchPadReviewQueueGroup,
  IPccLaunchPadReviewQueueViewModel,
} from './launchPadViewModel';
import { PccExternalSystemsReviewItemDetail } from './PccExternalSystemsReviewItemDetail';
import styles from './PccExternalSystemsSurface.module.css';

const REVIEW_STATE_TONES: Readonly<Record<ExternalReviewState, PccStatusPillTone>> = {
  pending: 'warning',
  'in-progress': 'info',
  closed: 'success',
  suppressed: 'neutral',
};

const REVIEW_STATE_LABELS: Readonly<Record<ExternalReviewState, string>> = {
  pending: 'Pending',
  'in-progress': 'In progress',
  closed: 'Closed',
  suppressed: 'Suppressed',
};

export interface PccExternalSystemsReviewQueueCardProps {
  readonly reviewQueue: IPccLaunchPadReviewQueueViewModel;
  readonly cardState: PccPreviewStateKind;
  readonly isAvailable: boolean;
  readonly selectedReviewItemId: string | null;
  readonly onSelectReviewItem: (id: string | null) => void;
}

export const PccExternalSystemsReviewQueueCard: FC<PccExternalSystemsReviewQueueCardProps> = ({
  reviewQueue,
  cardState,
  isAvailable,
  selectedReviewItemId,
  onSelectReviewItem,
}) => (
  <PccDashboardCard
    footprint="full"
    tier="tier2"
    region="operational"
    eyebrow="Review queue"
    title="Custom link review queue"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section="external-systems"
      data-pcc-launch-pad-lane="review-queue"
    >
      {!isAvailable ? (
        <PccPreviewState state={cardState} />
      ) : reviewQueue.totalItems === 0 ? (
        <PccPreviewState state="empty" />
      ) : (
        <ul className={styles.reviewGroupList} data-pcc-launch-pad-review-groups="">
          {reviewQueue.groups.map((group) => (
            <ReviewGroupSection
              key={group.reviewState}
              group={group}
              selectedReviewItemId={selectedReviewItemId}
              onSelectReviewItem={onSelectReviewItem}
            />
          ))}
        </ul>
      )}
    </div>
  </PccDashboardCard>
);

interface ReviewGroupSectionProps {
  readonly group: IPccLaunchPadReviewQueueGroup;
  readonly selectedReviewItemId: string | null;
  readonly onSelectReviewItem: (id: string | null) => void;
}

const ReviewGroupSection: FC<ReviewGroupSectionProps> = ({
  group,
  selectedReviewItemId,
  onSelectReviewItem,
}) => (
  <li className={styles.reviewGroup} data-pcc-launch-pad-review-group={group.reviewState}>
    <h4 className={styles.reviewGroupTitle}>
      <PccStatusPill tone={REVIEW_STATE_TONES[group.reviewState]}>
        {REVIEW_STATE_LABELS[group.reviewState]} ({group.rows.length})
      </PccStatusPill>
    </h4>
    {group.rows.length === 0 ? (
      <p className={styles.reviewGroupEmpty}>No items in this state.</p>
    ) : (
      <ul className={styles.reviewRowList} data-pcc-launch-pad-review-rows={group.reviewState}>
        {group.rows.map((row) => (
          <ReviewRow
            key={row.id}
            row={row}
            isSelected={row.id === selectedReviewItemId}
            onSelectReviewItem={onSelectReviewItem}
          />
        ))}
      </ul>
    )}
  </li>
);

interface ReviewRowProps {
  readonly row: IPccLaunchPadReviewItemRow;
  readonly isSelected: boolean;
  readonly onSelectReviewItem: (id: string | null) => void;
}

const ReviewRow: FC<ReviewRowProps> = ({ row, isSelected, onSelectReviewItem }) => {
  const handleToggle = (): void => {
    onSelectReviewItem(isSelected ? null : row.id);
  };
  return (
    <li
      className={styles.reviewRow}
      data-pcc-launch-pad-review-row={row.id}
      data-pcc-launch-pad-review-row-state={row.reviewState}
      data-pcc-launch-pad-review-row-issue-type={row.issueType}
    >
      <button
        type="button"
        className={styles.reviewRowTrigger}
        onClick={handleToggle}
        aria-expanded={isSelected ? 'true' : 'false'}
        aria-controls={`review-detail-${row.id}`}
        aria-label={`Show details for review item ${row.id}`}
        data-pcc-launch-pad-review-row-trigger=""
      >
        <span className={styles.reviewRowTitleRow}>
          <span className={styles.reviewRowIssueType}>{row.issueType}</span>
          <span className={styles.reviewRowProvider}>{row.systemDisplayName}</span>
        </span>
        <span className={styles.reviewRowMetaRow}>
          <span className={styles.reviewRowMetaItem}>
            Subject:{' '}
            {row.subjectLinkRow ? (
              <span data-pcc-launch-pad-review-subject-title={row.subjectLinkRow.id}>
                {row.subjectLinkRow.title}
              </span>
            ) : (
              <span data-pcc-launch-pad-review-subject-key={row.subjectKey}>{row.subjectKey}</span>
            )}
          </span>
          <span className={styles.reviewRowMetaItem}>Owner: {row.currentOwnerPersona}</span>
          <span className={styles.reviewRowMetaItem}>Due: {row.dueAtDisplay}</span>
          {row.approvalRequestId !== null ? (
            <span
              className={styles.reviewApprovalBadge}
              data-pcc-launch-pad-review-approval-request={row.approvalRequestId}
            >
              Linked approval request
            </span>
          ) : null}
        </span>
        <span className={styles.reviewRowSummary}>{row.issueSummary}</span>
      </button>
      {isSelected ? (
        <Fragment>
          <div id={`review-detail-${row.id}`}>
            <PccExternalSystemsReviewItemDetail row={row} />
          </div>
        </Fragment>
      ) : null}
    </li>
  );
};

export default PccExternalSystemsReviewQueueCard;
