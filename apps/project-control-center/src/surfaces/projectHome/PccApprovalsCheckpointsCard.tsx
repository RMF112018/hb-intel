import type { FC } from 'react';
import { SAMPLE_APPROVAL_CHECKPOINTS } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from './shared';
import styles from './PccProjectHome.module.css';

function stateTone(s: string): 'info' | 'success' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case 'pending':
      return 'info';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'waived':
      return 'neutral';
    default:
      return 'neutral';
  }
}

const ApprovalsCheckpointsBody: FC = () => (
  <ul className={styles.list} data-pcc-approvals-body="">
    {SAMPLE_APPROVAL_CHECKPOINTS.map((cp) => (
      <li
        key={cp.id}
        className={styles.listRow}
        data-pcc-approval-checkpoint-id={cp.id}
        data-pcc-approval-state={cp.state}
      >
        <div className={styles.listRowMain}>
          <span className={styles.listRowTitle}>
            {cp.checkpointType ?? 'generic'}
          </span>
          <span className={styles.listRowMeta}>
            <span>{cp.requiredPersona}</span>
            {cp.authorityType ? (
              <span className={styles.listRowMetaSep}>{cp.authorityType}</span>
            ) : null}
          </span>
        </div>
        <PccStatusPill tone={stateTone(cp.state)} filled={cp.state !== 'pending'}>
          {cp.state}
        </PccStatusPill>
      </li>
    ))}
  </ul>
);

export const PccApprovalsCheckpointsCard: FC<PccProjectHomeCardProps> = ({ state = 'preview' }) => (
  <PccDashboardCard footprint="standard" eyebrow="Approvals" title="Approvals & Checkpoints">
    {state === 'preview' ? <ApprovalsCheckpointsBody /> : <PccPreviewState state={state} />}
  </PccDashboardCard>
);

export default PccApprovalsCheckpointsCard;
