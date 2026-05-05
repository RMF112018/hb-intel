import { useState, type FC } from 'react';
import type { ITeamAccessRequestPreview } from '@hbc/models/pcc';
import { PccStatusPill } from '../../ui/PccStatusPill';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { NO_PERMISSION_CHANGE_NOTICE } from './teamAccessAdapter';
import styles from './PccTeamAccessSurface.module.css';

type ReviewDecisionPreview = 'approved' | 'rejected' | null;

export interface PccAccessReviewControlsProps {
  readonly request: ITeamAccessRequestPreview;
  readonly canReview: boolean;
}

const DECISION_LABELS: Readonly<Record<Exclude<ReviewDecisionPreview, null>, string>> = {
  approved: 'Approved',
  rejected: 'Rejected',
};

const DECISION_NONE_LABEL = '(none)';

export const PccAccessReviewControls: FC<PccAccessReviewControlsProps> = ({
  request,
  canReview,
}) => {
  const [decisionPreview, setDecisionPreview] = useState<ReviewDecisionPreview>(null);
  const [commentDraft, setCommentDraft] = useState<string>('');

  if (!canReview) {
    return (
      <div
        className={styles.reviewControls}
        data-pcc-access-review-controls="unauthorized"
        data-pcc-access-review-request={request.requestId}
      >
        <PccPreviewState
          state="unauthorized-persona"
          title="Review controls restricted"
          description="Approve / reject / comment is restricted to access managers."
        />
      </div>
    );
  }

  const decisionLabel =
    decisionPreview === null ? DECISION_NONE_LABEL : DECISION_LABELS[decisionPreview];

  return (
    <div
      className={styles.reviewControls}
      data-pcc-access-review-controls="preview"
      data-pcc-access-review-request={request.requestId}
    >
      <div className={styles.metaRow} data-pcc-review-banner="">
        <PccStatusPill tone="info">Reference</PccStatusPill>
      </div>

      <p className={styles.previewCue} data-pcc-review-helper="local-only">
        Buttons update local UI only and execute no permission change.
      </p>

      <div className={styles.metaRow} data-pcc-review-actions="">
        <button
          type="button"
          className={styles.disabledAction}
          onClick={() => setDecisionPreview('approved')}
          aria-label="Approve (preview only)"
          data-pcc-review-action="approve"
        >
          Approve (preview only)
        </button>
        <button
          type="button"
          className={styles.disabledAction}
          onClick={() => setDecisionPreview('rejected')}
          aria-label="Reject (preview only)"
          data-pcc-review-action="reject"
        >
          Reject (preview only)
        </button>
      </div>

      <label className={styles.formLabel} htmlFor={`${request.requestId}-review-comment`}>
        Reviewer comment (preview only)
      </label>
      <textarea
        id={`${request.requestId}-review-comment`}
        className={styles.formTextarea}
        rows={3}
        value={commentDraft}
        onChange={(event) => setCommentDraft(event.target.value)}
        data-pcc-review-comment="local"
      />

      <p
        className={styles.decisionPreviewLine}
        data-pcc-review-decision-preview={decisionPreview ?? 'none'}
      >
        Review decision preview: {decisionLabel}
      </p>

      <p className={styles.noPermissionChangeNotice} data-pcc-no-permission-change-notice="">
        {NO_PERMISSION_CHANGE_NOTICE}
      </p>
    </div>
  );
};

export default PccAccessReviewControls;
