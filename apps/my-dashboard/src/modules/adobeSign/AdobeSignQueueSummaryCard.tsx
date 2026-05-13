import { getMyWorkModule } from '@hbc/models/myWork';
import { MyWorkCard } from '../../layout/MyWorkCard.js';
import type { MyWorkCardSpanOverrides } from '../../layout/myWorkFootprints.js';
import styles from '../../layout/MyWorkCard.module.css';

export interface AdobeSignQueueSummaryCardProps {
  readonly spanOverrides?: MyWorkCardSpanOverrides;
}

const ADOBE_MODULE = getMyWorkModule('adobe-sign-action-queue');

export function AdobeSignQueueSummaryCard({ spanOverrides }: AdobeSignQueueSummaryCardProps) {
  return (
    <MyWorkCard
      role="adobe-sign-queue-summary"
      footprint="standard"
      spanOverrides={spanOverrides}
      eyebrow={ADOBE_MODULE.sourceSystem}
      title="Adobe Sign Queue Summary"
      module={ADOBE_MODULE.id}
    >
      <ul className={styles.content} style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Pending agreements</span>
          <span className={styles.rowValue}>—</span>
        </li>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Signature actions</span>
          <span className={styles.rowValue}>—</span>
        </li>
        <li className={styles.row}>
          <span className={styles.rowLabel}>Review actions</span>
          <span className={styles.rowValue}>—</span>
        </li>
      </ul>
    </MyWorkCard>
  );
}

export default AdobeSignQueueSummaryCard;
