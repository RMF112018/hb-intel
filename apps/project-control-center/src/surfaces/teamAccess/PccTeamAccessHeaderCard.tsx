import type { FC } from 'react';
import { PCC_MVP_SURFACES } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import styles from './PccTeamAccessSurface.module.css';

const SURFACE = PCC_MVP_SURFACES['team-and-access'];

export const PccTeamAccessHeaderCard: FC = () => (
  <PccDashboardCard
    footprint="full"
    eyebrow={SURFACE.displayName}
    title="Team & Access Center"
    dataActiveSurfacePanel="team-and-access"
  >
    <div className={styles.body}>
      <PccPreviewState
        state="preview"
        title="Team and access overview"
        description="Team Viewer, Permission Request, and Access Manager lanes show the current team and access posture for this project."
      />
    </div>
  </PccDashboardCard>
);

export default PccTeamAccessHeaderCard;
