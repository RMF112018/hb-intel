import { getMyWorkModule } from '@hbc/models/myWork';
import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';

export interface AdobeSignQueueStateCardProps {
  readonly spanOverrides?: MyWorkCardSpanOverrides;
}

const ADOBE_MODULE = getMyWorkModule('adobe-sign-action-queue');
const PENDING_VALUE = 'Pending source connection';

export function AdobeSignQueueStateCard({ spanOverrides }: AdobeSignQueueStateCardProps) {
  return (
    <MyWorkCard
      role="adobe-sign-queue-state"
      footprint="wide"
      spanOverrides={spanOverrides}
      eyebrow="Source posture"
      title="Adobe Sign Queue State"
      module={ADOBE_MODULE.id}
    >
      <ul className={styles.content} style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Queue state</span>
          <span className={styles.rowValue}>{PENDING_VALUE}</span>
        </li>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Source system</span>
          <span className={styles.rowValue}>{ADOBE_MODULE.sourceSystem}</span>
        </li>
      </ul>
      <p className={styles.bodyText}>
        Queue state will update once the Adobe Sign connection is configured.
      </p>
    </MyWorkCard>
  );
}

export default AdobeSignQueueStateCard;
