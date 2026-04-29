import type { FC } from 'react';
import { PCC_MVP_SURFACES, SAMPLE_PROJECT_PROFILE } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from './shared';
import styles from './PccProjectHome.module.css';

const PROJECT_HOME_SURFACE = PCC_MVP_SURFACES['project-home'];

const valueFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const ProjectIntelligenceBody: FC = () => {
  const profile = SAMPLE_PROJECT_PROFILE;
  return (
    <div className={styles.heroBody} data-pcc-project-intelligence-body="">
      <p className={styles.contextNote} data-pcc-surface-description="">
        {PROJECT_HOME_SURFACE.description}
      </p>
      <div>
        <span className={styles.heroNumber}>Project · {profile.projectNumber}</span>
        <h2 className={styles.heroProjectName}>{profile.projectName}</h2>
      </div>
      <div className={styles.heroPills}>
        <PccStatusPill tone="info" filled>{profile.projectStage.replaceAll('_', ' ')}</PccStatusPill>
        <PccStatusPill tone={profile.projectStatus === 'Active' ? 'success' : 'neutral'}>
          {profile.projectStatus}
        </PccStatusPill>
        <PccStatusPill tone="neutral">{profile.projectType}</PccStatusPill>
      </div>
      <div className={styles.heroFacts}>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Client</span>
          <span className={styles.metricValue} style={{ fontSize: 14 }}>
            {profile.clientName ?? 'Not listed'}
          </span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Location</span>
          <span className={styles.metricValue} style={{ fontSize: 14 }}>
            {profile.projectLocation ?? 'Not listed'}
          </span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Estimated value</span>
          <span className={styles.metricValue}>
            {profile.estimatedValue !== undefined
              ? valueFormatter.format(profile.estimatedValue)
              : 'Not listed'}
          </span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Scheduled completion</span>
          <span className={styles.metricValue} style={{ fontSize: 14 }}>
            {profile.scheduledCompletionDate ?? 'Not listed'}
          </span>
        </div>
      </div>
    </div>
  );
};

export const PccProjectIntelligenceCard: FC<PccProjectHomeCardProps> = ({ state = 'preview' }) => (
  <PccDashboardCard
    footprint="hero"
    eyebrow={PROJECT_HOME_SURFACE.displayName}
    title="Project Intelligence Header"
    dataActiveSurfacePanel="project-home"
  >
    {state === 'preview' ? <ProjectIntelligenceBody /> : <PccPreviewState state={state} />}
  </PccDashboardCard>
);

export default PccProjectIntelligenceCard;
