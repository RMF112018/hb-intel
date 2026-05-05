import type { FC } from 'react';
import { PCC_MVP_SURFACES } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { pccSurfacePostureCopy } from '../../ui/pccSurfacePostureCopy';
import { PccSurfaceContextHeader } from '../shared/PccSurfaceContextHeader';
import styles from './PccTeamAccessSurface.module.css';

const SURFACE = PCC_MVP_SURFACES['team-and-access'];
const POSTURE = pccSurfacePostureCopy('reference');

export const PccTeamAccessHeaderCard: FC = () => (
  <PccDashboardCard
    footprint="full"
    eyebrow={SURFACE.displayName}
    title="Team & Access Center"
    dataActiveSurfacePanel="team-and-access"
  >
    <div className={styles.body}>
      <PccSurfaceContextHeader
        surfaceId="team-and-access"
        projectLabel="Project 26-000-00 · Team and Access Scope"
        postureLabel={POSTURE.postureLabel}
        sourceStatusLabel={POSTURE.sourceStatusLabel}
        sourceConfidenceLabel={POSTURE.sourceConfidenceLabel}
        lastUpdatedLabel={POSTURE.lastUpdatedLabel}
      />
      <PccPreviewState
        state="preview"
        title="Team and access overview"
        description="Team Viewer, Permission Request, and Access Manager lanes show the current team and access posture for this project."
      />
    </div>
  </PccDashboardCard>
);

export default PccTeamAccessHeaderCard;
