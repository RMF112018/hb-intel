import type { FC } from 'react';
import { SAMPLE_BUSINESS_AUDIT_EVENTS } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import type { PccProjectHomeCardProps } from './shared';
import styles from './PccProjectHome.module.css';

function formatTimestamp(iso: string): string {
  return iso.replace('T', ' ').replace('Z', ' UTC');
}

const RecentActivityBody: FC = () => (
  <ul className={styles.list} data-pcc-recent-activity-body="">
    {SAMPLE_BUSINESS_AUDIT_EVENTS.map((event) => (
      <li
        key={event.id}
        className={styles.listRow}
        data-pcc-activity-event-id={event.id}
        data-pcc-activity-event-type={event.eventType}
      >
        <div className={styles.listRowMain}>
          <span className={styles.listRowTitle}>{event.eventType}</span>
          {event.payloadSummary ? (
            <span className={styles.listRowSummary}>{event.payloadSummary}</span>
          ) : null}
          <span className={styles.listRowMeta}>
            <span>{formatTimestamp(event.occurredAtUtc)}</span>
            {event.actorPersona ? (
              <span className={styles.listRowMetaSep}>{event.actorPersona}</span>
            ) : null}
          </span>
        </div>
      </li>
    ))}
  </ul>
);

export const PccRecentActivityCard: FC<PccProjectHomeCardProps> = ({ state = 'preview' }) => (
  <PccDashboardCard footprint="tall" eyebrow="Activity" title="Recent Activity">
    {state === 'preview' ? <RecentActivityBody /> : <PccPreviewState state={state} />}
  </PccDashboardCard>
);

export default PccRecentActivityCard;
