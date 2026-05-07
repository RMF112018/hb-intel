import type { FC } from 'react';
import { PCC_MVP_SURFACES, SAMPLE_PROJECT_PROFILE, type IProjectProfile } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from './shared';
import type { IProjectCommandSummary } from './projectCommandSummary';
import styles from './PccProjectHome.module.css';

interface PccProjectIntelligenceCardProps extends PccProjectHomeCardProps {
  /** Optional read-model data; when omitted, falls back to SAMPLE_PROJECT_PROFILE. */
  readonly profile?: IProjectProfile;
  /**
   * Wave 15A wave-b6 Prompt 02 — optional first-fold posture summary
   * derived by `buildProjectCommandSummary`. When omitted, the card
   * renders the legacy hero body without the posture row.
   */
  readonly commandSummary?: IProjectCommandSummary;
}

const PROJECT_HOME_SURFACE = PCC_MVP_SURFACES['project-home'];

const valueFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const CommandSummaryRow: FC<{ summary: IProjectCommandSummary }> = ({ summary }) => (
  <div className={styles.commandSummaryRow} data-pcc-command-summary="">
    {summary.highPriorityActionCount !== undefined && (
      <span
        className={styles.commandSummaryChip}
        data-pcc-command-summary-chip="high-priority-actions"
      >
        <span className={styles.commandSummaryChipLabel}>High-priority actions</span>
        <span className={styles.commandSummaryChipValue}>{summary.highPriorityActionCount}</span>
      </span>
    )}
    {summary.pendingApprovalCount !== undefined && (
      <span className={styles.commandSummaryChip} data-pcc-command-summary-chip="pending-approvals">
        <span className={styles.commandSummaryChipLabel}>Pending approvals</span>
        <span className={styles.commandSummaryChipValue}>{summary.pendingApprovalCount}</span>
      </span>
    )}
    {summary.blockingMissingConfigCount !== undefined && (
      <span
        className={styles.commandSummaryChip}
        data-pcc-command-summary-chip="blocking-missing-configs"
      >
        <span className={styles.commandSummaryChipLabel}>Blocking setup gaps</span>
        <span className={styles.commandSummaryChipValue}>{summary.blockingMissingConfigCount}</span>
      </span>
    )}
    <span className={styles.commandSummaryMeta} data-pcc-command-summary-source="">
      {summary.sourceLabel}
    </span>
    <span className={styles.commandSummaryMeta} data-pcc-command-summary-hbi="">
      {summary.hbiAdvisoryCue}
    </span>
  </div>
);

const ProjectIntelligenceBody: FC<{
  profile: IProjectProfile;
  commandSummary?: IProjectCommandSummary;
}> = ({ profile, commandSummary }) => {
  return (
    <div className={styles.heroBody} data-pcc-project-intelligence-body="">
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
      {commandSummary && <CommandSummaryRow summary={commandSummary} />}
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
  commandSummary,
}) => (
  <PccDashboardCard
    footprint="hero"
    hierarchy="primary"
    tier="tier1"
    region="command"
    headingLevel={2}
    eyebrow={PROJECT_HOME_SURFACE.displayName}
    title="Project Intelligence"
    dataActiveSurfacePanel="project-home"
  >
    {state === 'preview' ? (
      <ProjectIntelligenceBody
        profile={profile ?? SAMPLE_PROJECT_PROFILE}
        commandSummary={commandSummary}
      />
    ) : (
      <PccPreviewState state={state} />
    )}
  </PccDashboardCard>
);

export default PccProjectIntelligenceCard;
