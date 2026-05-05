import type { FC } from 'react';
import { PCC_MVP_SURFACES, SAMPLE_PROJECT_PROFILE, type IProjectProfile } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import { PccSurfaceContextHeader } from '../shared/PccSurfaceContextHeader';
import type { PccProjectHomeCardProps } from './shared';
import styles from './PccProjectHome.module.css';

interface PccProjectIntelligenceCardProps extends PccProjectHomeCardProps {
  /** Optional read-model data; when omitted, falls back to SAMPLE_PROJECT_PROFILE. */
  readonly profile?: IProjectProfile;
}

const PROJECT_HOME_SURFACE = PCC_MVP_SURFACES['project-home'];

const valueFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const ProjectIntelligenceBody: FC<{ profile: IProjectProfile }> = ({ profile }) => {
  return (
    <div className={styles.heroBody} data-pcc-project-intelligence-body="">
      <PccSurfaceContextHeader
        surfaceId="project-home"
        projectLabel={`Project ${profile.projectNumber} · ${profile.projectName}`}
        postureLabel="Read-only preview"
        sourceStatusLabel="Fixture default"
        sourceConfidenceLabel="Preview confidence"
        lastUpdatedLabel={profile.scheduledCompletionDate ?? 'Not listed'}
      />
      <div>
        <span className={styles.heroNumber}>Project · {profile.projectNumber}</span>
        <h2 className={styles.heroProjectName}>{profile.projectName}</h2>
      </div>
      <div className={styles.heroPills}>
        <PccStatusPill tone="info" filled>
          {profile.projectStage.replaceAll('_', ' ')}
        </PccStatusPill>
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

export const PccProjectIntelligenceCard: FC<PccProjectIntelligenceCardProps> = ({
  state = 'preview',
  profile,
}) => (
  <PccDashboardCard
    footprint="hero"
    eyebrow={PROJECT_HOME_SURFACE.displayName}
    title="Project Intelligence Header"
    dataActiveSurfacePanel="project-home"
  >
    {state === 'preview' ? (
      <ProjectIntelligenceBody profile={profile ?? SAMPLE_PROJECT_PROFILE} />
    ) : (
      <PccPreviewState state={state} />
    )}
  </PccDashboardCard>
);

export default PccProjectIntelligenceCard;
