import type { FC } from 'react';
import { TEAM_ACCESS_MANAGER_PERSONAS } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccDisabledAffordance } from '../../ui/PccDisabledAffordance';
import { PccPreviewState } from '../../ui/PccPreviewState';
import type { TeamAccessPreviewModel } from './shared';
import { PccAccessExecutionQueue } from './PccAccessExecutionQueue';
import { PccExecutionStatusPanel } from './PccExecutionStatusPanel';
import styles from './PccTeamAccessSurface.module.css';

export interface PccAccessManagerLaneCardProps {
  model: TeamAccessPreviewModel;
}

const ACCESS_MANAGER_ACTION_REASON =
  'Assignments, role changes, and approvals are managed by your PCC administrator.';

const ACCESS_MANAGER_ACTIONS = [
  { key: 'add-or-search-user', label: 'Add or search user' },
  { key: 'submit-assignment-change', label: 'Submit assignment change' },
  { key: 'approve-reject-or-comment', label: 'Approve, reject, or comment' },
] as const;

export const PccAccessManagerLaneCard: FC<PccAccessManagerLaneCardProps> = ({ model }) => {
  const lane = model.accessManagerLane;

  return (
    <PccDashboardCard
      footprint="full"
      tier="tier2"
      region="operational"
      eyebrow="Access Manager Lane"
      title="Assignment and approval"
    >
      <div className={styles.body} data-pcc-team-access-lane="access-manager">
        <p className={styles.previewCue}>
          People lookup, group changes, and approval execution are managed by your PCC
          administrator.
        </p>

        <section className={styles.laneSection} data-pcc-lane-section="access-manager-actions">
          <h4 className={styles.laneSectionTitle}>Actions</h4>
          <div className={styles.metaRow} data-pcc-access-manager-action-list="">
            {ACCESS_MANAGER_ACTIONS.map((action) => (
              <PccDisabledAffordance
                key={action.key}
                label={action.label}
                reason={ACCESS_MANAGER_ACTION_REASON}
                data-pcc-access-manager-action-key={action.key}
              />
            ))}
          </div>
          <PccPreviewState
            state="not-yet-implemented-operation"
            title="Access manager actions are not available here"
            description="These actions are managed by your PCC administrator."
          />
        </section>

        <section className={styles.laneSection} data-pcc-lane-section="execution-status">
          <h4 className={styles.laneSectionTitle}>Execution status</h4>
          <PccExecutionStatusPanel
            executionStatus={lane.executionStatus}
            executionStatusLabel={lane.executionStatusLabel}
            managerPersonas={TEAM_ACCESS_MANAGER_PERSONAS}
            auditPreviewLabel={lane.auditPreviewLabel}
          />
        </section>

        <section className={styles.laneSection} data-pcc-lane-section="execution-queue">
          <h4 className={styles.laneSectionTitle}>Open assignments</h4>
          <PccAccessExecutionQueue
            records={model.permissionRequestLane.requestPreviewRecords}
            laneExecutionStatus={lane.executionStatus}
          />
        </section>

        <section className={styles.laneSection} data-pcc-lane-section="permission-templates">
          <h4 className={styles.laneSectionTitle}>Permission templates</h4>
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
        </section>
      </div>
    </PccDashboardCard>
  );
};

export default PccAccessManagerLaneCard;
