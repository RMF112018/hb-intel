import type { FC } from 'react';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { IPccLaunchPadReviewItemRow } from './launchPadViewModel';
import styles from './PccExternalSystemsSurface.module.css';

export interface PccExternalSystemsReviewItemDetailProps {
  readonly row: IPccLaunchPadReviewItemRow;
}

export const PccExternalSystemsReviewItemDetail: FC<PccExternalSystemsReviewItemDetailProps> = ({
  row,
}) => (
  <section
    className={styles.reviewDetail}
    data-pcc-launch-pad-review-detail={row.id}
    aria-label={`Review item ${row.id} details`}
  >
    <header className={styles.reviewDetailHeader}>
      <h5 className={styles.reviewDetailTitle}>Review item details</h5>
      <PccStatusPill tone="info">{row.reviewState}</PccStatusPill>
    </header>
    <dl className={styles.reviewDetailDl}>
      <dt>Review item id</dt>
      <dd>{row.id}</dd>
      <dt>Issue type</dt>
      <dd>{row.issueType}</dd>
      <dt>System</dt>
      <dd>{row.systemDisplayName}</dd>
      <dt>Subject</dt>
      <dd data-pcc-launch-pad-review-subject={row.subjectKey}>
        {row.subjectLinkRow ? row.subjectLinkRow.title : row.subjectKey}
      </dd>
      <dt>Owner</dt>
      <dd>
        {row.currentOwnerPersona} · {row.currentOwnerUpn}
      </dd>
      {row.priorityActionId !== null ? (
        <>
          <dt>Priority action</dt>
          <dd data-pcc-launch-pad-review-priority-action-id={row.priorityActionId}>
            {row.priorityActionId}
          </dd>
        </>
      ) : null}
      {row.approvalRequestId !== null ? (
        <>
          <dt>Linked approval request</dt>
          <dd data-pcc-launch-pad-review-approval-request={row.approvalRequestId}>
            {row.approvalRequestId}
            <span className={styles.reviewApprovalNote}>
              {' '}
              · Wave 14 owns approval semantics. Cross-reference only.
            </span>
          </dd>
        </>
      ) : null}
      <dt>Due</dt>
      <dd>{row.dueAtDisplay}</dd>
      <dt>Issue summary</dt>
      <dd>{row.issueSummary}</dd>
      {row.resolutionSummary !== undefined ? (
        <>
          <dt>Resolution</dt>
          <dd data-pcc-launch-pad-review-resolution={row.id}>{row.resolutionSummary}</dd>
        </>
      ) : null}
    </dl>
  </section>
);

export default PccExternalSystemsReviewItemDetail;
