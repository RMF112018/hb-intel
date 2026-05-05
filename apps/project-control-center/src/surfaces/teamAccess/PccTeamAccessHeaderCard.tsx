import type { FC } from 'react';
import { PCC_MVP_SURFACES } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccSurfaceContextHeader } from '../shared/PccSurfaceContextHeader';
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
      <PccSurfaceContextHeader
        surfaceId="team-and-access"
        projectLabel="Project 26-000-00 · Team and Access Scope"
        postureLabel="Read-only preview"
        sourceStatusLabel="Fixture default"
        sourceConfidenceLabel="Preview confidence"
        lastUpdatedLabel="Not connected in this prompt"
      />
      <PccPreviewState
        state="preview"
        title="Preview-only team and access lifecycle"
        description="Team Viewer, Permission Request, and Access Manager lanes are rendered without group, permission, Entra, SharePoint, Teams, backend, Graph, or PnP mutations."
      />
    </div>
  </PccDashboardCard>
);

export default PccTeamAccessHeaderCard;
