import type { FC } from 'react';
import type { ITeamAccessRequestPreview } from '@hbc/models/pcc';
import { PccStatusPill } from '../../ui/PccStatusPill';
import { PccRequestStatusBadge } from './PccRequestStatusBadge';
import styles from './PccTeamAccessSurface.module.css';

export interface PccAccessRequestDetailProps {
  readonly request: ITeamAccessRequestPreview;
}

export const PccAccessRequestDetail: FC<PccAccessRequestDetailProps> = ({ request }) => {
  return (
    <div
      className={styles.detailPanel}
      data-pcc-access-request-detail={request.requestId}
    >
      <div className={styles.metaRow} data-pcc-detail-banner="review-decision-preview">
        <PccStatusPill tone="info">Review decision preview</PccStatusPill>
        <PccRequestStatusBadge status={request.requestStatus} />
      </div>

      <div className={styles.metaRow} data-pcc-detail-field="requestedUser">
        <strong>Requested user:</strong> {request.requestedUserLabel}
      </div>

      <div className={styles.metaRow} data-pcc-detail-field="requestedPersona">
        <strong>Requested persona / role:</strong> {request.requestedPersona}
      </div>

      <div className={styles.metaRow} data-pcc-detail-field="requestedTemplate">
        <strong>Permission template:</strong> {request.requestedPermissionTemplateLabel}
      </div>

      <div className={styles.metaRow} data-pcc-detail-field="businessJustification">
        <strong>Business justification:</strong> {request.businessJustification}
      </div>

      <div className={styles.metaRow} data-pcc-detail-field="requestedBy">
        <strong>Requested by:</strong> {request.requestedByLabel}
      </div>

      {request.reviewedByLabel ? (
        <div className={styles.metaRow} data-pcc-detail-field="reviewedBy">
          <strong>Reviewed by:</strong> {request.reviewedByLabel}
        </div>
      ) : null}

      {request.reviewerCommentPreview ? (
        <div className={styles.metaRow} data-pcc-detail-field="reviewerComment">
          <strong>Approval / comment preview:</strong> {request.reviewerCommentPreview}
        </div>
      ) : null}
    </div>
  );
};

export default PccAccessRequestDetail;
