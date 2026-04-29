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
      <p>{SURFACE.description}</p>
      <PccPreviewState
        state="preview"
        title="Preview-only team and access lifecycle"
        description="Team Viewer, Permission Request, and Access Manager lanes are rendered without group, permission, Entra, SharePoint, Teams, backend, Graph, or PnP mutations."
      />
    </div>
  </PccDashboardCard>
);

export default PccTeamAccessHeaderCard;
