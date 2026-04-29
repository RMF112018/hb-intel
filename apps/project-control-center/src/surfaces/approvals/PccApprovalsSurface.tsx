import { Fragment, type FC } from 'react';
import { PCC_MVP_SURFACES, SAMPLE_APPROVAL_CHECKPOINTS } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccStatusPill } from '../../ui/PccStatusPill';
import { PccPreviewState } from '../../ui/PccPreviewState';
import styles from './PccApprovalsSurface.module.css';

const SURFACE = PCC_MVP_SURFACES.approvals;

const pending = SAMPLE_APPROVAL_CHECKPOINTS.filter((item) => item.state === 'pending');
const approvedOrWaived = SAMPLE_APPROVAL_CHECKPOINTS.filter(
  (item) => item.state === 'approved' || item.state === 'waived',
);
const rejected = SAMPLE_APPROVAL_CHECKPOINTS.filter((item) => item.state === 'rejected');

export const PccApprovalsSurface: FC = () => (
  <Fragment>
    <PccDashboardCard
      footprint="full"
      eyebrow={SURFACE.displayName}
      title="Approvals Preview"
      dataActiveSurfacePanel="approvals"
    >
      <div className={styles.body}>
        <p>{SURFACE.description}</p>
        <PccPreviewState
          state="preview"
          title="Preview-only approval tracking"
          description="No approve/reject execution is enabled in Wave 2."
        />
        <div className={styles.metricRow}>
          <PccStatusPill tone="warning">Pending my approval: {pending.length}</PccStatusPill>
          <PccStatusPill tone="neutral">Pending others: {Math.max(pending.length - 1, 0)}</PccStatusPill>
          <PccStatusPill tone="success">Submitted/recently approved: {approvedOrWaived.length}</PccStatusPill>
          <PccStatusPill tone="danger">Recently rejected: {rejected.length}</PccStatusPill>
        </div>
      </div>
    </PccDashboardCard>

    <PccDashboardCard footprint="wide" eyebrow="Pending" title="Pending My Approval (Preview)">
      {pending.length === 0 ? (
        <PccPreviewState state="unavailable-fixture" />
      ) : (
        <ul className={styles.list}>
          {pending.map((item) => (
            <li key={item.id}>
              {item.checkpointType} · required persona: {item.requiredPersona} · requested: {item.requestedAtUtc}
            </li>
          ))}
        </ul>
      )}
    </PccDashboardCard>

    <PccDashboardCard footprint="wide" eyebrow="Submitted" title="Recently Approved / Waived (Preview)">
      {approvedOrWaived.length === 0 ? (
        <PccPreviewState state="unavailable-fixture" />
      ) : (
        <ul className={styles.list}>
          {approvedOrWaived.map((item) => (
            <li key={item.id}>
              {item.checkpointType} · state: {item.state} · decided: {item.decidedAtUtc ?? 'n/a'}
            </li>
          ))}
        </ul>
      )}
    </PccDashboardCard>
  </Fragment>
);

export default PccApprovalsSurface;
