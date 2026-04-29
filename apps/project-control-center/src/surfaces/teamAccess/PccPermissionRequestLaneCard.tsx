import type { FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccStatusPill } from '../../ui/PccStatusPill';
import { PccPreviewState } from '../../ui/PccPreviewState';
import type { TeamAccessPreviewModel } from './shared';
import styles from './PccTeamAccessSurface.module.css';

export interface PccPermissionRequestLaneCardProps {
  model: TeamAccessPreviewModel;
}

export const PccPermissionRequestLaneCard: FC<PccPermissionRequestLaneCardProps> = ({ model }) => {
  const lane = model.permissionRequestLane;

  return (
    <PccDashboardCard footprint="wide" eyebrow="Permission Request Lane" title="Request Access Preview">
      <div className={styles.body} data-pcc-team-access-lane="permission-request">
        <p className={styles.previewCue}>
          Request intake preview only. Submission, persistence, and approval execution are disabled in Wave
          2.
        </p>

        <div className={styles.metaRow}>
          <button type="button" disabled className={styles.disabledAction}>
            Request access (preview-only)
          </button>
          <button type="button" disabled className={styles.disabledAction}>
            Request role/permission change (preview-only)
          </button>
        </div>
        <PccPreviewState
          state="not-yet-implemented-operation"
          title="Request submission is deferred"
          description="Request persistence and workflow execution are intentionally disabled for Wave 2 preview."
        />

        <span className={styles.metaRow}>Requested permission templates:</span>
        <div className={styles.tags}>
          {lane.requestTemplateOptions.map((template) => (
            <span key={template} className={styles.chip}>
              {template}
            </span>
          ))}
        </div>

        {lane.requestPreviewRecords.length === 0 ? (
          <PccPreviewState state="unavailable-fixture" />
        ) : (
          <ul className={styles.list} data-pcc-request-preview-list="">
            {lane.requestPreviewRecords.map((record) => (
              <li key={record.requestId}>
                <div className={styles.metaRow}>
                  <strong>{record.requestedUserLabel}</strong>
                  <PccStatusPill tone="info">{record.requestStatusLabel}</PccStatusPill>
                </div>
                <div className={styles.metaRow}>
                  Requested role: {record.requestedPersona} · Template:{' '}
                  {record.requestedPermissionTemplateLabel}
                </div>
                <div className={styles.metaRow}>Business justification: {record.businessJustification}</div>
                <div className={styles.metaRow}>
                  Requested by: {record.requestedByLabel}
                  {record.reviewedByLabel ? ` · Reviewed by: ${record.reviewedByLabel}` : ''}
                </div>
                {record.reviewerCommentPreview ? (
                  <div className={styles.metaRow}>Approval/comment preview: {record.reviewerCommentPreview}</div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </PccDashboardCard>
  );
};

export default PccPermissionRequestLaneCard;
