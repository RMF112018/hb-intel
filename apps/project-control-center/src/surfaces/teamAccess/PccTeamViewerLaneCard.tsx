import type { FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { TeamAccessPreviewModel } from './shared';
import styles from './PccTeamAccessSurface.module.css';

export interface PccTeamViewerLaneCardProps {
  model: TeamAccessPreviewModel;
}

export const PccTeamViewerLaneCard: FC<PccTeamViewerLaneCardProps> = ({ model }) => {
  const { viewerLane } = model;

  return (
    <PccDashboardCard
      footprint="wide"
      tier="tier2"
      region="operational"
      eyebrow="Team Viewer Lane"
      title="Project Team Map"
    >
      <div className={styles.body} data-pcc-team-access-lane="team-viewer">
        <span className={styles.metaRow}>
          <PccStatusPill tone="info">internal: {viewerLane.internalCount}</PccStatusPill>
          <PccStatusPill tone="warning">external: {viewerLane.externalCount}</PccStatusPill>
          <PccStatusPill tone="neutral">guest: {viewerLane.guestCount}</PccStatusPill>
        </span>
        <span className={styles.metaRow} data-pcc-current-role="">
          Current role: {viewerLane.currentUser.projectRoleLabel}
        </span>
        <span className={styles.metaRow} data-pcc-current-permission-template="">
          Permission template: {viewerLane.currentUser.permissionTemplateLabel}
        </span>
        <ul className={styles.list} data-pcc-team-member-list="">
          {viewerLane.members.slice(0, 4).map((member) => (
            <li key={member.memberId} data-pcc-team-member-kind={member.memberKind}>
              {member.displayLabel} · {member.projectRoleLabel} · {member.companyLabel}
            </li>
          ))}
        </ul>
        <span className={styles.previewCue}>
          Only access managers can change project team and permissions.
        </span>
      </div>
    </PccDashboardCard>
  );
};

export default PccTeamViewerLaneCard;
