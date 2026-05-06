import type { FC } from 'react';
import { SAMPLE_REPAIR_REQUESTS } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from '../projectHome/shared';
import styles from './PccSiteHealthSurface.module.css';

const RepairRequestsBody: FC = () => (
  <ul className={styles.list} data-pcc-site-health-repair-requests-body="">
    {SAMPLE_REPAIR_REQUESTS.map((request) => (
      <li
        key={request.id}
        className={styles.listRow}
        data-pcc-repair-request-id={request.id}
        data-pcc-repair-request-state={request.state}
        data-pcc-site-health-severity={request.severity}
      >
        <span className={styles.rowTitle}>{request.summary}</span>
        <span className={styles.rowMeta}>
          <PccStatusPill tone="info">{request.state}</PccStatusPill>
          <span>severity: {request.severity}</span>
          <span>owner: {request.ownerPersona}</span>
        </span>
        <span className={styles.placeholderCue}>
          Repair runs are managed in SharePoint admin tooling.
        </span>
      </li>
    ))}
  </ul>
);

export const PccSiteHealthRepairRequestsCard: FC<PccProjectHomeCardProps> = ({
  state = 'preview',
}) => (
  <PccDashboardCard footprint="wide" eyebrow="Repairs" title="Repair Requests">
    {state === 'preview' ? <RepairRequestsBody /> : <PccPreviewState state={state} />}
  </PccDashboardCard>
);

export default PccSiteHealthRepairRequestsCard;
