import type { FC } from 'react';
import { PCC_MVP_SURFACES } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import styles from './PccExternalSystemsSurface.module.css';

const SURFACE = PCC_MVP_SURFACES['external-systems'];

export const PccExternalSystemsHeaderCard: FC = () => (
  <PccDashboardCard
    footprint="full"
    eyebrow={SURFACE.displayName}
    title="Launch Pad"
    dataActiveSurfacePanel="external-systems"
  >
    <div className={styles.body}>
      <p className={styles.intro}>{SURFACE.description}</p>
      <span className={styles.previewCue}>
        Preview frame · Launch and visibility only. No live external API calls in this preview.
      </span>
    </div>
  </PccDashboardCard>
);

export default PccExternalSystemsHeaderCard;
