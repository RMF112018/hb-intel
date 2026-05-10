/**
 * Project Home approvals/checkpoints card (Phase 3 / Wave 14 / Prompt 06).
 *
 * Read-only card. Two render paths:
 *   - When `viewModel` is supplied, the card renders rows from a
 *     small card-local view-model built upstream by
 *     `buildPccApprovalsCheckpointsCardViewModel(envelope)` in
 *     `PccProjectHomeReadModelContent`. The card never imports the full
 *     Approvals surface contract.
 *   - When `viewModel` is undefined, the card preserves the legacy
 *     synchronous fixture-fallback render of `SAMPLE_APPROVAL_CHECKPOINTS`
 *     so non-read-model `PccProjectHome` mounts and existing tests keep
 *     working.
 *
 * `data-pcc-approvals-card-source` discriminates the two paths so test
 * scoping can target each separately.
 */

import type { FC } from 'react';
import { SAMPLE_APPROVAL_CHECKPOINTS, type ApprovalRequestState } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill, type PccStatusPillTone } from '../../ui/PccStatusPill';
import { PccProjectHomeGatewayAction } from './PccProjectHomeGatewayAction';
import type { PccProjectHomeCardProps } from './shared';
import styles from './PccProjectHome.module.css';

export interface IPccApprovalsCheckpointsCardRow {
  readonly approvalRequestId: string;
  readonly title: string;
  readonly state: ApprovalRequestState;
  readonly assignedRoleLabel: string;
  readonly priorityLabel: string;
  readonly createdAtDisplay: string;
}

export interface IPccApprovalsCheckpointsCardViewModel {
  readonly rows: readonly IPccApprovalsCheckpointsCardRow[];
  readonly pendingActiveCount: number;
  readonly terminalCount: number;
  readonly totalRequests: number;
}

export interface PccApprovalsCheckpointsCardProps extends PccProjectHomeCardProps {
  readonly viewModel?: IPccApprovalsCheckpointsCardViewModel;
}

function legacyStateTone(s: string): PccStatusPillTone {
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

function readModelStateTone(state: ApprovalRequestState): PccStatusPillTone {
  switch (state) {
    case 'approved':
    case 'execution-pending':
      return 'success';
    case 'rejected-returned':
    case 'cancelled':
    case 'expired':
      return 'danger';
    case 'escalated':
    case 'overridden':
      return 'warning';
    case 'waived':
    case 'deferred':
    case 'manually-closed':
    case 'superseded':
    case 'archived':
      return 'neutral';
    case 'requested':
    case 'pending-review':
    case 'in-review':
    case 'revision-requested':
    case 'draft':
    default:
      return 'info';
  }
}

const ReadModelBody: FC<{ viewModel: IPccApprovalsCheckpointsCardViewModel }> = ({ viewModel }) => (
  <div className={styles.list} data-pcc-approvals-body="">
    <div className={styles.listRow} data-pcc-approvals-card-summary="">
      <PccStatusPill tone="info">Total: {viewModel.totalRequests}</PccStatusPill>
      <PccStatusPill tone="warning">
        Pending or active: {viewModel.pendingActiveCount}
      </PccStatusPill>
      <PccStatusPill tone="neutral">Terminal: {viewModel.terminalCount}</PccStatusPill>
    </div>
    {viewModel.rows.length === 0 ? (
      <PccPreviewState state="empty" />
    ) : (
      <ul className={styles.list}>
        {viewModel.rows.map((row) => (
          <li
            key={row.approvalRequestId}
            className={styles.listRow}
            data-pcc-approval-checkpoint-id={row.approvalRequestId}
            data-pcc-approval-state={row.state}
          >
            <div className={styles.listRowMain}>
              <span className={styles.listRowTitle}>{row.title}</span>
              <span className={styles.listRowMeta}>
                <span>{row.assignedRoleLabel}</span>
                <span className={styles.listRowMetaSep}>{row.priorityLabel}</span>
                <span className={styles.listRowMetaSep}>{row.createdAtDisplay}</span>
              </span>
            </div>
            <PccStatusPill tone={readModelStateTone(row.state)}>{row.state}</PccStatusPill>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const FixtureBody: FC = () => (
  <ul className={styles.list} data-pcc-approvals-body="">
    {SAMPLE_APPROVAL_CHECKPOINTS.map((cp) => (
      <li
        key={cp.id}
        className={styles.listRow}
        data-pcc-approval-checkpoint-id={cp.id}
        data-pcc-approval-state={cp.state}
      >
        <div className={styles.listRowMain}>
          <span className={styles.listRowTitle}>{cp.checkpointType ?? 'generic'}</span>
          <span className={styles.listRowMeta}>
            <span>{cp.requiredPersona}</span>
            {cp.authorityType ? (
              <span className={styles.listRowMetaSep}>{cp.authorityType}</span>
            ) : null}
          </span>
        </div>
        <PccStatusPill tone={legacyStateTone(cp.state)} filled={cp.state !== 'pending'}>
          {cp.state}
        </PccStatusPill>
      </li>
    ))}
  </ul>
);

export const PccApprovalsCheckpointsCard: FC<PccApprovalsCheckpointsCardProps> = ({
  state = 'preview',
  viewModel,
  spanOverrides,
  gateway,
  onSelectModule,
}) => {
  const sourceMarker = viewModel ? 'read-model' : 'fixture';
  return (
    <PccDashboardCard
      footprint="standard"
      tier="tier2"
      region="operational"
      eyebrow="Approvals"
      title="Approvals & Checkpoints"
      spanOverrides={spanOverrides}
      action={
        gateway ? (
          <PccProjectHomeGatewayAction gateway={gateway} onSelectModule={onSelectModule} />
        ) : undefined
      }
    >
      <div data-pcc-approvals-card-source={sourceMarker}>
        {state === 'preview' ? (
          viewModel ? (
            <ReadModelBody viewModel={viewModel} />
          ) : (
            <FixtureBody />
          )
        ) : (
          <PccPreviewState state={state} />
        )}
      </div>
    </PccDashboardCard>
  );
};

export default PccApprovalsCheckpointsCard;
