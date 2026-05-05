import type { FC } from 'react';
import { TEAM_ACCESS_MANAGER_PERSONAS } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import type { TeamAccessPreviewModel } from './shared';
import { PccAccessExecutionQueue } from './PccAccessExecutionQueue';
import { PccExecutionStatusPanel } from './PccExecutionStatusPanel';
import styles from './PccTeamAccessSurface.module.css';

export interface PccAccessManagerLaneCardProps {
  model: TeamAccessPreviewModel;
}

export const PccAccessManagerLaneCard: FC<PccAccessManagerLaneCardProps> = ({ model }) => {
  const lane = model.accessManagerLane;

  return (
    <PccDashboardCard
      footprint="full"
      eyebrow="Access Manager Lane"
      title="Assignment and approval"
    >
      <div className={styles.body} data-pcc-team-access-lane="access-manager">
        <p className={styles.previewCue}>
          People lookup, group changes, and approval execution are managed by your PCC
          administrator.
        </p>

        <div className={styles.metaRow}>
          <button type="button" disabled aria-disabled="true" className={styles.disabledAction}>
            Add or search user
          </button>
          <button type="button" disabled aria-disabled="true" className={styles.disabledAction}>
            Submit assignment change
          </button>
          <button type="button" disabled aria-disabled="true" className={styles.disabledAction}>
            Approve, reject, or comment
          </button>
        </div>
        <PccPreviewState
          state="not-yet-implemented-operation"
          title="Access manager actions are not available here"
          description="These actions are managed by your PCC administrator."
        />

        <PccExecutionStatusPanel
          executionStatus={lane.executionStatus}
          executionStatusLabel={lane.executionStatusLabel}
          managerPersonas={TEAM_ACCESS_MANAGER_PERSONAS}
          auditPreviewLabel={lane.auditPreviewLabel}
        />

        <PccAccessExecutionQueue
          records={model.permissionRequestLane.requestPreviewRecords}
          laneExecutionStatus={lane.executionStatus}
        />

        <div className={styles.metaRow}>Permission template selector preview:</div>
        {lane.permissionTemplateOptions.length === 0 ? (
          <PccPreviewState state="unavailable-fixture" />
        ) : (
          <div className={styles.tags}>
            {lane.permissionTemplateOptions.map((template) => (
              <span key={template} className={styles.chip}>
                {template}
              </span>
            ))}
          </div>
        )}
      </div>
    </PccDashboardCard>
  );
};

export default PccAccessManagerLaneCard;
