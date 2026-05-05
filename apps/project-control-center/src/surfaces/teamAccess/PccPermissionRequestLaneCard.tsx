import type { FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { TeamAccessPreviewModel } from './shared';
import { PccAccessRequestForm } from './PccAccessRequestForm';
import { PccAccessRequestQueue } from './PccAccessRequestQueue';
import { NO_PERMISSION_CHANGE_NOTICE } from './teamAccessAdapter';
import styles from './PccTeamAccessSurface.module.css';

export interface PccPermissionRequestLaneCardProps {
  model: TeamAccessPreviewModel;
}

export const PccPermissionRequestLaneCard: FC<PccPermissionRequestLaneCardProps> = ({ model }) => {
  const lane = model.permissionRequestLane;

  return (
    <PccDashboardCard footprint="wide" eyebrow="Permission Request Lane" title="Request access">
      <div className={styles.body} data-pcc-team-access-lane="permission-request">
        <div className={styles.metaRow} data-pcc-permission-request-banner="preview">
          <PccStatusPill tone="info">Reference</PccStatusPill>
        </div>

        <PccAccessRequestForm
          introText="Submission, persistence, and approval execution are managed by your PCC administrator."
          requestAccessButtonLabel="Request access"
          requestChangeButtonLabel="Request role or permission change"
          requestAccessEnabled={lane.requestAccessEnabled}
          requestChangeEnabled={lane.requestChangeEnabled}
          deferredTitle="Request submission is not available here"
          deferredDescription="Request persistence and workflow execution are managed by your PCC administrator."
        />

        <span className={styles.metaRow}>Requested permission templates:</span>
        <div className={styles.tags}>
          {lane.requestTemplateOptions.map((template) => (
            <span key={template} className={styles.chip}>
              {template}
            </span>
          ))}
        </div>

        <PccAccessRequestQueue records={lane.requestPreviewRecords} branch={model.branch} />

        <p className={styles.noPermissionChangeNotice} data-pcc-no-permission-change-notice="">
          {NO_PERMISSION_CHANGE_NOTICE}
        </p>
      </div>
    </PccDashboardCard>
  );
};

export default PccPermissionRequestLaneCard;
